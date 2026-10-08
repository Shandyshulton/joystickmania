import AdminLayout from '@/Layouts/AdminLayout';
import { encryptedPayload } from '@/lib/encryptedPayload';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const ROLE_STYLE: Record<string, string> = {
    super_admin: 'border-danger/50 bg-danger/10 text-danger',
    admin: 'border-muted-accent/50 bg-muted-accent/10 text-muted-accent',
    staff: 'border-accent-light/50 bg-accent-light/10 text-accent-light',
};

const ROLE_LABEL: Record<string, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    staff: 'Staff',
};

export default function AdminUsers({ users, permissionList }: any) {
    const [showAdd, setShowAdd] = useState(false);
    const [editing, setEditing] = useState<number | null>(null);

    return (
        <AdminLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h1 className="font-display text-xl font-bold text-white">
                        Manajemen <span className="text-accent-light">Admin & Role</span>
                    </h1>
                    <button onClick={() => setShowAdd(!showAdd)} className="btn-primary !py-2 !text-xs">
                        + Tambah Admin CMS
                    </button>
                </div>
            }
        >
            <Head title="Manajemen Admin & Role" />

            {showAdd && <AddUserForm onDone={() => setShowAdd(false)} />}

            <div className="card-console mt-4 overflow-x-auto">
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
                menu kecuali Manajemen Admin & Role. Role <b>Staff</b> hanya bisa mengakses
                menu yang dicentang di kolom "Akses".
            </p>
        </AdminLayout>
    );
}

function AddUserForm({ onDone }: any) {
    const { data, setData, post, processing, errors, transform } = useForm({
        nama: '',
        no_hp: '',
        email: '',
        password: '',
        role: 'staff',
    });

    const submit = async (e: any) => {
        e.preventDefault();
        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
        post(route('admin.users.store'), { onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="card-console mt-4 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
                <label className="label-console">Nama</label>
                <input value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="input-console" required />
                {errors.nama && <p className="mt-1 text-xs text-danger">{errors.nama}</p>}
            </div>
            <div>
                <label className="label-console">No. HP</label>
                <input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} className="input-console" required />
                {errors.no_hp && <p className="mt-1 text-xs text-danger">{errors.no_hp}</p>}
            </div>
            <div>
                <label className="label-console">Email</label>
                <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="input-console" required />
                {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
            <div>
                <label className="label-console">Password</label>
                <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="input-console" required />
                {errors.password && <p className="mt-1 text-xs text-danger">{errors.password}</p>}
            </div>
            <div>
                <label className="label-console">Role</label>
                <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="input-console">
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-5">
                <button type="submit" disabled={processing} className="btn-primary w-full !py-2 !text-xs">
                    Simpan Admin
                </button>
            </div>
        </form>
    );
}

function UserRow({ user: u, permissionList, editing, onToggle }: any) {
    const isSuper = u.role === 'super_admin';
    const isAdmin = u.role === 'admin' || isSuper;

    const { data, setData, patch, processing, transform } = useForm({
        nama: u.nama,
        no_hp: u.no_hp,
        email: u.email,
        role: u.role,
        password: '',
    });

    const permForm = useForm({
        permissions: u.permissions || [],
    });

    const saveUser = async (e: any) => {
        e.preventDefault();
        const payload = await encryptedPayload({ ...data });
        transform(() => payload);
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
                    <span className={`badge-console border ${ROLE_STYLE[u.role] || ''}`}>
                        {ROLE_LABEL[u.role] || u.role}
                    </span>
                </td>
                <td className="px-4 py-3">
                    {isSuper ? (
                        <span className="text-xs text-danger">Semua akses</span>
                    ) : isAdmin ? (
                        <span className="text-xs text-muted-accent">Semua menu (kecuali Admin & Role)</span>
                    ) : (
                        <span className="text-xs text-slate-400">
                            {(u.permissions?.length || 0)} menu: {(u.permissions || []).map((p: string) => permissionList?.[p]?.split(' ')[1] || p).join(', ')}
                        </span>
                    )}
                </td>
                <td className="px-4 py-3">
                    <button onClick={onToggle} className="btn-outline !px-3 !py-1.5 !text-xs">
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
                                        <label className="label-console">Nama</label>
                                        <input value={data.nama} onChange={(e) => setData('nama', e.target.value)} className="input-console" required />
                                    </div>
                                    <div>
                                        <label className="label-console">No. HP</label>
                                        <input value={data.no_hp} onChange={(e) => setData('no_hp', e.target.value)} className="input-console" required />
                                    </div>
                                    <div>
                                        <label className="label-console">Email</label>
                                        <input type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="input-console" required />
                                    </div>
                                    <div>
                                        <label className="label-console">Password (kosongkan jika tetap)</label>
                                        <input type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} className="input-console" />
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <label className="label-console">Role</label>
                                    <select value={data.role} onChange={(e) => setData('role', e.target.value)} className="input-console">
                                        <option value="super_admin">Super Admin</option>
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={processing} className="btn-primary mt-3 w-full !py-2 !text-xs">
                                    Simpan Data & Role
                                </button>
                            </form>

                            {/* Permission checklist — hanya untuk staff */}
                            {u.role === 'staff' && (
                                <form onSubmit={savePerms} className="rounded-lg border border-accent-light/30 bg-night-800/60 p-4">
                                    <div className="text-[10px] font-semibold uppercase tracking-wider text-accent-light">
                                        Checklist Permission (Staff)
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Centang menu yang boleh diakses admin/staff ini.
                                    </p>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                        {Object.entries(permissionList).map(([key, label]) => (
                                            <label key={key} className="flex cursor-pointer items-center gap-2 rounded border border-night-600 bg-night-700/40 px-3 py-2 text-sm text-slate-300 hover:border-accent-light/40">
                                                <input
                                                    type="checkbox"
                                                    checked={permForm.data.permissions.includes(key)}
                                                    onChange={() => togglePerm(key)}
                                                    className="h-4 w-4 rounded border-night-500 bg-night-700 text-accent focus:ring-accent"
                                                />
                                                {String(label)}
                                            </label>
                                        ))}
                                    </div>
                                    <button type="submit" disabled={permForm.processing} className="btn-soft mt-3 w-full !py-2 !text-xs">
                                        Simpan Permission
                                    </button>
                                </form>
                            )}

                            {u.role !== 'staff' && !isSuper && (
                                <div className="rounded-lg border border-night-600 bg-night-800/60 p-4 text-xs text-slate-400">
                                    Role <b className="text-muted-accent">Admin</b> otomatis punya semua menu
                                    (kecuali Manajemen Admin & Role). Role <b className="text-danger">Super Admin</b>{' '}
                                    punya segalanya termasuk mengelola admin & role.
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
