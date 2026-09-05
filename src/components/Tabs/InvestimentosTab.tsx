import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp, Layers, Wallet, Calendar, Award, Trash2, X, Sparkles, ChevronDown, ChevronRight, Info, Trophy, Play, Plus, BarChart2, Briefcase, Settings, PieChart as PieChartIcon, Calculator, AlertTriangle, ShieldAlert, Coins
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

const ALLOCATION_COLORS: Record<string, string> = {
  "Ações": "#3b82f6",       // Blue
  "FIIs": "#10b981",        // Emerald
  "Criptomoedas": "#f59e0b", // Amber
  "ETFs": "#8b5cf6",        // Violet
  "Outros": "#cfb53b"       // Gold
};

const CATEGORY_LABELS: Record<string, string> = {
  "Ações": "Ações",
  "FIIs": "Fundos Imobiliários",
  "Criptomoedas": "Criptomoedas",
  "ETFs": "ETFs",
  "Outros": "Outros ativos"
};

export default function InvestimentosTab() {
  const [activeSubTab, setActiveSubTab] = useState<"carteira" | "simulador">("carteira");

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("tarflow_transactions");
    return saved ? JSON.parse(saved) : []; // Clean portfolio by default
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

  // Auto-Sync to State persistence
  useEffect(() => {
    localStorage.setItem("tarflow_transactions", JSON.stringify(transactions));
  }, [transactions]);

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
        return {
          code: a.code,
          name: a.name,
          qty: a.qty,
          avgPrice: Number((a.totalCost / a.qty).toFixed(2)),
          currentPrice: livePrice,
          category: a.category,
          sector: a.sector,
          proventosTotal: a.proventosTotal
        };
      });
  }, [transactions]);

  // Basic KPI Math
  const totalPatrimony = useMemo(() => {
    return calculatedAssets.reduce((sum, a) => sum + (a.qty * a.currentPrice), 0);
  }, [calculatedAssets]);

  const totalCost = useMemo(() => {
    return calculatedAssets.reduce((sum, a) => sum + (a.qty * a.avgPrice), 0);
  }, [calculatedAssets]);

  const profitValue = totalPatrimony - totalCost;
  const profitPercentage = totalCost > 0 ? (profitValue / totalCost) * 100 : 0;

  // Real CDI accumulated since the first transaction, to compare against the
  // portfolio's actual return (no fabricated monthly waypoints).
  const firstTransactionDate = useMemo(() => {
    if (transactions.length === 0) return null;
    return transactions.reduce((earliest, t) => (t.date < earliest ? t.date : earliest), transactions[0].date);
  }, [transactions]);

  const [cdiAccumulated, setCdiAccumulated] = useState<number | null>(null);

  useEffect(() => {
    if (!firstTransactionDate) {
      setCdiAccumulated(null);
      return;
    }
    fetch(apiUrl(`/api/market/cdi-accumulated?start=${firstTransactionDate}`))
      .then(res => res.ok ? res.json() : null)
      .then(data => setCdiAccumulated(data?.accumulatedPercent ?? null))
      .catch(() => setCdiAccumulated(null));
  }, [firstTransactionDate]);

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
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [calculatedAssets, totalPatrimony]);

  // Maior posição individual
  const topAsset = useMemo(() => {
    if (calculatedAssets.length === 0) return null;
    return [...calculatedAssets].sort((a, b) => (b.qty * b.currentPrice) - (a.qty * a.currentPrice))[0];
  }, [calculatedAssets]);

  const topAssetValue = topAsset ? topAsset.qty * topAsset.currentPrice : 0;
  const topAssetPct = totalPatrimony > 0 ? (topAssetValue / totalPatrimony) * 100 : 0;

  // Dynamic risk insights, computed from the real portfolio instead of hardcoded tickers
  const insights = useMemo(() => {
    const list: { tone: "red" | "amber"; icon: React.ReactNode; title: string; text: string }[] = [];
    if (calculatedAssets.length === 0) return list;

    const sorted = [...calculatedAssets].sort((a, b) => (b.qty * b.currentPrice) - (a.qty * a.currentPrice));
    let acc = 0;
    const topHolders: typeof sorted = [];
    for (const a of sorted) {
      if (acc >= 40) break;
      topHolders.push(a);
      acc += totalPatrimony > 0 ? (a.qty * a.currentPrice / totalPatrimony) * 100 : 0;
    }
    if (acc >= 40 && topHolders.length <= 3) {
      list.push({
        tone: "red",
        icon: <AlertTriangle size={16} />,
        title: "Concentração alta em poucos ativos",
        text: `${topHolders.map(a => a.code).join(" + ")} somam ${acc.toFixed(0)}% de todo o patrimônio. Vale avaliar se esse nível de concentração está dentro do risco que você aceita correr.`
      });
    }

    const cryptoPct = allocationChartData.find(c => c.name === "Criptomoedas")?.pct || 0;
    if (cryptoPct > 10) {
      list.push({
        tone: "amber",
        icon: <Coins size={16} />,
        title: "Exposição a criptomoedas relevante",
        text: `Criptomoedas representam ${cryptoPct.toFixed(1)}% da carteira. É uma classe de alta volatilidade — vale tratar como posição de risco, não como sobra marginal.`
      });
    }

    const topCategoryPct = allocationChartData[0]?.pct || 0;
    if (allocationChartData.length <= 2 && topCategoryPct > 70) {
      list.push({
        tone: "amber",
        icon: <ShieldAlert size={16} />,
        title: "Pouca diversificação entre classes",
        text: `${allocationChartData[0]?.name} concentra ${topCategoryPct.toFixed(0)}% da carteira. Diversificar entre mais classes de ativos costuma reduzir a volatilidade geral.`
      });
    }

    return list;
  }, [calculatedAssets, totalPatrimony, allocationChartData]);

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

  const deleteAssetByCode = (code: string) => {
    setTransactions(prev => prev.filter(t => t.code !== code));
  };

  const clearAllData = () => {
    // Avoid native blocks in sandboxed iframe environments
    setTransactions([]);
    localStorage.removeItem("tarflow_transactions");
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--container-bg)] border border-[var(--border-color)] px-3 py-2 rounded-xl shadow-xl text-xs font-bold text-[var(--text-primary)]">
          {data.name}: {formatCurrency(data.value)} ({data.pct.toFixed(1)}%)
        </div>
      );
    }
    return null;
  };

  const renderAssetTable = (category: Asset["category"]) => {
    const assets = calculatedAssets.filter(a => a.category === category);
    if (assets.length === 0) return null;
    const categoryTotal = assets.reduce((sum, a) => sum + (a.qty * a.currentPrice), 0);
    const categoryPct = totalPatrimony > 0 ? (categoryTotal / totalPatrimony) * 100 : 0;

    return (
      <div key={category} className="space-y-3">
        <h3 className="text-sm font-black text-[var(--text-primary)]">
          {CATEGORY_LABELS[category]} — {formatCurrency(categoryTotal)} ({categoryPct.toFixed(1)}%)
        </h3>
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-x-auto">
          <table className="w-full text-xs min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border-color)]">
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">Ativo</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">Qtd</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">Saldo</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">Rentab.</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">DY</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">P/VP</th>
                <th className="text-left p-3 font-black uppercase text-[10px] tracking-wider text-[var(--text-muted)]">% Carteira</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const saldo = a.qty * a.currentPrice;
                const rentab = a.avgPrice > 0 ? ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100 : 0;
                const pct = totalPatrimony > 0 ? (saldo / totalPatrimony) * 100 : 0;
                const details = B3_ASSET_DATABASE[a.code];
                return (
                  <tr key={a.code} className="border-b border-[var(--border-color)] last:border-0 group">
                    <td className="p-3 font-black text-[var(--text-primary)]">{a.code}</td>
                    <td className="p-3 text-[var(--text-muted)]">{a.qty}</td>
                    <td className="p-3 font-bold text-[var(--text-primary)]">{formatCurrency(saldo)}</td>
                    <td className={`p-3 font-bold ${rentab >= 0 ? "text-emerald-500" : "text-red-500"}`}>{rentab >= 0 ? "+" : ""}{rentab.toFixed(1)}%</td>
                    <td className="p-3 text-[var(--text-muted)]">{details?.dy != null ? `${details.dy.toFixed(2)}%` : "—"}</td>
                    <td className="p-3 text-[var(--text-muted)]">{details?.pvp != null ? details.pvp.toFixed(2) : "—"}</td>
                    <td className="p-3 font-bold text-[var(--text-primary)]">{pct.toFixed(1)}%</td>
                    <td className="p-3">
                      <button
                        onClick={() => deleteAssetByCode(a.code)}
                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                        title="Remover ativo"
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
      </div>
    );
  };

  const otherAssets = calculatedAssets.filter(a => a.category !== "Ações" && a.category !== "FIIs");

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
              Consolidação de carteira, alocação por classe e alertas de risco.
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

        {/* Main tabs: Carteira / Simulador */}
        <div className="grid grid-cols-2 gap-2 w-full mb-6 bg-[var(--card-bg)]/40 p-2 rounded-2xl border border-[var(--border-color)] max-w-md">
          {[
            { id: "carteira", label: "Minha Carteira", icon: <Briefcase size={14} className="text-emerald-500" /> },
            { id: "simulador", label: "Simulador de Juros", icon: <Calculator size={14} className="text-cyan-500" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer select-none text-center ${
                activeSubTab === tab.id
                  ? "bg-blue-600 text-white shadow-md font-black scale-[1.02]"
                  : "bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--section-bg)] border border-[var(--border-color)]"
              }`}
            >
              {tab.icon}
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- PORTFOLIO EMPTY STATE --- */}
        {activeSubTab === "carteira" && transactions.length === 0 && (
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
        )}

        {/* --- MINHA CARTEIRA DASHBOARD --- */}
        {activeSubTab === "carteira" && transactions.length > 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-[var(--text-primary)]">Minha Carteira</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Consolidação em tempo real dos seus lançamentos de compra, venda e proventos.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                <span className="text-[10px] uppercase font-black tracking-widest text-white/80 relative z-10">Saldo Bruto Atual</span>
                <div className="text-2xl font-black mt-2 relative z-10">{formatCurrency(totalPatrimony)}</div>
                <div className="text-xs text-white/70 mt-1 relative z-10">Aplicado: {formatCurrency(totalCost)}</div>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Rentabilidade Total</span>
                <div className={`text-2xl font-black mt-2 ${profitPercentage >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {profitPercentage >= 0 ? "+" : ""}{profitPercentage.toFixed(2)}%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  {profitValue >= 0 ? "Ganho" : "Perda"} de {formatCurrency(Math.abs(profitValue))} desde o início
                </div>
              </div>
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
                <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">Maior Posição Individual</span>
                <div className="text-2xl font-black mt-2 text-[var(--text-primary)]">{topAsset?.code || "—"}</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">{topAssetPct.toFixed(1)}% de toda a carteira</div>
              </div>
            </div>

            {/* Distribuição + Alertas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5">
                <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                  <PieChartIcon size={16} className="text-blue-500" /> Distribuição por Classe
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mb-4">% do patrimônio total ({formatCurrency(totalPatrimony)})</p>
                <div className="flex items-center gap-6 flex-wrap">
                  <div className="w-36 h-36 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={allocationChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="65%" outerRadius="95%" paddingAngle={3} stroke="none">
                          {allocationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.name] || "#9ca3af"} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col gap-2.5 text-xs min-w-[140px]">
                    {allocationChartData.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: ALLOCATION_COLORS[item.name] }} />
                        <span className="font-bold text-[var(--text-primary)]">{item.name}</span>
                        <span className="text-[var(--text-muted)] ml-auto pl-2 whitespace-nowrap">{item.pct.toFixed(1)}% · {formatCurrency(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {insights.length === 0 ? (
                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-5 h-full flex flex-col items-center justify-center text-center">
                    <ShieldAlert size={22} className="text-emerald-500 mb-2" />
                    <p className="text-xs text-[var(--text-muted)]">Nenhum alerta de risco identificado na sua carteira atual.</p>
                  </div>
                ) : (
                  insights.map((ins, idx) => (
                    <div
                      key={idx}
                      className={`rounded-2xl p-4 border-l-4 ${
                        ins.tone === "red"
                          ? "border-l-red-500 bg-red-500/5 border border-red-500/10"
                          : "border-l-amber-500 bg-amber-500/5 border border-amber-500/10"
                      }`}
                    >
                      <div className={`flex items-center gap-2 text-xs font-black mb-1 ${ins.tone === "red" ? "text-red-500" : "text-amber-500"}`}>
                        {ins.icon} {ins.title}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{ins.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Tabelas por categoria */}
            {renderAssetTable("Ações")}
            {renderAssetTable("FIIs")}

            {/* Outros ativos */}
            {otherAssets.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black text-[var(--text-primary)]">Outros ativos</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {otherAssets.map(a => {
                    const saldo = a.qty * a.currentPrice;
                    const rentab = a.avgPrice > 0 ? ((a.currentPrice - a.avgPrice) / a.avgPrice) * 100 : 0;
                    return (
                      <div key={a.code} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 group relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-black text-sm text-[var(--text-primary)]">{a.code}</div>
                            <div className="text-[10px] text-[var(--text-muted)]">{CATEGORY_LABELS[a.category]}</div>
                          </div>
                          <span className={`text-xs font-black ${rentab >= 0 ? "text-emerald-500" : "text-red-500"}`}>{rentab >= 0 ? "+" : ""}{rentab.toFixed(1)}%</span>
                        </div>
                        <div className="text-lg font-black text-[var(--text-primary)]">{formatCurrency(saldo)}</div>
                        <button
                          onClick={() => deleteAssetByCode(a.code)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all cursor-pointer"
                          title="Remover ativo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalDividendsReceived > 0 && (
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-muted)]">Total de proventos recebidos</span>
                <span className="text-sm font-black text-emerald-500">{formatCurrency(totalDividendsReceived)}</span>
              </div>
            )}

            {cdiAccumulated !== null && (
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[var(--text-muted)]">CDI acumulado desde seu primeiro lançamento</span>
                <span className="text-sm font-black text-amber-500">{cdiAccumulated >= 0 ? "+" : ""}{cdiAccumulated.toFixed(2)}%</span>
              </div>
            )}

            <p className="text-[10px] text-[var(--text-muted)] leading-relaxed border-t border-[var(--border-color)] pt-4">
              Painel calculado a partir dos seus lançamentos registrados no Tarflow. Não constitui recomendação de investimento — é uma ferramenta de apoio, não consultoria credenciada pela CVM.
            </p>
          </div>
        )}

        {/* --- SIMULADOR DE JUROS COMPOSTOS --- */}
        {activeSubTab === "simulador" && <CompoundInterestSimulator />}

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
                          key={item.code}
                          type="button"
                          onClick={() => selectSuggestion(item)}
                          className="w-full text-left p-2.5 hover:bg-zinc-500/5 flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="font-black text-blue-500">{item.code}</span>
                            <span className="text-[9px] text-[var(--text-muted)] truncate max-w-[140px] font-sans">({item.name})</span>
                          </div>
                          <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                            {item.category}
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

function CompoundInterestSimulator() {
  const [aporteInicial, setAporteInicial] = useState(500);
  const [aporteMensal, setAporteMensal] = useState(300);
  const [taxaAnual, setTaxaAnual] = useState(10);
  const [anos, setAnos] = useState(4);

  const { totalInvestido, jurosRendidos, montanteAcumulado, chartData } = useMemo(() => {
    const monthlyRate = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;
    const totalMonths = anos * 12;

    let balance = aporteInicial;
    let contributed = aporteInicial;
    const points: { label: string; Total: number; Aporte: number }[] = [
      { label: "Início", Total: balance, Aporte: contributed }
    ];

    for (let month = 1; month <= totalMonths; month++) {
      balance = balance * (1 + monthlyRate) + aporteMensal;
      contributed += aporteMensal;
      if (month % 12 === 0) {
        points.push({ label: `${month / 12} ${month / 12 === 1 ? "Ano" : "Anos"}`, Total: balance, Aporte: contributed });
      }
    }

    return {
      totalInvestido: contributed,
      jurosRendidos: balance - contributed,
      montanteAcumulado: balance,
      chartData: points
    };
  }, [aporteInicial, aporteMensal, taxaAnual, anos]);

  const retornoPercent = totalInvestido > 0 ? (jurosRendidos / totalInvestido) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
          <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">Total Investido</span>
          <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">{formatCurrency(totalInvestido)}</div>
          <span className="text-[10px] text-[var(--text-muted)] mt-1 block">Do seu próprio bolso</span>
        </div>
        <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl">
          <span className="text-[9px] uppercase font-black tracking-widest text-[var(--text-muted)]">Juros Rendidos</span>
          <div className="text-xl font-black font-mono text-emerald-500 mt-1">+{formatCurrency(jurosRendidos)}</div>
          <span className="text-[10px] text-emerald-500 mt-1 block">+{retornoPercent.toFixed(0)}% de retorno</span>
        </div>
        <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl text-white">
          <span className="text-[9px] uppercase font-black tracking-widest text-white/70">Montante Acumulado</span>
          <div className="text-xl font-black font-mono mt-1">{formatCurrency(montanteAcumulado)}</div>
          <span className="text-[10px] text-white/70 mt-1 block">Patrimônio projetado</span>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)]">Projeção de Crescimento Patrimonial</h3>
            <p className="text-[10px] text-[var(--text-muted)]">Linha Azul: Juros Compostos · Linha Cinza: Aportes Brutos</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: -20 }}>
              <defs>
                <linearGradient id="simTotalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
              <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" tickFormatter={(v) => formatCurrency(v)} width={0} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="Aporte" stroke="#9ca3af" fill="transparent" strokeWidth={1.5} name="Aporte Bruto" />
              <Area type="monotone" dataKey="Total" stroke="#3b82f6" fill="url(#simTotalGradient)" strokeWidth={2.5} name="Total Acumulado" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-2">Calculadora com base em juros reais capitalizados mensalmente.</p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-5">
        <h3 className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
          <Calculator size={16} className="text-cyan-500" /> Ajuste Suas Metas
        </h3>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Aporte Inicial</span>
            <span className="font-black font-mono text-[var(--text-primary)]">{formatCurrency(aporteInicial)}</span>
          </div>
          <input type="range" min={0} max={50000} step={100} value={aporteInicial} onChange={(e) => setAporteInicial(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]"><span>R$ 0</span><span>R$ 50 mil</span></div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Aporte Mensal</span>
            <span className="font-black font-mono text-[var(--text-primary)]">{formatCurrency(aporteMensal)}</span>
          </div>
          <input type="range" min={50} max={5000} step={50} value={aporteMensal} onChange={(e) => setAporteMensal(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]"><span>R$ 50</span><span>R$ 5 mil</span></div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Taxa Anual (Retorno Estimado)</span>
            <span className="font-black font-mono text-[var(--text-primary)]">{taxaAnual}% a.a.</span>
          </div>
          <input type="range" min={4} max={18} step={0.5} value={taxaAnual} onChange={(e) => setTaxaAnual(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]"><span>4% (Conservador)</span><span>18% (Agressivo)</span></div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Período de Investimento</span>
            <span className="font-black font-mono text-[var(--text-primary)]">{anos} {anos === 1 ? "ano" : "anos"}</span>
          </div>
          <input type="range" min={1} max={35} step={1} value={anos} onChange={(e) => setAnos(Number(e.target.value))} className="w-full accent-blue-600 cursor-pointer" />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)]"><span>1 ano</span><span>35 anos</span></div>
        </div>

        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-[10px] text-[var(--text-muted)] leading-relaxed flex items-start gap-2">
          <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
          <span>Aporte pequeno, constância inabalável e tempo: os três pilares que transformam simples poupadores em investidores consolidados.</span>
        </div>
      </div>
    </div>
  );
}
