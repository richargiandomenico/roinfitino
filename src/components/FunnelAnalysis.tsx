import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Navigation, ArrowDown, ArrowUp } from 'lucide-react';
import type { FunnelRecord } from '@/hooks/useFunnelRecords';

interface Props {
  records: FunnelRecord[];
  onAdd: (data: { visits_p1: number; p2: number; p3: number; observation?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function pct(n: number) {
  return (n * 100).toFixed(2) + '%';
}

function convColor(rate: number) {
  if (rate >= 0.5) return 'text-profit font-bold';
  if (rate >= 0.3) return 'text-warning font-semibold';
  return 'text-loss font-semibold';
}

function rowBg(conv13: number) {
  if (conv13 >= 0.3) return 'bg-profit-bg';
  if (conv13 >= 0.15) return 'bg-warning-bg';
  return 'bg-loss-bg';
}

export function FunnelAnalysis({ records, onAdd, onDelete }: Props) {
  const [visits, setVisits] = useState('');
  const [p2, setP2] = useState('');
  const [p3, setP3] = useState('');
  const [obs, setObs] = useState('');

  const handleAdd = async () => {
    const v = parseInt(visits);
    const p2v = parseInt(p2);
    const p3v = parseInt(p3);
    if (isNaN(v) || v <= 0 || isNaN(p2v) || isNaN(p3v)) return;
    await onAdd({ visits_p1: v, p2: p2v, p3: p3v, observation: obs || undefined });
    setVisits(''); setP2(''); setP3(''); setObs('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-primary" />
            🧭 Análise de Tráfego do Funil (Visitas → P2/P3)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Visitas (P1)</Label>
              <Input type="number" placeholder="Ex: 1000" value={visits} onChange={e => setVisits(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Foram para P2</Label>
              <Input type="number" placeholder="Ex: 420" value={p2} onChange={e => setP2(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Foram para P3</Label>
              <Input type="number" placeholder="Ex: 180" value={p3} onChange={e => setP3(e.target.value)} />
            </div>
          </div>
          <div className="mt-3">
            <Label className="text-xs">Observação (opcional)</Label>
            <Input placeholder="Ex: Broad ESP / Criativo 3 / Domínio X" value={obs} onChange={e => setObs(e.target.value)} />
          </div>
          <Button onClick={handleAdd} className="mt-4 w-full">
            Registrar Funil
          </Button>

          <div className="flex gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
            <span className="px-2 py-1 rounded-full bg-muted"><strong>% P1→P2</strong> = P2 / Visitas</span>
            <span className="px-2 py-1 rounded-full bg-muted"><strong>% P1→P3</strong> = P3 / Visitas</span>
            <span className="px-2 py-1 rounded-full bg-muted"><strong>% P2→P3</strong> = P3 / P2</span>
            <span className="px-2 py-1 rounded-full bg-muted"><strong>Drop</strong> = 100% - Conversão</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">📌 Histórico do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhum registro de funil ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Visitas (P1)</TableHead>
                    <TableHead>P2</TableHead>
                    <TableHead>P3</TableHead>
                    <TableHead>% P1→P2</TableHead>
                    <TableHead>% P1→P3</TableHead>
                    <TableHead>% P2→P3</TableHead>
                    <TableHead>Drop P1→P2</TableHead>
                    <TableHead>Drop P1→P3</TableHead>
                    <TableHead>Obs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(rec => (
                    <TableRow key={rec.id} className={rowBg(rec.conv_p1_p3)}>
                      <TableCell className="font-mono text-xs">{new Date(rec.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-mono">{rec.visits_p1}</TableCell>
                      <TableCell className="font-mono">{rec.p2}</TableCell>
                      <TableCell className="font-mono">{rec.p3}</TableCell>
                      <TableCell className={`font-mono ${convColor(rec.conv_p1_p2)}`}>
                        {pct(rec.conv_p1_p2)}
                      </TableCell>
                      <TableCell className={`font-mono ${convColor(rec.conv_p1_p3)}`}>
                        {pct(rec.conv_p1_p3)}
                      </TableCell>
                      <TableCell className={`font-mono ${convColor(rec.conv_p2_p3)}`}>
                        {rec.p2 > 0 ? pct(rec.conv_p2_p3) : '-'}
                      </TableCell>
                      <TableCell className="font-mono flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-loss" />
                        {pct(rec.drop_p1_p2)}
                      </TableCell>
                      <TableCell className="font-mono">
                        {pct(rec.drop_p1_p3)}
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">{rec.observation || '-'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(rec.id)} className="text-loss hover:text-loss">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
