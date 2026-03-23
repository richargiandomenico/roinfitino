import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderPlus, Trash2, Globe } from 'lucide-react';
import type { Project } from '@/hooks/useProjects';

interface Props {
  projects: Project[];
  selectedProjectId: string | null;
  onSelect: (id: string) => void;
  onAdd: (name: string, url?: string, niche?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ProjectSelector({ projects, selectedProjectId, onSelect, onAdd, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [niche, setNiche] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    await onAdd(name, url, niche);
    setName(''); setUrl(''); setNiche('');
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      <Select value={selectedProjectId || ''} onValueChange={onSelect}>
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Selecionar projeto" />
        </SelectTrigger>
        <SelectContent>
          {projects.map(p => (
            <SelectItem key={p.id} value={p.id}>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3 text-muted-foreground" />
                {p.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderPlus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Projeto</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Nome *</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Blog Finanças" />
            </div>
            <div>
              <Label className="text-xs">URL</Label>
              <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="Ex: https://meusite.com" />
            </div>
            <div>
              <Label className="text-xs">Nicho</Label>
              <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="Ex: Finanças" />
            </div>
            <Button onClick={handleAdd} className="w-full">Criar projeto</Button>
          </div>
        </DialogContent>
      </Dialog>

      {selectedProjectId && (
        <Button
          variant="ghost" size="sm"
          className="text-loss hover:text-loss"
          onClick={() => {
            if (confirm('Excluir projeto e todos os dados?')) onDelete(selectedProjectId);
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
