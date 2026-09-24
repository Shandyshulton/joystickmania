<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Notifications\LoginOtpNotification;
use App\Support\PortalRedirect;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    /**
     * Batas percobaan login (tahap password) per email + IP.
     */
    private const MAX_LOGIN_ATTEMPTS = 5;

    /**
     * Batas percobaan kode OTP salah sebelum sesi OTP dibuang.
     */
    private const MAX_OTP_ATTEMPTS = 5;

    /**
     * Tampilkan halaman login khusus admin/staff.
     *
     * Sesi member (guard "web") sengaja diabaikan supaya admin bisa membuka form ini
     * meskipun browser yang sama sedang login sebagai customer.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Login');
    }

    /**
     * Proses login admin. Hanya role CMS (super_admin/admin/staff) yang boleh.
     */
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $throttleKey = $this->throttleKey($credentials['email'], $request);

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_LOGIN_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            throw ValidationException::withMessages([
                'email' => "Terlalu banyak percobaan login. Coba lagi dalam {$seconds} detik.",
            ]);
        }

        if (config('auth.login_otp.enabled')) {
            try {
                $admin = $this->validateCredentials($credentials);
            } catch (ValidationException $e) {
                RateLimiter::hit($throttleKey);

                throw $e;
            }

            RateLimiter::clear($throttleKey);
            $this->startLoginOtp($request, $admin, $request->boolean('remember'));

            return redirect()->route('admin.login.otp')
                ->with('status', 'Kode OTP login telah dikirim ke email admin.');
        }

        if (! Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            RateLimiter::hit($throttleKey);

            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        return PortalRedirect::toAdmin(route('admin.dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang di Admin Panel.');
    }

    public function showOtp(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('admin_login_otp')) {
            return redirect()->route('admin.login');
        }

        return Inertia::render('Admin/LoginOtp', [
            'status' => session('status'),
        ]);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $pending = $request->session()->get('admin_login_otp');

        if (! $pending || ($pending['expires_at'] ?? 0) < now()->timestamp) {
            $request->session()->forget('admin_login_otp');

            throw ValidationException::withMessages([
                'otp' => 'Kode OTP login sudah kedaluwarsa. Silakan login ulang.',
            ]);
        }

        if (! Hash::check($request->otp, $pending['otp_hash'] ?? '')) {
            $attempts = (int) ($pending['attempts'] ?? 0) + 1;

            // Batas percobaan habis -> sesi OTP dibuang, harus login ulang dari awal
            if ($attempts >= self::MAX_OTP_ATTEMPTS) {
                $request->session()->forget('admin_login_otp');

                throw ValidationException::withMessages([
                    'otp' => 'Kode OTP login salah. Batas percobaan habis, silakan login ulang.',
                ]);
            }

            $pending['attempts'] = $attempts;
            $request->session()->put('admin_login_otp', $pending);

            throw ValidationException::withMessages([
                'otp' => 'Kode OTP login salah.',
            ]);
        }

        Auth::guard('admin')->loginUsingId($pending['admin_id'], (bool) ($pending['remember'] ?? false));

        $request->session()->forget('admin_login_otp');
        $request->session()->regenerate();

        return PortalRedirect::toAdmin(route('admin.dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang di Admin Panel.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login');
    }

    /**
     * Kunci rate limit login admin: email (lowercase) + IP pengirim.
     */
    private function throttleKey(string $email, Request $request): string
    {
        return 'admin-login:'.Str::transliterate(Str::lower($email)).'|'.$request->ip();
    }

    /**
     * @param  array{email:string,password:string}  $credentials
     */
    private function validateCredentials(array $credentials): Admin
    {
        $provider = Auth::guard('admin')->getProvider();
        $admin = $provider->retrieveByCredentials($credentials);

        if (! $admin || ! $provider->validateCredentials($admin, $credentials)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        return $admin;
    }

    private function startLoginOtp(Request $request, Admin $admin, bool $remember): void
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $request->session()->put('admin_login_otp', [
            'admin_id' => $admin->id,
            'remember' => $remember,
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(config('auth.login_otp.expires_minutes', 10))->timestamp,
        ]);

        $admin->notify(new LoginOtpNotification($otp));
    }
}
