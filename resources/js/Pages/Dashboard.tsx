import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-warn/50 bg-warn/10 text-warn',
    confirmed: 'border-ok/50 bg-ok/10 text-ok',
    expired: 'border-danger/50 bg-danger/10 text-danger',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
    selesai: 'border-accent-light/50 bg-accent-light/10 text-accent-light',
    active: 'border-ok/50 bg-ok/10 text-ok',
};

const STATUS_LABEL: Record<string, string> = {
    pending_payment: 'Pending Payment',
    confirmed: 'Confirmed',
    expired: 'Expired',
    cancelled: 'Cancelled',
    selesai: 'Selesai',
    active: 'Aktif',
};

export default function Dashboard({
    bookings,
    physicalRentals,
    membershipPurchases,
    activeMembership,
    tiers,
    auth,
}: any) {
    const user = auth.user;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-display text-xl font-bold leading-tight text-white">
                    Dashboard <span className="text-accent-light">Member</span>
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Kartu membership */}
                <div className="card-console bg-glow-warm p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-widest text-slate-500">
                                Membership Anda
                            </p>
                            <div className="mt-1 flex items-center gap-3">
                                <h3 className="font-display text-3xl font-black uppercase tracking-widest text-accent-light">
                                    {user.membership_tier}
                                </h3>
                                {activeMembership?.valid_until && (
                                    <span className="badge-console border border-ok/40 bg-ok/10 text-xs text-ok">
                                        Aktif s/d{' '}
                                        {new Date(
                                            activeMembership.valid_until,
                                        ).toLocaleDateString('id-ID')}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-slate-400">
                                {activeMembership
                                    ? `Diskon ${activeMembership.tier?.diskon_persen ?? 0}% otomatis saat booking room.`
                                    : 'Tier gratis. Upgrade untuk dapat diskon otomatis & benefit eksklusif.'}
                            </p>
                        </div>
                        {user.membership_tier === 'bronze' && (
                            <Link href="/membership" className="btn-primary animate-nudge !text-xs">
                                Upgrade Membership
                            </Link>
                        )}
                    </div>
                </div>

                {/* Ringkasan */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    {[
                        ['Booking Room', bookings?.length ?? 0],
                        ['Sewa Fisik', physicalRentals?.length ?? 0],
                        ['Transaksi Membership', membershipPurchases?.length ?? 0],
                    ].map(([label, count]) => (
                        <div key={label as string} className="card-console p-5 text-center">
                            <div className="font-display text-3xl font-black text-white">{count}</div>
                            <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                                {label}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Riwayat booking room */}
                <div className="mt-8">
                    <h3 className="font-display text-lg font-bold text-white">
                        Riwayat <span className="text-accent-light">Booking Room</span>
                    </h3>
                    <div className="card-console mt-3 overflow-x-auto">
                        {bookings?.length ? (
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
                                        <tr key={b.id} className="hover:bg-night-800/50">
                                            <td className="px-4 py-3 font-mono text-accent-light">#{b.id}</td>
                                            <td className="px-4 py-3 text-slate-300">{b.room?.nama_room}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {b.tanggal} • {b.jam_mulai} ({b.durasi} jam)
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                Rp {Number(b.harga_total).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`badge-console border ${STATUS_STYLE[b.booking_status] || ''}`}>
                                                    {STATUS_LABEL[b.booking_status] || b.booking_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-500">
                                Belum ada booking room.{' '}
                                <Link href="/cek-ketersediaan" className="text-accent-light hover:underline">
                                    Cek ketersediaan →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Riwayat sewa fisik */}
                <div className="mt-8">
                    <h3 className="font-display text-lg font-bold text-white">
                        Riwayat <span className="text-accent-light">Sewa Fisik</span>
                    </h3>
                    <div className="card-console mt-3 overflow-x-auto">
                        {physicalRentals?.length ? (
                            <table className="min-w-full divide-y divide-night-600 text-sm">
                                <thead className="bg-night-800/60">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Periode</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deposit</th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-night-700">
                                    {physicalRentals.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-night-800/50">
                                            <td className="px-4 py-3 font-mono text-accent-light">#{r.id}</td>
                                            <td className="px-4 py-3 text-slate-300">{r.ps_unit?.kode_unit}</td>
                                            <td className="px-4 py-3 text-slate-300">
                                                {r.tanggal_mulai} → {r.tanggal_kembali}
                                            </td>
                                            <td className="px-4 py-3 text-slate-300">
                                                Rp {Number(r.nominal_deposit).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`badge-console border ${STATUS_STYLE[r.booking_status] || ''}`}>
                                                    {STATUS_LABEL[r.booking_status] || r.booking_status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-8 text-center text-sm text-slate-500">
                                Belum ada sewa fisik.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
