<?php

namespace Tests\Feature;

use App\Support\CrashAlerter;
use App\Support\SensitiveData;
use App\Support\SentryScrubber;
use App\Support\TelegramAlert;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Facade;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;
use Sentry\Breadcrumb;
use Sentry\Event;
use Sentry\EventHint;
use Sentry\ExceptionDataBag;
use Tests\TestCase;
use Throwable;

class AlertingTest extends TestCase
{
    private const NAMA = 'Budi Santoso';

    private const NO_HP = '081234567890';

    private const EMAIL = 'budi@example.com';

    protected function setUp(): void
    {
        parent::setUp();

        SensitiveData::reset();

        config([
            'alerting.enabled' => true,
            'alerting.categories.crash' => true,
            'alerting.categories.security' => true,
            'alerting.categories.business' => true,
            'alerting.categories.infra' => true,
            'alerting.telegram.bot_token' => 'TESTTOKEN',
            'alerting.telegram.chat_id' => '12345',
            'alerting.throttle_seconds' => 600,
        ]);

        cache()->clear();
    }

    protected function tearDown(): void
    {
        SensitiveData::reset();

        parent::tearDown();
    }

    /** Pasang request berisi PII supaya knownValues() punya sesuatu untuk disaring. */
    private function requestWithPii(): void
    {
        $this->app->instance('request', Request::create('/booking/fisik', 'POST', [
            'nama' => self::NAMA,
            'no_hp' => self::NO_HP,
            'email' => self::EMAIL,
            'alamat' => 'Jl. Melati No. 7',
        ]));

        SensitiveData::reset();
    }

    public function test_redact_membuang_pii_dari_teks(): void
    {
        // Nama & alamat hanya bisa dikenali dari konteks request; email/NIK/HP/key
        // tertangkap pola regex juga.
        $this->requestWithPii();

        $redacted = SensitiveData::redact(
            ' gagal: insert nama '.self::NAMA.', hp '.self::NO_HP.', '.self::EMAIL
            .' nik 3201010101010101 base64:ABCDEFGHIJKLmnopqrst== alamat Jl. Melati No. 7'
        );

        foreach ([self::NAMA, self::NO_HP, self::EMAIL, '3201010101010101', 'base64:ABCDEFGHIJKL', 'Jl. Melati No. 7'] as $rahasia) {
            $this->assertStringNotContainsString($rahasia, $redacted, "Masih ada {$rahasia}");
        }
    }

