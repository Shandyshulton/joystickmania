import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';

const TIER_STYLE: Record<string, string> = {
    bronze: 'border-orange-400/50 text-orange-300',
    silver: 'border-slate-300/50 text-slate-200',
    gold: 'border-yellow-400/60 text-yellow-300',
};

export default function AdminMembers({ members }: any) {
    return (
        <AdminLayout
            header={
                <h1 className="font-display text-xl font-bold text-white">
                    Manajemen <span className="text-neon-cyan">Member</span>
                </h1>
            }
        >
            <Head title="Admin Member" />

            <div className="card-neon overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">No. HP</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Tier</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Booking</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {members.map((m: any) => (
                            <MemberRow key={m.id} member={m} />
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}

function MemberRow({ member }: any) {
    const { data, setData, patch, processing } = useForm({
        membership_tier: member.membership_tier,
    });

    return (
        <tr className="hover:bg-night-800/50">
            <td className="px-4 py-3 text-slate-300">
                {member.nama}
            </td>
            <td className="px-4 py-3 text-slate-300">{member.no_hp}</td>
            <td className="px-4 py-3 text-slate-400">{member.email}</td>
            <td className="px-4 py-3">
                <span className={`badge-neon border uppercase ${TIER_STYLE[member.membership_tier] || 'text-slate-400'}`}>
                    {member.membership_tier}
                </span>
            </td>
            <td className="px-4 py-3 text-slate-300">{member.bookings_count}</td>
            <td className="px-4 py-3">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        patch(route('admin.members.tier', member.id));
                    }}
                    className="flex gap-2"
                >
                    <select
                        value={data.membership_tier}
                        onChange={(e) => setData('membership_tier', e.target.value)}
                        className="input-neon !w-32 !py-1.5 !text-xs"
                    >
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                    </select>
                    <button type="submit" disabled={processing} className="btn-neon !px-3 !py-1.5 !text-xs">
                        Ubah
                    </button>
                </form>
            </td>
        </tr>
    );
}
