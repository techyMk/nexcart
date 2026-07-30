"use client";

import { Truck, RotateCcw, ShieldCheck, Headphones, Lock } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  { Icon: Truck, title: "Free Delivery", note: "Orders over $50" },
  { Icon: RotateCcw, title: "7-Day Returns", note: "No questions asked" },
  { Icon: ShieldCheck, title: "2-Year Warranty", note: "On every product" },
  { Icon: Headphones, title: "24/7 Support", note: "Real humans + AI" },
  { Icon: Lock, title: "Secure Payments", note: "PCI-DSS encrypted" },
];

export function FeatureStrip() {
  return (
    <section className="relative z-10 pt-10 sm:pt-12 md:pt-16">
      <div className="container">
        <div className="grid grid-cols-2 gap-2 rounded-3xl border border-border bg-card p-2 backdrop-blur-xl sm:gap-3 sm:p-3 md:grid-cols-5">
          {items.map(({ Icon, title, note }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 transition last:col-span-2 hover:bg-card sm:gap-3 sm:px-3 sm:py-3 md:last:col-span-1"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary-600/20 to-accent-purple/20 text-primary-300 ring-1 ring-border sm:h-10 sm:w-10">
                <Icon size={16} />
              </span>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{title}</div>
                <div className="truncate text-xs text-text-2">{note}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
