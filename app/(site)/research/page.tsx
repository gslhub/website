import type { Metadata } from 'next';
import { getPayload } from 'payload';
import config from '@payload-config';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export const metadata: Metadata = {
  title: 'Research | GSLHub',
  description: 'Research areas and active scientific projects at GSLHub.',
};

export const dynamic = 'force-dynamic';

type ResearchAreaCard = {
  id: string;
  code?: string | null;
  title?: string | null;
  summary?: string | null;
};

type ResearchProjectCard = {
  id: string;
  title?: string | null;
  summary?: string | null;
  projectCode?: string | null;
  projectType?: string | null;
  status?: string | null;
  startDate?: string | null;
};

const formatLabel = (value?: string | null) => {
  if (!value) return 'Research';

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

async function getResearchContent() {
  const payload = await getPayload({ config });

  const [areasResult, projectsResult] = await Promise.all([
    payload.find({
      collection: 'research-areas',
      locale: 'en',
      fallbackLocale: 'en',
      limit: 50,
      sort: 'code',
      depth: 0,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'projects',
      locale: 'en',
      fallbackLocale: 'en',
      limit: 12,
      sort: '-startDate',
      depth: 0,
      overrideAccess: false,
    }),
  ]);

  return {
    areas: areasResult.docs as ResearchAreaCard[],
    projects: projectsResult.docs as ResearchProjectCard[],
  };
}

export default async function ResearchPage() {
  const { areas, projects } = await getResearchContent();

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Research"
          title="Applied research designed to produce evidence, software and measurable impact."
          description="GSLHub studies how artificial intelligence changes search, organizations and society through reproducible, practice-led research."
        />

        <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
          <div className="mb-10 max-w-3xl">
            <p className="eyebrow">Research areas</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Scientific domains connected to active work.
            </h2>
          </div>

          {areas.length > 0 ? (
            <div
              className={`grid overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] ${
                areas.length === 1 ? 'grid-cols-1' : 'gap-px md:grid-cols-2'
              }`}
            >
              {areas.map((area, index) => (
                <article key={area.id} className="bg-[var(--background)] p-8 md:p-10">
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {area.code || String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-10 text-2xl font-semibold tracking-tight">
                    {area.title || 'Untitled research area'}
                  </h3>
                  {area.summary ? (
                    <p className="mt-4 max-w-3xl leading-7 text-[var(--muted)]">{area.summary}</p>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-[var(--muted)]">
              Research areas are being prepared.
            </div>
          )}
        </section>

        <section className="section-border bg-[var(--surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16 md:px-10">
            <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-end">
              <div>
                <p className="eyebrow">Projects</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                  Current research programmes and experimental work.
                </h2>
              </div>
              <p className="leading-7 text-[var(--muted)]">
                Each project connects its research questions with methods, software, datasets and publication outputs.
              </p>
            </div>

            {projects.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {projects.map((project) => {
                  const startDate = formatDate(project.startDate);

                  return (
                    <article
                      key={project.id}
                      className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-7 md:p-8"
                    >
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                        {project.projectCode ? <span>{project.projectCode}</span> : null}
                        <span>{formatLabel(project.projectType)}</span>
                        <span>{formatLabel(project.status)}</span>
                      </div>
                      <h3 className="mt-8 text-2xl font-semibold tracking-tight">
                        {project.title || 'Untitled project'}
                      </h3>
                      {project.summary ? (
                        <p className="mt-4 leading-7 text-[var(--muted)]">{project.summary}</p>
                      ) : null}
                      {startDate ? (
                        <p className="mt-8 border-t border-[var(--border)] pt-5 font-mono text-xs text-[var(--muted)]">
                          Started {startDate}
                        </p>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--background)] p-8 text-[var(--muted)]">
                Public research projects will appear here once available.
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
