import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Software | GSLHub',
  description: 'Open-source tools, prototypes and research software developed by GSLHub.',
};

const projects = [
  ['GEO Audit', 'An open research toolkit for evaluating technical, semantic and citation-readiness signals for generative search.'],
  ['GSL Benchmark Toolkit', 'A reproducible framework for collecting, normalizing and comparing outputs from AI search systems.'],
  ['Research Templates', 'Reusable structures for papers, datasets, software citation and reproducibility documentation.'],
];

export default function SoftwarePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Software" title="Open tools that make applied research inspectable and reusable." description="GSLHub software will connect methods, experiments and publications through versioned repositories, documentation and citable releases." />
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {projects.map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-[var(--border)] p-7">
                <span className="inline-flex rounded-full bg-[var(--surface)] px-3 py-1 font-mono text-xs text-[var(--muted)]">Planned</span>
                <h2 className="mt-8 text-2xl font-semibold tracking-tight">{title}</h2>
                <p className="mt-4 leading-7 text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
