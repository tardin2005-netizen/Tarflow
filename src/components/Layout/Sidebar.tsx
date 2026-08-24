import React from "react";
import { X, PlusCircle, BarChart2, PieChart, Target, CheckCircle, User, Info, Moon, Sun, Share2, Crown, Sparkles, Heart, Smartphone, MessageSquare, Building2, PanelLeft, PanelRight, ShoppingCart, Layers, TrendingUp } from "lucide-react";
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
  const { profile, updateProfile, addAchievement } = useUserProfile();
  const { t, i18n } = useTranslation();

  const handleInvite = async () => {
    const shareData = {
      title: 'Tarflow - Finanças & Tarefas',
      text: 'Conheça o Tarflow, o app que organiza suas finanças e produtividade! 🌊',
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copiado para a área de transferência!");
      }
      if (user && profile) {
        updateProfile({ referralCount: (profile.referralCount || 0) + 1 });
        addAchievement('social_butterfly');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const navItems = [
    { id: "inicio", icon: <PieChart size={18} />, label: t("Início (Visão Geral)"), section: t("PRINCIPAL"), isSpecial: false },
    { id: "gastos", icon: <Layers size={18} />, label: t("Gestão de Gastos"), section: t("PRINCIPAL"), isSpecial: false },
    { id: "mercado", icon: <TrendingUp size={18} />, label: t("Mercado Financeiro"), section: t("PRINCIPAL"), isSpecial: false },
    { id: "investimentos", icon: <Building2 size={18} />, label: t("Investimentos"), section: t("PRINCIPAL"), isSpecial: false },

    { id: "perfil", icon: <User size={18} />, label: t("Perfil do Usuário"), section: t("CONTA & AJUSTES") },
    { id: "share", icon: <Share2 size={18} />, label: t("Compartilhar dados"), section: t("CONTA & AJUSTES"), onClick: handleInvite },

    { id: "sobre", icon: <Info size={18} />, label: t("Sobre o Tarflow"), section: t("SOBRE") },
    { id: "contato", icon: <MessageSquare size={18} />, label: t("Central de Feedback"), section: t("SOBRE") },
    { id: "referral", icon: <Heart size={18} />, label: t("Indicar um amigo"), section: t("SOBRE"), onClick: handleInvite },
  ];

  if (activeTab === "welcome") {
    return null;
  }

  return (
    <>
      {/* Mobile Drawer Backdrop (Only on < md) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[1000] md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar: Docked on Left for Web (md+), Drawer for Mobile (<md) */}
      <aside 
        className={cn(
          "bg-[#1a1a2e] text-white flex flex-col overflow-hidden transition-all duration-300",
          // Web (md+) styling: Full-height Docked Left Sidebar
          "md:fixed md:top-0 md:bottom-0 md:w-[260px] lg:w-[275px] md:rounded-none md:border-r md:border-white/10 md:z-30 md:translate-x-0",
          // Mobile (<md) styling: Drawer with slide transition
          "fixed top-0 bottom-0 w-[290px] max-w-[85vw] z-[1001] shadow-[25px_0_50px_-12px_rgba(0,0,0,0.5)] md:shadow-none",
          sidebarPosition === "left" ? "left-0" : "right-0 md:left-0",
          isOpen ? "translate-x-0" : (sidebarPosition === "left" ? "-translate-x-full md:translate-x-0" : "translate-x-full md:translate-x-0")
        )}
      >
        {/* Profile Header */}
        <div className="p-6 sm:p-7 border-b border-white/5 relative bg-white/5 group shrink-0">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-10 h-10 flex justify-center items-center shrink-0 overflow-visible pointer-events-none">
              <img src="/tarflowicon.png" alt="Tarflow Icon" className="w-full h-auto object-contain drop-shadow-2xl scale-[1.5] pointer-events-auto" />
            </div>
            <div className="flex flex-col ml-1">
              <span className="text-3xl font-black tracking-normal text-white/90 leading-none" style={{ fontVariantLigatures: "none", letterSpacing: "0.035em" }}>
                Tarflow
              </span>
              <span className="text-[0.6rem] font-bold tracking-[0.2em] text-white/25 uppercase whitespace-nowrap mt-1 font-sans">{t("SISTEMA INTEGRADO")}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 overflow-hidden shrink-0">
               {user ? (
                 <img src={profile?.avatar || user.photoURL || ""} alt={profile?.name || user.displayName || "User"} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
               ) : (
                 <User size={20} className="text-gray-400" />
               )}
            </div>
            <div className="overflow-hidden flex-1">
              <h2 className="text-xs font-bold text-white/90 truncate">
                {profile?.name || (user ? (user.displayName || t("Usuário Tarflow")) : t("Sessão Visitante"))}
              </h2>
              <p className="text-[0.65rem] text-white/40 truncate">
                {user ? user.email : t("Entre para salvar dados")}
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-3.5 overflow-y-auto custom-scrollbar">
          {navItems.reduce((acc: React.ReactNode[], item, index) => {
            const prevItem = navItems[index - 1];
            if (!prevItem || prevItem.section !== item.section) {
              acc.push(
                <div key={`section-${item.section}`} className="text-[0.58rem] uppercase text-white/30 font-black tracking-[0.2em] px-3 pt-5 pb-1.5">
                  {item.section}
                </div>
              );
            }
            
            const isItemActive = activeTab === item.id || 
              (item.id === "gastos" && ["gastos", "supermercado", "extratos", "metas", "tarefas"].includes(activeTab));

            acc.push(
              <button
                key={item.id + index}
                onClick={() => {
                  if ((item as any).onClick) {
                    (item as any).onClick();
                    onClose();
                  } else {
                    onTabChange(item.id);
                    onClose();
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 text-left relative group cursor-pointer",
                  isItemActive 
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black shadow-md shadow-blue-500/20" 
                    : "text-white/70 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <span className={cn(
                  "flex items-center justify-center w-5 shrink-0",
                  isItemActive ? "text-white" : "text-white/40 group-hover:text-white/80"
                )}>
                  {item.icon}
                </span>
                <span className="text-[0.82rem] font-bold tracking-tight flex-1 truncate">{item.label}</span>
                {(item as any).tag && (
                  <span className={cn(
                    "text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md",
                    isItemActive ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  )}>
                    {(item as any).tag}
                  </span>
                )}
              </button>
            );
            return acc;
          }, [])}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between shrink-0">
          {!user ? (
            <div className="flex items-center gap-2">
               <User size={16} className="text-blue-300" />
               <span className="text-xs font-bold text-blue-300">{t("Visitante")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
               <Crown size={16} className="text-yellow-400" />
               <span className="text-xs font-bold text-yellow-400">{t("Tarflow Pro")}</span>
            </div>
          )}
          <span className="text-[9px] text-white/30 font-mono">v1.2</span>
        </div>
      </aside>
    </>
  );
}
