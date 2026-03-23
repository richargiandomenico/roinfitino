
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  niche TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projects" ON public.projects FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  dollar_rate NUMERIC(10,4) DEFAULT 5.50,
  use_auto_dollar BOOLEAN DEFAULT true,
  meta_fee NUMERIC(5,2) DEFAULT 0,
  adx_fee NUMERIC(5,2) DEFAULT 10,
  tax_rate NUMERIC(5,2) DEFAULT 3.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own settings" ON public.settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  revenue_usd NUMERIC(12,2) NOT NULL,
  dollar_rate NUMERIC(10,4) NOT NULL,
  revenue_brl NUMERIC(12,2) NOT NULL,
  results_count INTEGER NOT NULL,
  total_spent NUMERIC(12,2) NOT NULL,
  revenue_per_result NUMERIC(12,4),
  cpa NUMERIC(12,4),
  cpa_ideal NUMERIC(12,4),
  roi NUMERIC(12,4),
  status TEXT NOT NULL DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own simulations" ON public.simulations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.funnel_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  visits_p1 INTEGER NOT NULL,
  p2 INTEGER NOT NULL,
  p3 INTEGER NOT NULL,
  conv_p1_p2 NUMERIC(8,4),
  conv_p1_p3 NUMERIC(8,4),
  conv_p2_p3 NUMERIC(8,4),
  drop_p1_p2 NUMERIC(8,4),
  drop_p1_p3 NUMERIC(8,4),
  observation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.funnel_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnel records" ON public.funnel_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