    public function test_pii_dari_pesan_exception_tidak_sampai_ke_telegram(): void
    {
        $this->requestWithPii();

        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true], 200)]);

        $exception = new \RuntimeException(
            'SQLSTATE[HY000]: insert ke physical_rentals (nama, no_hp) values ('.self::NAMA.', '.self::NO_HP.')'
        );

        $this->assertTrue(app(CrashAlerter::class)->notify($exception));

        Http::assertSent(function ($request) {
            $text = $request['text'] ?? '';

            return ! str_contains($text, self::NAMA)
                && ! str_contains($text, self::NO_HP)
                && str_contains($text, '[crash]');
        });
    }

    public function test_dedupe_memblokir_pesan_kembar_dalam_window(): void
    {
        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true], 200)]);

        $first = TelegramAlert::send(TelegramAlert::CRASH, 'kunci-sama', 'pesan pertama');
        $second = TelegramAlert::send(TelegramAlert::CRASH, 'kunci-sama', 'pesan kedua');

        $this->assertTrue($first);
        $this->assertFalse($second, 'Pesan dengan kunci dedupe yang sama harus tertahan throttle.');

        Http::assertSentCount(1);
    }

    public function test_alert_gagal_tidak_lempar_exception(): void
    {
        Http::fake(['api.telegram.org/*' => Http::response('Bad Request', 400)]);

        $kirim = TelegramAlert::send(TelegramAlert::INFRA, 'uji-gagal', 'teks');

        $this->assertFalse($kirim);
    }

    public function test_alert_diam_saat_token_belum_diisi(): void
    {
        config(['alerting.telegram.bot_token' => null, 'alerting.telegram.chat_id' => null]);

        Http::fake();

        $this->assertFalse(TelegramAlert::send(TelegramAlert::CRASH, 'tanpa-token', 'teks'));

        Http::assertNothingSent();
    }

    public function test_exception_yang_diharapkan_tidak_membangunkan_orang(): void
    {
        Http::fake();

        $this->assertFalse((new CrashAlerter)->notify(
            ValidationException::withMessages(['nama' => 'wajib diisi'])
        ));

        Http::assertNothingSent();
    }

    public function test_sentry_scrubber_menyaring_pesan_dan_context(): void
    {
        $this->requestWithPii();

        $event = Event::createEvent();

        // ExceptionDataBag mengambil message dari Throwable, jadi ini meniru
        // QueryException yang binding SQL-nya sudah tersisip ke pesan error.
        $queryException = new \RuntimeException(
            'SQLSTATE[HY000]: insert values (\''.self::NAMA.'\', '.self::NO_HP.')'
        );
        $event->setExceptions([new ExceptionDataBag($queryException)]);

        $event->setRequest([
            'url' => 'https://joystickmania.test/booking/fisik',
            'method' => 'POST',
            'data' => ['nama' => self::NAMA, 'no_hp' => self::NO_HP, 'encrypted_payload' => 'abcdef'],
            'query_string' => 'cari='.self::EMAIL,
        ]);
        $event->setBreadcrumb([
            new Breadcrumb('info', 'query', 'sql_query', null, ['sql' => 'select * from users where no_hp = \''.self::NO_HP.'\'']),
        ]);
        $event->setExtra(['input' => ['email' => self::EMAIL]]);

        $scrubbed = (new SentryScrubber)($event, EventHint::fromArray([]));

        $this->assertNotNull($scrubbed, 'Scrubber tidak boleh membuang event yang masih bisa dipakai.');

        $exceptions = $scrubbed->getExceptions();
        $this->assertStringNotContainsString(self::NAMA, $exceptions[0]->getValue());
        $this->assertStringNotContainsString(self::NO_HP, $exceptions[0]->getValue());

        $request = $scrubbed->getRequest();
        $this->assertSame('[dihapus]', $request['data']['nama']);
        $this->assertSame('[dihapus]', $request['data']['no_hp']);
        $this->assertStringNotContainsString(self::EMAIL, $request['query_string']);

        $breadcrumbs = $scrubbed->getBreadcrumbs();
        $this->assertStringNotContainsString(self::NO_HP, (string) $breadcrumbs[0]->getMetadata()['sql']);

        $this->assertStringNotContainsString(self::EMAIL, json_encode($scrubbed->getExtra()));
        $this->assertSame('true', $scrubbed->getTags()['pii_scrubbed'] ?? null);
    }

    public function test_heartbeat_mendeteksi_task_yang_macet(): void
    {
        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true], 200)]);

        // bookings:expire-pending terakhir jalan 3 jam lalu; membership belum pernah.
        cache()->put('task:lastrun:bookings:expire-pending', now()->subHours(3)->timestamp, now()->addDay());

        $this->artisan('alerts:heartbeat')->assertSuccessful();

        Http::assertSent(function ($request) {
            $text = (string) ($request['text'] ?? '');

            return str_contains($text, '[infra]')
                && (str_contains($text, 'bookings:expire-pending') || str_contains($text, 'membership:process-daily'));
        });
    }

    /**
     * Regresi: produksi memakai CACHE_STORE=database. Sebelum claim() dibuat
     * fail-open, matinya MySQL membuat pemanggilan Cache::add melempar exception
     * sehingga pesan "DB mati" tidak pernah terkirim — alert-nya dibungkam oleh
     * persis masalah yang seharusnya ia beritahukan.
     */
    public function test_tetap_terkirim_saat_cache_mati(): void
    {
        Http::fake(['api.telegram.org/*' => Http::response(['ok' => true], 200)]);

        Cache::shouldReceive('add')
            ->andThrow(new \RuntimeException('SQLSTATE[HY000] connection refused'));

        try {
            $this->assertTrue(
                TelegramAlert::send(TelegramAlert::INFRA, 'db-mati', '[infra] MySQL tidak terjangkau'),
                'Kegagalan cache tidak boleh memblokir pengiriman alert.'
            );

            Http::assertSentCount(1);
        } finally {
            Facade::clearResolvedInstances();
        }
    }

    public function test_sakelar_mematikan_semua_notifikasi(): void
    {
        config(['alerting.enabled' => false]);

        Http::fake();

        $this->assertFalse(TelegramAlert::send(TelegramAlert::CRASH, 'sakelar', 'teks'));

        Http::assertNothingSent();
    }
}
