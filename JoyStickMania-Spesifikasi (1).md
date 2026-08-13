# JoyStickMania — Spesifikasi Website (Public Page & CMS)

> Website booking rental PlayStation (PS3, PS4, PS5) dengan tema **Blue Neon**, responsive di semua device.

---

## 1. Overview Proyek

| Item | Detail |
|---|---|
| Nama Brand | JoyStickMania |
| Jenis Bisnis | Rental tempat main PS + rental fisik unit PS |
| Konsol Tersedia | PS3, PS4, PS5 |
| Tema Visual | Blue Neon (dark background, aksen neon biru/cyan, glow effect) |
| Device Target | Desktop, Tablet, Mobile (mobile-first, karena mayoritas user booking dari HP) |
| Metode Pembayaran | Manual (tanpa payment gateway), via WhatsApp + konfirmasi admin |

---

## 2. Tema & UI/UX (Blue Neon)

- **Warna dasar:** background gelap (near-black `#0A0E17` / `#0D1117`) sebagai kanvas agar neon menonjol.
- **Warna aksen:** biru neon (`#00D9FF`, `#0066FF`, `#00F0FF`) untuk tombol, border, highlight, status "available".
- **Efek visual:** glow/shadow neon pada button & card saat hover, garis grid tipis ala "arcade/cyberpunk", subtle animasi pulsing pada elemen CTA.
- **Tipografi:** font tegas/futuristik untuk heading (misal Orbitron, Rajdhani), font mudah dibaca untuk body text.
- **Konsistensi:** komponen status booking pakai warna semantik tapi tetap dalam palet neon (hijau neon = available, kuning neon = pending, merah neon = penuh/expired).
- **Responsive:** breakpoint minimal mobile (<576px), tablet (576–992px), desktop (>992px). Navigasi mobile pakai hamburger/bottom nav.

---

## 3. Public Page — Fitur

### 3.1 Landing Page
- Hero section (branding + CTA "Cek Ketersediaan / Booking Sekarang")
- Daftar konsol yang tersedia (PS3/PS4/PS5) dengan harga per jam/sesi
- Preview room/ruangan (foto, kapasitas, fasilitas)
- Highlight promo & membership
- Testimoni (opsional)
- Kontak (alamat, jam operasional, link WA/sosmed)

### 3.2 Cek Ketersediaan
- Filter by **tanggal**, **jam**, **ruangan/room**, **jenis konsol**
- Tampilan kalender/slot jam (grid) dengan status: `Available` / `Booked` / `Pending Payment` / `Closed`
- Real-time (atau near real-time) — begitu slot dibooking (walau belum lunas), otomatis berubah status jadi "Pending" agar tidak double booking

### 3.3 Booking Tempat Main (Sewa Room)
Form input:
- Nama, No. HP (WA aktif)
- Pilih tanggal, jam mulai, durasi
- Pilih ruangan/room
- Pilih konsol (PS3/PS4/PS5)
- Catatan tambahan (opsional)
- (Jika login) auto-fill data member + tampilkan tier & diskon

### 3.4 Booking Fisik PS (Sewa Unit Dibawa Pulang)
Form input:
- Nama, No. HP, alamat
- Pilih unit PS (PS3/PS4/PS5) + stok tersedia
- Tanggal mulai & tanggal kembali — **durasi sewa minimal 1 hari, maksimal 7 hari** (validasi otomatis di form, tidak bisa submit di luar rentang ini)
- **Upload foto KTP** (wajib, sebagai syarat jaminan identitas)
- **Deposit/jaminan** — nominal deposit dicatat di sistem, dikembalikan saat unit dikembalikan dalam kondisi baik. Rekomendasi nominal (sesuaikan dengan harga pasar unit di tempatmu):

| Konsol | Deposit Rekomendasi |
|---|---|
| PS3 | Rp 300.000 |
| PS4 | Rp 600.000 |
| PS5 | Rp 1.200.000 |
- Catatan tambahan

