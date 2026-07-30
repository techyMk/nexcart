"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/newsletter-form";
import { brandMaskStyle } from "@/lib/utils";

const cols = [
  {
    title: "Shop",
    links: [
      ["All products", "/shop"],
      ["Smartphones", "/shop?cat=smartphones"],
      ["Laptops", "/shop?cat=laptops"],
      ["Audio", "/shop?cat=audio"],
      ["Gaming", "/shop?cat=gaming"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "/about"],
      ["Order tracking", "/account"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "/terms"],
      ["Privacy", "/privacy"],
      ["Security", "/security"],
    ],
  },
];

const socials = [
  { slug: "x", label: "X", href: "https://x.com/TechyMk" },
  { slug: "instagram", label: "Instagram", href: "https://www.instagram.com/techymk.dev/" },
  { slug: "github", label: "GitHub", href: "https://github.com/techyMk" },
  { slug: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/techymk" },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="relative z-10 mt-24 border-t border-border bg-bg/60 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link
              href="/"
              aria-label="NexCart home"
              className="inline-flex items-center"
            >
              <BrandLogo className="h-20 w-auto" />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-text-2">
              Intelligent commerce, engineered for the next decade. AI-curated
              products, lightning checkout, premium service worldwide.
            </p>
            {/* Home already has the big Newsletter section — avoid two forms on one page. */}
            {pathname !== "/" && (
              <NewsletterForm variant="footer" source="footer" />
            )}
            <div className="mt-6 flex items-center gap-2 text-text-2">
              {socials.map(({ slug, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition hover:bg-card-2 hover:text-text"
                  aria-label={label}
                >
                  <span
                    aria-hidden
                    className="h-[15px] w-[15px] bg-current"
                    style={brandMaskStyle(slug, "contain")}
                  />
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="col-span-1">
              <div className="mb-4 text-xs uppercase tracking-[0.18em] text-text-2">
                {c.title}
              </div>
              <ul className="space-y-2.5 text-sm">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-text-2 transition hover:text-text"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-text-2 md:flex-row md:items-center">
          <div className="flex flex-col gap-1">
            <div>© {new Date().getFullYear()} NexCart Inc. All rights reserved.</div>
            <div>
              Designed &amp; developed by{" "}
              <a
                href="https://techymk.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-text transition hover:text-primary-300"
              >
                techyMk
              </a>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition hover:text-text">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-text">
              Terms
            </Link>
            <Link href="/security" className="transition hover:text-text">
              Security
            </Link>
            <span className="chip chip-neutral text-[10px] uppercase tracking-widest">
              Powered by NexCart Intelligence™
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
