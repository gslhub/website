import { APIError, type CollectionBeforeValidateHook } from 'payload';

type RelationshipValue =
  | string
  | number
  | { id?: string | number | null }
  | null
  | undefined;

type EvidenceData = Record<string, unknown> & {
  lifecycleStatus?: unknown;
  researchArtifacts?: RelationshipValue[] | null;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getRelationshipId = (value: RelationshipValue): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object') {
    const id = value.id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const normalizeRelationshipSet = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => getRelationshipId(item as RelationshipValue))
    .filter((id): id is string | number => id !== null)
    .map(String)
    .sort();
};

const sameRelationshipSet = (left: unknown, right: unknown) =>
  JSON.stringify(normalizeRelationshipSet(left)) ===
  JSON.stringify(normalizeRelationshipSet(right));

const sealedStatuses = new Set(['validated', 'rejected', 'archived']);

export const protectEvidenceArtifactLinks: CollectionBeforeValidateHook = ({
  data,
  operation,
  originalDoc,
}) => {
  if (operation !== 'update' || !originalDoc) return data;

  const incoming = (data || {}) as EvidenceData;
  const previous = originalDoc as EvidenceData;
  const previousStatus = getString(previous.lifecycleStatus) || 'captured';

  if (!sealedStatuses.has(previousStatus)) return data;

  if (!Object.prototype.hasOwnProperty.call(incoming, 'researchArtifacts')) {
    return data;
  }

  if (
    !sameRelationshipSet(
      incoming.researchArtifacts,
      previous.researchArtifacts,
    )
  ) {
    throw new APIError(
      'The scientific evidence snapshot is sealed. Linked Research Artifacts cannot be changed after Evidence is validated, rejected or archived. Create a new Evidence record instead.',
      409,
    );
  }

  return data;
};
