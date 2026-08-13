<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    protected $fillable = [
        'nama_game',
        'jenis_konsol',
        'gambar',
        'deskripsi',
        'status',
    ];
}
