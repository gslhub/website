import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type EvidenceData = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
  researchArtifacts?: RelationshipValue[] | null;
};

type ResearchArtifactContext = Record<string, unknown> & {
  promptExecution?: RelationshipValue;
};

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const getRelationshipIds = (value: unknown): Array<string | number> => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => getRelationshipId(item as RelationshipValue))
    .filter((id): id is string | number => id !== null);
};

const sameRelationship = (
  left: string | number | null,
  right: string | number | null,
) => left !== null && right !== null && String(left) === String(right);

const throwContextConflict = (message: string): never => {
  throw new APIError(message, 409);
};

export const validateEvidenceResearchArtifacts: CollectionBeforeValidateHook = async ({
  data,
  originalDoc,
  req,
}) => {
  const incoming = (data || {}) as EvidenceData;
  const previous = (originalDoc || {}) as EvidenceData;
  const promptExecutionId = getRelationshipId(
    incoming.promptExecution ?? previous.promptExecution,
  );

  if (!promptExecutionId) return data;

  const hasIncomingArtifacts = Object.prototype.hasOwnProperty.call(
    incoming,
    'researchArtifacts',
  );
  const artifactIds = getRelationshipIds(
    hasIncomingArtifacts ? incoming.researchArtifacts : previous.researchArtifacts,
  );

  if (artifactIds.length === 0) return data;

  const artifacts = await Promise.all(
    artifactIds.map((id) =>
      req.payload.findByID({
        collection: 'research-artifacts',
        id,
        depth: 0,
        overrideAccess: true,
        req,
      }),
    ),
  );

  const conflictingArtifactIndexes = artifacts
    .map((artifact, index) => {
      const artifactExecutionId = getRelationshipId(
        (artifact as ResearchArtifactContext).promptExecution,
      );
      return sameRelationship(artifactExecutionId, promptExecutionId)
        ? null
        : index;
    })
    .filter((index): index is number => index !== null);

  if (conflictingArtifactIndexes.length > 0) {
    throwContextConflict(
      'Every Research Artifact linked to an Evidence record must belong to the same Prompt Execution as the Evidence record.',
    );
  }

  if (!hasIncomingArtifacts) return data;

  return {
    ...incoming,
    researchArtifacts: artifactIds,
  };
};
