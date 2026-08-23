import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingCart, Plus, Trash2, Search, Filter, TrendingDown,
  TrendingUp, Store, ChevronRight, DollarSign, PieChart as PieIcon, 
  Sparkles, Check, Edit2, AlertCircle, RefreshCw, Calendar as CalendarIcon,
  HelpCircle, Database, ArrowUpRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

// TypeScript core interfaces for supermarket management
export interface SupermarketProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  qty: number;
  supermarket: string;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
}

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

// Base Oficial de Referência de Mercado (Experiência Real Salva)
export const MARKET_PRICE_REFERENCE_BASE: SupermarketProduct[] = [
  { id: "1", name: "Banana Prata (Kg)", category: "Hortifrúti", price: 8.90, qty: 1.2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "2", name: "Detergente de Louça", category: "Limpeza", price: 2.10, qty: 4, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "3", name: "Detergente de Louça", category: "Limpeza", price: 2.45, qty: 2, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "4", name: "Café Torrado 500g", category: "Mercearia", price: 18.90, qty: 3, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "5", name: "Café Torrado 500g", category: "Mercearia", price: 17.50, qty: 2, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "6", name: "Papel Higiênico 12 un", category: "Higiene", price: 15.90, qty: 1, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "7", name: "Iogurte Natural", category: "Laticínios", price: 3.20, qty: 8, supermarket: "Sonda", date: "2026-06-05", month: "2026-06" },
  { id: "8", name: "Tomate Italiano (Kg)", category: "Hortifrúti", price: 9.80, qty: 1.2, supermarket: "Sonda", date: "2026-06-05", month: "2026-06" },
  { id: "9", name: "Arroz Integral 1kg", category: "Mercearia", price: 8.49, qty: 2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "10", name: "Arroz Integral 1kg", category: "Mercearia", price: 7.99, qty: 1, supermarket: "Carrefour", date: "2026-06-10", month: "2026-06" },
  { id: "11", name: "Feijão Carioca 1kg", category: "Mercearia", price: 9.20, qty: 2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "12", name: "Feijão Carioca 1kg", category: "Mercearia", price: 8.50, qty: 3, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "13", name: "Leite Integral 1L", category: "Laticínios", price: 4.89, qty: 12, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "14", name: "Leite Integral 1L", category: "Laticínios", price: 5.49, qty: 6, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "15", name: "Leite Integral 1L", category: "Laticínios", price: 6.20, qty: 4, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "16", name: "Alcatra Premium (Kg)", category: "Carnes", price: 36.50, qty: 2.5, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "17", name: "Alcatra Premium (Kg)", category: "Carnes", price: 39.90, qty: 2, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "18", name: "Alcatra Premium (Kg)", category: "Carnes", price: 44.90, qty: 1.5, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" }
];

export default function SupermercadoTab() {
  const [products, setProducts] = useState<SupermarketProduct[]>(() => {
    const saved = localStorage.getItem("tarflow_supermarket_products");
    return saved ? JSON.parse(saved) : MARKET_PRICE_REFERENCE_BASE;
  });

  const [activeSubTab, setActiveSubTab] = useState<"compras" | "comparador" | "relatorios">("compras");

  // Form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mercearia");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newSupermarket, setNewSupermarket] = useState("Carrefour");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Autocomplete & Reference Helper
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);

  // Budget states
  const [supermarketLimit, setSupermarketLimit] = useState<number>(() => {
    const saved = localStorage.getItem("tarflow_supermarket_limit");
    return saved ? Number(saved) : 800; // default 800 BRL
  });
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [tempLimit, setTempLimit] = useState(supermarketLimit.toString());

  // Search and view filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("Todas");
  const [selectedSupermarketFilter, setSelectedSupermarketFilter] = useState("Todos");
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>("2026-06");

  // Sync back to local storage
  useEffect(() => {
    localStorage.setItem("tarflow_supermarket_products", JSON.stringify(products));
  }, [products]);

  // Filter lists automatically
  const uniqueMonths = useMemo(() => {
    const months = products.map(p => p.month);
    return (Array.from(new Set(months)) as string[]).sort((a, b) => b.localeCompare(a));
  }, [products]);

  const uniqueSupermarkets = useMemo(() => {
    const supers = products.map(p => p.supermarket);
    return Array.from(new Set(supers)).sort();
  }, [products]);

  // Base suggestions for auto-filling prices
  const baseSuggestions = useMemo(() => {
    const map = new Map<string, { category: string; avgPrice: number; lastSupermarket: string; minPrice: number }>();
    
    // We combine all products from current + reference base
    const all = [...products, ...MARKET_PRICE_REFERENCE_BASE];
    all.forEach(p => {
      const key = p.name.trim();
      if (!map.has(key)) {
        map.set(key, { category: p.category, avgPrice: p.price, lastSupermarket: p.supermarket, minPrice: p.price });
      } else {
        const curr = map.get(key)!;
        curr.avgPrice = (curr.avgPrice + p.price) / 2;
        if (p.price < curr.minPrice) curr.minPrice = p.price;
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }, [products]);

  // Filtered autocomplete list based on user typing
  const matchingSuggestions = useMemo(() => {
    if (!newName.trim() || newName.length < 1) return [];
    return baseSuggestions
      .filter(s => s.name.toLowerCase().includes(newName.toLowerCase()))
      .slice(0, 5);
  }, [newName, baseSuggestions]);

  // Apply suggestion
  const handleSelectSuggestion = (s: typeof baseSuggestions[0]) => {
    setNewName(s.name);
    setNewCategory(s.category);
    setNewPrice(s.minPrice.toFixed(2));
    setNewSupermarket(s.lastSupermarket);
    setIsSuggestOpen(false);
  };

  // Reset / Restore Reference Base
  const handleResetToBase = () => {
    if (window.confirm("Deseja restaurar a Base de Preços de Referência da experiência real de mercado? Novos produtos adicionados serão reiniciados.")) {
      setProducts(MARKET_PRICE_REFERENCE_BASE);
      localStorage.setItem("tarflow_supermarket_products", JSON.stringify(MARKET_PRICE_REFERENCE_BASE));
      setSelectedMonthFilter("2026-06");
    }
  };

  // Handle Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice || !newQty) return;

    const parsedPrice = parseFloat(newPrice.replace(",", "."));
    const parsedQty = parseFloat(newQty.replace(",", "."));

    if (isNaN(parsedPrice) || parsedPrice <= 0 || isNaN(parsedQty) || parsedQty <= 0) {
      alert("Por favor, insira valores numéricos válidos e maiores que zero.");
      return;
    }

    const monthStr = newDate.substring(0, 7); // YYYY-MM

    const newProd: SupermarketProduct = {
      id: Date.now().toString(),
      name: newName.trim(),
      category: newCategory,
      price: parsedPrice,
      qty: parsedQty,
      supermarket: newSupermarket,
      date: newDate,
      month: monthStr
    };

    setProducts(prev => [newProd, ...prev]);
    setNewName("");
    setNewPrice("");
    setNewQty("1");
    setIsSuggestOpen(false);
    
    // Auto populate month filter if needed
    if (!uniqueMonths.includes(monthStr)) {
      setSelectedMonthFilter(monthStr);
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Limit management
  const handleSaveLimit = () => {
    const val = parseFloat(tempLimit);
    if (!isNaN(val) && val >= 0) {
      setSupermarketLimit(val);
      localStorage.setItem("tarflow_supermarket_limit", val.toString());
      setIsEditingLimit(false);
    }
  };

  // 1st Level Calculations: Total Monthly Expenses for the selected month
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

  // Filtered lists for rendering columns
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryFilter === "Todas" || p.category === selectedCategoryFilter;
      const matchesSupermarket = selectedSupermarketFilter === "Todos" || p.supermarket === selectedSupermarketFilter;
      const matchesMonth = p.month === selectedMonthFilter;
      return matchesSearch && matchesCategory && matchesSupermarket && matchesMonth;
    });
  }, [products, searchQuery, selectedCategoryFilter, selectedSupermarketFilter, selectedMonthFilter]);

  // Price Comparer calculations
  const priceMatrix = useMemo(() => {
    const matrix: Record<string, { category: string; stores: Record<string, { price: number; date: string }> }> = {};

    products.forEach(p => {
      const normName = p.name.trim().toLowerCase();
      const displayKey = p.name.trim();
      const existingKey = Object.keys(matrix).find(k => k.toLowerCase() === normName) || displayKey;

      if (!matrix[existingKey]) {
        matrix[existingKey] = {
          category: p.category,
          stores: {}
        };
      }

      const currentStorePrice = matrix[existingKey].stores[p.supermarket]?.price;
      const currentStoreDate = matrix[existingKey].stores[p.supermarket]?.date;

      if (!currentStorePrice || p.date >= currentStoreDate) {
        matrix[existingKey].stores[p.supermarket] = {
          price: p.price,
          date: p.date
        };
      }
    });

    return Object.entries(matrix).map(([name, data]) => {
      const stores = Object.entries(data.stores).map(([storeName, storeData]) => ({
        store: storeName,
        price: storeData.price
      }));

      let minPrice = Infinity;
      let minStore = "";
      let maxPrice = -Infinity;
      let maxStore = "";

      stores.forEach(s => {
        if (s.price < minPrice) {
          minPrice = s.price;
          minStore = s.store;
        }
        if (s.price > maxPrice) {
          maxPrice = s.price;
          maxStore = s.store;
        }
      });

      return {
        name,
        category: data.category,
        stores: data.stores,
        minPrice: minPrice === Infinity ? null : minPrice,
        minStore,
        maxPrice: maxPrice === -Infinity ? null : maxPrice,
        maxStore,
        storesCount: stores.length
      };
    }).sort((a,b) => b.storesCount - a.storesCount || a.name.localeCompare(b.name));
  }, [products]);

  // Report calculations: Category sums
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
    })).sort((a,b) => b.value - a.value);
  }, [monthlyProducts]);

  // Translate Months to Portuguese
  const formatMonthName = (monthStr: string) => {
    if (!monthStr) return "";
    const [year, month] = monthStr.split("-");
    const monthsPt = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${monthsPt[parseInt(month) - 1]} / ${year}`;
  };

  return (
    <div className="space-y-6 w-full min-w-0">
      {/* Mini Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-5 sm:p-7 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-white/15 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <ShoppingCart size={11} className="text-amber-300" />
                Base de Mercado Ativa
              </span>
              <button
                onClick={handleResetToBase}
                className="bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white border border-white/15 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all cursor-pointer"
                title="Restaurar dados de referência salvos"
              >
                <RefreshCw size={10} />
                Restaurar Base de Preços
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans text-white">
              Controle de Supermercados
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-sans leading-relaxed">
              Base de preços e planejamento de compras do mês. Saiba exatamente os preços praticados por estabelecimento e projete seus gastos com precisão.
            </p>
          </div>

          {/* Budget Limit Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[240px] flex flex-col justify-between self-start md:self-auto shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
              <span className="text-[10px] font-black tracking-wider uppercase text-blue-200">Limite de Gastos Mensal</span>
              {isEditingLimit ? (
                <button onClick={handleSaveLimit} className="text-[10px] bg-white text-blue-700 px-2.5 py-0.5 rounded font-black hover:bg-zinc-100 transition-all cursor-pointer">
                  SALVAR
                </button>
              ) : (
                <button onClick={() => { setTempLimit(supermarketLimit.toString()); setIsEditingLimit(true); }} className="text-white/60 hover:text-white transition-all cursor-pointer">
                  <Edit2 size={12} />
                </button>
              )}
            </div>

            {isEditingLimit ? (
              <div className="flex gap-2">
                <span className="text-lg font-black text-white/75 mt-0.5">R$</span>
                <input
                  type="number"
                  value={tempLimit}
                  onChange={e => setTempLimit(e.target.value)}
                  className="w-full bg-white/20 border-0 outline-none rounded-lg p-1 text-base font-black text-white placeholder-white/30 font-mono"
                />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black font-sans text-white">
                  R$ {supermarketLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mt-2 text-[10px] font-bold text-blue-200 flex justify-between items-center">
                  <span>{limitConsumptionPercent}% consumido</span>
                  <span>R$ {(supermarketLimit - totalMonthlySpent).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} restante</span>
                </div>
                {/* Visual Consumption Bar */}
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
        <div className="flex items-center gap-2">
          <CalendarIcon size={14} className="text-blue-500" />
          <span className="text-xs font-black uppercase text-[var(--text-muted)]">Período:</span>
          <select
            value={selectedMonthFilter}
            onChange={e => setSelectedMonthFilter(e.target.value)}
            className="bg-[var(--section-bg)] border border-[var(--border-color)] p-1.5 px-3 rounded-lg text-xs font-black text-[var(--text-primary)] outline-none cursor-pointer focus:border-blue-500 transition-all"
          >
            {uniqueMonths.length === 0 ? (
              <option value="2026-06">Junho / 2026</option>
            ) : (
              uniqueMonths.map(m => (
                <option key={m} value={m}>{formatMonthName(m)}</option>
              ))
            )}
          </select>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl p-1 gap-1 w-full sm:w-auto">
          <button
            onClick={() => setActiveSubTab("compras")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "compras" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <ShoppingCart size={13} />
            Lançar & Ver Produtos
          </button>
          <button
            onClick={() => setActiveSubTab("comparador")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "comparador" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Store size={13} />
            Comparar Preços
          </button>
          <button
            onClick={() => setActiveSubTab("relatorios")}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === "relatorios" ? "bg-blue-600 text-white shadow-sm" : "text-[var(--text-muted)] hover:text-[var(--text-primary)] relative"
            }`}
          >
            <PieIcon size={13} />
            Estatísticas / IA
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
            <div className="xl:col-span-4 space-y-6">
              <div className="p-5 sm:p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)] mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-lg">
                      <Plus size={15} />
                    </div>
                    <h3 className="text-sm font-black uppercase text-[var(--text-primary)] tracking-wide">Novo Item</h3>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Base Ativa
                  </span>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div className="relative">
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">
                      Nome do Produto (com sugestão da base)
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

                    {/* Autocomplete Dropdown from user database */}
                    {isSuggestOpen && matchingSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-[#1a1a2e] border border-blue-500/40 rounded-xl shadow-2xl z-50 overflow-hidden text-white">
                        <div className="p-2 bg-blue-600/20 border-b border-white/10 text-[9.5px] font-black text-blue-300 uppercase tracking-wider flex items-center justify-between">
                          <span>Sugestões da sua Base de Preços</span>
                          <span>Preço Estimado</span>
                        </div>
                        {matchingSuggestions.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectSuggestion(item)}
                            className="p-2.5 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between transition-colors"
                          >
                            <div>
                              <div className="text-xs font-bold text-white">{item.name}</div>
                              <div className="text-[9px] text-zinc-400 font-sans">
                                {item.category} · {item.lastSupermarket}
                              </div>
                            </div>
                            <div className="text-xs font-black font-mono text-emerald-400">
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

              {/* Price Base Quick Card */}
              <div className="p-4 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-blue-500/15 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-extrabold mb-1">
                  <Database size={13} />
                  <span>BASE DE EXPERIÊNCIA DE MERCADO</span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed mt-1">
                  Sua experiência de mercado com Banana Prata, Detergente, Café Torrado, Leite e Carnes está salva. Sempre que você for ao mercado, pode usar esses dados para estimar o valor que irá gastar.
                </p>
              </div>
            </div>

            {/* Right Box: Product Listing with Top Spending Indicator */}
            <div className="xl:col-span-8 flex flex-col space-y-4 w-full min-w-0">
              
              {/* Dynamic Filter Controls & TOP TOTAL MONTHLY SPENDING */}
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between shadow-sm">
                
                {/* Search Bar + Top Total Monthly Spending Badge */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Buscar por item lançado..."
                      className="w-full text-xs p-2.5 pl-9 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:border-blue-500 placeholder-zinc-400 font-bold text-[var(--text-primary)]"
                    />
                  </div>

                  {/* Top Spending Indicator (Instantly Visible at the Top) */}
                  <div className="flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md shrink-0">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase font-black tracking-wider text-blue-100 leading-none">
                        Gasto do Mês
                      </span>
                      <span className="text-sm font-black font-mono text-white mt-0.5">
                        R$ {totalMonthlySpent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Filter Selects */}
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="p-2 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todas">Categorias (Todas)</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSupermarketFilter}
                    onChange={e => setSelectedSupermarketFilter(e.target.value)}
                    className="p-2 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todos">Mercados (Todos)</option>
                    {uniqueSupermarkets.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Table list */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm flex flex-col flex-grow">
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
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                  <span className="text-[10.5px]">{prod.category}</span>
                                </span>
                              </td>
                              <td className="p-3.5 font-mono whitespace-nowrap">
                                R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-3.5 text-center font-mono">{prod.qty}</td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="flex items-center gap-1 font-sans text-xs bg-zinc-500/10 px-2 py-0.5 rounded text-[var(--text-primary)] w-fit">
                                  <Store size={10} className="text-blue-500" />
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
                                  className="text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/15 p-1.5 rounded-lg transition-all cursor-pointer"
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

                {/* Sub-summary bottom */}
                <div className="p-3.5 pl-5 bg-zinc-500/5 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)] font-bold">
                  <span>Itens listados: <strong className="text-[var(--text-primary)]">{filteredProducts.length}</strong></span>
                  <span>Soma da lista: <strong className="text-blue-500 font-mono">R$ {filteredProducts.reduce((sum, p) => sum + (p.price*p.qty), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 2: PRICE COMPARATOR MATRIX */}
        {activeSubTab === "comparador" && (
          <motion.div
            key="comparador-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-4 w-full min-w-0"
          >
            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                  <Store size={15} className="text-blue-500" />
                  Matriz Comparativa de Estabelecimentos
                </h4>
                <p className="text-xs text-[var(--text-muted)]">
                  Compare os preços cobrados em cada supermercado para os produtos cadastrados na sua base.
                </p>
              </div>

              <div className="text-[11px] font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                {priceMatrix.length} itens monitorados
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceMatrix.map(item => (
                <div key={item.name} className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-black text-sm text-[var(--text-primary)]">{item.name}</h5>
                      <span className="text-[10px] text-[var(--text-muted)]">{item.category}</span>
                    </div>
                    {item.minPrice !== null && (
                      <span className="text-xs font-black font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                        Min: R$ {item.minPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-color)]">
                    {Object.entries(item.stores).map(([store, data]: [string, any]) => {
                      const isLowest = data.price === item.minPrice && item.storesCount > 1;
                      return (
                        <div key={store} className="flex items-center justify-between text-xs">
                          <span className={`flex items-center gap-1 ${isLowest ? "font-black text-emerald-500" : "text-[var(--text-muted)]"}`}>
                            {store}
                            {isLowest && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-1.5 rounded font-black">Melhor</span>}
                          </span>
                          <span className="font-mono font-bold text-[var(--text-primary)]">
                            R$ {data.price.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: REPORTS */}
        {activeSubTab === "relatorios" && (
          <motion.div
            key="relatorios-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full min-w-0"
          >
            {/* Spending by category chart */}
            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                Gastos por Categoria ({formatMonthName(selectedMonthFilter)})
              </h4>
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
                    <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending by supermarket */}
            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                Gastos por Supermercado ({formatMonthName(selectedMonthFilter)})
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={supermarketSpendingData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
