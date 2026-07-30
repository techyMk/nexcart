"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Field } from "@/components/auth/field";
import { GoogleIcon } from "@/components/auth/google-icon";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Supabase Email OTP length is configurable (Auth → Email → Email OTP
// Length) from 6 to 10. Accept the full range so the verify form works
// regardless of what the dashboard is set to.
const MIN_OTP = 6;
const MAX_OTP = 10;

type Step = "form" | "verify";

export default function RegisterPage() {
  const router = useRouter();

  // Existing session detection
  const [meEmail, setMeEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // Flow state
  const [step, setStep] = useState<Step>("form");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // Verification state
  const [code, setCode] = useState("");

  // Errors
  const [firstNameErr, setFirstNameErr] = useState<string | null>(null);
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [loading, setLoading] = useState<
    "signup" | "verify" | "resend" | "google" | "signout" | null
  >(null);

  const codeInputRef = useRef<HTMLInputElement>(null);

  // Detect existing session
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
        /* env missing — fall through */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-focus the code input on step change
  useEffect(() => {
    if (step === "verify") {
      const t = setTimeout(() => codeInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [step]);

  function validateEmail(v: string) {
    if (!v.trim()) return "Email is required.";
    if (!EMAIL_RE.test(v)) return "That doesn't look like a valid email.";
    return null;
  }
  function validatePassword(v: string) {
    if (v.length < 8) return "Password must be at least 8 characters.";
    return null;
  }
  function validateFirstName(v: string) {
    if (!v.trim()) return "First name is required.";
    return null;
  }

  async function onSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    const fErr = validateFirstName(firstName);
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setFirstNameErr(fErr);
    setEmailErr(eErr);
    setPwdErr(pErr);
    if (fErr || eErr || pErr) return;
    if (!agreed) {
      setErr("Please agree to the Terms and Privacy Policy to continue.");
      return;
    }

    setLoading("signup");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered")) {
          setErr(
            "That email is already registered. Try signing in instead.",
          );
        } else if (msg.includes("rate limit")) {
          setErr(
            "Too many signup attempts. Please wait a minute and try again.",
          );
        } else {
          setErr(error.message);
        }
        setLoading(null);
        return;
      }
      // Move to verify step
      setInfo(`We sent a 6-digit code to ${email.trim()}. Check your inbox.`);
      setStep("verify");
      setLoading(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-up failed");
      setLoading(null);
    }
  }

  async function onVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (code.length < MIN_OTP) {
      setErr(`Enter the full code from your email (${MIN_OTP}–${MAX_OTP} digits).`);
      return;
    }
    setErr(null);
    setInfo(null);
    setLoading("verify");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code,
        type: "email",
      });
      if (error) {
        setErr(error.message);
        setCode("");
        setLoading(null);
        return;
      }
      router.refresh();
      router.push("/account");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Verification failed");
      setCode("");
      setLoading(null);
    }
  }

  async function onResend() {
    setErr(null);
    setInfo(null);
    setLoading("resend");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email.trim(),
      });
      if (error) {
        setErr(error.message);
      } else {
        setInfo("New code sent. Check your inbox.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not resend");
    } finally {
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
          redirectTo: `${window.location.origin}/auth/callback?next=/account`,
        },
      });
      if (error) {
        setErr(error.message);
        setLoading(null);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sign-up failed");
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
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="relative">
              <Link href="/" aria-label="NexCart home" className="inline-flex">
                <BrandLogo priority className="h-16 w-auto" />
              </Link>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-300"
                />
                <div>
                  <div className="font-semibold text-amber-100">
                    You&apos;re already signed in
                  </div>
                  <div className="text-amber-200/80">
                    as {meEmail}. Sign out first if you want to create a new
                    account.
                  </div>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Link href="/account" className="btn btn-primary w-full">
                  <ArrowRight size={14} /> Go to my account
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
                  {loading === "signout"
                    ? "Signing out…"
                    : "Sign out and create new account"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ── Default register flow ─────────────────────────────────────────────

  return (
    <div className="grid min-h-screen place-items-center px-5 pb-16 pt-36">
      <div className="container">
        <div className="grid items-stretch gap-8 lg:grid-cols-2">
          <SidePanel />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 backdrop-blur-xl"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-600/30 blur-3xl" />
            <div className="relative">
              <AnimatePresence mode="wait">
                {step === "form" ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h1 className="font-display text-3xl font-semibold tracking-tight">
                      Create your account
                    </h1>
                    <p className="mt-1 text-sm text-text-2">
                      Already have one?{" "}
                      <Link
                        href="/login"
                        className="text-primary-300 hover:text-text"
                      >
                        Sign in
                      </Link>
                    </p>

                    {err && (
                      <div
                        role="alert"
                        className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
                      >
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>{err}</span>
                      </div>
                    )}

                    <form
                      onSubmit={onSignUp}
                      className="mt-5 space-y-3"
                      noValidate
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="First name"
                          autoComplete="given-name"
                          placeholder="Alex"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (firstNameErr) setFirstNameErr(null);
                          }}
                          onBlur={() =>
                            setFirstNameErr(validateFirstName(firstName))
                          }
                          error={firstNameErr}
                        />
                        <Field
                          label="Last name"
                          autoComplete="family-name"
                          placeholder="Vance"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
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
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (pwdErr) setPwdErr(null);
                          }}
                          onBlur={() => setPwdErr(validatePassword(password))}
                          error={pwdErr}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPwd((v) => !v)}
                          className="absolute right-3 top-9 text-text-2 hover:text-text"
                          aria-label={
                            showPwd ? "Hide password" : "Show password"
                          }
                        >
                          {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                      <label className="flex cursor-pointer items-start gap-2 text-xs text-text-2">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-primary-500"
                          checked={agreed}
                          onChange={(e) => setAgreed(e.target.checked)}
                        />
                        I agree to the{" "}
                        <Link href="/terms" className="text-primary-300">
                          Terms
                        </Link>{" "}
                        &amp;{" "}
                        <Link href="/privacy" className="text-primary-300">
                          Privacy Policy
                        </Link>
                        .
                      </label>
                      <button
                        type="submit"
                        disabled={loading === "signup"}
                        className="btn btn-primary mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading === "signup" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <UserPlus size={14} />
                        )}
                        {loading === "signup"
                          ? "Creating account…"
                          : "Create account"}
                      </button>
                    </form>

                    <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-text-2">
                      <span className="h-px flex-1 bg-card-2" /> or sign up
                      with
                      <span className="h-px flex-1 bg-card-2" />
                    </div>
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
                      {loading === "google"
                        ? "Redirecting…"
                        : "Continue with Google"}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="verify"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setStep("form");
                        setCode("");
                        setErr(null);
                        setInfo(null);
                      }}
                      className="mb-4 inline-flex items-center gap-1.5 text-xs text-text-2 hover:text-text"
                    >
                      <ArrowLeft size={12} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-white shadow-glow">
                        <Mail size={16} />
                      </span>
                      <div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight">
                          Verify your email
                        </h1>
                        <p className="text-sm text-text-2">
                          Enter the code we sent to{" "}
                          <span className="text-text">{email}</span>
                        </p>
                      </div>
                    </div>

                    {info && (
                      <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-sm text-emerald-200">
                        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
                        <span>{info}</span>
                      </div>
                    )}
                    {err && (
                      <div
                        role="alert"
                        className="mt-5 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200"
                      >
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        <span>{err}</span>
                      </div>
                    )}

                    <form onSubmit={onVerify} className="mt-6 space-y-4">
                      <input
                        ref={codeInputRef}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={MAX_OTP}
                        autoComplete="one-time-code"
                        value={code}
                        onChange={(e) =>
                          setCode(
                            e.target.value.replace(/\D/g, "").slice(0, MAX_OTP),
                          )
                        }
                        placeholder={"0".repeat(MIN_OTP)}
                        aria-label="Verification code"
                        className="w-full rounded-2xl border border-border bg-card py-4 text-center font-mono text-3xl font-semibold tracking-[0.3em] tabular-nums outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-400/20"
                      />
                      <button
                        type="submit"
                        disabled={loading === "verify" || code.length < MIN_OTP}
                        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading === "verify" ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {loading === "verify" ? "Verifying…" : "Verify & sign in"}
                      </button>
                      <button
                        type="button"
                        onClick={onResend}
                        disabled={loading === "resend"}
                        className="w-full text-center text-xs text-text-2 hover:text-text disabled:opacity-60"
                      >
                        {loading === "resend"
                          ? "Sending…"
                          : "Didn't get it? Resend code"}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function SidePanel() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative hidden overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary-700/30 via-accent-purple/20 to-bg p-10 backdrop-blur-2xl lg:flex lg:flex-col lg:justify-between"
    >
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" />
      <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-primary-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-72 w-72 rounded-full bg-accent-purple/30 blur-3xl" />
      <div className="relative">
        <Link href="/" aria-label="NexCart home" className="inline-flex">
          <BrandLogo priority className="h-16 w-auto" />
        </Link>
        <h2 className="mt-10 font-display text-4xl font-semibold leading-tight tracking-tight">
          Join the future of{" "}
          <span className="text-gradient-brand">commerce</span>.
        </h2>
        <p className="mt-4 max-w-md text-text-2">
          Get 10% off your first order, exclusive AI-curated picks and premium
          support — free.
        </p>
      </div>
      <ul className="relative space-y-3">
        {(
          [
            [Sparkles, "Personalized AI recommendations"],
            [Zap, "Lightning-fast express delivery"],
            [Brain, "Smart wishlists & price drops"],
            [ShieldCheck, "2-year warranty on every product"],
          ] as const
        ).map(([I, t]) => (
          <li
            key={t}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <I size={16} className="text-primary-300" />
            <span className="text-sm">{t}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
