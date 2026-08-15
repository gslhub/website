import Link from 'next/link';

import { PageHero } from '@/components/page-hero';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

type Locale = 'en' | 'es';

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  languageLabel: string;
  languageHref: string;
  languageText: string;
  problemTitle: string;
  problemBody: string;
  thesisTitle: string;
  thesisBody: string;
  flowEyebrow: string;
  flowTitle: string;
  flowDescription: string;
  flow: Array<{ label: string; description: string }>;
  methodsEyebrow: string;
  methodsTitle: string;
  methods: Array<{ title: string; description: string }>;
  metricsEyebrow: string;
  metricsTitle: string;
  metricsDescription: string;
  metrics: Array<{ code: string; name: string; description: string }>;
  pilotEyebrow: string;
  pilotTitle: string;
  pilotDescription: string;
  pilotItems: Array<{ label: string; value: string }>;
  pilotNote: string;
  reproducibilityEyebrow: string;
  reproducibilityTitle: string;
  reproducibilityDescription: string;
  reproducibilityItems: string[];
  ctaTitle: string;
  ctaDescription: string;
  publicDashboard: string;
  cmsAccess: string;
};

const copy: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Research infrastructure',
    title: 'GSLHub — Research Infrastructure for Generative Search Visibility.',
    description:
      'A reproducible research platform for studying how generative AI systems select, cite and recommend organizations, brands and digital sources.',
    languageLabel: 'Language',
    languageHref: '/es/research-infrastructure',
    languageText: 'Español',
    problemTitle: 'Scientific problem',
    problemBody:
      'Generative search changes digital visibility from ranked links to synthesized answers. Organizations can be mentioned, cited, recommended or omitted, but current practice still lacks sufficiently standardized and reproducible ways to measure those outcomes.',
    thesisTitle: 'Doctoral research direction',
    thesisBody:
      'From SEO to GEO (Generative Engine Optimization): development and validation of a scientific model to optimize organizational visibility in AI-based generative search engines.',
    flowEyebrow: 'Research workflow',
    flowTitle: 'A complete path from hypothesis to auditable evidence.',
    flowDescription:
      'GSLHub is designed so that every scientific result can be traced backwards to its experimental conditions and preserved raw evidence.',
    flow: [
      { label: 'Problem', description: 'Define the visibility question and the scientific gap.' },
      { label: 'Hypothesis', description: 'Specify a testable relationship or expected effect.' },
      { label: 'Experiment', description: 'Freeze prompts, AI systems, targets and repetition rules.' },
      { label: 'Execution', description: 'Run controlled prompts and preserve the execution context.' },
      { label: 'Evidence', description: 'Store response exports, screenshots and provenance with integrity checks.' },
      { label: 'Metrics', description: 'Calculate governed indicators such as AIR, CR, MCP and RCR.' },
      { label: 'Reproducibility', description: 'Retain versioning, review, audit and immutable scientific snapshots.' },
    ],
    methodsEyebrow: 'Methodology',
    methodsTitle: 'Built for controlled empirical research, not one-off AI tests.',
    methods: [
      {
        title: 'Controlled repetition',
        description: 'Experiments can reserve multiple comparable executions under the same versioned protocol.',
      },
      {
        title: 'Execution snapshots',
        description: 'Prompt, AI system and environment context become protected once an execution enters the governed workflow.',
      },
      {
        title: 'Evidence preservation',
        description: 'Raw exports and screenshots are linked to the execution and can be verified by SHA-256 against persistent storage.',
      },
      {
        title: 'Independent review',
        description: 'Coding, evidence and metric definitions support quality-control and reviewer separation before validation.',
      },
    ],
    metricsEyebrow: 'Measurement model',
    metricsTitle: 'Core visibility and reproducibility metrics.',
    metricsDescription:
      'The first GSLHub metric set formalizes whether a target appears, is cited, where it is cited and how consistently the result is reproduced.',
    metrics: [
      { code: 'AIR', name: 'Answer Inclusion Rate', description: 'Share of eligible responses in which the target is mentioned.' },
      { code: 'CR', name: 'Citation Rate', description: 'Share of eligible responses in which the target is explicitly cited.' },
      { code: 'MCP', name: 'Mean Citation Position', description: 'Average observed position of target citations in eligible responses.' },
      { code: 'RCR', name: 'Response Consistency Rate', description: 'Rate at which comparable repetitions reproduce the coded outcome.' },
    ],
    pilotEyebrow: 'Development pilot',
    pilotTitle: 'One complete execution has already passed the end-to-end workflow.',
    pilotDescription:
      'GSL-EXEC-GEO-0001 is a development validation run used to prove the research chain before any doctoral data collection begins.',
    pilotItems: [
      { label: 'Execution', value: 'Completed / Published' },
      { label: 'Raw response artifact', value: 'SHA-256 verified' },
      { label: 'Screenshot artifact', value: 'SHA-256 verified' },
      { label: 'Evidence records', value: '2 validated' },
      { label: 'Observation', value: 'Validated / Published' },
      { label: 'Visible citations', value: '0 observed' },
    ],
    pilotNote:
      'This pilot is development evidence, not a doctoral result. A Final Development Reset will separate all development records from future doctoral research data.',
    reproducibilityEyebrow: 'Reproducibility',
    reproducibilityTitle: 'Scientific provenance is part of the platform architecture.',
    reproducibilityDescription:
      'The goal is not only to calculate a metric, but to make it possible to explain where that metric came from and whether the underlying evidence remained unchanged.',
    reproducibilityItems: [
      'Versioned prompts, experiments and metric definitions',
      'Persistent research-artifact storage outside deployment releases',
      'SHA-256 integrity verification for preserved files',
      'Validated Evidence ↔ Research Artifact provenance',
      'Immutable snapshots after governed lifecycle transitions',
      'Development / Doctoral research separation and controlled reset',
    ],
    ctaTitle: 'Explore GSLHub at two levels.',
    ctaDescription:
      'The public dashboard exposes only publishable research indicators. Authorized researchers use the private CMS for governed research operations.',
    publicDashboard: 'Open public dashboard',
    cmsAccess: 'Research CMS access',
  },
  es: {
    eyebrow: 'Infraestructura de investigación',
    title: 'GSLHub — Infraestructura de Investigación para la Visibilidad en Búsqueda Generativa.',
    description:
      'Una plataforma de investigación reproducible para estudiar cómo los sistemas de IA generativa seleccionan, citan y recomiendan organizaciones, marcas y fuentes digitales.',
    languageLabel: 'Idioma',
    languageHref: '/research-infrastructure',
    languageText: 'English',
    problemTitle: 'Problema científico',
    problemBody:
      'La búsqueda generativa transforma la visibilidad digital: pasamos de enlaces ordenados a respuestas sintetizadas. Una organización puede ser mencionada, citada, recomendada u omitida, pero todavía faltan métodos suficientemente estandarizados y reproducibles para medir esos resultados.',
    thesisTitle: 'Dirección de investigación doctoral',
    thesisBody:
      'Del SEO al GEO (Generative Engine Optimization): desarrollo y validación de un modelo científico para optimizar la visibilidad de organizaciones en motores de búsqueda generativos basados en inteligencia artificial.',
    flowEyebrow: 'Flujo de investigación',
    flowTitle: 'Un recorrido completo desde la hipótesis hasta la evidencia auditable.',
    flowDescription:
      'GSLHub está diseñado para que cada resultado científico pueda rastrearse hasta sus condiciones experimentales y su evidencia original preservada.',
    flow: [
      { label: 'Problema', description: 'Definir la pregunta de visibilidad y la brecha científica.' },
      { label: 'Hipótesis', description: 'Plantear una relación o efecto esperado que pueda contrastarse.' },
      { label: 'Experimento', description: 'Congelar prompts, sistemas de IA, targets y reglas de repetición.' },
      { label: 'Ejecución', description: 'Ejecutar prompts controlados y preservar el contexto experimental.' },
      { label: 'Evidencia', description: 'Guardar respuestas, capturas y procedencia con controles de integridad.' },
      { label: 'Métricas', description: 'Calcular indicadores gobernados como AIR, CR, MCP y RCR.' },
      { label: 'Reproducibilidad', description: 'Mantener versionado, revisión, auditoría y snapshots científicos inmutables.' },
    ],
    methodsEyebrow: 'Metodología',
    methodsTitle: 'Pensado para investigación empírica controlada, no para pruebas aisladas de IA.',
    methods: [
      {
        title: 'Repetición controlada',
        description: 'Los experimentos pueden reservar múltiples ejecuciones comparables bajo un mismo protocolo versionado.',
      },
      {
        title: 'Snapshots de ejecución',
        description: 'El prompt, sistema de IA y contexto de entorno quedan protegidos al entrar en el flujo científico gobernado.',
      },
      {
        title: 'Preservación de evidencia',
        description: 'Los exports y capturas se vinculan a la ejecución y pueden verificarse por SHA-256 contra almacenamiento persistente.',
      },
      {
        title: 'Revisión independiente',
        description: 'La codificación, la evidencia y las definiciones métricas admiten control de calidad y separación de revisores antes de validar.',
      },
    ],
    metricsEyebrow: 'Modelo de medición',
    metricsTitle: 'Métricas principales de visibilidad y reproducibilidad.',
    metricsDescription:
      'El primer conjunto métrico de GSLHub formaliza si un target aparece, es citado, en qué posición se cita y con qué consistencia se reproduce el resultado.',
    metrics: [
      { code: 'AIR', name: 'Answer Inclusion Rate', description: 'Proporción de respuestas elegibles en las que el target es mencionado.' },
      { code: 'CR', name: 'Citation Rate', description: 'Proporción de respuestas elegibles en las que el target es citado explícitamente.' },
      { code: 'MCP', name: 'Mean Citation Position', description: 'Posición media observada de las citas del target en respuestas elegibles.' },
      { code: 'RCR', name: 'Response Consistency Rate', description: 'Tasa con la que repeticiones comparables reproducen el resultado codificado.' },
    ],
    pilotEyebrow: 'Piloto de desarrollo',
    pilotTitle: 'Una ejecución completa ya ha superado el flujo de extremo a extremo.',
    pilotDescription:
      'GSL-EXEC-GEO-0001 es una ejecución de validación de desarrollo utilizada para demostrar la cadena de investigación antes de comenzar a recoger datos doctorales.',
    pilotItems: [
      { label: 'Ejecución', value: 'Completed / Published' },
      { label: 'Artefacto de respuesta', value: 'SHA-256 verificado' },
      { label: 'Artefacto de captura', value: 'SHA-256 verificado' },
      { label: 'Registros Evidence', value: '2 validados' },
      { label: 'Observación', value: 'Validated / Published' },
      { label: 'Citas visibles', value: '0 observadas' },
    ],
    pilotNote:
      'Este piloto es evidencia de desarrollo, no un resultado doctoral. El Final Development Reset separará todos los registros de desarrollo de los futuros datos de investigación doctoral.',
    reproducibilityEyebrow: 'Reproducibilidad',
    reproducibilityTitle: 'La procedencia científica forma parte de la arquitectura de la plataforma.',
    reproducibilityDescription:
      'El objetivo no es únicamente calcular una métrica, sino poder explicar de dónde procede y demostrar que la evidencia subyacente no fue alterada.',
    reproducibilityItems: [
      'Prompts, experimentos y definiciones métricas versionadas',
      'Almacenamiento persistente de artefactos fuera de los releases de despliegue',
      'Verificación de integridad SHA-256 de los ficheros preservados',
      'Procedencia validada Evidence ↔ Research Artifact',
      'Snapshots inmutables después de transiciones de ciclo gobernadas',
      'Separación Development / Doctoral y reset controlado',
    ],
    ctaTitle: 'Explora GSLHub en dos niveles.',
    ctaDescription:
      'El dashboard público expone únicamente indicadores publicables. Las personas investigadoras autorizadas utilizan el CMS privado para las operaciones científicas gobernadas.',
    publicDashboard: 'Abrir dashboard público',
    cmsAccess: 'Acceso al Research CMS',
  },
};

