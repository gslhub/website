import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Resources | GSLHub',
  description: 'Research protocols, methodology guides, templates, prompt libraries and technical documentation from GSLHub.',
};

export const dynamic = 'force-dynamic';

type ResourceCard = {
  id: string;
  title?: string | null;
  summary?: string | null;
  resourceType?: string | null;
  lifecycleStatus?: string | null;
  version?: string | null;
  externalUrl?: string | null;
  repositoryUrl?: string | null;
  publicationDate?: string | null;
  license?: string | null;
  openAccess?: boolean | null;
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

async function getResources() {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'resources',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 24,
    sort: '-publicationDate',
    depth: 0,
    overrideAccess: false,
  });

  return result.docs as ResourceCard[];
}

export default async function ResourcesPage() {
  const resources = await getResources();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Resources"
          title="Reusable methods, protocols and technical materials for open research."
          description="GSLHub resources turn research procedures into documented materials that can be reviewed, reused and independently replicated."
        />

        <section className="shell py-14 sm:py-16 lg:py-20">
          {resources.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {resources.map((resource) => {
                const publicationDate = formatDate(resource.publicationDate);

                return (
                  <article
                    key={resource.id}
                    className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-7 md:p-8"
                  >
                    <div className="flex flex-wrap gap-x-3 gap-y-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-[var(--muted)] sm:text-xs sm:tracking-[0.12em]">
                      {resource.resourceType ? <span>{formatLabel(resource.resourceType)}</span> : null}
                      {resource.lifecycleStatus ? <span>{formatLabel(resource.lifecycleStatus)}</span> : null}
                      {resource.version ? <span>v{resource.version}</span> : null}
                      {resource.openAccess ? <span>Open access</span> : null}
                    </div>

                    <h2 className="mt-7 text-2xl font-semibold tracking-tight text-balance sm:mt-8 sm:text-3xl">
                      {resource.title || 'Untitled resource'}
                    </h2>

                    {resource.summary ? (
                      <p className="mt-4 leading-7 text-[var(--muted)] sm:mt-5">{resource.summary}</p>
                    ) : null}

                    {resource.license || publicationDate ? (
                      <div className="mt-7 flex min-w-0 flex-wrap gap-x-4 gap-y-2 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--muted)] sm:mt-8">
                        {resource.license ? <span className="break-words">{resource.license}</span> : null}
                        {publicationDate ? <span>Published {publicationDate}</span> : null}
                      </div>
                    ) : null}

                    {resource.externalUrl || resource.repositoryUrl ? (
                      <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                        {resource.externalUrl ? (
                          <a
                            className="button button-primary w-full sm:w-auto"
                            href={resource.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open resource
                          </a>
                        ) : null}
                        {resource.repositoryUrl ? (
                          <a
                            className="button button-secondary w-full sm:w-auto"
                            href={resource.repositoryUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Repository
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10 md:p-14">
              <p className="eyebrow">Resources in preparation</p>
              <h2 className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                The first GSLHub research protocol is currently being prepared.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Public resources will appear here after their content, version, authorship, access conditions and related research outputs have been reviewed.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
