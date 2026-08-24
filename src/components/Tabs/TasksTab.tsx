import React, { useState, useMemo } from "react";
import { useTasks, useExpenses, useUserProfile } from "../../hooks/useFirebaseData";
import { Plus, Trash2, CheckCircle2, Circle, Flag, Calendar, Clock, DollarSign, CreditCard, ChevronRight, ListFilter, Sparkles, AlertTriangle, Brain, Zap, RefreshCw, Check, Star } from "lucide-react";
import { cn, formatCurrency, formatDate } from "../../lib/utils";
import { Priority, Task } from "../../types";
import { motion, AnimatePresence } from "motion/react";
import { apiUrl } from "../../lib/apiBase";

export default function TasksTab() {
  const { taskLists, tasks, addTaskList, addTask, toggleTask, deleteTask, updateTask } = useTasks();
  const { expenses } = useExpenses();
  const { profile } = useUserProfile();
  
  const [newListName, setNewListName] = useState("");
  const [activeListId, setActiveListId] = useState<string | null>(null);
  
  // AI proactive states
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Task state
  const [taskTitle, setTaskTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("media");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [isPayment, setIsPayment] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    const docRef = await addTaskList(newListName);
    setNewListName("");
    if (docRef) setActiveListId(docRef.id);
  };

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !activeListId) return;
    await addTask({
      listId: activeListId,
      title: taskTitle,
      dueDate: dueDate || null,
      reminder: null,
      priority,
      amount: amount ? parseFloat(amount) : null,
      isPayment,
      completedAt: null
    });
    setTaskTitle("");
    setAmount("");
    setIsPayment(false);
    setShowAdvanced(false);
  };

  const fetchSuggestions = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const response = await fetch(apiUrl("/api/ai/tasks-suggestions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks,
          taskLists,
          expenses,
          profile
        }),
      });
      if (!response.ok) {
        throw new Error("Não foi possível conectar ao servidor de IA.");
      }
      const data = await response.json();
      setAiSuggestions(data);
    } catch (err: any) {
      setAiError(err.message || "Erro de conexão.");
    } finally {
      setLoadingAI(false);
    }
  };

  const handleApplySuggestion = async (suggestion: any) => {
    if (!suggestion.taskId) return;
    
    const updateData: any = {};
    if (suggestion.suggestedPriority) {
      updateData.priority = suggestion.suggestedPriority;
    }
    if (suggestion.suggestedDate) {
      updateData.dueDate = suggestion.suggestedDate;
    }

    if (updateTask) {
      await updateTask(suggestion.taskId, updateData);
    }
    
    // Smoothly remove from state
    setAiSuggestions((prev: any) => {
      if (!prev) return null;
      return {
        ...prev,
        suggestions: prev.suggestions.filter((s: any) => s.id !== suggestion.id)
      };
    });
  };

  const activeList = taskLists.find(l => l.id === activeListId);
  const listTasks = useMemo(() => {
    const list = tasks.filter(t => t.listId === activeListId);
    return list.sort((a, b) => {
      const priorityWeight = { alta: 3, media: 2, baixa: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  }, [tasks, activeListId]);

  const priorityColors = {
    alta: "text-[var(--danger)] bg-[var(--danger)]/10",
    media: "text-[#FFA726] bg-[#FFA726]/10",
    baixa: "text-[var(--success)] bg-[var(--success)]/10"
  };

  return (
    <div className="tab-content grid lg:grid-cols-12 gap-8">
      {/* Sidebar List Selector */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-[var(--section-bg)] p-6 rounded-3xl border-2 border-[var(--border-color)]">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2">
            <ListFilter size={20} className="text-[#667eea]" /> Listas
          </h2>
          
          <div className="flex gap-2 mb-6">
            <input 
              type="text" 
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Ex: Trabalho, Casa..."
              className="flex-1 px-4 py-3 border-2 border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] text-xs font-bold outline-none transition-all focus:border-[#667eea]"
            />
            <button onClick={handleCreateList} className="bg-[#667eea] text-white p-3 rounded-2xl hover:scale-110 active:scale-95 shadow-md transition-all">
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {taskLists.length === 0 ? (
                <p className="text-center text-[var(--text-muted)] py-6 text-sm font-bold opacity-50 italic">Nenhuma lista ativa.</p>
              ) : (
                taskLists.map((list) => {
                  const listTasksAll = tasks.filter(t => t.listId === list.id);
                  const done = listTasksAll.filter(t => t.completed).length;
                  const progress = listTasksAll.length > 0 ? (done / listTasksAll.length) * 100 : 0;
                  
                  return (
                    <motion.button
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={list.id}
                      onClick={() => setActiveListId(list.id)}
                      className={cn(
                        "w-full group p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden",
                        activeListId === list.id 
                          ? "bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-transparent shadow-xl" 
                          : "bg-[var(--card-bg)] border-[var(--border-color)] hover:border-[#667eea]/40"
                      )}
                    >
                      <div className="relative z-10 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                           <span className="font-black text-sm">{list.name}</span>
                           <ChevronRight size={14} className={cn("transition-transform", activeListId === list.id ? "rotate-90" : "")} />
                        </div>
                        <div className="flex justify-between items-end">
                           <span className={cn("text-[0.65rem] font-bold uppercase tracking-widest", activeListId === list.id ? "text-white/60" : "text-[var(--text-muted)]")}>
                             {done}/{listTasksAll.length} Concluídas
                           </span>
                           <span className="text-[0.65rem] font-black">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${progress}%` }}
                             className={cn("h-full", activeListId === list.id ? "bg-white" : "bg-[#667eea]")} 
                           />
                        </div>
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Proactive AI Task Manager Block */}
        <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] p-6 rounded-3xl border border-white/10 text-white shadow-xl relative overflow-hidden">
          {/* Sparkles visual effect background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#667eea]/20 rounded-full blur-[40px] pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[var(--success)]/15 rounded-full blur-[30px] pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Sparkles size={18} className="text-[#667eea] animate-pulse" /> Gestor Proativo IA
              </h3>
              <button 
                onClick={fetchSuggestions} 
                className="p-1.5 hover:bg-white/10 rounded-lg active:scale-95 transition-all text-white/80 hover:text-white"
                title="Atualizar Recomendações"
                disabled={loadingAI}
              >
                <RefreshCw size={14} className={cn(loadingAI && "animate-spin")} />
              </button>
            </div>
            
            <p className="text-[0.7rem] font-bold text-white/70 leading-relaxed mb-5">
              O Tarflow analisa suas listas de tarefas de forma integrada aos seus gastos e renda para alertar sobre conflitos, recomendar prioridades e recalibrar prazos de forma estratégica.
            </p>

            {loadingAI && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Brain className="w-8 h-8 text-[#667eea] animate-bounce" />
                <span className="text-[0.65rem] uppercase tracking-widest font-black text-white/60 animate-pulse">Sincronizando com a IA...</span>
              </div>
            )}

            {aiError && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-red-100">
                <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">Aviso</div>
                  <div className="opacity-80 text-[0.7rem] leading-relaxed mt-0.5">{aiError}</div>
                </div>
              </div>
            )}

            {!loadingAI && !aiSuggestions && !aiError && (
              <div className="text-center py-4">
                <button 
                  onClick={fetchSuggestions}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-black tracking-wider uppercase py-3.5 px-4 rounded-2xl transition-all shadow-md active:scale-[0.98] border border-white/10 flex items-center justify-center gap-2"
                >
                  <Brain size={14} /> Analisar Fluxo com IA
                </button>
              </div>
            )}

            {aiSuggestions && !loadingAI && (
              <div className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3.5 bg-white/5 p-3 rounded-2xl border border-white/5 font-sans">
                  <div className="text-center">
                    <span className="text-[0.55rem] font-black uppercase tracking-wider text-white/40 block">Risco de Sobrecarga</span>
                    <span className={cn(
                      "text-[0.65rem] font-extrabold uppercase py-0.5 px-2.5 rounded-full inline-block mt-1",
                      aiSuggestions.metrics?.overloadRisk === 'alto' && "bg-red-500/20 text-red-300",
                      aiSuggestions.metrics?.overloadRisk === 'medio' && "bg-[#FFA726]/20 text-orange-300",
                      aiSuggestions.metrics?.overloadRisk === 'baixo' && "bg-emerald-500/10 text-emerald-300"
                    )}>
                      {aiSuggestions.metrics?.overloadRisk || 'baixo'}
                    </span>
                  </div>
                  <div className="text-center border-l border-white/10">
                    <span className="text-[0.55rem] font-black uppercase tracking-wider text-white/40 block">Eficiência (Score)</span>
                    <span className="text-xs font-black text-white/90 block mt-1">
                      {aiSuggestions.metrics?.healthScore || 100}%
                    </span>
                  </div>
                </div>

                {/* Overview Text */}
                <div className="text-[0.7rem] bg-white/5 p-3.5 rounded-2xl border border-white/5 text-white/80 leading-relaxed italic font-sans">
                  <span>{aiSuggestions.overview}</span>
                </div>

                {/* Recommendations List */}
                <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/40 block mt-4">Sugestões Acionáveis ({aiSuggestions.suggestions?.length || 0})</span>
                
                <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                  {aiSuggestions.suggestions?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-white/40">
                      <Check size={24} className="text-emerald-400 mb-1 animate-pulse" />
                      <p className="text-[0.65rem] font-bold uppercase tracking-wider">Tudo Sob Controle</p>
                      <p className="text-[0.6rem] opacity-70 leading-relaxed px-4 mt-1">Seu fluxo de tarefas e orçamento estão sintonizados perfeitamente.</p>
                    </div>
                  ) : (
                    aiSuggestions.suggestions.map((sug: any) => {
                      const relatedTask = tasks.find(t => t.id === sug.taskId);
                      return (
                        <div key={sug.id} className="bg-white/5 p-3.5 rounded-2xl border border-white/5 flex flex-col gap-2.5 hover:bg-white/10 transition-colors font-sans">
                          <div className="flex items-start gap-2 font-sans">
                            {sug.type === 'prioritize' && <Flag size={14} className="text-[#FFA726] mt-0.5 shrink-0" />}
                            {sug.type === 'schedule' && <Calendar size={14} className="text-violet-300 mt-0.5 shrink-0" />}
                            {sug.type === 'conflict' && <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />}
                            {sug.type === 'budget' && <DollarSign size={14} className="text-emerald-300 mt-0.5 shrink-0" />}
                            
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[0.75rem] font-black text-white leading-snug">{sug.title}</h4>
                              <p className="text-[0.65rem] text-white/75 leading-relaxed mt-1 font-sans">{sug.description}</p>
                            </div>
                          </div>

                          {relatedTask && (
                            <div className="bg-black/20 p-2 rounded-xl text-[0.6rem] border border-white/5 flex flex-col gap-1">
                              <span className="text-white/40 font-bold uppercase tracking-widest text-[0.5rem]">Tarefa Relacionada</span>
                              <div className="font-bold truncate text-white/90">{relatedTask.title}</div>
                              <div className="flex gap-2 text-white/50">
                                <span>Prioridade: <span className="font-bold text-white/80">{relatedTask.priority}</span></span>
                                {relatedTask.dueDate && <span>Prazo: <span className="font-bold text-white/80">{formatDate(relatedTask.dueDate)}</span></span>}
                              </div>
                            </div>
                          )}

                          {sug.taskId && (
                            <button
                              onClick={() => handleApplySuggestion(sug)}
                              className="w-full bg-[#667eea] hover:bg-[#764ba2] text-white text-[0.6rem] font-black tracking-widest uppercase py-2 px-3 rounded-xl transition-all shadow flex items-center justify-center gap-1.5 active:scale-95"
                            >
                              <Zap size={11} /> Aplicar Ajuste
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Task View */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-[var(--section-bg)] p-6 rounded-3xl border-2 border-[var(--border-color)]">
          <h2 className="text-2xl font-black mb-6 text-[var(--text-primary)]">
            {activeList ? activeList.name : "Selecione uma lista"}
          </h2>
          
          {activeListId ? (
            <div className="space-y-6">
              {/* Add Task Form */}
              <div className="bg-[var(--card-bg)] p-6 rounded-3xl border-2 border-[var(--border-color)] shadow-inner">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder="Próximo passo..."
                    className="flex-1 bg-transparent border-none outline-none text-lg font-black text-[var(--text-primary)] placeholder:opacity-30"
                  />
                  <button 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={cn("p-2 rounded-xl transition-all", showAdvanced ? "bg-[#667eea] text-white" : "text-[var(--text-muted)] hover:bg-[var(--border-color)]")}
                  >
                    <Plus size={20} />
                  </button>
                  <button onClick={handleAddTask} className="bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] text-white px-6 py-2 rounded-2xl font-black text-sm shadow-lg hover:-translate-y-1 transition-all">
                    Criar
                  </button>
                </div>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-6 pt-6 border-t-2 border-[var(--border-color)] grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                      <div>
                        <label className="text-[0.6rem] font-black uppercase opacity-50 mb-2 block tracking-widest">Prioridade</label>
                        <select 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as Priority)}
                          className="w-full bg-[var(--section-bg)] p-2 rounded-xl text-xs font-bold border-2 border-transparent focus:border-[#667eea] outline-none"
                        >
                          <option value="baixa">Baixa Prioridade</option>
                          <option value="media">Média Prioridade</option>
                          <option value="alta">Alta Prioridade</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-black uppercase opacity-50 mb-2 block tracking-widest">Valor (Opcional)</label>
                        <div className="relative">
                          <DollarSign size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                          <input 
                            type="number" 
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full bg-[var(--section-bg)] p-2 pl-8 rounded-xl text-xs font-bold border-2 border-transparent focus:border-[#667eea] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[0.6rem] font-black uppercase opacity-50 mb-2 block tracking-widest">Prazo</label>
                        <div className="relative">
                          <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                          <input 
                            type="date" 
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-[var(--section-bg)] p-2 pl-8 rounded-xl text-xs font-bold border-2 border-transparent focus:border-[#667eea] outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={() => setIsPayment(!isPayment)}
                          className={cn(
                            "w-full p-2.5 rounded-xl font-black text-[0.6rem] flex items-center justify-center gap-2 transition-all border-2",
                            isPayment ? "bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]" : "bg-[var(--section-bg)] border-transparent text-[var(--text-muted)]"
                          )}
                        >
                          <CreditCard size={14} /> PAGAMENTO
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Task List */}
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {listTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-30">
                       <CheckCircle2 size={48} />
                       <p className="font-bold text-sm mt-2 font-mono uppercase tracking-widest">Lista Vazia</p>
                    </div>
                  ) : (
                    listTasks.map((task) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={task.id} 
                        className={cn(
                          "group bg-[var(--card-bg)] p-4 rounded-2xl flex items-center gap-4 border-2 transition-all hover:translate-x-1 shadow-sm",
                          task.completed ? "opacity-50 grayscale border-transparent" : "border-transparent hover:border-[var(--border-color)]"
                        )}
                      >
                        <button 
                          onClick={() => toggleTask(task.id, !task.completed)} 
                          className={cn("transition-transform active:scale-75", task.completed ? "text-[var(--success)]" : "text-[var(--text-muted)]")}
                        >
                          {task.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className={cn("font-black text-[var(--text-primary)] truncate", task.completed && "line-through opacity-50")}>
                            {task.title}
                          </div>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className={cn("px-2 py-0.5 rounded-md text-[0.6rem] font-black uppercase", priorityColors[task.priority])}>
                              <Flag size={10} className="inline mr-1" /> {task.priority}
                            </span>
                            {task.dueDate && (
                              <span className="bg-gray-100 dark:bg-white/5 text-[var(--text-muted)] px-2 py-0.5 rounded-md text-[0.6rem] font-bold">
                                <Calendar size={10} className="inline mr-1" /> {formatDate(task.dueDate)}
                              </span>
                            )}
                            {task.amount && (
                              <span className="bg-[#667eea]/10 text-[#667eea] px-2 py-0.5 rounded-md text-[0.6rem] font-black">
                                <DollarSign size={10} className="inline mr-1" /> {formatCurrency(task.amount)}
                              </span>
                            )}
                            {task.isPayment && (
                              <span className="bg-[var(--danger)] text-white px-2 py-0.5 rounded-md text-[0.6rem] font-black">
                                CONTA
                              </span>
                            )}
                          </div>
                        </div>

                        <button 
                          onClick={() => deleteTask(task.id)} 
                          className="opacity-0 group-hover:opacity-100 p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-xl transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--text-muted)] opacity-50">
               <motion.div 
                 animate={{ rotate: [0, 10, -10, 0] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               >
                 <CheckCircle2 size={120} weight="thin" />
               </motion.div>
               <p className="mt-6 font-black tracking-tighter text-xl">Nada selecionado</p>
               <p className="text-xs uppercase tracking-widest font-bold mt-2">Crie uma lista para começar seu fluxo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
