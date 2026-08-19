<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use App\Support\RequestPayloadCrypt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test pemisahan login admin vs user.
 */
class SeparateLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_login_page_is_accessible(): void
    {
        $this->get('/admin/login')->assertOk();
    }

    public function test_super_admin_can_login_from_admin_page(): void
    {
        Admin::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('admin');
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_super_admin_can_login_from_admin_page_with_encrypted_payload(): void
    {
        Admin::factory()->create([
            'email' => 'encrypted-admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
        ]);

        $response = $this->post('/admin/login', [
            'encrypted_payload' => RequestPayloadCrypt::encrypt([
                'email' => 'encrypted-admin@example.com',
                'password' => 'password',
                'remember' => true,
            ]),
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('admin');
        $response->assertRedirect(route('admin.dashboard', absolute: false));
    }

    public function test_regular_user_cannot_login_from_admin_page(): void
    {
        User::factory()->create([
            'email' => 'member@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'member@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('admin');
    }

    public function test_admin_cannot_login_from_user_page(): void
    {
        Admin::factory()->create([
            'email' => 'admin2@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);

        $response = $this->post('/login', [
            'email' => 'admin2@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('web');
    }

    public function test_regular_user_can_login_from_user_page(): void
    {
        User::factory()->create([
            'email' => 'member2@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $response = $this->post('/login', [
            'email' => 'member2@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('web');
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_regular_user_can_login_from_user_page_with_encrypted_payload(): void
    {
        User::factory()->create([
            'email' => 'encrypted-member@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ]);

        $response = $this->post('/login', [
            'encrypted_payload' => RequestPayloadCrypt::encrypt([
                'email' => 'encrypted-member@example.com',
                'password' => 'password',
                'remember' => false,
            ]),
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('web');
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_guest_accessing_admin_area_redirects_to_admin_login(): void
    {
        $response = $this->get('/admin/bookings');

        $response->assertRedirect(route('admin.login'));
    }
}
