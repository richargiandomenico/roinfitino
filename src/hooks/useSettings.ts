import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useDollarRate } from './useDollarRate';

export interface Settings {
  dollar_rate: number;
  euro_rate: number;
  use_auto_dollar: boolean;
  meta_fee: number;
  adx_fee: number;
  tax_rate: number;
}

const DEFAULTS: Settings = {
  dollar_rate: 5.50,
  euro_rate: 6.10,
  use_auto_dollar: true,
  meta_fee: 0,
  adx_fee: 10,
  tax_rate: 3.5,
};

export function useSettings() {
  const { user } = useAuth();
  const { rate: autoRate, euroRate: autoEuroRate, loading: rateLoading } = useDollarRate();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('settings').select('*').eq('user_id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setSettings({
            dollar_rate: Number(data.dollar_rate),
            euro_rate: Number(data.euro_rate ?? 6.10),
            use_auto_dollar: data.use_auto_dollar ?? true,
            meta_fee: Number(data.meta_fee),
            adx_fee: Number(data.adx_fee),
            tax_rate: Number(data.tax_rate),
          });
        }
        setLoading(false);
      });
  }, [user]);

  const effectiveDollar = settings.use_auto_dollar ? autoRate : settings.dollar_rate;

  const saveSettings = useCallback(async (newSettings: Settings) => {
    if (!user) return;
    setSettings(newSettings);
    const { error } = await supabase.from('settings').upsert({
      user_id: user.id,
      ...newSettings,
    }, { onConflict: 'user_id' });
    if (error) console.error('Error saving settings:', error);
  }, [user]);

  return { settings, effectiveDollar, autoRate, loading: loading || rateLoading, saveSettings };
}
