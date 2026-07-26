import type { CollectionBeforeDeleteHook, Payload, PayloadRequest } from 'payload';

type RecordID = string | number;

type BatchDocument = {
  id: RecordID;
  batchCode?: unknown;
  scenario?: unknown;
  records?: unknown;
};

type GeneratedRecord = {
  collectionSlug: 'metric-definitions';
  recordId: string;
  recordCode: string;
  label: string;
};

type DocumentWithID = {
  id: RecordID;
  definitionCode?: unknown;
  lifecycleStatus?: unknown;
  _status?: unknown;
};

type ContextCollection =
  | 'projects'
  | 'benchmarks'
  | 'researchers'
  | 'research-areas'
  | 'resources'
  | 'software';

type LocalizedMetricText = {
  title: string;
  description: string;
  interpretation: string;
  pseudocode: string;
  numeratorDefinition?: string;
  denominatorDefinition?: string;
  assumptions: string;
  limitations: string;
  validationProcedure: string;
};

type RequiredInput = {
  sourceCollection:
    | 'prompt-executions'
    | 'observations'
    | 'citations'
    | 'evidence';
  fieldName: string;
  required: boolean;
  descriptionEn: string;
  descriptionEs: string;
};

type MetricDefinitionSeed = {
  definitionCode: string;
  metricCode: string;
  slug: string;
  category: 'visibility' | 'citation' | 'position' | 'consistency';
  direction: 'higher' | 'lower';
  unit: 'proportion' | 'position';
  aggregationMethod: 'ratio' | 'mean';
  roundingPrecision: number;
  validRange: {
    minimum: number;
    maximum?: number;
    minimumInclusive: boolean;
    maximumInclusive: boolean;
  };
  formula: string;
  requiredInputs: RequiredInput[];
  en: LocalizedMetricText;
  es: LocalizedMetricText;
};

const PILOT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  researcherSlug: 'eduardo-yauri',
  researchAreaCode: 'GEO',
  resourceSlug: 'gslhub-generative-search-visibility-benchmark-research-protocol',
  softwareSlug: 'gslhub-generative-search-benchmark-toolkit',
  version: '0.1.0',
} as const;

