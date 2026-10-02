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

- MySQL di **port 3308** (instance Laragon). Kredensial dibaca dari `.env`
  (`DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`) — jangan
  pernah menuliskan kredensial asli ke dokumen, commit, atau issue.
- Database test: `joystickmania_test`. `phpunit.xml` hanya memaksa driver, host,
  port, dan nama database supaya test tidak pernah menyentuh DB produksi;
  `APP_KEY` + `DB_USERNAME`/`DB_PASSWORD` diambil dari `.env.testing` yang tidak
  ter-commit — buat file itu sendiri (berisi minimal 3 key di atas).
- **Awas:** `phpdotenv` Laravel bersifat *immutable* — variabel environment
  level sistem/session yang sudah terlanjur di-set (`DB_USERNAME`, `DB_PASSWORD`,
  `APP_ENV`, `APP_KEY`, dst.) **menang** atas `.env` maupun `.env.testing`, dan
  `.env.testing` menggantikan `.env` secara penuh (tidak ditumpuk). Cek dengan
  `set DB_` sebelum menjalankan `artisan migrate` atau `artisan test`; kalau ada
  kredensial produksi di sana, perintah Anda bisa diam-diam menarget produksi.

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

Untuk projek lain, versi umum dari panduan itu (plus skrip probe kemampuan
hosting) ada di `docs/DEPLOYMENT-CHECKLIST.md`.

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

## Alerting & Error Tracking

Playbook lengkap untuk dipindahkan ke projek lain (instalasi, wiring, penyaringan
PII, daftar jebakan yang sudah diverifikasi, dan checklist verifikasi):
`docs/SENTRY-SETUP.md`.

Dua lapis, keduanya mati secara default sampai dikonfigurasi:

- **Sentry** (`sentry/sentry-laravel`) — stack trace penuh, pengelompokan issue, dedupe.
- **Telegram** (`App\Support\TelegramAlert`) — pesan pendek ke HP admin untuk hal yang
  butuh tindakan manusia, bukan untuk setiap baris error.

### Menyalakan

1. Buat bot di `@BotFather`, salin token ke `TELEGRAM_BOT_TOKEN`.
2. Kirim `/start` ke bot Anda, lalu buka `https://api.telegram.org/bot<TOKEN>/getUpdates`
   dan ambil `chat.id` → `TELEGRAM_CHAT_ID`.
3. Buat project Sentry, salin DSN ke `SENTRY_LARAVEL_DSN`.
4. `php artisan config:clear`
5. Uji: `php artisan alerts:test --category=crash` dan `php artisan sentry:test`
6. Pastikan cron `alerts:heartbeat` ikut terdaftar (lihat `routes/console.php`).

### Kategori & ambang

| Kategori | Pemicu | Config |
|---|---|---|
| `crash` | exception 5xx yang dilaporkan | `ALERT_ON_CRASH` |
| `security` | N login gagal / payload tak terbaca / 403 berulang dari satu IP | `ALERT_ON_SECURITY`, `ALERT_LOGIN_FAILURE_THRESHOLD` |
| `business` | notifikasi email OTP/reset gagal terkirim | `ALERT_ON_BUSINESS` |
| `infra` | disk menipis, DB tak terhubung, storage tak writable, task scheduler macet | `ALERT_ON_INFRA` |

Satu kunci dedupe hanya menghasilkan satu pesan per `ALERT_THROTTLE_SECONDS` (default
600). `ALERTING_ENABLED=false` mematikan semuanya tanpa menyentuh Sentry.

### Aturan data pribadi

**Jangan nyalakan `SENTRY_SEND_DEFAULT_PII`.** Nama, no HP, dan alamat pelanggan
disimpan sebagai kolom plaintext sejak `2026_08_14_000004_revert_encryption_columns.php`,
dan `QueryException` Laravel menyisipkan binding SQL ke dalam string pesan error —
jadi PII bisa keluar hanya lewat judul issue. Karena itu semua event dilewatkan
`App\Support\SentryScrubber` (lihat `config/sentry.php`), dan pesan Telegram disaring
`App\Support\SensitiveData::redact()` sebelum dikirim.

Kalau menambah alert baru, jangan pernah menyertakan `$request->all()`, kredensial
login, atau isi payload form. Cukup kelas exception, path, dan ID.

### Yang TIDAK bisa dideteksi dari dalam app

`alerts:heartbeat` dijalankan oleh cron yang sama, jadi ia tidak bisa memperingatkan
kalau cron mati total atau seluruh server down. Untuk itu perlu pemantau uptime
eksternal (mis. UptimeRobot / Sentry Crons) yang mengecek `https://…/up` dari luar.

### Jebakan environment variable

`phpdotenv` Laravel *immutable*: variabel shell mengalahkan `.env` dan `.env.testing`.
Mesin pengembangan ini pernah punya kredensial produksi tertanam di environment shell,
yang membuat suite test diam-diam memakai user DB produksi. `tests/bootstrap.php`
membersihkan kunci yang seharusnya datang dari `.env.testing` dan mencetak apa yang
dibersihkan. Cek manual dengan `set DB_` (Windows) atau `env | grep '^DB_'` (Linux).
