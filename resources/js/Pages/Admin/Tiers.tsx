import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminTiers({ tiers }: any) {
    const [modal, setModal] = useState<null | 'create' | number>(null);

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-neon-cyan">Membership Tier</span>
                    </h1>
                    <button onClick={() => setModal('create')} className="btn-neon-solid !py-2 !text-xs">
                        + Tambah Tier
                    </button>
                </div>
            }
        >
            <Head title="Admin Tier" />

            <div className="card-neon overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tier</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Harga</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Berlaku</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Diskon</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {tiers.map((t: any) => (
                            <tr key={t.id} className="hover:bg-night-800/50">
                                <td className="px-4 py-3 font-display font-bold uppercase tracking-widest text-white">{t.nama_tier}</td>
                                <td className="px-4 py-3 text-neon-cyan">
                                    {t.harga_paket === 0 ? 'Gratis' : `Rp ${Number(t.harga_paket).toLocaleString('id-ID')}`}
                                </td>
                                <td className="px-4 py-3 text-slate-300">{t.masa_berlaku_hari} hari</td>
                                <td className="px-4 py-3 text-neon-green">{t.diskon_persen}%</td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setModal(t.id)} className="btn-neon !px-3 !py-1 !text-xs">Edit</button>
                                        {t.nama_tier !== 'bronze' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Hapus tier ${t.nama_tier}?`)) {
                                                        router.delete(route('admin.tiers.destroy', t.id));
                                                    }
                                                }}
                                                className="btn-neon-outline !px-3 !py-1 !text-xs !text-neon-red !ring-neon-red/40"
                                            >
                                                Hapus
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal !== null && (
                <TierFormModal
                    tier={modal === 'create' ? null : tiers.find((t: any) => t.id === modal)}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}

function TierFormModal({ tier, onClose }: any) {
    const { data, setData, post, patch, processing } = useForm(tier ? {
        nama_tier: tier.nama_tier,
        harga_paket: tier.harga_paket,
        masa_berlaku_hari: tier.masa_berlaku_hari,
        diskon_persen: tier.diskon_persen,
        benefit_lain: tier.benefit_lain || '',
    } : {
        nama_tier: '',
        harga_paket: 100000,
        masa_berlaku_hari: 30,
        diskon_persen: 10,
        benefit_lain: '',
    });

    const submit = (e: any) => {
        e.preventDefault();
        if (tier) {
            patch(route('admin.tiers.update', tier.id), { onSuccess: onClose });
        } else {
            post(route('admin.tiers.store'), { onSuccess: onClose });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
            <form
                onClick={(e) => e.stopPropagation()}
                onSubmit={submit}
                className="card-neon max-h-[92dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-b-none p-5 sm:rounded-b-xl sm:p-6"
            >
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-white">
                        {tier ? 'Edit Tier' : 'Tambah Tier'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Tutup">
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Nama Tier</label>
                        <input value={data.nama_tier} onChange={(e) => setData('nama_tier', e.target.value)} className="input-neon" required />
                    </div>
                    <div>
                        <label className="label-neon">Harga Paket (Rp)</label>
                        <input type="number" min={0} value={data.harga_paket} onChange={(e) => setData('harga_paket', Number(e.target.value))} className="input-neon" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Masa Berlaku (hari)</label>
                        <input type="number" min={0} value={data.masa_berlaku_hari} onChange={(e) => setData('masa_berlaku_hari', Number(e.target.value))} className="input-neon" />
                    </div>
                    <div>
                        <label className="label-neon">Diskon (%)</label>
                        <input type="number" min={0} max={100} value={data.diskon_persen} onChange={(e) => setData('diskon_persen', Number(e.target.value))} className="input-neon" />
                    </div>
                </div>
                <div>
                    <label className="label-neon">Benefit Lain</label>
                    <textarea value={data.benefit_lain} onChange={(e) => setData('benefit_lain', e.target.value)} className="input-neon" rows={2} />
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="btn-neon-outline w-full !py-2 !text-xs sm:w-auto">Batal</button>
                    <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs sm:w-auto">Simpan</button>
                </div>
            </form>
        </div>
    );
}
