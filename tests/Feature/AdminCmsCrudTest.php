<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\Game;
use App\Models\MembershipTier;
use App\Models\PsUnit;
use App\Models\Room;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Audit CRUD admin CMS: setiap halaman create/edit diuji dengan payload
 * persis seperti yang dikirim form Inertia (termasuk multipart/forceFormData).
 */
class AdminCmsCrudTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): Admin
    {
        return Admin::factory()->create(['role' => 'super_admin']);
    }

    /** Mirror objectToFormData(): nilai null dikirim sebagai string kosong. */
    private function roomsPayload(array $overrides = []): array
    {
        return array_merge([
            'nama_room' => 'Room Test',
            'kapasitas' => '4',
            'konsol_tersedia' => ['PS5'],
            'harga_per_jam' => '60000',
            'foto' => '',
            'fasilitas' => 'AC, TV',
            'status' => 'aktif',
        ], $overrides);
    }

    public function test_create_room_with_empty_file_field(): void
    {
        $response = $this->actingAs($this->admin(), 'admin')
            ->post('/admin/rooms', $this->roomsPayload());

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('rooms', ['nama_room' => 'Room Test']);
    }

    public function test_create_room_with_real_upload(): void
    {
        $response = $this->actingAs($this->admin(), 'admin')
            ->post('/admin/rooms', $this->roomsPayload([
                'foto' => UploadedFile::fake()->image('room.jpg', 800, 600),
            ]));

        $response->assertSessionHasNoErrors();

        $room = Room::where('nama_room', 'Room Test')->first();
        $this->assertNotNull($room?->foto);
    }

    public function test_edit_room_without_changing_photo(): void
    {
        $room = Room::create([
            'nama_room' => 'Room Lama', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS4'], 'harga_per_jam' => 40000,
            'foto' => 'rooms/lama.jpg', 'status' => 'aktif', 'fasilitas' => 'AC',
        ]);

        $response = $this->actingAs($this->admin(), 'admin')
            ->patch('/admin/rooms/'.$room->id, $this->roomsPayload([
                'nama_room' => 'Room Baru',
                'konsol_tersedia' => ['PS4', 'PS5'],
            ]));

        $response->assertSessionHasNoErrors();

        $fresh = $room->fresh();
        $this->assertSame('Room Baru', $fresh->nama_room);
        $this->assertSame(['PS4', 'PS5'], $fresh->konsol_tersedia);
        $this->assertSame('rooms/lama.jpg', $fresh->foto, 'Foto lama harus bertahan saat edit tanpa upload.');
    }

    public function test_edit_room_with_new_photo_replaces_old_file(): void
    {
        Storage::fake('public');

        $room = Room::create([
            'nama_room' => 'Room Lama', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS4'], 'harga_per_jam' => 40000,
            'foto' => 'rooms/lama.jpg', 'status' => 'aktif', 'fasilitas' => 'AC',
        ]);
        Storage::disk('public')->put('rooms/lama.jpg', 'lama');

        $response = $this->actingAs($this->admin(), 'admin')
            ->patch('/admin/rooms/'.$room->id, $this->roomsPayload([
                'foto' => UploadedFile::fake()->image('baru.jpg', 800, 600),
            ]));

        $response->assertSessionHasNoErrors();

        $fresh = $room->fresh();
        $this->assertNotSame('rooms/lama.jpg', $fresh->foto);
        Storage::disk('public')->assertExists($fresh->foto);
        Storage::disk('public')->assertMissing('rooms/lama.jpg');
    }

    /**
     * Regresi produksi: PHP hanya mem-parse body multipart untuk POST, jadi form
     * edit (yang punya input file) harus dikirim POST + _method=PATCH. Kalau route
     * PATCH tidak lagi menerima spoofing ini, edit room di hosting kembali error
     * "field is required" walau form terisi.
     */
    public function test_edit_room_via_multipart_post_with_method_spoofing(): void
    {
        Storage::fake('public');

        $room = Room::create([
            'nama_room' => 'Room Lama', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS4'], 'harga_per_jam' => 40000,
            'foto' => 'rooms/lama.jpg', 'status' => 'aktif', 'fasilitas' => 'AC',
        ]);

        $response = $this->actingAs($this->admin(), 'admin')
            ->post('/admin/rooms/'.$room->id, $this->roomsPayload([
                '_method' => 'PATCH',
                'nama_room' => 'Room Spoof',
                'foto' => UploadedFile::fake()->image('baru.jpg', 800, 600),
            ]));

        $response->assertSessionHasNoErrors();

        $fresh = $room->fresh();
        $this->assertSame('Room Spoof', $fresh->nama_room);
        $this->assertSame(4, $fresh->kapasitas);
        $this->assertSame(60000, $fresh->harga_per_jam);
        $this->assertNotSame('rooms/lama.jpg', $fresh->foto);
    }

    public function test_edit_game_without_changing_image(): void
    {
        $game = Game::create([
            'nama_game' => 'FIFA 25', 'jenis_konsol' => 'PS5',
            'gambar' => 'games/lama.png', 'deskripsi' => 'Lama', 'status' => 'aktif',
        ]);

        $response = $this->actingAs($this->admin(), 'admin')
            ->patch('/admin/games/'.$game->id, [
                'nama_game' => 'FIFA 26',
                'jenis_konsol' => 'PS5',
                'gambar' => '',
                'deskripsi' => 'Baru',
                'status' => 'aktif',
            ]);

        $response->assertSessionHasNoErrors();

        $fresh = $game->fresh();
        $this->assertSame('FIFA 26', $fresh->nama_game);
        $this->assertSame('games/lama.png', $fresh->gambar, 'Gambar lama harus bertahan saat edit tanpa upload.');
    }

    public function test_create_and_edit_unit(): void
    {
        $admin = $this->admin();

        $payload = [
            'kode_unit' => 'PS5-03',
            'jenis_konsol' => 'PS5',
            'kondisi' => 'Baik',
            'status' => 'tersedia',
            'harga_sewa' => '100000',
            'nominal_deposit' => '1200000',
        ];

        $create = $this->actingAs($admin, 'admin')->post('/admin/units', $payload);
        $create->assertSessionHasNoErrors();
        $unit = PsUnit::where('kode_unit', 'PS5-03')->first();
        $this->assertNotNull($unit);

        $update = $this->actingAs($admin, 'admin')->patch('/admin/units/'.$unit->id, [
            ...$payload,
            'kondisi' => '',
            'status' => 'servis',
            'harga_sewa' => '120000',
        ]);
        $update->assertSessionHasNoErrors();

        $fresh = $unit->fresh();
        $this->assertSame('servis', $fresh->status);
        $this->assertSame(120000, (int) $fresh->harga_sewa);
    }

    public function test_create_and_edit_tier(): void
    {
        $admin = $this->admin();

        MembershipTier::create([
            'nama_tier' => 'bronze', 'harga_paket' => 0,
            'masa_berlaku_hari' => 0, 'diskon_persen' => 0,
        ]);

        $create = $this->actingAs($admin, 'admin')->post('/admin/tiers', [
            'nama_tier' => 'diamond',
            'harga_paket' => '250000',
            'masa_berlaku_hari' => '60',
            'diskon_persen' => '20',
            'benefit_lain' => '',
        ]);
        $create->assertSessionHasNoErrors();
        $tier = MembershipTier::where('nama_tier', 'diamond')->first();
        $this->assertNotNull($tier);

        $update = $this->actingAs($admin, 'admin')->patch('/admin/tiers/'.$tier->id, [
            'nama_tier' => 'diamond',
            'harga_paket' => '300000',
            'masa_berlaku_hari' => '90',
            'diskon_persen' => '25',
            'benefit_lain' => 'Prioritas booking',
        ]);
        $update->assertSessionHasNoErrors();
        $this->assertSame(300000, (int) $tier->fresh()->harga_paket);
    }

    public function test_create_and_edit_game_with_empty_file_field(): void
    {
        $admin = $this->admin();

        $payload = [
            'nama_game' => 'FIFA 26',
            'jenis_konsol' => 'PS5',
            'gambar' => '',
            'deskripsi' => '',
            'status' => 'aktif',
        ];

        $create = $this->actingAs($admin, 'admin')->post('/admin/games', $payload);
        $create->assertSessionHasNoErrors();
        $game = Game::where('nama_game', 'FIFA 26')->first();
        $this->assertNotNull($game);

        $update = $this->actingAs($admin, 'admin')->patch('/admin/games/'.$game->id, [
            ...$payload,
            'status' => 'nonaktif',
            'gambar' => UploadedFile::fake()->image('game.png', 400, 400),
        ]);
        $update->assertSessionHasNoErrors();
        $this->assertSame('nonaktif', $game->fresh()->status);
    }

    public function test_update_settings(): void
    {
        $response = $this->actingAs($this->admin(), 'admin')->patch('/admin/settings', [
            'alamat' => 'Jl. Test No. 1',
            'jam_operasional' => '10.00 - 22.00 WIB',
            'no_wa' => '628123456789',
            'email' => '',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertSame('Jl. Test No. 1', \App\Models\Setting::get('alamat'));
    }

    public function test_create_and_edit_admin_user_via_plain_and_encrypted_payload(): void
    {
        $admin = $this->admin();

        $create = $this->actingAs($admin, 'admin')->post('/admin/users', [
            'nama' => 'Staff Satu',
            'no_hp' => '08111222333',
            'email' => 'staff1@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ]);
        $create->assertSessionHasNoErrors();
        $this->assertDatabaseHas('admins', ['email' => 'staff1@example.com']);

        $staff = Admin::where('email', 'staff1@example.com')->first();

        // Edit lewat encrypted_payload (mode HTTPS/localhost, crypto.subtle tersedia)
        $edit = $this->actingAs($admin, 'admin')->patch('/admin/users/'.$staff->id, [
            'encrypted_payload' => \App\Support\RequestPayloadCrypt::encrypt([
                'nama' => 'Staff Satu',
                'no_hp' => '08111222333',
                'email' => 'staff1@example.com',
                'role' => 'admin',
                'password' => '',
            ]),
        ]);
        $edit->assertSessionHasNoErrors();
        $this->assertSame('admin', $staff->fresh()->role);

        $perms = $this->actingAs($admin, 'admin')->patch('/admin/users/'.$staff->id.'/permissions', [
            'permissions' => ['dashboard', 'rooms'],
        ]);
        $perms->assertSessionHasNoErrors();
        $this->assertSame(['dashboard', 'rooms'], $staff->fresh()->permissions);
    }

    /**
     * Mode fallback client (http non-localhost, crypto.subtle tidak ada):
     * encryptedPayload() sekarang mengirim field plain, bukan base64 bungkus.
     */
    public function test_edit_admin_user_via_plain_payload_fallback(): void
    {
        $admin = $this->admin();
        $staff = Admin::factory()->create(['role' => 'staff', 'email' => 'staff2@example.com']);

        $edit = $this->actingAs($admin, 'admin')->patch('/admin/users/'.$staff->id, [
            'nama' => 'Staff Dua',
            'no_hp' => '08111222334',
            'email' => 'staff2@example.com',
            'role' => 'admin',
            'password' => '',
        ]);

        $edit->assertSessionHasNoErrors();
        $this->assertSame('Staff Dua', $staff->fresh()->nama);
        $this->assertSame('admin', $staff->fresh()->role);
    }

    public function test_invalid_encrypted_payload_returns_validation_error_not_raw_422(): void
    {
        // Persis bentuk fallback lama: base64 JSON polos tanpa iv/data/tag.
        $legacyFallback = base64_encode(json_encode(['nama' => 'Staff', 'role' => 'staff']));

        $staff = Admin::factory()->create(['role' => 'staff', 'email' => 'staff3@example.com']);

        $response = $this->actingAs($this->admin(), 'admin')
            ->patch('/admin/users/'.$staff->id, ['encrypted_payload' => $legacyFallback]);

        $response->assertSessionHasErrors('encrypted_payload');
        $this->assertStringContainsString(
            'Muat ulang halaman',
            session('errors')->first('encrypted_payload'),
        );
    }

    public function test_delete_room_unit_tier_and_game(): void
    {
        $admin = $this->admin();

        $room = Room::create([
            'nama_room' => 'Room Hapus', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS5'], 'harga_per_jam' => 40000, 'status' => 'aktif',
        ]);
        $unit = PsUnit::create([
            'kode_unit' => 'PS4-01', 'jenis_konsol' => 'PS4', 'status' => 'tersedia',
            'harga_sewa' => 50000, 'nominal_deposit' => 500000,
        ]);
        $tier = MembershipTier::create([
            'nama_tier' => 'gold', 'harga_paket' => 200000,
            'masa_berlaku_hari' => 30, 'diskon_persen' => 20,
        ]);
        $game = Game::create([
            'nama_game' => 'Tekken 8', 'jenis_konsol' => 'PS5', 'status' => 'aktif',
        ]);

        $this->actingAs($admin, 'admin')->delete('/admin/rooms/'.$room->id)->assertSessionHasNoErrors();
        $this->actingAs($admin, 'admin')->delete('/admin/units/'.$unit->id)->assertSessionHasNoErrors();
        $this->actingAs($admin, 'admin')->delete('/admin/tiers/'.$tier->id)->assertSessionHasNoErrors();
        $this->actingAs($admin, 'admin')->delete('/admin/games/'.$game->id)->assertSessionHasNoErrors();

        $this->assertDatabaseMissing('rooms', ['id' => $room->id]);
        $this->assertDatabaseMissing('ps_units', ['id' => $unit->id]);
        $this->assertDatabaseMissing('membership_tiers', ['id' => $tier->id]);
        $this->assertDatabaseMissing('games', ['id' => $game->id]);
    }

    public function test_every_cms_page_renders(): void
    {
        $admin = $this->admin();

        foreach ([
            '/admin', '/admin/bookings', '/admin/rentals', '/admin/memberships',
            '/admin/members', '/admin/rooms', '/admin/units', '/admin/tiers',
            '/admin/games', '/admin/settings', '/admin/users',
        ] as $url) {
            $this->actingAs($admin, 'admin')->get($url)->assertOk();
        }
    }
}
