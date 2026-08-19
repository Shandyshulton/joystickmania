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
        // Kolom hash untuk lookup deterministik (email/no_hp di-encrypt penuh,
        // jadi tidak bisa di-query langsung via SQL).
        Schema::table('users', function (Blueprint $table) {
            $table->string('email_hash', 64)->nullable()->after('email');
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('email_hash');
            $table->index('no_hp_hash');

            // Ciphertext acak per baris -> unique constraint tidak bisa dipakai.
            $table->dropUnique(['email']);
            $table->dropUnique(['no_hp']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('no_hp_hash');
        });

        Schema::table('physical_rentals', function (Blueprint $table) {
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('no_hp_hash');
        });

        // Tabel token reset password: key lookup pakai hash email
        // (email asli di users sudah terenkripsi).
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->string('email_hash', 64)->nullable()->after('email');
            $table->index('email_hash');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropIndex(['email_hash']);
            $table->dropColumn('email_hash');
        });

        Schema::table('physical_rentals', function (Blueprint $table) {
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn('no_hp_hash');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn('no_hp_hash');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email_hash']);
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn(['email_hash', 'no_hp_hash']);
            $table->unique('email');
            $table->unique('no_hp');
        });
    }
};
