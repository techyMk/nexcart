import {
  AlertTriangle,
  ArrowUpRight,
  Boxes,
  Brain,
  CheckCircle2,
  FileText,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Signal = {
  tone: "success" | "warning" | "info";
  Icon: typeof Sparkles;
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
};

const toneStyles: Record<Signal["tone"], string> = {
  success: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 ring-amber-500/30",
  info: "bg-primary-500/15 text-primary-200 ring-primary-500/30",
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function AdminAIInsights() {
  const supabase = createClient();

  // Parallel fetches against existing tables — falls back gracefully on errors.
  const [
    productsCount,
    lowStockCount,
    customersCount,
    ordersCount,
    kbDocsCount,
    kbChunksCount,
    lowStockRows,
    revenueRows,
    recentDocs,
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .lt("stock", 10),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("kb_documents")
      .select("*", { count: "exact", head: true })
      .eq("status", "ready"),
    supabase.from("kb_chunks").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("id, name, slug, stock, category:categories(name)")
      .lt("stock", 10)
      .order("stock", { ascending: true })
      .limit(5),
    supabase
      .from("revenue_by_day")
      .select("day, revenue, orders")
      .limit(14),
    supabase
      .from("kb_documents")
      .select("id, title, chunk_count, status, created_at")
      .eq("status", "ready")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalProducts = productsCount.count ?? 0;
  const totalLowStock = lowStockCount.count ?? 0;
  const totalCustomers = customersCount.count ?? 0;
  const totalOrders = ordersCount.count ?? 0;
  const totalKbDocs = kbDocsCount.count ?? 0;
  const totalKbChunks = kbChunksCount.count ?? 0;
  const lowStock = lowStockRows.data ?? [];
  const revenue = (revenueRows.data ?? [])
    .slice()
    .reverse() as { day: string; revenue: number; orders: number }[];
  const docs = recentDocs.data ?? [];

  const totalRevenue = revenue.reduce(
    (acc, r) => acc + Number(r.revenue ?? 0),
    0,
  );
  const maxRevenue = revenue.reduce(
    (acc, r) => Math.max(acc, Number(r.revenue ?? 0)),
    1,
  );

  // Build live signals from real state
  const signals: Signal[] = [];

  if (totalLowStock > 0) {
    const sample = lowStock
      .slice(0, 3)
      .map((p) => p.name)
      .join(", ");
    signals.push({
      tone: "warning",
      Icon: AlertTriangle,
      title: `${totalLowStock} product${totalLowStock === 1 ? "" : "s"} running low`,
      body: `${sample}${totalLowStock > 3 ? ` and ${totalLowStock - 3} more` : ""} ${totalLowStock === 1 ? "is" : "are"} under 10 units. Restock to keep the storefront stocked.`,
      actionHref: "/admin/products",
      actionLabel: "Review stock",
    });
  } else if (totalProducts > 0) {
    signals.push({
      tone: "success",
      Icon: CheckCircle2,
      title: "Stock looks healthy",
      body: `All ${totalProducts} products have 10+ units in stock. No restock alerts.`,
      actionHref: "/admin/products",
      actionLabel: "Manage catalog",
    });
  }

  if (totalKbDocs === 0) {
    signals.push({
      tone: "info",
      Icon: Brain,
      title: "Knowledge base is empty",
      body: "Upload your company handbook so the AI assistant can answer customer questions about shipping, returns, warranties, and more.",
      actionHref: "/admin/knowledge",
      actionLabel: "Upload docs",
    });
  } else {
    signals.push({
      tone: "success",
      Icon: CheckCircle2,
      title: `Knowledge base ready · ${totalKbChunks.toLocaleString()} chunk${totalKbChunks === 1 ? "" : "s"}`,
      body: `Indexed across ${totalKbDocs} document${totalKbDocs === 1 ? "" : "s"}. The storefront chat assistant is grounding replies in this content.`,
      actionHref: "/admin/knowledge",
      actionLabel: "Manage docs",
    });
  }

  if (totalOrders === 0) {
    signals.push({
      tone: "info",
      Icon: ShoppingBag,
      title: "No orders yet",
      body: "Once a customer places an order, you'll see revenue trends, top categories, and conversion signals here.",
      actionHref: "/admin/orders",
      actionLabel: "Open orders",
    });
  } else {
    signals.push({
      tone: "success",
      Icon: TrendingUp,
      title: `${totalOrders.toLocaleString()} order${totalOrders === 1 ? "" : "s"} processed`,
      body: `Lifetime revenue: ${formatPrice(totalRevenue)} across all non-cancelled orders.`,
      actionHref: "/admin/orders",
      actionLabel: "All orders",
    });
  }

  const kpis = [
    {
      l: "Products",
      v: totalProducts.toLocaleString(),
      d:
        totalLowStock > 0
          ? `${totalLowStock} low stock`
          : "All stocked",
      down: totalLowStock > 0,
      Icon: Boxes,
    },
    {
      l: "Customers",
      v: totalCustomers.toLocaleString(),
      d: totalCustomers > 0 ? "Verified profiles" : "—",
      Icon: Users,
    },
    {
      l: "Orders",
      v: totalOrders.toLocaleString(),
      d: totalRevenue > 0 ? formatPrice(totalRevenue) : "No revenue yet",
      Icon: ShoppingBag,
    },
    {
      l: "KB chunks",
      v: totalKbChunks.toLocaleString(),
      d: `${totalKbDocs} doc${totalKbDocs === 1 ? "" : "s"} indexed`,
      Icon: Brain,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Intelligence</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            AI Insights
          </h1>
          <p className="mt-1 text-sm text-text-2">
            Live signals from your Supabase data — refreshes on every page load.
          </p>
        </div>
        <span className="chip">
          <Sparkles size={12} /> Copilot online
        </span>
      </div>

      {/* KPI cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.l}
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
              className={`mt-1 text-xs font-semibold ${
                k.down ? "text-amber-300" : "text-text-2"
              }`}
            >
              {k.d}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue chart + actions */}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Revenue · last 14 days</div>
              <div className="text-xs text-text-2">
                From the <code className="font-mono text-[11px]">revenue_by_day</code> view
              </div>
            </div>
            {totalRevenue > 0 && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 ring-1 ring-emerald-500/30">
                {formatPrice(totalRevenue)}
              </span>
            )}
          </div>

          {revenue.length === 0 ? (
            <div className="mt-6 grid h-48 place-items-center rounded-xl border border-dashed border-border text-center">
              <div>
                <ShoppingBag size={20} className="mx-auto text-text-2" />
                <div className="mt-2 text-sm font-medium">No orders yet</div>
                <div className="text-xs text-text-2">
                  This chart fills as orders flow.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mt-6 flex h-48 items-end gap-1.5">
                {revenue.map((r, i) => (
                  <div
                    key={i}
                    title={`${r.day}: ${formatPrice(Number(r.revenue))} · ${r.orders} order${r.orders === 1 ? "" : "s"}`}
                    style={{
                      height: `${Math.max(4, (Number(r.revenue) / maxRevenue) * 100)}%`,
                    }}
                    className="flex-1 rounded-sm bg-gradient-to-t from-primary-700 to-accent-purple"
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                <Stat l="Total" v={formatPrice(totalRevenue)} />
                <Stat
                  l="Orders"
                  v={revenue
                    .reduce((acc, r) => acc + Number(r.orders), 0)
                    .toLocaleString()}
                />
                <Stat
                  l="Avg / day"
                  v={formatPrice(totalRevenue / Math.max(1, revenue.length))}
                />
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recommended actions</div>
              <div className="text-xs text-text-2">
                Built from your live data
              </div>
            </div>
            <span className="chip">
              <Sparkles size={12} /> {signals.length}
            </span>
          </div>
          <ul className="mt-5 space-y-3">
            {signals.map((s) => (
              <li
                key={s.title}
                className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <span
                  className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${toneStyles[s.tone]}`}
                >
                  <s.Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">{s.title}</div>
                  <p className="mt-0.5 text-sm text-text-2">{s.body}</p>
                  <Link
                    href={s.actionHref}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary-300 hover:text-text"
                  >
                    {s.actionLabel} <ArrowUpRight size={11} />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Low-stock + recently indexed docs */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <div className="text-sm font-semibold">Low-stock alerts</div>
              <div className="text-xs text-text-2">Products under 10 units</div>
            </div>
            <Link
              href="/admin/products"
              className="text-xs text-text-2 hover:text-text"
            >
              All products →
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <div className="grid place-items-center px-6 py-12 text-center">
              <CheckCircle2 size={20} className="text-emerald-300" />
              <div className="mt-2 text-sm font-medium">Everything's stocked</div>
              <div className="text-xs text-text-2">
                No products under 10 units.
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {lowStock.map((p) => {
                const cat = Array.isArray(p.category)
                  ? p.category[0]
                  : p.category;
                return (
                  <li
                    key={p.id}
                    className="flex items-center gap-4 p-4"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30">
                      <AlertTriangle size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${p.slug}`}
                        className="block truncate text-sm font-medium hover:text-primary-300"
                      >
                        {p.name}
                      </Link>
                      <div className="text-xs text-text-2">
                        {cat?.name ?? "Uncategorised"}
                      </div>
                    </div>
                    <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-300 ring-1 ring-rose-500/30">
                      {p.stock} left
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <div className="text-sm font-semibold">Knowledge base</div>
              <div className="text-xs text-text-2">
                Documents the AI uses to answer
              </div>
            </div>
            <Link
              href="/admin/knowledge"
              className="text-xs text-text-2 hover:text-text"
            >
              Manage →
            </Link>
          </div>
          {docs.length === 0 ? (
            <div className="grid place-items-center px-6 py-12 text-center">
              <Brain size={20} className="text-text-2" />
              <div className="mt-2 text-sm font-medium">No documents indexed</div>
              <Link
                href="/admin/knowledge"
                className="btn btn-primary mt-4 text-xs"
              >
                Upload your first doc
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {docs.map((d) => (
                <li key={d.id} className="flex items-center gap-4 p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30">
                    <FileText size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{d.title}</div>
                    <div className="text-xs text-text-2">
                      {d.chunk_count} chunks · indexed {timeAgo(d.created_at)}
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300 ring-1 ring-emerald-500/30">
                    Ready
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
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
