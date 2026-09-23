<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\MembershipTier;
use App\Models\PhysicalRental;
use App\Models\PsUnit;
use App\Models\Room;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    /**
     * Landing page: hero, daftar konsol, preview room, highlight membership.
     */
    public function home()
    {
        return Inertia::render('Landing', [
            'rooms' => Room::where('status', 'aktif')->get(),
            'psUnits' => PsUnit::where('status', 'tersedia')->get(),
            'tiers' => MembershipTier::where('nama_tier', '!=', 'bronze')->get(),
            'games' => \App\Models\Game::where('status', 'aktif')
                ->orderBy('jenis_konsol')
                ->orderBy('nama_game')
                ->get(),
            'jamOperasional' => Setting::get('jam_operasional', '10.00 - 22.00 WIB'),
            'alamat' => Setting::get('alamat', 'Jl. Contoh No. 1, Kota'),
            'waAdmin' => Setting::get('no_wa', config('app.wa_admin_number')),
        ]);
    }

    /**
     * Halaman cek ketersediaan room.
     * Filter: tanggal, room, konsol. Tampilkan grid slot per jam.
     */
    public function availability(Request $request)
    {
        $tanggal = $request->input('tanggal', now()->toDateString());
        $roomId = $request->input('room_id');
        $konsol = $request->input('konsol');

        $rooms = Room::where('status', 'aktif')->get();

        // Jam operasional 10.00 - 22.00
        $slots = [];
        for ($jam = 10; $jam < 22; $jam++) {
            $slots[] = sprintf('%02d:00', $jam);
        }

        // Ambil booking yang mengunci slot pada tanggal tsb
        $bookings = DB::table('bookings')
            ->whereDate('tanggal', $tanggal)
            ->whereIn('booking_status', ['pending_payment', 'confirmed'])
            ->get();

        // Status per slot: available / booked / pending
        $grid = [];
        foreach ($rooms as $room) {
            if ($roomId && $room->id != $roomId) {
                continue;
            }
            foreach ($slots as $slot) {
                $jamMulai = substr($slot, 0, 2);
                $status = 'available';
                foreach ($bookings as $b) {
                    if ($b->room_id != $room->id) {
                        continue;
                    }
                    // Cek overlap: booking dimulai jam X durasi Y
                    $bMulai = (int) \Carbon\Carbon::parse($b->jam_mulai)->format('H');
                    $bSelesai = $bMulai + (int) $b->durasi;
                    $jamInt = (int) $jamMulai;
                    if ($jamInt >= $bMulai && $jamInt < $bSelesai) {
                        $status = $b->booking_status === 'pending_payment' ? 'pending' : 'booked';
                        break;
                    }
                }
                $grid[$room->id][] = [
                    'jam' => $slot,
                    'status' => $status,
                    'konsol' => $room->konsol_tersedia,
                ];
            }
        }

        return Inertia::render('Availability', [
            'rooms' => $rooms,
            'slots' => $slots,
            'grid' => $grid,
            'filters' => [
                'tanggal' => $tanggal,
                'room_id' => $roomId,
                'konsol' => $konsol,
            ],
        ]);
    }

    /**
     * Halaman info membership & pembelian (wajib login untuk beli).
     */
    public function membership()
    {
        return Inertia::render('Membership', [
            'tiers' => MembershipTier::orderBy('harga_paket')->get(),
        ]);
    }

    /**
     * Riwayat & status pemesanan.
     * - User yang login: record miliknya sendiri (by user_id).
     * - Tamu: hanya record yang dibuat dari sesi/perangkat ini
     *   (dicatat oleh BookingController::rememberOwnedRecord).
     *   Nomor HP sengaja TIDAK dipakai sebagai kunci pencarian supaya
     *   riwayat orang lain tidak bisa dienumerasi.
     */
    public function history(Request $request)
    {
        $user = $request->user();

        $bookings = collect();
        $physicalRentals = collect();
        $membershipPurchases = collect();

        $sessionBookingIds = $this->sessionOwnedIds($request, 'room');

        if ($sessionBookingIds !== []) {
            $bookings = Booking::with('room')
                ->whereIn('id', $sessionBookingIds)
                ->orderByDesc('created_at')
                ->get();
        }

        $sessionRentalIds = $this->sessionOwnedIds($request, 'fisik');

        if ($sessionRentalIds !== []) {
            $physicalRentals = PhysicalRental::with('psUnit')
                ->whereIn('id', $sessionRentalIds)
                ->orderByDesc('created_at')
                ->get();
        }

        if ($user) {
            $bookings = $bookings->merge(
                Booking::with('room')
                    ->where('user_id', $user->id)
                    ->orderByDesc('created_at')
                    ->limit(20)
                    ->get(),
            )->unique('id');

            $physicalRentals = $physicalRentals->merge(
                PhysicalRental::with('psUnit')
                    ->where('user_id', $user->id)
                    ->orderByDesc('created_at')
                    ->limit(20)
                    ->get(),
            )->unique('id');

            $membershipPurchases = MembershipPurchase::with('tier')
                ->where('user_id', $user->id)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();
        }

        $bookings = $bookings->sortByDesc('created_at')->values();
        $physicalRentals = $physicalRentals->sortByDesc('created_at')->values();

        return Inertia::render('History', [
            'bookings' => $bookings,
            'physicalRentals' => $physicalRentals,
            'membershipPurchases' => $membershipPurchases,
        ]);
    }

    /**
     * Daftar id record yang tercatat di sesi untuk tipe tertentu.
     * Kunci di sesi berbentuk "tipe:id" (lihat BookingController::rememberOwnedRecord).
     *
     * @return array<int, int>
     */
    private function sessionOwnedIds(Request $request, string $tipe): array
    {
        $prefix = $tipe.':';

        return collect($request->session()->get('my_records', []))
            ->keys()
            ->filter(fn ($key) => str_starts_with((string) $key, $prefix))
            ->map(fn ($key) => (int) substr((string) $key, strlen($prefix)))
            ->all();
    }

    /**
     * Halaman statis Syarat & Ketentuan Sewa Fisik.
     */
    public function terms()
    {
        return Inertia::render('Terms', []);
    }
}
