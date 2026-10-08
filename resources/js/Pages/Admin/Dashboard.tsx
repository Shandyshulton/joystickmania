import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-warn/50 bg-warn/10 text-warn',
    confirmed: 'border-ok/50 bg-ok/10 text-ok',
    active: 'border-ok/50 bg-ok/10 text-ok',
    expired: 'border-danger/50 bg-danger/10 text-danger',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
};

export default function AdminDashboard({
    stats,
    pendingBookings,
    pendingRentals,
    pendingMemberships,
}: any) {
    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Dashboard <span className="text-accent-light">Admin</span>
                </h1>
            }
        >
            <Head title="Admin Dashboard" />

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                    ['Booking Hari Ini', stats.bookingsToday, 'text-accent-light'],
                    ['Sewa Fisik Aktif', stats.rentalsActive, 'text-muted-accent'],
                    ['Pending Payment', stats.pendingCount, 'text-warn'],
                    ['Pendapatan Hari Ini', `Rp ${Number(stats.revenueToday).toLocaleString('id-ID')}`, 'text-ok'],
                    ['Total Member', stats.totalMembers, 'text-white'],
                    ['Member Berbayar', stats.paidMembers, 'text-accent'],
                ].map(([label, value, color]) => (
                    <div key={label as string} className="card-console p-5">
                        <div className={`font-display text-2xl font-black ${color}`}>{value}</div>
                        <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">{label}</div>
                    </div>
                ))}
            </div>

            {/* Pending payments priority */}
            <div className="mt-8">
                <h2 className="font-display text-lg font-bold text-white">
                    ⏳ Menunggu <span className="text-warn">Pembayaran</span>
                    <span className="ml-2 rounded-full bg-warn/15 px-2 py-0.5 text-xs font-semibold text-warn">
                        Prioritas — batas 30 menit
                    </span>
                </h2>

                <div className="card-console mt-3 overflow-x-auto">
                    <table className="min-w-full divide-y divide-night-600 text-sm">
                        <thead className="bg-night-800/60">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jenis</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Detail</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Sisa Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-night-700">
                            {pendingBookings.map((b: any) => (
                                <tr key={`b-${b.id}`} className="hover:bg-night-800/50">
                                    <td className="px-4 py-3">
                                        <span className="badge-console border border-accent/40 bg-accent/10 text-accent-light">Room</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-accent-light">#{b.id}</td>
                                    <td className="px-4 py-3 text-slate-300">{b.nama} <span className="text-xs text-slate-500">{b.no_hp}</span></td>
                                    <td className="px-4 py-3 text-slate-300">
                                        {b.room?.nama_room} • {b.tanggal} {b.jam_mulai} ({b.durasi} jam) • Rp {Number(b.harga_total).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`badge-console border ${b.expires_at < new Date().toISOString().slice(0, 19).replace('T', ' ') ? 'border-danger/50 bg-danger/10 text-danger' : 'border-warn/50 bg-warn/10 text-warn'}`}>
                                            {b.expires_at}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {pendingRentals.map((r: any) => (
                                <tr key={`r-${r.id}`} className="hover:bg-night-800/50">
                                    <td className="px-4 py-3">
                                        <span className="badge-console border border-muted-accent/40 bg-muted-accent/10 text-muted-accent">Fisik</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-accent-light">#{r.id}</td>
                                    <td className="px-4 py-3 text-slate-300">{r.nama} <span className="text-xs text-slate-500">{r.no_hp}</span></td>
                                    <td className="px-4 py-3 text-slate-300">
                                        {r.ps_unit?.kode_unit} • {r.tanggal_mulai} → {r.tanggal_kembali} • Rp {Number(r.total_biaya).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="badge-console border border-warn/50 bg-warn/10 text-warn">{r.expires_at}</span>
                                    </td>
                                </tr>
                            ))}
                            {pendingMemberships.map((m: any) => (
                                <tr key={`m-${m.id}`} className="hover:bg-night-800/50">
                                    <td className="px-4 py-3">
                                        <span className="badge-console border border-ok/40 bg-ok/10 text-ok">Member</span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-accent-light">#{m.id}</td>
                                    <td className="px-4 py-3 text-slate-300">{m.user?.nama}</td>
                                    <td className="px-4 py-3 text-slate-300 uppercase">
                                        {m.tier?.nama_tier} • Rp {Number(m.harga_paket).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="badge-console border border-warn/50 bg-warn/10 text-warn">{m.expires_at}</span>
                                    </td>
                                </tr>
                            ))}
                            {pendingBookings.length === 0 && pendingRentals.length === 0 && pendingMemberships.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                        Tidak ada pending payment. 👍
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Link href="/admin/bookings" className="card-console p-5 text-center hover:shadow-solid-sm">
                    <div className="text-2xl">🕹</div>
                    <div className="mt-1 text-sm font-semibold text-slate-300">Kelola Booking Room</div>
                </Link>
                <Link href="/admin/rentals" className="card-console p-5 text-center hover:shadow-solid-sm">
                    <div className="text-2xl">🎮</div>
                    <div className="mt-1 text-sm font-semibold text-slate-300">Kelola Sewa Fisik</div>
                </Link>
                <Link href="/admin/memberships" className="card-console p-5 text-center hover:shadow-solid-sm">
                    <div className="text-2xl">⭐</div>
                    <div className="mt-1 text-sm font-semibold text-slate-300">Kelola Membership</div>
                </Link>
            </div>
        </AdminLayout>
    );
}
