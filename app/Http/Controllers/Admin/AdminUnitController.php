<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PsUnit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUnitController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Units', [
            'units' => PsUnit::withCount('physicalRentals')->orderBy('kode_unit')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        PsUnit::create($data);

        return back()->with('success', 'Unit berhasil ditambahkan.');
    }

    public function update(Request $request, PsUnit $unit)
    {
        $data = $this->validated($request);

        $unit->update($data);

        return back()->with('success', 'Unit berhasil diperbarui.');
    }

    public function destroy(PsUnit $unit)
    {
        $unit->delete();

        return back()->with('success', 'Unit dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'kode_unit' => 'required|string|max:50',
            'jenis_konsol' => 'required|in:PS3,PS4,PS5',
            'kondisi' => 'nullable|string|max:255',
            'status' => 'required|in:tersedia,disewa,servis',
            'harga_sewa' => 'required|integer|min:0',
            'nominal_deposit' => 'required|integer|min:0',
        ]);
    }
}
