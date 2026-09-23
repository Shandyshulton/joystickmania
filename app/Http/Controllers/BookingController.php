<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\MembershipTier;
use App\Models\PhysicalRental;
use App\Models\PsUnit;
use App\Models\Room;
use App\Support\ImageUploader;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Tampilkan form booking room. Dukung prefill dari query (room_id, tanggal).
     */
    public function createRoom(Request $request)
    {
        $rooms = Room::where('status', 'aktif')->get();
        $user = $request->user();

        // Auto-fill data member jika login
        $prefill = $user
            ? ['nama' => $user->nama, 'no_hp' => $user->no_hp]
            : ['nama' => '', 'no_hp' => ''];

        return Inertia::render('Booking/Room', [
            'rooms' => $rooms,
            'prefill' => $prefill,
            'preselectedRoom' => $request->input('room_id'),
            'preselectedTanggal' => $request->input('tanggal'),
            'userTier' => $user?->membership_tier ?? 'bronze',
            'userMembership' => $this->activeMembership($user),
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
        ]);
    }

    /**
     * Proses submit booking room.
     * - Cek slot masih kosong (anti double-booking).
     * - Buat record PENDING_PAYMENT + expires_at = now + 30 menit.
     * - Hitung diskon member (Silver 15% / Gold 20%) otomatis.
     */
    public function storeRoom(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'tanggal' => 'required|date|after_or_equal:today',
            'jam_mulai' => 'required|date_format:H:i',
            'durasi' => 'required|integer|min:1|max:12',
            'room_id' => 'required|exists:rooms,id',
            'konsol' => 'required|in:PS3,PS4,PS5',
            'catatan' => 'nullable|string|max:1000',
        ]);

        $room = Room::findOrFail($data['room_id']);

        if ($room->status !== 'aktif') {
            throw ValidationException::withMessages([
                'room_id' => 'Room ini sedang tidak aktif.',
            ]);
        }

        // Validasi konsol tersedia di room tsb
        if (! in_array($data['konsol'], $room->konsol_tersedia ?? [])) {
            throw ValidationException::withMessages([
                'konsol' => 'Konsol tidak tersedia di room ini.',
            ]);
        }

        $jamMulai = (int) substr($data['jam_mulai'], 0, 2);
        $jamSelesai = $jamMulai + (int) $data['durasi'];

        // --- Cek slot kosong (anti double-booking) ---
        // Booking yang masih mengunci slot: pending_payment / confirmed
        $bentrok = Booking::where('room_id', $data['room_id'])
            ->whereDate('tanggal', $data['tanggal'])
            ->whereIn('booking_status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
            ->get()
            ->contains(function ($b) use ($jamMulai, $jamSelesai) {
                $bMulai = (int) \Carbon\Carbon::parse($b->jam_mulai)->format('H');
                $bSelesai = $bMulai + (int) $b->durasi;
                return $jamMulai < $bSelesai && $jamSelesai > $bMulai;
            });

        if ($bentrok) {
            throw ValidationException::withMessages([
                'jam_mulai' => 'Slot jam tersebut sudah dipesan. Silakan pilih jam lain.',
            ]);
        }

        // --- Hitung harga & diskon member ---
        $hargaPerJam = $room->harga_per_jam;
        $diskonPersen = 0;
        $user = $request->user();

        if ($user && $this->activeMembership($user)) {
            $diskonPersen = $this->activeMembership($user)->tier->diskon_persen ?? 0;
        }

        $subtotal = $hargaPerJam * (int) $data['durasi'];
        $hargaTotal = (int) round($subtotal * (1 - $diskonPersen / 100));

        $booking = DB::transaction(function () use ($data, $room, $hargaTotal, $diskonPersen) {
            return Booking::create([
                'user_id' => auth()->id(),
                'room_id' => $room->id,
                'konsol' => $data['konsol'],
                'tanggal' => $data['tanggal'],
                'jam_mulai' => $data['jam_mulai'],
                'durasi' => $data['durasi'],
                'harga_total' => $hargaTotal,
                'diskon_persen' => $diskonPersen,
                'nama' => $data['nama'],
                'no_hp' => $data['no_hp'],
                'catatan' => $data['catatan'] ?? null,
                'booking_status' => Booking::STATUS_PENDING,
                'payment_status' => 'belum_bayar',
                // Lock slot 30 menit; jika lewat, command akan ubah jadi EXPIRED
                'expires_at' => now()->addMinutes(30),
            ]);
        });

        ActivityLog::create([
            'subject_type' => Booking::class,
            'subject_id' => $booking->id,
            'user_id' => auth()->id(),
            'action' => 'created',
            'to_status' => Booking::STATUS_PENDING,
            'catatan' => 'Booking room dibuat (pending payment 30 menit).',
        ]);

        $this->rememberOwnedRecord($request, 'room', $booking->id);

        return Inertia::render('Booking/Success', [
            'booking' => $booking->load('room'),
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
            'tipe' => 'room',
        ]);
    }

    /**
     * Tampilkan form booking fisik (sewa unit dibawa pulang).
     */
    public function createPhysical(Request $request)
    {
        // Hanya unit tersedia
        $units = PsUnit::where('status', 'tersedia')
            ->with(['physicalRentals' => fn ($q) => $q->whereIn('booking_status', [
                PhysicalRental::STATUS_PENDING,
                PhysicalRental::STATUS_CONFIRMED,
            ])])
            ->get();

        $user = $request->user();
        $prefill = $user
            ? ['nama' => $user->nama, 'no_hp' => $user->no_hp]
            : ['nama' => '', 'no_hp' => ''];

        return Inertia::render('Booking/Physical', [
            'units' => $units,
            'prefill' => $prefill,
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
        ]);
    }

    /**
     * Proses submit booking fisik.
     * - Validasi durasi 1-7 hari.
     * - Upload foto KTP wajib.
     * - Cek unit tidak sedang disewa (pending/confirmed) di rentang tanggal.
     * - Buat PENDING_PAYMENT + expires_at 30 menit.
     */
    public function storePhysical(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20',
            'alamat' => 'required|string|max:500',
            'ps_unit_id' => 'required|exists:ps_units,id',
            'tanggal_mulai' => 'required|date|after_or_equal:today',
            'tanggal_kembali' => 'required|date|after_or_equal:tanggal_mulai',
            'foto_ktp' => 'required|image|mimes:jpg,jpeg,png|max:5120',
            'catatan' => 'nullable|string|max:1000',
            // Wajib setuju T&C sebelum submit
            'setuju_tnc' => 'required|accepted',
        ]);

        $unit = PsUnit::findOrFail($data['ps_unit_id']);

        if ($unit->status !== 'tersedia') {
            throw ValidationException::withMessages([
                'ps_unit_id' => 'Unit ini sedang tidak tersedia.',
            ]);
        }

        // Durasi minimal 1 hari, maksimal 7 hari
        $mulai = \Carbon\Carbon::parse($data['tanggal_mulai']);
        $kembali = \Carbon\Carbon::parse($data['tanggal_kembali']);
        $hariSewa = $mulai->diffInDays($kembali) + 1;

        if ($hariSewa < 1 || $hariSewa > 7) {
            throw ValidationException::withMessages([
                'tanggal_kembali' => 'Durasi sewa minimal 1 hari dan maksimal 7 hari.',
            ]);
        }

        // Cek bentrok dengan sewa lain pada unit tsb (pending/confirmed)
        $bentrok = PhysicalRental::where('ps_unit_id', $unit->id)
            ->whereIn('booking_status', [PhysicalRental::STATUS_PENDING, PhysicalRental::STATUS_CONFIRMED])
            ->where(function ($q) use ($data) {
                // Overlap rentang tanggal
                $q->whereBetween('tanggal_mulai', [$data['tanggal_mulai'], $data['tanggal_kembali']])
                    ->orWhereBetween('tanggal_kembali', [$data['tanggal_mulai'], $data['tanggal_kembali']]);
            })
            ->exists();

        if ($bentrok) {
            throw ValidationException::withMessages([
                'ps_unit_id' => 'Unit ini sudah disewa pada rentang tanggal tersebut.',
            ]);
        }

        // Upload KTP ke PRIVATE disk (tidak bisa diakses web langsung).
        // Nama file custom + auto resize jika > 3MB. Path di DB terenkripsi.
        $fotoPath = ImageUploader::store($request->file('foto_ktp'), 'ktp', null, 'local');

        $totalBiaya = $unit->harga_sewa * $hariSewa;

        $rental = DB::transaction(function () use ($data, $unit, $fotoPath, $totalBiaya, $hariSewa) {
            return PhysicalRental::create([
                'user_id' => auth()->id(),
                'ps_unit_id' => $unit->id,
                'tanggal_mulai' => $data['tanggal_mulai'],
                'tanggal_kembali' => $data['tanggal_kembali'],
                'total_biaya' => $totalBiaya,
                'nama' => $data['nama'],
                'no_hp' => $data['no_hp'],
                'alamat' => $data['alamat'],
                'foto_ktp' => $fotoPath,
                'nominal_deposit' => $unit->nominal_deposit,
                'booking_status' => PhysicalRental::STATUS_PENDING,
                'payment_status' => 'belum_bayar',
                'expires_at' => now()->addMinutes(30),
            ]);
        });

        ActivityLog::create([
            'subject_type' => PhysicalRental::class,
            'subject_id' => $rental->id,
            'user_id' => auth()->id(),
            'action' => 'created',
            'to_status' => PhysicalRental::STATUS_PENDING,
            'catatan' => 'Booking fisik dibuat (pending payment 30 menit). Deposit '.number_format($unit->nominal_deposit, 0, ',', '.').'.',
        ]);

        $this->rememberOwnedRecord($request, 'fisik', $rental->id);

        return Inertia::render('Booking/Success', [
            'booking' => $rental->load('psUnit'),
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
            'tipe' => 'fisik',
        ]);
    }

    /**
     * Tampilkan halaman beli/upgrade membership (wajib login, route auth).
     */
    public function buyMembership(Request $request, $tierId)
    {
        $tier = MembershipTier::findOrFail($tierId);

        if ($tier->harga_paket <= 0) {
            return redirect()->route('membership');
        }

        return Inertia::render('Membership/Buy', [
            'tier' => $tier,
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
        ]);
    }

    /**
     * Proses pembelian membership: PENDING_PAYMENT + expires 30 menit.
     */
    public function storeMembership(Request $request, $tierId)
    {
        $tier = MembershipTier::findOrFail($tierId);

        $purchase = MembershipPurchase::create([
            'user_id' => $request->user()->id,
            'tier_id' => $tier->id,
            'harga_paket' => $tier->harga_paket,
            'membership_status' => MembershipPurchase::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->addMinutes(30),
        ]);

        ActivityLog::create([
            'subject_type' => MembershipPurchase::class,
            'subject_id' => $purchase->id,
            'user_id' => $request->user()->id,
            'action' => 'created',
            'to_status' => MembershipPurchase::STATUS_PENDING,
            'catatan' => "Pembelian membership {$tier->nama_tier} dibuat (pending 30 menit).",
        ]);

        $this->rememberOwnedRecord($request, 'membership', $purchase->id);

        return Inertia::render('Booking/Success', [
            'booking' => $purchase->load('tier'),
            'waAdmin' => \App\Models\Setting::get('no_wa', config('app.wa_admin_number')),
            'tipe' => 'membership',
        ]);
    }

    /**
     * Ambil membership aktif user (tier berbayar yang valid_until masih depan).
     */
    protected function activeMembership($user): ?MembershipPurchase
    {
        if (! $user) {
            return null;
        }

        return MembershipPurchase::with('tier')
            ->where('user_id', $user->id)
            ->where('membership_status', MembershipPurchase::STATUS_ACTIVE)
            ->where('valid_until', '>', now())
            ->latest()
            ->first();
    }

    /**
     * Polling status booking untuk halaman sukses.
     * Dipanggil halaman Success tiap beberapa detik untuk deteksi
     * admin sudah accept (confirmed) atau booking expired.
     */
    public function status(Request $request)
    {
        $request->validate([
            'tipe' => 'required|in:room,fisik,membership',
            'id' => 'required|integer',
        ]);

        if (! $this->canSeeStatus($request, $request->tipe, (int) $request->id)) {
            abort(403);
        }

        $status = match ($request->tipe) {
            'room' => Booking::where('id', $request->id)->value('booking_status'),
            'fisik' => PhysicalRental::where('id', $request->id)->value('booking_status'),
            'membership' => MembershipPurchase::where('id', $request->id)->value('membership_status'),
        };

        return response()->json(['status' => $status]);
    }

    /**
     * Catat record yang baru dibuat ke sesi, supaya halaman sukses (sesi yang sama)
     * tetap bisa polling statusnya.
     */
    private function rememberOwnedRecord(Request $request, string $tipe, int $id): void
    {
        $owned = $request->session()->get('my_records', []);
        $owned["{$tipe}:{$id}"] = true;

        $request->session()->put('my_records', $owned);
    }

    /**
     * Hanya pemilik record yang boleh melihat statusnya: sesi saat booking dibuat,
     * atau user yang login dan record-nya memang milik dia.
     */
    private function canSeeStatus(Request $request, string $tipe, int $id): bool
    {
        if ($request->session()->get("my_records.{$tipe}:{$id}")) {
            return true;
        }

        $user = $request->user();

        if (! $user) {
            return false;
        }

        return match ($tipe) {
            'room' => Booking::where('id', $id)->where('user_id', $user->id)->exists(),
            'fisik' => PhysicalRental::where('id', $id)->where('user_id', $user->id)->exists(),
            'membership' => MembershipPurchase::where('id', $id)->where('user_id', $user->id)->exists(),
        };
    }
}
