import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, Layers, Wallet, Calendar, Award, Trash2, X, Sparkles, ChevronDown, ChevronRight, Info, Trophy, Play, Plus, BarChart2, Briefcase, Settings, PieChart as PieChartIcon
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, LineChart, Line } from "recharts";
import { formatCurrency } from "../../lib/utils";
import { apiUrl } from "../../lib/apiBase";
import { B3_ASSET_DATABASE, searchB3Assets, B3AssetData } from "../../data/b3Database";

// TypeScript Interfaces
interface Transaction {
  id: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  date: string;
  type: "compra" | "venda" | "dividendo";
  category: "Ações" | "FIIs" | "Criptomoedas" | "ETFs" | "Outros";
  sector: string;
  dividendType?: "Dividendo" | "JSCP" | "Rendimento";
  status?: "Recebido" | "A Receber";
}

interface Asset {
  code: string;
  name: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  category: "Ações" | "FIIs" | "Criptomoedas" | "ETFs" | "Outros";
  sector: string;
  proventosTotal: number;
}

interface Goal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  monthlyContribution: number;
  deadline: string;
  completed: boolean;
}

const ALLOCATION_COLORS: Record<string, string> = {
  "Ações": "#3b82f6",       // Blue
  "FIIs": "#10b981",        // Emerald
  "Criptomoedas": "#f59e0b", // Amber
  "ETFs": "#8b5cf6",        // Violet
  "Outros": "#cfb53b"       // Gold
};

