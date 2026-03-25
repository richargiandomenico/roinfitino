import type { Task, TeamMember } from '@/types/team';
import { PRIORITY_CONFIG } from '@/types/team';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

interface Props {
  task: Task;
  members: TeamMember[];
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onClick: () => void;
}

export function TaskCard({ task, members, onDragStart, onClick }: Props) {
  const assignee = members.find(m => m.id === task.assignee_id);
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.due_date && isPast(new Date(task.due_date + 'T23:59:59')) && task.status !== 'done' && task.status !== 'cancelled';
  const isDueToday = task.due_date && isToday(new Date(task.due_date));

  return (
    <Card
      className="p-3 cursor-pointer hover:ring-1 hover:ring-primary/50 transition-all active:scale-[0.98]"
      draggable
      onDragStart={e => onDragStart(e, task.id)}
      onClick={onClick}
    >
      <div className="space-y-2">
        <p className="text-sm font-medium leading-tight line-clamp-2">{task.title}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${priorityConfig.color} ${priorityConfig.bgColor} border-0`}>
            {priorityConfig.label}
          </Badge>
          {task.category && task.category !== 'Outro' && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{task.category}</Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {task.due_date && (
              <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-loss font-semibold' : isDueToday ? 'text-warning' : 'text-muted-foreground'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.due_date), 'dd/MM')}
              </span>
            )}
          </div>
          {assignee && (
            <Avatar className="w-6 h-6">
              <AvatarFallback className="text-[10px] bg-primary/20">
                {assignee.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </Card>
  );
}
