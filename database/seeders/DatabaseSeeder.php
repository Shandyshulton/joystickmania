<?php

namespace Database\Seeders;

use App\Models\Game;
use App\Models\MembershipTier;
use App\Models\PsUnit;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ---- Admin & user demo ----
        User::factory()->create([
            'nama' => 'Super Admin',
            'no_hp' => '081234567890',
            'email' => 'admin@joystickmania.test',
            'password' => Hash::make('password'),
            'is_admin' => true,
            'role' => 'super_admin',
            'membership_tier' => 'gold',
        ]);

        // Staff demo (akses terbatas sesuai permission)
        User::factory()->create([
            'nama' => 'Staff Demo',
            'no_hp' => '081111222333',
            'email' => 'staff@joystickmania.test',
            'password' => Hash::make('password'),
            'is_admin' => false,
            'role' => 'staff',
            'permissions' => ['dashboard', 'bookings', 'rentals'],
            'membership_tier' => 'bronze',
        ]);

        User::factory()->create([
            'nama' => 'Member Demo',
            'no_hp' => '081298765432',
            'email' => 'member@joystickmania.test',
            'password' => Hash::make('password'),
            'role' => 'user',
            'membership_tier' => 'bronze',
        ]);

        // ---- Membership tiers (harga sesuai spesifikasi) ----
        MembershipTier::updateOrCreate(
            ['nama_tier' => 'bronze'],
            [
                'harga_paket' => 0,
                'masa_berlaku_hari' => 0,
                'diskon_persen' => 0,
                'benefit_lain' => 'Akses riwayat booking & cek ketersediaan (tier default gratis).',
            ]
        );
        MembershipTier::updateOrCreate(
            ['nama_tier' => 'silver'],
            [
                'harga_paket' => 100_000,
                'masa_berlaku_hari' => 30,
                'diskon_persen' => 15,
                'benefit_lain' => 'Booking lebih awal (H-3), 1 voucher extra 30 menit main/bulan.',
            ]
        );
        MembershipTier::updateOrCreate(
            ['nama_tier' => 'gold'],
            [
                'harga_paket' => 150_000,
                'masa_berlaku_hari' => 30,
                'diskon_persen' => 20,
                'benefit_lain' => 'Booking paling awal (H-5), akses room VIP, 1 sesi gratis 1 jam/bulan (setara Rp 40.000).',
            ]
        );

        // ---- Rooms ----
        $rooms = [
            [
                'nama_room' => 'Room Neon 1',
                'kapasitas' => 2,
                'konsol_tersedia' => ['PS3', 'PS4', 'PS5'],
                'harga_per_jam' => 40_000,
                'fasilitas' => 'AC, 2 kursi gaming, TV 32" LED, headset, WiFi',
                'status' => 'aktif',
            ],
            [
                'nama_room' => 'Room Neon 2',
                'kapasitas' => 2,
                'konsol_tersedia' => ['PS4', 'PS5'],
                'harga_per_jam' => 40_000,
                'fasilitas' => 'AC, 2 kursi gaming, TV 32" LED, headset, WiFi',
                'status' => 'aktif',
            ],
            [
                'nama_room' => 'Room VIP Cyan',
                'kapasitas' => 4,
                'konsol_tersedia' => ['PS5'],
                'harga_per_jam' => 60_000,
                'fasilitas' => 'AC, sofa gaming, TV 55" 4K, headset premium, snack, WiFi',
                'status' => 'aktif',
            ],
        ];
        foreach ($rooms as $room) {
            Room::create($room);
        }

        // ---- PS Units (rental fisik, deposit sesuai spesifikasi) ----
        $units = [
            // PS3: deposit Rp 300.000
            ['kode_unit' => 'PS3-01', 'jenis_konsol' => 'PS3', 'kondisi' => 'Baik', 'harga_sewa' => 50_000, 'nominal_deposit' => 300_000],
            ['kode_unit' => 'PS3-02', 'jenis_konsol' => 'PS3', 'kondisi' => 'Baik', 'harga_sewa' => 50_000, 'nominal_deposit' => 300_000],
            // PS4: deposit Rp 600.000
            ['kode_unit' => 'PS4-01', 'jenis_konsol' => 'PS4', 'kondisi' => 'Baik', 'harga_sewa' => 75_000, 'nominal_deposit' => 600_000],
            ['kode_unit' => 'PS4-02', 'jenis_konsol' => 'PS4', 'kondisi' => 'Baik', 'harga_sewa' => 75_000, 'nominal_deposit' => 600_000],
            // PS5: deposit Rp 1.200.000
            ['kode_unit' => 'PS5-01', 'jenis_konsol' => 'PS5', 'kondisi' => 'Seperti baru', 'harga_sewa' => 100_000, 'nominal_deposit' => 1_200_000],
            ['kode_unit' => 'PS5-02', 'jenis_konsol' => 'PS5', 'kondisi' => 'Seperti baru', 'harga_sewa' => 100_000, 'nominal_deposit' => 1_200_000],
        ];
        foreach ($units as $unit) {
            PsUnit::create($unit);
        }

        // ---- Game (contoh, bisa diedit/ditambah dari CMS) ----
        $games = [
            ['nama_game' => 'God of War Ragnarok', 'jenis_konsol' => 'PS5', 'gambar' => null, 'deskripsi' => 'Action adventure legendaris Kratos & Atreus.', 'status' => 'aktif'],
            ['nama_game' => 'Spider-Man 2', 'jenis_konsol' => 'PS5', 'gambar' => null, 'deskripsi' => 'Petualangan Spider-Man di New York.', 'status' => 'aktif'],
            ['nama_game' => 'Grand Theft Auto V', 'jenis_konsol' => 'PS5', 'gambar' => null, 'deskripsi' => 'Open world Los Santos.', 'status' => 'aktif'],
            ['nama_game' => 'The Last of Us Part II', 'jenis_konsol' => 'PS4', 'gambar' => null, 'deskripsi' => 'Drama survival pemenang banyak penghargaan.', 'status' => 'aktif'],
            ['nama_game' => 'Uncharted 4', 'jenis_konsol' => 'PS4', 'gambar' => null, 'deskripsi' => 'Perburuan harta karun Nathan Drake.', 'status' => 'aktif'],
            ['nama_game' => 'Persona 5', 'jenis_konsol' => 'PS4', 'gambar' => null, 'deskripsi' => 'JRPG gaya hidup + dungeon.', 'status' => 'aktif'],
            ['nama_game' => 'God of War III', 'jenis_konsol' => 'PS3', 'gambar' => null, 'deskripsi' => 'Epos balas dendam Kratos.', 'status' => 'aktif'],
            ['nama_game' => 'Metal Gear Solid 4', 'jenis_konsol' => 'PS3', 'gambar' => null, 'deskripsi' => 'Misi terakhir Solid Snake.', 'status' => 'aktif'],
            ['nama_game' => 'The Last of Us', 'jenis_konsol' => 'PS3', 'gambar' => null, 'deskripsi' => 'Klasik survival pasca-apokaliptik.', 'status' => 'aktif'],
        ];
        foreach ($games as $game) {
            Game::create($game);
        }
    }
}
