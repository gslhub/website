# Codebook operativo CR — Citación del objetivo

**Métrica:** Citation Rate (CR)  
**Versión:** 0.1.0  
**Código de definición:** GSL-MDEF-CR-0001  
**Estado:** Under review  
**Fecha:** 3 de agosto de 2026

## 1. Objetivo

Este codebook define cómo identificar, extraer y validar citas del objetivo evaluado para calcular CR de forma reproducible.

CR mide si el sistema presenta al objetivo como fuente o referencia visible en cada ejecución elegible. No mide si la cita respalda correctamente una afirmación, si es autoritativa, prominente o favorable.

## 2. Unidad de codificación

La unidad analítica de CR es una ejecución controlada elegible.

Cada ejecución recibe un resultado:

```text
1 = existe al menos una cita aceptada del objetivo
0 = no existe ninguna cita aceptada del objetivo
X = ejecución no codificable o excluida
```

Las múltiples citas del mismo objetivo dentro de una ejecución no aumentan el numerador más de una vez.

## 3. Superficies que deben revisarse

El revisor debe inspeccionar y preservar, cuando estén disponibles:

- cuerpo de la respuesta;
- enlaces inline;
- referencias finales;
- tarjetas de fuente;
- panel o carrusel de fuentes;
- tablas y listas;
- elementos desplegables de la interfaz;
- destino visible de los enlaces.

No debe inferirse ausencia de cita sin revisar todas las superficies que el protocolo exige capturar.

## 4. Qué cuenta como cita

Cuenta como cita cuando existe una fuente visible e identificable presentada por el sistema mediante:

- cita inline;
- referencia final;
- tarjeta de fuente;
- elemento del panel de fuentes;
- mención enlazada con función de atribución;
- referencia no enlazada situada claramente en una sección de fuentes.

La cita debe poder relacionarse con una ejecución concreta y con evidencia preservada.

## 5. Qué no cuenta como cita

No cuenta para CR:

- una simple mención del objetivo sin función de fuente;
- el objetivo únicamente dentro del prompt;
- texto de la barra de direcciones;
- historial del navegador;
- metadatos ocultos o logs internos;
- una fuente recuperada pero no mostrada al usuario;
- una coincidencia de dominio, entidad o nombre que no corresponda al objetivo;
- una sugerencia del navegador o extensión ajena al sistema evaluado.

## 6. Identidad del objetivo

Antes de codificar debe existir un diccionario congelado con:

```text
targetType
targetValue
canonicalName
acceptedAliases
acceptedDomains
acceptedSubdomains
acceptedRedirects
rejectedMatches
languageRules
normalizationVersion
```

### Normalización básica de URL

Para comparar URLs o dominios:

1. convertir el host a minúsculas;
2. eliminar el punto final del host;
3. tratar `www.` según la regla congelada;
4. normalizar protocolo cuando no cambie la identidad;
5. ignorar fragmentos;
6. ignorar parámetros de tracking definidos previamente;
7. conservar path y subdominio cuando formen parte de la identidad relevante;
8. registrar redirecciones, no asumir equivalencia sin evidencia.

## 7. Campos mínimos de Citation

Cada Citation candidata debe registrar, cuando corresponda:

```text
promptExecution
citationType
citationPosition
sourceTitle
sourceUrl
normalizedUrl
sourceDomain
citationContext.displayText
citationContext.location
targetCoding.targetType
targetCoding.targetValue
targetCoding.isEvaluatedTarget
targetCoding.targetMatchType
qualityControl.reviewStatus
evidence
```

## 8. Tipos de coincidencia

| `targetMatchType` | Uso |
| --- | --- |
| `exact` | Nombre, URL o identificador exacto predefinido. |
| `domain` | Dominio o subdominio aceptado por el diccionario. |
| `entity` | Entidad inequívocamente equivalente al objetivo. |
| `semantic` | Solo para temas o conceptos con regla metodológica previa. |
| `unclear` | Coincidencia ambigua; requiere adjudicación. |
| `none` | No corresponde al objetivo. |

Una coincidencia `semantic` no debe utilizarse para ampliar retrospectivamente una organización, persona o dominio.

## 9. Casos positivos

| Caso | Decisión |
| --- | --- |
| Enlace inline al dominio objetivo | Cita positiva |
| Tarjeta de fuente con el dominio objetivo | Cita positiva |
| Referencia final con título y URL del objetivo | Cita positiva |
| Panel de fuentes con una página del objetivo | Cita positiva |
| Nombre de la organización enlazado a su web como fuente | Cita positiva |
| Varias páginas del objetivo en la misma ejecución | Ejecución positiva una sola vez; conservar todas las citas |
| URL objetivo que después deja de resolver, pero fue preservada en la captura | Cita positiva; documentar verificación posterior |

