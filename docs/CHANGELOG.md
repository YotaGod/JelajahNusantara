# Riwayat Perubahan (Changelog) - Jelajah Nusantara

Semua perubahan penting pada proyek Jelajah Nusantara akan didokumentasikan di file ini berdasarkan versi rilis.

---

## [1.2.0] - 2026-06-26
### Added
- Fitur **Prakiraan Cuaca 5 Hari** terintegrasi dengan OpenWeatherMap API pada halaman detail destinasi wisata.
- File konfigurasi keep-alive **`wake-supabase.yml`** untuk memicu aktivitas tulis (INSERT/DELETE) harian secara otomatis pada tabel `log_activity`.
- Tabel skema database `log_activity` beserta kebijakan RLS untuk memfasilitasi ping tulis otomatis di file `supabase/complete_schema.sql`.
- Penyusunan folder dokumentasi terstruktur di dalam direktori `docs/` (termasuk arsitektur, panduan kontribusi, keamanan, panduan setup, roadmap, dan log perubahan).

---

## [1.1.0] - 2026-06-02
### Added
- Fitur gamifikasi **"User Badges"** (Langkah Awal, Sang Pengembara, Petualang Handal, Ahli Jelajah, Pemandu Nusantara, dan Legenda Penjelajah) berdasarkan total ulasan pengguna di aplikasi.
- Fitur pemulihan akun terintegrasi email (**Forgot & Update Password**) menggunakan modul Supabase Auth.
- Fitur ganti foto profil pada halaman `/profile` serta menampilkan foto profil yang diperbarui pada ulasan destinasi wisata.
- Halaman **Kontak & Pengiriman Masukan (Feedback)** bagi pengguna untuk mengirim saran langsung ke dasbor Admin.
- Aksi **Edit (Pensil)** dan **Hapus (X)** pada tabel Daerah/Kategori di dasbor Admin Proposals.

### Fixed
- Memperbaiki bug pada filter pulau dengan menangani kondisi balapan (*navigation race condition*) Next.js lewat metode pembaharuan parameter objek sekaligus.
- Menyembunyikan komponen rekomendasi lokasi terdekat secara otomatis jika ada filter pencarian yang sedang aktif di halaman utama.

### Changed
- Mengganti tombol pencarian "Cari" yang redundan menjadi tombol **"Hapus"** (Reset Filter) berwarna merah untuk mengosongkan filter seketika.
- Mengubah desain visual seluruh tombol gradasi menjadi warna tosca solid guna menjaga keselarasan estetika modern yang premium.

### Removed
- Menghapus file dan folder sampah lokal yang tidak terpakai seperti `test.js`, `test2.js`, `New folder`, dan folder duplikat `Jelajah Nusantara`.

---

## [1.0.0] - 2026-05-24
### Added
- Rilis perdana platform penjelajahan destinasi wisata Indonesia.
- Sistem otentikasi menggunakan Supabase Auth (Email & Google OAuth).
- Pencarian dan filter destinasi wisata berdasarkan pulau, kategori, kota, dan harga.
- Dasbor Admin Regional untuk mengajukan kota atau kategori wisata baru serta meninjau laporan kerusakan informasi destinasi.
- Dasbor Super Admin untuk mengelola usulan daerah, menyetujui destinasi, serta mengontrol penugasan peran (*role*) pengguna.
