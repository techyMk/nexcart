"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const kpis = [
  { Icon: DollarSign, l: "Total revenue", v: "$248,420", d: "+12.4%", up: true },
  { Icon: ShoppingBag, l: "Orders", v: "1,284", d: "+8.2%", up: true },
  { Icon: Users, l: "New customers", v: "342", d: "+22.1%", up: true },
  { Icon: TrendingUp, l: "Conversion", v: "4.62%", d: "-0.6%", up: false },
];

const revenueBars = [40, 55, 35, 75, 60, 80, 70, 90, 80, 95, 88, 100, 86, 92];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Overview</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-2">
          Last 30 days · auto-refreshing
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div
            key={k.l}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-xs text-text-2">
              <span>{k.l}</span>
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-card text-primary-300 ring-1 ring-border">
                <k.Icon size={14} />
              </span>
            </div>
            <div className="mt-3 font-display text-2xl font-semibold tracking-tight">
              {k.v}
            </div>
            <div
              className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${
                k.up ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {k.d}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Revenue</div>
              <div className="text-xs text-text-2">Last 14 days</div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-text-2">
                Daily
              </span>
              <span className="rounded-full bg-gradient-brand px-2.5 py-1 font-semibold text-white">
                Weekly
              </span>
              <span className="rounded-full border border-border bg-card px-2.5 py-1 text-text-2">
                Monthly
              </span>
            </div>
          </div>
          <div className="mt-6 flex h-56 items-end gap-2">
            {revenueBars.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, delay: i * 0.04, ease: "easeOut" }}
                className="flex-1 rounded-md bg-gradient-to-t from-primary-700 to-accent-purple"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">AI Insights</div>
              <div className="text-xs text-text-2">Generated 2 min ago</div>
            </div>
            <span className="chip">
              <Sparkles size={12} /> New
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {[
              "Restock iPhone 15 Pro Max — projected stockout in 3 days.",
              "Boost ‘Audio’ category — 24% YoY uplift in the last 7 days.",
              "Promote MacBook Pro M3 — high intent cohort identified.",
            ].map((s, i) => (
              <li
                key={s}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm"
              >
                <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-gradient-brand text-white">
                  <Sparkles size={12} />
                </span>
                <span className="leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="text-sm font-semibold">Recent orders</div>
            <a className="text-xs text-text-2 hover:text-text" href="/admin/orders">
              View all →
            </a>
          </div>
          <ul className="divide-y divide-border">
            {products.slice(0, 5).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 p-4">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-card">
                  <Image src={p.images[0]} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{p.name}</div>
                  <div className="text-xs text-text-2">
                    #NX-{1024 + i} · {p.brand}
                  </div>
                </div>
                <span className="font-display text-sm font-semibold">
                  {formatPrice(p.price)}
                </span>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 md:inline ${
                    i % 3 === 0
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                      : i % 3 === 1
                        ? "bg-primary-500/15 text-primary-200 ring-primary-500/30"
                        : "bg-amber-500/15 text-amber-300 ring-amber-500/30"
                  }`}
                >
                  {i % 3 === 0 ? "Delivered" : i % 3 === 1 ? "Shipped" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div className="text-sm font-semibold">Top products</div>
            <a className="text-xs text-text-2 hover:text-text" href="/admin/products">
              Manage →
            </a>
          </div>
          <ul className="divide-y divide-border">
            {products.slice(0, 5).map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 p-4">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-card text-xs text-text-2">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{p.name}</div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-card">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${100 - i * 14}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-text-2">{(120 - i * 14)} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
