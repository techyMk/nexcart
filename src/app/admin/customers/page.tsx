"use client";

import Image from "next/image";
import { Mail, Search, Plus } from "lucide-react";

const avatars = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&q=80",
];

const seed = [
  ["Alex Vance", "techymk.dev@gmail.com", "Gold", 12, "$4,820"],
  ["Marcus Okafor", "marcus@kinetic.io", "Platinum", 28, "$12,140"],
  ["Sara Chen", "sara@vercel.com", "Silver", 6, "$1,990"],
  ["Mei Tanaka", "mei@tokyo.studio", "Gold", 14, "$5,330"],
  ["Liam Becker", "liam@orbit.cc", "Member", 2, "$420"],
  ["Ines Costa", "ines@flow.app", "Gold", 9, "$3,210"],
] as const;

export default function AdminCustomers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">CRM</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Customers
          </h1>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} /> Invite customer
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search customers…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-primary-400/60"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-card text-xs uppercase tracking-widest text-text-2">
            <tr>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Tier</th>
              <th className="px-5 py-3 font-medium">Orders</th>
              <th className="px-5 py-3 font-medium">Lifetime</th>
              <th className="px-5 py-3 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {seed.map(([name, email, tier, orders, ltv], i) => (
              <tr key={email as string} className="transition hover:bg-card">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative inline-block h-9 w-9 overflow-hidden rounded-full ring-1 ring-border">
                      <Image
                        src={avatars[i % avatars.length]}
                        alt=""
                        width={36}
                        height={36}
                      />
                    </span>
                    <div>
                      <div className="text-sm">{name as string}</div>
                      <div className="text-xs text-text-2">{email as string}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-card px-2.5 py-1 text-xs text-text ring-1 ring-border">
                    {tier as string}
                  </span>
                </td>
                <td className="px-5 py-3">{orders as number}</td>
                <td className="px-5 py-3 font-display font-semibold">
                  {ltv as string}
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="inline-flex h-8 items-center gap-2 rounded-full border border-border bg-card px-3 text-xs text-text-2 hover:text-text">
                    <Mail size={12} /> Message
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
