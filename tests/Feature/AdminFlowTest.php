<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\MembershipPurchase;
use App\Models\MembershipTier;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Test alur admin: role-based access, update status booking,
 * konfirmasi membership (set tier & valid_until), audit log.
 */
class AdminFlowTest extends TestCase
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
    }

    private function admin(): User
    {
        return User::factory()->create([
            'role' => 'super_admin',
            'is_admin' => true,
        ]);
    }

    public function test_non_admin_cannot_access_admin_panel(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_admin_can_access_dashboard(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin')->assertOk();
        $this->actingAs($admin)->get('/admin/bookings')->assertOk();
        $this->actingAs($admin)->get('/admin/rentals')->assertOk();
        $this->actingAs($admin)->get('/admin/memberships')->assertOk();
        $this->actingAs($admin)->get('/admin/members')->assertOk();
        $this->actingAs($admin)->get('/admin/rooms')->assertOk();
        $this->actingAs($admin)->get('/admin/units')->assertOk();
        $this->actingAs($admin)->get('/admin/tiers')->assertOk();
    }

    public function test_admin_confirming_booking_writes_activity_log(): void
    {
        $admin = $this->admin();
        $room = Room::create([
            'nama_room' => 'Room 1', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS5'], 'harga_per_jam' => 40000, 'status' => 'aktif',
        ]);

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
            'expires_at' => now()->addMinutes(20),
        ]);

        $response = $this->actingAs($admin)->patch('/admin/bookings/'.$booking->id, [
            'payment_method' => 'Transfer BCA',
            'payment_status' => 'sudah_bayar',
            'booking_status' => Booking::STATUS_CONFIRMED,
        ]);

        $response->assertSessionHasNoErrors();

        $this->assertSame(Booking::STATUS_CONFIRMED, $booking->fresh()->booking_status);
        $this->assertSame('sudah_bayar', $booking->fresh()->payment_status);
        $this->assertDatabaseHas('activity_logs', [
            'subject_id' => $booking->id,
            'action' => 'admin_update',
        ]);
    }

    public function test_admin_confirming_membership_activates_tier_and_sets_valid_until(): void
    {
        $admin = $this->admin();
        $member = User::factory()->create(['membership_tier' => 'bronze']);
        $silver = MembershipTier::where('nama_tier', 'silver')->first();

        $purchase = MembershipPurchase::create([
            'user_id' => $member->id,
            'tier_id' => $silver->id,
            'harga_paket' => 100000,
            'membership_status' => MembershipPurchase::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->addMinutes(20),
        ]);

        $response = $this->actingAs($admin)->patch('/admin/memberships/'.$purchase->id, [
            'payment_status' => 'sudah_bayar',
            'membership_status' => MembershipPurchase::STATUS_ACTIVE,
        ]);

        $response->assertSessionHasNoErrors();

        $fresh = $purchase->fresh();
        $this->assertSame(MembershipPurchase::STATUS_ACTIVE, $fresh->membership_status);
        $this->assertNotNull($fresh->valid_until);
        $this->assertSame('silver', $member->fresh()->membership_tier);
    }

    public function test_admin_can_manage_rooms_crud(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin)->post('/admin/rooms', [
            'nama_room' => 'Room Baru',
            'kapasitas' => 4,
            'konsol_tersedia' => ['PS5'],
            'harga_per_jam' => 60000,
            'fasilitas' => 'AC',
            'status' => 'aktif',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('rooms', ['nama_room' => 'Room Baru']);
    }

    public function test_rejected_payment_forces_booking_status_cancelled(): void
    {
        $admin = $this->admin();
        $room = Room::create([
            'nama_room' => 'Room 1', 'kapasitas' => 2,
            'konsol_tersedia' => ['PS5'], 'harga_per_jam' => 40000, 'status' => 'aktif',
        ]);

        $booking = Booking::create([
            'room_id' => $room->id,
            'konsol' => 'PS5',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 2,
            'harga_total' => 80000,
            'nama' => 'Test',
            'no_hp' => '081234567899',
            'booking_status' => Booking::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->addMinutes(20),
        ]);

        // Admin memilih payment ditolak (booking_status dikirim confirmed, harus dipaksa cancelled)
        $this->actingAs($admin)->patch('/admin/bookings/'.$booking->id, [
            'payment_status' => 'ditolak',
            'booking_status' => 'confirmed',
        ]);

        $fresh = $booking->fresh();
        $this->assertSame('ditolak', $fresh->payment_status);
        $this->assertSame(Booking::STATUS_CANCELLED, $fresh->booking_status);
    }

    public function test_staff_with_permission_can_access_allowed_menu_only(): void
    {
        $staff = User::factory()->create([
            'role' => 'staff',
            'permissions' => ['dashboard', 'bookings'],
        ]);

        // Menu yang dicentang -> boleh
        $this->actingAs($staff)->get('/admin')->assertOk();
        $this->actingAs($staff)->get('/admin/bookings')->assertOk();

        // Menu yang tidak dicentang -> 403
        $this->actingAs($staff)->get('/admin/rentals')->assertForbidden();
        $this->actingAs($staff)->get('/admin/rooms')->assertForbidden();
        // Manajemen user khusus super admin -> 403
        $this->actingAs($staff)->get('/admin/users')->assertForbidden();
    }

    public function test_super_admin_can_manage_users(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->get('/admin/users')->assertOk();

        $response = $this->actingAs($admin)->post('/admin/users', [
            'nama' => 'Staff Baru',
            'no_hp' => '081222333444',
            'email' => 'staffbaru@example.com',
            'password' => 'password123',
            'role' => 'staff',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', ['email' => 'staffbaru@example.com', 'role' => 'staff']);
    }

    public function test_admin_cannot_access_user_management(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'is_admin' => true]);

        $this->actingAs($admin)->get('/admin/users')->assertForbidden();
    }
}
