<?php

namespace App\Console\Commands;

use App\Support\TelegramAlert;
use Illuminate\Console\Command;

class AlertsTestCommand extends Command
{
    protected $signature = 'alerts:test {--category=infra : Kategori uji: crash, security, business, atau infra}';

    protected $description = 'Kirim satu pesan uji ke Telegram untuk memastikan konfigurasinya jalan';

    public function handle(): int
    {
        $category = (string) $this->option('category');

        if (! config("alerting.categories.{$category}", false)) {
            $this->error("Kategori '{$category}' tidak dikenal atau dimatikan di config/alerting.php.");

            return self::FAILURE;
        }

        $token = (string) config('alerting.telegram.bot_token');
        $chat = (string) config('alerting.telegram.chat_id');

        $this->line('bot_token: '.($token === '' ? '<fg=red>kosong</>' : '<fg=green>terisi ('.strlen($token).' char)</>'));
        $this->line('chat_id  : '.($chat === '' ? '<fg=red>kosong</>' : '<fg=green>'.$chat.'</>'));

        if ($token === '' || $chat === '') {
            $this->newLine();
            $this->error('Isi TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID di .env, lalu jalankan php artisan config:clear.');

            return self::FAILURE;
        }

        // Kunci dedupe acak tiap jalankan command ini, jadi pengujian berulang
        // tidak pernah tertahan oleh throttle.
        $sent = TelegramAlert::send(
            $category,
            'test:'.uniqid('', true),
            sprintf('[uji] Alert %s berfungsi. Waktu: %s', $category, now()->format('d-m-Y H:i:s')),
        );

        if (! $sent) {
            $this->newLine();
            $this->error('Pesan ditolak atau gagal terkirim. Cek storage/logs untuk alasan HTTP-nya.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('Terkirim. Cek Telegram Anda.');

        return self::SUCCESS;
    }
}
