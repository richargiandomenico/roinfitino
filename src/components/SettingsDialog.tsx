import { useState } from 'react';
import { useSettings, type Settings } from '@/hooks/useSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, DollarSign, Percent } from 'lucide-react';

interface Props {
  settings: Settings;
  effectiveDollar: number;
  autoRate: number;
  onSave: (s: Settings) => Promise<void>;
}

export function SettingsDialog({ settings, effectiveDollar, autoRate, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState(settings);

  const handleOpen = (o: boolean) => {
    if (o) setLocal(settings);
    setOpen(o);
  };

  const handleSave = async () => {
    await onSave(local);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <SettingsIcon className="w-4 h-4 mr-2" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Configurações
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          <div className="p-3 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-3">
              <Label className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-profit" />
                Dólar automático (real do dia)
              </Label>
              <Switch
                checked={local.use_auto_dollar}
                onCheckedChange={v => setLocal({ ...local, use_auto_dollar: v })}
              />
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              Cotação atual: R$ {autoRate.toFixed(4)}
            </p>
            {!local.use_auto_dollar && (
              <div>
                <Label className="text-xs">Dólar manual (R$)</Label>
                <Input
                  type="number" step="0.01" value={local.dollar_rate}
                  onChange={e => setLocal({ ...local, dollar_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            )}
            <p className="text-xs mt-2 font-medium">
              Usando: <span className="text-profit font-mono">R$ {effectiveDollar.toFixed(4)}</span>
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Percent className="w-4 h-4" /> Taxas e Impostos
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Taxa Meta (%)</Label>
                <Input
                  type="number" step="0.1" value={local.meta_fee}
                  onChange={e => setLocal({ ...local, meta_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">Taxa ADX (%)</Label>
                <Input
                  type="number" step="0.1" value={local.adx_fee}
                  onChange={e => setLocal({ ...local, adx_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-xs">Imposto (%)</Label>
                <Input
                  type="number" step="0.1" value={local.tax_rate}
                  onChange={e => setLocal({ ...local, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">Salvar configurações</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
