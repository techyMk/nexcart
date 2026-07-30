"use client";

import Link from "next/link";
import Image from "next/image";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Headphones,
  Heart,
  Menu,
  Moon,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sun,
  Truck,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useCart } from "@/store/cart";
import { useWishlist } from "@/store/wishlist";
import { useCommandPalette } from "@/store/command";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop?ai=1", label: "AI Picks" },
  { href: "/shop?sale=1", label: "Deals" },
  { href: "/about", label: "About" },
];

/* Shop, AI Picks and Deals share the /shop pathname and differ only by query,
   so active state must compare the full href, not just the pathname. */
function isLinkActive(href: string, current: string) {
  const [hPath, hQuery] = href.split("?");
  const [cPath, cQuery = ""] = current.split("?");
  if (hPath !== cPath) return false;
  const cp = new URLSearchParams(cQuery);
  if (hQuery) {
    const hp = new URLSearchParams(hQuery);
    for (const [k, v] of hp.entries()) if (cp.get(k) !== v) return false;
    return true;
  }
  return cp.get("ai") !== "1" && cp.get("sale") !== "1";
}

/* useSearchParams needs a Suspense boundary for static prerendering; the
   boundary fallback renders the same links matched on pathname alone. */
function useCurrentHref() {
  const pathname = usePathname();
  const qs = useSearchParams().toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

function DesktopNavLinks({ current }: { current: string }) {
  return (
    <>
      {links.map((l) => {
        const active = isLinkActive(l.href, current);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "relative rounded-full px-4 py-2 text-sm transition-colors",
              active ? "text-text" : "text-text-2 hover:text-text",
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-bubble"
                className="absolute inset-0 -z-10 rounded-full bg-card-2 ring-1 ring-border"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

function DesktopNavLinksActive() {
  return <DesktopNavLinks current={useCurrentHref()} />;
}

function MobileNavLinks({
  current,
  onNavigate,
}: {
  current: string;
  onNavigate: () => void;
}) {
  return (
    <>
      {links.map((l) => {
        const active = isLinkActive(l.href, current);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "rounded-xl px-3 py-3 text-sm transition",
              active
                ? "bg-card-2 text-text ring-1 ring-border"
                : "text-text-2 hover:bg-card-2 hover:text-text",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </>
  );
}

function MobileNavLinksActive({ onNavigate }: { onNavigate: () => void }) {
  return <MobileNavLinks current={useCurrentHref()} onNavigate={onNavigate} />;
}

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { toggle: toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  // Badges read persisted zustand stores (localStorage) — render them only
  // after hydration to avoid an SSR mismatch and a flash of stale counts.
  const [hydrated, setHydrated] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const openCart = useCart((s) => s.openCart);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const wishCount = useWishlist((s) => s.items.length);
  const openPalette = useCommandPalette((s) => s.openPalette);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      setFullName(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setAvatarUrl(
          data?.avatar_url ??
            (user.user_metadata?.avatar_url as string | undefined) ??
            null,
        );
        setFullName(
          data?.full_name ??
            (user.user_metadata?.full_name as string | undefined) ??
            user.email ??
            null,
        );
      } catch {
        if (!cancelled) {
          setAvatarUrl(
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
          );
          setFullName(
            (user.user_metadata?.full_name as string | undefined) ??
              user.email ??
              null,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const initials = (fullName ?? user?.email ?? "")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu]);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled || menu ? "bg-bg/85 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <TrustRow collapsed={scrolled || menu} />
      <div className="container flex h-16 items-center justify-between gap-2 sm:gap-4 md:h-24 md:gap-6">
        <Link
          href="/"
          aria-label="NexCart home"
          className="group inline-flex items-center"
        >
          <BrandLogo
            priority
            className="h-12 w-auto transition-transform group-hover:scale-[1.02] md:h-16"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Suspense fallback={<DesktopNavLinks current={pathname} />}>
            <DesktopNavLinksActive />
          </Suspense>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Desktop search pill */}
          <button
            onClick={openPalette}
            className="hidden h-9 items-center gap-2 rounded-full border border-border bg-card px-3 text-sm text-text-2 transition hover:bg-card-2 md:flex"
            aria-label="Open search"
          >
            <Search size={15} />
            <span className="hidden lg:inline">Search products…</span>
            <kbd className="ml-2 hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-text-2 lg:inline">
              ⌘K
            </kbd>
          </button>

          {/* Mobile search icon */}
          <button
            onClick={openPalette}
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text md:hidden"
          >
            <Search size={17} />
          </button>

          {/* Theme toggle — Sun shows in dark (switch to light), Moon in light */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
          >
            <Sun size={17} className="hidden dark:block" />
            <Moon size={17} className="dark:hidden" />
          </button>

          {/* Wishlist — desktop only (mobile users access via the menu) */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist${wishCount > 0 ? ` (${wishCount})` : ""}`}
            className="relative hidden h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text md:inline-flex"
          >
            <Heart size={17} />
            {hydrated && wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                {wishCount}
              </span>
            )}
          </Link>

          {/* Account — visible on ALL screens. Goes to /account; middleware
              bounces unauthenticated users to /login. Shows avatar/initials
              when signed in so the auth state is visually obvious. */}
          {user ? (
            <Link
              href="/account"
              aria-label={fullName ? `${fullName}'s account` : "Account"}
              title={fullName ?? user.email ?? "Account"}
              className="relative inline-block h-9 w-9"
            >
              <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-brand text-[11px] font-semibold text-white ring-1 ring-border transition hover:ring-text/20">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{initials || "·"}</span>
                )}
              </span>
              <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-bg" />
            </Link>
          ) : (
            <Link
              href="/account"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
              aria-label="Account"
            >
              <User size={18} />
            </Link>
          )}

          {/* Cart — visible on all screens */}
          <button
            onClick={openCart}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text"
            aria-label={`Cart${count > 0 ? ` (${count} items)` : ""}`}
          >
            <ShoppingBag size={18} />
            {hydrated && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand-deep px-1 text-[10px] font-semibold leading-none text-white">
                {count}
              </span>
            )}
          </button>

          {/* Start Shopping CTA — desktop only. Uses ArrowRight to stay
              visually distinct from the cart icon next to it. */}
          <Link
            href="/shop"
            className="btn btn-primary btn-sm ml-1 hidden h-9 md:inline-flex"
          >
            Start Shopping
            <ArrowRight size={14} />
          </Link>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenu((v) => !v)}
            className="ml-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full text-text-2 hover:bg-card-2 hover:text-text md:hidden"
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="bg-bg/95 backdrop-blur-xl md:hidden"
          >
            <div className="container flex flex-col gap-1 py-4">
              <Suspense
                fallback={
                  <MobileNavLinks
                    current={pathname}
                    onNavigate={() => setMenu(false)}
                  />
                }
              >
                <MobileNavLinksActive onNavigate={() => setMenu(false)} />
              </Suspense>

              <div className="my-2 h-px bg-card-2" />

              <Link
                href="/account"
                onClick={() => setMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-2 transition hover:bg-card-2 hover:text-text"
              >
                {user ? (
                  <>
                    <span className="relative inline-block h-6 w-6 shrink-0">
                      <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-brand text-[10px] font-semibold text-white ring-1 ring-border">
                        {avatarUrl ? (
                          <Image
                            src={avatarUrl}
                            alt=""
                            width={24}
                            height={24}
                            unoptimized
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{initials || "·"}</span>
                        )}
                      </span>
                      <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-bg" />
                    </span>
                    <span className="truncate text-text">
                      {fullName ?? user.email}
                    </span>
                  </>
                ) : (
                  <>
                    <User size={15} /> Sign in
                  </>
                )}
                <ArrowRight size={13} className="ml-auto text-text-2/70" />
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setMenu(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-text-2 transition hover:bg-card-2 hover:text-text"
              >
                <Heart size={15} /> Wishlist
                {hydrated && wishCount > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                    {wishCount}
                  </span>
                )}
                <ArrowRight size={13} className="ml-auto text-text-2/70" />
              </Link>

              <Link
                href="/shop"
                onClick={() => setMenu(false)}
                className="btn btn-primary mt-3 justify-center"
              >
                Start Shopping <ArrowRight size={14} />
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

const trustItems = [
  { Icon: Truck, label: `Free delivery over $${FREE_SHIPPING_THRESHOLD}` },
  { Icon: RotateCcw, label: "7-day returns" },
  { Icon: ShieldCheck, label: "2-year warranty" },
  { Icon: Headphones, label: "24/7 support" },
];

/* Mobile-only (below sm) auto-rotating ticker cycling through every trust
   offer, one at a time. Under reduced motion it still rotates but swaps
   instantly instead of sliding. */
function MobileTrustTicker() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % trustItems.length),
      3000,
    );
    return () => clearInterval(id);
  }, []);

  const { Icon, label } = trustItems[index];

  return (
    /* h-full + overflow-hidden clips the vertical slide inside the h-8 row. */
    <span className="flex h-full w-full items-center justify-center overflow-hidden sm:hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
        >
          <Icon size={12} className="text-primary-300" />
          <span>{label}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function TrustRow({ collapsed }: { collapsed: boolean }) {
  // Collapses via grid-template-rows (GPU-friendly, no max-height layout
  // thrash on every scroll-threshold crossing).
  return (
    <div
      aria-hidden={collapsed}
      className={cn(
        "grid transition-[grid-template-rows] duration-300 ease-out",
        collapsed ? "[grid-template-rows:0fr]" : "[grid-template-rows:1fr]",
      )}
    >
      <div className="overflow-hidden">
        <div
          className={cn(
            "border-b border-border bg-gradient-to-r from-primary-900/30 via-accent-purple/20 to-primary-900/30 backdrop-blur-xl transition-opacity duration-300 ease-out",
            collapsed ? "opacity-0" : "opacity-100",
          )}
        >
          <div className="container flex h-8 items-center justify-center gap-x-6 gap-y-1 overflow-hidden text-[11px] text-text-2 sm:gap-x-8">
            {/* Below sm the static items collapse into a rotating ticker so
                mobile users still see all four offers. */}
            <MobileTrustTicker />
            {trustItems.map(({ Icon, label }, i) => (
              <span
                key={label}
                className={cn(
                  "hidden shrink-0 items-center gap-1.5 whitespace-nowrap sm:inline-flex",
                  i > 1 && "sm:hidden md:inline-flex",
                )}
              >
                <Icon size={12} className="text-primary-300" />
                <span>{label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
