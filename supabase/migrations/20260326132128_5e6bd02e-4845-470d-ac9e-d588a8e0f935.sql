ALTER TABLE public.action_plans 
  ADD COLUMN IF NOT EXISTS checklist_assignees jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS checklist_subtasks jsonb NOT NULL DEFAULT '{}'::jsonb;