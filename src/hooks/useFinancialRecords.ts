import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface FinancialRecord {
  id: string;
  record_date: string;
  investment: number;
  revenue_brl: number;
  adx_fee: number;
  tax_amount: number;
  other_costs: number;
  net_revenue: number;
  net_profit: number;
  roi: number;
  observation: string;
  category: string;
  created_at: string;
}

export interface FinancialInput {
  record_date: string;
  investment: number;
  revenue_brl: number;
  adx_fee_pct: number;
  tax_pct: number;
  other_costs: number;
  observation: string;
  category: string;
}

export interface MonthlySummary {
  month: string;
  totalInvestment: number;
  totalRevenue: number;
  totalAdxFee: number;
  totalTax: number;
  totalOtherCosts: number;
  totalNetRevenue: number;
  totalNetProfit: number;
  roi: number;
  days: number;
}

function mapRow(d: any): FinancialRecord {
  return {
    id: d.id,
    record_date: d.record_date,
    investment: Number(d.investment),
    revenue_brl: Number(d.revenue_brl),
    adx_fee: Number(d.adx_fee),
    tax_amount: Number(d.tax_amount),
    other_costs: Number(d.other_costs),
    net_revenue: Number(d.net_revenue),
    net_profit: Number(d.net_profit),
    roi: Number(d.roi),
    observation: d.observation || '',
    category: d.category || 'trafego',
    created_at: d.created_at,
  };
}

export function useFinancialRecords(projectId: string | null) {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user || !projectId) { setRecords([]); setLoading(false); return; }
    const { data } = await (supabase.from('financial_records') as any).select('*')
      .eq('user_id', user.id).eq('project_id', projectId)
      .order('record_date', { ascending: false });
    if (data) setRecords(data.map(mapRow));
    setLoading(false);
  }, [user, projectId]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const addRecord = async (input: FinancialInput) => {
    if (!user || !projectId) return;
    const adxFee = input.revenue_brl * (input.adx_fee_pct / 100);
    const netRevenue = input.revenue_brl - adxFee;
    const taxAmount = netRevenue * (input.tax_pct / 100);
    const netProfit = netRevenue - taxAmount - input.other_costs - input.investment;
    const roi = input.investment > 0 ? (netProfit / input.investment) * 100 : 0;

    const { data: newRec, error } = await (supabase.from('financial_records') as any).insert({
      user_id: user.id,
      project_id: projectId,
      record_date: input.record_date,
      investment: input.investment,
      revenue_brl: input.revenue_brl,
      adx_fee: adxFee,
      tax_amount: taxAmount,
      other_costs: input.other_costs,
      net_revenue: netRevenue,
      net_profit: netProfit,
      roi,
      observation: input.observation,
      category: input.category,
    }).select().single();

    if (newRec && !error) {
      setRecords(prev => [mapRow(newRec), ...prev]);
    }
    return { netRevenue, netProfit, roi };
  };

  const updateRecord = async (id: string, input: FinancialInput) => {
    if (!user) return;
    const adxFee = input.revenue_brl * (input.adx_fee_pct / 100);
    const netRevenue = input.revenue_brl - adxFee;
    const taxAmount = netRevenue * (input.tax_pct / 100);
    const netProfit = netRevenue - taxAmount - input.other_costs - input.investment;
    const roi = input.investment > 0 ? (netProfit / input.investment) * 100 : 0;

    const { data: updated, error } = await (supabase.from('financial_records') as any).update({
      record_date: input.record_date,
      investment: input.investment,
      revenue_brl: input.revenue_brl,
      adx_fee: adxFee,
      tax_amount: taxAmount,
      other_costs: input.other_costs,
      net_revenue: netRevenue,
      net_profit: netProfit,
      roi,
      observation: input.observation,
      category: input.category,
    }).eq('id', id).select().single();

    if (updated && !error) {
      setRecords(prev => prev.map(r => r.id === id ? mapRow(updated) : r));
    }
  };

  const deleteRecord = async (id: string) => {
    await (supabase.from('financial_records') as any).delete().eq('id', id);
    setRecords(prev => prev.filter(r => r.id !== id));
  };
  const getMonthlySummaries = useCallback((): MonthlySummary[] => {
    const byMonth: Record<string, FinancialRecord[]> = {};
    records.forEach(r => {
      const m = r.record_date.substring(0, 7); // YYYY-MM
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(r);
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([month, recs]) => {
        const totalInvestment = recs.reduce((s, r) => s + r.investment, 0);
        const totalRevenue = recs.reduce((s, r) => s + r.revenue_brl, 0);
        const totalAdxFee = recs.reduce((s, r) => s + r.adx_fee, 0);
        const totalTax = recs.reduce((s, r) => s + r.tax_amount, 0);
        const totalOtherCosts = recs.reduce((s, r) => s + r.other_costs, 0);
        const totalNetRevenue = recs.reduce((s, r) => s + r.net_revenue, 0);
        const totalNetProfit = recs.reduce((s, r) => s + r.net_profit, 0);
        const roi = totalInvestment > 0 ? (totalNetProfit / totalInvestment) * 100 : 0;
        return { month, totalInvestment, totalRevenue, totalAdxFee, totalTax, totalOtherCosts, totalNetRevenue, totalNetProfit, roi, days: recs.length };
      });
  }, [records]);

  return { records, loading, addRecord, deleteRecord, getMonthlySummaries };
}
