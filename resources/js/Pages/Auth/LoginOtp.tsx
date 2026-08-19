import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function LoginOtp({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        otp: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
        post(route('login.otp.store'), {
            onFinish: () => transform((currentData) => currentData),
        });
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Login" />

            <div className="text-sm text-slate-400">
                Masukkan kode OTP 6 digit yang dikirim ke email kamu untuk menyelesaikan login.
            </div>

            {status && (
                <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                    <InputLabel htmlFor="otp" value="Kode OTP Login" />
                    <TextInput
                        id="otp"
                        type="text"
                        name="otp"
                        value={data.otp}
                        className="mt-1 block w-full text-center font-mono text-2xl tracking-[0.5em]"
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="------"
                        isFocused={true}
                        onChange={(e) => setData('otp', e.target.value.replace(/\D/g, ''))}
                        required
                    />
                    <InputError message={errors.otp} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Memverifikasi...' : 'Masuk'}
                </PrimaryButton>
            </form>

            <div className="mt-5 border-t border-night-700 pt-4 text-center">
                <Link href="/login" className="text-sm text-slate-400 hover:text-neon-cyan">
                    Kembali ke Login
                </Link>
            </div>
        </GuestLayout>
    );
}
