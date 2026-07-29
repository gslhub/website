# Codebook de observaciones y citas de GSLHub

**Documento:** GSLHub Observation and Citation Codebook  
**Versión:** 0.1.0  
**Estado:** Candidato para validación del primer piloto  
**Idioma de referencia:** Español  
**Ámbito inicial:** GSL-GEO-BENCH-01 / GSL-EXP-GEO-001  

## 1. Objetivo

Este codebook establece las reglas de codificación, revisión, inclusión, exclusión y validación para las colecciones `Observations` y `Citations` de GSLHub.

Su finalidad es asegurar que dos revisores que examinen la misma ejecución, respuesta y evidencia puedan producir registros comparables, trazables y reproducibles.

El documento se aplica conjuntamente con:

- el protocolo del benchmark;
- la definición versionada de cada métrica;
- la evidencia preservada de la interfaz y la respuesta;
- las reglas de integridad implementadas en el CMS;
- las notas específicas del experimento.

Cuando una regla específica del experimento sea más restrictiva que este codebook, prevalece la regla específica y debe quedar documentada.

## 2. Principios de codificación

1. **Codificar lo observado, no lo esperado.** No se infiere una cita, recomendación o fuente que no sea visible o verificable en la evidencia.
2. **Separar captura, codificación y validación.** La persona que captura puede codificar, pero la aceptación final requiere revisión documentada.
3. **Mantener la unidad de análisis.** Cada observación primaria corresponde a una única ejecución de prompt.
4. **No modificar silenciosamente registros validados.** Una corrección sustantiva exige una nueva observación o cita, o la exclusión/rechazo de la anterior.
5. **Preservar la representación original.** Antes de normalizar URL, dominio o texto, debe conservarse el texto visible original cuando exista.
6. **Documentar la incertidumbre.** Cuando la evidencia no permite decidir, se usa el estado de revisión o la categoría `unclear`, no una inferencia forzada.
7. **Distinguir mención, cita y recomendación.** Son fenómenos relacionados, pero no equivalentes.

## 3. Unidades científicas

### 3.1 Prompt Execution

Una ejecución es una sesión controlada de un prompt exacto en un sistema de IA identificado, bajo unas condiciones de acceso y entorno documentadas.

### 3.2 Observation

Una observación es la codificación estructurada de una ejecución y su respuesta visible.

Para el piloto se admite como máximo una observación primaria `response-level` aceptada por ejecución y ronda de codificación. Las observaciones comparativas deben relacionarse explícitamente con una observación baseline.

### 3.3 Citation

Una cita es una representación visible mediante la cual el sistema atribuye, enlaza, enumera o presenta una fuente identificable.

Una cita no es lo mismo que:

- una mención de marca sin atribución;
- un dominio escrito como parte del texto sin función de fuente;
- una inferencia del investigador sobre qué fuente pudo utilizar el sistema;
- una URL que aparece únicamente en datos internos no visibles para el usuario.

## 4. Flujo de trabajo

### 4.1 Observations

```text
Planned → Coding → Coded → Under review → Validated
                                  └──────→ Excluded
Validated → Excluded → Archived
Validated ─────────────→ Archived
```

- `planned`: registro reservado, sin codificación terminada.
- `coding`: codificación en curso.
- `coded`: codificación primaria terminada, todavía no revisada.
- `under-review`: revisión científica o control de calidad en curso.
- `validated`: codificación aceptada y congelada.
- `excluded`: registro conservado, pero no elegible para el análisis declarado.
- `archived`: registro histórico retirado del flujo activo.

### 4.2 Citations

```text
Captured → Under review → Validated
                       └→ Rejected
Validated → Rejected → Archived
Validated ───────────→ Archived
```

- `captured`: fuente visible registrada, pendiente de comprobación.
- `under-review`: normalización, verificación o revisión en curso.
- `validated`: cita verificada y aceptada; su snapshot queda congelado.
- `rejected`: la representación no cumple la definición de cita o no puede verificarse adecuadamente.
- `archived`: registro histórico retirado del flujo activo.

## 5. Reglas para Observations

## 5.1 Identificación y contexto

