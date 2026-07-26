import type { CollectionConfig } from 'payload';

import { protectAISystemDefinition } from '../hooks/protectAISystemDefinition';
import { AISystems as BaseAISystems } from './AISystems';

export const AISystems: CollectionConfig = {
  ...BaseAISystems,
  hooks: {
    ...BaseAISystems.hooks,
    beforeValidate: [
      ...(BaseAISystems.hooks?.beforeValidate || []),
      protectAISystemDefinition,
    ],
  },
};
