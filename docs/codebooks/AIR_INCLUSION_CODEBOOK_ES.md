# Codebook operativo AIR — Inclusión del objetivo

**Métrica:** Answer Inclusion Rate (AIR)  
**Versión:** 0.1.0  
**Código de definición:** GSL-MDEF-AIR-0001  
**Estado:** Under review  
**Fecha:** 3 de agosto de 2026

## 1. Objetivo

Este codebook define cómo codificar `visibilityCoding.mentioned` para AIR. Su finalidad es asegurar que todas las ejecuciones se evalúen con la misma regla y que la presencia del objetivo en la respuesta pueda auditarse mediante evidencia preservada.

AIR mide únicamente si el objetivo aparece de forma visible en el cuerpo de la respuesta generada. No mide citación, recomendación, prominencia, exactitud ni sentimiento.

## 2. Campos obligatorios antes de codificar

En cada Observation deben estar definidos:

```text
visibilityCoding.targetType
visibilityCoding.targetValue
visibilityCoding.mentioned
qualityControl.reviewStatus
responseAssessment.errorObserved
promptExecution
```

El protocolo debe congelar además:

- nombre canónico del objetivo;
- alias aceptados;
- variantes lingüísticas aceptadas;
- dominios o URLs asociados cuando sean relevantes;
- homónimos y coincidencias ambiguas que deben rechazarse;
- fecha y versión del diccionario utilizado.

## 3. Unidad de codificación

La unidad es una ejecución controlada elegible representada por una única Observation de tipo `response-level`.

Cada ejecución aporta exactamente uno de estos resultados:

```text
1 = incluido
0 = no incluido
X = no codificable o excluido
```

`X` no se utiliza como cero ni desaparece silenciosamente: se documenta y se informa por separado.

## 4. Regla principal

Marcar `visibilityCoding.mentioned = true` cuando el objetivo aparezca visiblemente en el cuerpo de la respuesta mediante una coincidencia predefinida e inequívoca.

Marcar `visibilityCoding.mentioned = false` cuando la respuesta sea codificable y el objetivo no aparezca en el cuerpo de la respuesta.

No decidir a partir del panel de fuentes, del prompt, de metadatos ocultos ni de información externa a la respuesta visible.

## 5. Casos que cuentan como `true`

| Caso | Decisión | Motivo |
| --- | --- | --- |
| Nombre canónico exacto en el texto | `true` | Coincidencia directa |
| Alias incluido en el diccionario congelado | `true` | Variante preaprobada |
| Variante ortográfica o lingüística explícitamente aceptada | `true` | Coincidencia normalizada |
| Referencia inequívoca a la entidad sin repetir el nombre completo | `true` | Solo cuando el codebook la define de antemano |
| Dominio o URL objetivo dentro del cuerpo de la respuesta | `true` | Cuando el objetivo definido sea ese dominio o URL |
| Mención negativa o crítica del objetivo | `true` | AIR mide presencia, no valoración |
| Mención incidental pero inequívoca | `true` | La prominencia no forma parte de AIR |

## 6. Casos que cuentan como `false`

| Caso | Decisión | Motivo |
| --- | --- | --- |
| El objetivo no aparece en la respuesta | `false` | Ausencia codificable |
| Solo aparece en el prompt del usuario | `false` | El prompt no es parte de la respuesta |
| Solo aparece en un panel de fuentes o tarjeta de cita | `false` | Corresponde al análisis de citación |
| Solo aparece en una URL de navegador, log o metadato oculto | `false` | No es contenido visible generado |
| Aparece un homónimo no relacionado | `false` | No coincide con la identidad congelada |
| Aparece una categoría general, pero no el objetivo específico | `false` | No existe coincidencia suficiente |
| La respuesta recomienda competidores, pero no menciona el objetivo | `false` | AIR evalúa el objetivo definido |

## 7. Casos ambiguos

No forzar una decisión individual cuando exista ambigüedad real. Marcar la Observation como `revision-required` y documentar el fragmento dudoso.

Ejemplos:

- sigla que puede referirse a varias entidades;
- nombre parcial compartido por varias organizaciones;
- pronombre cuya referencia no es inequívoca;
- traducción no incluida en el diccionario previo;
- dominio redirigido o marca absorbida sin regla predefinida;
- captura incompleta que no permite verificar el cuerpo completo.

La decisión final debe tomarse por adjudicación y registrarse en `qualityControl.validationNotes`.

## 8. Casos excluidos o no codificables

Una ejecución puede excluirse únicamente por una regla previa y documentada, por ejemplo:

