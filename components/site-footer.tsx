import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="shell grid gap-8 py-10 text-sm text-[var(--muted)] sm:py-12 md:grid-cols-3">
        <div>
          <p className="font-semibold text-[var(--foreground)]">GSLHub</p>
          <p className="mt-2 max-w-xs leading-6">Independent applied research in generative search, AI systems and open technological innovation.</p>
        </div>
        <div>
          <p className="font-semibold text-[var(--foreground)]">Explore</p>
          <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:max-w-sm">
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
          <div className="mt-3 flex flex-col gap-3">
            <a href="https://github.com/gslhub/website" rel="noreferrer" target="_blank">Source code</a>
            <a href="https://github.com/gslhub/website/blob/main/LICENSE" rel="noreferrer" target="_blank">GNU AGPL-3.0</a>
            <a href="https://github.com/gslhub" rel="noreferrer" target="_blank">GitHub organization</a>
            <a className="break-all sm:break-normal" href="mailto:research@gslhub.com">research@gslhub.com</a>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--border)] px-4 py-5 text-center text-xs leading-5 text-[var(--muted)] sm:px-6">
        © 2026 GSLHub · Barcelona · Open research with real-world impact · AGPL-3.0.
      </div>
    </footer>
  );
}
