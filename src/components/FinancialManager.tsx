import { useState, useMemo } from 'react';
import { useFinancialRecords, FinancialInput, MonthlySummary } from '@/hooks/useFinancialRecords';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Props {
  projectId: string;
  projectName: string;
}

const CATEGORIES = [
  { value: 'trafego', label: 'Tráfego Pago' },
  { value: 'ferramentas', label: 'Ferramentas' },
  { value: 'outros', label: 'Outros Custos' },
];

const MONTHS_PT: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro',
};

function brl(v: number) { return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function pct(v: number) { return `${v.toFixed(2)}%`; }
function roiColor(v: number) { return v >= 50 ? 'text-profit' : v >= 0 ? 'text-warning' : 'text-loss'; }
function roiBg(v: number) { return v >= 50 ? 'bg-profit/10 border-profit/30' : v >= 0 ? 'bg-warning/10 border-warning/30' : 'bg-loss/10 border-loss/30'; }

export function FinancialManager({ projectId, projectName }: Props) {
  const { settings } = useSettings();
  const { records, loading, addRecord, deleteRecord, getMonthlySummaries } = useFinancialRecords(projectId);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [investment, setInvestment] = useState('');
  const [revenue, setRevenue] = useState('');
  const [otherCosts, setOtherCosts] = useState('');
  const [observation, setObservation] = useState('');
  const [category, setCategory] = useState('trafego');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const monthlySummaries = useMemo(() => getMonthlySummaries(), [getMonthlySummaries]);
  const availableMonths = useMemo(() => monthlySummaries.map(s => s.month), [monthlySummaries]);

  const filteredRecords = useMemo(() => {
    if (!selectedMonth) return records;
    return records.filter(r => r.record_date.startsWith(selectedMonth));
  }, [records, selectedMonth]);

  const todaySummary = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecs = records.filter(r => r.record_date === today);
    if (todayRecs.length === 0) return null;
    return {
      investment: todayRecs.reduce((s, r) => s + r.investment, 0),
      revenue: todayRecs.reduce((s, r) => s + r.revenue_brl, 0),
      netProfit: todayRecs.reduce((s, r) => s + r.net_profit, 0),
      roi: todayRecs.reduce((s, r) => s + r.investment, 0) > 0
        ? (todayRecs.reduce((s, r) => s + r.net_profit, 0) / todayRecs.reduce((s, r) => s + r.investment, 0)) * 100
        : 0,
    };
  }, [records]);

  const handleAdd = async () => {
    const inv = parseFloat(investment);
    const rev = parseFloat(revenue);
    if (isNaN(inv) || isNaN(rev)) return;
    await addRecord({
      record_date: date,
      investment: inv,
      revenue_brl: rev,
      adx_fee_pct: settings.adx_fee,
      tax_pct: settings.tax_rate,
      other_costs: parseFloat(otherCosts) || 0,
      observation,
      category,
    });
    setInvestment(''); setRevenue(''); setOtherCosts(''); setObservation('');
  };

  if (loading) return <div className="text-center py-10 text-muted-foreground">Carregando financeiro...</div>;

  return (
    <div className="space-y-6">
      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hoje - Investimento</p>
            <p className="text-lg font-bold font-mono">{todaySummary ? brl(todaySummary.investment) : '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hoje - Receita</p>
            <p className="text-lg font-bold font-mono">{todaySummary ? brl(todaySummary.revenue) : '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hoje - Lucro</p>
            <p className={`text-lg font-bold font-mono ${todaySummary ? roiColor(todaySummary.roi) : ''}`}>
              {todaySummary ? brl(todaySummary.netProfit) : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Hoje - ROI</p>
            <p className={`text-lg font-bold font-mono ${todaySummary ? roiColor(todaySummary.roi) : ''}`}>
              {todaySummary ? pct(todaySummary.roi) : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Form */}
      <Card className="border-border/50">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-4 h-4" /> Novo Registro Financeiro</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Data</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Investimento (R$)</label>
              <Input type="number" placeholder="0,00" value={investment} onChange={e => setInvestment(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Receita Bruta (R$)</label>
              <Input type="number" placeholder="0,00" value={revenue} onChange={e => setRevenue(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Outros Custos (R$)</label>
              <Input type="number" placeholder="0,00" value={otherCosts} onChange={e => setOtherCosts(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Categoria</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Observação</label>
              <Input placeholder="ex: Campanha X, Teste Y..." value={observation} onChange={e => setObservation(e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Taxa ADX: <strong>{settings.adx_fee}%</strong></span>
            <span>Imposto: <strong>{settings.tax_rate}%</strong></span>
            <span className="text-muted-foreground/60">(ajuste em Configurações)</span>
          </div>
          <Button onClick={handleAdd} className="w-full">Registrar</Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="daily" className="animate-fade-in">
        <TabsList className="w-full grid grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Dia a Dia</TabsTrigger>
          <TabsTrigger value="monthly" className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Fechamento Mensal</TabsTrigger>
        </TabsList>

        {/* Daily */}
        <TabsContent value="daily" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedMonth || 'all'} onValueChange={v => setSelectedMonth(v === 'all' ? null : v)}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filtrar mês" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os meses</SelectItem>
                {availableMonths.map(m => (
                  <SelectItem key={m} value={m}>{MONTHS_PT[m.split('-')[1]]} {m.split('-')[0]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{filteredRecords.length} registros</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border/50">
            <table className="w-full text-xs">
              <thead className="bg-muted/30">
                <tr>
                  <th className="px-3 py-2 text-left">Data</th>
                  <th className="px-3 py-2 text-right">Investimento</th>
                  <th className="px-3 py-2 text-right">Receita</th>
                  <th className="px-3 py-2 text-right">ADX</th>
                  <th className="px-3 py-2 text-right">Imposto</th>
                  <th className="px-3 py-2 text-right">Ret. Líquido</th>
                  <th className="px-3 py-2 text-right">ROI</th>
                  <th className="px-3 py-2 text-left">Obs</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.id} className={`border-t border-border/30 ${roiBg(r.roi)}`}>
                    <td className="px-3 py-2 font-mono">{new Date(r.record_date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                    <td className="px-3 py-2 text-right font-mono">{brl(r.investment)}</td>
                    <td className="px-3 py-2 text-right font-mono">{brl(r.revenue_brl)}</td>
                    <td className="px-3 py-2 text-right font-mono">{brl(r.adx_fee)}</td>
                    <td className="px-3 py-2 text-right font-mono">{brl(r.tax_amount)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-semibold ${roiColor(r.roi)}`}>{brl(r.net_profit)}</td>
                    <td className={`px-3 py-2 text-right font-mono font-bold ${roiColor(r.roi)}`}>
                      {r.roi >= 0 ? <ArrowUpRight className="inline w-3 h-3" /> : <ArrowDownRight className="inline w-3 h-3" />}
                      {pct(r.roi)}
                    </td>
                    <td className="px-3 py-2 max-w-[150px] truncate">{r.observation}</td>
                    <td className="px-3 py-2">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteRecord(r.id)}>
                        <Trash2 className="w-3 h-3 text-loss" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr><td colSpan={9} className="px-3 py-8 text-center text-muted-foreground">Nenhum registro encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Monthly */}
        <TabsContent value="monthly" className="mt-4 space-y-4">
          {monthlySummaries.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">Nenhum dado para exibir</p>
          ) : monthlySummaries.map(s => (
            <Card key={s.month} className={`border ${roiBg(s.roi)}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {s.roi >= 0 ? <TrendingUp className="w-4 h-4 text-profit" /> : <TrendingDown className="w-4 h-4 text-loss" />}
                    {MONTHS_PT[s.month.split('-')[1]]} {s.month.split('-')[0]}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.days} dias registrados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Investimento</p>
                    <p className="font-mono font-semibold">{brl(s.totalInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Receita Bruta</p>
                    <p className="font-mono font-semibold">{brl(s.totalRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Taxas ADX</p>
                    <p className="font-mono">{brl(s.totalAdxFee)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Líquido ADX</p>
                    <p className="font-mono">{brl(s.totalNetRevenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Impostos</p>
                    <p className="font-mono">{brl(s.totalTax)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Outros Custos</p>
                    <p className="font-mono">{brl(s.totalOtherCosts)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Lucro Líquido</p>
                    <p className={`font-mono font-bold text-lg ${roiColor(s.roi)}`}>{brl(s.totalNetProfit)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">ROI</p>
                    <p className={`font-mono font-bold text-lg ${roiColor(s.roi)}`}>{pct(s.roi)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
