import React, { useState, useMemo } from "react";
import {
  ShoppingCart, Plus, Trash2, Search, Store, TrendingDown,
  PieChart as PieIcon, Edit2, Calendar as CalendarIcon,
  Database, ChevronDown, ChevronRight, Award
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { useSupermarketProducts, useUserProfile } from "../../hooks/useFirebaseData";
import { SupermarketProduct } from "../../types";

const CATEGORIES = [
  { id: "Mercearia", label: "Mercearia", color: "#3b82f6" },
  { id: "Hortifrúti", label: "Hortifrúti", color: "#10b981" },
  { id: "Carnes", label: "Carnes e Peixes", color: "#ef4444" },
  { id: "Laticínios", label: "Laticínios e Frios", color: "#f59e0b" },
  { id: "Limpeza", label: "Limpeza", color: "#8b5cf6" },
  { id: "Higiene", label: "Higiene e Beleza", color: "#ec4899" },
  { id: "Bebidas", label: "Bebidas", color: "#06b6d4" },
  { id: "Outros", label: "Outros", color: "#6b7280" }
];

const POPULAR_SUPERMARKETS = [
  "Carrefour", "Pão de Açúcar", "Assaí Atacadista", "Atacadão", "Sonda", "Extra", "Pão de Açúcar Minuto", "Local / Bairro"
];

// Base de referência de mercado usada SOMENTE como sugestão de autocomplete
// (nome/categoria/preço estimado). Nunca é tratada como lançamento real do usuário.
const MARKET_PRICE_SUGGESTIONS: { name: string; category: string; price: number }[] = [
  { name: "Banana Prata (Kg)", category: "Hortifrúti", price: 8.90 },
  { name: "Detergente de Louça", category: "Limpeza", price: 2.10 },
  { name: "Café Torrado 500g", category: "Mercearia", price: 17.50 },
  { name: "Papel Higiênico 12 un", category: "Higiene", price: 15.90 },
  { name: "Iogurte Natural", category: "Laticínios", price: 3.20 },
  { name: "Tomate Italiano (Kg)", category: "Hortifrúti", price: 9.80 },
  { name: "Arroz Integral 1kg", category: "Mercearia", price: 7.99 },
  { name: "Feijão Carioca 1kg", category: "Mercearia", price: 8.50 },
  { name: "Leite Integral 1L", category: "Laticínios", price: 4.89 },
  { name: "Alcatra Premium (Kg)", category: "Carnes", price: 36.50 }
];

const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const tooltipContentStyle = {
  backgroundColor: "var(--card-bg)",
  border: "1px solid var(--border-color)",
  borderRadius: "12px",
  color: "var(--text-primary)",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
};
const tooltipItemStyle = { color: "var(--text-primary)" };
const tooltipLabelStyle = { color: "var(--text-muted)", fontWeight: 700 };

export default function SupermercadoTab() {
  const { products, addProduct, deleteProduct } = useSupermarketProducts();
  const { profile, updateProfile } = useUserProfile();

  const supermarketLimit = profile?.supermarketLimit || 0;
  const hasLimit = !!profile?.supermarketLimit && profile.supermarketLimit > 0;

  const currentMonth = useMemo(() => new Date().toISOString().slice(0, 7), []);

  const [activeSubTab, setActiveSubTab] = useState<"compras" | "comparador" | "relatorios">("compras");

  // Form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mercearia");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newSupermarket, setNewSupermarket] = useState("Carrefour");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  // Budget limit editing
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(supermarketLimit ? supermarketLimit.toString() : "");

  // Search and view filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Todas");
  const [selectedSupermarketFilter, setSelectedSupermarketFilter] = useState("Todos");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>(currentMonth);

  // Price finder (item 6)
  const [priceSearchQuery, setPriceSearchQuery] = useState("");

  // Year/month history expansion (item 7)
  const [expandedYears, setExpandedYears] = useState<Record<string, boolean>>({});

  const uniqueMonths = useMemo(() => {
    const months = products.map(p => p.month);
    const withCurrent = new Set([...months, currentMonth]);
    return (Array.from(withCurrent) as string[]).sort((a, b) => b.localeCompare(a));
  }, [products, currentMonth]);

  const uniqueSupermarkets = useMemo(() => {
    const supers = products.map(p => p.supermarket);
    return Array.from(new Set(supers)).sort();
  }, [products]);

  // Autocomplete suggestions: user's own history + static reference prices
  const baseSuggestions = useMemo(() => {
    const map = new Map<string, { category: string; lastSupermarket: string; minPrice: number }>();

    products.forEach(p => {
      const key = p.name.trim();
      if (!map.has(key)) {
        map.set(key, { category: p.category, lastSupermarket: p.supermarket, minPrice: p.price });
      } else {
        const curr = map.get(key)!;
        if (p.price < curr.minPrice) curr.minPrice = p.price;
      }
    });

    MARKET_PRICE_SUGGESTIONS.forEach(s => {
      if (!map.has(s.name)) {
        map.set(s.name, { category: s.category, lastSupermarket: newSupermarket, minPrice: s.price });
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({ name, ...data }));
  }, [products]);

  const matchingSuggestions = useMemo(() => {
    if (!newName.trim()) return [];
    return baseSuggestions
      .filter(s => s.name.toLowerCase().includes(newName.toLowerCase()))
      .slice(0, 5);
  }, [newName, baseSuggestions]);

  const handleSelectSuggestion = (s: typeof baseSuggestions[0]) => {
    setNewName(s.name);
    setNewCategory(s.category);
    setNewPrice(s.minPrice.toFixed(2));
    setNewSupermarket(s.lastSupermarket);
    setIsSuggestOpen(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !newQty) return;

    const parsedPrice = parseFloat(newPrice.replace(",", "."));
    const parsedQty = parseFloat(newQty.replace(",", "."));

    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedQty) || parsedQty <= 0) {
      alert("Por favor, insira valores numéricos válidos e maiores que zero.");
      return;
    }

    const monthStr = newDate.substring(0, 7);

    await addProduct({
      name: newName.trim(),
      category: newCategory,
      price: parsedPrice,
      qty: parsedQty,
      supermarket: newSupermarket,
      date: newDate,
      month: monthStr
    });

    setNewName("");
    setNewPrice("");
    setNewQty("1");
    setIsSuggestOpen(false);

    if (!uniqueMonths.includes(monthStr)) {
      setSelectedMonthFilter(monthStr);
    }
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
  };

  const handleSaveLimit = async () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      await updateProfile({ supermarketLimit: val });
      setIsEditingLimit(false);
    }
  };

  // Monthly calculations for the selected month
  const monthlyProducts = useMemo(() => {
    return products.filter(p => p.month === selectedMonthFilter);
  }, [products, selectedMonthFilter]);

  const totalMonthlySpent = useMemo(() => {
    return monthlyProducts.reduce((sum, p) => sum + (p.price * p.qty), 0);
  }, [monthlyProducts]);

  const limitConsumptionPercent = useMemo(() => {
    if (supermarketLimit <= 0) return 0;
    return Math.min(Math.round((totalMonthlySpent / supermarketLimit) * 100), 100);
  }, [totalMonthlySpent, supermarketLimit]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "Todas" || p.category === selectedCategoryFilter;
      const matchesSupermarket = selectedSupermarketFilter === "Todos" || p.supermarket === selectedSupermarketFilter;
      const matchesMonth = p.month === selectedMonthFilter;
      return matchesSearch && matchesCategory && matchesSupermarket && matchesMonth;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [products, searchQuery, selectedCategoryFilter, selectedSupermarketFilter, selectedMonthFilter]);

  // Price Comparer calculations
  const priceMatrix = useMemo(() => {
    const matrix: Record<string, { category: string; stores: Record<string, { price: number; date: string }> }> = {};

    products.forEach(p => {
      const normName = p.name.trim().toLowerCase();
      const displayKey = p.name.trim();
      const existingKey = Object.keys(matrix).find(k => k.toLowerCase() === normName) || displayKey;

      if (!matrix[existingKey]) {
        matrix[existingKey] = { category: p.category, stores: {} };
      }

      const currentStorePrice = matrix[existingKey].stores[p.supermarket]?.price;
      const currentStoreDate = matrix[existingKey].stores[p.supermarket]?.date;

      if (!currentStorePrice || p.date >= currentStoreDate) {
        matrix[existingKey].stores[p.supermarket] = { price: p.price, date: p.date };
      }
    });

    return Object.entries(matrix).map(([name, data]) => {
      const stores = Object.entries(data.stores).map(([storeName, storeData]) => ({
        store: storeName,
        price: storeData.price
      }));

      let minPrice = Infinity;
      let minStore = "";
      stores.forEach(s => {
        if (s.price < minPrice) {
          minPrice = s.price;
          minStore = s.store;
        }
      });

      return {
        name,
        category: data.category,
        stores: data.stores,
        minPrice: minPrice === Infinity ? null : minPrice,
        minStore,
        storesCount: stores.length
      };
    }).sort((a, b) => b.storesCount - a.storesCount || a.name.localeCompare(b.name));
  }, [products]);

  // Item 6: Simple lowest-price finder across all launched products
  const priceSearchResults = useMemo(() => {
    const q = priceSearchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches = products.filter(p => p.name.toLowerCase().includes(q));
    const byStore: Record<string, { store: string; minPrice: number; lastDate: string }> = {};

    matches.forEach(p => {
      if (!byStore[p.supermarket] || p.price < byStore[p.supermarket].minPrice) {
        byStore[p.supermarket] = { store: p.supermarket, minPrice: p.price, lastDate: p.date };
      }
    });

    return Object.values(byStore).sort((a, b) => a.minPrice - b.minPrice);
  }, [priceSearchQuery, products]);

  // Report calculations
  const categorySpendingData = useMemo(() => {
    const categorySums: Record<string, number> = {};
    monthlyProducts.forEach(p => {
      categorySums[p.category] = (categorySums[p.category] || 0) + (p.price * p.qty);
    });

    return CATEGORIES.map(c => ({
      name: c.label,
      value: Number((categorySums[c.id] || 0).toFixed(2)),
      color: c.color
    })).filter(item => item.value > 0);
  }, [monthlyProducts]);

  const supermarketSpendingData = useMemo(() => {
    const superSums: Record<string, number> = {};
    monthlyProducts.forEach(p => {
      superSums[p.supermarket] = (superSums[p.supermarket] || 0) + (p.price * p.qty);
    });

    return Object.entries(superSums).map(([name, sum]) => ({
      name,
      value: Number(sum.toFixed(2))
    })).sort((a, b) => b.value - a.value);
  }, [monthlyProducts]);

  // Item 7: Full year -> month spending history (not just selected month)
  const yearlyHistory = useMemo(() => {
    const byYear: Record<string, Record<string, { total: number; count: number }>> = {};

    products.forEach(p => {
      if (!p.month) return;
      const [year, month] = p.month.split("-");
      if (!byYear[year]) byYear[year] = {};
      if (!byYear[year][p.month]) byYear[year][p.month] = { total: 0, count: 0 };
      byYear[year][p.month].total += p.price * p.qty;
      byYear[year][p.month].count += 1;
    });

    return Object.entries(byYear)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([monthKey, data]) => ({ monthKey, ...data })),
        yearTotal: Object.values(months).reduce((sum, m) => sum + m.total, 0)
      }));
  }, [products]);

  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    return `${MONTHS_PT[parseInt(month) - 1]} / ${year}`;
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Mini Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/15 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <ShoppingCart size={11} className="text-amber-300" />
                Seus Lançamentos
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans text-white">
              Controle de Supermercados
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-sans leading-relaxed">
              Registre suas compras reais e acompanhe os preços praticados por estabelecimento para planejar seus gastos com precisão.
            </p>
          </div>

          {/* Budget Limit Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-full md:w-auto md:min-w-[240px] flex flex-col justify-between self-start md:self-auto shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
              <span className="text-[10px] font-black tracking-wider uppercase text-blue-200">Limite de Gastos Mensal</span>
              {isEditingLimit ? (
                <button onClick={handleSaveLimit} className="text-[10px] bg-white text-blue-700 px-2.5 py-0.5 rounded font-black hover:bg-zinc-100 transition-all cursor-pointer shrink-0">
                  SALVAR
                </button>
              ) : (
                <button onClick={() => { setTempLimit(supermarketLimit ? supermarketLimit.toString() : ""); setIsEditingLimit(true); }} className="text-white/60 hover:text-white transition-all cursor-pointer shrink-0">
                  <Edit2 size={12} />
                </button>
              )}
            </div>

            {isEditingLimit ? (
              <div className="flex gap-2">
                <span className="text-lg font-black text-white/75 mt-0.5 shrink-0">R$</span>
                <input
                  type="number"
                  autoFocus
                  placeholder="Ex: 800"
                  value={tempLimit}
                  onChange={e => setTempLimit(e.target.value)}
                  className="w-full min-w-0 bg-white/20 border-0 outline-none rounded-lg p-1 text-base font-black text-white placeholder-white/40 font-mono"
                />
              </div>
            ) : !hasLimit ? (
              <button
                onClick={() => { setTempLimit(""); setIsEditingLimit(true); }}
                className="text-left text-sm font-black text-white/90 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                Defina seu limite mensal
                <Edit2 size={12} className="shrink-0" />
              </button>
            ) : (
              <div>
                <span className="text-2xl font-black font-sans text-white">
                  R$ {supermarketLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mt-2 text-[10px] font-bold text-blue-200 flex justify-between items-center gap-2">
                  <span>{limitConsumptionPercent}% consumido</span>
                  <span className="truncate">R$ {(supermarketLimit - totalMonthlySpent).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} restante</span>
                </div>
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{ width: `${limitConsumptionPercent}%`, backgroundColor: limitConsumptionPercent > 90 ? "#ef4444" : limitConsumptionPercent > 70 ? "#f59e0b" : "#34d399" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Select Month and Tab Nav Grid */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarIcon size={14} className="text-blue-500 shrink-0" />
          <span className="text-xs font-black uppercase text-[var(--text-muted)] shrink-0">Período:</span>
          <select
            value={selectedMonthFilter}
            onChange={e => setSelectedMonthFilter(e.target.value)}
            className="bg-[var(--section-bg)] border border-[var(--border-color)] p-1.5 px-3 rounded-lg text-xs font-black text-[var(--text-primary)] outline-none cursor-pointer focus:border-blue-500 transition-all min-w-0"
          >
            {uniqueMonths.map(m => (
              <option key={m} value={m}>{formatMonthName(m)}</option>
            ))}
          </select>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl p-1 gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("compras")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "compras" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ShoppingCart size={13} />
            Lançar & Ver Produtos
          </button>
          <button
            onClick={() => setActiveSubTab("comparador")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "comparador" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Store size={13} />
            Comparar Preços
          </button>
          <button
            onClick={() => setActiveSubTab("relatorios")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === "relatorios" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <PieIcon size={13} />
            Estatísticas / Histórico
          </button>
        </div>
      </div>

      {/* CORE CONTENT RENDER */}
      <AnimatePresence mode="wait">

        {/* SUBTAB 1: COMPRAS & LANÇAMENTO */}
        {activeSubTab === "compras" && (
          <motion.div
            key="compras-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full min-w-0"
          >
            {/* Left Box: Form with Autocomplete Helper */}
            <div className="xl:col-span-4 space-y-6 min-w-0">
              <div className="p-5 sm:p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-lg shrink-0">
                      <Plus size={15} />
                    </div>
                    <h3 className="text-sm font-black uppercase text-[var(--text-primary)] tracking-wide">Novo Item</h3>
                  </div>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="relative">
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Banana Prata, Café Torrado, etc."
                      value={newName}
                      onFocus={() => setIsSuggestOpen(true)}
                      onChange={e => {
                        setNewName(e.target.value);
                        setIsSuggestOpen(true);
                      }}
                      className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    />

                    {isSuggestOpen && matchingSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a2e] border border-blue-500/40 rounded-xl shadow-2xl z-50 overflow-hidden text-white">
                        <div className="p-2 bg-blue-600/20 border-b border-white/10 text-[9.5px] font-black text-blue-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Sugestões</span>
                          <span>Preço Estimado</span>
                        </div>
                        {matchingSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-2.5 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between gap-2 transition-colors"
                          >
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-white truncate">{item.name}</div>
                              <div className="text-[9px] text-zinc-400 font-sans truncate">
                                {item.category} · {item.lastSupermarket}
                              </div>
                            </div>
                            <div className="text-xs font-black font-mono text-emerald-400 shrink-0">
                              R$ {item.minPrice.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Preço Unitário (R$)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 8.90"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Quantidade</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 1 ou 1.2"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Categoria</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Supermercado</label>
                    <input
                      type="text"
                      required
                      list="popular-stores"
                      placeholder="Pão de Açúcar, Assaí, Carrefour..."
                      value={newSupermarket}
                      onChange={e => setNewSupermarket(e.target.value)}
                      className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    />
                    <datalist id="popular-stores">
                      {POPULAR_SUPERMARKETS.map(item => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Data da Compra</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full text-xs p-3 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer text-center"
                  >
                    Adicionar ao Histórico
                  </button>
                </form>
              </div>
            </div>

            {/* Right Box: Product Listing */}
            <div className="xl:col-span-8 flex flex-col space-y-4 w-full min-w-0">

              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shadow-sm">

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
                  <div className="relative flex-1 min-w-[150px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar por item lançado..."
                      className="w-full text-xs p-2.5 pl-9 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:border-blue-500 placeholder-zinc-400 font-bold text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shrink-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] uppercase font-black tracking-wider text-blue-100 leading-none">
                        Gasto do Mês
                      </span>
                      <span className="text-sm font-black font-mono text-white mt-0.5 truncate">
                        R$ {totalMonthlySpent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="p-2 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer min-w-0"
                  >
                    <option value="Todas">Categorias (Todas)</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSupermarketFilter}
                    onChange={e => setSelectedSupermarketFilter(e.target.value)}
                    className="p-2 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer min-w-0"
                  >
                    <option value="Todos">Mercados (Todos)</option>
                    {uniqueSupermarkets.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Desktop Table View */}
              <div className="hidden md:flex bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex-col flex-grow">
                <div className="overflow-x-auto min-h-[350px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-zinc-500/5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-wider">
                        <th className="p-3.5 pl-5">Produto</th>
                        <th className="p-3.5">Categoria</th>
                        <th className="p-3.5">Preço Unitário</th>
                        <th className="p-3.5 text-center">Qtd.</th>
                        <th className="p-3.5">Supermercado</th>
                        <th className="p-3.5">Data</th>
                        <th className="p-3.5 text-center">Total</th>
                        <th className="p-3.5 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-20 text-[var(--text-muted)] text-xs">
                            <div className="max-w-xs mx-auto flex flex-col items-center">
                              <ShoppingCart size={24} className="opacity-20 mb-2" />
                              <p className="font-black">Sem produtos neste mês ou filtro</p>
                              <p className="text-[10px] mt-1">Insira compras no formulário lateral para visualizar os produtos nesta seção.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(prod => {
                          const catColor = CATEGORIES.find(c => c.id === prod.category)?.color || "#888888";
                          return (
                            <tr key={prod.id} className="text-xs hover:bg-zinc-500/5 transition-colors font-bold text-[var(--text-primary)]">
                              <td className="p-3.5 pl-5 font-black">{prod.name}</td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                  <span className="text-[10.5px]">{prod.category}</span>
                                </span>
                              </td>
                              <td className="p-3.5 font-mono whitespace-nowrap">
                                R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-3.5 text-center font-mono">{prod.qty}</td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="flex items-center gap-1 font-sans text-xs bg-zinc-500/10 px-2 py-0.5 rounded text-[var(--text-primary)] w-fit">
                                  <Store size={10} className="text-blue-500 shrink-0" />
                                  {prod.supermarket}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono text-[10.5px] text-[var(--text-muted)] whitespace-nowrap">
                                {prod.date.split("-").reverse().join("/")}
                              </td>
                              <td className="p-3.5 text-center font-mono font-black text-blue-500 whitespace-nowrap">
                                R$ {(prod.price * prod.qty).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/15 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                                  title="Excluir produto"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-3.5 pl-5 bg-zinc-500/5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)] font-bold gap-2">
                  <span className="truncate">Itens listados: <strong className="text-[var(--text-primary)]">{filteredProducts.length}</strong></span>
                  <span className="truncate">Soma da lista: <strong className="text-blue-500 font-mono">R$ {filteredProducts.reduce((sum, p) => sum + (p.price * p.qty), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-[var(--text-muted)] text-xs px-4">
                    <ShoppingCart size={24} className="opacity-20 mb-2 mx-auto" />
                    <p className="font-black">Sem produtos neste mês ou filtro</p>
                    <p className="text-[10px] mt-1">Insira compras no formulário acima para visualizar os produtos aqui.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--border-color)]">
                    {filteredProducts.map(prod => {
                      const catColor = CATEGORIES.find(c => c.id === prod.category)?.color || "#888888";
                      return (
                        <div key={prod.id} className="p-4 flex items-center justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-xs text-[var(--text-primary)] truncate">{prod.name}</div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: catColor }} />
                                {prod.category}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">· {prod.supermarket}</span>
                              <span className="text-[10px] text-[var(--text-muted)] font-mono">· {prod.date.split("-").reverse().join("/")}</span>
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono mt-1">
                              {prod.qty}x R$ {prod.price.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black font-mono text-blue-500 whitespace-nowrap">
                              R$ {(prod.price * prod.qty).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/15 p-1.5 rounded-lg transition-all cursor-pointer shrink-0"
                              title="Excluir produto"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="p-3.5 bg-zinc-500/5 border-t border-[var(--border-color)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold gap-2">
                  <span className="truncate">Itens: <strong className="text-[var(--text-primary)]">{filteredProducts.length}</strong></span>
                  <span className="truncate">Soma: <strong className="text-blue-500 font-mono">R$ {filteredProducts.reduce((sum, p) => sum + (p.price * p.qty), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: PRICE COMPARATOR MATRIX + LOWEST PRICE FINDER */}
        {activeSubTab === "comparador" && (
          <motion.div
            key="comparador-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 w-full min-w-0"
          >
            {/* Item 6: Lowest price finder */}
            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl space-y-3">
              <h4 className="text-sm font-black text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                <TrendingDown size={15} className="text-emerald-500 shrink-0" />
                Buscar Menor Preço
              </h4>
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={priceSearchQuery}
                  onChange={e => setPriceSearchQuery(e.target.value)}
                  placeholder="Ex: Iogurte, Café, Arroz..."
                  className="w-full text-xs p-3 pl-9 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:border-blue-500 font-bold text-[var(--text-primary)]"
                />
              </div>

              {priceSearchQuery.trim() && (
                priceSearchResults.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic py-2">Nenhum produto lançado com esse nome ainda.</p>
                ) : (
                  <div className="space-y-1.5 pt-1">
                    {priceSearchResults.map((r, idx) => (
                      <div
                        key={r.store}
                        className={`flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs ${idx === 0 ? "bg-emerald-500/10 border border-emerald-500/25" : "bg-zinc-500/5"}`}
                      >
                        <span className={`flex items-center gap-1.5 min-w-0 font-bold ${idx === 0 ? "text-emerald-500" : "text-[var(--text-primary)]"}`}>
                          {idx === 0 && <Award size={13} className="shrink-0" />}
                          <span className="truncate">{r.store}</span>
                        </span>
                        <span className="font-mono font-black shrink-0">R$ {r.minPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-black text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                  <Store size={15} className="text-blue-500 shrink-0" />
                  Matriz Comparativa de Estabelecimentos
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Compare os preços cobrados em cada supermercado para os produtos cadastrados na sua base.
                </p>
              </div>

              <div className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shrink-0">
                {priceMatrix.length} itens monitorados
              </div>
            </div>

            {priceMatrix.length === 0 ? (
              <div className="p-10 text-center text-xs text-[var(--text-muted)] bg-[var(--card-bg)]/40 border border-dashed border-[var(--border-color)] rounded-2xl">
                Lance produtos em mais de um supermercado para começar a comparar preços.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {priceMatrix.map(item => (
                  <div key={item.name} className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl space-y-3 shadow-sm min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h5 className="font-black text-sm text-[var(--text-primary)] truncate">{item.name}</h5>
                        <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>
                      </div>
                      {item.minPrice !== null && (
                        <span className="text-xs font-black font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded shrink-0">
                          Min: R$ {item.minPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                      {Object.entries(item.stores).map(([store, data]: [string, any]) => {
                        const isLowest = data.price === item.minPrice && item.storesCount > 1;
                        return (
                          <div key={store} className="flex items-center justify-between gap-2 text-xs">
                            <span className={`flex items-center gap-1 min-w-0 truncate ${isLowest ? "font-black text-emerald-500" : "text-[var(--text-muted)]"}`}>
                              <span className="truncate">{store}</span>
                              {isLowest && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 rounded font-black shrink-0">Melhor</span>}
                            </span>
                            <span className="font-mono font-bold text-[var(--text-primary)] shrink-0">
                              R$ {data.price.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* SUBTAB 3: REPORTS + YEAR/MONTH HISTORY */}
        {activeSubTab === "relatorios" && (
          <motion.div
            key="relatorios-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 w-full min-w-0"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0">
              {/* Spending by category chart */}
              <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4 min-w-0">
                <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider truncate">
                  Gastos por Categoria ({formatMonthName(selectedMonthFilter)})
                </h4>
                {categorySpendingData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Sem dados neste mês
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySpendingData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {categorySpendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                          contentStyle={tooltipContentStyle}
                          itemStyle={tooltipItemStyle}
                          labelStyle={tooltipLabelStyle}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Spending by supermarket */}
              <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4 min-w-0">
                <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider truncate">
                  Gastos por Supermercado ({formatMonthName(selectedMonthFilter)})
                </h4>
                {supermarketSpendingData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-[var(--text-muted)] italic">
                    Sem dados neste mês
                  </div>
                ) : (
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supermarketSpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} angle={-25} textAnchor="end" />
                        <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
                        <Tooltip
                          formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                          contentStyle={tooltipContentStyle}
                          itemStyle={tooltipItemStyle}
                          labelStyle={tooltipLabelStyle}
                          cursor={{ fill: "var(--border-color)", opacity: 0.3 }}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Item 7: Year -> Month history accordion */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[var(--border-color)] bg-zinc-500/5">
                <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                  Histórico de Gastos por Ano
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Seus lançamentos de meses anteriores continuam disponíveis aqui, organizados por ano.
                </p>
              </div>

              {yearlyHistory.length === 0 ? (
                <div className="text-center py-10 text-xs text-[var(--text-muted)] italic">
                  Nenhum histórico registrado ainda.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-color)]">
                  {yearlyHistory.map(yearData => {
                    const isExpanded = expandedYears[yearData.year] !== false;
                    return (
                      <div key={yearData.year}>
                        <button
                          onClick={() => setExpandedYears(prev => ({ ...prev, [yearData.year]: !isExpanded }))}
                          className="w-full p-3.5 flex items-center justify-between gap-2 hover:bg-zinc-500/5 transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2 text-xs font-black text-[var(--text-primary)]">
                            {isExpanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
                            {yearData.year}
                          </span>
                          <span className="text-xs font-mono font-black text-blue-500 shrink-0">
                            R$ {yearData.yearTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="pb-2">
                            {yearData.months.map(m => (
                              <button
                                key={m.monthKey}
                                onClick={() => setSelectedMonthFilter(m.monthKey)}
                                className={`w-full flex items-center justify-between gap-2 px-4 sm:pl-10 py-2.5 text-xs hover:bg-blue-500/5 transition-colors cursor-pointer ${selectedMonthFilter === m.monthKey ? "bg-blue-500/10" : ""}`}
                              >
                                <span className="text-[var(--text-muted)] font-bold truncate">{formatMonthName(m.monthKey)}</span>
                                <span className="flex items-center gap-3 shrink-0">
                                  <span className="text-[10px] text-[var(--text-muted)]">{m.count} {m.count === 1 ? "item" : "itens"}</span>
                                  <span className="font-mono font-black text-[var(--text-primary)]">
                                    R$ {m.total.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
