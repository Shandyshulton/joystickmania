import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-night-500 bg-night-700 text-neon-blue shadow-sm focus:ring-neon-blue ' +
                className
            }
        />
    );
}
