export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'waiting' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AppRole = 'super_admin' | 'admin' | 'collaborator';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  requester_id: string | null;
  project_id: string | null;
  category: string;
  tags: string[];
  due_date: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskSubtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  task_id: string | null;
  created_at: string;
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  backlog: { label: 'Backlog', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  todo: { label: 'A Fazer', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  in_progress: { label: 'Em Andamento', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  waiting: { label: 'Aguardando', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
  review: { label: 'Em Revisão', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  done: { label: 'Concluído', color: 'text-profit', bgColor: 'bg-profit/10' },
  cancelled: { label: 'Cancelado', color: 'text-loss', bgColor: 'bg-loss/10' },
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baixa', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { label: 'Média', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  high: { label: 'Alta', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  urgent: { label: 'Urgente', color: 'text-loss', bgColor: 'bg-loss/20' },
};

export const CATEGORIES = [
  'Conteúdo', 'Tráfego', 'SEO', 'Design', 'Revisão',
  'Desenvolvimento', 'Operacional', 'Financeiro', 'Administrativo', 'Outro'
];

export const JOB_TITLES = [
  'Super Admin', 'Admin', 'Gestor de Projetos', 'Gestor de Tráfego',
  'Redator', 'Designer', 'Editor', 'Analista', 'Financeiro', 'Outro'
];

export const ROLE_LABELS: Record<AppRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  collaborator: 'Colaborador',
};
