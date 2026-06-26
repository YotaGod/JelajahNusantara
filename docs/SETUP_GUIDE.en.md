# 📖 Complete Setup Guide - Jelajah Nusantara

This guide is designed for anyone—including beginners—to clone, configure, run, and deploy the Jelajah Nusantara application from start to finish.

---

## 📋 Table of Contents
1. [System Prerequisites](#1-system-prerequisites)
2. [Cloning and Local Installation](#2-cloning-and-local-installation)
3. [Supabase Database Setup](#3-supabase-database-setup)
4. [Third-Party API Configurations](#4-third-party-api-configurations)
5. [Local Environment Variables Configuration](#5-local-environment-variables-configuration)
6. [Running the Application Locally](#6-running-the-application-locally)
7. [Creating an Admin Account (Super Admin / Regional Admin)](#7-creating-an-admin-account-super-admin--regional-admin)
8. [Deployment to Vercel](#8-deployment-to-vercel)

---

## 1. System Prerequisites

Before starting, ensure your computer has the following installed:
- **Git**: To clone the source code. [Download Git](https://git-scm.com/)
- **Node.js (version 18 or above)**: JavaScript runtime. [Download Node.js](https://nodejs.org/)
- Free service accounts on:
  - [Supabase](https://supabase.com/) (Database & Auth)
  - [ImgBB](https://imgbb.com/) (Image Hosting)
  - [OpenWeatherMap](https://openweathermap.org/) (Weather Forecast)

---

## 2. Cloning and Local Installation

1. Open your Terminal (Git Bash, Command Prompt, or PowerShell).
2. Clone this repository to your machine:
   ```bash
   git clone https://github.com/YotaGod/JelajahNusantara.git
   ```
3. Navigate to the project directory:
   ```bash
   cd JelajahNusantara
   ```
4. Install all required dependencies (libraries):
   ```bash
   npm install
   ```

---

## 3. Supabase Database Setup

This step sets up the tables, relations, authentication, database security triggers, and Row Level Security (RLS).

1. Log into the [Supabase](https://supabase.com/) dashboard and create a **New Project**.
2. Wait for the database provisioning to complete.
3. In the left navigation menu, find and open the **SQL Editor**.
4. Click **New Query**.
5. Open the `supabase/complete_schema.sql` file in your project. Copy the entire content, paste it into the Supabase SQL Editor, and click the **Run** button. This will create all core tables (`user_profiles`, `destinations`, `reviews`, `feedbacks`, etc.) and security policies.
6. *(Optional)* If you wish to populate the database with initial sample destination data, create a new query in the SQL Editor, copy the contents of the `supabase/seed.sql` file, and click **Run**.
7. Go to **Settings** (gear icon) > **API**. You will find:
   - **Project URL** (Use as `NEXT_PUBLIC_SUPABASE_URL`)
   - **API Keys - anon public** (Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **API Keys - service_role** (Use as `SUPABASE_SERVICE_ROLE_KEY` - keep secret, only for local admin creation).

---

## 4. Third-Party API Configurations

### A. ImgBB (Destination/Profile Image Storage)
1. Sign up or log into [ImgBB](https://imgbb.com/).
2. Visit the [ImgBB API Page](https://api.imgbb.com/).
3. Click **Create API Key** and copy it. (Use as `IMGBB_API_KEY`).

### B. OpenWeatherMap (5-Day Weather Forecast)
1. Sign up or log into [OpenWeatherMap](https://openweathermap.org/).
2. Visit the **API Keys** section in your profile dashboard.
3. Generate a new API Key and wait a few minutes for it to activate. (Use as `OPENWEATHER_API_KEY`).

---

## 5. Local Environment Variables Configuration

1. In the root directory of your project, copy the environment template file:
   ```bash
   cp .env.example .env.local
   ```
2. Open the `.env.local` file using a text editor (like VS Code).
3. Fill in the empty fields with the keys you gathered:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-public-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key] # Required only for running the create-admin script

   # ImgBB Configuration
   IMGBB_API_KEY=[your-imgbb-api-key]

   # OpenWeatherMap Configuration
   OPENWEATHER_API_KEY=[your-openweather-api-key]
   ```

---

## 6. Running the Application Locally

Once configuration is complete, you are ready to launch the app:
1. Start the local development server:
   ```bash
   npm run dev
   ```
2. Open your browser and go to: [http://localhost:3000](http://localhost:3000).
3. The Jelajah Nusantara application is now ready for use!

---

## 7. Creating an Admin Account (Super Admin / Regional Admin)

By default, users registering via the web interface are assigned the `visitor` (or `user`) role. To grant an account Admin permissions:

### Method A: Via Automatic Local Script
1. Make sure `SUPABASE_SERVICE_ROLE_KEY` is configured in `.env.local`.
2. Run the following command in your terminal:
   ```bash
   node create-admin.mjs
   ```
3. The script will automatically create an account with email `admin2@wisatabanten.com` and password `password123`.
4. Go to your Supabase Table Editor, open `user_profiles`, and change the `role` column of the newly created account from `visitor` to `super_admin` or `regional_admin`.

### Method B: Via Supabase SQL Editor
If you have already registered normally through the UI:
1. Open the **SQL Editor** in Supabase.
2. Execute the following query (replace with your actual email):
   ```sql
   UPDATE public.user_profiles
   SET role = 'super_admin'
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'your_email@domain.com'
   );
   ```

---

## 8. Deployment to Vercel

To deploy your application online using Vercel:

1. Push your project to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and import your repository to create a new project.
3. In the **Environment Variables** section, add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `IMGBB_API_KEY`
   - `OPENWEATHER_API_KEY`
   *(Note: Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to Vercel for security reasons).*
4. Click **Deploy**. Vercel will build the project and provide a live URL in a couple of minutes.
