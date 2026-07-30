import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ScrollRail } from "@/components/scroll-rail";

export function NewArrivals() {
  const recent = [...products].sort((a, b) => b.id - a.id).slice(0, 4);
  return (
    <section className="section py-10 sm:py-20 md:py-28">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <div className="section-eyebrow">Just landed</div>
            <h2 className="section-title mt-2">
              New <span className="text-gradient-brand">arrivals</span>
            </h2>
            <p className="mt-3 max-w-xl text-text-2">
              Fresh drops, calibrated to your interests by NexCart Intelligence™.
            </p>
          </div>
          <Link href="/shop" className="btn btn-ghost btn-sm">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <ScrollRail
          ariaLabel="New arrivals"
          arrowClassName="md:hidden"
          className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-5 px-5 md:-mx-[max(1.25rem,calc((100vw-1280px)/2))] md:px-[max(1.25rem,calc((100vw-1280px)/2))]"
        >
          {recent.map((p, i) => (
            <div key={p.id} className="w-[260px] shrink-0 snap-start">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </ScrollRail>
      </div>
    </section>
  );
}
