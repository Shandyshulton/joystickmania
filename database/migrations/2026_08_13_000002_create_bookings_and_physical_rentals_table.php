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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            // guest boleh booking -> nullable
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('room_id')->constrained();
            $table->enum('konsol', ['PS3', 'PS4', 'PS5']);
            $table->date('tanggal');
            $table->time('jam_mulai');
            $table->unsignedTinyInteger('durasi'); // jam
            $table->unsignedBigInteger('harga_total')->default(0);
            $table->unsignedBigInteger('diskon_persen')->default(0);
            $table->string('nama');
            $table->string('no_hp');
            $table->text('catatan')->nullable();
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['belum_bayar', 'sudah_bayar', 'ditolak'])->default('belum_bayar');
            $table->enum('booking_status', ['pending_payment', 'confirmed', 'expired', 'cancelled', 'selesai'])->default('pending_payment');
            // Batas waktu pembayaran: waktu submit + 30 menit
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indeks anti double-booking
            $table->index(['tanggal', 'jam_mulai', 'room_id']);
        });

        Schema::create('physical_rentals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ps_unit_id')->constrained();
            $table->date('tanggal_mulai');
            $table->date('tanggal_kembali');
            $table->unsignedBigInteger('total_biaya')->default(0);
            $table->string('nama');
            $table->string('no_hp');
            $table->text('alamat');
            $table->string('foto_ktp'); // path ke file upload
            $table->unsignedBigInteger('nominal_deposit')->default(0);
            $table->enum('deposit_status', ['ditahan', 'dikembalikan'])->default('ditahan');
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['belum_bayar', 'sudah_bayar', 'ditolak'])->default('belum_bayar');
            $table->enum('booking_status', ['pending_payment', 'confirmed', 'expired', 'cancelled', 'selesai'])->default('pending_payment');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['tanggal_mulai', 'tanggal_kembali', 'ps_unit_id']);
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->nullableMorphs('subject'); // booking / physical_rental / membership_purchase
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('action');
            $table->string('from_status')->nullable();
            $table->string('to_status')->nullable();
            $table->text('catatan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('physical_rentals');
        Schema::dropIfExists('bookings');
    }
};
