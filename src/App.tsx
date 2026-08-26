import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./components/Layout/ThemeContext";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import BottomNavbar from "./components/Layout/BottomNavbar";
import DashboardTab from "./components/Tabs/DashboardTab";
import GestaoGastosTab, { GastosSubTabId } from "./components/Tabs/GestaoGastosTab";
import ProfileTab from "./components/Tabs/ProfileTab";
import AboutTab from "./components/Tabs/AboutTab";
import ContactTab from "./components/Tabs/ContactTab";
import WelcomeTab from "./components/Tabs/WelcomeTab";
import InvestimentosTab from "./components/Tabs/InvestimentosTab";
import MercadoFinanceiroTab from "./components/Tabs/MercadoFinanceiroTab";
import AIChat from "./components/AI/AIChat";
import { PlusCircle, BarChart2, PieChart, Target, CheckCircle, User, Info, MessageSquare, Building2, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

type TabId = "inicio" | "gastos" | "investimentos" | "mercado" | "perfil" | "sobre" | "contato" | "welcome" | "extratos" | "metas" | "tarefas" | "supermercado";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("inicio");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarPosition, setSidebarPosition] = useState<"left" | "right">(() => {
    return (localStorage.getItem("tarflow-sidebar-pos") as "left" | "right") || "left";
  });
  const [user, loading] = useAuthState(auth);
  const { t } = useTranslation();

  const toggleSidebarPosition = () => {
    const newPos = sidebarPosition === "left" ? "right" : "left";
    setSidebarPosition(newPos);
    localStorage.setItem("tarflow-sidebar-pos", newPos);
  };

  // Redirect to welcome if not logged in
  useEffect(() => {
    if (!loading && !user && activeTab !== "sobre" && activeTab !== "contato") {
      setActiveTab("welcome");
    } else if (!loading && user && activeTab === "welcome") {
      setActiveTab("inicio");
    }
  }, [user, loading, activeTab]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const renderTab = () => {
    switch (activeTab) {
      case "welcome": return <WelcomeTab />;
      case "inicio": return <DashboardTab />;
      case "gastos": return <GestaoGastosTab />;
      case "supermercado": return <GestaoGastosTab initialSubTab="supermercado" />;
      case "extratos": return <GestaoGastosTab initialSubTab="extratos" />;
      case "metas": return <GestaoGastosTab initialSubTab="metas" />;
      case "tarefas": return <GestaoGastosTab initialSubTab="tarefas" />;
      case "investimentos": return <InvestimentosTab />;
      case "mercado": return <MercadoFinanceiroTab />;
      case "perfil": return <ProfileTab />;
      case "sobre": return <AboutTab />;
      case "contato": return <ContactTab />;
      default: return user ? <DashboardTab /> : <WelcomeTab />;
    }
  };

  return (
    <ThemeProvider>
      <div className="fixed inset-0 w-full h-full flex overflow-hidden bg-[var(--container-bg)]">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          activeTab={activeTab}
          sidebarPosition={sidebarPosition}
          onTogglePosition={toggleSidebarPosition}
          onTabChange={(tab) => {
            setActiveTab(tab as TabId);
            setIsSidebarOpen(false);
          }}
        />
        
        <div className={`flex-1 flex flex-col h-full w-full overflow-hidden transition-all duration-300 min-w-0 ${
          activeTab !== "welcome" 
            ? (sidebarPosition === "left" ? "md:pl-[260px] lg:pl-[275px]" : "md:pr-[260px] lg:pr-[275px]") 
            : ""
        }`}>
          <div className="w-full h-full bg-[var(--container-bg)] overflow-y-auto overflow-x-hidden flex flex-col flex-1 min-w-0">
            {activeTab !== "welcome" && (
              <Header 
                onToggleSidebar={toggleSidebar} 
                user={user} 
                onLoginSuccess={() => setActiveTab("perfil")} 
                sidebarPosition={sidebarPosition} 
              />
            )}

            <main className={`w-full min-w-0 flex-1 flex flex-col ${activeTab !== "welcome" ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-28 md:pb-8' : 'p-4'}`}>
              {loading ? (
                <div className="flex justify-center items-center h-64 m-auto">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--success)]"></div>
                </div>
              ) : renderTab()}
            </main>
          </div>
        </div>

        {activeTab !== "welcome" && (
          <>
            <AIChat user={user} />
            <BottomNavbar 
              activeTab={activeTab} 
              onTabChange={(tab) => setActiveTab(tab as TabId)} 
              onToggleSidebar={toggleSidebar} 
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}
