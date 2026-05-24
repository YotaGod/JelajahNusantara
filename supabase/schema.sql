-- 1. Enable pgcrypto for UUID generation (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create tables
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    province TEXT DEFAULT 'Banten'
);

CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'visitor' CHECK (role IN ('visitor', 'user', 'regional_admin', 'super_admin')),
    region_city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
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
    price INTEGER,
    open_hours TEXT,
    contact TEXT,
    facilities JSONB DEFAULT '[]'::JSONB,
    avg_rating FLOAT8 DEFAULT 0,
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
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    issue_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'rejected')),
    resolved_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- 3. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
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

-- Policies: categories
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Categories insert/update/delete by super_admin" ON public.categories FOR ALL USING (public.is_super_admin());

-- Policies: cities
CREATE POLICY "Cities are viewable by everyone" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Cities insert/update/delete by super_admin" ON public.cities FOR ALL USING (public.is_super_admin());

-- Policies: user_profiles
CREATE POLICY "User profiles viewable by owner or super_admin" ON public.user_profiles 
  FOR SELECT USING (auth.uid() = id OR public.is_super_admin());
CREATE POLICY "User profiles updateable by owner" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies: destinations
CREATE POLICY "Destinations are viewable by everyone" ON public.destinations FOR SELECT USING (true);
CREATE POLICY "Destinations insert/update/delete by super_admin" ON public.destinations
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Destinations insert/update/delete by regional_admin" ON public.destinations
  FOR ALL USING (public.is_regional_admin_for_city(city_id));

-- Policies: photos
CREATE POLICY "Photos are viewable by everyone" ON public.photos FOR SELECT USING (true);
CREATE POLICY "Photos insert/update/delete by super_admin" ON public.photos
  FOR ALL USING (public.is_super_admin());
CREATE POLICY "Photos insert/update/delete by regional_admin" ON public.photos
  FOR ALL USING (
    public.is_regional_admin_for_city(
      (SELECT city_id FROM public.destinations WHERE id = destination_id)
    )
  );

-- Policies: reviews
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

-- Policies: favorites
CREATE POLICY "Favorites viewable by owner" ON public.favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Favorites insert by owner" ON public.favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Favorites delete by owner" ON public.favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Policies: reports
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

-- 4. Triggers
-- Trigger to calculate avg_rating
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

-- Trigger to auto-create user_profile on auth.user created
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
