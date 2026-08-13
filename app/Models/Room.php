<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'nama_room',
        'kapasitas',
        'konsol_tersedia',
        'harga_per_jam',
        'foto',
        'fasilitas',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'konsol_tersedia' => 'array',
        ];
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
