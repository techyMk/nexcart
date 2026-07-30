import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Inline styles rendering /public/brand-logos/<slug>.svg as a CSS mask, so
 *  the mark takes the element's background color and adapts to the theme. */
export function brandMaskStyle(slug: string, size: "contain" | "cover") {
  const url = `url(/brand-logos/${slug}.svg)`;
  return {
    maskImage: url,
    WebkitMaskImage: url,
    maskSize: size,
    WebkitMaskSize: size,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  } as const;
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
