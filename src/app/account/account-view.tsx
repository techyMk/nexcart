"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Check,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Moon,
  Package,
  Pencil,
  Plus,
  Settings,
  Shield,
  Sun,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useOrders, type Order } from "@/store/orders";
import { useAddresses, type SavedAddress } from "@/store/addresses";
import { usePayments, type CardBrand, type PaymentMethod } from "@/store/payments";
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

type Tab = "orders" | "addresses" | "payments" | "settings";

const statusStyle: Record<Order["status"], string> = {
  processing: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
  shipped: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  delivered: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function deriveTier(spent: number) {
  return spent >= 5000 ? "Platinum" : spent >= 1000 ? "Gold" : "Silver";
}

export function AccountView({
  email,
  fullName,
  avatarUrl,
  memberSinceYear,
  role,
}: AccountViewProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("orders");

  // All three new stores persist to localStorage — gate rendering of their
  // data behind hydration to avoid SSR mismatches (same pattern as wishlist).
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const storeOrders = useOrders((s) => s.orders);
  const liveOrders = hydrated ? storeOrders : [];
  const liveCount = liveOrders.length;
  const liveSpent = liveOrders.reduce((acc, o) => acc + o.total, 0);
  const liveTier = deriveTier(liveSpent);

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
              Member since {memberSinceYear} · {liveTier} tier · {liveCount}{" "}
              {liveCount === 1 ? "order" : "orders"}
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
                <Stat l="Orders" v={String(liveCount)} />
                <Stat l="Spent" v={formatPrice(liveSpent)} />
                <Stat l="Tier" v={liveTier} />
              </div>
              <button
                onClick={() => setEditing(true)}
                className="btn btn-ghost btn-sm mt-4 w-full"
              >
                <Pencil size={12} /> Edit profile
              </button>
            </div>

            <nav className="space-y-1 rounded-3xl border border-border bg-card p-3 backdrop-blur-xl">
              <TabButton
                Icon={Package}
                label="Orders"
                active={tab === "orders"}
                onClick={() => setTab("orders")}
              />
              <Link
                href="/wishlist"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-text-2 transition hover:bg-card-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
              >
                <Heart size={15} />
                Wishlist
              </Link>
              <TabButton
                Icon={MapPin}
                label="Addresses"
                active={tab === "addresses"}
                onClick={() => setTab("addresses")}
              />
              <TabButton
                Icon={CreditCard}
                label="Payments"
                active={tab === "payments"}
                onClick={() => setTab("payments")}
              />
              <TabButton
                Icon={Settings}
                label="Settings"
                active={tab === "settings"}
                onClick={() => setTab("settings")}
              />
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
              {tab === "orders" && <OrdersPanel hydrated={hydrated} />}
              {tab === "addresses" && <AddressesPanel hydrated={hydrated} />}
              {tab === "payments" && <PaymentsPanel hydrated={hydrated} />}
              {tab === "settings" && (
                <SettingsPanel signingOut={signingOut} onSignOut={onSignOut} />
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

/* ---------------------------------------------------------------- sidebar */

function TabButton({
  Icon,
  label,
  active,
  onClick,
}: {
  Icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 ${
        active
          ? "bg-card-2 text-text ring-1 ring-border"
          : "text-text-2 hover:bg-card-2 hover:text-text"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
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

function PanelSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-card-2" />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- orders */

function OrdersPanel({ hydrated }: { hydrated: boolean }) {
  const storeOrders = useOrders((s) => s.orders);
  const orders = hydrated ? storeOrders : [];
  const inTransit = orders.filter((o) =>
    ["processing", "shipped"].includes(o.status),
  ).length;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Your orders</div>
        {inTransit > 0 && (
          <span className="chip">
            <Truck size={12} /> {inTransit} in transit
          </span>
        )}
      </div>

      {!hydrated ? (
        <PanelSkeleton />
      ) : orders.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center">
          <Package size={22} className="text-text-2" />
          <div className="mt-3 font-medium">No orders yet</div>
          <p className="mt-1 max-w-xs text-sm text-text-2">
            When you place your first order, it&apos;ll appear here so you can
            track it.
          </p>
          <Link href="/shop" className="btn btn-primary mt-5">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o, i) => (
            <motion.li
              key={o.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i, 6) * 0.04 }}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="max-w-[10rem] truncate font-mono text-xs text-text-2">
                  #{o.id}
                </span>
                <span className="text-xs text-text-2">
                  {new Date(o.placedAt).toLocaleDateString()}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ${
                    statusStyle[o.status] ?? "bg-card-2 text-text-2 ring-border"
                  }`}
                >
                  {o.status}
                </span>
                <span className="ml-auto font-display text-sm font-semibold">
                  {formatPrice(o.total)}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-border">
                {o.lines.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 py-2">
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-card-2">
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <Link
                      href={`/product/${l.slug}`}
                      className="min-w-0 flex-1 truncate text-sm hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
                    >
                      {l.name}
                    </Link>
                    <span className="shrink-0 text-xs text-text-2">
                      {l.quantity} × {formatPrice(l.price)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- addresses */

type AddressFields = Omit<SavedAddress, "id" | "isDefault">;

const EMPTY_ADDRESS: AddressFields = {
  label: "",
  first: "",
  last: "",
  email: "",
  address: "",
  city: "",
  postal: "",
  country: "",
};

function AddressesPanel({ hydrated }: { hydrated: boolean }) {
  const items = useAddresses((s) => s.items);
  const add = useAddresses((s) => s.add);
  const update = useAddresses((s) => s.update);
  const remove = useAddresses((s) => s.remove);
  const setDefault = useAddresses((s) => s.setDefault);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = hydrated ? items : [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Addresses</div>
        {hydrated && list.length > 0 && !adding && (
          <button
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            className="btn btn-ghost btn-sm"
          >
            <Plus size={14} /> Add address
          </button>
        )}
      </div>

      {!hydrated ? (
        <PanelSkeleton rows={2} />
      ) : (
        <div className="space-y-4">
          {adding && (
            <AddressForm
              submitLabel="Save address"
              onCancel={() => setAdding(false)}
              onSubmit={(fields) => {
                add(fields);
                setAdding(false);
              }}
            />
          )}

          {list.length === 0 && !adding ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center">
              <MapPin size={22} className="text-text-2" />
              <div className="mt-3 font-medium">No addresses saved</div>
              <p className="mt-1 max-w-xs text-sm text-text-2">
                Add a delivery address and checkout will prefill it for you.
              </p>
              <button
                onClick={() => setAdding(true)}
                className="btn btn-primary mt-5"
              >
                <Plus size={14} /> Add address
              </button>
            </div>
          ) : (
            list.map((a) =>
              editingId === a.id ? (
                <AddressForm
                  key={a.id}
                  initial={a}
                  submitLabel="Save changes"
                  onCancel={() => setEditingId(null)}
                  onSubmit={(fields) => {
                    update(a.id, fields);
                    setEditingId(null);
                  }}
                />
              ) : (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">{a.label}</span>
                        {a.isDefault && (
                          <span className="chip chip-success">
                            <Check size={11} /> Default
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-sm">
                        {a.first} {a.last}
                      </div>
                      <div className="mt-0.5 text-xs text-text-2">
                        {a.address}, {a.city} {a.postal}, {a.country}
                      </div>
                      <div className="text-xs text-text-2">{a.email}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        aria-label={`Edit ${a.label}`}
                        onClick={() => {
                          setAdding(false);
                          setEditingId(a.id);
                        }}
                        className="grid h-8 w-8 place-items-center rounded-lg text-text-2 transition hover:bg-card-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        aria-label={`Delete ${a.label}`}
                        onClick={() => remove(a.id)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-text-2 transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {!a.isDefault && (
                    <button
                      onClick={() => setDefault(a.id)}
                      className="btn btn-ghost btn-sm mt-3"
                    >
                      Set as default
                    </button>
                  )}
                </motion.div>
              ),
            )
          )}
        </div>
      )}
    </div>
  );
}

function AddressForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: AddressFields;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (fields: AddressFields) => void;
}) {
  const [f, setF] = useState<AddressFields>(initial ?? EMPTY_ADDRESS);
  const [error, setError] = useState("");

  function set<K extends keyof AddressFields>(key: K, value: string) {
    setF((prev) => ({ ...prev, [key]: value }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const required: Array<keyof AddressFields> = [
      "label",
      "first",
      "last",
      "email",
      "address",
      "city",
      "postal",
      "country",
    ];
    if (required.some((k) => !f[k].trim())) {
      setError("Please fill in all fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(f.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    onSubmit({
      label: f.label.trim(),
      first: f.first.trim(),
      last: f.last.trim(),
      email: f.email.trim(),
      address: f.address.trim(),
      city: f.city.trim(),
      postal: f.postal.trim(),
      country: f.country.trim(),
    });
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">
          {initial ? "Edit address" : "New address"}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="grid h-8 w-8 place-items-center rounded-lg text-text-2 transition hover:bg-card-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          <X size={14} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          className="sm:col-span-2"
          label="Label"
          value={f.label}
          onChange={(v) => set("label", v)}
          placeholder="Home, Office…"
        />
        <Field label="First name" value={f.first} onChange={(v) => set("first", v)} />
        <Field label="Last name" value={f.last} onChange={(v) => set("last", v)} />
        <Field
          className="sm:col-span-2"
          label="Email"
          type="email"
          value={f.email}
          onChange={(v) => set("email", v)}
        />
        <Field
          className="sm:col-span-2"
          label="Address"
          value={f.address}
          onChange={(v) => set("address", v)}
        />
        <Field label="City" value={f.city} onChange={(v) => set("city", v)} />
        <Field label="Postal code" value={f.postal} onChange={(v) => set("postal", v)} />
        <Field
          className="sm:col-span-2"
          label="Country"
          value={f.country}
          onChange={(v) => set("country", v)}
        />
      </div>
      {error && <p className="mt-3 text-xs text-danger">{error}</p>}
      <div className="mt-4 flex items-center gap-2">
        <button type="submit" className="btn btn-primary btn-sm">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
  inputMode,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  inputMode?: "numeric";
  maxLength?: number;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-text-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        maxLength={maxLength}
        className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-text-2/60 transition focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
      />
    </label>
  );
}

/* --------------------------------------------------------------- payments */

function deriveBrand(digits: string): CardBrand {
  if (digits.startsWith("4")) return "visa";
  const two = Number(digits.slice(0, 2));
  if (two >= 51 && two <= 55) return "mastercard";
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex";
  if (digits.startsWith("60") || digits.startsWith("65") || digits.startsWith("81"))
    return "rupay";
  return "card";
}

function brandLabel(brand: CardBrand) {
  return brand.charAt(0).toUpperCase() + brand.slice(1);
}

function PaymentsPanel({ hydrated }: { hydrated: boolean }) {
  const items = usePayments((s) => s.items);
  const add = usePayments((s) => s.add);
  const remove = usePayments((s) => s.remove);
  const setDefault = usePayments((s) => s.setDefault);
  const [adding, setAdding] = useState(false);

  const list = hydrated ? items : [];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="font-display text-lg font-semibold">Payment methods</div>
        {hydrated && list.length > 0 && !adding && (
          <button onClick={() => setAdding(true)} className="btn btn-ghost btn-sm">
            <Plus size={14} /> Add card
          </button>
        )}
      </div>

      {!hydrated ? (
        <PanelSkeleton rows={2} />
      ) : (
        <div className="space-y-4">
          {adding && (
            <CardForm
              onCancel={() => setAdding(false)}
              onSubmit={(m) => {
                add(m);
                setAdding(false);
              }}
            />
          )}

          {list.length === 0 && !adding ? (
            <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-center">
              <CreditCard size={22} className="text-text-2" />
              <div className="mt-3 font-medium">No saved cards</div>
              <p className="mt-1 max-w-xs text-sm text-text-2">
                Save a card for faster checkout. We only store the brand and
                last 4 digits.
              </p>
              <button
                onClick={() => setAdding(true)}
                className="btn btn-primary mt-5"
              >
                <Plus size={14} /> Add card
              </button>
            </div>
          ) : (
            list.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card-2 text-text-2 ring-1 ring-border">
                      <CreditCard size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold">
                          {brandLabel(m.brand)} •••• {m.last4}
                        </span>
                        {m.isDefault && (
                          <span className="chip chip-success">
                            <Check size={11} /> Default
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-text-2">
                        Exp {String(m.expMonth).padStart(2, "0")}/
                        {String(m.expYear % 100).padStart(2, "0")} · {m.holder}
                      </div>
                    </div>
                  </div>
                  <button
                    aria-label={`Delete card ending ${m.last4}`}
                    onClick={() => remove(m.id)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-text-2 transition hover:bg-danger/10 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {!m.isDefault && (
                  <button
                    onClick={() => setDefault(m.id)}
                    className="btn btn-ghost btn-sm mt-3"
                  >
                    Set as default
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function CardForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (m: Omit<PaymentMethod, "id" | "isDefault">) => void;
}) {
  const [holder, setHolder] = useState("");
  // Controlled input only — the full number is derived to brand + last4 on
  // submit and never stored anywhere else.
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");

  function onNumberChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    setNumber(digits.replace(/(\d{4})(?=\d)/g, "$1 "));
  }

  function onExpiryChange(v: string) {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    const digits = number.replace(/\s/g, "");
    if (!holder.trim()) {
      setError("Enter the cardholder name.");
      return;
    }
    if (digits.length < 15 || digits.length > 16) {
      setError("Card number must be 15–16 digits.");
      return;
    }
    const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
    if (!match) {
      setError("Expiry must be in MM/YY format.");
      return;
    }
    const expMonth = Number(match[1]);
    const expYear = 2000 + Number(match[2]);
    if (expMonth < 1 || expMonth > 12) {
      setError("Expiry month must be between 01 and 12.");
      return;
    }
    const now = new Date();
    if (
      expYear < now.getFullYear() ||
      (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
    ) {
      setError("This card has already expired.");
      return;
    }
    setError("");
    onSubmit({
      brand: deriveBrand(digits),
      last4: digits.slice(-4),
      expMonth,
      expYear,
      holder: holder.trim(),
    });
    // Discard the full number immediately after deriving brand + last4.
    setNumber("");
    setExpiry("");
    setHolder("");
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold">New card</div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="grid h-8 w-8 place-items-center rounded-lg text-text-2 transition hover:bg-card-2 hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          <X size={14} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          className="sm:col-span-2"
          label="Cardholder name"
          value={holder}
          onChange={setHolder}
          placeholder="Name on card"
        />
        <Field
          className="sm:col-span-2"
          label="Card number"
          value={number}
          onChange={onNumberChange}
          placeholder="4242 4242 4242 4242"
          inputMode="numeric"
          maxLength={19}
        />
        <Field
          label="Expiry"
          value={expiry}
          onChange={onExpiryChange}
          placeholder="MM/YY"
          inputMode="numeric"
          maxLength={5}
        />
      </div>
      <p className="mt-3 text-xs text-text-2">
        We only store the brand and last 4 digits.
      </p>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      <div className="mt-4 flex items-center gap-2">
        <button type="submit" className="btn btn-primary btn-sm">
          Save card
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* --------------------------------------------------------------- settings */

const MARKETING_KEY = "nexcart-marketing-emails";

function SettingsPanel({
  signingOut,
  onSignOut,
}: {
  signingOut: boolean;
  onSignOut: () => void;
}) {
  const { toggle: toggleTheme } = useTheme();
  const [marketing, setMarketing] = useState(false);
  const [prefHydrated, setPrefHydrated] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem(MARKETING_KEY);
      setMarketing(v === "1" || v === "true");
    } catch {
      // Storage unavailable — leave the default.
    }
    setPrefHydrated(true);
  }, []);

  function toggleMarketing() {
    setMarketing((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(MARKETING_KEY, next ? "1" : "0");
      } catch {
        // Storage unavailable — preference still flips for this session.
      }
      return next;
    });
  }

  function onClearLocalData() {
    if (
      !window.confirm(
        "Clear all locally saved shopping data? This removes your cart, wishlist, orders, addresses and saved cards from this browser.",
      )
    )
      return;
    useCart.getState().clear();
    useWishlist.getState().clear();
    useOrders.setState({ orders: [] });
    useAddresses.setState({ items: [] });
    usePayments.setState({ items: [] });
    for (const store of [useCart, useWishlist, useOrders, useAddresses, usePayments]) {
      try {
        store.persist.clearStorage();
      } catch {
        // Storage unavailable — in-memory state is already cleared.
      }
    }
  }

  return (
    <div>
      <div className="mb-5 font-display text-lg font-semibold">Settings</div>
      <div className="divide-y divide-border">
        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="text-sm font-medium">
              Theme
              <span className="ml-2 text-xs text-text-2">
                <span className="dark:hidden">Light</span>
                <span className="hidden dark:inline">Dark</span>
              </span>
            </div>
            <p className="mt-0.5 text-xs text-text-2">
              Switch between the dark and light look.
            </p>
          </div>
          <button onClick={toggleTheme} aria-label="Toggle theme" className="btn btn-ghost btn-sm">
            <Sun size={14} className="hidden dark:block" />
            <Moon size={14} className="dark:hidden" />
            <span className="hidden dark:inline">Switch to light</span>
            <span className="dark:hidden">Switch to dark</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="text-sm font-medium">Marketing emails</div>
            <p className="mt-0.5 text-xs text-text-2">
              Drops, restocks and member-only offers.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={marketing}
            aria-label="Toggle marketing emails"
            disabled={!prefHydrated}
            onClick={toggleMarketing}
            className={`relative h-6 w-11 shrink-0 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40 disabled:opacity-60 ${
              marketing
                ? "border-primary-400/60 bg-primary-500/60"
                : "border-border bg-card-2"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-text transition-transform ${
                marketing ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="text-sm font-medium">Clear local data</div>
            <p className="mt-0.5 text-xs text-text-2">
              Removes cart, wishlist, orders, addresses and saved cards from
              this browser.
            </p>
          </div>
          <button
            onClick={onClearLocalData}
            className="inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger transition hover:bg-danger/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
          >
            <Trash2 size={14} /> Clear data
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <div className="text-sm font-medium">Sign out</div>
            <p className="mt-0.5 text-xs text-text-2">
              End your session on this device.
            </p>
          </div>
          <button
            onClick={onSignOut}
            disabled={signingOut}
            className="btn btn-ghost btn-sm disabled:opacity-60"
          >
            <LogOut size={14} /> {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}
