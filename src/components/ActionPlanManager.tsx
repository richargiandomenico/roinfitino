import { useState, useCallback, useMemo } from 'react';
import { ActionPlan, useActionPlans } from '@/hooks/useActionPlans';
import { AiAssistantDialog } from './AiAssistantDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, CheckSquare, Bot, Calendar, Target, FileText } from 'lucide-react';

const phaseTemplates = [
  {
    icon: '01', title: 'Pesquisa de termos e mapa de intenção',
    subtitle: 'Levantar termos com intenção real de busca e boa possibilidade de clique',
    chips: ['alto eCPM potencial', 'baixa concorrência', 'dor real', 'intenção informacional'],
    checklist: [
      'Levantar 40 a 80 termos ligados a dúvidas reais sobre o tema.',
      'Separar termos por intenção: dúvida, passo a passo, documentos, localização, urgência.',
      'Definir 1 artigo pilar e pelo menos 12 artigos de apoio.',
      'Escolher títulos simples, diretos e com promessa clara.',
      'Marcar termos para tráfego pago vs orgânico/SEO.'
    ],
    kpis: [['Meta', '80 termos mapeados'], ['Saída mínima', '1 cluster pronto'], ['Risco', 'termo amplo demais']],
  },
  {
    icon: '02', title: 'Arquitetura editorial e navegação por botões',
    subtitle: 'Criar o caminho de leitura para aumentar páginas por sessão e CTR interna',
    chips: ['artigo pilar', 'conteúdos de apoio', 'botões estratégicos', 'tempo na página'],
    checklist: [
      'Definir o artigo pilar principal e conectá-lo com conteúdos de apoio.',
      'Planejar blocos de botões internos com textos de alta curiosidade.',
      'Criar ordem lógica de leitura: o que é, quem pode usar, como, documentos, dúvidas.',
      'Separar artigos por topo, meio e fundo de funil.',
      'Definir CTA principal e secundário para cada página.'
    ],
    kpis: [['Meta', '12 links internos'], ['Saída mínima', '1 hub editorial'], ['Risco', 'links sem contexto']],
  },
  {
    icon: '03', title: 'Produção dos conteúdos',
    subtitle: 'Produzir artigos com foco em clareza e leitura rápida',
    chips: ['SEO básico', 'escaneável', 'CTA no ponto certo', 'resposta direta'],
    checklist: [
      'Escrever o artigo pilar com linguagem simples e blocos curtos.',
      'Produzir pelo menos 3 a 5 artigos de apoio na primeira leva.',
      'Adicionar caixas de destaque com respostas rápidas.',
      'Colocar botões internos em posições estratégicas.',
      'Revisar títulos, intertítulos e introduções para retenção.'
    ],
    kpis: [['Meta', '1 pilar + 5 apoios'], ['Saída mínima', '4 artigos publicados'], ['Risco', 'texto enrolado']],
  },
  {
    icon: '04', title: 'Medição diária com Analytics e monetização',
    subtitle: 'Criar rotina curta de leitura de dados para decisão rápida',
    chips: ['GA4', 'CTR interna', 'engajamento', 'RPM por URL'],
    checklist: [
      'Definir métricas diárias: usuários, sessão, tempo médio, páginas/sessão, CTR, RPM.',
      'Separar 10-15 min/dia para olhar o essencial.',
      'Regra: CTR cai → botões; tempo cai → introdução; RPM cai → intenção do tráfego.',
      'Comparar URLs de melhor e pior desempenho.',
      'Registrar toda mudança feita para avaliar impacto.'
    ],
    kpis: [['Meta', 'rotina diária ativa'], ['Saída mínima', '1 ajuste/dia'], ['Risco', 'analisar sem agir']],
  },
  {
    icon: '05', title: 'Meta Ads e validação de tráfego',
    subtitle: 'Validar ângulos de anúncio, criativos e páginas',
    chips: ['criativo', 'CTR anúncio', 'LP certa', 'UTM organizada'],
    checklist: [
      'Criar 3 a 5 ângulos de anúncio: dúvida, urgência, benefício, descoberta.',
      'Usar UTMs para separar criativo, campanha, público e LP.',
      'Testar 2-3 páginas/URLs com promessa coerente com o anúncio.',
      'Acompanhar CPA, CTR, CPC e qualidade da sessão.',
      'Pausar rápido o que traz clique ruim, escalar sessão boa.'
    ],
    kpis: [['Meta', '3 testes ativos'], ['Saída mínima', '1 criativo validado'], ['Risco', 'tráfego frio → LP fraca']],
  },
  {
    icon: '06', title: 'Orgânico em redes e reaproveitamento',
    subtitle: 'Transformar conteúdo em peças para tráfego recorrente',
    chips: ['Instagram', 'Facebook', 'Pinterest', 'Shorts/Reels'],
    checklist: [
      'Separar artigos em posts: dúvida rápida, passo a passo, alerta, checklist.',
      'Criar calendário de reaproveitamento do pilar.',
      'Usar CTA que leve à URL mais estratégica.',
      'Publicar com consistência, sem estar em todas as redes.',
      'Analisar quais redes entregam visita mais qualificada.'
    ],
    kpis: [['Meta', '1 conteúdo/rede'], ['Saída mínima', '3 posts publicados'], ['Risco', 'produzir sem medir']],
  },
  {
    icon: '07', title: 'Fluxos Manychat e WhatsApp',
    subtitle: 'Captar, aquecer e redirecionar com inteligência',
    chips: ['captura', 'segmentação', 'retorno', 'sequência curta'],
    checklist: [
      'Definir isca: guia rápido, passo a passo, checklist ou resposta objetiva.',
      'Montar sequência curta com CTA para voltar ao conteúdo certo.',
      'Segmentar por interesse: cadastro, atendimento, documentação, urgência.',
      'Usar linguagem curta, clara e com próximo passo objetivo.',
      'Adicionar etiqueta para saber qual conteúdo gerou a conversa.'
    ],
    kpis: [['Meta', '1 fluxo enxuto'], ['Saída mínima', '1 automação publicada'], ['Risco', 'mensagem longa demais']],
  },
  {
    icon: '08', title: 'Otimização, rotina e escala',
    subtitle: 'Ajustes contínuos para transformar o projeto em sistema',
    chips: ['repetição', 'log de ajustes', 'escala', 'menos travas'],
    checklist: [
      'Escolher horário fixo diário para revisão rápida.',
      'Registrar: o que mudou, por que e qual resultado.',
      'Duplicar estrutura vencedora para novos temas.',
      'Revisar semanalmente páginas ruins antes de criar novas.',
      'Regra: melhorar 1 gargalo por vez.'
    ],
    kpis: [['Meta', '1 melhoria/dia'], ['Saída mínima', '1 revisão semanal'], ['Risco', 'acumular sem executar']],
  }
];

