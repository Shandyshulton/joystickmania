<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Booking extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'room_id',
        'konsol',
        'tanggal',
        'jam_mulai',
        'durasi',
        'harga_total',
        'diskon_persen',
        'nama',
        'no_hp',
        'catatan',
        'payment_method',
        'payment_status',
        'booking_status',
        'expires_at',
    ];

    public const STATUS_PENDING = 'pending_payment';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_SELESAI = 'selesai';

    protected function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jam_mulai' => 'datetime:H:i',
            'expires_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }

    /**
     * Booking masih mengunci slot? True jika status pending/confirmed
     * dan belum lewat jadwal.
     */
    public function isLockingSlot(): bool
    {
        return in_array($this->booking_status, [
            self::STATUS_PENDING,
            self::STATUS_CONFIRMED,
        ]);
    }
}
