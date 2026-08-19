<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PhysicalRental extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'ps_unit_id',
        'tanggal_mulai',
        'tanggal_kembali',
        'total_biaya',
        'nama',
        'no_hp',
        'alamat',
        'foto_ktp',
        'nominal_deposit',
        'deposit_status',
        'payment_method',
        'payment_status',
        'booking_status',
        'expires_at',
    ];

    // Path foto KTP tidak boleh pernah masuk payload browser.
    protected $hidden = ['foto_ktp'];

    public const STATUS_PENDING = 'pending_payment';
    public const STATUS_CONFIRMED = 'confirmed';
    public const STATUS_EXPIRED = 'expired';
    public const STATUS_CANCELLED = 'cancelled';
    public const STATUS_SELESAI = 'selesai';

    protected function casts(): array
    {
        return [
            'tanggal_mulai' => 'date',
            'tanggal_kembali' => 'date',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Apakah rental ini punya foto KTP? Dipakai frontend (has_ktp)
     * karena path asli tidak pernah dikirim ke browser.
     */
    public function getHasKtpAttribute(): bool
    {
        return ! empty($this->getRawOriginal('foto_ktp'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function psUnit(): BelongsTo
    {
        return $this->belongsTo(PsUnit::class);
    }

    public function activityLogs(): MorphMany
    {
        return $this->morphMany(ActivityLog::class, 'subject');
    }
}
