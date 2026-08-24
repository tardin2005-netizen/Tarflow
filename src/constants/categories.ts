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
  { id: 'Contas Fixas', icon: '📄', label: 'Despesas Fixas' },
  { id: 'Assinaturas', icon: '📺', label: 'Assinaturas' },
  { id: 'Investimentos', icon: '📈', label: 'Investimentos' },
  { id: 'Presentes', icon: '🎁', label: 'Presentes' },
  { id: 'Doações', icon: '❤️', label: 'Doações' },
  { id: 'Impostos', icon: '🧾', label: 'Impostos' },
  { id: 'Outros', icon: '📦', label: 'Outros' }
];

// Each category gets its own distinct color, chosen to evoke what it represents
// (food = warm orange/appetite, health = clinical teal, travel = sky blue, etc.)
// rather than reusing a handful of hues — previously several unrelated categories
// shared the exact same color and were indistinguishable in the pie chart.
export const CATEGORY_COLORS_MAP: Record<string, string> = {
  'Alimentos': '#FB923C', // Laranja vibrante — comida, apetite
  'Mercado': '#4ADE80', // Verde fresco — hortifrúti/compras
  'Consumo Digital': '#38BDF8', // Azul ciano — tecnologia
  'Transporte': '#FACC15', // Amarelo — táxi/atenção no trânsito
  'Combustível': '#EF4444', // Vermelho — posto de gasolina/alerta
  'Educação': '#6366F1', // Índigo — acadêmico
  'Saúde': '#2563EB', // Azul royal — clínico, distinto do verde de Mercado/Investimentos
  'Lazer': '#C084FC', // Roxo claro — diversão
  'Viagem': '#0EA5E9', // Azul-céu — viagem
  'Vestuário': '#F472B6', // Rosa — moda
  'Beleza': '#E879F9', // Magenta — cosméticos
  'Pets': '#D97706', // Âmbar — terroso, animal
  'Casa': '#A16207', // Marrom — lar, madeira
  'Contas Fixas': '#64748B', // Cinza-azulado — sério, estável
  'Assinaturas': '#8B5CF6', // Violeta — streaming
  'Investimentos': '#10B981', // Verde-esmeralda — crescimento financeiro
  'Presentes': '#FB7185', // Rosa-vermelho — festivo
  'Doações': '#F43F5E', // Vermelho-rosa — coração, caridade
  'Impostos': '#78716C', // Cinza-pedra — burocrático
  'Outros': '#9CA3AF' // Cinza neutro — categoria genérica
};
