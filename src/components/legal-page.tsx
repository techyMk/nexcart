import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

type Section = {
  id: string;
  title: string;
  body: React.ReactNode;
};

export type LegalPageProps = {
  eyebrow: string;
  Icon: LucideIcon;
  title: React.ReactNode;
  intro: React.ReactNode;
  updatedAt: string;
  sections: Section[];
};

export function LegalPage({
  eyebrow,
  Icon,
  title,
  intro,
  updatedAt,
  sections,
}: LegalPageProps) {
  return (
    <div className="pt-24 md:pt-32">
      <div className="container">
        <div className="mx-auto max-w-3xl">
          <div className="chip">
            <Icon size={12} /> {eyebrow}
          </div>
          <h1 className="page-title mt-5">
            {title}
          </h1>
          <p className="mt-5 text-base text-text-2 md:text-lg">{intro}</p>
          <div className="mt-4 text-xs uppercase tracking-[0.18em] text-text-2">
            Last updated · {updatedAt}
          </div>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-10 md:mt-16 md:grid-cols-[220px_1fr]">
          <aside className="md:sticky md:top-28 md:self-start">
            <div className="text-xs uppercase tracking-[0.18em] text-text-2">
              On this page
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex items-center gap-1 text-text-2 transition hover:text-text"
                  >
                    <ChevronRight size={12} className="opacity-60" />
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <article className="text-[15px] leading-relaxed">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  {s.title}
                </h2>
                <div className="mt-3 space-y-3 text-text-2">{s.body}</div>
                <div className="my-10 h-px w-full bg-card-2 last:hidden" />
              </section>
            ))}

            <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-text-2">
              Questions, requests, or concerns? Reach our team at{" "}
              <a
                href="mailto:techymk.dev@gmail.com"
                className="font-medium text-text hover:text-primary-300"
              >
                techymk.dev@gmail.com
              </a>
              {" "}or visit our{" "}
              <Link href="/about" className="font-medium text-text hover:text-primary-300">
                About page
              </Link>
              .
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
