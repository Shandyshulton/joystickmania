<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Sakelar utama
    |--------------------------------------------------------------------------
    |
    | mati = tidak ada satu pun notifikasi Telegram yang dikirim, tapi Sentry
    | tetap jalan. Bermanfaat saat gangguan besar membuat alert berjibun.
    |
    */

    'enabled' => env('ALERTING_ENABLED', true),

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id' => env('TELEGRAM_CHAT_ID'),
        // connectTimeout & timeout ditekan: saat jaringan atau Telegram sedang
        // bermasalah, request user tidak boleh ikut menunggu puluhan detik hanya
        // untuk mengirim pemberitahuan.
        'connect_timeout' => (float) env('TELEGRAM_CONNECT_TIMEOUT', 1.5),
        'timeout' => (float) env('TELEGRAM_TIMEOUT', 3),
    ],

    // Satu kunci dedupe hanya boleh memicu satu pesan per rentang ini.
    'throttle_seconds' => (int) env('ALERT_THROTTLE_SECONDS', 600),

    'categories' => [
        'crash' => env('ALERT_ON_CRASH', true),
        'security' => env('ALERT_ON_SECURITY', true),
        'business' => env('ALERT_ON_BUSINESS', true),
        'infra' => env('ALERT_ON_INFRA', true),
    ],

    'security' => [
        // Baru lapor setelah N kegagalan dari IP yang sama dalam window ini,
        // supaya percobaan password biasa tidak menimbun notifikasi.
        'login_failure_threshold' => (int) env('ALERT_LOGIN_FAILURE_THRESHOLD', 8),
        'login_failure_window' => (int) env('ALERT_LOGIN_FAILURE_WINDOW', 600),
    ],

    'infra' => [
        'disk_min_free_percent' => (float) env('ALERT_DISK_MIN_FREE_PERCENT', 10),

        // Task scheduler yang marker-nya lebih tua dari ini (menit) dianggap macet.
        'stale_tasks' => [
            'bookings:expire-pending' => 15,
            'membership:process-daily' => 1500,
        ],
    ],
];
