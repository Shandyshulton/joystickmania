import Toast from '@/Components/Toast';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-night-900 bg-neon-grid bg-grid bg-neon-radial px-4 pt-6 sm:justify-center sm:pt-0">
            <Link href="/" className="mb-6 flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded bg-neon-blue font-display text-xl font-black text-night-950 shadow-neon">
                    JM
                </span>
                <span className="font-display text-xl font-bold tracking-widest text-white">
                    JOYSTICK<span className="text-neon-cyan">MANIA</span>
                </span>
            </Link>

            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-night-600 bg-night-800/90 p-6 shadow-neon-sm backdrop-blur-md sm:p-8">
                {children}
            </div>

            <Toast />
        </div>
    );
}
