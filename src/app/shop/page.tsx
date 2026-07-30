import type { Metadata } from "next";
import { ShopView } from "./shop-view";

export const metadata: Metadata = {
  title: "Shop All Products",
  description:
    "Browse NexCart's full catalog of smartphones, laptops, audio, gaming gear, wearables and smart home tech. AI-curated picks, live deals and free delivery on orders over $500.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return <ShopView />;
}
