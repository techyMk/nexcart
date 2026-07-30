"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CardBrand = "visa" | "mastercard" | "amex" | "rupay" | "card";

export type PaymentMethod = {
  id: string;
  brand: CardBrand;
  last4: string;
  expMonth: number;
  expYear: number;
  holder: string;
  isDefault: boolean;
};

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

type PaymentsState = {
  items: PaymentMethod[];
  add: (m: Omit<PaymentMethod, "id" | "isDefault">) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
};

export const usePayments = create<PaymentsState>()(
  persist(
    (set) => ({
      items: [],
      add: (m) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...m, id: uid(), isDefault: s.items.length === 0 },
          ],
        })),
      remove: (id) =>
        set((s) => {
          const removed = s.items.find((i) => i.id === id);
          const items = s.items.filter((i) => i.id !== id);
          if (removed?.isDefault && items.length > 0) {
            return {
              items: items.map((i, idx) =>
                idx === 0 ? { ...i, isDefault: true } : { ...i, isDefault: false },
              ),
            };
          }
          return { items };
        }),
      setDefault: (id) =>
        set((s) => ({
          items: s.items.map((i) => ({ ...i, isDefault: i.id === id })),
        })),
    }),
    { name: "nexcart-payments" },
  ),
);
