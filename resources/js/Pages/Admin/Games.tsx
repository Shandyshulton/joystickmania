import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function AdminGames({ games }: any) {
    const [modal, setModal] = useState<null | 'create' | number>(null);
    const [filterKonsol, setFilterKonsol] = useState('');

    const filtered = filterKonsol
        ? games.filter((g: any) => g.jenis_konsol === filterKonsol)
        : games;

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-neon-cyan">Game</span>
                    </h1>
                    <button onClick={() => setModal('create')} className="btn-neon-solid !py-2 !text-xs">
                        + Tambah Game
                    </button>
                </div>
            }
        >
            <Head title="Admin Game" />

            {/* Filter konsol */}
            <div className="card-neon grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="label-neon">Filter Konsol</label>
                    <select
                        value={filterKonsol}
                        onChange={(e) => setFilterKonsol(e.target.value)}
                        className="input-neon"
                    >
                        <option value="">Semua Konsol</option>
                        <option value="PS3">PS3</option>
                        <option value="PS4">PS4</option>
                        <option value="PS5">PS5</option>
                    </select>
                </div>
            </div>

            <div className="card-neon mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Gambar</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama Game</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Konsol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deskripsi</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {filtered.map((g: any) => (
                            <tr key={g.id} className="hover:bg-night-800/50">
                                <td className="px-4 py-3">
                                    {g.gambar ? (
                                        <img
                                            src={`/storage/${g.gambar}`}
                                            alt={g.nama_game}
                                            className="h-14 w-14 rounded-lg border border-night-600 object-cover"
                                        />
                                    ) : (
                                        <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-night-600 bg-night-800 text-xs text-slate-600">
                                            No img
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-semibold text-slate-200">{g.nama_game}</td>
                                <td className="px-4 py-3">
                                    <span className="badge-neon border border-neon-blue/40 bg-neon-blue/10 text-neon-cyan">
                                        {g.jenis_konsol}
                                    </span>
                                </td>
                                <td className="max-w-[250px] truncate px-4 py-3 text-slate-400" title={g.deskripsi}>
                                    {g.deskripsi || '-'}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`badge-neon border ${
                                        g.status === 'aktif'
                                            ? 'border-neon-green/40 text-neon-green'
                                            : 'border-slate-500/40 text-slate-400'
                                    }`}>
                                        {g.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <button onClick={() => setModal(g.id)} className="btn-neon !px-3 !py-1 !text-xs">Edit</button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Hapus game ${g.nama_game}?`)) {
                                                    router.delete(route('admin.games.destroy', g.id));
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

                {filtered.length === 0 && (
                    <div className="p-8 text-center text-slate-500">Belum ada game.</div>
                )}
            </div>

            {modal !== null && (
                <GameFormModal
                    game={modal === 'create' ? null : games.find((g: any) => g.id === modal)}
                    onClose={() => setModal(null)}
                />
            )}
        </AdminLayout>
    );
}

function GameFormModal({ game, onClose }: any) {
    const { data, setData, post, processing, errors, transform } = useForm({
        nama_game: game?.nama_game || '',
        jenis_konsol: game?.jenis_konsol || 'PS5',
        gambar: null as File | null,
        deskripsi: game?.deskripsi || '',
        status: game?.status || 'aktif',
    });

    const [preview, setPreview] = useState<string | null>(
        game?.gambar ? `/storage/${game.gambar}` : null,
    );

    const submit = (e: any) => {
        e.preventDefault();
        const options = { onSuccess: onClose, forceFormData: true };

        // Sama seperti form Rooms: PHP tidak mem-parse body multipart untuk PATCH di
        // hosting LiteSpeed, jadi edit dikirim POST + _method=PATCH.
        transform((form: any) => (game ? { ...form, _method: 'PATCH' } : form));

        post(game ? route('admin.games.update', game.id) : route('admin.games.store'), options);
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
                        {game ? 'Edit Game' : 'Tambah Game'}
                    </h2>
                    <button type="button" onClick={onClose} className="text-slate-500 hover:text-white" aria-label="Tutup">
                        ✕
                    </button>
                </div>

                <div>
                    <label className="label-neon">Nama Game</label>
                    <input value={data.nama_game} onChange={(e) => setData('nama_game', e.target.value)} className="input-neon" required />
                    {errors.nama_game && <p className="mt-1 text-xs text-neon-red">{errors.nama_game}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="label-neon">Konsol</label>
                        <select value={data.jenis_konsol} onChange={(e) => setData('jenis_konsol', e.target.value)} className="input-neon">
                            <option value="PS3">PS3</option>
                            <option value="PS4">PS4</option>
                            <option value="PS5">PS5</option>
                        </select>
                    </div>
                    <div>
                        <label className="label-neon">Status</label>
                        <select value={data.status} onChange={(e) => setData('status', e.target.value)} className="input-neon">
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Nonaktif</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="label-neon">Gambar Game</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setData('gambar', file);
                            if (file) setPreview(URL.createObjectURL(file));
                        }}
                        className="input-neon file:me-3 file:rounded file:border-0 file:bg-neon-blue/20 file:px-3 file:py-1.5 file:font-semibold file:text-neon-cyan"
                    />
                    {preview && (
                        <img src={preview} alt="Preview" className="mt-3 h-32 rounded-lg border border-night-600 object-cover" />
                    )}
                    {errors.gambar && <p className="mt-1 text-xs text-neon-red">{errors.gambar}</p>}
                </div>

                <div>
                    <label className="label-neon">Deskripsi (opsional)</label>
                    <textarea value={data.deskripsi} onChange={(e) => setData('deskripsi', e.target.value)} className="input-neon" rows={2} />
                </div>

                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                    <button type="button" onClick={onClose} className="btn-neon-outline w-full !py-2 !text-xs sm:w-auto">Batal</button>
                    <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs sm:w-auto">
                        Simpan
                    </button>
                </div>
            </form>
        </div>
    );
}
