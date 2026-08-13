<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\PhysicalRental;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminController extends Controller
{
    /**
     * Dashboard admin: ringkasan hari ini, pending payment (prioritas),
     * statistik okupansi & pendapatan.
     */
    public function dashboard()
    {
        $today = now()->toDateString();

        $bookingsToday = Booking::whereDate('tanggal', $today)
            ->whereIn('booking_status', [Booking::STATUS_PENDING, Booking::STATUS_CONFIRMED])
            ->count();

        $rentalsActive = PhysicalRental::where('booking_status', PhysicalRental::STATUS_CONFIRMED)
            ->whereDate('tanggal_kembali', '>=', $today)
            ->count();

        // Pending payment: prioritas (bisa expired 30 menit)
        $pendingBookings = Booking::with('room')
            ->where('booking_status', Booking::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->orderBy('expires_at')
            ->get();

        $pendingRentals = PhysicalRental::with('psUnit')
            ->where('booking_status', PhysicalRental::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->orderBy('expires_at')
            ->get();

        $pendingMemberships = MembershipPurchase::with('user', 'tier')
            ->where('membership_status', MembershipPurchase::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->orderBy('expires_at')
            ->get();

        $revenueToday = Booking::whereDate('tanggal', $today)
            ->where('booking_status', Booking::STATUS_CONFIRMED)
            ->sum('harga_total')
            + PhysicalRental::where('booking_status', PhysicalRental::STATUS_CONFIRMED)
                ->whereDate('tanggal_mulai', $today)
                ->sum('total_biaya');

        $totalMembers = User::count();
        $paidMembers = MembershipPurchase::where('membership_status', MembershipPurchase::STATUS_ACTIVE)
            ->where('valid_until', '>', now())
            ->distinct('user_id')
            ->count('user_id');

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'bookingsToday' => $bookingsToday,
                'rentalsActive' => $rentalsActive,
                'pendingCount' => $pendingBookings->count() + $pendingRentals->count() + $pendingMemberships->count(),
                'revenueToday' => $revenueToday,
                'totalMembers' => $totalMembers,
                'paidMembers' => $paidMembers,
            ],
            'pendingBookings' => $pendingBookings,
            'pendingRentals' => $pendingRentals,
            'pendingMemberships' => $pendingMemberships,
        ]);
    }

    /**
     * List semua booking (filter status/tanggal/jenis).
     */
    public function bookings(Request $request)
    {
        $query = Booking::with('room', 'user', 'activityLogs');

        if ($request->filled('status')) {
            $query->where('booking_status', $request->status);
        }
        if ($request->filled('tanggal')) {
            $query->whereDate('tanggal', $request->tanggal);
        }

        $bookings = $query->orderByDesc('created_at')->get();

        return Inertia::render('Admin/Bookings', [
            'bookings' => $bookings,
            'filters' => $request->only(['status', 'tanggal']),
        ]);
    }

    /**
     * Update manual status booking (payment_method, payment_status, booking_status).
     * Catat perubahan di activity_logs.
     */
    public function updateBooking(Request $request, Booking $booking)
    {
        $data = $request->validate([
            'payment_method' => 'nullable|string|max:100',
            'payment_status' => 'required|in:belum_bayar,sudah_bayar,ditolak',
            'booking_status' => 'required|in:pending_payment,confirmed,expired,cancelled,selesai',
        ]);

        // Konsistensi status: keputusan pembayaran admin menentukan booking status
        // (ditolak -> cancelled; sudah bayar -> confirmed)
        if ($data['payment_status'] === 'ditolak') {
            $data['booking_status'] = 'cancelled';
        } elseif ($data['payment_status'] === 'sudah_bayar' && $data['booking_status'] === 'pending_payment') {
            $data['booking_status'] = 'confirmed';
        }

        $oldStatus = $booking->booking_status;
        $oldPayment = $booking->payment_status;

        $booking->update($data);

        // Audit trail: catat perubahan status
        if ($oldStatus !== $data['booking_status'] || $oldPayment !== $data['payment_status']) {
            ActivityLog::create([
                'subject_type' => Booking::class,
                'subject_id' => $booking->id,
                'user_id' => $request->user()->id,
                'action' => 'admin_update',
                'from_status' => $oldStatus !== $data['booking_status'] ? $oldStatus : null,
                'to_status' => $oldStatus !== $data['booking_status'] ? $data['booking_status'] : null,
                'catatan' => "Payment: {$oldPayment} -> {$data['payment_status']}".($oldStatus !== $data['booking_status'] ? "; Booking: {$oldStatus} -> {$data['booking_status']}" : ''),
            ]);
        }

        return back()->with('success', 'Booking #'.$booking->id.' diperbarui.');
    }

    /**
     * List physical rentals.
     */
    public function rentals(Request $request)
    {
        $query = PhysicalRental::with('psUnit', 'user');

        if ($request->filled('status')) {
            $query->where('booking_status', $request->status);
        }

        return Inertia::render('Admin/Rentals', [
            'rentals' => $query->orderByDesc('created_at')->get(),
            'filters' => $request->only(['status']),
        ]);
    }

    /**
     * Update manual status physical rental.
     */
    public function updateRental(Request $request, PhysicalRental $rental)
    {
        $data = $request->validate([
            'payment_method' => 'nullable|string|max:100',
            'payment_status' => 'required|in:belum_bayar,sudah_bayar,ditolak',
            'booking_status' => 'required|in:pending_payment,confirmed,expired,cancelled,selesai',
            'deposit_status' => 'required|in:ditahan,dikembalikan',
        ]);

        // Konsistensi status: ditolak -> cancelled (deposit tidak relevan);
        // sudah_bayar dari pending -> confirmed
        if ($data['payment_status'] === 'ditolak') {
            $data['booking_status'] = 'cancelled';
            $data['deposit_status'] = 'ditahan';
        } elseif ($data['payment_status'] === 'sudah_bayar' && $data['booking_status'] === 'pending_payment') {
            $data['booking_status'] = 'confirmed';
        }

        $oldStatus = $rental->booking_status;

        $rental->update($data);

        if ($oldStatus !== $data['booking_status']) {
            ActivityLog::create([
                'subject_type' => PhysicalRental::class,
                'subject_id' => $rental->id,
                'user_id' => $request->user()->id,
                'action' => 'admin_update',
                'from_status' => $oldStatus,
                'to_status' => $data['booking_status'],
                'catatan' => 'Update status sewa fisik oleh admin.',
            ]);
        }

        // Saat rental dikonfirmasi, tandai unit disewa
        if ($data['booking_status'] === PhysicalRental::STATUS_CONFIRMED) {
            $rental->psUnit()->update(['status' => 'disewa']);
        }
        // Saat selesai/cancelled/expired, kembalikan unit ke tersedia (jika tidak ada rental lain)
        if (in_array($data['booking_status'], [PhysicalRental::STATUS_SELESAI, PhysicalRental::STATUS_CANCELLED, PhysicalRental::STATUS_EXPIRED])) {
            $unit = $rental->psUnit;
            $hasActive = PhysicalRental::where('ps_unit_id', $unit->id)
                ->where('id', '!=', $rental->id)
                ->whereIn('booking_status', [PhysicalRental::STATUS_PENDING, PhysicalRental::STATUS_CONFIRMED])
                ->exists();
            if (! $hasActive) {
                $unit->update(['status' => 'tersedia']);
            }
        }

        return back()->with('success', 'Sewa fisik #'.$rental->id.' diperbarui.');
    }

    /**
     * List membership purchases & tab "Membership Akan Berakhir" / "Masa Tenggang".
     */
    public function memberships(Request $request)
    {
        $tab = $request->input('tab', 'semua');

        $query = MembershipPurchase::with('user', 'tier');

        if ($tab === 'berakhir') {
            // H-1 s/d hari-H (perlu reminder)
            $query->where('membership_status', MembershipPurchase::STATUS_ACTIVE)
                ->whereNotNull('valid_until')
                ->whereBetween('valid_until', [now()->startOfDay(), now()->addDay()->endOfDay()]);
        } elseif ($tab === 'tenggang') {
            // Expired tapi masih dalam 1 hari tenggang
            $query->where('membership_status', MembershipPurchase::STATUS_EXPIRED)
                ->whereNotNull('valid_until')
                ->where('valid_until', '>=', now()->subDay());
        } elseif ($tab === 'pending') {
            $query->where('membership_status', MembershipPurchase::STATUS_PENDING)
                ->where('expires_at', '>', now());
        } else {
            $query->latest();
        }

        return Inertia::render('Admin/Memberships', [
            'memberships' => $query->orderByDesc('created_at')->get(),
            'tab' => $tab,
            'waAdmin' => config('app.wa_admin_number'),
        ]);
    }

    /**
     * Update manual status membership purchase (konfirmasi bayar -> Active + set tier & valid_until).
     */
    public function updateMembership(Request $request, MembershipPurchase $purchase)
    {
        $data = $request->validate([
            'payment_method' => 'nullable|string|max:100',
            'payment_status' => 'required|in:belum_bayar,sudah_bayar,ditolak',
            'membership_status' => 'required|in:pending_payment,active,expired,cancelled',
        ]);

        // Konsistensi: ditolak -> cancelled; sudah_bayar -> active
        if ($data['payment_status'] === 'ditolak') {
            $data['membership_status'] = 'cancelled';
        } elseif ($data['payment_status'] === 'sudah_bayar' && $data['membership_status'] === 'pending_payment') {
            $data['membership_status'] = MembershipPurchase::STATUS_ACTIVE;
        }

        $oldStatus = $purchase->membership_status;
        $purchase->update($data);

        // Saat dikonfirmasi lunas -> Active, set tier user & valid_until +1 bulan
        if ($data['payment_status'] === 'sudah_bayar' && $data['membership_status'] === MembershipPurchase::STATUS_ACTIVE) {
            $tier = $purchase->tier;
            $purchase->update([
                'valid_until' => now()->addDays(max(1, $tier->masa_berlaku_hari)),
            ]);
            $purchase->user()->update(['membership_tier' => $tier->nama_tier]);
        }

        if ($oldStatus !== $data['membership_status']) {
            ActivityLog::create([
                'subject_type' => MembershipPurchase::class,
                'subject_id' => $purchase->id,
                'user_id' => $request->user()->id,
                'action' => 'admin_update',
                'from_status' => $oldStatus,
                'to_status' => $data['membership_status'],
                'catatan' => 'Update status membership oleh admin.',
            ]);
        }

        return back()->with('success', 'Membership #'.$purchase->id.' diperbarui.');
    }

    /**
     * Daftar user & tier (untuk manajemen member manual).
     */
    public function members()
    {
        return Inertia::render('Admin/Members', [
            'members' => User::where('is_admin', false)
                ->withCount('bookings')
                ->orderBy('nama')
                ->get(),
        ]);
    }

    /**
     * Ubah tier member manual oleh admin.
     */
    public function updateMemberTier(Request $request, User $user)
    {
        $data = $request->validate([
            'membership_tier' => 'required|in:bronze,silver,gold',
        ]);

        $oldTier = $user->membership_tier;
        $user->update(['membership_tier' => $data['membership_tier']]);

        ActivityLog::create([
            'subject_type' => User::class,
            'subject_id' => $user->id,
            'user_id' => $request->user()->id,
            'action' => 'admin_update',
            'from_status' => $oldTier,
            'to_status' => $data['membership_tier'],
            'catatan' => 'Ubah tier member manual oleh admin.',
        ]);

        return back()->with('success', 'Tier '.$user->nama.' diubah ke '.$data['membership_tier'].'.');
    }

    /**
     * Manajemen user & role (hanya super admin).
     */
    public function users()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::orderByRaw(
                "FIELD(role, 'super_admin','admin','staff','user'), nama"
            )->get(),
            'permissionList' => User::PERMISSIONS,
        ]);
    }

    /**
     * Tambah user CMS (role admin/staff) oleh super admin.
     */
    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20|unique:users,no_hp',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin,staff',
        ]);

        User::create([
            'nama' => $data['nama'],
            'no_hp' => $data['no_hp'],
            'email' => $data['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($data['password']),
            'role' => $data['role'],
            'is_admin' => in_array($data['role'], ['super_admin', 'admin']),
        ]);

        return back()->with('success', 'User CMS berhasil ditambahkan.');
    }

    /**
     * Update role & data dasar user CMS.
     */
    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'nama' => 'required|string|max:255',
            'no_hp' => 'required|string|max:20|unique:users,no_hp,'.$user->id,
            'email' => 'required|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|in:super_admin,admin,staff,user',
            'password' => 'nullable|string|min:8',
        ]);

        $fields = [
            'nama' => $data['nama'],
            'no_hp' => $data['no_hp'],
            'email' => $data['email'],
            'role' => $data['role'],
            'is_admin' => in_array($data['role'], ['super_admin', 'admin']),
        ];

        if (! empty($data['password'])) {
            $fields['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
        }

        $user->update($fields);

        return back()->with('success', 'User '.$user->nama.' diperbarui.');
    }

    /**
     * Update checklist permission (khusus role staff; admin & super admin full).
     */
    public function updateUserPermissions(Request $request, User $user)
    {
        $data = $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'in:'.implode(',', array_keys(User::PERMISSIONS)),
        ]);

        $user->update(['permissions' => $data['permissions'] ?? []]);

        return back()->with('success', 'Permission '.$user->nama.' diperbarui.');
    }
}
