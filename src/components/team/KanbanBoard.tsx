import { useState } from 'react';
import type { Task, TaskStatus, TeamMember } from '@/types/team';
import { STATUS_CONFIG } from '@/types/team';
import { TaskCard } from './TaskCard';
import { TaskDetailDialog } from './TaskDetailDialog';

interface Props {
  tasks: Task[];
  members: TeamMember[];
  projects: { id: string; name: string }[];
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
}

const COLUMNS: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'waiting', 'review', 'done', 'cancelled'];

export function KanbanBoard({ tasks, members, projects, onUpdateTask, onDeleteTask }: Props) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      const updates: Partial<Task> = { status };
      if (status === 'done') updates.completed_at = new Date().toISOString();
      else updates.completed_at = null as any;
      await onUpdateTask(taskId, updates);
    }
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '65vh' }}>
        {COLUMNS.map(status => {
          const config = STATUS_CONFIG[status];
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div
              key={status}
              className={`flex-shrink-0 w-72 rounded-lg border bg-card/50 flex flex-col transition-all ${
                dragOverColumn === status ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onDrop={e => handleDrop(e, status)}
              onDragOver={e => handleDragOver(e, status)}
              onDragLeave={() => setDragOverColumn(null)}
            >
              <div className="p-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${config.bgColor}`} />
                  <h3 className={`text-sm font-semibold ${config.color}`}>{config.label}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="p-2 flex-1 space-y-2 overflow-y-auto max-h-[calc(65vh-3rem)]">
                {columnTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    members={members}
                    onDragStart={handleDragStart}
                    onClick={() => setSelectedTask(task)}
                  />
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8 opacity-50">
                    Arraste tarefas aqui
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          members={members}
          projects={projects}
          open={!!selectedTask}
          onOpenChange={open => { if (!open) setSelectedTask(null); }}
          onUpdate={async (id, updates) => { await onUpdateTask(id, updates); setSelectedTask(prev => prev ? { ...prev, ...updates } : null); }}
          onDelete={async (id) => { await onDeleteTask(id); setSelectedTask(null); }}
        />
      )}
    </>
  );
}
