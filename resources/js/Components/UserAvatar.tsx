/**
 * Avatar user — menampilkan inisial nama dengan ring accent.
 * Dipakai di navbar untuk user yang sudah login.
 */
export default function UserAvatar({ name, size = 'h-8 w-8' }: { name: string; size?: string }) {
    const initials = name
        .split(' ')
        .map((p) => p.charAt(0))
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <span
            className={`inline-flex ${size} items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-dark font-display text-xs font-bold text-night-950 shadow-solid-sm ring-2 ring-accent-light/50`}
        >
            {initials || '?'}
        </span>
    );
}
