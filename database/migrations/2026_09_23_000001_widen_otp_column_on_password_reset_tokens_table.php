<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * OTP reset password kini disimpan sebagai hash (bcrypt ~60 karakter),
     * bukan lagi 6 digit plaintext.
     */
    public function up(): void
    {
        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->string('otp', 255)->nullable()->change();
        });
    }

    public function down(): void
    {
        DB::table('password_reset_tokens')->update(['otp' => null]);

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->string('otp', 6)->nullable()->change();
        });
    }
};
