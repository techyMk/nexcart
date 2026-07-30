"use client";

import { motion } from "framer-motion";
import { Compass, Cpu, Globe2, Heart, Rocket, Users } from "lucide-react";

const stats = [
  { v: "50K+", l: "Happy customers" },
  { v: "120", l: "Countries served" },
  { v: "4.9", l: "Average rating" },
  { v: "47m", l: "Avg. delivery" },
];

const values = [
  { Icon: Cpu, t: "AI-first product", d: "Every pixel of NexCart is shaped by data and AI." },
  { Icon: Heart, t: "Customer-obsessed", d: "We treat every order like our first." },
  { Icon: Globe2, t: "Global by default", d: "Trusted in 120+ countries, localized everywhere." },
  { Icon: Rocket, t: "Speed of light", d: "From discovery to checkout in seconds, not minutes." },
];

export default function AboutPage() {
  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="chip mx-auto">
            <Compass size={12} /> About NexCart
          </div>
          <h1 className="page-title mt-5">
            We&apos;re building the{" "}
            <span className="text-gradient-brand">future</span> of how the world
            shops.
          </h1>
          <p className="mt-5 text-text-2">
            NexCart is an AI-native ecommerce platform that learns your taste,
            curates the right products, and delivers them faster than anyone
            else. Founded by engineers, obsessed with design, and built for you.
          </p>
        </motion.div>

        <section className="section">
          <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-3 backdrop-blur-xl md:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.l}
                className="rounded-2xl px-5 py-6 text-center transition hover:bg-card"
              >
                <div className="font-display text-3xl font-semibold text-gradient-brand md:text-4xl">
                  {s.v}
                </div>
                <div className="mt-1 text-xs uppercase tracking-widest text-text-2">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="mb-10">
            <div className="section-eyebrow">Our values</div>
            <h2 className="section-title mt-2">
              What we <span className="text-gradient-brand">stand for</span>
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <motion.div
                key={v.t}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="rounded-3xl border border-border bg-card p-6 backdrop-blur-xl"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-glow">
                  <v.Icon size={16} />
                </span>
                <div className="mt-4 font-display text-lg font-semibold">{v.t}</div>
                <div className="mt-1 text-sm text-text-2">{v.d}</div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary-700/20 via-accent-purple/15 to-primary-700/20 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
            <div className="relative">
              <div className="chip mx-auto">
                <Users size={12} /> Want to work with us?
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
                Join the NexCart crew.
              </h2>
              <p className="mt-3 text-text-2">
                We&apos;re hiring across engineering, AI, design and ops.
              </p>
              <a
                className="btn btn-primary mt-6 inline-flex"
                href="mailto:careers@nexcart.app"
              >
                Explore open roles
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
