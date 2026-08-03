# CR v0.1.0 — Revisión científica

**Código de métrica:** CR  
**Código de definición:** GSL-MDEF-CR-0001  
**Estado:** Under review  
**Versión:** 0.1.0  
**Categoría:** Citación  
**Dirección:** Valores más altos son mejores  
**Unidad:** Proporción  
**Unidad de análisis:** Experimento  
**Agregación:** Ratio

## Propósito

Citation Rate mide la proporción de ejecuciones controladas elegibles en las que el objetivo evaluado aparece presentado explícitamente por el sistema como fuente, referencia o destino enlazado.

CR es una métrica de frecuencia de atribución. No evalúa por sí sola si la fuente respalda una afirmación, si es correcta, autoritativa, prominente, primaria o favorable al objetivo.

## Fórmula canónica

Sea `E` el conjunto congelado de ejecuciones elegibles y sea `C_i` el código binario de citación para la ejecución `i`:

```text
C_i = 1 cuando existe al menos una cita aceptada que coincide con el objetivo evaluado
C_i = 0 cuando no existe ninguna cita aceptada del objetivo evaluado

CR = (Σ C_i) / |E|, para i ∈ E
```

Rango válido: `[0, 1]`.

Cada ejecución aporta como máximo una unidad al numerador aunque el objetivo aparezca citado varias veces. El número total de citas del objetivo puede informarse como estadístico descriptivo adicional, pero no modifica CR.

CR se informa con cuatro decimales y siempre junto con el numerador y el denominador originales.

## Qué se considera cita

Una cita es una representación visible mediante la cual el sistema atribuye información, remite al usuario o presenta una fuente identificable. Puede aparecer como:

- cita inline;
- referencia al final;
- tarjeta de fuente;
- elemento de un panel de fuentes;
- mención enlazada que funciona como atribución;
- referencia no enlazada ubicada claramente en una lista o contexto de fuentes.

Una simple mención del objetivo en el cuerpo de la respuesta no es una cita. Esa presencia pertenece a AIR, salvo que la interfaz la presente inequívocamente como atribución o referencia.

## Coincidencia con el objetivo evaluado

Antes de la codificación debe congelarse:

- tipo y valor canónico del objetivo;
- dominios, subdominios y URLs válidos;
- reglas de normalización de protocolo, `www`, barra final, parámetros y fragmentos;
- redirecciones y dominios alternativos aceptados;
- nombres, alias y entidades equivalentes;
- reglas específicas para organizaciones, personas, productos y temas;
- casos ambiguos y coincidencias expresamente rechazadas.

Una cita cuenta para CR únicamente cuando su identidad coincide con el objetivo mediante una regla predefinida y auditable.

En `Citations`, la coincidencia debe quedar representada mediante:

```text
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget = true
targetCoding.targetMatchType
```

`targetMatchType = unclear` no puede aceptarse sin adjudicación.

## Elegibilidad y denominador

Una ejecución pertenece a `E` cuando:

1. se realizó bajo el proyecto, benchmark, experimento, prompt, sistema y protocolo congelados;
2. alcanzó un estado analítico completado;
3. existe exactamente una Observation de nivel respuesta aceptada para el análisis;
4. la respuesta y la interfaz de fuentes fueron preservadas con suficiente evidencia para determinar si hubo citación;
5. se aplicaron las mismas reglas de identificación del objetivo.

Una ejecución válida sin citas permanece en el denominador con `C_i = 0`.

Una respuesta que no muestra citas también permanece en el denominador cuando la ausencia puede verificarse. Un fallo técnico o una captura incompleta que impida observar la interfaz puede excluirse solo mediante una regla previa y debe informarse por separado.

## Regla positiva de CR

Asignar `C_i = 1` cuando exista al menos un registro `Citations` que cumpla simultáneamente:

- pertenece a la misma `promptExecution`;
- está respaldado por evidencia preservada suficiente;
- representa una fuente o referencia visible;
- coincide con el objetivo evaluado;
- tiene `targetCoding.isEvaluatedTarget = true`;
- supera el control de calidad para su uso analítico;
- no está rechazado ni archivado como inválido.

El checkbox `Observations.visibilityCoding.cited` debe coincidir con esta decisión, pero la evidencia y los registros `Citations` son la base auditable del resultado positivo.

## Regla negativa de CR

Asignar `C_i = 0` cuando la ejecución sea elegible y:

- no exista ninguna atribución visible al objetivo;
- las fuentes mostradas correspondan a otros objetivos;
- el objetivo solo aparezca mencionado en el cuerpo sin función de fuente;
- el objetivo aparezca únicamente en el prompt;
- exista una coincidencia ambigua que tras adjudicación se determine como no válida;
- no haya citas visibles y la ausencia esté preservada adecuadamente.

## Política de datos ausentes

Política recomendada: **Report separately**.

- No imputar citas.
- No tratar una ejecución sin citas como dato ausente; es un cero válido.
- No tratar una URL que no resuelve actualmente como ausencia de cita si la cita visible fue preservada.
- Registrar por separado ejecuciones excluidas, interfaces incompletas y citas cuya identidad no pudo adjudicarse.
- Informar `N_planificadas`, `N_completadas`, `N_elegibles`, `N_ejecuciones_citadas`, `N_ejecuciones_no_citadas` y `N_excluidas`.

