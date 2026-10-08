import AdminLayout from '@/Layouts/AdminLayout';
import CustomSelect from '@/Components/CustomSelect';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-warn/50 bg-warn/10 text-warn',
    confirmed: 'border-ok/50 bg-ok/10 text-ok',
    expired: 'border-danger/50 bg-danger/10 text-danger',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
    selesai: 'border-accent-light/50 bg-accent-light/10 text-accent-light',
};

const STATUS_LABEL: Record<string, string> = {
    pending_payment: 'Pending',
    confirmed: 'Confirmed',
    expired: 'Expired',
    cancelled: 'Cancelled',
    selesai: 'Selesai',
};

export default function AdminBookings({ bookings, filters }: any) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [tanggalFilter, setTanggalFilter] = useState(filters.tanggal || '');
    const [editing, setEditing] = useState<number | null>(null);

    const applyFilter = () => {
        router.get('/admin/bookings', { status: statusFilter, tanggal: tanggalFilter }, { preserveState: true });
    };

    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Manajemen <span className="text-accent-light">Booking Room</span>
                </h1>
            }
        >
            <Head title="Admin Booking" />

            {/* Filter */}
            <div className="card-console grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                    <label className="label-console">Status</label>
                    <CustomSelect
                        value={statusFilter || 'all'}
                        onChange={(v) => setStatusFilter(v === 'all' ? '' : v)}
                        options={[
                            { value: 'all', label: 'Semua' },
                            ...Object.entries(STATUS_LABEL).map(([v, l]) => ({ value: v, label: l })),
                        ]}
                    />
                </div>
                <div>
                    <label className="label-console">Tanggal</label>
                    <input type="date" value={tanggalFilter} onChange={(e) => setTanggalFilter(e.target.value)} className="input-console" />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                    <button onClick={applyFilter} className="btn-soft w-full">Terapkan</button>
                </div>
            </div>

            {/* Tabel */}
            <div className="card-console mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Room / Konsol</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {bookings.map((b: any) => (
                            <BookingRow
                                key={b.id}
                                booking={b}
                                editing={editing === b.id}
                                onToggle={() => setEditing(editing === b.id ? null : b.id)}
                            />
                        ))}
                    </tbody>
                </table>

                {bookings.length === 0 && (
                    <div className="p-8 text-center text-slate-500">Tidak ada booking.</div>
                )}
            </div>
        </AdminLayout>
    );
}

