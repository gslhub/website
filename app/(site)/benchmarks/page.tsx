import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Benchmarks | GSLHub',
  description: 'Reproducible benchmarks for evaluating visibility, citation, retrieval and consistency in generative search systems.',
};

export const dynamic = 'force-dynamic';

type BenchmarkMetric = {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  description?: string | null;
  direction?: string | null;
};

type BenchmarkCard = {
  id: string;
  title?: string | null;
  summary?: string | null;
  benchmarkCode?: string | null;
  benchmarkType?: string | null;
  lifecycleStatus?: string | null;
  version?: string | null;
  metrics?: BenchmarkMetric[] | null;
  startDate?: string | null;
  lastRunDate?: string | null;
};

const formatLabel = (value?: string | null) => {
  if (!value) return null;

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
};

async function getBenchmarks() {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'benchmarks',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 24,
    sort: '-startDate',
    depth: 0,
    overrideAccess: false,
  });

  return result.docs as BenchmarkCard[];
}

export default async function BenchmarksPage() {
  const benchmarks = await getBenchmarks();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Benchmarks"
          title="Reproducible evaluation frameworks for generative search systems."
          description="GSLHub benchmarks connect controlled prompts, repeated observations, transparent metrics and versioned datasets to make AI search visibility measurable and comparable."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          {benchmarks.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {benchmarks.map((benchmark) => {
                const startDate = formatDate(benchmark.startDate);
                const lastRunDate = formatDate(benchmark.lastRunDate);

                return (
                  <article
                    key={benchmark.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-7 md:p-8"
                  >
                    <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      {benchmark.benchmarkCode ? <span>{benchmark.benchmarkCode}</span> : null}
                      {benchmark.benchmarkType ? <span>{formatLabel(benchmark.benchmarkType)}</span> : null}
                      {benchmark.lifecycleStatus ? <span>{formatLabel(benchmark.lifecycleStatus)}</span> : null}
                      {benchmark.version ? <span>v{benchmark.version}</span> : null}
                    </div>

                    <h2 className="mt-8 text-3xl font-semibold tracking-tight">
                      {benchmark.title || 'Untitled benchmark'}
                    </h2>

                    {benchmark.summary ? (
                      <p className="mt-5 leading-7 text-[var(--muted)]">{benchmark.summary}</p>
                    ) : null}

                    {benchmark.metrics && benchmark.metrics.length > 0 ? (
                      <div className="mt-8 border-t border-[var(--border)] pt-6">
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--brand)]">
                          Core metrics
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {benchmark.metrics.map((metric, index) => (
                            <span
                              key={metric.id || `${metric.code || metric.name || 'metric'}-${index}`}
                              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
                              title={metric.description || undefined}
                            >
                              {metric.code || metric.name || 'Metric'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {startDate || lastRunDate ? (
                      <div className="mt-8 grid gap-3 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--muted)] sm:grid-cols-2">
                        {startDate ? <p>Started {startDate}</p> : null}
                        {lastRunDate ? <p>Last run {lastRunDate}</p> : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 md:p-16">
              <p className="eyebrow">Benchmarks in preparation</p>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">
                The first GSLHub generative search benchmark is currently being prepared.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Public benchmark records will appear here after their protocol, metrics, systems, datasets and release metadata have been reviewed.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
