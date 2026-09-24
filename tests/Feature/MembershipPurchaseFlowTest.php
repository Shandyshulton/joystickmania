<?php

namespace Tests\Feature;

use App\Models\MembershipTier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Alur tamu -> membership -> masuk/daftar -> langsung sampai ke tahap pemesanan.
 */
class MembershipPurchaseFlowTest extends TestCase
{
    use RefreshDatabase;

    private function silverTier(): MembershipTier
    {
        return MembershipTier::create([
            'nama_tier' => 'silver',
            'harga_paket' => 100_000,
            'masa_berlaku_hari' => 30,
            'diskon_persen' => 15,
            'benefit_lain' => 'Booking lebih awal (H-3).',
        ]);
    }

    private function makeMember(): User
    {
        return User::create([
            'nama' => 'Pembeli Demo',
            'no_hp' => '081200000001',
            'email' => 'pembeli@test.com',
            'password' => 'password',
            'membership_tier' => 'bronze',
        ]);
    }

    public function test_guest_purchase_attempt_remembers_the_target_page(): void
    {
        $tier = $this->silverTier();

        $response = $this->get("/membership/beli/{$tier->id}");

        $response->assertRedirect('/login');
        $this->assertSame(
            "/membership/beli/{$tier->id}",
            parse_url((string) session('url.intended'), PHP_URL_PATH),
        );
    }

    public function test_login_after_the_bounce_lands_on_the_purchase_page(): void
    {
        $tier = $this->silverTier();
        $this->makeMember();

        $this->get("/membership/beli/{$tier->id}")->assertRedirect('/login');

        $response = $this->post('/login', [
            'email' => 'pembeli@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect("/membership/beli/{$tier->id}");
        $this->assertAuthenticated('web');
    }

    public function test_register_then_login_lands_on_the_purchase_page(): void
    {
        $tier = $this->silverTier();

        $this->get("/membership/beli/{$tier->id}")->assertRedirect('/login');

        $this->post('/register', [
            'nama' => 'Pembeli Baru',
            'no_hp' => '081200000002',
            'email' => 'baru@test.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])->assertRedirect(route('login', absolute: false));

        $response = $this->post('/login', [
            'email' => 'baru@test.com',
            'password' => 'password',
        ]);

        $response->assertRedirect("/membership/beli/{$tier->id}");
        $this->assertAuthenticated('web');
    }

    public function test_free_tier_is_not_offered_as_a_purchase(): void
    {
        $tier = MembershipTier::create([
            'nama_tier' => 'bronze',
            'harga_paket' => 0,
            'masa_berlaku_hari' => 0,
            'diskon_persen' => 0,
            'benefit_lain' => 'Tier default gratis.',
        ]);

        $this->actingAs($this->makeMember());

        $this->get("/membership/beli/{$tier->id}")->assertRedirect(route('membership'));
    }
}
