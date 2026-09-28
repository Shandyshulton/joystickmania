<?php

namespace App\Providers;

use App\Support\SecurityAlerter;
use App\Support\TelegramAlert;
use Illuminate\Auth\Events\Failed as LoginFailed;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
use Illuminate\Notifications\Events\NotificationFailed;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Guest yang membuka area admin diarahkan ke /admin/login,
        // selain itu ke /login (user/member)
        Authenticate::redirectUsing(function ($request) {
            return $request->is('admin/*') || $request->is('admin')
                ? route('admin.login')
                : route('login');
        });

        // User yang SUDAH login membuka halaman login di portalnya sendiri — arahkan ke
        // portal milik halaman itu, bukan portal lain. guest:web hanya terpanggil saat
        // guard "web" aktif dan guest:admin saat "admin" aktif, jadi path sudah cukup
        // untuk menentukan tujuan dan sesi admin tidak pernah "menular" ke halaman member.
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            return $request->is('admin') || $request->is('admin/*')
                ? route('admin.dashboard')
                : route('dashboard');
        });

        // Pemberitahuan keamanan. $event->credentials berisi password percobaan
        // dan sengaja tidak pernah dibaca/diteruskan ke alert mana pun.
        Event::listen(LoginFailed::class, function (LoginFailed $event): void {
            app(SecurityAlerter::class)->loginFailed(
                app()->bound('request') ? app('request') : null
            );
        });

        Event::listen(Lockout::class, function (Lockout $event): void {
            app(SecurityAlerter::class)->lockedOut($event->request);
        });

        // Alur bisnis: OTP/reset password yang tidak terkirim = pelanggan gagal
        // masuk dan sesi sewa bisa hangus. Direct, tanpa ambang batas, karena
        // kejadian pertama pun sudah berarti ada orang yang terblokir.
        // Tidak ada alamat email yang ikut dikirim — cukup kelas notifikasinya.
        Event::listen(NotificationFailed::class, function (NotificationFailed $event): void {
            if (! config('alerting.enabled', true) || ! config('alerting.categories.business', false)) {
                return;
            }

            TelegramAlert::send(
                TelegramAlert::BUSINESS,
                'biz:notif:'.class_basename($event->notification).':'.$event->channel,
                sprintf(
                    '[bisnis] Notifikasi %s gagal lewat kanal %s. Cek SMTP/API key di .env.',
                    class_basename($event->notification),
                    $event->channel,
                ),
            );
        });
    }
}
