import type { Payload, PayloadRequest } from 'payload';

export type ResearchMode = 'development' | 'doctoral';

export const DEVELOPMENT_ONLY_SCENARIOS = new Set([
  'pilot-executions',
  'full-research-pipeline',
  'pilot-metric-definitions',
  'pilot-metric-results',
  'air-deterministic-validation',
  'cr-deterministic-validation',
  'mcp-deterministic-validation',
  'rcr-deterministic-validation',
]);

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export const getResearchEnvironment = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const environment = (await payload.findGlobal({
    slug: 'research-environment',
    depth: 0,
    overrideAccess: true,
    req,
  })) as Record<string, unknown>;

  const mode = getString(environment.mode) === 'doctoral' ? 'doctoral' : 'development';

  return {
    ...environment,
    mode: mode as ResearchMode,
  };
};

export const assertDevelopmentMode = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const environment = await getResearchEnvironment({ payload, req });

  if (environment.mode !== 'development') {
    throw new Error(
      'This action is disabled because GSLHub is in Doctoral Research Mode. Synthetic development data can no longer be generated or reset from the application interface.',
    );
  }

  return environment;
};

export const assertScenarioAllowedForResearchMode = async ({
  payload,
  req,
  scenario,
}: {
  payload: Payload;
  req: PayloadRequest;
  scenario: string | null;
}) => {
  if (!scenario || !DEVELOPMENT_ONLY_SCENARIOS.has(scenario)) return;

  await assertDevelopmentMode({ payload, req });
};
