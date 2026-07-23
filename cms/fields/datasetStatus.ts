import type { Field } from 'payload';

export const datasetStatusField: Field = {
  name: 'lifecycleStatus',
  type: 'select',
  required: true,
  defaultValue: 'planned',
  index: true,
  options: [
    { label: 'Planned', value: 'planned' },
    { label: 'Collecting', value: 'collecting' },
    { label: 'Cleaning', value: 'cleaning' },
    { label: 'Validating', value: 'validating' },
    { label: 'Released', value: 'released' },
    { label: 'Archived', value: 'archived' },
  ],
};
