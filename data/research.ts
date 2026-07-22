import type { Dataset, Publication, ResearchArea, Researcher, SoftwareProject } from '@/types/research';

export const researchAreas: ResearchArea[] = [
  {
    slug: 'generative-search-geo',
    title: 'Generative Search & GEO',
    summary: 'How generative systems retrieve, synthesize, rank and cite information across AI-mediated search experiences.',
    keywords: ['Generative Search', 'GEO', 'Information Retrieval', 'AI Search'],
  },
  {
    slug: 'applied-artificial-intelligence',
    title: 'Applied Artificial Intelligence',
    summary: 'Evaluation of language models, agents and retrieval systems in real organizational environments.',
    keywords: ['LLM', 'AI Agents', 'RAG', 'Evaluation'],
  },
  {
    slug: 'automation-digital-transformation',
    title: 'Automation & Digital Transformation',
    summary: 'Reproducible approaches to process improvement, decision support and responsible technology adoption.',
    keywords: ['Automation', 'SMEs', 'CRM', 'Digital Transformation'],
  },
  {
    slug: 'open-software-research',
    title: 'Open Software & Research',
    summary: 'Open tools, datasets and transparent methods that connect scientific evidence with working technology.',
    keywords: ['Open Science', 'Open Source', 'Reproducibility', 'Datasets'],
  },
];

export const researchers: Researcher[] = [
  {
    slug: 'eduardo-jose-yauri-luna',
    name: 'Eduardo José Yauri Luna',
    role: 'Founder & Research Director',
    location: 'Barcelona, Spain',
    biography: 'Applied researcher and digital technology specialist focused on generative search, artificial intelligence, automation and digital transformation.',
    researchInterests: ['Generative Search', 'Artificial Intelligence', 'SEO & GEO', 'Automation', 'Digital Transformation'],
    githubUrl: 'https://github.com/emmakex',
    linkedinUrl: 'https://www.linkedin.com/in/eduardoyauriluna/',
  },
];

export const publications: Publication[] = [
  {
    slug: 'generative-engine-optimization-new-paradigm',
    title: 'Generative Engine Optimization: a new paradigm for visibility in generative search systems',
    abstract: 'A structured investigation into how organizations can improve the discoverability, interpretation and citation of their digital content in generative search systems.',
    status: 'in-progress',
    year: 2026,
    authors: ['eduardo-jose-yauri-luna'],
    keywords: ['GEO', 'Generative Search', 'SEO', 'Artificial Intelligence'],
    softwareSlugs: ['geo-audit'],
    datasetSlugs: ['generative-search-visibility-2026'],
  },
];

export const softwareProjects: SoftwareProject[] = [
  {
    slug: 'geo-audit',
    name: 'GEO Audit',
    summary: 'An open auditing toolkit for assessing whether web content is technically and semantically prepared for generative search systems.',
    status: 'planned',
    repositoryUrl: 'https://github.com/gslhub/software',
    publicationSlugs: ['generative-engine-optimization-new-paradigm'],
    datasetSlugs: ['generative-search-visibility-2026'],
  },
];

export const datasets: Dataset[] = [
  {
    slug: 'generative-search-visibility-2026',
    name: 'Generative Search Visibility Dataset 2026',
    summary: 'A planned longitudinal dataset for measuring visibility, citations and source selection across generative search platforms.',
    status: 'planned',
    repositoryUrl: 'https://github.com/gslhub/datasets',
    publicationSlugs: ['generative-engine-optimization-new-paradigm'],
  },
];
