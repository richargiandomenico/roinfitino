import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useProjects } from '@/hooks/useProjects';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useSimulations } from '@/hooks/useSimulations';
import { useFunnelRecords } from '@/hooks/useFunnelRecords';
import { AuthPage } from '@/components/AuthPage';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ProjectSelector } from '@/components/ProjectSelector';
import { RoiCalculator } from '@/components/RoiCalculator';
import { FunnelAnalysis } from '@/components/FunnelAnalysis';
import { ActionPlanManager } from '@/components/ActionPlanManager';
import { FinancialManager } from '@/components/FinancialManager';
import { TeamNav } from '@/components/team/TeamNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Navigation, ClipboardList, DollarSign } from 'lucide-react';

export default function Projects() {
  const { user, loading: authLoading } = useAuth();
  const { settings, effectiveDollar, effectiveEuro, autoRate, autoEuroRate, saveSettings } = useSettings();
  const { projects, selectedProjectId, setSelectedProjectId, addProject, deleteProject } = useProjects();
  const { simulations, addSimulation, deleteSimulation } = useSimulations(selectedProjectId);
  const { records: funnelRecords, addRecord: addFunnel, deleteRecord: deleteFunnel } = useFunnelRecords(selectedProjectId);

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
      <TeamNav projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId}>
        <SettingsDialog settings={settings} effectiveDollar={effectiveDollar} effectiveEuro={effectiveEuro} autoRate={autoRate} autoEuroRate={autoEuroRate} onSave={saveSettings} />
      </TeamNav>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
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
          <Tabs defaultValue="plan" className="animate-fade-in">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" /> Plano
              </TabsTrigger>
              <TabsTrigger value="roi" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" /> ROI
              </TabsTrigger>
              <TabsTrigger value="funnel" className="flex items-center gap-2">
                <Navigation className="w-4 h-4" /> Funil
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Financeiro
              </TabsTrigger>
            </TabsList>
            <TabsContent value="plan" className="mt-4">
              <ActionPlanManager
                projectId={selectedProjectId!}
                projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
                projectNiche={projects.find(p => p.id === selectedProjectId)?.niche || null}
              />
            </TabsContent>
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
            <TabsContent value="financial" className="mt-4">
              <FinancialManager
                projectId={selectedProjectId!}
                projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
