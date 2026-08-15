import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Scientific Dashboard | GSLHub',
  description:
    'Public indicators for GSLHub benchmarks, experiments, prompts, executions, observations, evidence, citations and validated metrics.',
};

export const dynamic = 'force-dynamic';

type MetricRecord = {
  id: string;
  metricCode?: string | null;
  metricName?: string | null;
  metricVersion?: string | null;
  metricCategory?: string | null;
  direction?: string | null;
  numericValue?: number | null;
  booleanValue?: boolean | null;
  textValue?: string | null;
  valueType?: string | null;
  unit?: string | null;
  sampleSize?: number | null;
  resultSummary?: string | null;
  calculatedAt?: string | null;
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

const formatMetricValue = (metric: MetricRecord) => {
  if (metric.valueType === 'boolean') return metric.booleanValue ? 'Yes' : 'No';
  if (metric.valueType === 'text') return metric.textValue || '—';
  if (typeof metric.numericValue !== 'number') return '—';

  if (metric.unit === 'percentage') return `${metric.numericValue.toLocaleString('en', { maximumFractionDigits: 2 })}%`;
  if (metric.unit === 'proportion') return metric.numericValue.toLocaleString('en', { maximumFractionDigits: 4 });
  if (metric.unit === 'milliseconds') return `${metric.numericValue.toLocaleString('en')} ms`;

  return metric.numericValue.toLocaleString('en', { maximumFractionDigits: 4 });
};

async function getDashboardData() {
  const payload = await getPayload({ config });

  const [
    benchmarks,
    experiments,
    prompts,
    aiSystems,
    promptExecutions,
    observations,
    evidence,
    citations,
    metrics,
    latestMetrics,
  ] = await Promise.all([
    payload.find({ collection: 'benchmarks', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'experiments', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'prompts', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'ai-systems', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'prompt-executions', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'observations', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'evidence', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'citations', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({ collection: 'metrics', limit: 1, depth: 0, overrideAccess: false }),
    payload.find({
      collection: 'metrics',
      locale: 'en',
      fallbackLocale: 'en',
      limit: 12,
      depth: 0,
      sort: '-calculatedAt',
      overrideAccess: false,
      where: {
        lifecycleStatus: {
          equals: 'validated',
        },
      },
    }),
  ]);

  return {
    counts: [
      { label: 'Benchmarks', value: benchmarks.totalDocs },
      { label: 'Experiments', value: experiments.totalDocs },
      { label: 'Prompts', value: prompts.totalDocs },
      { label: 'AI systems', value: aiSystems.totalDocs },
      { label: 'Prompt executions', value: promptExecutions.totalDocs },
      { label: 'Observations', value: observations.totalDocs },
      { label: 'Evidence records', value: evidence.totalDocs },
      { label: 'Citations', value: citations.totalDocs },
      { label: 'Metric records', value: metrics.totalDocs },
    ],
    latestMetrics: latestMetrics.docs as MetricRecord[],
  };
}

export default async function ScientificDashboardPage() {
  const { counts, latestMetrics } = await getDashboardData();
  const totalPublicRecords = counts.reduce((total, item) => total + item.value, 0);

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Scientific dashboard"
          title="Public indicators from the GSLHub research pipeline."
          description="This dashboard exposes only published scientific records. Draft experiments, executions, evidence and provisional calculations remain private until their review workflow is complete."
        />

        <section className="shell py-14 sm:py-16">
          <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-8 sm:pb-10 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Published research layer</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Research pipeline overview
              </h2>
            </div>
            <p className="font-mono text-xs text-[var(--muted)] sm:text-sm">
              {totalPublicRecords.toLocaleString('en')} public records
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
            {counts.map((item) => (
              <article key={item.label} className="min-w-0 bg-white p-5 sm:p-6 md:p-8">
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs sm:tracking-[0.14em]">
                  {item.label}
                </p>
                <p className="mt-4 text-4xl font-semibold tracking-tight sm:mt-5">
                  {item.value.toLocaleString('en')}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--surface)]">
          <div className="shell py-14 sm:py-16">
            <div className="max-w-3xl">
              <p className="eyebrow">Validated results</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                Latest published metrics
              </h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">
                Metric records appear here only after they have been calculated, reviewed, validated and published.
              </p>
            </div>

            {latestMetrics.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 lg:grid-cols-2">
                {latestMetrics.map((metric) => {
                  const calculatedAt = formatDate(metric.calculatedAt);

                  return (
                    <article key={metric.id} className="min-w-0 rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7 md:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--muted)] sm:text-xs sm:tracking-[0.12em]">
                          {metric.metricCode ? <span>{metric.metricCode}</span> : null}
                          {metric.metricVersion ? <span>v{metric.metricVersion}</span> : null}
                          {metric.metricCategory ? <span>{formatLabel(metric.metricCategory)}</span> : null}
                        </div>
                        {metric.direction ? (
                          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                            {formatLabel(metric.direction)}
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-6 text-xl font-semibold tracking-tight sm:mt-7 sm:text-2xl">
                        {metric.metricName || metric.metricCode || 'Metric result'}
                      </h3>
                      <p className="mt-4 break-words text-4xl font-semibold tracking-tight text-[var(--brand)] sm:mt-5 sm:text-5xl">
                        {formatMetricValue(metric)}
                      </p>

                      {metric.resultSummary ? (
                        <p className="mt-5 leading-7 text-[var(--muted)]">{metric.resultSummary}</p>
                      ) : null}

                      {calculatedAt || typeof metric.sampleSize === 'number' ? (
                        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--muted)] sm:mt-7">
                          {calculatedAt ? <span>Calculated {calculatedAt}</span> : null}
                          {typeof metric.sampleSize === 'number' ? <span>n = {metric.sampleSize}</span> : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] bg-white p-6 sm:mt-10 sm:p-10 md:p-14">
                <p className="eyebrow">Metrics in preparation</p>
                <h3 className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight sm:text-3xl">
                  The first validated GSLHub benchmark results have not been published yet.
                </h3>
                <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                  Results will appear after prompt executions, observations, citations and evidence have passed scientific quality control.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
