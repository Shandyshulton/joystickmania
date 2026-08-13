import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-neon-cyan bg-night-800 text-neon-cyan focus:border-neon-cyan focus:bg-night-700 focus:text-neon-cyan'
                    : 'border-transparent text-slate-400 hover:border-night-500 hover:bg-night-800 hover:text-neon-cyan focus:border-night-500 focus:bg-night-800 focus:text-neon-cyan'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
