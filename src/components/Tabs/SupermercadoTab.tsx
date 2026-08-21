import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingCart, Plus, Trash2, Search, Filter, TrendingDown,
  TrendingUp, Store, ChevronRight, DollarSign, PieChart as PieIcon, 
  Sparkles, Check, Edit2, AlertCircle, RefreshCw
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

const INITIAL_PRODUCTS: SupermarketProduct[] = [
  { id: "1", name: "Arroz Integral 1kg", category: "Mercearia", price: 8.49, qty: 2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "2", name: "Arroz Integral 1kg", category: "Mercearia", price: 7.99, qty: 1, supermarket: "Carrefour", date: "2026-06-10", month: "2026-06" },
  { id: "3", name: "Feijão Carioca 1kg", category: "Mercearia", price: 9.20, qty: 2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "4", name: "Feijão Carioca 1kg", category: "Mercearia", price: 8.50, qty: 3, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "5", name: "Leite Integral 1L", category: "Laticínios", price: 5.49, qty: 6, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "6", name: "Leite Integral 1L", category: "Laticínios", price: 4.89, qty: 12, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "7", name: "Leite Integral 1L", category: "Laticínios", price: 6.20, qty: 4, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "8", name: "Alcatra Premium (Kg)", category: "Carnes", price: 44.90, qty: 1.5, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "9", name: "Alcatra Premium (Kg)", category: "Carnes", price: 39.90, qty: 2, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "10", name: "Alcatra Premium (Kg)", category: "Carnes", price: 36.50, qty: 2.5, supermarket: "Assaí Atacadista", date: "2026-05-28", month: "2026-05" },
  { id: "11", name: "Banana Prata (Kg)", category: "Hortifrúti", price: 7.20, qty: 1.8, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "12", name: "Banana Prata (Kg)", category: "Hortifrúti", price: 8.90, qty: 1.2, supermarket: "Pão de Açúcar", date: "2026-06-15", month: "2026-06" },
  { id: "13", name: "Detergente de Louça", category: "Limpeza", price: 2.10, qty: 4, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "14", name: "Detergente de Louça", category: "Limpeza", price: 2.45, qty: 2, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "15", name: "Café Torrado 500g", category: "Mercearia", price: 18.90, qty: 3, supermarket: "Carrefour", date: "2026-06-12", month: "2026-06" },
  { id: "16", name: "Café Torrado 500g", category: "Mercearia", price: 17.50, qty: 2, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "17", name: "Papel Higiênico 12 un", category: "Higiene", price: 15.90, qty: 1, supermarket: "Assaí Atacadista", date: "2026-06-14", month: "2026-06" },
  { id: "18", name: "Iogurte Natural", category: "Laticínios", price: 3.20, qty: 8, supermarket: "Sonda", date: "2026-06-05", month: "2026-06" },
  { id: "19", name: "Tomate Italiano (Kg)", category: "Hortifrúti", price: 9.80, qty: 1.2, supermarket: "Sonda", date: "2026-06-05", month: "2026-06" }
];

