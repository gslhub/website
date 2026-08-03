# RCR v0.1.0 — Revisión científica

**Código de métrica:** RCR  
**Código de definición:** GSL-MDEF-RCR-0001  
**Estado:** Under review  
**Versión:** 0.1.0  
**Categoría:** Consistencia  
**Dirección:** Valores más altos indican mayor estabilidad  
**Unidad:** Proporción  
**Unidad de análisis:** Experimento  
**Agregación:** Ratio

## Propósito

Response Consistency Rate mide la proporción de comparaciones válidas entre repeticiones que presentan variación sustantiva nula o baja respecto a una observación base congelada de la misma condición experimental.

RCR evalúa estabilidad bajo repeticiones controladas. No mide exactitud factual, calidad, utilidad, autoridad de las fuentes ni identidad textual. Una respuesta puede ser consistente y errónea, o correcta pero variable.

## Fórmula canónica

Sea `b` la observación base congelada y sea `C` el conjunto de observaciones comparables, válidas y distintas de la base. Para cada comparación `i`:

```text
S_i = 1 cuando variationLevel_i ∈ {none, low}
S_i = 0 cuando variationLevel_i ∈ {medium, high}

RCR = (Σ S_i) / |C|, para i ∈ C
```

Rango válido: `[0, 1]`.

La observación base se conserva y se informa, pero no entra en el denominador. Si `|C| = 0`, RCR es no estimable.

RCR se informa con cuatro decimales y siempre junto con el numerador, denominador, niveles individuales, base utilizada y exclusiones.

## Diseño del primer piloto

Con cinco ejecuciones:

```text
1 observación base
4 comparaciones evaluadas
```

RCR solo puede adoptar:

```text
0/4 = 0,00
1/4 = 0,25
2/4 = 0,50
3/4 = 0,75
4/4 = 1,00
```

Debe evitarse interpretar una única ronda pequeña como estimación estable del comportamiento general del sistema.

## Selección y congelación de la base

La base debe elegirse mediante una regla previa, no por parecer más representativa después de leer las respuestas.

Regla recomendada para el piloto:

1. ordenar las ejecuciones por `repetitionNumber`;
2. seleccionar la primera ejecución elegible;
3. confirmar que está completada, preservada y aceptada;
4. congelar su Observation antes de clasificar las demás;
5. usar la misma base para todas las comparaciones de la condición.

Para la ronda inicial, la base prevista es la ejecución con menor número de repetición, normalmente `GSL-EXEC-GEO-0001`.

Si esa ejecución resulta técnicamente inválida, debe aplicarse una regla de sustitución predefinida —la siguiente repetición elegible— y documentar el motivo. No debe elegirse una nueva base para mejorar RCR.

## Condición experimental comparable

La base y todas las comparaciones deben compartir:

- proyecto, benchmark y experimento;
- prompt exacto y versión;
- perfil del sistema de IA;
- acceso, cuenta y modo de búsqueda;
- idioma, locale, ubicación y zona horaria definidos;
- estado de memoria e instrucciones personalizadas;
- ventana temporal y versión visible de interfaz compatibles;
- definición del objetivo evaluado.

Un cambio material de condición exige excluir, separar el análisis o crear otro estrato.

## Dimensiones de comparación

Cada respuesta se compara con la base en cinco dimensiones:

1. **Resultado del objetivo**
   - `mentioned`;
   - `cited`;
   - `recommended`;
   - `recommendationStrength`;
   - posición cuando forme parte del protocolo.

2. **Conclusión o recomendación principal**
   - orientación general de la respuesta;
   - conclusión principal;
   - selección, exclusión o recomendación del objetivo.

3. **Afirmaciones y temas centrales**
   - presencia de las afirmaciones necesarias;
   - contradicciones;
   - adiciones u omisiones sustantivas;
   - cobertura de temas esenciales.

4. **Fuentes y atribución**
   - presencia o ausencia de citas;
   - papel de las fuentes;
   - cambios sustantivos del conjunto de dominios;
   - cambios en evidencia o respaldo visible.

5. **Modo y calidad observable de respuesta**
   - respuesta sustantiva, negativa o rechazo;
   - error o truncamiento;
   - idioma;
   - completitud;
   - estructura que altere materialmente la interpretación.

## Regla conservadora de clasificación

Cada dimensión recibe una severidad preliminar. El `variationLevel` final es la severidad más alta observada:

```text
variationLevel = max(severidad de las dimensiones evaluadas)
```

