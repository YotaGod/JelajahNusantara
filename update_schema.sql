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
