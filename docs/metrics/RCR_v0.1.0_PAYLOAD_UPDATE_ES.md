# RCR v0.1.0 — Ficha de actualización en Payload

**Registro:** `GSL-MDEF-RCR-0001`  
**Estado que debe conservarse:** `Under review`  
**Objetivo:** alinear el registro de producción con la revisión científica y el codebook operativo.

## Fórmula

```text
RCR = (Σ S_i) / |C|, para i ∈ C

S_i = 1 cuando comparison.variationLevel ∈ {none, low}
S_i = 0 cuando comparison.variationLevel ∈ {medium, high}
C = conjunto de comparaciones válidas respecto a una única base congelada
```

La Observation base se informa, pero no entra en el denominador. Si no existen comparaciones válidas, RCR es no estimable.

## Configuración

```text
Category: Consistency
Direction: Higher is better
Unit of Analysis: Experiment
Value Type: Number
Unit: Proportion
Aggregation Method: Ratio
Missing Data Policy: Report separately
Rounding Precision: 4
Minimum: 0 inclusive
Maximum: 1 inclusive
Open Methodology: true
Lifecycle Status: Under review
```

## Título ES

```text
Tasa de consistencia de la respuesta
```

## Descripción ES

```text
Proporción de comparaciones válidas entre repeticiones que presentan variación sustantiva nula o baja respecto a una observación base congelada de la misma condición experimental.
```

## Interpretación ES

```text
Los valores más altos indican que una mayor proporción de repeticiones permaneció dentro del umbral none/low respecto a la base congelada. RCR mide estabilidad bajo una condición controlada y no implica exactitud factual, calidad, utilidad, ausencia de sesgo ni identidad textual. Debe informarse junto con la base utilizada, los niveles individuales, el numerador, el denominador y las exclusiones.
```

## Pseudocódigo ES

```text
Congelar la condición experimental y seleccionar la primera ejecución elegible por repetitionNumber como base. Conservar la Observation base como not-assessed y excluirla del denominador. Para cada Observation aceptada restante, confirmar que referencia la misma base y comparar resultado del objetivo, conclusión, afirmaciones, fuentes y modo de respuesta. Asignar none, low, medium o high utilizando la mayor severidad observada. Contar none y low en el numerador y dividir entre todas las comparaciones evaluadas. Informar por separado registros not-assessed y exclusiones.
```

## Numerador ES

```text
Número de comparaciones válidas y aceptadas cuyo comparison.variationLevel es none o low respecto a la única Observation base congelada.
```

## Denominador ES

```text
Número total de comparaciones válidas y aceptadas distintas de la base cuyo comparison.variationLevel es none, low, medium o high. La Observation base, los registros not-assessed y las exclusiones no entran en el denominador y se informan por separado.
```

## Supuestos ES

```text
La base se selecciona mediante una regla previa y permanece fija para toda la condición. Todas las ejecuciones comparten prompt, versión, sistema, acceso, entorno y objetivo. Cada ejecución aporta como máximo una Observation aceptada. Los niveles se asignan mediante el mismo codebook, con evidencia preservada suficiente y sin consultar el valor final de RCR.
```

## Limitaciones ES

```text
RCR depende de la base elegida y de umbrales de codificación humana. Resume estabilidad, pero no determina exactitud ni identifica por sí sola qué afirmaciones, fuentes o resultados cambiaron. Una respuesta errónea repetida puede obtener RCR alto. Con una base y cuatro comparaciones, el primer piloto solo produce incrementos de 0,25, por lo que deben informarse todos los niveles y recuentos originales.
```

## Validación ES

```text
Congelar la condición y la regla de base; verificar la Observation base y una Observation aceptada por comparación; revisar de forma independiente resultado del objetivo, conclusión, afirmaciones, fuentes y modo de respuesta; aplicar la severidad máxima; justificar cada nivel; realizar una segunda codificación y adjudicar desacuerdos; resolver o excluir not-assessed; recontar none, low, medium y high; recalcular RCR; comparar con el Metric Result, inputChecksum y outputChecksum; e informar base, niveles, exclusiones, condiciones y fechas.
```

## Inputs requeridos

| Source collection | Field name | Required |
| --- | --- | ---: |
| Observations | `comparison.baselineObservation` | Sí |
| Observations | `comparison.variationLevel` | Sí |
| Observations | `comparison.comparisonNotes` | Sí |
| Observations | `visibilityCoding.mentioned` | Sí |
| Observations | `visibilityCoding.cited` | Sí |
| Observations | `visibilityCoding.recommended` | Sí |
| Observations | `visibilityCoding.recommendationStrength` | Sí |
| Observations | `responseAssessment.relevanceLevel` | Sí |
| Observations | `responseAssessment.completeness` | Sí |
| Observations | `responseAssessment.refusalObserved` | Sí |
| Observations | `responseAssessment.errorObserved` | Sí |
| Observations | `citationAssessment` | Sí |
| Observations | `sourceObservations` | Recomendado |
| Observations | `semanticCoding` | Recomendado |
| Observations | `qualityControl.reviewStatus` | Sí |
| Prompt Executions | `lifecycleStatus` | Sí |

## Regla de clasificación que debe conservarse

```text
none   → consistente
low    → consistente
medium → inconsistente
high   → inconsistente
```

El nivel final utiliza la mayor severidad observada entre las dimensiones comparadas.

## Regla de base recomendada

```text
Primera ejecución elegible ordenada por repetitionNumber
```

Para el piloto inicial se prevé utilizar `GSL-EXEC-GEO-0001`, siempre que supere los controles de elegibilidad y evidencia.

## Campos que no deben modificarse

```text
definitionCode
metricCode
slug
version
project
benchmarks
researchAreas
researchers
resources
software
```

Mantener `Validated At` vacío y no completar `Validated By` hasta aprobar formalmente la definición, el codebook y la regla de base.

## Documentos de referencia

- [`RCR_v0.1.0_REVIEW_ES.md`](./RCR_v0.1.0_REVIEW_ES.md)
- [`RCR_RESPONSE_VARIATION_CODEBOOK_ES.md`](../codebooks/RCR_RESPONSE_VARIATION_CODEBOOK_ES.md)
