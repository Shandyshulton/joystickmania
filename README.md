# JoyStickMania — Website Booking Rental PlayStation

Platform booking rental PlayStation (tempat main & sewa fisik unit PS3/PS4/PS5) dengan
tema **Blue Neon** (dark background + aksen neon cyan), CMS admin, dan pembayaran manual
via WhatsApp (tanpa payment gateway).

## Tech Stack

- **Backend:** Laravel 13 (PHP 8.5)
- **Frontend:** React via Inertia.js + TypeScript (bukan SPA terpisah)
- **Styling:** Tailwind CSS dengan tema kustom Blue Neon (lihat `tailwind.config.js`)
- **Auth:** Laravel Breeze (Inertia + React + TS) — dikustomisasi untuk field `nama`/`no_hp` & tier Bronze default
- **Database:** MySQL (port 3308 di Laragon)
- **Queue & Scheduler:** Laravel Queue + `php artisan schedule:run`
- **Email:** Laravel Notification (Mail channel) via Gmail SMTP
- **Testing:** PHPUnit (39 test, 106 assertions) — lihat `tests/Feature/BookingLogicTest.php` & `AdminFlowTest.php`

## Setup

```bash
composer install
cp .env.example .env   # sesuaikan DB & MAIL
php artisan key:generate
php artisan migrate:fresh --seed
npm install --include=dev
npm run build
php artisan storage:link
php artisan serve
```

> Catatan: jika npm global user Anda punya `omit=["dev"]`, wajib pakai
> `npm install --include=dev` agar dependency frontend terpasang.

### Database

- MySQL di **port 3308** (instance Laragon). `.env` memakai:
  `DB_DATABASE=joystickmania`, `DB_USERNAME=joystickmania`, `DB_PASSWORD=joystickmania123`.
- Database test: `joystickmania_test` (dipakai `phpunit.xml`).

### Scheduler (cron)

```bash
php artisan schedule:run   # jalankan tiap menit via cron / Task Scheduler Windows
```

Command terjadwal:

| Command | Jadwal | Fungsi |
|---|---|---|
| `bookings:expire-pending` | tiap menit | Booking/rental/purchase `PENDING_PAYMENT` lewat 30 menit → `EXPIRED`, slot bebas |
| `membership:process-daily` | setiap 00:05 | Email reminder H-1, expire di hari-H, auto-downgrade Bronze setelah tenggang 1 hari + email |

## Deploy ke Production

Konfigurasi local & production ada di satu file `.env`: baris aktif = local, baris
bertanda `[production]` = server. Panduan langkah deploy-nya ada di `DEPLOYMENT.md`
(file lokal, tidak di-commit ke repo).

## Akun Demo (Seeder)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@joystickmania.test` | `password` |
| Member | `member@joystickmania.test` | `password` |

## Struktur Halaman

**Public:** `/` (landing), `/cek-ketersediaan`, `/membership`, `/syarat-ketentuan-sewa-fisik`,
`/booking/room`, `/booking/fisik`.

**User (login):** `/dashboard` (status membership + riwayat booking via user_id ATAU no_hp),
`/profile`.

**Admin (`/admin`):** dashboard (pending payment prioritas), manajemen booking/rental/membership
(update payment_method, payment_status, booking_status + audit log), CRUD rooms/units/tiers,
tab "Membership Akan Berakhir" + tombol "Kirim Template WA" (generate link `wa.me`, tidak otomatis kirim).

## Asumsi yang Diambil (Pertanyaan Terbuka di Spesifikasi)

1. **Deposit**: uang tunai (nominal sesuai rekomendasi: PS3 Rp300.000, PS4 Rp600.000,
   PS5 Rp1.200.000). Barang jaminan lain (STNK/BPKB) tidak diimplementasikan — hanya dicatat
   nominal deposit di sistem.
2. **Harga room per jam**: disamakan Rp40.000/jam untuk PS3/PS4/PS5 di room standar;
   room VIP Rp60.000/jam (asumsi reasonable). Harga unit fisik per hari: PS3 Rp50.000,
   PS4 Rp75.000, PS5 Rp100.000 (estimasi pasar).
3. **Kebijakan kerusakan/kehilangan**: mengikuti dokumen T&C terpisah, ditampilkan
   di `/syarat-ketentuan-sewa-fisik`; nominal ganti rugi diserahkan ke admin manual.
4. **Jam operasional**: 10.00–22.00 WIB (slot per jam, 12 slot/hari).
5. **Booking room**: konsol dipilih per booking (room bisa punya beberapa konsol).
6. **Deposit dikembalikan** ditandai manual oleh admin via field `deposit_status`.

## Alur Pembayaran (Manual, Tanpa Payment Gateway)

1. User submit booking → record `PENDING_PAYMENT` + `expires_at = now + 30 menit`, slot dikunci.
2. Redirect ke WhatsApp admin dengan pesan template berisi ID & ringkasan.
3. Admin konfirmasi bukti bayar di CMS → `payment_status = sudah_bayar`, `booking_status = confirmed`.
4. Jika 30 menit lewat tanpa konfirmasi → command `bookings:expire-pending` ubah jadi `EXPIRED`.

## Email (Gmail SMTP)

Isi di `.env`:

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=email.anda@gmail.com
MAIL_PASSWORD=<app password>
MAIL_FROM_ADDRESS=email.anda@gmail.com
```

Reminder H-1 & notifikasi expired dikirim otomatis oleh `membership:process-daily`
(menghormati kolom `reminder_h1_sent_at` / `expired_notif_sent_at` agar tidak dobel).

## WhatsApp Admin

Nomor admin dikonfigurasi di `.env`: `WA_ADMIN_NUMBER=62812xxxxxxx` (format internasional tanpa `+`).
