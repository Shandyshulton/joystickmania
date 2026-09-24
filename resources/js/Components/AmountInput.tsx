import { InputHTMLAttributes } from 'react';

type Props = {
    value: string | number | null | undefined;
    onValueChange: (value: string) => void;
    prefix?: string;
    suffix?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'>;

/**
 * Input angka untuk nominal (harga, deposit, kuota).
 *
 * Nilainya disimpan sebagai string, bukan number: Number('') menghasilkan 0,
 * jadi field yang dikosongkan langsung tampil "0" dan angka baru menempel di
 * belakangnya ("025000"). Hanya digit yang diterima, pemisah ribuan tidak
 * disimpan ke form state.
 */
export default function AmountInput({
    value,
    onValueChange,
    prefix,
    suffix,
    className = '',
    ...rest
}: Props) {
    return (
        <div className="relative flex items-center">
            {prefix && (
                <span className="pointer-events-none absolute left-3 text-xs font-semibold text-slate-500">
                    {prefix}
                </span>
            )}

            <input
                inputMode="numeric"
                autoComplete="off"
                value={value ?? ''}
                onChange={(e) => onValueChange(e.target.value.replace(/\D/g, ''))}
                className={`input-neon ${prefix ? 'pl-11' : ''} ${suffix ? 'pr-14' : ''} ${className}`}
                {...rest}
            />

            {suffix && (
                <span className="pointer-events-none absolute right-3 text-xs font-semibold text-slate-500">
                    {suffix}
                </span>
            )}
        </div>
    );
}