const METRICS: MetricDefinitionSeed[] = [
  {
    definitionCode: 'GSL-MDEF-AIR-0001',
    metricCode: 'AIR',
    slug: 'answer-inclusion-rate-0-1-0',
    category: 'visibility',
    direction: 'higher',
    unit: 'proportion',
    aggregationMethod: 'ratio',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula: 'AIR = Σ I(mentioned_i = true) / N_valid',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.mentioned',
        required: true,
        descriptionEn:
          'Binary coding indicating whether the evaluated target appears in the generated answer.',
        descriptionEs:
          'Codificación binaria que indica si el objetivo evaluado aparece en la respuesta generada.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn:
          'Only observations accepted for analysis contribute to the analytical denominator.',
        descriptionEs:
          'Solo las observaciones aceptadas para el análisis forman parte del denominador analítico.',
      },
      {
        sourceCollection: 'prompt-executions',
        fieldName: 'lifecycleStatus',
        required: true,
        descriptionEn:
          'The associated execution must be completed and eligible for analysis.',
        descriptionEs:
          'La ejecución asociada debe estar completada y ser elegible para el análisis.',
      },
    ],
    en: {
      title: 'Answer Inclusion Rate',
      description:
        'Proportion of valid controlled executions in which the evaluated target is included in the generated answer.',
      interpretation:
        'Higher values indicate that the target appears more consistently in generated answers under the evaluated condition. AIR measures inclusion only; it does not imply citation, recommendation, accuracy or positive sentiment.',
      pseudocode:
        'Select valid completed executions. Resolve one accepted observation per execution. Count observations where visibilityCoding.mentioned is true. Divide that count by the number of valid observations.',
      numeratorDefinition:
        'Number of valid observations in which visibilityCoding.mentioned equals true for the evaluated target.',
      denominatorDefinition:
        'Total number of valid completed executions with one accepted observation and a codable inclusion outcome.',
      assumptions:
        'Each execution contributes at most one accepted observation. The evaluated target and matching rules are fixed before coding begins.',
      limitations:
        'AIR does not distinguish prominent from incidental mentions and does not measure citation, recommendation strength, factual correctness or answer quality.',
      validationProcedure:
        'Recalculate the numerator and denominator from the frozen analytical sample, verify one observation per execution, confirm all exclusions, and compare the independently computed value with the stored result.',
    },
    es: {
      title: 'Tasa de inclusión en la respuesta',
      description:
        'Proporción de ejecuciones controladas válidas en las que el objetivo evaluado aparece incluido en la respuesta generada.',
      interpretation:
        'Los valores más altos indican que el objetivo aparece con mayor regularidad en las respuestas bajo la condición evaluada. AIR mide inclusión, pero no implica citación, recomendación, exactitud ni sentimiento positivo.',
      pseudocode:
        'Seleccionar las ejecuciones completadas válidas. Obtener una observación aceptada por ejecución. Contar las observaciones donde visibilityCoding.mentioned sea true. Dividir ese recuento entre el número de observaciones válidas.',
      numeratorDefinition:
        'Número de observaciones válidas en las que visibilityCoding.mentioned es true para el objetivo evaluado.',
      denominatorDefinition:
        'Número total de ejecuciones completadas válidas con una observación aceptada y un resultado de inclusión codificable.',
      assumptions:
        'Cada ejecución aporta como máximo una observación aceptada. El objetivo evaluado y las reglas de coincidencia se fijan antes de comenzar la codificación.',
      limitations:
        'AIR no distingue menciones prominentes de menciones incidentales y no mide citación, fuerza de recomendación, exactitud factual ni calidad de la respuesta.',
      validationProcedure:
        'Recalcular numerador y denominador desde la muestra analítica congelada, verificar una observación por ejecución, confirmar todas las exclusiones y comparar el valor independiente con el resultado almacenado.',
    },
  },
  {
    definitionCode: 'GSL-MDEF-CR-0001',
    metricCode: 'CR',
    slug: 'citation-rate-0-1-0',
    category: 'citation',
    direction: 'higher',
    unit: 'proportion',
    aggregationMethod: 'ratio',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula: 'CR = Σ I(cited_i = true) / N_valid',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.cited',
        required: true,
        descriptionEn:
          'Binary coding indicating whether the evaluated target is explicitly cited or linked as a source.',
        descriptionEs:
          'Codificación binaria que indica si el objetivo evaluado aparece citado explícitamente o enlazado como fuente.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn:
          'Only observations accepted for analysis contribute to the denominator.',
        descriptionEs:
          'Solo las observaciones aceptadas para el análisis forman parte del denominador.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'verification.supportsClaim',
        required: false,
        descriptionEn:
          'Optional source-level verification used to audit citation coding and claim support.',
        descriptionEs:
          'Verificación opcional a nivel de fuente para auditar la codificación de la cita y el respaldo de afirmaciones.',
      },
    ],
    en: {
      title: 'Citation Rate',
      description:
        'Proportion of valid controlled executions in which the evaluated target is explicitly cited or linked as a source.',
      interpretation:
        'Higher values indicate more frequent source attribution to the evaluated target. CR does not establish that the citation supports the claim, is prominent, is authoritative or is factually correct.',
      pseudocode:
        'Select valid accepted observations. Count observations where visibilityCoding.cited is true for the evaluated target. Divide that count by the total number of valid observations.',
      numeratorDefinition:
        'Number of valid observations in which visibilityCoding.cited equals true for the evaluated target.',
      denominatorDefinition:
        'Total number of valid completed executions with one accepted observation and a codable citation outcome.',
      assumptions:
        'Citation matching uses a predefined target identity and URL or domain normalization rules. Each execution contributes once to the denominator.',
      limitations:
        'CR measures citation occurrence, not citation quality, claim support, prominence, source authority or the number of citations within an answer.',
      validationProcedure:
        'Audit target matching against citation records and evidence, verify exclusions, independently recount cited executions, and compare the recomputed ratio with the stored result.',
    },
    es: {
      title: 'Tasa de citación',
      description:
        'Proporción de ejecuciones controladas válidas en las que el objetivo evaluado aparece citado explícitamente o enlazado como fuente.',
      interpretation:
        'Los valores más altos indican una atribución de fuente más frecuente hacia el objetivo evaluado. CR no demuestra que la cita respalde la afirmación, sea prominente, autoritativa o factualmente correcta.',
      pseudocode:
        'Seleccionar las observaciones válidas y aceptadas. Contar aquellas donde visibilityCoding.cited sea true para el objetivo evaluado. Dividir ese recuento entre el número total de observaciones válidas.',
      numeratorDefinition:
        'Número de observaciones válidas en las que visibilityCoding.cited es true para el objetivo evaluado.',
      denominatorDefinition:
        'Número total de ejecuciones completadas válidas con una observación aceptada y un resultado de citación codificable.',
      assumptions:
        'La coincidencia de citas utiliza una identidad del objetivo y reglas de normalización de URL o dominio definidas previamente. Cada ejecución cuenta una vez en el denominador.',
      limitations:
        'CR mide la aparición de una cita, no su calidad, respaldo de afirmaciones, prominencia, autoridad de la fuente ni el número de citas dentro de la respuesta.',
      validationProcedure:
        'Auditar la coincidencia del objetivo mediante citas y evidencias, verificar exclusiones, volver a contar de forma independiente las ejecuciones citadas y comparar la proporción recalculada con el resultado almacenado.',
    },
  },
  {
    definitionCode: 'GSL-MDEF-MCP-0001',
    metricCode: 'MCP',
    slug: 'mean-citation-position-0-1-0',
    category: 'position',
    direction: 'lower',
    unit: 'position',
    aggregationMethod: 'mean',
    roundingPrecision: 2,
    validRange: {
      minimum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula: 'MCP = Σ citationPosition_i / N_cited_with_position',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.cited',
        required: true,
        descriptionEn:
          'Only observations with a confirmed target citation are eligible.',
        descriptionEs:
          'Solo son elegibles las observaciones con una cita confirmada del objetivo.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.citationPosition',
        required: true,
        descriptionEn:
          'One-based visible order of the evaluated target citation in the answer or source interface.',
        descriptionEs:
          'Orden visible, basado en uno, de la cita del objetivo evaluado en la respuesta o interfaz de fuentes.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn: 'Only accepted observations contribute to the mean.',
        descriptionEs: 'Solo las observaciones aceptadas forman parte de la media.',
      },
    ],
    en: {
      title: 'Mean Citation Position',
      description:
        'Arithmetic mean of the visible citation position assigned to the evaluated target across valid cited executions.',
      interpretation:
        'Lower values indicate that the target tends to appear earlier in the visible citation order. MCP is conditional on the target being cited and must be reported together with the number of cited observations.',
      pseudocode:
        'Select accepted observations where the target is cited and citationPosition is present. Sum the one-based positions and divide by the number of eligible cited observations. If no eligible citation exists, report the metric as not estimable rather than zero.',
      assumptions:
        'Citation position is one-based and coded consistently from the same visible interface convention. Each eligible execution contributes one target position.',
      limitations:
        'MCP excludes non-cited executions and can therefore look favourable when citations are rare. Position does not necessarily represent prominence, influence or source quality.',
      validationProcedure:
        'Verify every included citation against preserved evidence, confirm one-based ordering, independently recompute the arithmetic mean, and report the eligible citation count alongside the value.',
    },
    es: {
      title: 'Posición media de citación',
      description:
        'Media aritmética de la posición visible de la cita asignada al objetivo evaluado en las ejecuciones válidas donde fue citado.',
      interpretation:
        'Los valores más bajos indican que el objetivo tiende a aparecer antes en el orden visible de citas. MCP está condicionada a que exista citación y debe informarse junto con el número de observaciones citadas.',
      pseudocode:
        'Seleccionar observaciones aceptadas donde el objetivo esté citado y citationPosition esté informado. Sumar las posiciones basadas en uno y dividir entre el número de observaciones citadas elegibles. Si no existe ninguna cita elegible, informar la métrica como no estimable y no como cero.',
      assumptions:
        'La posición de citación se codifica desde uno y siguiendo la misma convención de interfaz visible. Cada ejecución elegible aporta una posición del objetivo.',
      limitations:
        'MCP excluye las ejecuciones sin cita y puede parecer favorable cuando las citas son escasas. La posición no equivale necesariamente a prominencia, influencia o calidad de la fuente.',
      validationProcedure:
        'Verificar cada cita incluida mediante la evidencia preservada, confirmar el orden basado en uno, recalcular de forma independiente la media aritmética e informar el número de citas elegibles junto con el valor.',
    },
  },
  {
    definitionCode: 'GSL-MDEF-RCR-0001',
    metricCode: 'RCR',
    slug: 'response-consistency-rate-0-1-0',
    category: 'consistency',
    direction: 'higher',
    unit: 'proportion',
    aggregationMethod: 'ratio',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula:
      'RCR = Σ I(variationLevel_i ∈ {none, low}) / N_assessed_comparisons',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'comparison.baselineObservation',
        required: true,
        descriptionEn:
          'Frozen baseline observation used consistently across the experimental condition.',
        descriptionEs:
          'Observación base congelada utilizada de forma consistente en toda la condición experimental.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'comparison.variationLevel',
        required: true,
        descriptionEn:
          'Protocol-coded variation level relative to the baseline observation.',
        descriptionEs:
          'Nivel de variación codificado según el protocolo respecto a la observación base.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn:
          'Only accepted, assessed comparisons contribute to the metric.',
        descriptionEs:
          'Solo las comparaciones aceptadas y evaluadas forman parte de la métrica.',
      },
    ],
    en: {
      title: 'Response Consistency Rate',
      description:
        'Proportion of valid assessed repetition comparisons classified as having no meaningful variation or low variation relative to the frozen baseline response.',
      interpretation:
        'Higher values indicate greater response stability across repeated executions of the same controlled condition. RCR reflects the protocol-defined variation threshold and does not imply factual correctness or identical wording.',
      pseudocode:
        'Choose and freeze one valid baseline observation. For each other accepted repetition, code variationLevel relative to that baseline. Exclude not-assessed comparisons. Count comparisons coded none or low and divide by all assessed comparisons.',
      numeratorDefinition:
        'Number of valid assessed comparisons whose variationLevel is none or low.',
      denominatorDefinition:
        'Total number of valid accepted non-baseline observations with an assessed variationLevel other than not-assessed.',
      assumptions:
        'The same baseline and comparison codebook are used for all repetitions in the condition. Low variation is defined in the protocol before review.',
      limitations:
        'RCR depends on the selected baseline and human coding threshold. It summarizes stability but does not identify which claims, citations or themes changed.',
      validationProcedure:
        'Confirm the frozen baseline, audit every comparison classification, exclude not-assessed records, independently recount consistent and assessed comparisons, and compare the recomputed ratio with the stored result.',
    },
    es: {
      title: 'Tasa de consistencia de la respuesta',
      description:
        'Proporción de comparaciones válidas entre repeticiones clasificadas con variación no significativa o baja respecto a una respuesta base congelada.',
      interpretation:
        'Los valores más altos indican una mayor estabilidad de las respuestas en ejecuciones repetidas de la misma condición controlada. RCR depende del umbral de variación definido por el protocolo y no implica exactitud factual ni redacción idéntica.',
      pseudocode:
        'Elegir y congelar una observación base válida. Para cada repetición aceptada restante, codificar variationLevel respecto a esa base. Excluir las comparaciones not-assessed. Contar las comparaciones none o low y dividir entre todas las comparaciones evaluadas.',
      numeratorDefinition:
        'Número de comparaciones válidas evaluadas cuyo variationLevel es none o low.',
      denominatorDefinition:
        'Número total de observaciones válidas y aceptadas distintas de la base con variationLevel evaluado y diferente de not-assessed.',
      assumptions:
        'Se utilizan la misma observación base y el mismo codebook de comparación en todas las repeticiones. La variación baja se define en el protocolo antes de la revisión.',
      limitations:
        'RCR depende de la base seleccionada y del umbral de codificación humana. Resume estabilidad, pero no identifica qué afirmaciones, citas o temas cambiaron.',
      validationProcedure:
        'Confirmar la observación base congelada, auditar cada clasificación, excluir los registros not-assessed, volver a contar de forma independiente las comparaciones consistentes y evaluadas, y comparar la proporción recalculada con el resultado almacenado.',
    },
  },
];

