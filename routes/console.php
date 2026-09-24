<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Dijalankan sebagai closure, bukan Schedule::command(): Event biasa memakai
// Symfony\Process (butuh proc_open) untuk memanggil "php artisan ..." sebagai sub-proses,
// dan hosting ini menonaktifkan proc_open. CallbackEvent dieksekusi in-process.
Schedule::call(fn () => Artisan::call('bookings:expire-pending') === 0)
    ->everyMinute()
    ->name('bookings:expire-pending')
    ->withoutOverlapping();

// Job harian membership: reminder H-1, expire di hari-H, auto-downgrade tenggang 1 hari
Schedule::call(fn () => Artisan::call('membership:process-daily') === 0)
    ->dailyAt('00:05')
    ->name('membership:process-daily');
