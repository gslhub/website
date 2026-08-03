# MCP v0.1.0 — Revisión científica

**Código de métrica:** MCP  
**Código de definición:** GSL-MDEF-MCP-0001  
**Estado:** Under review  
**Versión:** 0.1.0  
**Categoría:** Posición  
**Dirección:** Valores más bajos indican aparición más temprana  
**Unidad:** Posición ordinal  
**Unidad de análisis:** Experimento  
**Agregación:** Media aritmética

## Propósito

Mean Citation Position mide la posición visible media de la **primera cita válida del objetivo evaluado** entre las ejecuciones elegibles en las que el objetivo fue citado y su posición pudo observarse.

MCP es una métrica condicional de orden de presentación. Describe si las citas del objetivo tienden a aparecer antes o después dentro de una superficie de citación congelada. No mide por sí sola calidad, respaldo de afirmaciones, autoridad, influencia, prominencia semántica ni probabilidad de ser citado.

## Fórmula canónica

Sea `C_pos` el conjunto de ejecuciones elegibles que contienen al menos una cita aceptada del objetivo y una posición observable. Sea `P_i` la posición, basada en uno, de la primera cita válida del objetivo en la ejecución `i`:

```text
P_i = min(posición de cada cita aceptada del objetivo en la superficie primaria)

MCP = (Σ P_i) / |C_pos|, para i ∈ C_pos
```

Rango válido: `[1, +∞)`.

Si `|C_pos| = 0`, MCP debe informarse como **no estimable**, nunca como cero.

MCP se informa con dos decimales y siempre acompañada por:

- número de ejecuciones elegibles del experimento;
- número de ejecuciones donde el objetivo fue citado;
- número de ejecuciones citadas con posición observable;
- suma de posiciones;
- posiciones individuales;
- superficie de citación utilizada;
- CR de la misma muestra.

## Relación con CR

CR responde: “¿En qué proporción de ejecuciones fue citado el objetivo?”.

MCP responde: “Cuando fue citado y la posición era observable, ¿en qué posición apareció primero?”.

Por tanto:

- MCP está condicionada a la citación;
- las ejecuciones sin cita no reciben posición cero ni una posición artificial;
- MCP debe interpretarse junto con CR;
- una MCP temprana con CR muy baja no implica alta visibilidad global.

## Superficie primaria de citación

Antes de iniciar una ronda debe congelarse una única superficie primaria comparable, por ejemplo:

- citas inline del cuerpo de la respuesta;
- referencias finales;
- tarjetas de fuentes;
- panel o carrusel de fuentes.

La superficie debe quedar registrada en el protocolo y en el perfil del sistema. No deben mezclarse dentro de una misma MCP posiciones procedentes de interfaces o superficies no comparables.

Cuando el sistema muestra citas en más de una superficie:

1. se preservan y extraen todas las citas disponibles;
2. MCP utiliza únicamente la superficie primaria definida antes de la ejecución;
3. las apariciones en superficies secundarias se conservan como datos descriptivos;
4. un cambio de interfaz durante la ronda exige separar estratos o excluir la ejecución según una regla previa.

## Convención de orden visible

Las posiciones son enteros basados en uno.

### Citas inline

Orden de lectura del cuerpo de la respuesta:

1. de arriba hacia abajo;
2. de izquierda a derecha dentro de la misma línea o bloque;
3. siguiendo el orden visible de los marcadores cuando varios aparecen en un mismo fragmento.

### Referencias finales

Orden numérico o visual de la lista de referencias.

### Tarjetas o panel de fuentes

Orden visual inicial mostrado por la interfaz:

1. de arriba hacia abajo;
2. de izquierda a derecha cuando existe una cuadrícula;
3. siguiendo el orden accesible del carrusel cuando la interfaz exige desplazamiento.

La captura debe preservar el estado inicial y, cuando sea necesario, el recorrido completo del panel.

## Varias citas del objetivo en una ejecución

Cada ejecución aporta una sola posición:

```text
P_i = la posición más temprana entre las citas aceptadas del objetivo
```

Esta regla evita que una ejecución con muchas citas pese más que otra con una sola cita.

El número total de citas del objetivo y sus posiciones adicionales pueden informarse aparte, pero no entran varias veces en la media principal.

## Duplicados entre superficies

Una misma fuente puede aparecer como enlace inline, tarjeta y elemento del panel. Debe conservarse cada representación visible, pero para MCP:

- solo se utiliza la superficie primaria;
- dentro de esa superficie se deduplican representaciones idénticas cuando sean el mismo elemento de interfaz repetido;
- URLs o entidades diferentes pertenecientes al mismo objetivo siguen siendo citas separadas, aunque la ejecución aporte únicamente la posición más temprana.

La deduplicación debe apoyarse en `normalizedUrl`, `sourceDomain`, identidad del objetivo y evidencia de interfaz.

## Elegibilidad

Una ejecución pertenece a `C_pos` cuando:

1. cumple el protocolo congelado;
2. está incluida en la muestra analítica;
3. contiene al menos una Citation aceptada del objetivo;
4. `targetCoding.isEvaluatedTarget = true`;
5. la cita pertenece a la superficie primaria;
6. `citationPosition` es visible, entero y mayor o igual que uno;
7. existe evidencia suficiente para auditar el orden.

