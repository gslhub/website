import type { CollectionConfig } from 'payload';

import { protectPromptDefinition } from '../hooks/protectPromptDefinition';
import { Prompts as BasePrompts } from './Prompts';

export const Prompts: CollectionConfig = {
  ...BasePrompts,
  hooks: {
    ...BasePrompts.hooks,
    beforeValidate: [
      ...(BasePrompts.hooks?.beforeValidate || []),
      protectPromptDefinition,
    ],
  },
};
