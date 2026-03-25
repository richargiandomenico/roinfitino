import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { TeamMember, AppRole } from '@/types/team';

export interface TeamMemberWithRole extends TeamMember {
  role?: AppRole;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMemberWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('team_members')
      .select('*')
      .order('name');

    const membersList = (data || []) as TeamMember[];

    // Try to fetch roles (may fail for non-admins due to RLS)
    const membersWithRoles = await Promise.all(
      membersList.map(async (m) => {
        const { data: roleData } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', m.user_id)
          .maybeSingle();
        return { ...m, role: (roleData?.role as AppRole) || undefined };
      })
    );

    setMembers(membersWithRoles);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  return { members, loading, refetch: fetchMembers };
}
