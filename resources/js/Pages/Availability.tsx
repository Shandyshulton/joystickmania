import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_STYLE: Record<string, string> = {
    available: 'border-neon-green/50 bg-neon-green/10 text-neon-green hover:bg-neon-green/25',
    booked: 'border-neon-red/50 bg-neon-red/10 text-neon-red cursor-not-allowed',
    pending: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow cursor-not-allowed',
};

const STATUS_LABEL: Record<string, string> = {
    available: 'Available',
    booked: 'Booked',
    pending: 'Pending Payment',
};

export default function Availability({ rooms, slots, grid, filters }: any) {
    const [tanggal, setTanggal] = useState(filters.tanggal);
    const [roomId, setRoomId] = useState(filters.room_id || '');
    const [konsol, setKonsol] = useState(filters.konsol || '');

    const applyFilter = (e: any) => {
        e.preventDefault();
        router.get('/cek-ketersediaan', {
            tanggal,
            room_id: roomId,
            konsol,
        }, { preserveState: true });
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <PublicLayout>
            <Head title="Cek Ketersediaan" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl font-bold tracking-wide text-white">
                    CEK <span className="text-neon-cyan">KETERSEDIAAN</span>
                </h1>
                <p className="mt-2 text-slate-400">
                    Pilih tanggal & room untuk melihat slot jam. Slot yang sedang{" "}
                    <span className="text-neon-yellow">Pending Payment</span> tidak bisa
                    dipesan ganda.
                </p>

                {/* Filter */}
                <form
                    onSubmit={applyFilter}
                    className="card-neon mt-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"
                >
                    <div>
                        <label className="label-neon">Tanggal</label>
                        <input
                            type="date"
                            min={today}
                            value={tanggal}
                            onChange={(e) => setTanggal(e.target.value)}
                            className="input-neon"
                            required
                        />
                    </div>
                    <div>
                        <label className="label-neon">Room</label>
                        <select
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="input-neon"
                        >
                            <option value="">Semua Room</option>
                            {rooms?.map((r: any) => (
                                <option key={r.id} value={r.id}>
                                    {r.nama_room}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label-neon">Konsol</label>
                        <select
                            value={konsol}
                            onChange={(e) => setKonsol(e.target.value)}
                            className="input-neon"
                        >
                            <option value="">Semua Konsol</option>
                            <option value="PS3">PS3</option>
                            <option value="PS4">PS4</option>
                            <option value="PS5">PS5</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button type="submit" className="btn-neon-solid w-full">
                            Terapkan Filter
                        </button>
                    </div>
                </form>

                {/* Legenda */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5">
                        <i className="inline-block h-3 w-3 rounded border border-neon-green/50 bg-neon-green/10" /> Available
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="inline-block h-3 w-3 rounded border border-neon-yellow/50 bg-neon-yellow/10" /> Pending Payment
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="inline-block h-3 w-3 rounded border border-neon-red/50 bg-neon-red/10" /> Booked
                    </span>
                </div>

                {/* Grid */}
                <div className="mt-6 space-y-6">
                    {rooms
                        ?.filter((r: any) => !roomId || r.id === Number(roomId))
                        .filter((r: any) => {
                            if (!konsol) return true;
                            return r.konsol_tersedia?.includes(konsol);
                        })
                        .map((room: any) => (
                            <div key={room.id} className="card-neon overflow-hidden">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-night-600 bg-night-800/60 px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        {room.foto && (
                                            <img
                                                src={`/storage/${room.foto}`}
                                                alt={room.nama_room}
                                                className="h-12 w-12 rounded-lg border border-night-600 object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-display text-lg font-bold text-white">
                                                {room.nama_room}
                                            </h3>
                                            <span className="text-xs text-slate-500">
                                                {room.konsol_tersedia?.join(' • ')} • Rp{' '}
                                                {Number(room.harga_per_jam).toLocaleString('id-ID')}/jam
                                            </span>
                                        </div>
                                    </div>
                                    <Link
                                        href={`/booking/room?room_id=${room.id}&tanggal=${tanggal}`}
                                        className="btn-neon !px-4 !py-1.5 !text-xs"
                                    >
                                        Booking Room Ini
                                    </Link>
                                </div>
                                <div className="grid grid-cols-4 gap-2 p-4 sm:grid-cols-6 lg:grid-cols-12">
                                    {grid?.[room.id]?.map((slot: any) => (
                                        <div
                                            key={slot.jam}
                                            className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition ${STATUS_STYLE[slot.status]}`}
                                        >
                                            <div>{slot.jam}</div>
                                            <div className="mt-0.5 text-[10px] opacity-80">
                                                {STATUS_LABEL[slot.status]}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    {(!rooms || rooms.length === 0) && (
                        <div className="card-neon p-8 text-center text-slate-400">
                            Tidak ada room aktif.
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
