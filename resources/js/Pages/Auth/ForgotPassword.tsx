import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status, email = '' }: { status?: string; email?: string }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        email,
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
        post(route('password.email'), {
            onFinish: () => transform((currentData) => currentData),
        });
    };

    return (
        <GuestLayout>
            <Head title="Lupa Password" />

            <div className="text-sm text-slate-400">
                Lupa password? Masukkan email kamu, kami akan mengirim{' '}
                <b className="text-neon-cyan">kode OTP 6 digit</b> untuk mereset
                password.
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
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Mengirim...' : 'Kirim Kode OTP'}
                </PrimaryButton>
            </form>

            <div className="mt-5 border-t border-night-700 pt-4 text-center">
                <Link href="/login" className="text-sm text-slate-400 hover:text-neon-cyan">
                    ← Kembali ke Login
                </Link>
            </div>
        </GuestLayout>
    );
}
