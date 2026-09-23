import Toast from '@/Components/Toast';
import UserAvatar from '@/Components/UserAvatar';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useId, useState } from 'react';

/**
 * Menu profil (avatar/nama + dropdown). Dipakai di baris desktop dan
 * di samping tombol hamburger pada layar kecil, sehingga Edit Profil
 * tidak perlu masuk ke drawer navigasi.
 */
function ProfileMenu({
    user,
    showName = false,
}: {
    user: any;
    showName?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const menuId = useId();
    const close = () => setOpen(false);

    const itemClass =
        'block px-4 py-2.5 text-sm text-slate-300 hover:bg-night-700 hover:text-neon-cyan';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-label={showName ? undefined : 'Menu profil'}
                aria-expanded={open}
                aria-controls={menuId}
                className={`flex h-11 items-center gap-2 rounded-full px-1 transition hover:ring-2 hover:ring-neon-cyan/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan ${
                    showName ? 'max-w-[11rem]' : ''
                }`}
            >
                <UserAvatar
                    name={user.nama}
                    size={showName ? 'h-9 w-9' : 'h-8 w-8'}
                />
                {showName && (
                    <>
                        <span className="min-w-0 flex-1 truncate text-left text-sm font-semibold text-slate-200">
                            {user.nama}
                        </span>
                        <svg
                            className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                                open ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={close}></div>
                    <div
                        id={menuId}
                        className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-night-600 bg-night-800 shadow-neon-sm"
                    >
                        <div className="border-b border-night-700 px-4 py-3">
                            <div className="truncate text-sm font-semibold text-white">
                                {user.nama}
                            </div>
                            <div className="truncate text-xs text-slate-500">
                                {user.email}
                            </div>
                        </div>
                        <Link
                            href="/dashboard"
                            onClick={close}
                            className={itemClass}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/profile"
                            onClick={close}
                            className={itemClass}
                        >
                            Edit Profil
                        </Link>
                        <Link
                            href="/membership"
                            onClick={close}
                            className={itemClass}
                        >
                            Membership
                        </Link>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onClick={close}
                            className={
                                'block w-full border-t border-night-700 px-4 py-2.5 text-left text-sm text-neon-red hover:bg-night-700'
                            }
                        >
                            Keluar
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
}

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage().props as any;
    const [open, setOpen] = useState(false);

    const navItems = [
        { href: '/', label: 'Beranda' },
        { href: '/cek-ketersediaan', label: 'Cek Ketersediaan' },
        { href: '/booking/fisik', label: 'Sewa Fisik' },
        { href: '/membership', label: 'Membership' },
        { href: '/riwayat', label: 'Riwayat' },
        { href: '/syarat-ketentuan-sewa-fisik', label: 'Syarat & Ketentuan' },
    ];

    return (
        <div className="min-h-screen bg-night-900 bg-neon-grid bg-grid font-sans text-slate-200">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-neon-blue/20 bg-night-900/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="group flex shrink-0 items-center gap-2"
                    >
                        <span className="flex h-8 w-8 items-center justify-center rounded bg-neon-blue font-display text-lg font-black text-night-950 shadow-neon-sm transition group-hover:shadow-neon">
                            JM
                        </span>
                        {/* Wordmark disembunyikan di ponsel kecil agar nama user
                            di samping hamburger muat tanpa merusak baris. */}
                        <span className="hidden font-display text-lg font-bold tracking-widest text-white sm:block">
                            JOYSTICK
                            <span className="text-neon-cyan">MANIA</span>
                        </span>
                    </Link>

                    <div className="hidden items-center gap-1 xl:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="rounded-md px-3 py-2 text-sm font-semibold tracking-wide text-slate-300 transition hover:bg-neon-blue/10 hover:text-neon-cyan"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 xl:flex">
                        {auth.user ? (
                            <>
                                {['super_admin', 'admin', 'staff'].includes(
                                    auth.user.role,
                                ) && (
                                    <Link
                                        href="/admin"
                                        className="btn-neon-outline !px-4 !py-2 !text-xs"
                                    >
                                        Panel Admin
                                    </Link>
                                )}
                                <Link
                                    href="/membership"
                                    className="rounded-full border border-neon-cyan/40 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neon-cyan hover:bg-neon-cyan/10"
                                >
                                    ⭐ {auth.user.membership_tier}
                                </Link>

                                <ProfileMenu user={auth.user} />
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="btn-neon-outline !px-4 !py-2 !text-xs"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/register"
                                    className="btn-neon-solid !px-4 !py-2 !text-xs"
                                >
                                    Daftar
                                </Link>
                                {/* Icon user default untuk guest */}
                                <span
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-night-600 bg-night-800 text-slate-500"
                                    title="Belum login"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                </span>
                            </>
                        )}
                    </div>

                    {/* Menu profil + hamburger mobile */}
                    <div className="flex items-center gap-1 xl:hidden">
                        {auth.user && <ProfileMenu user={auth.user} showName />}
                        <button
                            onClick={() => setOpen(!open)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-night-700 hover:text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                            aria-label="Menu"
                            aria-expanded={open}
                            aria-controls="public-mobile-nav"
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
                </div>

                {/* Menu mobile */}
                {open && (
                    <div
                        id="public-mobile-nav"
                        className="max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain border-t border-night-600 bg-night-800 px-4 pb-4 pt-2 xl:hidden"
                    >
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-md px-3 py-2.5 text-sm font-semibold text-slate-300 hover:bg-night-700 hover:text-neon-cyan"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="mt-3 flex gap-3 border-t border-night-600 pt-3">
                            {auth.user ? (
                                <>
                                    {['super_admin', 'admin', 'staff'].includes(
                                        auth.user.role,
                                    ) && (
                                        <Link
                                            href="/admin"
                                            className="btn-neon-outline w-full !py-2 !text-xs"
                                        >
                                            Panel Admin
                                        </Link>
                                    )}
                                    <Link
                                        href="/dashboard"
                                        className="btn-neon-solid w-full !py-2 !text-xs"
                                    >
                                        Dashboard
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="btn-neon-outline w-full !py-2 !text-xs"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="btn-neon-solid w-full !py-2 !text-xs"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            <main>{children}</main>

            <Toast />

            {/* Footer */}
            <footer className="mt-16 border-t border-night-600 bg-night-950/60">
                <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex h-8 w-8 items-center justify-center rounded bg-neon-blue font-display text-lg font-black text-night-950">
                                JM
                            </span>
                            <span className="font-display text-base font-bold tracking-widest text-white">
                                JOYSTICK
                                <span className="text-neon-cyan">MANIA</span>
                            </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-400">
                            Rental PlayStation — main di tempat atau sewa unit
                            dibawa pulang. PS3 • PS4 • PS5.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-neon-cyan">
                            Layanan
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm text-slate-400">
                            <li>
                                <Link
                                    href="/cek-ketersediaan"
                                    className="hover:text-neon-cyan"
                                >
                                    Sewa Room
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/cek-ketersediaan"
                                    className="hover:text-neon-cyan"
                                >
                                    Sewa Unit Fisik
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/membership"
                                    className="hover:text-neon-cyan"
                                >
                                    Membership
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-display text-sm font-bold uppercase tracking-wider text-neon-cyan">
                            Kontak
                        </h4>
                        <ul className="mt-3 space-y-2 text-sm text-slate-400">
                            <li>Jl. Contoh No. 1, Kota</li>
                            <li>10.00 - 22.00 WIB</li>
                            <li>
                                <a
                                    href={`https://wa.me/${(window as any).joyConfig?.waAdmin || ''}`}
                                    className="text-neon-cyan hover:underline"
                                >
                                    WhatsApp Admin
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-night-700 py-4 text-center text-xs text-slate-500">
                    © {new Date().getFullYear()} JoyStickMania. All rights
                    reserved.
                </div>
            </footer>
        </div>
    );
}
