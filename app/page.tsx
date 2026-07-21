const researchAreas = [
  {
    code: '01',
    title: 'Generative Search & GEO',
    description: 'Research into how generative systems retrieve, synthesize and cite information across emerging search experiences.',
  },
  {
    code: '02',
    title: 'Applied Artificial Intelligence',
    description: 'Practical evaluation of language models, agents and retrieval systems in real organizational environments.',
  },
  {
    code: '03',
    title: 'Automation & Digital Transformation',
    description: 'Reproducible methods for improving processes, decision-making and service delivery with responsible automation.',
  },
  {
    code: '04',
    title: 'Open Software & Research',
    description: 'Open-source tools, datasets and documentation that connect scientific evidence with working technology.',
  },
];

const platformPillars = [
  ['Publications', 'Articles, preprints and technical reports with transparent methods.'],
  ['Software', 'Open tools and reference implementations linked to the research.'],
  ['Datasets', 'Documented datasets designed for reuse and reproducibility.'],
  ['Benchmarks', 'Repeatable evaluations of AI search, GEO and applied systems.'],
];

const navItems = ['Research', 'Publications', 'Software', 'Datasets', 'People'];

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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />

      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="shell flex min-h-20 items-center justify-between gap-6">
          <a href="#top" aria-label="GSLHub home" className="shrink-0">
            <span className="block text-lg font-semibold tracking-tight">GSLHub</span>
            <span className="block text-xs text-[var(--muted)]">Generative Search Lab Hub</span>
          </a>

          <nav aria-label="Primary navigation" className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="nav-link">
                {item}
              </a>
            ))}
          </nav>

          <a href="https://github.com/gslhub" className="button button-secondary" target="_blank" rel="noreferrer">
            GitHub ↗
          </a>
        </div>
      </header>

      <section id="top" className="shell grid min-h-[76vh] items-center gap-12 py-20 lg:grid-cols-[1fr_18rem] lg:py-28">
        <div>
          <p className="eyebrow">Research · Software · Open Science</p>
          <h1 className="mt-6 max-w-5xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
            Research for a world shaped by intelligent systems.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)] sm:text-xl">
            GSLHub is an independent applied research initiative studying generative search, artificial intelligence,
            automation and digital transformation through open, reproducible work.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href="#research" className="button button-primary">Explore research</a>
            <a href="#publications" className="button button-secondary">View publications</a>
          </div>
        </div>

        <aside className="border-l border-[var(--border)] pl-6 text-sm text-[var(--muted)]">
          <p className="font-mono text-xs uppercase tracking-[0.18em]">Foundation</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)]">2026</p>
          <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em]">Based in</p>
          <p className="mt-3 text-base text-[var(--foreground)]">Barcelona · International scope</p>
        </aside>
      </section>

      <section id="research" className="section-border">
        <div className="shell py-20">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Research areas</p>
              <h2 className="section-title">Focused questions. Applied evidence.</h2>
            </div>
            <p className="section-intro">
              Our initial agenda connects information retrieval, responsible AI adoption and measurable digital impact.
            </p>
          </div>

          <div className="mt-12 grid overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
            {researchAreas.map((area) => (
              <article key={area.code} className="research-card">
                <p className="font-mono text-xs text-[var(--muted)]">{area.code}</p>
                <h3 className="mt-12 text-2xl font-semibold tracking-tight">{area.title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-[var(--muted)]">{area.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="publications" className="section-border bg-[var(--surface)]">
        <div className="shell py-20">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Research platform</p>
              <h2 className="section-title">Evidence connected to implementation.</h2>
            </div>
            <p className="section-intro">
              Every research project is designed to connect its publication, dataset, software and evaluation method.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {platformPillars.map(([title, description], index) => (
              <article id={title.toLowerCase()} key={title} className="pillar-card">
                <span className="font-mono text-xs text-[var(--brand)]">0{index + 1}</span>
                <h3 className="mt-10 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="people" className="section-border">
        <div className="shell py-20">
          <p className="eyebrow">People</p>
          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            <h2 className="section-title">An independent lab built around applied, collaborative research.</h2>
            <div className="text-lg leading-8 text-[var(--muted)]">
              <p>Founded by Eduardo José Yauri Luna in Barcelona, GSLHub connects professional practice with open scientific work.</p>
              <a href="mailto:research@gslhub.com" className="mt-8 inline-block font-semibold text-[var(--foreground)] underline decoration-[var(--brand)] underline-offset-4">
                research@gslhub.com
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)]">
        <div className="shell flex flex-col gap-6 py-10 text-sm text-[var(--muted)] md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-base font-semibold text-[var(--foreground)]">GSLHub</p>
            <p className="mt-1">Generative Search Lab Hub · Barcelona</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <a href="https://github.com/gslhub" target="_blank" rel="noreferrer">GitHub</a>
            <a href="/llms.txt">llms.txt</a>
            <span>© 2026 GSLHub</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
