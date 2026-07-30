"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { useAuthGate } from "@/store/auth-gate";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

export function CartDrawer() {
  const router = useRouter();
  const { open, closeCart, lines, setQty, remove } = useCart();
  const { user } = useAuth();
  const openGate = useAuthGate((s) => s.openGate);
  const asideRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastActiveRef = useRef<HTMLElement | null>(null);
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lastActiveRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    closeBtnRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeCart();
        return;
      }
      if (e.key !== "Tab") return;
      const aside = asideRef.current;
      if (!aside) return;
      const focusables = Array.from(
        aside.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (e.shiftKey) {
        if (active === first || !aside.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !aside.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      lastActiveRef.current?.focus();
    };
  }, [open, closeCart]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-bg/60 backdrop-blur-md"
          />
          <motion.aside
            ref={asideRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 36 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col border-l border-border bg-surface/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="font-display text-lg font-semibold">Your Cart</div>
                <div className="text-xs text-text-2">
                  {lines.length} {lines.length === 1 ? "item" : "items"} reserved
                </div>
              </div>
              <button
                ref={closeBtnRef}
                onClick={closeCart}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {lines.length > 0 && (
              <div className="px-6 pt-4">
                <div className="rounded-2xl border border-border bg-card p-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-2">
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? "You unlocked free shipping ✨"
                        : `Spend ${formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping`}
                    </span>
                    <span className="text-text-2">
                      {formatPrice(subtotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-card-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ type: "spring", stiffness: 120, damping: 24 }}
                      className="h-full rounded-full bg-gradient-brand"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-card">
                    <ShoppingBag size={22} className="text-primary-400" />
                  </div>
                  <div className="font-display text-lg font-semibold">
                    Your cart is empty
                  </div>
                  <p className="mt-2 max-w-xs text-sm text-text-2">
                    Let our AI find products tailored exactly to you.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="btn btn-primary mt-6"
                  >
                    Explore the catalog
                  </Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-card">
                        <Image src={l.image} alt={l.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${l.slug}`}
                            onClick={closeCart}
                            className="line-clamp-2 text-sm font-medium leading-snug hover:text-primary-300"
                          >
                            {l.name}
                          </Link>
                          <button
                            onClick={() => remove(l.id)}
                            className="grid h-9 w-9 place-items-center rounded-full text-text-2 hover:bg-card-2 hover:text-danger"
                            aria-label="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-border bg-card">
                            <button
                              onClick={() => setQty(l.id, l.quantity - 1)}
                              className="grid h-9 w-9 place-items-center text-text-2 hover:text-text"
                              aria-label="Decrease"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="w-8 text-center text-xs">{l.quantity}</span>
                            <button
                              onClick={() => setQty(l.id, l.quantity + 1)}
                              disabled={l.stock != null && l.quantity >= l.stock}
                              title={
                                l.stock != null && l.quantity >= l.stock
                                  ? "Max available"
                                  : undefined
                              }
                              className="grid h-9 w-9 place-items-center text-text-2 hover:text-text disabled:opacity-40"
                              aria-label="Increase"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <div className="text-sm font-semibold">
                            {formatPrice(l.price * l.quantity)}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-border p-6">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-text-2">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="mb-4 text-xs text-text-2">
                  Taxes and shipping calculated at checkout.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!user) {
                      closeCart();
                      openGate({
                        title: "Your bag is saved",
                        description:
                          "Sign in to complete your order — everything in your bag is kept safe across devices.",
                        intent: "checkout",
                      });
                      return;
                    }
                    closeCart();
                    router.push("/checkout");
                  }}
                  className="btn btn-primary w-full"
                >
                  Checkout securely <ArrowRight size={16} />
                </button>
                <button
                  onClick={closeCart}
                  className="mt-2 w-full rounded-full py-2 text-sm text-text-2 hover:text-text"
                >
                  Continue shopping
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