Esto evita que una diferencia crítica quede ocultada por similitudes superficiales.

## Definición de los niveles

### `none` — sin variación sustantiva

La respuesta conserva:

- el mismo vector de resultados del objetivo;
- la misma conclusión principal;
- las mismas afirmaciones y temas centrales;
- el mismo patrón esencial de atribución;
- el mismo modo de respuesta.

Solo existen diferencias triviales de puntuación, formato, orden o redacción que no cambian el significado.

### `low` — variación baja

La respuesta conserva el mismo resultado del objetivo y la misma conclusión. Puede presentar:

- paráfrasis;
- reordenación de secciones;
- cambios menores de longitud;
- ejemplos secundarios distintos;
- adición u omisión de detalles no esenciales;
- sustituciones limitadas de fuentes que no cambian la función del respaldo ni el resultado evaluado.

No puede existir contradicción ni cambio en `mentioned`, `cited` o `recommended`.

### `medium` — variación material sin cambio del resultado principal

El vector principal del objetivo y la conclusión permanecen estables, pero existe al menos una diferencia sustantiva, por ejemplo:

- omisión o adición de una afirmación central secundaria;
- cambio importante en argumentos o explicación;
- cambio amplio del conjunto o función de fuentes;
- diferencia notable en cobertura temática;
- variación de prominencia o posición que altera la presentación sin cambiar inclusión, citación o recomendación;
- respuesta parcial frente a respuesta completa, manteniendo la misma conclusión.

La comparación ya no es considerada consistente para RCR v0.1.0.

### `high` — variación alta o cambio del resultado

Clasificar `high` cuando ocurra cualquiera de estos casos:

- cambio en `mentioned`, `cited` o `recommended`;
- cambio material de `recommendationStrength`;
- conclusión, recomendación o selección opuesta;
- contradicción de una afirmación central;
- respuesta sustantiva frente a negativa, rechazo o error;
- desaparición o incorporación de elementos esenciales que cambia la interpretación;
- cambio de idioma o modo de respuesta que invalida la comparabilidad;
- evidencia de que la condición experimental no fue equivalente.

Los incumplimientos técnicos de protocolo pueden exigir exclusión en lugar de clasificación, según la regla previa aplicable.

## Casos `not-assessed`

`not-assessed` se reserva para:

- la propia observación base;
- una comparación todavía no revisada;
- un caso sin evidencia suficiente;
- una comparación pendiente de adjudicación.

No entra en el denominador. Debe documentarse y resolverse o reportarse por separado.

## Elegibilidad y denominador

Una observación comparativa pertenece a `C` cuando:

1. su Prompt Execution está `completed`;
2. la Observation está `validated`;
3. `qualityControl.reviewStatus = accepted`;
4. coincide con el objetivo evaluado;
5. referencia exactamente la base congelada;
6. utiliza `none`, `low`, `medium` o `high`;
7. existe una sola Observation aceptada por ejecución;
8. la evidencia permite auditar la comparación.

La base y los registros `not-assessed` no entran en el denominador. Las exclusiones deben conservar su motivo.

## Política de datos ausentes

Política recomendada en Payload: **Report separately**.

- No imputar niveles de variación.
- No convertir `not-assessed` en `high` ni en cero.
- Informar candidatos, comparaciones válidas, base y exclusiones.
- Si no queda ninguna comparación válida, informar RCR como no estimable.

El calculador actual aplica operativamente una política `exclude-and-report`; la definición metodológica debe expresarla en el CMS como `Report separately`.

## Inputs requeridos

| Colección | Campo | Obligatorio | Función |
| --- | --- | ---: | --- |
| Observations | `comparison.baselineObservation` | Sí | Identifica la base congelada. |
| Observations | `comparison.variationLevel` | Sí | Clasificación de la comparación. |
| Observations | `comparison.comparisonNotes` | Sí | Justificación auditable. |
| Observations | `visibilityCoding.*` | Sí | Compara resultados del objetivo. |
| Observations | `responseAssessment.*` | Sí | Compara modo, error y completitud. |
| Observations | `citationAssessment.*` | Sí | Compara presentación de fuentes. |
| Observations | `sourceObservations` | Recomendado | Compara fuentes y dominios. |
| Observations | `semanticCoding.*` | Recomendado | Compara temas y afirmaciones. |
| Observations | `qualityControl.reviewStatus` | Sí | Restringe a comparaciones aceptadas. |
| Prompt Executions | `lifecycleStatus` | Sí | Exige ejecución completada. |

## Interpretación

