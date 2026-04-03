
-- Allow collaborators to SELECT projects they're assigned to via team_member_projects
DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;

CREATE POLICY "projects_select" ON public.projects FOR SELECT TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.team_member_projects tmp
    JOIN public.team_members tm ON tm.id = tmp.team_member_id
    WHERE tmp.project_id = projects.id AND tm.user_id = auth.uid()
  )
);

CREATE POLICY "projects_insert" ON public.projects FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "projects_update" ON public.projects FOR UPDATE TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "projects_delete" ON public.projects FOR DELETE TO authenticated
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'super_admin')
);
