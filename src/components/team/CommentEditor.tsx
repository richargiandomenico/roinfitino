import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { supabase } from '@/integrations/supabase/client';
import { Bold, Italic, List, Link2, ImagePlus, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  initialValue?: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  taskId?: string;
}

export function CommentEditor({ initialValue = '', onSubmit, onCancel, placeholder = 'Escrever comentário...', submitLabel }: Props) {
  const [content, setContent] = useState(initialValue);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync internal state when initialValue changes (e.g. after save)
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const wrapSelection = (before: string, after: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = content.substring(start, end);
    const newText = content.substring(0, start) + before + selected + after + content.substring(end);
    setContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertAtCursor = (text: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;
    const newText = content.substring(0, pos) + text + content.substring(pos);
    setContent(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(pos + text.length, pos + text.length);
    }, 0);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim());
  };

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `notes/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from('task-attachments')
          .upload(path, file, { upsert: true });
        if (error) throw error;
        const { data: urlData } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(path);
        insertAtCursor(`![${file.name}](${urlData.publicUrl})`);
        toast.success('Imagem anexada!');
      } catch {
        toast.error('Erro ao enviar imagem');
      } finally {
        setUploading(false);
      }
    };
    input.click();
  };

  return (
    <div className="border border-border rounded-md overflow-hidden bg-card">
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-muted/30">
        <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => wrapSelection('**', '**')} title="Negrito">
          <Bold className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => wrapSelection('*', '*')} title="Itálico">
          <Italic className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => insertAtCursor('\n- ')} title="Lista">
          <List className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={() => wrapSelection('[', '](url)')} title="Link">
          <Link2 className="w-3.5 h-3.5" />
        </Toggle>
        <Toggle size="sm" className="h-7 w-7 p-0" onPressedChange={handleImageUpload} title="Imagem" disabled={uploading}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
        </Toggle>
      </div>
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={placeholder}
        className="border-0 rounded-none focus-visible:ring-0 min-h-[60px] text-sm resize-none"
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />
      <div className="flex items-center justify-between px-2 py-1.5 border-t border-border bg-muted/30">
        <span className="text-[10px] text-muted-foreground">Ctrl+Enter para enviar • Markdown suportado</span>
        <div className="flex items-center gap-1">
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs px-2">
              <X className="w-3 h-3 mr-1" /> Cancelar
            </Button>
          )}
          <Button size="sm" onClick={handleSubmit} className="h-7 text-xs px-3" disabled={!content.trim() || uploading}>
            {submitLabel || <><Send className="w-3 h-3 mr-1" /> Enviar</>}
          </Button>
        </div>
      </div>
    </div>
  );
}
