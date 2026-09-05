import React from "react";
import { CheckCircle2, Heart, Shield, Sparkles, Zap, Smartphone, Cloud, Bot, Users, BarChart2, Target, Mail } from "lucide-react";
import { motion } from "motion/react";

export default function AboutTab() {
  const features = [
    { 
      title: "Fluxo Financeiro", 
      desc: "Controle total de entradas, saídas e metas categoria por categoria.", 
      icon: <Zap size={24} className="text-yellow-400" /> 
    },
    { 
      title: "Tarefas To-Do", 
      desc: "Listas dinâmicas com prioridade, prazos e lembretes integrados.", 
      icon: <CheckCircle2 size={24} className="text-emerald-400" /> 
    },
    { 
      title: "Dicas com IA", 
      desc: "Assistente personalizado (Cerebro AI) que analisa seus de de forma simples.", 
      icon: <Bot size={24} className="text-blue-400" /> 
    },
    { 
      title: "Sincronização", 
      desc: "Dados salvos com Firebase e autenticação Google segura.", 
      icon: <Cloud size={24} className="text-sky-400" /> 
    },
  ];

  return (
    <div className="tab-content flex flex-col gap-10 pb-20">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] p-12 rounded-[3.5rem] text-white text-center relative overflow-hidden shadow-2xl"
      >
        <div className="relative z-10">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6 flex flex-col items-center"
          >
            <div className="w-40 md:w-56 flex justify-center items-center shrink-0 mb-3 pointer-events-none">
              <img src={`${import.meta.env.BASE_URL}tarflowicon.png`} alt="Tarflow Icon" className="w-full h-auto drop-shadow-2xl pointer-events-auto" />
            </div>
            <h1 className="text-5xl md:text-7xl font-sans font-black text-white leading-none relative z-10" style={{ fontVariantLigatures: "none", letterSpacing: "0.035em" }}>
              Tarflow
            </h1>
          </motion.div>
          <p className="max-w-2xl mx-auto text-lg opacity-80 font-medium leading-relaxed mt-4">
            O fluxo definitivo para sua organização pessoal. Financas e produtividade fundidas em uma experiência única e inteligente.
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-[100px]" />
           <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full blur-[120px]" />
        </div>
      </motion.div>

      {/* Philosophy Section */}
      <div className="grid lg:grid-cols-2 gap-10 px-4">
        <div className="space-y-6">
           <h2 className="text-3xl font-black text-[var(--text-primary)]">Por que Tarflow?</h2>
           <p className="text-[var(--text-muted)] font-medium leading-relaxed">
             Acreditamos que a vida é um fluxo constante. Quando suas tarefas estão em ordem, suas finanças tendem a segui-las. 
             O Tarflow (Tar de Tarefas + Flow de Fluxo) nasceu para remover o atrito entre o que você precisa fazer e quanto isso custa.
           </p>
           <div className="flex items-center gap-4 p-6 bg-[var(--section-bg)] rounded-3xl border-2 border-[var(--border-color)]">
              <Shield className="text-[var(--success)] shrink-0" size={32} />
              <div>
                <h4 className="font-black text-sm text-[var(--text-primary)]">Privacidade em Primeiro Lugar</h4>
                <p className="text-xs text-[var(--text-muted)] font-bold mt-1">Seus dados são protegidos por criptografia de ponta a ponta na infraestrutura do Google.</p>
              </div>
           </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
           {features.map((f, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               className="bg-[var(--section-bg)] p-6 rounded-[2rem] border-2 border-[var(--border-color)] shadow-sm hover:border-[#667eea] transition-colors"
             >
               <div className="mb-3">{f.icon}</div>
               <h4 className="font-black text-xs mb-1 text-[var(--text-primary)]">{f.title}</h4>
               <p className="text-[0.65rem] text-[var(--text-muted)] font-bold leading-tight">{f.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Change Log */}
      <div className="bg-[var(--section-bg)] p-10 rounded-[3rem] border-2 border-[var(--border-color)]">
        <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-[var(--text-primary)]">
           <Zap size={20} className="text-yellow-500" /> Novidades & Atualizações
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
           <div className="space-y-4">
              <div className="font-black text-sm text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 flex justify-between">
                SISTEMA DE METAS <Target size={14} className="text-[#667eea]" />
              </div>
              <ul className="text-xs font-bold text-[var(--text-muted)] space-y-2">
                 <li className="flex gap-2 text-[var(--success)]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Novas barras de progresso dinâmicas</span></li>
                 <li className="flex gap-2 text-[var(--success)]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Categorização individual de teto</span></li>
                 <li className="flex gap-2 text-[var(--success)]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Alertas visuais de estouro</span></li>
              </ul>
           </div>
           <div className="space-y-4">
              <div className="font-black text-sm text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 flex justify-between">
                IA & CONSELHOS <Bot size={14} className="text-blue-400" />
              </div>
              <ul className="text-xs font-bold text-[var(--text-muted)] space-y-2">
                 <li className="flex gap-2 text-blue-400"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Análise global de padrões via Cerebro AI</span></li>
                 <li className="flex gap-2 text-blue-400"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Chat integrado com contexto financeiro</span></li>
                 <li className="flex gap-2 text-blue-400"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Dicas diárias automáticas</span></li>
              </ul>
           </div>
           <div className="space-y-4">
              <div className="font-black text-sm text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 flex justify-between">
                DESIGN SYSTEM <Sparkles size={14} className="text-[#764ba2]" />
              </div>
              <ul className="text-xs font-bold text-[var(--text-muted)] space-y-2">
                 <li className="flex gap-2 text-[#764ba2]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Nova paleta de cores "Deep Ocean"</span></li>
                 <li className="flex gap-2 text-[#764ba2]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Micro-animações de estado e transição</span></li>
                 <li className="flex gap-2 text-[#764ba2]"><CheckCircle2 size={12} /> <span className="opacity-80 text-[var(--text-muted)]">Dashboard unificado de gastos</span></li>
              </ul>
           </div>
        </div>
      </div>
      
      {/* Contact Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#667eea] to-[#764ba2] p-10 rounded-[3rem] text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black leading-none">Tem uma ideia?</h3>
            <p className="text-sm font-bold opacity-70 mt-2">Ajude-nos a aprimorar o Tarflow com seu feedback.</p>
          </div>
        </div>
        <a 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=tardin2005@gmail.com&su=Feedback%20Tarflow"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#764ba2] px-8 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 relative z-10"
        >
          <Mail size={18} /> Contatar via Gmail
        </a>
      </motion.div>

      <div className="text-center mt-10">
         <p className="text-[0.6rem] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-center gap-2">
           Feito com <Heart size={10} className="text-red-500 fill-red-500" /> pela Equipe Tarflow
         </p>
         <p className="text-[0.55rem] font-black opacity-30 mt-2 text-[var(--text-muted)]">© 2026 TARFLOW PROJECT · TODOS OS DIREITOS RESERVADOS</p>
      </div>
    </div>
  );
}
