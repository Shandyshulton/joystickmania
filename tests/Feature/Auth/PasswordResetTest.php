<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_screen_can_be_rendered(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(200);
    }

    public function test_otp_can_be_requested_and_sent_to_user_email(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, SendOtpNotification::class);
    }

    public function test_verify_otp_redirects_to_reset_password_with_valid_otp(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, SendOtpNotification::class, function ($notification) use ($user) {
            $otp = $notification->otp;

            $response = $this->post('/verify-otp', [
                'email' => $user->email,
                'otp' => $otp,
            ]);

            $response->assertSessionHasNoErrors();

            // Token tersimpan (ter-hash) di tabel password_reset_tokens
            $record = DB::table('password_reset_tokens')->where('email', $user->email)->first();
            $this->assertNotNull($record);

            // Redirect ke form reset password
            $response->assertRedirect();

            return true;
        });
    }

    public function test_verify_otp_fails_with_wrong_otp(): void
    {
        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        $response = $this->post('/verify-otp', [
            'email' => $user->email,
            'otp' => '000000',
        ]);

        $response->assertSessionHasErrors('otp');
    }

    public function test_password_can_be_reset_with_valid_token(): void
    {
        Notification::fake();

        $user = User::factory()->create();

        $this->post('/forgot-password', ['email' => $user->email]);

        Notification::assertSentTo($user, SendOtpNotification::class, function ($notification) use ($user) {
            // Verifikasi OTP dulu
            $this->post('/verify-otp', [
                'email' => $user->email,
                'otp' => $notification->otp,
            ]);

            // Token plaintext disimpan di session saat kirim OTP
            $token = session('otp_token');
            $this->assertNotNull($token);

            $response = $this->post('/reset-password', [
                'token' => $token,
                'email' => $user->email,
                'password' => 'passwordbaru123',
                'password_confirmation' => 'passwordbaru123',
            ]);

            $response
                ->assertSessionHasNoErrors()
                ->assertRedirect(route('login'));

            // OTP dihapus setelah berhasil
            $this->assertDatabaseMissing('password_reset_tokens', ['email' => $user->email]);

            return true;
        });
    }
}
