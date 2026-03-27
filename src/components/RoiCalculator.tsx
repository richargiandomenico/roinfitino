import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Trash2, TrendingUp, TrendingDown, AlertTriangle, Search, Filter } from 'lucide-react';
import type { Simulation, SimulationInput } from '@/hooks/useSimulations';

interface Props {
  effectiveDollar: number;
  simulations: Simulation[];
  onAdd: (data: SimulationInput) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const SOURCES = [
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'tiktok_ads', label: 'TikTok Ads' },
  { value: 'taboola', label: 'Taboola' },
  { value: 'outbrain', label: 'Outbrain' },
  { value: 'other', label: 'Outro' },
];

const statusIcon = (status: string) => {
  if (status === 'profit') return <TrendingUp className="w-4 h-4 text-profit" />;
  if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-warning" />;
  return <TrendingDown className="w-4 h-4 text-loss" />;
};

const statusBg = (status: string) => {
  if (status === 'profit') return 'bg-profit-bg';
  if (status === 'warning') return 'bg-warning-bg';
  return 'bg-loss-bg';
};

const statusLabel = (status: string) => {
  if (status === 'profit') return 'ROI Excelente';
  if (status === 'warning') return 'ROI Moderado';
  return 'ROI Negativo';
};

export function RoiCalculator({ effectiveDollar, simulations, onAdd, onDelete }: Props) {
  const [revenueUsd, setRevenueUsd] = useState('');
  const [results, setResults] = useState('');
  const [spent, setSpent] = useState('');
  const [observation, setObservation] = useState('');
  const [source, setSource] = useState('meta_ads');
  const [impressions, setImpressions] = useState('');
  const [cpm, setCpm] = useState('');
  const [revenueGam, setRevenueGam] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  // Filtros do histórico
  const [filterUtm, setFilterUtm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  const handleCalc = async () => {
    const rusd = parseFloat(revenueUsd);
    const rc = parseInt(results);
    const ts = parseFloat(spent);
    if (isNaN(rusd) || isNaN(rc) || isNaN(ts) || rc === 0) return;
    const result = await onAdd({
      revenue_usd: rusd, dollar_rate: effectiveDollar, results_count: rc, total_spent: ts,
      observation, source,
      impressions: parseInt(impressions) || 0,
      cpm: parseFloat(cpm) || 0,
      revenue_gam: parseFloat(revenueGam) || 0,
    });
    setLastResult(result);
    setRevenueUsd(''); setResults(''); setSpent('');
    setObservation(''); setImpressions(''); setCpm(''); setRevenueGam('');
  };

  // Filtrar simulações
  const filtered = simulations.filter(sim => {
    if (filterSource !== 'all' && sim.source !== filterSource) return false;
    if (filterUtm && !sim.observation.toLowerCase().includes(filterUtm.toLowerCase())) return false;
    return true;
  });

  // Relatório geral (usa filtradas)
  const totalSims = filtered.length;
  const avgRoi = totalSims > 0 ? filtered.reduce((s, sim) => s + sim.roi, 0) / totalSims : 0;
  const avgCpa = totalSims > 0 ? filtered.reduce((s, sim) => s + sim.cpa, 0) / totalSims : 0;
  const avgRevPerResult = totalSims > 0 ? filtered.reduce((s, sim) => s + sim.revenue_per_result, 0) / totalSims : 0;
  const totalSpent = filtered.reduce((s, sim) => s + sim.total_spent, 0);
  const totalRevenue = filtered.reduce((s, sim) => s + sim.revenue_brl, 0);
  const totalRevenueGam = filtered.reduce((s, sim) => s + sim.revenue_gam, 0);
  const profitCount = filtered.filter(s => s.status === 'profit').length;
  const warningCount = filtered.filter(s => s.status === 'warning').length;
  const lossCount = filtered.filter(s => s.status === 'loss').length;

  return (
    <div className="space-y-6">
      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculadora de ROI por UTM
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Linha 1: Fonte + UTM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Fonte / Plataforma</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Observação / UTM</Label>
              <Input placeholder="Ex: utm_source=facebook&utm_campaign=teste01" value={observation} onChange={e => setObservation(e.target.value)} />
            </div>
          </div>

          {/* Linha 2: Receita, Resultados, Gasto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Receita total (US$)</Label>
              <Input type="number" step="0.01" placeholder="Ex: 11.23" value={revenueUsd} onChange={e => setRevenueUsd(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Resultados (registros)</Label>
              <Input type="number" placeholder="Ex: 294" value={results} onChange={e => setResults(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Gasto total (R$)</Label>
              <Input type="number" step="0.01" placeholder="Ex: 43.21" value={spent} onChange={e => setSpent(e.target.value)} />
            </div>
          </div>

          {/* Linha 3: Dados GAM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">📊 Impressões (GAM)</Label>
              <Input type="number" placeholder="Ex: 15000" value={impressions} onChange={e => setImpressions(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">📊 CPM (GAM) US$</Label>
              <Input type="number" step="0.01" placeholder="Ex: 2.50" value={cpm} onChange={e => setCpm(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">📊 Receita GAM (US$)</Label>
              <Input type="number" step="0.01" placeholder="Ex: 37.50" value={revenueGam} onChange={e => setRevenueGam(e.target.value)} />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Cotação: <span className="font-mono text-profit">R$ {effectiveDollar.toFixed(4)}</span>
          </p>
          <Button onClick={handleCalc} className="w-full">
            <Calculator className="w-4 h-4 mr-2" /> Calcular ROI
          </Button>

          {/* Resultado */}
          {lastResult && (
            <div className={`mt-4 p-4 rounded-lg ${statusBg(lastResult.status)} animate-fade-in`}>
              <div className="flex items-center gap-2 mb-2">
                {statusIcon(lastResult.status)}
                <span className="font-semibold">{statusLabel(lastResult.status)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p>💵 Receita: <span className="font-mono font-semibold">R$ {lastResult.revenueBrl.toFixed(2)}</span></p>
                <p>💰 Receita/resultado: <span className="font-mono font-semibold">R$ {lastResult.revenuePerResult.toFixed(2)}</span></p>
                <p>💸 CPA: <span className="font-mono font-semibold">R$ {lastResult.cpa.toFixed(2)}</span></p>
                <p>🎯 CPA ideal (100%): <span className="font-mono font-semibold">R$ {lastResult.cpaIdeal.toFixed(2)}</span></p>
                <p>⚖️ CPA p/ empatar: <span className="font-mono font-semibold">R$ {lastResult.revenuePerResult.toFixed(2)}</span></p>
                <p className="col-span-2">📊 ROI: <span className="font-mono font-bold text-lg">{lastResult.roi.toFixed(2)}%</span></p>
              </div>
              {lastResult.status === 'loss' && (
                <div className="mt-3 p-3 rounded border border-loss/30 bg-loss/5 text-sm space-y-1">
                  <p className="font-semibold text-loss">💡 Sugestões para melhorar:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Reduza o CPA: seu CPA atual (R$ {lastResult.cpa.toFixed(2)}) precisa cair para no máximo <span className="font-mono font-semibold text-foreground">R$ {lastResult.revenuePerResult.toFixed(2)}</span> para empatar.</li>
                    <li>Otimize criativos e segmentação para aumentar a taxa de conversão.</li>
                    <li>Teste novos públicos ou reduza o lance para diminuir o custo por resultado.</li>
                    <li>Considere pausar campanhas com ROI muito negativo e realocar o orçamento.</li>
                    <li>Aumente a receita por resultado: revise o layout e CTA das páginas de monetização.</li>
                  </ul>
                </div>
              )}
              {lastResult.status === 'warning' && (
                <div className="mt-3 p-3 rounded border border-warning/30 bg-warning/5 text-sm space-y-1">
                  <p className="font-semibold text-warning">⚠️ Atenção:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>ROI abaixo de 100%. CPA ideal: <span className="font-mono font-semibold text-foreground">R$ {lastResult.cpaIdeal.toFixed(2)}</span>.</li>
                    <li>Pequenas otimizações de segmentação podem dobrar seu retorno.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatório Geral */}
      {totalSims > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Relatório Geral {filterUtm || filterSource !== 'all' ? '(filtrado)' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Total simulações</p>
                <p className="font-mono font-bold text-lg">{totalSims}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Média ROI</p>
                <p className="font-mono font-bold text-lg">{avgRoi.toFixed(2)}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Média CPA</p>
                <p className="font-mono font-bold text-lg">R$ {avgCpa.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Média Receita/Resultado</p>
                <p className="font-mono font-bold text-lg">R$ {avgRevPerResult.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Total Gasto</p>
                <p className="font-mono font-bold text-lg">R$ {totalSpent.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground text-xs">Total Receita</p>
                <p className="font-mono font-bold text-lg">R$ {totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            {totalRevenueGam > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-muted inline-block">
                <p className="text-muted-foreground text-xs">Receita GAM Total</p>
                <p className="font-mono font-bold text-lg">US$ {totalRevenueGam.toFixed(2)}</p>
              </div>
            )}
            <div className="flex gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-profit" /> Excelente: {profitCount}</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" /> Moderado: {warningCount}</span>
              <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-loss" /> Negativo: {lossCount}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            📜 Histórico de Simulações
          </CardTitle>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar por UTM / observação..."
                value={filterUtm}
                onChange={e => setFilterUtm(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterSource} onValueChange={setFilterSource}>
                <SelectTrigger className="h-8 w-[150px] text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas fontes</SelectItem>
                  {SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {simulations.length === 0 ? 'Nenhuma simulação registrada ainda.' : 'Nenhuma simulação encontrada com esses filtros.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>UTM / Obs</TableHead>
                    <TableHead>Receita (R$)</TableHead>
                    <TableHead>Gasto (R$)</TableHead>
                    <TableHead>Resultados</TableHead>
                    <TableHead>Receita/Resultado</TableHead>
                    <TableHead>CPA</TableHead>
                    <TableHead>CPA Ideal</TableHead>
                    <TableHead>CPA Empate</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>GAM (US$)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(sim => (
                    <TableRow key={sim.id} className={statusBg(sim.status)}>
                      <TableCell className="font-mono text-xs">{new Date(sim.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-xs">{SOURCES.find(s => s.value === sim.source)?.label || sim.source}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate" title={sim.observation}>{sim.observation || '—'}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_brl.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.total_spent.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{sim.results_count}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_per_result.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.cpa.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.cpa_ideal.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_per_result.toFixed(2)}</TableCell>
                      <TableCell className="font-mono font-bold">{sim.roi.toFixed(2)}%</TableCell>
                      <TableCell className="font-mono">{sim.revenue_gam > 0 ? `$${sim.revenue_gam.toFixed(2)}` : '—'}</TableCell>
                      <TableCell className="whitespace-nowrap">{statusIcon(sim.status)} {statusLabel(sim.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(sim.id)} className="text-loss hover:text-loss">
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
