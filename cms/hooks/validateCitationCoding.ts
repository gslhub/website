import { APIError, type CollectionBeforeValidateHook } from 'payload';

type CitationDocument = Record<string, unknown> & {
  citationCode?: unknown;
  lifecycleStatus?: unknown;
  sourceUrl?: unknown;
  normalizedUrl?: unknown;
  sourceDomain?: unknown;
  sourceAccessedAt?: unknown;
  citationContext?: unknown;
  targetCoding?: unknown;
  verification?: unknown;
  integrity?: unknown;
  qualityControl?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const getNestedValue = (value: unknown, key: string): unknown =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)[key]
    : undefined;

const getRelationshipID = (value: unknown): string | number | null => {
  if (typeof value === 'string' || typeof value === 'number') return value;

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const id = (value as Record<string, unknown>).id;
    return typeof id === 'string' || typeof id === 'number' ? id : null;
  }

  return null;
};

const hasRelationships = (value: unknown): boolean =>
  Array.isArray(value) ? value.length > 0 : getRelationshipID(value) !== null;

const throwValidation = (message: string): never => {
  throw new APIError(message, 400);
};

export const validateCitationCoding: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const incoming = (data || {}) as CitationDocument;
  const previous = (originalDoc || {}) as CitationDocument;
  const lifecycleStatus =
    getString(incoming.lifecycleStatus ?? previous.lifecycleStatus) || 'captured';

  if (!new Set(['validated', 'rejected']).has(lifecycleStatus)) return data;

  const citationCode =
    getString(incoming.citationCode ?? previous.citationCode) || '';
  const isSyntheticTestRecord = citationCode.startsWith('TEST-');
  const qualityControl = incoming.qualityControl ?? previous.qualityControl;
  const reviewStatus = getString(getNestedValue(qualityControl, 'reviewStatus'));
  const reviewers = getNestedValue(qualityControl, 'reviewers');
  const validatedAt = getNestedValue(qualityControl, 'validatedAt');

  if (!hasRelationships(reviewers)) {
    throwValidation(
      `A citation with lifecycle status "${lifecycleStatus}" requires at least one quality-control reviewer.`,
    );
  }

  if (lifecycleStatus === 'rejected') {
    if (reviewStatus !== 'rejected') {
      throwValidation(
        'A rejected citation requires Quality Control → Review Status = Rejected.',
      );
    }

    return data;
  }

  if (reviewStatus !== 'accepted') {
    throwValidation(
      'A validated citation requires Quality Control → Review Status = Accepted.',
    );
  }

  if (!validatedAt) {
    throwValidation('A validated citation requires Quality Control → Validated At.');
  }

  const sourceDomain = getString(incoming.sourceDomain ?? previous.sourceDomain);
  const sourceUrl = getString(incoming.sourceUrl ?? previous.sourceUrl);
  const normalizedUrl = getString(incoming.normalizedUrl ?? previous.normalizedUrl);
  const sourceAccessedAt = incoming.sourceAccessedAt ?? previous.sourceAccessedAt;

  if (!sourceDomain) {
    throwValidation('A validated citation requires Source Domain.');
  }

  if (sourceUrl && !normalizedUrl) {
    throwValidation('A validated citation with Source URL requires Normalized URL.');
  }

  if (sourceUrl && !sourceAccessedAt) {
    throwValidation('A validated citation with Source URL requires Source Accessed At.');
  }

  const citationContext = incoming.citationContext ?? previous.citationContext;
  const integrity = incoming.integrity ?? previous.integrity;
  const displayText = getString(getNestedValue(citationContext, 'displayText'));
  const rawCitationText = getString(getNestedValue(integrity, 'rawCitationText'));
  const checksumAlgorithm =
    getString(getNestedValue(integrity, 'checksumAlgorithm')) || 'sha256';
  const checksum = getString(getNestedValue(integrity, 'checksum'));

  if (!displayText && !rawCitationText) {
    throwValidation(
      'A validated citation requires exact preserved citation text in Citation Context → Display Text or Integrity → Raw Citation Text.',
    );
  }

  if (
    !isSyntheticTestRecord &&
    (checksumAlgorithm === 'none' || !checksum)
  ) {
    throwValidation(
      'A validated citation requires an integrity checksum calculated from the preserved raw citation representation.',
    );
  }

  const verification = incoming.verification ?? previous.verification;
  const verifiedAt = getNestedValue(verification, 'verifiedAt');
  const verifiedBy = getNestedValue(verification, 'verifiedBy');
  const supportsClaim =
    getString(getNestedValue(verification, 'supportsClaim')) || 'not-assessed';
  const urlResolved = getNestedValue(verification, 'urlResolved') === true;
  const httpStatus = getNestedValue(verification, 'httpStatus');
  const finalUrl = getString(getNestedValue(verification, 'finalUrl'));

  if (!verifiedAt || !hasRelationships(verifiedBy)) {
    throwValidation(
      'A validated citation requires Verification → Verified At and at least one Verified By researcher.',
    );
  }

  if (supportsClaim === 'not-assessed') {
    throwValidation(
      'A validated citation requires Verification → Supports Claim to be assessed.',
    );
  }

  if (urlResolved && (typeof httpStatus !== 'number' || !finalUrl)) {
    throwValidation(
      'A citation marked URL Resolved requires an HTTP Status and Final URL.',
    );
  }

  const targetCoding = incoming.targetCoding ?? previous.targetCoding;
  const isEvaluatedTarget =
    getNestedValue(targetCoding, 'isEvaluatedTarget') === true;

  if (isEvaluatedTarget) {
    const targetType =
      getString(getNestedValue(targetCoding, 'targetType')) || 'none';
    const targetValue = getString(getNestedValue(targetCoding, 'targetValue'));
    const targetMatchType =
      getString(getNestedValue(targetCoding, 'targetMatchType')) || 'none';

    if (targetType === 'none' || !targetValue || targetMatchType === 'none') {
      throwValidation(
        'A citation marked as the evaluated target requires Target Type, Target Value and a non-empty Target Match Type.',
      );
    }
  }

  return data;
};
