<?php

namespace Tests\Feature;

use App\Console\Commands\ExpirePendingPayments;
use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\MembershipTier;
use App\Models\PhysicalRental;
use App\Models\PsUnit;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test logic kritis: expiry job, anti double-booking, kalkulasi diskon,
 * validasi durasi sewa fisik, dan auto-downgrade membership.
 */
class BookingLogicTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        MembershipTier::create([
            'nama_tier' => 'bronze', 'harga_paket' => 0, 'masa_berlaku_hari' => 0,
            'diskon_persen' => 0, 'benefit_lain' => null,
        ]);
        MembershipTier::create([
            'nama_tier' => 'silver', 'harga_paket' => 100000, 'masa_berlaku_hari' => 30,
            'diskon_persen' => 15, 'benefit_lain' => null,
        ]);
        MembershipTier::create([
            'nama_tier' => 'gold', 'harga_paket' => 150000, 'masa_berlaku_hari' => 30,
            'diskon_persen' => 20, 'benefit_lain' => null,
        ]);
    }

    private function makeRoom(): Room
    {
        return Room::create([
            'nama_room' => 'Room Test',
            'kapasitas' => 2,
            'konsol_tersedia' => ['PS3', 'PS4', 'PS5'],
            'harga_per_jam' => 40000,
            'status' => 'aktif',
        ]);
    }

    private function makeUnit(): PsUnit
    {
        return PsUnit::create([
            'kode_unit' => 'PS5-TEST',
            'jenis_konsol' => 'PS5',
            'kondisi' => 'Baik',
            'status' => 'tersedia',
            'harga_sewa' => 100000,
            'nominal_deposit' => 1200000,
        ]);
    }

    public function test_pending_booking_expired_by_command_free_the_slot(): void
    {
        $room = $this->makeRoom();

        $booking = Booking::create([
            'room_id' => $room->id,
            'konsol' => 'PS5',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 2,
            'harga_total' => 80000,
            'nama' => 'Test',
            'no_hp' => '081234567890',
            'booking_status' => Booking::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->subMinute(), // sudah lewat 30 menit
        ]);

        $this->artisan('bookings:expire-pending')->assertSuccessful();

        $this->assertSame(
            Booking::STATUS_EXPIRED,
            $booking->fresh()->booking_status,
        );

        // Activity log tercatat
        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $booking->id,
            'action' => 'auto_expired',
            'to_status' => Booking::STATUS_EXPIRED,
        ]);
    }

    public function test_pending_booking_within_window_is_not_expired(): void
    {
        $room = $this->makeRoom();

        $booking = Booking::create([
            'room_id' => $room->id,
            'konsol' => 'PS5',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 2,
            'harga_total' => 80000,
            'nama' => 'Test',
            'no_hp' => '081234567890',
            'booking_status' => Booking::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->addMinutes(20), // masih dalam 30 menit
        ]);

        $this->artisan('bookings:expire-pending')->assertSuccessful();

        $this->assertSame(
            Booking::STATUS_PENDING,
            $booking->fresh()->booking_status,
        );
    }

    public function test_silver_member_gets_15_percent_discount_on_booking(): void
    {
        $room = $this->makeRoom();
        $silverTier = MembershipTier::where('nama_tier', 'silver')->first();

        $user = User::factory()->create(['membership_tier' => 'silver']);
        MembershipPurchase::create([
            'user_id' => $user->id,
            'tier_id' => $silverTier->id,
            'harga_paket' => 100000,
            'membership_status' => MembershipPurchase::STATUS_ACTIVE,
            'payment_status' => 'sudah_bayar',
            'valid_until' => now()->addDays(20),
        ]);

        // 2 jam x 40000 = 80000; diskon 15% -> 68000
        $response = $this->actingAs($user)->post('/booking/room', [
            'nama' => $user->nama,
            'no_hp' => $user->no_hp,
            'tanggal' => now()->addDays(2)->toDateString(),
            'jam_mulai' => '14:00',
            'durasi' => 2,
            'room_id' => $room->id,
            'konsol' => 'PS5',
            'catatan' => null,
        ]);

        $response->assertSessionHasNoErrors();

        $booking = Booking::latest('id')->first();
        $this->assertSame(68000, (int) $booking->harga_total);
        $this->assertSame(15, (int) $booking->diskon_persen);
    }

    public function test_bronze_or_guest_gets_no_discount(): void
    {
        $room = $this->makeRoom();

        // Guest booking: tanpa diskon
        $response = $this->post('/booking/room', [
            'nama' => 'Guest',
            'no_hp' => '081234567893',
            'tanggal' => now()->addDays(3)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 1,
            'room_id' => $room->id,
            'konsol' => 'PS4',
        ]);

        $response->assertSessionHasNoErrors();
        $booking = Booking::latest('id')->first();
        $this->assertSame(40000, (int) $booking->harga_total);
        $this->assertSame(0, (int) $booking->diskon_persen);
        $this->assertSame(Booking::STATUS_PENDING, $booking->booking_status);
        $this->assertNotNull($booking->expires_at);
    }

    public function test_double_booking_same_slot_is_rejected(): void
    {
        $room = $this->makeRoom();

        // Booking pertama mengunci slot 10:00-12:00
        Booking::create([
            'room_id' => $room->id,
            'konsol' => 'PS5',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 2,
            'harga_total' => 80000,
            'nama' => 'A',
            'no_hp' => '081234567894',
            'booking_status' => Booking::STATUS_CONFIRMED,
            'payment_status' => 'sudah_bayar',
        ]);

        // User lain coba booking jam 11:00 (overlap)
        $response = $this->post('/booking/room', [
            'nama' => 'B',
            'no_hp' => '081234567895',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '11:00',
            'durasi' => 1,
            'room_id' => $room->id,
            'konsol' => 'PS5',
        ]);

        $response->assertSessionHasErrors('jam_mulai');
        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_physical_rental_validates_duration_between_1_and_7_days(): void
    {
        $unit = $this->makeUnit();

        // 10 hari -> ditolak
        $response = $this->post('/booking/fisik', [
            'nama' => 'Test',
            'no_hp' => '081234567896',
            'alamat' => 'Jl. Test 1',
            'ps_unit_id' => $unit->id,
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_kembali' => now()->addDays(10)->toDateString(),
            'foto_ktp' => \Illuminate\Http\UploadedFile::fake()->image('ktp.jpg'),
            'setuju_tnc' => true,
        ]);

        $response->assertSessionHasErrors('tanggal_kembali');
        $this->assertDatabaseCount('physical_rentals', 0);
    }

    public function test_physical_rental_requires_ktp_photo(): void
    {
        $unit = $this->makeUnit();

        $response = $this->post('/booking/fisik', [
            'nama' => 'Test',
            'no_hp' => '081234567897',
            'alamat' => 'Jl. Test 2',
            'ps_unit_id' => $unit->id,
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_kembali' => now()->addDays(3)->toDateString(),
        ]);

        $response->assertSessionHasErrors('foto_ktp');
    }

    public function test_physical_rental_requires_tnc_acceptance(): void
    {
        $unit = $this->makeUnit();

        $response = $this->post('/booking/fisik', [
            'nama' => 'Test',
            'no_hp' => '081234567898',
            'alamat' => 'Jl. Test 3',
            'ps_unit_id' => $unit->id,
            'tanggal_mulai' => now()->addDays(1)->toDateString(),
            'tanggal_kembali' => now()->addDays(2)->toDateString(),
            'foto_ktp' => \Illuminate\Http\UploadedFile::fake()->image('ktp.jpg'),
            // setuju_tnc tidak dikirim
        ]);

        $response->assertSessionHasErrors('setuju_tnc');
        $this->assertDatabaseCount('physical_rentals', 0);
    }

    public function test_membership_purchase_pending_expires_via_command(): void
    {
        $user = User::factory()->create();
        $silverTier = MembershipTier::where('nama_tier', 'silver')->first();

        $purchase = MembershipPurchase::create([
            'user_id' => $user->id,
            'tier_id' => $silverTier->id,
            'harga_paket' => 100000,
            'membership_status' => MembershipPurchase::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->subMinute(),
        ]);

        $this->artisan('bookings:expire-pending')->assertSuccessful();

        $this->assertSame(
            MembershipPurchase::STATUS_EXPIRED,
            $purchase->fresh()->membership_status,
        );
    }

    public function test_membership_auto_downgrade_to_bronze_after_grace_period(): void
    {
        $user = User::factory()->create(['membership_tier' => 'silver']);
        $silverTier = MembershipTier::where('nama_tier', 'silver')->first();

        // Status expired, valid_until 2 hari lalu (tenggang 1 hari lewat)
        MembershipPurchase::create([
            'user_id' => $user->id,
            'tier_id' => $silverTier->id,
            'harga_paket' => 100000,
            'membership_status' => MembershipPurchase::STATUS_EXPIRED,
            'payment_status' => 'sudah_bayar',
            'valid_until' => now()->subDays(2),
        ]);

        $this->artisan('membership:process-daily')->assertSuccessful();

        $this->assertSame('bronze', $user->fresh()->membership_tier);
    }
}
