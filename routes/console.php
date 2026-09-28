<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Menandai bahwa sebuah task benar-benar selesai dijalankan, supaya
// alerts:heartbeat bisa membedakan "cron mati" dari "task ini yang macet".
// Kegagalan menulis marker ditelan dengan diam: cache memakai database, dan
// error di baris ini tidak boleh membuat task-nya sendiri dianggap gagal.
$markTaskRun = function (string $task): void {
    try {
        Cache::put("task:lastrun:{$task}", now()->timestamp, now()->addDay());
    } catch (Throwable) {
        //
    }
};

// Dijalankan sebagai closure, bukan Schedule::command(): Event biasa memakai
// Symfony\Process (butuh proc_open) untuk memanggil "php artisan ..." sebagai sub-proses,
// dan hosting ini menonaktifkan proc_open. CallbackEvent dieksekusi in-process.
Schedule::call(function () use ($markTaskRun) {
    $ok = Artisan::call('bookings:expire-pending') === 0;
    $markTaskRun('bookings:expire-pending');

    return $ok;
})
    ->everyMinute()
    ->name('bookings:expire-pending')
    ->withoutOverlapping();

// Job harian membership: reminder H-1, expire di hari-H, auto-downgrade tenggang 1 hari
Schedule::call(function () use ($markTaskRun) {
    $ok = Artisan::call('membership:process-daily') === 0;
    $markTaskRun('membership:process-daily');

    return $ok;
})
    ->dailyAt('00:05')
    ->name('membership:process-daily');

// Penjaga kondisi server. Pola closure sama: proc_open tidak tersedia di hosting.
Schedule::call(function () use ($markTaskRun) {
    $ok = Artisan::call('alerts:heartbeat') === 0;
    $markTaskRun('alerts:heartbeat');

    return $ok;
})
    ->everyFiveMinutes()
    ->name('alerts:heartbeat')
    ->withoutOverlapping();
