"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlist } from "@/store/wishlist";
import { useCart } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { products } from "@/lib/data";

export default function WishlistPage() {
  const items = useWishlist((s) => s.items);
  const remove = useWishlist((s) => s.remove);
  const clear = useWishlist((s) => s.clear);
  const add = useCart((s) => s.add);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="section-eyebrow">Saved for later</div>
            <h1 className="section-title mt-2">
              Your <span className="text-gradient-brand">wishlist</span>
            </h1>
            <p className="mt-2 text-text-2">
              {hydrated
                ? `${items.length} ${items.length === 1 ? "item" : "items"} saved`
                : "\u00A0"}
            </p>
          </div>
          {hydrated && items.length > 0 && (
            <button onClick={clear} className="btn btn-ghost btn-sm">
              <Trash2 size={14} /> Clear all
            </button>
          )}
        </div>

        {!hydrated ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/5] animate-pulse rounded-2xl bg-card"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="grid place-items-center rounded-3xl border border-border bg-card p-20 text-center backdrop-blur-xl">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30">
              <Heart size={20} />
            </div>
            <h2 className="mt-5 font-display text-xl">Nothing saved yet</h2>
            <p className="mt-1 max-w-sm text-sm text-text-2">
              Tap the heart on any product to save it here for later — or let
              our AI find your next favourite.
            </p>
            <Link href="/shop" className="btn btn-primary mt-6">
              <Compass size={14} /> Explore the catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {items.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl transition hover:-translate-y-1 hover:border-text/20 hover:shadow-glow"
                >
                  <Link href={`/product/${p.slug}`} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-card">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        sizes="(max-width:768px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <button
                    aria-label="Remove from wishlist"
                    onClick={() => remove(p.id)}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-bg/60 text-rose-400 ring-1 ring-rose-400/30 backdrop-blur transition hover:bg-bg/80"
                  >
                    <Heart size={15} className="fill-current" />
                  </button>
                  <div className="p-4">
                    <div className="text-xs text-text-2">{p.category}</div>
                    <Link
                      href={`/product/${p.slug}`}
                      className="mt-1 block truncate font-medium hover:text-primary-300"
                    >
                      {p.name}
                    </Link>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-lg font-semibold tracking-tight">
                        {formatPrice(p.price)}
                      </span>
                      {p.oldPrice && (
                        <span className="text-sm text-text-2 line-through">
                          {formatPrice(p.oldPrice)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        add({
                          id: p.id,
                          slug: p.slug,
                          name: p.name,
                          price: p.price,
                          image: p.image,
                          stock: products.find((x) => x.id === p.id)?.stock,
                        })
                      }
                      className="btn btn-primary mt-4 w-full"
                    >
                      <ShoppingBag size={14} /> Add to cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {hydrated && items.length > 0 && (
          <div className="mt-10 flex justify-center">
            <Link href="/shop" className="btn btn-ghost">
              Continue exploring <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
