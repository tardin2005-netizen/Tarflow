import React, { useMemo, useState, useEffect } from "react";
import { useExpenses, useTasks, useUserProfile } from "../../hooks/useFirebaseData";
import { auth } from "../../lib/firebase";
import { formatCurrency, cn } from "../../lib/utils";
import { ACHIEVEMENT_LIST } from "../../types";
import { motion } from "motion/react";
import { User, Mail, Calendar, Briefcase, TrendingUp, Flame, Trophy, Activity, CheckCircle, Clock, Receipt, Save, Edit2 } from "lucide-react";

export default function ProfileTab() {
  const { expenses } = useExpenses();
  const { tasks } = useTasks();
  const { profile, updateProfile } = useUserProfile();
  const user = auth.currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    salary: "",
    averageIncome: "",
    profession: "",
    avatar: ""
  });

  const [selectedSkin, setSelectedSkin] = useState("ffdbb4");

  const plannerStep = profile?.plannerStep || 0;

  const [plannerInput, setPlannerInput] = useState("");
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [riskAnswer, setRiskAnswer] = useState("");

  const handlePlannerAction = async () => {
    if (!profile) return;
    
    if (plannerStep === 0) {
      if (plannerInput.length < 10) {
        alert("Por favor, insira um telefone válido com DDD.");
        return;
      }
      await updateProfile({ plannerPhone: plannerInput, plannerStep: 1 });
      setPlannerInput("");
    } else if (plannerStep === 1) {
      await updateProfile({ plannerStep: 2 });
    } else if (plannerStep === 2) {
      await updateProfile({ plannerStep: 3 });
    }
  };

  const avatarConfigs = [
    { id: "empresario", label: "Terno", params: "seed=empresario&top=shortRound&clothing=blazerAndShirt&facialHairProbability=0" },
    { id: "streetwear", label: "Streetwear", params: "seed=streetwear&top=dreads01&clothing=hoodie&accessories=sunglasses&accessoriesProbability=100&facialHairProbability=0" },
    { id: "hippie", label: "Hippie", params: "seed=hippie&top=shaggyMullet&clothing=graphicShirt&facialHair=beardMajestic&facialHairProbability=100" },
    { id: "loira", label: "Liso Claro", params: "seed=loira&top=longButNotTooLong&clothing=shirtVNeck&hairColor=d6b370&facialHairProbability=0" },
    { id: "morena", label: "Liso Escuro", params: "seed=morena&top=straight02&clothing=shirtScoopNeck&hairColor=2c1b18&facialHairProbability=0" },
    { id: "cachos", label: "Cacheados", params: "seed=cachos&top=curly&clothing=overall&hairColor=724133&facialHairProbability=0" },
  ];

  const skinColors = [
    { value: "ffdbb4", label: "Branca", hex: "#ffdbb4" },
    { value: "f2d388", label: "Amarela", hex: "#f2d388" },
    { value: "d08b5b", label: "Parda", hex: "#d08b5b" },
    { value: "614335", label: "Preta", hex: "#614335" }
  ];

  const buildAvatarUrl = (paramsStr: string, skinHex: string) => {
    // If the paramsStr doesn't contain a seed (from older data), give it a generic one
    const safeParamsStr = paramsStr.includes('seed=') ? paramsStr : `seed=${paramsStr || 'Felix'}`;
    return `https://api.dicebear.com/9.x/avataaars/svg?${safeParamsStr}&skinColor=${skinHex.replace('#', '')}`;
  };

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        age: profile.age || "",
        salary: profile.salary || "",
        averageIncome: profile.averageIncome || "",
        profession: profile.profession || "",
        avatar: profile.avatar || ""
      });
      
      // Attempt to extract skinColor from existing avatar URL
      if (profile.avatar && profile.avatar.includes("skinColor=")) {
        const match = profile.avatar.match(/skinColor=([^&]*)/);
        if (match && match[1]) {
          let extr = match[1];
          // Map old names if they exist
          if (extr === "pale") extr = "ffdbb4";
          if (extr === "yellow") extr = "f2d388";
          if (extr === "brown") extr = "d08b5b";
          if (extr === "black") extr = "614335";
          setSelectedSkin(extr);
        }
      }
    }
  }, [profile]);

  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((s, e) => s + e.value, 0);
    const tasksDone = tasks.filter(t => t.completed).length;
    const tasksPending = tasks.length - tasksDone;
    const now = new Date();
    const monthSpent = expenses
      .filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, e) => s + e.value, 0);

    return { totalSpent, tasksDone, tasksPending, monthSpent };
  }, [expenses, tasks]);

  const handleSave = async () => {
    await updateProfile(formData);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="tab-content flex flex-col items-center justify-center py-20 text-center">
        <User size={64} className="text-[var(--text-muted)] mb-4 opacity-20" />
        <h3 className="text-xl font-bold mb-4">Faça login para ver seu perfil</h3>
        <p className="text-[var(--text-secondary)] mb-6 max-w-md">Estatísticas, conquistas e configurações personalizadas ficam disponíveis após o login.</p>
      </div>
    );
  }

  return (
    <div className="tab-content flex flex-col gap-8">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Gasto do mês", value: formatCurrency(stats.monthSpent).split(",")[0], icon: <Calendar size={20} /> },
          { label: "Tarefas feitas", value: stats.tasksDone, icon: <CheckCircle size={20} /> },
          { label: "Pendentes", value: stats.tasksPending, icon: <Clock size={20} /> },
          { label: "Total de Gastos", value: expenses.length, icon: <Receipt size={20} /> },
        ].map((item, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="bg-[var(--card-bg)] p-4 rounded-3xl border-2 border-[var(--border-color)] text-center shadow-lg hover:border-[#667eea] transition-colors"
          >
            <div className="flex justify-center text-[#667eea] mb-2">{item.icon}</div>
            <div className="text-2xl font-black bg-gradient-to-br from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              {item.value}
            </div>
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 opacity-70">
              {item.label}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Info & Edit Section */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--section-bg)] p-8 rounded-3xl shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-colors flex items-center justify-center border border-white/10"
                title={isEditing ? "Salvar" : "Editar"}
              >
                {isEditing ? <Save size={18} /> : <Edit2 size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center text-3xl text-white font-bold shadow-lg overflow-hidden border-4 border-[var(--card-bg)]">
                   {formData.avatar ? (
                     <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                   ) : (
                     profile?.name?.[0] || user.displayName?.[0] || "?"
                   )}
                </div>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <Edit2 size={24} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black">{profile?.name || user.displayName || "Usuário"}</h2>
                <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mb-8 p-4 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)]">
                <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-70">Cor de Pele</label>
                <div className="flex flex-wrap gap-3 mb-5">
                  {skinColors.map((skin) => (
                    <button
                      key={skin.value}
                      onClick={() => {
                        setSelectedSkin(skin.value);
                        // If there's already an avatar selected, update its color
                        if (formData.avatar) {
                          try {
                            const urlObj = new URL(formData.avatar);
                            urlObj.searchParams.set('skinColor', skin.value);
                            setFormData({ ...formData, avatar: urlObj.toString() });
                          } catch (e) {
                            // fallback for invalid urls
                          }
                        }
                      }}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all shadow-sm",
                        selectedSkin === skin.value ? "border-white scale-110 shadow-md ring-2 ring-[var(--success)]" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                      style={{ backgroundColor: skin.hex }}
                      title={skin.label}
                    />
                  ))}
                </div>

                <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 block opacity-70">Escolha seu Avatar</label>
                <div className="flex flex-wrap gap-3">
                  {avatarConfigs.map((config, i) => {
                    const url = buildAvatarUrl(config.params, selectedSkin);
                    const isSelected = formData.avatar.includes(`seed=${config.id}`);
                    return (
                      <button 
                        key={config.id}
                        onClick={() => setFormData({...formData, avatar: url})}
                        className={cn(
                          "w-12 h-12 rounded-xl border-2 transition-all overflow-hidden",
                          isSelected ? "border-[var(--success)] scale-110 shadow-md ring-2 ring-white/20" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                        title={config.label}
                      >
                        <img src={url} alt={config.label} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                  <button 
                    onClick={() => setFormData({...formData, avatar: ""})}
                    className={cn(
                      "w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center bg-gray-100 dark:bg-white/5 overflow-hidden",
                      formData.avatar === "" ? "border-[var(--success)] scale-110 shadow-md ring-2 ring-white/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    title="Usar minha foto do Google"
                  >
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Minha foto do Google" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block opacity-70">Sua Idade</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.age} 
                      onChange={e => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-2 rounded-xl text-lg font-bold outline-none focus:border-[var(--success)]"
                      placeholder="Ex: 25"
                    />
                  ) : (
                    <div className="text-xl font-bold">{profile?.age || "Não informado"}</div>
                  )}
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block opacity-70">Salário Atual (R$)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.salary} 
                      onChange={e => setFormData({...formData, salary: e.target.value})}
                      className="w-full bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-2 rounded-xl text-lg font-bold outline-none focus:border-[var(--success)]"
                      placeholder="Quanto ganha hoje"
                    />
                  ) : (
                    <div className="text-xl font-bold">{profile?.salary ? formatCurrency(parseFloat(profile.salary)) : "Não informado"}</div>
                  )}
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block opacity-70">Renda Média Mensal (R$)</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={formData.averageIncome} 
                      onChange={e => setFormData({...formData, averageIncome: e.target.value})}
                      className="w-full bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-2 rounded-xl text-lg font-bold outline-none focus:border-[var(--success)]"
                      placeholder="Renda média"
                    />
                  ) : (
                    <div className="text-xl font-bold">{profile?.averageIncome ? formatCurrency(parseFloat(profile.averageIncome)) : "Não informado"}</div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block opacity-70">Sua Profissão</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.profession} 
                      onChange={e => setFormData({...formData, profession: e.target.value})}
                      className="w-full bg-[var(--card-bg)] border-2 border-[var(--border-color)] p-2 rounded-xl text-lg font-bold outline-none focus:border-[var(--success)]"
                      placeholder="Ex: Desenvolvedor"
                    />
                  ) : (
                    <div className="text-xl font-bold">{profile?.profession || "Não informado"}</div>
                  )}
                </div>
                <div>
                  <label className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 block opacity-70">Status de Conta</label>
                  <div className="flex items-center gap-2">
                    <Flame size={20} className="text-orange-500" />
                    <span className="text-xl font-bold">{profile?.streak || 1} dias ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Planner block */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] p-8 rounded-3xl shadow-xl space-y-6 text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-white/10 rounded-2xl">
                <TrendingUp size={28} className="text-[#00F5FF]" />
              </div>
              <div>
                <h2 className="text-2xl font-black">Meu Planejador</h2>
                <p className="text-white/70 text-sm font-medium">Sua inteligência financeira pessoal</p>
              </div>
            </div>

            <div className="pt-2">
              {plannerStep < 3 ? (
                <div className="space-y-6">
                  {/* Step 1: Phone */}
                  <div className={cn("bg-white/5 border border-white/10 p-5 rounded-2xl transition-all", plannerStep === 0 ? "border-[#00F5FF]/50 bg-white/10" : "opacity-60")}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", plannerStep > 0 ? "bg-[#059669] text-white" : plannerStep === 0 ? "bg-[#00F5FF] text-[#1a1a2e]" : "bg-white/20")}>
                        {plannerStep > 0 ? <CheckCircle size={16} /> : "1"}
                      </div>
                      <h3 className="font-bold text-lg">Conectar WhatsApp</h3>
                    </div>
                    {plannerStep === 0 && (
                      <div className="pl-11 space-y-3">
                        <p className="text-sm text-white/80">Receba alertas e conselhos diretamente no seu celular.</p>
                        <div className="flex gap-2">
                          <input 
                            type="tel" 
                            placeholder="(11) 99999-9999" 
                            className="bg-black/20 border border-white/20 rounded-xl px-4 py-2 flex-1 text-white outline-none focus:border-[#00F5FF] transition-colors"
                            value={plannerInput}
                            onChange={(e) => setPlannerInput(e.target.value)}
                          />
                          <button onClick={handlePlannerAction} className="bg-[#00F5FF] text-[#1a1a2e] px-4 py-2 rounded-xl font-bold hover:bg-[#00F5FF]/80 transition-colors">
                            Salvar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Perfil */}
                  <div className={cn("bg-white/5 border border-white/10 p-5 rounded-2xl transition-all", plannerStep === 1 ? "border-[#00F5FF]/50 bg-white/10" : "opacity-60")}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", plannerStep > 1 ? "bg-[#059669] text-white" : plannerStep === 1 ? "bg-[#00F5FF] text-[#1a1a2e]" : "bg-white/20")}>
                        {plannerStep > 1 ? <CheckCircle size={16} /> : "2"}
                      </div>
                      <h3 className="font-bold text-lg">Definir Perfil de Risco</h3>
                    </div>
                    {plannerStep === 1 && (
                      <div className="pl-11 space-y-3">
                        {!isQuestionnaireOpen ? (
                          <>
                            <p className="text-sm text-white/80">Descubra qual a melhor forma de investir e guardar seu dinheiro.</p>
                            <button onClick={() => setIsQuestionnaireOpen(true)} className="w-full bg-[#00F5FF] text-[#1a1a2e] py-3 rounded-xl font-bold hover:bg-[#00F5FF]/80 transition-colors">
                              Iniciar Questionário Rápido
                            </button>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <p className="text-sm font-semibold text-white/90">Como você reage ao ver seus investimentos caírem 10%?</p>
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-3 text-sm bg-black/20 p-3 rounded-xl border border-white/10 cursor-pointer hover:border-[#00F5FF]/50 transition-colors">
                                <input type="radio" name="risk" value="Conservador" onChange={() => setRiskAnswer("Conservador")} className="accent-[#00F5FF] w-4 h-4 cursor-pointer" />
                                <span className="text-white/80"><strong className="text-white">Conservador:</strong> Tiro tudo na hora! Prefiro segurança.</span>
                              </label>
                              <label className="flex items-center gap-3 text-sm bg-black/20 p-3 rounded-xl border border-white/10 cursor-pointer hover:border-[#00F5FF]/50 transition-colors">
                                <input type="radio" name="risk" value="Moderado" onChange={() => setRiskAnswer("Moderado")} className="accent-[#00F5FF] w-4 h-4 cursor-pointer" />
                                <span className="text-white/80"><strong className="text-white">Moderado:</strong> Fico atento, mas espero recuperar.</span>
                              </label>
                              <label className="flex items-center gap-3 text-sm bg-black/20 p-3 rounded-xl border border-white/10 cursor-pointer hover:border-[#00F5FF]/50 transition-colors">
                                <input type="radio" name="risk" value="Arrojado" onChange={() => setRiskAnswer("Arrojado")} className="accent-[#00F5FF] w-4 h-4 cursor-pointer" />
                                <span className="text-white/80"><strong className="text-white">Arrojado:</strong> Compro mais! Aproveito a queda.</span>
                              </label>
                            </div>
                            <button 
                              onClick={async () => {
                                if (!riskAnswer) {
                                  alert("Por favor, selecione uma opção.");
                                  return;
                                }
                                await updateProfile({ plannerStep: 2, riskProfile: riskAnswer });
                                setIsQuestionnaireOpen(false);
                              }} 
                              className="w-full bg-[#00F5FF] text-[#1a1a2e] py-3 rounded-xl font-bold hover:bg-[#00F5FF]/80 transition-colors mt-2"
                            >
                              Salvar Perfil
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Step 3: Aposentadoria */}
                  <div className={cn("bg-white/5 border border-white/10 p-5 rounded-2xl transition-all", plannerStep === 2 ? "border-[#00F5FF]/50 bg-white/10" : "opacity-60")}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", plannerStep > 2 ? "bg-[#059669] text-white" : plannerStep === 2 ? "bg-[#00F5FF] text-[#1a1a2e]" : "bg-white/20")}>
                        {plannerStep > 2 ? <CheckCircle size={16} /> : "3"}
                      </div>
                      <h3 className="font-bold text-lg">Projetar Aposentadoria</h3>
                    </div>
                    {plannerStep === 2 && (
                      <div className="pl-11 space-y-3">
                        <p className="text-sm text-white/80">Defina sua meta de longo prazo e ative o acompanhamento inteligente.</p>
                        <button onClick={handlePlannerAction} className="w-full bg-[#00F5FF] text-[#1a1a2e] py-3 rounded-xl font-bold hover:bg-[#00F5FF]/80 transition-colors">
                          Ativar Acompanhamento
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {plannerStep < 3 && (
                     <div className="flex justify-center pt-2">
                       <button onClick={() => updateProfile({ plannerStep: 3 })} className="text-white/50 text-sm font-semibold hover:text-white transition-colors underline">
                         Pular configuração
                       </button>
                     </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 p-6 rounded-[2rem] border border-[#00F5FF]/30 text-center relative overflow-hidden backdrop-blur-sm">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F5FF] blur-[80px] rounded-full opacity-20 pointer-events-none"></div>
                   
                   <div className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 text-[#00F5FF] rounded-full flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(0,245,255,0.2)]">
                     <CheckCircle size={36} />
                   </div>
                   <h3 className="text-white font-black text-2xl mb-2">Planejador Ativo</h3>
                   <p className="text-white/80 font-medium text-sm max-w-[280px] mx-auto mb-6">
                     Seu assistente financeiro está monitorando seus hábitos e em breve lhe enviará dicas pelo WhatsApp cadastrado.
                   </p>
                   
                   <div className="grid grid-cols-2 gap-2 sm:gap-3 text-left w-full">
                      <div className="bg-black/20 p-3 sm:p-4 rounded-xl border border-white/10 min-w-0 overflow-hidden">
                        <div className="text-[9px] sm:text-xs text-white/50 font-bold mb-1 uppercase tracking-wide truncate">Perfil</div>
                        <div className="font-semibold text-sm sm:text-base truncate">{profile?.riskProfile || "Conservador"}</div>
                      </div>
                      <div className="bg-black/20 p-3 sm:p-4 rounded-xl border border-white/10 min-w-0 overflow-hidden">
                        <div className="text-[9px] sm:text-xs text-white/50 font-bold mb-1 uppercase tracking-wide truncate">Aposentadoria</div>
                        <div className="font-semibold text-[#00F5FF] text-sm sm:text-base truncate">Monitorando</div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </motion.div>

          <div className="bg-[var(--section-bg)] p-8 rounded-3xl shadow-lg border-2 border-dashed border-[var(--border-color)]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Trophy size={24} className="text-yellow-500" /> Conquistas Liberadas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {ACHIEVEMENT_LIST.map((ach) => {
                const isUnlocked = profile?.achievements.includes(ach.id);
                return (
                  <div 
                    key={ach.id} 
                    className={cn(
                      "p-4 rounded-2xl flex flex-col items-center text-center transition-all",
                      isUnlocked 
                        ? "bg-[var(--card-bg)] shadow-md border-2 border-[var(--success)]" 
                        : "bg-black/5 opacity-40 grayscale"
                    )}
                  >
                    <div className="text-3xl mb-2">{ach.icon}</div>
                    <div className="text-xs font-black leading-tight">{ach.name}</div>
                    <div className="text-[0.6rem] mt-1 opacity-70">{ach.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] p-8 rounded-3xl text-white shadow-2xl">
            <h3 className="text-lg font-black mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#667eea]" /> Status Tarflow
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70">Nível</span>
                <span className="font-bold">Mestre Financeiro</span>
              </div>
              <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "75%" }}
                  className="h-full bg-[var(--success)]"
                ></motion.div>
              </div>
          <p className="text-xs opacity-70 italic text-center">Complete tarefas e registre gastos para subir de nível! 🚀</p>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] p-6 rounded-3xl border-2 border-[var(--border-color)]">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity size={20} className="text-[#667eea]" /> Dicas Rápidas
            </h3>
            <div className="space-y-4 text-xs">
              <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-[var(--text-muted)]">Gasto Médio por Item</span>
                <span className="font-bold">{formatCurrency(stats.totalSpent / (expenses.length || 1))}</span>
              </div>
              <div className="flex justify-between border-b border-[var(--border-color)] pb-2">
                <span className="text-[var(--text-muted)]">Taxa de Conclusão</span>
                <span className="font-bold">{tasks.length > 0 ? Math.round((stats.tasksDone / tasks.length) * 100) : 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Membro desde</span>
                <span className="font-bold">Maio de 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
