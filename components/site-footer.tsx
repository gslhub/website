import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 text-sm text-[var(--muted)] md:grid-cols-3 md:px-10">
        <div>
          <p className="font-semibold text-[var(--foreground)]">GSLHub</p>
          <p className="mt-2 max-w-xs leading-6">Independent applied research in generative search, AI systems and open technological innovation.</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">Explore</p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
            <Link href="/research">Research</Link>
            <Link href="/benchmarks">Benchmarks</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/publications">Publications</Link>
            <Link href="/software">Software</Link>
            <Link href="/datasets">Datasets</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/people">People</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">Connect</p>
          <div className="mt-2 flex flex-col gap-2">
            <a href="https://github.com/gslhub" rel="noreferrer" target="_blank">GitHub</a>
            <a href="mailto:research@gslhub.com">research@gslhub.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-6 py-5 text-center text-xs text-[var(--muted)]">
        © 2026 GSLHub · Barcelona · Open research with real-world impact.
      </div>
    </footer>
  );
}