export default function InvestimentosTab() {
  const [activeSubTab, setActiveSubTab] = useState<"carteira" | "lancamentos" | "analise" | "metas" | "resumo" | "patrimonio" | "proventos" | "rentabilidade">("carteira");
  const [carteiraSubTab, setCarteiraSubTab] = useState<"visao_geral" | "ativos" | "proventos" | "rentabilidade">("visao_geral");
  const [b3Analysis, setB3Analysis] = useState<{
    updatedAt: string;
    overview: string;
    acoesRank: any[];
    fiisRank: any[];
  } | null>(null);
  const [isB3Analyzing, setIsB3Analyzing] = useState(false);
  const [b3AnalysisError, setB3AnalysisError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);


  const fetchB3Analysis = async () => {
    try {
      const res = await fetch(apiUrl("/api/b3/rankings/all"));
      if (res.ok) {
        const data = await res.json();
        setB3Analysis(data);
      } else {
        console.error("Failed to fetch initial B3 rankings");
      }
    } catch (error) {
      console.error("Error fetching B3 rankings:", error);
    }
  };

  const triggerB3Analysis = async () => {
    setIsB3Analyzing(true);
    setB3AnalysisError(null);
    const stepsCount = 7;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % stepsCount;
      setLoadingStep(currentStep);
    }, 1800);

    try {
      const res = await fetch(apiUrl("/api/b3/analyze"), { method: "POST" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.details || errData.error || "Erro de rede no servidor");
      }
      const data = await res.json();
      setB3Analysis(data.results);
    } catch (error: any) {
      console.error("B3 Analysis trigger error:", error);
      setB3AnalysisError(error.message || "Erro desconhecido ao rodar análise.");
    } finally {
      clearInterval(interval);
      setIsB3Analyzing(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === "analise") {
      fetchB3Analysis();
    }
  }, [activeSubTab]);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("tarflow_transactions");
    return saved ? JSON.parse(saved) : []; // Clean portfolio by default
  });

  // Tab drag-to-scroll refs & state
  const tabRef = useRef<HTMLDivElement>(null);
  const [isTabDragging, setIsTabDragging] = useState(false);
  const [tabStartX, setTabStartX] = useState(0);
  const [tabScrollLeft, setTabScrollLeft] = useState(0);

  const handleTabMouseDown = (e: React.MouseEvent) => {
    if (!tabRef.current) return;
    setIsTabDragging(true);
    setTabStartX(e.pageX - tabRef.current.offsetLeft);
    setTabScrollLeft(tabRef.current.scrollLeft);
  };

  const handleTabMouseLeave = () => {
    setIsTabDragging(false);
  };

  const handleTabMouseUp = () => {
    setIsTabDragging(false);
  };

  const handleTabMouseMove = (e: React.MouseEvent) => {
    if (!isTabDragging || !tabRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabRef.current.offsetLeft;
    const walk = (x - tabStartX) * 1.5; // drag sensitivity
    tabRef.current.scrollLeft = tabScrollLeft - walk;
  };

  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("tarflow_goals");
    if (saved) return JSON.parse(saved);
    return [
      { id: "g1", title: "Média de Rendimentos Mensais ", currentValue: 11.50, targetValue: 50.00, monthlyContribution: 150, deadline: "2027-12", completed: false },
      { id: "g2", title: "Patrimônio Alvo", currentValue: 12000, targetValue: 15000, monthlyContribution: 1000, deadline: "2026-12", completed: false }
    ];
  });

  // Category view expansion trackers
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({
    Ações: true,
    FIIs: true,
    Criptomoedas: true,
    ETFs: true,
    Outros: true
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State Values
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newType, setNewType] = useState<Transaction["type"]>("compra");
  const [newCategory, setNewCategory] = useState<Transaction["category"]>("Ações");
  const [newSector, setNewSector] = useState("");
  const [newDivType, setNewDivType] = useState<NonNullable<Transaction["dividendType"]>>("Dividendo");
  const [newDivStatus, setNewDivStatus] = useState<NonNullable<Transaction["status"]>>("Recebido");

  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<B3AssetData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Manual Average Price Overrides State
  const [manualAvgPrices, setManualAvgPrices] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("tarflow_manual_avg_prices");
    return saved ? JSON.parse(saved) : {};
  });

  const [editingAvgAsset, setEditingAvgAsset] = useState<string | null>(null);
  const [tempAvgPrice, setTempAvgPrice] = useState<string>("");

  // Auto-Sync to State persistence
  useEffect(() => {
    localStorage.setItem("tarflow_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("tarflow_manual_avg_prices", JSON.stringify(manualAvgPrices));
  }, [manualAvgPrices]);

  useEffect(() => {
    localStorage.setItem("tarflow_goals", JSON.stringify(goals));
  }, [goals]);

  // Autocomplete Listener using Complete B3 Asset Database
  useEffect(() => {
    if (!newCode.trim()) {
      setAutocompleteSuggestions([]);
      return;
    }
    const matches = searchB3Assets(newCode, 15);
    setAutocompleteSuggestions(matches);
  }, [newCode]);

  // Compute Current Asset holdings from transaction list
  const calculatedAssets = useMemo(() => {
    const assetMap: Record<string, {
      code: string;
      name: string;
      qty: number;
      totalCost: number;
      category: Asset["category"];
      sector: string;
      proventosTotal: number;
    }> = {};

    transactions.forEach(tx => {
      const code = tx.code.toUpperCase();
      if (!assetMap[code]) {
        assetMap[code] = {
          code,
          name: tx.name,
          qty: 0,
          totalCost: 0,
          category: tx.category,
          sector: tx.sector || "Outros",
          proventosTotal: 0
        };
      }

      if (tx.type === "compra") {
        assetMap[code].qty += tx.qty;
        assetMap[code].totalCost += tx.qty * tx.price;
      } else if (tx.type === "venda") {
        assetMap[code].qty = Math.max(0, assetMap[code].qty - tx.qty);
      } else if (tx.type === "dividendo") {
        assetMap[code].proventosTotal += tx.price;
      }
    });

    return Object.values(assetMap)
      .filter(a => a.qty > 0)
      .map(a => {
        const livePrice = B3_ASSET_DATABASE[a.code]?.price || (a.totalCost / a.qty);
        const override = manualAvgPrices[a.code.toUpperCase()];
        const avgPriceValue = override !== undefined ? override : Number((a.totalCost / a.qty).toFixed(2));
        return {
          code: a.code,
          name: a.name,
          qty: a.qty,
          avgPrice: avgPriceValue,
          currentPrice: livePrice,
          category: a.category,
          sector: a.sector,
          proventosTotal: a.proventosTotal
        };
      });
  }, [transactions, manualAvgPrices]);

  // Basic KPI Math
  const totalPatrimony = useMemo(() => {
    return calculatedAssets.reduce((sum, a) => sum + (a.qty * a.currentPrice), 0);
  }, [calculatedAssets]);

  const totalCost = useMemo(() => {
    return calculatedAssets.reduce((sum, a) => sum + (a.qty * a.avgPrice), 0);
  }, [calculatedAssets]);

  const profitValue = totalPatrimony - totalCost;
  const profitPercentage = totalCost > 0 ? (profitValue / totalCost) * 100 : 0;

  const totalDividendsReceived = useMemo(() => {
    return transactions
      .filter(t => t.type === "dividendo" && t.status !== "A Receber")
      .reduce((sum, t) => sum + t.price, 0);
  }, [transactions]);

  // Chart Allocations Data
  const allocationChartData = useMemo(() => {
    const raw: Record<string, number> = { Ações: 0, FIIs: 0, Criptomoedas: 0, ETFs: 0, Outros: 0 };
    calculatedAssets.forEach(a => {
      raw[a.category] += (a.qty * a.currentPrice);
    });
    return Object.keys(raw)
      .map(cat => ({
        name: cat,
        value: raw[cat],
        pct: totalPatrimony > 0 ? (raw[cat] / totalPatrimony) * 100 : 0
      }))
      .filter(item => item.value > 0);
  }, [calculatedAssets, totalPatrimony]);

  // Divider sorted records
  const dividendsHistory = useMemo(() => {
    return transactions
      .filter(t => t.type === "dividendo")
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions]);

  // Form selections and actions
  const selectSuggestion = (asset: B3AssetData) => {
    setNewCode(asset.code);
    setNewName(asset.name);
    setNewPrice(String(asset.price));
    setNewCategory(asset.category);
    setNewSector(asset.sector);
    setShowSuggestions(false);
  };

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newQty || !newPrice) return;

    const tx: Transaction = {
      id: "tx_" + Date.now(),
      code: newCode.toUpperCase().trim(),
      name: newName.trim() || newCode.toUpperCase().trim(),
      qty: parseFloat(newQty),
      price: parseFloat(newPrice),
      date: newDate,
      type: newType,
      category: newType === "dividendo" ? (B3_ASSET_DATABASE[newCode.toUpperCase()]?.category || "Ações") : newCategory,
      sector: newSector.trim() || "Outros",
      dividendType: newType === "dividendo" ? newDivType : undefined,
      status: newType === "dividendo" ? newDivStatus : undefined
    };

    setTransactions(prev => [...prev, tx]);
    setIsAddModalOpen(false);

    // Reset fields
    setNewCode("");
    setNewName("");
    setNewQty("");
    setNewPrice("");
    setNewSector("");
  };

  const deleteTransaction = (id: string) => {
    // Avoid native blocks in sandboxed iframe environments
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const deleteAssetByCode = (code: string) => {
    setTransactions(prev => prev.filter(t => t.code !== code));
  };

  const handleSaveAvgPrice = (code: string) => {
    const val = parseFloat(tempAvgPrice);
    if (isNaN(val) || val <= 0) {
      // Revert to computed average price if invalid or blank
      const updated = { ...manualAvgPrices };
      delete updated[code.toUpperCase()];
      setManualAvgPrices(updated);
    } else {
      setManualAvgPrices(prev => ({
        ...prev,
        [code.toUpperCase()]: val
      }));
    }
    setEditingAvgAsset(null);
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabRef.current) {
      const scrollAmount = 150;
      tabRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const clearAllData = () => {
    // Avoid native blocks in sandboxed iframe environments
    setTransactions([]);
    localStorage.removeItem("tarflow_transactions");
  };

  // Goal Form Fields
  const [gTitle, setGTitle] = useState("");
  const [gTarget, setGTarget] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gTitle || !gTarget) return;

    const nG: Goal = {
      id: "goal_" + Date.now(),
      title: gTitle,
      currentValue: 0,
      targetValue: parseFloat(gTarget),
      monthlyContribution: 100,
      deadline: "2027-12",
      completed: false
    };

    setGoals(prev => [nG, ...prev]);
    setGTitle("");
    setGTarget("");
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <div className="w-full text-left font-sans dark:text-zinc-100 relative transition-all duration-300">
      
      {/* Outer wrapper panel */}
      <div className="bg-[var(--section-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 w-full shadow-sm relative overflow-hidden">
        
        {/* Header controller */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5 mb-5">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <Briefcase size={22} className="text-emerald-500 shrink-0" />
              Investimentos
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              Consolidação de carteira, proventos, custódia e análise fundamentalista B3.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl shadow-md cursor-pointer transition-all text-xs font-black uppercase tracking-wider"
            >
              <Plus size={15} className="stroke-[3]" />
              Novo Lançamento
            </button>

            {transactions.length > 0 && (
              <button
                onClick={clearAllData}
                className="flex items-center gap-1 px-3 py-2 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/5 transition-all cursor-pointer text-xs font-bold rounded-xl"
              >
                <Trash2 size={13} />
                Limpar Carteira
              </button>
            )}
          </div>
        </div>

        {/* Streamlined Main Subtabs Navigation Bar (Botões Pequenos) */}
        <div id="investments-tab-nav" className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-6 bg-[var(--card-bg)]/40 p-2 rounded-2xl border border-[var(--border-color)]">
          {[
            { id: "carteira", label: `Minha Carteira (${calculatedAssets.length})`, icon: <Briefcase size={14} className="text-emerald-500" /> },
            { id: "lancamentos", label: "Histórico de Custódia", icon: <Layers size={14} className="text-indigo-500" /> },
            { id: "analise", label: "Análise IA B3", icon: <Sparkles size={14} className="text-amber-500" /> },
            { id: "metas", label: "Metas de Investimento", icon: <Trophy size={14} className="text-purple-500" /> }
          ].map((tab) => {
            const isSelected = 
              activeSubTab === tab.id || 
              (tab.id === "carteira" && (activeSubTab === "resumo" || activeSubTab === "patrimonio" || activeSubTab === "proventos" || activeSubTab === "rentabilidade"));

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "carteira") {
                    setActiveSubTab("carteira");
                    setCarteiraSubTab("visao_geral");
                  } else {
                    setActiveSubTab(tab.id as any);
                  }
                }}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer select-none text-center ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md font-black scale-[1.02]"
                    : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--section-bg)] border border-[var(--border-color)]"
                }`}
              >
                {tab.icon}
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- 7. ANÁLISE IA B3 (SEM DEPENDER DE TER TRANSAÇÕES) --- */}
        {activeSubTab === "analise" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-black">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[var(--text-primary)]">Análise Fundamentalista B3 com IA</h3>
                  <p className="text-xs text-[var(--text-muted)]">Indicadores P/L, P/VP, Dividend Yield e triagem automatizada</p>
                </div>
              </div>

              <button
                onClick={triggerB3Analysis}
                disabled={isB3Analyzing}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={14} className={isB3Analyzing ? "animate-spin" : ""} />
                <span>{isB3Analyzing ? "Processando Análise..." : "Atualizar Análise IA"}</span>
              </button>
            </div>

            {b3Analysis && (
              <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl space-y-4">
                <p className="text-xs text-[var(--text-muted)]">{b3Analysis.overview}</p>
              </div>
            )}
          </div>
        )}

        {/* --- CARTEIRA INTERNAL SUB-NAVIGATION (Quando dentro de Minha Carteira) --- */}
        {(activeSubTab === "carteira" || activeSubTab === "resumo" || activeSubTab === "patrimonio" || activeSubTab === "proventos" || activeSubTab === "rentabilidade") && (
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] mb-6 shadow-sm">
            {[
              { id: "visao_geral", label: "Visão Geral", icon: <PieChartIcon size={13} /> },
              { id: "ativos", label: `Meus Ativos (${calculatedAssets.length})`, icon: <Briefcase size={13} /> },
              { id: "proventos", label: "Proventos & Dividendos", icon: <Calendar size={13} /> },
              { id: "rentabilidade", label: "Rentabilidade vs CDI", icon: <TrendingUp size={13} /> }
            ].map((sub) => {
              const isSubActive = 
                (activeSubTab === "carteira" && carteiraSubTab === sub.id) ||
                (sub.id === "visao_geral" && activeSubTab === "resumo") ||
                (sub.id === "ativos" && activeSubTab === "patrimonio") ||
                (sub.id === "proventos" && activeSubTab === "proventos") ||
                (sub.id === "rentabilidade" && activeSubTab === "rentabilidade");

              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveSubTab("carteira");
                    setCarteiraSubTab(sub.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSubActive
                      ? "bg-emerald-600 text-white shadow-sm font-black scale-[1.02]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--section-bg)]"
                  }`}
                >
                  {sub.icon}
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* --- PORTFOLIO EMPTY STATE (Only for portfolio sub-tabs if no transactions) --- */}
        {activeSubTab !== "analise" && transactions.length === 0 ? (
          <div className="py-16 px-4 flex flex-col items-center text-center justify-center bg-[var(--card-bg)]/20 border border-dashed border-[var(--border-color)] rounded-3xl max-w-lg mx-auto my-6 p-6">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-2xl border border-blue-500/20 mb-5">
              <Wallet size={28} />
            </div>
            
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wide">
              Carteira Pronta para Lançamentos
            </h3>
            
            <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed max-w-sm">
              Você ainda não cadastrou ativos na sua custódia. Clique no botão de <strong>Novo Lançamento</strong> acima para pesquisar qualquer ação da B3 (PETR4, BBAS3, etc.), FII ou Criptomoeda com autocompletar instantâneo.
            </p>

            <div className="mt-6 w-full max-w-xs">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs py-3 px-4 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Plus size={14} className="stroke-[3]" />
                Fazer Primeiro Lançamento
              </button>
            </div>
          </div>
        ) : activeSubTab !== "analise" && (
          <div>
            {/* SUB-TABS BODY CONTAINER */}
            
            {/* 1. RESUMO / VISÃO GERAL */}
            {((activeSubTab === "carteira" && carteiraSubTab === "visao_geral") || activeSubTab === "resumo") && (
              <div className="space-y-6">
                
                {/* --- DIVISÃO POR CLASSES DE ATIVOS (EM DESTAQUE NO INÍCIO) --- */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 sm:p-6 rounded-2xl shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-sm sm:text-base font-black uppercase text-[var(--text-primary)] tracking-tight">
                          Divisão por Classes de Ativos
                        </h3>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">
                        Distribuição e alocação estratégica do seu patrimônio investido.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveSubTab("carteira");
                        setCarteiraSubTab("ativos");
                      }}
                      className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      Ver Detalhes dos Ativos <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Visual Donut & Interactive Category Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    
                    {/* Left Donut Graph */}
                    <div className="lg:col-span-4 flex flex-col items-center justify-center p-3 bg-zinc-500/5 dark:bg-zinc-800/20 rounded-xl border border-[var(--border-color)]">
                      <div className="w-40 h-40 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={allocationChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius="72%"
                              outerRadius="95%"
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {allocationChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || "#3b82f6"} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-black">Patrimônio</span>
                          <span className="text-xs sm:text-sm font-black font-mono text-[var(--text-primary)] mt-0.5">{formatCurrency(totalPatrimony)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
                        {allocationChartData.map((item, id) => (
                          <div key={id} className="flex items-center gap-1.5 text-[11px] font-mono">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[item.name] }} />
                            <span className="text-[var(--text-muted)] font-semibold">{item.name}:</span>
                            <span className="font-bold text-[var(--text-primary)]">{item.pct.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Interactive Class Grid Cards */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { name: "Ações", color: "#3b82f6", bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-500" },
                        { name: "FIIs", color: "#10b981", bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-500" },
                        { name: "Criptomoedas", color: "#f59e0b", bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500" },
                        { name: "ETFs", color: "#8b5cf6", bg: "bg-purple-500/10", border: "border-purple-500/20", text: "text-purple-500" },
                      ].map((cat) => {
                        const items = calculatedAssets.filter(a => a.category === cat.name || (cat.name === "ETFs" && (a.category === "ETFs" || a.category === "Outros")));
                        const totalVal = items.reduce((sum, a) => sum + (a.qty * a.currentPrice), 0);
                        const pct = totalPatrimony > 0 ? (totalVal / totalPatrimony) * 100 : 0;

                        return (
                          <div
                            key={cat.name}
                            onClick={() => {
                              setActiveSubTab("carteira");
                              setCarteiraSubTab("ativos");
                            }}
                            className="p-4 bg-[var(--section-bg)] border border-[var(--border-color)] hover:border-blue-500/40 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full`} style={{ backgroundColor: cat.color }} />
                                <span className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                                  {cat.name}
                                </span>
                              </div>
                              <span className={`text-xs font-black font-mono ${cat.text}`}>
                                {pct.toFixed(1)}%
                              </span>
                            </div>

                            <div className="mt-3">
                              <div className="text-lg font-black font-mono text-[var(--text-primary)]">
                                {formatCurrency(totalVal)}
                              </div>
                              <div className="w-full bg-[var(--border-color)] h-1.5 rounded-full overflow-hidden mt-2">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: cat.color }}
                                />
                              </div>
                            </div>

                            <div className="mt-2.5 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                              <span>{items.length} {items.length === 1 ? 'ativo' : 'ativos'}</span>
                              <span className="text-blue-500 font-bold flex items-center group-hover:translate-x-0.5 transition-transform">
                                Ver ativos <ChevronRight size={11} />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* KPI Top Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Patrimônio */}
                  <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Patrimônio Atual</span>
                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span className="text-xl sm:text-2xl font-black font-mono text-[var(--text-primary)]">{formatCurrency(totalPatrimony)}</span>
                        <span className={`text-[10px] font-black ${profitValue >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {profitPercentage >= 0 ? "+" : ""}{profitPercentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-2">
                      Custo total investido: <strong className="font-mono text-[var(--text-primary)]">{formatCurrency(totalCost)}</strong>
                    </span>
                  </div>

                  {/* Lucro Total */}
                  <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Rendimento da Carteira</span>
                      <div className="flex items-baseline mt-1">
                        <span className={`text-xl sm:text-2xl font-black font-mono ${profitValue >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {formatCurrency(profitValue)}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-2">
                      Valorização direta de ativos
                    </span>
                  </div>

                  {/* Proventos Recebidos */}
                  <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Proventos Acumulados</span>
                      <div className="flex items-baseline mt-1">
                        <span className="text-xl sm:text-2xl font-black text-blue-500 font-mono">{formatCurrency(totalDividendsReceived)}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-2">
                      Rendas recorrentes creditadas
                    </span>
                  </div>

                  {/* Rentabilidade Geral */}
                  <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--text-muted)]">Resultado %</span>
                      <div className="flex items-baseline mt-1">
                        <span className={`text-xl sm:text-2xl font-black font-mono ${profitValue >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                          {profitPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-2">
                      Rentabilidade acumulada total
                    </span>
                  </div>

                </div>

                {/* Sub Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pointer-events-auto">
                  
                  {/* Left: Patrimônio Evolution chart */}
                  <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                    <div className="border-b border-[var(--border-color)] pb-3 mb-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-black uppercase text-[var(--text-primary)] flex items-center gap-1.5">
                          <TrendingUp size={14} className="text-blue-500" /> Evolução de Custódia
                        </h3>
                        <p className="text-[10px] text-[var(--text-muted)]">Histórico de rendimento comparativo.</p>
                      </div>
                    </div>

                    <div className="h-48 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={
                          totalCost > 0 ? [
                            { month: "Jan", cost: totalCost * 0.70, value: totalPatrimony * 0.65 },
                            { month: "Fev", cost: totalCost * 0.81, value: totalPatrimony * 0.77 },
                            { month: "Mar", cost: totalCost * 0.88, value: totalPatrimony * 0.84 },
                            { month: "Hoje", cost: totalCost, value: totalPatrimony }
                          ] : []
                        }>
                          <defs>
                            <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <YAxis tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVal)" name="Valor Atual" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Right: Allocation Pie Chart */}
                  <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                    <div className="border-b border-[var(--border-color)] pb-3 mb-4">
                      <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Divisão por Classes</h3>
                      <p className="text-[10px] text-[var(--text-muted)]">Concentração atual por classe de ativo.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                      <div className="w-32 h-32 relative flex-shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={allocationChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius="75%"
                              outerRadius="95%"
                              paddingAngle={3}
                              dataKey="value"
                              stroke="none"
                            >
                              {allocationChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || "#e4e4e7"} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                          <span className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">Patrimônio</span>
                          <span className="text-[11px] font-black font-mono mt-0.5">{formatCurrency(totalPatrimony)}</span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        {allocationChartData.map((item, id) => (
                          <div key={id} className="flex items-center justify-between text-[11px] font-mono">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[item.name] }} />
                              <span className="text-[var(--text-primary)] font-bold">{item.name}</span>
                            </div>
                            <span className="text-[var(--text-muted)]">{item.pct.toFixed(1)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Info summary row card */}
                <div className="p-4 bg-zinc-500/5 dark:bg-zinc-800/20 border border-[var(--border-color)] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Info size={14} className="text-blue-500 flex-shrink-0" />
                    <span>Seu portfólio possui no momento <strong>{calculatedAssets.length}</strong> ativos com saldo positivo.</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveSubTab("carteira");
                      setCarteiraSubTab("ativos");
                    }}
                    className="text-blue-500 hover:text-blue-600 font-extrabold flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    Ver Meus Ativos <ChevronRight size={13} />
                  </button>
                </div>

              </div>
            )}

            {/* 2. MEUS ATIVOS / PATRIMÔNIO (FLATTENED SAFE STRUCTURE) */}
            {((activeSubTab === "carteira" && carteiraSubTab === "ativos") || activeSubTab === "patrimonio") && (
              <div className="space-y-6">
                {["Ações", "FIIs", "Criptomoedas", "ETFs", "Outros"].map((cat) => {
                  const items = calculatedAssets.filter(a => a.category === cat);
                  if (items.length === 0) return null;

                  const subtotal = items.reduce((sum, a) => sum + (a.qty * a.currentPrice), 0);
                  const isExpanded = expandedCats[cat] !== false;

                  return (
                    <div key={cat} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                      
                      {/* Accordion Header bar */}
                      <div 
                        onClick={() => setExpandedCats(prev => ({ ...prev, [cat]: !isExpanded }))}
                        className="p-4 bg-zinc-500/5 hover:bg-zinc-500/10 transition-colors border-b border-[var(--border-color)] flex justify-between items-center cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[cat] }} />
                          <h3 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                            {cat} ({items.length})
                          </h3>
                        </div>

                        <div className="text-[11px] font-mono text-[var(--text-muted)]">
                          Subtotal: <strong className="text-[var(--text-primary)] font-black">{formatCurrency(subtotal)}</strong>
                        </div>
                      </div>

                      {/* Accordion Content Panel */}
                      {isExpanded && (
                        <div>
                          
                          {/* Desktop Large Table View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="w-full text-left text-[11px] font-mono leading-none">
                              <thead>
                                <tr className="border-b border-[var(--border-color)] bg-zinc-500/5 text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-sans">
                                  <th className="p-3 pl-4">Ativo</th>
                                  <th className="p-3">Qtde</th>
                                  <th className="p-3 text-right">Preço Médio</th>
                                  <th className="p-3 text-right">Preço Atual</th>
                                  <th className="p-3 text-right">Saldo Atual</th>
                                  <th className="p-3 text-right text-blue-500">Proventos</th>
                                  <th className="p-3 text-center">P/L</th>
                                  <th className="p-3 text-center">P/VP</th>
                                  <th className="p-3 text-center">DY%</th>
                                  <th className="p-3 text-center">Recomendado</th>
                                  <th className="p-3 text-center pr-4">Excluir</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[var(--border-color)]">
                                {items.map((asset, idx) => {
                                  const details = B3_ASSET_DATABASE[asset.code];
                                  const saldo = asset.qty * asset.currentPrice;
                                  const diffPercent = ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;

                                  return (
                                    <tr key={idx} className="hover:bg-zinc-500/5 transition-colors">
                                      <td className="p-3 pl-4 font-black text-blue-600 dark:text-blue-400">
                                        {asset.code}
                                        <span className="block font-sans text-[9px] font-normal text-[var(--text-muted)] mt-0.5 truncate max-w-[120px]">
                                          {asset.name}
                                        </span>
                                      </td>
                                      <td className="p-3 font-bold">{asset.qty}</td>
                                      <td className="p-3 text-right">
                                        {editingAvgAsset === asset.code ? (
                                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                                            <span className="text-[10px] text-[var(--text-muted)]">R$</span>
                                            <input
                                              type="number"
                                              step="0.01"
                                              autoFocus
                                              value={tempAvgPrice}
                                              onChange={(e) => setTempAvgPrice(e.target.value)}
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSaveAvgPrice(asset.code);
                                                if (e.key === "Escape") setEditingAvgAsset(null);
                                              }}
                                              className="w-20 bg-[var(--card-bg)] text-right text-xs p-1 border border-blue-500 rounded text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <button
                                              onClick={() => handleSaveAvgPrice(asset.code)}
                                              className="text-emerald-500 hover:text-emerald-400 p-0.5 rounded cursor-pointer"
                                              title="Salvar"
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                              </svg>
                                            </button>
                                            <button
                                              onClick={() => setEditingAvgAsset(null)}
                                              className="text-red-500 hover:text-red-400 p-0.5 rounded cursor-pointer"
                                              title="Cancelar"
                                            >
                                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                              </svg>
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-end gap-1.5 group select-none">
                                            <span className="font-bold">{formatCurrency(asset.avgPrice)}</span>
                                            <button
                                              onClick={() => {
                                                setEditingAvgAsset(asset.code);
                                                setTempAvgPrice(asset.avgPrice.toString());
                                              }}
                                              className="text-zinc-500 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 p-0.5 cursor-pointer"
                                              title="Editar preço médio"
                                            >
                                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                              </svg>
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-3 text-right">{formatCurrency(asset.currentPrice)}</td>
                                      <td className="p-3 text-right font-extrabold text-[var(--text-primary)]">
                                        {formatCurrency(saldo)}
                                        <span className={`block text-[9px] font-bold mt-0.5 ${diffPercent >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                                          {diffPercent >= 0 ? "+" : ""}{diffPercent.toFixed(1)}%
                                        </span>
                                      </td>
                                      <td className="p-3 text-right text-blue-500 font-extrabold">{formatCurrency(asset.proventosTotal)}</td>
                                      <td className="p-3 text-center text-zinc-400">{details?.pl ? details.pl.toFixed(1) : "-"}</td>
                                      <td className="p-3 text-center text-zinc-400">{details?.pvp ? details.pvp.toFixed(2) : "-"}</td>
                                      <td className="p-3 text-center text-emerald-500 font-bold">{details?.dy ? `${details.dy.toFixed(1)}%` : "-"}</td>
                                      <td className="p-3 text-center">
                                        <span className={`text-[9px] opacity-90 px-2 py-0.5 rounded-full font-sans font-bold uppercase ${details?.buyDecision === "Sim" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
                                          {details?.buyDecision || "Não"}
                                        </span>
                                      </td>
                                      <td className="p-3 text-center pr-4">
                                        <button 
                                          onClick={() => deleteAssetByCode(asset.code)}
                                          className="text-zinc-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile Smartphone Specific Responsive Cards View */}
                          <div className="md:hidden divide-y divide-[var(--border-color)]">
                            {items.map((asset, idx) => {
                              const details = B3_ASSET_DATABASE[asset.code];
                              const saldo = asset.qty * asset.currentPrice;
                              const diffPercent = ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;

                              return (
                                <div key={idx} className="p-4 space-y-3 relative text-xs">
                                  
                                  <div className="flex justify-between items-center border-b border-dashed border-[var(--border-color)] pb-2">
                                    <div className="flex items-center gap-1">
                                      <span className="font-mono text-sm font-black text-blue-500">{asset.code}</span>
                                      <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[130px]">({asset.name})</span>
                                    </div>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${details?.buyDecision === "Sim" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500"}`}>
                                      Comprar: {details?.buyDecision || "Não"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-[11px]">
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Qtde</span>
                                      <span className="font-bold text-[var(--text-primary)]">{asset.qty}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Saldo</span>
                                      <span className="font-black text-[var(--text-primary)]">{formatCurrency(saldo)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Preço Médio</span>
                                      {editingAvgAsset === asset.code ? (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <input
                                            type="number"
                                            step="0.01"
                                            autoFocus
                                            value={tempAvgPrice}
                                            onChange={(e) => setTempAvgPrice(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") handleSaveAvgPrice(asset.code);
                                              if (e.key === "Escape") setEditingAvgAsset(null);
                                            }}
                                            className="w-16 bg-[var(--card-bg)] text-left text-[11px] p-0.5 px-1 border border-blue-500 rounded text-[var(--text-primary)] focus:outline-none"
                                          />
                                          <button
                                            onClick={() => handleSaveAvgPrice(asset.code)}
                                            className="text-emerald-500 p-0.5 rounded"
                                            title="Confirmar"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                          </button>
                                          <button
                                            onClick={() => setEditingAvgAsset(null)}
                                            className="text-red-500 p-0.5 rounded"
                                            title="Cancelar"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 mt-0.5">
                                          <span>{formatCurrency(asset.avgPrice)}</span>
                                          <button
                                            onClick={() => {
                                              setEditingAvgAsset(asset.code);
                                              setTempAvgPrice(asset.avgPrice.toString());
                                            }}
                                            className="text-blue-500 hover:text-blue-600 p-1 rounded hover:bg-blue-500/10 transition-colors"
                                            title="Editar Preço Médio"
                                          >
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Cotação</span>
                                      <span>{formatCurrency(asset.currentPrice)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Proventos</span>
                                      <span className="text-blue-500 font-bold">{formatCurrency(asset.proventosTotal)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] block">Rentabilidade</span>
                                      <strong className={diffPercent >= 0 ? "text-emerald-500" : "text-red-500"}>
                                        {diffPercent >= 0 ? "+" : ""}{diffPercent.toFixed(1)}%
                                      </strong>
                                    </div>
                                  </div>

                                  <div className="pt-2 flex justify-between items-center text-[10px] bg-zinc-500/5 px-2 py-1 bg-zinc-500/5 rounded-lg">
                                    <span className="text-[var(--text-muted)]">Setor: {details?.sector || "Vários"}</span>
                                    <button 
                                      onClick={() => deleteAssetByCode(asset.code)}
                                      className="text-red-500/80 hover:text-red-500 font-bold hover:underline cursor-pointer"
                                    >
                                      Remover Ativo
                                    </button>
                                  </div>

                                </div>
                              );
                            })}
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. PROVENTOS */}
            {((activeSubTab === "carteira" && carteiraSubTab === "proventos") || activeSubTab === "proventos") && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Left Resumo Box */}
                  <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Acumulado de Rendimentos</h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Visão geral do dividend yield recorrente.</p>
                      
                      <div className="mt-4 border border-[var(--border-color)] bg-zinc-500/5 p-4 rounded-xl space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-zinc-400">
                            <span>Média Mensal Estimada</span>
                            <span className="text-[var(--text-primary)] font-mono">75.00% da Meta</span>
                          </div>
                          
                          <div className="w-full bg-zinc-500/10 h-2.5 rounded-full mt-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-[100%] rounded-full" style={{ width: "75%" }} />
                          </div>
                        </div>

                        <div className="border-t border-[var(--border-color)] pt-3.5 flex justify-between gap-1 items-center font-mono">
                          <div>
                            <span className="text-[9px] text-[var(--text-muted)] block uppercase">Últimos Dividendos</span>
                            <strong className="text-sm font-black text-blue-500">{formatCurrency(totalDividendsReceived)}</strong>
                          </div>
                          <div>
                            <span className="text-[9px] text-[var(--text-muted)] block uppercase">Rendimento Acumulado</span>
                            <strong className="text-sm font-black text-emerald-500">{formatCurrency(totalDividendsReceived)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 text-[10px] text-[var(--text-muted)] leading-relaxed italic flex items-center gap-1.5 bg-zinc-500/5 p-2.5 rounded-xl border border-[var(--border-color)]">
                      <Info size={13} className="text-blue-500 flex-shrink-0" />
                      <span>Dividendos de ações do mercado doméstico são extends de imposto de renda (Lei 9.249/95).</span>
                    </div>
                  </div>

                  {/* Right evolution bar chart */}
                  <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                    <div className="border-b border-[var(--border-color)] pb-3 mb-4">
                      <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Rendimentos por Mês</h3>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={
                          totalDividendsReceived > 0 ? [
                            { month: "Jan", recebido: totalDividendsReceived * 0.15 },
                            { month: "Fev", recebido: totalDividendsReceived * 0.25 },
                            { month: "Mar", recebido: totalDividendsReceived * 0.20 },
                            { month: "Abr", recebido: totalDividendsReceived * 0.40 }
                          ] : []
                        }>
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <YAxis tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <Tooltip formatter={(v: number) => formatCurrency(v)} />
                          <Bar dataKey="recebido" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pago" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Monthly history matrix grid (Pierre alignment) */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                  <div className="p-3.5 border-b border-[var(--border-color)] bg-zinc-500/5">
                    <h4 className="text-xs font-black uppercase text-[var(--text-primary)]">Mapa Trimestral de Creditamento</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[10px] font-mono text-center min-w-[500px]">
                      <thead>
                        <tr className="bg-zinc-500/5 text-[9px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-color)]">
                          <th className="p-2.5 text-left pl-4 font-sans">Periodo</th>
                          <th className="p-2">Trimestre 1</th>
                          <th className="p-2">Trimestre 2</th>
                          <th className="p-2">Trimestre 3</th>
                          <th className="p-2">Trimestre 4</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)] text-[var(--text-primary)]">
                        <tr className="hover:bg-zinc-500/5">
                          <td className="p-2.5 text-left pl-4 font-black font-sans">Ano Corrente</td>
                          <td className="p-2">{formatCurrency(totalDividendsReceived * 0.4)}</td>
                          <td className="p-2">{formatCurrency(totalDividendsReceived * 0.6)}</td>
                          <td className="p-2 opacity-50">R$ 0,00</td>
                          <td className="p-2 opacity-50">R$ 0,00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dividends list register log */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                  <div className="p-3.5 border-b border-[var(--border-color)] bg-zinc-500/5 flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase text-[var(--text-primary)]">Todos os Rendimentos creditados</h4>
                    <span className="text-[10px] font-black font-mono text-zinc-400">Records: {dividendsHistory.length}</span>
                  </div>

                  {dividendsHistory.length === 0 ? (
                    <div className="p-6 text-center text-xs italic text-[var(--text-muted)]">
                      Nenhum pagamento de provento registrado. Lançamentos do tipo provento surgirão aqui.
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border-color)]">
                      {dividendsHistory.map((d, index) => (
                        <div key={index} className="p-3.5 flex items-center justify-between hover:bg-zinc-500/5 transition-colors">
                          <div>
                            <span className="text-xs font-black text-blue-500 font-mono block">{d.code}</span>
                            <span className="text-[9px] text-[var(--text-muted)] mt-0.5 block">{d.date} • {d.dividendType || "Rendimento"}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-extrabold text-emerald-500 font-mono">{formatCurrency(d.price)}</span>
                            <button 
                              onClick={() => deleteTransaction(d.id)}
                              className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. RENTABILIDADE */}
            {((activeSubTab === "carteira" && carteiraSubTab === "rentabilidade") || activeSubTab === "rentabilidade") && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  
                  {/* Performance stats summary */}
                  <div className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Índice Geral de Rentabilidade</h3>
                      <p className="text-[10px] text-[var(--text-muted)]">Comparativo percentual acumulado.</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-zinc-500/5 border border-[var(--border-color)] rounded-xl">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">Minha Rentabilidade</span>
                        <div className="text-lg font-black font-mono mt-0.5 text-emerald-500">
                          {profitPercentage >= 0 ? "+" : ""}{profitPercentage.toFixed(2)}%
                        </div>
                        <span className="text-[9px] text-[var(--text-muted)] mt-0.5 block">Calculado sobre preço médio histórico</span>
                      </div>

                      <div className="p-3 bg-zinc-500/5 border border-[var(--border-color)] rounded-xl">
                        <span className="text-[8px] uppercase tracking-wider font-extrabold text-[var(--text-muted)]">Meta CDI Anual</span>
                        <div className="text-xs font-black font-mono mt-0.5 text-amber-500">
                          {profitPercentage >= 10.5 ? "Superando Benchmark em 10.5%" : "Em convergência com o mercado"}
                        </div>
                      </div>
                    </div>

                    <p className="text-[9px] leading-relaxed text-[var(--text-muted)] bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                      O sistema recalcula a rentabilidade média ponderada a cada transação registrada de compra ou venda.
                    </p>
                  </div>

                  {/* Comparisons Chart */}
                  <div className="lg:col-span-7 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col justify-between">
                    <div className="border-b border-[var(--border-color)] pb-3 mb-4">
                      <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Carteira x CDI de Mercado</h3>
                    </div>

                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={[
                          { month: "Jan", Carteira: profitPercentage * 0.1, CDI: 1.0 },
                          { month: "Fev", Carteira: profitPercentage * 0.35, CDI: 1.8 },
                          { month: "Mar", Carteira: profitPercentage * 0.6, CDI: 3.1 },
                          { month: "Hoje", Carteira: profitPercentage, CDI: 4.5 }
                        ]}>
                          <XAxis dataKey="month" tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <YAxis tick={{ fontSize: 9 }} stroke="var(--text-muted)" />
                          <Tooltip />
                          <Line type="monotone" dataKey="Carteira" stroke="#3b82f6" strokeWidth={2.5} name="Sua Carteira %" />
                          <Line type="monotone" dataKey="CDI" stroke="#f59e0b" strokeWidth={1.5} name="CDI %" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 5. METAS */}
            {activeSubTab === "metas" && (
              <div className="space-y-6">
                
                {/* Create Goal Form */}
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5">
                  <h3 className="text-xs font-black uppercase text-[var(--text-primary)] mb-4 flex items-center gap-1.5">
                    <Trophy size={14} className="text-amber-500" /> Nova Meta de Investimentos
                  </h3>

                  <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-black">Nome da Meta</label>
                      <input 
                        type="text" 
                        required
                        value={gTitle}
                        onChange={(e) => setGTitle(e.target.value)}
                        placeholder="Ex: Total de FIIs acumulados"
                        className="w-full bg-[var(--section-bg)] text-xs p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-black">Valor Alvo (R$)</label>
                      <input 
                        type="number" 
                        required
                        value={gTarget}
                        onChange={(e) => setGTarget(e.target.value)}
                        placeholder="Ex: 5000"
                        className="w-full bg-[var(--section-bg)] text-xs p-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1 flex flex-col justify-end">
                      <button 
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 font-black text-xs text-white uppercase py-2.5 px-4 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-all h-[38px] flex items-center justify-center gap-1.5"
                      >
                        <Plus size={13} className="stroke-[3]" />
                        Adicionar Meta
                      </button>
                    </div>
                  </form>
                </div>

                {/* Progress lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goals.map((g) => {
                    let realVal = g.currentValue;
                    if (g.title.toLowerCase().includes("patrimônio") && totalPatrimony > 0) {
                      realVal = totalPatrimony;
                    } else if (g.title.toLowerCase().includes("rendimento") && totalDividendsReceived > 0) {
                      realVal = totalDividendsReceived;
                    }

                    const pct = Math.min(100, (realVal / g.targetValue) * 100);

                    return (
                      <div key={g.id} className="p-4 sm:p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] uppercase tracking-widest font-black text-blue-500">Indicadores</span>
                            <h4 className="text-sm font-black text-[var(--text-primary)] mt-1">{g.title}</h4>
                          </div>
                          
                          <button onClick={() => deleteGoal(g.id)} className="text-zinc-400 hover:text-red-500 transition-colors cursor-pointer">
                            <X size={15} />
                          </button>
                        </div>

                        <div>
                          <div className="flex justify-between items-baseline text-xs font-mono">
                            <span className="text-[var(--text-primary)] font-black text-md">{pct.toFixed(1)}% Atingido</span>
                          </div>
                          <div className="w-full bg-zinc-500/10 h-2 rounded-full mt-2 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-[100%] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 bg-zinc-500/5 p-3 rounded-xl text-[10px] font-mono leading-none border border-[var(--border-color)]">
                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] block mb-1 uppercase">Atual</span>
                            <span>{formatCurrency(realVal)}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] block mb-1 uppercase">Faltam</span>
                            <span>{formatCurrency(Math.max(0, g.targetValue - realVal))}</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-[var(--text-muted)] block mb-1 uppercase font-bold">Objetivo</span>
                            <span className="font-extrabold text-[var(--text-primary)]">{formatCurrency(g.targetValue)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* 6. HISTÓRICO DE LANÇAMENTOS */}
            {activeSubTab === "lancamentos" && (
              <div className="space-y-4">
                
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 border-b border-[var(--border-color)] bg-zinc-500/5">
                    <h3 className="text-xs font-black uppercase text-[var(--text-primary)]">Histórico de Custódia (Transações)</h3>
                  </div>

                  <div className="divide-y divide-[var(--border-color)]">
                    {transactions.map((tx, idx) => (
                      <div key={tx.id || idx} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-mono text-sm text-[var(--text-primary)]">{tx.code}</strong>
                            <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded ${tx.type === "compra" ? "bg-emerald-500/10 text-emerald-500" : tx.type === "dividendo" ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"}`}>
                              {tx.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-muted)] mt-1 font-mono">{tx.date} • {tx.name} • Class: {tx.category}</p>
                        </div>

                        <div className="flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto gap-1">
                          <div className="text-[var(--text-muted)]">
                            {tx.qty} x <span className="font-mono">{formatCurrency(tx.price)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <strong className="font-mono text-[var(--text-primary)]">{formatCurrency(tx.qty * tx.price)}</strong>
                            <button 
                              onClick={() => deleteTransaction(tx.id)}
                              className="text-zinc-400 hover:text-red-500 p-1 rounded hover:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* 7. ANÁLISE IA B3 */}
            {activeSubTab === "analise" && (
              <div className="space-y-6">
                {/* Loader Overlay */}
                {isB3Analyzing && (
                  <div className="p-8 py-16 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col items-center justify-center text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 animate-bounce">
                      Processamento Inteligente Ativo
                    </span>
                    <h4 className="text-sm font-black text-[var(--text-primary)] max-w-xs transition-all">
                      {[
                        "Carregando múltiplos fundamentalistas B3...",
                        "Executando regras de integridade nos múltiplos...",
                        "Estruturando snapshot de ativos da carteira...",
                        "Enviando dados consolidados ao Tarflow IA...",
                        "Classificando pontuações com fórmulas de Graham e Cap Rate...",
                        "Otimizando rankings setoriais automatizados...",
                        "Gravando relatórios gerenciais e consolidando insights..."
                      ][loadingStep]}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                      Este processo utiliza inteligência generativa e pode levar alguns segundos adicionais para validar a integridade dos dados na B3.
                    </p>
                  </div>
                )}

                {/* Main Results View */}
                {!isB3Analyzing && (
                  <>
                    {/* Overview Control Panel */}
                    <div className="p-5 bg-gradient-to-br from-blue-500/5 to-purple-500/5 border border-blue-500/15 rounded-2xl">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <strong className="text-[10px] uppercase font-bold tracking-wider text-blue-500">Pipeline de Análise Tarflow</strong>
                          </div>
                          <h3 className="text-base font-black text-[var(--text-primary)] mt-1">Status do Consolidador Fundamentalista</h3>
                          <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                            Último processamento: <span className="text-[var(--text-primary)] font-bold">{b3Analysis?.updatedAt || "Ainda Não Inicializado"}</span>
                          </p>
                        </div>

                        <button
                          onClick={triggerB3Analysis}
                          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs py-3 px-5 rounded-xl cursor-pointer shadow-md transition-all uppercase tracking-wider"
                        >
                          <Sparkles size={13} className="text-amber-300 stroke-[2.5]" />
                          Rodar Nova Análise
                        </button>
                      </div>

                      {b3Analysis?.overview ? (
                        <div className="p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl mt-4 text-xs leading-relaxed text-[var(--text-primary)]">
                          <div className="flex gap-2">
                            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                            <p>{b3Analysis.overview}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-yellow-500/5 border border-yellow-500/10 rounded-xl mt-4 text-xs text-yellow-600 dark:text-yellow-400">
                          Aguardando a execução do primeiro ciclo para gerar o panorama macroeconômico global do portfólio.
                        </div>
                      )}
                    </div>

                    {b3AnalysisError && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-500 flex items-start gap-2">
                        <span className="font-extrabold">Falha:</span>
                        <p>{b3AnalysisError}. Verifique as chaves ou tente novamente.</p>
                      </div>
                    )}

                    {!b3Analysis && !b3AnalysisError && (
                      <div className="p-8 border border-dashed border-[var(--border-color)] bg-[var(--card-bg)]/20 rounded-2xl flex flex-col items-center text-center justify-center">
                        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center rounded-2xl mb-4">
                          <Sparkles size={20} className="animate-spin animate-duration-[3000ms]" />
                        </div>
                        <h4 className="text-xs font-black uppercase text-[var(--text-primary)]">Carregar Rankings Fundamentalistas</h4>
                        <p className="text-[10px] text-[var(--text-muted)] max-w-xs mt-1.5 leading-relaxed">
                          Descubra se suas ações e FIIs estão baratos ou caros. O Tarflow avalia o portfólio B3 segundo as rígidas diretrizes CNPI de integridade.
                        </p>
                        <button
                          onClick={triggerB3Analysis}
                          className="mt-4 px-4 py-2.5 bg-zinc-500/10 hover:bg-zinc-500/15 border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Inicializar Análise B3
                        </button>
                      </div>
                    )}

                    {b3Analysis && (
                      <div className="space-y-6">
                        {/* AÇÕES GRIP */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <TrendingUp size={14} className="text-blue-500" />
                            <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">Ações — Avaliação IA B3</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {b3Analysis.acoesRank?.map((item: any) => (
                              <div key={item.code} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-blue-500/30 transition-all">
                                <div className="p-4 pb-2.5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-mono text-xs font-black text-[var(--text-primary)]">{item.code}</span>
                                      <span className="text-[9px] text-[var(--text-muted)] block font-sans truncate max-w-[120px]">{item.sector}</span>
                                    </div>
                                    
                                    <div className="text-right flex items-center gap-2">
                                      {item.score !== null && (
                                        <div className="text-xs font-black font-mono text-zinc-400">
                                          Score: <span className="text-[var(--text-primary)] font-extrabold">{item.score}</span>
                                        </div>
                                      )}
                                      <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 rounded tracking-wide ${
                                        item.decision === "COMPRAR" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25" :
                                        item.decision === "MANTER" ? "bg-blue-500/15 text-blue-500 border border-blue-500/25" :
                                        item.decision === "VENDER" ? "bg-amber-500/15 text-amber-500 border border-amber-500/25" :
                                        "bg-red-500/15 text-red-500 border border-red-500/25"
                                      }`}>
                                        {item.decision}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Indicators Mini Grid */}
                                  <div className="grid grid-cols-4 gap-2 border-t border-[var(--border-color)] pt-2.5 mt-2.5 text-center">
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">Preço</span>
                                      <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">{formatCurrency(item.price || 0)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">P/L</span>
                                      <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">{item.pl ? `${item.pl}x` : "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">P/VP</span>
                                      <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">{item.pvp ? item.pvp : "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">DY %</span>
                                      <span className="text-[10px] font-mono font-black text-emerald-500">{item.dy ? `${item.dy}%` : "0%"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CNPI Justification Panel */}
                                <div className="p-3 bg-zinc-500/5 border-t border-[var(--border-color)] text-[10.5px] text-[var(--text-primary)] italic leading-relaxed">
                                  "{item.justification}"
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* FIIS GRID */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-3">
                            <Layers size={14} className="text-emerald-500" />
                            <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">Fundos Imobiliários (FIIs) — Avaliação IA B3</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {b3Analysis.fiisRank?.map((item: any) => (
                              <div key={item.code} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl overflow-hidden flex flex-col justify-between shadow-sm hover:border-emerald-500/30 transition-all">
                                <div className="p-4 pb-2.5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="font-mono text-xs font-black text-[var(--text-primary)]">{item.code}</span>
                                      <span className="text-[9px] text-[var(--text-muted)] block font-sans truncate max-w-[120px]">{item.sector}</span>
                                    </div>
                                    
                                    <div className="text-right flex items-center gap-2">
                                      {item.score !== null && (
                                        <div className="text-xs font-black font-mono text-zinc-400">
                                          Score: <span className="text-[var(--text-primary)] font-extrabold">{item.score}</span>
                                        </div>
                                      )}
                                      <span className={`text-[8.5px] uppercase font-black px-2 py-0.5 rounded tracking-wide ${
                                        item.decision === "COMPRAR" ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/25" :
                                        item.decision === "MANTER" ? "bg-blue-500/15 text-blue-500 border border-blue-500/25" :
                                        item.decision === "VENDER" ? "bg-amber-500/15 text-amber-500 border border-amber-500/25" :
                                        "bg-red-500/15 text-red-500 border border-red-500/25"
                                      }`}>
                                        {item.decision}
                                      </span>
                                    </div>
                                  </div>

                                  {/* indicators Mini Grid */}
                                  <div className="grid grid-cols-3 gap-2 border-t border-[var(--border-color)] pt-2.5 mt-2.5 text-center">
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">Preço</span>
                                      <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">{formatCurrency(item.price || 0)}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block font-sans">P/VP</span>
                                      <span className="text-[10px] font-mono font-black text-[var(--text-primary)]">{item.pvp ? item.pvp : "—"}</span>
                                    </div>
                                    <div>
                                      <span className="text-[8px] uppercase font-bold text-[var(--text-muted)] block">DY %</span>
                                      <span className="text-[10px] font-mono font-black text-emerald-500">{item.dy ? `${item.dy}%` : "0%"}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* CNPI Justification Panel */}
                                <div className="p-3 bg-zinc-500/5 border-t border-[var(--border-color)] text-[10.5px] text-[var(--text-primary)] italic leading-relaxed">
                                  "{item.justification}"
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* --- REUSABLE SLIDEOVER MODAL SHEET DRAWER --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            {/* Backdrop cover overlay on top of standard navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] pointer-events-auto"
            />

            {/* Centered Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", damping: 25, stiffness: 280 }}
              className="fixed inset-0 m-auto w-[94vw] max-w-xl h-[88vh] max-h-[720px] flex flex-col bg-[var(--container-bg)] border-2 border-[var(--border-color)] rounded-3xl p-5 sm:p-6 z-[9999] shadow-2xl text-left overflow-hidden"
            >
              
              <div className="flex-shrink-0 flex justify-between items-center border-b border-[var(--border-color)] pb-3.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <Play size={14} className="rotate-90 text-blue-500 fill-blue-500" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--text-primary)]">Novo Lançamento B3</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 hover:text-[var(--text-primary)] flex items-center justify-center transition-all cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="flex-grow flex flex-col overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-4 pr-1 pb-6 show-scrollbar">
                
                {/* Lançamento Type Selection Pills */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[#cfb53b]">Tipo de Operação</label>
                  <div className="grid grid-cols-3 gap-1 bg-zinc-500/5 p-1 rounded-xl border border-[var(--border-color)] text-center text-[10px] font-bold">
                    {[
                      { id: "compra", label: "Compra" },
                      { id: "venda", label: "Venda" },
                      { id: "dividendo", label: "Provento" }
                    ].map((btn) => (
                      <button 
                        key={btn.id}
                        type="button"
                        onClick={() => setNewType(btn.id as any)}
                        className={`py-1.5 rounded-lg font-black transition-all cursor-pointer uppercase text-[9.5px] ${newType === btn.id ? "bg-blue-600 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category Selector Pills */}
                {newType !== "dividendo" && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Categoria</label>
                    <div className="flex flex-wrap gap-1 bg-zinc-500/5 p-1 rounded-xl border border-[var(--border-color)]">
                      {["Ações", "FIIs", "Criptomoedas", "ETFs", "Outros"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewCategory(cat as any)}
                          className={`px-2.5 py-1.5 rounded-lg text-[9.5px] font-black transition-all cursor-pointer uppercase ${newCategory === cat ? "bg-blue-500 text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autocomplete suggestions live search ticker input */}
                <div className="space-y-1 relative">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Código do Ativo (Ex: PETR4, MXRF11)</label>
                  <input 
                    type="text"
                    required
                    value={newCode}
                    onChange={(e) => {
                      setNewCode(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="DIGITE O TICKER B3"
                    className="w-full bg-[var(--card-bg)] text-xs font-mono font-black uppercase p-3 rounded-xl border border-[var(--border-color)] focus:border-blue-500 focus:outline-none placeholder:text-zinc-500 text-[var(--text-primary)]"
                  />

                  {/* Autocomplete selections dropdown float panel */}
                  {showSuggestions && autocompleteSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[56px] bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl z-[120] divide-y divide-[var(--border-color)] max-h-40 overflow-y-auto">
                      {autocompleteSuggestions.map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => selectSuggestion(item)}
                          className="w-full text-left p-2.5 hover:bg-zinc-500/5 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-black text-blue-500">{item}</span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[140px] font-sans">({B3_ASSET_DATABASE[item]?.name || item})</span>
                          </div>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                            {B3_ASSET_DATABASE[item]?.category || "Ações"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Nome do Ativo</label>
                  <input 
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Petrobras S.A."
                    className="w-full bg-[var(--card-bg)] text-xs font-bold p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                  />
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Quantidade</label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={newQty}
                      onChange={(e) => setNewQty(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[var(--card-bg)] text-xs font-bold p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {newType === "dividendo" ? "Custo do Provento" : "Valor Unitário (R$)"}
                    </label>
                    <input 
                      type="number"
                      step="any"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="12.50"
                      className="w-full bg-[var(--card-bg)] text-xs font-bold p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Dividend Specific custom block */}
                {newType === "dividendo" && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 text-[10px]">
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider font-extrabold text-[var(--text-muted)]">Tipo Lançamento</label>
                      <select 
                        value={newDivType}
                        onChange={(e) => setNewDivType(e.target.value as any)}
                        className="w-full bg-[var(--card-bg)] text-[11px] p-2 rounded-lg border border-[var(--border-color)] focus:outline-none"
                      >
                        <option value="Dividendo">Dividendo</option>
                        <option value="JSCP">JSCP</option>
                        <option value="Rendimento">Rendimento FII</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="uppercase tracking-wider font-extrabold text-[var(--text-muted)]">Situação</label>
                      <select 
                        value={newDivStatus}
                        onChange={(e) => setNewDivStatus(e.target.value as any)}
                        className="w-full bg-[var(--card-bg)] text-[11px] p-2 rounded-lg border border-[var(--border-color)] focus:outline-none"
                      >
                        <option value="Recebido">Recebido</option>
                        <option value="A Receber">A Receber</option>
                      </select>
                    </div>
                  </div>
                )}

                  {/* Date and Sector */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Data</label>
                      <input 
                        type="date"
                        required
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="w-full bg-[var(--card-bg)] text-xs p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Setor</label>
                      <input 
                        type="text"
                        value={newSector}
                        onChange={(e) => setNewSector(e.target.value)}
                        placeholder="Ex: Financeiro, Energia"
                        className="w-full bg-[var(--card-bg)] text-xs p-3 rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 pt-4 border-t border-[var(--border-color)] bg-[var(--container-bg)] flex gap-3 text-xs font-black uppercase pb-1 sm:pb-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-grow bg-zinc-500/10 hover:bg-zinc-500/15 border border-[var(--border-color)] py-3 rounded-xl transition-all cursor-pointer text-center text-[var(--text-primary)]"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Salvar Lançamento
                  </button>
                </div>

              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
    </div>
  );
}
