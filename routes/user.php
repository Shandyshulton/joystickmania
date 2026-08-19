<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KtpController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

// =====================================================================
// HANYA ROUTE USER (member) — wajib login, area user
// =====================================================================

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth:web', 'verified'])
    ->name('dashboard');

// Foto KTP milik sendiri (auth) — file private disk, tidak pernah lewat URL publik
Route::get('/ktp/{rental}', [KtpController::class, 'show'])
    ->middleware('auth:web')
    ->name('ktp.show');

Route::middleware('auth:web')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Beli/upgrade membership (wajib login user)
    Route::get('/membership/beli/{tier}', [BookingController::class, 'buyMembership'])->name('membership.buy');
    Route::post('/membership/beli/{tier}', [BookingController::class, 'storeMembership'])->name('membership.buy.store');
});
