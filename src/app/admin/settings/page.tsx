"use client";

import { useState } from "react";
import { Sparkles, Save } from "lucide-react";

export default function AdminSettings() {
  const [section, setSection] = useState("Storefront");
  const sections = ["Storefront", "Brand", "AI", "Payments", "Shipping", "Team"];
  return (
    <div className="space-y-6">
      <div>
        <div className="section-eyebrow">Configure</div>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl">
          {sections.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition ${
                section === s
                  ? "bg-card-2 text-text ring-1 ring-border"
                  : "text-text-2 hover:bg-card-2 hover:text-text"
              }`}
            >
              {s}
              {s === "AI" && (
                <span className="rounded-full bg-gradient-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                  New
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">{section}</div>
              <div className="text-sm text-text-2">
                Configure {section.toLowerCase()} preferences for NexCart.
              </div>
            </div>
            <button className="btn btn-primary">
              <Save size={14} /> Save changes
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Toggle
              title="Enable NexCart Intelligence™"
              desc="Personalize every shopper journey in real time."
              defaultOn
            />
            <Toggle
              title="Auto-translate product copy"
              desc="Localize titles + descriptions instantly to 38 languages."
              defaultOn
            />
            <Toggle
              title="Fraud shield"
              desc="Block suspicious orders with ML risk scoring."
              defaultOn
            />
            <Toggle
              title="Newsletter opt-in by default"
              desc="Encourage subscribers at checkout."
            />
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles size={14} className="text-primary-300" /> AI Copilot
            </div>
            <p className="mt-1 text-sm text-text-2">
              NexCart Copilot can review your settings and suggest higher
              conversion configurations. Available 24/7.
            </p>
            <button className="btn btn-ghost mt-4">Run a quick audit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  title,
  desc,
  defaultOn,
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="mt-0.5 block text-xs text-text-2">{desc}</span>
      </span>
      <input type="checkbox" defaultChecked={defaultOn} className="peer sr-only" />
      <span className="relative h-5 w-9 shrink-0 rounded-full bg-card-2 transition peer-checked:bg-gradient-brand">
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:left-4" />
      </span>
    </label>
  );
}
