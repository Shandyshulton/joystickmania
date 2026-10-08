import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

export default function AdminSettings({ settings }: any) {
    const { data, setData, patch, processing, errors } = useForm({
        alamat: settings.alamat || '',
        jam_operasional: settings.jam_operasional || '',
        no_wa: settings.no_wa || '',
        email: settings.email || '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route('admin.settings.update'), { preserveScroll: true });
    };

    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Pengaturan <span className="text-accent-light">Website</span>
                </h1>
            }
        >
            <Head title="Pengaturan Website" />

            <form onSubmit={submit} className="card-console max-w-2xl space-y-4 p-6">
                <div>
                    <label className="label-console">Alamat</label>
                    <input
                        value={data.alamat}
                        onChange={(e) => setData('alamat', e.target.value)}
                        className="input-console"
                        placeholder="Jl. Contoh No. 1, Kota"
                    />
                    {errors.alamat && <p className="mt-1 text-xs text-danger">{errors.alamat}</p>}
                </div>

                <div>
                    <label className="label-console">Jam Operasional</label>
                    <input
                        value={data.jam_operasional}
                        onChange={(e) => setData('jam_operasional', e.target.value)}
                        className="input-console"
                        placeholder="10.00 - 22.00 WIB"
                    />
                    {errors.jam_operasional && <p className="mt-1 text-xs text-danger">{errors.jam_operasional}</p>}
                </div>

                <div>
                    <label className="label-console">Nomor WhatsApp (format 62...)</label>
                    <input
                        value={data.no_wa}
                        onChange={(e) => setData('no_wa', e.target.value)}
                        className="input-console"
                        placeholder="6281234567890"
                    />
                    {errors.no_wa && <p className="mt-1 text-xs text-danger">{errors.no_wa}</p>}
                </div>

                <div>
                    <label className="label-console">Email (opsional)</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        className="input-console"
                        placeholder="halo@joystickmania.id"
                    />
                    {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
                </div>

                <div className="flex justify-end pt-2">
                    <button type="submit" disabled={processing} className="btn-primary !py-2 !text-xs">
                        Simpan Pengaturan
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}
