import Link from 'next/link';

import { GSLHubLogo } from '@/components/brand/GSLHubLogo';

const navigation = [
  { href: '/research', label: 'Research' },
  { href: '/research-infrastructure', label: 'Infrastructure' },
  { href: '/benchmarks', label: 'Benchmarks' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/publications', label: 'Publications' },
  { href: '/software', label: 'Software' },
  { href: '/datasets', label: 'Datasets' },
  { href: '/resources', label: 'Resources' },
  { href: '/people', label: 'People' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="shell flex min-h-16 items-center justify-between gap-3 sm:min-h-20 sm:gap-5">
        <Link
          href="/"
          className="group inline-flex w-[150px] shrink-0 text-[#0b132b] transition-opacity hover:opacity-80 sm:w-[190px] 2xl:w-[210px]"
          aria-label="GSLHub home"
        >
          <GSLHubLogo className="w-full" />
        </Link>

        <nav aria-label="Primary navigation" className="hidden 2xl:block">
          <ul className="flex items-center gap-4 text-sm font-medium text-[var(--muted)]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-[var(--foreground)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/cms-login"
            className="button button-primary min-w-[3.6rem] px-3 sm:px-4"
            aria-label="Access the private GSLHub Research CMS"
          >
            <span className="sm:hidden">CMS</span>
            <span className="hidden sm:inline">Research CMS</span>
          </Link>

          <a
            href="https://github.com/gslhub"
            className="button button-secondary hidden lg:inline-flex"
            rel="noreferrer"
            target="_blank"
          >
            GitHub ↗
          </a>

          <details className="relative 2xl:hidden">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold marker:content-none">
              Menu
            </summary>
            <nav
              aria-label="Mobile navigation"
              className="absolute right-0 top-[3.25rem] z-50 max-h-[calc(100vh-6rem)] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-[var(--border)] bg-white p-3 shadow-xl"
            >
              <ul className="flex flex-col text-sm font-medium">
                {navigation.map((item) => (
                  <li key={item.href}>
                    <Link className="block min-h-11 rounded-xl px-3 py-3 hover:bg-[var(--surface)]" href={item.href}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-[var(--border)] pt-2 lg:hidden">
                  <a
                    className="block min-h-11 rounded-xl px-3 py-3 hover:bg-[var(--surface)]"
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
