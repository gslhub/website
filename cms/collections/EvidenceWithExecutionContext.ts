import type { CollectionConfig } from 'payload';

import { inheritEvidenceExecutionContext } from '../hooks/inheritEvidenceExecutionContext';
import { protectEvidenceSnapshot } from '../hooks/protectEvidenceSnapshot';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { Evidence as BaseEvidence } from './Evidence';

const validateEvidenceCode = createScientificRecordCodeValidator({
  field: 'evidenceCode',
  token: 'EVD',
  label: 'Evidence',
});

export const Evidence: CollectionConfig = {
  ...BaseEvidence,
  hooks: {
    ...BaseEvidence.hooks,
    beforeValidate: [
      ...(BaseEvidence.hooks?.beforeValidate || []),
      validateEvidenceCode,
      inheritEvidenceExecutionContext,
      protectEvidenceSnapshot,
    ],
  },
};
