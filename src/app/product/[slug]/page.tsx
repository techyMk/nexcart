import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRelated, products, type Product } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { ProductDetail } from "./product-detail";

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

function buildDescription(p: Product): string {
  const base = p.description?.trim()
    ? p.description.trim()
    : `${p.name} — ${p.category} by ${p.brand}. $${p.price}, rated ${p.rating}/5 by ${p.reviews} shoppers. Shop now at NexCart.`;
  return base.length > 155 ? `${base.slice(0, 152).trimEnd()}...` : base;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = getProduct(params.slug);
  if (!product) return {};
  const description = buildDescription(product);
  const url = `/product/${product.slug}`;
  return {
    title: product.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url,
      images: [{ url: product.images[0], alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: [product.images[0]],
    },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const related = getRelated(product, 4);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      image: product.images,
      description: product.description,
      sku: product.slug,
      brand: { "@type": "Brand", name: product.brand || "NexCart" },
      ...(product.rating && product.reviews
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviews,
            },
          }
        : {}),
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/product/${product.slug}`,
        priceCurrency: "USD",
        price: product.price,
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${SITE_URL}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: product.category,
          item: `${SITE_URL}/shop?cat=${product.categorySlug}`,
        },
        { "@type": "ListItem", position: 4, name: product.name },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
