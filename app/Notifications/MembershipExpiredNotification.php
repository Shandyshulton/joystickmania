<?php

namespace App\Notifications;

use App\Models\MembershipPurchase;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipExpiredNotification extends Notification
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

        return (new MailMessage)
            ->subject('Membership ' . $tier . ' Anda Telah Berakhir')
            ->greeting('Halo ' . $notifiable->nama . '!')
            ->line("Membership {$tier} Anda telah berakhir dan tier akun dikembalikan ke Bronze.")
            ->line('Anda bisa membeli kembali paket membership kapan saja untuk menikmati diskon & benefit eksklusif.')
            ->action('Upgrade Membership', url('/membership'))
            ->line('Terima kasih telah menjadi member JoyStickMania!');
    }
}
