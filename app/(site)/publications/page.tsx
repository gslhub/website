import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Publications | GSLHub',
  description: 'Scientific articles, preprints and technical reports published by GSLHub.',
};

export const dynamic = 'force-dynamic';

type PublicationCard = {
  id: string;
  title?: string | null;
  abstract?: string | null;
  publicationType?: string | null;
  publicationDate?: string | null;
  doi?: string | null;
  venue?: string | null;
  openAccess?: boolean | null;
};

const formatLabel = (value?: string | null) => {
  if (!value) return 'Publication';

  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const formatDate = (value?: string | null) => {
  if (!value) return null;

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(value));
};

async function getPublications() {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'publications',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 24,
    sort: '-publicationDate',
    depth: 1,
    overrideAccess: false,
  });

  return result.docs as PublicationCard[];
}

export default async function PublicationsPage() {
  const publications = await getPublications();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Publications"
          title="Research outputs built for discovery, citation and reuse."
          description="Each publication connects its authors, project, datasets, software and reproducibility materials."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          {publications.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2">
              {publications.map((publication) => {
                const publicationDate = formatDate(publication.publicationDate);

                return (
                  <article
                    key={publication.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-7 md:p-8"
                  >
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                      <span>{formatLabel(publication.publicationType)}</span>
                      {publication.openAccess ? <span>Open access</span> : null}
                    </div>

                    <h2 className="mt-8 text-2xl font-semibold tracking-tight">
                      {publication.title || 'Untitled publication'}
                    </h2>

                    {publication.abstract ? (
                      <p className="mt-4 line-clamp-5 leading-7 text-[var(--muted)]">
                        {publication.abstract}
                      </p>
                    ) : null}

                    <div className="mt-8 border-t border-[var(--border)] pt-5 text-sm text-[var(--muted)]">
                      {publication.venue ? <p>{publication.venue}</p> : null}
                      {publicationDate ? <p className="mt-1">{publicationDate}</p> : null}
                      {publication.doi ? <p className="mt-1 font-mono text-xs">DOI: {publication.doi}</p> : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 md:p-16">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
                Publications in preparation
              </p>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">
                The first GSLHub technical report is currently being developed.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Published research outputs will appear here after completing their scientific review, metadata and release workflow.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
