import PublicLayout from '@/Layouts/PublicLayout';
import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow',
    confirmed: 'border-neon-green/50 bg-neon-green/10 text-neon-green',
    active: 'border-neon-green/50 bg-neon-green/10 text-neon-green',
    expired: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
    selesai: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
};

const STATUS_LABEL: Record<string, string> = {
    pending_payment: 'Pending Payment',
    confirmed: 'Confirmed',
    active: 'Aktif',
    expired: 'Expired',
    cancelled: 'Cancelled',
    selesai: 'Selesai',
};

function TimeLeft({ expiresAt }: { expiresAt?: string }) {
    if (!expiresAt) return null;

    const [now, setNow] = useState(Date.now());
    const deadline = new Date(expiresAt).getTime();
    const diff = deadline - now;

    if (diff <= 0) {
        return <span className="text-xs text-neon-red">Waktu habis</span>;
    }

    // Update countdown tiap menit
    setTimeout(() => setNow(Date.now()), 60000);

    const minutes = Math.floor(diff / 60000);
    return (
        <span className="text-xs text-neon-yellow">
            ⏳ {minutes} menit lagi
        </span>
    );
}

export default function History({ noHp, bookings, physicalRentals, membershipPurchases, auth }: any) {
    const [input, setInput] = useState(noHp);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        router.get('/riwayat', { no_hp: input }, { preserveState: true });
    };

    const total = (bookings?.length || 0) + (physicalRentals?.length || 0) + (membershipPurchases?.length || 0);

    return (
        <PublicLayout>
            <Head title="Riwayat Pemesanan" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl font-bold tracking-wide text-white">
                    RIWAYAT <span className="text-neon-cyan">PEMESANAN</span>
                </h1>
                <p className="mt-2 text-slate-400">
                    Cek status booking room, sewa fisik, dan membership Anda.
                    {auth?.user
                        ? ' Riwayat akun Anda tampil otomatis di bawah.'
                        : ' Masukkan No. HP yang dipakai saat booking untuk melihat riwayat.'}
                </p>

                {!auth?.user && (
                    <form onSubmit={submit} className="card-neon mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
                        <div className="flex-1">
                            <label className="label-neon">No. HP / WhatsApp</label>
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="input-neon"
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                        </div>
                        <button type="submit" className="btn-neon-solid">
                            Cek Riwayat
                        </button>
                    </form>
                )}

                {total === 0 ? (
                    <div className="card-neon mt-6 p-10 text-center text-slate-500">
                        {auth?.user
                            ? 'Belum ada pemesanan. Yuk booking sekarang!'
                            : 'Tidak ada pemesanan ditemukan untuk nomor tersebut.'}
                    </div>
                ) : (
                    <>
                        {/* Booking Room */}
                        {bookings?.length > 0 && (
                            <section className="mt-8">
                                <h2 className="font-display text-lg font-bold text-white">
                                    🕹️ Booking <span className="text-neon-cyan">Room</span>
                                </h2>
                                <div className="card-neon mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-night-600 text-sm">
                                        <thead className="bg-night-800/60">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Room</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-night-700">
                                            {bookings.map((b: any) => (
                                                <tr key={`b-${b.id}`} className="hover:bg-night-800/50">
                                                    <td className="px-4 py-3 font-mono font-bold text-neon-cyan">#{b.id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-slate-200">{b.room?.nama_room}</div>
                                                        <div className="text-xs text-slate-500">{b.konsol}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        <div>{b.tanggal}</div>
                                                        <div className="text-xs text-slate-500">{b.jam_mulai} ({b.durasi} jam)</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        <div>Rp {Number(b.harga_total).toLocaleString('id-ID')}</div>
                                                        {b.diskon_persen > 0 && (
                                                            <div className="text-xs text-neon-green">diskon {b.diskon_persen}%</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-neon border ${STATUS_STYLE[b.booking_status] || ''}`}>
                                                            {STATUS_LABEL[b.booking_status] || b.booking_status}
                                                        </span>
                                                        {b.booking_status === 'pending_payment' && (
                                                            <div className="mt-1">
                                                                <TimeLeft expiresAt={b.expires_at} />
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Sewa Fisik */}
                        {physicalRentals?.length > 0 && (
                            <section className="mt-8">
                                <h2 className="font-display text-lg font-bold text-white">
                                    🎮 Sewa <span className="text-neon-cyan">Fisik</span>
                                </h2>
                                <div className="card-neon mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-night-600 text-sm">
                                        <thead className="bg-night-800/60">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Periode</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Biaya</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deposit</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-night-700">
                                            {physicalRentals.map((r: any) => (
                                                <tr key={`r-${r.id}`} className="hover:bg-night-800/50">
                                                    <td className="px-4 py-3 font-mono font-bold text-neon-cyan">#{r.id}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="text-slate-200">{r.ps_unit?.kode_unit}</div>
                                                        <div className="text-xs text-slate-500">{r.ps_unit?.jenis_konsol}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        <div>{r.tanggal_mulai} → {r.tanggal_kembali}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        Rp {Number(r.total_biaya).toLocaleString('id-ID')}
                                                    </td>
                                                    <td className="px-4 py-3 text-neon-yellow">
                                                        Rp {Number(r.nominal_deposit).toLocaleString('id-ID')}
                                                        <div className="text-xs text-slate-500">{r.deposit_status}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-neon border ${STATUS_STYLE[r.booking_status] || ''}`}>
                                                            {STATUS_LABEL[r.booking_status] || r.booking_status}
                                                        </span>
                                                        {r.booking_status === 'pending_payment' && (
                                                            <div className="mt-1">
                                                                <TimeLeft expiresAt={r.expires_at} />
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}

                        {/* Membership */}
                        {membershipPurchases?.length > 0 && (
                            <section className="mt-8">
                                <h2 className="font-display text-lg font-bold text-white">
                                    ⭐ Membership
                                </h2>
                                <div className="card-neon mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-night-600 text-sm">
                                        <thead className="bg-night-800/60">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Paket</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Harga</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aktif Sampai</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-night-700">
                                            {membershipPurchases.map((m: any) => (
                                                <tr key={`m-${m.id}`} className="hover:bg-night-800/50">
                                                    <td className="px-4 py-3 font-mono font-bold text-neon-cyan">#{m.id}</td>
                                                    <td className="px-4 py-3 uppercase text-slate-200">{m.tier?.nama_tier}</td>
                                                    <td className="px-4 py-3 text-slate-300">Rp {Number(m.harga_paket).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {m.valid_until ? new Date(m.valid_until).toLocaleDateString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-neon border ${STATUS_STYLE[m.membership_status] || ''}`}>
                                                            {STATUS_LABEL[m.membership_status] || m.membership_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>
        </PublicLayout>
    );
}
