<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Revert enkripsi: decrypt data existing ke plaintext, hapus kolom hash,
     * dan restore unique constraint. KTP tetap di private disk + route auth.
     */
    public function up(): void
    {
        // 1. Decrypt data yang masih terenkripsi (AES-256-CBC via Crypt/APP_KEY)
        $this->decryptUsers();
        $this->decryptBookings();
        $this->decryptPhysicalRentals();

        // 2. Hapus kolom hash + restore unique
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['email_hash']);
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn(['email_hash', 'no_hp_hash']);
            $table->unique('email');
            $table->unique('no_hp');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn('no_hp_hash');
        });

        Schema::table('physical_rentals', function (Blueprint $table) {
            $table->dropIndex(['no_hp_hash']);
            $table->dropColumn('no_hp_hash');
        });

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->dropIndex(['email_hash']);
            $table->dropColumn('email_hash');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['email']);
            $table->dropUnique(['no_hp']);
            $table->string('email_hash', 64)->nullable()->after('email');
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('email_hash');
            $table->index('no_hp_hash');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('no_hp_hash');
        });

        Schema::table('physical_rentals', function (Blueprint $table) {
            $table->string('no_hp_hash', 64)->nullable()->after('no_hp');
            $table->index('no_hp_hash');
        });

        Schema::table('password_reset_tokens', function (Blueprint $table) {
            $table->string('email_hash', 64)->nullable()->after('email');
            $table->index('email_hash');
        });
    }

    private function isEncrypted(?string $value): bool
    {
        return $value !== null && str_starts_with($value, 'eyJ');
    }

    private function tryDecrypt(?string $value): ?string
    {
        if (! $this->isEncrypted($value)) {
            return $value;
        }

        try {
            return Crypt::decryptString($value);
        } catch (\Throwable) {
            return $value;
        }
    }

    private function decryptUsers(): void
    {
        DB::table('users')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                $email = $this->tryDecrypt($row->email);
                $noHp = $this->tryDecrypt($row->no_hp);

                DB::table('users')->where('id', $row->id)->update([
                    'email' => $email,
                    'no_hp' => $noHp,
                ]);
            }
        });
    }

    private function decryptBookings(): void
    {
        DB::table('bookings')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('bookings')->where('id', $row->id)->update([
                    'nama' => $this->tryDecrypt($row->nama),
                    'no_hp' => $this->tryDecrypt($row->no_hp),
                ]);
            }
        });
    }

    private function decryptPhysicalRentals(): void
    {
        DB::table('physical_rentals')->orderBy('id')->chunkById(200, function ($rows) {
            foreach ($rows as $row) {
                DB::table('physical_rentals')->where('id', $row->id)->update([
                    'nama' => $this->tryDecrypt($row->nama),
                    'no_hp' => $this->tryDecrypt($row->no_hp),
                    'alamat' => $this->tryDecrypt($row->alamat),
                    'foto_ktp' => $this->tryDecrypt($row->foto_ktp),
                ]);
            }
        });
    }
};
