<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\SendOtpNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PasswordResetLinkController extends Controller
{
    /**
     * Tampilkan form minta OTP (input email).
     */
    public function create(): Response
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Kirim kode OTP 6 digit ke email user (via Gmail SMTP).
     * Simpan OTP + expiry 10 menit di tabel password_reset_tokens.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Selalu jawab sama (anti user enumeration): kalau email tidak ada,
        // tetap arahkan ke halaman verifikasi OTP
        if ($user) {
            $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $token = \Illuminate\Support\Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    // Token di-hash seperti bawaan Laravel agar Password::reset bisa memverifikasi
                    'token' => \Illuminate\Support\Facades\Hash::make($token),
                    'otp' => $otp,
                    'expires_at' => now()->addMinutes(10),
                    'created_at' => now(),
                ]
            );

            $user->notify(new SendOtpNotification($otp));

            // Simpan token plaintext di session untuk redirect ke form password baru
            session(['otp_token' => $token]);
        }

        return redirect()->route('password.verify')
            ->with('status', 'Kode OTP telah dikirim ke email Anda (jika email terdaftar).')
            ->with('otp_email', $request->email);
    }
}
