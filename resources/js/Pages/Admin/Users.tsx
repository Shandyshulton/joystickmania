import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_STYLE: Record<string, string> = {
    super_admin: 'border-neon-red/50 bg-neon-red/10 text-neon-red',
    admin: 'border-neon-purple/50 bg-neon-purple/10 text-neon-purple',
    staff: 'border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan',
    user: 'border-slate-500/50 bg-slate-500/10 text-slate-400',
};

const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Staff',
    user: 'User',
};

export default function AdminUsers({ users, permissionList }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-neon-cyan">User & Role</span>
                    </h1>
                    <button onClick={() => setShowAdd(!showAdd)} className="btn-neon-solid !py-2 !text-xs">
                        + Tambah User CMS
                    </button>
                </div>
            }
        >
            <Head title="Manajemen User & Role" />

            {showAdd && <AddUserForm onDone={() => setShowAdd(false)} />}

            <div className="card-neon mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-night-600 text-sm">
                    <thead className="bg-night-800/60">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Kontak</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Akses</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-night-700">
                        {users.map((u: any) => (
                            <UserRow
                                key={u.id}
                                user={u}
                                permissionList={permissionList}
                                editing={editing === u.id}
                                onToggle={() => setEditing(editing === u.id ? null : u.id)}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="mt-3 text-xs text-slate-500">
                💡 Role <b>Super Admin</b> punya semua akses. Role <b>Admin</b> punya semua
                menu kecuali Manajemen User & Role. Role <b>Staff</b> hanya bisa mengakses
                menu yang dicentang di kolom "Akses".
            </p>
        </AdminLayout>
    );
}

function AddUserForm({ onDone }: any) {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        no_hp: '',
        email: '',
        password: '',
        role: 'staff',
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route('admin.users.store'), { onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="card-neon mt-4 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
                <label className="label-neon">Nama</label>
                <input value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="input-neon" required />
                {errors.nama && <p className="mt-1 text-xs text-neon-red">{errors.nama}</p>}
            </div>
            <div>
                <label className="label-neon">No. HP</label>
                <input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} className="input-neon" required />
                {errors.no_hp && <p className="mt-1 text-xs text-neon-red">{errors.no_hp}</p>}
            </div>
            <div>
                <label className="label-neon">Email</label>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="input-neon" required />
                {errors.email && <p className="mt-1 text-xs text-neon-red">{errors.email}</p>}
            </div>
            <div>
                <label className="label-neon">Password</label>
                <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="input-neon" required />
                {errors.password && <p className="mt-1 text-xs text-neon-red">{errors.password}</p>}
            </div>
            <div>
                <label className="label-neon">Role</label>
                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="input-neon">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
                <button type="submit" disabled={processing} className="btn-neon-solid w-full !py-2 !text-xs">
                    Simpan User
                </button>
            </div>
        </form>
    );
}

function UserRow({ user: u, permissionList, editing, onToggle }: any) {
    const isSuper = u.role === 'super_admin';
    const isAdmin = u.role === 'admin' || isSuper;

    const { data, setData, patch, processing } = useForm({
        nama: u.nama,
        no_hp: u.no_hp,
        email: u.email,
        role: u.role,
        password: '',
    });

    const permForm = useForm({
        permissions: u.permissions || [],
    });

    const saveUser = (e: any) => {
        e.preventDefault();
        patch(route('admin.users.update', u.id));
    };

    const savePerms = (e: any) => {
        e.preventDefault();
        permForm.patch(route('admin.users.permissions', u.id));
    };

    const togglePerm = (key: string) => {
        const cur = permForm.data.permissions;
        permForm.setData(
            'permissions',
            cur.includes(key) ? cur.filter((k: string) => k !== key) : [...cur, key],
        );
    };

    return (
        <>
            <tr className="hover:bg-night-800/50">
                <td className="px-4 py-3">
                    <div className="font-semibold text-slate-200">{u.nama}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">{u.no_hp}</td>
                <td className="px-4 py-3">
                    <span className={`badge-neon border ${ROLE_STYLE[u.role] || ''}`}>
                        {ROLE_LABEL[u.role] || u.role}
                    </span>
                </td>
                <td className="px-4 py-3">
                    {isSuper ? (
                        <span className="text-xs text-neon-red">Semua akses</span>
                    ) : isAdmin ? (
                        <span className="text-xs text-neon-purple">Semua menu (kecuali User & Role)</span>
                    ) : (
                        <span className="text-xs text-slate-400">
                            {(u.permissions?.length || 0)} menu: {(u.permissions || []).map((p: string) => permissionList?.[p]?.split(' ')[1] || p).join(', ')}
                        </span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <button onClick={onToggle} className="btn-neon-outline !px-3 !py-1.5 !text-xs">
                        {editing ? 'Tutup' : 'Edit'}
                    </button>
                </td>
            </tr>

            {editing && (
                <tr className="bg-night-800/40">
                    <td colSpan={5} className="px-4 py-4">
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Edit data & role */}
                            <form onSubmit={saveUser} className="rounded-lg border border-night-600 bg-night-800/60 p-4">
                                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Data & Role
                                </div>
                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <label className="label-neon">Nama</label>
                                        <input value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="input-neon" required />
                                    </div>
                                    <div>
                                        <label className="label-neon">No. HP</label>
                                        <input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} className="input-neon" required />
                                    </div>
                                    <div>
                                        <label className="label-neon">Email</label>
                                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="input-neon" required />
                                    </div>
                                    <div>
                                        <label className="label-neon">Password (kosongkan jika tetap)</label>
                                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="input-neon" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="label-neon">Role</label>
                                    <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="input-neon">
                                        <option value="super_admin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                        <option value="user">User (member biasa)</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={processing} className="btn-neon-solid mt-3 w-full !py-2 !text-xs">
                                    Simpan Data & Role
                                </button>
                            </form>

                            {/* Permission checklist — hanya untuk staff */}
                            {u.role === 'staff' && (
                                <form onSubmit={savePerms} className="rounded-lg border border-neon-cyan/30 bg-night-800/60 p-4">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-neon-cyan">
                                        Checklist Permission (Staff)
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Centang menu yang boleh diakses user ini.
                                    </p>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        {Object.entries(permissionList).map(([key, label]) => (
                                            <label key={key} className="flex cursor-pointer items-center gap-2 rounded border border-night-600 bg-night-700/40 px-3 py-2 text-sm text-slate-300 hover:border-neon-cyan/40">
                                                <input
                                                    type="checkbox"
                                                    checked={permForm.data.permissions.includes(key)}
                                                    onChange={() => togglePerm(key)}
                                                    className="h-4 w-4 rounded border-night-500 bg-night-700 text-neon-blue focus:ring-neon-blue"
                                                />
                                                {String(label)}
                                            </label>
                                        ))}
                                    </div>
                                    <button type="submit" disabled={permForm.processing} className="btn-neon mt-3 w-full !py-2 !text-xs">
                                        Simpan Permission
                                    </button>
                                </form>
                            )}

                            {u.role !== 'staff' && !isSuper && (
                                <div className="rounded-lg border border-night-600 bg-night-800/60 p-4 text-xs text-slate-400">
                                    Role <b className="text-neon-purple">Admin</b> otomatis punya semua menu
                                    (kecuali Manajemen User & Role). Role <b className="text-neon-red">Super Admin</b>{' '}
                                    punya segalanya termasuk mengelola user & role.
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
