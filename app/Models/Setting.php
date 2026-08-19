<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value', 'group'];

    /**
     * Ambil nilai setting berdasarkan key. Kembalikan $default jika belum ada.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        return $setting?->value ?? $default;
    }

    /**
     * Ambil semua setting dalam bentuk key => value.
     */
    public static function allValues(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
