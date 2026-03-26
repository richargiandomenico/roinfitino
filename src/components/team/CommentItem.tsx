import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import type { TaskComment, TeamMember } from '@/types/team';
import { CommentEditor } from './CommentEditor';

interface Props {
  comment: TaskComment;
  author: TeamMember | undefined;
  isOwner: boolean;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export function CommentItem({ comment, author, isOwner, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="pl-8">
        <CommentEditor
          initialValue={comment.content}
          onSubmit={(content) => { onUpdate(comment.id, content); setEditing(false); }}
          onCancel={() => setEditing(false)}
          submitLabel="Salvar"
        />
      </div>
    );
  }

  return (
    <div className="flex gap-2 group">
      <Avatar className="w-6 h-6 mt-0.5 shrink-0">
        <AvatarFallback className="text-[10px] bg-muted">
          {author?.name?.charAt(0).toUpperCase() || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{author?.name || 'Usuário'}</span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(comment.created_at), "dd/MM HH:mm", { locale: ptBR })}
          </span>
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-5 h-5 opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => setEditing(true)}>
                  <Pencil className="w-3 h-3 mr-2" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive" onClick={() => onDelete(comment.id)}>
                  <Trash2 className="w-3 h-3 mr-2" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="text-sm text-muted-foreground prose prose-sm prose-invert max-w-none [&_p]:my-0.5 [&_ul]:my-0.5 [&_ol]:my-0.5 [&_a]:text-primary">
          <ReactMarkdown>{comment.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
