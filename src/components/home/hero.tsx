"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type PanInfo,
  type Variants,
} from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { products, type Product } from "@/lib/data";

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 90;

type SlideDef = {
  slug: string;
  /** Phrase inside the product name rendered with the brand gradient. */
  gradient: string;
  tagline: string;
};

const SLIDE_DEFS: SlideDef[] = [
  {
    slug: "iphone-15-pro-max",
    gradient: "Pro Max",
    tagline: "Titanium build, A17 Pro power — the most capable iPhone yet.",
  },
  {
    slug: "macbook-pro-m3",
    gradient: "M3 Max",
    tagline: "Outrageous performance for creators, tuned by our AI curation.",
  },
  {
    slug: "sony-wh-1000xm5",
    gradient: "WH-1000XM5",
    tagline: "Industry-leading noise cancellation with 30 hours of battery.",
  },
  {
    slug: "apple-watch-ultra-2",
    gradient: "Ultra 2",
    tagline: "Rugged titanium, 3000-nit display — engineered for adventure.",
  },
  {
    slug: "playstation-5-pro",
    gradient: "Pro",
    tagline: "AI-enhanced upscaling and ray tracing for next-gen gaming.",
  },
];

type Slide = SlideDef & { product: Product };

const SLIDES: Slide[] = SLIDE_DEFS.flatMap((def) => {
  const product = products.find((p) => p.slug === def.slug);
  return product ? [{ ...def, product }] : [];
});

function formatPrice(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

function GradientName({ name, gradient }: { name: string; gradient: string }) {
  const at = name.indexOf(gradient);
  if (at === -1) return <>{name}</>;
  return (
    <>
      {name.slice(0, at)}
      <span className="text-gradient-brand">{gradient}</span>
      {name.slice(at + gradient.length)}
    </>
  );
}

export function Hero() {
  const reducedMotion = useReducedMotion();
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);
  // Bumped whenever autoplay (re)starts so the progress dot restarts in sync.
  const [epoch, setEpoch] = useState(0);

  const count = SLIDES.length;
  const paused = hovered || pressed || focused;
  const autoplay = !paused && !reducedMotion;

  const paginate = useCallback(
    (dir: number) => {
      setSlide(([i]) => [(i + dir + count) % count, dir]);
    },
    [count]
  );

  const goTo = useCallback((next: number) => {
    setSlide(([i]) => (next === i ? [i, 0] : [next, next > i ? 1 : -1]));
  }, []);

  useEffect(() => {
    if (!paused) setEpoch((e) => e + 1);
  }, [paused]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => paginate(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplay, index, epoch, paginate]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      paginate(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      paginate(1);
    }
  };

  const onDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setPressed(false);
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) {
      paginate(1);
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) {
      paginate(-1);
    }
  };

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: reducedMotion ? 0 : dir * 64,
      scale: reducedMotion ? 1 : 1.02,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.65, ease: [0.32, 0.72, 0, 1] },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: reducedMotion ? 0 : dir * -64,
      scale: reducedMotion ? 1 : 0.985,
      transition: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
    }),
  };

  const contentVariants: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const slide = SLIDES[index];
  const p = slide.product;
  const aiPick = p.badge === "AI PICK";

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured products"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setFocused(false);
        }
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className="relative min-h-[86svh] max-h-[92svh] w-full overflow-hidden focus-visible:outline-none"
    >
      <style>{`@keyframes hero-slide-progress { from { width: 0% } to { width: 100% } }`}</style>

      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={index}
          role="group"
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${count}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          onDragStart={() => setPressed(true)}
          onDragEnd={onDragEnd}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {/* Full-bleed product image */}
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            priority={index === 0}
            sizes="100vw"
            className="object-cover"
            draggable={false}
          />
          {/* Readability scrims — built from the bg token so both themes adapt */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-bg/10" />
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-bg to-transparent" />
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg/80 to-transparent" />

          {/* Slide content */}
          <div className="relative flex min-h-[86svh] max-h-[92svh] items-center">
            <div className="mx-auto w-full max-w-[1280px] px-5">
              <motion.div
                variants={contentVariants}
                initial="hidden"
                animate="show"
                className="max-w-2xl pb-24 pt-24 md:pt-28"
              >
                <motion.div variants={itemVariants}>
                  {aiPick ? (
                    <span className="chip backdrop-blur-md">
                      <Sparkles size={12} /> AI Pick · {p.category}
                    </span>
                  ) : (
                    <span className="chip chip-neutral backdrop-blur-md">
                      {p.category}
                    </span>
                  )}
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="mt-5 font-display text-4xl font-bold leading-[1.04] tracking-[-0.03em] text-text sm:text-6xl lg:text-7xl"
                >
                  <GradientName name={p.name} gradient={slide.gradient} />
                </motion.h1>

                <motion.p
                  variants={itemVariants}
                  className="mt-4 max-w-xl text-base leading-relaxed text-text-2 md:text-lg"
                >
                  {slide.tagline}
                </motion.p>

                <motion.div
                  variants={itemVariants}
                  className="mt-5 flex items-baseline gap-3"
                >
                  <span className="font-display text-3xl font-bold text-text md:text-4xl">
                    {formatPrice(p.price)}
                  </span>
                  {p.oldPrice && (
                    <span className="text-lg text-text-2 line-through">
                      {formatPrice(p.oldPrice)}
                    </span>
                  )}
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="mt-7 flex flex-wrap items-center gap-3"
                >
                  <Link href={`/product/${p.slug}`} className="btn btn-primary">
                    Buy now <ArrowRight size={16} />
                  </Link>
                  <Link href={`/product/${p.slug}`} className="btn btn-ghost">
                    View details
                  </Link>
                </motion.div>

                <motion.p
                  variants={itemVariants}
                  className="mt-6 text-xs text-text-2"
                >
                  Free delivery over $500 · 7-day returns
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-5">
          {/* Progress dots */}
          <div
            className="pointer-events-auto flex items-center gap-2"
            role="tablist"
            aria-label="Choose slide"
          >
            {SLIDES.map((s, i) =>
              i === index ? (
                <button
                  key={s.slug}
                  type="button"
                  aria-label={`Slide ${i + 1} of ${count}: ${s.product.name}`}
                  aria-current="true"
                  onClick={() => goTo(i)}
                  className="relative h-2 w-10 overflow-hidden rounded-full bg-text/20"
                >
                  <span
                    key={`${index}-${epoch}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-brand"
                    style={
                      reducedMotion
                        ? { width: "100%" }
                        : {
                            animation: `hero-slide-progress ${AUTOPLAY_MS}ms linear forwards`,
                            animationPlayState: paused ? "paused" : "running",
                          }
                    }
                  />
                </button>
              ) : (
                <button
                  key={s.slug}
                  type="button"
                  aria-label={`Slide ${i + 1} of ${count}: ${s.product.name}`}
                  onClick={() => goTo(i)}
                  className="h-2 w-2 rounded-full bg-text/30 transition-colors hover:bg-text/60"
                />
              )
            )}
          </div>

          {/* Prev / next arrows (desktop) */}
          <div className="pointer-events-auto hidden items-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => paginate(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-text backdrop-blur-md transition-colors hover:bg-card-2"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => paginate(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-text backdrop-blur-md transition-colors hover:bg-card-2"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Warm the cache for the remaining slide images so transitions never flash */}
      <div aria-hidden className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
        {SLIDES.filter((_, i) => i !== index).map((s) => (
          <div key={s.slug} className="relative h-px w-px">
            <Image
              src={s.product.images[0]}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
