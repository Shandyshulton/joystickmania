<?php

namespace App\Http\Controllers;

use App\Models\PhysicalRental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class KtpController extends Controller
{
    /**
     * Tampilkan foto KTP sebuah rental fisik.
     * Hanya boleh diakses oleh:
     * - Pemilik rental (user_id cocok dengan user yang login), atau
     * - Admin/staff dengan permission 'rentals'.
     * File berada di private disk (tidak bisa diakses langsung via URL).
     */
    public function show(Request $request, PhysicalRental $rental): StreamedResponse
    {
        $admin = $request->user('admin');
        $user = $request->user('web');

        if (! $user && ! $admin) {
            abort(403, 'Login diperlukan.');
        }

        $isOwner = $user && $rental->user_id && $rental->user_id === $user->id;
        $isStaff = $admin && ($admin->isAdmin() || $admin->hasPermission('rentals'));

        if (! $isOwner && ! $isStaff) {
            abort(403, 'Anda tidak berhak melihat foto KTP ini.');
        }

        if (empty($rental->foto_ktp)) {
            abort(404, 'Foto KTP tidak ditemukan.');
        }

        // foto_ktp di-cast encrypted -> otomatis ter-decrypt saat diakses.
        $path = $rental->foto_ktp;

        if (! Storage::disk('local')->exists($path)) {
            abort(404, 'Foto KTP tidak ditemukan.');
        }

        return Storage::disk('local')->response($path);
    }
}
