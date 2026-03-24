import { useState, useCallback } from 'react';

const AI_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-plan-assistant`;

export function useAiAssistant() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = useCallback(async (action: string, context: Record<string, unknown>) => {
    setLoading(true);
    setResponse('');
    let accumulated = '';

    try {
      const resp = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, context }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: 'Erro desconhecido' }));
        setResponse(`❌ ${err.error || 'Erro ao chamar IA'}`);
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;

      while (!done) {
        const { done: readerDone, value } = await reader.read();
        if (readerDone) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { done = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulated += content;
              setResponse(accumulated);
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (e) {
      setResponse(`❌ Erro: ${e instanceof Error ? e.message : 'desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => setResponse(''), []);

  return { response, loading, ask, clear };
}
