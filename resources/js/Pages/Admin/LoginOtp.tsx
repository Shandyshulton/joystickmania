import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function AdminLoginOtp({ status }: { status?: string }) {
    const { data, setData, post, processing, errors, transform } = useForm({
        otp: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
        post(route('admin.login.otp.store'), {
            onFinish: () => transform((currentData) => currentData),
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-night-900 bg-neon-grid bg-grid bg-neon-radial px-4 py-8">
            <Head title="OTP Login Admin" />

            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-blue font-display text-2xl font-black text-night-950 shadow-neon-lg">
                    JM
                </span>
                <div>
                    <div className="font-display text-xl font-bold tracking-widest text-white">
                        JOYSTICK<span className="text-neon-cyan">MANIA</span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-cyan">
                        Admin OTP
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-neon-cyan/30 bg-night-800/90 p-6 shadow-neon-sm backdrop-blur-md sm:p-8">
                <h1 className="font-display text-center text-xl font-bold text-white">
                    Verifikasi <span className="text-neon-cyan">Login Admin</span>
                </h1>

                {status && (
                    <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-center text-sm text-neon-green">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-5">
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
                        {processing ? 'Memverifikasi...' : 'Masuk ke Admin Panel'}
                    </PrimaryButton>
                </form>

                <div className="mt-5 border-t border-night-700 pt-4 text-center">
                    <Link href={route('admin.login')} className="text-sm text-slate-400 hover:text-neon-cyan">
                        Kembali ke Login Admin
                    </Link>
                </div>
            </div>
        </div>
    );
}