### 3.5 Login / Akun User
- Tersedia halaman **Login & Daftar Akun**.
- **Booking room maupun booking fisik PS TIDAK wajib login** — user bisa langsung isi form sebagai guest (cukup nama & no. HP).
- **Login/daftar akun wajib** hanya ketika user ingin **membeli/upgrade paket membership** (Silver/Gold), karena benefit member (diskon, prioritas booking) perlu terikat ke akun.
- User yang login otomatis mendapat Bronze (tier default gratis) sejak akun dibuat.
- Dashboard user (setelah login): status membership, riwayat booking (baik yang dibuat saat login maupun tertaut lewat no. HP yang sama), tombol upgrade/perpanjang membership.

### 3.6 Membership
- Halaman info tier: **Bronze, Silver, Gold** — benefit & syarat masing-masing
- Tombol daftar/upgrade membership
- Dashboard member (riwayat booking, tier saat ini, progress ke tier berikutnya jika berbasis poin)

### 3.7 Riwayat & Status Booking (User)
- User bisa cek status booking miliknya (Pending Payment / Confirmed / Expired / Cancelled) via nomor HP atau login akun
- Notifikasi countdown batas waktu pembayaran (30 menit)

---

## 4. CMS / Admin Panel — Fitur

### 4.1 Dashboard
- Ringkasan booking hari ini (room & unit fisik)
- Booking yang **menunggu pembayaran** (prioritas, karena ada batas 30 menit)
- Statistik okupansi per room, per konsol, pendapatan

### 4.2 Manajemen Booking
- List semua booking (filter status, tanggal, jenis: room/fisik)
- Detail booking: data user, jadwal, room/unit, status
- **Update manual:**
  - `payment_method` (Transfer BCA, QRIS manual, Cash, dll — bebas input admin)
  - `payment_status` (Belum Bayar / Sudah Bayar / Ditolak)
  - `booking_status` (Pending / Confirmed / Expired / Cancelled / Selesai)
- Tombol kirim ulang WA / catat komunikasi

### 4.3 Manajemen Ruangan (Room)
- CRUD room: nama, kapasitas, foto, konsol yang tersedia di room tsb, harga per jam
- Set status room (aktif/maintenance)

### 4.4 Manajemen Unit PS (Rental Fisik)
- CRUD unit: kode unit, jenis (PS3/PS4/PS5), kondisi, status (tersedia/disewa/servis)
- Riwayat sewa per unit

### 4.5 Manajemen Membership
- CRUD tier (Bronze/Silver/Gold) — nama, syarat naik tier, benefit, diskon %
- List member & tier masing-masing, opsi ubah tier manual
- (Jika berbasis poin) atur aturan perolehan poin

### 4.6 Manajemen Harga & Promo
- Set harga per jam per konsol/room
- Buat kode promo/diskon (opsional)

### 4.7 Laporan
- Export laporan booking & pendapatan (harian/bulanan)

---

## 5. Alur Booking & Sistem Penguncian Slot (Anti Bentrok)

1. User mengisi form booking (room atau fisik) → sistem cek slot masih kosong.
2. Sistem **langsung mengunci slot** tersebut dan membuat record booking dengan status `PENDING_PAYMENT`, beserta `expires_at = waktu_submit + 30 menit`.
3. Slot yang sedang `PENDING_PAYMENT` **tidak bisa dipilih user lain** (tampil sebagai "Pending", bukan "Available").
4. User diarahkan (redirect) ke WhatsApp admin dengan pesan otomatis berisi ID booking & ringkasan.
5. Admin membalas via WA dengan metode pembayaran (nomor rekening/QRIS), lalu menunggu bukti transfer.
6. Setelah bukti diterima, admin login CMS → update `payment_status = Sudah Bayar` & `booking_status = Confirmed`.
7. **Jika dalam 30 menit tidak ada perubahan status dari admin** (belum dikonfirmasi lunas), sistem otomatis (cron job / scheduled task) mengubah `booking_status = Expired` dan slot kembali menjadi `Available` untuk user lain.
8. Admin tetap bisa membatalkan manual kapan pun sebelum expired jika user membatalkan diri.

**Catatan teknis:** butuh scheduled job (cron, misalnya tiap 1 menit) yang mengecek booking `PENDING_PAYMENT` dengan `expires_at < now()` lalu mengubah statusnya menjadi `Expired`.

---

## 6. Draft Struktur Database

**users**
`id, nama, no_hp, email, password, membership_tier, created_at`

