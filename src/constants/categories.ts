import { Category } from "../types";

export const CATEGORIES: Category[] = [
  { id: 'Alimentos', icon: '🍔', label: 'Alimentos' },
  { id: 'Mercado', icon: '🛒', label: 'Mercado' },
  { id: 'Consumo Digital', icon: '💻', label: 'Digital' },
  { id: 'Transporte', icon: '🚗', label: 'Transporte' },
  { id: 'Combustível', icon: '⛽', label: 'Combustível' },
  { id: 'Educação', icon: '📚', label: 'Educação' },
  { id: 'Saúde', icon: '⚕️', label: 'Saúde' },
  { id: 'Lazer', icon: '🎮', label: 'Lazer' },
  { id: 'Viagem', icon: '✈️', label: 'Viagem' },
  { id: 'Vestuário', icon: '👕', label: 'Vestuário' },
  { id: 'Beleza', icon: '💄', label: 'Beleza' },
  { id: 'Pets', icon: '🐶', label: 'Pets' },
  { id: 'Casa', icon: '🏠', label: 'Casa' },
  { id: 'Contas Fixas', icon: '📄', label: 'Fixas' },
  { id: 'Assinaturas', icon: '📺', label: 'Assinaturas' },
  { id: 'Investimentos', icon: '📈', label: 'Investimentos' },
  { id: 'Presentes', icon: '🎁', label: 'Presentes' },
  { id: 'Doações', icon: '❤️', label: 'Doações' },
  { id: 'Impostos', icon: '🧾', label: 'Impostos' },
  { id: 'Outros', icon: '📦', label: 'Outros' }
];

export const CATEGORY_COLORS_MAP: Record<string, string> = {
  'Alimentos': '#F97316', // Laranja
  'Mercado': '#10B981', // Verde
  'Consumo Digital': '#3B82F6', // Azul claro
  'Transporte': '#9CA3AF', // Cinza
  'Combustível': '#1E3A8A', // Azul marinho
  'Educação': '#3B82F6', // Azul claro
  'Saúde': '#10B981', // Verde
  'Lazer': '#8B5CF6', // Roxo
  'Viagem': '#1E3A8A', // Azul marinho
  'Vestuário': '#9CA3AF', // Cinza
  'Beleza': '#F97316', // Laranja
  'Pets': '#10B981', // Verde
  'Casa': '#3B82F6', // Azul claro
  'Contas Fixas': '#1E3A8A', // Azul marinho
  'Assinaturas': '#3B82F6', // Azul claro
  'Investimentos': '#10B981', // Verde
  'Presentes': '#F97316', // Laranja
  'Doações': '#9CA3AF', // Cinza
  'Impostos': '#1E3A8A', // Azul marinho
  'Outros': '#9CA3AF' // Cinza
};
