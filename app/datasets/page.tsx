import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Datasets | GSLHub',
  description: 'Open datasets for generative search, AI systems, automation and digital transformation research.',
};

export const dynamic = 'force-dynamic';

type DatasetCard = {
  id: string;
  title?: string | null;
  summary?: string | null;
  datasetType?: string | null;
  lifecycleStatus?: string | null;
  version?: string | null;
  dataAvailability?: string | null;
  doi?: string | null;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  license?: string | null;
  recordCount?: number | null;
  openData?: boolean | null;
  formats?: Array<{ format?: string | null }> | null;
};

const formatLabel = (value?: string | null) => {
  if (!value) return null;

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

async function getDatasets() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'datasets',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 24,
    depth: 0,
    overrideAccess: false,
  });

  return result.docs as DatasetCard[];
}

export default async function DatasetsPage() {
  const datasets = await getDatasets();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Datasets"
          title="Structured evidence for transparent and reproducible research."
          description="GSLHub datasets connect documented collection methods, versioned records, validation procedures and reusable research outputs."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          {datasets.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {datasets.map((dataset) => {
                const formats = dataset.formats
                  ?.map((item) => item.format)
                  .filter((format): format is string => Boolean(format));

                return (
                  <article key={dataset.id} className="rounded-2xl border border-[var(--border)] p-8">
                    <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      {dataset.datasetType ? <span>{formatLabel(dataset.datasetType)}</span> : null}
                      {dataset.lifecycleStatus ? <span>{formatLabel(dataset.lifecycleStatus)}</span> : null}
                      {dataset.version ? <span>v{dataset.version}</span> : null}
                      {dataset.openData ? <span>Open data</span> : null}
                    </div>

                    <h2 className="mt-7 text-2xl font-semibold tracking-tight">
                      {dataset.title || 'Untitled dataset'}
                    </h2>

                    {dataset.summary ? (
                      <p className="mt-4 leading-7 text-[var(--muted)]">{dataset.summary}</p>
                    ) : null}

                    <dl className="mt-7 grid gap-3 border-t border-[var(--border)] pt-5 text-sm">
                      {dataset.dataAvailability ? (
                        <div className="flex justify-between gap-6">
                          <dt className="text-[var(--muted)]">Availability</dt>
                          <dd className="text-right font-medium">{formatLabel(dataset.dataAvailability)}</dd>
                        </div>
                      ) : null}
                      {dataset.license ? (
                        <div className="flex justify-between gap-6">
                          <dt className="text-[var(--muted)]">License</dt>
                          <dd className="text-right font-medium">{dataset.license}</dd>
                        </div>
                      ) : null}
                      {typeof dataset.recordCount === 'number' ? (
                        <div className="flex justify-between gap-6">
                          <dt className="text-[var(--muted)]">Records</dt>
                          <dd className="text-right font-medium">{dataset.recordCount.toLocaleString('en')}</dd>
                        </div>
                      ) : null}
                      {formats && formats.length > 0 ? (
                        <div className="flex justify-between gap-6">
                          <dt className="text-[var(--muted)]">Formats</dt>
                          <dd className="text-right font-medium">{formats.join(', ')}</dd>
                        </div>
                      ) : null}
                      {dataset.doi ? (
                        <div className="flex justify-between gap-6">
                          <dt className="text-[var(--muted)]">DOI</dt>
                          <dd className="text-right font-medium">{dataset.doi}</dd>
                        </div>
                      ) : null}
                    </dl>

                    {dataset.repositoryUrl || dataset.documentationUrl ? (
                      <div className="mt-7 flex flex-wrap gap-3">
                        {dataset.repositoryUrl ? (
                          <a className="button button-secondary" href={dataset.repositoryUrl} target="_blank" rel="noreferrer">
                            Repository ↗
                          </a>
                        ) : null}
                        {dataset.documentationUrl ? (
                          <a className="button button-secondary" href={dataset.documentationUrl} target="_blank" rel="noreferrer">
                            Documentation ↗
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 md:p-16">
              <p className="eyebrow">Datasets in preparation</p>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">
                The first GSLHub benchmark dataset is currently being structured.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Public dataset records will appear here after their methodology, schema, validation rules, license and release metadata have been reviewed.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
