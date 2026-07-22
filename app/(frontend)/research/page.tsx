import type { Metadata } from 'next';
import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Research | GSLHub',
  description: 'Research areas at GSLHub: generative search, applied AI, automation, digital transformation and open science.',
};

const areas = [
  ['Generative Search & GEO', 'How generative systems discover, retrieve, synthesize and cite information, and how organizations can improve visibility responsibly.'],
  ['Applied Artificial Intelligence', 'Practical uses of language models, agents, retrieval systems and decision-support tools in real operational environments.'],
  ['Automation & Digital Transformation', 'Frameworks for redesigning processes, integrating systems and measuring the organizational impact of automation.'],
  ['Open Software & Reproducible Research', 'Research artifacts that connect publications with source code, datasets, methods and verifiable results.'],
];

export default function ResearchPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow="Research" title="Applied research designed to produce evidence, software and measurable impact." description="GSLHub studies how artificial intelligence changes search, organizations and society through reproducible, practice-led research." />
        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
            {areas.map(([title, description], index) => (
              <article key={title} className="bg-white p-8 md:p-10">
                <p className="font-mono text-xs text-[var(--muted)]">0{index + 1}</p>
                <h2 className="mt-10 text-2xl font-semibold tracking-tight">{title}</h2>
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
