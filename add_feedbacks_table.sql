-- Add feedbacks table for contacting admin & regional admin
CREATE TABLE IF NOT EXISTS public.feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    target_admin_type TEXT NOT NULL CHECK (target_admin_type IN ('super_admin', 'regional_admin')),
    target_city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist
DROP POLICY IF EXISTS "Users can insert their own feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Users can view their own feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Super admins can view all feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Regional admins can view regional feedbacks" ON public.feedbacks;

-- RLS Policies
-- Users can insert their own feedbacks
CREATE POLICY "Users can insert their own feedbacks" ON public.feedbacks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid())
  );

-- Users can view their own feedbacks
CREATE POLICY "Users can view their own feedbacks" ON public.feedbacks
  FOR SELECT USING (auth.uid() = user_id);

-- Super admins can view all feedbacks
CREATE POLICY "Super admins can view all feedbacks" ON public.feedbacks
  FOR ALL USING (public.is_super_admin());

-- Regional admins can view feedbacks targeted to their city
CREATE POLICY "Regional admins can view regional feedbacks" ON public.feedbacks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() 
        AND role = 'regional_admin' 
        AND region_city_id = target_city_id
    )
  );
