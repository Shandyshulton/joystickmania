import InputLabel from '@/Components/InputLabel';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function BuyMembership({ tier, waAdmin }: any) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('membership.buy.store', tier.id));
    };

    return (
        <PublicLayout>
            <Head title={`Beli ${tier.nama_tier}`} />

            <div className="mx-auto max-w-xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="card-neon bg-neon-radial p-8 text-center">
                    <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-white">
                        Beli Membership{' '}
                        <span className="text-neon-cyan">{tier.nama_tier}</span>
                    </h1>

                    <div className="mt-6 rounded-lg border border-night-600 bg-night-800/60 p-5 text-left text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Paket</span>
                            <span className="font-bold uppercase text-white">{tier.nama_tier}</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                            <span className="text-slate-500">Harga</span>
                            <span className="font-bold text-neon-cyan">
                                Rp {Number(tier.harga_paket).toLocaleString('id-ID')}
                            </span>
                        </div>
                        <div className="mt-2 flex justify-between">
                            <span className="text-slate-500">Diskon Booking</span>
                            <span className="text-neon-green">{tier.diskon_persen}%</span>
                        </div>
                        <div className="mt-2 flex justify-between">
                            <span className="text-slate-500">Masa Berlaku</span>
                            <span className="text-slate-200">{tier.masa_berlaku_hari} hari</span>
                        </div>
                    </div>

                    <form onSubmit={submit} className="mt-6">
                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-neon-solid w-full animate-glow-pulse !py-3 !text-base"
                        >
                            {processing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
                        </button>
                    </form>

                    <p className="mt-3 text-xs text-slate-500">
                        Slot pembayaran dikunci 30 menit. Setelah submit, Anda diarahkan ke
                        WhatsApp untuk konfirmasi.
                    </p>
                    <Link href="/membership" className="mt-4 inline-block text-sm text-neon-cyan hover:underline">
                        ← Kembali ke halaman membership
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
