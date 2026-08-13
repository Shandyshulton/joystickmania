<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\PhysicalRental;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Dashboard member: status membership, riwayat booking & sewa fisik,
     * riwayat purchase membership. Riwayat ditautkan via user_id ATAU no_hp
     * yang sama (spec 3.5: booking guest tertaut lewat no. HP).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $noHp = $user->no_hp;

        $bookings = Booking::with('room')
            ->where(function ($q) use ($user, $noHp) {
                $q->where('user_id', $user->id)->orWhere('no_hp', $noHp);
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $physicalRentals = PhysicalRental::with('psUnit')
            ->where(function ($q) use ($user, $noHp) {
                $q->where('user_id', $user->id)->orWhere('no_hp', $noHp);
            })
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $membershipPurchases = MembershipPurchase::with('tier')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        // Cek apakah user punya tier berbayar yang masih aktif/valid
        $activeMembership = MembershipPurchase::where('user_id', $user->id)
            ->where('membership_status', 'active')
            ->where('valid_until', '>', now())
            ->latest()
            ->first();

        return Inertia::render('Dashboard', [
            'bookings' => $bookings,
            'physicalRentals' => $physicalRentals,
            'membershipPurchases' => $membershipPurchases,
            'activeMembership' => $activeMembership,
            'tiers' => \App\Models\MembershipTier::orderBy('harga_paket')->get(),
        ]);
    }
}
