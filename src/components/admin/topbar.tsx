import Image from "next/image";
import Link from "next/link";
import { Bell, Search, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function AdminTopbar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let avatarUrl: string | null = null;
  let fullName = "Admin";
  let email = "";

  if (user) {
    email = user.email ?? "";
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();
    avatarUrl =
      profile?.avatar_url ??
      (user.user_metadata?.avatar_url as string | undefined) ??
      null;
    fullName =
      profile?.full_name ?? user.email?.split("@")[0] ?? "Admin";
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface/60 px-6 backdrop-blur-xl md:px-8">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-2"
          />
          <input
            placeholder="Search products, orders, customers…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-sm outline-none placeholder:text-text-2 focus:border-text/20"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/admin/ai"
          aria-label="Open AI Insights"
          className="chip transition hover:brightness-125"
        >
          <Sparkles size={12} /> AI Copilot
        </Link>
        <button
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-text-2 hover:text-text"
        >
          <Bell size={15} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gradient-brand" />
        </button>
        <Link
          href="/account"
          aria-label={fullName ? `${fullName}'s account` : "Account"}
          title={email || fullName}
          className="relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-brand text-xs font-semibold ring-1 ring-border transition hover:ring-text/20"
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={fullName}
              width={36}
              height={36}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              unoptimized
            />
          ) : (
            <span className="text-white">{initials(fullName) || "·"}</span>
          )}
        </Link>
      </div>
    </header>
  );
}
