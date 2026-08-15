import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

const researchAreas = [
  {
    code: '01',
    title: 'Generative Search & GEO',
    description: 'Research into how generative systems retrieve, synthesize and cite information across emerging search experiences.',
    href: '/research',
  },
  {
    code: '02',
    title: 'Applied Artificial Intelligence',
    description: 'Practical evaluation of language models, agents and retrieval systems in real organizational environments.',
    href: '/research',
  },
  {
    code: '03',
    title: 'Automation & Digital Transformation',
    description: 'Reproducible methods for improving processes, decision-making and service delivery with responsible automation.',
    href: '/research',
  },
  {
    code: '04',
    title: 'Open Software & Research',
    description: 'Open-source tools, datasets and documentation that connect scientific evidence with working technology.',
    href: '/research',
  },
];

const platformPillars = [
  { title: 'Publications', description: 'Articles, preprints and technical reports with transparent methods.', href: '/publications' },
  { title: 'Software', description: 'Open tools and reference implementations linked to the research.', href: '/software' },
  { title: 'Datasets', description: 'Documented datasets designed for reuse and reproducibility.', href: '/datasets' },
  { title: 'People', description: 'Researchers and collaborators connecting scientific work with real implementation.', href: '/people' },
];

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchOrganization',
    name: 'GSLHub',
    alternateName: 'Generative Search Lab Hub',
    url: 'https://gslhub.com',
    foundingDate: '2026',
    areaServed: 'International',
    knowsAbout: [
      'Generative Search',
      'Generative Engine Optimization',
      'Artificial Intelligence',
      'Digital Transformation',
      'Open Science',
    ],
    sameAs: ['https://github.com/gslhub'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <SiteHeader />
      <main>
        <section className="shell grid items-center gap-10 py-14 sm:py-20 lg:min-h-[72vh] lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12 lg:py-28">
          <div className="min-w-0">
            <p className="eyebrow">Research · Software · Open Science</p>
            <h1 className="mt-6 max-w-5xl text-[2.7rem] font-semibold leading-[0.96] tracking-[-0.055em] text-balance sm:text-6xl lg:text-8xl">
              Research for a world shaped by intelligent systems.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[var(--muted)] sm:mt-8 sm:text-xl sm:leading-8">
              GSLHub is an independent applied research initiative studying generative search, artificial intelligence,
              automation and digital transformation through open, reproducible work.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap">
              <Link href="/research" className="button button-primary sm:w-auto">Explore research</Link>
              <Link href="/publications" className="button button-secondary sm:w-auto">View publications</Link>
            </div>
          </div>

          <aside className="border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)] lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="grid grid-cols-2 gap-6 lg:block">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em]">Foundation</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">2026</p>
              </div>
              <div className="lg:mt-8">
                <p className="font-mono text-xs uppercase tracking-[0.18em]">Based in</p>
                <p className="mt-3 text-base text-[var(--foreground)]">Barcelona · International scope</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="section-border">
          <div className="shell py-16 sm:py-20">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Research areas</p>
                <h2 className="section-title">Focused questions. Applied evidence.</h2>
              </div>
              <p className="section-intro">
                Our initial agenda connects information retrieval, responsible AI adoption and measurable digital impact.
              </p>
            </div>

            <div className="mt-10 grid overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] sm:mt-12 md:grid-cols-2">
              {researchAreas.map((area) => (
                <Link key={area.code} href={area.href} className="research-card group">
                  <p className="font-mono text-xs text-[var(--muted)]">{area.code}</p>
                  <h3 className="mt-10 text-2xl font-semibold tracking-tight group-hover:text-[var(--brand)] sm:mt-12">{area.title}</h3>
                  <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{area.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-border bg-[var(--surface)]">
          <div className="shell py-16 sm:py-20">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Research platform</p>
                <h2 className="section-title">Evidence connected to implementation.</h2>
              </div>
              <p className="section-intro">
                Every research project is designed to connect its publication, dataset, software and evaluation method.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-4">
              {platformPillars.map((pillar, index) => (
                <Link href={pillar.href} key={pillar.title} className="pillar-card group">
                  <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                  <h3 className="mt-8 text-xl font-semibold group-hover:text-[var(--brand)] sm:mt-10">{pillar.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{pillar.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="section-border">
          <div className="shell py-16 sm:py-20">
            <p className="eyebrow">People</p>
            <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-10">
              <h2 className="section-title">An independent lab built around applied, collaborative research.</h2>
              <div className="text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">
                <p>Founded by Eduardo José Yauri Luna in Barcelona, GSLHub connects professional practice with open scientific work.</p>
                <Link href="/people" className="mt-7 inline-block font-semibold text-[var(--foreground)] underline decoration-[var(--brand)] underline-offset-4 sm:mt-8">
                  Meet the people behind GSLHub
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
