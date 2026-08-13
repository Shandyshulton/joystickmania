<?php

namespace Tests\Feature;

use App\Models\User;
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
        User::factory()->create([
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_admin' => true,
        ]);

        $response = $this->post('/admin/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated();
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
        $this->assertGuest();
    }

    public function test_admin_cannot_login_from_user_page(): void
    {
        User::factory()->create([
            'email' => 'admin2@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_admin' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'admin2@example.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
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
        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_guest_accessing_admin_area_redirects_to_admin_login(): void
    {
        $response = $this->get('/admin/bookings');

        $response->assertRedirect(route('admin.login'));
    }
}
