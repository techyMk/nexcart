import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { MobileTabBar } from "@/components/mobile-tabbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { AnimatedBg } from "@/components/animated-bg";
import { AIAssistantFab } from "@/components/ai-assistant-fab";
import { CommandPalette } from "@/components/command-palette";
import { ScrollProgress } from "@/components/scroll-progress";
import { AuthProvider } from "@/components/auth-provider";
import { AuthGateModal } from "@/components/auth-gate-modal";
import { MotionProvider } from "@/components/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Shop smartphones, laptops, headphones, cameras, drones and smart home gear, hand-picked by NexCart Intelligence™ AI curation. Free delivery on orders over $500.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NexCart — AI-Powered Electronics Store",
    template: "%s | NexCart",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "electronics",
    "smartphones",
    "laptops",
    "headphones",
    "cameras",
    "drones",
    "smart home",
    "wearables",
    "AI shopping",
    "online electronics store",
    "NexCart",
  ],
  applicationName: SITE_NAME,
  category: "ecommerce",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    siteName: SITE_NAME,
    url: SITE_URL,
    locale: "en_US",
    type: "website",
    title: "NexCart — AI-Powered Electronics Store",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/brand/nexcart-logo.webp",
        alt: "NexCart — AI-Powered Electronics Store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCart — AI-Powered Electronics Store",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/brand/nexcart-logo.webp",
        alt: "NexCart — AI-Powered Electronics Store",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  viewportFit: "cover",
};

// Runs before paint: applies the persisted theme class, falling back to the
// OS preference (prefers-color-scheme) when the user hasn't chosen one, so
// there is no flash of the wrong theme. Any error falls back to dark, which
// matches the SSR'd class.
const themeInitScript = `(function(){try{var s=localStorage.getItem('nexcart-theme');var dark=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',dark)}catch(e){document.documentElement.classList.add('dark')}})();`;

// Server-rendered structured data: Organization + WebSite (with SearchAction).
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/nexcart-logo.webp`,
    sameAs: [
      "https://x.com/TechyMk",
      "https://www.instagram.com/techymk.dev/",
      "https://github.com/techyMk",
      "https://www.linkedin.com/in/techymk",
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${space.variable} dark`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="relative overflow-x-hidden bg-bg pb-[calc(3.5rem+env(safe-area-inset-bottom))] text-text md:pb-0">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ThemeProvider>
          <AuthProvider>
            <MotionProvider>
              <AnimatedBg />
              <Navbar />
              <ScrollProgress />
              <main className="relative z-10 pb-24 md:pb-32">{children}</main>
              <Footer />
              <CartDrawer />
              <CommandPalette />
              <AuthGateModal />
              <AIAssistantFab />
              <MobileTabBar />
            </MotionProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
