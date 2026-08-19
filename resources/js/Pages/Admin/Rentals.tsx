import AdminLayout from '@/Layouts/AdminLayout';
import CustomSelect from '@/Components/CustomSelect';
import ImageViewer from '@/Components/ImageViewer';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow',
    confirmed: 'border-neon-green/50 bg-neon-green/10 text-neon-green',
    expired: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
    selesai: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
};

const STATUS_LABEL: Record<string, string> = {
    pending_payment: 'Pending',
    confirmed: 'Confirmed',
    expired: 'Expired',
    cancelled: 'Cancelled',
    selesai: 'Selesai',
};

export default function AdminRentals({ rentals, filters }: any) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [editing, setEditing] = useState<number | null>(null);
    const [ktpView, setKtpView] = useState<string | null>(null);

    const applyFilter = () => {
        router.get('/admin/rentals', { status: statusFilter }, { preserveState: true });
    };

    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Manajemen <span className="text-neon-cyan">Sewa Fisik</span>
                </h1>
            }
        >
            <Head title="Admin Sewa Fisik" />

            <div className="card-neon grid grid-cols-1 items-end gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <label className="label-neon">Status</label>
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
                    <button onClick={applyFilter} className="btn-neon w-full">Terapkan</button>
                </div>
            </div>

            <div className="card-neon mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Unit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Periode</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Biaya</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deposit</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">KTP</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {rentals.map((r: any) => (
                            <RentalRow
                                key={r.id}
                                rental={r}
                                editing={editing === r.id}
                                onToggle={() => setEditing(editing === r.id ? null : r.id)}
                                onViewKtp={() => setKtpView(`/admin/rentals/${r.id}/ktp`)}
                            />
                        ))}
                    </tbody>
                </table>

                {rentals.length === 0 && (
                    <div className="p-8 text-center text-slate-500">Tidak ada sewa fisik.</div>
                )}
            </div>

            {/* Viewer foto KTP (zoom in/out) */}
            {ktpView && (
                <ImageViewer
                    src={ktpView}
                    alt="Foto KTP"
                    onClose={() => setKtpView(null)}
                />
            )}
        </AdminLayout>
    );
}

function RentalRow({ rental: r, editing, onToggle, onViewKtp }: any) {
    return (
        <>
            <tr className="hover:bg-night-800/50">
                <td className="px-4 py-3 font-mono font-bold text-neon-cyan">#{r.id}</td>
                <td className="px-4 py-3">
                    <div className="text-slate-200">{r.nama}</div>
                    <div className="text-xs text-slate-500">{r.no_hp}</div>
                    {r.alamat && (
                        <div className="max-w-[180px] truncate text-xs text-slate-500" title={r.alamat}>
                            📍 {r.alamat}
                        </div>
                    )}
                </td>
                <td className="px-4 py-3">
                    <div className="text-slate-300">{r.ps_unit?.kode_unit}</div>
                    <div className="text-xs text-slate-500">{r.ps_unit?.jenis_konsol}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                    <div>{r.tanggal_mulai} → {r.tanggal_kembali}</div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                    Rp {Number(r.total_biaya).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                    <div className="text-neon-yellow">Rp {Number(r.nominal_deposit).toLocaleString('id-ID')}</div>
                    <div className="text-xs text-slate-500">
                        {r.deposit_status === 'dikembalikan' ? '✓ Dikembalikan' : 'Ditahan'}
                    </div>
                </td>
                <td className="px-4 py-3">
                    {r.has_ktp ? (
                        <button onClick={onViewKtp} className="text-xs text-neon-cyan underline hover:text-neon-blue">
                            Lihat →
                        </button>
                    ) : (
                        <span className="text-xs text-slate-600">-</span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <span className={`badge-neon border ${STATUS_STYLE[r.booking_status] || ''}`}>
                        {STATUS_LABEL[r.booking_status] || r.booking_status}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <button onClick={onToggle} className="btn-neon-outline !px-3 !py-1.5 !text-xs">
                        {editing ? 'Tutup' : 'Update Status'}
                    </button>
                </td>
            </tr>

            {editing && (
                <tr className="bg-night-800/40">
                    <td colSpan={9} className="px-4 py-4">
                        <RentalEditForm rental={r} onDone={onToggle} />
                    </td>
                </tr>
            )}
        </>
    );
}

function RentalEditForm({ rental, onDone }: any) {
    const { data, setData, patch, processing } = useForm({
        payment_method: rental.payment_method || '',
        payment_status: rental.payment_status,
        booking_status: rental.booking_status,
        deposit_status: rental.deposit_status,
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route('admin.rentals.update', rental.id), { onSuccess: onDone });
    };

    // Payment ditolak/sudah bayar -> booking status & deposit otomatis, tidak bisa dipilih manual
    const locked = data.payment_status !== 'belum_bayar';

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
            deposit_status: value === 'ditolak' ? 'ditahan' : data.deposit_status,
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 grid gap-3 rounded-lg border border-night-600 bg-night-800/60 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <label className="label-neon">Metode Bayar</label>
                <input value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)} className="input-neon" placeholder="Transfer / QRIS / Cash" />
            </div>
            <div>
                <label className="label-neon">Payment Status</label>
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
                <label className="label-neon">Booking Status</label>
                <CustomSelect
                    value={data.booking_status}
                    onChange={(v) => setData('booking_status', v)}
                    disabled={locked}
                    options={[
                        { value: 'pending_payment', label: 'Pending' },
                        { value: 'confirmed', label: 'Confirmed' },
                        { value: 'expired', label: 'Expired' },
                        { value: 'cancelled', label: 'Cancelled' },
                        { value: 'selesai', label: 'Selesai' },
                    ]}
                    hint={
                        locked
                            ? data.payment_status === 'ditolak'
                                ? 'Otomatis: Cancelled'
                                : 'Otomatis: Confirmed'
                            : undefined
                    }
                />
            </div>
            <div>
                <label className="label-neon">Deposit</label>
                <CustomSelect
                    value={data.deposit_status}
                    onChange={(v) => setData('deposit_status', v)}
                    disabled={locked}
                    options={[
                        { value: 'ditahan', label: 'Ditahan' },
                        { value: 'dikembalikan', label: 'Dikembalikan' },
                    ]}
                    hint={
                        locked
                            ? data.payment_status === 'ditolak'
                                ? 'Otomatis: Ditahan'
                                : 'Atur saat unit dikembalikan'
                            : undefined
                    }
                />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
                <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs">
                    Simpan Perubahan
                </button>
            </div>
        </form>
    );
}
