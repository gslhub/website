import { APIError, type CollectionBeforeValidateHook } from 'payload';

type ScientificCodeToken = 'EXEC' | 'OBS' | 'ART' | 'EVD' | 'CIT' | 'MET';

type ScientificCodeConfig = {
  field: string;
  token: ScientificCodeToken;
  label: string;
};

type AuthenticatedUser = {
  role?: unknown;
};

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const isAdministrator = (user: unknown) =>
  Boolean(
    user &&
      typeof user === 'object' &&
      (user as AuthenticatedUser).role === 'admin',
  );

const throwCodeError = (message: string, status = 400): never => {
  throw new APIError(message, status);
};

export const createScientificRecordCodeValidator = ({
  field,
  token,
  label,
}: ScientificCodeConfig): CollectionBeforeValidateHook => {
  const realCodePattern = new RegExp(
    `^GSL-${token}-[A-Z0-9]+(?:-[A-Z0-9]+)*-\\d{4,}$`,
  );
  const testCodePattern = new RegExp(
    `^TEST-GSL-TD-\\d{8}T\\d{6}-[A-F0-9]{6}-${token}-\\d{4,}$`,
  );

  return ({ data, operation, originalDoc, req }) => {
    const incoming = (data || {}) as Record<string, unknown>;
    const previous = (originalDoc || {}) as Record<string, unknown>;
    const rawCode = getString(incoming[field] ?? previous[field]);

    if (!rawCode) return data;

    const normalizedCode = rawCode.toUpperCase();
    const previousCode = getString(previous[field])?.toUpperCase() || null;

    if (
      operation === 'update' &&
      previousCode !== null &&
      normalizedCode !== previousCode
    ) {
      throwCodeError(
        `${label} code ${previousCode} is permanently reserved and cannot be changed. Create a new scientific record when a different identifier is required.`,
        409,
      );
    }

    if (normalizedCode.startsWith('TEST-')) {
      if (!isAdministrator(req.user)) {
        throwCodeError(
          `The TEST scientific-code namespace is reserved for administrator-owned Test Data Batches.`,
          403,
        );
      }

      if (!testCodePattern.test(normalizedCode)) {
        throwCodeError(
          `${label} test codes must follow TEST-GSL-TD-YYYYMMDDTHHMMSS-XXXXXX-${token}-0001.`,
        );
      }
    } else if (!realCodePattern.test(normalizedCode)) {
      throwCodeError(
        `${label} codes must follow GSL-${token}-<RESEARCH-SCOPE>-0001 using uppercase letters, numbers and hyphens.`,
      );
    }

    return {
      ...incoming,
      [field]: normalizedCode,
    };
  };
};