- `observationCode` debe seguir `GSL-OBS-<ÁMBITO>-0001`.
- El código queda reservado al crear el registro y no puede reutilizarse.
- `promptExecution` es obligatorio.
- `project`, `benchmark`, `experiment`, `prompt` y `aiSystem` deben heredarse de la ejecución.
- `codedBy` identifica a la persona que realizó la codificación primaria.
- `codedAt` registra el momento en que finalizó la codificación.

## 5.2 Observation Type

| Valor | Uso |
| --- | --- |
| `response-level` | Codificación principal de la respuesta y experiencia visible. |
| `execution-quality` | Incidencias técnicas o de calidad de la ejecución. |
| `comparative` | Comparación contra una observación baseline. |
| `other` | Solo cuando ninguna categoría anterior es adecuada; requiere explicación. |

## 5.3 Response Assessment

### Relevance Level

- `high`: responde directamente al objetivo principal del prompt.
- `medium`: responde al objetivo, pero con desviaciones o contenido secundario relevante.
- `low`: relación débil o parcial con el objetivo.
- `none`: no responde de forma material al objetivo.

### Completeness

- `complete`: cubre los componentes esenciales solicitados.
- `partial`: cubre una parte sustantiva, pero omite componentes relevantes.
- `minimal`: contiene una respuesta utilizable muy limitada.
- `empty`: no existe contenido analizable.

### Refusal Observed

Se marca cuando el sistema rechaza explícitamente realizar la tarea o proporcionar la información solicitada.

No se marca por una simple cautela, limitación o advertencia si el sistema continúa respondiendo materialmente.

### Error Observed

Se marca cuando la ejecución presenta un error técnico, respuesta rota, interrupción o resultado que no puede considerarse una respuesta normal del sistema.

### Language Detected

Se registra mediante código de idioma BCP 47 o ISO cuando sea posible, por ejemplo `en`, `es` o `es-ES`.

### Word Count

Cuenta las palabras visibles de la respuesta preservada. No incluye elementos de navegación, metadatos de la interfaz ni paneles de fuentes, salvo que el protocolo específico indique lo contrario.

## 5.4 Citation Assessment

### Explicit Citations Present

`true` cuando la experiencia visible contiene al menos una atribución, referencia, tarjeta, enlace o elemento de fuentes que funciona como cita.

### Source Links Present

`true` cuando existe al menos un enlace visible o activable hacia una fuente.

### Sources Panel Present

`true` cuando la interfaz muestra un panel, carrusel, lista o módulo separado de fuentes.

### Visible Citation Count

Número de elementos de cita visibles para el usuario en la evidencia capturada. Los duplicados visibles se cuentan por posición; la deduplicación por URL o dominio se realiza en análisis posteriores.

### Unique Domain Count

Número de dominios normalizados distintos representados por las citas visibles.

### Citation Style

- `inline`: cita incorporada al cuerpo de la respuesta.
- `end-references`: referencias al final de la respuesta.
- `source-cards`: tarjetas, carrusel o panel de fuentes.
- `mixed`: combinación de dos o más estilos.
- `none`: no hay citas visibles.
- `other`: presentación no cubierta por las categorías anteriores.

## 5.5 Source Observations

Cada fila representa una fuente visible en la ejecución:

- `position`: orden visible, comenzando en 1;
- `title`: título mostrado, sin inventar títulos ausentes;
- `url`: URL visible o recuperada al abrir el elemento;
- `domain`: dominio normalizado en minúsculas, sin protocolo, `www.` ni barra final;
- `sourceType`: tipo de fuente según su función institucional o editorial;
- `citedExplicitly`: existe atribución visible;
- `linked`: el elemento permite acceder a una URL;
- `usedInAnswer`: la interfaz o el contexto permiten vincularlo con el contenido de la respuesta;
- `notes`: decisiones de normalización o ambigüedades.

Las posiciones deben ser positivas y no deben repetirse dentro de una misma lista visible.

## 5.6 Visibility Coding

### Target Type y Target Value

El objetivo evaluado puede ser un dominio, URL, organización, persona, producto/servicio o tema.

Cuando `targetType` no sea `none`, `targetValue` es obligatorio.

Normalización inicial para dominios:

1. eliminar espacios externos;
2. convertir a minúsculas;
3. eliminar `http://` o `https://`;
4. eliminar `www.` inicial;
5. eliminar una barra final;
6. conservar subdominios cuando sean parte del objetivo declarado.