**rooms**
`id, nama_room, kapasitas, konsol_tersedia (FK/relasi), harga_per_jam, foto, status`

**ps_units** (untuk rental fisik)
`id, kode_unit, jenis_konsol (PS3/PS4/PS5), kondisi, status, harga_sewa`

**bookings** (booking room/tempat main)
`id, user_id (nullable, guest boleh booking), room_id, konsol, tanggal, jam_mulai, durasi, nama, no_hp, payment_method, payment_status, booking_status, expires_at, created_at`

**physical_rentals** (booking sewa fisik)
`id, user_id (nullable, guest boleh), ps_unit_id, tanggal_mulai, tanggal_kembali (validasi: 1–7 hari), nama, no_hp, alamat, foto_ktp, nominal_deposit, deposit_status (Ditahan/Dikembalikan), payment_method, payment_status, booking_status, expires_at, created_at`

**membership_tiers**
`id, nama_tier (Bronze/Silver/Gold), harga_paket, masa_berlaku_hari, diskon_persen, benefit_lain`

**membership_purchases**
`id, user_id, tier_id, harga_paket, payment_method, payment_status, membership_status (Pending/Active/Expired/Cancelled), expires_at, valid_until, reminder_h1_sent_at, expired_notif_sent_at, created_at`

---

## 7. Membership — Flow Final (Paket Berbayar)

**Bronze adalah tier default gratis** yang otomatis dimiliki setiap user sejak membuat akun (tidak perlu bayar). **Silver & Gold adalah paket berbayar**, berlaku **1 bulan** sejak dikonfirmasi aktif, wajib login untuk membeli.

### 7.1 Paket & Benefit

Referensi harga sewa room: **PS5 = Rp 40.000/jam** (acuan kalibrasi diskon di bawah).

| Tier | Harga | Masa Berlaku | Diskon | Benefit Tambahan |
|---|---|---|---|---|
| **Bronze** | Gratis (default) | - | 0% | Akses riwayat booking, cek ketersediaan |
| **Silver** | Rp 100.000 / bulan | 1 bulan | 15% | Booking lebih awal (H-3), 1 voucher extra 30 menit main/bulan |
| **Gold** | Rp 150.000 / bulan | 1 bulan | 20% | Booking paling awal (H-5), akses room VIP, **1 sesi gratis 1 jam/bulan (setara Rp 40.000)** |

*Catatan kalkulasi:* dengan diskon 15%, user Silver "balik modal" paketnya kalau main PS5 ±17 jam/bulan (setara sekitar 4x kunjungan @ 4 jam). Untuk Gold, 1 jam gratis saja sudah menutup Rp 40.000 dari Rp 150.000, ditambah diskon 20% untuk sisa pemakaian — jadi lebih cepat terasa worth-it. Kamu bisa sesuaikan lagi kalau harga PS4/PS3 beda dari PS5.

**Masa berlaku Silver & Gold disamakan (1 bulan)** — supaya siklus reminder H-1 dan auto-downgrade di sistem seragam untuk kedua tier, tidak perlu logic terpisah per tier.

### 7.2 Alur Pembelian/Upgrade Membership (Silver/Gold)

1. User **login** terlebih dahulu → buka halaman Membership → pilih paket Silver atau Gold.
2. Sistem membuat record di `membership_purchases` dengan `membership_status = PENDING_PAYMENT` dan `expires_at = created_at + 30 menit`.
3. User diarahkan ke WhatsApp admin dengan pesan otomatis berisi paket yang dipilih.
4. Admin membalas via WA dengan metode pembayaran manual, menunggu bukti bayar.
5. Setelah bukti diterima, admin login CMS → update `payment_status = Lunas` & `membership_status = Active`. Sistem otomatis set `tier` user sesuai paket & `valid_until = tanggal_konfirmasi + 1 bulan`.
6. Jika dalam 30 menit user belum bayar, `membership_status` otomatis menjadi `Expired` — user perlu mengajukan pembelian ulang.

### 7.3 Menjelang & Setelah Masa Berlaku Habis

