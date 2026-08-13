import AdminLayout from '@/Layouts/AdminLayout';
import CustomSelect from '@/Components/CustomSelect';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

const TABS = [
    { key: 'semua', label: 'Semua' },
    { key: 'pending', label: 'Pending' },
    { key: 'berakhir', label: 'Akan Berakhir' },
    { key: 'tenggang', label: 'Masa Tenggang' },
];

const STATUS_STYLE: Record<string, string> = {
    pending_payment: 'border-neon-yellow/50 bg-neon-yellow/10 text-neon-yellow',
    active: 'border-neon-green/50 bg-neon-green/10 text-neon-green',
    expired: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
    cancelled: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
};

function buildReminderMessage(m: any): string {
    return [
        `Halo ${m.user?.nama}!`,
        ``,
        `Membership ${m.tier?.nama_tier?.toUpperCase()} kamu di JoyStickMania akan berakhir pada ${m.valid_until ? new Date(m.valid_until).toLocaleDateString('id-ID') : '-'}.`,
        ``,
        `Mau lanjut? Balas pesan ini ya, kami bantu proses perpanjangannya. 😊`,
    ].join('\n');
}

export default function AdminMemberships({ memberships, tab, waAdmin }: any) {
    const [editing, setEditing] = useState<number | null>(null);

    const switchTab = (key: string) => {
        router.get('/admin/memberships', { tab: key }, { preserveState: true });
    };

    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Manajemen <span className="text-neon-cyan">Membership</span>
                </h1>
            }
        >
            <Head title="Admin Membership" />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => switchTab(t.key)}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                            tab === t.key
                                ? 'bg-neon-blue/15 text-neon-cyan shadow-neon-sm ring-1 ring-neon-cyan/40'
                                : 'text-slate-400 hover:bg-night-800 hover:text-neon-cyan'
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="card-neon mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Paket</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Harga</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Payment</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Info</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {memberships.map((m: any) => (
                            <MembershipRow
                                key={m.id}
                                purchase={m}
                                editing={editing === m.id}
                                onToggle={() => setEditing(editing === m.id ? null : m.id)}
                            />
                        ))}
                    </tbody>
                </table>

                {memberships.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        Tidak ada data pada tab ini.
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

function MembershipRow({ purchase: m, editing, onToggle }: any) {
    return (
        <>
            <tr className="hover:bg-night-800/50">
                <td className="px-4 py-3 font-mono font-bold text-neon-cyan">#{m.id}</td>
                <td className="px-4 py-3">
                    <div className="text-slate-200">{m.user?.nama}</div>
                    <div className="text-xs text-slate-500">{m.user?.no_hp}</div>
                </td>
                <td className="px-4 py-3">
                    <span className="badge-neon border border-neon-cyan/40 bg-neon-cyan/10 uppercase text-neon-cyan">
                        {m.tier?.nama_tier}
                    </span>
                </td>
                <td className="px-4 py-3 text-slate-300">
                    Rp {Number(m.harga_paket).toLocaleString('id-ID')}
                </td>
                <td className="px-4 py-3">
                    <span className={`badge-neon border ${
                        m.payment_status === 'sudah_bayar'
                            ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                            : m.payment_status === 'ditolak'
                              ? 'border-neon-red/40 bg-neon-red/10 text-neon-red'
                              : 'border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow'
                    }`}>
                        {m.payment_status === 'sudah_bayar' ? 'Lunas' : m.payment_status === 'ditolak' ? 'Ditolak' : 'Belum Bayar'}
                    </span>
                </td>
                <td className="px-4 py-3">
                    <span className={`badge-neon border ${STATUS_STYLE[m.membership_status] || ''}`}>
                        {m.membership_status}
                    </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                    {m.valid_until && <div>Aktif s/d {new Date(m.valid_until).toLocaleDateString('id-ID')}</div>}
                    {m.expires_at && <div>Batas bayar {new Date(m.expires_at).toLocaleString('id-ID')}</div>}
                    {m.reminder_h1_sent_at && <div className="text-neon-green">📧 Reminder H-1</div>}
                    {m.expired_notif_sent_at && <div className="text-neon-red">📧 Notif expired</div>}
                </td>
                <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                        {/* Tombol Kirim Template WA — generate link wa.me, admin kirim manual */}
                        {m.user?.no_hp && (
                            <a
                                href={`https://wa.me/${m.user.no_hp.replace(/^0/, '62')}?text=${encodeURIComponent(buildReminderMessage(m))}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-neon !px-3 !py-1.5 !text-xs"
                            >
                                Kirim Template WA
                            </a>
                        )}
                        <button
                            onClick={onToggle}
                            className="btn-neon-outline !px-3 !py-1.5 !text-xs"
                        >
                            {editing ? 'Tutup' : 'Update Status'}
                        </button>
                    </div>
                </td>
            </tr>

            {editing && (
                <tr className="bg-night-800/40">
                    <td colSpan={8} className="px-4 py-4">
                        <MembershipEditForm purchase={m} onDone={onToggle} />
                    </td>
                </tr>
            )}
        </>
    );
}

function MembershipEditForm({ purchase, onDone }: any) {
    const { data, setData, patch, processing } = useForm({
        payment_method: purchase.payment_method || '',
        payment_status: purchase.payment_status,
        membership_status: purchase.membership_status,
    });

    const submit = (e: any) => {
        e.preventDefault();
        patch(route('admin.memberships.update', purchase.id), { onSuccess: onDone });
    };

    // Payment ditolak -> membership status otomatis cancelled
    // Payment sudah_bayar -> otomatis active (aktifkan tier)
    const locked = data.payment_status !== 'belum_bayar';

    const changePayment = (value: string) => {
        setData({
            ...data,
            payment_status: value,
            membership_status:
                value === 'ditolak'
                    ? 'cancelled'
                    : value === 'sudah_bayar'
                      ? 'active'
                      : data.membership_status,
        });
    };

    return (
        <form onSubmit={submit} className="mt-3 grid gap-3 rounded-lg border border-night-600 bg-night-800/60 p-4 sm:grid-cols-3">
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
                <label className="label-neon">Membership Status</label>
                <CustomSelect
                    value={data.membership_status}
                    onChange={(v) => setData('membership_status', v)}
                    disabled={locked}
                    options={[
                        { value: 'pending_payment', label: 'Pending' },
                        { value: 'active', label: 'Active' },
                        { value: 'expired', label: 'Expired' },
                        { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    hint={
                        locked
                            ? data.payment_status === 'ditolak'
                                ? 'Otomatis: Cancelled'
                                : 'Otomatis: Active'
                            : undefined
                    }
                />
            </div>
            <div className="sm:col-span-3">
                <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs">
                    Simpan (konfirmasi lunas → aktifkan + set tier otomatis)
                </button>
            </div>
        </form>
    );
}
