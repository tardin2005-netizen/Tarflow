import React from "react";
import { Menu, Plus, Home, BarChart2, PieChart, User, Target, List, CheckCircle } from "lucide-react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface BottomNavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onToggleSidebar: () => void;
}

export default function BottomNavbar({ activeTab, onTabChange, onToggleSidebar }: BottomNavbarProps) {
  const { t } = useTranslation();

  const handlePlusClick = () => {
    onTabChange("extratos");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[999] p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] flex justify-center pointer-events-none md:hidden animate-fade-in">
      <div 
        id="theme-bottom-nav"
        className="pointer-events-auto relative flex items-center justify-between w-full max-w-[440px] px-2.5 py-1.5 border border-[var(--border-color)] bg-[var(--container-bg)]/95 backdrop-blur-xl rounded-[2rem] shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition-all duration-300"
      >
        {/* TAB 1: INÍCIO */}
        <button
          onClick={() => onTabChange("inicio")}
          className="flex-grow py-1 flex flex-col items-center justify-center transition-all rounded-full group cursor-pointer"
        >
          <div 
            className={`px-2 py-1.5 rounded-2xl flex flex-col items-center transition-all ${
              activeTab === "inicio" 
                ? "bg-[#667eea]/12 text-[#667eea]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <PieChart size={18} className={`transition-transform duration-300 ${activeTab === "inicio" ? "scale-110" : "group-hover:scale-105"}`} />
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">{t("Início")}</span>
          </div>
        </button>
 
        {/* TAB 2: METAS */}
        <button
          onClick={() => onTabChange("metas")}
          className="flex-grow py-1 flex flex-col items-center justify-center transition-all rounded-full group cursor-pointer"
        >
          <div 
            className={`px-2 py-1.5 rounded-2xl flex flex-col items-center transition-all ${
              activeTab === "metas" 
                ? "bg-[#667eea]/12 text-[#667eea]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Target size={18} className={`transition-transform duration-300 ${activeTab === "metas" ? "scale-110" : "group-hover:scale-105"}`} />
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">{t("Metas")}</span>
          </div>
        </button>
 
        {/* CENTRAL HERO ACCENT BUTTON: EXTRATOS (+) */}
        <div className="relative flex justify-center shrink-0 w-[44px] h-[44px]">
          <motion.button
            whileHover={{ scale: 1.12, y: -2 }}
            whileTap={{ scale: 0.93 }}
            onClick={handlePlusClick}
            className={`w-[48px] h-[48px] rounded-full flex items-center justify-center text-white bg-gradient-to-tr from-[#667eea] to-[#5a6fd6] shadow-[0_8px_25px_rgba(102,126,234,0.45)] dark:shadow-[0_8px_25px_rgba(102,126,234,0.3)] transition-all duration-300 absolute -top-5 left-1/2 -translate-x-1/2 border-[3px] ${
              activeTab === "extratos" ? "border-[#40c057] ring-4 ring-[#40c057]/20" : "border-[var(--container-bg)]"
            }`}
            title={t("Extratos e Adicionar")}
          >
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-25 p-2 pointer-events-none" />
            <Plus size={20} className={`stroke-[3.5] transition-transform duration-500 ${activeTab === "extratos" ? "rotate-90" : "rotate-0 group-hover:rotate-45"}`} />
          </motion.button>
        </div>
 
        {/* TAB 3: PERFIL */}
        <button
          onClick={() => onTabChange("perfil")}
          className="flex-grow py-1 flex flex-col items-center justify-center transition-all rounded-full group cursor-pointer"
        >
          <div 
            className={`px-2 py-1.5 rounded-2xl flex flex-col items-center transition-all ${
              activeTab === "perfil" 
                ? "bg-[#667eea]/12 text-[#667eea]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <User size={18} className={`transition-transform duration-300 ${activeTab === "perfil" ? "scale-110" : "group-hover:scale-105"}`} />
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">{t("Perfil")}</span>
          </div>
        </button>
 
        {/* TAB 4: TAREFAS */}
        <button
          onClick={() => onTabChange("tarefas")}
          className="flex-grow py-1 flex flex-col items-center justify-center transition-all rounded-full group cursor-pointer"
        >
          <div 
            className={`px-2 py-1.5 rounded-2xl flex flex-col items-center transition-all ${
              activeTab === "tarefas" 
                ? "bg-[#667eea]/12 text-[#667eea]" 
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CheckCircle size={18} className={`transition-transform duration-300 ${activeTab === "tarefas" ? "scale-110" : "group-hover:scale-105"}`} />
            <span className="text-[9.5px] font-black uppercase tracking-wider mt-0.5">{t("Tarefas")}</span>
          </div>
        </button>
      </div>
    </div>
  );
}

