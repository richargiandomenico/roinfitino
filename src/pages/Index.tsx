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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, BarChart3, Navigation, ClipboardList } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { settings, effectiveDollar, autoRate, loading: settingsLoading, saveSettings } = useSettings();
  const { projects, selectedProjectId, setSelectedProjectId, loading: projectsLoading, addProject, deleteProject } = useProjects();
  const { simulations, loading: simsLoading, addSimulation, deleteSimulation } = useSimulations(selectedProjectId);
  const { records: funnelRecords, loading: funnelLoading, addRecord: addFunnel, deleteRecord: deleteFunnel } = useFunnelRecords(selectedProjectId);

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
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-profit flex items-center justify-center">
              <span className="text-profit-foreground font-bold text-sm">R</span>
            </div>
            <h1 className="text-lg font-bold font-display">ROI Analyzer</h1>
          </div>
          <div className="flex items-center gap-2">
            <SettingsDialog settings={settings} effectiveDollar={effectiveDollar} autoRate={autoRate} onSave={saveSettings} />
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
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
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="roi" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> Calculadora ROI
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Análise de Funil
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
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
