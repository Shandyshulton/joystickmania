<?php

namespace App\Http\Middleware;

use App\Support\RequestPayloadCrypt;
use Closure;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Http\Request;
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
            abort(422, 'Payload terenkripsi tidak valid.');
        }

        return $next($request);
    }
}
