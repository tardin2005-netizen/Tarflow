import React, { useState, useEffect } from "react";
import { TrendingUp, RefreshCw, Newspaper } from "lucide-react";
import MercadoBriefingTab from "./MercadoBriefingTab";

export default function MercadoFinanceiroTab() {
  // Live Market Extension state (Bitcoin, Dólar, Ibovespa, Selic)
  const [liveTickers, setLiveTickers] = useState<{
    updatedAt: string;
    dolar: { value: string; variation: string; raw?: number };
    bitcoin: { valueUsd: string; valueBrl: string; variation: string; rawUsd?: number };
    ibovespa: { points: string; variation: string; raw?: number };
    selic: { rate: string; note: string; raw?: number };
  }>({
    updatedAt: "Em tempo real",
    dolar: { value: "R$ 5,68", variation: "+0,34%" },
    bitcoin: { valueUsd: "US$ 84.500", valueBrl: "R$ 479.960", variation: "+2,85%" },
    ibovespa: { points: "134.200 pts", variation: "+0,65%" },
    selic: { rate: "14,00% a.a.", note: "Taxa Básica Copom" }
  });
  const [isTickersLoading, setIsTickersLoading] = useState(false);

  const fetchLiveTickers = async () => {
    setIsTickersLoading(true);
    try {
      const res = await fetch("/api/market/live-tickers");
      if (res.ok) {
        const data = await res.json();
        setLiveTickers(data);
      }
    } catch (err) {
      console.error("Error fetching live tickers:", err);
    } finally {
      setIsTickersLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTickers();
    const interval = setInterval(fetchLiveTickers, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full text-left font-sans dark:text-zinc-100 relative transition-all duration-300">
      <div className="bg-[var(--section-bg)] border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 w-full shadow-sm relative overflow-hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[var(--border-color)] pb-5 mb-5">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp size={22} className="text-blue-500 shrink-0" />
              Mercado Financeiro
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              Cotações em tempo real, briefing e notícias do mercado financeiro brasileiro e global.
            </p>
          </div>
        </div>

        {/* 4 Quadrados de Cotações */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between px-1 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                Mercado em Tempo Real
              </span>
            </div>

            <button
              onClick={fetchLiveTickers}
              disabled={isTickersLoading}
              title="Atualizar cotações em tempo real"
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer transition-all shrink-0"
            >
              <RefreshCw size={11} className={isTickersLoading ? "animate-spin" : ""} />
              <span>Atualizar</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

            {/* 1. IBOVESPA */}
            <div className="p-4 bg-[#1a1a2e] text-white border border-white/10 rounded-2xl shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between gap-3 min-h-[112px]">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                  IBOV
                </span>
                <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  liveTickers.ibovespa.variation.startsWith('+')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {liveTickers.ibovespa.variation}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight tabular-nums leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {liveTickers.ibovespa.points}
              </div>
            </div>

            {/* 2. DÓLAR */}
            <div className="p-4 bg-[#1a1a2e] text-white border border-white/10 rounded-2xl shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 min-h-[112px]">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                  DÓLAR
                </span>
                <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  liveTickers.dolar.variation.startsWith('+')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {liveTickers.dolar.variation}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight tabular-nums leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {liveTickers.dolar.value}
              </div>
            </div>

            {/* 3. SELIC */}
            <div className="p-4 bg-[#1a1a2e] text-white border border-white/10 rounded-2xl shadow-md hover:border-purple-500/40 transition-all flex flex-col justify-between gap-3 min-h-[112px]">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-purple-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                  SELIC
                </span>
                <span className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase shrink-0">
                  Copom
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight tabular-nums leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {liveTickers.selic.rate}
              </div>
            </div>

            {/* 4. BITCOIN */}
            <div className="p-4 bg-[#1a1a2e] text-white border border-white/10 rounded-2xl shadow-md hover:border-amber-500/40 transition-all flex flex-col justify-between gap-3 min-h-[112px]">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider shrink-0">
                  BITCOIN
                </span>
                <span className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  liveTickers.bitcoin.variation.startsWith('+')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {liveTickers.bitcoin.variation}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight tabular-nums leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                {liveTickers.bitcoin.valueUsd}
              </div>
            </div>

          </div>
        </div>

        {/* Briefing & Notícias */}
        <div className="flex items-center gap-2 mb-4">
          <Newspaper size={16} className="text-blue-500 shrink-0" />
          <h3 className="text-xs font-black uppercase text-[var(--text-primary)] tracking-wider">Briefing & Notícias</h3>
        </div>
        <MercadoBriefingTab />
      </div>
    </div>
  );
}
