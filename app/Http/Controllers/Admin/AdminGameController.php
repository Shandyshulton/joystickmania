<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Game;
use App\Support\ImageUploader;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminGameController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Games', [
            'games' => Game::orderBy('jenis_konsol')->orderBy('nama_game')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('gambar')) {
            $data['gambar'] = ImageUploader::store($request->file('gambar'), 'games');
        }

        Game::create($data);

        return back()->with('success', 'Game berhasil ditambahkan.');
    }

    public function update(Request $request, Game $game)
    {
        $data = $this->validated($request);

        if ($request->hasFile('gambar')) {
            $data['gambar'] = ImageUploader::store($request->file('gambar'), 'games', $game->gambar);
        } else {
            // Form selalu mengirim key 'gambar' (kosong saat tidak pilih file). Tanpa
            // buang key ini, update() akan menimpa path gambar lama dengan null.
            unset($data['gambar']);
        }

        $game->update($data);

        return back()->with('success', 'Game berhasil diperbarui.');
    }

    public function destroy(Game $game)
    {
        ImageUploader::delete($game->gambar);

        $game->delete();

        return back()->with('success', 'Game dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'nama_game' => 'required|string|max:255',
            'jenis_konsol' => 'required|in:PS3,PS4,PS5',
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'deskripsi' => 'nullable|string|max:1000',
            'status' => 'required|in:aktif,nonaktif',
        ]);
    }
}
