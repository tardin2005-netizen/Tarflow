import React, { useState, useEffect } from "react";
import { 
  ShoppingCart, PlusCircle, Target, Building2, 
  CheckCircle, ArrowRight, Layers, LayoutGrid, Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import SupermercadoTab from "./SupermercadoTab";
import ExtratosTab from "./ExtratosTab";
import GoalsTab from "./GoalsTab";
import OpenFinanceTab from "./OpenFinanceTab";
import TasksTab from "./TasksTab";

export type GastosSubTabId = "supermercado" | "extratos" | "metas" | "openfinance" | "tarefas";

interface Props {
  initialSubTab?: GastosSubTabId;
}

export default function GestaoGastosTab({ initialSubTab }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<GastosSubTabId>(() => {
    const saved = localStorage.getItem("tarflow_gastos_active_subtab");
    return initialSubTab || (saved as GastosSubTabId) || "supermercado";
  });

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    localStorage.setItem("tarflow_gastos_active_subtab", activeSubTab);
  }, [activeSubTab]);

  const SUB_TABS = [
    { id: "supermercado", label: "Supermercado", icon: ShoppingCart, desc: "Listagem de produtos, preços por rede e orçamento" },
    { id: "extratos", label: "Extratos & Lançamentos", icon: PlusCircle, desc: "Adicionar receitas, despesas manuais e importação" },
    { id: "metas", label: "Limites & Metas", icon: Target, desc: "Tetos orçamentários por categoria e limite mensal" },
    { id: "openfinance", label: "Open Finance", icon: Building2, desc: "Conexão bancária automática e conciliação" },
    { id: "tarefas", label: "Tarefas & Contas", icon: CheckCircle, desc: "Controle de vencimentos e to-dos financeiros" }
  ];

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Notion-style Sub-Header Navigation */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3 mb-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold shrink-0">
              <Layers size={16} />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">
                Gestão de Gastos
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Controle completo de compras, extratos, tetos de gastos e bancos
              </p>
            </div>
          </div>

          <div className="text-[11px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 self-start sm:self-auto flex items-center gap-1.5 shrink-0">
            <Sparkles size={12} />
            <span>5 Módulos Integrados</span>
          </div>
        </div>

        {/* Sub-tab buttons */}
        <div className="flex overflow-x-auto gap-2 p-1 no-scrollbar scroll-smooth">
          {SUB_TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as GastosSubTabId)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-[var(--section-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-zinc-500/10 border border-[var(--border-color)]"
                }`}
              >
                <Icon size={14} className={isActive ? "text-white" : "text-blue-500"} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render active sub-view */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full min-w-0"
        >
          {activeSubTab === "supermercado" && <SupermercadoTab />}
          {activeSubTab === "extratos" && <ExtratosTab />}
          {activeSubTab === "metas" && <GoalsTab />}
          {activeSubTab === "openfinance" && <OpenFinanceTab />}
          {activeSubTab === "tarefas" && <TasksTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
