import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSettings } from '@/hooks/useSettings';
import { useProjects } from '@/hooks/useProjects';
import { useCurrentMember } from '@/hooks/useCurrentMember';
import { useTasks } from '@/hooks/useTasks';
import { AuthPage } from '@/components/AuthPage';
import { SettingsDialog } from '@/components/SettingsDialog';
import { TeamNav } from '@/components/team/TeamNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Heart, Shield, Zap, Target, Star, CalendarDays, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/team';
import type { DayContentProps } from 'react-day-picker';

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
  const { settings, effectiveDollar, effectiveEuro, autoRate, autoEuroRate, saveSettings } = useSettings();
  const { projects, selectedProjectId, setSelectedProjectId } = useProjects();
  const { member } = useCurrentMember();
  const { tasks } = useTasks();
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(new Date());

  const todayQuote = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  // Tasks assigned to current member with due dates
  const myTasksWithDue = useMemo(() => {
    if (!member) return [];
    return tasks.filter(t => t.assignee_id === member.id && t.due_date && t.status !== 'done' && t.status !== 'cancelled');
  }, [tasks, member]);

  // Dates that have tasks
  const taskDates = useMemo(() => {
    const dates: Date[] = [];
    myTasksWithDue.forEach(t => {
      if (t.due_date) dates.push(parseISO(t.due_date));
    });
    return dates;
  }, [myTasksWithDue]);

  // Tasks for selected date
  const tasksForSelectedDate = useMemo(() => {
    if (!calendarDate) return [];
    return myTasksWithDue.filter(t => t.due_date && isSameDay(parseISO(t.due_date), calendarDate));
  }, [myTasksWithDue, calendarDate]);

  // Upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 86400000);
    return myTasksWithDue
      .filter(t => {
        const d = parseISO(t.due_date!);
        return d >= now && d <= in7Days;
      })
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  }, [myTasksWithDue]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  // Custom day content to show dots for task dates
  const modifiers = { hasTask: taskDates };
  const modifiersStyles = {
    hasTask: {
      position: 'relative' as const,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <TeamNav projects={projects} selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId}>
        {isAdmin && <SettingsDialog settings={settings} effectiveDollar={effectiveDollar} effectiveEuro={effectiveEuro} autoRate={autoRate} autoEuroRate={autoEuroRate} onSave={saveSettings} />}
      </TeamNav>

      <main className="container max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Frase motivacional */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="py-6">
            <blockquote className="text-lg font-display italic text-foreground leading-relaxed">
              "{todayQuote.text}"
            </blockquote>
            <p className="text-sm text-muted-foreground mt-3 font-medium">— {todayQuote.author}</p>
          </CardContent>
        </Card>

        {/* Calendar + Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                Calendário de Entregas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4">
              <Calendar
                mode="single"
                selected={calendarDate}
                onSelect={setCalendarDate}
                locale={ptBR}
                modifiers={modifiers}
                modifiersClassNames={{ hasTask: 'task-day-dot' }}
                className={cn("p-3 pointer-events-auto")}
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold mb-2">
                  {calendarDate ? format(calendarDate, "dd 'de' MMMM", { locale: ptBR }) : 'Selecione um dia'}
                </h3>
                {tasksForSelectedDate.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma tarefa para este dia.</p>
                ) : (
                  <div className="space-y-2">
                    {tasksForSelectedDate.map(task => (
                      <div key={task.id} className="p-2 rounded-md border bg-muted/30 space-y-1">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={cn("text-[10px]", PRIORITY_CONFIG[task.priority].color)}>
                            {PRIORITY_CONFIG[task.priority].label}
                          </Badge>
                          <Badge variant="outline" className={cn("text-[10px]", STATUS_CONFIG[task.status].color)}>
                            {STATUS_CONFIG[task.status].label}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Próximas entregas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-warning" />
                Próximas Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground">Nenhuma tarefa nos próximos 7 dias.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {upcomingTasks.map(task => (
                    <div key={task.id} className="p-2 rounded-md border bg-muted/20 space-y-1">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={cn("text-[10px]", PRIORITY_CONFIG[task.priority].color)}>
                          {PRIORITY_CONFIG[task.priority].label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(parseISO(task.due_date!), 'dd/MM')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
      </main>
    </div>
  );
};

export default Index;
