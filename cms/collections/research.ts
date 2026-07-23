import type { CollectionConfig, Field } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publicRead,
} from '../access/scientificContentAccess';
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
  admin: { useAsTitle: 'name', group: 'Research' },
  fields: [
    { name: 'name', type: 'text', required: true },
    slugField,
    { name: 'role', type: 'text', required: true, localized: true },
    { name: 'biography', type: 'textarea', required: true, localized: true },
    { name: 'orcid', type: 'text' },
    { name: 'googleScholarUrl', type: 'text' },
    { name: 'githubUrl', type: 'text' },
    { name: 'linkedinUrl', type: 'text' },
    { name: 'researchAreas', type: 'relationship', relationTo: 'research-areas', hasMany: true },
  ],
};

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: { useAsTitle: 'title', group: 'Research' },
  fields: [
    localizedTitle,
    slugField,
    localizedSummary,
    scientificStatusField,
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'researchAreas', type: 'relationship', relationTo: 'research-areas', hasMany: true },
    { name: 'researchers', type: 'relationship', relationTo: 'researchers', hasMany: true },
  ],
};

export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: { useAsTitle: 'title', group: 'Research' },
  versions: { drafts: true },
  fields: [
    localizedTitle,
    slugField,
    { name: 'abstract', type: 'textarea', required: true, localized: true },
    {
      name: 'keywords',
      type: 'array',
      localized: true,
      fields: [{ name: 'keyword', type: 'text', required: true }],
    },
    scientificStatusField,
    {
      name: 'publicationType',
      type: 'select',
      required: true,
      options: ['article', 'preprint', 'technical-report', 'conference-paper', 'book-chapter'],
    },
    { name: 'publicationDate', type: 'date' },
    { name: 'doi', type: 'text' },
    { name: 'bibtex', type: 'textarea' },
    { name: 'authors', type: 'relationship', relationTo: 'researchers', hasMany: true, required: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
    { name: 'researchAreas', type: 'relationship', relationTo: 'research-areas', hasMany: true },
    { name: 'software', type: 'relationship', relationTo: 'software', hasMany: true },
    { name: 'datasets', type: 'relationship', relationTo: 'datasets', hasMany: true },
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
