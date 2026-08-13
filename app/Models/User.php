<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['nama', 'no_hp', 'email', 'password', 'membership_tier', 'is_admin', 'role', 'permissions'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const ROLE_SUPER_ADMIN = 'super_admin';
    public const ROLE_ADMIN = 'admin';
    public const ROLE_STAFF = 'staff';
    public const ROLE_USER = 'user';

    /**
     * Daftar permission yang bisa dicentang untuk role CMS (staff/admin).
     * Super admin otomatis punya semua.
     */
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
        'users' => 'Manajemen User & Role',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'permissions' => 'array',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function physicalRentals(): HasMany
    {
        return $this->hasMany(PhysicalRental::class);
    }

    public function membershipPurchases(): HasMany
    {
        return $this->hasMany(MembershipPurchase::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN || $this->role === self::ROLE_ADMIN
            || (bool) $this->is_admin; // kompatibilitas data lama
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === self::ROLE_SUPER_ADMIN;
    }

    /**
     * Cek apakah user punya permission tertentu.
     * Super admin = semua permission. User tanpa role CMS = tidak punya apa pun.
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isSuperAdmin()) {
            return true;
        }

        if (! in_array($this->role, [self::ROLE_ADMIN, self::ROLE_STAFF])) {
            return false;
        }

        $perms = $this->permissions ?? [];

        // Kalau permission tidak diset, fallback: admin = semua, staff = dashboard saja
        if ($perms === []) {
            return $this->role === self::ROLE_ADMIN;
        }

        return in_array($permission, $perms);
    }
}
