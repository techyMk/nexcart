import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description:
      "AI-powered electronics store. Shop smartphones, laptops, headphones and more with free delivery on orders over $500.",
    start_url: "/",
    display: "standalone",
    background_color: "#050816",
    theme_color: "#050816",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
