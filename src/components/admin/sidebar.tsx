"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Brain,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShoppingCart,
  Sparkles,
  Tags,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    title: "General",
    items: [
      { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
      { href: "/admin/ai", label: "AI Insights", Icon: Sparkles },
      { href: "/admin/knowledge", label: "Knowledge", Icon: Brain },
    ],
  },
  {
    title: "Catalog",
    items: [
      { href: "/admin/products", label: "Products", Icon: Package },
      { href: "/admin/categories", label: "Categories", Icon: Tags },
      { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
    ],
  },
  {
    title: "People",
    items: [
      { href: "/admin/customers", label: "Customers", Icon: Users },
      { href: "/admin/payouts", label: "Payouts", Icon: Wallet },
      { href: "/admin/settings", label: "Settings", Icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border bg-surface/60 backdrop-blur-xl md:flex md:flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <Image
          src="/brand/nexcart-icon.webp"
          alt="NexCart"
          width={512}
          height={512}
          priority
          className="h-12 w-12"
        />
        <div>
          <div className="font-display text-base font-semibold leading-none">
            Nex<span className="text-gradient-brand">Cart</span>
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-widest text-text-2">
            Admin · v3.0
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3">
        {groups.map((g) => (
          <div key={g.title}>
            <div className="px-3 pb-2 text-[10px] uppercase tracking-widest text-text-2">
              {g.title}
            </div>
            <ul className="space-y-1">
              {g.items.map(({ href, label, Icon }) => {
                const active = pathname === href;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                        active
                          ? "bg-card-2 text-text ring-1 ring-border"
                          : "text-text-2 hover:bg-card-2 hover:text-text",
                      )}
                    >
                      <Icon size={15} />
                      {label}
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gradient-brand" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-text-2 transition hover:bg-card-2 hover:text-text"
        >
          <LogOut size={15} /> Exit admin
        </Link>
      </div>
    </aside>
  );
}
