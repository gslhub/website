const researchAreas = [
  'Generative Search & GEO',
  'Applied Artificial Intelligence',
  'Automation & Digital Transformation',
  'Open Software & Reproducible Research',
];

export default function HomePage() {
  return (
    <main>
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 md:px-10">
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div>
            <p className="text-lg font-semibold tracking-tight">GSLHub</p>
            <p className="text-sm text-[var(--muted)]">Generative Search Lab Hub</p>
          </div>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
            Foundation · 2026
          </span>
        </header>

        <div className="flex flex-1 items-center py-20">
          <div className="max-w-4xl">
            <p className="mb-5 font-mono text-sm uppercase tracking-[0.2em] text-[var(--brand)]">
              Research · Software · Open Science
            </p>
            <h1 className="max-w-4xl text-5xl font-semibold leading-[1.03] tracking-[-0.045em] md:text-7xl">
              Researching how artificial intelligence is changing search, organizations and society.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)] md:text-xl">
              GSLHub is an independent applied research initiative focused on generative search, AI systems,
              automation, digital transformation and reproducible technological innovation.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#research"
                className="rounded-full bg-[var(--foreground)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-85"
              >
                Explore research
              </a>
              <a
                href="https://github.com/gslhub"
                className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold transition hover:bg-[var(--surface)]"
              >
                View GitHub
              </a>
            </div>
          </div>
        </div>

        <section id="research" className="border-t border-[var(--border)] py-12">
          <p className="mb-7 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
            Initial research areas
          </p>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
            {researchAreas.map((area, index) => (
              <article key={area} className="bg-white p-7">
                <p className="mb-10 font-mono text-xs text-[var(--muted)]">0{index + 1}</p>
                <h2 className="text-xl font-semibold tracking-tight">{area}</h2>
              </article>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-[var(--border)] py-7 text-sm text-[var(--muted)] md:flex-row md:justify-between">
          <p>© 2026 GSLHub. Generative Search Lab Hub.</p>
          <p>Barcelona · Open research with real-world impact.</p>
        </footer>
      </section>
    </main>
  );
}
