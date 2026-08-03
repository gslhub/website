# CR v0.1.0 — Ficha de actualización en Payload

**Registro:** `GSL-MDEF-CR-0001`  
**Estado que debe conservarse:** `Under review`  
**Objetivo:** alinear el registro de producción con la revisión científica y el codebook operativo.

## Cambios obligatorios

### Fórmula

```text
CR = (Σ C_i) / |E|, para i ∈ E

C_i = 1 si existe al menos una Citation aceptada que coincide con el objetivo evaluado
C_i = 0 si no existe ninguna Citation aceptada del objetivo
E = conjunto congelado de ejecuciones elegibles
```

### Configuración

```text
Category: Citation
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

### Descripción ES

```text
Proporción de ejecuciones controladas elegibles en las que el objetivo evaluado aparece presentado explícitamente por el sistema como fuente, referencia o destino enlazado.
```

### Interpretación ES

```text
Los valores más altos indican que el sistema atribuyó o presentó al objetivo como fuente en una mayor proporción de ejecuciones elegibles bajo la condición exacta estudiada. CR mide frecuencia de atribución visible; no demuestra respaldo de afirmaciones, exactitud, autoridad, prominencia, posición favorable, influencia causal, recomendación ni mención en el cuerpo. Debe informarse junto con numerador, denominador, exclusiones y tipos de cita observados.
```

### Pseudocódigo ES

```text
Congelar el conjunto de ejecuciones elegibles y el diccionario de identidad del objetivo. Revisar la respuesta y todas las superficies de fuentes preservadas. Extraer una Citation por cada fuente visible diferenciable. Para cada ejecución, asignar C_i = 1 cuando exista al menos una Citation aceptada con targetCoding.isEvaluatedTarget = true; en caso contrario asignar C_i = 0. Las múltiples citas del objetivo dentro de la misma ejecución cuentan una sola vez para el numerador. Dividir el número de ejecuciones positivas entre el número de ejecuciones elegibles e informar por separado exclusiones y casos no codificables.
```

### Numerador ES

```text
Número de ejecuciones elegibles con al menos una Citation aceptada, respaldada por evidencia preservada y codificada como targetCoding.isEvaluatedTarget = true.
```

### Denominador ES

```text
Número total de ejecuciones elegibles con una Observation response-level aceptada y evidencia suficiente para determinar la presencia o ausencia de citas visibles. Las ejecuciones válidas sin citas del objetivo permanecen en el denominador con valor cero.
```

### Supuestos ES

```text
La identidad del objetivo, sus dominios, alias, redirecciones y reglas de normalización se congelan antes de codificar. Cada ejecución elegible aporta un único resultado binario. Todas las superficies de fuentes exigidas por el protocolo se preservan y revisan. Las múltiples citas del objetivo dentro de una ejecución no duplican el numerador.
```

### Limitaciones ES

```text
CR reduce toda la actividad de citación de una ejecución a un resultado binario y no mide número de citas, posición, prominencia, función, respaldo, autoridad ni calidad. Las interfaces dinámicas pueden ocultar fuentes y la observabilidad depende de una captura completa. Las URLs pueden cambiar después de la ejecución. Con cinco ejecuciones, CR solo varía en incrementos de 0,20, por lo que deben publicarse los recuentos originales y evitar afirmaciones generales de estabilidad.
```

### Validación ES

```text
Congelar la muestra y el diccionario del objetivo; verificar el protocolo y una Observation aceptada por ejecución; revisar todas las superficies de fuentes; extraer y revisar independientemente cada Citation; resolver coincidencias ambiguas mediante evidencia; comprobar la concordancia entre visibilityCoding.cited y las Citations aceptadas; reducir cada ejecución a un resultado binario; recontar numerador y denominador; recalcular CR de forma independiente; comparar con el Metric Result almacenado; e informar recuentos, tipos de cita, objetivo, exclusiones, prompt, sistema, fechas y redondeo.
```

## Inputs requeridos

| Source collection | Field name | Required |
| --- | --- | ---: |
| Prompt Executions | `lifecycleStatus` | Sí |
| Observations | `qualityControl.reviewStatus` | Sí |
| Observations | `visibilityCoding.cited` | Sí |
| Citations | `promptExecution` | Sí |
| Citations | `citationType` | Sí |
| Citations | `targetCoding.isEvaluatedTarget` | Sí |
| Citations | `targetCoding.targetMatchType` | Sí |
| Citations | `qualityControl.reviewStatus` | Sí |
| Citations | `sourceDomain` | Sí |
| Citations | `evidence` | Recomendado |

`verification.supportsClaim` debe conservarse como input opcional de auditoría, no como requisito para que una cita cuente en CR.

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

Mantener `Validated At` vacío y no completar `Validated By` hasta aprobar formalmente la definición y el codebook.

## Documentos de referencia

- [`CR_v0.1.0_REVIEW_ES.md`](./CR_v0.1.0_REVIEW_ES.md)
- [`CR_CITATION_CODEBOOK_ES.md`](../codebooks/CR_CITATION_CODEBOOK_ES.md)
