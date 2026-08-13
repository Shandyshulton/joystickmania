<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    /**
     * Tampilkan halaman login khusus admin/staff.
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

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        $request->session()->regenerate();

        $user = Auth::user();

        // Member biasa tidak boleh login dari halaman admin
        if ($user->role === User::ROLE_USER) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Akun ini bukan akun admin/staff. Silakan masuk melalui halaman Login User.',
            ]);
        }

        return redirect()->intended(route('admin.dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang di Admin Panel.');
    }
}
