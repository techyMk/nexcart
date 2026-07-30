"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp } from "lucide-react";

const seriesA = [22, 38, 30, 55, 42, 70, 58, 80, 66, 92, 75, 95];
const seriesB = [12, 18, 24, 30, 28, 40, 36, 52, 48, 58, 60, 68];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Performance</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Analytics
          </h1>
        </div>
        <span className="chip">
          <Sparkles size={12} /> AI Forecast enabled
        </span>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Revenue vs orders</div>
            <div className="text-xs text-text-2">Last 12 weeks · projected line in gradient</div>
          </div>
          <div className="flex items-center gap-3 text-xs text-text-2">
            <Legend color="bg-primary-500" label="Revenue" />
            <Legend color="bg-accent-purple" label="Orders" />
          </div>
        </div>
        <Chart a={seriesA} b={seriesB} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { l: "Top region", v: "United States", d: "32% of revenue" },
          { l: "Top channel", v: "Organic", d: "+18% MoM" },
          { l: "Avg. basket", v: "$232", d: "+4.2% vs last month" },
        ].map((c) => (
          <div
            key={c.l}
            className="rounded-2xl border border-border bg-card p-5 backdrop-blur-xl"
          >
            <div className="text-xs uppercase tracking-widest text-text-2">{c.l}</div>
            <div className="mt-2 font-display text-2xl font-semibold tracking-tight">
              {c.v}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-emerald-400">
              <TrendingUp size={12} /> {c.d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function Chart({ a, b }: { a: number[]; b: number[] }) {
  const w = 720;
  const h = 240;
  const max = Math.max(...a, ...b);
  const points = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * w;
        const y = h - (v / max) * (h - 20) - 10;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <motion.svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-6 h-60 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <defs>
        <linearGradient id="ga" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gb" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((p) => (
        <line
          key={p}
          x1={0}
          x2={w}
          y1={h * p}
          y2={h * p}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="4 6"
        />
      ))}
      <polygon
        points={`0,${h} ${points(a)} ${w},${h}`}
        fill="url(#ga)"
      />
      <polyline
        points={points(a)}
        fill="none"
        stroke="#5B8CFF"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polygon points={`0,${h} ${points(b)} ${w},${h}`} fill="url(#gb)" />
      <polyline
        points={points(b)}
        fill="none"
        stroke="#7C3AED"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}
