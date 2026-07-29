import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ObservationDocument = Record<string, unknown> & {
  id?: unknown;
  observationCode?: unknown;
  lifecycleStatus?: unknown;
  codedAt?: unknown;
  qualityControl?: unknown;
  visibilityCoding?: unknown;
  comparison?: unknown;
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

const hasLocalizedText = (value: unknown): boolean => {
  if (getString(value)) return true;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;

  return Object.values(value as Record<string, unknown>).some((item) =>
    Boolean(getString(item)),
  );
};

const throwValidation = (message: string): never => {
  throw new APIError(message, 400);
};

export const validateObservationCoding: CollectionBeforeValidateHook = ({
  data,
  originalDoc,
}) => {
  const incoming = (data || {}) as ObservationDocument;
  const previous = (originalDoc || {}) as ObservationDocument;
  const lifecycleStatus =
    getString(incoming.lifecycleStatus ?? previous.lifecycleStatus) || 'planned';

  if (!new Set(['validated', 'excluded']).has(lifecycleStatus)) return data;

  const observationCode =
    getString(incoming.observationCode ?? previous.observationCode) || '';
  const isSyntheticTestRecord = observationCode.startsWith('TEST-');
  const codedAt = incoming.codedAt ?? previous.codedAt;
  const qualityControl = incoming.qualityControl ?? previous.qualityControl;
  const reviewStatus = getString(getNestedValue(qualityControl, 'reviewStatus'));
  const reviewers = getNestedValue(qualityControl, 'reviewers');
  const validatedAt = getNestedValue(qualityControl, 'validatedAt');
  const exclusionReason = getNestedValue(qualityControl, 'exclusionReason');

  if (!codedAt) {
    throwValidation(
      `An observation with lifecycle status "${lifecycleStatus}" requires Coded At.`,
    );
  }

  if (!hasRelationships(reviewers)) {
    throwValidation(
      `An observation with lifecycle status "${lifecycleStatus}" requires at least one quality-control reviewer.`,
    );
  }

  if (lifecycleStatus === 'validated') {
    if (reviewStatus !== 'accepted') {
      throwValidation(
        'A validated observation requires Quality Control → Review Status = Accepted.',
      );
    }

    if (!validatedAt) {
      throwValidation(
        'A validated observation requires Quality Control → Validated At.',
      );
    }
  }

  if (lifecycleStatus === 'excluded') {
    if (reviewStatus !== 'excluded') {
      throwValidation(
        'An excluded observation requires Quality Control → Review Status = Excluded from analysis.',
      );
    }

    if (!hasLocalizedText(exclusionReason)) {
      throwValidation(
        'An excluded observation requires a documented Quality Control → Exclusion Reason.',
      );
    }
  }

  const visibilityCoding = incoming.visibilityCoding ?? previous.visibilityCoding;
  const targetType =
    getString(getNestedValue(visibilityCoding, 'targetType')) || 'none';
  const targetValue = getString(getNestedValue(visibilityCoding, 'targetValue'));
  const mentioned = getNestedValue(visibilityCoding, 'mentioned') === true;
  const cited = getNestedValue(visibilityCoding, 'cited') === true;
  const recommended = getNestedValue(visibilityCoding, 'recommended') === true;
  const mentionPosition = getNestedValue(visibilityCoding, 'mentionPosition');
  const citationPosition = getNestedValue(visibilityCoding, 'citationPosition');
  const recommendationStrength =
    getString(getNestedValue(visibilityCoding, 'recommendationStrength')) || 'none';

  if (targetType !== 'none' && !targetValue) {
    throwValidation(
      'A coded observation with a specific Visibility Target Type requires Target Value.',
    );
  }

  if (!mentioned && mentionPosition !== undefined && mentionPosition !== null) {
    throwValidation(
      'Mention Position must be empty when the evaluated target is not marked as mentioned.',
    );
  }

  if (!cited && citationPosition !== undefined && citationPosition !== null) {
    throwValidation(
      'Citation Position must be empty when the evaluated target is not marked as cited.',
    );
  }

  if (recommended && recommendationStrength === 'none') {
    throwValidation(
      'A recommended target requires Recommendation Strength = Weak, Moderate or Strong.',
    );
  }

  if (!recommended && recommendationStrength !== 'none') {
    throwValidation(
      'Recommendation Strength must be None when the evaluated target is not marked as recommended.',
    );
  }

  const comparison = incoming.comparison ?? previous.comparison;
  const variationLevel =
    getString(getNestedValue(comparison, 'variationLevel')) || 'not-assessed';
  const baselineObservation = getNestedValue(comparison, 'baselineObservation');
  const baselineObservationId = getRelationshipID(baselineObservation);

  if (
    !isSyntheticTestRecord &&
    variationLevel !== 'not-assessed' &&
    baselineObservationId === null
  ) {
    throwValidation(
      'An assessed comparison observation requires a Baseline Observation.',
    );
  }

  const observationId = getRelationshipID(incoming.id ?? previous.id);

  if (
    observationId !== null &&
    baselineObservationId !== null &&
    String(observationId) === String(baselineObservationId)
  ) {
    throwValidation('An observation cannot reference itself as its comparison baseline.');
  }

  return data;
};
