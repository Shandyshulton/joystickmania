import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    status,
}: {
    token: string;
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset, transform } = useForm({
        token: token,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
        post(route('password.store'), {
            onFinish: () => {
                transform((currentData) => currentData);
                reset('password', 'password_confirmation');
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="text-sm text-slate-400">
                OTP valid. Sekarang buat <b className="text-neon-cyan">password baru</b>.
            </div>

            {status && (
                <div className="mt-3 rounded-lg border border-neon-green/40 bg-neon-green/10 p-3 text-sm text-neon-green">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4">
                <div>
                    <InputLabel htmlFor="password" value="Password Baru" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" />
                    <TextInput
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />
                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan Password Baru'}
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