Una ejecución citada cuya posición no pueda observarse no se convierte en cero. Debe informarse como cita sin posición y excluirse de `C_pos` con motivo documentado.

## Política de datos ausentes

Política recomendada en Payload: **Report separately**.

Distinciones obligatorias:

- ejecución no citada: estructuralmente no aplicable para MCP;
- ejecución citada con posición observable: entra en `C_pos`;
- ejecución citada sin posición observable: se reporta por separado;
- ejecución excluida del análisis general: no entra en CR ni MCP.

No imputar posiciones y no asignar una posición de penalización a ejecuciones sin cita en MCP v0.1.0. Cualquier métrica futura que combine frecuencia y posición debe definirse como una métrica diferente.

## Inputs requeridos

| Colección | Campo | Obligatorio | Función |
| --- | --- | ---: | --- |
| Citations | `promptExecution` | Sí | Agrupa las citas por ejecución. |
| Citations | `citationPosition` | Sí | Posición visible basada en uno. |
| Citations | `citationType` | Sí | Identifica la superficie o representación. |
| Citations | `citationContext.location` | Sí | Confirma la ubicación visible. |
| Citations | `targetCoding.isEvaluatedTarget` | Sí | Restringe el cálculo al objetivo. |
| Citations | `targetCoding.targetMatchType` | Sí | Documenta la coincidencia. |
| Citations | `qualityControl.reviewStatus` | Sí | Restringe el cálculo a citas aceptadas. |
| Citations | `evidence` | Sí | Permite auditar orden e interfaz. |
| Observations | `visibilityCoding.cited` | Sí | Control de consistencia con CR. |

## Interpretación

Valores más bajos indican que, cuando el objetivo fue citado, su primera cita tendió a aparecer antes dentro de la superficie primaria definida.

MCP no demuestra:

- que el objetivo sea citado con frecuencia;
- que la cita respalde correctamente una afirmación;
- que la fuente sea autoritativa o primaria;
- que la cita sea más visible para todos los usuarios;
- que una posición temprana cause influencia en la respuesta;
- que posiciones de superficies diferentes sean comparables.

La posición es una propiedad de una interfaz, versión y protocolo concretos. Debe registrarse el sistema, la versión visible, la superficie, la fecha y el método de captura.

## Supuestos

- La superficie primaria se congela antes de ejecutar la ronda.
- El orden visible puede reproducirse desde la evidencia preservada.
- Todas las posiciones utilizan la misma convención basada en uno.
- Cada ejecución aporta como máximo una posición.
- La identidad del objetivo y las reglas de coincidencia ya fueron aprobadas para CR.
- Las citas aceptadas se revisan con independencia del valor final de MCP.

## Limitaciones

MCP es condicional y puede parecer favorable cuando el objetivo se cita muy pocas veces. Por eso siempre debe publicarse junto con CR y los recuentos de elegibilidad.

La media es sensible a valores extremos y a interfaces que presentan listas largas. Con pocas observaciones puede cambiar sustancialmente por una única posición. Deben informarse también las posiciones individuales y, en muestras mayores, mediana, mínimo, máximo y dispersión.

Las posiciones inline, de tarjetas y de paneles no son equivalentes de forma automática. La comparabilidad solo existe dentro de una convención de interfaz congelada.

## Procedimiento de validación

1. Congelar la superficie primaria y la convención de orden.
2. Verificar la muestra elegible y el resultado CR.
3. Confirmar cada Citation aceptada del objetivo mediante evidencia preservada.
4. Revisar `citationType`, `citationContext.location` y `citationPosition`.
5. Deduplicar representaciones repetidas dentro de la superficie primaria.
6. Seleccionar la posición más temprana por ejecución.
7. Realizar doble revisión independiente de las posiciones.
8. Resolver desacuerdos mediante capturas y registros preservados.
9. Recontar `N_citadas` y `N_con_posición`.
10. Sumar posiciones y recalcular MCP de forma independiente.
11. Comparar con el Metric Result almacenado.
12. Informar CR, MCP, posiciones, superficie, exclusiones y cambios de interfaz.

## Escenario determinista existente

El pipeline sintético de GSLHub utiliza tres ejecuciones citadas con posiciones:

```text
1, 2, 3

Σ posiciones = 6
N_con_posición = 3
MCP = 6 / 3 = 2,00
```

Este escenario valida la aritmética básica, pero todavía debe ampliarse con pruebas de varias citas por ejecución, duplicados entre superficies, ausencia de citas y posición no observable.

## Valores recomendados en Payload

```text
Title: Posición media de citación
Metric Code: MCP
Version: 0.1.0
Lifecycle Status: Under review
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
```

No cambiar a `Validated` hasta aprobar el codebook de posición, probar casos con múltiples citas y confirmar la superficie primaria del primer piloto.

## Base científica

- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Ruan et al. (2025). *ALiiCE: Evaluating Positional Fine-grained Citation Generation*. NAACL 2025. DOI: 10.18653/v1/2025.naacl-long.23.
- Kirsten, E. et al. (2026). *Characterizing Web Search in The Age of Generative AI*. Findings of ACL 2026. DOI: 10.18653/v1/2026.findings-acl.526.
- Pfrommer, S. et al. (2024). *Ranking Manipulation for Conversational Search Engines*. EMNLP 2024. DOI: 10.18653/v1/2024.emnlp-main.534.
