import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import ImageViewer from '@/Components/ImageViewer';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-warn/50 bg-warn/10 text-warn',
    confirmed: 'border-ok/50 bg-ok/10 text-ok',
    active: 'border-ok/50 bg-ok/10 text-ok',
    expired: 'border-danger/50 bg-danger/10 text-danger',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
    selesai: 'border-accent-light/50 bg-accent-light/10 text-accent-light',
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
        return <span className="text-xs text-danger">Waktu habis</span>;
    }

    // Update countdown tiap menit
    setTimeout(() => setNow(Date.now()), 60000);

    const minutes = Math.floor(diff / 60000);
    return (
        <span className="text-xs text-warn">
            ⏳ {minutes} menit lagi
        </span>
    );
}

export default function History({ bookings, physicalRentals, membershipPurchases, auth }: any) {
    const [ktpView, setKtpView] = useState<string | null>(null);

    const total = (bookings?.length || 0) + (physicalRentals?.length || 0) + (membershipPurchases?.length || 0);

    return (
        <PublicLayout>
            <Head title="Riwayat Pemesanan" />

            <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl font-bold tracking-wide text-white">
                    RIWAYAT <span className="text-accent-light">PEMESANAN</span>
                </h1>
                <p className="mt-2 text-slate-400">
                    Cek status booking room, sewa fisik, dan membership Anda.
                    {auth?.user ? ' Riwayat akun Anda tampil otomatis di bawah.' : ''}
                </p>

                {!auth?.user && (
                    <div className="card-console mt-6 p-5 text-sm">
                        <p className="font-semibold text-white">
                            Menampilkan pemesanan yang dibuat dari perangkat ini
                        </p>
                        <p className="mt-1 text-slate-400">
                            Demi keamanan, riwayat tidak lagi bisa dicari memakai nomor HP. Untuk melihat
                            seluruh riwayat pemesanan Anda, silakan masuk ke akun.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link href="/login" className="btn-primary !px-5 !py-2 !text-xs">
                                Masuk ke Akun
                            </Link>
                            <Link href="/register" className="btn-outline !px-5 !py-2 !text-xs">
                                Daftar
                            </Link>
                        </div>
                    </div>
                )}

                {total === 0 ? (
                    <div className="card-console mt-6 p-10 text-center text-slate-500">
                        {auth?.user
                            ? 'Belum ada pemesanan. Yuk booking sekarang!'
                            : 'Belum ada pemesanan dari perangkat ini. Kalau kamu baru booking lewat HP atau browser lain, masuk ke akun untuk melihat riwayatnya.'}
                    </div>
                ) : (
                    <>
                        {/* Booking Room */}
                        {bookings?.length > 0 && (
                            <section className="mt-8">
                                <h2 className="font-display text-lg font-bold text-white">
                                    🕹️ Booking <span className="text-accent-light">Room</span>
                                </h2>
                                <div className="card-console mt-3 overflow-x-auto">
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
                                                    <td className="px-4 py-3 font-mono font-bold text-accent-light">#{b.id}</td>
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
                                                            <div className="text-xs text-ok">diskon {b.diskon_persen}%</div>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-console border ${STATUS_STYLE[b.booking_status] || ''}`}>
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
                                    🎮 Sewa <span className="text-accent-light">Fisik</span>
                                </h2>
                                <div className="card-console mt-3 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-night-600 text-sm">
                                        <thead className="bg-night-800/60">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Periode</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Biaya</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deposit</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">KTP</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-night-700">
                                            {physicalRentals.map((r: any) => (
                                                <tr key={`r-${r.id}`} className="hover:bg-night-800/50">
                                                    <td className="px-4 py-3 font-mono font-bold text-accent-light">#{r.id}</td>
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
                                                    <td className="px-4 py-3 text-warn">
                                                        Rp {Number(r.nominal_deposit).toLocaleString('id-ID')}
                                                        <div className="text-xs text-slate-500">{r.deposit_status}</div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {auth?.user && r.has_ktp ? (
                                                            <button
                                                                onClick={() => setKtpView(`/ktp/${r.id}`)}
                                                                className="text-xs text-accent-light underline hover:text-accent"
                                                            >
                                                                Lihat →
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-slate-600">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-console border ${STATUS_STYLE[r.booking_status] || ''}`}>
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
                                <div className="card-console mt-3 overflow-x-auto">
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
                                                    <td className="px-4 py-3 font-mono font-bold text-accent-light">#{m.id}</td>
                                                    <td className="px-4 py-3 uppercase text-slate-200">{m.tier?.nama_tier}</td>
                                                    <td className="px-4 py-3 text-slate-300">Rp {Number(m.harga_paket).toLocaleString('id-ID')}</td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {m.valid_until ? new Date(m.valid_until).toLocaleDateString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`badge-console border ${STATUS_STYLE[m.membership_status] || ''}`}>
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

            {/* Viewer foto KTP milik sendiri */}
            {ktpView && (
                <ImageViewer
                    src={ktpView}
                    alt="Foto KTP"
                    onClose={() => setKtpView(null)}
                />
            )}
        </PublicLayout>
    );
}
