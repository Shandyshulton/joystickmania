import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';

const TIER_STYLE: Record<string, string> = {
    bronze: 'border-orange-400/50 text-orange-300',
    silver: 'border-slate-300/50 text-slate-200',
    gold: 'border-yellow-400/60 text-yellow-300',
};

export default function Membership({ tiers, auth }: any) {
    const userTier = auth?.user?.membership_tier;

    return (
        <PublicLayout>
            <Head title="Membership" />

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h1 className="font-display text-3xl font-bold tracking-wide text-white sm:text-4xl">
                        MEMBERSHIP <span className="text-accent-light">NEON</span>
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-slate-400">
                        Bronze gratis untuk semua akun. Upgrade ke Silver/Gold untuk diskon
                        otomatis & benefit eksklusif. Berlaku 1 bulan sejak dikonfirmasi.
                    </p>
                </div>

                <div className="mt-12 grid gap-6 md:grid-cols-3">
                    {tiers?.map((t: any) => {
                        const isCurrent = userTier === t.nama_tier;
                        return (
                            <div
                                key={t.id}
                                className={`card-console relative flex flex-col p-6 ${
                                    t.nama_tier === 'gold' ? 'shadow-solid-sm ring-1 ring-warn/30' : ''
                                }`}
                            >
                                {t.nama_tier === 'gold' && (
                                    <span className="badge-console absolute -top-3 left-1/2 -translate-x-1/2 bg-warn/20 text-warn ring-1 ring-warn/50">
                                        ★ PALING LARIS
                                    </span>
                                )}
                                <h3
                                    className={`font-display text-2xl font-bold uppercase tracking-widest ${
                                        TIER_STYLE[t.nama_tier] || 'text-white'
                                    }`}
                                >
                                    {t.nama_tier}
                                </h3>
                                <div className="mt-4 font-display text-4xl font-black text-white">
                                    {t.harga_paket === 0 ? (
                                        'GRATIS'
                                    ) : (
                                        <>
                                            Rp{' '}
                                            {Number(t.harga_paket).toLocaleString('id-ID')}
                                            <span className="text-base font-medium text-slate-500">
                                                /bulan
                                            </span>
                                        </>
                                    )}
                                </div>
                                <div className="mt-4 space-y-2 text-sm text-slate-400">
                                    {t.harga_paket > 0 && (
                                        <p className="font-semibold text-accent-light">
                                            Diskon {t.diskon_persen}% semua booking room
                                        </p>
                                    )}
                                    <p>{t.benefit_lain}</p>
                                    {t.masa_berlaku_hari > 0 && (
                                        <p>Masa berlaku {t.masa_berlaku_hari} hari</p>
                                    )}
                                </div>

                                <div className="mt-auto pt-6">
                                    {isCurrent ? (
                                        <div className="badge-console w-full justify-center border border-ok/50 bg-ok/10 py-2 text-ok">
                                            ✓ Tier Aktif Anda
                                        </div>
                                    ) : t.nama_tier === 'bronze' ? (
                                        <div className="badge-console w-full justify-center border border-night-500 bg-night-700 py-2 text-slate-400">
                                            Default Akun
                                        </div>
                                    ) : (
                                        // Sengaja menunjuk route beli (bukan /login): middleware
                                        // auth:web menyimpan url.intended, jadi setelah masuk/daftar
                                        // pengunjung langsung mendarat di tahap pemesanan tier ini.
                                        <Link
                                            href={`/membership/beli/${t.id}`}
                                            className={
                                                auth?.user
                                                    ? 'btn-primary w-full'
                                                    : 'btn-soft w-full'
                                            }
                                        >
                                            Beli / Upgrade
                                        </Link>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {!auth?.user && (
                    <p className="mt-6 text-center text-sm text-slate-400">
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-accent-light underline hover:text-ok"
                        >
                            Daftar gratis
                        </Link>{' '}
                        — tier Bronze tanpa biaya, langsung bisa pesan.
                    </p>
                )}

                <div className="card-console mt-10 p-6 text-sm text-slate-400">
                    <h4 className="font-display text-base font-bold text-white">
                        Cara kerja pembayaran
                    </h4>
                    <ol className="mt-3 list-decimal space-y-1 pl-5">
                        <li>Pilih paket Silver/Gold (wajib login).</li>
                        <li>Slot pembayaran dikunci 30 menit — segera konfirmasi via WhatsApp.</li>
                        <li>Admin kirim metode bayar (transfer/QRIS manual), lalu aktivasi setelah bukti diterima.</li>
                        <li>Tier aktif 1 bulan, diskon otomatis terpasang saat booking room.</li>
                    </ol>
                </div>
            </div>
        </PublicLayout>
    );
}
