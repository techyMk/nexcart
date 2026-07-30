"use client";

import { AlertTriangle } from "lucide-react";

export function Field({
  label,
  error,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-text-2">
        {label}
      </span>
      <input
        {...rest}
        aria-invalid={!!error}
        className={`w-full rounded-xl border ${
          error ? "border-rose-500/50" : "border-border"
        } bg-card px-3 py-2.5 text-sm text-text outline-none placeholder:text-text-2/60 focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20`}
      />
      {error && (
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-300">
          <AlertTriangle size={11} /> {error}
        </span>
      )}
    </label>
  );
}
