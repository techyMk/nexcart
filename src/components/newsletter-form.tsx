"use client";

import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "hero" | "footer";

export function NewsletterForm({
  variant,
  source,
}: {
  variant: Variant;
  source: "footer" | "home_section";
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<
    "sent" | "skipped" | "failed" | null
  >(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "loading" || state === "done") return;

    setState("loading");
    setError(null);
    setEmailStatus(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        emailStatus?: "sent" | "skipped" | "failed";
      };
      if (!res.ok || !data.ok) {
        setState("error");
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setEmailStatus(data.emailStatus ?? null);
      setState("done");
    } catch {
      setState("error");
      setError("Network error. Please try again.");
    }
  }

  const successMessage =
    emailStatus === "sent"
      ? "You're on the list — check your inbox for a welcome note."
      : "You're on the list. Welcome email is on its way as soon as we're fully cleared with our mail provider.";

  const isHero = variant === "hero";

  return (
    <div>
      <form
        onSubmit={onSubmit}
        className={cn(
          "flex overflow-hidden rounded-full border border-border backdrop-blur-xl transition focus-within:border-primary-400/60 focus-within:ring-2 focus-within:ring-primary-400/20",
          isHero
            ? "mx-auto mt-8 max-w-lg bg-bg/60 p-1.5"
            : "mt-6 max-w-sm bg-card p-1",
        )}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={state === "loading" || state === "done"}
          placeholder={isHero ? "Enter your email" : "you@email.com"}
          className="flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-text-2 disabled:opacity-60"
          aria-label="Email"
        />
        <button
          type="submit"
          disabled={state === "loading" || state === "done"}
          className={cn(
            "btn btn-primary btn-sm shrink-0 disabled:cursor-not-allowed disabled:opacity-80",
            isHero && "px-5",
          )}
        >
          {state === "loading" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Subscribing…
            </>
          ) : state === "done" ? (
            <>
              <Check size={14} /> Subscribed
            </>
          ) : (
            <>
              {isHero ? "Subscribe" : "Subscribe"}
              {isHero && <Send size={13} />}
            </>
          )}
        </button>
      </form>
      {state === "done" && (
        <div
          className={cn(
            "text-xs text-emerald-300",
            isHero ? "mt-3 text-center" : "mt-2",
          )}
        >
          {successMessage}
        </div>
      )}
      {state === "error" && error && (
        <div
          className={cn(
            "text-xs text-rose-300",
            isHero ? "mt-3 text-center" : "mt-2",
          )}
        >
          {error}
        </div>
      )}
    </div>
  );
}
