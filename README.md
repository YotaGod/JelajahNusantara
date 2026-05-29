# 🏝️ Jelajah Nusantara

![Jelajah Nusantara Banner](./public/banner.png)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

Platform web komprehensif untuk mengeksplorasi destinasi wisata di Indonesia. Membantu wisatawan menemukan tempat menarik berdasarkan pulau, daerah, kategori, dan ulasan pengguna, sekaligus menyediakan sistem manajemen destinasi berlapis untuk Admin Regional dan Super Admin.

## 🔗 Demo
[https://jelajah-nusantara.vercel.app](https://jelajah-nusantara.vercel.app) *(Ganti dengan link asli jika berbeda)*

## ✨ Features
- **Pencarian & Filter Cerdas**: Cari wisata berdasarkan nama, kategori, pulau, kota/kabupaten, dan kisaran harga tiket.
- **Rekomendasi Terdekat**: Menampilkan destinasi wisata terdekat berdasarkan lokasi GPS pengguna saat ini.
- **Manajemen Ulasan & Rating**: Pengguna dapat memberikan ulasan, mengunggah foto pengalaman, dan memberikan rating untuk setiap destinasi.
- **Sistem Role Bertingkat**: Terdapat hak akses untuk `Visitor`, `User`, `Regional Admin`, dan `Super Admin`.
- **Pengajuan Data (Proposals)**: Admin Regional dapat mengajukan daerah atau kategori wisata baru untuk disetujui oleh Super Admin.
- **Integrasi Peta**: Menampilkan titik lokasi presisi menggunakan peta interaktif.
- **Upload Gambar**: Mendukung pengunggahan foto destinasi langsung ke ImgBB.

## 🛠️ Tech Stack
| Bagian | Teknologi |
| ------ | ------ |
| **Frontend Framework** | Next.js (App Router), React |
| **Bahasa Pemrograman** | TypeScript |
| **Styling** | Vanilla CSS (Custom Properties) |
| **Database & Auth** | Supabase (PostgreSQL) |
| **Image Hosting** | ImgBB |
| **Deployment** | Vercel |

## 📸 Screenshots
<p align="center">
  <img src="https://via.placeholder.com/400x250.png?text=Home+Page" width="48%" />
  <img src="https://via.placeholder.com/400x250.png?text=Destination+Detail" width="48%" />
</p>
<p align="center">
  <img src="https://via.placeholder.com/400x250.png?text=Admin+Dashboard" width="48%" />
  <img src="https://via.placeholder.com/400x250.png?text=Proposals+System" width="48%" />
</p>

## 🚀 Installation

Ikuti langkah-langkah di bawah ini untuk menjalankan project secara lokal:

**1. Clone Repository**
```bash
git clone https://github.com/YotaGod/JelajahNusantara.git
cd JelajahNusantara
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup Environment Variables**
Buat file `.env.local` di *root* direktori dan sesuaikan isinya:
```bash
cp .env.example .env.local
```

**4. Run Development Server**
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat hasilnya.

## 🔐 Environment Variables

Contoh file `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ImgBB Configuration
NEXT_PUBLIC_IMGBB_API_KEY=your-imgbb-api-key
```

## 📂 Project Structure

```text
JelajahNusantara/
├── src/
│   ├── app/                # Next.js App Router (Pages & Layouts)
│   │   ├── admin/          # Admin Dashboard (Users, Proposals, Destinations)
│   │   ├── auth/           # Authentication Callbacks
│   │   ├── destinations/   # Destination detail pages
│   │   └── ...
│   ├── components/         # Reusable React Components
│   ├── lib/                # API Functions & Helpers (Supabase Queries)
│   └── utils/              # Utilities (e.g. Supabase client config)
├── public/                 # Static assets (images, icons)
├── .env.example            # Environment variables template
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation
```

## 📜 Available Scripts

- `npm run dev`: Menjalankan *development server* di `localhost:3000`.
- `npm run build`: Melakukan *build* aplikasi untuk versi produksi.
- `npm run start`: Menjalankan aplikasi versi *production* yang sudah di-build.
- `npm run lint`: Mengecek *error* pada kode dengan ESLint.

## ☁️ Deployment

Proyek ini telah dikonfigurasi agar sangat mudah di-*deploy* ke [Vercel](https://vercel.com/):

1. *Push* kode ke repositori GitHub.
2. Buat proyek baru di Vercel dan hubungkan dengan repositori tersebut.
3. Masukkan `Environment Variables` yang dibutuhkan (Supabase URL & Key, ImgBB API Key) di pengaturan Vercel.
4. Klik **Deploy**. Vercel akan otomatis melakukan *build* setiap kali ada *commit* baru di *branch* utama.

## 🤝 Contributing

Kontribusi selalu diterima! Jika Anda ingin menambahkan fitur baru atau memperbaiki *bug*, silakan:
1. *Fork* repositori ini
2. Buat *branch* baru (`git checkout -b feature/AmazingFeature`)
3. *Commit* perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4. *Push* ke *branch* (`git push origin feature/AmazingFeature`)
5. Buka sebuah *Pull Request*

## 📄 License

Didistribusikan di bawah **MIT License**. Lihat `LICENSE` untuk informasi lebih lanjut.

## 👨‍💻 Author

**Jelajah Nusantara Team**
- GitHub: [@YotaGod](https://github.com/YotaGod)
