import React, { useState, useMemo } from "react";
import { useExpenses, useGoals } from "../../hooks/useFirebaseData";
import { CATEGORIES } from "../../constants/categories";
import { formatCurrency, cn } from "../../lib/utils";
import { CategoryId } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { Target, TrendingDown, ChevronDown, CheckCircle2, AlertCircle, ListFilter } from "lucide-react";

export default function GoalsTab() {
  const { expenses } = useExpenses();
  const { goals, saveGoal } = useGoals();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "GERAL">("GERAL");
  const [amount, setAmount] = useState("");

  const handleSave = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    saveGoal({
      category: selectedCategory,
      amount: val
    });
    setAmount("");
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }, [expenses, currentMonth, currentYear]);

  const monthName = now.toLocaleDateString("pt-BR", { month: "long" });

  const generalGoals = goals.filter(g => g.category === "GERAL");
  const categoryGoals = goals.filter(g => g.category !== "GERAL");

  const renderGoalCard = (goal: any, idx: number) => {
    const spent = monthExpenses
      .filter(e => goal.category === "GERAL" || e.category === goal.category)
      .reduce((acc, e) => acc + e.value, 0);
    const pct = goal.amount > 0 ? (spent / goal.amount) * 100 : 0;
    const isOver = pct >= 100;
    const isNear = pct >= 80 && !isOver;

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.1 }}
        key={goal.id} 
        className="bg-[var(--section-bg)] p-8 rounded-[2.5rem] border-2 border-[var(--border-color)] group hover:border-[#667eea] transition-all shadow-sm"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-3xl bg-[var(--card-bg)] flex items-center justify-center text-[#667eea] shadow-inner group-hover:scale-110 transition-transform">
              {goal.category === "GERAL" ? <Target size={24} /> : <TrendingDown size={24} />}
            </div>
            <div>
              <div className="font-black text-lg group-hover:text-[#667eea] transition-colors uppercase">
                 {goal.category === "GERAL" ? "Geral" : CATEGORIES.find(c => c.id === goal.category)?.label}
              </div>
              <div className="text-[0.65rem] font-black tracking-widest opacity-40 uppercase">Limite: {formatCurrency(goal.amount)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={cn("text-2xl font-black", isOver ? "text-[var(--danger)]" : isNear ? "text-[#FFA726]" : "text-[var(--success)]")}>
               {Math.round(pct)}%
            </div>
            <div className="text-[0.6rem] font-bold opacity-40 uppercase tracking-tighter">Utilizado</div>
          </div>
        </div>
        
        <div className="relative h-4 bg-[var(--card-bg)] rounded-full overflow-hidden mb-6 shadow-inner p-1">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(pct, 100)}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full transition-all",
              isOver ? "bg-gradient-to-r from-[#FF6B6B] to-[#ee5a52]" : 
              isNear ? "bg-gradient-to-r from-[#FFA726] to-[#FB8C00]" : 
              "bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            )}
          />
        </div>

        <div className="flex justify-between items-center bg-[var(--card-bg)]/50 p-4 rounded-2xl border border-transparent group-hover:border-[var(--border-color)] transition-all">
          <div>
            <div className="text-[0.55rem] font-black opacity-40 uppercase mb-1">Gasto Atual</div>
            <div className="text-sm font-black text-[var(--text-primary)]">{formatCurrency(spent)}</div>
          </div>
          <div className="text-right">
             <div className="text-[0.55rem] font-black opacity-40 uppercase mb-1">Status</div>
             <div className={cn("text-[0.65rem] font-black flex items-center gap-1 justify-end", isOver ? "text-[var(--danger)]" : isNear ? "text-[#FFA726]" : "text-[var(--success)]")}>
               {isOver ? (
                 <><AlertCircle size={12} /> ESTOURO DE {formatCurrency(spent - goal.amount)}</>
               ) : isNear ? (
                 <><TrendingDown size={12} /> RESTA APENAS {formatCurrency(goal.amount - spent)}</>
               ) : (
                 <><CheckCircle2 size={12} /> SEGURO POR {formatCurrency(goal.amount - spent)}</>
               )}
             </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="tab-content flex flex-col gap-8">
      {/* Set Goal Section */}
      <div className="bg-[var(--section-bg)] p-8 rounded-[2.5rem] border-2 border-[var(--border-color)]">
        <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
          <Target className="text-[#667eea]" />
          <span>Configurar Limites</span>
        </h2>
        
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-5">
            <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 px-2">Alvo do Limite</label>
            <div className="relative group">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value as CategoryId | "GERAL")}
                className="w-full appearance-none p-5 pl-12 border-2 border-[var(--border-color)] rounded-[1.5rem] bg-[var(--card-bg)] font-black text-sm outline-none focus:border-[#667eea] transition-all cursor-pointer"
              >
                <option value="GERAL">LIMITE GERAL (Todos os gastos)</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label.toUpperCase()}</option>)}
              </select>
              <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:scale-110 transition-transform text-[#667eea]">
                {selectedCategory === "GERAL" ? <Target size={20} /> : <ListFilter size={20} />}
              </div>
              <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
            </div>
          </div>

          <div className="lg:col-span-4">
            <label className="block text-[0.6rem] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3 px-2">Valor Máximo (R$)</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-[var(--text-muted)] opacity-50">R$</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" 
                className="w-full p-5 pl-12 border-2 border-[var(--border-color)] rounded-[1.5rem] bg-[var(--card-bg)] font-black text-sm outline-none focus:border-[#667eea] transition-all"
              />
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave} 
            className="lg:col-span-3 bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] text-white py-5 px-8 rounded-[1.5rem] font-black text-sm shadow-xl transition-all"
          >
            DEFINIR LIMITE
          </motion.button>
        </div>
      </div>

      {generalGoals.length > 0 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-1 gap-6">
            {generalGoals.map((g, idx) => renderGoalCard(g, idx))}
          </div>
        </div>
      )}

      {/* Active Goals Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-4">
           <div>
             <h3 className="text-xl font-black">Performance em {monthName}</h3>
             <p className="text-[0.65rem] font-black opacity-40 uppercase tracking-[0.2em]">Acompanhamento de tetos orçamentários</p>
           </div>
           <div className="text-[0.65rem] font-black text-[var(--text-muted)] bg-[var(--section-bg)] px-3 py-1 rounded-full border border-[var(--border-color)]">
             {categoryGoals.length} LIMITES ATIVOS
           </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {categoryGoals.length === 0 ? (
              <div className="md:col-span-2 text-center py-20 bg-[var(--section-bg)] rounded-[3rem] border-2 border-dashed border-[var(--border-color)]">
                <p className="text-[var(--text-muted)] text-sm font-black opacity-30 italic">Sem limites definidos no momento.</p>
              </div>
            ) : (
              categoryGoals.map((goal, idx) => renderGoalCard(goal, idx))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
