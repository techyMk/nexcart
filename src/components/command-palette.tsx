"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Heart,
  Home,
  LayoutDashboard,
  LogIn,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Tags,
  UserPlus,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { categories, products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useCommandPalette } from "@/store/command";

const navActions = [
  { label: "Go to Home", hint: "Landing page", Icon: Home, href: "/" },
  { label: "Browse Shop", hint: "All products", Icon: ShoppingBag, href: "/shop" },
  { label: "AI Picks", hint: "Curated by AI", Icon: Sparkles, href: "/shop?ai=1" },
  { label: "Today's Deals", hint: "Limited-time offers", Icon: Package, href: "/shop?sale=1" },
  { label: "Wishlist", hint: "Saved for later", Icon: Heart, href: "/wishlist" },
  { label: "My account", hint: "Orders and settings", Icon: LogIn, href: "/account" },
  { label: "Sign in", hint: "Existing customer", Icon: LogIn, href: "/login" },
  { label: "Create account", hint: "Join NexCart", Icon: UserPlus, href: "/register" },
  { label: "Admin dashboard", hint: "Internal", Icon: LayoutDashboard, href: "/admin" },
];

export function CommandPalette() {
  const { open, openPalette, closePalette } = useCommandPalette();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  // Element that had focus before the palette opened — restored on close.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === "Escape" && open) {
        closePalette();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, openPalette, closePalette]);

  // Reset state and focus on open; restore focus to the trigger on close
  useEffect(() => {
    if (open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setQ("");
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      restoreFocusRef.current?.focus();
      restoreFocusRef.current = null;
    }
  }, [open]);

  const productHits = useMemo(() => {
    if (!q) return products.slice(0, 5);
    const needle = q.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(needle) ||
          p.brand.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle),
      )
      .slice(0, 6);
  }, [q]);

  const categoryHits = useMemo(() => {
    if (!q) return categories.slice(0, 4);
    const needle = q.toLowerCase();
    return categories.filter((c) => c.name.toLowerCase().includes(needle)).slice(0, 4);
  }, [q]);

  const navHits = useMemo(() => {
    if (!q) return navActions.slice(0, 4);
    const needle = q.toLowerCase();
    return navActions
      .filter(
        (n) =>
          n.label.toLowerCase().includes(needle) ||
          n.hint.toLowerCase().includes(needle),
      )
      .slice(0, 4);
  }, [q]);

  const flat = useMemo(() => {
    return [
      ...productHits.map((p) => ({ href: `/product/${p.slug}`, label: p.name })),
      ...categoryHits.map((c) => ({ href: `/shop?cat=${c.slug}`, label: c.name })),
      ...navHits.map((n) => ({ href: n.href, label: n.label })),
    ];
  }, [productHits, categoryHits, navHits]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (flat.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => (c + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => (c - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = flat[cursor];
      if (target) {
        router.push(target.href);
        closePalette();
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePalette}
            className="fixed inset-0 z-[80] bg-bg/70 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            onKeyDown={(e) => {
              // Trap Tab inside the palette — focus always returns to the input.
              if (e.key === "Tab") {
                e.preventDefault();
                inputRef.current?.focus();
              }
            }}
            className="fixed inset-x-4 top-[10vh] z-[90] mx-auto max-w-2xl overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-card backdrop-blur-2xl"
          >
            <div aria-live="polite" className="sr-only">
              {flat.length} results
            </div>
            <div className="flex items-center gap-3 border-b border-border px-5 py-4 focus-within:ring-2 focus-within:ring-primary-400/30">
              <Search size={16} className="text-text-2" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setCursor(0);
                }}
                onKeyDown={onKeyDown}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-results"
                aria-activedescendant={
                  flat.length > 0 ? `palette-opt-${cursor}` : undefined
                }
                placeholder="Search products, categories, pages…"
                className="w-full bg-transparent text-base outline-none placeholder:text-text-2"
              />
              <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-text-2">
                ESC
              </kbd>
            </div>

            <div
              id="palette-results"
              role="listbox"
              aria-label="Search results"
              className="max-h-[60vh] overflow-y-auto"
            >
              {flat.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-text-2">
                  Nothing matches “{q}”. Try a brand, category, or page.
                </div>
              ) : (
                <>
                  {productHits.length > 0 && (
                    <Group label="Products">
                      {productHits.map((p, i) => (
                        <Row
                          key={p.id}
                          id={`palette-opt-${i}`}
                          active={cursor === i}
                          onMouseEnter={() => setCursor(i)}
                          onClick={() => {
                            router.push(`/product/${p.slug}`);
                            closePalette();
                          }}
                          left={
                            <span className="relative inline-block h-9 w-9 overflow-hidden rounded-lg bg-card">
                              <Image src={p.images[0]} alt="" fill sizes="36px" className="object-cover" />
                            </span>
                          }
                          label={p.name}
                          hint={`${p.brand} · ${p.category}`}
                          right={
                            <span className="text-xs font-semibold">{formatPrice(p.price)}</span>
                          }
                        />
                      ))}
                    </Group>
                  )}
                  {categoryHits.length > 0 && (
                    <Group label="Categories">
                      {categoryHits.map((c, i) => {
                        const idx = productHits.length + i;
                        return (
                          <Row
                            key={c.id}
                            id={`palette-opt-${idx}`}
                            active={cursor === idx}
                            onMouseEnter={() => setCursor(idx)}
                            onClick={() => {
                              router.push(`/shop?cat=${c.slug}`);
                              closePalette();
                            }}
                            left={
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-card font-display text-xs font-semibold uppercase tracking-widest text-primary-300 ring-1 ring-border">
                                {c.name.slice(0, 2)}
                              </span>
                            }
                            label={c.name}
                            hint={`${c.count} products`}
                            right={<Tags size={13} className="text-text-2" />}
                          />
                        );
                      })}
                    </Group>
                  )}
                  {navHits.length > 0 && (
                    <Group label="Go to">
                      {navHits.map((n, i) => {
                        const idx = productHits.length + categoryHits.length + i;
                        return (
                          <Row
                            key={n.href}
                            id={`palette-opt-${idx}`}
                            active={cursor === idx}
                            onMouseEnter={() => setCursor(idx)}
                            onClick={() => {
                              router.push(n.href);
                              closePalette();
                            }}
                            left={
                              <span className="grid h-9 w-9 place-items-center rounded-lg bg-card text-primary-300 ring-1 ring-border">
                                <n.Icon size={14} />
                              </span>
                            }
                            label={n.label}
                            hint={n.hint}
                            right={<ArrowRight size={13} className="text-text-2" />}
                          />
                        );
                      })}
                    </Group>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-border px-5 py-3 text-xs text-text-2">
              <div className="flex items-center gap-3">
                <KbdHint k="↑↓" label="Navigate" />
                <KbdHint k="↵" label="Open" />
                <KbdHint k="ESC" label="Close" />
              </div>
              <span className="hidden items-center gap-1.5 md:inline-flex">
                <Sparkles size={11} className="text-primary-300" />
                Powered by NexCart Intelligence™
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="py-2">
      <div className="px-5 py-1.5 text-[10px] uppercase tracking-widest text-text-2">
        {label}
      </div>
      <div className="px-2">{children}</div>
    </div>
  );
}

function Row({
  id,
  active,
  onMouseEnter,
  onClick,
  left,
  label,
  hint,
  right,
}: {
  id: string;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
  left: React.ReactNode;
  label: string;
  hint?: string;
  right?: React.ReactNode;
}) {
  return (
    <button
      id={id}
      role="option"
      aria-selected={active}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        active ? "bg-card-2" : "hover:bg-card"
      }`}
    >
      {left}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{label}</span>
        {hint && <span className="block truncate text-xs text-text-2">{hint}</span>}
      </span>
      {right}
    </button>
  );
}

function KbdHint({ k, label }: { k: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px]">
        {k}
      </kbd>
      {label}
    </span>
  );
}

// Convenience trigger to use inside the navbar
export function CommandPaletteTrigger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const open = useCommandPalette((s) => s.openPalette);
  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  );
}
