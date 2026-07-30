import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'People | GSLHub',
  description: 'Researchers, collaborators and contributors participating in GSLHub.',
};

export const dynamic = 'force-dynamic';

type ResearcherCard = {
  id: string;
  name?: string | null;
  role?: string | null;
  biography?: string | null;
  orcid?: string | null;
  googleScholarUrl?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
};

const initials = (name?: string | null) => {
  if (!name) return 'GL';

  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

async function getResearchers() {
  const payload = await getPayload({ config });

  const result = await payload.find({
    collection: 'researchers',
    locale: 'en',
    fallbackLocale: 'en',
    limit: 50,
    sort: 'name',
    depth: 0,
    overrideAccess: false,
  });

  return result.docs as ResearcherCard[];
}

export default async function PeoplePage() {
  const researchers = await getResearchers();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="People"
          title="An independent research initiative built around collaboration and applied expertise."
          description="GSLHub connects researchers, practitioners, developers and institutional partners working on generative search, AI and digital transformation."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          {researchers.length > 0 ? (
            <div className="grid gap-6">
              {researchers.map((researcher) => (
                <article
                  key={researcher.id}
                  className="grid gap-8 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8 md:grid-cols-[180px_1fr] md:p-10"
                >
                  <div className="flex h-44 w-44 items-center justify-center rounded-2xl bg-[var(--foreground)] text-4xl font-semibold text-white">
                    {initials(researcher.name)}
                  </div>

                  <div>
                    {researcher.role ? (
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--brand)]">
                        {researcher.role}
                      </p>
                    ) : null}

                    <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                      {researcher.name || 'Unnamed researcher'}
                    </h2>

                    {researcher.biography ? (
                      <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
                        {researcher.biography}
                      </p>
                    ) : null}

                    <div className="mt-6 flex flex-wrap gap-3 text-sm font-medium">
                      {researcher.orcid ? (
                        <a
                          className="rounded-full border border-[var(--border)] px-4 py-2"
                          href={`https://orcid.org/${researcher.orcid}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ORCID
                        </a>
                      ) : null}
                      {researcher.googleScholarUrl ? (
                        <a
                          className="rounded-full border border-[var(--border)] px-4 py-2"
                          href={researcher.googleScholarUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Google Scholar
                        </a>
                      ) : null}
                      {researcher.githubUrl ? (
                        <a
                          className="rounded-full border border-[var(--border)] px-4 py-2"
                          href={researcher.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      ) : null}
                      {researcher.linkedinUrl ? (
                        <a
                          className="rounded-full border border-[var(--border)] px-4 py-2"
                          href={researcher.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 md:p-16">
              <p className="eyebrow">Research team</p>
              <h2 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight">
                Researcher profiles are currently being prepared.
              </h2>
              <p className="mt-5 max-w-2xl leading-7 text-[var(--muted)]">
                Public researcher records will appear here once their profiles and identifiers have been validated.
              </p>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
