<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginSeparationTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): Admin
    {
        return Admin::factory()->create([
            'email' => 'admin@test.com',
            'password' => 'password',
            'role' => 'super_admin',
        ]);
    }

    private function makeMember(): User
    {
        return User::factory()->create([
            'email' => 'member@test.com',
            'password' => 'password',
            'role' => 'user',
        ]);
    }

    public function test_authenticated_admin_visiting_user_login_redirects_to_admin(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin, 'admin')->get('/login');

        $response->assertRedirect('/admin');
    }

    public function test_authenticated_member_visiting_admin_login_redirects_to_dashboard(): void
    {
        $member = $this->makeMember();

        $response = $this->actingAs($member)->get('/admin/login');

        $response->assertRedirect('/dashboard');
    }

    public function test_admin_cannot_login_from_user_login_page(): void
    {
        $this->makeAdmin();

        $response = $this->post('/login', [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('web');
    }

    public function test_member_cannot_login_from_admin_login_page(): void
    {
        $this->makeMember();

        $response = $this->post('/admin/login', [
            'email' => 'member@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest('admin');
    }

    public function test_admin_cannot_access_member_dashboard(): void
    {
        $admin = $this->makeAdmin();

        $response = $this->actingAs($admin, 'admin')->get('/dashboard');

        $response->assertRedirect('/login');
    }

    public function test_member_can_access_member_dashboard(): void
    {
        $member = $this->makeMember();

        $response = $this->actingAs($member)->get('/dashboard');

        $response->assertOk();
    }

    public function test_member_login_redirects_to_dashboard(): void
    {
        $this->makeMember();

        $response = $this->post('/login', [
            'email' => 'member@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('web');
    }

    public function test_admin_login_redirects_to_admin_dashboard(): void
    {
        $this->makeAdmin();

        $response = $this->post('/admin/login', [
            'email' => 'admin@test.com',
            'password' => 'password',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertAuthenticated('admin');
    }
}
