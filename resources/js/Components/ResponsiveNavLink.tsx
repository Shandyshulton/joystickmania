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
                    ? 'border-accent-light bg-night-800 text-accent-light focus:border-accent-light focus:bg-night-700 focus:text-accent-light'
                    : 'border-transparent text-slate-400 hover:border-night-500 hover:bg-night-800 hover:text-accent-light focus:border-night-500 focus:bg-night-800 focus:text-accent-light'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
