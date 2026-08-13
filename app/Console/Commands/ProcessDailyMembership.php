<?php

namespace App\Console\Commands;

use App\Models\ActivityLog;
use App\Models\MembershipPurchase;
use App\Models\User;
use App\Notifications\MembershipExpiredNotification;
use App\Notifications\MembershipReminderNotification;
use Illuminate\Console\Command;

class ProcessDailyMembership extends Command
{
    /**
     * Job harian membership (spec 7.4):
     * 1. Membership dengan valid_until = besok  -> kirim email reminder H-1 + tandai reminder_h1_sent_at
     * 2. Membership dengan valid_until = hari ini -> set status EXPIRED (tier belum turun, masa tenggang 1 hari)
     * 3. Membership EXPIRED yang sudah lewat valid_until + 1 hari -> turunkan tier ke Bronze + kirim email
     */
    protected $signature = 'membership:process-daily';

    protected $description = 'Proses reminder H-1, expire membership di hari-H, dan auto-downgrade ke Bronze';

    public function handle(): int
    {
        $today = now()->startOfDay();
        $tomorrow = $today->copy()->addDay();
        $graceEnd = $today->copy()->addDay(); // tenggang 1 hari sejak valid_until

        // 1. Reminder H-1 (kirim email sekali, hindari duplikat)
        $reminders = MembershipPurchase::with('user', 'tier')
            ->where('membership_status', MembershipPurchase::STATUS_ACTIVE)
            ->whereNotNull('valid_until')
            ->whereBetween('valid_until', [$tomorrow->copy()->startOfDay(), $tomorrow->copy()->endOfDay()])
            ->whereNull('reminder_h1_sent_at')
            ->get();

        foreach ($reminders as $purchase) {
            if ($purchase->user?->email) {
                $purchase->user->notify(new MembershipReminderNotification($purchase));
            }
            $purchase->update(['reminder_h1_sent_at' => now()]);
            $this->info("Reminder H-1 dikirim untuk purchase #{$purchase->id} ({$purchase->user?->nama})");
        }

        // 2. Expire di hari-H (valid_until = hari ini) — tier belum turun
        $expiringToday = MembershipPurchase::with('user')
            ->where('membership_status', MembershipPurchase::STATUS_ACTIVE)
            ->whereNotNull('valid_until')
            ->whereBetween('valid_until', [$today, $today->copy()->endOfDay()])
            ->get();

        foreach ($expiringToday as $purchase) {
            $purchase->update(['membership_status' => MembershipPurchase::STATUS_EXPIRED]);
            ActivityLog::create([
                'subject_type' => MembershipPurchase::class,
                'subject_id' => $purchase->id,
                'user_id' => $purchase->user_id,
                'action' => 'auto_expired',
                'from_status' => MembershipPurchase::STATUS_ACTIVE,
                'to_status' => MembershipPurchase::STATUS_EXPIRED,
                'catatan' => 'Masa berlaku membership habis hari ini (masa tenggang 1 hari dimulai).',
            ]);
            $this->info("Membership #{$purchase->id} expired hari ini (masa tenggang).");
        }

        // 3. Auto-downgrade ke Bronze setelah lewat 1 hari tenggang + kirim email
        $gracePassed = MembershipPurchase::with('user', 'tier')
            ->where('membership_status', MembershipPurchase::STATUS_EXPIRED)
            ->whereNotNull('valid_until')
            ->where('valid_until', '<', $graceEnd)
            ->whereNull('expired_notif_sent_at')
            ->get();

        foreach ($gracePassed as $purchase) {
            // Turunkan tier user ke Bronze
            if ($purchase->user) {
                $purchase->user->update(['membership_tier' => 'bronze']);
            }

            if ($purchase->user?->email) {
                $purchase->user->notify(new MembershipExpiredNotification($purchase));
            }
            $purchase->update(['expired_notif_sent_at' => now()]);

            ActivityLog::create([
                'subject_type' => MembershipPurchase::class,
                'subject_id' => $purchase->id,
                'user_id' => $purchase->user_id,
                'action' => 'auto_downgrade',
                'from_status' => MembershipPurchase::STATUS_EXPIRED,
                'to_status' => 'bronze',
                'catatan' => 'Tenggang 1 hari lewat, tier user dikembalikan ke Bronze.',
            ]);

            $this->info("User #{$purchase->user_id} downgrade ke Bronze (purchase #{$purchase->id}).");
        }

        return self::SUCCESS;
    }
}
