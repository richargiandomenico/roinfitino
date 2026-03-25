import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, CheckSquare, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: BarChart3 },
  { to: '/tasks', label: 'Tarefas', icon: CheckSquare },
  { to: '/team', label: 'Equipe', icon: Users },
];

export function TeamNav({ children }: { children?: React.ReactNode }) {
  const { signOut } = useAuth();
  const location = useLocation();

  return (
    <header className="border-b bg-card sticky top-0 z-10">
      <div className="container max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-profit flex items-center justify-center">
              <span className="text-profit-foreground font-bold text-sm">R</span>
            </div>
            <h1 className="text-lg font-bold font-display hidden sm:block">ROI Analyzer</h1>
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
          {children}
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
