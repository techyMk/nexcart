"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = { value: string; label: string };

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel: string;
  className?: string;
};

/** Custom-styled replacement for a native <select> — glass panel, animated,
 *  keyboard-operable (collapsed listbox pattern: focus stays on the trigger). */
export function Select({
  value,
  onChange,
  options,
  ariaLabel,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const openWithCursor = () => {
    setCursor(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const commit = (idx: number) => {
    const opt = options[idx];
    if (opt) onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        openWithCursor();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setCursor((c) => Math.min(options.length - 1, c + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setCursor((c) => Math.max(0, c - 1));
        break;
      case "Home":
        e.preventDefault();
        setCursor(0);
        break;
      case "End":
        e.preventDefault();
        setCursor(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        commit(cursor);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openWithCursor())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-activedescendant={
          open ? `${listboxId}-opt-${cursor}` : undefined
        }
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm outline-none transition hover:bg-card-2 focus-visible:border-primary-400/60 focus-visible:ring-2 focus-visible:ring-primary-400/20"
      >
        {selected?.label}
        <ChevronDown
          size={14}
          className={cn(
            "text-text-2 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-40 mt-2 w-max min-w-full origin-top-right overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 shadow-card backdrop-blur-xl"
          >
            {options.map((o, i) => {
              const isSelected = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  onPointerEnter={() => setCursor(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-6 rounded-xl px-3 py-2 text-sm transition-colors",
                    i === cursor ? "bg-card-2 text-text" : "text-text-2",
                    isSelected && "font-medium text-text",
                  )}
                >
                  {o.label}
                  {isSelected && (
                    <Check size={14} className="text-primary-500" />
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
