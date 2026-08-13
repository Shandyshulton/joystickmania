<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpNotification extends Notification
{
    use Queueable;

    public function __construct(public string $otp)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Kode OTP Reset Password — JoyStickMania')
            ->greeting('Halo ' . ($notifiable->nama ?? '') . '!')
            ->line('Kode OTP untuk mereset password kamu adalah:')
            ->line('**' . $this->otp . '**')
            ->line('Kode berlaku selama **10 menit**. Jangan bagikan kode ini kepada siapa pun.')
            ->line('Jika kamu tidak meminta reset password, abaikan email ini.');
    }
}
