import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, CheckSquare, MessageSquare, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task, TeamMember, TaskStatus, TaskPriority } from '@/types/team';
import { STATUS_CONFIG, PRIORITY_CONFIG, CATEGORIES } from '@/types/team';
import { useTaskDetail } from '@/hooks/useTaskDetail';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useAuth } from '@/hooks/useAuth';
import { CommentEditor } from './CommentEditor';
import { CommentItem } from './CommentItem';

interface Props {
  task: Task;
  members: TeamMember[];
  projects: { id: string; name: string }[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskDetailDialog({ task, members, projects, open, onOpenChange, onUpdate, onDelete }: Props) {
  const { subtasks, comments, addSubtask, toggleSubtask, deleteSubtask, addComment } = useTaskDetail(task.id);
  const { member: currentMember, isAdmin } = useCurrentMember();
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');

  const assignee = members.find(m => m.id === task.assignee_id);
  const requester = members.find(m => m.id === task.requester_id);
  const project = projects.find(p => p.id === task.project_id);
  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? Math.round((completedCount / subtasks.length) * 100) : 0;

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    addSubtask(newSubtask.trim());
    setNewSubtask('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(newComment.trim());
    setNewComment('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{task.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4">
          {/* Main content */}
          <div className="col-span-2 space-y-4">
            {task.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
            )}

            <Tabs defaultValue="subtasks" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="subtasks" className="text-xs">
                  <CheckSquare className="w-3 h-3 mr-1" /> Subtarefas ({subtasks.length})
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-xs">
                  <MessageSquare className="w-3 h-3 mr-1" /> Comentários ({comments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subtasks" className="space-y-2 mt-3">
                {subtasks.length > 0 && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-profit rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <span>{progress}%</span>
                  </div>
                )}
                {subtasks.map(sub => (
                  <div key={sub.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={sub.completed}
                      onCheckedChange={checked => toggleSubtask(sub.id, !!checked)}
                    />
                    <span className={`text-sm flex-1 ${sub.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {sub.title}
                    </span>
                    <Button
                      variant="ghost" size="icon"
                      className="w-6 h-6 opacity-0 group-hover:opacity-100"
                      onClick={() => deleteSubtask(sub.id)}
                    >
                      <Trash2 className="w-3 h-3 text-loss" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newSubtask}
                    onChange={e => setNewSubtask(e.target.value)}
                    placeholder="Nova subtarefa..."
                    className="h-8 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddSubtask} className="h-8">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="comments" className="space-y-3 mt-3">
                {comments.map(comment => {
                  const author = members.find(m => m.user_id === comment.user_id);
                  return (
                    <div key={comment.id} className="flex gap-2">
                      <Avatar className="w-6 h-6 mt-0.5">
                        <AvatarFallback className="text-[10px]">
                          {author?.name?.charAt(0).toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{author?.name || 'Usuário'}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {format(new Date(comment.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center gap-2">
                  <Input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Escrever comentário..."
                    className="h-8 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  />
                  <Button size="sm" variant="outline" onClick={handleAddComment} className="h-8">
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 border-l pl-4">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Status</label>
              <Select value={task.status} onValueChange={v => onUpdate(task.id, { status: v as TaskStatus })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}><span className={v.color}>{v.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prioridade</label>
              <Select value={task.priority} onValueChange={v => onUpdate(task.id, { priority: v as TaskPriority })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                    <SelectItem key={k} value={k}><span className={v.color}>{v.label}</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Responsável</label>
              <Select value={task.assignee_id || ''} onValueChange={v => onUpdate(task.id, { assignee_id: v || null })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Ninguém" /></SelectTrigger>
                <SelectContent>
                  {members.filter(m => m.status === 'active').map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Categoria</label>
              <Select value={task.category} onValueChange={v => onUpdate(task.id, { category: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {requester && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Solicitante</label>
                <p className="text-xs">{requester.name}</p>
              </div>
            )}
            {project && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Projeto</label>
                <p className="text-xs">{project.name}</p>
              </div>
            )}
            {task.due_date && (
              <div>
                <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prazo</label>
                <p className="text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {format(new Date(task.due_date), 'dd/MM/yyyy')}
                </p>
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Criada em</label>
              <p className="text-xs">{format(new Date(task.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
            </div>

            {isAdmin && (
              <>
                <Separator />
                <Button
                  variant="destructive" size="sm" className="w-full text-xs"
                  onClick={() => { if (confirm('Excluir esta tarefa?')) onDelete(task.id); }}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Excluir
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
