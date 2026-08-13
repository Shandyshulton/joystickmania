import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

export default function BookingRoom({
    rooms,
    prefill,
    preselectedRoom,
    preselectedTanggal,
    userTier,
    userMembership,
    waAdmin,
}: any) {
    const { data, setData, post, processing, errors } = useForm({
        nama: prefill.nama,
        no_hp: prefill.no_hp,
        tanggal: preselectedTanggal || '',
        jam_mulai: '10:00',
        durasi: 2,
        room_id: preselectedRoom ? Number(preselectedRoom) : (rooms?.[0]?.id ?? ''),
        konsol: rooms?.[0]?.konsol_tersedia?.[0] ?? 'PS5',
        catatan: '',
    });

    const selectedRoom = rooms?.find((r: any) => r.id === Number(data.room_id));
    const diskonPersen = userMembership?.tier?.diskon_persen ?? 0;

    const subtotal = useMemo(
        () => (selectedRoom?.harga_per_jam ?? 0) * Number(data.durasi),
        [selectedRoom, data.durasi],
    );
    const total = Math.round(subtotal * (1 - diskonPersen / 100));
    const diskonNominal = subtotal - total;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('booking.room.store'));
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <PublicLayout>
            <Head title="Booking Room" />

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl font-bold tracking-wide text-white">
                    BOOKING <span className="text-neon-cyan">ROOM</span>
                </h1>
                <p className="mt-2 text-slate-400">
                    Isi data di bawah. Slot dikunci 30 menit setelah submit — segera
                    konfirmasi pembayaran via WhatsApp.
                </p>

                {diskonPersen > 0 && (
                    <div className="mt-4 rounded-lg border border-neon-green/40 bg-neon-green/10 p-4 text-sm text-neon-green">
                        🎮 Member {userTier?.toUpperCase()} — diskon{' '}
                        <b>{diskonPersen}%</b> otomatis diterapkan!
                    </div>
                )}

                <form onSubmit={submit} className="card-neon mt-6 space-y-5 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="nama" value="Nama" />
                            <input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="input-neon mt-1"
                                required
                            />
                            <InputError message={errors.nama} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP (WA aktif)" />
                            <input
                                id="no_hp"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                                className="input-neon mt-1"
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                            <InputError message={errors.no_hp} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="tanggal" value="Tanggal" />
                            <input
                                id="tanggal"
                                type="date"
                                min={today}
                                value={data.tanggal}
                                onChange={(e) => setData('tanggal', e.target.value)}
                                className="input-neon mt-1"
                                required
                            />
                            <InputError message={errors.tanggal} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="jam_mulai" value="Jam Mulai" />
                            <select
                                id="jam_mulai"
                                value={data.jam_mulai}
                                onChange={(e) => setData('jam_mulai', e.target.value)}
                                className="input-neon mt-1"
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 10).map((h) => (
                                    <option key={h} value={`${String(h).padStart(2, '0')}:00`}>
                                        {String(h).padStart(2, '0')}:00
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.jam_mulai} className="mt-1" />
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <InputLabel htmlFor="durasi" value="Durasi (jam)" />
                            <input
                                id="durasi"
                                type="number"
                                min={1}
                                max={12}
                                value={data.durasi}
                                onChange={(e) => setData('durasi', Number(e.target.value))}
                                className="input-neon mt-1"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="room_id" value="Room" />
                            <select
                                id="room_id"
                                value={data.room_id}
                                onChange={(e) => setData('room_id', Number(e.target.value))}
                                className="input-neon mt-1"
                            >
                                {rooms?.map((r: any) => (
                                    <option key={r.id} value={r.id}>
                                        {r.nama_room}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.room_id} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="konsol" value="Konsol" />
                            <select
                                id="konsol"
                                value={data.konsol}
                                onChange={(e) => setData('konsol', e.target.value)}
                                className="input-neon mt-1"
                            >
                                {selectedRoom?.konsol_tersedia?.map((k: string) => (
                                    <option key={k} value={k}>
                                        {k}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.konsol} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="catatan" value="Catatan (opsional)" />
                        <textarea
                            id="catatan"
                            value={data.catatan}
                            onChange={(e) => setData('catatan', e.target.value)}
                            className="input-neon mt-1"
                            rows={2}
                        />
                    </div>

                    {/* Ringkasan harga */}
                    <div className="rounded-lg border border-night-600 bg-night-700/40 p-4">
                        <div className="flex justify-between text-sm text-slate-300">
                            <span>
                                {selectedRoom?.nama_room} • Rp{' '}
                                {Number(selectedRoom?.harga_per_jam ?? 0).toLocaleString('id-ID')} x{' '}
                                {data.durasi} jam
                            </span>
                            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                        </div>
                        {diskonPersen > 0 && (
                            <div className="mt-1 flex justify-between text-sm text-neon-green">
                                <span>Diskon member ({diskonPersen}%)</span>
                                <span>- Rp {diskonNominal.toLocaleString('id-ID')}</span>
                            </div>
                        )}
                        <div className="mt-2 flex justify-between border-t border-night-600 pt-2 font-display text-lg font-bold text-neon-cyan">
                            <span>Total Bayar</span>
                            <span>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <button type="submit" disabled={processing} className="btn-neon-solid w-full animate-glow-pulse !py-3">
                        {processing ? 'Memproses...' : 'Lanjut ke Konfirmasi WhatsApp'}
                    </button>
                </form>
            </div>
        </PublicLayout>
    );
}
