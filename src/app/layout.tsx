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

export const metadata: Metadata = {
  title: "NexCart — The Future of Intelligent Commerce",
  description:
    "AI-powered ecommerce built for the next generation of digital shopping. Discover smartphones, laptops, audio gear and more, hand-picked by NexCart Intelligence™.",
  metadataBase: new URL("https://nexcart.app"),
  openGraph: {
    title: "NexCart — The Future of Intelligent Commerce",
    description:
      "AI-powered ecommerce built for the next generation of digital shopping.",
    images: ["/brand/nexcart-logo.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexCart — The Future of Intelligent Commerce",
    description:
      "AI-powered ecommerce built for the next generation of digital shopping.",
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
