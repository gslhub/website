import type { CollectionConfig } from 'payload';

import { inheritCitationExecutionContext } from '../hooks/inheritCitationExecutionContext';
import { protectCitationSnapshot } from '../hooks/protectCitationSnapshot';
import { validateCitationCoding } from '../hooks/validateCitationCoding';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { Citations as BaseCitations } from './Citations';

const validateCitationCode = createScientificRecordCodeValidator({
  field: 'citationCode',
  token: 'CIT',
  label: 'Citation',
});

export const Citations: CollectionConfig = {
  ...BaseCitations,
  hooks: {
    ...BaseCitations.hooks,
    beforeValidate: [
      ...(BaseCitations.hooks?.beforeValidate || []),
      validateCitationCode,
      inheritCitationExecutionContext,
      validateCitationCoding,
      protectCitationSnapshot,
    ],
  },
};
