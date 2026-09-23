<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ImageUploader
{
    /**
     * Batas ukuran file (bytes) sebelum di-resize otomatis.
     */
    public const MAX_BEFORE_RESIZE = 3 * 1024 * 1024; // 3 MB

    /**
     * Ekstensi yang boleh dipakai menyimpan gambar.
     * Diambil dari hasil deteksi isi file, bukan nama file kiriman client.
     */
    private const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

    /**
     * Simpan gambar ke disk dengan nama file custom.
     *
     * - Nama file: {timestamp}-{random 10 char}.{ext} (mis. 20260814103045-aB3xYz9Qw2.jpg)
     * - Jika ukuran > 3 MB, gambar di-resize (lebar maks 1600px) agar storage hemat.
     * - Jika $existingPath diberikan dan hash file sama dengan gambar yang sudah ada,
     *   file lama TIDAK dihapus dan path lama dikembalikan (hindari duplikat).
     * - Jika $existingPath diberikan dan gambar berbeda, file lama dihapus.
     *
     * @param  string  $folder  subfolder di disk, mis. 'rooms' / 'ktp'
     * @param  string  $disk    nama disk filesystem ('public' untuk konten, 'local' untuk privat)
     */
    public static function store(UploadedFile $file, string $folder, ?string $existingPath = null, string $disk = 'public'): string
    {
        $hash = md5_file($file->getRealPath());

        // File sama dengan yang sudah tersimpan? Jangan simpan ulang.
        if ($existingPath && self::fileHash($existingPath, $disk) === $hash) {
            return $existingPath;
        }

        // Ekstensi diambil dari MIME hasil deteksi isi file, BUKAN dari nama file kiriman
        // client — supaya file berisi gambar tapi bernama .php/.html tidak ikut tersimpan.
        $extension = strtolower((string) $file->extension());

        if (! in_array($extension, self::ALLOWED_EXTENSIONS, true)) {
            throw ValidationException::withMessages([
                'file' => 'Format file tidak didukung. Gunakan JPG, JPEG, PNG, atau WEBP.',
            ]);
        }

        $filename = now()->format('YmdHis') . '-' . Str::random(10) . '.' . $extension;

        if ($file->getSize() > self::MAX_BEFORE_RESIZE) {
            $image = self::resize($file, 1600);

            if ($image !== null) {
                $path = $folder . '/' . $filename;
                Storage::disk($disk)->put($path, $image['data']);
                self::delete($existingPath, $disk);
                return $path;
            }
        }

        // Di bawah batas atau resize gagal -> simpan asli dengan nama custom
        $path = $file->storeAs($folder, $filename, $disk);
        self::delete($existingPath, $disk);
        return $path;
    }

    /**
     * Hapus file dari disk jika ada (aman untuk path null/empty).
     */
    public static function delete(?string $path, string $disk = 'public'): void
    {
        if ($path) {
            Storage::disk($disk)->delete($path);
        }
    }

    /**
     * Hash md5 sebuah file di disk. Return null jika file tidak ada.
     */
    public static function fileHash(?string $path, string $disk = 'public'): ?string
    {
        if (!$path || !Storage::disk($disk)->exists($path)) {
            return null;
        }

        return md5_file(Storage::disk($disk)->path($path));
    }

    /**
     * Resize gambar via GD. Return ['data' => string, 'mime' => string] atau null jika gagal.
     * Lebar maksimal $maxWidth, tinggi mengikuti rasio aspek. Kualitas 85 (jpeg/webp).
     */
    private static function resize(UploadedFile $file, int $maxWidth): ?array
    {
        try {
            $info = getimagesize($file->getRealPath());
            if ($info === false) {
                return null;
            }

            [$width, $height] = $info;
            $mime = $info['mime'];

            $image = match ($mime) {
                'image/jpeg' => imagecreatefromjpeg($file->getRealPath()),
                'image/png' => imagecreatefrompng($file->getRealPath()),
                'image/webp' => imagecreatefromwebp($file->getRealPath()),
                default => null,
            };

            if ($image === null) {
                return null;
            }

            // Hanya resize jika lebih lebar dari batas
            if ($width <= $maxWidth) {
                imagedestroy($image);
                return null;
            }

            $newWidth = $maxWidth;
            $newHeight = (int) round($height * ($maxWidth / $width));

            $resized = imagecreatetruecolor($newWidth, $newHeight);

            // Pertahankan transparansi PNG/WebP
            if ($mime === 'image/png' || $mime === 'image/webp') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }

            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);

            ob_start();
            if ($mime === 'image/png') {
                imagepng($resized, null, 7);
            } elseif ($mime === 'image/webp') {
                imagewebp($resized, null, 85);
            } else {
                imagejpeg($resized, null, 85);
            }
            $data = ob_get_clean();
            imagedestroy($resized);

            return ['data' => $data, 'mime' => $mime];
        } catch (\Throwable $e) {
            return null;
        }
    }
}
