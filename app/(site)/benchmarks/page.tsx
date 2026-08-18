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

        <section className="shell py-14 sm:py-16 lg:py-20">
          {benchmarks.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {benchmarks.map((benchmark) => {
                const startDate = formatDate(benchmark.startDate);
                const lastRunDate = formatDate(benchmark.lastRunDate);

                return (
                  <article
                    key={benchmark.id}
                    className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-7 md:p-8"
                  >
                    <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--muted)] sm:text-xs sm:tracking-[0.12em]">
                      {benchmark.benchmarkCode ? <span className="break-all">{benchmark.benchmarkCode}</span> : null}
                      {benchmark.benchmarkType ? <span>{formatLabel(benchmark.benchmarkType)}</span> : null}
                      {benchmark.lifecycleStatus ? <span>{formatLabel(benchmark.lifecycleStatus)}</span> : null}
                      {benchmark.version ? <span>v{benchmark.version}</span> : null}
                    </div>

                    <h2 className="mt-7 text-2xl font-semibold tracking-tight text-balance sm:mt-8 sm:text-3xl">
                      {benchmark.title || 'Untitled benchmark'}
                    </h2>

                    {benchmark.summary ? (
                      <p className="mt-4 leading-7 text-[var(--muted)] sm:mt-5">{benchmark.summary}</p>
                    ) : null}

                    {benchmark.metrics && benchmark.metrics.length > 0 ? (
                      <div className="mt-7 border-t border-[var(--border)] pt-6 sm:mt-8">
                        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--brand)]">
                          Core metrics
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {benchmark.metrics.map((metric, index) => (
                            <span
                              key={metric.id || `${metric.code || metric.name || 'metric'}-${index}`}
                              className="max-w-full break-words rounded-full border border-[var(--border)] px-3 py-1.5 text-sm"
                              title={metric.description || undefined}
                            >
                              {metric.code || metric.name || 'Metric'}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {startDate || lastRunDate ? (
                      <div className="mt-7 grid gap-2 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--muted)] sm:mt-8 sm:grid-cols-2 sm:gap-3">
                        {startDate ? <p>Started {startDate}</p> : null}
                        {lastRunDate ? <p>Last run {lastRunDate}</p> : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10 md:p-14">
              <p className="eyebrow">Public benchmark specification</p>
              <h2 className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                GSL-BENCH-GEO-01 is publicly specified and versioned on GitHub.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                The public specification defines AIR, CR, MCP and RCR, includes a machine-readable benchmark definition and provides synthetic validation fixtures. Scientific results remain separate until controlled research releases are reviewed and approved.
              </p>
            </div>
          )}

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8">
            <p className="eyebrow">Open specification</p>
            <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              Specification, methodology and software are maintained independently.
            </h2>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
              Benchmark definitions are maintained in the public benchmarks repository, methodological protocols and coding rules in the research repository, and the reusable deterministic metric implementation in @gslhub/metrics-core.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="button button-secondary" href="https://github.com/gslhub/benchmarks" target="_blank" rel="noreferrer">
                Benchmark repository ↗
              </a>
              <a className="button button-secondary" href="https://github.com/gslhub/software/tree/main/packages/metrics-core" target="_blank" rel="noreferrer">
                Metrics software ↗
              </a>
              <a className="button button-secondary" href="https://github.com/gslhub/research" target="_blank" rel="noreferrer">
                Research methodology ↗
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
