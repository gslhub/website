import type { Access, CollectionConfig, Field } from 'payload';
import { scientificStatusField } from '../fields/scientificStatus';

const authenticated: Access = ({ req }) => Boolean(req.user);

const protectedAccess: NonNullable<CollectionConfig['access']> = {
  create: authenticated,
  read: authenticated,
  update: authenticated,
  delete: authenticated,
};

const createSlugField = (): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
});

const createLocalizedTitle = (): Field => ({
  name: 'title',
  type: 'text',
  required: true,
  localized: true,
});

const createLocalizedSummary = (): Field => ({
  name: 'summary',
  type: 'textarea',
  required: true,
  localized: true,
});

const createScientificStatus = (): Field => ({ ...scientificStatusField });

export const ResearchAreas: CollectionConfig = {
  slug: 'research-areas',
  admin: { useAsTitle: 'title', group: 'Research' },
  access: protectedAccess,
  fields: [
    createLocalizedTitle(),
    createSlugField(),
    createLocalizedSummary(),
    { name: 'code', type: 'text', required: true },
  ],
};

export const Researchers: CollectionConfig = {
  slug: 'researchers',
  admin: { useAsTitle: 'name', group: 'Research' },
  access: protectedAccess,
  fields: [
    { name: 'name', type: 'text', required: true },
    createSlugField(),
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
  access: protectedAccess,
  fields: [
    createLocalizedTitle(),
    createSlugField(),
    createLocalizedSummary(),
    createScientificStatus(),
    { name: 'startDate', type: 'date' },
    { name: 'endDate', type: 'date' },
    { name: 'researchAreas', type: 'relationship', relationTo: 'research-areas', hasMany: true },
    { name: 'researchers', type: 'relationship', relationTo: 'researchers', hasMany: true },
  ],
};

export const Publications: CollectionConfig = {
  slug: 'publications',
  admin: { useAsTitle: 'title', group: 'Research' },
  access: protectedAccess,
  versions: { drafts: true },
  fields: [
    createLocalizedTitle(),
    createSlugField(),
    { name: 'abstract', type: 'textarea', required: true, localized: true },
    {
      name: 'keywords',
      type: 'array',
      localized: true,
      fields: [{ name: 'keyword', type: 'text', required: true }],
    },
    createScientificStatus(),
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
  access: protectedAccess,
  fields: [
    createLocalizedTitle(),
    createSlugField(),
    createLocalizedSummary(),
    createScientificStatus(),
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
  access: protectedAccess,
  fields: [
    createLocalizedTitle(),
    createSlugField(),
    createLocalizedSummary(),
    createScientificStatus(),
    { name: 'doi', type: 'text' },
    { name: 'license', type: 'text' },
    { name: 'repositoryUrl', type: 'text' },
    { name: 'methodology', type: 'textarea', localized: true },
    { name: 'researchers', type: 'relationship', relationTo: 'researchers', hasMany: true },
    { name: 'project', type: 'relationship', relationTo: 'projects' },
  ],
};
