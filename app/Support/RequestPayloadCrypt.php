<?php

namespace App\Support;

use Illuminate\Contracts\Encryption\DecryptException;

class RequestPayloadCrypt
{
    public static function key(): string
    {
        $configured = config('app.request_payload_key') ?: config('app.key');

        return hash('sha256', (string) $configured, true);
    }

    public static function publicKey(): string
    {
        return rtrim(strtr(base64_encode(self::key()), '+/', '-_'), '=');
    }

    /**
     * @return array<string, mixed>
     */
    public static function decrypt(string $payload): array
    {
        $decoded = json_decode(base64_decode($payload, true) ?: '', true);

        if (! is_array($decoded) || empty($decoded['iv']) || empty($decoded['data']) || empty($decoded['tag'])) {
            throw new DecryptException('Payload terenkripsi tidak valid.');
        }

        $plaintext = openssl_decrypt(
            base64_decode($decoded['data'], true) ?: '',
            'aes-256-gcm',
            self::key(),
            OPENSSL_RAW_DATA,
            base64_decode($decoded['iv'], true) ?: '',
            base64_decode($decoded['tag'], true) ?: ''
        );

        if ($plaintext === false) {
            throw new DecryptException('Payload terenkripsi gagal dibuka.');
        }

        $data = json_decode($plaintext, true);

        if (! is_array($data)) {
            throw new DecryptException('Payload terenkripsi harus berisi object JSON.');
        }

        return $data;
    }

    /**
     * Helper untuk test agar payload persis seperti frontend.
     *
     * @param  array<string, mixed>  $data
     */
    public static function encrypt(array $data): string
    {
        $iv = random_bytes(12);
        $tag = '';
        $ciphertext = openssl_encrypt(
            json_encode($data, JSON_THROW_ON_ERROR),
            'aes-256-gcm',
            self::key(),
            OPENSSL_RAW_DATA,
            $iv,
            $tag
        );

        return base64_encode(json_encode([
            'iv' => base64_encode($iv),
            'data' => base64_encode($ciphertext ?: ''),
            'tag' => base64_encode($tag),
        ], JSON_THROW_ON_ERROR));
    }
}
