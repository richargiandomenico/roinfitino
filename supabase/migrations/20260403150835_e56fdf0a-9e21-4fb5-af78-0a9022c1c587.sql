
-- Update INSERT policies to allow project members to insert records
-- financial_records
DROP POLICY IF EXISTS financial_insert ON public.financial_records;
CREATE POLICY financial_insert ON public.financial_records
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Update UPDATE policies to allow project members to update records  
DROP POLICY IF EXISTS financial_update ON public.financial_records;
CREATE POLICY financial_update ON public.financial_records
  FOR UPDATE TO authenticated
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

-- simulations update
DROP POLICY IF EXISTS simulations_update ON public.simulations;
CREATE POLICY simulations_update ON public.simulations
  FOR UPDATE TO authenticated
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

-- action_plans update - allow project members
DROP POLICY IF EXISTS plans_update ON public.action_plans;
CREATE POLICY plans_update ON public.action_plans
  FOR UPDATE TO authenticated
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

-- funnel_records update
DROP POLICY IF EXISTS funnel_update ON public.funnel_records;
CREATE POLICY funnel_update ON public.funnel_records
  FOR UPDATE TO authenticated
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
