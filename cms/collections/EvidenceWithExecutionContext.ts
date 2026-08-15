import type { CollectionConfig, Field } from 'payload';

import { autoLinkEvidenceResearchArtifacts } from '../hooks/autoLinkEvidenceResearchArtifacts';
import { inheritEvidenceExecutionContext } from '../hooks/inheritEvidenceExecutionContext';
import { protectEvidenceArtifactLinks } from '../hooks/protectEvidenceArtifactLinks';
import { protectEvidenceSnapshot } from '../hooks/protectEvidenceSnapshot';
import { validateEvidenceResearchArtifacts } from '../hooks/validateEvidenceResearchArtifacts';
import { createScientificRecordCodeValidator } from '../hooks/validateScientificRecordCode';
import { Evidence as BaseEvidence } from './Evidence';

const validateEvidenceCode = createScientificRecordCodeValidator({
  field: 'evidenceCode',
  token: 'EVD',
  label: 'Evidence',
});

const researchArtifactsField: Field = {
  name: 'researchArtifacts',
  type: 'relationship',
  relationTo: 'research-artifacts',
  hasMany: true,
  admin: {
    description:
      'Research Artifacts that preserve the raw files supporting this evidence record. Every linked artifact must belong to the same Prompt Execution.',
  },
};

const fieldsWithResearchArtifacts = BaseEvidence.fields.flatMap((field) => {
  if ('name' in field && field.name === 'observation') {
    return [field, researchArtifactsField];
  }

  return [field];
});

export const Evidence: CollectionConfig = {
  ...BaseEvidence,
  fields: fieldsWithResearchArtifacts,
  hooks: {
    ...BaseEvidence.hooks,
    beforeValidate: [
      ...(BaseEvidence.hooks?.beforeValidate || []),
      validateEvidenceCode,
      inheritEvidenceExecutionContext,
      autoLinkEvidenceResearchArtifacts,
      validateEvidenceResearchArtifacts,
      protectEvidenceSnapshot,
      protectEvidenceArtifactLinks,
    ],
  },
};
