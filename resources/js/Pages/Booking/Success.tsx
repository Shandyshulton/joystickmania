import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function buildWaMessage(tipe: string, b: any): string {
    const lines = [
        `Halo JoyStickMania! Saya ingin konfirmasi pemesanan berikut:`,
        ``,
    ];

    if (tipe === 'room') {
        lines.push(
            `BOOKING ROOM #${b.id}`,
            `Nama: ${b.nama}`,
            `Room: ${b.room?.nama_room}`,
            `Konsol: ${b.konsol}`,
            `Tanggal: ${b.tanggal}`,
            `Jam: ${b.jam_mulai} (${b.durasi} jam)`,
            `Total: Rp ${Number(b.harga_total).toLocaleString('id-ID')}`,
        );
    } else if (tipe === 'fisik') {
        lines.push(
            `SEWA FISIK #${b.id}`,
            `Nama: ${b.nama}`,
            `Unit: ${b.ps_unit?.kode_unit} (${b.ps_unit?.jenis_konsol})`,
            `Periode: ${b.tanggal_mulai} s/d ${b.tanggal_kembali}`,
            `Biaya sewa: Rp ${Number(b.total_biaya).toLocaleString('id-ID')}`,
            `Deposit: Rp ${Number(b.nominal_deposit).toLocaleString('id-ID')}`,
        );
    } else if (tipe === 'membership') {
        lines.push(
            `MEMBERSHIP #${b.id}`,
            `Paket: ${b.tier?.nama_tier}`,
            `Harga: Rp ${Number(b.harga_paket).toLocaleString('id-ID')}`,
        );
    }

    lines.push(``, `Mohon info metode pembayarannya. Terima kasih!`);
    return lines.join('\n');
}

type BookingStatus = 'pending' | 'confirmed' | 'expired';

