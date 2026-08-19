<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NewPasswordController extends Controller
{
    /**
     * Tampilkan form input OTP (setelah kirim OTP).
     */
    public function verify(Request $request): Response
    {
        return Inertia::render('Auth/VerifyOtp', [
            'email' => session('otp_email', $request->input('email', '')),
            'status' => session('status'),
        ]);
    }

    /**
     * Verifikasi OTP -> jika valid, tampilkan form password baru.
     */
    public function verifyOtp(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('expires_at', '>', now())
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'otp' => 'Kode OTP salah atau sudah kedaluwarsa.',
            ]);
        }

        // Ambil token plaintext dari session (disimpan saat kirim OTP)
        $token = session('otp_token');

        if (! $token) {
            throw ValidationException::withMessages([
                'otp' => 'Sesi tidak valid. Silakan minta OTP baru.',
            ]);
        }

        $request->session()->put('otp_email', $request->email);

        return redirect()->route('password.reset', ['token' => $token])
            ->with('status', 'Kode OTP valid. Silakan buat password baru.');
    }

    /**
     * Tampilkan form password baru (dengan token dari OTP yang valid).
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $request->route('token'),
            'status' => session('status'),
        ]);
    }

    /**
     * Set password baru setelah OTP terverifikasi.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $email = $request->session()->get('otp_email');
        $email ??= DB::table('password_reset_tokens')
            ->get()
            ->first(fn ($record) => Hash::check($request->token, $record->token))
            ?->email;

        if (! $email) {
            throw ValidationException::withMessages([
                'password' => 'Sesi reset password tidak valid. Silakan minta OTP baru.',
            ]);
        }

        $status = Password::reset(
            [
                'email' => $email,
                'password' => $request->password,
                'password_confirmation' => $request->password_confirmation,
                'token' => $request->token,
            ],
            function ($user) use ($request) {
                $user->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => \Illuminate\Support\Str::random(60),
                ])->save();

                // Bersihkan OTP setelah berhasil
                DB::table('password_reset_tokens')
                    ->where('email', $user->email)
                    ->delete();

                session()->forget(['otp_email', 'otp_token']);
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            Auth::guard('web')->logout();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('success', 'Password berhasil direset. Silakan login.');
        }

        throw ValidationException::withMessages([
            'email' => [trans($status)],
        ]);
    }
}
