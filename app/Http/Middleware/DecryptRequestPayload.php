<?php

namespace App\Http\Middleware;

use App\Support\RequestPayloadCrypt;
use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class DecryptRequestPayload
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->filled('encrypted_payload')) {
            return $next($request);
        }

        try {
            $request->merge(RequestPayloadCrypt::decrypt((string) $request->input('encrypted_payload')));
            $request->request->remove('encrypted_payload');
        } catch (DecryptException) {
            // Jangan abort(422): Inertia akan menampilkan error mentah dan tombol
            // Simpan terlihat mati. ValidationException membuat Inertia redirect
            // balik dengan pesan error yang bisa dibaca user.
            throw ValidationException::withMessages([
                'encrypted_payload' => 'Payload form tidak valid. Muat ulang halaman lalu coba lagi.',
            ]);
        }

        return $next($request);
    }
}
