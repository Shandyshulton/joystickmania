import PrimaryButton from '@/Components/PrimaryButton';
import { Link } from '@inertiajs/react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    return (
        <section className={className}>
            <header>
                <h2 className="font-display text-lg font-bold text-white">
                    Reset Password
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                    Ganti password lewat kode OTP email. Tidak perlu memasukkan password lama.
                </p>
            </header>

            <div className="mt-6">
                <Link href={route('password.request')}>
                    <PrimaryButton type="button">
                        Reset Password via OTP
                    </PrimaryButton>
                </Link>
            </div>
        </section>
    );
}
