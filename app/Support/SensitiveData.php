<?php

namespace App\Support;

use Illuminate\Http\Request;
use Throwable;

/**
 * Menyaring data pribadi keluar dari sistem notifikasi & error tracking.
 *
 * Kenapa perlu kelas sendiri: app ini menyimpan nama/no HP/alamat/path foto KTP
 * sebagai kolom plaintext (lihat migration revert_encryption_columns), dan pesan
 * QueryException Laravel menyisipkan binding SQL ke dalam string pesannya. Artinya
 * PII pelanggan bisa ikut terkirim ke Sentry atau Telegram hanya lewat judul error,
 * tanpa ada satu pun baris kode yang secara sadar mengirimkannya.
 */
class SensitiveData
{
    /** Nama field yang nilainya tidak boleh pernah keluar. */
    public const SENSITIVE_KEYS = [
        'password', 'password_confirmation', 'token', 'otp', 'otp_hash',
        'secret', 'api_key', 'apikey', 'access_key', 'authorization', 'cookie',
        'app_key', 'request_payload_key', 'encrypted_payload',
        'nama', 'no_hp', 'nomor_hp', 'phone', 'email', 'alamat',
        'nik', 'foto_ktp', 'ktp',
    ];

    /** Pola bentuk data, sebagai penangkap kedua kalau kunci fieldnya beda. */
    private const PATTERNS = [
        // email
        '/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/' => '[email-dihapus]',
        // nomor Indonesia: 08.., +62 8.., 628..
        '/(?<!\d)(?:\+?62|0)8[\d\s\-().]{6,18}\d(?!\d)/' => '[no-hp-dihapus]',
        // NIK / nomor identitas 16 digit
        '/(?<!\d)\d{16}(?!\d)/' => '[nik-dihapus]',
        // APP_KEY & token base64 panjang
        '#base64:[A-Za-z0-9+/=]{16,}#' => '[key-dihapus]',
        '/eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{5,}/' => '[token-dihapus]',
        // payload terenkripsi bentuk query
        '/(encrypted_payload=)[^&\s"]+/' => '$1[terenkripsi]',
    ];

    private static ?array $cachedValues = null;

    /**
     * Ganti nilai PII yang dikenal maupun yang hanya dikenali dari bentuknya.
     */
    public static function redact(?string $text): string
    {
        $text = (string) $text;

        if ($text === '') {
            return '';
        }

        foreach (self::knownValues() as $value) {
            $text = str_replace($value, '[pii-dihapus]', $text);
        }

        return preg_replace(array_keys(self::PATTERNS), array_values(self::PATTERNS), $text) ?? $text;
    }

    /**
     * Bersihkan array input secara rekursif: buang nilai pada field sensitif,
     * lalu redact sisa nilainya.
     */
    public static function redactArray(array $data, int $depth = 0): array
    {
        if ($depth > 6) {
            return '[dalam]';
        }

        $clean = [];

        foreach ($data as $key => $value) {
            if (is_string($key) && self::isSensitiveKey($key)) {
                $clean[$key] = '[dihapus]';

                continue;
            }

            $clean[$key] = match (true) {
                is_array($value) => self::redactArray($value, $depth + 1),
                is_string($value) => self::redact($value),
                default => $value,
            };
        }

        return $clean;
    }

    public static function isSensitiveKey(string $key): bool
    {
        $key = strtolower(str_replace(['-', '.'], '_', $key));

        foreach (self::SENSITIVE_KEYS as $sensitive) {
            if ($key === $sensitive || str_contains($key, $sensitive)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Nilai PII nyata yang sedang lewat di request/sesi ini, untuk pencocokan
     * persis. Di-memoize per request supaya murah saat dipakai banyak pesan.
     *
     * @return list<string>
     */
    public static function knownValues(): array
    {
        if (self::$cachedValues !== null) {
            return self::$cachedValues;
        }

        $values = [];

        try {
            if (app()->bound('request')) {
                /** @var Request $request */
                $request = app('request');

                // Ini berisi input SUDAH TERDEKRIPSI: middleware
                // DecryptRequestPayload men-merge payload ke request, jadi
                // $request->all() adalah sumber PII yang paling lengkap.
                $input = $request->has('encrypted_payload')
                    ? $request->except(['encrypted_payload'])
                    : $request->all();

                foreach (self::flatten($input) as $value) {
                    $values[] = $value;
                }
            }

            foreach (['web' => auth('web')->user(), 'admin' => auth('admin')->user()] as $user) {
                if (! $user) {
                    continue;
                }

                foreach (['nama', 'email', 'no_hp', 'nik'] as $field) {
                    if (filled($user->{$field})) {
                        $values[] = (string) $user->{$field};
                    }
                }
            }
        } catch (Throwable) {
            // Booting, console, atau container belum siap: tanpa knownValues pun
            // pola regex tetap bekerja, jadi ini bukan kegagalan fatal.
        }

        // Buang yang terlalu pendek (terlalu banyak false positive, mis. "adi"
        // akan mencocokkan kata "radio") dan yang bukan UTF-8 valid, karena
        // str_replace tidak andal pada byte sequence rusak.
        $values = array_unique(array_filter(
            $values,
            fn ($v) => is_string($v) && mb_check_encoding($v, 'UTF-8') && mb_strlen(trim($v)) >= 3,
        ));

        // Nilai lebih panjang diproses dulu supaya substring tidak menyisakan
        // potongan data di belakangnya.
        usort($values, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));

        return self::$cachedValues = array_values($values);
    }

    public static function reset(): void
    {
        self::$cachedValues = null;
    }

    /**
     * Tambah satu nilai PII yang sedang berlalu, untuk pencocokan persis.
     */
    public static function observe(mixed $value): void
    {
        if (! is_string($value) || mb_strlen(trim($value)) < 3 || ! mb_check_encoding($value, 'UTF-8')) {
            return;
        }

        // knownValues() memoize; panggil dulu supaya basisnya ada.
        $known = self::knownValues();

        if (in_array($value, $known, true)) {
            return;
        }

        $known[] = $value;
        usort($known, fn ($a, $b) => mb_strlen($b) <=> mb_strlen($a));

        self::$cachedValues = $known;
    }

    /**
     * Ambil nilai PII dari binding QueryException.
     *
     * Menutup celah yang tidak dijangkau knownValues(): nama/alamat yang muncul
     * di pesan error padahal tidak ada di request saat itu — misalnya error di
     * queued job atau command, tempat tidak ada input user sama sekali.
     * QueryException Laravel menyisipkan binding ke dalam pesannya, jadi binding
     * adalah sumber nilai yang paling akurat di sana.
     *
     * Binding int/bool/float dilewati: itu ID atau flag, dan menghapusnya justru
     * membuat pesan error tidak berguna untuk debugging.
     */
    public static function observeThrowable(?Throwable $e): void
    {
        while ($e !== null) {
            if (method_exists($e, 'getBindings')) {
                foreach ((array) $e->getBindings() as $binding) {
                    if (is_int($binding) || is_bool($binding) || is_float($binding) || $binding === null) {
                        continue;
                    }

                    self::observe(is_scalar($binding) ? (string) $binding : null);
                }
            }

            $e = $e->getPrevious();
        }
    }

    private static function flatten(array $data, int $depth = 0): array
    {
        if ($depth > 6) {
            return [];
        }

        $out = [];

        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $out = array_merge($out, self::flatten($value, $depth + 1));

                continue;
            }

            if (is_string($key) && self::isSensitiveKey($key) && is_scalar($value)) {
                $out[] = (string) $value;
            }
        }

        return $out;
    }
}
