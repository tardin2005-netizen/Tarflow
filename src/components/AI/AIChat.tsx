import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, TrendingUp, CheckCircle, AlertCircle, ArrowRight, Lightbulb } from "lucide-react";
import { useExpenses, useTasks, useGoals, useUserProfile } from "../../hooks/useFirebaseData";
import { User as FirebaseUser } from "firebase/auth";
import { cn, formatCurrency } from "../../lib/utils";
import { apiUrl } from "../../lib/apiBase";

interface Message {
  role: "user" | "assistant";
  content: string;
  topic?: string;
}

export default function AIChat({ user }: { user: FirebaseUser | null | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Olá! 👋 Sou o Dark Flow IA, seu copiloto financeiro e de produtividade. Posso responder qualquer dúvida com cartões analíticos detalhados sobre seus gastos, mercado, investimentos ou tarefas. O que deseja saber agora?",
      topic: "Boas-vindas"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { expenses } = useExpenses();
  const { tasks } = useTasks();
  const { goals } = useGoals();
  const { profile } = useUserProfile();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customPhrase?: string, topicLabel?: string) => {
    const textToSend = customPhrase !== undefined ? customPhrase : input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      // Gather local investments & briefing cache for complete platform context
      let localInvestments = [];
      let briefingSummary = null;
      try {
        const txs = localStorage.getItem("tarflow_invest_txs");
        if (txs) localInvestments = JSON.parse(txs);
        const brf = localStorage.getItem("tarflow_briefing_summary");
        if (brf) briefingSummary = JSON.parse(brf);
      } catch (e) {
        // ignore
      }

      const totalSpentMonth = expenses.reduce((acc, e) => acc + e.value, 0);
      const generalGoal = goals.find(g => g.category === 'GERAL')?.amount || 0;

      const response = await fetch(apiUrl("/api/ai/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            expenses: expenses.slice(-35),
            totalSpentMonth,
            generalGoal,
            pendingTasks: tasks.filter(t => !t.completed),
            goals: goals,
            profile: profile,
            userName: profile?.name || user?.displayName,
            investments: localInvestments,
            marketBriefing: briefingSummary
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: data.text || "Informações processadas com sucesso.",
        topic: topicLabel || "Direcionamento Inteligente"
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Desculpe, tive uma instabilidade momentânea ao processar sua pergunta. Por favor, tente novamente em instantes. 😔" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const presetQuestions = [
    { label: "📊 Resumo de Gastos", query: "Me dê um resumo geral dos meus gastos, limite do mês e categorias mais altas", topic: "Gastos & Orçamento" },
    { label: "💡 Dicas de Economia", query: "Quais gastos posso cortar ou otimizar este mês para economizar mais?", topic: "Economia Inteligente" },
    { label: "🛒 Supermercado", query: "Como posso otimizar e controlar minhas compras do supermercado este mês?", topic: "Mercado & Despensa" },
    { label: "📈 Mercado & Cotações", query: "Como está o panorama geral do mercado hoje (Bitcoin, Dólar, Selic e Ibovespa)?", topic: "Mercado & Briefing" },
    { label: "🎯 Metas & Foco", query: "Quais tarefas e metas prioritárias devo focar para bater meus objetivos?", topic: "Foco & Metas" }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Abrir Dark Flow IA"
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-6 w-16 h-16 rounded-full bg-gradient-to-tr from-[#0a3a96] to-[#667eea] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] border-3 border-white/20 cursor-pointer group"
      >
        <Bot size={32} className="group-hover:rotate-6 transition-transform" />
        <div className="absolute inset-0 rounded-full bg-cyan-400/25 animate-ping pointer-events-none" />
      </button>

      <div className={cn(
        "fixed bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] right-6 w-[420px] max-w-[calc(100vw-36px)] h-[580px] max-h-[calc(100vh-210px)] bg-[var(--container-bg)] rounded-3xl shadow-strong overflow-hidden flex flex-col z-[99] border-2 border-[var(--border-color)] transition-all duration-300",
        isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      )}>
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-[#1a1a2e] via-[#24244d] to-[#667eea] p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl border border-white/20 overflow-hidden flex items-center justify-center bg-white/10 backdrop-blur-md">
                <Bot size={24} className="text-cyan-300" />
             </div>
             <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm tracking-wide">Dark Flow IA</h3>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    Pro
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[0.7rem] opacity-90 font-medium">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Respostas Direcionadas
                </div>
             </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)} 
            className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer text-white/80 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Chat Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--section-bg)]">
          {messages.map((m, i) => (
            <div key={i} className="flex flex-col gap-1">
              {m.role === "assistant" ? (
                <div className="self-start max-w-[92%]">
                  {/* Quadradinho / Card específico de resposta do Dark Flow */}
                  <div className="bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-sm border border-[var(--border-color)] shadow-sm space-y-2 text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed">
                    {m.topic && (
                      <div className="flex items-center gap-1.5 pb-2 border-b border-[var(--border-color)]">
                        <Sparkles size={12} className="text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-500">
                          {m.topic}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-line font-medium">
                      {m.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="self-end max-w-[85%] bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-3.5 rounded-2xl rounded-br-sm shadow-md text-xs sm:text-sm leading-relaxed font-medium">
                  {m.content}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="self-start bg-[var(--card-bg)] p-4 rounded-2xl rounded-tl-sm border border-[var(--border-color)] shadow-sm space-y-2 max-w-[85%]">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500">
                 <Sparkles size={12} className="animate-spin" />
                 <span>Consultando Dark Flow IA...</span>
               </div>
               <div className="flex gap-1.5 py-1">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
               </div>
            </div>
          )}
        </div>

        {/* Preset & Input Footer */}
        <div className="p-3.5 bg-[var(--container-bg)] border-t border-[var(--border-color)]">
          {/* Quick preset question pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none scroll-smooth">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q.query, q.topic)}
                disabled={isLoading}
                className="shrink-0 text-[10px] font-black tracking-normal px-2.5 py-1.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte ao Dark Flow IA..."
              className="flex-1 bg-[var(--section-bg)] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm outline-none border border-[var(--border-color)] focus:border-[#667eea] transition-all text-[var(--text-primary)] font-medium placeholder:text-[var(--text-muted)]"
            />
            <button 
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
