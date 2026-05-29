# 🏝️ Jelajah Nusantara

![Jelajah Nusantara Banner](./public/banner.png)

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

A comprehensive web platform to explore tourist destinations in Indonesia. Helping travelers find attractive places based on islands, regions, categories, and user reviews, while providing a multi-tiered destination management system for Regional Admins and Super Admins.

## 🔗 Demo
https://jelajah-nusantara-six.vercel.app/

## ✨ Features
- **Smart Search & Filters**: Dynamically search destinations by name, category, island, city/regency, and ticket price range.
- **Nearby Recommendations**: Displays tourist destinations closest to the user's actual GPS coordinates.
- **Review & Rating Management**: Users can leave text reviews, star ratings, and upload photos directly.
- **Gamification "User Badges"**: Automatic badge system (Langkah Awal, Sang Pengembara, Petualang Handal, Ahli Jelajah, Pemandu Nusantara, to Legenda Penjelajah) based on user review contributions.
- **Profile & Avatar Management**: Users can update personal details and change profile photos, which will be visible on their reviews.
- **Contact & Feedback System**: A dedicated page for authenticated users to send complaints or suggestions directly to the admin dashboard.
- **Account Recovery (Forgot & Update Password)**: Secure account recovery flow integrated with email verification using Supabase Auth.
- **Multi-tiered Role System**: Clear permission boundaries for `Visitor`, `User`, `Regional Admin`, and `Super Admin`.
- **Proposal System**: Regional Admins can submit new regions or categories for approval by Super Admins before displaying them publicly.
- **Map Integration**: Dynamic navigation and precise location visualization of destinations using interactive maps.
- **5-Day Weather Forecast**: Live weather updates and 5-day weather forecasts powered by the OpenWeatherMap API for each destination.
- **Advanced Security & RLS**: Database security is reinforced using PostgreSQL Triggers to block unauthorized role modifications, and secure image uploads via a Server-Side API route.

## 🛠️ Tech Stack
| Component | Technology |
| ------ | ------ |
| **Frontend Framework** | Next.js (App Router), React |
| **Programming Language** | TypeScript |
| **Styling** | Vanilla CSS (Custom Properties) |
| **Database & Auth** | Supabase (PostgreSQL) |
| **Image Hosting** | ImgBB |
| **Deployment** | Vercel |

## 📸 Screenshots
<p align="center">
  <img src="./img/Login.png" />
  <img src="./img/Home Page .png" />
</p>
<p align="center">
  <img src="./img/Maps.png" width="48%" />
  <img src="./img/Contact.png" width="48%" />
  <img src="./img/Abous Us.png" width="48%" />
  <img src="./img/Dashboard Admin.png" width="48%" />
</p>

## 🚀 Installation

Follow the steps below to run the project locally:

**1. Clone the Repository**
```bash
git clone https://github.com/YotaGod/JelajahNusantara.git
cd JelajahNusantara
```

**2. Install Dependencies**
```bash
npm install
```

**3. Setup Environment Variables**
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

**4. Run Development Server**
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## 🔐 Environment Variables

Example `.env.example` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ImgBB Configuration (Server-Side)
IMGBB_API_KEY=your-imgbb-api-key

# OpenWeatherMap Configuration (Weather Forecast)
OPENWEATHER_API_KEY=your-openweather-api-key
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
└── README.md               # Project documentation (Indonesian)
```

## 📜 Available Scripts

- `npm run dev`: Runs the development server at `localhost:3000`.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server after building.
- `npm run lint`: Performs lint checks with ESLint.

## ☁️ Deployment

This project is configured for seamless deployment to [Vercel](https://vercel.com/):

1. Push your code to your GitHub repository.
2. Create a new project on Vercel and connect it to the repository.
3. Configure the required `Environment Variables` (Supabase URL & Key, ImgBB API Key) in Vercel settings.
4. Click **Deploy**. Vercel will automatically build the site with each push to the main branch.

## 🤝 Contributing

Contributions are always welcome! If you want to add features or fix bugs:
1. Fork this repository.
2. Create a new branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

## 👨‍💻 Author

**Jelajah Nusantara Team**
- GitHub: [@YotaGod](https://github.com/YotaGod)
