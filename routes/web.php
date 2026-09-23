<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\PublicPageController;
use Illuminate\Support\Facades\Route;

// =====================================================================
// HANYA ROUTE PUBLIC — bisa diakses tanpa login
// =====================================================================

Route::get('/', [PublicPageController::class, 'home'])->name('home');

Route::get('/cek-ketersediaan', [PublicPageController::class, 'availability'])->name('availability');

Route::get('/membership', [PublicPageController::class, 'membership'])->name('membership');

Route::get('/syarat-ketentuan-sewa-fisik', [PublicPageController::class, 'terms'])->name('terms');

// Throttle: batasi enumerasi nomor HP lewat pencarian riwayat
Route::get('/riwayat', [PublicPageController::class, 'history'])
    ->middleware('throttle:10,1')
    ->name('history');

// ===== Booking (guest & login boleh) =====
Route::get('/booking/room', [BookingController::class, 'createRoom'])->name('booking.room');
Route::post('/booking/room', [BookingController::class, 'storeRoom'])->name('booking.room.store');

Route::get('/booking/fisik', [BookingController::class, 'createPhysical'])->name('booking.fisik');
Route::post('/booking/fisik', [BookingController::class, 'storePhysical'])->name('booking.fisik.store');

// Polling status booking (halaman sukses) — cek admin sudah accept / expired
// Halaman sukses polling tiap 5 detik -> batas 60/menit masih longgar
Route::get('/booking/status', [BookingController::class, 'status'])
    ->middleware('throttle:60,1')
    ->name('booking.status');
