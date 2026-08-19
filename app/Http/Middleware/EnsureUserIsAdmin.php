<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Batasi akses ke CMS berdasarkan role & permission.
     * - Super admin: semua menu (termasuk Manajemen Admin & Role).
     * - Admin: semua menu KECUALI Manajemen Admin & Role.
     * - Staff: hanya menu yang dicentang di permission.
     */
    public function handle(Request $request, Closure $next, ?string $permission = null): Response
    {
        $user = $request->user('admin');

        if (! $user) {
            abort(403, 'Akses khusus admin.');
        }

        // Super admin: segalanya
        if ($user->isSuperAdmin()) {
            return $next($request);
        }

        // Menu "users" (manajemen admin & role) khusus super admin
        if ($permission === 'users') {
            abort(403, 'Hanya Super Admin yang bisa mengelola admin & role.');
        }

        // Admin: akses penuh selain users
        if ($user->isAdmin()) {
            return $next($request);
        }

        // Staff: akses CMS umum (mis. redirect setelah login) jika punya minimal 1 permission
        if ($permission === null) {
            return $next($request);
        }

        // Staff: cek permission yang dicentang
        if ($user->hasPermission($permission)) {
            return $next($request);
        }

        abort(403, 'Anda tidak punya akses ke menu ini.');
    }
}
