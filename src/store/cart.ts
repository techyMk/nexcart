"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  id: number;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  /** Units available — optional so partially-updated call sites still compile. */
  stock?: number;
};

type CartState = {
  open: boolean;
  lines: CartLine[];
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      open: false,
      lines: [],
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
      toggleCart: () => set((s) => ({ open: !s.open })),
      add: (line, qty = 1) =>
        set((s) => {
          const found = s.lines.find((l) => l.id === line.id);
          if (found) {
            return {
              lines: s.lines.map((l) =>
                l.id === line.id
                  ? {
                      ...l,
                      stock: line.stock ?? l.stock,
                      quantity: Math.min(
                        found.stock ?? Infinity,
                        l.quantity + qty,
                      ),
                    }
                  : l,
              ),
              open: true,
            };
          }
          return {
            lines: [
              ...s.lines,
              { ...line, quantity: Math.min(line.stock ?? Infinity, qty) },
            ],
            open: true,
          };
        }),
      remove: (id) =>
        set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.id === id
                ? {
                    ...l,
                    quantity: Math.min(l.stock ?? Infinity, Math.max(0, qty)),
                  }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((acc, l) => acc + l.price * l.quantity, 0),
      count: () => get().lines.reduce((acc, l) => acc + l.quantity, 0),
    }),
    { name: "nexcart-cart" },
  ),
);
