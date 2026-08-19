<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use App\Notifications\LoginOtpNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response|RedirectResponse
    {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        if (config('auth.login_otp.enabled')) {
            /** @var User $user */
            $user = $request->validateCredentials('web');
            $this->startLoginOtp($request, $user, $request->boolean('remember'));

            return redirect()->route('login.otp')
                ->with('status', 'Kode OTP login telah dikirim ke email Anda.');
        }

        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang kembali, '.$request->user('web')->nama.'.');
    }

    public function showOtp(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has('login_otp')) {
            return redirect()->route('login');
        }

        return Inertia::render('Auth/LoginOtp', [
            'status' => session('status'),
        ]);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'otp' => 'required|string|size:6',
        ]);

        $pending = $request->session()->get('login_otp');

        if (! $pending || ($pending['expires_at'] ?? 0) < now()->timestamp) {
            $request->session()->forget('login_otp');

            throw ValidationException::withMessages([
                'otp' => 'Kode OTP login sudah kedaluwarsa. Silakan login ulang.',
            ]);
        }

        if (! Hash::check($request->otp, $pending['otp_hash'] ?? '')) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP login salah.',
            ]);
        }

        Auth::guard('web')->loginUsingId($pending['user_id'], (bool) ($pending['remember'] ?? false));

        $request->session()->forget('login_otp');
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang kembali, '.$request->user('web')->nama.'.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    private function startLoginOtp(Request $request, User $user, bool $remember): void
    {
        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $request->session()->put('login_otp', [
            'user_id' => $user->id,
            'remember' => $remember,
            'otp_hash' => Hash::make($otp),
            'expires_at' => now()->addMinutes(config('auth.login_otp.expires_minutes', 10))->timestamp,
        ]);

        $user->notify(new LoginOtpNotification($otp));
    }
}
