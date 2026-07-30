"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CreditCard,
  Heart,
  LogIn,
  ShoppingBag,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuthGate, type AuthIntent } from "@/store/auth-gate";

const intentIcon: Record<AuthIntent, typeof LogIn> = {
  cart: ShoppingBag,
  wishlist: Heart,
  checkout: CreditCard,
  generic: LogIn,
};

export function AuthGateModal() {
  const { open, title, description, intent, closeGate } = useAuthGate();
  const pathname = usePathname();
  const next = encodeURIComponent(pathname ?? "/");
  const Icon = intentIcon[intent] ?? LogIn;

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeGate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeGate]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80]">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeGate}
            aria-label="Close"
            className="absolute inset-0 cursor-default bg-bg/70 backdrop-blur-md"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
              className="pointer-events-auto relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface/95 shadow-card backdrop-blur-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="auth-gate-title"
            >
            <div className="relative px-7 py-8 text-center">
              <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-500/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-accent-purple/25 blur-3xl" />

              <button
                onClick={closeGate}
                aria-label="Close"
                className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
              >
                <X size={16} />
              </button>

              <div className="relative inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-brand text-white shadow-glow">
                <Icon size={22} />
              </div>

              <h2
                id="auth-gate-title"
                className="relative mt-5 font-display text-2xl font-semibold tracking-tight"
              >
                {title}
              </h2>
              <p className="relative mt-2 text-sm text-text-2">{description}</p>

              <div className="relative mt-6 flex flex-col gap-2">
                <Link
                  href={`/login?next=${next}`}
                  onClick={closeGate}
                  className="btn btn-primary w-full"
                >
                  <LogIn size={14} /> Sign in <ArrowRight size={14} />
                </Link>
                <Link
                  href={`/register?next=${next}`}
                  onClick={closeGate}
                  className="btn btn-ghost w-full"
                >
                  <UserPlus size={14} /> Create a free account
                </Link>
              </div>

              <button
                onClick={closeGate}
                className="relative mt-4 text-xs text-text-2 hover:text-text"
              >
                Continue browsing
              </button>
            </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
