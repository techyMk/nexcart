"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/auth/field";
import { GoogleIcon } from "@/components/auth/google-icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search?.get("next") ?? "/account";
  const queryError = search?.get("error");

  // Auth state of the visitor
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "signout" | null>(
    null,
  );
  const [err, setErr] = useState<string | null>(queryError ?? null);

  // Check existing session
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!cancelled) setMeEmail(user?.email ?? null);
      } catch {
        /* env missing — fall through to form */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function validateEmail(value: string) {
    if (!value.trim()) return "Email is required.";
    if (!EMAIL_RE.test(value)) return "That doesn't look like a valid email.";
    return null;
  }

  async function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const eErr = validateEmail(email);
    const pErr = password.length === 0 ? "Enter your password." : null;
    setEmailErr(eErr);
    setPwdErr(pErr);
    if (eErr || pErr) return;

    setErr(null);
    setLoading("email");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials")) {
          setErr(
            "We couldn't find an account with that email and password. Did you mean to sign up first?",
          );
        } else if (msg.includes("email not confirmed")) {
          setErr(
            "Your email isn't verified yet. Check your inbox for the 6-digit code or the verification link.",
          );
        } else {
          setErr(error.message);
        }
        // Clear password on failure, keep email so they can retry
        setPassword("");
        setLoading(null);
        return;
      }
      router.refresh();
      router.push(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setPassword("");
      setLoading(null);
    }
  }

  async function onGoogle() {
    setErr(null);
    setLoading("google");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErr(error.message);
        setLoading(null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-in failed");
      setLoading(null);
    }
  }

  async function onSignOut() {
    setLoading("signout");
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setMeEmail(null);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  // ── States ────────────────────────────────────────────────────────────

  if (checking) {
    return (
      <div className="grid min-h-[60vh] place-items-center pt-36">
        <Loader2 size={20} className="animate-spin text-text-2" />
      </div>
    );
  }

  // Already signed in — show a friendly switcher
  if (meEmail) {
    return (
      <div className="grid min-h-screen place-items-center px-5 pb-16 pt-36">
        <div className="container max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/20 opacity-50 blur-3xl dark:opacity-100" />
            <div className="relative">
              <Link href="/" aria-label="NexCart home" className="inline-flex">
                <BrandLogo priority className="h-16 w-auto" />
              </Link>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-300"
                />
                <div>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-100">
                    You&apos;re already signed in
                  </div>
                  <div className="text-emerald-700/90 dark:text-emerald-200/80">as {meEmail}</div>
                </div>
              </div>
              <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
                No need to sign in again.
              </h1>
              <p className="mt-1 text-sm text-text-2">
                Want to continue, or switch to a different account?
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <Link href={next} className="btn btn-primary w-full">
                  <ArrowRight size={14} /> Continue
                </Link>
                <button
                  onClick={onSignOut}
                  disabled={loading === "signout"}
                  className="btn btn-ghost w-full disabled:opacity-60"
                >
                  {loading === "signout" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <LogOut size={14} />
                  )}
                  {loading === "signout" ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Default: sign-in form
  return (
    <div className="grid min-h-screen place-items-center px-5 pb-16 pt-36">
      <div className="container max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/30 opacity-50 blur-3xl dark:opacity-100" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-accent-purple/30 opacity-50 blur-3xl dark:opacity-100" />
          <div className="relative">
            <Link href="/" aria-label="NexCart home" className="inline-flex">
              <BrandLogo priority className="h-16 w-auto" />
            </Link>
            <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Welcome <span className="text-gradient-brand">back</span>.
            </h1>
            <p className="mt-1 text-sm text-text-2">
              Sign in to continue your intelligent shopping journey.
            </p>

            {err && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-700 dark:text-rose-200"
              >
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                <span>{err}</span>
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={onGoogle}
                disabled={loading === "google"}
                className="btn btn-ghost w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "google" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <GoogleIcon />
                )}
                {loading === "google" ? "Redirecting…" : "Continue with Google"}
              </button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-text-2">
              <span className="h-px flex-1 bg-border" /> or with email
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
              <Field
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailErr) setEmailErr(null);
                }}
                onBlur={() => setEmailErr(validateEmail(email))}
                error={emailErr}
              />
              <div className="relative">
                <Field
                  label="Password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (pwdErr) setPwdErr(null);
                  }}
                  error={pwdErr}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-9 text-text-2 hover:text-text"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex items-center text-xs">
                <label className="flex items-center gap-2 text-text-2">
                  <input
                    type="checkbox"
                    className="accent-primary-500"
                    defaultChecked
                  />
                  Remember me
                </label>
              </div>
              <button
                type="submit"
                disabled={loading === "email"}
                className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading === "email" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LogIn size={14} />
                )}
                {loading === "email" ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="mt-5 text-center text-sm text-text-2">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary-300 hover:text-text">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
