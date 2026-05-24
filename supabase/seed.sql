-- Seed Data for Banten Tourism Website

-- 1. Insert Categories
INSERT INTO public.categories (id, name) VALUES
('c0000000-0000-0000-0000-000000000001', 'Pantai'),
('c0000000-0000-0000-0000-000000000002', 'Gunung'),
('c0000000-0000-0000-0000-000000000003', 'Budaya'),
('c0000000-0000-0000-0000-000000000004', 'Kuliner');

-- 2. Insert Cities
INSERT INTO public.cities (id, name, province) VALUES
('d0000000-0000-0000-0000-000000000001', 'Kota Serang', 'Banten'),
('d0000000-0000-0000-0000-000000000002', 'Kabupaten Pandeglang', 'Banten'),
('d0000000-0000-0000-0000-000000000003', 'Kabupaten Lebak', 'Banten'),
('d0000000-0000-0000-0000-000000000004', 'Kota Cilegon', 'Banten'),
('d0000000-0000-0000-0000-000000000005', 'Kabupaten Tangerang', 'Banten');

-- 3. Insert Users (Auth & Profiles)
-- Note: This requires pgcrypto for crypt/gen_salt.
-- Password for both is 'password123'
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
('u0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@wisatabanten.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Super Admin"}', now(), now()),
('u0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'regional@wisatabanten.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Admin Pandeglang"}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Because of the trigger on auth.users, user_profiles are created automatically.
-- We need to update their roles and region.
UPDATE public.user_profiles SET role = 'super_admin' WHERE id = 'u0000000-0000-0000-0000-000000000001';
UPDATE public.user_profiles SET role = 'regional_admin', region_city_id = 'd0000000-0000-0000-0000-000000000002' WHERE id = 'u0000000-0000-0000-0000-000000000002';

-- 4. Insert Destinations
INSERT INTO public.destinations (id, name, category_id, city_id, description, address, map_url, price, open_hours, contact, facilities, created_by) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Pantai Anyer', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Pantai Anyer adalah salah satu destinasi wisata paling terkenal di Banten dengan pasir putih dan pemandangan Gunung Krakatau.', 'Jl. Raya Anyer, Serang, Banten', 'https://goo.gl/maps/1', 20000, '24 Jam', '081234567890', '["Parkir", "Toilet", "Warung Makan", "Penginapan"]', 'u0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000002', 'Pantai Tanjung Lesung', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'Tanjung Lesung merupakan KEK Pariwisata di Banten. Pantainya eksotis dan fasilitasnya sangat lengkap.', 'Tanjung Lesung, Pandeglang, Banten', 'https://goo.gl/maps/2', 40000, '07:00 - 18:00', '081298765432', '["Parkir", "Toilet", "Resort", "Watersport"]', 'u0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000003', 'Gunung Karang', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Gunung tertinggi di Banten yang menjadi destinasi ziarah dan pendakian menantang.', 'Kaduengang, Pandeglang, Banten', 'https://goo.gl/maps/3', 15000, '24 Jam', '', '["Parkir", "Jalur Pendakian", "Pos Penjagaan"]', 'u0000000-0000-0000-0000-000000000002'),
  ('e0000000-0000-0000-0000-000000000004', 'Wisata Suku Baduy', 'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Desa adat Suku Baduy yang masih menjaga tradisi leluhur tanpa sentuhan modernisasi.', 'Desa Kanekes, Leuwidamar, Lebak', 'https://goo.gl/maps/4', 10000, '06:00 - 17:00', '', '["Pemandu Lokal", "Penginapan Tradisional"]', 'u0000000-0000-0000-0000-000000000001'),
  ('e0000000-0000-0000-0000-000000000005', 'Sate Bebek Cibeber', 'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'Kuliner khas Cilegon yang terkenal dengan sate bebek bumbu rempah yang empuk dan lezat.', 'Cibeber, Kota Cilegon, Banten', 'https://goo.gl/maps/5', 35000, '10:00 - 22:00', '', '["Parkir", "Tempat Duduk", "Toilet"]', 'u0000000-0000-0000-0000-000000000001');

-- 5. Insert Photos (using dummy ImgBB URLs / placeholders)
INSERT INTO public.photos (destination_id, image_url, is_primary) VALUES
('e0000000-0000-0000-0000-000000000001', 'https://i.ibb.co/3k8qGz0/anyer-1.jpg', true),
('e0000000-0000-0000-0000-000000000001', 'https://i.ibb.co/GtbM2xP/anyer-2.jpg', false),
('e0000000-0000-0000-0000-000000000002', 'https://i.ibb.co/fQ7jGZS/tanjung-lesung-1.jpg', true),
('e0000000-0000-0000-0000-000000000002', 'https://i.ibb.co/QcYpT2K/tanjung-lesung-2.jpg', false),
('e0000000-0000-0000-0000-000000000003', 'https://i.ibb.co/nCqyLz1/gunung-karang.jpg', true),
('e0000000-0000-0000-0000-000000000004', 'https://i.ibb.co/zH8jM0Q/baduy.jpg', true),
('e0000000-0000-0000-0000-000000000005', 'https://i.ibb.co/9G3XgqF/sate-bebek.jpg', true);