export default function SupermercadoTab() {
  const [products, setProducts] = useState<SupermarketProduct[]>(() => {
    const saved = localStorage.getItem("tarflow_supermarket_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [activeSubTab, setActiveSubTab] = useState<"compras" | "comparador" | "relatorios">("compras");

  // Form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Mercearia");
  const [newPrice, setNewPrice] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newSupermarket, setNewSupermarket] = useState("Carrefour");
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split("T")[0]);

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
  // Product price matrix: Group unique products, maps each supermarket to its latest known price
  const priceMatrix = useMemo(() => {
    const matrix: Record<string, { category: string; stores: Record<string, { price: number; date: string }> }> = {};

    products.forEach(p => {
      const normName = p.name.trim().toLowerCase();
      // find title-cased key or keep current
      const displayKey = p.name.trim();
      
      // Let's find if a similar capitalized name already exists in the matrix
      const existingKey = Object.keys(matrix).find(k => k.toLowerCase() === normName) || displayKey;

      if (!matrix[existingKey]) {
        matrix[existingKey] = {
          category: p.category,
          stores: {}
        };
      }

      // Keep the lowest/latest known price or just map direct supermarket purchases
      const currentStorePrice = matrix[existingKey].stores[p.supermarket]?.price;
      const currentStoreDate = matrix[existingKey].stores[p.supermarket]?.date;

      // Update if no previous price, or if this purchase is newer
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

      // Find lowest and highest price for comparison
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

  const cheapestSupermarketRatio = useMemo(() => {
    // Generate AI Smart comparisons
    if (products.length < 5) return "Mais lançamentos ajudam a calcular.";
    
    // Group all common items that were bought in at least 2 supermarkets
    const comparableItems = priceMatrix.filter(item => item.storesCount >= 2);
    if (comparableItems.length === 0) {
      return "Cadastre preços do mesmo produto em supermercados diferentes para comparar.";
    }

    // Sum price of comparable items per supermarket
    const superMarketTotals: Record<string, number> = {};
    const countPerSupermarket: Record<string, number> = {};

    comparableItems.forEach(item => {
      Object.entries(item.stores).forEach(([store, storeData]: [string, any]) => {
        superMarketTotals[store] = (superMarketTotals[store] || 0) + storeData.price;
        countPerSupermarket[store] = (countPerSupermarket[store] || 0) + 1;
      });
    });

    // Sort to see which supermarket is general lower price
    const ranking = Object.entries(superMarketTotals)
      .map(([store, total]) => {
        const count = countPerSupermarket[store];
        return { store, avg: total / count, count };
      })
      .sort((a, b) => a.avg - b.avg);

    if (ranking.length > 0) {
      return `O supermercado mais em conta nos itens comuns cadastrados é o ${ranking[0].store}.`;
    }
    return "Calculando...";
  }, [priceMatrix, products]);

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
    <div className="space-y-6">
      {/* Mini Banner Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-white/10 text-white border border-white/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <ShoppingCart size={11} className="text-amber-300" />
                Foco Original Restaurado
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-sans">
              Controle de Supermercados
            </h1>
            <p className="text-sm text-blue-100 font-sans leading-relaxed">
              Monitore despesas de mercado com listagem de produtos por categoria, acompanhe o limite mensal e compare preços reais em diferentes redes.
            </p>
          </div>

          {/* Budget Limit Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 min-w-[240px] flex flex-col justify-between self-start md:self-auto shadow-inner">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2">
              <span className="text-[10px] font-black tracking-wider uppercase text-blue-200">Limite de Gastos Mensal</span>
              {isEditingLimit ? (
                <button onClick={handleSaveLimit} className="text-[10px] bg-white text-blue-700 px-2.5 py-0.5 rounded font-black hover:bg-zinc-100 transition-all">
                  SALVAR
                </button>
              ) : (
                <button onClick={() => { setTempLimit(supermarketLimit.toString()); setIsEditingLimit(true); }} className="text-white/60 hover:text-white transition-all">
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
                  className="w-full bg-white/20 border-0 outline-none rounded-lg p-1 text-base font-black text-white placeholder-white/30"
                />
              </div>
            ) : (
              <div>
                <span className="text-2xl font-black font-sans">
                  R$ {supermarketLimit.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="mt-2 text-[10px] font-bold text-blue-200 flex justify-between items-center">
                  <span>{limitConsumptionPercent}% consumido</span>
                  <span>R$ {(supermarketLimit - totalMonthlySpent).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} restante</span>
                </div>
                {/* Visual Consumption Bar */}
                <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden mt-1.5">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-500" 
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
          <span className="text-xs font-black uppercase text-[var(--text-muted)]">Período de Análise:</span>
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
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Left Box: Form */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-color)] mb-4">
                  <div className="w-7 h-7 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-lg">
                    <Plus size={15} />
                  </div>
                  <h3 className="text-sm font-black uppercase text-[var(--text-primary)] tracking-wide">Novo Produto</h3>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Nome do Produto</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Arroz Tipo 1 ou Banana Prata"
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
                      className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Preço Unitário (R$)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 8.49"
                        value={newPrice}
                        onChange={e => setNewPrice(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Quantidade</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 2 ou 1.5"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Categoria de Alimento/Consumo</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
                      className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)]"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Supermercado Adquirido</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        list="popular-stores"
                        placeholder="Digite ou selecione o mercado"
                        value={newSupermarket}
                        onChange={e => setNewSupermarket(e.target.value)}
                        className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)] pr-8"
                      />
                      <datalist id="popular-stores">
                        {POPULAR_SUPERMARKETS.map(item => (
                          <option key={item} value={item} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-black tracking-wider text-[var(--text-muted)] mb-1">Data da Compra</label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full text-xs p-3.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl font-mono font-black outline-none focus:border-blue-500 text-[var(--text-primary)]"
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

              {/* Shopping List Quick Summary */}
              <div className="p-5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center gap-1.5 text-xs text-blue-500 font-extrabold mb-1">
                  <AlertCircle size={13} />
                  <span>COMPARAÇÃO AUTOMÁTICA</span>
                </div>
                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase">Consumo de Itens</h4>
                <p className="text-[10.5px] text-[var(--text-muted)] leading-relaxed mt-1.5">
                  Os itens inseridos acima são agrupados inteligentemente na aba <strong>Comparar Preços</strong>, exibindo o histórico de qual estabelecimento está cobrando mais barato por categoria.
                </p>
              </div>
            </div>

            {/* Right Box: Product Listing */}
            <div className="lg:col-span-8 flex flex-col space-y-4">
              {/* Dynamic Filter Controls */}
              <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
                
                {/* Search Bar */}
                <div className="relative w-full md:max-w-xs">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar por item lançado..."
                    className="w-full text-xs p-2.5 pl-9 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl outline-none focus:border-blue-500 placeholder-zinc-400 font-bold text-[var(--text-primary)]"
                  />
                </div>

                {/* Filter Grid */}
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
                  <select
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className="p-2.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todas">Categorias (Todas)</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>

                  <select
                    value={selectedSupermarketFilter}
                    onChange={e => setSelectedSupermarketFilter(e.target.value)}
                    className="p-2.5 bg-[var(--container-bg)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-muted)] outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Todos">Mercados (Todos)</option>
                    {uniqueSupermarkets.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Table list */}
              <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm flex flex-col flex-grow">
                <div className="overflow-x-auto min-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-color)] bg-zinc-500/5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-wider">
                        <th className="p-4 pl-6">Produto</th>
                        <th className="p-4">Categoria</th>
                        <th className="p-4">Preço Unitário</th>
                        <th className="p-4 text-center">Qtd.</th>
                        <th className="p-4">Supermercado</th>
                        <th className="p-4">Data</th>
                        <th className="p-4 text-center">Total</th>
                        <th className="p-4 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-24 text-[var(--text-muted)] text-xs">
                            <div className="max-w-xs mx-auto flex flex-col items-center">
                              <ShoppingCart size={24} className="opacity-20 mb-2" />
                              <p className="font-black">Sem produtos neste mês ou filtro</p>
                              <p className="text-[10px] mt-1">Insira compras no formulário lateral para visualizar os produtos lançados nesta seção.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map(prod => {
                          const catColor = CATEGORIES.find(c => c.id === prod.category)?.color || "#888888";
                          return (
                            <tr key={prod.id} className="text-xs hover:bg-zinc-500/5 transition-colors font-bold text-[var(--text-primary)]">
                              <td className="p-4 pl-6 font-black">{prod.name}</td>
                              <td className="p-4">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                  <span className="text-[10.5px]">{prod.category}</span>
                                </span>
                              </td>
                              <td className="p-4 font-mono">
                                R$ {prod.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-center font-mono">{prod.qty}</td>
                              <td className="p-4">
                                <span className="flex items-center gap-1 font-sans text-xs bg-zinc-500/10 px-2 py-0.5 rounded text-[var(--text-primary)] w-fit">
                                  <Store size={10} className="text-blue-500" />
                                  {prod.supermarket}
                                </span>
                              </td>
                              <td className="p-4 font-mono text-[10.5px] text-[var(--text-muted)]">
                                {prod.date.split("-").reverse().join("/")}
                              </td>
                              <td className="p-4 text-center font-mono font-black text-blue-500">
                                R$ {(prod.price * prod.qty).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleDeleteProduct(prod.id)}
                                  className="text-red-500 hover:text-red-700 bg-red-500/5 hover:bg-red-500/15 p-1.5 rounded-lg transition-all"
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

                {/* Footer totals */}
                <div className="p-5 pl-6 bg-zinc-500/5 border-t border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
                  <div className="text-xs text-[var(--text-muted)] font-bold">
                    Total de lançamentos filtrados: <span className="text-[var(--text-primary)] font-black">{filteredProducts.length}</span> / Valor Filtrado: <strong className="text-blue-500 font-extrabold">R$ {filteredProducts.reduce((sum, p) => sum + (p.price*p.qty), 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
                    <span>Gasto Mensal Total:</span>
                    <span className="text-base font-black px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 font-mono">
                      R$ {totalMonthlySpent.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
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
            className="space-y-4"
          >
            {/* Header Description of Selector */}
            <div className="p-5 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-sm font-black text-[var(--text-primary)] uppercase flex items-center gap-1.5">
                  <Store size={15} className="text-blue-500" />
                  Matriz Comparativa de Estabelecimentos B3
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-2xl">
                  Esta tabela lista produtos que já foram cadastrados no sistema. Ela reúne as compras mais recentes de cada supermercado para comparar lado a lado qual mercado vende o mesmo item por menos.
                </p>
              </div>

              <div className="px-4 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-2 text-xs font-black text-emerald-500">
                <TrendingDown size={14} className="stroke-[2.5]" />
                <span>{cheapestSupermarketRatio}</span>
              </div>
            </div>

            {/* Matrix comparison view */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] bg-zinc-500/5 text-[9px] uppercase font-black text-[var(--text-muted)] tracking-wider">
                      <th className="p-4 pl-6">Produto Comparado</th>
                      <th className="p-4">Categoria</th>
                      <th className="p-4 text-center">Mercados Pesquisados</th>
                      {uniqueSupermarkets.map(s => (
                        <th key={s} className="p-4 text-center border-l border-[var(--border-color)] font-sans">{s}</th>
                      ))}
                      <th className="p-4 text-center border-l border-emerald-500/10 bg-emerald-500/5 text-emerald-500">Mais Barato</th>
                      <th className="p-4 text-center border-l border-amber-500/10 bg-amber-500/5 text-amber-500">Mais Caro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {priceMatrix.length === 0 ? (
                      <tr>
                        <td colSpan={uniqueSupermarkets.length + 5} className="text-center py-20 text-[var(--text-muted)] text-sm">
                          Sem produtos cadastrados na planilha para comparação.
                        </td>
                      </tr>
                    ) : (
                      priceMatrix.map(item => {
                        const catColor = CATEGORIES.find(c => c.id === item.category)?.color || "#888888";
                        return (
                          <tr key={item.name} className="text-xs hover:bg-zinc-500/5 transition-colors font-bold text-[var(--text-primary)]">
                            <td className="p-4 pl-6 font-black text-blue-500">{item.name}</td>
                            <td className="p-4">
                              <span className="flex items-center gap-1.5 text-[10.5px]">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: catColor }} />
                                {item.category}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono">
                              <span className="bg-zinc-500/10 text-[var(--text-primary)] px-2.5 py-0.5 rounded-full text-[10px]">
                                {item.storesCount} {item.storesCount === 1 ? "rede" : "redes"}
                              </span>
                            </td>

                            {/* Supermarkets known values */}
                            {uniqueSupermarkets.map(s => {
                              const storeData = item.stores[s];
                              const isMin = storeData && storeData.price === item.minPrice && item.storesCount > 1;
                              const isMax = storeData && storeData.price === item.maxPrice && item.storesCount > 1;

                              return (
                                <td key={s} className={`p-4 text-center border-l border-[var(--border-color)] font-mono ${
                                  isMin ? "bg-emerald-500/5 text-emerald-500" :
                                  isMax ? "bg-amber-500/5 text-amber-500" : ""
                                }`}>
                                  {storeData ? (
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold">R$ {storeData.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                      {isMin && <span className="block text-[8px] tracking-wide font-black uppercase text-emerald-400">Melhor</span>}
                                    </div>
                                  ) : (
                                    <span className="text-[var(--text-muted)] opacity-30 select-none">—</span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Cheapest establishment */}
                            <td className="p-4 text-center border-l border-emerald-500/10 bg-emerald-500/5 text-emerald-500 font-mono">
                              {item.minPrice ? (
                                <div className="space-y-0.5">
                                  <strong className="text-xs text-emerald-500 font-extrabold">
                                    R$ {item.minPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </strong>
                                  <span className="block text-[8px] font-bold text-[var(--text-muted)] truncate max-w-[80px] mx-auto">{item.minStore}</span>
                                </div>
                              ) : "—"}
                            </td>

                            {/* Most expensive establishment */}
                            <td className="p-4 text-center border-l border-amber-500/10 bg-amber-500/5 text-amber-500 font-mono">
                              {item.maxPrice ? (
                                <div className="space-y-0.5">
                                  <strong className="text-xs text-amber-500 font-extrabold">
                                    R$ {item.maxPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </strong>
                                  <span className="block text-[8px] font-bold text-[var(--text-muted)] truncate max-w-[80px] mx-auto">{item.maxStore}</span>
                                </div>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Informative footer */}
              <div className="p-4 bg-zinc-500/5 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] italic leading-relaxed flex items-center gap-2">
                <AlertCircle size={12} className="text-blue-500" />
                <span>Os indicadores coloridos comparam o mesmo produto, destacando a rede mais em conta (<strong>verde</strong>) e a rede mais custosa (<strong>laranja</strong>). Use este recurso para decidir em qual mercado fazer compras semanais de grandes volumes!</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* SUBTAB 3: REPORTS & STATS */}
        {activeSubTab === "relatorios" && (
          <motion.div
            key="relatorios-subtab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Split row charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
              
              {/* Category pie chart */}
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                  Distribuição de Gastos por Categoria
                </h4>
                <p className="text-[10px] text-[var(--text-muted)]">Gráfico que exibe a porcentagem do seu valor gasto mensalmente dividido em categorias.</p>

                <div className="h-64 flex items-center justify-center">
                  {categorySpendingData.length === 0 ? (
                    <div className="text-center text-xs text-[var(--text-muted)] italic">
                      Lançamentos do mês {selectedMonthFilter} necessários para calcular gráficos de categorias.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categorySpendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categorySpendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: any) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 'Valor']}
                          contentStyle={{ background: "var(--card-bg)", borderColor: "var(--border-color)", borderRadius: "10px" }}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Supermarket bar comparison chart */}
              <div className="p-6 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-3xl shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">
                  Volume de Gastos Acumulado por Estabelecimento
                </h4>
                <p className="text-[10px] text-[var(--text-muted)]">Monitore quanto capital total você deixou em cada uma das redes no mês selecionado.</p>

                <div className="h-64 flex items-center justify-center">
                  {supermarketSpendingData.length === 0 ? (
                    <div className="text-center text-xs text-[var(--text-muted)] italic">
                      Lançamentos necessários para calcular gráficos de estabelecimentos.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={supermarketSpendingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                        <Tooltip
                          formatter={(value: any) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, 'Total Pago']}
                          contentStyle={{ background: "var(--card-bg)", borderColor: "var(--border-color)", borderRadius: "10px" }}
                        />
                        <Bar dataKey="value" fill="#667eea" radius={[10, 10, 0, 0]}>
                          {supermarketSpendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#4f46e5"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

            </div>

            {/* Smart IA analysis module */}
            <div className="p-6 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 border border-indigo-500/10 rounded-3xl font-sans relative overflow-hidden">
              <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl" />
              
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500 stroke-[2.5]" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)]">Tarflow IA — Economia Doméstica</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Rede Mais Usada</span>
                  <strong className="text-sm font-black text-[var(--text-primary)]">
                    {supermarketSpendingData[0]?.name || "Nenhum cadastro"}
                  </strong>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Representa {supermarketSpendingData.length > 0 && totalMonthlySpent > 0 ? `${Math.round((supermarketSpendingData[0].value / totalMonthlySpent)*100)}%` : "0%"} de suas saídas de mercado no período.</p>
                </div>

                <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Categoria Dominante</span>
                  <strong className="text-sm font-black text-rose-500">
                    {categorySpendingData[0]?.name || "Nenhum cadastro"}
                  </strong>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Acumulou {categorySpendingData.length > 0 ? `R$ ${categorySpendingData[0].value.toLocaleString("pt-BR")}` : "R$ 0,00"} de gastos no mês.</p>
                </div>

                <div className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl flex flex-col justify-between shadow-sm">
                  <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">Média de Preço / Tíquete</span>
                  <strong className="text-sm font-black text-indigo-500">
                    R$ {monthlyProducts.length > 0 ? (totalMonthlySpent / monthlyProducts.length).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "R$ 0,00"}
                  </strong>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5">Média ponderada por produto individual inserido na lista.</p>
                </div>
              </div>

              <div className="p-4 bg-[var(--card-bg)]/50 border border-[var(--border-color)] rounded-2xl mt-4 text-xs leading-relaxed text-[var(--text-primary)] flex gap-2">
                <AlertCircle size={15} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                <p>
                  <strong>Dica de Economia:</strong> {cheapestSupermarketRatio} Evite fazer compras fracionadas diárias em mercadinhos menores; planeje compras quinzenais nos atacarejos listados no comparador para diminuir as médias por quilo/litro.
                </p>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}

// Small helper CalendarIcon since we imported Lucide icons dynamically
function CalendarIcon({ size = 18, className = "" }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
