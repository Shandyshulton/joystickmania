<?php

namespace Tests\Feature;

use App\Models\Admin;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserRoleSaveTest extends TestCase
{
    use RefreshDatabase;

    private function superAdmin(): Admin
    {
        return Admin::factory()->create(['role' => 'super_admin']);
    }

    public function test_super_admin_can_update_user_data_and_role(): void
    {
        $admin = $this->superAdmin();
        $staff = Admin::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($admin, 'admin')->patch('/admin/users/'.$staff->id, [
            'nama' => 'Nama Baru',
            'no_hp' => $staff->no_hp,
            'email' => $staff->email,
            'role' => 'admin',
            'password' => '',
        ]);

        $response->assertSessionHasNoErrors();

        $fresh = $staff->fresh();
        $this->assertSame('Nama Baru', $fresh->nama);
        $this->assertSame('admin', $fresh->role);
    }

    public function test_super_admin_can_update_permissions(): void
    {
        $admin = $this->superAdmin();
        $staff = Admin::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($admin, 'admin')->patch('/admin/users/'.$staff->id.'/permissions', [
            'permissions' => ['dashboard', 'bookings'],
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertSame(['dashboard', 'bookings'], $staff->fresh()->permissions);
    }
}
