import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  /** Sizing/effect classes applied to both variants, e.g. "h-16 w-auto". */
  className?: string;
  priority?: boolean;
};

/** Theme-aware NexCart wordmark. Both variants are rendered and CSS picks the
 *  visible one, so the swap is instant and immune to hydration mismatches. */
export function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <>
      {/* 320x160 = 2x the largest render (footer h-20) — keeps the preload small. */}
      <Image
        src="/brand/nexcart-logo.webp"
        alt="NexCart"
        width={320}
        height={160}
        priority={priority}
        className={cn("hidden dark:block", className)}
      />
      <Image
        src="/brand/nexcart-logo-light.webp"
        alt="NexCart"
        width={320}
        height={160}
        priority={priority}
        className={cn("dark:hidden", className)}
      />
    </>
  );
}
