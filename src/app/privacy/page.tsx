import { Lock } from "lucide-react";
import { LegalPage } from "@/components/legal-page";

export const metadata = {
  title: "Privacy Policy",
  description:
    "How NexCart collects, uses, and protects your personal data when you shop with us.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      Icon={Lock}
      title={
        <>
          Your data,{" "}
          <span className="text-gradient-brand">protected by design.</span>
        </>
      }
      intro="This Privacy Policy explains what personal information we collect when you use NexCart, why we collect it, and the rights you have over it. We keep the language plain, and the practice tight."
      updatedAt="14 May 2026"
      sections={[
        {
          id: "what-we-collect",
          title: "What we collect",
          body: (
            <>
              <p>
                We only collect what we need to run your account, fulfil your orders, and improve our products:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li><strong>Account data</strong> — name, email, profile photo, password hash (we never see the plaintext).</li>
                <li><strong>Order data</strong> — shipping address, items, prices, payment receipts (card numbers stay with our payment processor).</li>
                <li><strong>Product interactions</strong> — pages viewed, items wishlisted, queries to NexCart Intelligence — used to personalise your experience.</li>
                <li><strong>Device &amp; usage data</strong> — IP, browser, OS, anonymised analytics events.</li>
              </ul>
            </>
          ),
        },
        {
          id: "how-we-use-it",
          title: "How we use it",
          body: (
            <ul className="list-disc space-y-1.5 pl-5">
              <li>To create and secure your account.</li>
              <li>To process and deliver orders, returns, and refunds.</li>
              <li>To power recommendations and AI-assisted shopping (NexCart Intelligence).</li>
              <li>To send you transactional emails — receipts, shipping updates, security notices.</li>
              <li>To send marketing emails <em>only</em> if you have opted in. You can unsubscribe any time.</li>
              <li>To prevent fraud, abuse, and to comply with legal obligations.</li>
            </ul>
          ),
        },
        {
          id: "who-we-share-with",
          title: "Who we share with",
          body: (
            <>
              <p>
                We never sell your data. We share the minimum necessary with vetted processors:
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li><strong>Stripe / Razorpay</strong> — payment processing.</li>
                <li><strong>Supabase</strong> — database, authentication, and storage.</li>
                <li><strong>Resend</strong> — transactional and marketing email delivery.</li>
                <li><strong>Vercel</strong> — application hosting and edge delivery.</li>
                <li><strong>Groq &amp; Google Gemini</strong> — AI inference for NexCart Intelligence (only the question and matching catalog context are sent, never your account identifiers).</li>
              </ul>
            </>
          ),
        },
        {
          id: "your-rights",
          title: "Your rights",
          body: (
            <>
              <p>You can, at any time:</p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>See, edit, or delete your profile from <em>Account → Edit profile</em>.</li>
                <li>Export your order history on request.</li>
                <li>Ask us to delete your account entirely — write to techymk.dev@gmail.com and we&apos;ll do it within 30 days.</li>
                <li>Withdraw consent for marketing email from any unsubscribe link.</li>
              </ul>
              <p>
                If you&apos;re in the EU/UK, you also have rights under GDPR (access, rectification, portability, objection, restriction). If you&apos;re in California, your CCPA rights are honoured — including the right to opt out of any future &ldquo;sale&rdquo; of personal information (we don&apos;t sell it today).
              </p>
            </>
          ),
        },
        {
          id: "retention",
          title: "How long we keep it",
          body: (
            <p>
              Account data is retained while your account is active. Order and tax records are retained for 7 years to satisfy accounting and consumer-protection laws. Analytics events are aggregated and de-identified after 24 months. Deletion requests purge everything except records we&apos;re legally required to keep.
            </p>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <p>
              We use a small set of first-party cookies for authentication, cart persistence, and anti-fraud. Analytics cookies are optional. You can clear them at any time in your browser; clearing the auth cookie will sign you out.
            </p>
          ),
        },
        {
          id: "children",
          title: "Children",
          body: (
            <p>
              NexCart is not intended for children under 16. We don&apos;t knowingly collect data from them. If you believe we have, please contact us and we&apos;ll delete it.
            </p>
          ),
        },
        {
          id: "changes",
          title: "Changes to this policy",
          body: (
            <p>
              When we make material changes we&apos;ll email you and update the &ldquo;Last updated&rdquo; date above. Continued use after the change means you accept the updated policy.
            </p>
          ),
        },
      ]}
    />
  );
}
