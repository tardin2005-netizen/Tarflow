import React, { useState, useEffect } from "react";
import { ThemeProvider } from "./components/Layout/ThemeContext";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import BottomNavbar from "./components/Layout/BottomNavbar";
import DashboardTab from "./components/Tabs/DashboardTab";
import ExtratosTab from "./components/Tabs/ExtratosTab";
import GoalsTab from "./components/Tabs/GoalsTab";
import TasksTab from "./components/Tabs/TasksTab";
import ProfileTab from "./components/Tabs/ProfileTab";
import AboutTab from "./components/Tabs/AboutTab";
import ContactTab from "./components/Tabs/ContactTab";
import OpenFinanceTab from "./components/Tabs/OpenFinanceTab";
import WelcomeTab from "./components/Tabs/WelcomeTab";
import InvestimentosTab from "./components/Tabs/InvestimentosTab";
import SupermercadoTab from "./components/Tabs/SupermercadoTab";
import { PlusCircle, BarChart2, PieChart, Target, CheckCircle, User, Info, MessageSquare, Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

type TabId = "inicio" | "extratos" | "metas" | "investimentos" | "tarefas" | "perfil" | "sobre" | "contato" | "openfinance" | "welcome" | "supermercado";

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
      case "supermercado": return <SupermercadoTab />;
      case "extratos": return <ExtratosTab />;
      case "metas": return <GoalsTab />;
      case "investimentos": return <InvestimentosTab />;
      case "tarefas": return <TasksTab />;
      case "perfil": return <ProfileTab />;
      case "openfinance": return <OpenFinanceTab />;
      case "sobre": return <AboutTab />;
      case "contato": return <ContactTab />;
      default: return user ? <DashboardTab /> : <WelcomeTab />;
    }
  };

  return (
    <ThemeProvider>
      <div className="fixed inset-0 flex flex-col overflow-hidden transition-colors duration-300 bg-transparent">
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
        
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? (sidebarPosition === "left" ? "md:ml-[300px] md:scale-[0.98] brightness-90" : "md:mr-[300px] md:scale-[0.98] brightness-90") : ""}`}>
          <div className="max-w-[1400px] w-full mx-auto bg-[var(--container-bg)] rounded-none md:rounded-2xl shadow-strong overflow-y-auto overflow-x-hidden flex flex-col flex-1 md:my-4">
            {activeTab !== "welcome" && (
              <Header onToggleSidebar={toggleSidebar} user={user} onLoginSuccess={() => setActiveTab("perfil")} sidebarPosition={sidebarPosition} />
            )}

            <main className={`p-3 sm:p-5 ${activeTab !== "welcome" ? 'pb-28 md:pb-5' : ''}`}>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--success)]"></div>
                </div>
              ) : renderTab()}
            </main>
          </div>
        </div>

        {activeTab !== "welcome" && (
          <BottomNavbar 
            activeTab={activeTab} 
            onTabChange={(tab) => setActiveTab(tab as TabId)} 
            onToggleSidebar={toggleSidebar} 
          />
        )}
      </div>
    </ThemeProvider>
  );
}
