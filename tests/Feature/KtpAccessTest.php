<?php

namespace Tests\Feature;

use App\Models\Admin;
use App\Models\PhysicalRental;
use App\Models\PsUnit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class KtpAccessTest extends TestCase
{
    use RefreshDatabase;

    private function makeUnit(): PsUnit
    {
        return PsUnit::create([
            'kode_unit' => 'PS5-KTP',
            'jenis_konsol' => 'PS5',
            'kondisi' => 'Baik',
            'status' => 'tersedia',
            'harga_sewa' => 100000,
            'nominal_deposit' => 1200000,
        ]);
    }

    private function makeRentalWithKtp(User $owner): PhysicalRental
    {
        Storage::fake('local');
        Storage::disk('local')->put('ktp/test-file.jpg', 'foto-ktp-bytes');

        return PhysicalRental::create([
            'user_id' => $owner->id,
            'ps_unit_id' => $this->makeUnit()->id,
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_kembali' => now()->addDays(2)->toDateString(),
            'total_biaya' => 100000,
            'nama' => 'Pemilik',
            'no_hp' => '081234567890',
            'alamat' => 'Jl. Test',
            'foto_ktp' => 'ktp/test-file.jpg',
            'nominal_deposit' => 1200000,
            'deposit_status' => 'ditahan',
            'booking_status' => 'pending_payment',
            'payment_status' => 'belum_bayar',
        ]);
    }

    public function test_owner_can_view_own_ktp(): void
    {
        $owner = User::factory()->create();
        $rental = $this->makeRentalWithKtp($owner);

        $response = $this->actingAs($owner)->get("/ktp/{$rental->id}");

        $response->assertOk();
        $response->assertHeader('content-type', 'image/jpeg');
    }

    public function test_other_user_cannot_view_ktp(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $rental = $this->makeRentalWithKtp($owner);

        $response = $this->actingAs($other)->get("/ktp/{$rental->id}");

        $response->assertForbidden();
    }

    public function test_guest_redirected_to_login_for_ktp(): void
    {
        $owner = User::factory()->create();
        $rental = $this->makeRentalWithKtp($owner);

        $response = $this->get("/ktp/{$rental->id}");

        $response->assertRedirect('/login');
    }

    public function test_admin_can_view_ktp(): void
    {
        $owner = User::factory()->create();
        $rental = $this->makeRentalWithKtp($owner);

        $admin = Admin::factory()->create([
            'role' => 'admin',
            'permissions' => ['rentals'],
        ]);

        $response = $this->actingAs($admin, 'admin')->get("/admin/rentals/{$rental->id}/ktp");

        $response->assertOk();
        $response->assertHeader('content-type', 'image/jpeg');
    }

    public function test_ktp_path_is_hidden_from_payload(): void
    {
        $admin = Admin::factory()->create(['role' => 'admin']);
        $rental = $this->makeRentalWithKtp(User::factory()->create());

        $response = $this->actingAs($admin, 'admin')->get('/admin/rentals');

        $response->assertOk();
        $response->assertDontSee('ktp/test-file.jpg');
        $response->assertDontSee('foto-ktp');
    }
}
