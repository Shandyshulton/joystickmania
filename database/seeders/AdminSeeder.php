<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@joystickmania.test'],
            [
                'nama' => 'Super Admin',
                'no_hp' => '081234567890',
                'password' => Hash::make('password'),
                'role' => Admin::ROLE_SUPER_ADMIN,
                'permissions' => null,
            ]
        );

        Admin::updateOrCreate(
            ['email' => 'staff@joystickmania.test'],
            [
                'nama' => 'Staff Demo',
                'no_hp' => '081111222333',
                'password' => Hash::make('password'),
                'role' => Admin::ROLE_STAFF,
                'permissions' => ['dashboard', 'bookings', 'rentals'],
            ]
        );
    }
}
