import type { CollectionConfig, Field } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publicRead,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';
import { projectStatusField } from '../fields/projectStatus';
import { scientificStatusField } from '../fields/scientificStatus';

const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
};

const localizedTitle: Field = {
  name: 'title',
  type: 'text',
  required: true,
  localized: true,
};

const localizedSummary: Field = {
  name: 'summary',
  type: 'textarea',
  required: true,
  localized: true,
};

export const ResearchAreas: CollectionConfig = {
  slug: 'research-areas',
  access: {
    create: authenticatedResearchWrite,
    read: publicRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'code', 'slug', 'updatedAt'],
  },
  fields: [
    localizedTitle,
    slugField,
    localizedSummary,
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable short code, for example GEO, SEO or SMART-TOURISM.',
      },
    },
  ],
};

export const Researchers: CollectionConfig = {
  slug: 'researchers',
  access: {
    create: authenticatedResearchWrite,
    read: publicRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Research',
    defaultColumns: ['name', 'role', 'orcid', 'updatedAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    slugField,
    {
      name: 'role',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Public research role or academic position.',
      },
    },
    {
      name: 'biography',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'orcid',
      type: 'text',
      index: true,
      admin: {
        description: 'ORCID identifier in the format 0000-0000-0000-0000.',
      },
    },
    {
      name: 'googleScholarUrl',
      type: 'text',
      admin: {
        description: 'Full Google Scholar profile URL.',
      },
    },
    {
      name: 'githubUrl',
      type: 'text',
      admin: {
        description: 'Full GitHub profile URL.',
      },
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      admin: {
        description: 'Full LinkedIn profile URL.',
      },
    },
    {
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      admin: {
        description: 'Research areas associated with this profile.',
      },
    },
  ],
};

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticatedResearchWrite,
    read: publicRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'projectCode', 'status', 'startDate', 'updatedAt'],
  },
  fields: [
    localizedTitle,
    slugField,
    localizedSummary,
    {
      name: 'projectCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable internal identifier, for example GSL-GEO-BENCH-01.',
      },
    },
    projectStatusField,
    {
      name: 'projectType',
      type: 'select',
      required: true,
      defaultValue: 'research',
      options: [
        { label: 'Research', value: 'research' },
        { label: 'Benchmark', value: 'benchmark' },
        { label: 'Software development', value: 'software-development' },
        { label: 'Dataset', value: 'dataset' },
        { label: 'Doctoral research', value: 'doctoral-research' },
        { label: 'Collaboration', value: 'collaboration' },
      ],
    },
    {
      name: 'objectives',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'methodology',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'repositoryUrl',
      type: 'text',
      admin: {
        description: 'Public repository or project documentation URL.',
      },
    },
    {
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      required: true,
    },
    {
      name: 'researchers',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};

export const Publications: CollectionConfig = {
  slug: 'publications',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'publicationType', 'status', 'publicationDate', '_status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    localizedTitle,
    slugField,
    {
      name: 'abstract',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'keywords',
      type: 'array',
      localized: true,
      minRows: 1,
      fields: [
        {
          name: 'keyword',
          type: 'text',
          required: true,
        },
      ],
    },
    scientificStatusField,
    {
      name: 'publicationType',
      type: 'select',
      required: true,
      defaultValue: 'technical-report',
      options: [
        { label: 'Journal article', value: 'article' },
        { label: 'Preprint', value: 'preprint' },
        { label: 'Technical report', value: 'technical-report' },
        { label: 'Conference paper', value: 'conference-paper' },
        { label: 'Book chapter', value: 'book-chapter' },
        { label: 'Working paper', value: 'working-paper' },
      ],
    },
    {
      name: 'publicationDate',
      type: 'date',
      index: true,
    },
    {
      name: 'doi',
      type: 'text',
      index: true,
      admin: {
        description: 'DOI without the https://doi.org/ prefix.',
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        description: 'Canonical public URL for the publication or repository record.',
      },
    },
    {
      name: 'venue',
      type: 'text',
      admin: {
        description: 'Journal, conference, repository or publishing platform.',
      },
    },
    {
      name: 'volume',
      type: 'text',
    },
    {
      name: 'issue',
      type: 'text',
    },
    {
      name: 'pages',
      type: 'text',
    },
    {
      name: 'bibtex',
      type: 'textarea',
      admin: {
        description: 'Optional BibTeX citation exported by the publication platform.',
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
    },
    {
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      required: true,
    },
    {
      name: 'software',
      type: 'relationship',
      relationTo: 'software',
      hasMany: true,
    },
    {
      name: 'datasets',
      type: 'relationship',
      relationTo: 'datasets',
      hasMany: true,
    },
    {
      name: 'openAccess',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};

export const Software: CollectionConfig = {
  slug: 'software',
  admin: { useAsTitle: 'title', group: 'Outputs' },
  fields: [
    localizedTitle,
    slugField,
    localizedSummary,
    scientificStatusField,
    { name: 'repositoryUrl', type: 'text' },
    { name: 'license', type: 'text' },
    { name: 'version', type: 'text' },
    { name: 'researchers', type: 'relationship', relationTo: 'researchers', hasMany: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
  ],
};

export const Datasets: CollectionConfig = {
  slug: 'datasets',
  admin: { useAsTitle: 'title', group: 'Outputs' },
  fields: [
    localizedTitle,
    slugField,
    localizedSummary,
    scientificStatusField,
    { name: 'doi', type: 'text' },
    { name: 'license', type: 'text' },
    { name: 'repositoryUrl', type: 'text' },
    { name: 'methodology', type: 'textarea', localized: true },
    { name: 'researchers', type: 'relationship', relationTo: 'researchers', hasMany: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
  ],
};
