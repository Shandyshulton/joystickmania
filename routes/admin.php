<?php

use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AdminGameController;
use App\Http\Controllers\Admin\AdminLoginController;
use App\Http\Controllers\Admin\AdminRoomController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminTierController;
use App\Http\Controllers\Admin\AdminUnitController;
use App\Http\Controllers\KtpController;
use Illuminate\Support\Facades\Route;

// =====================================================================
// HANYA ROUTE ADMIN (CMS) — login admin terpisah + role/permission
// =====================================================================

// Login admin — middleware guest: user yang sudah login (member/admin) otomatis
// diarahkan ke halaman sesuai role (lihat RedirectIfAuthenticated di AppServiceProvider).
Route::middleware('guest:admin')->group(function () {
    Route::get('/admin/login', [AdminLoginController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AdminLoginController::class, 'store'])->name('admin.login.store');
    Route::get('/admin/login/otp', [AdminLoginController::class, 'showOtp'])->name('admin.login.otp');
    Route::post('/admin/login/otp', [AdminLoginController::class, 'verifyOtp'])->name('admin.login.otp.store');
});

Route::middleware(['auth:admin', 'is_admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::post('/logout', [AdminLoginController::class, 'destroy'])->name('logout');

    Route::get('/', [AdminController::class, 'dashboard'])
        ->middleware('is_admin:dashboard')->name('dashboard');

    Route::get('/bookings', [AdminController::class, 'bookings'])
        ->middleware('is_admin:bookings')->name('bookings');
    Route::patch('/bookings/{booking}', [AdminController::class, 'updateBooking'])
        ->middleware('is_admin:bookings')->name('bookings.update');

    Route::get('/rentals', [AdminController::class, 'rentals'])
        ->middleware('is_admin:rentals')->name('rentals');
    Route::patch('/rentals/{rental}', [AdminController::class, 'updateRental'])
        ->middleware('is_admin:rentals')->name('rentals.update');
    // Lihat foto KTP (private disk, hanya admin/staff dengan permission rentals)
    Route::get('/rentals/{rental}/ktp', [KtpController::class, 'show'])
        ->middleware('is_admin:rentals')->name('rentals.ktp');

    Route::get('/memberships', [AdminController::class, 'memberships'])
        ->middleware('is_admin:memberships')->name('memberships');
    Route::patch('/memberships/{purchase}', [AdminController::class, 'updateMembership'])
        ->middleware('is_admin:memberships')->name('memberships.update');

    Route::get('/members', [AdminController::class, 'members'])
        ->middleware('is_admin:members')->name('members');
    Route::patch('/members/{user}/tier', [AdminController::class, 'updateMemberTier'])
        ->middleware('is_admin:members')->name('members.tier');

    Route::get('/rooms', [AdminRoomController::class, 'index'])
        ->middleware('is_admin:rooms')->name('rooms');
    Route::post('/rooms', [AdminRoomController::class, 'store'])
        ->middleware('is_admin:rooms')->name('rooms.store');
    Route::patch('/rooms/{room}', [AdminRoomController::class, 'update'])
        ->middleware('is_admin:rooms')->name('rooms.update');
    Route::delete('/rooms/{room}', [AdminRoomController::class, 'destroy'])
        ->middleware('is_admin:rooms')->name('rooms.destroy');

    Route::get('/units', [AdminUnitController::class, 'index'])
        ->middleware('is_admin:units')->name('units');
    Route::post('/units', [AdminUnitController::class, 'store'])
        ->middleware('is_admin:units')->name('units.store');
    Route::patch('/units/{unit}', [AdminUnitController::class, 'update'])
        ->middleware('is_admin:units')->name('units.update');
    Route::delete('/units/{unit}', [AdminUnitController::class, 'destroy'])
        ->middleware('is_admin:units')->name('units.destroy');

    Route::get('/tiers', [AdminTierController::class, 'index'])
        ->middleware('is_admin:tiers')->name('tiers');
    Route::post('/tiers', [AdminTierController::class, 'store'])
        ->middleware('is_admin:tiers')->name('tiers.store');
    Route::patch('/tiers/{tier}', [AdminTierController::class, 'update'])
        ->middleware('is_admin:tiers')->name('tiers.update');
    Route::delete('/tiers/{tier}', [AdminTierController::class, 'destroy'])
        ->middleware('is_admin:tiers')->name('tiers.destroy');

    // Manajemen user & role — hanya super admin
    Route::get('/users', [AdminController::class, 'users'])
        ->middleware('is_admin:users')->name('users');
    Route::post('/users', [AdminController::class, 'storeUser'])
        ->middleware('is_admin:users')->name('users.store');
    Route::patch('/users/{admin}', [AdminController::class, 'updateUser'])
        ->middleware('is_admin:users')->name('users.update');
    Route::patch('/users/{admin}/permissions', [AdminController::class, 'updateUserPermissions'])
        ->middleware('is_admin:users')->name('users.permissions');

    // Manajemen game (konten list game di landing)
    Route::get('/games', [AdminGameController::class, 'index'])
        ->middleware('is_admin:games')->name('games');
    Route::post('/games', [AdminGameController::class, 'store'])
        ->middleware('is_admin:games')->name('games.store');
    Route::patch('/games/{game}', [AdminGameController::class, 'update'])
        ->middleware('is_admin:games')->name('games.update');
    Route::delete('/games/{game}', [AdminGameController::class, 'destroy'])
        ->middleware('is_admin:games')->name('games.destroy');

    // Pengaturan website (kontak, alamat, jam operasional)
    Route::get('/settings', [AdminSettingsController::class, 'index'])
        ->middleware('is_admin:settings')->name('settings');
    Route::patch('/settings', [AdminSettingsController::class, 'update'])
        ->middleware('is_admin:settings')->name('settings.update');
});
