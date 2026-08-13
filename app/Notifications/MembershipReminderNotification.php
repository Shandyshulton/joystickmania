<?php

namespace App\Notifications;

use App\Models\MembershipPurchase;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public MembershipPurchase $purchase)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tier = strtoupper($this->purchase->tier->nama_tier ?? 'Member');
        $validUntil = $this->purchase->valid_until
            ? $this->purchase->valid_until->format('d M Y')
            : '-';

        return (new MailMessage)
            ->subject('Membership ' . $tier . ' Anda Akan Berakhir Besok!')
            ->greeting('Halo ' . $notifiable->nama . '!')
            ->line("Membership {$tier} Anda akan berakhir pada {$validUntil}.")
            ->line('Masih ingin lanjut? Hubungi kami via WhatsApp sebelum masa berakhir untuk perpanjangan.')
            ->action('Lihat Membership', url('/membership'))
            ->line('Terima kasih telah menjadi member JoyStickMania!');
    }
}
