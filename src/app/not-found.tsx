"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowRight,
  Compass,
  Heart,
  Home,
  LifeBuoy,
  Search,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useCommandPalette } from "@/store/command";

export default function NotFound() {
  const openPalette = useCommandPalette((s) => s.openPalette);

  // Cursor-following 3D tilt for the glyph
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotX = useSpring(useTransform(my, [-200, 200], [12, -12]), {
    stiffness: 120,
    damping: 18,
  });
  const rotY = useSpring(useTransform(mx, [-200, 200], [-14, 14]), {
    stiffness: 120,
    damping: 18,
  });
  const parX = useSpring(useTransform(mx, [-300, 300], [-18, 18]), {
    stiffness: 80,
    damping: 22,
  });
  const parY = useSpring(useTransform(my, [-300, 300], [-12, 12]), {
    stiffness: 80,
    damping: 22,
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mx.set(e.clientX - cx);
      my.set(e.clientY - cy);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  // Deterministic but lively particle field
  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        left: (i * 53) % 100,
        top: (i * 97) % 100,
        size: 1 + ((i * 7) % 3),
        delay: (i % 12) * 0.18,
        duration: 6 + (i % 5),
      })),
    [],
  );

  const suggestions = products
    .filter((p) => p.badge === "AI PICK" || p.featured)
    .slice(0, 3);

  return (
    <div
      className="relative grid min-h-[calc(100vh-6rem)] place-items-center overflow-hidden pt-24 md:pt-32"
      style={{ perspective: 1200 }}
    >
      {/* particle field */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {particles.map((p, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0], y: [0, -10, 0] }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: p.size,
              height: p.size,
              boxShadow: "0 0 6px rgba(124,58,237,0.7)",
            }}
          />
        ))}
      </div>

      {/* scan lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px)",
        }}
      />

      <div className="container relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr]">
          {/* Left: copy + actions */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="chip mx-auto lg:mx-0"
            >
              <Compass size={12} /> Error · transmission lost
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight md:text-6xl"
            >
              This page drifted off the{" "}
              <span className="text-gradient-brand">grid</span>.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-4 max-w-xl text-text-2 lg:max-w-md"
            >
              Either the URL is mistyped, the product has moved, or NexCart
              Intelligence™ is still scanning that corner of the catalog.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start"
            >
              <Link href="/" className="btn btn-primary">
                <Home size={14} /> Back to home <ArrowRight size={14} />
              </Link>
              <button onClick={openPalette} className="btn btn-ghost">
                <Search size={14} /> Search the universe
                <kbd className="ml-2 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-text-2">
                  ⌘K
                </kbd>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-10 grid gap-3 sm:grid-cols-3"
            >
              <Shortcut
                href="/shop"
                Icon={Compass}
                title="Browse catalog"
                hint="500+ products"
              />
              <Shortcut
                href="/wishlist"
                Icon={Heart}
                title="Open wishlist"
                hint="Saved for later"
              />
              <Shortcut
                href="/about"
                Icon={LifeBuoy}
                title="Contact support"
                hint="We&apos;ll help fast"
              />
            </motion.div>
          </div>

          {/* Right: the cinematic 404 glyph */}
          <motion.div
            style={{ x: parX, y: parY }}
            className="relative mx-auto aspect-square w-full max-w-[520px]"
          >
            {/* big rotating gradient ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 36, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(91,140,255,0) 0deg, #3B82F6 80deg, #7C3AED 180deg, #5B8CFF 280deg, rgba(91,140,255,0) 360deg)",
                mask: "radial-gradient(transparent 56%, black 57%, black 62%, transparent 63%)",
                WebkitMask:
                  "radial-gradient(transparent 56%, black 57%, black 62%, transparent 63%)",
              }}
            />
            <div className="absolute inset-6 rounded-full border border-border" />
            <div className="absolute inset-12 rounded-full border border-border" />

            {/* glow */}
            <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-electric opacity-30 blur-3xl" />

            {/* The 404 glyph */}
            <motion.div
              style={{
                rotateX: rotX,
                rotateY: rotY,
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-0 grid place-items-center"
            >
              <div
                className="font-display text-[180px] font-bold leading-none tracking-tighter md:text-[220px]"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg,#3B82F6 0%,#5B8CFF 35%,#7C3AED 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 30px 60px rgba(59,130,246,0.25)",
                  filter: "drop-shadow(0 12px 40px rgba(124,58,237,0.45))",
                }}
              >
                404
              </div>
            </motion.div>

            {/* Orbiting product chips */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              {suggestions.map((p, i) => {
                const positions = [
                  { top: "8%", left: "62%" },
                  { top: "62%", left: "78%" },
                  { top: "70%", left: "8%" },
                ];
                return (
                  <motion.div
                    key={p.id}
                    animate={{ rotate: -360 }}
                    transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                    style={positions[i]}
                    className="absolute"
                  >
                    <Link
                      href={`/product/${p.slug}`}
                      className="group flex items-center gap-2 rounded-2xl border border-border bg-bg/70 p-2 pr-3 shadow-card backdrop-blur-xl transition hover:border-text/20"
                    >
                      <span className="relative h-10 w-10 overflow-hidden rounded-xl bg-card">
                        <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block max-w-[120px] truncate text-xs font-medium">
                          {p.name}
                        </span>
                        <span className="block text-[10px] text-text-2">
                          {formatPrice(p.price)}
                        </span>
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>

        {/* Suggested products row */}
        <div className="mt-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="section-eyebrow">While you&apos;re here</div>
              <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
                Top picks the AI loves
              </h2>
            </div>
            <Link href="/shop" className="text-sm text-text-2 hover:text-text">
              See all →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-border bg-card backdrop-blur-xl transition hover:-translate-y-1 hover:border-text/20 hover:shadow-glow"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-card">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    sizes="(max-width:768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-text-2">{formatPrice(p.price)}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Shortcut({
  href,
  Icon,
  title,
  hint,
}: {
  href: string;
  Icon: typeof Compass;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl transition hover:border-text/20 hover:bg-card"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
        <Icon size={14} />
      </span>
      <span className="text-left">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-text-2">{hint}</span>
      </span>
      <ArrowRight
        size={13}
        className="ml-auto text-text-2 transition group-hover:translate-x-0.5 group-hover:text-text"
      />
    </Link>
  );
}
