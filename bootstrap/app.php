<?php

use App\Http\Middleware\DecryptRequestPayload;
use App\Http\Middleware\EnsurePortalPort;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Support\CrashAlerter;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Route dipisah per area: user & admin (bukan digabung di web.php)
            // Wajib dibungkus group middleware 'web' agar session/CSRF terpasang
            Route::middleware('web')->group(function () {
                require __DIR__.'/../routes/auth.php';
                require __DIR__.'/../routes/user.php';
                require __DIR__.'/../routes/admin.php';
            });
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            EnsurePortalPort::class,
            DecryptRequestPayload::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'is_admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // Setiap exception yang dilaporkan juga dikirim ke Telegram (dibatasi
        // throttle & disaring mana yang layak membangunkan orang). Sentry
        // menangkap exception yang sama lewat reportable listener-nya sendiri.
        $exceptions->reportable(function (Throwable $e): void {
            app(CrashAlerter::class)->notify($e);
        });
    })->create();
