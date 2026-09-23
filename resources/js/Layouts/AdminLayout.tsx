import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

const NAV = [
    { href: '/admin', label: 'Dashboard', icon: '▦', perm: 'dashboard' },
    { href: '/admin/bookings', label: 'Booking Room', icon: '🕹', perm: 'bookings' },
    { href: '/admin/rentals', label: 'Sewa Fisik', icon: '🎮', perm: 'rentals' },
    { href: '/admin/memberships', label: 'Membership', icon: '⭐', perm: 'memberships' },
    { href: '/admin/members', label: 'Member', icon: '👤', perm: 'members' },
    { href: '/admin/rooms', label: 'Rooms', icon: '🏠', perm: 'rooms' },
    { href: '/admin/units', label: 'Unit PS', icon: '📦', perm: 'units' },
    { href: '/admin/tiers', label: 'Tier', icon: '🏆', perm: 'tiers' },
    { href: '/admin/games', label: 'Game', icon: '🎮', perm: 'games' },
    { href: '/admin/settings', label: 'Pengaturan', icon: '⚙', perm: 'settings' },
    { href: '/admin/users', label: 'Admin & Role', icon: '🔐', perm: 'users' },
];

export default function AdminLayout({
    children,
    header,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage().props as any;
    const [open, setOpen] = useState(false);

    // Dipakai untuk menandai menu aktif (sidebar & menu mobile)
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

    const user = auth?.user;
    const isSuper = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin' || isSuper;
    const perms: string[] = user?.permissions || [];

    // Filter menu berdasarkan role & permission
    const hasPerm = (key: string) => isAdmin || perms.includes(key);

    const navItems = NAV.filter((item) => {
        if (item.perm === 'users') return isSuper;
        return hasPerm(item.perm);
    });

    return (
        <div className="min-h-screen bg-night-900 font-sans text-slate-200">
            <div className="flex min-h-screen">
                {/* Sidebar desktop */}
                <aside className="hidden w-60 shrink-0 flex-col border-r border-neon-blue/20 bg-night-950/60 p-4 lg:flex">
                    <Link href="/admin" className="flex items-center gap-2 px-2 py-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-neon-blue font-display text-lg font-black text-night-950 shadow-neon-sm">
                            JM
                        </span>
                        <div>
                            <div className="font-display text-sm font-bold tracking-widest text-white">
                                JOYSTICK<span className="text-neon-cyan">MANIA</span>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-neon-cyan">
                                Admin Panel
                            </div>
                        </div>
                    </Link>

                    <nav className="mt-4 flex-1 space-y-1">
                        {navItems.map((item) => {
                            const active = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                                        active
                                            ? 'bg-neon-blue/15 text-neon-cyan shadow-neon-sm ring-1 ring-neon-cyan/40'
                                            : 'text-slate-400 hover:bg-night-800 hover:text-neon-cyan'
                                    }`}
                                >
                                    <span className="w-5 text-center">{item.icon}</span>
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-night-700 pt-3">
                        <div className="px-3 py-2 text-xs text-slate-500">
                            {auth.user?.nama}
                        </div>
                        <Link
                            href={route('admin.logout')}
                            method="post"
                            as="button"
                            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-neon-red/80 hover:bg-night-800 hover:text-neon-red"
                        >
                            Keluar
                        </Link>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Topbar mobile */}
                    <header className="sticky top-0 z-40 border-b border-neon-blue/20 bg-night-900/80 backdrop-blur-md lg:hidden">
                        <div className="flex h-14 items-center justify-between px-4">
                            <Link href="/admin" className="flex items-center gap-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded bg-neon-blue font-display text-sm font-black text-night-950">
                                    JM
                                </span>
                                <span className="font-display text-sm font-bold tracking-widest text-white">
                                    ADMIN
                                </span>
                            </Link>
                            <button
                                onClick={() => setOpen(!open)}
                                className="flex h-11 w-11 items-center justify-center rounded-md text-slate-300 transition hover:bg-night-700 hover:text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                                aria-label="Menu Admin"
                                aria-expanded={open}
                                aria-controls="admin-mobile-nav"
                            >
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    {open ? (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    ) : (
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 6h16M4 12h16M4 18h16"
                                        />
                                    )}
                                </svg>
                            </button>
                        </div>
                        {open && (
                            <nav
                                id="admin-mobile-nav"
                                className="max-h-[calc(100vh-3.5rem)] overflow-y-auto overscroll-contain border-t border-night-600 bg-night-800 px-4 pb-4 pt-2"
                            >
                                {navItems.map((item) => {
                                    const active = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setOpen(false)}
                                            aria-current={active ? 'page' : undefined}
                                            className={`block rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                                                active
                                                    ? 'bg-neon-blue/15 text-neon-cyan ring-1 ring-neon-cyan/40'
                                                    : 'text-slate-300 hover:bg-night-700 hover:text-neon-cyan'
                                            }`}
                                        >
                                            {item.icon} {item.label}
                                        </Link>
                                    );
                                })}
                                <Link
                                    href={route('admin.logout')}
                                    method="post"
                                    as="button"
                                    className="mt-2 block w-full rounded-md border-t border-night-600 px-3 py-2.5 text-left text-sm text-neon-red/80 hover:bg-night-700 hover:text-neon-red"
                                >
                                    Keluar
                                </Link>
                            </nav>
                        )}
                    </header>

                    {header && (
                        <div className="border-b border-night-700 bg-night-800/40 px-4 py-4 sm:px-6">
                            {header}
                        </div>
                    )}

                    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>

            <Toast />
        </div>
    );
}
