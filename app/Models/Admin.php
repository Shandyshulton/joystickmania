<?php

namespace App\Models;

use Database\Factories\AdminFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['nama', 'no_hp', 'email', 'password', 'role', 'permissions'])]
#[Hidden(['password', 'remember_token'])]
class Admin extends Authenticatable
{
    /** @use HasFactory<AdminFactory> */
    use HasFactory, Notifiable;

    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_STAFF = 'staff';

    public const PERMISSIONS = [
        'dashboard' => 'Dashboard',
        'bookings' => 'Kelola Booking Room',
        'rentals' => 'Kelola Sewa Fisik',
        'memberships' => 'Kelola Membership',
        'members' => 'Manajemen Member',
        'rooms' => 'Manajemen Rooms',
        'units' => 'Manajemen Unit PS',
        'tiers' => 'Manajemen Tier',
        'games' => 'Manajemen Game',
        'settings' => 'Pengaturan Website',
        'users' => 'Manajemen Admin & Role',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'permissions' => 'array',
        ];
    }

    public function isAdmin(): bool
    {
        return in_array($this->role, [self::ROLE_SUPER_ADMIN, self::ROLE_ADMIN], true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($this->role === self::ROLE_ADMIN) {
            return $permission !== 'users';
        }

        $permissions = $this->permissions ?? [];

        return in_array($permission, $permissions, true);
    }
}
