"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star } from "lucide-react";
import { testimonials } from "@/lib/data";

/** Swap vague futurist copy for retail-concrete proof points (render-side only). */
const quoteFixes: Record<string, string> = {
  "Sara Chen":
    "Checkout took 9 seconds. Nine. Saved card, autofilled address, order confirmed before I'd even closed the tab.",
};

export function Testimonials() {
  return (
    <section className="section">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <div className="section-eyebrow">Wall of love</div>
          <h2 className="section-title mt-2">
            Real people, real{" "}
            <span className="text-gradient-brand">results</span>
          </h2>
          <p className="mt-3 text-sm text-text-2 sm:text-base">
            Verified reviews from the NexCart community — faster checkouts,
            smarter price alerts, deliveries that show up on time.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div key={t.name} className={i === 1 ? "md:translate-y-8" : ""}>
              <motion.figure
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`relative h-full rounded-3xl border border-border p-6 ${
                  i === 0
                    ? "bg-card-2 ring-1 ring-primary-400/20 dark:bg-transparent dark:bg-gradient-to-b dark:from-white/[0.05] dark:to-transparent"
                    : "bg-card"
                }`}
              >
                <span
                  aria-hidden
                  className="font-display absolute -top-3 left-5 select-none text-7xl font-bold text-primary-400/15"
                >
                  “
                </span>

                <div className="relative flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star key={k} size={14} className="fill-current" />
                  ))}
                </div>

                <blockquote className="relative mt-4 text-sm leading-relaxed text-text sm:text-base">
                  “{quoteFixes[t.name] ?? t.quote}”
                </blockquote>

                <figcaption className="relative mt-6 flex items-center gap-3">
                  <span className="inline-flex shrink-0 rounded-full bg-gradient-brand p-[1.5px]">
                    <Image
                      src={t.avatar}
                      alt={t.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-text">
                      {t.name}
                    </div>
                    <div className="text-xs text-text-2">{t.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
