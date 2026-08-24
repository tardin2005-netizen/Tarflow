import React, { useState, useEffect } from "react";
import { useExpenses, useGoals, useTasks, useUserProfile } from "../../hooks/useFirebaseData";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, TrendingUp, CheckSquare, RefreshCw, AlertTriangle, ArrowDown, ChevronRight } from "lucide-react";
import { formatCurrency } from "../../lib/utils";

interface SavingTip {
  title: string;
  category: string;
  amountToSave?: number;
  description: string;
  urgency: "low" | "medium" | "high";
}

interface TaskTip {
  title: string;
  description: string;
  priority: "baixa" | "media" | "alta";
  action: string;
}

interface InsightsData {
  savingsScore: number;
  productivityScore: number;
  overallScore: number;
  financialSummary: string;
  savingsOverview: string;
  productivityOverview: string;
  savingsTips: SavingTip[];
  taskTips: TaskTip[];
}

export default function AIDashboardInsights() {
  const { expenses } = useExpenses();
  const { goals } = useGoals();
  const { tasks, taskLists } = useTasks();
  const { profile } = useUserProfile();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InsightsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"savings" | "productivity" | "strategy">("savings");

  const fetchInsights = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/dashboard-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expenses,
          goals,
          tasks,
          taskLists,
          profile,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao obter recomendações da inteligência artificial.");
      }

      const result = await response.json();
      setData(result);
      localStorage.setItem("tarflow_dashboard_insights", JSON.stringify(result));
      localStorage.setItem("tarflow_insights_timestamp", Date.now().toString());
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Tente novamente em breve.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("tarflow_dashboard_insights");
    const cachedTime = localStorage.getItem("tarflow_insights_timestamp");
    const oneDay = 24 * 60 * 60 * 1000;

    if (cached && cachedTime && (Date.now() - parseInt(cachedTime)) < oneDay) {
      try {
        setData(JSON.parse(cached));
      } catch (e) {
        fetchInsights();
      }
    } else {
      if (expenses.length > 0 || tasks.length > 0) {
        fetchInsights();
      }
    }
  }, [expenses.length, tasks.length]);

  const renderFormattedText = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      let parts: React.ReactNode[] = [line];
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      if (line.includes("**")) {
        const lineParts = [];
        let lastIndex = 0;
        let match;
        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            lineParts.push(line.substring(lastIndex, match.index));
          }
          lineParts.push(<strong key={match.index} className="font-semibold text-[var(--text-primary)]">{match[1]}</strong>);
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < line.length) {
          lineParts.push(line.substring(lastIndex));
        }
        parts = lineParts;
      }

      const isListItem = line.trim().startsWith("-") || line.trim().startsWith("*");
      if (isListItem) {
        // Strip the selector bullet
        const cleanVal = line.trim().replace(/^[\-\*\s]+/, "");
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm text-[var(--text-muted)] py-1 leading-relaxed">
            {cleanVal.includes("**") ? parts : cleanVal}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs sm:text-sm text-[var(--text-muted)] py-1 leading-relaxed">
          {parts}
        </p>
      );
    });
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return "text-[var(--success)] border-[var(--success)]/20 bg-[var(--success)]/5";
    if (score >= 50) return "text-amber-500 border-amber-500/20 bg-amber-500/5";
    return "text-[var(--danger)] border-[var(--danger)]/20 bg-[var(--danger)]/5";
  };

  return (
    <div className="bg-[var(--section-bg)] border-2 border-[var(--border-color)] rounded-3xl p-5 sm:p-6 w-full text-left relative overflow-hidden shadow-sm transition-all">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#667eea]/5 rounded-full filter blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-[var(--border-color)] pb-5 mb-5 relative z-10">
        <div className="flex items-start sm:items-center gap-3">
          <div className="bg-gradient-to-tr from-[#667eea] to-[#00F5FF] p-2 rounded-2xl shadow-md text-white">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] flex flex-wrap items-center gap-x-2 gap-y-1.5 leading-snug">
              Insight Inteligente Tarflow
              <span className="text-[9px] font-black uppercase bg-[#667eea]/10 text-[#667eea] border border-[#667eea]/20 px-2 py-0.5 rounded-full select-none">
                AI powered
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] mt-2 leading-relaxed">Análise inteligente de economias e gestão de fluxo de tarefas pelo Gemini</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3.5 py-2 font-bold text-xs bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#667eea]/50 hover:text-[#667eea] rounded-xl transition-all cursor-pointer select-none active:scale-95 disabled:opacity-50 font-sans"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Calculando..." : "Recalcular Insights"}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading && !data ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="relative w-12 h-12 flex items-center justify-center">
              <div className="absolute inset-0 border-4 border-[#667eea]/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#667eea] border-r-[#00F5FF]/45 rounded-full animate-spin"></div>
              <Sparkles size={18} className="text-[#667eea] animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-[var(--text-primary)] mt-4 font-sans">Consultando Inteligência Artificial...</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1 leading-relaxed">
              Cruzando seu fluxo de tarefas com suas transações financeiras para modelar as melhores dicas.
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-5 bg-[var(--danger)]/5 border border-[var(--danger)]/25 rounded-2xl flex flex-col items-center text-center py-8"
          >
            <AlertTriangle className="text-[var(--danger)] mb-2" size={28} />
            <span className="text-sm font-bold text-[var(--text-primary)] font-sans">Não foi possível gerar conselhos</span>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm leading-relaxed">{error}</p>
            <button
              onClick={fetchInsights}
              className="mt-4 px-4 py-2 font-bold text-xs text-white bg-[#667eea] rounded-xl cursor-pointer select-none font-sans"
            >
              Tentar Novamente
            </button>
          </motion.div>
        ) : data ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 relative z-10"
          >
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-inner">
              <div className="space-y-1 max-w-xl">
                <span className="text-[9px] font-black uppercase text-[#667eea] tracking-wider bg-[#667eea]/5 border border-[#667eea]/10 px-2 py-0.5 rounded-full inline-block">
                  Visão Geral Integrada
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] leading-relaxed mt-1">
                  "{data.financialSummary}"
                </p>
              </div>

              <div className="flex items-center gap-3 bg-[var(--section-bg)] p-3 rounded-2xl border border-[var(--border-color)] shrink-0 self-start md:self-auto">
                <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="22" cy="22" r="18" className="stroke-[var(--border-color)]" fill="transparent" strokeWidth="2.5" />
                    <circle
                      cx="22"
                      cy="22"
                      r="18"
                      className="stroke-[#667eea]"
                      fill="transparent"
                      strokeWidth="3"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      strokeDashoffset={`${2 * Math.PI * 18 * (1 - data.overallScore / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-[var(--text-primary)]">{data.overallScore}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block leading-none">Score Total</span>
                  <span className="text-[11px] font-semibold text-[var(--text-primary)] mt-0.5 inline-block">Tarflow Index</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 border border-solid rounded-2xl flex flex-col justify-center ${scoreColor(data.savingsScore)}`}>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-75 block mb-1">Score de Economia</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black">{data.savingsScore}</span>
                  <span className="text-[10px] font-semibold opacity-70">/100</span>
                </div>
              </div>

              <div className={`p-4 border border-solid rounded-2xl flex flex-col justify-center ${scoreColor(data.productivityScore)}`}>
                <span className="text-[9px] font-black uppercase tracking-wider opacity-75 block mb-1">Score de Tarefas</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl sm:text-2xl font-black">{data.productivityScore}</span>
                  <span className="text-[10px] font-semibold opacity-70">/100</span>
                </div>
              </div>
            </div>

            <div className="flex border-b border-[var(--border-color)] pb-px gap-1 sm:gap-2">
              {[
                { id: "savings", label: "Finanças & Economia", icon: <TrendingUp size={13} /> },
                { id: "productivity", label: "Foco & Tarefas", icon: <CheckSquare size={13} /> },
                { id: "strategy", label: "Plano Estratégico", icon: <Sparkles size={13} /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-black text-[11px] sm:text-xs border-b-2 transition-all cursor-pointer ${
                    activeTab === t.id
                      ? "border-[#667eea] text-[#667eea]"
                      : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="min-h-[140px]">
              {activeTab === "savings" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed">
                    Abaixo estão dicas e correções orçamentárias analisando metas e categorias de Open Finance:
                  </p>
                  
                  {data.savingsTips.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[var(--text-muted)] bg-[var(--card-bg)]/40 rounded-2xl border border-[var(--border-color)]">
                      Nenhuma dica de economia ativa no momento. Continue inserindo despesas!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.savingsTips.map((tip, index) => (
                        <div
                          key={index}
                          className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#667eea]/35 rounded-2xl transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-black text-[var(--text-primary)] leading-tight truncate">
                                {tip.title}
                              </span>
                              <span
                                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0 ${
                                  tip.urgency === "alta"
                                    ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                                    : tip.urgency === "media"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-[var(--success)]/10 text-[var(--success)]"
                                }`}
                              >
                                {tip.urgency === "alta" ? "Alta" : tip.urgency === "media" ? "Média" : "Baixa"}
                              </span>
                            </div>
                            <span className="text-[9px] font-black text-[#667eea] tracking-wide uppercase block mb-1">
                              Foco: {tip.category}
                            </span>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{tip.description}</p>
                          </div>
                          
                          {tip.amountToSave && tip.amountToSave > 0 && (
                            <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--border-color)] text-[11px] font-bold text-[var(--success)]">
                              <ArrowDown size={12} className="shrink-0" />
                              <span>Impacto estimado: -{formatCurrency(tip.amountToSave)}/mês</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "productivity" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <p className="text-[11px] text-[var(--text-muted)] italic leading-relaxed">
                    Dicas inteligentes baseadas em metas, prazos, faturas e prioridades de tarefas:
                  </p>

                  {data.taskTips.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[var(--text-muted)] bg-[var(--card-bg)]/40 rounded-2xl border border-[var(--border-color)]">
                      Sua fila de produtividade está extremamente bem balanceada!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.taskTips.map((tip, index) => (
                        <div
                          key={index}
                          className="p-4 bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[#667eea]/35 rounded-2xl transition-all flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="text-xs font-black text-[var(--text-primary)] leading-tight truncate">
                                {tip.title}
                              </span>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                                  tip.priority === "alta"
                                    ? "bg-[var(--danger)]/10 text-[var(--danger)]"
                                    : tip.priority === "media"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-[var(--success)]/10 text-[var(--success)]"
                                }`}
                              >
                                {tip.priority}
                              </span>
                            </div>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{tip.description}</p>
                          </div>
                          
                          <div className="p-2 sm:p-2.5 bg-[var(--section-bg)] rounded-xl border border-[var(--border-color)] mt-auto">
                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-wider block leading-none mb-1">Ação Sugerida</span>
                            <p className="text-[11px] font-bold text-[var(--text-primary)] flex items-center gap-1">
                              <ChevronRight size={12} className="text-[#667eea] shrink-0" />
                              <span className="truncate">{tip.action}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "strategy" && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 sm:p-5 rounded-2xl"
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#667eea] flex items-center gap-1.5">
                        <TrendingUp size={13} /> Orçamento & Planejamento Financeiro
                      </h4>
                      <div className="space-y-1">
                        {renderFormattedText(data.savingsOverview)}
                      </div>
                    </div>

                    <div className="space-y-1 pt-4 border-t border-[var(--border-color)]">
                      <h4 className="text-[10px] font-black uppercase tracking-wider text-[#667eea] flex items-center gap-1.5">
                        <CheckSquare size={13} /> Organização & Fluxo de Vida
                      </h4>
                      <div className="space-y-1">
                        {renderFormattedText(data.productivityOverview)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-10 text-center"
          >
            <div className="bg-[#667eea]/5 p-2.5 rounded-2xl mb-3">
              <Sparkles className="text-[#667eea]" size={24} />
            </div>
            <h4 className="text-sm font-black text-[var(--text-primary)] font-sans">Sua IA está Pronta!</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1 leading-relaxed">
              Analise instantaneamente seus dados bancários integrados, metas financeiras e tarefas para criar uma estratégia personalizada com o Gemini.
            </p>
            <button
              onClick={fetchInsights}
              className="mt-4 px-4.5 py-2.5 font-bold text-xs text-white bg-[#667eea] rounded-xl hover:shadow-lg hover:shadow-[#667eea]/30 transition-all cursor-pointer select-none active:scale-95 font-sans"
            >
              Gerar Insights com IA
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
