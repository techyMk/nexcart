"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Settings,
  Shield,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { EditProfileModal } from "./edit-profile-modal";

export type AccountViewProps = {
  email: string;
  fullName: string;
  avatarUrl: string | null;
  memberSinceYear: number;
  role: string;
  ordersCount: number;
  spent: number;
  tier: string;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    createdAt: string;
    firstItem: { name: string; image: string | null; quantity: number } | null;
  }>;
};

const comingSoonTabs = [
  { Icon: MapPin, label: "Addresses" },
  { Icon: CreditCard, label: "Payments" },
  { Icon: Settings, label: "Settings" },
];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  processing: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
  shipped: "bg-violet-500/15 text-violet-200 ring-violet-500/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  cancelled: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
  refunded: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AccountView({
  email,
  fullName,
  avatarUrl,
  memberSinceYear,
  role,
  ordersCount,
  spent,
  tier,
  orders,
}: AccountViewProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/");
      router.refresh();
    } catch {
      setSigningOut(false);
    }
  }

  const inTransit = orders.filter((o) =>
    ["processing", "shipped"].includes(o.status),
  ).length;
  const firstName = fullName.split(" ")[0] ?? fullName;
  const isAdmin = role === "admin" || role === "super_admin";

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">Hello again</div>
            <h1 className="section-title mt-2">
              Welcome back,{" "}
              <span className="text-gradient-brand">{firstName}</span>
            </h1>
            <p className="mt-2 text-text-2">
              Member since {memberSinceYear} · {tier} tier · {ordersCount}{" "}
              {ordersCount === 1 ? "order" : "orders"}
              {isAdmin && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-white">
                  <Shield size={10} /> {role.replace("_", " ")}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="btn btn-ghost disabled:opacity-60"
          >
            <LogOut size={14} /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="group relative rounded-3xl border border-border bg-card p-5 backdrop-blur-xl">
              <button
                onClick={() => setEditing(true)}
                aria-label="Edit profile"
                className="absolute right-3 top-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs text-text-2 opacity-0 transition hover:bg-card-2 hover:text-text group-hover:opacity-100 focus:opacity-100"
              >
                <Pencil size={12} /> Edit
              </button>
              <div className="flex items-center gap-3">
                <span className="relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-sm font-semibold ring-1 ring-border">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      unoptimized
                    />
                  ) : (
                    <span className="text-white">{initials(fullName) || "·"}</span>
                  )}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{fullName}</div>
                  <div className="truncate text-xs text-text-2">{email}</div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Stat l="Orders" v={String(ordersCount)} />
                <Stat l="Spent" v={spent > 0 ? formatPrice(spent) : "$0"} />
                <Stat l="Tier" v={tier} />
              </div>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-ghost btn-sm mt-4 w-full"
              >
                <Pencil size={12} /> Edit profile
              </button>
            </div>

            <nav className="space-y-1 rounded-3xl border border-border bg-card p-3 backdrop-blur-xl">
              <span
                aria-current="page"
                className="flex w-full items-center gap-3 rounded-xl bg-card-2 px-3 py-2.5 text-sm text-text ring-1 ring-border"
              >
                <Package size={15} />
                Orders
              </span>
              <Link
                href="/wishlist"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-2 transition hover:bg-card-2 hover:text-text"
              >
                <Heart size={15} />
                Wishlist
              </Link>
              {comingSoonTabs.map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-disabled="true"
                  className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-2/70"
                >
                  <Icon size={15} />
                  {label}
                  <span className="ml-auto rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-text-2">
                    Soon
                  </span>
                </button>
              ))}
            </nav>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-2xl border border-primary-500/30 bg-primary-500/10 px-4 py-3 text-sm text-primary-200 hover:bg-primary-500/15"
              >
                <Shield size={15} /> Go to admin dashboard
              </Link>
            )}
          </aside>

          <section>
            <div className="rounded-3xl border border-border bg-card p-6 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-display text-lg font-semibold">
                  Recent orders
                </div>
                {inTransit > 0 && (
                  <span className="chip">
                    <Truck size={12} /> {inTransit} in transit
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center">
                  <Package size={22} className="text-text-2" />
                  <div className="mt-3 font-medium">No orders yet</div>
                  <p className="mt-1 max-w-xs text-sm text-text-2">
                    When you place your first order, it&apos;ll appear here so
                    you can track it.
                  </p>
                  <Link href="/shop" className="btn btn-primary mt-5">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {orders.map((o, i) => (
                    <motion.li
                      key={o.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.04 }}
                      className="flex items-center gap-4 py-4"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-card">
                        {o.firstItem?.image ? (
                          <Image
                            src={o.firstItem.image}
                            alt={o.firstItem.name ?? ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Package
                            size={20}
                            className="absolute inset-0 m-auto text-text-2"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {o.firstItem?.name ?? "Order"}
                        </div>
                        <div className="text-xs text-text-2">
                          #{o.orderNumber} · placed {timeAgo(o.createdAt)}
                        </div>
                      </div>
                      <span
                        className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 md:inline ${
                          statusStyle[o.status] ??
                          "bg-card-2 text-text-2 ring-border"
                        }`}
                      >
                        {o.status}
                      </span>
                      <span className="font-display text-sm font-semibold">
                        {formatPrice(o.total)}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>

      <EditProfileModal
        open={editing}
        onClose={() => setEditing(false)}
        initialFullName={fullName}
        initialAvatarUrl={avatarUrl}
      />
    </div>
  );
}

function Stat({ l, v }: { l: string; v: string }) {
  return (
    <div className="rounded-xl bg-card py-2">
      <div className="text-sm font-semibold">{v}</div>
      <div className="text-[10px] uppercase tracking-widest text-text-2">{l}</div>
    </div>
  );
}
