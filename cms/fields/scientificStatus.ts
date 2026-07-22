import type { Field } from 'payload';

export const scientificStatusField: Field = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'planned',
  index: true,
  options: [
    { label: 'Planned', value: 'planned' },
    { label: 'In preparation', value: 'in-preparation' },
    { label: 'Preprint', value: 'preprint' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' },
  ],
};
