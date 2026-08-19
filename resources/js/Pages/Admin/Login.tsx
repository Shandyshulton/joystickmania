import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function AdminLogin({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const payload = await encryptedPayload({
            email: data.email,
            password: data.password,
            remember: data.remember,
        });

        transform(() => payload);
        post(route('admin.login'), {
            onFinish: () => {
                transform((currentData) => currentData);
                reset('password');
            },
        });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-night-900 bg-neon-grid bg-grid bg-neon-radial px-4 py-8">
            <Head title="Login Admin" />

            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon-blue font-display text-2xl font-black text-night-950 shadow-neon-lg">
                    JM
                </span>
                <div>
                    <div className="font-display text-xl font-bold tracking-widest text-white">
                        JOYSTICK<span className="text-neon-cyan">MANIA</span>
                    </div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-cyan">
                        Admin Panel
                    </div>
                </div>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-neon-cyan/30 bg-night-800/90 p-6 shadow-neon-sm backdrop-blur-md sm:p-8">
                <h1 className="font-display text-center text-xl font-bold text-white">
                    Login <span className="text-neon-cyan">Admin / Staff</span>
                </h1>

                {status && (
                    <div className="mt-3 text-center text-sm text-neon-green">{status}</div>
                )}

                <form onSubmit={submit} className="mt-6 space-y-5">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" />
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="h-4 w-4 rounded border-night-500 bg-night-700 text-neon-blue focus:ring-neon-blue"
                        />
                        <span className="ms-2 text-sm text-slate-400">Ingat saya</span>
                    </label>

                    <PrimaryButton className="w-full" disabled={processing}>
                        {processing ? 'Memproses...' : 'Masuk ke Admin Panel'}
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
