<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('umum');
            $table->timestamps();
        });

        // Data default settings website
        $defaults = [
            ['key' => 'alamat', 'value' => 'Jl. Contoh No. 1, Kota', 'group' => 'kontak'],
            ['key' => 'jam_operasional', 'value' => '10.00 - 22.00 WIB', 'group' => 'kontak'],
            ['key' => 'no_wa', 'value' => config('app.wa_admin_number', '6281234567890'), 'group' => 'kontak'],
            ['key' => 'email', 'value' => '', 'group' => 'kontak'],
        ];

        DB::table('settings')->insert($defaults);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
