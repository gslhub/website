import Link from 'next/link';
import React from 'react';

const steps = [
  ['01', 'Scientific problem'],
  ['02', 'Hypothesis'],
  ['03', 'Experiment'],
  ['04', 'Execution'],
  ['05', 'Evidence'],
  ['06', 'Metrics'],
  ['07', 'Reproducibility'],
];

const quickLinks = [
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
];

export default function ResearchDashboard() {
  return (
    <section className="gslhub-research-dashboard" aria-labelledby="gslhub-research-dashboard-title">
      <div className="gslhub-research-dashboard__hero">
        <div>
          <p className="gslhub-research-dashboard__eyebrow">GSLHub Research Operations</p>
          <h1 id="gslhub-research-dashboard-title">From research question to reproducible evidence.</h1>
          <p>
            GSLHub connects controlled experiments, immutable execution snapshots, preserved evidence,
            governed metrics and reproducibility controls in one research workflow.
          </p>
        </div>
        <div className="gslhub-research-dashboard__status">
          <span>Research CMS</span>
          <strong>Operational</strong>
          <Link href="/admin/globals/research-environment">Open environment status →</Link>
        </div>
      </div>

      <div className="gslhub-research-dashboard__flow" aria-label="Scientific workflow">
        {steps.map(([number, label]) => (
          <div className="gslhub-research-dashboard__step" key={number}>
            <span>{number}</span>
            <strong>{label}</strong>
          </div>
        ))}
      </div>

      <div className="gslhub-research-dashboard__section-heading">
        <div>
          <p className="gslhub-research-dashboard__eyebrow">Workspace</p>
          <h2>Research shortcuts</h2>
        </div>
        <p>Use the CMS for governed operations; use the public views for presentation and dissemination.</p>
      </div>

      <div className="gslhub-research-dashboard__links">
        {quickLinks.map((link) => (
          <Link href={link.href} key={link.href} className="gslhub-research-dashboard__card">
            <strong>{link.title}</strong>
            <span>{link.description}</span>
            <em>Open →</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
