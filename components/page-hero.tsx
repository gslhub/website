type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-[var(--border)]">
      <div className="shell py-14 sm:py-20 md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8 md:text-xl">
          {description}
        </p>
      </div>
    </section>
  );
}
