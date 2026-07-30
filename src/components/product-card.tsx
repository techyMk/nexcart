"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Heart, Plus, Star, Sparkles, Truck } from "lucide-react";
import { type Product } from "@/lib/data";
import { formatPrice, cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";

const badgeStyles: Record<string, string> = {
  HOT: "bg-orange-500 text-white ring-orange-300/40 shadow-md shadow-orange-500/30",
  NEW: "bg-emerald-500 text-white ring-emerald-300/40 shadow-md shadow-emerald-500/30",
  SALE: "bg-rose-500 text-white ring-rose-300/40 shadow-md shadow-rose-500/30",
  "AI PICK": "bg-gradient-brand text-white ring-white/30 shadow-glow",
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const wishlisted = useWishlist((s) => s.items.some((i) => i.id === product.id));
  const toggleWishlist = useWishlist((s) => s.toggle);
  const [added, setAdded] = useState(false);
  const [buying, setBuying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.05, ease: "easeOut" }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-[transform,border-color] duration-300 hover:-translate-y-1 hover:border-text/20"
    >
      <div className="absolute -inset-px -z-10 rounded-2xl opacity-0 transition group-hover:opacity-100">
        <div className="absolute inset-0 rounded-2xl bg-gradient-brand opacity-20 blur-xl" />
      </div>

      <div className="relative aspect-[4/5] overflow-hidden bg-card">
        <Link href={`/product/${product.slug}`} className="relative block h-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badge && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${
                badgeStyles[product.badge] ?? "bg-white/10 text-white ring-white/20"
              }`}
            >
              {product.badge === "AI PICK" && <Sparkles size={10} />}
              {product.badge}
            </span>
          )}
          {product.oldPrice && (
            <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-semibold text-success ring-1 ring-success/30">
              -{Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}%
            </span>
          )}
        </div>

        <button
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={wishlisted}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist({
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              oldPrice: product.oldPrice,
              image: product.images[0],
              category: product.category,
            });
          }}
          className={cn(
            "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/60 ring-1 backdrop-blur transition hover:bg-bg/80 focus-visible:ring-2 focus-visible:ring-primary-400",
            wishlisted
              ? "text-rose-400 ring-rose-400/30"
              : "text-text-2 ring-border hover:text-text",
          )}
        >
          <Heart size={15} className={wishlisted ? "fill-current" : ""} />
        </button>

        <div className="pointer-events-none absolute inset-x-2.5 bottom-2.5 flex translate-y-3 flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 focus-within:pointer-events-auto focus-within:translate-y-0 focus-within:opacity-100 max-md:pointer-events-auto max-md:translate-y-0 max-md:opacity-100 sm:flex-row sm:flex-wrap">
          <button
            onClick={(e) => {
              e.preventDefault();
              add({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 900);
            }}
            className="inline-flex w-full min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white px-2 py-2 text-[11px] font-semibold text-slate-950 ring-1 ring-white/20 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 sm:w-auto sm:flex-auto sm:py-2.5 sm:text-xs"
          >
            {added ? (
              <>
                <Check size={13} /> Added
              </>
            ) : (
              <>
                <Plus size={13} /> Add to cart
              </>
            )}
          </button>
          <button
            disabled={buying || product.stock === 0}
            onClick={(e) => {
              e.preventDefault();
              if (buying || product.stock === 0) return;
              setBuying(true);
              const cart = useCart.getState();
              cart.add({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.images[0],
              });
              // add() opens the cart drawer; close it so it doesn't flash
              // over the checkout navigation.
              cart.closeCart();
              router.push("/checkout");
            }}
            className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full bg-gradient-brand px-3 py-2 text-[11px] font-semibold text-white ring-1 ring-white/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:opacity-60 sm:w-auto sm:py-2.5 sm:text-xs"
          >
            Buy now
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-text-2">{product.category}</span>
          <span className="inline-flex items-center gap-1 text-text-2">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            {product.rating.toFixed(1)}
            <span className="text-text-2/70">({product.reviews})</span>
          </span>
        </div>
        <Link
          href={`/product/${product.slug}`}
          className="mt-1 block truncate font-medium hover:text-primary-300"
        >
          {product.name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && (
            <span className="text-sm text-text-2 line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-2">
          {product.stock > 0 ? (
            product.stock <= 5 ? (
              <span className="inline-flex items-center gap-1 text-amber-300">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                Only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                In stock
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
              Sold out
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Truck size={11} className="opacity-70" />
            Free delivery over $500
          </span>
        </div>
      </div>
    </motion.div>
  );
}
