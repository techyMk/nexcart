"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Flame, ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : seconds)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return { h, m, s };
}

function Countdown({ initial }: { initial: number }) {
  const { h, m, s } = useCountdown(initial);
  return (
    <div className="flex gap-3">
      {[
        { l: "Hrs", v: pad(h) },
        { l: "Min", v: pad(m) },
        { l: "Sec", v: pad(s) },
      ].map((x) => (
        <div
          key={x.l}
          className={`grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl sm:h-16 sm:w-16 ${
            x.l === "Sec"
              ? "ring-1 ring-primary-400/20 dark:shadow-[0_0_24px_-4px_rgba(91,140,255,0.45)]"
              : ""
          }`}
        >
          <span className="relative block h-8 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={x.v}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="block font-display text-2xl font-semibold tabular-nums"
              >
                {x.v}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-text-2">
            {x.l}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DealOfDay() {
  const deal = products.find((p) => p.oldPrice) ?? products[0];
  const discount =
    deal.oldPrice && Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100);

  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const orbTopY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const orbBottomY = useTransform(scrollYProgress, [0, 1], [-60, 60]);
  const imageY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section className="section py-10 sm:py-20 md:py-28">
      <div className="container">
        <div
          ref={ref}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-900/40 via-surface to-surface-2 p-5 sm:p-8 md:p-12"
        >
          <motion.div
            style={{ y: orbTopY }}
            className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl opacity-50 dark:opacity-100"
          />
          <motion.div
            style={{ y: orbBottomY }}
            className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-primary-600/40 blur-3xl opacity-50 dark:opacity-100"
          />

          <div className="relative grid gap-6 sm:gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            {/* display:contents below sm lets the image slot between the price
               block and the countdown on phones; sm+ restores the original
               single-column-then-two-column flow. */}
            <div className="contents sm:block">
              <div>
                <div className="chip bg-orange-500/15 text-orange-300 border-orange-400/30">
                  <Flame size={12} /> Deal of the Day
                </div>
                <h2 className="section-title mt-3 sm:mt-4">{deal.name}</h2>
                <p className="mt-3 max-w-lg text-text-2">{deal.description}</p>

                <div className="mt-4 flex flex-wrap items-baseline gap-3 sm:mt-6">
                  <span className="font-display text-4xl font-semibold tracking-tight">
                    {formatPrice(deal.price)}
                  </span>
                  {deal.oldPrice && (
                    <span className="text-lg text-text-2 line-through">
                      {formatPrice(deal.oldPrice)}
                    </span>
                  )}
                  {discount && (
                    <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success ring-1 ring-success/30">
                      Save {discount}%
                    </span>
                  )}
                </div>
              </div>

              <div className="order-1 sm:mt-6">
                <Countdown initial={8 * 3600 + 43 * 60 + 12} />

                <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                  <Link href={`/product/${deal.slug}`} className="btn btn-primary">
                    Grab the deal <ArrowRight size={16} />
                  </Link>
                  <Link href="/shop?sale=1" className="btn btn-ghost">
                    See all deals
                  </Link>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ y: imageY }}
              className="relative mx-auto aspect-square w-full max-w-md"
            >
              <div className="absolute inset-0 rounded-[36px] bg-gradient-electric opacity-20 blur-3xl dark:opacity-20" />
              <div className="relative h-full overflow-hidden rounded-[28px] border border-border bg-bg/40">
                <Image
                  src={deal.images[0]}
                  alt={deal.name}
                  fill
                  sizes="(max-width:1024px) 80vw, 480px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
