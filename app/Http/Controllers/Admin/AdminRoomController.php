<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Support\ImageUploader;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminRoomController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Rooms', [
            'rooms' => Room::withCount('bookings')->orderBy('nama_room')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);

        if ($request->hasFile('foto')) {
            $data['foto'] = ImageUploader::store($request->file('foto'), 'rooms');
        }

        Room::create($data);

        return back()->with('success', 'Room berhasil ditambahkan.');
    }

    public function update(Request $request, Room $room)
    {
        $data = $this->validated($request);

        if ($request->hasFile('foto')) {
            $data['foto'] = ImageUploader::store($request->file('foto'), 'rooms', $room->foto);
        }

        $room->update($data);

        return back()->with('success', 'Room berhasil diperbarui.');
    }

    public function destroy(Room $room)
    {
        ImageUploader::delete($room->foto);

        $room->delete();

        return back()->with('success', 'Room dihapus.');
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'nama_room' => 'required|string|max:255',
            'kapasitas' => 'required|integer|min:1|max:20',
            'konsol_tersedia' => 'required|array',
            'konsol_tersedia.*' => 'in:PS3,PS4,PS5',
            'harga_per_jam' => 'required|integer|min:0',
            'foto' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'fasilitas' => 'nullable|string|max:1000',
            'status' => 'required|in:aktif,maintenance',
        ]);
    }
}
