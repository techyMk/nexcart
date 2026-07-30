"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type OrderLine = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

export type ShipMethod = "standard" | "express" | "sameday";

export type OrderAddress = {
  first: string;
  last: string;
  email: string;
  address: string;
  city: string;
  postal: string;
  country: string;
};

export type Order = {
  id: string;
  /** ISO timestamp */
  placedAt: string;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  ship: ShipMethod;
  address: OrderAddress;
  status: "processing" | "shipped" | "delivered";
};

type OrdersState = {
  orders: Order[];
  addOrder: (o: Order) => void;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
    }),
    { name: "nexcart-orders" },
  ),
);