const getString = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const requireAdmin = (req: PayloadRequest) => {
  const user = req.user as { role?: unknown } | null | undefined;

  if (!user || user.role !== 'admin') {
    throw new Error('Only an administrator can generate or clean pilot metric definitions.');
  }
};

const findRequiredDocument = async ({
  payload,
  req,
  collection,
  field,
  value,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: ContextCollection;
  field: string;
  value: string;
}): Promise<DocumentWithID> => {
  const result = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 2,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  if (result.docs.length === 0) {
    throw new Error(`Required ${collection} record not found: ${field} = ${value}`);
  }

  if (result.docs.length > 1) {
    throw new Error(
      `Expected one ${collection} record but found ${result.docs.length}: ${field} = ${value}`,
    );
  }

  return result.docs[0] as DocumentWithID;
};

const findOptionalDocument = async ({
  payload,
  req,
  collection,
  field,
  value,
}: {
  payload: Payload;
  req: PayloadRequest;
  collection: ContextCollection;
  field: string;
  value: string;
}): Promise<DocumentWithID | null> => {
  const result = await payload.find({
    collection,
    where: { [field]: { equals: value } },
    limit: 1,
    depth: 0,
    pagination: false,
    draft: true,
    overrideAccess: true,
    req,
  });

  return result.docs.length > 0 ? (result.docs[0] as DocumentWithID) : null;
};

