import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'People | GSLHub',
  description: 'Researchers, collaborators and contributors participating in GSLHub.',
};

export default function PeoplePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="People" title="An independent research initiative built around collaboration and applied expertise." description="GSLHub will connect researchers, practitioners, developers and institutional partners working on generative search, AI and digital transformation." />
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <article className="grid gap-8 rounded-2xl border border-[var(--border)] p-8 md:grid-cols-[180px_1fr] md:p-10">
            <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-[var(--foreground)] text-4xl font-semibold text-white">EY</div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">Founder & Research Director</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">Eduardo José Yauri Luna</h2>
              <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">Digital strategy, technical SEO, artificial intelligence, automation, CRM and digital transformation specialist. His research agenda focuses on translating real-world technology projects into reproducible evidence and open research outputs.</p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                <a className="rounded-full border border-[var(--border)] px-4 py-2" href="https://github.com/emmakex" target="_blank" rel="noreferrer">GitHub</a>
                <a className="rounded-full border border-[var(--border)] px-4 py-2" href="https://www.linkedin.com/in/eduardoyauriluna/" target="_blank" rel="noreferrer">LinkedIn</a>
              </div>
            </div>
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
