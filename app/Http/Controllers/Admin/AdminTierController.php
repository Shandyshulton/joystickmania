<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MembershipTier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminTierController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Tiers', [
            'tiers' => MembershipTier::withCount('purchases')->orderBy('harga_paket')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        MembershipTier::create($data);

        return back()->with('success', 'Tier berhasil ditambahkan.');
    }

    public function update(Request $request, MembershipTier $tier)
    {
        $data = $this->validated($request);

        $tier->update($data);

        return back()->with('success', 'Tier berhasil diperbarui.');
    }

    public function destroy(MembershipTier $tier)
    {
        $tier->delete();

        return back()->with('success', 'Tier dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'nama_tier' => 'required|string|max:20',
            'harga_paket' => 'required|integer|min:0',
            'masa_berlaku_hari' => 'required|integer|min:0',
            'diskon_persen' => 'required|integer|min:0|max:100',
            'benefit_lain' => 'nullable|string|max:1000',
        ]);
    }
}
