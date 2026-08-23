import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, TrendingDown, DollarSign, Zap, Sparkles, 
  ExternalLink, Copy, Check, Filter, Search, Globe, Bookmark, 
  Share2, ArrowUpRight, ArrowDownRight, Newspaper, Calendar,
  Building2, Coins, Landmark, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MarketSummaryData {
  date: string;
  ibovespa: { status: string; variation: string; note: string };
  dolar: { value: string; variation: string; note: string };
  selic: { rate: string; cuts: string; note: string };
  fiis: { status: string; variation: string; tickers: string };
  destaques: { title: string; badge: string; tag: string };
  crypto: { title: string; variation: string; note: string };
  footerPhrase: string;
}

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  category: "Mercado" | "FIIs" | "Ações" | "Cripto" | "Macroeconomia" | string;
  summary: string;
  impact: "alta" | "baixa" | "neutro";
  url?: string;
  tags: string[];
}

const DEFAULT_SUMMARY: MarketSummaryData = {
  date: new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
  ibovespa: { status: "EM ALTA", variation: "+0,58%", note: "Fechamento positivo com fluxo institucional" },
  dolar: { value: "R$ 5,18", variation: "-0,31%", note: "S&P 500 avança em NY" },
  selic: { rate: "14,00%", cuts: "4 CORTES", note: "Copom em ciclo gradual de juros" },
  fiis: { status: "HOJE", variation: "+0,15%", tickers: "AFHF11, RZAT11, AJFI11, CPLG11, MXRF11" },
  destaques: { title: "VALE, PETROBRAS E TAESA", badge: "MARIANA", tag: "DESTAQUES B3" },
  crypto: { title: "BITCOIN A US$ 77 MIL", variation: "+6%", note: "Rali consistente em 24h" },
  footerPhrase: "MERCADO TARFLOW: Cripto e bolsa em alta, fluxo institucional e acompanhamento diário de proventos."
};

const DEFAULT_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Ibovespa supera marcas com fluxo estrangeiro recorde e alívio nos juros futuros",
    source: "InfoMoney",
    time: "Hoje às 16:45",
    category: "Mercado",
    summary: "O índice fechou em alta impulsionado pelas commodities e expectativa de novo corte da taxa Selic na próxima reunião do Copom.",
    impact: "alta",
    tags: ["Ibovespa", "B3", "Macro"]
  },
  {
    id: "2",
    title: "Petrobras (PETR4) e Vale (VALE3) lideram volume financeiro com avanço do minério e petróleo Brent",
    source: "Futuro Econômico",
    time: "Hoje às 15:30",
    category: "Ações",
    summary: "Papéis das duas maiores estatais e mineradoras da B3 avançaram com a recuperação dos preços em Dalian e Europa.",
    impact: "alta",
    tags: ["PETR4", "VALE3", "Commodities"]
  },
  {
    id: "3",
    title: "FIIs pagadores do dia: Carteiras depositam rendimentos com dividend yield anualizado de até 13,8%",
    source: "InfoMoney",
    time: "Hoje às 12:10",
    category: "FIIs",
    summary: "AFHF11, RZAT11, AJFI11, CPLG11 e MXRF11 creditam rendimentos isentos de IR hoje nas contas dos cotistas.",
    impact: "alta",
    tags: ["FIIs", "Proventos", "MXRF11"]
  },
  {
    id: "4",
    title: "Copom sinaliza novos cortes graduais da taxa Selic; mercado projeta taxa terminal a 12,50%",
    source: "Valor Econômico",
    time: "Hoje às 10:00",
    category: "Macroeconomia",
    summary: "Ata da última reunião reforça cautela com cenário fiscal, mas confirma ancoragem das expectativas de inflação.",
    impact: "neutro",
    tags: ["Selic", "Copom", "Juros"]
  },
  {
    id: "5",
    title: "Bitcoin rompe barreira dos US$ 77.000 com forte entrada institucional em ETFs à vista",
    source: "NeoFeed",
    time: "Hoje às 09:15",
    category: "Cripto",
    summary: "O mercado cripto registra alta generalizada, com Ethereum e Solana acompanhando o rali sustentado do BTC.",
    impact: "alta",
    tags: ["Bitcoin", "ETFs", "Cripto"]
  },
  {
    id: "6",
    title: "Taesa (TAEE11) aprova nova distribuição de proventos milionários para o semestre",
    source: "Futuro Econômico",
    time: "Hoje às 08:30",
    category: "Ações",
    summary: "A transmissora de energia elétrica comunicou proventos atrativos aos acionistas após vitórias em leilões.",
    impact: "alta",
    tags: ["TAEE11", "Dividendos", "Energia"]
  }
];

