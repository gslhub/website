import type { CollectionConfig } from 'payload';

import {
  adminOnly,
  authenticatedResearchWrite,
  publishedOrAuthenticatedRead,
} from '../access/scientificContentAccess';

export const AISystems: CollectionConfig = {
  slug: 'ai-systems',
  access: {
    create: authenticatedResearchWrite,
    read: publishedOrAuthenticatedRead,
    update: authenticatedResearchWrite,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Research Operations',
    defaultColumns: ['name', 'provider', 'systemType', 'lifecycleStatus', '_status'],
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'systemCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Stable system identifier, for example GSL-AISYS-001.',
      },
    },
    {
      name: 'provider',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'systemType',
      type: 'select',
      required: true,
      defaultValue: 'generative-search',
      options: [
        { label: 'Generative search system', value: 'generative-search' },
        { label: 'AI assistant', value: 'ai-assistant' },
        { label: 'Search engine with generative answers', value: 'search-engine' },
        { label: 'Model API', value: 'model-api' },
        { label: 'Research or enterprise platform', value: 'research-platform' },
        { label: 'Agentic system', value: 'agentic-system' },
        { label: 'Hybrid system', value: 'hybrid' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'lifecycleStatus',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        { label: 'Preview', value: 'preview' },
        { label: 'Active', value: 'active' },
        { label: 'Limited availability', value: 'limited' },
        { label: 'Deprecated', value: 'deprecated' },
        { label: 'Unavailable', value: 'unavailable' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'versioningMode',
      type: 'select',
      required: true,
      defaultValue: 'rolling',
      options: [
        { label: 'Fixed version', value: 'fixed' },
        { label: 'Rolling or continuously updated', value: 'rolling' },
        { label: 'Provider version not disclosed', value: 'undisclosed' },
      ],
    },
    {
      name: 'modelVersion',
      type: 'text',
      admin: {
        description: 'Provider-reported model or model family when available.',
      },
    },
    {
      name: 'interfaceVersion',
      type: 'text',
      admin: {
        description: 'Visible product, interface or release-channel version when available.',
      },
    },
    {
      name: 'releaseChannel',
      type: 'select',
      defaultValue: 'production',
      options: [
        { label: 'Production', value: 'production' },
        { label: 'Beta', value: 'beta' },
        { label: 'Preview', value: 'preview' },
        { label: 'Experimental', value: 'experimental' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'accessModes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Public web interface', value: 'public-web' },
        { label: 'Authenticated web interface', value: 'authenticated-web' },
        { label: 'API', value: 'api' },
        { label: 'Mobile application', value: 'mobile-app' },
        { label: 'Desktop application', value: 'desktop-app' },
        { label: 'Enterprise workspace', value: 'enterprise' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'accountTier',
      type: 'select',
      defaultValue: 'unknown',
      options: [
        { label: 'No account required', value: 'none' },
        { label: 'Free', value: 'free' },
        { label: 'Paid individual', value: 'paid-individual' },
        { label: 'Team or business', value: 'team-business' },
        { label: 'Enterprise', value: 'enterprise' },
        { label: 'Research access', value: 'research' },
        { label: 'Unknown', value: 'unknown' },
      ],
    },
    {
      name: 'capabilities',
      type: 'group',
      fields: [
        {
          name: 'webAccess',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'explicitCitations',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'sourceLinks',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'searchResults',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'fileAnalysis',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'multimodalInput',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'conversationMemory',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'customInstructions',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'languages',
      type: 'array',
      fields: [
        {
          name: 'code',
          type: 'text',
          required: true,
          admin: {
            description: 'BCP 47 or ISO language code, for example en or es.',
          },
        },
        {
          name: 'supportLevel',
          type: 'select',
          defaultValue: 'supported',
          options: [
            { label: 'Primary', value: 'primary' },
            { label: 'Supported', value: 'supported' },
            { label: 'Limited', value: 'limited' },
            { label: 'Unknown', value: 'unknown' },
          ],
        },
        {
          name: 'notes',
          type: 'textarea',
          localized: true,
        },
      ],
    },
    {
      name: 'geographicAvailability',
      type: 'textarea',
      localized: true,
      admin: {
        description: 'Countries, territories or access restrictions relevant to reproducibility.',
      },
    },
    {
      name: 'identificationMethod',
      type: 'textarea',
      required: true,
      localized: true,
      admin: {
        description: 'How the system, model, version and access conditions are identified for each study.',
      },
    },
    {
      name: 'reproducibilityNotes',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'knowledgeCutoff',
      type: 'text',
      admin: {
        description: 'Provider-reported cutoff or “not disclosed” when unknown.',
      },
    },
    {
      name: 'firstObservedAt',
      type: 'date',
    },
    {
      name: 'lastVerifiedAt',
      type: 'date',
      index: true,
    },
    {
      name: 'providerUrl',
      type: 'text',
    },
    {
      name: 'documentationUrl',
      type: 'text',
    },
    {
      name: 'termsUrl',
      type: 'text',
    },
    {
      name: 'privacyUrl',
      type: 'text',
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
};
