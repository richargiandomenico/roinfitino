import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ChecklistSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface ActionPlan {
  id: string;
  project_id: string | null;
  niche: string;
  country: string;
  language: string;
  main_topic: string;
  start_date: string;
  sprint_days: number;
  goal: string;
  extra_notes: string;
  checklist_states: Record<string, boolean>;
  phase_notes: Record<string, string>;
  daily_priorities: Record<string, string>;
  checklist_assignees: Record<string, string>;
  checklist_subtasks: Record<string, ChecklistSubtask[]>;
  created_at: string;
  updated_at: string;
}

export function useActionPlans(projectId: string | null) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!user || !projectId) { setLoading(false); return; }
    const { data } = await supabase
      .from('action_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) {
      const parsed: ActionPlan[] = data.map(d => ({
        ...d,
        checklist_states: (d.checklist_states || {}) as Record<string, boolean>,
        phase_notes: (d.phase_notes || {}) as Record<string, string>,
        daily_priorities: (d.daily_priorities || {}) as Record<string, string>,
        checklist_assignees: (d.checklist_assignees || {}) as Record<string, string>,
        checklist_subtasks: (d.checklist_subtasks || {}) as Record<string, ChecklistSubtask[]>,
      }));
      setPlans(parsed);
      if (!selectedPlanId && parsed.length > 0) setSelectedPlanId(parsed[0].id);
    }
    setLoading(false);
  }, [user, projectId, selectedPlanId]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const addPlan = async (data: {
    niche: string; country: string; language: string; main_topic: string;
    start_date: string; sprint_days: number; goal: string; extra_notes: string;
  }) => {
    if (!user || !projectId) return;
    const { data: newPlan, error } = await supabase
      .from('action_plans')
      .insert({ ...data, user_id: user.id, project_id: projectId })
      .select()
      .single();
    if (newPlan && !error) {
      const parsed = {
        ...newPlan,
        checklist_states: (newPlan.checklist_states || {}) as Record<string, boolean>,
        phase_notes: (newPlan.phase_notes || {}) as Record<string, string>,
        daily_priorities: (newPlan.daily_priorities || {}) as Record<string, string>,
      };
      setPlans(prev => [parsed, ...prev]);
      setSelectedPlanId(parsed.id);
    }
  };

  const updatePlan = async (id: string, updates: Partial<Pick<ActionPlan, 'checklist_states' | 'phase_notes' | 'daily_priorities' | 'goal' | 'extra_notes'>>) => {
    await supabase.from('action_plans').update(updates).eq('id', id);
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deletePlan = async (id: string) => {
    await supabase.from('action_plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
    if (selectedPlanId === id) setSelectedPlanId(plans.find(p => p.id !== id)?.id ?? null);
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId) ?? null;

  return { plans, selectedPlan, selectedPlanId, setSelectedPlanId, loading, addPlan, updatePlan, deletePlan };
}
