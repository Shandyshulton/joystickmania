<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\PhysicalRental;
use Illuminate\Console\Command;

class ExpirePendingPayments extends Command
{
    /**
     * Jalankan tiap menit via scheduler.
     * Cari booking / rental fisik / purchase membership berstatus PENDING_PAYMENT
     * yang sudah lewat expires_at (30 menit) -> ubah jadi EXPIRED,
     * sehingga slot kembali available untuk user lain.
     */
    protected $signature = 'bookings:expire-pending';

    protected $description = 'Expire semua pending payment yang lewat batas waktu 30 menit';

    public function handle(): int
    {
        $now = now();

        $expiredBookings = Booking::where('booking_status', Booking::STATUS_PENDING)
            ->where('expires_at', '<', $now)
            ->get();

        foreach ($expiredBookings as $booking) {
            $booking->update(['booking_status' => Booking::STATUS_EXPIRED]);
            ActivityLog::create([
                'subject_type' => Booking::class,
                'subject_id' => $booking->id,
                'user_id' => $booking->user_id,
                'action' => 'auto_expired',
                'from_status' => Booking::STATUS_PENDING,
                'to_status' => Booking::STATUS_EXPIRED,
                'catatan' => 'Otomatis expired: pembayaran tidak dikonfirmasi dalam 30 menit.',
            ]);
        }

        $expiredRentals = PhysicalRental::where('booking_status', PhysicalRental::STATUS_PENDING)
            ->where('expires_at', '<', $now)
            ->get();

        foreach ($expiredRentals as $rental) {
            $rental->update(['booking_status' => PhysicalRental::STATUS_EXPIRED]);
            ActivityLog::create([
                'subject_type' => PhysicalRental::class,
                'subject_id' => $rental->id,
                'user_id' => $rental->user_id,
                'action' => 'auto_expired',
                'from_status' => PhysicalRental::STATUS_PENDING,
                'to_status' => PhysicalRental::STATUS_EXPIRED,
                'catatan' => 'Otomatis expired: pembayaran tidak dikonfirmasi dalam 30 menit.',
            ]);
        }

        $expiredPurchases = MembershipPurchase::where('membership_status', MembershipPurchase::STATUS_PENDING)
            ->where('expires_at', '<', $now)
            ->get();

        foreach ($expiredPurchases as $purchase) {
            $purchase->update(['membership_status' => MembershipPurchase::STATUS_EXPIRED]);
            ActivityLog::create([
                'subject_type' => MembershipPurchase::class,
                'subject_id' => $purchase->id,
                'user_id' => $purchase->user_id,
                'action' => 'auto_expired',
                'from_status' => MembershipPurchase::STATUS_PENDING,
                'to_status' => MembershipPurchase::STATUS_EXPIRED,
                'catatan' => 'Otomatis expired: pembayaran membership tidak dikonfirmasi dalam 30 menit.',
            ]);
        }

        $total = $expiredBookings->count() + $expiredRentals->count() + $expiredPurchases->count();
        $this->info("Diprocess: {$total} record expired.");

        return self::SUCCESS;
    }
}
