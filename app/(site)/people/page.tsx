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

        <section className="shell py-14 sm:py-16 lg:py-20">
          {researchers.length > 0 ? (
            <div className="grid gap-4 sm:gap-6">
              {researchers.map((researcher) => (
                <article
                  key={researcher.id}
                  className="grid min-w-0 gap-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 sm:p-8 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8 md:p-10 lg:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <div className="flex aspect-square w-24 items-center justify-center rounded-2xl bg-[var(--foreground)] text-2xl font-semibold text-white sm:w-28 md:w-full md:max-w-44 md:text-4xl">
                    {initials(researcher.name)}
                  </div>

                  <div className="min-w-0">
                    {researcher.role ? (
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-[var(--brand)] sm:text-xs sm:tracking-[0.2em]">
                        {researcher.role}
                      </p>
                    ) : null}

                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance sm:mt-4 sm:text-3xl">
                      {researcher.name || 'Unnamed researcher'}
                    </h2>

                    {researcher.biography ? (
                      <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">
                        {researcher.biography}
                      </p>
                    ) : null}

                    <div className="mt-6 grid gap-2 sm:flex sm:flex-wrap sm:gap-3 text-sm font-medium">
                      {researcher.orcid ? (
                        <a
                          className="button button-secondary w-full sm:w-auto"
                          href={`https://orcid.org/${researcher.orcid}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ORCID
                        </a>
                      ) : null}
                      {researcher.googleScholarUrl ? (
                        <a
                          className="button button-secondary w-full sm:w-auto"
                          href={researcher.googleScholarUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Google Scholar
                        </a>
                      ) : null}
                      {researcher.githubUrl ? (
                        <a
                          className="button button-secondary w-full sm:w-auto"
                          href={researcher.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      ) : null}
                      {researcher.linkedinUrl ? (
                        <a
                          className="button button-secondary w-full sm:w-auto"
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
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-7 sm:p-10 md:p-14">
              <p className="eyebrow">Research team</p>
              <h2 className="mt-5 max-w-3xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
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
