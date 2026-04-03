import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Project {
  id: string;
  name: string;
  url: string | null;
  niche: string | null;
  user_id: string;
  created_at: string;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (data) {
      setProjects(data);
      if (!selectedProjectId && data.length > 0) setSelectedProjectId(data[0].id);
    }
    setLoading(false);
  }, [user, selectedProjectId]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const addProject = async (name: string, url?: string, niche?: string) => {
    if (!user) return;
    const { data, error } = await supabase.from('projects').insert({ user_id: user.id, name, url: url || null, niche: niche || null }).select().single();
    if (data && !error) {
      setProjects(prev => [data, ...prev]);
      setSelectedProjectId(data.id);
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(prev => prev.filter(p => p.id !== id));
    if (selectedProjectId === id) setSelectedProjectId(projects.find(p => p.id !== id)?.id ?? null);
  };

  return { projects, selectedProjectId, setSelectedProjectId, loading, addProject, deleteProject };
}