export default function Success({ booking, waAdmin, tipe }: any) {
    const [status, setStatus] = useState<BookingStatus>('pending');
    const [secondsLeft, setSecondsLeft] = useState(30 * 60);

    // Countdown mundur
    useEffect(() => {
        const interval = setInterval(() => {
            setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Polling status booking setiap 5 detik (fetch JSON biasa)
    useEffect(() => {
        let cancelled = false;

        const checkStatus = async () => {
            try {
                const url = `/booking/status?tipe=${tipe}&id=${booking?.id}`;
                const res = await fetch(url, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok || cancelled) return;

                const data = await res.json();
                if (data.status === 'confirmed' || data.status === 'active') {
                    setStatus('confirmed');
                } else if (data.status === 'expired') {
                    setStatus('expired');
                }
            } catch {
                // abaikan error jaringan, coba lagi di interval berikutnya
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 5000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [booking?.id, tipe]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const waLink = `https://wa.me/${waAdmin}?text=${encodeURIComponent(buildWaMessage(tipe, booking))}`;

    // ===== Admin sudah accept =====
    if (status === 'confirmed') {
        return (
            <PublicLayout>
                <Head title="Berhasil Terbooking" />

                <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="card-neon border-neon-green/50 bg-neon-radial p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-green bg-neon-green/10 text-3xl text-neon-green shadow-neon-green">
                            ✓
                        </div>
                        <h1 className="mt-5 font-display text-2xl font-bold text-white">
                            BERHASIL <span className="text-neon-green">TERBOOKING!</span>
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Pembayaran kamu sudah dikonfirmasi admin. Booking #{booking?.id}{' '}
                            {tipe === 'room'
                                ? 'resmi terkunci.'
                                : tipe === 'fisik'
                                  ? 'resmi terdaftar.'
                                  : 'membership aktif.'}
                        </p>

                        {/* Ringkasan */}
                        <div className="mt-6 rounded-lg border border-night-600 bg-night-800/60 p-5 text-left text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">ID Booking</span>
                                <span className="font-mono font-bold text-neon-cyan">#{booking?.id}</span>
                            </div>
                            {tipe === 'room' && (
                                <>
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-slate-500">Room</span>
                                        <span className="text-slate-200">{booking?.room?.nama_room}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-slate-500">Jadwal</span>
                                        <span className="text-slate-200">
                                            {booking?.tanggal} • {booking?.jam_mulai} ({booking?.durasi} jam)
                                        </span>
                                    </div>
                                </>
                            )}
                            {tipe === 'fisik' && (
                                <>
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-slate-500">Unit</span>
                                        <span className="text-slate-200">{booking?.ps_unit?.kode_unit}</span>
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                        <span className="text-slate-500">Periode</span>
                                        <span className="text-slate-200">
                                            {booking?.tanggal_mulai} → {booking?.tanggal_kembali}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="mt-2 flex justify-between border-t border-night-600 pt-2">
                                <span className="text-slate-500">Total Bayar</span>
                                <span className="font-bold text-neon-cyan">
                                    Rp{' '}
                                    {Number(
                                        tipe === 'room'
                                            ? booking?.harga_total
                                            : tipe === 'fisik'
                                              ? booking?.total_biaya
                                              : booking?.harga_paket,
                                    ).toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:justify-center">
                            <Link href="/riwayat" className="btn-neon-solid !px-6 !py-2.5 !text-xs">
                                Lihat Riwayat Booking
                            </Link>
                            <Link href="/" className="btn-neon-outline !px-6 !py-2.5 !text-xs">
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    // ===== Booking expired =====
    if (status === 'expired' || secondsLeft === 0) {
        return (
            <PublicLayout>
                <Head title="Booking Kedaluwarsa" />

                <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
                    <div className="card-neon border-neon-red/50 bg-neon-radial p-8 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-red bg-neon-red/10 text-3xl text-neon-red shadow-neon-red">
                            !
                        </div>
                        <h1 className="mt-5 font-display text-2xl font-bold text-white">
                            BOOKING <span className="text-neon-red">KEDALUWARSA</span>
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Batas waktu pembayaran 30 menit sudah lewat tanpa konfirmasi.
                            Slot booking kamu telah dilepas dan bisa dipesan orang lain.
                        </p>

                        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:justify-center">
                            <Link href="/cek-ketersediaan" className="btn-neon-solid !px-6 !py-2.5 !text-xs">
                                Booking Ulang
                            </Link>
                            <Link href="/" className="btn-neon-outline !px-6 !py-2.5 !text-xs">
                                Kembali ke Beranda
                            </Link>
                        </div>
                    </div>
                </div>
            </PublicLayout>
        );
    }

    // ===== Pending payment (countdown + WA) =====
    return (
        <PublicLayout>
            <Head title="Booking Dibuat" />

            <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="card-neon border-neon-green/40 bg-neon-radial p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-yellow bg-neon-yellow/10 text-3xl text-neon-yellow shadow-neon-yellow">
                        ⏳
                    </div>
                    <h1 className="mt-5 font-display text-2xl font-bold text-white">
                        MENUNGGU <span className="text-neon-yellow">PEMBAYARAN</span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Slot sudah dikunci untuk Anda. Selesaikan pembayaran dalam:
                    </p>

                    {/* Countdown */}
                    <div className="mx-auto mt-4 inline-flex items-center gap-1 rounded-lg border border-neon-yellow/40 bg-neon-yellow/10 px-5 py-2 font-mono text-2xl font-bold text-neon-yellow">
                        <span>{String(minutes).padStart(2, '0')}</span>
                        <span>:</span>
                        <span>{String(seconds).padStart(2, '0')}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                        Setelah 30 menit tanpa konfirmasi, booking otomatis dibatalkan.
                        Halaman ini akan otomatis terupdate jika admin sudah mengonfirmasi.
                    </p>

                    {/* Ringkasan */}
                    <div className="mt-6 rounded-lg border border-night-600 bg-night-800/60 p-5 text-left text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">ID Booking</span>
                            <span className="font-mono font-bold text-neon-cyan">#{booking?.id}</span>
                        </div>
                        {tipe === 'room' && (
                            <>
                                <div className="mt-2 flex justify-between">
                                    <span className="text-slate-500">Room</span>
                                    <span className="text-slate-200">{booking?.room?.nama_room}</span>
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <span className="text-slate-500">Jadwal</span>
                                    <span className="text-slate-200">
                                        {booking?.tanggal} • {booking?.jam_mulai} ({booking?.durasi} jam)
                                    </span>
                                </div>
                            </>
                        )}
                        {tipe === 'fisik' && (
                            <>
                                <div className="mt-2 flex justify-between">
                                    <span className="text-slate-500">Unit</span>
                                    <span className="text-slate-200">{booking?.ps_unit?.kode_unit}</span>
                                </div>
                                <div className="mt-2 flex justify-between">
                                    <span className="text-slate-500">Periode</span>
                                    <span className="text-slate-200">
                                        {booking?.tanggal_mulai} → {booking?.tanggal_kembali}
                                    </span>
                                </div>
                            </>
                        )}
                        {tipe === 'membership' && (
                            <div className="mt-2 flex justify-between">
                                <span className="text-slate-500">Paket</span>
                                <span className="uppercase text-slate-200">{booking?.tier?.nama_tier}</span>
                            </div>
                        )}
                        <div className="mt-2 flex justify-between border-t border-night-600 pt-2">
                            <span className="text-slate-500">Total Bayar</span>
                            <span className="font-bold text-neon-cyan">
                                Rp{' '}
                                {Number(
                                    tipe === 'room'
                                        ? booking?.harga_total
                                        : tipe === 'fisik'
                                          ? booking?.total_biaya
                                          : booking?.harga_paket,
                                ).toLocaleString('id-ID')}
                            </span>
                        </div>
                    </div>

                    {/* WA CTA */}
                    <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-neon-solid mt-6 w-full animate-glow-pulse !py-3 !text-base"
                    >
                        Konfirmasi via WhatsApp →
                    </a>
                    <p className="mt-2 text-xs text-slate-500">
                        Pesan otomatis berisi ID & ringkasan booking sudah terisi.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:justify-center">
                        <Link href="/cek-ketersediaan" className="text-neon-cyan hover:underline">
                            Booking lagi
                        </Link>
                        <Link href="/" className="text-slate-500 hover:text-neon-cyan">
                            Kembali ke beranda
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
