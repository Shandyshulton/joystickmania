<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Room;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * Riwayat pemesanan tidak boleh bisa dienumerasi lewat nomor HP.
 * Tamu hanya melihat record yang dibuat dari sesi/perangkatnya sendiri.
 */
class BookingHistoryTest extends TestCase
{
    use RefreshDatabase;

    private function makeRoom(): Room
    {
        return Room::create([
            'nama_room' => 'Room Riwayat',
            'kapasitas' => 2,
            'konsol_tersedia' => ['PS3', 'PS4', 'PS5'],
            'harga_per_jam' => 40000,
            'status' => 'aktif',
        ]);
    }

    private function makeBooking(Room $room, ?int $userId, string $noHp): Booking
    {
        return Booking::create([
            'user_id' => $userId,
            'room_id' => $room->id,
            'konsol' => 'PS4',
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '13:00',
            'durasi' => 1,
            'harga_total' => 40000,
            'nama' => 'Nama Pemesan',
            'no_hp' => $noHp,
            'booking_status' => Booking::STATUS_PENDING,
            'payment_status' => 'belum_bayar',
            'expires_at' => now()->addMinutes(30),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function guestBookingPayload(Room $room, string $noHp = '081234567890'): array
    {
        return [
            'room_id' => $room->id,
            'nama' => 'Tamu Riwayat',
            'no_hp' => $noHp,
            'tanggal' => now()->addDays(1)->toDateString(),
            'jam_mulai' => '10:00',
            'durasi' => 2,
            'konsol' => 'PS4',
        ];
    }

    public function test_guest_cannot_find_history_by_phone_number(): void
    {
        $room = $this->makeRoom();
        $booking = $this->makeBooking($room, null, '081111111111');

        $response = $this->get('/riwayat?no_hp=081111111111');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('History')
            ->has('bookings', 0)
        );

        // Nomor HP yang sama juga tidak membuka sewa fisik (tidak ada di sesi)
        $this->assertDatabaseHas('bookings', ['id' => $booking->id]);
    }

    public function test_guest_sees_booking_created_from_own_session(): void
    {
        $room = $this->makeRoom();

        $this->post('/booking/room', $this->guestBookingPayload($room))->assertOk();

        $response = $this->get('/riwayat');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('History')
            ->has('bookings', 1)
        );
    }

    public function test_logged_in_user_sees_own_history(): void
    {
        $room = $this->makeRoom();
        $user = User::factory()->create();

        $this->makeBooking($room, $user->id, '082222222222');

        $response = $this->actingAs($user)->get('/riwayat');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('History')
            ->has('bookings', 1)
        );
    }

    public function test_logged_in_user_does_not_see_other_peoples_history(): void
    {
        $room = $this->makeRoom();
        $user = User::factory()->create();

        $this->makeBooking($room, null, '083333333333');

        $response = $this->actingAs($user)->get('/riwayat?no_hp=083333333333');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page->has('bookings', 0));
    }

    public function test_booking_status_is_forbidden_for_records_outside_session_or_user(): void
    {
        $room = $this->makeRoom();
        $booking = $this->makeBooking($room, null, '084444444444');

        $this->getJson("/booking/status?tipe=room&id={$booking->id}")
            ->assertForbidden();
    }

    public function test_booking_status_is_visible_to_the_guest_who_created_it(): void
    {
        $room = $this->makeRoom();

        $this->post('/booking/room', $this->guestBookingPayload($room))->assertOk();

        $booking = Booking::latest('id')->firstOrFail();

        $this->getJson("/booking/status?tipe=room&id={$booking->id}")
            ->assertOk()
            ->assertJson(['status' => Booking::STATUS_PENDING]);
    }

    public function test_booking_status_is_visible_to_the_logged_in_owner(): void
    {
        $room = $this->makeRoom();
        $user = User::factory()->create();

        $booking = $this->makeBooking($room, $user->id, '085555555555');

        $this->actingAs($user)
            ->getJson("/booking/status?tipe=room&id={$booking->id}")
            ->assertOk()
            ->assertJson(['status' => Booking::STATUS_PENDING]);
    }
}