### Mentioned

Se marca `true` cuando el objetivo evaluado aparece de forma visible e identificable en la experiencia de respuesta capturada, ya sea en el texto, un enlace, una referencia o una presentación de fuente integrada.

No se marca por coincidencias ambiguas, homónimos no resolubles o inferencias basadas solo en contenido semánticamente parecido.

### Cited

Se marca `true` cuando el objetivo evaluado aparece como fuente o atribución explícita. Una cita implica una función de fuente; una mención simple no basta.

### Recommended

Se marca `true` cuando el sistema expresa una preferencia, consejo, selección o indicación normativa favorable hacia el objetivo.

- `weak`: inclusión favorable pero secundaria o condicionada.
- `moderate`: recomendación clara con reservas o junto a alternativas equivalentes.
- `strong`: recomendación principal, explícita o prioritaria.

Cuando `recommended = false`, `recommendationStrength` debe ser `none`.

### Posiciones

- `mentionPosition`: orden de la primera aparición identificable del objetivo.
- `citationPosition`: orden visible de la cita del objetivo.

Las posiciones se dejan vacías cuando el evento correspondiente no se observa.

## 5.7 Semantic Coding

- `themes`: temas materialmente presentes, expresados con etiquetas consistentes.
- `claimsCount`: número de afirmaciones verificables relevantes para el objetivo del experimento.
- `evidenceGrounding`: valoración de cuánto se apoya la respuesta en fuentes o evidencia visible.
- `semanticCoverageScore`: solo se utiliza cuando una rúbrica específica del protocolo define el cálculo de 0 a 100.

No se asigna una puntuación semántica ad hoc sin rúbrica versionada.

## 5.8 Comparison y RCR

- La observación baseline usa `variationLevel = not-assessed` y no se cuenta como comparación.
- Toda comparación evaluada debe relacionarse con `baselineObservation`.
- Una observación nunca puede compararse consigo misma.

Criterio inicial de variación:

| Nivel | Regla operativa |
| --- | --- |
| `none` | Sin diferencias materiales en afirmaciones, conclusión o tratamiento del objetivo. |
| `low` | Diferencias menores de redacción, orden o detalle sin cambiar la conclusión material. |
| `medium` | Cambios materiales parciales, pero se conserva la orientación principal de la respuesta. |
| `high` | Cambia la conclusión, el tratamiento del objetivo, las afirmaciones principales o el patrón de fuentes de forma sustantiva. |

Para RCR v0.1.0, `none` y `low` se consideran consistentes; `medium` y `high`, no consistentes.

## 5.9 Quality Control de Observations

### Validated

Una observación solo puede pasar a `validated` cuando:

- tiene `codedAt`;
- `reviewStatus = accepted`;
- existe al menos un reviewer;
- existe `validatedAt`;
- la codificación del objetivo es internamente coherente;
- una comparación evaluada tiene baseline;
- las notas permiten reconstruir cualquier decisión no evidente.

### Excluded

Una observación solo puede pasar a `excluded` cuando:

- `reviewStatus = excluded`;
- existe al menos un reviewer;
- existe una razón de exclusión concreta y auditable.

La exclusión no elimina el registro ni la evidencia.

## 6. Reglas para Citations

## 6.1 Identificación

- `citationCode` debe seguir `GSL-CIT-<ÁMBITO>-0001`.
- `citationPosition` comienza en 1 y representa el orden visible.
- `capturedAt` corresponde a la captura o extracción de la representación visible.
- `extractedBy` identifica a quien registró la cita.

## 6.2 Citation Type

| Valor | Definición |
| --- | --- |
| `inline` | Atribución o marcador dentro del cuerpo. |
| `end-reference` | Referencia situada al final de la respuesta. |
| `source-card` | Tarjeta individual de fuente. |
| `sources-panel` | Elemento dentro de un panel o lista de fuentes. |
| `linked-mention` | Mención enlazada que actúa como atribución o fuente. |
| `unlinked-reference` | Referencia identificable sin enlace. |
| `other` | Representación visible no cubierta por las anteriores. |

## 6.3 Citation Function

