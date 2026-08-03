# Codebook operativo RCR — Variación entre respuestas

**Métrica:** Response Consistency Rate (RCR)  
**Versión:** 0.1.0  
**Código de definición:** GSL-MDEF-RCR-0001  
**Estado:** Under review  
**Fecha:** 3 de agosto de 2026

## 1. Objetivo

Este codebook define cómo comparar cada respuesta repetida con una Observation base congelada y cómo asignar:

```text
none
low
medium
high
not-assessed
```

RCR mide estabilidad de respuesta bajo una condición controlada. No mide exactitud ni calidad.

## 2. Unidad de codificación

La unidad es una Observation `response-level` aceptada, vinculada a una Prompt Execution completada y comparada con una única Observation base de la misma condición.

Cada comparación aporta:

```text
1 = none o low
0 = medium o high
X = not-assessed, pendiente o excluida
```

La Observation base se registra como `not-assessed` y no entra en el denominador.

## 3. Ficha de condición obligatoria

Antes de comparar debe congelarse:

```text
projectCode
benchmarkCode
experimentCode
promptCode
promptVersion
systemCode
visibleInterfaceVersion
accessMode
accountTier
searchMode
locale
timezone
location
memoryEnabled
customInstructionsEnabled
targetType
targetValue
baselineSelectionRule
```

## 4. Selección de la base

Regla recomendada:

```text
Base = primera ejecución elegible por repetitionNumber
```

Procedimiento:

1. ordenar ejecuciones por `repetitionNumber`;
2. seleccionar la primera completada y aceptada;
3. preservar respuesta y evidencia;
4. congelar su Observation;
5. no cambiarla después de leer las demás respuestas.

Si la primera ejecución es inválida, usar la siguiente elegible y registrar el motivo en el protocolo y en las notas del cálculo.

## 5. Dimensiones de comparación

### A. Resultado del objetivo

Comparar:

```text
visibilityCoding.mentioned
visibilityCoding.cited
visibilityCoding.recommended
visibilityCoding.recommendationStrength
visibilityCoding.mentionPosition
visibilityCoding.citationPosition
```

### B. Conclusión principal

Comparar:

- respuesta principal a la pregunta;
- conclusión o recomendación;
- inclusión o exclusión del objetivo;
- orientación general.

### C. Afirmaciones y temas

Comparar:

- afirmaciones centrales;
- contradicciones;
- temas necesarios;
- omisiones o adiciones sustantivas;
- cobertura semántica.

### D. Fuentes

Comparar:

- existencia de citas;
- dominios presentados;
- función de las fuentes;
- respaldo visible;
- posición o prominencia cuando sean relevantes.

### E. Modo de respuesta

Comparar:

- respuesta sustantiva, negativa o rechazo;
- error o truncamiento;
- idioma;
- completitud;
- formato que afecte la interpretación.

## 6. Regla de severidad máxima

Evaluar cada dimensión y utilizar el nivel más grave:

```text
Nivel final = máximo nivel observado
```

Ejemplo:

```text
Resultado del objetivo: none
Conclusión: low
Afirmaciones: medium
Fuentes: low
Modo: none

variationLevel final = medium
```

## 7. `none`

Asignar `none` cuando no exista variación sustantiva.

Admitido:

- puntuación diferente;
- formato distinto;
- sinónimos;
- cambios mínimos de orden;
- redacción casi equivalente.

Requisitos:

- mismo resultado del objetivo;
- misma conclusión;
- mismas afirmaciones centrales;
- mismo patrón esencial de fuentes;
- mismo modo de respuesta.

## 8. `low`

Asignar `low` cuando existan diferencias menores sin cambiar el resultado ni el significado principal.

Ejemplos:

- paráfrasis extensa;
- orden diferente de secciones;
- un ejemplo secundario distinto;
- detalle no esencial añadido u omitido;
- longitud moderadamente diferente;
- sustitución limitada de una fuente secundaria.

No se permite:

- cambio en `mentioned`, `cited` o `recommended`;
- contradicción;
- cambio de conclusión;
- omisión de un elemento esencial.

## 9. `medium`

Asignar `medium` cuando exista una variación sustantiva, pero el resultado principal del objetivo y la conclusión permanezcan estables.

Ejemplos:

- una afirmación central secundaria aparece solo en una respuesta;
- cambia materialmente la explicación;
- el conjunto de fuentes cambia de forma amplia;
- se omite un tema importante, pero no se revierte la conclusión;
- la prominencia o posición del objetivo cambia mucho;
- una respuesta es parcial y otra completa, con la misma conclusión.

`medium` cuenta como inconsistente en RCR v0.1.0.

## 10. `high`

Asignar `high` cuando cambie un resultado esencial o la comparabilidad quede rota.

Ejemplos obligatorios:

- `mentioned` cambia entre true y false;
- `cited` cambia entre true y false;
- `recommended` cambia entre true y false;
- cambia materialmente `recommendationStrength`;
- una respuesta recomienda el objetivo y otra lo excluye;
- conclusiones opuestas;
- contradicción de una afirmación central;
- respuesta normal frente a rechazo o error;
- cambio de idioma no previsto;
- falta o adición de elementos que cambia la interpretación.

