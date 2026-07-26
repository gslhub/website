import type { CollectionConfig } from 'payload';

import { inheritEvidenceExecutionContext } from '../hooks/inheritEvidenceExecutionContext';
import { protectEvidenceSnapshot } from '../hooks/protectEvidenceSnapshot';
import { Evidence as BaseEvidence } from './Evidence';

export const Evidence: CollectionConfig = {
  ...BaseEvidence,
  hooks: {
    ...BaseEvidence.hooks,
    beforeValidate: [
      ...(BaseEvidence.hooks?.beforeValidate || []),
      inheritEvidenceExecutionContext,
      protectEvidenceSnapshot,
    ],
  },
};
