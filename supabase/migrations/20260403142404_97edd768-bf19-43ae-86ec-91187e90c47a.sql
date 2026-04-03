
-- Fix RLS for simulations: allow project members to view
DROP POLICY IF EXISTS "Users manage own simulations" ON public.simulations;
CREATE POLICY "simulations_select" ON public.simulations FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_member_projects tmp
    JOIN team_members tm ON tm.id = tmp.team_member_id
    WHERE tmp.project_id = simulations.project_id AND tm.user_id = auth.uid()
  ))
);
CREATE POLICY "simulations_insert" ON public.simulations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "simulations_update" ON public.simulations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "simulations_delete" ON public.simulations FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Fix RLS for funnel_records
DROP POLICY IF EXISTS "Users manage own funnel records" ON public.funnel_records;
CREATE POLICY "funnel_select" ON public.funnel_records FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_member_projects tmp
    JOIN team_members tm ON tm.id = tmp.team_member_id
    WHERE tmp.project_id = funnel_records.project_id AND tm.user_id = auth.uid()
  ))
);
CREATE POLICY "funnel_insert" ON public.funnel_records FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "funnel_update" ON public.funnel_records FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "funnel_delete" ON public.funnel_records FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Fix RLS for financial_records
DROP POLICY IF EXISTS "Users manage own financial records" ON public.financial_records;
CREATE POLICY "financial_select" ON public.financial_records FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_member_projects tmp
    JOIN team_members tm ON tm.id = tmp.team_member_id
    WHERE tmp.project_id = financial_records.project_id AND tm.user_id = auth.uid()
  ))
);
CREATE POLICY "financial_insert" ON public.financial_records FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "financial_update" ON public.financial_records FOR UPDATE TO authenticated
USING (auth.uid() = user_id);
CREATE POLICY "financial_delete" ON public.financial_records FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Fix RLS for action_plans
DROP POLICY IF EXISTS "Users manage own action plans" ON public.action_plans;
CREATE POLICY "plans_select" ON public.action_plans FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR (project_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM team_member_projects tmp
    JOIN team_members tm ON tm.id = tmp.team_member_id
    WHERE tmp.project_id = action_plans.project_id AND tm.user_id = auth.uid()
  ))
);
CREATE POLICY "plans_insert" ON public.action_plans FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);
CREATE POLICY "plans_update" ON public.action_plans FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));
CREATE POLICY "plans_delete" ON public.action_plans FOR DELETE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));
