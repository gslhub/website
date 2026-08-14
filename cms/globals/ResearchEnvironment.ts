import type { GlobalConfig } from 'payload';

import { adminOnly } from '../access/scientificContentAccess';

export const ResearchEnvironment: GlobalConfig = {
  slug: 'research-environment',
  label: 'Research Environment',
  access: {
    read: adminOnly,
    update: adminOnly,
  },
  admin: {
    group: 'Administration',
    description:
      'Controls the boundary between synthetic development testing and real doctoral research. Doctoral Research Mode is intentionally irreversible from the application interface.',
  },
  fields: [
    {
      name: 'mode',
      type: 'select',
      required: true,
      defaultValue: 'development',
      options: [
        { label: 'Development mode', value: 'development' },
        { label: 'Doctoral Research Mode', value: 'doctoral' },
      ],
      admin: {
        readOnly: true,
        description:
          'Development permits synthetic TEST workflows. Doctoral mode blocks synthetic generation and reset actions.',
      },
    },
    {
      name: 'environmentActions',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/DevelopmentResetActions',
        },
      },
    },
    {
      name: 'lastResetAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'lastResetBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'lastResetScope',
      type: 'select',
      options: [
        { label: 'TEST data reset', value: 'test' },
        { label: 'Final development reset', value: 'final' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'lastResetSummary',
      type: 'json',
      admin: {
        readOnly: true,
        description: 'Machine-readable summary of the most recent controlled reset.',
      },
    },
    {
      name: 'doctoralModeActivatedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'doctoralModeActivatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { readOnly: true },
    },
    {
      name: 'notes',
      type: 'textarea',
      admin: {
        description:
          'Administrator notes about the development-to-doctoral transition. Do not use this field for scientific observations.',
      },
    },
  ],
};
