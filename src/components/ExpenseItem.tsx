import React, { useState } from "react";
import { Expense } from "../types";
import { formatCurrency, formatDate } from "../lib/utils";
import { CATEGORIES } from "../constants/categories";
import { Check, Edit2, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion } from "motion/react";

interface ExpenseItemProps {
  expense: Expense;
  updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  delay?: number;
  allowDelete?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({ 
  expense: e, 
  updateExpense, 
  deleteExpense, 
  delay = 0,
  allowDelete = true 
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { t } = useTranslation();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="bg-[var(--card-bg)] p-4 rounded-2xl flex justify-between items-center shadow-sm border border-transparent hover:border-[var(--success)] transition-all group gap-2 min-w-0"
    >
      <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-[var(--section-bg)] flex items-center justify-center text-xl shadow-inner shrink-0">
          {CATEGORIES.find(c => c.id === e.category)?.icon || "💰"}
        </div>
        <div className="min-w-0 flex-1">
          {editingId === e.id ? (
            <div className="flex items-center gap-1.5 mt-0.5 max-w-[200px]">
              <input
                type="text"
                value={editName}
                onChange={(ev) => setEditName(ev.target.value)}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter") {
                    if (editName.trim()) {
                      updateExpense(e.id, { name: editName.trim() });
                    }
                    setEditingId(null);
                  } else if (ev.key === "Escape") {
                    setEditingId(null);
                  }
                }}
                className="text-xs font-bold p-1 bg-[var(--section-bg)] text-[var(--text-primary)] border border-[#667eea] rounded-lg w-full"
                autoFocus
              />
              <button
                onClick={() => {
                  if (editName.trim()) {
                    updateExpense(e.id, { name: editName.trim() });
                  }
                  setEditingId(null);
                }}
                className="p-1 text-[var(--success)] hover:bg-[var(--success)]/10 rounded shrink-0"
              >
                <Check size={12} />
              </button>
              <button
                onClick={() => setEditingId(null)}
                className="p-1 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded shrink-0"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 group/name min-w-0">
              <div className="font-black text-sm text-[var(--text-primary)] truncate">{e.name}</div>
              <button
                onClick={() => {
                  setEditingId(e.id);
                  setEditName(e.name);
                }}
                aria-label={t("Editar descrição")}
                title={t("Clique para editar a descrição desta transação") || "Clique para editar a descrição desta transação"}
                className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[#667eea] rounded transition-all shrink-0 cursor-pointer"
              >
                <Edit2 size={10} />
              </button>
            </div>
          )}
          <div className="text-[0.65rem] text-[var(--text-muted)] font-black uppercase tracking-tight truncate">{formatDate(e.date)} · {t(e.category) || e.category}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4 pl-2 shrink-0">
        <div className="font-black text-sm text-[var(--danger)] whitespace-nowrap">{formatCurrency(e.value)}</div>
        {allowDelete && (
          <button 
            onClick={() => deleteExpense(e.id)} 
            title="Excluir despesa"
            className="opacity-0 group-hover:opacity-100 p-2 text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all shrink-0 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};
