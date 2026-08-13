<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipTier extends Model
{
    protected $table = 'membership_tiers';

    protected $fillable = [
        'nama_tier',
        'harga_paket',
        'masa_berlaku_hari',
        'diskon_persen',
        'benefit_lain',
    ];

    public function purchases(): HasMany
    {
        return $this->hasMany(MembershipPurchase::class, 'tier_id');
    }
}
