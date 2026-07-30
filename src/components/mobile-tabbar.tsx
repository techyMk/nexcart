"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Search, ShoppingBag, Store, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useCommandPalette } from "@/store/command";
import { useAuth } from "@/components/auth-provider";
import { createClient } from "@/lib/supabase/client";

export function MobileTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const cartCount = useCart((s) =>
    s.lines.reduce((a, l) => a + l.quantity, 0),
  );
  const openPalette = useCommandPalette((s) => s.openPalette);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        if (cancelled) return;
        setAvatarUrl(
          data?.avatar_url ??
            (user.user_metadata?.avatar_url as string | undefined) ??
            null,
        );
      } catch {
        if (!cancelled) {
          setAvatarUrl(
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (pathname?.startsWith("/admin")) return null;
  if (pathname?.startsWith("/login")) return null;

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname?.startsWith(href) ?? false;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        <TabItem
          href="/"
          label="Home"
          active={isActive("/", true)}
          icon={<Home size={18} />}
        />
        <TabItem
          href="/shop"
          label="Shop"
          active={isActive("/shop")}
          icon={<Store size={18} />}
        />
        <li>
          <button
            type="button"
            onClick={openPalette}
            aria-label="Search"
            className="flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] text-text-2 transition hover:text-text"
          >
            <Search size={18} />
            <span>Search</span>
          </button>
        </li>
        <CartTab count={cartCount} active={false} />
        <AccountTab
          active={isActive("/account")}
          avatarUrl={avatarUrl}
          signedIn={!!user}
        />
      </ul>
    </nav>
  );
}

function TabItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          "flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] transition",
          active ? "text-text" : "text-text-2 hover:text-text",
        )}
      >
        <span
          className={cn(
            "transition",
            active && "text-primary-300",
          )}
        >
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

function CartTab({ count, active }: { count: number; active: boolean }) {
  const openCart = useCart((s) => s.openCart);
  return (
    <li>
      <button
        type="button"
        onClick={openCart}
        aria-label={`Cart${count > 0 ? ` (${count})` : ""}`}
        className={cn(
          "relative flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] transition",
          active ? "text-text" : "text-text-2 hover:text-text",
        )}
      >
        <span className="relative">
          <ShoppingBag size={18} />
          {count > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-brand px-1 text-[10px] font-semibold leading-none text-white">
              {count}
            </span>
          )}
        </span>
        <span>Cart</span>
      </button>
    </li>
  );
}

function AccountTab({
  active,
  avatarUrl,
  signedIn,
}: {
  active: boolean;
  avatarUrl: string | null;
  signedIn: boolean;
}) {
  return (
    <li>
      <Link
        href="/account"
        className={cn(
          "flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] transition",
          active ? "text-text" : "text-text-2 hover:text-text",
        )}
      >
        {signedIn ? (
          <span className="relative inline-block h-[18px] w-[18px]">
            <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-gradient-brand ring-1 ring-border">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt=""
                  width={18}
                  height={18}
                  unoptimized
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User size={12} className="text-white" />
              )}
            </span>
            <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-bg" />
          </span>
        ) : (
          <User size={18} />
        )}
        <span>{signedIn ? "You" : "Sign in"}</span>
      </Link>
    </li>
  );
}
