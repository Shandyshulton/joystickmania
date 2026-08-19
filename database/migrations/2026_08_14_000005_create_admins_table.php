<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('no_hp')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->string('role', 20)->default('staff');
            $table->json('permissions')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });

        if (Schema::hasTable('users') && Schema::hasColumn('users', 'role')) {
            DB::table('users')
                ->whereIn('role', ['super_admin', 'admin', 'staff'])
                ->orderBy('id')
                ->get()
                ->each(function ($user): void {
                    DB::table('admins')->updateOrInsert(
                        ['email' => $user->email],
                        [
                            'nama' => $user->nama,
                            'no_hp' => $user->no_hp,
                            'password' => $user->password,
                            'role' => $user->role,
                            'permissions' => $user->permissions,
                            'remember_token' => $user->remember_token,
                            'created_at' => $user->created_at,
                            'updated_at' => $user->updated_at,
                        ]
                    );
                });

            DB::table('users')
                ->whereIn('role', ['super_admin', 'admin', 'staff'])
                ->delete();
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};
