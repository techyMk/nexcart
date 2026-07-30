"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrderAddress } from "./orders";

export type SavedAddress = OrderAddress & {
  id: string;
  label: string;
  isDefault: boolean;
};

const uid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

type AddressesState = {
  items: SavedAddress[];
  add: (a: Omit<SavedAddress, "id" | "isDefault">) => void;
  update: (id: string, patch: Partial<Omit<SavedAddress, "id">>) => void;
  remove: (id: string) => void;
  setDefault: (id: string) => void;
};

export const useAddresses = create<AddressesState>()(
  persist(
    (set) => ({
      items: [],
      add: (a) =>
        set((s) => ({
          items: [
            ...s.items,
            { ...a, id: uid(), isDefault: s.items.length === 0 },
          ],
        })),
      update: (id, patch) =>
        set((s) => ({
          items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
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
    { name: "nexcart-addresses" },
  ),
);
