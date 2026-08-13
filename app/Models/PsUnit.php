<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PsUnit extends Model
{
    protected $fillable = [
        'kode_unit',
        'jenis_konsol',
        'kondisi',
        'status',
        'harga_sewa',
        'nominal_deposit',
    ];

    public function physicalRentals(): HasMany
    {
        return $this->hasMany(PhysicalRental::class);
    }
}
