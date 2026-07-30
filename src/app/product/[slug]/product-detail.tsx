"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";
import { type Product } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { ProductCard } from "@/components/product-card";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const [color, setColor] = useState(product.colors?.[0]?.name);
  const [tab, setTab] = useState<"overview" | "specs" | "reviews">("overview");
  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);

  return (
    <div className="pt-24 md:pt-28">
      <div className="container">
        <nav className="mb-6 flex items-center gap-2 text-xs text-text-2">
          <Link href="/" className="hover:text-text">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-text">Shop</Link>
          <span>/</span>
          <Link
            href={`/shop?cat=${product.categorySlug}`}
            className="hover:text-text"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-text">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-card backdrop-blur-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[active]}
                    alt={product.name}
                    fill
                    sizes="(max-width:1024px) 100vw, 600px"
                    className="object-cover"
                    priority
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute left-4 top-4 flex gap-1.5">
                {product.badge && (
                  <span className="rounded-full bg-gradient-brand px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white ring-1 ring-white/20">
                    {product.badge === "AI PICK" && <span className="mr-1">✨</span>}
                    {product.badge}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setActive(i)}
                  className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                    active === i
                      ? "border-primary-400 ring-2 ring-primary-400/40"
                      : "border-border hover:border-text/20"
                  } bg-card`}
                >
                  <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="chip chip-neutral">{product.brand}</span>
              <span className="chip chip-neutral">{product.category}</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <div className="inline-flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < Math.round(product.rating) ? "fill-current" : "opacity-30"}
                  />
                ))}
                <span className="ml-1 text-text">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-text-2">{product.reviews.toLocaleString()} reviews</span>
              {product.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-rose-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Sold out
                </span>
              ) : product.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Only {product.stock} left — order soon
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  In stock
                </span>
              )}
            </div>
            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-4xl font-semibold tracking-tight">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-text-2 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success ring-1 ring-success/30">
                    -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
                  </span>
                </>
              )}
            </div>
            <p className="mt-6 text-text-2">{product.description}</p>

            {product.colors && (
              <div className="mt-6">
                <div className="mb-2 text-xs uppercase tracking-widest text-text-2">
                  Color: <span className="text-text">{color}</span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setColor(c.name)}
                      style={{ background: c.hex }}
                      className={`relative h-9 w-9 rounded-full ring-1 ring-border transition ${
                        color === c.name ? "ring-2 ring-primary-300" : ""
                      }`}
                      aria-label={c.name}
                    >
                      {color === c.name && (
                        <Check
                          size={14}
                          className="absolute inset-0 m-auto text-white mix-blend-difference"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-border bg-card">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid h-10 w-10 place-items-center text-text-2 hover:text-text"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="grid h-10 w-10 place-items-center text-text-2 hover:text-text"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                disabled={product.stock === 0}
                onClick={() => {
                  add(
                    {
                      id: product.id,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      image: product.images[0],
                    },
                    qty,
                  );
                }}
                className="btn btn-primary flex-1 min-w-[200px] disabled:opacity-40"
              >
                {product.stock === 0 ? (
                  "Notify me"
                ) : (
                  <>
                    <ShoppingBag size={14} /> Add to cart · {formatPrice(product.price * qty)}
                  </>
                )}
              </button>
              <button
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                aria-pressed={wishlisted}
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    oldPrice: product.oldPrice,
                    image: product.images[0],
                    category: product.category,
                  })
                }
                className={`grid h-11 w-11 place-items-center rounded-full border border-border bg-card transition ${
                  wishlisted
                    ? "text-rose-400 ring-1 ring-rose-400/30"
                    : "text-text-2 hover:text-text"
                }`}
              >
                <Heart size={16} className={wishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 rounded-3xl border border-border bg-card p-2 text-xs">
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5">
                <Truck size={15} className="text-primary-300" />
                <div>
                  <div className="text-text">Free delivery</div>
                  <div className="text-text-2">3–5 business days</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5">
                <RotateCcw size={15} className="text-primary-300" />
                <div>
                  <div className="text-text">7-day returns</div>
                  <div className="text-text-2">No questions asked</div>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-2xl px-3 py-2.5">
                <ShieldCheck size={15} className="text-primary-300" />
                <div>
                  <div className="text-text">2-year warranty</div>
                  <div className="text-text-2">Official cover</div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center gap-1 border-b border-border">
                {(["overview", "specs", "reviews"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`relative px-4 py-3 text-sm capitalize ${
                      tab === t ? "text-text" : "text-text-2 hover:text-text"
                    }`}
                  >
                    {t}
                    {tab === t && (
                      <motion.span
                        layoutId="tab-line"
                        className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-gradient-brand"
                      />
                    )}
                  </button>
                ))}
              </div>
              <div className="pt-5 text-sm text-text-2">
                {tab === "overview" && <p>{product.description}</p>}
                {tab === "specs" && (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 rounded-xl border border-border bg-card p-3 text-text"
                      >
                        <Check size={14} className="mt-0.5 text-emerald-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {tab === "reviews" && (
                  <p>
                    {product.reviews.toLocaleString()} verified reviews with an
                    average rating of {product.rating.toFixed(1)}/5. Highlights:
                    “stunning build”, “fast delivery”, “great packaging”.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="section">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <div className="section-eyebrow">Pairs perfectly</div>
              <h2 className="section-title mt-2">
                You might also <span className="text-gradient-brand">love</span>
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
