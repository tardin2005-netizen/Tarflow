import React, { useState, useMemo } from "react";
import { useExpenses } from "../../hooks/useFirebaseData";
import { CATEGORIES } from "../../constants/categories";
import { formatCurrency, cn } from "../../lib/utils";
import { ExpenseItem } from "../ExpenseItem";
import { CategoryId } from "../../types";
import { Trash2, Download, List, ArrowUpDown, Plus, DollarSign, Calendar, Tag, ListFilter, Clock, Building2 } from "lucide-react";
import CustomSelect from "../CustomSelect";
import * as XLSX from "xlsx";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";

type SortType = "date" | "value" | "category";

// Shared array, keep consistent with OpenFinanceTab or define typical banks
const POPULAR_BANKS = [
  { id: "Nubank", name: "Nubank" },
  { id: "Inter", name: "Banco Inter" },
  { id: "PicPay", name: "PicPay" },
  { id: "Itaú", name: "Itaú Unibanco" },
  { id: "Bradesco", name: "Bradesco" },
  { id: "Santander", name: "Santander" },
  { id: "Banco do Brasil", name: "Banco do Brasil" },
  { id: "Caixa", name: "Caixa Econômica" }
];

export default function ExtratosTab() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses();
  const { t } = useTranslation();

  const [sortField, setSortField] = useState<SortType>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | string>("");
  const [customCategory, setCustomCategory] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [installments, setInstallments] = useState<number>(1);
  const [bank, setBank] = useState<string>("");

  const handleAdd = async () => {
    const categoryToSave = isCustomMode ? customCategory : selectedCategory;
    if (!categoryToSave || !name || !value || !date) return;
    const val = parseFloat(value);
    if (isNaN(val) || val <= 0) return;

    if (installments > 1) {
      const installmentVal = parseFloat((val / installments).toFixed(2));
      const baseDate = new Date(date + "T12:00:00");

      for (let i = 0; i < installments; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + i);
        const formattedDate = nextDate.toISOString().split("T")[0];

        await addExpense({
          category: categoryToSave as any,
          name: `${name} (${i + 1}/${installments})`,
          value: installmentVal,
          date: formattedDate,
          bank: bank || undefined
        });
      }
    } else {
      await addExpense({
        category: categoryToSave as any,
        name,
        value: val,
        date,
        bank: bank || undefined
      });
    }

    setName("");
    setValue("");
    setInstallments(1);
    setBank("");
    if (isCustomMode) {
      setCustomCategory("");
      setIsCustomMode(false);
      setSelectedCategory("");
    }
  };

  const filteredExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") comparison = a.date.localeCompare(b.date);
      else if (sortField === "value") comparison = a.value - b.value;
      else if (sortField === "category") comparison = a.category.localeCompare(b.category);
      
      return sortOrder === "desc" ? -comparison : comparison;
    });
  }, [expenses, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((acc, e) => acc + e.value, 0);
    const count = filteredExpenses.length;
    return { total, count };
  }, [filteredExpenses]);

  const toggleSort = (field: SortType) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredExpenses.map(e => ({
      Data: e.date,
      Categoria: e.category,
      Descrição: e.name,
      Valor: e.value,
      Banco: e.bank || ""
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Extrato");
    XLSX.writeFile(workbook, "Tarflow_Extrato.xlsx");
  };

  return (
    <div className="tab-content flex flex-col gap-6 w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
           <Download 
             size={16} 
             onClick={exportToExcel} 
             className="cursor-pointer hover:text-cyan-400 transition-colors" 
             title="Exportar Excel"
           />
        </div>
        <div className="relative z-10 w-full text-center sm:text-left">
          <h4 className="text-[0.55rem] font-black uppercase tracking-[0.2em] opacity-50 mb-1 leading-none">Fluxo Histórico Total</h4>
          <div className="text-3xl font-black tracking-tighter">{formatCurrency(stats.total)}</div>
          <div className="text-[0.6rem] opacity-40 font-bold uppercase tracking-widest leading-none mt-1">{stats.count} registros no sistema</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 w-full min-w-0">
        {/* Formulário de Novo Registro */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className="bg-[var(--section-bg)] rounded-3xl p-6 shadow-sm border-2 border-[var(--border-color)] overflow-hidden">
            <h2 className="text-xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <Plus size={24} className="text-[#667eea]" /> Novo Registro
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                  Produto/Serviço
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Tag size={18} className="text-[#667eea] opacity-80" />
                  </div>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Almoço, Netflix..."
                    className="w-full py-3.5 pl-12 pr-4 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold placeholder-[var(--text-muted)]/50 text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                  Valor (R$)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign size={18} className="text-[#667eea] opacity-80" />
                  </div>
                  <input 
                    type="number" 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0.00" 
                    step="0.01"
                    className="w-full py-3.5 pl-12 pr-4 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold placeholder-[var(--text-muted)]/50 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Data
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar size={16} className="text-[#667eea] opacity-80" />
                    </div>
                    <input 
                      type="date" 
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full py-3.5 pl-10 pr-2 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Parcelas
                  </label>
                  <CustomSelect
                    value={String(installments)}
                    onChange={(v) => setInstallments(parseInt(v))}
                    icon={<Clock size={16} className="text-[#667eea] opacity-80" />}
                    options={[
                      { value: "1", label: "À vista (1x)" },
                      ...[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => ({ value: String(num), label: `${num}x` }))
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Instituição/Banco <span className="opacity-60 text-[9px]">(Opcional)</span>
                  </label>
                  <CustomSelect
                    value={bank}
                    onChange={setBank}
                    icon={<Building2 size={16} className="text-[#667eea] opacity-80" />}
                    options={[
                      { value: "", label: "Nenhum / Manual" },
                      ...POPULAR_BANKS.map(b => ({ value: b.id, label: b.name }))
                    ]}
                  />
                </div>

                <div>
                  <label className="block mb-1.5 ml-1 text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                    Categoria
                  </label>
                  {isCustomMode ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ListFilter size={16} className="text-[#667eea] opacity-80" />
                        </div>
                        <input 
                          type="text" 
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Nova categoria..."
                          className="w-full py-3.5 pl-10 pr-2 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold placeholder-[var(--text-muted)]/50 text-xs"
                        />
                      </div>
                      <button 
                        onClick={() => setIsCustomMode(false)}
                        className="bg-[var(--border-color)] px-3 rounded-2xl text-xs font-bold hover:bg-black/5 transition-colors"
                      >
                        Voltar
                      </button>
                    </div>
                  ) : (
                    <CustomSelect
                      value={selectedCategory}
                      onChange={(v) => {
                        if (v === "CUSTOM") {
                          setIsCustomMode(true);
                        } else {
                          setSelectedCategory(v);
                        }
                      }}
                      icon={<ListFilter size={16} className="text-[#667eea] opacity-80" />}
                      options={[
                        { value: "", label: "Selecione..." },
                        ...CATEGORIES.map(cat => ({ value: cat.id, label: cat.label })),
                        { value: "CUSTOM", label: "+ Outra" }
                      ]}
                    />
                  )}
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full mt-2 bg-gradient-to-br from-[#1a1a2e] to-[#2C5F7C] text-white py-4 px-10 rounded-2xl font-black text-sm shadow-[0_10px_30px_rgba(45,115,255,0.2)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(45,115,255,0.3)] active:translate-y-0 transition-all cursor-pointer"
              >
                SALVAR DESPESA
              </button>
            </div>
          </div>
        </div>

        {/* Timeline de Gastos */}
        <div className="lg:col-span-3 space-y-6 w-full min-w-0">
          <div className="bg-[var(--section-bg)] p-6 rounded-3xl border-2 border-[var(--border-color)] shadow-sm h-full flex flex-col overflow-hidden min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <div className="flex items-center gap-2">
                <List size={22} className="text-[#667eea]" />
                <h2 className="text-xl font-black tracking-tight">Timeline de Gastos</h2>
              </div>
              <div className="flex gap-2 self-start sm:self-auto">
                <button onClick={() => toggleSort("date")} className={cn("p-2 rounded-xl text-xs font-bold flex items-center gap-1", sortField === "date" ? "bg-[#667eea] text-white" : "bg-[var(--card-bg)] text-[var(--text-muted)]")}>
                   <ArrowUpDown size={12} /> Data
                </button>
                <button onClick={() => toggleSort("value")} className={cn("p-2 rounded-xl text-xs font-bold flex items-center gap-1", sortField === "value" ? "bg-[#667eea] text-white" : "bg-[var(--card-bg)] text-[var(--text-muted)]")}>
                   <ArrowUpDown size={12} /> Valor
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar min-h-[400px]">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-[var(--border-color)] rounded-2xl h-full flex items-center justify-center">
                  <p className="text-[var(--text-muted)] text-sm font-bold opacity-50">Nenhum dado encontrado</p>
                </div>
              ) : (
                filteredExpenses.map((e, idx) => (
                  <ExpenseItem 
                    key={e.id}
                    expense={e}
                    updateExpense={updateExpense}
                    deleteExpense={deleteExpense}
                    delay={Math.min(idx * 0.05, 0.5)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
