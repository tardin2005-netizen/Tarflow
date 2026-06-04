import React from "react";
import { Mail, MessageSquare, Send, Sparkles, Heart, Zap, Instagram, Linkedin, Github } from "lucide-react";
import { motion } from "motion/react";

export default function ContactTab() {
  return (
    <div className="tab-content flex flex-col gap-8 pb-20 max-w-4xl mx-auto">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-6">
            <MessageSquare size={32} />
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-4">Fala conosco!</h2>
          <p className="text-lg font-bold opacity-80 leading-relaxed max-w-xl">
            Sua opinião é fundamental para a evolução do Tarflow. Tem uma sugestão, crítica ou encontrou um bug? Estamos aqui para ouvir.
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 opacity-10">
           <Zap size={300} />
        </div>
      </motion.div>

      {/* Contact Options */}
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--section-bg)] p-8 rounded-[2rem] border-2 border-[var(--border-color)] shadow-sm group hover:border-[#667eea] transition-all"
        >
          <div className="w-12 h-12 bg-[#667eea]/10 rounded-xl flex items-center justify-center text-[#667eea] mb-6 group-hover:scale-110 transition-transform">
            <Mail size={24} />
          </div>
          <h3 className="text-xl font-black mb-2 text-[var(--text-primary)]">Email Direto</h3>
          <p className="text-sm font-bold text-[var(--text-muted)] mb-6">
            Envie sua proposta ou feedback detalhado diretamente para o desenvolvedor.
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href="https://mail.google.com/mail/?view=cm&fs=1&to=tardin2005@gmail.com&su=Feedback%20Tarflow"
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center justify-between w-full p-4 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-xl font-black text-sm text-[#EA4335] hover:bg-[#EA4335] hover:text-white transition-all group/link shadow-sm"
            >
              <span>Abrir no Gmail (Web)</span>
              <Send size={16} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
            </a>
            <a 
              href="mailto:tardin2005@gmail.com" 
              className="flex items-center justify-between w-full p-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl font-black text-xs text-[var(--text-muted)] hover:bg-[var(--text-muted)] hover:text-white transition-all group/mail shadow-sm"
            >
              <span>Usar App de Email Padrão</span>
              <Mail size={14} className="opacity-50 group-hover/mail:opacity-100" />
            </a>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--section-bg)] p-8 rounded-[2rem] border-2 border-[var(--border-color)] shadow-sm group hover:border-[#764ba2] transition-all"
        >
          <div className="w-12 h-12 bg-[#764ba2]/10 rounded-xl flex items-center justify-center text-[#764ba2] mb-6 group-hover:scale-110 transition-transform">
            <Sparkles size={24} />
          </div>
          <h3 className="text-xl font-black mb-2 text-[var(--text-primary)]">Redes Sociais</h3>
          <p className="text-sm font-bold text-[var(--text-muted)] mb-6">
            Acompanhe as atualizações e novidades do ecossistema Tarflow.
          </p>
          <div className="flex gap-4">
             <a href="#" className="w-12 h-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-primary)] hover:bg-[#E1306C] hover:text-white transition-all shadow-sm">
               <Instagram size={20} />
             </a>
             <a href="#" className="w-12 h-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-primary)] hover:bg-[#0077B5] hover:text-white transition-all shadow-sm">
               <Linkedin size={20} />
             </a>
             <a href="#" className="w-12 h-12 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex items-center justify-center text-[var(--text-primary)] hover:bg-[#333] hover:text-white transition-all shadow-sm">
               <Github size={20} />
             </a>
          </div>
        </motion.div>
      </div>

      {/* Values Section */}
      <div className="bg-[var(--section-bg)] p-10 rounded-[2.5rem] border-2 border-[var(--border-color)] relative overflow-hidden">
        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          <div className="text-center">
            <div className="text-[#667eea] font-black text-3xl mb-2">24h</div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-muted)]">Tempo de Resposta</p>
          </div>
          <div className="text-center border-x-0 md:border-x-2 border-[var(--border-color)]">
            <div className="text-[#764ba2] font-black text-3xl mb-2">100%</div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-muted)]">Feedback Analisado</p>
          </div>
          <div className="text-center">
            <div className="text-[var(--success)] font-black text-3xl mb-2">Life</div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[var(--text-muted)]">Support Flow</p>
          </div>
        </div>
      </div>

      <div className="text-center mt-6">
         <p className="text-[0.6rem] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-center gap-2">
           Feito com <Heart size={10} className="text-red-500 fill-red-500" /> para a Comunidade
         </p>
      </div>
    </div>
  );
}
