import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categories, type Category } from "@/lib/data";
import { ScrollRail } from "@/components/scroll-rail";

export function CategoriesSection() {
  return (
    <section className="section py-10 sm:py-20 md:py-28">
      <div className="container">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="section-eyebrow">Browse the universe</div>
            <h2 className="section-title mt-2">
              Shop by <span className="text-gradient-brand">category</span>
            </h2>
          </div>
          <Link href="/shop" className="btn btn-ghost btn-sm shrink-0">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Arrows and autoplay are mobile-only; md+ keeps the original static
            rail/grid so desktop renders exactly as before. */}
        <ScrollRail
          ariaLabel="Product categories"
          arrowClassName="md:hidden"
          autoPlay
          autoPlayMaxWidth={767}
          className="no-scrollbar -mx-5 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 sm:mt-8 md:mt-10 lg:mx-0 lg:grid lg:grid-cols-4 lg:gap-4 lg:overflow-visible lg:px-0 lg:pb-0">
          {categories.map((cat) => (
            <CategoryTile key={cat.id} cat={cat} />
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}

function CategoryTile({ cat }: { cat: Category }) {
  return (
    <Link
      href={`/shop?cat=${cat.slug}`}
      className="group relative block w-[180px] shrink-0 snap-start overflow-hidden rounded-2xl border border-border ring-1 ring-transparent transition duration-300 hover:ring-primary-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:w-auto"
    >
      <div className="relative aspect-[3/4] bg-surface-2">
        <Image
          src={cat.image}
          alt={cat.name}
          fill
          sizes="(max-width: 1023px) 180px, 300px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Bottom scrim over the photo — intentionally stays dark in both themes */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-4 pr-12">
        <div className="transition-transform duration-300 group-hover:-translate-y-1">
          <div className="font-display text-lg font-semibold leading-tight text-white">
            {cat.name}
          </div>
          <div className="mt-1 text-xs text-white/70">{cat.count} products</div>
        </div>
      </div>

      <span
        aria-hidden
        className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white opacity-0 ring-1 ring-white/25 backdrop-blur-sm transition-all duration-300 group-hover:-rotate-45 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <ArrowRight size={14} />
      </span>
    </Link>
  );
}
