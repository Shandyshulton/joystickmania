import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama: '',
        no_hp: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Daftar" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="nama" value="Nama Lengkap" />

                    <TextInput
                        id="nama"
                        name="nama"
                        value={data.nama}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('nama', e.target.value)}
                        required
                    />

                    <InputError message={errors.nama} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="no_hp" value="No. HP / WhatsApp" />

                    <TextInput
                        id="no_hp"
                        name="no_hp"
                        value={data.no_hp}
                        className="mt-1 block w-full"
                        placeholder="08xxxxxxxxxx"
                        onChange={(e) => setData('no_hp', e.target.value)}
                        required
                    />

                    <InputError message={errors.no_hp} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Konfirmasi Password"
                    />

                    <TextInput
                        id="password_confirmation"
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

                <p className="mt-4 rounded-lg border border-neon-cyan/20 bg-neon-blue/5 p-3 text-xs text-slate-400">
                    Setiap akun baru otomatis mendapat membership{' '}
                    <span className="font-bold text-neon-cyan">Bronze (gratis)</span>.
                </p>

                <div className="mt-4 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="rounded-md text-sm text-slate-400 underline hover:text-neon-cyan focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    >
                        Sudah punya akun?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Daftar
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
