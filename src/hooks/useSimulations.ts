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
  observation: string;
  source: string;
  impressions: number;
  cpm: number;
  revenue_gam: number;
}

export interface SimulationInput {
  revenue_usd: number;
  dollar_rate: number;
  results_count: number;
  total_spent: number;
  observation: string;
  source: string;
  impressions: number;
  cpm: number;
  revenue_gam: number;
}

export function useSimulations(projectId: string | null) {
  const { user } = useAuth();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);

  const mapRow = (d: any): Simulation => ({
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
    observation: d.observation || '',
    source: d.source || 'meta_ads',
    impressions: d.impressions || 0,
    cpm: Number(d.cpm || 0),
    revenue_gam: Number(d.revenue_gam || 0),
  });

  const fetchSimulations = useCallback(async () => {
    if (!user || !projectId) { setSimulations([]); setLoading(false); return; }
    const { data } = await supabase.from('simulations').select('*')
      .eq('user_id', user.id).eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) setSimulations(data.map(mapRow));
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchSimulations(); }, [fetchSimulations]);

  const addSimulation = async (input: SimulationInput) => {
    if (!user || !projectId) return;
    const revenueBrl = input.revenue_usd * input.dollar_rate;
    const revenuePerResult = revenueBrl / input.results_count;
    const cpa = input.total_spent / input.results_count;
    const cpaIdeal = revenuePerResult / 2;
    const roi = ((revenuePerResult - cpa) / cpa) * 100;
    const status = roi >= 100 ? 'profit' : roi >= 0 ? 'warning' : 'loss';

    const { data: newSim, error } = await supabase.from('simulations').insert({
      user_id: user.id, project_id: projectId,
      revenue_usd: input.revenue_usd, dollar_rate: input.dollar_rate,
      revenue_brl: revenueBrl, results_count: input.results_count,
      total_spent: input.total_spent, revenue_per_result: revenuePerResult,
      cpa, cpa_ideal: cpaIdeal, roi, status,
      observation: input.observation, source: input.source,
      impressions: input.impressions, cpm: input.cpm, revenue_gam: input.revenue_gam,
    }).select().single();

    if (newSim && !error) {
      setSimulations(prev => [mapRow(newSim), ...prev]);
    }
    return { revenueBrl, revenuePerResult, cpa, cpaIdeal, roi, status };
  };

  const deleteSimulation = async (id: string) => {
    await supabase.from('simulations').delete().eq('id', id);
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  return { simulations, loading, addSimulation, deleteSimulation };
}
