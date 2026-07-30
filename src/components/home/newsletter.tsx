"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";

export function Newsletter() {
  return (
    <section className="section py-10 sm:py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary-700/30 via-accent-purple/20 to-primary-700/30 p-6 text-center sm:p-10 md:p-16"
        >
          <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
          <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary-500/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent-purple/40 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <div className="chip mx-auto">
              <Mail size={12} /> Insiders only
            </div>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:mt-4 md:text-5xl">
              Get exclusive AI-picked deals first.
            </h2>
            <p className="mt-2 text-text-2 sm:mt-3">
              Subscribe to receive private drops, intelligent recommendations
              and 10% off your first order.
            </p>
            <NewsletterForm variant="hero" source="home_section" />
            <div className="mt-3 text-xs text-text-2 sm:mt-4">
              No spam. Unsubscribe anytime. Trusted by 50k+ subscribers.
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
