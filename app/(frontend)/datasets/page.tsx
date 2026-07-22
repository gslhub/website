import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Datasets | GSLHub',
  description: 'Open datasets for generative search, AI systems, automation and digital transformation research.',
};

export default function DatasetsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Datasets" title="Structured evidence for transparent and reproducible research." description="Datasets will be documented with clear provenance, variables, collection methods, limitations, licenses and links to the studies that use them." />
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-[var(--border)] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brand)]">Dataset 001 · Planned</p>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">GSL Generative Search Visibility Dataset</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">A longitudinal dataset designed to compare citations, mentions, sources and answer patterns across generative search systems.</p>
            </article>
            <article className="rounded-2xl border border-[var(--border)] p-8">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--brand)]">Principles</p>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">Responsible data publication</h2>
              <p className="mt-4 leading-7 text-[var(--muted)]">Every release will include a data dictionary, methodology, quality notes, ethical considerations, version history and an explicit reuse license.</p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
