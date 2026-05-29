# 📖 Panduan Setup Lengkap - Jelajah Nusantara

Panduan ini ditujukan bagi siapa saja—termasuk pemula—untuk mengkloning, mengonfigurasi, menjalankan, dan melakukan *deployment* aplikasi Jelajah Nusantara dari awal hingga akhir.

---

## 📋 Daftar Isi
1. [Prasyarat Sistem](#1-prasyarat-sistem)
2. [Kloning dan Instalasi Lokal](#2-kloning-dan-instalasi-lokal)
3. [Setup Database Supabase](#3-setup-database-supabase)
4. [Konfigurasi API Pihak Ketiga](#4-konfigurasi-api-pihak-ketiga)
5. [Konfigurasi Environment Variables Lokal](#5-konfigurasi-environment-variables-lokal)
6. [Menjalankan Aplikasi secara Lokal](#6-menjalankan-aplikasi-secara-lokal)
7. [Membuat Akun Admin (Super Admin / Regional Admin)](#7-membuat-akun-admin-super-admin--regional-admin)
8. [Deployment ke Vercel](#8-deployment-ke-vercel)

---

## 1. Prasyarat Sistem

Sebelum memulai, pastikan komputer Anda telah terinstal:
- **Git**: Untuk mengkloning kode sumber. [Download Git](https://git-scm.com/)
- **Node.js (versi 18 ke atas)**: Runtime JavaScript. [Download Node.js](https://nodejs.org/)
- Akun layanan gratis di:
  - [Supabase](https://supabase.com/) (Database & Auth)
  - [ImgBB](https://imgbb.com/) (Penyimpanan Gambar)
  - [OpenWeatherMap](https://openweathermap.org/) (Prakiraan Cuaca)

---

## 2. Kloning dan Instalasi Lokal

1. Buka Terminal (Git Bash, Command Prompt, atau PowerShell).
2. Klone repositori ini ke komputer Anda:
   ```bash
   git clone https://github.com/YotaGod/JelajahNusantara.git
   ```
3. Masuk ke direktori proyek:
   ```bash
   cd JelajahNusantara
   ```
4. Instal semua dependensi (*libraries*) yang dibutuhkan:
   ```bash
   npm install
   ```

---

## 3. Setup Database Supabase

Langkah ini penting untuk mengatur tabel, relasi, otentikasi, trigger keamanan, dan RLS (Row Level Security).

1. Masuk ke dasbor [Supabase](https://supabase.com/) dan buat proyek (**New Project**) baru.
2. Tunggu hingga proses instalasi database selesai.
3. Pada menu navigasi sebelah kiri, cari dan buka **SQL Editor**.
4. Klik **New Query**.
5. Buka file `supabase/complete_schema.sql` yang ada di proyek Anda. Salin (*copy*) seluruh isinya, tempel (*paste*) ke SQL Editor di Supabase, lalu klik tombol **Run**. Ini akan membuat tabel-tabel utama (`user_profiles`, `destinations`, `reviews`, `feedbacks`, dll.) beserta kebijakan keamanan (*policy*).
6. *(Opsional)* Jika Anda ingin mengisi database dengan data destinasi awal/contoh, buat query baru di SQL Editor, salin isi file `supabase/seed.sql`, dan klik **Run**.
7. Buka menu **Settings** (ikon gerigi) > **API**. Anda akan menemukan:
   - **Project URL** (Gunakan sebagai `NEXT_PUBLIC_SUPABASE_URL`)
   - **API Keys - anon public** (Gunakan sebagai `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **API Keys - service_role** (Gunakan sebagai `SUPABASE_SERVICE_ROLE_KEY` - rahasia dan hanya untuk script admin lokal).

---

## 4. Konfigurasi API Pihak Ketiga

### A. ImgBB (Penyimpanan Foto Destinasi/Profil)
1. Daftar atau masuk ke [ImgBB](https://imgbb.com/).
2. Kunjungi halaman [API ImgBB](https://api.imgbb.com/).
3. Klik **Create API Key** dan salin kunci tersebut. (Gunakan sebagai `IMGBB_API_KEY`).

### B. OpenWeatherMap (Prakiraan Cuaca 5 Hari)
1. Daftar atau masuk ke [OpenWeatherMap](https://openweathermap.org/).
2. Kunjungi bagian **API Keys** di dasbor profil Anda.
3. Buat API Key baru dan tunggu beberapa menit hingga diaktifkan oleh sistem OpenWeather. (Gunakan sebagai `OPENWEATHER_API_KEY`).

---

## 5. Konfigurasi Environment Variables Lokal

1. Di dalam folder utama (*root*) proyek Anda, salin file contoh environment variables:
   ```bash
   cp .env.example .env.local
   ```
2. Buka file `.env.local` menggunakan teks editor (seperti VS Code).
3. Isi kolom kosong dengan kunci yang sudah Anda kumpulkan sebelumnya:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[id-proyek-anda].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-public-key-anda]
   SUPABASE_SERVICE_ROLE_KEY=[service-role-key-anda] # Diperlukan jika ingin menjalankan script create-admin

   # ImgBB Configuration
   IMGBB_API_KEY=[api-key-imgbb-anda]

   # OpenWeatherMap Configuration
   OPENWEATHER_API_KEY=[api-key-openweather-anda]
   ```

---

## 6. Menjalankan Aplikasi secara Lokal

Setelah konfigurasi selesai, Anda siap menjalankan aplikasi:
1. Jalankan server lokal:
   ```bash
   npm run dev
   ```
2. Buka browser Anda dan akses: [http://localhost:3000](http://localhost:3000).
3. Aplikasi Jelajah Nusantara siap digunakan!

---

## 7. Membuat Akun Admin (Super Admin / Regional Admin)

Secara default, pengguna yang mendaftar melalui antarmuka web akan mendapatkan role `visitor` (atau `user`). Untuk memiliki akun dengan peran Admin:

### Cara A: Melalui Script Otomatis (Lokal)
1. Pastikan Anda sudah mengisi `SUPABASE_SERVICE_ROLE_KEY` di file `.env.local`.
2. Jalankan perintah berikut di terminal:
   ```bash
   node create-admin.mjs
   ```
3. Script akan otomatis membuatkan akun baru dengan email `admin2@wisatabanten.com` dan password `password123`.
4. Buka dasbor database Supabase Anda, masuk ke tabel `user_profiles`, lalu ubah kolom `role` akun tersebut dari `visitor` menjadi `super_admin` atau `regional_admin`.

### Cara B: Melalui SQL Editor Supabase
Jika Anda sudah mendaftar secara normal di aplikasi:
1. Buka **SQL Editor** di Supabase.
2. Jalankan perintah berikut (ganti email sesuai dengan akun Anda):
   ```sql
   UPDATE public.user_profiles
   SET role = 'super_admin'
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'email_anda@domain.com'
   );
   ```

---

## 8. Deployment ke Vercel

Untuk meng-online-kan aplikasi Anda secara gratis menggunakan Vercel:

1. Unggah (*push*) proyek Anda ke repositori GitHub pribadi/publik Anda.
2. Masuk ke [Vercel](https://vercel.com/) dan buat proyek baru dengan menghubungkan repositori GitHub tersebut.
3. Di bagian **Environment Variables**, masukkan variabel-variabel berikut satu per satu:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `IMGBB_API_KEY`
   - `OPENWEATHER_API_KEY`
   *(Catatan: Jangan masukkan `SUPABASE_SERVICE_ROLE_KEY` ke Vercel demi alasan keamanan).*
4. Klik tombol **Deploy**. Vercel akan otomatis melakukan kompilasi proyek dan menyediakan tautan website aktif dalam beberapa menit.
