import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot } from "lucide-react";
import { useExpenses, useTasks, useGoals, useUserProfile } from "../../hooks/useFirebaseData";
import { User as FirebaseUser } from "firebase/auth";
import { cn } from "../../lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIChat({ user }: { user: FirebaseUser | null | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Olá! 👋 Sou o assistente Tarflow. Como posso te ajudar com suas finanças ou tarefas hoje?" }
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
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            expenses: expenses.slice(-20), // Last 20 expenses for context
            pendingTasks: tasks.filter(t => !t.completed),
            goals: goals,
            profile: profile,
            userName: profile?.name || user?.displayName
          }
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpe, tive um erro ao processar sua pergunta. 😔" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom,0px))] right-6 w-16 h-16 rounded-full bg-[#0a3a96] text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-[100] border-3 border-white/20"
      >
        <Bot size={32} />
        <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-ping" />
      </button>

      <div className={cn(
        "fixed bottom-[calc(11.5rem+env(safe-area-inset-bottom,0px))] right-6 w-[380px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-210px)] bg-[var(--container-bg)] rounded-3xl shadow-strong overflow-hidden flex flex-col z-[99] border border-[var(--border-color)] transition-all duration-300",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
      )}>
        <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-4 text-white flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full border-2 border-white/40 overflow-hidden flex items-center justify-center bg-white/20">
                <Bot size={24} />
             </div>
             <div>
                <h3 className="font-bold">Tarflow IA</h3>
                <div className="flex items-center gap-1.5 text-[0.7rem] opacity-90">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> Online agora
                </div>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--section-bg)]">
          {messages.map((m, i) => (
            <div key={i} className={cn(
              "max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed",
              m.role === "assistant" 
                ? "bg-[var(--card-bg)] text-[var(--text-primary)] self-start rounded-bl-none shadow-sm border border-[var(--border-color)]" 
                : "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white self-end ml-auto rounded-br-none shadow-md"
            )}>
              {m.content}
            </div>
          ))}
          {isLoading && (
            <div className="bg-[var(--card-bg)] p-3.5 rounded-2xl rounded-bl-none text-sm w-fit border border-[var(--border-color)] flex gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
               <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]" />
               <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        <div className="p-4 bg-[var(--container-bg)] border-t border-[var(--border-color)]">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Pergunte sobre seus gastos..."
              className="flex-1 bg-[var(--section-bg)] p-3 rounded-2xl text-sm outline-none border border-transparent focus:border-[#667eea] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white flex items-center justify-center shadow-md hover:scale-105 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
