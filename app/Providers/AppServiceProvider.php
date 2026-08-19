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

        // User yang SUDAH login membuka halaman login — arahkan sesuai role.
        // CMS (admin/staff) -> /admin, member biasa -> /dashboard.
        // Mencegah "kecampur" antara login user & login admin.
        RedirectIfAuthenticated::redirectUsing(function ($request) {
            if ($request->user('admin')) {
                return route('admin.dashboard');
            }

            $user = $request->user('web');

            return $user ? route('dashboard') : route('login');
        });
    }
}
