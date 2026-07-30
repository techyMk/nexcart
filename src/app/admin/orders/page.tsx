"use client";

import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { Search, Download } from "lucide-react";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
const statusColor: Record<(typeof STATUSES)[number], string> = {
  Pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Processing: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
  Shipped: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
  Delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Cancelled: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const customers = [
  "Alex Vance",
  "Marcus Okafor",
  "Sara Chen",
  "Mei Tanaka",
  "Liam Becker",
  "Ines Costa",
  "Noah Patel",
  "Avery Klein",
];

export default function AdminOrders() {
  const orders = products.map((p, i) => ({
    id: 1024 + i,
    customer: customers[i % customers.length],
    product: p.name,
    total: p.price + 14,
    status: STATUSES[i % STATUSES.length],
    placed: `2 hour${i > 1 ? "s" : ""} ago`,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Fulfilment</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Orders</h1>
        </div>
        <button className="btn btn-ghost">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search by order ID, customer or product…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-primary-400/60"
          />
        </div>
        {STATUSES.map((s) => (
          <button
            key={s}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm text-text-2 hover:text-text"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-xs uppercase tracking-widest text-text-2">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Placed</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o) => (
              <tr key={o.id} className="transition hover:bg-card">
                <td className="px-5 py-3 font-mono text-xs">#NX-{o.id}</td>
                <td className="px-5 py-3">{o.customer}</td>
                <td className="px-5 py-3 text-text-2">{o.product}</td>
                <td className="px-5 py-3 font-display font-semibold">
                  {formatPrice(o.total)}
                </td>
                <td className="px-5 py-3 text-xs text-text-2">{o.placed}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ring-1 ${statusColor[o.status]}`}
                  >
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
