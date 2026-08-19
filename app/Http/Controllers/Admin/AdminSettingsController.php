<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminSettingsController extends Controller
{
    /**
     * Form pengaturan website (kontak: alamat, jam operasional, no WA, email).
     */
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => Setting::allValues(),
        ]);
    }

    /**
     * Simpan semua nilai settings kontak.
     */
    public function update(Request $request)
    {
        $data = $request->validate([
            'alamat' => 'nullable|string|max:500',
            'jam_operasional' => 'nullable|string|max:255',
            'no_wa' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value ?? '', 'group' => 'kontak'],
            );
        }

        return back()->with('success', 'Pengaturan berhasil disimpan.');
    }
}
