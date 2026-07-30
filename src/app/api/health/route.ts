import { jsonOk } from "@/lib/api";
import {
  isSupabaseConfigured,
  isStripeConfigured,
  optionalEnv,
} from "@/lib/env";

/**
 * GET /api/health — debug helper.
 * Returns which env vars are set (booleans only — never the values).
 * Delete or gate this once everything works.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = optionalEnv("NEXT_PUBLIC_SUPABASE_URL");
  // Extract just the project ref (e.g. "omdxaqmyjkrwpucpgftj" from
  // "https://omdxaqmyjkrwpucpgftj.supabase.co"). Safe to expose — it's in
  // every API call and inside every issued JWT.
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;

  return jsonOk({
    nodeEnv: process.env.NODE_ENV,
    cwd: process.cwd(),
    supabase: {
      url: !!supabaseUrl,
      anonKey: !!optionalEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      serviceRole: !!optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
      configured: isSupabaseConfigured(),
      projectRef,
    },
    stripe: {
      secret: !!optionalEnv("STRIPE_SECRET_KEY"),
      publishable: !!optionalEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
      webhookSecret: !!optionalEnv("STRIPE_WEBHOOK_SECRET"),
      configured: isStripeConfigured(),
    },
    resend: {
      apiKey: !!optionalEnv("RESEND_API_KEY"),
      // Safe to echo — it's just the From header, no secret.
      from: optionalEnv("RESEND_FROM") ?? null,
    },
    siteUrl: optionalEnv("NEXT_PUBLIC_SITE_URL") ?? null,
  });
}
