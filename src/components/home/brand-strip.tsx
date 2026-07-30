import { brandMaskStyle as maskStyle } from "@/lib/utils";

/* Monochrome brand marks from /public/brand-logos, tinted via CSS mask so they
   follow the theme's text color. Simple Icons glyphs live in square canvases:
   compact marks render as icon + name lockups; wide wordmarks render alone,
   sized by their measured glyph aspect with mask-size:cover cropping the
   canvas' empty vertical padding. */
type Brand =
  | { name: string; slug: string; type: "icon" }
  | { name: string; slug: string; type: "wordmark"; aspect: number };

const brands: Brand[] = [
  { name: "Apple", slug: "apple", type: "icon" },
  { name: "Sony", slug: "sony", type: "wordmark", aspect: 5.45 },
  { name: "Samsung", slug: "samsung", type: "wordmark", aspect: 6.32 },
  { name: "DJI", slug: "dji", type: "icon" },
  { name: "Meta", slug: "meta", type: "icon" },
  { name: "Google", slug: "google", type: "icon" },
  { name: "Microsoft", slug: "microsoft", type: "icon" },
  { name: "ASUS", slug: "asus", type: "wordmark", aspect: 4.8 },
];

function BrandMark({ brand, hidden }: { brand: Brand; hidden?: boolean }) {
  if (brand.type === "wordmark") {
    return (
      <span
        role={hidden ? undefined : "img"}
        aria-label={hidden ? undefined : brand.name}
        aria-hidden={hidden || undefined}
        className="h-5 shrink-0 bg-text opacity-50 transition-opacity hover:opacity-100"
        style={{ width: `${1.25 * brand.aspect}rem`, ...maskStyle(brand.slug, "cover") }}
      />
    );
  }
  return (
    <span
      aria-hidden={hidden || undefined}
      className="flex shrink-0 items-center gap-2.5 opacity-50 transition-opacity hover:opacity-100"
    >
      <span
        aria-hidden
        className="h-6 w-6 shrink-0 bg-text"
        style={maskStyle(brand.slug, "contain")}
      />
      <span className="font-display text-2xl font-semibold tracking-tight">
        {brand.name}
      </span>
    </span>
  );
}

export function BrandStrip() {
  return (
    <section className="relative z-10 pt-16 md:pt-20">
      <div className="container">
        <div className="text-center text-xs uppercase tracking-[0.2em] text-text-2">
          Trusted by the brands you already love
        </div>
        <div className="mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max items-center gap-16 animate-marquee hover:[animation-play-state:paused]">
            {brands.map((b) => (
              <BrandMark key={b.slug} brand={b} />
            ))}
            {brands.map((b) => (
              <BrandMark key={`${b.slug}-2`} brand={b} hidden />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
