# Codebook operativo MCP — Posición de la cita del objetivo

**Métrica:** Mean Citation Position (MCP)  
**Versión:** 0.1.0  
**Código de definición:** GSL-MDEF-MCP-0001  
**Estado:** Under review  
**Fecha:** 3 de agosto de 2026

## 1. Objetivo

Este codebook define cómo asignar `citationPosition` para calcular MCP de forma consistente y auditable.

MCP utiliza la posición de la **primera cita válida del objetivo** en cada ejecución citada. No evalúa frecuencia de citación, respaldo, autoridad, exactitud ni calidad.

## 2. Unidad de codificación

La unidad es una ejecución controlada elegible que contiene al menos una Citation aceptada del objetivo en la superficie primaria.

Cada ejecución recibe uno de estos resultados:

```text
1, 2, 3... = primera posición válida del objetivo
NA           = el objetivo no fue citado
X            = citado, pero la posición no es observable o la ejecución está excluida
```

`NA` no equivale a cero y no entra en el denominador de MCP. `X` debe documentarse y reportarse por separado.

## 3. Ficha de superficie obligatoria

Antes de ejecutar la ronda debe completarse:

```text
systemCode
visibleInterfaceVersion
primaryCitationSurface
orderingConvention
captureMethod
captureViewport
locale
timezone
roundStartDate
```

Valores admitidos para `primaryCitationSurface`:

```text
inline
end-references
source-cards
sources-panel
other-predefined
```

No cambiar la superficie primaria después de observar los resultados.

## 4. Regla principal

Para cada ejecución:

1. identificar todas las Citations aceptadas del objetivo;
2. conservar solo las que pertenecen a la superficie primaria;
3. eliminar representaciones duplicadas del mismo elemento visual;
4. ordenar las citas según la convención congelada;
5. asignar a la ejecución la posición más temprana.

```text
P_i = min(citationPosition de las citas válidas del objetivo)
```

## 5. Convenciones por superficie

### Inline

- recorrer el cuerpo de arriba hacia abajo;
- dentro del mismo bloque, de izquierda a derecha;
- numerar los marcadores visibles desde 1;
- si varios marcadores aparecen juntos, seguir el orden mostrado por la interfaz.

### End references

- utilizar el número de referencia cuando esté visible;
- en ausencia de numeración, utilizar el orden visual de la lista;
- no reordenar por dominio, título ni URL.

### Source cards

- utilizar el orden inicial mostrado;
- en cuadrículas: arriba-abajo y después izquierda-derecha dentro de cada fila visual;
- documentar viewport y tamaño de ventana cuando afecten la cuadrícula.

### Sources panel o carrusel

- preservar el estado inicial antes de interactuar;
- registrar el orden completo que expone la interfaz;
- en carruseles, continuar la secuencia según el desplazamiento natural;
- no ordenar manualmente ni aplicar filtros durante la captura.

## 6. Varias citas del objetivo

Ejemplo:

```text
Posiciones del objetivo en una ejecución: 2, 5, 7
Posición usada por MCP: 2
```

Las posiciones adicionales se conservan en Citations y pueden reportarse, pero no aumentan el peso de la ejecución.

## 7. Varias URLs o entidades del mismo objetivo

Cuando el objetivo sea una organización o dominio y aparezcan varias páginas válidas:

```text
posición 2 → gslhub.com/research
posición 4 → gslhub.com/benchmarks
```

Ambas son Citations del objetivo, pero la ejecución aporta `P_i = 2`.

La equivalencia debe estar cubierta por el diccionario de identidad aprobado para CR.

## 8. Duplicados de interfaz

No contar dos veces el mismo elemento cuando:

- una tarjeta se repite por adaptación responsive;
- el mismo nodo visual aparece duplicado en el DOM;
- una animación o carrusel vuelve a mostrar el mismo elemento;
- una captura solapada contiene la misma tarjeta dos veces.

No deduplicar automáticamente citas distintas solo porque compartan dominio. URLs diferentes pueden representar fuentes distintas.

Registrar la decisión de deduplicación en `integrity.normalizationNotes` o `qualityControl.validationNotes`.

## 9. Superficies secundarias

Si una cita aparece inline y también en el panel:

- crear o conservar las representaciones necesarias para auditar ambas superficies;
- usar para MCP únicamente la superficie primaria;
- no elegir retrospectivamente la superficie que produzca la mejor posición;
- informar la superficie secundaria como dato descriptivo.

## 10. Casos ambiguos

