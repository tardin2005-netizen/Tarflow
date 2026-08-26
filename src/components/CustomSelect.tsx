import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

// A dropdown that opens a small anchored panel instead of the browser's native
// <select>, which on mobile takes over the entire screen with a full-height
// wheel/list picker that hides everything else on the page. The panel is
// rendered through a portal into document.body (positioned to match the
// trigger's on-screen rect) so it never gets clipped by a card's
// overflow-hidden, which a plain absolutely-positioned child would be.
export default function CustomSelect({ value, onChange, options, placeholder = "Selecione...", icon, className }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    const update = () => {
      const r = triggerRef.current!.getBoundingClientRect();
      setRect({ top: r.bottom + 6, left: r.left, width: r.width });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        panelRef.current && !panelRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          "w-full py-3.5 pl-10 pr-8 bg-[var(--card-bg)] border-2 border-[var(--border-color)] rounded-2xl text-[var(--text-primary)] focus:border-[#667eea] outline-none transition-all font-bold text-xs text-left cursor-pointer relative",
          isOpen && "border-[#667eea]",
          className
        )}
      >
        {icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </span>
        )}
        <span className={cn("truncate block", !selected && "text-[var(--text-muted)]/70 font-medium")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={15} className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition-transform", isOpen && "rotate-180")} />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && rect && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              style={{ position: "fixed", top: rect.top, left: rect.left, width: rect.width }}
              className="z-[1000] bg-[var(--container-bg)] border-2 border-[var(--border-color)] rounded-2xl shadow-2xl max-h-56 overflow-y-auto py-1.5"
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); setIsOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 transition-colors cursor-pointer",
                    opt.value === value
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-[var(--text-primary)] hover:bg-zinc-500/10"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {opt.value === value && <Check size={14} className="shrink-0" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
