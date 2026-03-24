import { useState } from 'react';
import { useAiAssistant } from '@/hooks/useAiAssistant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  context: Record<string, unknown>;
  triggerLabel?: string;
  defaultAction?: string;
}

const actions = [
  { value: 'analyze_campaign', label: '📊 Analisar campanha' },
  { value: 'analyze_content', label: '📝 Analisar conteúdo/artigos' },
  { value: 'creative_ideas', label: '🎨 Gerar ideias de criativos' },
  { value: 'roi_suggestions', label: '💰 Sugestões para melhorar ROI' },
  { value: 'generate_plan', label: '📋 Gerar plano de ação' },
  { value: 'phase_help', label: '🧭 Ajuda com fase atual' },
];

export function AiAssistantDialog({ context, triggerLabel = 'Consultar IA', defaultAction = 'phase_help' }: Props) {
  const { response, loading, ask, clear } = useAiAssistant();
  const [action, setAction] = useState(defaultAction);
  const [question, setQuestion] = useState('');
  const [open, setOpen] = useState(false);

  const handleAsk = () => {
    ask(action, { ...context, question });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) clear(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
          <Bot className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Assistente IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actions.map(a => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Descreva sua dúvida ou o que deseja analisar... (opcional)"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
          />

          <Button onClick={handleAsk} disabled={loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analisando...' : 'Perguntar à IA'}
          </Button>

          {response && (
            <div className="p-4 rounded-lg border bg-card prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