const rollbackCreatedDefinitions = async ({
  payload,
  req,
  records,
}: {
  payload: Payload;
  req: PayloadRequest;
  records: GeneratedRecord[];
}) => {
  for (const record of [...records].reverse()) {
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

export const generatePilotMetricDefinitionRecords = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<GeneratedRecord[]> => {
  requireAdmin(req);

  const [project, benchmark, researcher, researchArea, resource, software] =
    await Promise.all([
      findRequiredDocument({
        payload,
        req,
        collection: 'projects',
        field: 'projectCode',
        value: PILOT.projectCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'benchmarks',
        field: 'benchmarkCode',
        value: PILOT.benchmarkCode,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'researchers',
        field: 'slug',
        value: PILOT.researcherSlug,
      }),
      findRequiredDocument({
        payload,
        req,
        collection: 'research-areas',
        field: 'code',
        value: PILOT.researchAreaCode,
      }),
      findOptionalDocument({
        payload,
        req,
        collection: 'resources',
        field: 'slug',
        value: PILOT.resourceSlug,
      }),
      findOptionalDocument({
        payload,
        req,
        collection: 'software',
        field: 'slug',
        value: PILOT.softwareSlug,
      }),
    ]);

  for (const metric of METRICS) {
    const existing = await payload.find({
      collection: 'metric-definitions',
      where: {
        or: [
          { definitionCode: { equals: metric.definitionCode } },
          {
            and: [
              { metricCode: { equals: metric.metricCode } },
              { version: { equals: PILOT.version } },
            ],
          },
        ],
      },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (existing.docs.length > 0) {
      throw new Error(
        `${metric.metricCode} ${PILOT.version} already exists. Remove the existing draft or create a new metric-definition version before generating this batch.`,
      );
    }
  }

  const createdRecords: GeneratedRecord[] = [];

  try {
    for (const metric of METRICS) {
      const sharedData = {
        slug: metric.slug,
        definitionCode: metric.definitionCode,
        metricCode: metric.metricCode,
        version: PILOT.version,
        lifecycleStatus: 'under-review' as const,
        category: metric.category,
        direction: metric.direction,
        unitOfAnalysis: 'experiment' as const,
        valueType: 'number' as const,
        unit: metric.unit,
        formula: metric.formula,
        aggregationMethod: metric.aggregationMethod,
        missingDataPolicy: 'exclude' as const,
        roundingPrecision: metric.roundingPrecision,
        validRange: metric.validRange,
        project: project.id,
        benchmarks: [benchmark.id],
        researchAreas: [researchArea.id],
        researchers: [researcher.id],
        resources: resource ? [resource.id] : [],
        software: software ? [software.id] : [],
        openMethodology: true,
        featured: true,
        _status: 'draft' as const,
      };

      const created = await payload.create({
        collection: 'metric-definitions',
        locale: 'en',
        fallbackLocale: false,
        draft: true,
        overrideAccess: true,
        req,
        data: {
          ...sharedData,
          ...metric.en,
          requiredInputs: metric.requiredInputs.map((input) => ({
            sourceCollection: input.sourceCollection,
            fieldName: input.fieldName,
            required: input.required,
            description: input.descriptionEn,
          })),
        },
      });

      createdRecords.push({
        collectionSlug: 'metric-definitions',
        recordId: String(created.id),
        recordCode: metric.definitionCode,
        label: `${metric.metricCode} ${PILOT.version} metric definition`,
      });

      await payload.update({
        collection: 'metric-definitions',
        id: created.id,
        locale: 'es',
        fallbackLocale: false,
        draft: true,
        overrideAccess: true,
        req,
        data: {
          title: metric.es.title,
          description: metric.es.description,
          interpretation: metric.es.interpretation,
          pseudocode: metric.es.pseudocode,
          numeratorDefinition: metric.es.numeratorDefinition,
          denominatorDefinition: metric.es.denominatorDefinition,
          assumptions: metric.es.assumptions,
          limitations: metric.es.limitations,
          validationProcedure: metric.es.validationProcedure,
          requiredInputs: metric.requiredInputs.map((input) => ({
            sourceCollection: input.sourceCollection,
            fieldName: input.fieldName,
            required: input.required,
            description: input.descriptionEs,
          })),
          _status: 'draft',
        },
      });
    }

    return createdRecords;
  } catch (error) {
    await rollbackCreatedDefinitions({ payload, req, records: createdRecords });
    throw error;
  }
};

const normalizeMetricDefinitionRecords = (value: unknown): GeneratedRecord[] => {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const record = item as Record<string, unknown>;
    const collectionSlug = getString(record.collectionSlug);
    const recordId = getString(record.recordId);
    const recordCode = getString(record.recordCode);
    const label = getString(record.label);

    if (
      collectionSlug !== 'metric-definitions' ||
      !recordId ||
      !recordCode ||
      !label
    ) {
      return [];
    }

    return [{ collectionSlug, recordId, recordCode, label }];
  });
};

export const cleanupPilotMetricDefinitionBatch: CollectionBeforeDeleteHook = async ({
  id,
  req,
}) => {
  requireAdmin(req);

  const batch = (await req.payload.findByID({
    collection: 'test-data-batches',
    id,
    depth: 0,
    overrideAccess: true,
    req,
  })) as BatchDocument;

  if (getString(batch.scenario) !== 'pilot-metric-definitions') return;

  const records = normalizeMetricDefinitionRecords(batch.records);
  let deleted = 0;
  let preserved = 0;

  for (const record of [...records].reverse()) {
    const existing = await req.payload.find({
      collection: 'metric-definitions',
      where: { id: { equals: record.recordId } },
      limit: 1,
      depth: 0,
      pagination: false,
      draft: true,
      overrideAccess: true,
      req,
    });

    if (existing.docs.length === 0) continue;

    const document = existing.docs[0] as DocumentWithID;
    const currentCode = getString(document.definitionCode);

    if (currentCode !== record.recordCode) {
      throw new Error(
        `Cleanup refused for metric definition ${record.recordId}: its definitionCode no longer matches the tracked record.`,
      );
    }

    const lifecycleStatus = getString(document.lifecycleStatus);
    const editorialStatus = getString(document._status);

    if (lifecycleStatus !== 'under-review' || editorialStatus !== 'draft') {
      preserved += 1;
      req.payload.logger.info(
        `Metric definition ${record.recordCode} was preserved because it has been promoted beyond Under review / Draft.`,
      );
      continue;
    }

    await req.payload.delete({
      collection: 'metric-definitions',
      id: record.recordId,
      overrideAccess: true,
      req,
    });
    deleted += 1;
  }

  req.payload.logger.info(
    `Pilot metric-definition batch removed ${deleted} review drafts and preserved ${preserved} promoted definitions.`,
  );
};
