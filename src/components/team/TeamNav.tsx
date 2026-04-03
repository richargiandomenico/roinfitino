import { useAuth } from '@/hooks/useAuth';
import { useProjects, Project } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, BarChart3, CheckSquare, Users, Globe } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/projects', label: 'Projetos', icon: Globe },
  { to: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { to: '/team', label: 'Equipe', icon: Users },
];

interface TeamNavProps {
  children?: React.ReactNode;
  projects?: Project[];
  selectedProjectId?: string | null;
  onSelectProject?: (id: string) => void;
}

export function TeamNav({ children, projects, selectedProjectId, onSelectProject }: TeamNavProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="ROI Infinito" className="w-8 h-8 object-contain" />
            <h1 className="text-lg font-bold font-display hidden sm:block">ROI Infinito</h1>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  location.pathname === to
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {projects && projects.length > 0 && onSelectProject && (
            <Select value={selectedProjectId || ''} onValueChange={onSelectProject}>
              <SelectTrigger className="w-[180px] h-9 text-xs">
                <Globe className="w-3 h-3 mr-1 text-muted-foreground" />
                <SelectValue placeholder="Projeto" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {children}
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
