"use client";

import { Pencil, Plus, Search, Tag, Trash2 } from "lucide-react";
import { categories, products } from "@/lib/data";

export default function AdminCategories() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="section-eyebrow">Catalog</div>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="mt-1 text-sm text-text-2">
            {categories.length} categories · {products.length} products live
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={14} /> New category
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-border bg-card p-3 backdrop-blur-xl">
        <div className="relative flex-1">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search categories…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-primary-400/60"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((c) => {
          const count = products.filter((p) => p.categorySlug === c.slug).length;
          return (
            <div
              key={c.id}
              className="group relative overflow-hidden rounded-3xl border border-border bg-card p-5 backdrop-blur-xl transition hover:border-text/20"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-500/15 blur-3xl opacity-0 transition group-hover:opacity-100" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-text-2">
                    Category
                  </div>
                  <div className="mt-2 font-display text-xl font-semibold leading-tight tracking-tight">
                    {c.name}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-text-2">
                    /{c.slug}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    aria-label="Edit"
                    className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-card-2 hover:text-text"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    aria-label="Delete"
                    className="grid h-8 w-8 place-items-center rounded-lg text-text-2 hover:bg-card-2 hover:text-rose-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-text-2 ring-1 ring-border">
                  <Tag size={11} /> {count} products
                </span>
                <span className="text-text-2">Updated 2d ago</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
