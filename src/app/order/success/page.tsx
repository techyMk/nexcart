"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Check, Package, Truck } from "lucide-react";

function addBusinessDays(from: Date, days: number) {
  const d = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return d;
}

function formatDay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function deliveryEstimate(method: string | null) {
  const now = new Date();
  if (method === "sameday") return "today";
  const [min, max] = method === "express" ? [1, 2] : [3, 5];
  return `${formatDay(addBusinessDays(now, min))} – ${formatDay(
    addBusinessDays(now, max),
  )}`;
}

function OrderSuccessContent() {
  const sp = useSearchParams();
  const [orderId] = useState(
    () => sp.get("o") ?? `NX-${Date.now().toString(36).toUpperCase()}`,
  );
  const [delivery] = useState(() => deliveryEstimate(sp.get("ship")));

  return (
    <div className="grid place-items-center pt-24 md:pt-32">
      <div className="container max-w-2xl text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-brand shadow-glow"
        >
          <Check size={32} className="text-white" />
        </motion.div>
        <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight">
          Order confirmed.
        </h1>
        <p className="mt-3 text-text-2">
          Thanks! Your AI-curated order is on the way. Your order confirmation
          and tracking are available in your account.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2 text-sm">
            <Package size={14} className="text-primary-300" />
            Order #{orderId}
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2 text-sm">
            <Truck size={14} className="text-primary-300" />
            Estimated delivery: {delivery}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/account" className="btn btn-primary">
            Track order <ArrowRight size={16} />
          </Link>
          <Link href="/shop" className="btn btn-ghost">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}
