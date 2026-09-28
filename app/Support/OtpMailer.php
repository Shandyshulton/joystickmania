<?php

namespace App\Support;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Throwable;

/**
 * Mengirim notifikasi OTP tanpa membiarkan mailer yang rusak menjatuhkan login.
 *
 * Kenapa perlu: OTP dikirim SUDAH di dalam alur login/reset password, dan
 * QUEUE_CONNECTION=sync di shared hosting ini berarti emailnya disentuh inline.
 * Begitu Gmail menolak (534-5.7.9 WebLoginRequired), TransportException naik dan
 * POST /admin/login berbalik 500 — padahal password adminnya benar. Efeknya bukan
 * cuma issue di Sentry: seluruh admin terkunci sampai SMTP diperbaiki.
 *
 * Yang terjadi saat kirim gagal: sebabnya dicatat sudah diredaksi (pesan
 * TransportException Gmail selalu memuat alamat SMTP di dalamnya), satu alert
 * infra dikirim dengan dedupe, lalu false dikembalikan supaya pemanggil bisa
 * membersihkan state OTP miliknya dan menampilkan pesan yang masuk akal.
 *
 * Hanya kegagalan transport email yang ditelan. Exception lain — bug di dalam
 * notification, view tidak ada, dsb — tetap dibiarkan naik, karena menyembunyikan
 * itu jauh lebih mahal daripada satu crash.
 */
class OtpMailer
{
    public static function send(Admin|User $notifiable, object $notification): bool
    {
        try {
            $notifiable->notify($notification);

            return true;
        } catch (TransportExceptionInterface $e) {
            self::record($e);

            return false;
        }
    }

    /**
     * Sengaja tidak memanggil report(): exception-nya sudah ditangani di sini,
     * dan lewat handler ia akan muncul dua kali (Sentry issue + alert crash
     * Telegram) untuk satu gangguan mail yang sama.
     */
    private static function record(Throwable $e): void
    {
        $reason = SensitiveData::redact($e->getMessage());

        try {
            Log::withContext(['alert' => 'mail'])
                ->error('Email OTP gagal dikirim: '.$reason);
        } catch (Throwable) {
            // Log bisa gagal (disk penuh) dan itu tidak boleh menggagalkan login.
        }

        TelegramAlert::send(
            TelegramAlert::INFRA,
            'infra:mail:otp',
            sprintf('[infra] Email OTP gagal via mailer "%s": %s', config('mail.default'), $reason),
        );
    }
}
