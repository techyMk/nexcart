"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Building2,
  type LucideIcon,
} from "lucide-react";

const payouts = [
  ["NX-PAY-9012", "Nov 12", "Stripe Connect", "Paid", 48210],
  ["NX-PAY-9011", "Nov 05", "Stripe Connect", "Paid", 52840],
  ["NX-PAY-9010", "Oct 29", "Wise USD", "Paid", 38120],
  ["NX-PAY-9009", "Oct 22", "Stripe Connect", "Paid", 41770],
  ["NX-PAY-9008", "Oct 15", "Wise USD", "Failed", 12480],
  ["NX-PAY-9007", "Oct 08", "Stripe Connect", "Paid", 39920],
] as const;

const statusStyle: Record<string, string> = {
  Paid: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  Failed: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

const balanceSeries = [40, 58, 50, 72, 64, 80, 70, 92, 84, 100, 88, 96];

export default function AdminPayouts() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Finance</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Payouts
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Connected to Stripe Connect · auto-payouts every Tuesday
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">
            <Download size={14} /> Export
          </button>
          <button className="btn btn-primary">
            <Wallet size={14} /> Pay out now
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <BalanceCard
          title="Available balance"
          amount="$84,210"
          delta="+12.4%"
          up
          accent="bg-gradient-brand"
        />
        <BalanceCard
          title="In transit"
          amount="$12,480"
          delta="ETA Nov 19"
          up
          accent="bg-gradient-to-br from-primary-500 to-primary-700"
        />
        <BalanceCard
          title="Pending review"
          amount="$2,100"
          delta="-3.6%"
          up={false}
          accent="bg-gradient-to-br from-accent-purple to-pink-500"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Balance trend</div>
              <div className="text-xs text-text-2">Last 12 weeks</div>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
              +18.2% YoY
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2">
            {balanceSeries.map((h, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.5, delay: i * 0.04 }}
                className="flex-1 rounded-md bg-gradient-to-t from-primary-700 to-accent-purple"
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="text-sm font-semibold">Payout methods</div>
          <div className="mt-4 space-y-2.5">
            <Method
              Icon={CreditCard}
              title="Stripe Connect"
              sub="Default · USD · arrives in 2 days"
              tag="Active"
            />
            <Method
              Icon={Banknote}
              title="Wise USD"
              sub="Backup · USD · arrives in 3 days"
              tag="Backup"
            />
            <Method
              Icon={Building2}
              title="HDFC ····3392"
              sub="INR · for India ops"
              tag="Inactive"
            />
          </div>
          <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm hover:bg-card-2">
            + Add payout method
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="text-sm font-semibold">Recent payouts</div>
          <button className="text-xs text-text-2 hover:text-text">View all →</button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-widest text-text-2">
            <tr>
              <th className="px-5 py-3 font-medium">Reference</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payouts.map(([ref, date, method, status, amount]) => (
              <tr key={ref as string} className="transition hover:bg-card">
                <td className="px-5 py-3 font-mono text-xs">{ref as string}</td>
                <td className="px-5 py-3 text-text-2">{date as string}</td>
                <td className="px-5 py-3">{method as string}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ring-1 ${statusStyle[status as string]}`}
                  >
                    {status as string}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-display font-semibold">
                  ${(amount as number).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BalanceCard({
  title,
  amount,
  delta,
  up,
  accent,
}: {
  title: string;
  amount: string;
  delta: string;
  up: boolean;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 backdrop-blur-xl">
      <div className={`pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full ${accent} opacity-20 blur-3xl`} />
      <div className="text-xs uppercase tracking-widest text-text-2">{title}</div>
      <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
        {amount}
      </div>
      <div
        className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-rose-400"}`}
      >
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {delta}
      </div>
    </div>
  );
}

function Method({
  Icon,
  title,
  sub,
  tag,
}: {
  Icon: LucideIcon;
  title: string;
  sub: string;
  tag: string;
}) {
  const tagStyles =
    tag === "Active"
      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
      : tag === "Backup"
        ? "bg-primary-500/15 text-primary-200 ring-primary-500/30"
        : "bg-card-2 text-text-2 ring-border";
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-card text-primary-300 ring-1 ring-border">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-text-2">{sub}</div>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ring-1 ${tagStyles}`}
      >
        {tag}
      </span>
    </div>
  );
}
