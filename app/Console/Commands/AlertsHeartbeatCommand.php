<?php

namespace App\Console\Commands;

use App\Support\SensitiveData;
use App\Support\TelegramAlert;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Pemeriksaan rutin kondisi server. Dijadwalkan tiap 5 menit.
 *
 * Batasan yang perlu diketahui: command ini ikut mati kalau cron mati, jadi ia
 * TIDAK BISA memperingatkan "schedule:run tidak dijalankan". Untuk itu diperlukan
 * pemantau eksternal yang menyerupai /up — lihat README bagian alerting.
 */
class AlertsHeartbeatCommand extends Command
{
    protected $signature = 'alerts:heartbeat {--force : kirim laporan walau semua beres}';

    protected $description = 'Periksa disk, koneksi DB, storage, dan task scheduler yang macet';

    public function handle(): int
    {
        $problems = [];

        foreach ($this->checks() as $label => $check) {
            try {
                if (($message = $check()) !== null) {
                    $problems[] = "[{$label}] {$message}";
                }
            } catch (Throwable $e) {
                $problems[] = "[{$label}] pemeriksaan gagal: ".SensitiveData::redact($e->getMessage());
            }
        }

        // Marker "app masih hidup". WAJIB dibungkus try/catch: cache memakai
        // database, jadi saat MySQL mati tulis marker ini akan melempar dan
        // membatalkan command SEBELUM masalah "DB mati" sempat diberitahkan.
        try {
            Cache::put('alert:heartbeat', now()->timestamp, now()->addDay());
        } catch (Throwable $e) {
            $problems[] = '[cache] tidak bisa menulis marker heartbeat: '.SensitiveData::redact($e->getMessage());
        }

        if ($problems === []) {
            if ($this->option('force')) {
                TelegramAlert::send('infra', 'heartbeat:ok', '[infra] Semua pemeriksaan beres.');
            }

            $this->info('Semua pemeriksaan beres.');

            return self::SUCCESS;
        }

        foreach ($problems as $problem) {
            $this->warn($problem);

            // Satu masalah = satu pesan, supaya kunci dedupe-nya spesifik dan
            // pulihnya satu hal tidak dibungkam oleh hal lain yang masih rusak.
            TelegramAlert::send(TelegramAlert::INFRA, 'heartbeat:'.sha1($problem), "[infra] {$problem}");
        }

        return self::SUCCESS;
    }

    /**
     * @return array<string, callable(): ?string>
     */
    protected function checks(): array
    {
        return [
            'disk' => fn () => $this->diskProblem(),
            'database' => fn () => $this->databaseProblem(),
            'storage' => fn () => $this->storageProblem(),
            'scheduler' => fn () => $this->staleTaskProblem(),
        ];
    }

    protected function diskProblem(): ?string
    {
        $path = base_path();
        $free = @disk_free_space($path);
        $total = @disk_total_space($path);

        if (! is_float($free) || ! is_float($total) || $total <= 0) {
            return null;
        }

        $percent = ($free / $total) * 100;
        $min = (float) config('alerting.infra.disk_min_free_percent', 10);

        if ($percent >= $min) {
            return null;
        }

        return sprintf('sisa disk %.1f%% (%s MB) di bawah ambang %.1f%%', $percent, number_format($free / 1048576, 0), $min);
    }

    protected function databaseProblem(): ?string
    {
        DB::connection()->getPdo();

        return null;
    }

    /**
     * Disk penuh / permission berubah bikin upload KTP gagal diam-diam.
     */
    protected function storageProblem(): ?string
    {
        foreach ([storage_path('logs'), storage_path('app'), storage_path('framework/cache')] as $dir) {
            if (! is_dir($dir)) {
                continue;
            }

            if (! is_writable($dir)) {
                return 'folder tidak bisa ditulis: '.basename(dirname($dir)).'/'.basename($dir);
            }
        }

        return null;
    }

    /**
     * Task yang harusnya jalan rutin tapi marker-nya menua: cron masih hidup,
     * tapi tugas spesifik itu macet (error, tanpa-overlap menggantung, dsb).
     */
    protected function staleTaskProblem(): ?string
    {
        $stale = [];

        foreach ((array) config('alerting.infra.stale_tasks', []) as $task => $minutes) {
            $lastRun = Cache::get("task:lastrun:{$task}");

            if ($lastRun === null) {
                $stale[] = "{$task} belum pernah tercatat jalan";

                continue;
            }

            $age = now()->diffInMinutes(now()->createFromTimestamp((int) $lastRun), absolute: true);

            if ($age > $minutes) {
                $stale[] = sprintf('%s terakhir jalan %d menit lalu (batas %d)', $task, $age, $minutes);
            }
        }

        return $stale === [] ? null : implode('; ', $stale);
    }
}
