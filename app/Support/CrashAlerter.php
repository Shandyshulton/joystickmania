<?php

namespace App\Support;

use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\PostTooLargeException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Merubah exception yang dilaporkan jadi satu pesan Telegram ke admin.
 *
 * Why not just alert on everything: app ini sengaja membuang banyak exception
 * yang memang diharapkan (validasi form, 404, upload kebesaran). Alert yang
 * berbunyi untuk hal normal akan dimatikan orang dalam seminggu, jadi yang
 * lolos ke sini hanya kegagalan yang butuh tindakan manusia.
 */
class CrashAlerter
{
    /** Bug aplikasi yang tidak perlu mengangkat HP siapa pun. */
    private const IGNORED = [
        ValidationException::class,
        ModelNotFoundException::class,
        NotFoundHttpException::class,
    ];

    public function notify(Throwable $e): bool
    {
        if (! config('alerting.categories.crash', false) || ! config('alerting.enabled', true)) {
            return false;
        }

        if ($this->isExpected($e)) {
            return false;
        }

        // Same reason as SentryScrubber: PII yang tersisip ke pesan QueryException
        // baru bisa dibuang kalau nilainya diketahui lebih dulu.
        SensitiveData::observeThrowable($e);

        return TelegramAlert::send(
            TelegramAlert::CRASH,
            $this->dedupeKey($e),
            $this->summary($e),
        );
    }

    protected function isExpected(Throwable $e): bool
    {
        foreach (self::IGNORED as $ignored) {
            if ($e instanceof $ignored) {
                return true;
            }
        }

        // Upload KTP melewati batas: user sudah mendapat pesan yang benar, dan
        // kejadiannya bisa dipicu berulang oleh bot. Sentry tetap merekamnya.
        if ($e instanceof PostTooLargeException) {
            return true;
        }

        // 4xx (termasuk abort(403) dari guard) bukan crash.
        return $e instanceof HttpExceptionInterface && $e->getStatusCode() < 500;
    }

    protected function dedupeKey(Throwable $e): string
    {
        return 'crash:'.get_class($e).':'.$this->originFrame($e);
    }

    protected function summary(Throwable $e): string
    {
        $lines = [
            sprintf('[crash] %s di %s', $this->shortClass($e), config('app.env')),
            sprintf('%s: %s', $this->requestDescriptor(), SensitiveData::redact($e->getMessage())),
            'lokasi: '.$this->originFrame($e),
        ];

        $previous = $e->getPrevious();

        if ($previous !== null) {
            $lines[] = sprintf('asal: %s: %s', $this->shortClass($previous), SensitiveData::redact($previous->getMessage()));
        }

        return implode("\n", $lines);
    }

    /**
     * Method + URI saja. Query string sengaja tidak ikut: di app ini ia bisa
     * memuat nilai yang sudah didekripsi.
     */
    protected function requestDescriptor(): string
    {
        // Laravel mengikat request palsu ke container setiap kali proses berjalan
        // di CLI, jadi "ada request" BUKAN bukti crash ini berasal dari pengunjung.
        // Tanpa pemeriksaan ini, kegagalan cron dan scheduled task terbaca sebagai
        // "GET /" — seolah homepage yang mati padahal bukan.
        if (app()->runningInConsole() || ! app()->bound('request')) {
            return 'console';
        }

        try {
            /** @var Request $request */
            $request = app('request');

            $uri = '/'.ltrim($request->path(), '/');

            return $request->getMethod().' '.$uri;
        } catch (Throwable) {
            return 'tidak diketahui';
        }
    }

    /**
     * Frame pertama milik app sendiri — frame vendor hanya menutupi penyebabnya.
     */
    protected function originFrame(Throwable $e): string
    {
        foreach ($e->getTrace() as $frame) {
            $file = $frame['file'] ?? null;

            if (! is_string($file)) {
                continue;
            }

            if (! str_contains(str_replace('\\', '/', $file), '/app/')) {
                continue;
            }

            return basename($file).':'.($frame['line'] ?? '?');
        }

        $file = $e->getFile();

        return ($file !== '' ? basename($file) : 'tidak diketahui').':'.$e->getLine();
    }

    protected function shortClass(Throwable $e): string
    {
        $parts = explode('\\', $e::class);

        return end($parts);
    }
}
