# AIR v0.1.0 — Ficha de actualización en Payload

**Registro:** `GSL-MDEF-AIR-0001`  
**Estado que debe conservarse:** `Under review`  
**Objetivo:** alinear el registro de producción con la revisión científica y el codebook operativo.

## Cambios obligatorios

### Fórmula

```text
AIR = (Σ M_i) / |E|, para i ∈ E

M_i = 1 si el objetivo evaluado aparece visiblemente en el cuerpo de la respuesta
M_i = 0 si no aparece
E = conjunto congelado de ejecuciones elegibles
```

### Configuración

```text
Category: Visibility
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
Proporción de ejecuciones controladas elegibles en las que un objetivo evaluado y definido previamente aparece de forma visible en el cuerpo de la respuesta generada.
```

### Interpretación ES

```text
Los valores más altos indican que el objetivo aparece en una mayor proporción de respuestas elegibles bajo la condición exacta evaluada. AIR mide únicamente presencia en el cuerpo de la respuesta; no implica citación, recomendación, prominencia, exactitud, influencia ni sentimiento positivo. Debe informarse junto con el numerador, el denominador y las exclusiones.
```

### Pseudocódigo ES

```text
Congelar el conjunto de ejecuciones elegibles y el diccionario del objetivo. Obtener exactamente una observación response-level aceptada por ejecución. Asignar M_i = 1 cuando el objetivo aparezca visiblemente en el cuerpo de la respuesta mediante una coincidencia predefinida e inequívoca; en caso contrario asignar M_i = 0. Sumar los valores y dividir entre el número de ejecuciones elegibles. Informar por separado los casos excluidos o no codificables.
```

### Numerador ES

```text
Número de ejecuciones elegibles cuya observación aceptada tiene visibilityCoding.mentioned = true para el objetivo evaluado.
```

### Denominador ES

```text
Número total de ejecuciones elegibles con una respuesta observable y exactamente una observación response-level aceptada. Las ejecuciones válidas sin mención permanecen en el denominador con valor cero.
```

### Supuestos ES

```text
La identidad del objetivo, sus alias y las reglas de coincidencia se congelan antes de codificar. Cada ejecución elegible aporta exactamente un resultado binario. Las repeticiones utilizan el mismo protocolo y los revisores disponen de evidencia preservada suficiente.
```

### Limitaciones ES

```text
AIR reduce la inclusión a un resultado binario y no mide posición, prominencia, contribución semántica, citación, recomendación, exactitud ni calidad. Con cinco ejecuciones solo puede variar en incrementos de 0,20, por lo que deben publicarse los recuentos originales y evitar afirmaciones generales de estabilidad. La estimación puede variar entre ejecuciones, fechas, sistemas, cuentas, ubicaciones, idiomas y versiones de interfaz.
```

### Validación ES

```text
Congelar la muestra y el diccionario del objetivo; verificar el protocolo y una observación aceptada por ejecución; realizar dos revisiones independientes; resolver desacuerdos con la evidencia preservada; registrar acuerdo y exclusiones; recontar numerador y denominador; recalcular AIR de forma independiente; comparar con el Metric Result almacenado; e informar recuentos, objetivo, prompt, sistema, fechas y redondeo.
```

## Inputs requeridos

| Source collection | Field name | Required |
| --- | --- | ---: |
| Observations | `visibilityCoding.targetType` | Sí |
| Observations | `visibilityCoding.targetValue` | Sí |
| Observations | `visibilityCoding.mentioned` | Sí |
| Observations | `qualityControl.reviewStatus` | Sí |
| Observations | `responseAssessment.errorObserved` | Sí |
| Prompt Executions | `lifecycleStatus` | Sí |

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

Mantener también `Validated At` vacío y no completar `Validated By` hasta aprobar formalmente la definición y el codebook.

## Documentos de referencia

- [`AIR_v0.1.0_REVIEW_ES.md`](./AIR_v0.1.0_REVIEW_ES.md)
- [`AIR_INCLUSION_CODEBOOK_ES.md`](../codebooks/AIR_INCLUSION_CODEBOOK_ES.md)
