import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Trash2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import type { Simulation } from '@/hooks/useSimulations';

interface Props {
  effectiveDollar: number;
  simulations: Simulation[];
  onAdd: (data: { revenue_usd: number; dollar_rate: number; results_count: number; total_spent: number }) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

export function RoiCalculator({ effectiveDollar, simulations, onAdd, onDelete }: Props) {
  const [revenueUsd, setRevenueUsd] = useState('');
  const [results, setResults] = useState('');
  const [spent, setSpent] = useState('');
  const [lastResult, setLastResult] = useState<any>(null);

  const handleCalc = async () => {
    const rusd = parseFloat(revenueUsd);
    const rc = parseInt(results);
    const ts = parseFloat(spent);
    if (isNaN(rusd) || isNaN(rc) || isNaN(ts) || rc === 0) return;
    const result = await onAdd({ revenue_usd: rusd, dollar_rate: effectiveDollar, results_count: rc, total_spent: ts });
    setLastResult(result);
    setRevenueUsd(''); setResults(''); setSpent('');
  };

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

  // Relatório geral
  const totalSims = simulations.length;
  const avgRoi = totalSims > 0 ? simulations.reduce((s, sim) => s + sim.roi, 0) / totalSims : 0;
  const avgCpa = totalSims > 0 ? simulations.reduce((s, sim) => s + sim.cpa, 0) / totalSims : 0;
  const avgRevPerResult = totalSims > 0 ? simulations.reduce((s, sim) => s + sim.revenue_per_result, 0) / totalSims : 0;
  const profitCount = simulations.filter(s => s.status === 'profit').length;
  const warningCount = simulations.filter(s => s.status === 'warning').length;
  const lossCount = simulations.filter(s => s.status === 'loss').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Calculadora de ROI por UTM
          </CardTitle>
        </CardHeader>
        <CardContent>
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
          <p className="text-xs text-muted-foreground mt-2">
            Cotação: <span className="font-mono text-profit">R$ {effectiveDollar.toFixed(4)}</span>
          </p>
          <Button onClick={handleCalc} className="mt-4 w-full">
            <Calculator className="w-4 h-4 mr-2" /> Calcular ROI
          </Button>

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
            <CardTitle className="text-base">📊 Relatório Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
            </div>
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
          <CardTitle className="text-base">📜 Histórico de Simulações</CardTitle>
        </CardHeader>
        <CardContent>
          {simulations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Nenhuma simulação registrada ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Receita (R$)</TableHead>
                    <TableHead>Resultados</TableHead>
                    <TableHead>Receita/Resultado</TableHead>
                    <TableHead>CPA</TableHead>
                    <TableHead>CPA Ideal</TableHead>
                    <TableHead>CPA Empate</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {simulations.map(sim => (
                    <TableRow key={sim.id} className={statusBg(sim.status)}>
                      <TableCell className="font-mono text-xs">{new Date(sim.created_at).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_brl.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">{sim.results_count}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_per_result.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.cpa.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.cpa_ideal.toFixed(2)}</TableCell>
                      <TableCell className="font-mono">R$ {sim.revenue_per_result.toFixed(2)}</TableCell>
                      <TableCell className="font-mono font-bold">{sim.roi.toFixed(2)}%</TableCell>
                      <TableCell>{statusIcon(sim.status)} {statusLabel(sim.status)}</TableCell>
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