Un fallo técnico que incumpla el protocolo puede requerir exclusión en vez de `high`.

## 11. `not-assessed`

Usar `not-assessed` cuando:

- sea la Observation base;
- aún no se haya realizado la revisión;
- falte evidencia suficiente;
- exista una ambigüedad pendiente de adjudicación.

No entra en el denominador y debe explicarse en `comparisonNotes` o en control de calidad.

## 12. Árbol de decisión

```text
¿La ejecución cumple la condición y tiene evidencia suficiente?
├─ No → Excluir y justificar
└─ Sí
   ¿Es la Observation base?
   ├─ Sí → not-assessed
   └─ No
      ¿Referencia la base congelada correcta?
      ├─ No → Revision required
      └─ Sí
         ¿Cambió algún resultado esencial del objetivo o la conclusión?
         ├─ Sí → high
         └─ No
            ¿Hay diferencias sustantivas en afirmaciones, fuentes o cobertura?
            ├─ Sí → medium
            └─ No
               ¿Solo existen diferencias menores de redacción, orden o detalle?
               ├─ Sí → low
               └─ No → none
```

## 13. Procedimiento operativo

1. Abrir la evidencia de la base y de la comparación.
2. Verificar códigos, prompt, sistema y condiciones.
3. Revisar las cinco dimensiones.
4. Registrar notas por dimensión.
5. Asignar severidad provisional.
6. Aplicar la regla de severidad máxima.
7. Guardar `baselineObservation`, `variationLevel` y `comparisonNotes`.
8. Realizar segunda codificación.
9. Resolver desacuerdos mediante evidencia.
10. Cambiar `reviewStatus` a `accepted` después de adjudicar.

## 14. Plantilla de `comparisonNotes`

```text
Baseline:
Comparison:
Target outcome:
Primary conclusion:
Core claims/themes:
Sources/attribution:
Response mode/completeness:
Highest observed severity:
Final variationLevel:
Evidence references:
Reviewer rationale:
```

## 15. Ejemplos del piloto GSLHub

Suponiendo la misma pregunta, el mismo sistema y `gslhub.com` como objetivo:

| Comparación respecto a la base | Nivel |
| --- | --- |
| Mismas ideas y resultados, solo cambia la redacción | `none` |
| Mismo resultado y conclusión, cambia orden y un ejemplo secundario | `low` |
| GSLHub sigue mencionado y citado, pero cambian ampliamente argumentos y fuentes | `medium` |
| La base cita GSLHub y la comparación no lo cita | `high` |
| La base recomienda GSLHub y la comparación lo excluye | `high` |
| La comparación es un rechazo sin respuesta sustantiva | `high` o exclusión según protocolo |
| Captura incompleta y no puede evaluarse | `not-assessed` o exclusión |

## 16. Consistencia interna

Antes de aceptar una comparación:

- debe existir una sola base;
- la base no puede referenciarse a sí misma como comparación;
- todas las comparaciones deben usar la misma base;
- no puede haber dos Observations aceptadas de una ejecución;
- `variationLevel` debe ser evaluado;
- `comparisonNotes` debe justificar la severidad;
- objetivo, prompt y sistema deben coincidir;
- la evidencia debe ser suficiente.

## 17. Doble codificación

Registrar:

```text
Coder A level
Coder B level
Agreement yes/no
Adjudicated level
Adjudication rationale
Reviewer
Date
```

Cuando solo exista un investigador, realizar una segunda codificación ciega después de un intervalo predefinido.

## 18. Reporte mínimo

Todo resultado RCR debe mostrar:

```text
N_candidatas
N_bases = 1
N_comparaciones_evaluadas
N_none
N_low
N_medium
N_high
N_not_assessed_o_excluidas
Numerador = N_none + N_low
Denominador = N_none + N_low + N_medium + N_high
RCR = Numerador / Denominador
```

También debe informar:

- ejecución y Observation base;
- regla de selección;
- niveles individuales;
- exclusiones;
- acuerdo entre revisores;
- configuración del sistema y fechas.

## 19. Checklist

- [ ] Condición experimental congelada.
- [ ] Regla de selección de base aprobada.
- [ ] Base válida y preservada.
- [ ] Misma base en todas las comparaciones.
- [ ] Cinco dimensiones revisadas.
- [ ] Severidad máxima aplicada.
- [ ] Notas justificativas guardadas.
- [ ] Segunda codificación completada.
- [ ] Desacuerdos adjudicados.
- [ ] Exclusiones documentadas.
- [ ] Numerador y denominador recontados.
- [ ] RCR recalculada independientemente.

## 20. Estado

Este codebook permanece **Under review**. Debe probarse con el escenario determinista y con casos sintéticos adicionales de nivel `medium`, cambio de base, duplicados y evidencia insuficiente antes de congelarse.
