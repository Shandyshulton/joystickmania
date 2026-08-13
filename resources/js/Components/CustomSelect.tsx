import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
    value: string;
    label: string;
}

/**
 * Dropdown custom (menggantikan <select> bawaan) dengan tema neon.
 * Mendukung: disabled, hint di bawah, list yang bisa di-scroll.
 */
export default function CustomSelect({
    value,
    onChange,
    options,
    disabled = false,
    placeholder = 'Pilih...',
    hint,
}: {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    disabled?: boolean;
    placeholder?: string;
    hint?: string;
}) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = options.find((o) => o.value === value);

    // Tutup saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tutup saat disabled
    useEffect(() => {
        if (disabled) setOpen(false);
    }, [disabled]);

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                disabled={disabled}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-sm transition ${
                    disabled
                        ? 'cursor-not-allowed border-night-600 bg-night-800/40 text-slate-500'
                        : 'border-night-600 bg-night-700/60 text-white hover:border-neon-blue/60'
                }`}
            >
                <span className={selected ? 'text-white' : 'text-slate-500'}>
                    {selected ? selected.label : placeholder}
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
            </button>

            {open && !disabled && (
                <div className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-night-600 bg-night-800 py-1 shadow-neon-sm">
                    {options.map((opt) => {
                        const isActive = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm transition ${
                                    isActive
                                        ? 'bg-neon-blue/15 font-semibold text-neon-cyan'
                                        : 'text-slate-300 hover:bg-night-700 hover:text-white'
                                }`}
                            >
                                {opt.label}
                                {isActive && (
                                    <span className="text-neon-cyan">✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {hint && !disabled && (
                <p className="mt-1 text-[10px] text-slate-500">{hint}</p>
            )}
        </div>
    );
}
