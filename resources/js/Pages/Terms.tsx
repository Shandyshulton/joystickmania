import PublicLayout from '@/Layouts/PublicLayout';
import { Head } from '@inertiajs/react';

const SECTIONS = [
    {
        title: '1. Definisi',
        items: [
            '"Penyewa" adalah individu yang mengajukan dan menyetujui sewa unit PlayStation melalui website JoyStickMania.',
            '"Unit" adalah perangkat PlayStation (PS3/PS4/PS5) beserta kelengkapannya (stik, kabel, adaptor) yang disewakan.',
            '"Pihak JoyStickMania" adalah pengelola/pemilik usaha rental.',
        ],
    },
    {
        title: '2. Syarat Penyewa',
        items: [
            'Penyewa wajib berusia minimal 17 tahun atau didampingi/diwakili oleh orang tua/wali yang bertanggung jawab penuh.',
            'Penyewa wajib menyerahkan foto KTP yang masih berlaku saat melakukan booking, dan menunjukkan KTP asli saat serah terima unit.',
            'Data yang diberikan (nama, no. HP, alamat) harus benar dan dapat dihubungi/didatangi.',
        ],
    },
    {
        title: '3. Durasi Sewa',
        items: [
            'Durasi sewa minimal 1 (satu) hari dan maksimal 7 (tujuh) hari per transaksi.',
            'Perpanjangan sewa dapat diajukan sebelum masa sewa berakhir, dengan menghubungi admin melalui WhatsApp, dan dikenakan biaya tambahan sesuai tarif harian yang berlaku.',
            'Unit wajib dikembalikan tepat waktu sesuai tanggal kembali yang disepakati.',
        ],
    },
    {
        title: '4. Deposit / Jaminan',
        items: [
            'Penyewa wajib membayar deposit/jaminan sesuai nominal yang berlaku untuk jenis konsol yang disewa (nominal diinformasikan saat konfirmasi booking).',
            'Deposit dikembalikan penuh setelah unit dikembalikan dalam kondisi baik, lengkap, dan sesuai jadwal.',
            'Deposit dapat dipotong sebagian atau seluruhnya apabila terjadi kerusakan, kehilangan kelengkapan, atau keterlambatan pengembalian (lihat Pasal 6 & 7).',
        ],
    },
    {
        title: '5. Kondisi Unit & Serah Terima',
        items: [
            'Kondisi unit (fisik & kelengkapan) dicatat/didokumentasikan (foto/video) bersama oleh admin dan penyewa saat serah terima dan saat pengembalian, sebagai acuan bila terjadi perselisihan.',
            'Penyewa wajib memeriksa kelengkapan unit (konsol, stik, kabel power, kabel HDMI) saat menerima dan melaporkan bila ada kekurangan/kerusakan sebelum membawa pulang.',
        ],
    },
    {
        title: '6. Keterlambatan Pengembalian',
        items: [
            'Keterlambatan pengembalian dikenakan denda per hari keterlambatan, sebesar tarif sewa harian yang berlaku untuk unit tersebut.',
            'Jika lebih dari 3 (tiga) hari melewati batas waktu tanpa konfirmasi dari penyewa, pihak JoyStickMania berhak menganggap unit hilang dan memberlakukan ketentuan Pasal 7.2, serta dapat menempuh jalur yang diperlukan untuk pengembalian unit.',
        ],
    },
    {
        title: '7. Kerusakan atau Kehilangan Unit',
        items: [
            'Kerusakan ringan (dapat diperbaiki, misal kerusakan kabel/stik) — biaya perbaikan akan dipotong dari deposit sesuai estimasi biaya servis; jika biaya melebihi deposit, penyewa wajib melunasi kekurangannya.',
            'Kerusakan berat atau kehilangan unit — penyewa wajib mengganti unit dengan harga penggantian sesuai harga pasar unit sejenis saat kejadian; deposit yang sudah dibayarkan diperhitungkan sebagai pengurang, sisanya wajib dilunasi penyewa.',
            'Kerusakan akibat force majeure (bencana alam, kebakaran, dsb. yang dapat dibuktikan) akan dipertimbangkan secara kasus per kasus dan tidak otomatis dibebankan penuh ke penyewa.',
        ],
    },
    {
        title: '8. Larangan Penggunaan',
        items: [
            'Unit tidak boleh disewakan kembali ke pihak ketiga tanpa izin tertulis dari JoyStickMania.',
            'Unit tidak boleh digunakan untuk keperluan komersial (misal disewakan per jam ke publik) di luar kesepakatan.',
            'Dilarang membuka/membongkar unit atau melakukan modifikasi apa pun.',
        ],
    },
    {
        title: '9. Pembatalan Sewa',
        items: [
            'Pembatalan oleh penyewa sebelum unit diserahkan dapat dilakukan; kebijakan pengembalian dana (jika sudah membayar) mengikuti ketentuan berlaku (misal potongan biaya admin).',
            'Pembatalan oleh JoyStickMania (misal unit tidak tersedia karena kendala teknis) akan diinformasikan sesegera mungkin dengan pengembalian dana penuh atau penjadwalan ulang.',
        ],
    },
    {
        title: '10. Tanggung Jawab',
        items: [
            'Penyewa bertanggung jawab penuh atas unit selama masa sewa berlangsung, termasuk atas kehilangan atau kerusakan yang terjadi bukan karena cacat produksi.',
            'JoyStickMania tidak bertanggung jawab atas kerugian yang timbul dari penggunaan unit di luar peruntukan normal (misal kerusakan listrik di lokasi penyewa).',
        ],
    },
    {
        title: '11. Persetujuan',
        items: [
            'Dengan mencentang kotak persetujuan dan melanjutkan proses booking sewa fisik, penyewa menyatakan telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan di atas.',
        ],
    },
];

export default function Terms() {
    return (
        <PublicLayout>
            <Head title="Syarat & Ketentuan Sewa Fisik" />

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-cyan">
                        JoyStickMania
                    </p>
                    <h1 className="font-display text-3xl font-bold tracking-wide text-white sm:text-4xl">
                        SYARAT & KETENTUAN{' '}
                        <span className="text-neon-cyan">SEWA FISIK PS</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-400">
                        Berlaku untuk layanan penyewaan unit PlayStation (PS3/PS4/PS5)
                        untuk dibawa pulang.
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {SECTIONS.map((section) => (
                        <div key={section.title} className="card-neon p-6">
                            <h2 className="font-display text-xl font-bold text-neon-cyan">
                                {section.title}
                            </h2>
                            <ul className="mt-3 space-y-2">
                                {section.items.map((item, i) => (
                                    <li
                                        key={i}
                                        className="flex gap-3 text-sm leading-relaxed text-slate-300"
                                    >
                                        <span className="mt-0.5 text-neon-blue">▸</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="card-neon mt-8 border-neon-cyan/30 p-6 text-center">
                    <p className="text-sm text-slate-300">
                        ☐ Saya telah membaca dan menyetujui Syarat & Ketentuan Sewa Fisik
                        PlayStation JoyStickMania.
                    </p>
                    <p className="mt-3 text-xs text-slate-500">
                        Dokumen ini dapat diperbarui sewaktu-waktu. Versi yang berlaku adalah
                        yang tercantum di website pada saat transaksi dilakukan.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
