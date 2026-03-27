ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS observation text DEFAULT '',
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'meta_ads',
  ADD COLUMN IF NOT EXISTS impressions integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cpm numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revenue_gam numeric DEFAULT 0;