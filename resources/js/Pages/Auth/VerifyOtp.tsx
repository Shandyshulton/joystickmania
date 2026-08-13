import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyOtp({
    email,
    status,
}: {
    email?: string;
    status?: string;
}) {
    const { data, setData, post, processing, errors } = useForm({
        email: email || '',
        otp: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.verify.store'));
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi OTP" />

            <div className="text-sm text-slate-400">
                Masukkan <b className="text-neon-cyan">kode OTP 6 digit</b> yang
                dikirim ke email kamu. Kode berlaku 10 menit.
            </div>

            {status && (
                <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="otp" value="Kode OTP" />
                    <TextInput
                        id="otp"
                        type="text"
                        name="otp"
                        value={data.otp}
                        className="mt-1 block w-full text-center font-mono text-2xl tracking-[0.5em]"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="••••••"
                        isFocused={true}
                        onChange={(e) =>
                            setData('otp', e.target.value.replace(/\D/g, ''))
                        }
                        required
                    />
                    <InputError message={errors.otp} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Memverifikasi...' : 'Verifikasi OTP'}
                </PrimaryButton>
            </form>

            <div className="mt-5 space-y-1 border-t border-night-700 pt-4 text-center text-sm">
                <Link
                    href={route('password.request')}
                    className="block text-slate-400 hover:text-neon-cyan"
                >
                    Kirim ulang OTP
                </Link>
                <Link href="/login" className="block text-slate-500 hover:text-neon-cyan">
                    ← Kembali ke Login
                </Link>
            </div>
        </GuestLayout>
    );
}
