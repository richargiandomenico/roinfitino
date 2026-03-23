import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-xl gradient-profit flex items-center justify-center">
            <span className="text-profit-foreground font-bold text-lg">R</span>
          </div>
          <CardTitle className="text-2xl font-display">
            {isLogin ? 'Entrar' : 'Criar conta'}
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Sistema de Análise ROI/UTM
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required
            />
            <Input
              type="password" placeholder="Senha" value={password}
              onChange={e => setPassword(e.target.value)} required minLength={6}
            />
            {error && <p className="text-sm text-loss">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
