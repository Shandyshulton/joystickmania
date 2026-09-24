import AdminLayout from '@/Layouts/AdminLayout';
import AmountInput from '@/Components/AmountInput';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = {
    kode_unit: '',
    jenis_konsol: 'PS5',
    kondisi: 'Baik',
    status: 'tersedia',
    harga_sewa: '100000',
    nominal_deposit: '1200000',
};

export default function AdminUnits({ units }: any) {
    const [modal, setModal] = useState<null | 'create' | number>(null);

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-neon-cyan">Unit PS</span>
                    </h1>
                    <button onClick={() => setModal('create')} className="btn-neon-solid !py-2 !text-xs">
                        + Tambah Unit
                    </button>
                </div>
            }
        >
            <Head title="Admin Unit PS" />

            <div className="card-neon overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kode</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kondisi</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sewa/Hari</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deposit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {units.map((u: any) => (
                            <tr key={u.id} className="hover:bg-night-800/50">
                                <td className="px-4 py-3 font-mono font-bold text-neon-cyan">{u.kode_unit}</td>
                                <td className="px-4 py-3 text-slate-300">{u.jenis_konsol}</td>
                                <td className="px-4 py-3 text-slate-400">{u.kondisi}</td>
                                <td className="px-4 py-3 text-slate-300">Rp {Number(u.harga_sewa).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3 text-neon-yellow">Rp {Number(u.nominal_deposit).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3">
                                    <span className={`badge-neon border ${
                                        u.status === 'tersedia' ? 'border-neon-green/40 text-neon-green'
                                        : u.status === 'disewa' ? 'border-neon-yellow/40 text-neon-yellow'
                                        : 'border-neon-red/40 text-neon-red'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setModal(u.id)} className="btn-neon !px-3 !py-1 !text-xs">Edit</button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Hapus unit ${u.kode_unit}?`)) {
                                                    router.delete(route('admin.units.destroy', u.id));
                                                }
                                            }}
                                            className="btn-neon-outline !px-3 !py-1 !text-xs !text-neon-red !ring-neon-red/40"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal !== null && (
                <UnitFormModal
                    unit={modal === 'create' ? null : units.find((u: any) => u.id === modal)}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}

function UnitFormModal({ unit, onClose }: any) {
    const { data, setData, post, patch, processing, errors } = useForm(unit ? {
        kode_unit: unit.kode_unit,
        jenis_konsol: unit.jenis_konsol,
        kondisi: unit.kondisi || '',
        status: unit.status,
        harga_sewa: String(unit.harga_sewa ?? ''),
        nominal_deposit: String(unit.nominal_deposit ?? ''),
    } : EMPTY);

    const submit = (e: any) => {
        e.preventDefault();
        if (unit) {
            patch(route('admin.units.update', unit.id), { onSuccess: onClose });
        } else {
            post(route('admin.units.store'), { onSuccess: onClose });
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
                        {unit ? 'Edit Unit' : 'Tambah Unit'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Tutup">
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Kode Unit</label>
                        <input value={data.kode_unit} onChange={(e) => setData('kode_unit', e.target.value)} className="input-neon" placeholder="PS5-03" required />
                    </div>
                    <div>
                        <label className="label-neon">Jenis Konsol</label>
                        <select value={data.jenis_konsol} onChange={(e) => setData('jenis_konsol', e.target.value)} className="input-neon">
                            <option value="PS3">PS3</option>
                            <option value="PS4">PS4</option>
                            <option value="PS5">PS5</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Kondisi</label>
                        <input value={data.kondisi} onChange={(e) => setData('kondisi', e.target.value)} className="input-neon" placeholder="Baik / Seperti baru" />
                    </div>
                    <div>
                        <label className="label-neon">Status</label>
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="input-neon">
                            <option value="tersedia">Tersedia</option>
                            <option value="disewa">Disewa</option>
                            <option value="servis">Servis</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Harga Sewa/Hari</label>
                        <AmountInput
                            prefix="Rp"
                            value={data.harga_sewa}
                            onValueChange={(value) => setData('harga_sewa', value)}
                        />
                        {errors.harga_sewa && (
                            <p className="mt-1 text-xs text-neon-red">{errors.harga_sewa}</p>
                        )}
                    </div>
                    <div>
                        <label className="label-neon">Deposit</label>
                        <AmountInput
                            prefix="Rp"
                            value={data.nominal_deposit}
                            onValueChange={(value) => setData('nominal_deposit', value)}
                        />
                        {errors.nominal_deposit && (
                            <p className="mt-1 text-xs text-neon-red">{errors.nominal_deposit}</p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="btn-neon-outline w-full !py-2 !text-xs sm:w-auto">Batal</button>
                    <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs sm:w-auto">Simpan</button>
                </div>
            </form>
        </div>
    );
}