export default function MercadoBriefingTab() {
  const [selectedFilter, setSelectedFilter] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedNotion, setCopiedNotion] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [summaryData, setSummaryData] = useState<MarketSummaryData>(DEFAULT_SUMMARY);
  const [newsList, setNewsList] = useState<NewsItem[]>(DEFAULT_NEWS);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Load from local storage or initialize
  useEffect(() => {
    try {
      const savedNews = localStorage.getItem("tarflow_briefing_news");
      const savedSummary = localStorage.getItem("tarflow_briefing_summary");
      const savedSync = localStorage.getItem("tarflow_briefing_last_sync");
      
      if (savedNews) setNewsList(JSON.parse(savedNews));
      if (savedSummary) setSummaryData(JSON.parse(savedSummary));
      if (savedSync) setLastSyncTime(savedSync);
      else setLastSyncTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Error loading cached news:", err);
    }
  }, []);

  const handleFetchDailyNews = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch("/api/briefing/daily-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.news && Array.isArray(data.news)) {
          setNewsList(data.news);
          localStorage.setItem("tarflow_briefing_news", JSON.stringify(data.news));
        }
        if (data.marketSummary) {
          setSummaryData(data.marketSummary);
          localStorage.setItem("tarflow_briefing_summary", JSON.stringify(data.marketSummary));
        }
        const timeNow = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        setLastSyncTime(timeNow);
        localStorage.setItem("tarflow_briefing_last_sync", timeNow);
      }
    } catch (err) {
      console.error("Failed to fetch dynamic news:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredNews = useMemo(() => {
    return newsList.filter(item => {
      const matchesFilter = selectedFilter === "Todos" || item.category === selectedFilter;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [newsList, selectedFilter, searchQuery]);

  const handleCopyForNotion = () => {
    const notionMarkdown = `
# 📰 TARFLOW BRIEFING FINANCEIRO - ${summaryData.date || new Date().toLocaleDateString('pt-BR')}

## ⚡ Resumo de Mercado (Destaques)
- 🟢 **IBOVESPA**: ${summaryData.ibovespa.status} (${summaryData.ibovespa.variation}) | ${summaryData.ibovespa.note}
- 💵 **DÓLAR**: ${summaryData.dolar.value} (${summaryData.dolar.variation}) | ${summaryData.dolar.note}
- 🏛️ **SELIC**: ${summaryData.selic.rate} (${summaryData.selic.cuts})
- 🏢 **FIIs Pagando Hoje**: ${summaryData.fiis.tickers}
- ⚡ **Destaques B3**: ${summaryData.destaques.title}
- 🪙 **BITCOIN**: ${summaryData.crypto.title} (${summaryData.crypto.variation})

---

## 🗞️ Feed de Notícias em Tempo Real
${newsList.map(n => `### [${n.source}] ${n.title}\n*Categoria: ${n.category} | ${n.time}*\n> ${n.summary}\n`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(notionMarkdown);
    setCopiedNotion(true);
    setTimeout(() => setCopiedNotion(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Actions & Daily Refresh Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-black">
            <Zap size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-[var(--text-primary)]">Tarflow Briefing & Mercado</h2>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Diário Oficial
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              Fontes: InfoMoney, Futuro Econômico, Valor Econômico, NeoFeed e B3 {lastSyncTime && `• Atualizado às ${lastSyncTime}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleFetchDailyNews}
            disabled={isUpdating}
            className="flex items-center gap-2 bg-[var(--section-bg)] hover:bg-[var(--border-color)] text-[var(--text-primary)] border border-[var(--border-color)] font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={isUpdating ? "animate-spin text-blue-500" : "text-blue-500"} />
            <span>{isUpdating ? "Atualizando..." : "Atualizar Notícias do Dia"}</span>
          </button>

          <button
            onClick={handleCopyForNotion}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {copiedNotion ? <Check size={14} className="text-white" /> : <Copy size={14} className="text-white" />}
            <span>{copiedNotion ? "Copiado para Notion!" : "Copiar para o Notion"}</span>
          </button>
        </div>
      </div>

      {/* 1. 📰 FEED DE NOTÍCIAS & ANÁLISES EM TEMPO REAL (AGORA NO TOPO) */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-5 sm:p-6 rounded-3xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-color)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Newspaper size={17} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wide text-[var(--text-primary)]">
                Feed de Notícias & Análises em Tempo Real
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Radar financeiro diário e destaques do mercado acionário
              </p>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap gap-1.5">
            {["Todos", "Mercado", "FIIs", "Ações", "Cripto", "Macroeconomia"].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`text-[11px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === cat
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-[var(--section-bg)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Filtrar por manchete, ticker (ex: PETR4, VALE3, MXRF11, TAEE11) ou palavra-chave..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs p-3 pl-9 bg-[var(--section-bg)] border border-[var(--border-color)] rounded-xl font-bold outline-none focus:border-blue-500 text-[var(--text-primary)] transition-all"
          />
        </div>

        {/* News Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNews.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-[var(--section-bg)] border border-[var(--border-color)] rounded-2xl hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase text-[var(--text-muted)] mb-2">
                  <span className="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md border border-blue-500/20 font-bold">
                    {item.source}
                  </span>
                  <span>{item.time}</span>
                </div>

                <h4 className="text-sm font-black text-[var(--text-primary)] group-hover:text-blue-500 transition-colors leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed mt-2">
                  {item.summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-[var(--border-color)]">
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map(t => (
                    <span key={t} className="text-[9.5px] font-bold bg-[var(--card-bg)] text-[var(--text-muted)] px-2 py-0.5 rounded border border-[var(--border-color)]">
                      #{t}
                    </span>
                  ))}
                </div>

                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  item.impact === "alta" ? "bg-emerald-500/10 text-emerald-500" :
                  item.impact === "baixa" ? "bg-red-500/10 text-red-500" : "bg-zinc-500/10 text-zinc-400"
                }`}>
                  {item.impact === "alta" ? "Impacto Positivo" : item.impact === "baixa" ? "Impacto Negativo" : "Neutro"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 2. 🌟 CARTAZ FINANCEIRO TARFLOW (FUNDO AZUL OFICIAL, ABAIXO DO FEED) */}
      <div className="max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-600 bg-gradient-to-b from-[#0a3a96] via-[#093282] to-[#072461] font-sans text-white">
        
        {/* Cartaz Header */}
        <div className="pt-6 pb-3 text-center px-4">
          <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 font-black text-[11px] tracking-[0.25em] px-4 py-1 rounded-full uppercase shadow-sm">
            Briefing Financeiro
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mt-2 font-mono uppercase">
            TARFLOW $$
          </h1>
          
          <div className="flex justify-center items-center gap-4 text-[10px] font-black text-blue-200 uppercase tracking-wider mt-3">
            <span className="underline decoration-2 decoration-blue-400">Mercado</span>
            <span>•</span>
            <span className="underline decoration-2 decoration-blue-400">FIIs</span>
            <span>•</span>
            <span className="underline decoration-2 decoration-blue-400">Cripto</span>
            <span>•</span>
            <span className="underline decoration-2 decoration-blue-400">B3</span>
          </div>
        </div>

        {/* Cartaz Blue Body */}
        <div className="p-4 sm:p-6 pt-2 space-y-4">
          <div className="text-center pb-2">
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              BORA VER O SEU<br />RESUMO DE MERCADO?
            </h2>
            <p className="text-xs font-bold text-blue-200/90 mt-1 capitalize">
              {summaryData.date || new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Cards Grid */}
          <div className="space-y-3">
            
            {/* Card 1: Ibovespa */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500 block mb-0.5">O dia fechou com</span>
                <h3 className="text-lg sm:text-xl font-black leading-tight uppercase text-neutral-900">
                  IBOVESPA<br />{summaryData.ibovespa.status}
                </h3>
              </div>
              <div className="relative">
                <div className="bg-[#0a3a96] text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform rotate-2">
                  <span className="text-[9px] block uppercase text-blue-200">HOJE</span>
                  <span className="text-sm font-black text-emerald-300">{summaryData.ibovespa.variation}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Dólar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500 block mb-0.5">Cotação Comercial</span>
                <h3 className="text-2xl font-black leading-none text-neutral-900">{summaryData.dolar.value}</h3>
                <p className="text-[11px] font-bold text-neutral-600 mt-1">{summaryData.dolar.note}</p>
              </div>
              <div className="bg-neutral-900 text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform -rotate-2">
                <span className="text-[9px] block uppercase text-neutral-300">DÓLAR</span>
                <span className="text-sm font-black text-emerald-400">{summaryData.dolar.variation}</span>
              </div>
            </div>

            {/* Card 3: Selic */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500 block mb-0.5">COPOM CORTA JUROS</span>
                <h3 className="text-xl sm:text-2xl font-black leading-tight text-neutral-900">SELIC A<br />{summaryData.selic.rate}</h3>
              </div>
              <div className="bg-[#0a3a96] text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform rotate-3">
                <span className="text-xs font-black text-amber-300">{summaryData.selic.cuts.split(" ")[0]}</span>
                <span className="text-[9px] block uppercase text-blue-200">CORTES</span>
              </div>
            </div>

            {/* Card 4: FIIs */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <h3 className="text-lg font-black leading-tight uppercase text-neutral-900">FIIS PAGANDO<br />HOJE</h3>
                <p className="text-[11px] font-bold text-neutral-700 mt-1">{summaryData.fiis.tickers}</p>
              </div>
              <div className="bg-[#0a3a96] text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform -rotate-1">
                <span className="text-[9px] block uppercase text-blue-200">IFIX</span>
                <span className="text-sm font-black text-emerald-300">{summaryData.fiis.variation}</span>
              </div>
            </div>

            {/* Card 5: Destaques B3 */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase text-neutral-500 block mb-0.5">{summaryData.destaques.tag}</span>
                <h3 className="text-lg font-black leading-tight uppercase text-neutral-900">{summaryData.destaques.title}</h3>
              </div>
              <div className="bg-neutral-900 text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform rotate-2">
                <span className="text-[9px] block uppercase text-blue-300">{summaryData.destaques.badge}</span>
                <span className="text-xs font-black text-emerald-400">ALTA</span>
              </div>
            </div>

            {/* Card 6: Bitcoin */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 flex items-center justify-between shadow-md relative overflow-hidden text-black border border-black/5">
              <div>
                <h3 className="text-xl font-black leading-tight uppercase text-neutral-900">{summaryData.crypto.title}</h3>
                <p className="text-[11px] font-bold text-neutral-700 mt-1">{summaryData.crypto.note}</p>
              </div>
              <div className="bg-[#0a3a96] text-white font-black text-xs px-3.5 py-2 rounded-xl text-center shadow-lg transform -rotate-3">
                <span className="text-[9px] block uppercase text-blue-200">24H</span>
                <span className="text-sm font-black text-emerald-300">{summaryData.crypto.variation}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Cartaz Footer */}
        <div className="bg-neutral-950 text-blue-200 p-4 text-center border-t border-white/10">
          <h4 className="text-sm font-black uppercase tracking-wider text-white">TARFLOW MERCADO:</h4>
          <p className="text-[11px] text-blue-200/80 mt-0.5">
            {summaryData.footerPhrase}
          </p>
        </div>
      </div>
    </div>
  );
}