## Inputs requeridos

| Colección | Campo | Obligatorio | Función |
| --- | --- | ---: | --- |
| Prompt Executions | `lifecycleStatus` | Sí | Confirma finalización y elegibilidad. |
| Observations | `qualityControl.reviewStatus` | Sí | Restringe el denominador a observaciones aceptadas. |
| Observations | `visibilityCoding.cited` | Sí | Resumen binario por ejecución que debe concordar con las citas. |
| Citations | `promptExecution` | Sí | Vincula la cita a la ejecución. |
| Citations | `citationType` | Sí | Identifica la representación visible de la fuente. |
| Citations | `targetCoding.isEvaluatedTarget` | Sí | Confirma que la cita pertenece al objetivo evaluado. |
| Citations | `targetCoding.targetMatchType` | Sí | Documenta el tipo de coincidencia. |
| Citations | `qualityControl.reviewStatus` | Sí | Limita el numerador a citas aceptadas. |
| Citations | `sourceDomain` o identidad equivalente | Sí | Permite auditar la identidad de la fuente. |
| Citations | `evidence` | Recomendado | Preserva la representación visible utilizada para codificar. |

`verification.supportsClaim` no es necesario para CR porque pertenece a la calidad de respaldo, no a la ocurrencia de la cita.

## Interpretación

Los valores CR más altos indican que el sistema atribuyó o presentó como fuente al objetivo en una mayor proporción de ejecuciones elegibles bajo la condición exacta estudiada.

CR no demuestra:

- que la fuente respalde correctamente una afirmación;
- que el enlace funcione en el momento de la revisión;
- que la fuente sea primaria, oficial o autoritativa;
- que la cita sea prominente;
- que aparezca en una posición favorable;
- que la cita haya influido realmente en la generación;
- que el objetivo sea recomendado o mencionado en el cuerpo;
- que la frecuencia se mantenga con otro prompt, sistema, fecha, ubicación o cuenta.

CR debe interpretarse como frecuencia muestral de atribución visible, no como una propiedad permanente del sistema.

## Supuestos

- La identidad del objetivo y las reglas de normalización se congelan antes de codificar.
- Cada ejecución elegible aporta un único resultado binario.
- Las fuentes visibles y la respuesta se preservan de forma suficiente.
- Los registros de Citation representan elementos visibles diferenciables.
- Las múltiples citas del objetivo dentro de una ejecución no duplican el numerador.
- Las reglas de inclusión y exclusión se aplican de forma uniforme.

## Limitaciones

CR colapsa toda citación de una ejecución a un resultado binario. No distingue número de citas, posición, prominencia, función, respaldo, autoridad ni calidad.

Los sistemas pueden mostrar fuentes en interfaces dinámicas, paneles colapsados o formatos diferentes. La observabilidad depende de la captura de la interfaz y de una convención de codificación estable.

Una URL puede redirigir, dejar de resolver o cambiar después de la ejecución. CR debe basarse en la atribución preservada en el momento de captura; la verificación posterior se documenta por separado.

Con cinco ejecuciones, CR solo puede variar en incrementos de `0,20`, por lo que siempre deben comunicarse los recuentos brutos y evitar afirmaciones generales de estabilidad.

## Procedimiento de validación

1. Congelar la muestra analítica y el diccionario de identidad del objetivo.
2. Verificar que cada ejecución incluida cumple el protocolo.
3. Confirmar una Observation aceptada por ejecución.
4. Revisar la respuesta completa y todas las superficies de fuentes preservadas.
5. Extraer un registro Citation por cada fuente visible diferenciable.
6. Codificar de forma independiente si cada cita coincide con el objetivo.
7. Resolver desacuerdos mediante la evidencia preservada y las reglas de normalización.
8. Confirmar que `visibilityCoding.cited` concuerda con la existencia o ausencia de citas aceptadas del objetivo.
9. Reducir cada ejecución a `C_i = 1` o `C_i = 0`.
10. Recontar independientemente numerador y denominador.
11. Recalcular CR y compararla con el Metric Result almacenado.
12. Informar recuentos, tipos de cita, identidad del objetivo, exclusiones, prompt, sistema, fechas y redondeo.

## Valores recomendados en Payload

```text
Title: Tasa de citación
Metric Code: CR
Version: 0.1.0
Lifecycle Status: Under review
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
```

No debe cambiarse esta definición a `Validated` hasta aprobar el codebook de citas, las reglas de normalización del objetivo y la convención sobre superficies visibles de citación.

## Base científica

- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023, 7001–7025. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Aggarwal, P., Murahari, V., Rajpurohit, T., Kalyan, A., Narasimhan, K., & Deshpande, A. (2024). *GEO: Generative Engine Optimization*. Proceedings of KDD 2024, 5–16. DOI: 10.1145/3637528.3671900.
- Xu, Y. et al. (2025). *CiteEval: Principle-Driven Citation Evaluation for Source Attribution*. ACL 2025, 32759–32778. DOI: 10.18653/v1/2025.acl-long.1574.
