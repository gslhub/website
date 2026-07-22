export type PublicationStatus = 'concept' | 'in-progress' | 'preprint' | 'published';

export type ResearchArea = {
  slug: string;
  title: string;
  summary: string;
  keywords: string[];
};

export type Researcher = {
  slug: string;
  name: string;
  role: string;
  location?: string;
  biography: string;
  researchInterests: string[];
  orcid?: string;
  scholarUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

export type Publication = {
  slug: string;
  title: string;
  abstract: string;
  status: PublicationStatus;
  year: number;
  authors: string[];
  keywords: string[];
  doi?: string;
  pdfUrl?: string;
  repositoryUrl?: string;
  datasetSlugs?: string[];
  softwareSlugs?: string[];
};

export type SoftwareProject = {
  slug: string;
  name: string;
  summary: string;
  status: 'planned' | 'development' | 'released';
  license?: string;
  repositoryUrl?: string;
  publicationSlugs?: string[];
  datasetSlugs?: string[];
};

export type Dataset = {
  slug: string;
  name: string;
  summary: string;
  status: 'planned' | 'collecting' | 'published';
  license?: string;
  doi?: string;
  repositoryUrl?: string;
  publicationSlugs?: string[];
};
