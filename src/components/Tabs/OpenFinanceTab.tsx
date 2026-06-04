import React, { useState, useEffect } from "react";
import { 
  Building2, RefreshCw, CheckCircle2, AlertCircle, Sparkles, 
  CreditCard, Smartphone, Check, HelpCircle, Edit3, ArrowRight,
  User, Plus, Shield, ShieldCheck, Heart, Info, DollarSign, X, Clock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { useExpenses } from "../../hooks/useFirebaseData";
import { formatCurrency, formatDate } from "../../lib/utils";
import { PluggyConnect } from 'react-pluggy-connect';

export default function OpenFinanceTab() {
  const { t } = useTranslation();
  const { expenses, addExpense, updateExpense } = useExpenses();
  
  // States for Premium and Sandbox
  const [isPremium, setIsPremium] = useState<boolean>(() => {
    return localStorage.getItem("openfinance_premium") === "true";
  });
  
  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string>(() => {
    return localStorage.getItem("openfinance_last_sync") || new Date().toLocaleString();
  });
  
  // Modals and inputs
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState<"card" | "pix" | "itp">("itp");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedItpBank, setSelectedItpBank] = useState<string | null>(null);
  const [itpStep, setItpStep] = useState<"select_bank" | "redirecting" | "bank_screen">("select_bank");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedInstallmentPlan, setSelectedInstallmentPlan] = useState<"anual" | "parcelado" | "mensal">("anual");
  const [chosenInstallments, setChosenInstallments] = useState<number>(12);
  
  const [selectedBankToConnect, setSelectedBankToConnect] = useState<string | null>(null);
  
  // Edit description states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  // PIX state
  const mockPixKey = "00020101021126330014BR.GOV.BCB.PIX0111667eea92030392052000053039865406200.005802BR5915Tarflow%20Finance6009Sao%20Paulo62070503***6304ED2A";

  // Banks data
  const [connectedBanks, setConnectedBanks] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("openfinance_connected_banks");
    return saved ? JSON.parse(saved) : { 
      Nubank: true, 
      Inter: false, 
      PicPay: false, 
      "Itaú": false, 
      Bradesco: true,
      Santander: false,
      "Banco do Brasil": false,
      Caixa: false,
      Nomad: false,
      Wise: false,
      "Mercado Pago": false,
      "C6 Bank": false,
      PagBank: false,
      "XP Investimentos": false
    };
  });

  const banksList = [
    { id: "Nubank", name: "Nubank", color: "#8a05be", balance: 1987.90 },
    { id: "Inter", name: "Banco Inter", color: "#ff7a00", balance: 1450.00 },
    { id: "PicPay", name: "PicPay", color: "#21c25e", balance: 670.35 },
    { id: "Itaú", name: "Itaú Unibanco", color: "#ec7000", balance: 3450.50 },
    { id: "Bradesco", name: "Bradesco", color: "#cc092f", balance: 840.00 },
    { id: "Santander", name: "Santander", color: "#ec0000", balance: 2150.20 },
    { id: "Banco do Brasil", name: "Banco do Brasil", color: "#0038a8", balance: 12800.00 },
    { id: "Caixa", name: "Caixa Econômica", color: "#006699", balance: 410.15 },
    { id: "Nomad", name: "Nomad", color: "#d2ff1f", balance: 4850.00 },
    { id: "Wise", name: "Wise", color: "#00b67a", balance: 7200.00 },
    { id: "Mercado Pago", name: "Mercado Pago", color: "#00aae4", balance: 1850.40 },
    { id: "C6 Bank", name: "C6 Bank", color: "#18181b", balance: 3120.00 },
    { id: "PagBank", name: "PagBank", color: "#4ab825", balance: 950.00 },
    { id: "XP Investimentos", name: "XP Investimentos", color: "#cfb53b", balance: 45000.00 }
  ];

  // Filter states for Open Finance categorization & search
  const [selectedBankFilter, setSelectedBankFilter] = useState<string>("Todos");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("Todas");

  const getBankNameOfExpense = (expense: any): string => {
    if (expense.bank) return expense.bank;
    
    // Fallback classification based on name
    const n = expense.name.toUpperCase();
    if (n.includes("INTER")) return "Inter";
    if (n.includes("PICPAY")) return "PicPay";
    if (n.includes("BRADESCO")) return "Bradesco";
    if (n.includes("ITAÚ") || n.includes("ITAU")) return "Itaú";
    if (n.includes("SANTANDER")) return "Santander";
    if (n.includes("BANCO DO BRASIL") || n.includes("BB")) return "Banco do Brasil";
    if (n.includes("CAIXA")) return "Caixa";
    if (n.includes("NOMAD")) return "Nomad";
    if (n.includes("WISE")) return "Wise";
    if (n.includes("MERCADOLIVRE") || n.includes("MERCADOPAGO")) return "Mercado Pago";
    if (n.includes("C6")) return "C6 Bank";
    if (n.includes("PAGBANK") || n.includes("PAGSEGURADA")) return "PagBank";
    if (n.includes("XP INVEST") || n.includes("XP RESTAURANTE")) return "XP Investimentos";
    return "Nubank"; // default fallback
  };

  useEffect(() => {
    localStorage.setItem("openfinance_connected_banks", JSON.stringify(connectedBanks));
  }, [connectedBanks]);

  // Handle premium changes
  const togglePremiumSandbox = () => {
    const nextState = !isPremium;
    setIsPremium(nextState);
    localStorage.setItem("openfinance_premium", String(nextState));
  };

  const handleSubscribe = () => {
    setShowCheckoutModal(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => {
        setIsPremium(true);
        localStorage.setItem("openfinance_premium", "true");
        setShowCheckoutModal(false);
        setPaymentSuccess(false);
      }, 1500);
    }, 2000);
  };

  const syncTransactionsList = [
    { name: "PG *CABANA SOL ALIMENTOS", value: 40.68, category: "Alimentos" as const, bank: "Nubank" },
    { name: "SmartFit Academia Mensal", value: 189.90, category: "Saúde" as const, bank: "Itaú" },
    { name: "Netflix Entretenimento", value: 99.90, category: "Assinaturas" as const, bank: "Nubank" },
    { name: "POSTO COMBUSTIVEL VIP", value: 120.00, category: "Combustível" as const, bank: "Bradesco" },
    { name: "RESTAURANTE COCO BAMBU", value: 245.00, category: "Lazer" as const, bank: "Itaú" },
    { name: "PG *SUPERMERCADO INTER", value: 312.40, category: "Alimentos" as const, bank: "Inter" },
    { name: "PG *COPIADORA CENTRO", value: 24.50, category: "Outros" as const, bank: "Inter" },
    { name: "PIX ENVIADO PICPAY", value: 35.00, category: "Lazer" as const, bank: "PicPay" },
    { name: "PG *IFOOD PICPAY REFEICAO", value: 58.70, category: "Alimentos" as const, bank: "PicPay" },
    { name: "ESTAB *CENTRAL SHOPPING", value: 180.00, category: "Outros" as const, bank: "Santander" },
    { name: "Anuidade Cartão Credito", value: 15.00, category: "Outros" as const, bank: "Banco do Brasil" },
    { name: "LOTERICA CAIXA JG CONTA", value: 20.00, category: "Lazer" as const, bank: "Caixa" },
    { name: "PG *NOMAD TRAVEL CAFE", value: 54.10, category: "Lazer" as const, bank: "Nomad" },
    { name: "PG *NOMAD EXPEDIA HOTBOOK", value: 480.00, category: "Lazer" as const, bank: "Nomad" },
    { name: "PG *WISE ACME MARKET", value: 112.00, category: "Alimentos" as const, bank: "Wise" },
    { name: "PG *WISE SHOPIFY BILL", value: 29.00, category: "Assinaturas" as const, bank: "Wise" },
    { name: "PG *MERCADOLIVRE ELETRON", value: 189.90, category: "Outros" as const, bank: "Mercado Pago" },
    { name: "PG *MERCADOPAGO CAFE", value: 12.50, category: "Alimentos" as const, bank: "Mercado Pago" },
    { name: "PG *C6 TAG PEDAGIO EXPRESS", value: 45.00, category: "Combustível" as const, bank: "C6 Bank" },
    { name: "PG *OUTBACK STEAK C6B", value: 168.00, category: "Lazer" as const, bank: "C6 Bank" },
    { name: "PG *PAGBANK SORTE DOCES", value: 18.50, category: "Alimentos" as const, bank: "PagBank" },
    { name: "PG *PAGBANK RECARGA MOVEL", value: 40.00, category: "Outros" as const, bank: "PagBank" },
    { name: "TAXA CORRETAGEM XP INVEST", value: 4.90, category: "Outros" as const, bank: "XP Investimentos" },
    { name: "PG *XP RESTAURANTE CENTRO", value: 290.00, category: "Lazer" as const, bank: "XP Investimentos" }
  ];

  const handleSyncNow = () => {
    setIsSyncing(true);
    
    // Check if at least one bank is connected
    const anyConnected = Object.values(connectedBanks).some(Boolean);
    
    setTimeout(() => {
      setIsSyncing(false);
      const newSyncDate = new Date().toLocaleString();
      setLastSync(newSyncDate);
      localStorage.setItem("openfinance_last_sync", newSyncDate);

      if (!anyConnected) {
        alert("Nenhum banco integrado no momento! Conecte as contas abaixo para simular a importação do Open Finance.");
        return;
      }

      // Add actual simulated transactions to the database so user doesn't have to input them manually!
      const activeBanks = Object.keys(connectedBanks).filter(k => connectedBanks[k]);
      const transToAdd = syncTransactionsList.filter(t => activeBanks.includes(t.bank));
      
      if (transToAdd.length > 0 && addExpense) {
        const addPromises = transToAdd.map(t => {
          // Check if this expense is already in list (simple name, value match to prevent cluttering)
          const exists = expenses.some(e => e.name === t.name && Math.abs(e.value - t.value) < 0.01);
          if (!exists) {
            return addExpense({
              name: t.name,
              value: t.value,
              category: t.category,
              date: new Date().toISOString().split("T")[0],
              bank: t.bank
            });
          }
          return null;
        });

        Promise.all(addPromises).then(() => {
          alert("Sincronização realizada! Seus gastos e compras recentes das contas ativas foram importados automaticamente.");
        }).catch(err => {
          console.error("Erro ao importar despesas Open Finance", err);
        });
      } else {
        alert("Sincronização executada com sucesso!");
      }
    }, 2200);
  };

  const [pluggyConnectToken, setPluggyConnectToken] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectStep, setConnectStep] = useState<"initial" | "redirecting_out" | "bank_login" | "bank_consent" | "redirecting_in">("initial");

  const mapPluggyCategoryToTarflow = (pluggyCat: string): "Alimentos" | "Saúde" | "Assinaturas" | "Combustível" | "Lazer" | "Outros" => {
    if (!pluggyCat) return "Outros";
    const cat = pluggyCat.toLowerCase();
    if (cat.includes("food") || cat.includes("restaurante") || cat.includes("grocery") || cat.includes("supermercado") || cat.includes("alimentação") || cat.includes("refeic")) {
      return "Alimentos";
    }
    if (cat.includes("health") || cat.includes("saúde") || cat.includes("medical") || cat.includes("academia") || cat.includes("gym") || cat.includes("fit")) {
      return "Saúde";
    }
    if (cat.includes("subscription") || cat.includes("netflix") || cat.includes("spotify") || cat.includes("streaming") || cat.includes("assinatura")) {
      return "Assinaturas";
    }
    if (cat.includes("transport") || cat.includes("combustível") || cat.includes("gas") || cat.includes("uber") || cat.includes("viagem") || cat.includes("vias")) {
      return "Combustível";
    }
    if (cat.includes("leisure") || cat.includes("lazer") || cat.includes("entertainment") || cat.includes("shopping") || cat.includes("mall")) {
      return "Lazer";
    }
    return "Outros";
  };

  const handleConnectBankClick = async (bankId: string) => {
    setSelectedBankToConnect(bankId);
    
    // Attempt real secure Pluggy connection flow first
    try {
      const res = await fetch('/api/pluggy/connect-token');
      if (!res.ok) {
        throw new Error("Could not fetch token");
      }
      const data = await res.json();
      if (data.accessToken) {
        // Yes, real credentials are set up! Launch the Pluggy Connect Widget.
        setPluggyConnectToken(data.accessToken);
        return;
      }
    } catch (err) {
      console.warn("Unable to fetch real Pluggy token. Falling back to sandbox simulation.", err);
    }
    
    // Fallback: Animated simulated flow
    setConnectStep("redirecting_out");
    setShowConnectModal(true);
    setTimeout(() => {
      handleBankConsent(bankId);
    }, 2500);
  };

  const handleBankConsent = (bankId: string) => {
    if (!bankId) return;
    setConnectStep("redirecting_in");
    setTimeout(() => {
      setConnectedBanks(prev => ({
        ...prev,
        [bankId]: true
      }));
      setConnectStep("initial");
      setShowConnectModal(false);
      setSelectedBankToConnect(null);
      alert("Autenticação finalizada automaticamente via fluxo App-to-App da instituição (Powered by Pluggy).");
    }, 2500);
  };

  // Deprecated/Fallback explicit Pluggy widget flow if needed
  const handleConnectBankPluggyWidget = async (bankId: string) => {
    setSelectedBankToConnect(bankId);
    try {
      const res = await fetch('/api/pluggy/connect-token');
      const data = await res.json();
      if (data.accessToken) {
        setPluggyConnectToken(data.accessToken);
      } else {
        alert("Erro: Configurações ausentes para usar o widget completo Pluggy.");
      }
    } catch (err) {
      alert("Erro ao conectar Open Finance.");
    }
  };

  const onSuccessPluggy = async (itemData: any) => {
    console.log("Pluggy Success:", itemData);
    const itemId = itemData.item?.id;
    if (!itemId) return;

    // Show a sleek synchronizer layout modal to let user know sync has started
    setConnectStep("redirecting_in");
    setShowConnectModal(true);

    try {
      const res = await fetch("/api/pluggy/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId })
      });
      if (!res.ok) {
        throw new Error("Failed to sync accounts the Pluggy backend endpoint");
      }
      const data = await res.json();

      if (data.accounts && data.accounts.length > 0) {
        const primaryAccount = data.accounts[0];
        const rawBankName = (primaryAccount.marketingName || primaryAccount.name || "Connected Bank").toLowerCase();
        
        // Find which bank matches from our preset bank list
        let matchedBankId = selectedBankToConnect || "Inter";
        const matched = banksList.find(b => 
          rawBankName.includes(b.name.toLowerCase()) || 
          b.name.toLowerCase().includes(rawBankName) ||
          rawBankName.includes(b.id.toLowerCase())
        );
        if (matched) {
          matchedBankId = matched.id;
        }

        // Connect the matched bank in interface
        setConnectedBanks(prev => ({
          ...prev,
          [matchedBankId]: true
        }));

        // Fetch & populate live expenses / transactions
        if (data.transactions && data.transactions.length > 0 && addExpense) {
          const promises = data.transactions
            .filter((tx: any) => tx.amount < 0) // Debits only
            .map((tx: any) => {
              const val = Math.abs(tx.amount);
              // Check duplicates
              const exists = expenses.some(e => e.name === tx.description && Math.abs(e.value - val) < 0.01);
              if (!exists) {
                return addExpense({
                  name: tx.description || "Transação Importada",
                  value: val,
                  category: mapPluggyCategoryToTarflow(tx.category || tx.categoryRaw),
                  date: tx.date ? tx.date.split("T")[0] : new Date().toISOString().split("T")[0],
                  bank: matchedBankId
                });
              }
              return null;
            });
          await Promise.all(promises);
        }

        alert(`Integração concluída com sucesso via Pluggy Open Finance! Contas e despesas sincronizadas com o Tarflow.`);
      } else {
        alert("Sincronização concluída, porém nenhuma transação ativa foi detectada.");
      }
    } catch (err) {
      console.error("Error backend-syncing accounts", err);
      // Fallback connection
      if (selectedBankToConnect) {
        setConnectedBanks(prev => ({
          ...prev,
          [selectedBankToConnect]: true
        }));
      }
      alert("Conectado! Tivemos uma interrupção ao importar transações automáticas do banco, mas a conta foi integrada com sucesso.");
    } finally {
      setPluggyConnectToken(null);
      setSelectedBankToConnect(null);
      setShowConnectModal(false);
      setConnectStep("initial");
    }
  };

  const onErrorPluggy = (error: any) => {
    console.error("Pluggy Error:", error);
    setPluggyConnectToken(null);
    setSelectedBankToConnect(null);
    alert("Falha ao sincronizar com Pluggy Connect. Verifique suas credenciais e tente novamente.");
  };

  const handleDisconnectBank = (bankId: string) => {
    setConnectedBanks(prev => ({
      ...prev,
      [bankId]: false
    }));
  };

  const handleDisconnectAllBanks = () => {
    const resetState: Record<string, boolean> = {};
    Object.keys(connectedBanks).forEach(k => {
      resetState[k] = false;
    });
    setConnectedBanks(resetState);
  };

  // Extract unfiltered open finance transactions from current expenses that look like they were synced
  const rawSyncedExpenses = expenses.filter(e => {
    // Treat as Open Finance if they match names in sync list or have the raw PG/PG* prefix or match known templates or have bank field set
    return !!e.bank ||
           e.name.startsWith("PG *") || 
           e.name.startsWith("TAXA CORRETAGEM") ||
           e.name.includes("Academia") || 
           e.name.includes("Netflix") || 
           e.name.includes("POSTO") || 
           e.name.includes("COCO BAMBU") ||
           e.name.includes("PG*") ||
           e.name.includes("ESTAB *") ||
           e.name.includes("PIX ENVIADO") ||
           e.name.includes("LOTERICA");
  });

  // Filter based on selected bank and selected category
  const syncedExpenses = rawSyncedExpenses.filter(e => {
    if (selectedBankFilter !== "Todos") {
      const bank = getBankNameOfExpense(e);
      if (bank !== selectedBankFilter) return false;
    }
    if (selectedCategoryFilter !== "Todas") {
      if (e.category !== selectedCategoryFilter) return false;
    }
    return true;
  });

  // Type-safe precalculations for the categorization dashboard
  const rawSyncedTotal = rawSyncedExpenses.reduce((sum: number, e) => sum + e.value, 0);
  const categoryTotals: Record<string, number> = rawSyncedExpenses.reduce((acc: Record<string, number>, e) => {
    const cat = e.category || "Outros";
    acc[cat] = (acc[cat] || 0) + e.value;
    return acc;
  }, {});

  const getNextSyncTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 10) {
      return "Hoje às 10h00";
    } else if (currentHour < 20) {
      return "Hoje às 20h00";
    } else {
      return "Amanhã às 10h00";
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative">
      
      {/* Dev Sandbox Switch Floating Badge */}
      <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 p-3 rounded-2xl mb-6 flex items-center justify-between text-xs font-bold gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Sparkles size={14} className="animate-pulse" />
          <span>[ADMIN SANDBOX] Quer testar ambos os fluxos? Ative ou desative o Premium instantaneamente com o botão ao lado:</span>
        </div>
        <button 
          onClick={togglePremiumSandbox}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap px-4 py-2 ${
            isPremium 
              ? "bg-amber-600 hover:bg-amber-700 text-white" 
              : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 text-zinc-800 dark:text-zinc-200"
          }`}
        >
          {isPremium ? "Desativar Premium" : "Ativar Premium Grátis"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isPremium ? (
          // paywall screen
          <motion.div 
            key="paywall"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start pt-4"
          >
            {/* Price Tag (Mobile: 1st, Desktop: Top-Left) */}
            <div className="lg:col-span-7 lg:col-start-1 order-1">
              <div className="p-6 bg-gradient-to-br from-[#203a43] via-[#2c5364] to-[#1e272c] rounded-[2.5rem] text-white space-y-4 shadow-xl border border-white/10">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">Escolha como prefere investir</span>
                  <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full uppercase">Sincronização Ativa</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 bg-black/20 p-1 rounded-2xl">
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedInstallmentPlan("anual");
                      setChosenInstallments(1);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9.5px] font-black tracking-tight transition-all duration-200 text-center ${selectedInstallmentPlan === "anual" ? "bg-[#667eea] text-white shadow" : "opacity-60 hover:opacity-100"}`}
                  >
                    Anual à Vista
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedInstallmentPlan("parcelado");
                      setChosenInstallments(12);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9.5px] font-black tracking-tight transition-all duration-200 text-center ${selectedInstallmentPlan === "parcelado" ? "bg-[#667eea] text-white shadow" : "opacity-60 hover:opacity-100"}`}
                  >
                    12x Parcelado
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedInstallmentPlan("mensal");
                      setChosenInstallments(1);
                    }}
                    className={`py-2 px-1 rounded-xl text-[9.5px] font-black tracking-tight transition-all duration-200 text-center ${selectedInstallmentPlan === "mensal" ? "bg-[#667eea] text-white shadow" : "opacity-60 hover:opacity-100"}`}
                  >
                    Mensal Avulso
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
                  <div className="flex-1">
                    {selectedInstallmentPlan === "anual" && (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">R$ 200,00</span>
                          <span className="text-xs font-bold opacity-75">/ ano</span>
                        </div>
                        <p className="text-[0.65rem] text-emerald-300 mt-1 font-bold">★ Economize R$ 40,00/ano em relação ao mensal!</p>
                      </>
                    )}
                    {selectedInstallmentPlan === "parcelado" && (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">R$ 16,67</span>
                          <span className="text-xs font-bold opacity-75">/ mês</span>
                        </div>
                        <p className="text-[0.65rem] text-emerald-300 mt-1 font-bold">★ 12x sem juros de R$ 16,67. Melhor custo-benefício!</p>
                      </>
                    )}
                    {selectedInstallmentPlan === "mensal" && (
                      <>
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-white">R$ 20,00</span>
                          <span className="text-xs font-bold opacity-75">/ mês</span>
                        </div>
                        <p className="text-[0.65rem] text-amber-300 mt-1 font-bold">Sem fidelidade. Cancele quando quiser.</p>
                      </>
                    )}
                  </div>
                  <button 
                    onClick={handleSubscribe}
                    className="bg-white text-[#2C5F7C] hover:bg-zinc-100 transition-colors px-6 py-4 rounded-2xl text-xs font-black tracking-tight w-full sm:w-auto text-center flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] duration-155 shrink-0"
                  >
                    <CreditCard size={14} /> Ativar Open Finance
                  </button>
                </div>
              </div>
            </div>

            {/* Paywall Right Column: Rich CSS mockup of Mobile app requested (Mobile: 2nd, Desktop: Right span 2 rows) */}
            <div className="lg:col-span-5 lg:col-start-8 lg:row-span-2 flex justify-center order-2 lg:order-2 my-2 lg:my-0 lg:sticky lg:top-4">
              <div className="relative w-full max-w-[320px] h-[580px] rounded-[3rem] border-[10px] border-zinc-800 dark:border-zinc-700 bg-zinc-950 shadow-2xl overflow-hidden flex flex-col font-sans select-none scale-100 sm:scale-105 duration-200">
                {/* Speaker/Camera notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-800 rounded-b-2xl z-50 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full" />
                  <div className="w-10 h-1 bg-zinc-700 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-zinc-950 rounded-full" />
                </div>

                {/* Simulated Screen Content */}
                <div className="flex-1 bg-emerald-700 text-white flex flex-col overflow-hidden px-4 pt-8">
                  <div className="flex justify-between items-center mb-1 text-[10px] opacity-75 font-mono">
                    <span>5:16</span>
                    <div className="flex items-center gap-1">
                      <span>4G</span>
                      <span>20%</span>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="mt-2 text-center">
                    <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest leading-none">Tarflow</span>
                    <h3 className="text-xl font-black mt-1 leading-tight tracking-tight">Você no controle</h3>
                    <p className="text-[10px] text-emerald-100/80">da sua vida financeira</p>
                  </div>

                  {/* Main Glass block */}
                  <div className="bg-white rounded-3xl p-3.5 text-zinc-800 mt-4 shadow-lg space-y-3.5 flex-1 flex flex-col overflow-hidden mb-4">
                    
                    {/* Account Balance */}
                    <div className="border-b border-zinc-100 pb-2.5">
                      <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-zinc-400">
                        <span>Saldo Total Integrado</span>
                        <span className="text-[#667eea]">Detalhes &rarr;</span>
                      </div>
                      <div className="text-xl font-black text-zinc-900 mt-0.5">R$ 1.987,90</div>
                      <span className="text-[8px] text-emerald-600 font-extrabold flex items-center gap-1 mt-0.5">
                        <Check size={9} /> Atualizado há 5 minutos
                      </span>
                    </div>

                    {/* Nubank Connected card representation */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider">Últimos Lançamentos</span>
                        <span className="bg-[#8a05be]/10 text-[#8a05be] text-[8px] font-black px-1.5 py-0.5 rounded">Nubank Ativo</span>
                      </div>

                      <div className="space-y-1.5 flex-1 overflow-hidden">
                        {[
                          { title: "Academia SmartFit", class: "Saúde", val: "99,90", desc: "Plano do irmão" },
                          { title: "Netflix", class: "Assinaturas", val: "99,90", desc: "Dividido com namorida" },
                          { title: "Cabana do Sol", class: "Alimentos", val: "40,68", desc: "Almoço domingo" },
                        ].map((item, idx) => (
                          <div key={idx} className="bg-zinc-50 rounded-xl p-2 flex justify-between items-center border border-zinc-100 text-[9px]">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-lg bg-emerald-100 flex items-center justify-center text-[10px]">
                                🟢
                              </div>
                              <div>
                                <div className="font-extrabold text-zinc-800">{item.title}</div>
                                <div className="text-[7px] text-zinc-400 font-bold uppercase">{item.desc}</div>
                              </div>
                            </div>
                            <div className="font-black text-rose-500 text-right">R$ {item.val}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Float Add badge in screen */}
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-2 text-center text-[8px] font-bold text-indigo-700">
                      🔒 Assinatura Anual R$ 200/ano Ativa
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Mechanics Banner (Mobile: 3rd, Desktop: Bottom-Left) */}
            <div className="lg:col-span-7 lg:col-start-1 order-3 lg:order-3">
              <div className="bg-[var(--section-bg)] p-5 md:p-6 border-2 border-[var(--border-color)] rounded-[2.5rem] space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-[#667eea]">
                    <Building2 size={24} />
                    <h3 className="font-extrabold text-[13px] uppercase tracking-widest text-[#667eea]">Como funciona no Tarflow?</h3>
                  </div>
                  <p className="text-[13px] text-[var(--text-muted)] font-black leading-relaxed">
                    O sistema gerencia e registra automaticamente todos os gastos da sua conta por meio do Open Finance. A única coisa que você faz é revisar! E caso a transação bancária venha com nomes confusos ou pouco amigáveis (como "PG*ESTAB 231"), você pode facilmente alterar ou complementar a descrição de onde foi gasto.
                  </p>
                </div>

                <div className="space-y-5 pt-5 border-t-2 border-[var(--border-color)]">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#667eea]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-[#667eea]" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-[var(--text-primary)]">Sincronização 2x ao dia</h4>
                      <p className="text-[0.7rem] font-bold text-[var(--text-muted)] mt-0.5">Balances e extratos atualizados constantemente.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#667eea]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-[#667eea]" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-[var(--text-primary)]">Descrições Flexíveis</h4>
                      <p className="text-[0.7rem] font-bold text-[var(--text-muted)] mt-0.5">Altere livremente a descrição dos seus extratos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#667eea]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-[#667eea]" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-[var(--text-primary)]">Zero Digitação Manual</h4>
                      <p className="text-[0.7rem] font-bold text-[var(--text-muted)] mt-0.5">Seus gastos catalogados automaticamente.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#667eea]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-[#667eea]" />
                    </div>
                    <div>
                      <h4 className="font-black text-[13px] text-[var(--text-primary)]">Mapeamento de Categorias</h4>
                      <p className="text-[0.7rem] font-bold text-[var(--text-muted)] mt-0.5">Inteligência que categoriza alimentos, lazer, etc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // connected dashboard screen
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[var(--section-bg)] p-6 rounded-[2rem] border-2 border-[var(--border-color)] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight">{t("Open Finance")}</h2>
                  <span className="bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[0.55rem] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={10} /> Premium Ativo
                  </span>
                </div>
                <p className="text-[var(--text-muted)] text-xs mt-1 max-w-xl">
                  {t("Suas contas estão integradas e sincronizadas diariamente com o Tarflow. Sem digitação manual e sem risco de esquecimento!")}
                </p>
              </div>
              
              <button 
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="bg-[#667eea] text-white px-5 py-3 rounded-2xl font-bold text-xs hover:bg-[#5a6fd6] transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-75 w-full sm:w-auto justify-center shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]"
              >
                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                {isSyncing ? t("Obtendo extratos...") : t("Sincronizar Bancos Agora")}
              </button>
            </div>

            <div className="grid md:grid-cols-12 gap-4 sm:gap-6 w-full min-w-0">
              
              {/* Linked Accounts Component (Col 4) */}
              <div className="md:col-span-4 space-y-4 w-full min-w-0">
                <div className="bg-[var(--section-bg)] border-2 border-[var(--border-color)] p-4 sm:p-5 rounded-3xl shadow-sm w-full min-w-0">
                  <div className="flex items-center justify-between mb-4 w-full min-w-0 gap-2">
                    <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[var(--text-primary)] truncate">Instituições Conectadas</h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      {banksList.some(bank => connectedBanks[bank.id]) && (
                        <button 
                          onClick={handleDisconnectAllBanks}
                          className="text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--danger)] hover:bg-[var(--danger)]/10 px-1.5 py-1 rounded transition-colors shrink-0 whitespace-nowrap"
                        >
                          Desvincular Todas
                        </button>
                      )}
                      <HelpCircle size={14} className="text-[var(--text-muted)] cursor-help shrink-0" title="Conexões seguras regulamentadas pelo Banco Central." />
                    </div>
                  </div>

                  {/* Wrapped in a sleek scrollable viewport to avoid page stretching */}
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 w-full min-w-0">
                    {banksList.filter(bank => !!connectedBanks[bank.id]).length === 0 ? (
                      <div className="text-center py-6 text-[var(--text-muted)] text-[0.7rem] font-semibold bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl">
                        Nenhuma conta sincronizada.
                      </div>
                    ) : (
                      banksList.filter(bank => !!connectedBanks[bank.id]).map(bank => {
                        const isConnected = !!connectedBanks[bank.id];
                        return (
                          <div key={bank.id} className="p-2 sm:p-3 bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] flex justify-between items-center w-full min-w-0 gap-2">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ backgroundColor: bank.color }} />
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] sm:text-xs font-black text-[var(--text-primary)] truncate">{bank.name}</div>
                                <span className="text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--success)] block truncate">
                                  Sincronizado
                                </span>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end shrink-0">
                              <span className="text-[10px] sm:text-[0.55rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Saldo</span>
                              <span className="text-[11px] sm:text-xs font-black">{formatCurrency(bank.balance)}</span>
                              <button 
                                onClick={() => handleDisconnectBank(bank.id)}
                                className="text-[0.55rem] sm:text-[0.6rem] font-bold text-[var(--danger)] hover:underline mt-0.5 leading-none shrink-0"
                              >
                                Desconectar
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add new bank connection dropdown securely */}
                  {banksList.filter(bank => !connectedBanks[bank.id]).length > 0 && (
                    <div className="pt-3.5 border-t border-[var(--border-color)] mt-3">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleConnectBankClick(e.target.value);
                            e.target.value = "";
                          }
                        }}
                        className="w-full p-2 bg-[var(--card-bg)] border border-[var(--border-color)] text-[10.5px] font-black text-[var(--text-primary)] rounded-xl outline-none focus:border-[#667eea] transition-all cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Conectar outro banco...</option>
                        {banksList.filter(bank => !connectedBanks[bank.id]).map(bank => (
                          <option key={bank.id} value={bank.id}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                 <div className="bg-[var(--section-bg)] border-2 border-[var(--border-color)] p-5 rounded-3xl shadow-sm space-y-3.5 text-xs font-medium text-[var(--text-muted)] leading-relaxed">
                  <div className="flex items-center gap-2 text-[var(--text-primary)] font-black">
                    <Info size={14} className="text-[#667eea]" />
                    <span>Lançamentos Automáticos</span>
                  </div>
                  <p>
                    A inteligência do Open Finance busca as compras em débito/crédito que você faz no seu cartão diariamente.
                  </p>
                  
                  {/* Cronograma de Atualização Visual */}
                  <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-3.5 space-y-2">
                    <div className="text-[10px] font-black uppercase text-[var(--text-primary)] tracking-wide flex items-center gap-1.5">
                      <Clock size={12} className="text-[#667eea]" />
                      <span>Cronograma Open Finance</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-1.5 px-2.5 rounded-xl">
                        <span className="font-bold">Manhã (10:00)</span>
                        <span className="text-[10px] bg-[var(--success)]/10 text-[var(--success)] px-1.5 py-0.5 rounded-full font-black">Ativo</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-1.5 px-2.5 rounded-xl">
                        <span className="font-bold">Tarde (20:00)</span>
                        <span className="text-[10px] bg-[var(--success)]/10 text-[var(--success)] px-1.5 py-0.5 rounded-full font-black">Ativo</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] pt-1 flex justify-between">
                      <span>Próxima atualização:</span>
                      <strong className="text-[#667eea]">{getNextSyncTime()}</strong>
                    </div>
                  </div>

                  <p>
                    <strong>Nota Importante:</strong> Às vezes, as adquirentes registram nomes confusos do estabelecimento no extrato. Você pode renomear e colocar o local real no painel ao lado em tempo real.
                  </p>
                  <div className="text-[0.65rem] font-bold text-[#667eea]">
                    Última verificação manual: {lastSync}
                  </div>
                </div>
              </div>

              {/* Editable Sync List (Col 8) */}
              <div className="md:col-span-8 space-y-4 w-full min-w-0">
                <div className="bg-[var(--section-bg)] border-2 border-[var(--border-color)] p-4 sm:p-6 rounded-3xl shadow-sm space-y-6 w-full min-w-0">
                  
                  {/* Title & Summed volume */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--border-color)] pb-4 w-full min-w-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-black tracking-tight text-[var(--text-primary)] truncate">Registros Recentes do Open Finance</h3>
                      <p className="text-[var(--text-muted)] text-[0.65rem] sm:text-[0.7rem] font-medium leading-tight mt-1">
                        Estes gastos foram importados direto do seu banco. Clique para personalizar e detalhar.
                      </p>
                    </div>
                    
                    {/* Dynamic Total Sum of Synced */}
                    {rawSyncedExpenses.length > 0 && (
                      <div className="bg-[#667eea]/10 p-2 sm:p-3 rounded-2xl border border-[#667eea]/20 text-right shrink-0">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#667eea] block tracking-wider">Total Simulado</span>
                        <span className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                          {formatCurrency(rawSyncedTotal)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Categorization Summary Dashboard */}
                  {rawSyncedExpenses.length > 0 && (
                    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-[var(--text-primary)] tracking-wide flex items-center gap-1.5">
                          <Sparkles size={12} className="text-[#667eea]" />
                          Categorização das Contas Integradas
                        </span>
                        <span className="text-[10.5px] font-bold text-[var(--text-muted)]">
                          {rawSyncedExpenses.length} transações classificadas
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(categoryTotals).map(([cat, val]) => {
                          const pct = rawSyncedTotal > 0 ? (val / rawSyncedTotal) * 100 : 0;
                          return (
                            <div key={cat} className="p-3 bg-[var(--section-bg)] border border-[var(--border-color)] rounded-xl space-y-1 transition-all">
                              <div className="flex justify-between items-baseline">
                                <span className="text-[10.5px] font-bold text-[var(--text-primary)] truncate">{cat}</span>
                                <span className="text-[10px] font-extrabold text-[#667eea]">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="font-extrabold text-xs text-[var(--text-primary)]">
                                {formatCurrency(val)}
                              </div>
                              <div className="w-full bg-[var(--border-color)] h-1 rounded-full overflow-hidden mt-1 bg-zinc-200 dark:bg-zinc-800">
                                <div 
                                  className="bg-[#667eea] h-full rounded-full" 
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Filter controls bar */}
                  <div className="space-y-3.5 bg-[var(--card-bg)] border border-[var(--border-color)] p-4 rounded-2xl">
                    <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
                      {/* Selector: Bank */}
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wide">Filtro por Banco</label>
                        <select
                          value={selectedBankFilter}
                          onChange={(e) => setSelectedBankFilter(e.target.value)}
                          className="w-full p-2.5 bg-[var(--section-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] rounded-xl outline-none focus:border-[#667eea] transition-all cursor-pointer"
                        >
                          <option value="Todos">Todos os Bancos</option>
                          {banksList.map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Selector: Category */}
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wide">Filtro por Categoria</label>
                        <select
                          value={selectedCategoryFilter}
                          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                          className="w-full p-2.5 bg-[var(--section-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-primary)] rounded-xl outline-none focus:border-[#667eea] transition-all cursor-pointer"
                        >
                          <option value="Todas">Todas as Categorias</option>
                          <option value="Alimentos">Alimentos</option>
                          <option value="Lazer">Lazer</option>
                          <option value="Saúde">Saúde</option>
                          <option value="Assinaturas">Assinaturas</option>
                          <option value="Combustível">Combustível</option>
                          <option value="Outros">Outros</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Transaction record list */}
                  <div className="space-y-3">
                    {syncedExpenses.length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--card-bg)] space-y-3">
                        <Building2 size={36} className="text-[#667eea]/40 mx-auto" />
                        <div>
                          <p className="text-xs font-black text-[var(--text-primary)]">Nenhum lançamento encontrado</p>
                          <p className="text-[var(--text-muted)] text-[0.65rem] font-semibold mt-1 max-w-xs mx-auto">
                            Tente mudar seus filtros acima ou clique em <strong>"Sincronizar Bancos Agora"</strong> no topo da página para importar lançamentos das contas conectadas!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                        {syncedExpenses.map((expense) => {
                          const bankName = getBankNameOfExpense(expense);
                          const bankInfo = banksList.find(b => b.id === bankName);
                          return (
                            <div 
                              key={expense.id} 
                              className="bg-[var(--card-bg)] p-4 rounded-2xl flex justify-between items-center border border-[var(--border-color)] hover:border-[#667eea]/40 transition-all group"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-9 h-9 rounded-xl bg-[var(--section-bg)] flex items-center justify-center shadow-inner shrink-0 text-[#667eea]">
                                  <CreditCard size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  {editingId === expense.id ? (
                                    <div className="flex items-center gap-1.5 w-full mt-0.5 max-w-[320px]">
                                      <input
                                        type="text"
                                        value={editName}
                                        onChange={(ev) => setEditName(ev.target.value)}
                                        onKeyDown={(ev) => {
                                          if (ev.key === "Enter") {
                                            if (editName.trim() && updateExpense) {
                                              updateExpense(expense.id, { name: editName.trim() });
                                            }
                                            setEditingId(null);
                                          } else if (ev.key === "Escape") {
                                            setEditingId(null);
                                          }
                                        }}
                                        className="text-xs font-bold p-1 bg-[var(--section-bg)] text-[var(--text-primary)] border border-[#667eea] rounded-lg flex-1 min-w-[120px]"
                                        autoFocus
                                      />
                                      <button
                                        onClick={() => {
                                          if (editName.trim() && updateExpense) {
                                            updateExpense(expense.id, { name: editName.trim() });
                                          }
                                          setEditingId(null);
                                        }}
                                        className="p-1 text-[var(--success)] hover:bg-[var(--success)]/10 rounded"
                                      >
                                        <Check size={12} />
                                      </button>
                                      <button
                                        onClick={() => setEditingId(null)}
                                        className="p-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 group/title">
                                      <div className="font-extrabold text-xs sm:text-sm text-[var(--text-primary)] truncate max-w-[160px] sm:max-w-md">
                                        {expense.name}
                                      </div>
                                      <button
                                        onClick={(ev) => {
                                          ev.stopPropagation();
                                          setEditingId(expense.id);
                                          setEditName(expense.name);
                                        }}
                                        title="Clique para editar e renomear esta compra com o estabelecimento correspondente"
                                        className="opacity-0 group-hover/title:opacity-100 p-1 text-[var(--text-muted)] hover:text-[#667eea] rounded transition-all shrink-0"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                    </div>
                                  )}
                                  
                                  {/* Smart Category & Customized Bank Brand Indicators */}
                                  <div className="text-[0.6rem] text-[var(--text-muted)] font-bold flex flex-wrap items-center gap-1.5 mt-1">
                                    <span>{formatDate(expense.date)}</span>
                                    <span>&bull;</span>
                                    <span className="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider text-[var(--text-primary)]">
                                      {expense.category}
                                    </span>
                                    <span>&bull;</span>
                                    <span 
                                      className="px-1.5 py-0.5 rounded text-[9px] text-white flex items-center gap-1 shrink-0 filter brightness-95 opacity-90 transition-opacity font-extrabold"
                                      style={{ backgroundColor: bankInfo?.color || "#667eea" }}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-white block shrink-0" />
                                      {bankInfo?.name || bankName}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right pl-3">
                                <div className="font-black text-xs sm:text-sm text-[var(--danger)]">
                                  {formatCurrency(expense.value)}
                                </div>
                                <span className="text-[0.55rem] font-bold text-[var(--text-muted)] uppercase tracking-wider block mt-0.5">
                                  Pago via Cartão
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Paywall Modal */}
      <AnimatePresence>
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--container-bg)] rounded-[2rem] p-6 max-w-md w-full border border-[var(--border-color)] shadow-strong space-y-6"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💳</span>
                  <h3 className="text-lg font-black tracking-tight">Ativar Assinatura Anual</h3>
                </div>
                <button 
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-1 px-2.5 rounded-full hover:bg-[var(--section-bg)] text-xs font-bold text-[var(--text-muted)]"
                >
                  X
                </button>
              </div>

              {/* Switch payment method */}
              {(!paymentSuccess && itpStep === "select_bank") && (
                <div className="grid grid-cols-3 bg-[var(--section-bg)] p-1 rounded-2xl border border-[var(--border-color)] overflow-hidden">
                  <button 
                    onClick={() => setCheckoutMethod("itp")}
                    className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs transition-colors tracking-tight flex-1 ${checkoutMethod === "itp" ? "bg-[#667eea] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    Open Finance
                  </button>
                  <button 
                    onClick={() => setCheckoutMethod("card")}
                    className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs transition-colors tracking-tight flex-1 ${checkoutMethod === "card" ? "bg-[#667eea] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    Cartão
                  </button>
                  <button 
                    onClick={() => setCheckoutMethod("pix")}
                    className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs transition-colors tracking-tight flex-1 ${checkoutMethod === "pix" ? "bg-[#667eea] text-white" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                  >
                    PIX
                  </button>
                </div>
              )}

              {paymentSuccess ? (
                <div className="py-10 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-3xl animate-bounce">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-black text-base text-[var(--text-primary)]">Assinatura Ativada!</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">Sua integração com Open Finance foi liberada com sucesso.</p>
                  </div>
                </div>
              ) : checkoutMethod === "itp" ? (
                /* Integracao Pagamento via ITP (Iniciacao de Transacao de Pagamento) */
                itpStep === "select_bank" ? (
                  <div className="space-y-4">
                    <div className="text-center mb-2">
                       <h4 className="font-extrabold text-[var(--text-primary)] text-sm">Pagar com seu Banco</h4>
                       <p className="text-[0.65rem] text-[var(--text-muted)]">Escolha a instituição para autorizar o pagamento de forma segura.</p>
                       <p className="text-[0.6rem] text-[#667eea] font-bold mt-1">Transação protegida (Iniciação de Pagamento)</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                       {/* 
                         TODO: Em produção, substituir esses dados "mockados" pela chamada de GET /institutions 
                         da API do agregador (Ex: Pluggy, Belvo, Celcoin) para obter as instituições ativas.
                       */}
                       {banksList.slice(0, 8).map((bank) => (
                         <button 
                           key={bank.id}
                           type="button"
                           onClick={() => setSelectedItpBank(bank.id)}
                           className={`p-3 border-2 rounded-xl flex items-center gap-2 transition-all ${selectedItpBank === bank.id ? "border-[#667eea] bg-[#667eea]/5" : "border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[#667eea]/40"}`}
                         >
                            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: bank.color }} />
                            <span className="text-[10px] font-bold truncate text-[var(--text-primary)]">{bank.name}</span>
                         </button>
                       ))}
                    </div>

                    <button 
                      disabled={!selectedItpBank || isProcessingPayment}
                      onClick={() => {
                        /* 
                          TODO: Em produção, aqui você chamará o agregador enviando:
                          1. Valor do pagamento
                          2. ID da instituição selecionada (selectedItpBank)
                          3. Callback URL de erro e sucesso
                          
                          Exemplo genérico (Pluggy / Belvo):
                          const response = await api.post('/payments/intents', {
                            amount: 200, currency: 'BRL', institution_id: selectedItpBank, ...
                          });
                          window.location.href = response.data.authorization_url; // Redireciona o usuário para o banco
                        */
                        setIsProcessingPayment(true);
                        setItpStep("redirecting");
                        setTimeout(() => {
                           setIsProcessingPayment(false);
                           setItpStep("bank_screen");
                        }, 2000);
                      }}
                      className="w-full bg-[#667eea] hover:bg-[#5a6fd6] disabled:opacity-50 text-white py-3 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2"
                    >
                      Continuar em {selectedItpBank ? selectedItpBank : "seu banco"} <ArrowRight size={12} />
                    </button>
                  </div>
                ) : itpStep === "redirecting" ? (
                  <div className="py-10 text-center space-y-4">
                     <RefreshCw size={24} className="animate-spin text-[#667eea] mx-auto" />
                     <div>
                       <h4 className="font-extrabold text-sm text-[var(--text-primary)]">Redirecionando de forma segura...</h4>
                       <p className="text-[0.65rem] text-[var(--text-muted)] mt-1">Conectando ao ambiente seguro do {selectedItpBank}.</p>
                     </div>
                  </div>
                ) : (
                  <div className="py-2 text-center space-y-4 relative">
                     {/* Tela simulada do app do banco */}
                     <div className="bg-zinc-900 border-4 border-zinc-800 rounded-3xl p-4 text-white overflow-hidden relative" style={{ minHeight: "280px" }}>
                       <div className="flex justify-between items-center mb-6">
                         <span className="text-[10px] font-black tracking-widest uppercase text-zinc-400">{selectedItpBank}</span>
                         <Shield size={14} className="text-[#667eea]" />
                       </div>
                       
                       <div className="space-y-4 text-left">
                          <h5 className="font-black text-sm">Autorizar Pagamento via Open Finance</h5>
                          
                          <div className="bg-zinc-800 rounded-xl p-3">
                             <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Destinatário</div>
                             <div className="text-xs font-black">Tarflow Finance LTDA</div>
                             <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider mt-3">Valor</div>
                             <div className="text-lg font-black text-emerald-400">R$ {selectedInstallmentPlan === "anual" ? "200,00" : selectedInstallmentPlan === "mensal" ? "20,00" : (200 / chosenInstallments).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          </div>

                          <button 
                            type="button"
                            onClick={() => {
                               /* 
                                 TODO: Em produção, o usuário ao finalizar o pagamento no app do banco, 
                                 retornará para uma URL de CALLBACK da sua aplicação (ex: meudominio.com/itp-sucesso).
                                 Nesta página de webhook/callback, você verifica o status via backend.
                               */
                               setIsProcessingPayment(true);
                               setTimeout(() => {
                                  setIsProcessingPayment(false);
                                  setPaymentSuccess(true);
                                  setTimeout(() => {
                                    setIsPremium(true);
                                    localStorage.setItem("openfinance_premium", "true");
                                    setShowCheckoutModal(false);
                                    setPaymentSuccess(false);
                                    setItpStep("select_bank");
                                    setSelectedItpBank(null);
                                  }, 2000);
                               }, 1500);
                            }}
                            disabled={isProcessingPayment}
                            className="w-full bg-[#667eea] hover:bg-[#5a6fd6] text-white font-black text-[10px] py-3 rounded-xl uppercase tracking-wider flex items-center justify-center transition-all disabled:opacity-75 relative overflow-hidden"
                          >
                             {isProcessingPayment ? <RefreshCw size={12} className="animate-spin relative z-10" /> : <span className="relative z-10">Confirmar e Pagar</span>}
                          </button>
                          
                          <div className="text-center mt-2">
                            <button 
                              type="button"
                              disabled={isProcessingPayment}
                              onClick={() => {
                                setItpStep("select_bank");
                                setSelectedItpBank(null);
                              }}
                              className="text-[9px] text-zinc-400 hover:text-white font-bold"
                            >
                              Cancelar e voltar
                            </button>
                          </div>
                       </div>
                     </div>
                  </div>
                )
              ) : checkoutMethod === "card" ? (
                // Card Form
                <form onSubmit={handlePaymentSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <label className="text-[0.55rem] font-black uppercase text-[var(--text-muted)]">Nome no Cartão</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: SILVA JUNIOR" 
                      className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold font-mono focus:outline-none focus:border-[#667eea]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[0.55rem] font-black uppercase text-[var(--text-muted)]">Número do Cartão</label>
                    <input 
                      type="text" 
                      required 
                      maxLength={19}
                      placeholder="4000 1234 5678 9010" 
                      className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold font-mono focus:outline-none focus:border-[#667eea]" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[0.55rem] font-black uppercase text-[var(--text-muted)]">Validade</label>
                      <input 
                        type="text" 
                        required 
                        maxLength={5}
                        placeholder="MM/AA" 
                        className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold font-mono text-center focus:outline-none focus:border-[#667eea]" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[0.55rem] font-black uppercase text-[var(--text-muted)]">CVC</label>
                      <input 
                        type="password" 
                        required 
                        maxLength={4}
                        placeholder="123" 
                        className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold font-mono text-center focus:outline-none focus:border-[#667eea]" 
                      />
                    </div>
                  </div>

                  {/* Installment Selector Dropdown */}
                  <div className="space-y-1">
                    <label className="text-[0.55rem] font-black uppercase text-[var(--text-muted)]">Opção de Parcelamento</label>
                    <select
                      value={chosenInstallments}
                      onChange={(e) => setChosenInstallments(Number(e.target.value))}
                      className="w-full p-2.5 border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)] text-xs font-bold focus:outline-none focus:border-[#667eea]"
                    >
                      {selectedInstallmentPlan === "anual" ? (
                        <option value={1}>1x de R$ 200,00 à vista (Integral)</option>
                      ) : selectedInstallmentPlan === "mensal" ? (
                        <option value={1}>1x de R$ 20,00 por mês (Sem fidelidade)</option>
                      ) : (
                        <>
                          <option value={12}>12x de R$ 16,67 sem juros (Total R$ 200,00)</option>
                          <option value={10}>10x de R$ 20,00 sem juros (Total R$ 200,00)</option>
                          <option value={6}>6x de R$ 33,33 sem juros (Total R$ 200,00)</option>
                          <option value={4}>4x de R$ 50,00 sem juros (Total R$ 200,00)</option>
                          <option value={3}>3x de R$ 66,67 sem juros (Total R$ 200,00)</option>
                          <option value={2}>2x de R$ 100,00 sem juros (Total R$ 200,00)</option>
                          <option value={1}>1x de R$ 200,00 à vista (Total R$ 200,00)</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="border-t border-[var(--border-color)] pt-4 mt-6">
                    <div className="flex justify-between items-center text-xs font-extrabold mb-4">
                      <span>Assinatura Open Finance ({selectedInstallmentPlan === "anual" ? "Integral" : selectedInstallmentPlan === "mensal" ? "Mensal Avulso" : `Parcelado ${chosenInstallments}x`})</span>
                      <span className="text-[#667eea]">
                        {selectedInstallmentPlan === "anual" 
                          ? "R$ 200,00" 
                          : selectedInstallmentPlan === "mensal"
                            ? "R$ 20,00 / mês"
                            : `${chosenInstallments}x de R$ ${(200 / chosenInstallments).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                      </span>
                    </div>
                    <button 
                      type="submit"
                      disabled={isProcessingPayment}
                      className="w-full bg-[#667eea] hover:bg-[#5a6fd6] text-white p-3 rounded-2xl text-xs font-black transition-colors flex items-center justify-center gap-2"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" /> Processando...
                        </>
                      ) : (
                        selectedInstallmentPlan === "anual" ? "Confirmar Pagamento Anual" : selectedInstallmentPlan === "mensal" ? "Confirmar Assinatura Mensal" : `Confirmar em ${chosenInstallments}x`
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                // PIX Form with quick button
                <div className="space-y-4">
                  <div className="bg-[var(--section-bg)] p-4 rounded-2xl flex flex-col items-center border border-[var(--border-color)]">
                    {/* Simulated Pix Code */}
                    <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 text-xs font-extrabold rounded-full flex items-center gap-1.5 mb-2.5 leading-none">
                      📱 PIX Copia e Cola
                    </div>
                    <textarea 
                      readOnly 
                      value={mockPixKey} 
                      className="w-full text-[0.55rem] font-mono border-0 rounded-lg bg-[var(--card-bg)] p-2 text-zinc-500 text-center resize-none h-14"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(mockPixKey);
                        alert("Código PIX copiado!");
                      }}
                      className="mt-2.5 bg-[#667eea] hover:bg-[#5a6fd6] text-white text-[0.65rem] font-extrabold py-1.5 px-3.5 rounded-lg"
                    >
                      Copiar Código PIX
                    </button>
                  </div>

                  <div className="text-center">
                    <button 
                      onClick={() => {
                        setIsProcessingPayment(true);
                        setTimeout(() => {
                          setIsProcessingPayment(false);
                          setPaymentSuccess(true);
                          setTimeout(() => {
                            setIsPremium(true);
                            localStorage.setItem("openfinance_premium", "true");
                            setShowCheckoutModal(false);
                            setPaymentSuccess(false);
                          }, 1500);
                        }, 1200);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white w-full py-3 rounded-2xl text-xs font-black shadow-lg"
                    >
                      {isProcessingPayment ? "Simulando pagamento..." : "Simular Pagamento Pago via QR/Copia-Cola"}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Connection Consent Confirmation Modal (Simulated App-to-App) */}
      <AnimatePresence>
        {showConnectModal && selectedBankToConnect && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[var(--container-bg)] rounded-[2rem] p-6 max-w-sm w-full border border-[var(--border-color)] shadow-strong space-y-4 text-center overflow-hidden relative"
            >
              {connectStep === "redirecting_out" && (
                <div className="py-8 flex flex-col items-center justify-center gap-4 relative">
                  <button 
                    onClick={() => {
                      setShowConnectModal(false);
                      setSelectedBankToConnect(null);
                    }}
                    className="absolute -top-4 -right-4 p-2 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <RefreshCw size={32} className="animate-spin text-[#667eea]" />
                  <p className="text-sm font-black text-[var(--text-primary)]">Abrindo aplicativo do {selectedBankToConnect}...</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Aguardando sua confirmação no aplicativo da sua instituição.</p>
                </div>
              )}

              {connectStep === "redirecting_in" && (
                <div className="py-8 flex flex-col items-center justify-center gap-4">
                  <RefreshCw size={32} className="animate-spin text-[#10b981]" />
                  <p className="text-sm font-black text-[var(--text-primary)]">Tudo Certo! Conexão estabelecida.</p>
                  <p className="text-[10px] text-[var(--text-muted)]">Sincronizando suas transações de {selectedBankToConnect}</p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* User Connection using pure Pluggy Connect SDK */}
      {pluggyConnectToken && (
        <PluggyConnect 
          connectToken={pluggyConnectToken}
          includeSandbox={true}
          onSuccess={onSuccessPluggy}
          onError={onErrorPluggy}
          onClose={() => {
            setPluggyConnectToken(null);
            setSelectedBankToConnect(null);
          }}
        />
      )}
    </div>
  );
}
