import Link from 'next/link';

const navigation = [
  { href: '/research', label: 'Research' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/publications', label: 'Publications' },
  { href: '/software', label: 'Software' },
  { href: '/datasets', label: 'Datasets' },
  { href: '/resources', label: 'Resources' },
  { href: '/people', label: 'People' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center justify-between gap-5 px-6 md:px-10">
        <Link href="/" className="group inline-flex shrink-0 flex-col" aria-label="GSLHub home">
          <span className="text-lg font-semibold tracking-tight group-hover:text-[var(--brand)]">GSLHub</span>
          <span className="text-xs text-[var(--muted)] sm:text-sm">Generative Search Lab Hub</span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden xl:block">
          <ul className="flex items-center gap-5 text-sm font-medium text-[var(--muted)]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-[var(--foreground)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/gslhub"
            className="button button-secondary hidden sm:inline-flex"
            rel="noreferrer"
            target="_blank"
          >
            GitHub ↗
          </a>

          <details className="relative xl:hidden">
            <summary className="cursor-pointer list-none rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold marker:content-none">
              Menu
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-12 w-56 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl"
            >
              <ul className="flex flex-col text-sm font-medium">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link className="block rounded-xl px-3 py-3 hover:bg-[var(--surface)]" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-[var(--border)] pt-2 sm:hidden">
                  <a
                    className="block rounded-xl px-3 py-3 hover:bg-[var(--surface)]"
                    href="https://github.com/gslhub"
                    rel="noreferrer"
                    target="_blank"
                  >
                    GitHub ↗
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
