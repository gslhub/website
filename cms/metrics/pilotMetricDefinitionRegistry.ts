export type PilotMetricLocaleText = {
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

export type PilotMetricRequiredInput = {
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

export type PilotMetricDefinitionSeed = {
  definitionCode: string;
  metricCode: 'AIR' | 'CR' | 'MCP' | 'RCR';
  slug: string;
  category: 'visibility' | 'citation' | 'position' | 'consistency';
  direction: 'higher' | 'lower';
  unit: 'proportion' | 'position';
  aggregationMethod: 'ratio' | 'mean';
  missingDataPolicy: 'report-separately';
  roundingPrecision: number;
  validRange: {
    minimum: number;
    maximum?: number;
    minimumInclusive: boolean;
    maximumInclusive: boolean;
  };
  formula: string;
  requiredInputs: PilotMetricRequiredInput[];
  en: PilotMetricLocaleText;
  es: PilotMetricLocaleText;
};

export const PILOT_METRIC_CONTEXT = {
  projectCode: 'GSL-GEO-BENCH-01',
  benchmarkCode: 'GSL-BENCH-GEO-01',
  researcherSlug: 'eduardo-yauri',
  researchAreaCode: 'GEO',
  resourceSlug:
    'gslhub-generative-search-visibility-benchmark-research-protocol',
  softwareSlug: 'gslhub-generative-search-benchmark-toolkit',
  version: '0.1.0',
} as const;

export const PILOT_METRIC_DEFINITIONS: PilotMetricDefinitionSeed[] = [
  {
    definitionCode: 'GSL-MDEF-AIR-0001',
    metricCode: 'AIR',
    slug: 'answer-inclusion-rate-0-1-0',
    category: 'visibility',
    direction: 'higher',
    unit: 'proportion',
    aggregationMethod: 'ratio',
    missingDataPolicy: 'report-separately',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula:
      'AIR = (Σ M_i) / |E|, where M_i = 1 when the evaluated target is visibly present in the response body and 0 otherwise',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.targetType',
        required: true,
        descriptionEn: 'Predefined class of the evaluated target.',
        descriptionEs: 'Clase predefinida del objetivo evaluado.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.targetValue',
        required: true,
        descriptionEn:
          'Frozen canonical value used with the approved target-matching dictionary.',
        descriptionEs:
          'Valor canónico congelado utilizado con el diccionario aprobado de coincidencia del objetivo.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.mentioned',
        required: true,
        descriptionEn:
          'Binary outcome indicating visible presence in the generated response body.',
        descriptionEs:
          'Resultado binario que indica presencia visible en el cuerpo de la respuesta generada.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn:
          'Only accepted response-level observations enter the analytical denominator.',
        descriptionEs:
          'Solo las observaciones de nivel respuesta aceptadas entran en el denominador analítico.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'responseAssessment.errorObserved',
        required: true,
        descriptionEn:
          'Supports the documented distinction between a valid negative outcome and a non-codable technical failure.',
        descriptionEs:
          'Permite distinguir de forma documentada entre un resultado negativo válido y un fallo técnico no codificable.',
      },
      {
        sourceCollection: 'prompt-executions',
        fieldName: 'lifecycleStatus',
        required: true,
        descriptionEn:
          'The associated execution must be completed and eligible under the frozen protocol.',
        descriptionEs:
          'La ejecución asociada debe estar completada y ser elegible según el protocolo congelado.',
      },
    ],
    en: {
      title: 'Answer Inclusion Rate',
      description:
        'Proportion of eligible controlled executions in which a predefined evaluated target appears visibly in the generated response body.',
      interpretation:
        'Higher values indicate that the target appears in a larger proportion of eligible responses under the exact evaluated condition. AIR measures presence in the response body only; it does not imply citation, recommendation, prominence, accuracy, influence or positive sentiment. Report the numerator, denominator and exclusions with the value.',
      pseudocode:
        'Freeze the eligible execution set and target dictionary. Resolve exactly one accepted response-level observation per execution. Assign M_i = 1 when the target appears visibly in the response body through a predefined unambiguous match; otherwise assign M_i = 0. Sum M_i and divide by the eligible execution count. Report excluded or non-codable cases separately.',
      numeratorDefinition:
        'Number of eligible executions whose accepted observation has visibilityCoding.mentioned = true for the evaluated target.',
      denominatorDefinition:
        'Total number of eligible executions with an observable response and exactly one accepted response-level observation. Valid executions without a mention remain in the denominator with value zero.',
      assumptions:
        'Target identity, aliases and matching rules are frozen before coding. Each eligible execution contributes exactly one binary outcome. Repetitions use the same protocol and reviewers have sufficient preserved evidence.',
      limitations:
        'AIR reduces inclusion to a binary outcome and does not measure position, prominence, semantic contribution, citation, recommendation, accuracy or quality. With five executions it changes only in increments of 0.20 and may vary across dates, systems, accounts, locations, languages and interface versions.',
      validationProcedure:
        'Freeze the sample and target dictionary; verify protocol compliance and one accepted observation per execution; perform two independent reviews; adjudicate disagreements from preserved evidence; record agreement and exclusions; independently recount numerator and denominator; recompute AIR; and compare it with the stored Metric Result and checksums.',
    },
    es: {
      title: 'Tasa de inclusión en la respuesta',
      description:
        'Proporción de ejecuciones controladas elegibles en las que un objetivo evaluado y definido previamente aparece de forma visible en el cuerpo de la respuesta generada.',
      interpretation:
        'Los valores más altos indican que el objetivo aparece en una mayor proporción de respuestas elegibles bajo la condición exacta evaluada. AIR mide únicamente presencia en el cuerpo de la respuesta; no implica citación, recomendación, prominencia, exactitud, influencia ni sentimiento positivo. Debe informarse junto con el numerador, el denominador y las exclusiones.',
      pseudocode:
        'Congelar el conjunto de ejecuciones elegibles y el diccionario del objetivo. Obtener exactamente una observación response-level aceptada por ejecución. Asignar M_i = 1 cuando el objetivo aparezca visiblemente en el cuerpo de la respuesta mediante una coincidencia predefinida e inequívoca; en caso contrario asignar M_i = 0. Sumar los valores y dividir entre el número de ejecuciones elegibles. Informar por separado los casos excluidos o no codificables.',
      numeratorDefinition:
        'Número de ejecuciones elegibles cuya observación aceptada tiene visibilityCoding.mentioned = true para el objetivo evaluado.',
      denominatorDefinition:
        'Número total de ejecuciones elegibles con una respuesta observable y exactamente una observación response-level aceptada. Las ejecuciones válidas sin mención permanecen en el denominador con valor cero.',
      assumptions:
        'La identidad del objetivo, sus alias y las reglas de coincidencia se congelan antes de codificar. Cada ejecución elegible aporta exactamente un resultado binario. Las repeticiones utilizan el mismo protocolo y los revisores disponen de evidencia preservada suficiente.',
      limitations:
        'AIR reduce la inclusión a un resultado binario y no mide posición, prominencia, contribución semántica, citación, recomendación, exactitud ni calidad. Con cinco ejecuciones solo puede variar en incrementos de 0,20 y puede cambiar entre fechas, sistemas, cuentas, ubicaciones, idiomas y versiones de interfaz.',
      validationProcedure:
        'Congelar la muestra y el diccionario del objetivo; verificar el protocolo y una observación aceptada por ejecución; realizar dos revisiones independientes; resolver desacuerdos con la evidencia preservada; registrar acuerdo y exclusiones; recontar numerador y denominador; recalcular AIR; y comparar con el Metric Result y los checksums almacenados.',
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
    missingDataPolicy: 'report-separately',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula:
      'CR = (Σ C_i) / |E|, where C_i = 1 when at least one accepted visible citation matches the evaluated target and 0 otherwise',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.cited',
        required: true,
        descriptionEn:
          'Execution-level binary coding that must agree with accepted target Citation records.',
        descriptionEs:
          'Codificación binaria por ejecución que debe coincidir con los registros Citation aceptados del objetivo.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn:
          'Only accepted response-level observations enter the denominator.',
        descriptionEs:
          'Solo las observaciones de nivel respuesta aceptadas entran en el denominador.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'promptExecution',
        required: true,
        descriptionEn: 'Associates every citation with one controlled execution.',
        descriptionEs: 'Asocia cada cita con una ejecución controlada.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'targetCoding.isEvaluatedTarget',
        required: true,
        descriptionEn:
          'Confirms that the visible source matches the evaluated target.',
        descriptionEs:
          'Confirma que la fuente visible coincide con el objetivo evaluado.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'targetCoding.targetMatchType',
        required: true,
        descriptionEn:
          'Records the predefined exact, domain, entity or semantic match rule.',
        descriptionEs:
          'Registra la regla predefinida de coincidencia exacta, de dominio, entidad o semántica.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn: 'Only accepted Citation records can support C_i = 1.',
        descriptionEs: 'Solo los registros Citation aceptados pueden sustentar C_i = 1.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'evidence',
        required: true,
        descriptionEn:
          'Preserved evidence makes the visible attribution and target match auditable.',
        descriptionEs:
          'La evidencia preservada permite auditar la atribución visible y la coincidencia del objetivo.',
      },
    ],
    en: {
      title: 'Citation Rate',
      description:
        'Proportion of eligible controlled executions in which the evaluated target is visibly presented by the system as a source, reference or linked destination.',
      interpretation:
        'Higher values indicate more frequent visible attribution to the evaluated target. CR does not establish claim support, factual correctness, authority, prominence, primary-source status or favourable treatment. Report execution-level counts and total accepted target citations.',
      pseudocode:
        'Freeze the eligible execution set and target identity rules. Review every required citation surface. Assign C_i = 1 when at least one accepted Citation linked to the execution visibly represents and validly matches the evaluated target; otherwise assign C_i = 0. Count each execution once, divide by all eligible executions and report exclusions separately.',
      numeratorDefinition:
        'Number of eligible executions containing at least one accepted visible Citation with targetCoding.isEvaluatedTarget = true for the evaluated target.',
      denominatorDefinition:
        'Total number of eligible executions whose response and required citation surfaces are observable. Valid executions with no target citation remain in the denominator with value zero.',
      assumptions:
        'Target identity, URL normalization and citation surfaces are frozen before coding. Each execution contributes at most one unit to the numerator. Positive observation coding is supported by auditable Citation records and evidence.',
      limitations:
        'CR measures citation occurrence, not citation quality, claim support, authority, position, prominence or the number of citations within an answer. Interfaces may expose citations differently across versions and devices.',
      validationProcedure:
        'Freeze target and surface rules; verify eligible executions; independently inspect all visible citation surfaces; audit accepted Citation records, normalized identity and evidence; reconcile observation-level cited coding; recount cited and uncited executions; recompute CR; and compare with the stored result and checksums.',
    },
    es: {
      title: 'Tasa de citación',
      description:
        'Proporción de ejecuciones controladas elegibles en las que el objetivo evaluado aparece presentado visiblemente por el sistema como fuente, referencia o destino enlazado.',
      interpretation:
        'Los valores más altos indican una atribución visible más frecuente al objetivo evaluado. CR no demuestra respaldo de afirmaciones, exactitud, autoridad, prominencia, condición de fuente primaria ni tratamiento favorable. Deben informarse los recuentos por ejecución y el total de citas aceptadas del objetivo.',
      pseudocode:
        'Congelar el conjunto de ejecuciones elegibles y las reglas de identidad del objetivo. Revisar todas las superficies de citación exigidas. Asignar C_i = 1 cuando al menos una Citation aceptada vinculada a la ejecución represente visiblemente y coincida válidamente con el objetivo; en caso contrario asignar C_i = 0. Contar cada ejecución una sola vez, dividir entre todas las ejecuciones elegibles e informar las exclusiones por separado.',
      numeratorDefinition:
        'Número de ejecuciones elegibles que contienen al menos una Citation visible y aceptada con targetCoding.isEvaluatedTarget = true para el objetivo evaluado.',
      denominatorDefinition:
        'Número total de ejecuciones elegibles cuya respuesta y superficies de citación requeridas son observables. Las ejecuciones válidas sin cita del objetivo permanecen en el denominador con valor cero.',
      assumptions:
        'La identidad del objetivo, la normalización de URL y las superficies de citación se congelan antes de codificar. Cada ejecución aporta como máximo una unidad al numerador. La codificación positiva de la observación está respaldada por Citations y evidencias auditables.',
      limitations:
        'CR mide aparición de citas, no calidad, respaldo, autoridad, posición, prominencia ni número de citas dentro de una respuesta. Las interfaces pueden mostrar las citas de forma diferente entre versiones y dispositivos.',
      validationProcedure:
        'Congelar reglas del objetivo y superficies; verificar ejecuciones elegibles; revisar independientemente todas las superficies visibles; auditar Citations aceptadas, identidad normalizada y evidencia; reconciliar el campo cited de la Observation; recontar ejecuciones citadas y no citadas; recalcular CR; y comparar con el resultado y los checksums almacenados.',
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
    missingDataPolicy: 'report-separately',
    roundingPrecision: 2,
    validRange: {
      minimum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula:
      'MCP = (Σ P_i) / |C_pos|, where P_i is the first accepted target-citation position in the frozen primary citation surface',
    requiredInputs: [
      {
        sourceCollection: 'citations',
        fieldName: 'promptExecution',
        required: true,
        descriptionEn: 'Groups target citations by controlled execution.',
        descriptionEs: 'Agrupa las citas del objetivo por ejecución controlada.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'citationPosition',
        required: true,
        descriptionEn: 'One-based visible position in the frozen primary surface.',
        descriptionEs:
          'Posición visible basada en uno dentro de la superficie primaria congelada.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'citationType',
        required: true,
        descriptionEn:
          'Identifies the citation representation used to enforce the primary-surface rule.',
        descriptionEs:
          'Identifica la representación de cita utilizada para aplicar la regla de superficie primaria.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'citationContext.location',
        required: true,
        descriptionEn: 'Confirms the visible interface location of the citation.',
        descriptionEs: 'Confirma la ubicación visible de la cita en la interfaz.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'targetCoding.isEvaluatedTarget',
        required: true,
        descriptionEn: 'Restricts positions to accepted citations of the target.',
        descriptionEs: 'Restringe las posiciones a citas aceptadas del objetivo.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'targetCoding.targetMatchType',
        required: true,
        descriptionEn: 'Documents the target identity match used for inclusion.',
        descriptionEs:
          'Documenta la coincidencia de identidad utilizada para incluir la cita.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn: 'Only accepted citations contribute positions.',
        descriptionEs: 'Solo las citas aceptadas aportan posiciones.',
      },
      {
        sourceCollection: 'citations',
        fieldName: 'evidence',
        required: true,
        descriptionEn: 'Preserved evidence supports audit of visible order.',
        descriptionEs: 'La evidencia preservada permite auditar el orden visible.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding.cited',
        required: true,
        descriptionEn: 'Provides consistency control with the CR coding.',
        descriptionEs: 'Proporciona control de consistencia con la codificación CR.',
      },
    ],
    en: {
      title: 'Mean Citation Position',
      description:
        'Arithmetic mean of the first valid visible citation position of the evaluated target across eligible cited executions with an observable position.',
      interpretation:
        'Lower values indicate that, when cited, the target tends to appear earlier in the frozen primary citation surface. MCP is conditional on citation and must be reported with CR, cited-execution counts, individual positions and the surface convention.',
      pseudocode:
        'Freeze one comparable primary citation surface and its one-based ordering rule. For each eligible cited execution, retain accepted target Citations in that surface, deduplicate repeated representations of the same visual element and select the earliest position P_i. Average P_i across executions with observable positions. If none remain, report MCP as not estimable.',
      assumptions:
        'The primary surface and ordering convention are frozen before the round. Visible order can be reconstructed from preserved evidence. Each execution contributes at most one earliest position and target identity rules are inherited from CR.',
      limitations:
        'MCP is conditional and can look favourable when citations are rare. Position does not establish prominence, influence, authority or claim support. Inline, card and panel positions are not automatically comparable, and small samples are sensitive to single positions.',
      validationProcedure:
        'Freeze the surface and order; verify CR eligibility; audit every accepted target Citation and its evidence; deduplicate repeated elements; select the earliest position per execution; perform independent position review; recount cited and position-observable executions; recompute the mean; and compare it with the stored result and checksums.',
    },
    es: {
      title: 'Posición media de citación',
      description:
        'Media aritmética de la primera posición visible válida de una cita del objetivo evaluado en las ejecuciones citadas elegibles cuya posición es observable.',
      interpretation:
        'Los valores más bajos indican que, cuando fue citado, el objetivo tendió a aparecer antes en la superficie primaria congelada. MCP está condicionada a la citación y debe informarse junto con CR, los recuentos de ejecuciones citadas, las posiciones individuales y la convención de superficie.',
      pseudocode:
        'Congelar una superficie primaria comparable y su regla de orden basada en uno. Para cada ejecución citada elegible, conservar las Citations aceptadas del objetivo en esa superficie, deduplicar representaciones repetidas del mismo elemento visual y seleccionar la posición más temprana P_i. Calcular la media entre ejecuciones con posición observable. Si no queda ninguna, informar MCP como no estimable.',
      assumptions:
        'La superficie primaria y la convención de orden se congelan antes de la ronda. El orden visible puede reconstruirse desde la evidencia preservada. Cada ejecución aporta como máximo una posición temprana y las reglas de identidad se heredan de CR.',
      limitations:
        'MCP es condicional y puede parecer favorable cuando las citas son escasas. La posición no demuestra prominencia, influencia, autoridad ni respaldo. Las posiciones inline, de tarjetas y de paneles no son automáticamente comparables y las muestras pequeñas son sensibles a una sola posición.',
      validationProcedure:
        'Congelar superficie y orden; verificar elegibilidad CR; auditar cada Citation aceptada y su evidencia; deduplicar elementos repetidos; seleccionar la posición más temprana por ejecución; realizar revisión independiente; recontar ejecuciones citadas y con posición; recalcular la media; y comparar con el resultado y los checksums almacenados.',
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
    missingDataPolicy: 'report-separately',
    roundingPrecision: 4,
    validRange: {
      minimum: 0,
      maximum: 1,
      minimumInclusive: true,
      maximumInclusive: true,
    },
    formula:
      'RCR = (Σ S_i) / |C|, where S_i = 1 for variationLevel none or low and 0 for medium or high',
    requiredInputs: [
      {
        sourceCollection: 'observations',
        fieldName: 'comparison.baselineObservation',
        required: true,
        descriptionEn: 'Identifies the single frozen baseline observation.',
        descriptionEs: 'Identifica la única observación base congelada.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'comparison.variationLevel',
        required: true,
        descriptionEn:
          'Stores none, low, medium or high according to the approved maximum-severity codebook.',
        descriptionEs:
          'Guarda none, low, medium o high según el codebook aprobado de severidad máxima.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'comparison.comparisonNotes',
        required: true,
        descriptionEn: 'Preserves the auditable rationale for the assigned level.',
        descriptionEs: 'Conserva la justificación auditable del nivel asignado.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'visibilityCoding',
        required: true,
        descriptionEn:
          'Supports comparison of target mention, citation, recommendation and strength outcomes.',
        descriptionEs:
          'Permite comparar resultados de mención, citación, recomendación y fuerza del objetivo.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'responseAssessment',
        required: true,
        descriptionEn:
          'Supports comparison of response mode, errors, refusals, completeness and language.',
        descriptionEs:
          'Permite comparar modo de respuesta, errores, negativas, completitud e idioma.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'citationAssessment',
        required: true,
        descriptionEn: 'Supports comparison of visible citation behaviour.',
        descriptionEs: 'Permite comparar el comportamiento visible de citación.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'semanticCoding',
        required: false,
        descriptionEn: 'Supports comparison of themes and substantive claims.',
        descriptionEs: 'Permite comparar temas y afirmaciones sustantivas.',
      },
      {
        sourceCollection: 'observations',
        fieldName: 'qualityControl.reviewStatus',
        required: true,
        descriptionEn: 'Only accepted assessed comparisons enter the denominator.',
        descriptionEs:
          'Solo las comparaciones evaluadas y aceptadas entran en el denominador.',
      },
      {
        sourceCollection: 'prompt-executions',
        fieldName: 'lifecycleStatus',
        required: true,
        descriptionEn: 'Requires completed comparable executions.',
        descriptionEs: 'Exige ejecuciones comparables completadas.',
      },
    ],
    en: {
      title: 'Response Consistency Rate',
      description:
        'Proportion of valid repetition comparisons with no substantive variation or low variation relative to one frozen baseline observation from the same experimental condition.',
      interpretation:
        'Higher values indicate that a larger proportion of repetitions remained within the none/low threshold relative to the frozen baseline. RCR measures stability, not factual accuracy, quality, usefulness, absence of bias or identical wording. Report the baseline, individual levels, numerator, denominator and exclusions.',
      pseudocode:
        'Freeze the experimental condition and select the first eligible execution by repetitionNumber as baseline. Keep the baseline observation as not-assessed and outside the denominator. For every other accepted observation, confirm the same baseline and compare target outcome, conclusion, claims, sources and response mode. Assign none, low, medium or high using the maximum severity observed. Count none and low in the numerator and divide by all assessed comparisons. Report not-assessed records and exclusions separately.',
      numeratorDefinition:
        'Number of valid accepted comparisons whose comparison.variationLevel is none or low relative to the single frozen baseline.',
      denominatorDefinition:
        'Total number of valid accepted non-baseline comparisons whose variationLevel is none, low, medium or high. The baseline, not-assessed records and exclusions are reported separately.',
      assumptions:
        'The baseline is selected by a prior rule and remains fixed. All executions share prompt, version, system, access, environment and target. Each execution contributes at most one accepted observation and levels are assigned with the same codebook from preserved evidence.',
      limitations:
        'RCR depends on the selected baseline and human coding thresholds. It summarizes stability but does not determine accuracy or identify every changed claim or source. A repeatedly incorrect response may receive a high RCR. With four comparisons the first pilot changes only in increments of 0.25.',
      validationProcedure:
        'Freeze condition and baseline rule; verify the baseline and one accepted observation per comparison; independently review target outcome, conclusion, claims, sources and response mode; apply maximum severity; justify each level; adjudicate disagreements; resolve or report not-assessed cases; recount levels; recompute RCR; and compare with the Metric Result, input checksum and output checksum.',
    },
    es: {
      title: 'Tasa de consistencia de la respuesta',
      description:
        'Proporción de comparaciones válidas entre repeticiones que presentan variación sustantiva nula o baja respecto a una observación base congelada de la misma condición experimental.',
      interpretation:
        'Los valores más altos indican que una mayor proporción de repeticiones permaneció dentro del umbral none/low respecto a la base congelada. RCR mide estabilidad, no exactitud factual, calidad, utilidad, ausencia de sesgo ni identidad textual. Debe informarse junto con la base, los niveles individuales, el numerador, el denominador y las exclusiones.',
      pseudocode:
        'Congelar la condición experimental y seleccionar la primera ejecución elegible por repetitionNumber como base. Conservar la Observation base como not-assessed y excluirla del denominador. Para cada Observation aceptada restante, confirmar que referencia la misma base y comparar resultado del objetivo, conclusión, afirmaciones, fuentes y modo de respuesta. Asignar none, low, medium o high utilizando la mayor severidad observada. Contar none y low en el numerador y dividir entre todas las comparaciones evaluadas. Informar por separado registros not-assessed y exclusiones.',
      numeratorDefinition:
        'Número de comparaciones válidas y aceptadas cuyo comparison.variationLevel es none o low respecto a la única Observation base congelada.',
      denominatorDefinition:
        'Número total de comparaciones válidas y aceptadas distintas de la base cuyo comparison.variationLevel es none, low, medium o high. La base, los registros not-assessed y las exclusiones se informan por separado.',
      assumptions:
        'La base se selecciona mediante una regla previa y permanece fija. Todas las ejecuciones comparten prompt, versión, sistema, acceso, entorno y objetivo. Cada ejecución aporta como máximo una Observation aceptada y los niveles se asignan con el mismo codebook desde evidencia preservada.',
      limitations:
        'RCR depende de la base elegida y de umbrales de codificación humana. Resume estabilidad, pero no determina exactitud ni identifica todas las afirmaciones o fuentes modificadas. Una respuesta errónea repetida puede obtener RCR alto. Con cuatro comparaciones el primer piloto cambia solo en incrementos de 0,25.',
      validationProcedure:
        'Congelar condición y regla de base; verificar la base y una Observation aceptada por comparación; revisar independientemente resultado, conclusión, afirmaciones, fuentes y modo; aplicar severidad máxima; justificar cada nivel; adjudicar desacuerdos; resolver o informar not-assessed; recontar niveles; recalcular RCR; y comparar con el Metric Result, inputChecksum y outputChecksum.',
    },
  },
];
