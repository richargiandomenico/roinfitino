import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, X } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  projectId: string;
  projectOwnerId?: string;
}

export function ProjectMembersManager({ projectId, projectOwnerId }: Props) {
  const { members } = useTeamMembers();
  const { isAdmin, member: currentMember } = useCurrentMember();
  const [assignedIds, setAssignedIds] = useState<string[]>([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [loading, setLoading] = useState(true);

  const isOwner = currentMember?.user_id === projectOwnerId;
  const canManageMembers = isAdmin || isOwner;

  const fetchAssigned = useCallback(async () => {
    const { data } = await (supabase as any)
      .from('team_member_projects')
      .select('team_member_id')
      .eq('project_id', projectId);
    setAssignedIds((data || []).map((d: any) => d.team_member_id));
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchAssigned(); }, [fetchAssigned]);

  const handleAdd = async () => {
    if (!selectedMember) return;
    const { error } = await (supabase as any)
      .from('team_member_projects')
      .insert({ team_member_id: selectedMember, project_id: projectId });
    if (error) {
      toast.error('Erro ao adicionar membro');
    } else {
      toast.success('Membro adicionado ao projeto');
      setSelectedMember('');
      fetchAssigned();
    }
  };

  const handleRemove = async (memberId: string) => {
    const { error } = await (supabase as any)
      .from('team_member_projects')
      .delete()
      .eq('team_member_id', memberId)
      .eq('project_id', projectId);
    if (error) {
      toast.error('Erro ao remover membro');
    } else {
      fetchAssigned();
    }
  };

  const assignedMembers = members.filter(m => assignedIds.includes(m.id));
  const availableMembers = members.filter(m => !assignedIds.includes(m.id) && m.status === 'active');

  if (loading) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-primary" />
        Participantes do Projeto
      </h3>

      {/* Assigned members */}
      <div className="flex flex-wrap gap-2">
        {assignedMembers.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum membro atribuído.</p>
        )}
        {assignedMembers.map(m => (
          <Badge key={m.id} variant="secondary" className="flex items-center gap-1.5 pr-1">
            <Avatar className="w-5 h-5">
              <AvatarFallback className="text-[10px] bg-primary/20">
                {m.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{m.name}</span>
            {canManageMembers && (
              <button
                onClick={() => handleRemove(m.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3 h-3 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {/* Add member (available to admins and project owner) */}
      {availableMembers.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Adicionar membro..." />
            </SelectTrigger>
            <SelectContent>
              {availableMembers.map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" className="h-8" onClick={handleAdd} disabled={!selectedMember}>
            <UserPlus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
