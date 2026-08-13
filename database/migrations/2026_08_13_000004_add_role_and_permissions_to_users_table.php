<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah role (super_admin/admin/staff/user) & permission checklist ke users.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // user = member biasa (tanpa akses CMS)
            $table->string('role', 20)->default('user')->after('is_admin');
            // JSON daftar permission yang dicentang; null = pakai default role
            $table->json('permissions')->nullable()->after('role');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'permissions']);
        });
    }
};
