<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Contracts\Mail\Factory as MailFactory;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Mockery;
use Symfony\Component\Mailer\Exception\TransportException;
use Tests\TestCase;

/**
 * Regresi crash "TransportException di production" (POST /admin/login).
 *
 * OTP dikirim inline di dalam alur login/reset password. Sebelum OtpMailer ada,
 * Gmail yang menolak login (534-5.7.9 WebLoginRequired) membuat ketiga jalur itu
 * berbalik 500 — admin kehilangan akses hanya karena mailer mati. Yang diharapkan
 * sekarang: user mendapat pesan yang jelas, state OTP dibuang, dan admin dapat
 * satu alert infra, bukan halaman yang meledak.
 */
class OtpMailFailureTest extends TestCase
{
    use RefreshDatabase;

    private const GMAIL_ERROR = 'Expected response code "235" but got code "534", with message '
        .'"534-5.7.9 Please log in with your web browser and then try again. For more information, '
        .'go to https://support.google.com/mail/?p=WebLoginRequired".';

    protected function setUp(): void
    {
        parent::setUp();

        Config::set('alerting.enabled', true);
        Config::set('alerting.categories.infra', true);
        Config::set('alerting.telegram.bot_token', 'TESTTOKEN');
        Config::set('alerting.telegram.chat_id', '12345');

        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true], 200)]);
    }

    protected function tearDown(): void
    {
        Mockery::close();

        parent::tearDown();
    }

    public function test_admin_login_tidak_crash_saat_email_otp_gagal(): void
    {
        Config::set('auth.login_otp.enabled', true);
        $this->breakMailer();

        $admin = Admin::factory()->create([
            'email' => 'broken-admin@example.com',
            'password' => 'password',
            'role' => Admin::ROLE_SUPER_ADMIN,
        ]);

        $response = $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('admin');

        // Sesi OTP dibuang: halaman verifikasi tidak boleh menunggu kode tak dikenal
        $this->get('/admin/login/otp')->assertRedirect(route('admin.login', absolute: false));

        $this->assertInfraAlertSent();
    }

    public function test_member_login_tidak_crash_saat_email_otp_gagal(): void
    {
        Config::set('auth.login_otp.enabled', true);
        $this->breakMailer();

        $user = User::factory()->create([
            'email' => 'broken-user@example.com',
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('web');

        $this->get('/login/otp')->assertRedirect(route('login', absolute: false));

        $this->assertInfraAlertSent();
    }

    public function test_otp_reset_password_dibuang_saat_email_gagal(): void
    {
        $this->breakMailer();

        $user = User::factory()->create([
            'email' => 'broken-reset@example.com',
            'password' => 'password',
        ]);

        $response = $this->post('/forgot-password', [
            'email' => $user->email,
        ]);

        $response->assertSessionHasErrors('email');

        // Kode yatim dihapus: tidak ada OTP yang bisa diverifikasi kalau emailnya
        // memang tidak pernah terkirim
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);

        $this->assertInfraAlertSent();
    }

    /**
     * Semua jalur kirim OTP memakai mailer yang sama, jadi satu alert saja yang
     * boleh keluar dalam window dedupe (bukan satu per percobaan login).
     */
    private function assertInfraAlertSent(): void
    {
        Http::assertSent(function ($request) {
            return str_contains((string) ($request['text'] ?? ''), '[infra]');
        });
    }

    /**
     * Mailer sungguhan diganti yang selalu melempar kegagalan transport, persis
     * seperti yang dilakukan Gmail saat menolak password aplikasi.
     */
    private function breakMailer(): void
    {
        $mailer = Mockery::mock(Mailer::class);
        $mailer->shouldReceive('send')->andThrow(new TransportException(self::GMAIL_ERROR));

        $factory = Mockery::mock(MailFactory::class);
        $factory->shouldReceive('mailer')->andReturn($mailer);

        $this->app->instance(MailFactory::class, $factory);
    }
}
