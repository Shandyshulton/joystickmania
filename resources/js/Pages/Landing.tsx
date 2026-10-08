import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const KONSOL_INFO = [
    { nama: 'PS3', img: '/asset/ps3.jpg', warna: 'from-slate-500 to-slate-700', desc: 'Klasik, banyak game legendaris' },
    { nama: 'PS4', img: '/asset/PS4Versions-removebg-preview.png', warna: 'from-stone-500 to-stone-700', desc: 'Pilihan terpopuler' },
    { nama: 'PS5', img: '/asset/PS5Versions-removebg-preview.png', warna: 'from-orange-500 to-orange-700', desc: 'Generasi terbaru, 4K 120fps' },
];

const GAME_KONSOL_STYLE: Record<string, string> = {
    PS3: 'border-slate-500/50 bg-slate-500/10 text-slate-300',
    PS4: 'border-stone-400/50 bg-stone-400/10 text-stone-300',
    PS5: 'border-accent-light/50 bg-accent-light/10 text-accent-light',
};

export default function Landing({ rooms, psUnits, tiers, games, jamOperasional, alamat, waAdmin }: any) {
    const [gameFilter, setGameFilter] = useState('');
    const filteredGames = gameFilter ? (games || []).filter((g: any) => g.jenis_konsol === gameFilter) : games || [];
    return (
        <PublicLayout>
            <Head title="Beranda" />

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden bg-glow-warm">
                <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6 lg:px-8 lg:py-28">
                    <p className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent-light">
                        PS3 • PS4 • PS5 Rental
                    </p>
                    <h1 className="max-w-3xl font-display text-4xl font-black leading-tight tracking-wide text-white sm:text-5xl lg:text-6xl">
                        MAIN GAME,{' '}
                        <span className="text-accent-light">
                            NIKMATI NEON
                        </span>
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg text-slate-400">
                        Sewa room PlayStation di tempat atau bawa pulang unit PS3/PS4/PS5.
                        Booking mudah, bayar manual via WhatsApp, langsung konfirmasi admin.
                    </p>
                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                        <Link
                            href="/cek-ketersediaan"
                            className="btn-primary animate-nudge !px-8 !py-3 !text-base"
                        >
                            Cek Ketersediaan & Booking
                        </Link>
                        <Link
                            href="/membership"
                            className="btn-outline !px-8 !py-3 !text-base"
                        >
                            Lihat Membership
                        </Link>
                        <Link
                            href="/booking/fisik"
                            className="btn-outline !px-8 !py-3 !text-base"
                        >
                            Sewa Unit Fisik
                        </Link>
                    </div>

                    <div className="mt-12 grid w-full max-w-2xl grid-cols-3 gap-3 text-center">
                        {[
                            ['3+', 'Konsol'],
                            ['3', 'Room'],
                            ['6+', 'Unit Fisik'],
                        ].map(([num, label]) => (
                            <div key={label} className="card-console px-4 py-5">
                                <div className="font-display text-2xl font-black text-accent-light">
                                    {num}
                                </div>
                                <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">
                                    {label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DAFTAR KONSOL ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-center font-display text-3xl font-bold tracking-wide text-white">
                    KONSOL <span className="text-accent-light">SIAP MAIN</span>
                </h2>
                <div className="mt-10 grid gap-6 sm:grid-cols-3">
                    {KONSOL_INFO.map((k) => (
                        <div key={k.nama} className="card-console group overflow-hidden p-6 text-center">
                            <div className="mx-auto flex h-44 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-night-700 to-night-950 transition group-hover:shadow-solid-lg">
                                <img
                                    src={k.img}
                                    alt={`Konsol ${k.nama}`}
                                    className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
                                    loading="lazy"
                                />
                            </div>
                            <h3 className="mt-4 font-display text-xl font-bold text-white">
                                {k.nama}
                            </h3>
                            <p className="mt-1 text-sm text-slate-400">{k.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== DAFTAR GAME ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="font-display text-3xl font-bold tracking-wide text-white">
                        DAFTAR <span className="text-accent-light">GAME</span>
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-slate-400">
                        Pilih konsol untuk melihat koleksi game yang tersedia.
                    </p>
                </div>

                {/* Filter konsol */}
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <button
                        onClick={() => setGameFilter('')}
                        className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                            gameFilter === ''
                                ? 'bg-accent/15 text-accent-light shadow-solid-sm ring-1 ring-accent-light/40'
                                : 'text-slate-400 hover:bg-night-800 hover:text-accent-light'
                        }`}
                    >
                        Semua
                    </button>
                    {['PS3', 'PS4', 'PS5'].map((k) => (
                        <button
                            key={k}
                            onClick={() => setGameFilter(k)}
                            className={`rounded-lg px-5 py-2 text-sm font-semibold transition ${
                                gameFilter === k
                                    ? 'bg-accent/15 text-accent-light shadow-solid-sm ring-1 ring-accent-light/40'
                                    : 'text-slate-400 hover:bg-night-800 hover:text-accent-light'
                            }`}
                        >
                            {k}
                        </button>
                    ))}
                </div>

                {/* Grid game */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {filteredGames.map((g: any) => (
                        <div key={g.id} className="card-console group overflow-hidden">
                            <div className="flex aspect-square items-center justify-center overflow-hidden bg-night-950">
                                {g.gambar ? (
                                    <img
                                        src={`/storage/${g.gambar}`}
                                        alt={g.nama_game}
                                        className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <span className="font-display text-4xl font-black text-night-600">
                                        🎮
                                    </span>
                                )}
                            </div>
                            <div className="p-3">
                                <div className="truncate font-display text-sm font-bold text-white" title={g.nama_game}>
                                    {g.nama_game}
                                </div>
                                <span className={`badge-console mt-1.5 border ${GAME_KONSOL_STYLE[g.jenis_konsol] || ''}`}>
                                    {g.jenis_konsol}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredGames.length === 0 && (
                    <div className="mt-8 rounded-xl border border-night-600 bg-night-800/60 p-10 text-center text-slate-500">
                        Belum ada game untuk {gameFilter || 'semua konsol'}.
                    </div>
                )}
            </section>

            {/* ===== PREVIEW ROOM ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between">
                    <h2 className="font-display text-3xl font-bold tracking-wide text-white">
                        ROOM <span className="text-accent-light">KAMI</span>
                    </h2>
                    <Link
                        href="/cek-ketersediaan"
                        className="hidden text-sm font-semibold text-accent-light hover:underline sm:block"
                    >
                        Lihat semua →
                    </Link>
                </div>
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    {rooms?.map((room: any) => (
                        <div key={room.id} className="card-console overflow-hidden">
                            <div className="h-36">
                                {room.foto ? (
                                    <img
                                        src={`/storage/${room.foto}`}
                                        alt={room.nama_room}
                                        className="h-36 w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-36 items-center justify-center bg-gradient-to-br from-night-700 to-night-950">
                                        <span className="font-display text-3xl font-black text-accent-light/80">
                                            {room.nama_room}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="font-display text-lg font-bold text-white">
                                    {room.nama_room}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {room.konsol_tersedia?.map((k: string) => (
                                        <span
                                            key={k}
                                            className="badge-console border border-accent/40 text-accent-light"
                                        >
                                            {k}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-3 line-clamp-2 text-sm text-slate-400">
                                    {room.fasilitas}
                                </p>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="font-display text-lg font-bold text-accent-light">
                                        Rp {Number(room.harga_per_jam).toLocaleString('id-ID')}
                                        <span className="text-xs font-medium text-slate-500">/jam</span>
                                    </span>
                                    <Link
                                        href={`/cek-ketersediaan?room_id=${room.id}`}
                                        className="btn-soft !px-4 !py-1.5 !text-xs"
                                    >
                                        Pesan
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== SEWA FISIK ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="card-console overflow-hidden bg-glow-warm">
                    <div className="grid items-center gap-8 p-8 md:grid-cols-2 lg:p-12">
                        <div>
                            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-accent-light">
                                Bawa Pulang
                            </p>
                            <h2 className="mt-2 font-display text-3xl font-bold tracking-wide text-white">
                                SEWA UNIT <span className="text-accent-light">PS FISIK</span>
                            </h2>
                            <p className="mt-4 text-slate-400">
                                Bawa pulang unit PlayStation (PS3/PS4/PS5) beserta
                                kelengkapannya. Durasi sewa 1–7 hari, wajib upload foto KTP
                                sebagai jaminan identitas.
                            </p>

                            <ul className="mt-5 space-y-2 text-sm text-slate-300">
                                <li className="flex items-center gap-2">
                                    <span className="text-ok">✓</span> Unit lengkap: konsol, stik, kabel
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-ok">✓</span> Deposit sesuai jenis konsol
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-ok">✓</span> Deposit dikembalikan penuh bila kondisi baik
                                </li>
                            </ul>

                            <Link
                                href="/booking/fisik"
                                className="btn-primary mt-6 animate-nudge !px-8 !py-3"
                            >
                                Sewa Sekarang
                            </Link>
                        </div>

                        <div className="grid gap-3">
                            {(psUnits || [])
                                .filter(
                                    (u: any, i: number, arr: any[]) =>
                                        arr.findIndex(
                                            (x: any) => x.jenis_konsol === u.jenis_konsol,
                                        ) === i,
                                )
                                .map((u: any) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between rounded-lg border border-night-600 bg-night-800/70 px-5 py-3.5"
                                    >
                                        <span className="font-display text-lg font-bold text-white">
                                            {u.jenis_konsol}
                                        </span>
                                        <div className="text-right text-sm">
                                            <div className="text-accent-light">
                                                Rp {Number(u.harga_sewa).toLocaleString('id-ID')}/hari
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Deposit Rp {Number(u.nominal_deposit).toLocaleString('id-ID')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== MEMBERSHIP HIGHLIGHT ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <h2 className="text-center font-display text-3xl font-bold tracking-wide text-white">
                    MEMBERSHIP <span className="text-accent-light">NEON</span>
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-center text-slate-400">
                    Hemat lebih banyak tiap main — diskon otomatis & benefit eksklusif.
                </p>
                <div className="mt-10 grid gap-6 md:grid-cols-2">
                    {tiers?.map((t: any) => (
                        <div key={t.id} className="card-console relative p-6 text-center">
                            <span className="badge-console absolute right-4 top-4 border border-accent-light/50 bg-accent-light/10 text-accent-light">
                                {t.diskon_persen}% DISKON
                            </span>
                            <h3 className="font-display text-2xl font-bold uppercase tracking-widest text-white">
                                {t.nama_tier}
                            </h3>
                            <div className="mt-3 font-display text-3xl font-black text-accent-light">
                                Rp {Number(t.harga_paket).toLocaleString('id-ID')}
                                <span className="text-sm font-medium text-slate-500">/bulan</span>
                            </div>
                            <p className="mt-3 text-sm text-slate-400">{t.benefit_lain}</p>
                            <Link
                                href="/membership"
                                className="btn-outline mt-5 w-full !text-xs"
                            >
                                Lihat Detail
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            {/* ===== CTA & KONTAK ===== */}
            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="card-console bg-glow-warm p-10 text-center">
                    <h2 className="font-display text-3xl font-bold text-white">
                        SIAP <span className="text-accent-light">BERMAIN?</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-slate-400">
                        {alamat} • {jamOperasional}
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link
                            href="/cek-ketersediaan"
                            className="btn-primary animate-nudge !px-8 !py-3"
                        >
                            Booking Sekarang
                        </Link>
                        <a
                            href={`https://wa.me/${waAdmin}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-outline !px-8 !py-3"
                        >
                            Chat WhatsApp
                        </a>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
