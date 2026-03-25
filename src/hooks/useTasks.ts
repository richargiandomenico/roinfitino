import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Task } from '@/types/team';
import { toast } from 'sonner';

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setTasks((data || []) as Task[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchTasks)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTasks]);

  const addTask = async (task: Partial<Task>) => {
    if (!user) return;
    const { error } = await (supabase as any).from('tasks').insert({ ...task, created_by: user.id });
    if (error) { toast.error('Erro ao criar tarefa'); throw error; }
    toast.success('Tarefa criada!');
    fetchTasks();
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    const { error } = await (supabase as any).from('tasks').update(updates).eq('id', id);
    if (error) { toast.error('Erro ao atualizar'); throw error; }
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    const { error } = await (supabase as any).from('tasks').delete().eq('id', id);
    if (error) { toast.error('Erro ao excluir'); throw error; }
    toast.success('Tarefa excluída');
    fetchTasks();
  };

  return { tasks, loading, addTask, updateTask, deleteTask, refetch: fetchTasks };
}
