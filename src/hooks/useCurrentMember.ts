import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { TeamMember, AppRole } from '@/types/team';

export function useCurrentMember() {
  const { user } = useAuth();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [role, setRole] = useState<AppRole>('collaborator');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    const init = async () => {
      try {
        const { data: existing } = await (supabase as any)
          .from('team_members')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        let memberData = existing;

        if (!memberData) {
          const { data: created } = await (supabase as any)
            .from('team_members')
            .insert({
              user_id: user.id,
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
              email: user.email,
            })
            .select()
            .single();
          memberData = created;
        }

        setMember(memberData as TeamMember);

        const { data: roleData } = await (supabase as any)
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!roleData) {
          const { count } = await (supabase as any)
            .from('user_roles')
            .select('*', { count: 'exact', head: true });

          const newRole: AppRole = (count || 0) === 0 ? 'super_admin' : 'collaborator';
          await (supabase as any)
            .from('user_roles')
            .insert({ user_id: user.id, role: newRole });
          setRole(newRole);
        } else {
          setRole(roleData.role as AppRole);
        }
      } catch (err) {
        console.error('Error initializing member:', err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user]);

  return { member, role, loading, isAdmin: role === 'super_admin' || role === 'admin' };
}
