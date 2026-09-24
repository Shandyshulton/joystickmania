import AdminLayout from '@/Layouts/AdminLayout';
import AmountInput from '@/Components/AmountInput';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const EMPTY = {
    nama_room: '',
    kapasitas: '2',
    konsol_tersedia: ['PS5'] as string[],
    harga_per_jam: '40000',
    foto: null as File | null,
    fasilitas: '',
    status: 'aktif',
};

export default function AdminRooms({ rooms }: any) {
    const [modal, setModal] = useState<null | 'create' | number>(null);

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-neon-cyan">Rooms</span>
                    </h1>
                    <button onClick={() => setModal('create')} className="btn-neon-solid !py-2 !text-xs">
                        + Tambah Room
                    </button>
                </div>
            }
        >
            <Head title="Admin Rooms" />

            <div className="card-neon overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Foto</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Room</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kapasitas</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Konsol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Harga/Jam</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {rooms.map((r: any) => (
                            <tr key={r.id} className="hover:bg-night-800/50">
                                <td className="px-4 py-3">
                                    {r.foto ? (
                                        <img
                                            src={`/storage/${r.foto}`}
                                            alt={r.nama_room}
                                            className="h-14 w-14 rounded-lg border border-night-600 object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-night-600 bg-night-800 text-xs text-slate-600">
                                            No img
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-200">{r.nama_room}</td>
                                <td className="px-4 py-3 text-slate-400">{r.kapasitas}</td>
                                <td className="px-4 py-3 text-slate-300">{r.konsol_tersedia?.join(', ')}</td>
                                <td className="px-4 py-3 text-neon-cyan">Rp {Number(r.harga_per_jam).toLocaleString('id-ID')}</td>
                                <td className="px-4 py-3">
                                    <span className={`badge-neon border ${r.status === 'aktif' ? 'border-neon-green/40 text-neon-green' : 'border-neon-yellow/40 text-neon-yellow'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setModal(r.id)} className="btn-neon !px-3 !py-1 !text-xs">Edit</button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Hapus room ${r.nama_room}?`)) {
                                                    router.delete(route('admin.rooms.destroy', r.id));
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
                <RoomFormModal
                    room={modal === 'create' ? null : rooms.find((r: any) => r.id === modal)}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}

function RoomFormModal({ room, onClose }: any) {
    const { data, setData, post, patch, processing, errors } = useForm(room ? {
        nama_room: room.nama_room,
        kapasitas: String(room.kapasitas ?? ''),
        konsol_tersedia: room.konsol_tersedia,
        harga_per_jam: String(room.harga_per_jam ?? ''),
        foto: null as File | null,
        fasilitas: room.fasilitas || '',
        status: room.status,
    } : EMPTY);

    const [preview, setPreview] = useState<string | null>(
        room?.foto ? `/storage/${room.foto}` : null,
    );

    const toggleKonsol = (k: string) => {
        const cur = data.konsol_tersedia;
        setData('konsol_tersedia', cur.includes(k) ? cur.filter((x: string) => x !== k) : [...cur, k]);
    };

    const submit = (e: any) => {
        e.preventDefault();
        const options = { onSuccess: onClose, forceFormData: true };
        if (room) {
            patch(route('admin.rooms.update', room.id), options);
        } else {
            post(route('admin.rooms.store'), options);
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
                        {room ? 'Edit Room' : 'Tambah Room'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Tutup">
                        ✕
                    </button>
                </div>
                <div>
                    <label className="label-neon">Nama Room</label>
                    <input value={data.nama_room} onChange={(e) => setData('nama_room', e.target.value)} className="input-neon" required />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Kapasitas</label>
                        <AmountInput
                            suffix="orang"
                            value={data.kapasitas}
                            onValueChange={(value) => setData('kapasitas', value)}
                        />
                        {errors.kapasitas && (
                            <p className="mt-1 text-xs text-neon-red">{errors.kapasitas}</p>
                        )}
                    </div>
                    <div>
                        <label className="label-neon">Harga/Jam</label>
                        <AmountInput
                            prefix="Rp"
                            value={data.harga_per_jam}
                            onValueChange={(value) => setData('harga_per_jam', value)}
                        />
                        {errors.harga_per_jam && (
                            <p className="mt-1 text-xs text-neon-red">{errors.harga_per_jam}</p>
                        )}
                    </div>
                </div>
                <div>
                    <label className="label-neon">Foto Room (opsional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setData('foto', file);
                            if (file) setPreview(URL.createObjectURL(file));
                        }}
                        className="input-neon file:me-3 file:rounded file:border-0 file:bg-neon-blue/20 file:px-3 file:py-1.5 file:font-semibold file:text-neon-cyan"
                    />
                    {preview && (
                        <img src={preview} alt="Preview" className="mt-3 h-32 rounded-lg border border-night-600 object-cover" />
                    )}
                    {errors.foto && <p className="mt-1 text-xs text-neon-red">{errors.foto}</p>}
                </div>
                <div>
                    <label className="label-neon">Konsol Tersedia</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['PS3', 'PS4', 'PS5'].map((k) => (
                            <label key={k} className="flex cursor-pointer items-center gap-1.5 rounded border border-night-600 bg-night-700/40 px-3 py-2 text-sm text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={data.konsol_tersedia.includes(k)}
                                    onChange={() => toggleKonsol(k)}
                                    className="rounded border-night-500 bg-night-700 text-neon-blue focus:ring-neon-blue"
                                />
                                {k}
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="label-neon">Fasilitas</label>
                    <textarea value={data.fasilitas} onChange={(e) => setData('fasilitas', e.target.value)} className="input-neon" rows={2} />
                </div>
                <div>
                    <label className="label-neon">Status</label>
                    <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="input-neon">
                        <option value="aktif">Aktif</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="btn-neon-outline w-full !py-2 !text-xs sm:w-auto">
                        Batal
                    </button>
                    <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs sm:w-auto">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}
