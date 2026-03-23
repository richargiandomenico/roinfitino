import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FunnelRecord {
  id: string;
  visits_p1: number;
  p2: number;
  p3: number;
  conv_p1_p2: number;
  conv_p1_p3: number;
  conv_p2_p3: number;
  drop_p1_p2: number;
  drop_p1_p3: number;
  observation: string | null;
  created_at: string;
}

export function useFunnelRecords(projectId: string | null) {
  const { user } = useAuth();
  const [records, setRecords] = useState<FunnelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user || !projectId) { setRecords([]); setLoading(false); return; }
    const { data } = await supabase.from('funnel_records').select('*')
      .eq('user_id', user.id).eq('project_id', projectId)
      .order('created_at', { ascending: false });
    if (data) setRecords(data.map(d => ({
      ...d,
      conv_p1_p2: Number(d.conv_p1_p2),
      conv_p1_p3: Number(d.conv_p1_p3),
      conv_p2_p3: Number(d.conv_p2_p3),
      drop_p1_p2: Number(d.drop_p1_p2),
      drop_p1_p3: Number(d.drop_p1_p3),
    })));
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const addRecord = async (data: { visits_p1: number; p2: number; p3: number; observation?: string }) => {
    if (!user || !projectId) return;
    const conv12 = data.visits_p1 > 0 ? data.p2 / data.visits_p1 : 0;
    const conv13 = data.visits_p1 > 0 ? data.p3 / data.visits_p1 : 0;
    const conv23 = data.p2 > 0 ? data.p3 / data.p2 : 0;

    const { data: newRec, error } = await supabase.from('funnel_records').insert({
      user_id: user.id, project_id: projectId,
      visits_p1: data.visits_p1, p2: data.p2, p3: data.p3,
      conv_p1_p2: conv12, conv_p1_p3: conv13, conv_p2_p3: conv23,
      drop_p1_p2: 1 - conv12, drop_p1_p3: 1 - conv13,
      observation: data.observation || null,
    }).select().single();

    if (newRec && !error) {
      setRecords(prev => [{
        ...newRec,
        conv_p1_p2: Number(newRec.conv_p1_p2),
        conv_p1_p3: Number(newRec.conv_p1_p3),
        conv_p2_p3: Number(newRec.conv_p2_p3),
        drop_p1_p2: Number(newRec.drop_p1_p2),
        drop_p1_p3: Number(newRec.drop_p1_p3),
      }, ...prev]);
    }
  };

  const deleteRecord = async (id: string) => {
    await supabase.from('funnel_records').delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  return { records, loading, addRecord, deleteRecord };
}
