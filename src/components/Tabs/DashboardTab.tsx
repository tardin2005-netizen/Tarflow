import React, { useState, useMemo, useRef, useEffect } from "react";
import { CATEGORIES, CATEGORY_COLORS_MAP } from "../../constants/categories";
import { useExpenses, useGoals, useSupermarketProducts } from "../../hooks/useFirebaseData";
import { cn, formatCurrency } from "../../lib/utils";
import { ExpenseItem } from "../ExpenseItem";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, Wallet, ArrowUpRight, Filter, X, PieChart as PieIcon, Calendar, History, CheckCircle, AlertCircle, Clock, ChevronDown, ShoppingCart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";

type FilterType = "all" | "15d" | "30d" | "60d" | "year" | "custom";

const FILTER_LABELS: Record<FilterType, string> = {
  all: "Todo o Histórico",
  "15d": "Últimos 15 Dias",
  "30d": "Últimos 30 Dias",
  "60d": "Últimos 60 Dias",
  year: "Último Ano",
  custom: "Personalizado"
};

export default function DashboardTab() {
  const { expenses, deleteExpense, updateExpense } = useExpenses();
  const { goals } = useGoals();
  const { products: supermarketProducts } = useSupermarketProducts();
  const { t } = useTranslation();
  const [expandedHistoryMonth, setExpandedHistoryMonth] = useState<string | null>(null);

  // Reset to default on every page load/update as requested by user
  const [filter, setFilter] = useState<FilterType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const filteredExpenses = useMemo(() => {
    let base = expenses;

    if (filter === "custom") {
      if (customStart && customEnd) {
        base = expenses.filter(e => e.date >= customStart && e.date <= customEnd);
      }
    } else if (filter !== "all") {
      const now = new Date();
      if (filter === "15d") {
        now.setDate(now.getDate() - 15);
      } else if (filter === "30d") {
        now.setDate(now.getDate() - 30);
      } else if (filter === "60d") {
        now.setDate(now.getDate() - 60);
      } else if (filter === "year") {
        now.setFullYear(now.getFullYear() - 1);
      }
      
      const offset = now.getTimezoneOffset();
      const localDate = new Date(now.getTime() - (offset*60*1000));
      const startDateStr = localDate.toISOString().split('T')[0];
      
      base = expenses.filter(e => e.date >= startDateStr);
    }
    return base;
  }, [expenses, filter, customStart, customEnd]);

  const dashboardData = useMemo(() => {
    const totalMonth = filteredExpenses.reduce((s, e) => s + e.value, 0);
    const generalGoal = goals.find(g => g.category === 'GERAL')?.amount || 0;
    const percent = generalGoal > 0 ? (totalMonth / generalGoal) * 100 : 0;
    return { totalMonth, generalGoal, percent, count: filteredExpenses.length };
  }, [filteredExpenses, goals]);

  // Monthly Spending History calculation (Histórico Mensal de Gastos)
  const monthlyHistory = useMemo(() => {
    const map: Record<string, { monthKey: string; label: string; total: number; count: number; dateObj: Date }> = {};
    
    expenses.forEach(e => {
      if (!e.date) return;
      const parts = e.date.split("-");
      if (parts.length < 2) return;
      const key = `${parts[0]}-${parts[1]}`;
      if (!map[key]) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        const monthName = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        const formattedLabel = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        map[key] = { monthKey: key, label: formattedLabel, total: 0, count: 0, dateObj: d };
      }
      map[key].total += e.value;
      map[key].count += 1;
    });

    const generalGoal = goals.find(g => g.category === 'GERAL')?.amount || 0;

    return Object.values(map)
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey))
      .map(item => ({
        ...item,
        limit: generalGoal,
        percent: generalGoal > 0 ? (item.total / generalGoal) * 100 : 0,
        isOver: generalGoal > 0 && item.total > generalGoal
      }));
  }, [expenses, goals]);

  const stats = useMemo(() => {
    const catTotals: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.value;
    });

    let chartData = Object.entries(catTotals)
      .map(([name, value]) => ({ 
        name: CATEGORIES.find(c => c.id === name)?.label || name, 
        value,
        originalId: name 
      }))
      .sort((a, b) => b.value - a.value);

    const topCategoria = chartData.length > 0 ? chartData[0] : null;
    const mediaPorItem = filteredExpenses.length > 0 
      ? dashboardData.totalMonth / filteredExpenses.length 
      : 0;

    return { chartData, topCategoria, mediaPorItem, itemsCount: filteredExpenses.length };
  }, [filteredExpenses, dashboardData.totalMonth]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const color = CATEGORY_COLORS_MAP[data.originalId] || '#9CA3AF';
      return (
        <div className="bg-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-xl flex items-center justify-center font-bold text-sm sm:text-base tracking-tight border border-gray-100" style={{ color: color }}>
          {data.name} : {formatCurrency(data.value)}
        </div>
      );
    }
    return null;
  };

  const recentExpenses = [...filteredExpenses].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  // Drill-down detail for a selected month in "Histórico Mensal de Gastos" (item 11)
  const historyMonthDetail = useMemo(() => {
    if (!expandedHistoryMonth) return null;
    const monthExpenses = expenses
      .filter(e => e.date && e.date.startsWith(expandedHistoryMonth))
      .sort((a, b) => b.date.localeCompare(a.date));
    const monthSupermarketProducts = supermarketProducts
      .filter(p => p.month === expandedHistoryMonth)
      .sort((a, b) => b.date.localeCompare(a.date));
    const supermarketTotal = monthSupermarketProducts.reduce((sum, p) => sum + (p.price * p.qty), 0);
    return { monthExpenses, monthSupermarketProducts, supermarketTotal };
  }, [expandedHistoryMonth, expenses, supermarketProducts]);

  return (
    <div className="tab-content flex flex-col gap-4 sm:gap-6 w-full overflow-x-hidden">
      <div className="w-full flex justify-center py-4 mb-2">
        <h1 className="text-5xl md:text-6xl font-black text-[var(--text-primary)] relative" style={{ fontVariantLigatures: "none", letterSpacing: "0.035em" }}>
          Tarflow
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gradient-to-r from-[#00F5FF] to-[#667eea] rounded-full"></div>
        </h1>
      </div>

      {/* Mini Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 w-full">
        {/* Gasto no Período */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-3 bg-gradient-to-br from-[#2C5F7C] to-[#1a1a2e] p-5 sm:p-6 rounded-3xl text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
            <img src={`${import.meta.env.BASE_URL}tarflowicon.png`} alt="Tarflow Icon" className="w-8 h-8 drop-shadow-lg" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-300">
                  Gasto no Período: {FILTER_LABELS[filter]}
                </span>
              </div>
            </div>
            <div className="text-3xl sm:text-4xl font-black mb-1">{formatCurrency(dashboardData.totalMonth)}</div>
            <div className="text-xs opacity-75 flex items-center gap-1.5 font-medium mt-1">
              <Clock size={12} className="text-cyan-300 shrink-0" />
              <span>Baseado em {dashboardData.count} registros ({FILTER_LABELS[filter]})</span>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 text-white/10 rotate-12 pointer-events-none">
            <Wallet size={120} />
          </div>
        </motion.div>

        {/* Limite Geral Mensal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2 bg-gradient-to-br from-[#1a1a2e] to-[#24244d] p-5 sm:p-6 rounded-3xl border-2 border-white/5 shadow-xl text-white overflow-hidden relative"
        >
          <div className="absolute -top-4 -right-4 opacity-5 rotate-12 pointer-events-none">
            <TrendingUp size={100} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Limite Geral (Mensal)
              </span>
              <TrendingUp className="w-5 h-5 text-[var(--success)]" />
            </div>
            <div className="text-3xl sm:text-4xl font-black mb-4">
              {dashboardData.generalGoal > 0 ? formatCurrency(dashboardData.generalGoal) : "---"}
            </div>
            <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(dashboardData.percent, 100)}%` }}
                className={cn("h-full transition-all duration-500", dashboardData.percent > 90 ? "bg-[var(--danger)]" : "bg-[var(--success)]")}
              />
            </div>
            <div className="flex justify-between mt-2 text-[0.7rem] font-bold">
              <span className="opacity-80">{Math.round(dashboardData.percent)}% do teto mensal consumido</span>
              <span className={cn("font-black", dashboardData.percent > 90 ? "text-[var(--danger)]" : "text-[var(--success)]")}>
                {dashboardData.percent > 90 ? "⚠️ Atenção ao Limite" : "✓ No limite"}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6 w-full min-w-0">
        {/* Main Left Section: Distribuição */}
        <div className="lg:col-span-3 space-y-4 sm:space-y-6 min-w-0">

          {/* Distribuição Card */}
          <div className="bg-[var(--section-bg)] rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-[var(--border-color)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-20" ref={filterRef}>
              <div className="flex items-center gap-2.5">
                <PieIcon size={20} className="text-[var(--success)]" />
                <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)]">Distribuição</h2>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  {FILTER_LABELS[filter]}
                </span>
              </div>
              
              {/* Quick Period Selector Buttons */}
              <div className="flex items-center gap-1.5">
                <div className="hidden sm:flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--border-color)] text-[11px] font-bold">
                  {(["all", "15d", "30d", "60d", "year"] as FilterType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all cursor-pointer",
                        filter === f 
                          ? "bg-blue-600 text-white font-black shadow-sm" 
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                      )}
                    >
                      {f === "all" ? "Tudo" : f === "year" ? "1 Ano" : f}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  title="Mais Opções de Período"
                  className={cn(
                    "p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer",
                    filter !== "all" || isFilterOpen ? "bg-[#667eea] text-white shadow-md shadow-[#667eea]/30 border-[#667eea]" : "bg-[var(--card-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-blue-500"
                  )}
                >
                  <Filter size={16} />
                </button>
              </div>

              {/* Filter Dropdown */}
              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-12 right-0 w-[280px] max-w-[90vw] origin-top-right bg-[var(--section-bg)] border-2 border-[var(--border-color)] p-4 rounded-3xl shadow-2xl z-50"
                  >
                    <div className="flex items-center justify-between mb-3 text-[0.65rem] font-black uppercase tracking-widest opacity-60">
                      <span>Selecionar Período</span>
                      <button onClick={() => setIsFilterOpen(false)} className="cursor-pointer"><X size={14} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { id: "all", label: "Tudo (Histórico)" },
                        { id: "15d", label: "Últimos 15 dias" },
                        { id: "30d", label: "Últimos 30 dias" },
                        { id: "60d", label: "Últimos 60 dias" },
                        { id: "year", label: "Último 1 Ano" },
                        { id: "custom", label: "Personalizar" },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            setFilter(f.id as FilterType);
                            if (f.id !== "custom") {
                              setIsFilterOpen(false);
                            }
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl font-bold text-xs text-center transition-all cursor-pointer",
                            filter === f.id 
                              ? "bg-blue-600 text-white shadow-md font-black" 
                              : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:bg-[var(--border-color)] hover:text-[var(--text-primary)]"
                          )}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                    
                    <AnimatePresence>
                      {filter === "custom" && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="pt-2 border-t border-[var(--border-color)]"
                        >
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                              <label className="text-[0.6rem] font-black uppercase opacity-60 w-8">De</label>
                              <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="flex-1 p-2 border-2 border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold" />
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-[0.6rem] font-black uppercase opacity-60 w-8">Até</label>
                              <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="flex-1 p-2 border-2 border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex flex-col items-center gap-6 w-full min-w-0 mt-4">
              
              {/* Top: Pie Chart */}
              <div className="w-[240px] xs:w-[280px] sm:w-[320px] md:w-[380px] h-[240px] xs:h-[280px] sm:h-[320px] md:h-[380px] relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={stats.chartData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" cy="50%" 
                      innerRadius="75%" outerRadius="90%" 
                      paddingAngle={3}
                      stroke="none"
                    >
                      {stats.chartData.map((entry, index) => {
                         const color = CATEGORY_COLORS_MAP[entry.originalId] || '#9CA3AF';
                         return <Cell key={`cell-${index}`} fill={color} />;
                      })}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Central Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none drop-shadow-md px-2">
                  <span className="text-xs font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">Total ({FILTER_LABELS[filter]})</span>
                  <span className="text-2xl xs:text-3xl sm:text-4xl font-black text-[var(--text-primary)] leading-none tracking-tight break-words max-w-[85%] text-center">
                    {formatCurrency(dashboardData.totalMonth)}
                  </span>
                </div>
              </div>

              {/* Bottom: Nova Lista de Categorias (Pills Legend) */}
              <div className="w-full flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5 mt-2 bg-[var(--card-bg)]/50 p-4 sm:p-5 border border-[var(--border-color)] rounded-3xl">
                {stats.chartData.map((cat) => {
                  const color = CATEGORY_COLORS_MAP[cat.originalId] || '#9CA3AF';
                  return (
                    <div key={cat.name} className="flex items-center gap-1.5 min-w-0">
                      <div 
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full shrink-0 shadow-sm" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-bold text-[11px] sm:text-[13px] tracking-tight text-[var(--text-primary)]">
                        {cat.name}
                      </span>
                    </div>
                  );
                })}
                {stats.chartData.length === 0 && (
                  <p className="text-[10px] sm:text-xs text-[var(--text-muted)] italic text-center py-2 w-full">Sem dados no período</p>
                )}
              </div>

              {/* Top/Média Cards */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {/* Top Categoria Card */}
                <div className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-3xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: stats.topCategoria ? CATEGORY_COLORS_MAP[stats.topCategoria.originalId] || '#10B981' : '#10B981' }} />
                  <span className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Top Categoria</span>
                  {stats.topCategoria ? (
                    <>
                      <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] truncate">{stats.topCategoria.name}</h3>
                      <p className="text-sm font-bold mt-1 text-[var(--text-primary)]">{formatCurrency(stats.topCategoria.value)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-bold text-[var(--text-muted)] italic">Nenhum dado</p>
                  )}
                </div>

                {/* Média Card */}
                <div className="w-full bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-3xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#667eea]" />
                  <span className="text-[10px] sm:text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-2">Média por Item</span>
                  <h3 className="text-lg sm:text-xl font-black text-[var(--text-primary)] truncate">{formatCurrency(stats.mediaPorItem)}</h3>
                  <p className="text-sm font-bold mt-1 text-[#667eea]">{stats.itemsCount} {stats.itemsCount === 1 ? 'item analisado' : 'itens analisados'}</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Section: Registros Recentes & Histórico Mensal (alinhados) */}
        <div className="lg:col-span-2 min-w-0 space-y-4 sm:space-y-6">
          <div className="bg-[var(--section-bg)] rounded-3xl p-4 sm:p-6 shadow-sm border-2 border-[var(--border-color)] overflow-hidden min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2">
                <PieIcon size={20} className="text-[#667eea]" /> Registros Recentes
              </h2>
            </div>

            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {recentExpenses.length === 0 ? (
                  <p className="text-center py-10 text-[var(--text-muted)] text-sm italic">Nenhum gasto registrado ainda.</p>
                ) : (
                  recentExpenses.map((exp) => (
                    <motion.div key={exp.id} exit={{ opacity: 0, x: 20 }}>
                      <ExpenseItem
                        expense={exp}
                        updateExpense={updateExpense}
                        deleteExpense={deleteExpense}
                        allowDelete={false}
                        delay={0}
                      />
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {recentExpenses.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] text-center">
                <p className="text-[11px] text-[var(--text-muted)] font-medium">
                  Para excluir ou gerenciar lançamentos, acesse a aba <span className="font-bold text-[var(--text-primary)]">Gestão de Gastos</span>.
                </p>
              </div>
            )}
          </div>

          {/* Histórico Mensal de Gastos */}
          <div className="bg-[var(--section-bg)] rounded-3xl p-5 sm:p-6 shadow-sm border-2 border-[var(--border-color)] min-w-0">
            <div className="flex items-center justify-between mb-4 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <History size={20} className="text-blue-500 shrink-0" />
                <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)] truncate">
                  Histórico Mensal de Gastos
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[var(--text-muted)] shrink-0">
                {monthlyHistory.length} {monthlyHistory.length === 1 ? 'mês' : 'meses'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] mb-4">
              Acompanhe quanto você gastou a cada mês e confira se ficou dentro do limite geral estipulado.
            </p>

            <div className="space-y-3">
              {monthlyHistory.length === 0 ? (
                <div className="text-center py-6 text-[var(--text-muted)] text-xs italic">
                  Nenhum registro histórico de gastos encontrado.
                </div>
              ) : (
                monthlyHistory.map((m) => {
                  const isOpen = expandedHistoryMonth === m.monthKey;
                  return (
                    <div
                      key={m.monthKey}
                      className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-blue-500/40 transition-all min-w-0 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedHistoryMonth(isOpen ? null : m.monthKey)}
                        className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black text-xs shrink-0">
                            <Calendar size={18} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-black text-[var(--text-primary)] truncate">{m.label}</h4>
                            <span className="text-[11px] text-[var(--text-muted)] font-medium">
                              {m.count} {m.count === 1 ? 'transação' : 'transações'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                          <div className="text-left sm:text-right">
                            <div className="text-sm font-black text-[var(--text-primary)]">
                              {formatCurrency(m.total)}
                            </div>
                            {m.limit > 0 && (
                              <div className="text-[10px] text-[var(--text-muted)] font-bold">
                                Teto: {formatCurrency(m.limit)}
                              </div>
                            )}
                          </div>

                          {m.limit > 0 && (
                            <div className="shrink-0">
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1",
                                m.isOver
                                  ? "bg-red-500/10 text-red-500 border border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                              )}>
                                {m.isOver ? (
                                  <>
                                    <AlertCircle size={10} />
                                    <span>{Math.round(m.percent)}% (Acima)</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle size={10} />
                                    <span>{Math.round(m.percent)}% (No limite)</span>
                                  </>
                                )}
                              </span>
                            </div>
                          )}

                          <ChevronDown size={16} className={cn("text-[var(--text-muted)] shrink-0 transition-transform", isOpen && "rotate-180")} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {isOpen && historyMonthDetail && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-[var(--border-color)]"
                          >
                            <div className="p-4 space-y-4">
                              {/* Supermarket summary for this month */}
                              {historyMonthDetail.monthSupermarketProducts.length > 0 && (
                                <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/15 flex items-center justify-between gap-2">
                                  <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] min-w-0">
                                    <ShoppingCart size={13} className="text-blue-500 shrink-0" />
                                    <span className="truncate">Supermercado: {historyMonthDetail.monthSupermarketProducts.length} itens</span>
                                  </span>
                                  <span className="text-xs font-black font-mono text-blue-500 shrink-0">
                                    {formatCurrency(historyMonthDetail.supermarketTotal)}
                                  </span>
                                </div>
                              )}

                              {/* Full expense list for this month */}
                              <div className="space-y-2">
                                {historyMonthDetail.monthExpenses.length === 0 ? (
                                  <p className="text-xs text-[var(--text-muted)] italic text-center py-2">
                                    Nenhum lançamento detalhado neste mês.
                                  </p>
                                ) : (
                                  historyMonthDetail.monthExpenses.map((exp) => (
                                    <ExpenseItem
                                      key={exp.id}
                                      expense={exp}
                                      updateExpense={updateExpense}
                                      deleteExpense={deleteExpense}
                                      allowDelete={false}
                                      delay={0}
                                    />
                                  ))
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
