import type { CollectionConfig } from 'payload';

import { validatePromptExecutionUniqueness } from '../hooks/validatePromptExecutionUniqueness';
import { PromptExecutions as BasePromptExecutions } from './PromptExecutions';

export const PromptExecutions: CollectionConfig = {
  ...BasePromptExecutions,
  hooks: {
    ...BasePromptExecutions.hooks,
    beforeValidate: [
      validatePromptExecutionUniqueness,
      ...(BasePromptExecutions.hooks?.beforeValidate || []),
    ],
  },
};
