<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
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
        $request->authenticate();

        // Role CMS (admin/staff) tidak boleh login dari halaman user
        if (in_array($request->user()->role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_STAFF])) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            throw ValidationException::withMessages([
                'email' => 'Akun ini adalah akun admin/staff. Silakan masuk melalui halaman Login Admin.',
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false))
            ->with('success', 'Login berhasil! Selamat datang kembali, '.$request->user()->nama.'.');
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // Tentukan tujuan logout sebelum session dihapus
        $user = $request->user();
        $isCmsUser = $user && in_array($user->role, [User::ROLE_SUPER_ADMIN, User::ROLE_ADMIN, User::ROLE_STAFF]);

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        // Admin/staff kembali ke halaman login admin, user biasa ke beranda
        return $isCmsUser
            ? redirect()->route('admin.login')
            : redirect('/');
    }
}