function BookingRow({ booking: b, editing, onToggle }: any) {
    return (
        <>
            <tr className="hover:bg-night-800/50">
                <td className="px-4 py-3 font-mono font-bold text-accent-light">#{b.id}</td>
                <td className="px-4 py-3">
                    <div className="text-slate-200">{b.nama}</div>
                    <div className="text-xs text-slate-500">{b.no_hp}</div>
                    {b.catatan && (
                        <div className="mt-0.5 max-w-[200px] truncate text-xs text-slate-500" title={b.catatan}>
                            📝 {b.catatan}
                        </div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="text-slate-300">{b.room?.nama_room}</div>
                    <div className="text-xs text-slate-500">{b.konsol}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                    <div>{b.tanggal}</div>
                    <div className="text-xs text-slate-500">{b.jam_mulai} ({b.durasi} jam)</div>
                </td>
                <td className="px-4 py-3">
                    <div className="text-accent-light">Rp {Number(b.harga_total).toLocaleString('id-ID')}</div>
                    {b.diskon_persen > 0 && (
                        <div className="text-xs text-ok">diskon {b.diskon_persen}%</div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <span className={`badge-console border ${
                        b.payment_status === 'sudah_bayar'
                            ? 'border-ok/40 bg-ok/10 text-ok'
                            : b.payment_status === 'ditolak'
                              ? 'border-danger/40 bg-danger/10 text-danger'
                              : 'border-warn/40 bg-warn/10 text-warn'
                    }`}>
                        {b.payment_status === 'sudah_bayar' ? 'Lunas' : b.payment_status === 'ditolak' ? 'Ditolak' : 'Belum Bayar'}
                    </span>
                    {b.payment_method && (
                        <div className="mt-0.5 text-xs text-slate-500">{b.payment_method}</div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <span className={`badge-console border ${STATUS_STYLE[b.booking_status] || ''}`}>
                        {STATUS_LABEL[b.booking_status] || b.booking_status}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <button
                        onClick={onToggle}
                        className="btn-outline !px-3 !py-1.5 !text-xs"
                    >
                        {editing ? 'Tutup' : 'Update Status'}
                    </button>
                </td>
            </tr>

            {/* Baris expand: edit status + riwayat */}
            {editing && (
                <tr className="bg-night-800/40">
                    <td colSpan={8} className="px-4 py-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            <BookingEditForm booking={b} onDone={onToggle} />
                            <ActivityLogList logs={b.activity_logs} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

function ActivityLogList({ logs }: any) {
    if (!logs?.length) {
        return (
            <div className="rounded-lg border border-night-600 bg-night-800/60 p-4 text-xs text-slate-500">
                Belum ada riwayat perubahan.
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-night-600 bg-night-800/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Riwayat Perubahan
            </div>
            <ul className="mt-2 space-y-1.5 text-xs text-slate-400">
                {logs.map((log: any) => (
                    <li key={log.id} className="flex flex-wrap gap-1">
                        <span className="rounded bg-accent/10 px-1.5 py-0.5 font-semibold text-accent-light">
                            {log.action}
                        </span>
                        {log.from_status && (
                            <>
                                <span className="text-slate-500">{log.from_status}</span>
                                <span>→</span>
                                <b className="text-slate-200">{log.to_status}</b>
                            </>
                        )}
                        <span>{log.catatan}</span>
                        <span className="text-slate-600">
                            • {new Date(log.created_at).toLocaleString('id-ID')}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function BookingEditForm({ booking, onDone }: any) {
    const { data, setData, patch, processing } = useForm({
        payment_method: booking.payment_method || '',
        payment_status: booking.payment_status,
        booking_status: booking.booking_status,
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route('admin.bookings.update', booking.id), { onSuccess: onDone });
    };

    // Booking status otomatis mengikuti payment status:
    // ditolak -> cancelled, sudah_bayar -> confirmed
    const changePayment = (value: string) => {
        setData({
            ...data,
            payment_status: value,
            booking_status:
                value === 'ditolak'
                    ? 'cancelled'
                    : value === 'sudah_bayar'
                      ? 'confirmed'
                      : data.booking_status,
        });
    };

    return (
        <form onSubmit={submit} className="rounded-lg border border-night-600 bg-night-800/60 p-4">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Update Status #{booking.id}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                    <label className="label-console">Metode Bayar</label>
                    <input
                        value={data.payment_method}
                        onChange={(e) => setData('payment_method', e.target.value)}
                        className="input-console"
                        placeholder="Transfer BCA / QRIS / Cash"
                    />
                </div>
                <div>
                    <label className="label-console">Payment Status</label>
                    <CustomSelect
                        value={data.payment_status}
                        onChange={changePayment}
                        options={[
                            { value: 'belum_bayar', label: 'Belum Bayar' },
                            { value: 'sudah_bayar', label: 'Sudah Bayar' },
                            { value: 'ditolak', label: 'Ditolak' },
                        ]}
                    />
                </div>
                <div>
                    <label className="label-console">Booking Status</label>
                    <CustomSelect
                        value={data.booking_status}
                        onChange={(v) => setData('booking_status', v)}
                        disabled={data.payment_status !== 'belum_bayar'}
                        options={[
                            { value: 'pending_payment', label: 'Pending' },
                            { value: 'confirmed', label: 'Confirmed' },
                            { value: 'expired', label: 'Expired' },
                            { value: 'cancelled', label: 'Cancelled' },
                            { value: 'selesai', label: 'Selesai' },
                        ]}
                        hint={
                            data.payment_status !== 'belum_bayar'
                                ? data.payment_status === 'ditolak'
                                    ? 'Otomatis: Cancelled'
                                    : 'Otomatis: Confirmed'
                                : undefined
                        }
                    />
                </div>
            </div>
            <button type="submit" disabled={processing} className="btn-primary mt-3 w-full !py-2 !text-xs">
                Simpan Perubahan
            </button>
        </form>
    );
}