Valores más altos indican que una mayor proporción de repeticiones comparadas permaneció dentro del umbral `none/low` respecto a la base congelada.

RCR no demuestra:

- exactitud factual;
- calidad o utilidad;
- ausencia de sesgos;
- estabilidad en otra fecha, cuenta, sistema, idioma o prompt;
- identidad literal de redacción;
- causalidad entre variaciones y cambios del sistema.

Una respuesta incorrecta repetida puede obtener RCR alto. Una respuesta correcta pero expresada mediante argumentos o fuentes materialmente diferentes puede obtener RCR menor.

## Dependencia de la base

RCR v0.1.0 es una métrica de comparación contra una base y, por tanto, depende de ella.

Debe informarse:

- código de la ejecución base;
- código de la Observation base;
- regla de selección;
- motivo de cualquier sustitución;
- sensibilidad en rondas futuras mediante análisis pairwise o múltiples bases.

No debe interpretarse RCR como acuerdo global entre todas las parejas hasta que exista una métrica específica para ello.

## Doble codificación y adjudicación

Las cuatro comparaciones del piloto deben revisarse de forma independiente por dos codificaciones cuando sea posible.

Cuando solo exista un investigador disponible, realizar:

1. primera codificación;
2. periodo de separación previamente definido;
3. segunda codificación ciega respecto al primer resultado;
4. registro de acuerdos y desacuerdos;
5. adjudicación documentada.

Con cuatro comparaciones debe informarse principalmente el acuerdo bruto. Estadísticas corregidas por azar serán más útiles en rondas mayores.

## Procedimiento de validación

1. Congelar condición, objetivo y regla de selección de la base.
2. Verificar y congelar la Observation base.
3. Confirmar una Observation aceptada por ejecución comparativa.
4. Revisar las cinco dimensiones sin consultar el resultado anterior.
5. Asignar severidad por dimensión.
6. Aplicar la regla de severidad máxima.
7. Justificar el nivel en `comparisonNotes`.
8. Ejecutar la segunda revisión y adjudicar desacuerdos.
9. Excluir o resolver casos `not-assessed`.
10. Recontar niveles `none`, `low`, `medium` y `high`.
11. Recalcular numerador y denominador.
12. Comparar con el Metric Result y sus checksums.
13. Informar base, niveles individuales, exclusiones y condiciones de ejecución.

## Escenario determinista existente

El escenario administrativo genera:

```text
Base: not-assessed
Comparaciones: none, low, low, high

Numerador consistente = 3
Denominador evaluado = 4
RCR = 3 / 4 = 0,7500
Base excluida y reportada = 1
```

Este escenario valida la aritmética, la base única, los estados requeridos, la correspondencia del objetivo y los checksums. Debe ampliarse posteriormente con pruebas de `medium`, múltiples bases, duplicados por ejecución, base ausente y comparación pendiente.

## Valores recomendados en Payload

```text
Title: Tasa de consistencia de la respuesta
Metric Code: RCR
Version: 0.1.0
Lifecycle Status: Under review
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
```

No cambiar a `Validated` hasta probar el codebook con comparaciones sintéticas y confirmar formalmente la regla de base del primer piloto.

## Base científica

- Bartsch, H. et al. (2023). *Self-Consistency of Large Language Models under Ambiguity*. BlackboxNLP 2023. DOI: 10.18653/v1/2023.blackboxnlp-1.7.
- Nalbandyan, G., Shahbazyan, R., & Bakhturina, E. (2025). *SCORE: Systematic COnsistency and Robustness Evaluation for Large Language Models*. NAACL 2025. DOI: 10.18653/v1/2025.naacl-industry.39.
- Jang, D., Ahn, Y., & Shin, H. (2025). *RCScore: Quantifying Response Consistency in Large Language Models*. EMNLP 2025. DOI: 10.18653/v1/2025.emnlp-main.290.
- Wu, X. et al. (2025). *Estimating LLM Consistency: A User Baseline vs Surrogate Metrics*. EMNLP 2025. DOI: 10.18653/v1/2025.emnlp-main.1554.
- Ganesh, P., Shokri, R., & Farnadi, G. (2026). *Rethinking Hallucinations: Correctness, Consistency, and Prompt Multiplicity*. EACL 2026. DOI: 10.18653/v1/2026.eacl-long.327.
- Schulte, J., Bleeker, M., & Kaufmann, P. (2026). *Don't Measure Once: Measuring Visibility in AI Search (GEO)*. arXiv:2604.07585.
