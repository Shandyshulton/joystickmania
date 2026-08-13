import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useMemo, useState } from 'react';

export default function BookingPhysical({ units, prefill, waAdmin }: any) {
    const { data, setData, post, processing, errors } = useForm({
        nama: prefill.nama,
        no_hp: prefill.no_hp,
        alamat: '',
        ps_unit_id: units?.[0]?.id ?? '',
        tanggal_mulai: '',
        tanggal_kembali: '',
        foto_ktp: null as File | null,
        catatan: '',
        setuju_tnc: false as boolean,
    });

    const [ktpPreview, setKtpPreview] = useState<string | null>(null);
    const [tncOpen, setTncOpen] = useState(false);

    const selectedUnit = units?.find((u: any) => u.id === Number(data.ps_unit_id));

    // Validasi durasi 1-7 hari di frontend
    const hariSewa = useMemo(() => {
        if (!data.tanggal_mulai || !data.tanggal_kembali) return 0;
        const mulai = new Date(data.tanggal_mulai);
        const kembali = new Date(data.tanggal_kembali);
        const diff = Math.round((kembali.getTime() - mulai.getTime()) / 86400000) + 1;
        return diff > 0 ? diff : 0;
    }, [data.tanggal_mulai, data.tanggal_kembali]);

    const durasiValid = hariSewa >= 1 && hariSewa <= 7;
    const totalBiaya = (selectedUnit?.harga_sewa ?? 0) * hariSewa;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('booking.fisik.store'));
    };

    const today = new Date().toISOString().split('T')[0];
    const maxReturn = data.tanggal_mulai
        ? new Date(new Date(data.tanggal_mulai).getTime() + 7 * 86400000)
              .toISOString()
              .split('T')[0]
        : '';

    return (
        <PublicLayout>
            <Head title="Sewa Fisik PS" />

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                <h1 className="font-display text-3xl font-bold tracking-wide text-white">
                    SEWA <span className="text-neon-cyan">FISIK PS</span>
                </h1>
                <p className="mt-2 text-slate-400">
                    Bawa pulang unit PlayStation. Durasi 1–7 hari, wajib upload foto KTP
                    sebagai jaminan identitas.
                </p>

                <form onSubmit={submit} className="card-neon mt-6 space-y-5 p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="nama" value="Nama" />
                            <input
                                id="nama"
                                value={data.nama}
                                onChange={(e) => setData('nama', e.target.value)}
                                className="input-neon mt-1"
                                required
                            />
                            <InputError message={errors.nama} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="no_hp" value="No. HP (WA aktif)" />
                            <input
                                id="no_hp"
                                value={data.no_hp}
                                onChange={(e) => setData('no_hp', e.target.value)}
                                className="input-neon mt-1"
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                            <InputError message={errors.no_hp} className="mt-1" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="alamat" value="Alamat" />
                        <textarea
                            id="alamat"
                            value={data.alamat}
                            onChange={(e) => setData('alamat', e.target.value)}
                            className="input-neon mt-1"
                            rows={2}
                            required
                        />
                        <InputError message={errors.alamat} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="ps_unit_id" value="Pilih Unit PS" />
                        <select
                            id="ps_unit_id"
                            value={data.ps_unit_id}
                            onChange={(e) => setData('ps_unit_id', Number(e.target.value))}
                            className="input-neon mt-1"
                        >
                            {units?.map((u: any) => (
                                <option key={u.id} value={u.id}>
                                    {u.kode_unit} • {u.jenis_konsol} • Rp{' '}
                                    {Number(u.harga_sewa).toLocaleString('id-ID')}/hari
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.ps_unit_id} className="mt-1" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                            <input
                                id="tanggal_mulai"
                                type="date"
                                min={today}
                                value={data.tanggal_mulai}
                                onChange={(e) => setData('tanggal_mulai', e.target.value)}
                                className="input-neon mt-1"
                                required
                            />
                            <InputError message={errors.tanggal_mulai} className="mt-1" />
                        </div>
                        <div>
                            <InputLabel htmlFor="tanggal_kembali" value="Tanggal Kembali" />
                            <input
                                id="tanggal_kembali"
                                type="date"
                                min={data.tanggal_mulai || today}
                                max={maxReturn}
                                value={data.tanggal_kembali}
                                onChange={(e) => setData('tanggal_kembali', e.target.value)}
                                className="input-neon mt-1"
                                required
                            />
                            <InputError message={errors.tanggal_kembali} className="mt-1" />
                        </div>
                    </div>

                    {data.tanggal_mulai && data.tanggal_kembali && (
                        <div
                            className={`rounded-lg border p-3 text-sm ${
                                durasiValid
                                    ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
                                    : 'border-neon-red/40 bg-neon-red/10 text-neon-red'
                            }`}
                        >
                            {durasiValid
                                ? `✓ Durasi sewa ${hariSewa} hari (maksimal 7 hari) — total sewa Rp ${totalBiaya.toLocaleString('id-ID')}`
                                : `✗ Durasi ${hariSewa} hari di luar batas (1–7 hari)`}
                        </div>
                    )}

                    {/* Upload KTP */}
                    <div>
                        <InputLabel htmlFor="foto_ktp" value="Foto KTP (wajib)" />
                        <input
                            id="foto_ktp"
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setData('foto_ktp', file);
                                if (file) {
                                    setKtpPreview(URL.createObjectURL(file));
                                }
                            }}
                            className="input-neon mt-1 file:me-3 file:rounded file:border-0 file:bg-neon-blue/20 file:px-3 file:py-1.5 file:font-semibold file:text-neon-cyan"
                            required
                        />
                        {ktpPreview && (
                            <img
                                src={ktpPreview}
                                alt="Preview KTP"
                                className="mt-3 h-40 rounded-lg border border-night-600 object-cover"
                            />
                        )}
                        <InputError message={errors.foto_ktp} className="mt-1" />
                    </div>

                    {/* Deposit info */}
                    {selectedUnit && (
                        <div className="rounded-lg border border-neon-yellow/30 bg-neon-yellow/5 p-4 text-sm text-slate-300">
                            <p className="font-semibold text-neon-yellow">
                                💰 Deposit: Rp {Number(selectedUnit.nominal_deposit).toLocaleString('id-ID')}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                                Deposit dikembalikan penuh saat unit kembali dalam kondisi baik.
                                Dapat dipotong jika ada kerusakan/keterlambatan (lihat Syarat & Ketentuan).
                            </p>
                        </div>
                    )}

                    <div>
                        <InputLabel htmlFor="catatan" value="Catatan (opsional)" />
                        <textarea
                            id="catatan"
                            value={data.catatan}
                            onChange={(e) => setData('catatan', e.target.value)}
                            className="input-neon mt-1"
                            rows={2}
                        />
                    </div>

                    {/* T&C checkbox */}
                    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-night-600 bg-night-700/40 p-4">
                        <input
                            type="checkbox"
                            checked={data.setuju_tnc}
                            onChange={(e) => setData('setuju_tnc', e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-night-500 bg-night-700 text-neon-blue focus:ring-neon-blue"
                        />
                        <span className="text-sm text-slate-300">
                            Saya telah membaca dan menyetujui{' '}
                            <button
                                type="button"
                                onClick={() => setTncOpen(true)}
                                className="text-neon-cyan underline hover:text-neon-blue"
                            >
                                Syarat & Ketentuan Sewa Fisik PlayStation
                            </button>{' '}
                            JoyStickMania.
                        </span>
                    </label>
                    {errors.setuju_tnc && (
                        <InputError message={errors.setuju_tnc} className="mt-1" />
                    )}

                    <button
                        type="submit"
                        disabled={processing || !durasiValid || !data.setuju_tnc}
                        className="btn-neon-solid w-full animate-glow-pulse !py-3 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                    >
                        {processing ? 'Memproses...' : 'Lanjut ke Konfirmasi WhatsApp'}
                    </button>
                    {!data.setuju_tnc && (
                        <p className="text-center text-xs text-slate-500">
                            Centang persetujuan Syarat & Ketentuan untuk melanjutkan.
                        </p>
                    )}

                    {/* Popup T&C */}
                    {tncOpen && (
                        <div
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                            onClick={() => setTncOpen(false)}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                className="card-neon max-h-[85dvh] w-full max-w-2xl overflow-y-auto p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display text-lg font-bold text-white">
                                        Syarat & Ketentuan <span className="text-neon-cyan">Sewa Fisik PS</span>
                                    </h3>
                                    <button
                                        onClick={() => setTncOpen(false)}
                                        className="text-slate-500 hover:text-white"
                                        aria-label="Tutup"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="mt-4 space-y-4 text-sm text-slate-300">
                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">1. Definisi</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>"Penyewa" adalah individu yang mengajukan dan menyetujui sewa unit PlayStation melalui website JoyStickMania.</li>
                                            <li>"Unit" adalah perangkat PlayStation (PS3/PS4/PS5) beserta kelengkapannya (stik, kabel, adaptor) yang disewakan.</li>
                                            <li>"Pihak JoyStickMania" adalah pengelola/pemilik usaha rental.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">2. Syarat Penyewa</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Penyewa wajib berusia minimal 17 tahun atau didampingi/diwakili oleh orang tua/wali yang bertanggung jawab penuh.</li>
                                            <li>Penyewa wajib menyerahkan foto KTP yang masih berlaku saat melakukan booking, dan menunjukkan KTP asli saat serah terima unit.</li>
                                            <li>Data yang diberikan (nama, no. HP, alamat) harus benar dan dapat dihubungi/didatangi.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">3. Durasi Sewa</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Durasi sewa minimal 1 (satu) hari dan maksimal 7 (tujuh) hari per transaksi.</li>
                                            <li>Perpanjangan sewa dapat diajukan sebelum masa sewa berakhir dengan menghubungi admin via WhatsApp, dikenakan biaya sesuai tarif harian yang berlaku.</li>
                                            <li>Unit wajib dikembalikan tepat waktu sesuai tanggal kembali yang disepakati.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">4. Deposit / Jaminan</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Penyewa wajib membayar deposit/jaminan sesuai nominal yang berlaku untuk jenis konsol yang disewa.</li>
                                            <li>Deposit dikembalikan penuh setelah unit dikembalikan dalam kondisi baik, lengkap, dan sesuai jadwal.</li>
                                            <li>Deposit dapat dipotong sebagian atau seluruhnya apabila terjadi kerusakan, kehilangan kelengkapan, atau keterlambatan pengembalian.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">5. Kondisi Unit & Serah Terima</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Kondisi unit dicatat/didokumentasikan bersama oleh admin dan penyewa saat serah terima dan pengembalian.</li>
                                            <li>Penyewa wajib memeriksa kelengkapan unit (konsol, stik, kabel power, kabel HDMI) saat menerima.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">6. Keterlambatan Pengembalian</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Keterlambatan dikenakan denda per hari sebesar tarif sewa harian yang berlaku.</li>
                                            <li>Lebih dari 3 hari tanpa konfirmasi, unit dianggap hilang dan berlaku ketentuan Pasal 7.2.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">7. Kerusakan atau Kehilangan Unit</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Kerusakan ringan: biaya perbaikan dipotong dari deposit sesuai estimasi biaya servis.</li>
                                            <li>Kerusakan berat/kehilangan: penyewa wajib mengganti sesuai harga pasar unit sejenis, deposit diperhitungkan sebagai pengurang.</li>
                                            <li>Force majeure dipertimbangkan kasus per kasus.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">8. Larangan Penggunaan</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Unit tidak boleh disewakan kembali ke pihak ketiga tanpa izin tertulis.</li>
                                            <li>Unit tidak boleh digunakan untuk keperluan komersial di luar kesepakatan.</li>
                                            <li>Dilarang membuka/membongkar unit atau melakukan modifikasi apa pun.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">9. Pembatalan Sewa</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Pembatalan oleh penyewa sebelum unit diserahkan dapat dilakukan; kebijakan pengembalian dana mengikuti ketentuan berlaku.</li>
                                            <li>Pembatalan oleh JoyStickMania akan diinformasikan sesegera mungkin dengan pengembalian dana penuh atau penjadwalan ulang.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">10. Tanggung Jawab</h4>
                                        <ul className="mt-1 list-disc space-y-1 pl-5">
                                            <li>Penyewa bertanggung jawab penuh atas unit selama masa sewa.</li>
                                            <li>JoyStickMania tidak bertanggung jawab atas kerugian dari penggunaan di luar peruntukan normal.</li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-display font-bold text-neon-cyan">11. Persetujuan</h4>
                                        <p className="mt-1 pl-5">
                                            Dengan mencentang kotak persetujuan dan melanjutkan proses booking sewa fisik, penyewa menyatakan telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan di atas.
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <a
                                        href="/syarat-ketentuan-sewa-fisik"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn-neon-outline w-full !py-2 !text-xs sm:w-auto"
                                    >
                                        Buka Halaman Lengkap
                                    </a>
                                    <button
                                        onClick={() => setTncOpen(false)}
                                        className="btn-neon-solid w-full !py-2 !text-xs sm:w-auto"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </PublicLayout>
    );
}
