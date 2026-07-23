import type { Field } from 'payload';

export const projectStatusField: Field = {
  name: 'status',
  type: 'select',
  required: true,
  defaultValue: 'planned',
  index: true,
  options: [
    { label: 'Planned', value: 'planned' },
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Completed', value: 'completed' },
    { label: 'Archived', value: 'archived' },
  ],
};
