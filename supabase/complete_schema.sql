-- ============================================================================
-- JELAJAH NUSANTARA - COMPLETE SCHEMA SETUP
-- This file contains all table creations, RLS policies, functions, and triggers.
-- ============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Tables
CREATE TABLE public.islands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    province TEXT DEFAULT 'Banten',
    island_id UUID REFERENCES public.islands(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected'))
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'visitor' CHECK (role IN ('visitor', 'user', 'regional_admin', 'super_admin')),
    region_city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    home_city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    description TEXT,
    address TEXT,
    map_url TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    price INTEGER,
    open_hours TEXT,
    contact TEXT,
    facilities JSONB DEFAULT '[]'::JSONB,
    avg_rating FLOAT8 DEFAULT 0,
    favorite_count INT DEFAULT 0,
    created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, destination_id)
);

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    issue_type TEXT,
    description TEXT,
    photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected', 'cancelled_by_user')),
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    admin_note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID CONSTRAINT feedbacks_user_id_fkey REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    target_admin_type TEXT NOT NULL CHECK (target_admin_type IN ('super_admin', 'regional_admin')),
    target_city_id UUID CONSTRAINT feedbacks_target_city_id_fkey REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Row Level Security (RLS) Enablement
ALTER TABLE public.islands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- 4. Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_regional_admin_for_city(check_city_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'regional_admin' AND region_city_id = check_city_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Policies

-- Islands
CREATE POLICY "Islands are viewable by everyone" ON public.islands FOR SELECT USING (true);
CREATE POLICY "Islands insert/update/delete by super_admin" ON public.islands FOR ALL USING (public.is_super_admin());

-- Categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories insert/update/delete by super_admin" ON public.categories FOR ALL USING (public.is_super_admin());

-- Cities
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Cities insert/update/delete by super_admin" ON public.cities FOR ALL USING (public.is_super_admin());

-- User Profiles
CREATE POLICY "User profiles viewable by owner or super_admin" ON public.user_profiles 
  FOR SELECT USING (auth.uid() = id OR public.is_super_admin());
CREATE POLICY "User profiles updateable by owner" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "User profiles updateable by super_admin" ON public.user_profiles
  FOR UPDATE USING (public.is_super_admin());

-- Destinations
CREATE POLICY "Destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Destinations insert/update/delete by super_admin" ON public.destinations
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Destinations insert/update/delete by regional_admin" ON public.destinations
  FOR ALL USING (public.is_regional_admin_for_city(city_id));

-- Photos
CREATE POLICY "Photos are viewable by everyone" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Photos insert/update/delete by super_admin" ON public.photos
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Photos insert/update/delete by regional_admin" ON public.photos
  FOR ALL USING (
    public.is_regional_admin_for_city(
      (SELECT city_id FROM public.destinations WHERE id = destination_id)
    )
  );

-- Reviews
CREATE POLICY "Reviews are viewable by everyone" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Reviews insert by logged in users" ON public.reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('user', 'regional_admin', 'super_admin'))
  );
CREATE POLICY "Reviews update by owner or super_admin" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id OR public.is_super_admin());
CREATE POLICY "Reviews delete by owner or super_admin" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id OR public.is_super_admin());

-- Favorites
CREATE POLICY "Favorites viewable by owner" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Favorites insert by owner" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Favorites delete by owner" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Reports
CREATE POLICY "Reports viewable by owner" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Reports updateable by owner" ON public.reports FOR UPDATE USING (auth.uid() = reporter_id);
CREATE POLICY "Reports insert by logged in users" ON public.reports
  FOR INSERT WITH CHECK (
    auth.uid() = reporter_id AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND role IN ('user', 'regional_admin', 'super_admin'))
  );
CREATE POLICY "Reports view/update by super_admin" ON public.reports
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Reports view/update by regional_admin" ON public.reports
  FOR ALL USING (
    public.is_regional_admin_for_city(
      (SELECT city_id FROM public.destinations WHERE id = destination_id)
    )
  );

-- Feedbacks
CREATE POLICY "Users can insert their own feedbacks" ON public.feedbacks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid())
  );
CREATE POLICY "Users can view their own feedbacks" ON public.feedbacks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Super admins can view all feedbacks" ON public.feedbacks
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Regional admins can view regional feedbacks" ON public.feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
        AND role = 'regional_admin' 
        AND region_city_id = target_city_id
    )
  );

-- 6. Triggers and Functions

-- calculate_avg_rating
CREATE OR REPLACE FUNCTION public.calculate_avg_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.destinations
    SET avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE destination_id = NEW.destination_id
    )
    WHERE id = NEW.destination_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.destinations
    SET avg_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.reviews
      WHERE destination_id = OLD.destination_id
    )
    WHERE id = OLD.destination_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_destination_avg_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.calculate_avg_rating();

-- handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- calculate_favorite_count
CREATE OR REPLACE FUNCTION public.calculate_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.destinations
    SET favorite_count = favorite_count + 1
    WHERE id = NEW.destination_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.destinations
    SET favorite_count = favorite_count - 1
    WHERE id = OLD.destination_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_favorite_change
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION public.calculate_favorite_count();

-- prevent_sensitive_profile_update (Security)
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    NEW.role = OLD.role;
    NEW.region_city_id = OLD.region_city_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_update_security
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_profile_update();

-- prevent_report_manipulation (Security)
CREATE OR REPLACE FUNCTION public.prevent_report_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  IF public.is_super_admin() OR public.is_regional_admin_for_city(
    (SELECT city_id FROM public.destinations WHERE id = NEW.destination_id)
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'cancelled_by_user' THEN
    NEW.status = OLD.status;
  END IF;

  NEW.admin_note = OLD.admin_note;
  NEW.resolved_at = OLD.resolved_at;
  NEW.resolved_by = OLD.resolved_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_report_update_security
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.prevent_report_manipulation();

-- 7. Add RPC function required by application
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void AS $$
BEGIN
  -- We delete from auth.users, and the CASCADE handles user_profiles, favorites, reviews, etc.
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Table for keep-alive logs (log_activity)
CREATE TABLE IF NOT EXISTS public.log_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name TEXT DEFAULT 'SYSTEM_WAKEUP',
    deskripsi TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.log_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert to log_activity" ON public.log_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select from log_activity" ON public.log_activity FOR SELECT USING (true);
CREATE POLICY "Allow public delete from log_activity" ON public.log_activity FOR DELETE USING (true);
