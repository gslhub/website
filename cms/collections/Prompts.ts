import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const Prompts: CollectionConfig = {
  slug: 'prompts',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Research Operations',
    defaultColumns: ['title', 'promptCode', 'lifecycleStatus', 'version', '_status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'promptCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable prompt identifier, for example GSL-PROMPT-GEO-001.',
      },
    },
    {
      name: 'promptText',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'Exact versioned prompt wording used during controlled executions.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'promptType',
      type: 'select',
      required: true,
      defaultValue: 'informational',
      options: [
        { label: 'Informational', value: 'informational' },
        { label: 'Navigational', value: 'navigational' },
        { label: 'Comparative', value: 'comparative' },
        { label: 'Evaluative', value: 'evaluative' },
        { label: 'Recommendation', value: 'recommendation' },
        { label: 'Procedural', value: 'procedural' },
        { label: 'Analytical', value: 'analytical' },
        { label: 'Exploratory', value: 'exploratory' },
        { label: 'Adversarial', value: 'adversarial' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'researchIntent',
      type: 'select',
      required: true,
      defaultValue: 'visibility',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Citation', value: 'citation' },
        { label: 'Retrieval', value: 'retrieval' },
        { label: 'Consistency', value: 'consistency' },
        { label: 'Source selection', value: 'source-selection' },
        { label: 'Recommendation', value: 'recommendation' },
        { label: 'Synthesis', value: 'synthesis' },
        { label: 'Multilingual behaviour', value: 'multilingual' },
        { label: 'Safety or robustness', value: 'safety-robustness' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'planned',
      index: true,
      options: [
        { label: 'Planned', value: 'planned' },
        { label: 'Under review', value: 'under-review' },
        { label: 'Validated', value: 'validated' },
        { label: 'Active', value: 'active' },
        { label: 'Deprecated', value: 'deprecated' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'version',
      type: 'text',
      required: true,
      defaultValue: '0.1.0',
    },
    {
      name: 'promptLanguage',
      type: 'select',
      required: true,
      defaultValue: 'en',
      options: [
        { label: 'English', value: 'en' },
        { label: 'Español', value: 'es' },
        { label: 'Multilingual', value: 'multilingual' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'difficulty',
      type: 'select',
      required: true,
      defaultValue: 'medium',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
      ],
    },
    {
      name: 'controlled',
      type: 'checkbox',
      required: true,
      defaultValue: true,
      admin: {
        description: 'Indicates that wording and execution conditions must remain fixed during a study round.',
      },
    },
    {
      name: 'executionInstructions',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Operational instructions that must accompany the prompt during execution.',
      },
    },
    {
      name: 'expectedBehaviour',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Expected response characteristics used for validation, not a required answer.',
      },
    },
    {
      name: 'variablePlaceholders',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'code',
          type: 'text',
          required: true,
          admin: {
            description: 'Placeholder used in the prompt, for example DOMAIN or TOPIC.',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'dataType',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'URL', value: 'url' },
            { label: 'Domain', value: 'domain' },
            { label: 'Category', value: 'category' },
            { label: 'Integer', value: 'integer' },
            { label: 'Decimal', value: 'decimal' },
            { label: 'Boolean', value: 'boolean' },
            { label: 'Date or time', value: 'datetime' },
          ],
        },
        {
          name: 'allowedValues',
          type: 'textarea',
          localized: true,
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'constraints',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
        },
      ],
    },
    {
      name: 'validationNotes',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'validatedAt',
      type: 'date',
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
    },
    {
      name: 'benchmarks',
      type: 'relationship',
      relationTo: 'benchmarks',
      hasMany: true,
    },
    {
      name: 'experiments',
      type: 'relationship',
      relationTo: 'experiments',
      hasMany: true,
    },
    {
      name: 'researchers',
      type: 'relationship',
      relationTo: 'researchers',
      hasMany: true,
      required: true,
    },
    {
      name: 'researchAreas',
      type: 'relationship',
      relationTo: 'research-areas',
      hasMany: true,
      required: true,
    },
    {
      name: 'resources',
      type: 'relationship',
      relationTo: 'resources',
      hasMany: true,
    },
    {
      name: 'publications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
