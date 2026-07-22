import Link from 'next/link';

const navigation = [
  { href: '/research', label: 'Research' },
  { href: '/publications', label: 'Publications' },
  { href: '/software', label: 'Software' },
  { href: '/datasets', label: 'Datasets' },
  { href: '/people', label: 'People' },
];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
        <Link href="/" className="group inline-flex flex-col" aria-label="GSLHub home">
          <span className="text-lg font-semibold tracking-tight group-hover:text-[var(--brand)]">GSLHub</span>
          <span className="text-sm text-[var(--muted)]">Generative Search Lab Hub</span>
        </Link>
        <nav aria-label="Primary navigation">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-[var(--muted)]">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link className="transition hover:text-[var(--foreground)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
