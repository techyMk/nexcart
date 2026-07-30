import { ShieldCheck } from "lucide-react";
import { LegalPage } from "@/components/legal-page";

export const metadata = {
  title: "Security",
  description:
    "How we secure your account, payments, and data — from encryption to incident response.",
};

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Security"
      Icon={ShieldCheck}
      title={
        <>
          Built secure,{" "}
          <span className="text-gradient-brand">end to end.</span>
        </>
      }
      intro="We treat the security of your account, your card details, and your shopping data as a product feature — not an afterthought. Here's how the system is set up, and how we keep it that way."
      updatedAt="14 May 2026"
      sections={[
        {
          id: "infrastructure",
          title: "Infrastructure",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>The app runs on <strong>Vercel</strong> with all traffic served over TLS 1.3.</li>
              <li>Our database is <strong>Supabase Postgres</strong> with row-level security policies enforcing per-user access on every read and write.</li>
              <li>File uploads (avatars, knowledge-base documents) live in <strong>Supabase Storage</strong> with bucket-level access policies and signed URLs for private files.</li>
              <li>Every secret — Supabase service role keys, Stripe keys, Groq keys — is stored in Vercel&apos;s encrypted environment store. None are shipped to the browser.</li>
            </ul>
          ),
        },
        {
          id: "payments",
          title: "Payments",
          body: (
            <p>
              We do not store, log, or process card numbers ourselves. Payments are handled by <strong>Stripe</strong> (and <strong>Razorpay</strong> for Indian payments), which are PCI-DSS Level 1 certified. Your card data goes directly to them; we receive only a one-time charge token and the order confirmation.
            </p>
          ),
        },
        {
          id: "authentication",
          title: "Authentication",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Passwords are hashed with bcrypt (handled by Supabase Auth) — we never see the plaintext.</li>
              <li>OTP-based and Google OAuth sign-in are supported as alternatives.</li>
              <li>Session tokens are HTTP-only, Secure, SameSite=Lax cookies, refreshed automatically.</li>
              <li>Administrative routes (<code>/admin/*</code>) are gated by middleware that verifies a server-issued admin role on every request — never trusting a client-side flag.</li>
            </ul>
          ),
        },
        {
          id: "data-protection",
          title: "Data protection",
          body: (
            <p>
              Data is encrypted at rest (AES-256 on Supabase Postgres and Storage) and in transit (TLS 1.3). Backups run automatically every day with 7 days of point-in-time recovery. Production data never leaves the EU/US Supabase region in which it was created.
            </p>
          ),
        },
        {
          id: "ai-safety",
          title: "AI safety",
          body: (
            <p>
              NexCart Intelligence retrieves only product, policy, and FAQ context — never personal account data — and sends it to <strong>Groq</strong> (for chat) and <strong>Google Gemini</strong> (for embeddings) under their data-processing terms. Conversations are not used to train external models.
            </p>
          ),
        },
        {
          id: "responsible-disclosure",
          title: "Responsible disclosure",
          body: (
            <>
              <p>
                Found a vulnerability? Please report it to{" "}
                <a
                  href="mailto:techymk.dev@gmail.com"
                  className="font-medium text-text hover:text-primary-300"
                >
                  techymk.dev@gmail.com
                </a>
                {" "}with a clear description, reproduction steps, and (if possible) a proof of concept.
              </p>
              <p>
                We commit to acknowledging your report within 2 business days, keeping you informed of progress, and crediting you in our advisory once the fix is shipped — provided you didn&apos;t exfiltrate user data, didn&apos;t run automated load tests, and gave us reasonable time to patch.
              </p>
            </>
          ),
        },
        {
          id: "incidents",
          title: "Incident response",
          body: (
            <p>
              If a security incident affects user data, we follow a documented playbook: contain, assess, patch, and notify affected users within 72 hours along with the steps we&apos;ve taken. Status updates are posted on our status page during ongoing incidents.
            </p>
          ),
        },
      ]}
    />
  );
}
