"use client";

import Image from "next/image";
import { Plus, Search, Filter, Pencil, Trash2 } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

export default function AdminProducts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Catalog</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Products
          </h1>
          <p className="mt-1 text-sm text-text-2">
            {products.length} products live · 4 drafts
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} /> New product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search products…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-primary-400/60"
          />
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm">
          <Filter size={14} /> All categories
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm">
          Featured only
        </button>
        <button className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm">
          Out of stock
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-xs uppercase tracking-widest text-text-2">
            <tr>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Price</th>
              <th className="px-5 py-3 font-medium">Stock</th>
              <th className="px-5 py-3 font-medium">Rating</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id} className="transition hover:bg-card">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card">
                      <Image src={p.images[0]} alt="" fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm">{p.name}</div>
                      <div className="text-xs text-text-2">SKU NX-{1000 + p.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-text-2">{p.category}</td>
                <td className="px-5 py-3 font-display font-semibold">
                  {formatPrice(p.price)}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ring-1 ${
                      p.stock > 30
                        ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                        : p.stock > 10
                          ? "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                          : "bg-rose-500/15 text-rose-300 ring-rose-500/30"
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>
                <td className="px-5 py-3 text-text-2">{p.rating.toFixed(1)} ★</td>
                <td className="px-5 py-3">
                  {p.featured ? (
                    <span className="rounded-full bg-primary-500/15 px-2 py-0.5 text-[11px] font-semibold text-primary-200 ring-1 ring-primary-500/30">
                      Featured
                    </span>
                  ) : (
                    <span className="text-xs text-text-2">Live</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-2">
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-card-2 hover:text-text">
                      <Pencil size={14} />
                    </button>
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-card-2 hover:text-rose-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
