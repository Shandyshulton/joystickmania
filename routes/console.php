<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Auto-expire pending payment yang lewat 30 menit — jalan tiap menit
Schedule::command('bookings:expire-pending')->everyMinute();

// Job harian membership: reminder H-1, expire di hari-H, auto-downgrade tenggang 1 hari
Schedule::command('membership:process-daily')->dailyAt('00:05');