| Waktu | Kejadian |
|---|---|
| **H-1 sebelum `valid_until`** | Sistem otomatis kirim **email** (via Gmail/SMTP) ke user: *"Membership kamu akan berakhir besok, mau lanjut?"*. Di CMS, admin juga melihat baris booking ini di tab "Membership Akan Berakhir" dengan **tombol "Kirim Reminder WA"** — saat diklik, membuka link WA (wa.me) dengan pesan template reminder sudah terisi otomatis, admin tinggal kirim manual ke user. |
| **Tepat di `valid_until`** | `membership_status` otomatis berubah menjadi **`Expired`** (tier di profil user **belum** diturunkan dulu — masih dianggap masa tenggang 1 hari) |
| **Jika user konfirmasi mau lanjut (via WA)** | Admin kirim metode pembayaran → setelah user bayar, admin update `membership_status = Active` lagi di CMS, `valid_until` diperpanjang +1 bulan dari tanggal konfirmasi. Tier **tidak jadi turun**. |
| **Jika lewat 1 hari sejak `valid_until` tanpa perpanjangan** | Sistem **otomatis menurunkan tier user ke Bronze**, dan otomatis mengirim **email** (via Gmail/SMTP): *"Membership kamu telah berakhir."* |

Ringkasnya: ada **masa tenggang 1 hari** setelah expired di mana admin masih bisa mengaktifkan ulang tanpa user kehilangan tier — tapi kalau lewat 1 hari, otomatis turun ke Bronze dengan notifikasi email otomatis.

### 7.4 Catatan Teknis untuk Sistem

- Dibutuhkan **scheduled job harian** yang mengecek:
  1. Membership dengan `valid_until = besok` → kirim email reminder H-1 otomatis, dan tandai baris ini muncul di tab CMS "Membership Akan Berakhir" (dengan tombol kirim WA manual)
  2. Membership dengan `valid_until = hari ini` → set status `Expired`
  3. Membership `Expired` yang sudah lewat 1 hari (`valid_until + 1 hari < now()`) dan belum diperpanjang → turunkan tier ke Bronze + kirim email otomatis "membership berakhir"
- **Email otomatis**: cukup pakai Gmail SMTP / Gmail API untuk kirim reminder H-1 & notifikasi expired — tidak perlu provider pihak ketiga khusus.
- **WA reminder**: **tidak otomatis terkirim**, cukup tombol **"Kirim Template WA"** di CMS pada baris membership yang mau expired — saat diklik, sistem generate link `wa.me/{no_hp_user}?text={template_pesan}` dan admin tinggal klik kirim. Ini konsisten dengan pendekatan WA manual yang sudah dipakai untuk booking, tidak perlu integrasi WA Business API.

### 7.5 Catatan untuk CMS

- Admin perlu tab/menu khusus **"Membership Pending"** mirip booking pending, supaya tidak campur dengan antrian booking room/fisik.
- Admin perlu tab **"Membership Masa Tenggang"** (status Expired tapi masih dalam 1 hari) untuk memantau siapa yang perlu ditindaklanjuti/diaktifkan ulang.
- Log riwayat notifikasi yang sudah terkirim (reminder H-1, notif expired) agar tidak terkirim dobel.

---

## 8. Non-Functional Requirements

- **Responsive**: layout adaptif untuk mobile, tablet, desktop.
- **Real-time slot update**: idealnya polling/refresh berkala atau websocket agar status ketersediaan selalu akurat.
- **Keamanan data**: nomor HP & data pribadi user tersimpan aman, akses CMS pakai login admin dengan role.
- **Audit trail**: setiap perubahan status booking oleh admin sebaiknya tercatat (siapa, kapan, status apa ke apa) untuk menghindari sengketa.

---

## 9. Pertanyaan Terbuka (Perlu Diputuskan Sebelum Development)

1. Deposit uang tunai atau bisa juga barang jaminan lain (misal STNK/BPKB kendaraan) sebagai alternatif?
2. Apakah harga PS4/PS3 per jam untuk room sama dengan PS5 (Rp 40.000/jam) atau beda? Ini memengaruhi kalkulasi "balik modal" membership di Bagian 7.1.
3. Detail kebijakan kerusakan/kehilangan unit fisik sudah dituangkan di dokumen **Syarat & Ketentuan Sewa Fisik PS** (file terpisah) — tolong direview, terutama nominal ganti rugi.
