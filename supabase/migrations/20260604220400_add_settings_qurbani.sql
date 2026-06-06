-- Create app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  default_nisab numeric DEFAULT 80000,
  fitra_prices jsonb DEFAULT '{"wheat": 70, "barley": 120, "raisins": 500, "dates": 400, "cheese": 800}'::jsonb,
  prayer_city text DEFAULT 'Dhaka',
  prayer_country text DEFAULT 'Bangladesh',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Insert a single default row if none exists
INSERT INTO public.app_settings (default_nisab)
SELECT 80000
WHERE NOT EXISTS (SELECT 1 FROM public.app_settings);

-- Create qurbani_animals table
CREATE TABLE IF NOT EXISTS public.qurbani_animals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL, -- e.g., 'Cow (গরু)'
  cost numeric NOT NULL,
  processing_cost numeric DEFAULT 0,
  vendor text,
  purchase_date date,
  total_shares integer NOT NULL DEFAULT 7,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users(id)
);

-- Create qurbani_shares table
CREATE TABLE IF NOT EXISTS public.qurbani_shares (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id uuid NOT NULL REFERENCES public.qurbani_animals(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  share_amount numeric NOT NULL,
  contact text,
  paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_by uuid REFERENCES auth.users(id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurbani_animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurbani_shares ENABLE ROW LEVEL SECURITY;

-- Policies for app_settings (Allow all authenticated users to read/update, but only one row exists)
CREATE POLICY "Allow authenticated users to read settings"
ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to update settings"
ON public.app_settings FOR UPDATE TO authenticated USING (true);

-- Policies for qurbani_animals
CREATE POLICY "Allow authenticated users to read animals"
ON public.qurbani_animals FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert animals"
ON public.qurbani_animals FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update animals"
ON public.qurbani_animals FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete animals"
ON public.qurbani_animals FOR DELETE TO authenticated USING (true);

-- Policies for qurbani_shares
CREATE POLICY "Allow authenticated users to read shares"
ON public.qurbani_shares FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert shares"
ON public.qurbani_shares FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update shares"
ON public.qurbani_shares FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete shares"
ON public.qurbani_shares FOR DELETE TO authenticated USING (true);
