import type { Payload, PayloadRequest } from 'payload';

import { generatePilotMetricDefinitionRecords } from './pilotMetricDefinitionBatch';
import { generateRCRMetricValidationRecords } from './rcrMetricValidationBatch';

type GeneratedRecord = {
  collectionSlug:
    | 'prompt-executions'
    | 'observations'
    | 'metrics'
    | 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

const DEFINITION_CODES = [
  'GSL-MDEF-AIR-0001',
  'GSL-MDEF-CR-0001',
  'GSL-MDEF-MCP-0001',
  'GSL-MDEF-RCR-0001',
] as const;

const inspectDefinitions = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}) => {
  const present: string[] = [];
  const missing: string[] = [];

  for (const definitionCode of DEFINITION_CODES) {
    const result = await payload.find({
      collection: 'metric-definitions',
      where: { definitionCode: { equals: definitionCode } },
      limit: 2,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (result.docs.length > 1) {
      throw new Error(
        `Expected one Metric Definition but found ${result.docs.length}: definitionCode = ${definitionCode}`,
      );
    }

    if (result.docs.length === 1) present.push(definitionCode);
    else missing.push(definitionCode);
  }

  return { present, missing };
};

const rollbackDefinitions = async ({
  payload,
  req,
  records,
}: {
  payload: Payload;
  req: PayloadRequest;
  records: GeneratedRecord[];
}) => {
  for (const record of [...records].reverse()) {
    if (record.collectionSlug !== 'metric-definitions') continue;

    await payload
      .delete({
        collection: 'metric-definitions',
        id: record.recordId,
        overrideAccess: true,
        req,
      })
      .catch(() => undefined);
  }
};

export const generateRCRMetricValidationWithPrerequisites = async ({
  payload,
  req,
  batchCode,
}: {
  payload: Payload;
  req: PayloadRequest;
  batchCode: string;
}): Promise<GeneratedRecord[]> => {
  const { present, missing } = await inspectDefinitions({ payload, req });
  let createdDefinitions: GeneratedRecord[] = [];

  if (missing.length > 0 && present.length > 0) {
    throw new Error(
      `Pilot Metric Definitions are incomplete. Present: ${present.join(', ')}. Missing: ${missing.join(', ')}. Restore the complete AIR, CR, MCP and RCR registry before running deterministic metric validation.`,
    );
  }

  if (missing.length === DEFINITION_CODES.length) {
    createdDefinitions = (await generatePilotMetricDefinitionRecords({
      payload,
      req,
    })) as GeneratedRecord[];
  }

  try {
    const rcrRecords = (await generateRCRMetricValidationRecords({
      payload,
      req,
      batchCode,
    })) as GeneratedRecord[];

    return [...createdDefinitions, ...rcrRecords];
  } catch (error) {
    await rollbackDefinitions({ payload, req, records: createdDefinitions });
    throw error;
  }
};
