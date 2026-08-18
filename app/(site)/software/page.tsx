import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Software | GSLHub',
  description: 'Open research software, reproducible metrics and benchmark tooling developed by GSLHub.',
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

const metricsCore: SoftwareCard = {
  id: 'public-metrics-core-v0.1.0',
  title: '@gslhub/metrics-core',
  summary:
    'Framework-independent TypeScript implementations of AIR, CR, MCP and RCR for reproducible Generative Search and GEO evaluation.',
  technicalDescription:
    'Deterministic metric calculations with explicit eligibility exclusions, numerator/denominator data and SHA-256 input/output checksums.',
  softwareType: 'research-library',
  releaseStatus: 'public-release',
  version: '0.1.0',
  repositoryUrl: 'https://github.com/gslhub/software',
  documentationUrl:
    'https://github.com/gslhub/software/tree/main/packages/metrics-core',
  packageUrl: null,
  license: 'AGPL-3.0-only',
  sourceAvailability: 'public-source',
  openSource: true,
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
  const cmsSoftware = await getSoftware();
  const metricsCoreAlreadyPublished = cmsSoftware.some(
    (item) =>
      item.title?.trim().toLowerCase() === metricsCore.title?.toLowerCase() ||
      item.documentationUrl === metricsCore.documentationUrl,
  );
  const software = metricsCoreAlreadyPublished
    ? cmsSoftware
    : [metricsCore, ...cmsSoftware];

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Software"
          title="Open tools that make applied research inspectable and reusable."
          description="GSLHub publishes versioned research software that connects methodological specifications, reproducible benchmarks and independently testable implementations."
        />

        <section className="shell py-14 sm:py-16 lg:py-20">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {software.map((item) => {
              const softwareType = formatLabel(item.softwareType);
              const releaseStatus = formatLabel(item.releaseStatus);
              const sourceAvailability = formatLabel(item.sourceAvailability);

              return (
                <article
                  key={item.id}
                  className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-7 md:p-8"
                >
                  <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--muted)] sm:text-xs sm:tracking-[0.12em]">
                    {softwareType ? <span>{softwareType}</span> : null}
                    {releaseStatus ? <span>{releaseStatus}</span> : null}
                    {item.version ? <span>v{item.version}</span> : null}
                  </div>

                  <h2 className="mt-7 text-xl font-semibold tracking-tight text-balance sm:mt-8 sm:text-2xl">
                    {item.title || 'Untitled software'}
                  </h2>

                  {item.summary ? (
                    <p className="mt-4 leading-7 text-[var(--muted)]">{item.summary}</p>
                  ) : null}

                  {item.technicalDescription ? (
                    <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                      {item.technicalDescription}
                    </p>
                  ) : null}

                  <div className="mt-7 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)] sm:mt-8">
                    <div className="flex min-w-0 flex-wrap gap-x-5 gap-y-2">
                      {sourceAvailability ? <span>{sourceAvailability}</span> : null}
                      {item.license ? <span className="break-words">License: {item.license}</span> : null}
                      {item.openSource ? <span>Open source</span> : null}
                    </div>
                  </div>

                  {item.repositoryUrl || item.documentationUrl || item.packageUrl ? (
                    <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                      {item.repositoryUrl ? (
                        <a className="button button-secondary w-full sm:w-auto" href={item.repositoryUrl} target="_blank" rel="noreferrer">
                          Repository ↗
                        </a>
                      ) : null}
                      {item.documentationUrl ? (
                        <a className="button button-secondary w-full sm:w-auto" href={item.documentationUrl} target="_blank" rel="noreferrer">
                          Documentation ↗
                        </a>
                      ) : null}
                      {item.packageUrl ? (
                        <a className="button button-secondary w-full sm:w-auto" href={item.packageUrl} target="_blank" rel="noreferrer">
                          Package ↗
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <p className="eyebrow">Specification → implementation</p>
            <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
              Normative metric definitions and synthetic validation fixtures are maintained in the public GSLHub benchmarks repository. Research protocols and coding rules are maintained separately in the research repository so methodology, software and production integration can be versioned and audited independently.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="button button-secondary" href="https://github.com/gslhub/benchmarks" target="_blank" rel="noreferrer">
                Benchmark specifications ↗
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
