import type { CollectionConfig, Field } from 'payload';

import { inheritMetricDefinitionSnapshot } from '../hooks/inheritMetricDefinitionSnapshot';
import { protectMetricSnapshot } from '../hooks/protectMetricSnapshot';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { validateMetricScientificContext } from '../hooks/validateMetricScientificContext';
import { Metrics as BaseMetrics } from './Metrics';

const validateMetricRecordCode = createScientificRecordCodeValidator({
  field: 'metricRecordCode',
  token: 'MET',
  label: 'Metric result',
});

const inheritedFieldNames = new Set([
  'metricCode',
  'metricName',
  'metricVersion',
  'metricCategory',
  'direction',
  'scopeType',
  'valueType',
  'unit',
  'precision',
  'formulaSnapshot',
  'aggregationMethod',
  'missingDataPolicy',
]);

const metricDefinitionField: Field = {
  name: 'metricDefinition',
  type: 'relationship',
  relationTo: 'metric-definitions',
  required: true,
  index: true,
  admin: {
    description:
      'Versioned scientific definition used to inherit the metric code, formula, direction, unit and calculation rules.',
  },
};

const enhanceField = (field: Field): Field => {
  if (!('name' in field) || typeof field.name !== 'string') return field;

  if (field.type === 'select' && field.name === 'metricCategory') {
    const options = Array.isArray(field.options) ? field.options : [];
    const hasPosition = options.some(
      (option) =>
        typeof option === 'object' &&
        option !== null &&
        'value' in option &&
        option.value === 'position',
    );

    return {
      ...field,
      options: hasPosition
        ? options
        : [...options, { label: 'Position', value: 'position' }],
      admin: {
        ...(field.admin || {}),
        readOnly: true,
      },
    };
  }

  if (inheritedFieldNames.has(field.name)) {
    return {
      ...field,
      admin: {
        ...(field.admin || {}),
        readOnly: true,
      },
    } as Field;
  }

  return field;
};

const enhancedFields = BaseMetrics.fields.flatMap((field) => {
  const enhanced = enhanceField(field);

  if ('name' in field && field.name === 'metricRecordCode') {
    return [enhanced, metricDefinitionField];
  }

  return [enhanced];
});

export const Metrics: CollectionConfig = {
  ...BaseMetrics,
  fields: enhancedFields,
  hooks: {
    ...BaseMetrics.hooks,
    beforeValidate: [
      ...(BaseMetrics.hooks?.beforeValidate || []),
      validateMetricRecordCode,
      inheritMetricDefinitionSnapshot,
      validateMetricScientificContext,
      protectMetricSnapshot,
    ],
  },
};
