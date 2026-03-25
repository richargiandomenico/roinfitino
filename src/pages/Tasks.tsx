import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthPage } from '@/components/AuthPage';
import { TeamNav } from '@/components/team/TeamNav';
import { KanbanBoard } from '@/components/team/KanbanBoard';
import { CreateTaskDialog } from '@/components/team/CreateTaskDialog';
import { useTasks } from '@/hooks/useTasks';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import type { TaskPriority, TaskStatus } from '@/types/team';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/team';

export default function Tasks() {
  const { user, loading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { member, loading: memberLoading } = useCurrentMember();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask } = useTasks();
  const { members } = useTeamMembers();
  const { projects } = useProjects();

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
      if (filterAssignee !== 'all' && t.assignee_id !== filterAssignee) return false;
      if (filterProject === 'none' && t.project_id !== null) return false;
      if (filterProject !== 'all' && filterProject !== 'none' && t.project_id !== filterProject) return false;
      return true;
    });
  }, [tasks, search, filterPriority, filterAssignee, filterProject]);

  if (authLoading || memberLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-pulse text-muted-foreground">Carregando...</div></div>;
  }
  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background">
      <TeamNav />
      <main className="container max-w-full mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h1 className="text-2xl font-bold font-display">Tarefas</h1>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nova Tarefa
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar tarefas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas prioridades</SelectItem>
              {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterAssignee} onValueChange={setFilterAssignee}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Responsável" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {members.filter(m => m.status === 'active').map(m => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger className="w-40 h-9"><SelectValue placeholder="Projeto" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos projetos</SelectItem>
              <SelectItem value="none">Sem projeto</SelectItem>
              {projects.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {tasksLoading ? (
          <div className="text-center py-20 text-muted-foreground animate-pulse">Carregando tarefas...</div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            members={members}
            projects={projects}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        )}

        <CreateTaskDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          members={members}
          projects={projects}
          currentMember={member}
          onSubmit={addTask}
        />
      </main>
    </div>
  );
}
