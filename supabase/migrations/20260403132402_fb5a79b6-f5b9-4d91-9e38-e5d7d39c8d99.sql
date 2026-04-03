
-- Allow project owners to insert members to their projects
DROP POLICY IF EXISTS "tmp_insert" ON public.team_member_projects;
CREATE POLICY "tmp_insert" ON public.team_member_projects FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()
  )
);

-- Allow project owners to delete members from their projects
DROP POLICY IF EXISTS "tmp_delete" ON public.team_member_projects;
CREATE POLICY "tmp_delete" ON public.team_member_projects FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'super_admin')
  OR has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid()
  )
);
