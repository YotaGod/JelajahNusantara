# Security Policy & Architecture - Jelajah Nusantara

This document describes the security protocols, policies, and mechanisms implemented to protect data, sessions, and system resources in Jelajah Nusantara.

---

## 1. Security Policy

We are committed to securing the data of our travelers and administrators. 

### Reporting Vulnerabilities
If you discover a security vulnerability within this project, please do NOT create a public issue. Instead, contact the maintainer directly or email `security@wisatabanten.com` (or submit a report via the admin dashboard). We will address all valid concerns within 48 hours.

---

## 2. Authentication Security

- **Supabase SSR**: Session cookies are managed using `@supabase/ssr` with `httpOnly`, `secure`, and `sameSite` flags enabled automatically on Vercel deployments to mitigate Cross-Site Scripting (XSS) and Session Hijacking.
- **PKCE Flow**: Authentication callbacks utilize PKCE (Proof Key for Code Exchange) to protect token exchange on mobile/browser redirection.
- **Secure Password Recovery**: The Forgot/Update Password workflow utilizes secure single-use recovery tokens sent directly to user emails, which temporarily log the user in to allow resetting their credentials via `auth.updateUser()`.

---

## 3. Authorization & Row Level Security (RLS)

Every table in the database has Row Level Security enabled. Standard users and visitors cannot modify database tables directly.

- **visitor**: Read-only access to approved destinations, categories, and cities.
- **user**: Can read public destinations, write reviews for destinations, add items to favorites, and submit reports/feedbacks. Cannot modify destinations, other users' reviews, or admin tables.
- **regional_admin**: Can manage destinations, categories, and cities within their designated jurisdiction (`region_city_id`).
- **super_admin**: Full unrestricted read/write capabilities across all tables.

### Triggers as Hardened Security Guards
To prevent users from circumventing RLS policies (e.g., using Supabase Client on the browser to change their own role or report status):
- **`prevent_sensitive_profile_update`**: This database trigger intercepts any update command on `user_profiles`. If the editor is not a `super_admin`, it forces the `role` and `region_city_id` back to their original values (`NEW.role = OLD.role`), ensuring users cannot promote themselves.
- **`prevent_report_manipulation`**: This trigger ensures that standard users cannot mark reports as "resolved" or change admin notes. Only admins assigned to the destination's city (or super admins) can resolve reports.

---

## 4. API & Environment Security

- **Server-Side API Proxy for ImgBB**: The ImgBB API key (`IMGBB_API_KEY`) is stored entirely on the server-side (`.env.local`). Image uploads from Client Components are sent to our internal Next.js API route `/api/upload`, which acts as a secure proxy. This prevents the leak of private API keys to the browser console.
- **Service Role Restriction**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all RLS policies and is strictly restricted to local administration tasks (like the `create-admin.mjs` setup script). This key is NEVER exposed to client-side bundles or added to Vercel's Environment Variables.
