import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/AuthPage';
import { TeamNav } from '@/components/team/TeamNav';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Mail, Phone, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import type { AppRole } from '@/types/team';
import { ROLE_LABELS, JOB_TITLES } from '@/types/team';

export default function TeamMembers() {
  const { user, loading: authLoading } = useAuth();
  const { member: currentMember, role: currentRole, loading: memberLoading } = useCurrentMember();
  const { members, loading, refetch } = useTeamMembers();

  const isSuperAdmin = currentRole === 'super_admin';

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    const { error } = await (supabase as any)
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);
    if (error) {
      toast.error('Erro ao alterar cargo');
    } else {
      toast.success('Cargo atualizado!');
      refetch();
    }
  };

  const handleJobTitleChange = async (memberId: string, jobTitle: string) => {
    const { error } = await (supabase as any)
      .from('team_members')
      .update({ job_title: jobTitle })
      .eq('id', memberId);
    if (error) toast.error('Erro ao atualizar');
    else refetch();
  };

  const handleStatusToggle = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await (supabase as any)
      .from('team_members')
      .update({ status: newStatus })
      .eq('id', memberId);
    if (error) toast.error('Erro ao atualizar');
    else { toast.success(`Membro ${newStatus === 'active' ? 'ativado' : 'desativado'}`); refetch(); }
  };

  if (authLoading || memberLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }
  if (!user) return <AuthPage />;
  if (!isSuperAdmin && currentRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TeamNav />
      <main className="container max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold font-display">Equipe</h1>
            <Badge variant="outline" className="text-xs">{members.length} membros</Badge>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando equipe...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map(m => (
              <Card key={m.id} className={`transition-all ${m.status === 'inactive' ? 'opacity-50' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary/20 text-lg font-semibold">
                        {m.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={m.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                          {m.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {m.role && (
                          <Badge variant="outline" className="text-[10px]">
                            {ROLE_LABELS[m.role] || m.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-muted-foreground">
                    {m.email && (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="w-3 h-3 flex-shrink-0" /> {m.email}
                      </p>
                    )}
                    {m.phone && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" /> {m.phone}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Briefcase className="w-3 h-3 flex-shrink-0" /> {m.job_title}
                    </p>
                  </div>

                  {isSuperAdmin && m.user_id !== user?.id && (
                    <div className="space-y-2 pt-2 border-t">
                      <Select value={m.role || 'collaborator'} onValueChange={v => handleRoleChange(m.user_id, v as AppRole)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={m.job_title} onValueChange={v => handleJobTitleChange(m.id, v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {JOB_TITLES.map(j => <SelectItem key={j} value={j}>{j}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline" size="sm" className="w-full text-xs"
                        onClick={() => handleStatusToggle(m.id, m.status)}
                      >
                        {m.status === 'active' ? 'Desativar' : 'Ativar'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 rounded-lg border bg-card/50">
          <p className="text-sm text-muted-foreground">
            💡 Para adicionar novos membros, peça para eles criarem uma conta no sistema.
            Após o cadastro, eles aparecerão automaticamente aqui e você poderá configurar cargo e permissões.
          </p>
        </div>
      </main>
    </div>
  );
}