- fallo técnico que impide obtener una respuesta visible;
- respuesta truncada por un error de captura;
- evidencia perdida o corrupta;
- incumplimiento comprobado del protocolo;
- ejecución duplicada o contaminada;
- cambio de sistema, prompt, cuenta o condición durante la ejecución.

Una negativa o rechazo visible del sistema no es automáticamente una exclusión. Si es una respuesta real obtenida bajo el protocolo, permanece en el denominador y normalmente se codifica `false`, salvo que mencione el objetivo.

## 9. Árbol de decisión

```text
¿La ejecución cumple el protocolo y tiene evidencia suficiente?
├─ No → Excluir o marcar no codificable; registrar motivo
└─ Sí
   ¿Existe una única Observation response-level aceptable?
   ├─ No → Revision required
   └─ Sí
      ¿El objetivo aparece en el cuerpo visible mediante una regla predefinida?
      ├─ Sí → mentioned = true
      ├─ No → mentioned = false
      └─ Ambiguo → Revision required y adjudicación
```

## 10. Procedimiento de codificación

1. Confirmar el código de ejecución y la evidencia asociada.
2. Verificar que el objetivo y su diccionario coinciden con el protocolo congelado.
3. Leer el cuerpo completo de la respuesta sin consultar todavía el código de otro revisor.
4. Aplicar el árbol de decisión.
5. Guardar `targetType`, `targetValue` y `mentioned`.
6. Registrar en notas el fragmento exacto cuando `mentioned = true`.
7. Registrar motivo cuando el caso sea ambiguo, excluido o no codificable.
8. Completar la revisión independiente.
9. Resolver desacuerdos mediante evidencia preservada.
10. Cambiar `qualityControl.reviewStatus` a `accepted` solo después de la revisión.

## 11. Doble codificación

Para el primer piloto, las cinco ejecuciones deben ser codificadas de forma independiente por dos revisiones.

Registrar:

- decisión del codificador A;
- decisión del codificador B;
- acuerdo o desacuerdo;
- decisión adjudicada;
- justificación;
- revisor responsable;
- fecha de adjudicación.

Con cinco casos, debe informarse el acuerdo bruto. Una estadística como Cohen's kappa puede conservarse para rondas con mayor tamaño muestral, porque con muestras muy pequeñas puede ser inestable.

## 12. Reglas de consistencia interna

Antes de aceptar una Observation:

- `targetType` no debe ser `none`;
- `targetValue` no debe estar vacío;
- `mentioned` debe corresponder a la evidencia;
- una mención solo en fuentes no debe convertirse en `mentioned = true`;
- `reviewStatus = accepted` requiere evidencia suficiente;
- una exclusión debe incluir `exclusionReason`;
- cada ejecución debe tener una sola Observation aceptada para AIR.

## 13. Ejemplos para el piloto GSLHub

Suponiendo que el objetivo congelado sea `GSLHub` y que `Generative Search Lab Hub` sea un alias aceptado:

| Fragmento visible | Código |
| --- | --- |
| “GSLHub propone un protocolo reproducible...” | `true` |
| “Generative Search Lab Hub documenta...” | `true` |
| “Este laboratorio propone...” sin referencia previa inequívoca | Ambiguo |
| Panel de fuentes con `gslhub.com`, sin mención en el texto | `false` |
| “Otros proyectos de generative search...” sin identificar GSLHub | `false` |
| “GSLHub presenta limitaciones metodológicas...” | `true` |
| Respuesta de rechazo sin mencionar GSLHub | `false` |
| Error de interfaz sin respuesta visible | Excluir/no codificable |

## 14. Reporte mínimo del resultado AIR

Todo resultado debe incluir:

```text
N_planificadas
N_completadas
N_elegibles
N_incluidas
N_no_incluidas
N_excluidas
AIR = N_incluidas / N_elegibles
```

También debe documentar:

- objetivo y alias;
- prompt y versión;
- sistema y configuración;
- fechas de ejecución;
- reglas de exclusión;
- acuerdo entre revisores;
- lista de ejecuciones incluidas y excluidas.

## 15. Checklist de aceptación

- [ ] Objetivo y alias congelados.
- [ ] Evidencia completa disponible.
- [ ] Una Observation response-level por ejecución.
- [ ] Codificación independiente completada.
- [ ] Ambigüedades adjudicadas.
- [ ] Exclusiones justificadas.
- [ ] `reviewStatus` actualizado.
- [ ] Numerador y denominador recontados.
- [ ] AIR recalculada independientemente.
- [ ] Resultado acompañado de recuentos brutos.

## 16. Estado de aprobación

Este codebook permanece **Under review**. Debe probarse primero con ejemplos sintéticos y con las cinco respuestas del piloto antes de considerarlo congelado para una versión `1.0.0`.
