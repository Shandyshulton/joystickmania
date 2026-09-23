<?php

namespace App\Support;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

/**
 * Redirect setelah login yang tetap berada di portalnya sendiri.
 *
 * Key session 'url.intended' dipakai bersama oleh semua guard, sehingga URL
 * dari area admin bisa tertinggal saat seseorang login lewat form member
 * (dan sebaliknya). Tanpa difilter, user jadi terlempar ke halaman portal lain.
 */
class PortalRedirect
{
    /**
     * Redirect setelah login member — URL intended milik portal admin dibuang.
     */
    public static function toMember(string $fallback): RedirectResponse
    {
        return redirect()->to(self::pick($fallback, forAdmin: false));
    }

    /**
     * Redirect setelah login admin — URL intended di luar portal admin dibuang.
     */
    public static function toAdmin(string $fallback): RedirectResponse
    {
        return redirect()->to(self::pick($fallback, forAdmin: true));
    }

    private static function pick(string $fallback, bool $forAdmin): string
    {
        $intended = session()->pull('url.intended');

        if (! $intended) {
            return $fallback;
        }

        $path = (string) (parse_url($intended, PHP_URL_PATH) ?: '/');
        $isAdminUrl = $path === '/admin' || Str::startsWith($path, '/admin/');

        return $isAdminUrl === $forAdmin ? $intended : $fallback;
    }
}
