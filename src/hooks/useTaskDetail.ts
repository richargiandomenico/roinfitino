import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { TaskSubtask, TaskComment } from '@/types/team';

export function useTaskDetail(taskId: string | null) {
  const { user } = useAuth();
  const [subtasks, setSubtasks] = useState<TaskSubtask[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    const [subRes, comRes] = await Promise.all([
      (supabase as any).from('task_subtasks').select('*').eq('task_id', taskId).order('sort_order'),
      (supabase as any).from('task_comments').select('*').eq('task_id', taskId).order('created_at', { ascending: true }),
    ]);
    setSubtasks((subRes.data || []) as TaskSubtask[]);
    setComments((comRes.data || []) as TaskComment[]);
    setLoading(false);
  }, [taskId]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const addSubtask = async (title: string) => {
    await (supabase as any).from('task_subtasks').insert({
      task_id: taskId, title, sort_order: subtasks.length,
    });
    fetchDetails();
  };

  const toggleSubtask = async (id: string, completed: boolean) => {
    await (supabase as any).from('task_subtasks').update({ completed }).eq('id', id);
    fetchDetails();
  };

  const deleteSubtask = async (id: string) => {
    await (supabase as any).from('task_subtasks').delete().eq('id', id);
    fetchDetails();
  };

  const addComment = async (content: string) => {
    if (!user) return;
    await (supabase as any).from('task_comments').insert({
      task_id: taskId, user_id: user.id, content,
    });
    fetchDetails();
  };

  return { subtasks, comments, loading, addSubtask, toggleSubtask, deleteSubtask, addComment, refetch: fetchDetails };
}
