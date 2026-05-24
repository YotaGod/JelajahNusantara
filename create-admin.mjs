import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed to auto-confirm email or we can just use anon key

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: 'admin2@wisatabanten.com',
    password: 'password123',
    email_confirm: true,
    user_metadata: { full_name: 'Admin Banten' }
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Success! User created:", data.user.email);
    console.log("Please login with email: admin2@wisatabanten.com and password: password123");
  }
}

createAdmin();