function getTimelineTasks(topic: string) {
  return [
    ['Mapa inicial', [`Levantar 20 termos sobre ${topic}`, 'Separar intenção e urgência', 'Escolher artigo pilar']],
    ['Cluster', ['Organizar 12 conteúdos de apoio', 'Planejar botões internos', 'Definir CTA central']],
    ['Produção 1', ['Escrever artigo pilar', 'Criar introdução forte', 'Inserir blocos de botões']],
    ['Produção 2', ['Publicar 2 artigos de apoio', 'Revisar títulos', 'Ajustar links internos']],
    ['Medição', ['Abrir GA4', 'Ver CTR interna', 'Anotar 1 melhoria']],
    ['Tráfego', ['Subir 1 campanha teste', 'Separar UTMs', 'Anotar CPA/CTR']],
    ['Rotina', ['Post orgânico', 'Fluxo Manychat', 'Revisão da semana']]
  ];
}

function addDays(dateStr: string, days: number) {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDateBR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

interface Props {
  projectId: string;
  projectName: string;
  projectNiche: string | null;
}

export function ActionPlanManager({ projectId, projectName, projectNiche }: Props) {
  const { plans, selectedPlan, selectedPlanId, setSelectedPlanId, loading, addPlan, updatePlan, deletePlan } = useActionPlans(projectId);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({
    niche: projectNiche || '', country: 'Brasil', language: 'Português',
    main_topic: '', start_date: new Date().toISOString().split('T')[0],
    sprint_days: 14, goal: '', extra_notes: ''
  });

  const handleCreatePlan = async () => {
    if (!form.main_topic.trim()) return;
    await addPlan(form);
    setShowNewForm(false);
    setForm(prev => ({ ...prev, main_topic: '', goal: '', extra_notes: '' }));
  };

  const toggleCheck = useCallback((planId: string, key: string, states: Record<string, boolean>) => {
    const updated = { ...states, [key]: !states[key] };
    updatePlan(planId, { checklist_states: updated });
  }, [updatePlan]);

  const updateNote = useCallback((planId: string, key: string, value: string, notes: Record<string, string>) => {
    const updated = { ...notes, [key]: value };
    updatePlan(planId, { phase_notes: updated });
  }, [updatePlan]);

  const updatePriority = useCallback((planId: string, key: string, value: string, priorities: Record<string, string>) => {
    const updated = { ...priorities, [key]: value };
    updatePlan(planId, { daily_priorities: updated });
  }, [updatePlan]);

  const progress = useMemo(() => {
    if (!selectedPlan) return { done: 0, total: 0, pct: 0 };
    const total = phaseTemplates.reduce((sum, p) => sum + p.checklist.length, 0);
    const done = Object.values(selectedPlan.checklist_states).filter(Boolean).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [selectedPlan]);

  if (loading) return <div className="text-center py-8 text-muted-foreground animate-pulse">Carregando planos...</div>;

  return (
    <div className="space-y-4">
      {/* Plan selector + create */}
      <div className="flex items-center gap-3 flex-wrap">
        {plans.length > 0 && (
          <Select value={selectedPlanId || ''} onValueChange={setSelectedPlanId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecione um plano" />
            </SelectTrigger>
            <SelectContent>
              {plans.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.main_topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Dialog open={showNewForm} onOpenChange={setShowNewForm}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-4 h-4" /> Novo Plano</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Criar Plano de Ação</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nicho</label>
                  <Input value={form.niche} onChange={e => setForm(p => ({ ...p, niche: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Assunto principal *</label>
                  <Input value={form.main_topic} onChange={e => setForm(p => ({ ...p, main_topic: e.target.value }))} placeholder="Ex: Brasil Sorridente" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">País</label>
                  <Input value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Idioma</label>
                  <Input value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Sprint (dias)</label>
                  <Select value={String(form.sprint_days)} onValueChange={v => setForm(p => ({ ...p, sprint_days: Number(v) }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 dias</SelectItem>
                      <SelectItem value="14">14 dias</SelectItem>
                      <SelectItem value="21">21 dias</SelectItem>
                      <SelectItem value="30">30 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Data inicial</label>
                <Input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Objetivo do projeto</label>
                <Textarea value={form.goal} onChange={e => setForm(p => ({ ...p, goal: e.target.value }))} placeholder="Descreva o objetivo..." rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Observações extras</label>
                <Textarea value={form.extra_notes} onChange={e => setForm(p => ({ ...p, extra_notes: e.target.value }))} placeholder="Notas adicionais..." rows={2} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePlan} className="flex-1">Criar Plano</Button>
                <AiAssistantDialog
                  context={{ niche: form.niche, topic: form.main_topic, country: form.country, language: form.language, goal: form.goal, sprintDays: form.sprint_days, extra: form.extra_notes }}
                  triggerLabel="Gerar com IA"
                  defaultAction="generate_plan"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
        {selectedPlan && (
          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"
            onClick={() => { if (confirm('Excluir este plano?')) deletePlan(selectedPlan.id); }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!selectedPlan ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Crie um plano de ação para começar.</p>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="text-2xl font-black">{phaseTemplates.length}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Fases</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-black text-profit">{progress.done}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Concluídas</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-black">{progress.total}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Total tarefas</div>
            </Card>
            <Card className="p-4">
              <div className={`text-2xl font-black ${progress.pct >= 50 ? 'text-profit' : 'text-loss'}`}>{progress.pct}%</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Progresso</div>
            </Card>
          </div>
          <Progress value={progress.pct} className="h-3" />

          {/* Info bar */}
          <Card className="p-3 bg-primary/5 border-primary/20">
            <div className="text-sm">
              <strong>Plano:</strong> {selectedPlan.main_topic} • <strong>Nicho:</strong> {selectedPlan.niche || '—'} • <strong>Sprint:</strong> {selectedPlan.sprint_days} dias a partir de {formatDateBR(selectedPlan.start_date)}
            </div>
          </Card>

          {/* Daily priorities */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4" /> 3 Prioridades do Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['p1', 'p2', 'p3'].map(k => (
                  <Input key={k} placeholder={`Prioridade ${k.slice(1)}`}
                    value={selectedPlan.daily_priorities[k] || ''}
                    onChange={e => updatePriority(selectedPlan.id, k, e.target.value, selectedPlan.daily_priorities)} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-4 h-4" /> Primeiros 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {getTimelineTasks(selectedPlan.main_topic).map(([title, items], i) => (
                  <div key={i} className="p-3 rounded-lg border bg-muted/30 text-sm">
                    <div className="text-[11px] text-muted-foreground font-semibold">{formatDateBR(addDays(selectedPlan.start_date, i))}</div>
                    <div className="font-bold text-xs mt-1 mb-2">{title as string}</div>
                    <ul className="space-y-1">
                      {(items as string[]).map((item, j) => (
                        <li key={j} className="text-[11px] text-muted-foreground leading-tight">• {item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Phase accordion */}
          <Accordion type="multiple" defaultValue={['phase-0', 'phase-1']}>
            {phaseTemplates.map((phase, idx) => (
              <AccordionItem key={idx} value={`phase-${idx}`} className="border rounded-lg mb-3 overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-lg gradient-profit flex items-center justify-center text-profit-foreground font-black text-sm shrink-0">
                      {phase.icon}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{phase.title}</div>
                      <div className="text-xs text-muted-foreground">{phase.subtitle}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left: Checklist */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold flex items-center gap-1"><CheckSquare className="w-4 h-4" /> Checklist</h4>
                        <span className="text-xs text-muted-foreground">
                          {phase.checklist.filter((_, i) => selectedPlan.checklist_states[`chk_${idx}_${i}`]).length}/{phase.checklist.length}
                        </span>
                      </div>
                      {phase.checklist.map((item, i) => {
                        const key = `chk_${idx}_${i}`;
                        const checked = !!selectedPlan.checklist_states[key];
                        return (
                          <label key={i} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${checked ? 'bg-profit/10 border-profit/30' : 'hover:bg-muted/50'}`}>
                            <input type="checkbox" checked={checked}
                              onChange={() => toggleCheck(selectedPlan.id, key, selectedPlan.checklist_states)}
                              className="mt-0.5 scale-110" />
                            <span className={`text-sm leading-relaxed ${checked ? 'line-through text-muted-foreground' : ''}`}>{item}</span>
                          </label>
                        );
                      })}
                    </div>
                    {/* Right: Notes, chips, KPIs, AI */}
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {phase.chips.map((c, i) => (
                          <span key={i} className="px-3 py-1 rounded-full border text-xs font-semibold bg-muted/30">{c}</span>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold mb-2">Anotações</h4>
                        <Textarea
                          className="text-sm"
                          rows={5}
                          value={selectedPlan.phase_notes[`note_${idx}`] || ''}
                          onChange={e => updateNote(selectedPlan.id, `note_${idx}`, e.target.value, selectedPlan.phase_notes)}
                          placeholder="Escreva suas notas, decisões e próximos passos..."
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {phase.kpis.map(([label, value], i) => (
                          <div key={i} className="p-2 rounded-lg border text-center">
                            <div className="text-[11px] text-muted-foreground">{label}</div>
                            <div className="text-xs font-bold">{value}</div>
                          </div>
                        ))}
                      </div>
                      <AiAssistantDialog
                        context={{
                          niche: selectedPlan.niche,
                          topic: selectedPlan.main_topic,
                          goal: selectedPlan.goal,
                          phaseTitle: phase.title,
                          phaseSubtitle: phase.subtitle,
                          notes: selectedPlan.phase_notes[`note_${idx}`] || '',
                        }}
                        triggerLabel="Pedir ajuda à IA"
                        defaultAction="phase_help"
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Global AI tools */}
          <Card className="p-4">
            <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Bot className="w-4 h-4" /> Ferramentas IA do Projeto</h4>
            <div className="flex flex-wrap gap-2">
              <AiAssistantDialog context={{ niche: selectedPlan.niche, topic: selectedPlan.main_topic, goal: selectedPlan.goal, extra: selectedPlan.extra_notes }} triggerLabel="Analisar Campanha" defaultAction="analyze_campaign" />
              <AiAssistantDialog context={{ niche: selectedPlan.niche, topic: selectedPlan.main_topic, goal: selectedPlan.goal }} triggerLabel="Analisar Conteúdo" defaultAction="analyze_content" />
              <AiAssistantDialog context={{ niche: selectedPlan.niche, topic: selectedPlan.main_topic, goal: selectedPlan.goal, extra: selectedPlan.extra_notes }} triggerLabel="Ideias de Criativos" defaultAction="creative_ideas" />
              <AiAssistantDialog context={{ niche: selectedPlan.niche, topic: selectedPlan.main_topic, goal: selectedPlan.goal }} triggerLabel="Sugestões ROI" defaultAction="roi_suggestions" />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
