<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Auth\Middleware\RedirectIfAuthenticated;
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
    }
}
