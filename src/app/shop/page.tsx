"use client";

import { Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter, Percent, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { categories, products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Select } from "@/components/select";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageInner />
    </Suspense>
  );
}

function ShopPageInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | "all">(() => sp.get("cat") ?? "all");
  const [sort, setSort] = useState("featured");
  const [price, setPrice] = useState<[number, number]>([0, 3000]);
  const [aiOnly, setAiOnly] = useState(() => sp.get("ai") === "1");
  const [saleOnly, setSaleOnly] = useState(() => sp.get("sale") === "1");
  const [openFilters, setOpenFilters] = useState(false);

  // URL → state: navbar links (Shop, AI Picks, Deals) navigate to /shop with
  // different query params without remounting this component, so the lazy
  // initializers above never re-run — watch the params and sync state instead.
  useEffect(() => {
    const urlCat = sp.get("cat") ?? "all";
    const urlAi = sp.get("ai") === "1";
    const urlSale = sp.get("sale") === "1";
    setCat((v) => (v === urlCat ? v : urlCat));
    setAiOnly((v) => (v === urlAi ? v : urlAi));
    setSaleOnly((v) => (v === urlSale ? v : urlSale));
  }, [sp]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (cat !== "all") params.set("cat", cat);
    if (aiOnly) params.set("ai", "1");
    if (saleOnly) params.set("sale", "1");
    const qs = params.toString();
    if (qs === sp.toString()) return;
    router.replace(qs ? `/shop?${qs}` : "/shop", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, aiOnly, saleOnly, router]);

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && p.categorySlug !== cat) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (aiOnly && p.badge !== "AI PICK") return false;
      if (saleOnly && p.oldPrice == null && p.badge !== "SALE") return false;
      return true;
    });
    switch (sort) {
      case "price-asc":
        r = [...r].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        r = [...r].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        r = [...r].sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        r = [...r].sort((a, b) => b.id - a.id);
        break;
      default:
        r = [...r].sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    }
    return r;
  }, [q, cat, sort, price, aiOnly, saleOnly]);

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="section-eyebrow">
              {aiOnly ? "Curated for you" : saleOnly ? "Limited time" : "The catalog"}
            </div>
            <h1 className="section-title mt-2">
              {aiOnly ? (
                <>
                  AI <span className="text-gradient-brand">Picks</span>
                </>
              ) : saleOnly ? (
                <>
                  Hot <span className="text-gradient-brand">deals</span>
                </>
              ) : (
                <>
                  All <span className="text-gradient-brand">products</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-text-2">
              {aiOnly
                ? `${filtered.length} products our AI rates a perfect match`
                : saleOnly
                  ? `${filtered.length} products with live discounts`
                  : `${filtered.length} products · curated and ranked by AI`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products…"
                className="h-10 w-64 rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
              />
            </div>
            <Select
              value={sort}
              onChange={setSort}
              options={sortOptions}
              ariaLabel="Sort products"
            />
            <button
              onClick={() => setOpenFilters((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm lg:hidden"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside
            className={`${openFilters ? "block" : "hidden"} lg:block`}
          >
            <div className="card sticky top-24 space-y-6 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Filter size={14} /> Filters
                </div>
                <button
                  onClick={() => {
                    setCat("all");
                    setPrice([0, 3000]);
                    setQ("");
                    setAiOnly(false);
                    setSaleOnly(false);
                  }}
                  className="text-xs text-text-2 hover:text-text"
                >
                  Reset
                </button>
              </div>

              <div>
                <div className="mb-3 text-xs uppercase tracking-widest text-text-2">
                  Categories
                </div>
                <ul className="space-y-1.5">
                  <FilterRow
                    active={cat === "all"}
                    onClick={() => setCat("all")}
                    icon="✨"
                    label="All categories"
                  />
                  {categories.map((c) => (
                    <FilterRow
                      key={c.id}
                      active={cat === c.slug}
                      onClick={() => setCat(c.slug)}
                      icon={c.icon}
                      label={c.name}
                      hint={`${c.count}`}
                    />
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-text-2">
                  Price
                  <span className="text-text">${price[0]} – ${price[1]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3000}
                  step={50}
                  value={price[1]}
                  onChange={(e) => setPrice([price[0], +e.target.value])}
                  aria-label="Maximum price"
                  aria-valuetext={`$${price[1]}`}
                  className="w-full accent-primary-500"
                />
              </div>

              <ToggleRow
                checked={aiOnly}
                onChange={() => setAiOnly((v) => !v)}
                icon={<Sparkles size={14} className="text-primary-600 dark:text-primary-300" />}
                label="AI picks only"
              />

              <ToggleRow
                checked={saleOnly}
                onChange={() => setSaleOnly((v) => !v)}
                icon={<Percent size={14} className="text-primary-600 dark:text-primary-300" />}
                label="On sale"
              />
            </div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="card p-16 text-center">
                <X size={28} className="mx-auto text-text-2" />
                <div className="mt-3 font-display text-lg">No products match</div>
                <p className="mt-1 text-sm text-text-2">
                  Try widening your filters or clearing the search.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  icon,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-3 py-2.5">
      <span className="flex items-center gap-2 text-sm">
        {icon} {label}
      </span>
      <span className="relative inline-flex h-5 w-9 shrink-0">
        <input
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-card-2 transition peer-checked:bg-gradient-brand peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400" />
        <span className="pointer-events-none absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white ring-1 ring-black/10 transition-transform peer-checked:translate-x-3.5" />
      </span>
    </label>
  );
}

function FilterRow({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  hint?: string;
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
          active
            ? "bg-card-2 text-text ring-1 ring-border"
            : "text-text-2 hover:bg-card-2 hover:text-text"
        }`}
      >
        <span className="flex items-center gap-2">
          <span>{icon}</span>
          {label}
        </span>
        {hint && <span className="text-xs text-text-2">{hint}</span>}
      </button>
    </li>
  );
}
