# MCP v0.1.0 — Ficha de actualización en Payload

**Registro:** `GSL-MDEF-MCP-0001`  
**Estado que debe conservarse:** `Under review`  
**Objetivo:** alinear el registro de producción con la revisión científica y el codebook operativo.

## Fórmula

```text
MCP = (Σ P_i) / |C_pos|, para i ∈ C_pos

P_i = posición basada en uno de la primera cita válida del objetivo
C_pos = ejecuciones elegibles con cita aceptada y posición observable
```

Si `|C_pos| = 0`, el resultado es **no estimable**, nunca cero.

## Configuración

```text
Category: Position
Direction: Lower is better
Unit of Analysis: Experiment
Value Type: Number
Unit: Position
Aggregation Method: Mean
Missing Data Policy: Report separately
Rounding Precision: 2
Minimum: 1 inclusive
Maximum: vacío
Open Methodology: true
Lifecycle Status: Under review
```

## Descripción ES

```text
Media aritmética de la posición visible, basada en uno, de la primera cita válida del objetivo evaluado entre las ejecuciones elegibles donde el objetivo fue citado y la posición pudo observarse dentro de una superficie de citación previamente congelada.
```

## Interpretación ES

```text
Los valores más bajos indican que, cuando el objetivo fue citado, su primera cita tendió a aparecer antes dentro de la superficie primaria definida. MCP está condicionada a la citación y debe informarse junto con CR, el número de ejecuciones citadas, el número con posición observable y las posiciones individuales. No mide frecuencia de citación, respaldo, autoridad, calidad ni influencia.
```

## Pseudocódigo ES

```text
Congelar la superficie primaria y la convención de orden. Para cada ejecución incluida, obtener las Citations aceptadas del objetivo que pertenezcan a esa superficie. Deduplicar representaciones repetidas del mismo elemento visible. Si no existe ninguna cita del objetivo, marcar la ejecución como no aplicable para MCP. Si existe una o más, seleccionar la posición válida más temprana. Excluir del denominador y reportar por separado las citas cuya posición no pueda observarse. Sumar una posición por ejecución y dividir entre el número de ejecuciones citadas con posición observable. Si dicho número es cero, informar MCP como no estimable.
```

## Numerador ES

```text
Suma de las posiciones más tempranas, basadas en uno, de la primera cita válida del objetivo en cada ejecución incluida en C_pos.
```

## Denominador ES

```text
Número de ejecuciones elegibles en las que existe al menos una cita aceptada del objetivo dentro de la superficie primaria y su posición es observable. Las ejecuciones sin cita son estructuralmente no aplicables; las citadas sin posición observable se reportan por separado.
```

## Supuestos ES

```text
La superficie primaria, la convención de orden y el viewport se congelan antes de la ronda. Todas las posiciones utilizan una convención basada en uno. Cada ejecución aporta como máximo una posición, correspondiente a la cita válida más temprana. La identidad del objetivo y las reglas de coincidencia ya fueron aprobadas mediante CR, y el orden puede auditarse desde evidencia preservada.
```

## Limitaciones ES

```text
MCP es una métrica condicional y puede parecer favorable cuando el objetivo se cita pocas veces; debe publicarse junto con CR. La media es sensible a valores extremos y a listas largas, y con muestras pequeñas una sola posición puede modificar sustancialmente el resultado. Las posiciones inline, de referencias, tarjetas y paneles no son comparables salvo que se aplique una superficie y convención congeladas. MCP no mide calidad de cita, respaldo, autoridad, prominencia semántica ni influencia causal.
```

## Validación ES

```text
Congelar superficie y orden; verificar la muestra y CR; confirmar cada Citation del objetivo mediante evidencia; revisar tipo, ubicación y posición; deduplicar representaciones repetidas; seleccionar la posición mínima por ejecución; realizar doble revisión; adjudicar desacuerdos; recontar ejecuciones citadas y con posición; sumar posiciones; recalcular MCP de forma independiente; comparar con el Metric Result almacenado; e informar CR, MCP, posiciones, superficie, exclusiones y cambios de interfaz.
```

## Inputs requeridos

| Source collection | Field name | Required |
| --- | --- | ---: |
| Citations | `promptExecution` | Sí |
| Citations | `citationPosition` | Sí |
| Citations | `citationType` | Sí |
| Citations | `citationContext.location` | Sí |
| Citations | `targetCoding.isEvaluatedTarget` | Sí |
| Citations | `targetCoding.targetMatchType` | Sí |
| Citations | `qualityControl.reviewStatus` | Sí |
| Citations | `evidence` | Sí |
| Observations | `visibilityCoding.cited` | Sí |

## Reporte mínimo obligatorio

```text
N_elegibles_generales
N_citadas_objetivo
N_citadas_con_posición
N_citadas_sin_posición
posiciones_individuales
suma_posiciones
MCP
CR
superficie_primaria
convención_de_orden
```

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

Mantener `Validated At` vacío y no completar `Validated By` hasta probar los casos adicionales y aprobar la superficie primaria del piloto.

## Documentos de referencia

- [`MCP_v0.1.0_REVIEW_ES.md`](./MCP_v0.1.0_REVIEW_ES.md)
- [`MCP_CITATION_POSITION_CODEBOOK_ES.md`](../codebooks/MCP_CITATION_POSITION_CODEBOOK_ES.md)
