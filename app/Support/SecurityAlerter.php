<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Alert untuk kejadian yang mengindikasikan serangan atau penyalahgunaan.
 *
 * Prinsipnya: satu kejadian biasa tidak membangunkan siapa pun, tapi deretan
 * kejadian dari sumber yang sama dalam waktu singkat iya. Karena itu tiap metode
 * menghitung di cache lebih dulu dan baru mengirim saat ambang lewat.
 */
class SecurityAlerter
{
    public function loginFailed(?Request $request): bool
    {
        if (! $request || ! $this->enabled()) {
            return false;
        }

        $threshold = (int) config('alerting.security.login_failure_threshold', 8);
        $window = (int) config('alerting.security.login_failure_window', 600);
        $key = 'alert:sec:login:'.sha1($this->ip($request));

        $count = $this->bump($key, $window);

        // Kirim tepat saat ambang lewat, lalu setiap kelipatannya, supaya admin
        // tahu serangan masih berjalan tanpa dapat 1 pesan per percobaan.
        if ($count < $threshold || $count % $threshold !== 0) {
            return false;
        }

        return TelegramAlert::send(
            TelegramAlert::SECURITY,
            'sec:login:'.$this->ip($request).':int'.intdiv($count, $threshold),
            sprintf(
                '[keamanan] %d percobaan login gagal dari %s dalam %d menit (guard: %s).',
                $count,
                $this->ip($request),
                intdiv($window, 60),
                $request->is('admin*') ? 'admin' : 'web',
            ),
        );
    }

    /**
     * Rate limiter sudah mengunci IP/user: ini signal yang lebih kuat daripada
     * kegagalan satuan, jadi langsung lapor.
     */
    public function lockedOut(?Request $request): bool
    {
        if (! $request || ! $this->enabled()) {
            return false;
        }

        return TelegramAlert::send(
            TelegramAlert::SECURITY,
            'sec:lockout:'.$this->ip($request),
            sprintf(
                '[keamanan] IP %s terkena rate limit saat akses %s.',
                $this->ip($request),
                '/'.ltrim($request->path(), '/'),
            ),
        );
    }

    /**
     * Payload terenkripsi yang tidak bisa didekripsi berarti ada yang mencoba
     * mengirim form hasil ubahan, atau kunci client/server tidak cocok.
     */
    public function tamperedPayload(?Request $request): bool
    {
        if (! $request || ! $this->enabled()) {
            return false;
        }

        $threshold = max(3, (int) config('alerting.security.login_failure_threshold', 8));
        $window = (int) config('alerting.security.login_failure_window', 600);
        $key = 'alert:sec:tamper:'.sha1($this->ip($request));

        $count = $this->bump($key, $window);

        if ($count < $threshold || $count % $threshold !== 0) {
            return false;
        }

        return TelegramAlert::send(
            TelegramAlert::SECURITY,
            'sec:tamper:'.$this->ip($request).':int'.intdiv($count, $threshold),
            sprintf(
                '[keamanan] %d payload form gagal didekripsi dari %s di %s — mungkin percobaan manipulasi request.',
                $count,
                $this->ip($request),
                '/'.ltrim($request->path(), '/'),
            ),
        );
    }

    /**
     * Akses ditolak guard admin. Satu kali = user nyasar; berulang dari IP yang
     * sama = ada yang sedang mencoba membobol endpoint.
     */
    public function deniedAdminAccess(?Request $request, string $reason): bool
    {
        if (! $request || ! $this->enabled()) {
            return false;
        }

        $threshold = max(5, (int) config('alerting.security.login_failure_threshold', 8));
        $window = (int) config('alerting.security.login_failure_window', 600);
        $key = 'alert:sec:403:'.sha1($this->ip($request).'|'.$request->path());

        $count = $this->bump($key, $window);

        if ($count < $threshold || $count % $threshold !== 0) {
            return false;
        }

        return TelegramAlert::send(
            TelegramAlert::SECURITY,
            'sec:403:'.$this->ip($request).':'.$request->path().':int'.intdiv($count, $threshold),
            sprintf(
                '[keamanan] %d akses ditolak di /%s (%s) dari %s.',
                $count,
                ltrim($request->path(), '/'),
                $reason,
                $this->ip($request),
            ),
        );
    }

    /**
     * Penghitung per kunci. Fail-closed di sini (berlawanan dengan TelegramAlert
     * yang fail-open): method ini dipanggil dari jalur login, jadi exception
     * saat cache/DB mati akan ikut merusak proses login user. Tanpa cache tidak
     * ada penghitungan yang mungkin dilakukan, jadi 0 = jangan lapor apa pun.
     */
    protected function bump(string $key, int $window): int
    {
        try {
            // Cache::add menetapkan nilai awal + TTL sekaligus; increment berikutnya
            // mempertahankan TTL yang sama, jadi penghitung tidak hidup selamanya.
            if (! Cache::add($key, 1, now()->addSeconds($window))) {
                return (int) Cache::increment($key);
            }

            return 1;
        } catch (Throwable) {
            return 0;
        }
    }

    protected function enabled(): bool
    {
        return config('alerting.enabled', true) && (bool) config('alerting.categories.security', false);
    }

    protected function ip(Request $request): string
    {
        return $request->ip() ?: 'tanpa-ip';
    }
}
