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
        Schema::create('membership_tiers', function (Blueprint $table) {
            $table->id();
            $table->string('nama_tier', 20)->unique(); // bronze / silver / gold
            $table->unsignedBigInteger('harga_paket')->default(0); // 0 = gratis (bronze)
            $table->unsignedSmallInteger('masa_berlaku_hari')->default(30);
            $table->unsignedTinyInteger('diskon_persen')->default(0);
            $table->text('benefit_lain')->nullable();
            $table->timestamps();
        });

        Schema::create('membership_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tier_id')->constrained('membership_tiers');
            $table->unsignedBigInteger('harga_paket');
            $table->string('payment_method')->nullable();
            $table->enum('payment_status', ['belum_bayar', 'sudah_bayar', 'ditolak'])->default('belum_bayar');
            $table->enum('membership_status', ['pending_payment', 'active', 'expired', 'cancelled'])->default('pending_payment');
            $table->timestamp('expires_at')->nullable(); // batas pembayaran 30 menit
            $table->timestamp('valid_until')->nullable(); // aktif sampai kapan
            $table->timestamp('reminder_h1_sent_at')->nullable();
            $table->timestamp('expired_notif_sent_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('membership_purchases');
        Schema::dropIfExists('membership_tiers');
    }
};
