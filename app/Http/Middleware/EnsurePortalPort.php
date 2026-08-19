<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalPort
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('app.portal_ports.enabled') || app()->runningUnitTests()) {
            return $next($request);
        }

        $userPort = config('app.portal_ports.user');
        $adminPort = config('app.portal_ports.admin');

        if (! $userPort || ! $adminPort) {
            return $next($request);
        }

        $isAdminPath = $request->is('admin') || $request->is('admin/*');
        $targetPort = (int) ($isAdminPath ? $adminPort : $userPort);
        $currentPort = (int) ($request->getPort() ?: ($request->isSecure() ? 443 : 80));

        if ($currentPort === $targetPort) {
            return $next($request);
        }

        return new RedirectResponse($this->withPort($request, $targetPort), 307);
    }

    private function withPort(Request $request, int $port): string
    {
        $uri = $request->getUri();
        $parts = parse_url($uri);
        $scheme = $parts['scheme'] ?? ($request->isSecure() ? 'https' : 'http');
        $host = $parts['host'] ?? $request->getHost();
        $path = $parts['path'] ?? '/';
        $query = isset($parts['query']) ? '?'.$parts['query'] : '';

        return "{$scheme}://{$host}:{$port}{$path}{$query}";
    }
}
