import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { products } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured).slice(0, 8);
  return (
    <section className="section py-10 sm:py-20 md:py-28">
      <div className="container">
        <div className="mb-6 text-center sm:mb-10">
          <div className="section-eyebrow">Hand-picked</div>
          <h2 className="section-title mt-2">
            Featured <span className="text-gradient-brand">products</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-2">
            Ranked by NexCart Intelligence™ — these are loved by buyers like
            you this week.
          </p>
          <Link href="/shop" className="btn btn-ghost btn-sm mt-4 sm:mt-5">
            See all products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
