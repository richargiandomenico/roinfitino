import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Simulation {
  id: string;
  revenue_usd: number;
  dollar_rate: number;
  revenue_brl: number;
  results_count: number;
  total_spent: number;
  revenue_per_result: number;
  cpa: number;
  cpa_ideal: number;
  roi: number;
  status: string;
  created_at: string;
}

export function useSimulations(projectId: string | null) {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSimulations = useCallback(async () => {
    if (!user || !projectId) { setSimulations([]); setLoading(false); return; }
    const { data } = await supabase.from('simulations').select('*')
      .eq('user_id', user.id).eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) setSimulations(data.map(d => ({
      ...d,
      revenue_usd: Number(d.revenue_usd),
      dollar_rate: Number(d.dollar_rate),
      revenue_brl: Number(d.revenue_brl),
      results_count: d.results_count,
      total_spent: Number(d.total_spent),
      revenue_per_result: Number(d.revenue_per_result),
      cpa: Number(d.cpa),
      cpa_ideal: Number(d.cpa_ideal),
      roi: Number(d.roi),
    })));
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchSimulations(); }, [fetchSimulations]);

  const addSimulation = async (data: {
    revenue_usd: number; dollar_rate: number; results_count: number; total_spent: number;
  }) => {
    if (!user || !projectId) return;
    const revenueBrl = data.revenue_usd * data.dollar_rate;
    const revenuePerResult = revenueBrl / data.results_count;
    const cpa = data.total_spent / data.results_count;
    const cpaIdeal = revenuePerResult / 2;
    const roi = ((revenuePerResult - cpa) / cpa) * 100;
    const status = roi >= 100 ? 'profit' : roi >= 0 ? 'warning' : 'loss';

    const { data: newSim, error } = await supabase.from('simulations').insert({
      user_id: user.id, project_id: projectId,
      revenue_usd: data.revenue_usd, dollar_rate: data.dollar_rate,
      revenue_brl: revenueBrl, results_count: data.results_count,
      total_spent: data.total_spent, revenue_per_result: revenuePerResult,
      cpa, cpa_ideal: cpaIdeal, roi, status,
    }).select().single();

    if (newSim && !error) {
      setSimulations(prev => [{
        ...newSim,
        revenue_usd: Number(newSim.revenue_usd),
        dollar_rate: Number(newSim.dollar_rate),
        revenue_brl: Number(newSim.revenue_brl),
        results_count: newSim.results_count,
        total_spent: Number(newSim.total_spent),
        revenue_per_result: Number(newSim.revenue_per_result),
        cpa: Number(newSim.cpa),
        cpa_ideal: Number(newSim.cpa_ideal),
        roi: Number(newSim.roi),
      }, ...prev]);
    }
    return { revenueBrl, revenuePerResult, cpa, cpaIdeal, roi, status };
  };

  const deleteSimulation = async (id: string) => {
    await supabase.from('simulations').delete().eq('id', id);
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  return { simulations, loading, addSimulation, deleteSimulation };
}