Marcar `revision-required` cuando:

- el orden visual cambia según viewport y no estaba congelado;
- un carrusel no permite determinar el orden completo;
- varias tarjetas se solapan o cargan de forma progresiva;
- la captura comienza después de una interacción no documentada;
- `citationPosition` no coincide entre Observation y Citation;
- no está claro si dos representaciones son duplicadas;
- la interfaz cambió durante la ronda.

Resolver mediante adjudicación y evidencia preservada. No inventar una posición.

## 11. Casos no aplicables y excluidos

| Caso | Tratamiento |
| --- | --- |
| Ejecución válida sin cita del objetivo | `NA`; fuera de MCP, permanece en CR con cero |
| Cita del objetivo con posición observable | Incluir en MCP |
| Cita visible pero orden no observable | `X`; reportar por separado |
| Evidencia incompleta | `revision-required` o exclusión justificada |
| Cambio de interfaz no previsto | Separar estrato o excluir según protocolo |
| Ejecución inválida para el análisis general | Excluir de CR y MCP |

## 12. Campos mínimos de Citation

```text
promptExecution
citationType
citationPosition
citationContext.location
sourceUrl
normalizedUrl
sourceDomain
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget
targetCoding.targetMatchType
qualityControl.reviewStatus
evidence
```

## 13. Controles de consistencia

Antes de aceptar una posición:

- `citationPosition >= 1` y debe ser entero;
- `isEvaluatedTarget = true`;
- `targetMatchType` no debe ser `none` ni `unclear` sin adjudicación;
- la Citation debe pertenecer a la misma ejecución y contexto científico;
- la superficie debe coincidir con el protocolo;
- la posición debe verse en la evidencia;
- `Observations.visibilityCoding.cited` debe ser `true`;
- solo una posición por ejecución entra en MCP;
- la posición seleccionada debe ser la mínima válida.

## 14. Árbol de decisión

```text
¿La ejecución está incluida en el análisis general?
├─ No → Excluir de CR y MCP
└─ Sí
   ¿Existe una cita aceptada del objetivo?
   ├─ No → NA para MCP; cero para CR
   └─ Sí
      ¿Pertenece a la superficie primaria?
      ├─ No → Conservar como dato secundario
      └─ Sí
         ¿El orden es observable y auditable?
         ├─ No → X / revision-required
         └─ Sí
            Deduplicar → ordenar → elegir posición mínima
```

## 15. Doble revisión

Para el primer piloto:

1. un revisor asigna posiciones sin consultar la codificación previa;
2. una segunda revisión verifica superficie, orden, duplicados y posición mínima;
3. se comparan las decisiones;
4. los desacuerdos se adjudican con evidencia;
5. se registra acuerdo bruto y motivo de cada corrección.

## 16. Cálculo

Después de revisar todas las ejecuciones:

```text
positions = [P_1, P_2, ..., P_n]
sumPositions = Σ positions
MCP = sumPositions / n
```

Si `n = 0`:

```text
MCP = no estimable
```

No utilizar `0`, `null` interpretado como cero ni una posición de penalización.

## 17. Escenario sintético actual

```text
Ejecución citada 1 → posición 1
Ejecución citada 2 → posición 2
Ejecución citada 3 → posición 3

Suma = 6
N_con_posición = 3
MCP = 2,00
```

Casos que deben añadirse a futuras pruebas:

- dos citas del objetivo en una ejecución;
- cita repetida en tarjeta y panel;
- ejecución sin citas;
- cita con posición no observable;
- cambio de superficie;
- cuadrícula responsive.

## 18. Reporte mínimo

```text
N_planificadas
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

En muestras mayores añadir mediana, mínimo, máximo y desviación o rango intercuartílico.

## 19. Checklist de aceptación

- [ ] Superficie primaria congelada.
- [ ] Convención de orden documentada.
- [ ] Interfaz y viewport registrados.
- [ ] Citas del objetivo aceptadas mediante CR.
- [ ] Duplicados revisados.
- [ ] Posición mínima seleccionada por ejecución.
- [ ] Evidencia disponible para cada posición.
- [ ] Doble revisión completada.
- [ ] Casos `NA` y `X` reportados.
- [ ] Suma y media recalculadas independientemente.
- [ ] MCP presentada junto con CR.

## 20. Estado de aprobación

Este codebook permanece **Under review**. Debe probarse con los casos adicionales y con la superficie real de ChatGPT Search antes de congelar MCP v0.1.0.
