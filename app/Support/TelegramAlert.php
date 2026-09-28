<?php

namespace App\Support;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Kirim pemberitahuan singkat ke admin lewat Telegram Bot API.
 *
 * Sengaja dipanggil inline (bukan lewat queue): QUEUE_CONNECTION=sync, jadi
 * queue tidak membuat apa pun jadi asinkron, dan hosting ini tidak mengizinkan
 * proc_open untuk worker. Karena itu kontrak kelas ini keras: TIDAK PERNAH
 * melempar exception dan TIDAK PERNAH menambah retry — kegagalan alert cukup
 * dicatat, tidak boleh berubah jadi error kedua di atas error yang ada.
 */
class TelegramAlert
{
    public const CRASH = 'crash';

    public const SECURITY = 'security';

    public const BUSINESS = 'business';

    public const INFRA = 'infra';

    private const MAX_LENGTH = 4096;

    /**
     * @return bool true kalau pesan benar-benar dikirim
     */
    public static function send(string $category, string $dedupeKey, string $text): bool
    {
        try {
            if (! self::categoryEnabled($category)) {
                return false;
            }

            $token = (string) config('alerting.telegram.bot_token');
            $chatId = (string) config('alerting.telegram.chat_id');

            if ($token === '' || $chatId === '') {
                // Belum dikonfigurasi: anggap normal, jangan banjiri log.
                return false;
            }

            if (! self::claim($dedupeKey)) {
                return false;
            }

            return self::dispatch($token, $chatId, $text);
        } catch (Throwable $e) {
            self::recordFailure($e);

            return false;
        }
    }

    /**
     * Satu kunci dedupe hanya boleh menghasilkan satu pesan per throttle_seconds.
     *
     * Fail-open: production memakai CACHE_STORE=database, jadi saat MySQL mati
     * maka Cache::add ikut gagal. Padahal "DB mati" justru kejadian yang paling
     * harus diberitahkan. Kegagalan cache tidak boleh memblokir pengiriman:
     * risikonya hanya pesan berulang, bukan pesan tidak datang sama sekali.
     */
    protected static function claim(string $dedupeKey): bool
    {
        $ttl = max(60, (int) config('alerting.throttle_seconds', 600));

        try {
            return Cache::add('alert:tg:'.sha1($dedupeKey), 1, now()->addSeconds($ttl));
        } catch (Throwable) {
            return true;
        }
    }

    protected static function categoryEnabled(string $category): bool
    {
        if (! config('alerting.enabled', true)) {
            return false;
        }

        return (bool) config("alerting.categories.{$category}", false);
    }

    /**
     * Catatan: parse_mode sengaja tidak dipakai. Teks error sering memuat karakter
     * "<", ">", atau "_" yang bikin Telegram menolak pesan saat HTML/Markdown.
     */
    protected static function dispatch(string $token, string $chatId, string $text): bool
    {
        $response = Http::asJson()
            ->connectTimeout((float) config('alerting.telegram.connect_timeout', 1.5))
            ->timeout((float) config('alerting.telegram.timeout', 3))
            ->retry(0)
            ->post("https://api.telegram.org/bot{$token}/sendMessage", [
                'chat_id' => $chatId,
                'text' => self::prepare($text),
                'disable_web_page_preview' => true,
            ]);

        if ($response->failed()) {
            self::recordFailure(new \RuntimeException(
                'Telegram HTTP '.$response->status().': '.substr(strip_tags($response->body()), 0, 200)
            ));

            return false;
        }

        return true;
    }

    protected static function prepare(string $text): string
    {
        // Lapis terakhir: kalau ada nilai PII yang lolos sampai sini, buang dulu.
        $text = SensitiveData::redact($text);

        if (mb_strlen($text) <= self::MAX_LENGTH) {
            return $text;
        }

        return mb_substr($text, 0, self::MAX_LENGTH - 4).' ...';
    }

    protected static function recordFailure(Throwable $e): void
    {
        try {
            Log::withContext(['alert' => 'telegram'])
                ->warning('Gagal mengirim notifikasi Telegram: '.$e->getMessage());
        } catch (Throwable) {
            // Logging bisa gagal (disk penuh / DB mati) dan itu justru saat alert
            // paling dibutuhkan — jangan sampai malah melempar ke caller.
        }
    }
}