export function ResearchInfrastructurePage({ locale }: { locale: Locale }) {
  const t = copy[locale];

  return (
    <>
      <SiteHeader />
      <main>
        <PageHero eyebrow={t.eyebrow} title={t.title} description={t.description} />

        <section className="shell py-10 sm:py-12">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 sm:px-6">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{t.languageLabel}</span>
            <Link className="button button-secondary" href={t.languageHref}>{t.languageText}</Link>
          </div>
        </section>

        <section className="shell grid gap-5 pb-14 sm:pb-16 lg:grid-cols-2">
          <article className="rounded-3xl border border-[var(--border)] p-6 sm:p-8">
            <p className="eyebrow">01</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t.problemTitle}</h2>
            <p className="mt-5 leading-7 text-[var(--muted)]">{t.problemBody}</p>
          </article>
          <article className="rounded-3xl bg-[#0b132b] p-6 text-white sm:p-8">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-blue-300">02</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{t.thesisTitle}</h2>
            <p className="mt-5 leading-7 text-slate-300">{t.thesisBody}</p>
          </article>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="shell py-14 sm:py-16">
            <p className="eyebrow">{t.flowEyebrow}</p>
            <div className="mt-4 grid gap-5 md:grid-cols-[1fr_0.7fr] md:items-end">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.flowTitle}</h2>
              <p className="leading-7 text-[var(--muted)]">{t.flowDescription}</p>
            </div>
            <div className="mt-9 grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
              {t.flow.map((item, index) => (
                <article className="min-w-0 bg-white p-5 sm:p-6" key={item.label}>
                  <span className="font-mono text-xs text-[var(--brand)]">{String(index + 1).padStart(2, '0')}</span>
                  <h3 className="mt-5 text-lg font-semibold">{item.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shell py-14 sm:py-16">
          <p className="eyebrow">{t.methodsEyebrow}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.methodsTitle}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {t.methods.map((item) => (
              <article className="rounded-2xl border border-[var(--border)] p-5 sm:p-7" key={item.title}>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-[var(--muted)]">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)]">
          <div className="shell py-14 sm:py-16">
            <p className="eyebrow">{t.metricsEyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t.metricsTitle}</h2>
            <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">{t.metricsDescription}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {t.metrics.map((metric) => (
                <article className="rounded-2xl bg-[#0b132b] p-6 text-white" key={metric.code}>
                  <span className="font-mono text-sm font-bold text-blue-300">{metric.code}</span>
                  <h3 className="mt-5 text-xl font-semibold">{metric.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{metric.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shell py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">{t.pilotEyebrow}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{t.pilotTitle}</h2>
              <p className="mt-5 leading-7 text-[var(--muted)]">{t.pilotDescription}</p>
              <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">{t.pilotNote}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
              {t.pilotItems.map((item) => (
                <article className="bg-white p-5 sm:p-6" key={item.label}>
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</p>
                  <p className="mt-4 text-lg font-semibold">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] border-y border-[var(--border)]">
          <div className="shell py-14 sm:py-16">
            <p className="eyebrow">{t.reproducibilityEyebrow}</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.reproducibilityTitle}</h2>
            <p className="mt-5 max-w-3xl leading-7 text-[var(--muted)]">{t.reproducibilityDescription}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {t.reproducibilityItems.map((item) => (
                <div className="rounded-2xl border border-[var(--border)] bg-white p-5 text-sm font-semibold leading-6" key={item}>
                  <span className="mr-2 text-[var(--success)]">✓</span>{item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="shell py-14 sm:py-20">
          <div className="rounded-3xl bg-[#0b132b] p-6 text-white sm:p-9 md:p-12">
            <h2 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">{t.ctaTitle}</h2>
            <p className="mt-5 max-w-3xl leading-7 text-slate-300">{t.ctaDescription}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard" className="button bg-white text-[#0b132b]">{t.publicDashboard}</Link>
              <Link href="/cms-login" className="button border border-white/25 bg-white/10 text-white">{t.cmsAccess}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
