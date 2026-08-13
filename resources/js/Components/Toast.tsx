import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

/**
 * Toast global — membaca flash message & validation errors dari props Inertia.
 * - flash.success / flash.error: notifikasi proses
 * - errors (validation): ditampilkan sebagai toast merah juga (pesan pertama)
 */
export default function Toast() {
    const { flash, errors } = usePage().props as any;
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    useEffect(() => {
        // Prioritas: flash success/error, lalu validation error
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        } else if (errors && Object.keys(errors).length > 0) {
            const firstKey = Object.keys(errors)[0];
            setToast({ type: 'error', message: errors[firstKey] });
        } else {
            return;
        }

        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [flash?.success, flash?.error, errors]);

    if (!toast) return null;

    const isSuccess = toast.type === 'success';

    return (
        <div className="pointer-events-none fixed right-4 top-4 z-[100] animate-[fadeIn_.2s_ease-out]">
            <div
                className={`pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 shadow-neon-sm backdrop-blur-md ${
                    isSuccess
                        ? 'border-neon-green/50 bg-night-800/95 text-neon-green'
                        : 'border-neon-red/50 bg-night-800/95 text-neon-red'
                }`}
            >
                <span className="text-sm font-semibold">{toast.message}</span>
                <button
                    onClick={() => setToast(null)}
                    className="ms-1 text-slate-500 transition hover:text-white"
                    aria-label="Tutup"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