- `support`: respalda una afirmación concreta.
- `background`: aporta contexto general.
- `definition`: sustenta una definición.
- `evidence`: aporta datos, resultados o evidencia.
- `recommendation`: respalda una recomendación.
- `comparison`: respalda una comparación.
- `source-list`: aparece en la lista de fuentes sin vínculo claro con una afirmación.
- `unclear`: la función no puede determinarse con la evidencia disponible.

## 6.4 Normalización de fuente

### Source URL

Se conserva la URL observada en `sourceUrl` y se registra una forma canónica en `normalizedUrl`.

La normalización no debe eliminar parámetros que cambien el recurso científico identificado. Los parámetros puramente analíticos o de seguimiento pueden retirarse y la decisión debe documentarse.

### Source Domain

Se registra en minúsculas, sin protocolo, `www.` inicial ni barra final.

### DOI

Cuando exista DOI, debe almacenarse sin el prefijo de resolución cuando sea posible, por ejemplo `10.xxxx/xxxxx`.

### Source Type

La clasificación se basa en la naturaleza de la fuente, no en la opinión sobre su calidad.

## 6.5 Citation Context

- `displayText`: representación exacta visible de la cita, tarjeta o referencia.
- `anchorText`: texto enlazado cuando exista.
- `surroundingText`: fragmento suficiente para interpretar la función de la cita.
- `claimSupported`: afirmación concreta que la cita parece respaldar.
- `location`: posición estructural en la respuesta o interfaz.
- `prominence`: visibilidad relativa alta, estándar o baja.

No se debe parafrasear `displayText` ni `rawCitationText`.

## 6.6 Target Coding de Citation

`isEvaluatedTarget = true` solo cuando la cita corresponde al objetivo declarado del análisis.

Cuando sea `true`, son obligatorios:

- `targetType` distinto de `none`;
- `targetValue`;
- `targetMatchType` distinto de `none`.

Tipos de coincidencia:

- `exact`: coincidencia exacta del identificador o URL objetivo.
- `domain`: URL perteneciente al dominio objetivo.
- `entity`: coincidencia inequívoca de entidad.
- `semantic`: coincidencia conceptual aceptada por una regla específica del protocolo.
- `unclear`: posible coincidencia que requiere revisión; no debe contarse como positiva en métricas binarias hasta resolverse.

## 6.7 Verification

Para una cita validada debe registrarse:

- fecha de verificación;
- al menos un investigador verificador;
- valoración de `supportsClaim` distinta de `not-assessed`;
- estado de resolución y disponibilidad cuando exista URL;
- notas cuando la verificación no sea directa.

`urlResolved = true` exige `httpStatus` y `finalUrl`.

`supportsClaim`:

- `yes`: la fuente respalda materialmente la afirmación atribuida;
- `partial`: respalda solo una parte o requiere matices;
- `no`: no respalda la afirmación;
- `unclear`: la evidencia disponible no permite decidir.

Una cita puede ser visible y correctamente extraída aunque `supportsClaim = no`. La validez de la cita como representación y la calidad de su respaldo son dimensiones diferentes.

## 6.8 Integrity

- `rawCitationText`: representación exacta preservada antes de normalización.
- `checksumAlgorithm`: algoritmo usado sobre esa representación.
- `checksum`: hash calculado.
- `normalizationNotes`: transformaciones aplicadas a URL, dominio, título o representación.

Una cita validada requiere texto preservado y checksum.

## 6.9 Quality Control de Citations

### Validated

Una cita solo puede pasar a `validated` cuando:

- `reviewStatus = accepted`;
- existe al menos un reviewer;
- existe `validatedAt`;
- la fuente y su dominio son identificables;
- existe texto visible preservado;
- existe checksum;
- la verificación tiene fecha y responsable;
- `supportsClaim` ha sido evaluado;
- la codificación del target es coherente.

### Rejected

Una cita pasa a `rejected` cuando:

- no cumple la definición de cita;
- la representación corresponde a un duplicado incorrectamente creado;
- la fuente no puede identificarse con un mínimo suficiente;
- la evidencia demuestra que la extracción es errónea.

El rechazo requiere `reviewStatus = rejected` y al menos un reviewer.

## 7. Inclusión y exclusión analítica

## 7.1 Regla general de inclusión

Una observación es elegible para AIR, CR, MCP o RCR cuando:

1. su ejecución existe y está `completed`;
2. la observación está `validated`;
3. `qualityControl.reviewStatus = accepted`;
4. el target type y target value coinciden con la definición del cálculo;
5. no existe otra observación aceptada para la misma ejecución dentro del mismo cálculo;
6. los campos específicos requeridos por la métrica son codificables.

## 7.2 Motivos habituales de exclusión

- ejecución incompleta, fallida o no enlazada;
- observación no validada;
- revisión pendiente, rechazada o excluida;
- target ausente o no coincidente;
- resultado booleano no codificable;
- duplicación de observaciones para una ejecución;
- baseline ausente o incoherente en comparaciones;
- evidencia insuficiente para resolver la categoría requerida.

Toda exclusión debe aparecer en el resultado calculado o en sus metadatos de reproducibilidad.

## 8. Relación con las métricas v0.1.0

### AIR — Answer Inclusion Rate

- Denominador: observaciones elegibles y target-matched.
- Numerador: observaciones del denominador con `visibilityCoding.mentioned = true`.

### CR — Citation Rate

- Denominador: observaciones elegibles y target-matched.
- Numerador: observaciones del denominador en las que el objetivo está codificado como citado conforme al procedimiento versionado y respaldado por el registro de cita correspondiente cuando sea exigible.

### MCP — Mean Citation Position

- Población: citas validadas del objetivo evaluado incluidas por el procedimiento.
- Valor: media de `citationPosition`.
- Las posiciones empiezan en 1.

### RCR — Response Consistency Rate

- Denominador: comparaciones elegibles respecto a una única baseline congelada.
- Numerador: comparaciones con variación `none` o `low`.
- La baseline no entra en el denominador.

La definición versionada de la métrica prevalece cuando especifique reglas adicionales.

## 9. Procedimiento de doble revisión

Para el primer piloto:

1. el codificador primario completa la observación y las citas;
2. el revisor compara los registros con la respuesta y evidencia preservadas;
3. cualquier desacuerdo se documenta en notas de validación;
4. las diferencias se resuelven antes de marcar `accepted`;
5. el reviewer y la fecha quedan registrados;
6. después de `validated`, los campos científicos quedan congelados.

Cuando sea posible, se conservará una tabla de desacuerdos para mejorar futuras versiones del codebook.

## 10. Checklist de validación

### Observation

- [ ] Código científico correcto y no `TEST-` para datos reales.
- [ ] Ejecución y contexto heredados correctamente.
- [ ] Respuesta y evidencia accesibles.
- [ ] `codedAt` y `codedBy` completos.
- [ ] Evaluación de respuesta completa.
- [ ] Evaluación de citas coherente con la interfaz.
- [ ] Target type y value correctos.
- [ ] Mención, cita y recomendación diferenciadas.
- [ ] Posiciones vacías cuando el evento no existe.
- [ ] Comparación enlazada a baseline cuando procede.
- [ ] Reviewer y decisión de control de calidad registrados.
- [ ] Razón de exclusión documentada cuando procede.

### Citation

- [ ] Código y posición correctos.
- [ ] Representación visible preservada.
- [ ] URL original y normalizada documentadas cuando existen.
- [ ] Dominio normalizado.
- [ ] Tipo y función de cita codificados.
- [ ] Contexto y afirmación respaldada documentados.
- [ ] Target match resuelto.
- [ ] Verificación, responsable y fecha completos.
- [ ] `supportsClaim` evaluado.
- [ ] Checksum calculado.
- [ ] Reviewer y decisión final registrados.

## 11. Gestión de cambios

Este documento utiliza versionado semántico:

- **patch**: aclaraciones sin cambiar decisiones de codificación;
- **minor**: nuevas categorías o reglas compatibles;
- **major**: cambios que alteran la clasificación de registros existentes o la comparabilidad de métricas.

Un cambio metodológico no debe aplicarse retroactivamente de forma silenciosa. Los registros existentes mantienen la versión de codebook usada y, cuando sea necesario, se recodifican en nuevos registros.

## 12. Historial

| Versión | Estado | Cambio |
| --- | --- | --- |
| 0.1.0 | Candidato para validación | Primera especificación formal de observaciones, citas, inclusión, exclusión y control de calidad para el piloto GSL-GEO-BENCH-01. |
