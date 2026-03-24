
CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  niche TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'Brasil',
  language TEXT NOT NULL DEFAULT 'Português',
  main_topic TEXT NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sprint_days INTEGER NOT NULL DEFAULT 14,
  goal TEXT DEFAULT '',
  extra_notes TEXT DEFAULT '',
  checklist_states JSONB NOT NULL DEFAULT '{}',
  phase_notes JSONB NOT NULL DEFAULT '{}',
  daily_priorities JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own action plans"
  ON public.action_plans
  FOR ALL
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
