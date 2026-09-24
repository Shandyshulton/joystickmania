import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
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
        post(route('login'), {
            onFinish: () => {
                transform((currentData) => currentData);
                reset('password');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk" />

            {status && (
                <div className="mb-4 text-sm font-medium text-neon-green">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
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

                <div className="mt-4">
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

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-slate-400">
                            Ingat saya
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-slate-400 underline hover:text-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-blue"
                        >
                            Lupa password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Masuk
                    </PrimaryButton>
                </div>
            </form>

            <p className="mt-5 text-center text-sm text-slate-400">
                Belum punya akun?{' '}
                <Link
                    href={route('register')}
                    className="font-semibold text-neon-cyan underline hover:text-neon-green"
                >
                    Daftar
                </Link>
            </p>

            <div className="mt-5 border-t border-night-700 pt-4 text-center">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition hover:text-neon-cyan"
                >
                    ← Kembali ke Beranda
                </Link>
            </div>
        </GuestLayout>
    );
}
