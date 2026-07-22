import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Publications | GSLHub',
  description: 'Scientific articles, preprints, whitepapers and technical reports published by GSLHub.',
};

export default function PublicationsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Publications" title="Research outputs built for discovery, citation and reuse." description="This catalogue will connect every publication with its authors, DOI, datasets, software, references and reproducibility materials." />
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 md:p-16">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">First paper in preparation</p>
            <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">Generative Engine Optimization: a research framework for visibility in AI-mediated search.</h2>
            <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">The initial publication will establish the conceptual framework, research questions, methodology and benchmark design for GSLHub’s generative search programme.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
