"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { FREE_SHIPPING_THRESHOLD, STANDARD_SHIPPING } from "@/lib/constants";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<"idle" | "applied" | "invalid">("idle");
  useEffect(() => setHydrated(true), []);
  const subtotal = lines.reduce((a, l) => a + l.price * l.quantity, 0);
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0
      ? 0
      : STANDARD_SHIPPING;
  const tax = subtotal * 0.07;
  const discount = promo === "applied" ? subtotal * 0.1 : 0;
  const total = subtotal + shipping + tax - discount;
  const recs = products.filter((p) => p.badge === "AI PICK").slice(0, 4);

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="mb-10">
          <div className="section-eyebrow">Your bag</div>
          <h1 className="section-title mt-2">
            Shopping <span className="text-gradient-brand">cart</span>
          </h1>
        </div>

        {!hydrated ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl bg-card"
              />
            ))}
          </div>
        ) : lines.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-border bg-card p-20 text-center backdrop-blur-xl">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-brand text-white dark:shadow-glow">
              <ShoppingBag size={20} />
            </div>
            <h2 className="mt-5 font-display text-xl">Your cart is empty</h2>
            <p className="mt-1 text-sm text-text-2">
              Let&apos;s find products you&apos;ll love.
            </p>
            <Link href="/shop" className="btn btn-primary mt-6">
              Browse the catalog <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="overflow-hidden rounded-3xl border border-border bg-card backdrop-blur-xl">
              <ul className="divide-y divide-border">
                {lines.map((l) => (
                  <li key={l.id} className="flex gap-4 p-5">
                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-card">
                      <Image src={l.image} alt={l.name} fill sizes="112px" className="object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/product/${l.slug}`}
                          className="font-medium hover:text-primary-300"
                        >
                          {l.name}
                        </Link>
                        <button
                          onClick={() => remove(l.id)}
                          className="text-text-2 hover:text-danger"
                          aria-label="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="inline-flex items-center rounded-full border border-border bg-card">
                          <button
                            onClick={() => setQty(l.id, l.quantity - 1)}
                            className="grid h-9 w-9 place-items-center text-text-2 hover:text-text"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-sm">{l.quantity}</span>
                          <button
                            onClick={() => setQty(l.id, l.quantity + 1)}
                            className="grid h-9 w-9 place-items-center text-text-2 hover:text-text"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-lg font-semibold">
                            {formatPrice(l.price * l.quantity)}
                          </div>
                          <div className="text-xs text-text-2">
                            {formatPrice(l.price)} each
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <aside className="self-start rounded-3xl border border-border bg-card p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-widest text-text-2">
                Order summary
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row
                  label="Shipping"
                  value={shipping === 0 ? "Free" : formatPrice(shipping)}
                />
                <Row label="Estimated tax" value={formatPrice(tax)} />
                {promo === "applied" && (
                  <div className="text-success">
                    ✓ WELCOME10 applied — you saved {formatPrice(discount)}
                  </div>
                )}
              </div>
              <div className="my-4 h-px bg-card-2" />
              <Row label="Total" value={formatPrice(total)} bold />

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setPromo(
                    code.trim().toUpperCase() === "WELCOME10"
                      ? "applied"
                      : "invalid",
                  );
                }}
                className="mt-5 flex overflow-hidden rounded-full border border-border bg-card p-1 transition focus-within:border-primary-400/50 focus-within:ring-2 focus-within:ring-primary-400/20"
              >
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    if (promo === "invalid") setPromo("idle");
                  }}
                  placeholder="Promo code"
                  aria-label="Promo code"
                  className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-text-2"
                />
                <button className="rounded-full bg-card-2 px-4 text-sm font-medium hover:bg-text/10">
                  Apply
                </button>
              </form>
              {promo === "invalid" && (
                <p className="mt-2 px-2 text-xs text-rose-300">
                  That code isn&rsquo;t valid
                </p>
              )}

              <Link href="/checkout" className="btn btn-primary mt-5 w-full">
                Checkout securely <ArrowRight size={16} />
              </Link>
              <Link
                href="/shop"
                className="mt-2 block text-center text-sm text-text-2 hover:text-text"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}

        {hydrated && lines.length > 0 && (
          <section className="section">
            <div className="mb-8">
              <div className="section-eyebrow">AI upsell</div>
              <h2 className="section-title mt-2">
                Complete the <span className="text-gradient-brand">setup</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {recs.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? "text-text" : "text-text-2"}>{label}</span>
      <span className={bold ? "font-display text-lg font-semibold" : ""}>
        {value}
      </span>
    </div>
  );
}