## 10. Casos negativos

| Caso | Decisión |
| --- | --- |
| Objetivo mencionado en el texto sin referencia | No es cita |
| Panel de fuentes con competidores, no con el objetivo | CR = 0 |
| Homónimo o dominio diferente | No coincide |
| Fuente visible solo en una extensión del navegador | No es parte del sistema |
| Página recuperada en un log pero no mostrada | No es cita visible |
| Coincidencia ambigua adjudicada como falsa | No coincide |

## 11. Casos ambiguos

Marcar `revision-required` cuando exista:

- URL acortada sin destino verificable;
- redirección no documentada;
- nombre compartido por varias entidades;
- dominio de una matriz o filial sin regla previa;
- captura parcial del panel de fuentes;
- icono o favicon sin texto suficiente;
- referencia textual sin identidad comprobable;
- discrepancia entre título, dominio y URL final.

La adjudicación debe conservar el razonamiento y la evidencia utilizada.

## 12. Relación entre Observation y Citations

La Observation resume la ejecución mediante:

```text
visibilityCoding.cited
```

La regla de consistencia es:

```text
visibilityCoding.cited = true
↔ existe al menos una Citation aceptada con isEvaluatedTarget = true
```

Cuando no exista concordancia, la Observation o las Citations deben pasar a `revision-required` antes de calcular CR.

## 13. Evidencia y verificación

La evidencia debe permitir comprobar:

- que la cita era visible;
- su posición y tipo;
- la identidad presentada;
- la ejecución a la que pertenece;
- el contexto de interfaz.

`verification.supportsClaim` se codifica aparte. Una cita puede contar para CR aunque no respalde la afirmación, porque CR mide ocurrencia de atribución. Esa deficiencia debe reflejarse en las métricas o análisis de calidad correspondientes.

## 14. Árbol de decisión

```text
¿La ejecución es elegible y la interfaz fue capturada completamente?
├─ No → X; documentar exclusión o falta de codificabilidad
└─ Sí
   ¿Existe alguna fuente o referencia visible?
   ├─ No → CR = 0
   └─ Sí
      ¿Alguna coincide con el objetivo mediante una regla congelada?
      ├─ Sí → crear Citation(s), aceptar tras revisión y CR = 1
      ├─ No → CR = 0
      └─ Ambiguo → revision-required y adjudicación
```

## 15. Procedimiento de codificación

1. Confirmar ejecución, protocolo y evidencia.
2. Revisar todas las superficies de fuentes.
3. Extraer una Citation por cada fuente visible diferenciable.
4. Preservar texto, URL, dominio, posición y contexto.
5. Aplicar el diccionario de identidad sin consultar el resultado del otro revisor.
6. Marcar `isEvaluatedTarget` y `targetMatchType`.
7. Completar control de calidad.
8. Resolver casos ambiguos.
9. Comprobar concordancia con `visibilityCoding.cited`.
10. Reducir la ejecución a 1, 0 o X.

## 16. Doble codificación

En el primer piloto, dos revisiones independientes deben comprobar:

- inventario de fuentes visibles;
- identidad del objetivo;
- tipo de cita;
- posición;
- decisión binaria por ejecución.

Registrar acuerdo bruto, desacuerdos y adjudicación. Con cinco ejecuciones, las estadísticas corregidas por azar deben interpretarse con cautela.

## 17. Reporte mínimo

```text
N_planificadas
N_completadas
N_elegibles
N_ejecuciones_citadas
N_ejecuciones_no_citadas
N_excluidas
N_citas_objetivo_total
CR = N_ejecuciones_citadas / N_elegibles
```

Informar también:

- objetivo y reglas de normalización;
- tipos de cita observados;
- lista de ejecuciones positivas y negativas;
- citas ambiguas o rechazadas;
- capturas faltantes;
- prompt, sistema, fechas y versión de interfaz.

## 18. Checklist de aceptación

- [ ] Diccionario del objetivo congelado.
- [ ] Todas las superficies de fuentes revisadas.
- [ ] Cada fuente visible tiene Citation o justificación de exclusión.
- [ ] Evidencia enlazada.
- [ ] Coincidencia del objetivo revisada.
- [ ] `visibilityCoding.cited` concuerda con Citations.
- [ ] Doble revisión completada.
- [ ] Ambigüedades adjudicadas.
- [ ] Numerador y denominador recontados.
- [ ] CR recalculada independientemente.
- [ ] Recuentos brutos incluidos en el informe.

## 19. Estado de aprobación

Este codebook permanece **Under review**. Debe probarse con datos sintéticos y con la primera ronda controlada antes de congelarse como versión `1.0.0`.
