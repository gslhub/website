import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Software | GSLHub',
  description: 'Research software, benchmark tooling and open technical outputs developed by GSLHub.',
};

export const dynamic = 'force-dynamic';

type SoftwareCard = {
  id: string;
  title?: string | null;
  summary?: string | null;
  technicalDescription?: string | null;
  softwareType?: string | null;
  releaseStatus?: string | null;
  version?: string | null;
  repositoryUrl?: string | null;
  documentationUrl?: string | null;
  packageUrl?: string | null;
  license?: string | null;
  sourceAvailability?: string | null;
  openSource?: boolean | null;
};

const formatLabel = (value?: string | null) => {
  if (!value) return null;

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

async function getSoftware() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: 'software',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 24,
    depth: 0,
    overrideAccess: false,
  });

  return result.docs as SoftwareCard[];
}

export default async function SoftwarePage() {
  const software = await getSoftware();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Software"
          title="Open tools that make applied research inspectable and reusable."
          description="GSLHub software connects methods, experiments and publications through versioned repositories, documentation and citable releases."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          {software.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {software.map((item) => {
                const softwareType = formatLabel(item.softwareType);
                const releaseStatus = formatLabel(item.releaseStatus);
                const sourceAvailability = formatLabel(item.sourceAvailability);

                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-7 md:p-8"
                  >
                    <div className="flex flex-wrap gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      {softwareType ? <span>{softwareType}</span> : null}
                      {releaseStatus ? <span>{releaseStatus}</span> : null}
                      {item.version ? <span>v{item.version}</span> : null}
                    </div>

                    <h2 className="mt-8 text-2xl font-semibold tracking-tight">
                      {item.title || 'Untitled software'}
                    </h2>

                    {item.summary ? (
                      <p className="mt-4 leading-7 text-[var(--muted)]">{item.summary}</p>
                    ) : null}

                    <div className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
                      <div className="flex flex-wrap gap-x-5 gap-y-2">
                        {sourceAvailability ? <span>{sourceAvailability}</span> : null}
                        {item.license ? <span>License: {item.license}</span> : null}
                        {item.openSource ? <span>Open source</span> : null}
                      </div>
                    </div>

                    {item.repositoryUrl || item.documentationUrl || item.packageUrl ? (
                      <div className="mt-6 flex flex-wrap gap-3">
                        {item.repositoryUrl ? (
                          <a className="button button-secondary" href={item.repositoryUrl} target="_blank" rel="noreferrer">
                            Repository ↗
                          </a>
                        ) : null}
                        {item.documentationUrl ? (
                          <a className="button button-secondary" href={item.documentationUrl} target="_blank" rel="noreferrer">
                            Documentation ↗
                          </a>
                        ) : null}
                        {item.packageUrl ? (
                          <a className="button button-secondary" href={item.packageUrl} target="_blank" rel="noreferrer">
                            Package ↗
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
              <p className="eyebrow">Software in development</p>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">
                The first GSLHub benchmark toolkit is currently being prepared.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Public software records will appear here after repository, documentation, version and release metadata have been validated.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
