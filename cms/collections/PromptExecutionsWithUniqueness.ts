import type { CollectionConfig } from 'payload';

import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { validatePromptExecutionUniqueness } from '../hooks/validatePromptExecutionUniqueness';
import { PromptExecutions as BasePromptExecutions } from './PromptExecutions';

const validateExecutionCode = createScientificRecordCodeValidator({
  field: 'executionCode',
  token: 'EXEC',
  label: 'Prompt execution',
});

export const PromptExecutions: CollectionConfig = {
  ...BasePromptExecutions,
  hooks: {
    ...BasePromptExecutions.hooks,
    beforeValidate: [
      validateExecutionCode,
      validatePromptExecutionUniqueness,
      ...(BasePromptExecutions.hooks?.beforeValidate || []),
    ],
  },
};
