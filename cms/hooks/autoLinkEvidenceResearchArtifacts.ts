import type { CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type EvidenceData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  researchArtifacts?: unknown;
};

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const hasExplicitArtifactLinks = (value: unknown) =>
  Array.isArray(value) && value.length > 0;

/**
 * Convenience + regression-safety hook.
 *
 * When an Evidence record is created without explicit Research Artifact links,
 * automatically link the artifact only when the selected Prompt Execution has
 * exactly one Research Artifact. If there are zero or multiple candidates we
 * deliberately leave the field untouched so the researcher must choose.
 */
export const autoLinkEvidenceResearchArtifacts: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  operation,
  req,
}) => {
  if (operation !== 'create') return data;

  const incomingData = (data || {}) as EvidenceData;
  const previousData = (originalDoc || {}) as EvidenceData;

  if (
    hasExplicitArtifactLinks(incomingData.researchArtifacts) ||
    hasExplicitArtifactLinks(previousData.researchArtifacts)
  ) {
    return data;
  }

  const promptExecutionId = getRelationshipId(
    incomingData.promptExecution ?? previousData.promptExecution,
  );

  if (!promptExecutionId) return data;

  const artifacts = await req.payload.find({
    collection: 'research-artifacts',
    where: {
      promptExecution: {
        equals: promptExecutionId,
      },
    },
    limit: 2,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    req,
  });

  if (artifacts.docs.length !== 1) return data;

  const artifact = artifacts.docs[0] as { id?: string | number };
  if (typeof artifact.id !== 'string' && typeof artifact.id !== 'number') return data;

  return {
    ...incomingData,
    researchArtifacts: [artifact.id],
  };
};
