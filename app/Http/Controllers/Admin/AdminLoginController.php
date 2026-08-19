<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Notifications\LoginOtpNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    /**
     * Tampilkan halaman login khusus admin/staff.
     */
    public function create(): Response|RedirectResponse
    {
        if (Auth::guard('web')->check()) {
            return redirect()->route('dashboard');
        }

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

        if (config('auth.login_otp.enabled')) {
            $admin = $this->validateCredentials($credentials);
            $this->startLoginOtp($request, $admin, $request->boolean('remember'));

            return redirect()->route('admin.login.otp')
                ->with('status', 'Kode OTP login telah dikirim ke email admin.');
        }

        if (! Auth::guard('admin')->attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false))
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
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP login salah.',
            ]);
        }

        Auth::guard('admin')->loginUsingId($pending['admin_id'], (bool) ($pending['remember'] ?? false));

        $request->session()->forget('admin_login_otp');
        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false))
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
