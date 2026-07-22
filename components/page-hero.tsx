type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="mx-auto max-w-6xl px-6 py-20 md:px-10 md:py-28">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--brand)]">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.035em] md:text-6xl">{title}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--muted)] md:text-xl">{description}</p>
      </div>
    </section>
  );
}
