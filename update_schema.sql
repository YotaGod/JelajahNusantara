-- 1. Tambah kolom tempat tinggal pada user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS home_city_id UUID REFERENCES public.cities(id);

-- 2. Tambah kolom jumlah favorit pada destinations
ALTER TABLE public.destinations ADD COLUMN IF NOT EXISTS favorite_count INT DEFAULT 0;

-- 3. Buat fungsi trigger untuk menghitung favorit secara otomatis
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

-- 4. Pasang trigger pada tabel favorites (hapus dulu jika sudah ada)
DROP TRIGGER IF EXISTS on_favorite_change ON public.favorites;
CREATE TRIGGER on_favorite_change
AFTER INSERT OR DELETE ON public.favorites
FOR EACH ROW EXECUTE FUNCTION public.calculate_favorite_count();

-- 5. Perbarui jumlah favorit yang sudah ada sebelumnya
UPDATE public.destinations d
SET favorite_count = (
  SELECT count(*) FROM public.favorites f WHERE f.destination_id = d.id
);

-- 6. Keamanan: Cegah update kolom sensitif di user_profiles oleh selain super_admin
CREATE OR REPLACE FUNCTION public.prevent_sensitive_profile_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_super_admin() THEN
    -- Paksa kembalikan kolom role dan region_city_id ke nilai lama
    NEW.role = OLD.role;
    NEW.region_city_id = OLD.region_city_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_security ON public.user_profiles;
CREATE TRIGGER on_profile_update_security
BEFORE UPDATE ON public.user_profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_sensitive_profile_update();

-- 7. Keamanan: Cegah pelapor memanipulasi status dan kolom admin di tabel reports
CREATE OR REPLACE FUNCTION public.prevent_report_manipulation()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika yang update adalah super_admin atau regional_admin, izinkan
  IF public.is_super_admin() OR public.is_regional_admin_for_city(
    (SELECT city_id FROM public.destinations WHERE id = NEW.destination_id)
  ) THEN
    RETURN NEW;
  END IF;

  -- Jika bukan admin, pastikan status hanya bisa diubah jadi 'cancelled_by_user'
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status != 'cancelled_by_user' THEN
    NEW.status = OLD.status;
  END IF;

  -- Pastikan kolom khusus admin tidak bisa diubah oleh pengguna biasa
  NEW.admin_note = OLD.admin_note;
  NEW.resolved_at = OLD.resolved_at;
  NEW.resolved_by = OLD.resolved_by;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_update_security ON public.reports;
CREATE TRIGGER on_report_update_security
BEFORE UPDATE ON public.reports
FOR EACH ROW EXECUTE FUNCTION public.prevent_report_manipulation();
