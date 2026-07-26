import type { CollectionConfig } from 'payload';

import { inheritCitationExecutionContext } from '../hooks/inheritCitationExecutionContext';
import { protectCitationSnapshot } from '../hooks/protectCitationSnapshot';
import { Citations as BaseCitations } from './Citations';

export const Citations: CollectionConfig = {
  ...BaseCitations,
  hooks: {
    ...BaseCitations.hooks,
    beforeValidate: [
      ...(BaseCitations.hooks?.beforeValidate || []),
      inheritCitationExecutionContext,
      protectCitationSnapshot,
    ],
  },
};
