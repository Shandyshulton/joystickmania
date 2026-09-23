import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Toast from '@/Components/Toast';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

/**
 * Tombol pembuka menu profil. Dipisah agar isi trigger tetap ringkas;
 * state aria-expanded sudah disediakan oleh Dropdown.Trigger.
 */
function ProfileTriggerContent({ user }: { user: any }) {
    return (
        <>
            <span className="badge-neon shrink-0 border border-neon-cyan/40 text-neon-cyan">
                {user.membership_tier}
            </span>
            <span className="truncate">{user.nama}</span>

            <svg
                className="-me-0.5 ms-2 h-4 w-4 shrink-0"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
            >
                <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                />
            </svg>
        </>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-night-900 bg-neon-grid bg-grid">
            <nav className="border-b border-neon-blue/20 bg-night-900/80 backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2"
                                >
                                    <span className="flex h-8 w-8 items-center justify-center rounded bg-neon-blue font-display text-lg font-black text-night-950 shadow-neon-sm">
                                        JM
                                    </span>
                                    <span className="hidden font-display text-base font-bold tracking-widest text-white sm:block">
                                        JOYSTICK
                                        <span className="text-neon-cyan">
                                            MANIA
                                        </span>
                                    </span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 lg:-my-px lg:ms-10 lg:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('membership')}
                                    active={route().current('membership')}
                                >
                                    Membership
                                </NavLink>
                                <NavLink
                                    href={route('availability')}
                                    active={route().current('availability')}
                                >
                                    Cek Ketersediaan
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden lg:ms-6 lg:flex lg:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger className="inline-flex max-w-[16rem] items-center gap-2 rounded-md border border-night-600 bg-night-800 px-3 py-2 text-sm font-medium leading-4 text-slate-300 transition hover:text-neon-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan">
                                        <ProfileTriggerContent user={user} />
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Keluar
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-1 flex items-center gap-1 lg:hidden">
                            <Dropdown>
                                <Dropdown.Trigger className="inline-flex h-11 max-w-[10rem] items-center gap-2 rounded-md border border-night-600 bg-night-800 px-2.5 text-sm font-medium leading-4 text-slate-300 transition hover:text-neon-cyan focus:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan">
                                    <ProfileTriggerContent user={user} />
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        Profil
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        Keluar
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>

                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex h-11 w-11 items-center justify-center rounded-md text-slate-400 transition hover:bg-night-700 hover:text-neon-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan"
                                aria-label="Menu"
                                aria-expanded={showingNavigationDropdown}
                                aria-controls="member-mobile-nav"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    id="member-mobile-nav"
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain border-t border-night-600 bg-night-950 pb-2 lg:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('membership')}
                            active={route().current('membership')}
                        >
                            Membership
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('availability')}
                            active={route().current('availability')}
                        >
                            Cek Ketersediaan
                        </ResponsiveNavLink>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="border-b border-night-600 bg-night-800/50">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>

            <Toast />
        </div>
    );
}
