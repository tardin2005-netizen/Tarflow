import React from "react";
import { Menu, User, Moon, Sun, Share2, LogOut, LogIn, Globe } from "lucide-react";
import { signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, googleProvider } from "../../lib/firebase";
import { useTheme } from "./ThemeContext";
import { useUserProfile } from "../../hooks/useFirebaseData";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface HeaderProps {
  onToggleSidebar: () => void;
  user: FirebaseUser | null | undefined;
  onLoginSuccess?: () => void;
  sidebarPosition?: "left" | "right";
}

export default function Header({ onToggleSidebar, user, onLoginSuccess, sidebarPosition = "left" }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const { profile } = useUserProfile();
  const { t, i18n } = useTranslation();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login Error:", error);
      }
    }
  };

  const handleLogout = () => signOut(auth);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tarflow - Finanças & Tarefas',
          text: 'Conheça o Tarflow, o app que organiza suas finanças e produtividade! 🌊',
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      alert("Link copiado para a área de transferência!");
    }
  };

  const renderMenuToggle = () => (
    <motion.button 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onToggleSidebar}
      className="bg-white/10 hover:bg-white/20 border border-white/20 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex flex-col justify-center items-center gap-1.5 transition-all shadow-sm shrink-0"
      title="Menu"
    >
      <div className="w-6 h-0.5 bg-white rounded-full" />
      <div className="w-6 h-0.5 bg-white rounded-full" />
      <div className="w-4 h-0.5 bg-white rounded-full self-start ml-2.5 sm:ml-3" />
    </motion.button>
  );

  const renderAuthAction = () => {
    if (user) {
      return (
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 p-2 rounded-xl border border-red-600 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center shadow-sm text-white transition-colors shrink-0"
          title={t("Sair")}
        >
          <LogOut size={20} strokeWidth={2.5} />
        </motion.button>
      );
    }
    return (
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogin}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-xl transition-all bg-white text-[#2C5F7C] hover:bg-white/95 shrink-0 h-11 sm:h-12"
      >
        <LogIn size={20} className="shrink-0" />
        <span className="hidden sm:inline">{t("Entrar")}</span>
      </motion.button>
    );
  };

  return (
    <header className="bg-gradient-to-br from-[#2C5F7C] to-[#1a1a2e] text-white py-4 px-3 sm:py-5 sm:px-6 md:px-8 shrink-0 relative overflow-hidden flex items-center justify-between shadow-xl border-b border-white/10">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
      </div>

      <div className="flex justify-between items-center relative z-10 w-full max-w-7xl mx-auto gap-2 sm:gap-6">
        {/* Left Side */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {sidebarPosition === "left" ? renderMenuToggle() : renderAuthAction()}
          
          <div className="hidden sm:flex items-center gap-3">
             <div className="w-10 h-10 flex justify-center items-center overflow-visible">
               <img src="/tarflowicon.png" alt="Tarflow Logo" className="w-full h-auto object-contain scale-[2]" />
             </div>
             <span className="font-black text-2xl tracking-tight hidden md:block">Tarflow</span>
          </div>
        </div>

        {/* Right Side: Actions & Auth */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Language dropdown */}
          <div className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-1.5 sm:px-3 py-2 rounded-xl border border-white/20 transition-all focus-within:ring-2 focus-within:ring-white/30 h-11 sm:h-12 shrink-0">
            <Globe size={20} className="opacity-70 shrink-0" />
            <select
              value={i18n.language}
              onChange={(e) => i18n.changeLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm font-bold cursor-pointer text-white appearance-none pl-0.5 pr-1 shrink-0"
              title="Idioma / Language"
            >
              <option value="pt" className="text-black font-semibold">PT</option>
              <option value="en" className="text-black font-semibold">EN</option>
              <option value="es" className="text-black font-semibold">ES</option>
              <option value="fr" className="text-black font-semibold">FR</option>
              <option value="de" className="text-black font-semibold">DE</option>
            </select>
          </div>

          {/* Share */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="hidden sm:flex bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/20 h-11 w-11 sm:h-12 sm:w-12 items-center justify-center shadow-sm shrink-0"
            title="Compartilhar"
          >
            <Share2 size={20} />
          </motion.button>
          
          {/* Theme Toggle */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl border border-white/20 h-11 w-11 sm:h-12 sm:w-12 flex items-center justify-center shadow-sm shrink-0"
            title="Trocar Tema"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </motion.button>

          <div className="w-px h-8 bg-white/20 mx-1 hidden sm:block"></div>

          {user && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/10 border border-white/20 shrink-0 min-w-0"
            >
              <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs shadow overflow-hidden shrink-0", 
                profile?.avatar ? "bg-white" : "bg-gradient-to-br from-[#2D73FF] to-[#0537D7]"
              )}>
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="uppercase font-bold">{user.displayName?.[0] || user.email?.[0]}</span>
                )}
              </div>
              <span className="font-bold text-[11px] sm:text-sm max-w-[60px] sm:max-w-[120px] truncate hidden min-[360px]:block">
                {profile?.name || user.displayName || user.email?.split('@')[0]}
              </span>
            </motion.div>
          )}

          {sidebarPosition === "left" ? renderAuthAction() : renderMenuToggle()}
        </div>
      </div>
    </header>
  );
}
