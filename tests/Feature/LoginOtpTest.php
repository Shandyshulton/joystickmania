<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use App\Notifications\LoginOtpNotification;
use App\Support\RequestPayloadCrypt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class LoginOtpTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_login_requires_otp_when_enabled(): void
    {
        Config::set('auth.login_otp.enabled', true);
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'otp-user@example.com',
            'password' => 'password',
        ]);

        $response = $this->post('/login', [
            'email' => 'otp-user@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('login.otp', absolute: false));
        $this->assertGuest('web');

        Notification::assertSentTo($user, LoginOtpNotification::class, function ($notification) {
            $response = $this->post('/login/otp', [
                'encrypted_payload' => RequestPayloadCrypt::encrypt([
                    'otp' => $notification->otp,
                ]),
            ]);

            $response->assertSessionHasNoErrors();
            $response->assertRedirect(route('dashboard', absolute: false));
            $this->assertAuthenticated('web');

            return true;
        });
    }

    public function test_admin_login_requires_otp_when_enabled(): void
    {
        Config::set('auth.login_otp.enabled', true);
        Notification::fake();

        $admin = Admin::factory()->create([
            'email' => 'otp-admin@example.com',
            'password' => 'password',
            'role' => Admin::ROLE_SUPER_ADMIN,
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'otp-admin@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('admin.login.otp', absolute: false));
        $this->assertGuest('admin');

        Notification::assertSentTo($admin, LoginOtpNotification::class, function ($notification) {
            $response = $this->post('/admin/login/otp', [
                'encrypted_payload' => RequestPayloadCrypt::encrypt([
                    'otp' => $notification->otp,
                ]),
            ]);

            $response->assertSessionHasNoErrors();
            $response->assertRedirect(route('admin.dashboard', absolute: false));
            $this->assertAuthenticated('admin');

            return true;
        });
    }
}
