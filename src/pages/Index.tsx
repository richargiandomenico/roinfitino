import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useProjects } from '@/hooks/useProjects';
import { useSimulations } from '@/hooks/useSimulations';
import { useFunnelRecords } from '@/hooks/useFunnelRecords';
import { AuthPage } from '@/components/AuthPage';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ProjectSelector } from '@/components/ProjectSelector';
import { RoiCalculator } from '@/components/RoiCalculator';
import { FunnelAnalysis } from '@/components/FunnelAnalysis';
import { ActionPlanManager } from '@/components/ActionPlanManager';
import { TeamNav } from '@/components/team/TeamNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BarChart3, Navigation, ClipboardList, Heart, Shield, Zap, Target, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOTIVATIONAL_QUOTES = [
  { text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', author: 'Robert Collier' },
  { text: 'A persistência é o caminho do êxito.', author: 'Charles Chaplin' },
  { text: 'Não espere por oportunidades extraordinárias. Agarre ocasiões comuns e as torne grandes.', author: 'Orison Swett Marden' },
  { text: 'O único lugar onde o sucesso vem antes do trabalho é no dicionário.', author: 'Vidal Sassoon' },
  { text: 'Acredite que você pode, assim você já está no meio do caminho.', author: 'Theodore Roosevelt' },
  { text: 'A disciplina é a ponte entre metas e realizações.', author: 'Jim Rohn' },
  { text: 'Grandes resultados requerem grandes ambições.', author: 'Heráclito' },
];

const COMPANY_VALUES = [
  { icon: Heart, title: 'Dedicação', desc: 'Comprometimento total com cada projeto e resultado.' },
  { icon: Shield, title: 'Honestidade', desc: 'Transparência nos dados, decisões e relações com a equipe.' },
  { icon: Target, title: 'Foco em Resultados', desc: 'Cada ação é direcionada para maximizar o ROI real.' },
  { icon: Zap, title: 'Agilidade', desc: 'Decisões rápidas baseadas em dados e testes constantes.' },
  { icon: Star, title: 'Excelência', desc: 'Busca contínua por melhorias e evolução dos processos.' },
];

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, effectiveDollar, autoRate, loading: settingsLoading, saveSettings } = useSettings();
  const { projects, selectedProjectId, setSelectedProjectId, loading: projectsLoading, addProject, deleteProject } = useProjects();
  const { simulations, loading: simsLoading, addSimulation, deleteSimulation } = useSimulations(selectedProjectId);
  const { records: funnelRecords, loading: funnelLoading, addRecord: addFunnel, deleteRecord: deleteFunnel } = useFunnelRecords(selectedProjectId);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-background">
      <TeamNav
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
      >
        <SettingsDialog settings={settings} effectiveDollar={effectiveDollar} autoRate={autoRate} onSave={saveSettings} />
      </TeamNav>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Dashboard Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Frase motivacional */}
          <Card className="lg:col-span-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="py-6 flex flex-col justify-center min-h-[140px]">
              <blockquote className="text-lg font-display italic text-foreground leading-relaxed">
                "{todayQuote.text}"
              </blockquote>
              <p className="text-sm text-muted-foreground mt-3 font-medium">— {todayQuote.author}</p>
            </CardContent>
          </Card>

          {/* Mini calendário */}
          <Card>
            <CardContent className="p-2 flex items-center justify-center">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                className={cn("p-1 pointer-events-auto text-xs")}
              />
            </CardContent>
          </Card>
        </div>

        {/* Valores da empresa */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Nossos Valores</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {COMPANY_VALUES.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="group hover:border-primary/40 transition-colors">
                <CardContent className="p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Seletor de projetos */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <ProjectSelector
            projects={projects}
            selectedProjectId={selectedProjectId}
            onSelect={setSelectedProjectId}
            onAdd={addProject}
            onDelete={deleteProject}
          />
          <p className="text-xs text-muted-foreground">
            Dólar: <span className="font-mono text-profit font-semibold">R$ {effectiveDollar.toFixed(4)}</span>
          </p>
        </div>

        {!selectedProjectId ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Crie um projeto para começar a analisar seus ROIs.</p>
          </div>
        ) : (
          <Tabs defaultValue="roi" className="animate-fade-in">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="roi" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Calculadora ROI
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Análise de Funil
              </TabsTrigger>
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Plano de Ação
              </TabsTrigger>
            </TabsList>
            <TabsContent value="roi" className="mt-4">
              <RoiCalculator
                effectiveDollar={effectiveDollar}
                simulations={simulations}
                onAdd={addSimulation}
                onDelete={deleteSimulation}
              />
            </TabsContent>
            <TabsContent value="funnel" className="mt-4">
              <FunnelAnalysis
                records={funnelRecords}
                onAdd={addFunnel}
                onDelete={deleteFunnel}
              />
            </TabsContent>
            <TabsContent value="plan" className="mt-4">
              <ActionPlanManager
                projectId={selectedProjectId!}
                projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
                projectNiche={projects.find(p => p.id === selectedProjectId)?.niche || null}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
