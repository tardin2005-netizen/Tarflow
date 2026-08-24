export type CategoryId = 
  | 'Alimentos' | 'Mercado' | 'Consumo Digital' | 'Transporte' | 'Combustível' 
  | 'Educação' | 'Saúde' | 'Lazer' | 'Viagem' | 'Vestuário' 
  | 'Beleza' | 'Pets' | 'Casa' | 'Contas Fixas' | 'Assinaturas' 
  | 'Investimentos' | 'Presentes' | 'Doações' | 'Impostos' | 'Outros';

export interface Category {
  id: CategoryId;
  icon: string;
  label: string;
}

export interface Expense {
  id: string;
  userId: string;
  category: CategoryId;
  name: string;
  value: number;
  date: string;
  createdAt: string;
  bank?: string;
  source?: string;
}

export interface Goal {
  id: string;
  userId: string;
  category: CategoryId | 'GERAL';
  amount: number;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export type Priority = 'baixa' | 'media' | 'alta';

export interface Task {
  id: string;
  userId: string;
  listId: string;
  title: string;
  dueDate: string | null;
  reminder: string | null;
  priority: Priority;
  amount: number | null;
  isPayment: boolean;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  age?: string;
  salary?: string;
  averageIncome?: string;
  profession?: string;
  achievements: string[];
  referralCount: number;
  streak: number;
  lastActive: string;
  isPublic: boolean;
  avatar?: string;
  plannerPhone?: string;
  plannerStep?: number;
  riskProfile?: string;
  supermarketLimit?: number;
}

export interface SupermarketProduct {
  id: string;
  userId: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  supermarket: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  createdAt: string;
}

export const ACHIEVEMENT_LIST = [
  { id: 'first_expense', name: 'Primeiro Passo', description: 'Adicionou sua primeira despesa', icon: '💰' },
  { id: 'goal_setter', name: 'Planejador', description: 'Definiu sua primeira meta', icon: '🎯' },
  { id: 'task_master', name: 'Mestre das Tarefas', description: 'Concluiu 10 tarefas', icon: '✅' },
  { id: 'saver', name: 'Poupador', description: 'Manteve gastos abaixo de 90% da meta global', icon: '💎' },
  { id: 'social_butterfly', name: 'Influencer', description: 'Compartilhou o Tarflow com alguém', icon: '🦋' },
];
