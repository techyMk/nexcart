import type { MetadataRoute } from "next";
import { products } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/security`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
