<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MembershipPurchase extends Model
{
    use SoftDeletes;

    protected $table = 'membership_purchases';

    protected $fillable = [
        'user_id',
        'tier_id',
        'harga_paket',
        'payment_method',
        'payment_status',
        'membership_status',
        'expires_at',
        'valid_until',
        'reminder_h1_sent_at',
        'expired_notif_sent_at',
    ];

    public const STATUS_PENDING = 'pending_payment';
    public const STATUS_ACTIVE = 'active';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'valid_until' => 'datetime',
            'reminder_h1_sent_at' => 'datetime',
            'expired_notif_sent_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tier(): BelongsTo
    {
        return $this->belongsTo(MembershipTier::class);
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }
}
