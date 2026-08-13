<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('nama_room');
            $table->unsignedSmallInteger('kapasitas')->default(1);
            // JSON daftar konsol yang tersedia di room ini (PS3/PS4/PS5)
            $table->json('konsol_tersedia');
            $table->unsignedBigInteger('harga_per_jam')->default(40000);
            $table->string('foto')->nullable();
            $table->text('fasilitas')->nullable();
            $table->enum('status', ['aktif', 'maintenance'])->default('aktif');
            $table->timestamps();
        });

        Schema::create('ps_units', function (Blueprint $table) {
            $table->id();
            $table->string('kode_unit')->unique();
            $table->enum('jenis_konsol', ['PS3', 'PS4', 'PS5']);
            $table->string('kondisi')->nullable();
            $table->enum('status', ['tersedia', 'disewa', 'servis'])->default('tersedia');
            $table->unsignedBigInteger('harga_sewa'); // harga per hari
            $table->unsignedBigInteger('nominal_deposit')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ps_units');
        Schema::dropIfExists('rooms');
    }
};
