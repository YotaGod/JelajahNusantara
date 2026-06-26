# Panduan Pemeliharaan (Maintenance Guide) - Jelajah Nusantara

Dokumen ini menjelaskan langkah-langkah rutin untuk memantau, mencadangkan, memelihara database, dan menangani masalah teknis pada aplikasi Jelajah Nusantara dalam jangka panjang.

---

## 1. Pemantauan & Monitoring

### Pemantauan Database & Auth (Supabase)
- **Supabase Dashboard API**: Selalu pantau grafik penggunaan kuota (Database size, Auth users, API requests) di dasbor Supabase secara berkala untuk menghindari pemblokiran akibat melebihi limit gratis.
- **Log Database**: Tinjau logs di Supabase (**Project Settings > Logs > API**) jika pengguna melaporkan kegagalan login atau kegagalan penulisan ulasan.

### Pemantauan Deployment (Vercel)
- **Vercel Web Analytics**: Gunakan dasbor Analytics Vercel untuk memantau kecepatan pemuatan halaman utama (LCP, FID, CLS).
- **Serverless Function Logs**: Jika API `/api/weather` atau `/api/upload` mengalami kegagalan, buka tab **Logs** pada deployment Vercel Anda untuk melihat pesan error runtime.

---

## 2. Backup & Pencadangan Data

### Database Supabase
Karena Supabase Cloud menggunakan PostgreSQL, pencadangan data disarankan dilakukan secara rutin:
- **Pencadangan Otomatis**: Layanan Pro Supabase secara otomatis mencadangkan data harian.
- **Pencadangan Manual (Gratis)**: Gunakan CLI `pg_dump` untuk mengekspor data ke file SQL lokal secara berkala:
  ```bash
  pg_dump -h db.[id-proyek].supabase.co -U postgres -d postgres -F p -f backup_data.sql
  ```
  *(Masukkan password database Anda saat diminta).*

---

## 3. Pemeliharaan Database & Keep-Alive

### Mencegah Database Ter-pause (Supabase Sleep Policy)
Database Supabase versi gratis akan dinonaktifkan sementara jika tidak diakses dalam 1 minggu.
- **Solusi Otomatis**: Proyek ini telah dilengkapi dengan GitHub Actions workflow **`wake-supabase.yml`** yang berjalan otomatis setiap hari pukul 13:00 WIB untuk melakukan operasi kueri tulis (INSERT & DELETE) ke tabel `log_activity`.
- **Verifikasi**: Buka tab **Actions** di repositori GitHub Anda secara mingguan untuk memastikan status eksekusi kueri tetap centang hijau (Success).

---

## 4. Prosedur Penanganan Insiden & Pemulihan (Recovery)

### Skenario A: Layanan Supabase Ter-pause Secara Tidak Sengaja
1. Masuk ke dasbor Supabase.
2. Klik tombol **Restore Project**.
3. Tunggu 2-5 menit hingga database menyala kembali.
4. Jalankan trigger manual pada workflow **Wake Supabase** di GitHub Actions untuk memverifikasi koneksi.

### Skenario B: Batas Kuota Penyimpanan Gambar Terpenuhi (ImgBB)
Jika pengunggahan foto ulasan atau profil gagal dengan kode error API ImgBB:
1. Masuk ke akun ImgBB Anda.
2. Hapus foto lama yang tidak digunakan, atau buat kunci API ImgBB baru dengan akun alternatif.
3. Perbarui variabel lingkungan `IMGBB_API_KEY` di pengaturan Vercel dan restart deployment.
