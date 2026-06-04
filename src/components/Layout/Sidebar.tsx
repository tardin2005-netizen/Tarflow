import React from "react";
import { X, PlusCircle, BarChart2, PieChart, Target, CheckCircle, User, Info, Moon, Sun, Share2, Crown, Sparkles, Heart, Smartphone, MessageSquare, Building2, PanelLeft, PanelRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "../../lib/firebase";
import { useTheme } from "./ThemeContext";
import { useUserProfile } from "../../hooks/useFirebaseData";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  sidebarPosition: "left" | "right";
  onTogglePosition: () => void;
}

export default function Sidebar({ isOpen, onClose, activeTab, onTabChange, sidebarPosition, onTogglePosition }: SidebarProps) {
  const user = auth.currentUser;
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUserProfile();
  const { t, i18n } = useTranslation();
  
  const navItems = [
    { id: "inicio", icon: <PieChart size={18} />, label: t("Início"), section: t("PRINCIPAL"), isSpecial: false },
    { id: "metas", icon: <Target size={18} />, label: t("Metas"), section: t("PRINCIPAL") },
    { id: "extratos", icon: <PlusCircle size={18} />, label: t("Extratos e Adicionar"), section: t("PRINCIPAL"), isSpecial: true },
    { id: "tarefas", icon: <CheckCircle size={18} />, label: t("Tarefas"), section: t("PRINCIPAL") },
    
    { id: "perfil", icon: <User size={18} />, label: t("Perfil"), section: t("CONTA") },
    { id: "openfinance", icon: <Building2 size={18} />, label: t("Open Finance"), section: t("CONTA") },
    { id: "share", icon: <Share2 size={18} />, label: t("Compartilhar dados"), section: t("CONTA") },
    
    { id: "sobre", icon: <Info size={18} />, label: t("Sobre o Tarflow"), section: t("SOBRE") },
    { id: "contato", icon: <MessageSquare size={18} />, label: t("Central de Feedback"), section: t("SOBRE") },
    { id: "referral", icon: <Heart size={18} />, label: t("Indicar um amigo"), section: t("SOBRE") },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      <aside 
        className={cn(
          "fixed top-0 bottom-0 w-[300px] max-w-[85vw] bg-[#1a1a2e] text-white z-[1001] transition-transform duration-500 ease-out flex flex-col shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden",
          sidebarPosition === "left" ? "left-0" : "right-0",
          isOpen ? "translate-x-0" : (sidebarPosition === "left" ? "-translate-x-full" : "translate-x-full")
        )}
      >
        {/* Profile Header */}
        <div className="p-8 border-b border-white/5 relative bg-white/5 group">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 flex justify-center items-center shrink-0 overflow-visible pointer-events-none">
              <img src="/tarflowicon.png" alt="Tarflow Icon" className="w-full h-auto object-contain drop-shadow-2xl scale-[1.6] pointer-events-auto" />
            </div>
            <div className="flex flex-col ml-1">
              <span className="text-4xl font-black tracking-tight text-white/90 leading-none">Tarflow</span>
              <span className="text-[0.65rem] font-bold tracking-[0.2em] text-white/20 uppercase whitespace-nowrap mt-1 font-sans">{t("SISTEMA INTEGRADO")}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
               {user ? (
                 <img src={profile?.avatar || user.photoURL || ""} alt={profile?.name || user.displayName || "User"} className="w-full h-full object-cover" />
               ) : (
                 <User size={24} className="text-gray-500" />
               )}
            </div>
            <div className="overflow-hidden flex-1">
              <h2 className="text-sm font-bold opacity-80 truncate">
                {profile?.name || (user ? (user.displayName || t("Usuário Tarflow")) : t("Sessão Visitante"))}
              </h2>
              <p className="text-[0.65rem] opacity-50 truncate">
                {user ? user.email : t("Entre para salvar dados")}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onTogglePosition}
            className="absolute bottom-4 right-4 p-1.5 text-white/30 hover:text-white/80 hover:bg-white/10 rounded-lg transition-all"
            title={sidebarPosition === "left" ? t("Mover para Direita") : t("Mover para Esquerda")}
          >
            {sidebarPosition === "left" ? <PanelRight size={16} /> : <PanelLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {navItems.reduce((acc: React.ReactNode[], item, index) => {
            const prevItem = navItems[index - 1];
            if (!prevItem || prevItem.section !== item.section) {
              acc.push(
                <div key={`section-${item.section}`} className="text-[0.6rem] uppercase text-white/30 font-black tracking-[0.2em] px-4 pt-6 pb-2">
                  {item.section}
                </div>
              );
            }
            
            acc.push(
              <button
                key={item.id + index}
                onClick={() => {
                  if ((item as any).onClick) {
                    (item as any).onClick();
                  } else {
                    onTabChange(item.id);
                    onClose();
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-3.5 rounded-xl transition-all mb-1 text-left relative group",
                  item.isSpecial 
                    ? "bg-[#667eea]/20 text-[#667eea] border border-[#667eea]/30 mb-4" 
                    : activeTab === item.id 
                      ? "bg-white/5 text-[#667eea] font-black" 
                      : "text-white/70 hover:bg-white/5 hover:translate-x-1"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-5",
                  activeTab === item.id || item.isSpecial ? "text-[#667eea]" : "text-white/40"
                )}>
                  {item.icon}
                </span>
                <span className="text-[0.85rem] font-bold tracking-tight">{item.label}</span>
              </button>
            );
            return acc;
          }, [])}
          
          <div className="mt-8 px-4 text-center">
            <p className="text-[0.6rem] opacity-30 font-bold">← Deslize para fechar · ESC para fechar</p>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20 flex flex-col items-center relative">
          {!user ? (
            <div className="flex items-center gap-2 mb-2">
               <User size={20} className="text-blue-300" />
               <span className="text-sm font-black text-blue-300">{t("Visitante")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-2">
               <Crown size={20} className="text-yellow-400" />
               <span className="text-sm font-black text-yellow-400">{t("Usuário Premium")}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
