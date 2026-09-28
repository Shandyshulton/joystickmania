<?php

namespace App\Support;

use Sentry\Breadcrumb;
use Sentry\Event;
use Sentry\EventHint;
use Sentry\ExceptionDataBag;

/**
 * Callback before_send Sentry: pastikan tidak ada data pelanggan yang ikut keluar.
 *
 * Tiga jalur yang ditutup, berurutan dari yang paling berbahaya untuk app ini:
 *
 * 1. Pesan exception. QueryException Laravel menyisipkan binding SQL ke pesan
 *    error-nya, jadi INSERT gagal memajang nama/no HP/alamat di JUDUL issue —
 *    dan judul selalu terkirim walau body request dibatasi.
 * 2. Breadcrumb. SQL query & log Laravel direkam sebagai breadcrumb; isinya bisa
 *    memuat nilai yang sama.
 * 3. Context/extra dan request. Body memang cuma berisi encrypted_payload,
 *    tapi kita tidak bergantung pada kebetulan itu.
 */
class SentryScrubber
{
    public function __invoke(Event $event, ?EventHint $hint = null): ?Event
    {
        try {
            $this->scrubExceptions($event);
            $this->scrubMessage($event);
            $this->scrubRequest($event);
            $this->scrubBreadcrumbs($event);
            $this->scrubContexts($event);
            $this->scrubExtra($event);
            $this->scrubUser($event);

            $event->setTag('pii_scrubbed', 'true');
        } catch (\Throwable $e) {
            // Kalau penyaringan gagal, lebih baik event dibuang total daripada
            // lolos dalam keadaan tidak tersaring.
            report($e);

            return null;
        }

        return $event;
    }

    private function scrubExceptions(Event $event): void
    {
        foreach ($event->getExceptions() as $exception) {
            if (! $exception instanceof ExceptionDataBag) {
                continue;
            }

            $exception->setValue(SensitiveData::redact($exception->getValue()));
            $exception->setType(SensitiveData::redact($exception->getType()));
        }
    }

    private function scrubMessage(Event $event): void
    {
        $message = $event->getMessage();

        if ($message === null) {
            return;
        }

        $event->setMessage(
            SensitiveData::redact($message),
            array_map(fn ($param) => SensitiveData::redact($this->stringify($param)), $event->getMessageParams()),
            $event->getMessageFormatted() === null ? null : SensitiveData::redact($event->getMessageFormatted()),
        );
    }

    private function scrubRequest(Event $event): void
    {
        $request = $event->getRequest();

        if ($request === []) {
            return;
        }

        foreach (['url', 'method', 'query_string'] as $key) {
            if (isset($request[$key]) && is_string($request[$key])) {
                $request[$key] = SensitiveData::redact($request[$key]);
            }
        }

        foreach (['data', 'cookies', 'headers'] as $key) {
            if (isset($request[$key]) && is_array($request[$key])) {
                $request[$key] = SensitiveData::redactArray($request[$key]);
            }
        }

        $event->setRequest($request);
    }

    private function scrubBreadcrumbs(Event $event): void
    {
        $rebuilt = [];

        foreach ($event->getBreadcrumbs() as $breadcrumb) {
            if (! $breadcrumb instanceof Breadcrumb) {
                continue;
            }

            $rebuilt[] = new Breadcrumb(
                $breadcrumb->getLevel(),
                $breadcrumb->getType(),
                $breadcrumb->getCategory(),
                $breadcrumb->getMessage() === null ? null : SensitiveData::redact($breadcrumb->getMessage()),
                SensitiveData::redactArray($breadcrumb->getMetadata()),
                $breadcrumb->getTimestamp(),
            );
        }

        $event->setBreadcrumb($rebuilt);
    }

    private function scrubContexts(Event $event): void
    {
        foreach ($event->getContexts() as $name => $context) {
            if (is_array($context)) {
                $event->setContext((string) $name, SensitiveData::redactArray($context));
            }
        }
    }

    private function scrubExtra(Event $event): void
    {
        $extra = $event->getExtra();

        if ($extra !== []) {
            $event->setExtra(SensitiveData::redactArray($extra));
        }
    }

    /**
     * ID user tetap disimpan (berguna untuk "siapa yang terdampak"), tapi
     * email/username/IP tidak.
     */
    private function scrubUser(Event $event): void
    {
        $user = $event->getUser();

        if ($user === null) {
            return;
        }

        $user->setEmail(null);
        $user->setUsername(null);
        $user->setIpAddress(null);

        foreach (array_keys($user->getMetadata()) as $name) {
            if (SensitiveData::isSensitiveKey((string) $name)) {
                $user->removeMetadata((string) $name);
            }
        }
    }

    private function stringify(mixed $value): string
    {
        if (is_string($value)) {
            return $value;
        }

        if (is_scalar($value) || $value === null) {
            return (string) $value;
        }

        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE) ?: '';
    }
}
