'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React from 'react';

type Locale = 'en' | 'es';

type DashboardCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cmsLabel: string;
  operational: string;
  environmentLink: string;
  steps: string[];
  workspace: string;
  shortcutsTitle: string;
  shortcutsDescription: string;
  open: string;
  cards: Array<{ href: string; title: string; description: string }>;
};

const copy: Record<Locale, DashboardCopy> = {
  en: {
    eyebrow: 'GSLHub Research Operations',
    title: 'From research question to reproducible evidence.',
    description:
      'GSLHub connects controlled experiments, immutable execution snapshots, preserved evidence, governed metrics and reproducibility controls in one research workflow.',
    cmsLabel: 'Research CMS',
    operational: 'Operational',
    environmentLink: 'Open environment status →',
    steps: ['Scientific problem', 'Hypothesis', 'Experiment', 'Execution', 'Evidence', 'Metrics', 'Reproducibility'],
    workspace: 'Workspace',
    shortcutsTitle: 'Research shortcuts',
    shortcutsDescription:
      'Use the CMS for governed operations; use the public views for presentation and dissemination.',
    open: 'Open →',
    cards: [
      {
        href: '/admin/globals/research-environment',
        title: 'Research Environment',
        description: 'Development / Doctoral mode, reset gates and research-state controls.',
      },
      {
        href: '/admin/collections/prompt-executions',
        title: 'Prompt Executions',
        description: 'Plan, run and audit controlled generative-search executions.',
      },
      {
        href: '/admin/collections/evidence',
        title: 'Evidence',
        description: 'Review preserved response exports, screenshots and provenance links.',
      },
      {
        href: '/admin/collections/metrics',
        title: 'Metrics',
        description: 'Inspect governed AIR, CR, MCP and RCR result records.',
      },
      {
        href: '/research-infrastructure',
        title: 'Public research infrastructure',
        description: 'Open the five-minute public demonstration of the GSLHub research workflow.',
      },
      {
        href: '/dashboard',
        title: 'Public scientific dashboard',
        description: 'View published research indicators without exposing private research records.',
      },
    ],
  },
  es: {
    eyebrow: 'Operaciones de Investigación GSLHub',
    title: 'De la pregunta de investigación a la evidencia reproducible.',
    description:
      'GSLHub conecta experimentos controlados, snapshots inmutables de ejecución, evidencia preservada, métricas gobernadas y controles de reproducibilidad en un único flujo de investigación.',
    cmsLabel: 'Research CMS',
    operational: 'Operativo',
    environmentLink: 'Abrir estado del entorno →',
    steps: ['Problema científico', 'Hipótesis', 'Experimento', 'Ejecución', 'Evidencia', 'Métricas', 'Reproducibilidad'],
    workspace: 'Espacio de trabajo',
    shortcutsTitle: 'Accesos de investigación',
    shortcutsDescription:
      'Utiliza el CMS para las operaciones gobernadas y las vistas públicas para presentación y difusión.',
    open: 'Abrir →',
    cards: [
      {
        href: '/admin/globals/research-environment',
        title: 'Entorno de investigación',
        description: 'Modo Development / Doctoral, controles de reset y estado de la investigación.',
      },
      {
        href: '/admin/collections/prompt-executions',
        title: 'Ejecuciones de prompts',
        description: 'Planificar, ejecutar y auditar pruebas controladas de búsqueda generativa.',
      },
      {
        href: '/admin/collections/evidence',
        title: 'Evidencias',
        description: 'Revisar respuestas preservadas, capturas y relaciones de procedencia.',
      },
      {
        href: '/admin/collections/metrics',
        title: 'Métricas',
        description: 'Consultar los resultados gobernados AIR, CR, MCP y RCR.',
      },
      {
        href: '/es/research-infrastructure',
        title: 'Infraestructura pública de investigación',
        description: 'Abrir la demostración pública de cinco minutos del flujo científico de GSLHub.',
      },
      {
        href: '/dashboard',
        title: 'Dashboard científico público',
        description: 'Consultar indicadores publicados sin exponer registros privados de investigación.',
      },
    ],
  },
};

export default function ResearchDashboard() {
  const searchParams = useSearchParams();
  const locale: Locale = searchParams.get('locale') === 'es' ? 'es' : 'en';
  const t = copy[locale];

  return (
    <section className="gslhub-research-dashboard" aria-labelledby="gslhub-research-dashboard-title">
      <div className="gslhub-research-dashboard__hero">
        <div>
          <p className="gslhub-research-dashboard__eyebrow">{t.eyebrow}</p>
          <h1 id="gslhub-research-dashboard-title">{t.title}</h1>
          <p>{t.description}</p>
        </div>
        <div className="gslhub-research-dashboard__status">
          <span>{t.cmsLabel}</span>
          <strong>{t.operational}</strong>
          <Link href={`/admin/globals/research-environment?locale=${locale}`}>{t.environmentLink}</Link>
        </div>
      </div>

      <div className="gslhub-research-dashboard__flow" aria-label="Scientific workflow">
        {t.steps.map((label, index) => (
          <div className="gslhub-research-dashboard__step" key={label}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{label}</strong>
          </div>
        ))}
      </div>

      <div className="gslhub-research-dashboard__section-heading">
        <div>
          <p className="gslhub-research-dashboard__eyebrow">{t.workspace}</p>
          <h2>{t.shortcutsTitle}</h2>
        </div>
        <p>{t.shortcutsDescription}</p>
      </div>

      <div className="gslhub-research-dashboard__links">
        {t.cards.map((card) => {
          const isAdminRoute = card.href.startsWith('/admin/');
          const href = isAdminRoute ? `${card.href}?locale=${locale}` : card.href;

          return (
            <Link href={href} key={card.href} className="gslhub-research-dashboard__card">
              <strong>{card.title}</strong>
              <span>{card.description}</span>
              <em>{t.open}</em>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
