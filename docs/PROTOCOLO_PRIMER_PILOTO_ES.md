# Protocolo operativo del primer piloto de GSLHub

**Versión:** 0.1.0  
**Estado:** Candidato para aprobación antes de crear ejecuciones reales  
**Proyecto:** `GSL-GEO-BENCH-01`  
**Benchmark:** `GSL-BENCH-GEO-01` v0.1.0  
**Experimento:** `GSL-EXP-GEO-001`  
**Prompt:** `GSL-PROMPT-GEO-001` v0.1.0  
**Sistema:** `GSL-AISYS-001`  
**Repeticiones planificadas:** 5

## 1. Objetivo

Ejecutar cinco repeticiones controladas e independientes del mismo prompt en el mismo perfil de sistema, preservar la respuesta y la interfaz visible, codificar observaciones y citas mediante el codebook v0.1.0 y calcular AIR, CR, MCP y RCR mediante procedimientos deterministas.

Este piloto valida el procedimiento científico y operativo. No pretende estimar todavía el comportamiento general de todos los sistemas, idiomas, cuentas, ubicaciones o periodos.

## 2. Regla de inicio

No se crearán ni ejecutarán registros reales hasta que el endpoint administrativo:

```text
GET /api/test-data-batches/pilot-readiness
```

indique:

```json
{
  "scientificAndStorageReady": true
}
```

Antes de iniciar las sesiones debe indicar además:

```json
{
  "readyToRunExecutions": true,
  "executionInventory": {
    "plannedExecutions": 5,
    "expectedPlannedExecutions": 5
  }
}
```

El endpoint no sustituye la revisión humana. Confirma estados, relaciones, definiciones métricas, número de repeticiones y almacenamiento configurado.

## 3. Condiciones que deben estar congeladas

| Objeto | Estado requerido |
| --- | --- |
| Proyecto | `active` |
| Benchmark | `pilot` |
| Experimento | `ready` |
| Prompt | `validated` |
| Perfil del sistema | `active` |
| AIR v0.1.0 | `validated` o `active` |
| CR v0.1.0 | `validated` o `active` |
| MCP v0.1.0 | `validated` o `active` |
| RCR v0.1.0 | `validated` o `active` |
| Almacenamiento de artefactos | S3 compatible y recuperación probada |

Cualquier modificación metodológica posterior exige una nueva versión, no la edición silenciosa de los registros congelados.

## 4. Códigos de las ejecuciones

Crear exactamente:

```text
GSL-EXEC-GEO-0001
GSL-EXEC-GEO-0002
GSL-EXEC-GEO-0003
GSL-EXEC-GEO-0004
GSL-EXEC-GEO-0005
```

Cada registro debe usar:

- el mismo experimento;
- el mismo prompt y versión;
- el mismo perfil de AI System;
- números de repetición 1 a 5;
- estado inicial `planned`;
- `_status = draft` hasta finalizar la revisión científica.

No se admiten códigos `TEST-` en el piloto real.

## 5. Preparación del entorno

Antes de cada repetición:

1. comprobar fecha y hora local;
2. confirmar conexión estable;
3. cerrar sesiones anteriores del sistema evaluado;
4. abrir una sesión nueva y aislada;
5. confirmar que no existe conversación previa en esa sesión;
6. confirmar el modo de acceso definido en `GSL-AISYS-001`;
7. confirmar cuenta y nivel de suscripción;
8. confirmar idioma, ubicación y zona horaria;
9. confirmar si búsqueda web está habilitada;
10. confirmar que memoria y custom instructions cumplen el perfil congelado;
11. registrar cualquier cambio visible de interfaz o modelo antes de ejecutar.

Si una condición no coincide con el perfil congelado, no ejecutar. Crear o actualizar un perfil de sistema mediante una nueva versión cuando corresponda.

## 6. Orden de ejecución

Las repeticiones se ejecutan en orden del 1 al 5.

Para cada una:

1. abrir el registro `planned` correspondiente;
2. cambiar a `running` inmediatamente antes de enviar el prompt;
3. registrar `startedAt`;
4. copiar el prompt exacto desde el snapshot del registro;
5. no corregir, abreviar, traducir ni reformular;
6. enviar una única vez;
7. no utilizar regeneración de respuesta;
8. no hacer preguntas de seguimiento;
9. esperar a que termine la generación y la carga de fuentes;
10. registrar `completedAt` y duración;
11. preservar respuesta e interfaz antes de navegar fuera;
12. completar el registro y cambiar a `completed` solo si la captura es suficiente.

Entre repeticiones debe cerrarse la sesión evaluada y abrirse una nueva sesión independiente.

## 7. Captura obligatoria por ejecución

Crear como mínimo los siguientes Research Artifacts:

### 7.1 Respuesta textual

- tipo: `response-export`;
- formato preferente: texto plano, Markdown, HTML o JSON según disponibilidad;
- debe conservar la respuesta completa;
- no corregir ortografía ni formato;
- incluir el texto visible de citas y referencias.

### 7.2 Captura visual

- tipo: `screenshot` o `pdf`;
- incluir prompt, respuesta, indicadores de búsqueda y fuentes visibles;
- realizar capturas adicionales cuando la respuesta no quepa en una pantalla;
- preservar el panel de fuentes cuando exista.

### 7.3 Metadatos de ejecución

Registrar:

- sistema y proveedor;
- interfaz y versión visible;
- fecha y hora;
- cuenta o tier;
- locale y zona horaria;
- ubicación declarada;
- búsqueda web;
- modo de búsqueda;
- sesión nueva;
- memoria;
- instrucciones personalizadas;
- navegador y versión;
- dispositivo y viewport;
- incidencias visibles.

Cada archivo debe obtener SHA-256 automáticamente y quedar en almacenamiento duradero.

## 8. Criterios de ejecución válida

Una ejecución entra en análisis cuando:

- el prompt exacto fue enviado una sola vez;
- la sesión era nueva e independiente;
- las condiciones coinciden con el perfil congelado;
- el sistema terminó la respuesta;
- la respuesta es visible y preservable;
- los artefactos y metadatos permiten auditarla;
- el registro queda `completed`;
- el control de calidad de ejecución queda aceptado.

## 9. Criterios de exclusión

Conservar el registro, pero excluirlo del análisis cuando ocurra alguno de estos casos:

- prompt modificado o enviado parcialmente;
- sesión con contexto previo no controlado;
- memoria o instrucciones personalizadas activas contra el protocolo;
- perfil de sistema distinto del congelado;
- error técnico que impide obtener la respuesta;
- respuesta truncada sin posibilidad de preservar el resultado visible;
- pérdida o corrupción de la evidencia;
- duplicación accidental de la misma condición de repetición;
- intervención manual durante la generación;
- uso de regenerar respuesta;
- navegación o actualización que altera la respuesta antes de capturarla;
- cualquier desviación material documentada por el investigador.

La razón debe registrarse explícitamente. No se elimina la ejecución fallida.

Una repetición excluida no se sustituye silenciosamente. La decisión de repetir exige un nuevo código y una justificación metodológica.

## 10. Codificación de observaciones

Después de completar las cinco ejecuciones:

1. crear una observación primaria `response-level` por ejecución;
2. seguir `docs/CODEBOOK_OBSERVACIONES_CITAS_ES.md`;
3. codificar relevancia, completitud, rechazo y error;
4. codificar presencia y forma de citas;
5. registrar todas las fuentes visibles en `sourceObservations`;
6. codificar el target `gslhub.com`;
7. distinguir `mentioned`, `cited` y `recommended`;
8. registrar posiciones visibles;
9. codificar temas y grounding;
10. usar la primera observación válida como baseline para RCR;
11. comparar las repeticiones 2 a 5 contra esa baseline;
12. pasar cada observación por revisión antes de `validated`.

No puede existir más de una observación primaria aceptada por ejecución y ronda de codificación.

## 11. Extracción de citas

Crear un registro Citation por cada fuente visible identificable.

Para cada cita:

- conservar texto visible original;
- registrar tipo y función;
- registrar posición desde 1;
- conservar URL original;
- normalizar URL y dominio;
- relacionar ejecución, observación y evidencia;
- verificar resolución, URL final y disponibilidad;
- evaluar si soporta la afirmación;
- identificar fuente primaria u oficial cuando corresponda;
- codificar si coincide con `gslhub.com`;
- calcular checksum del texto original preservado;
- revisar antes de pasar a `validated`.

Una fuente inferida pero no visible no se registra como cita.

## 12. Cálculo de métricas

Las métricas se calculan únicamente después de validar las observaciones y citas elegibles.

### AIR

Proporción de ejecuciones válidas cuya observación aceptada marca el target como mencionado.

### CR

Proporción de ejecuciones válidas cuya observación aceptada marca el target como citado y tiene evidencia de cita elegible.

### MCP

Media de la primera posición elegible del target entre las ejecuciones en las que fue citado.

Si no existe ninguna cita elegible del target, MCP queda indefinida y se documenta; no se convierte en cero.

### RCR

Proporción de comparaciones evaluadas contra la baseline con variación `none` o `low`.

La baseline se informa, pero no forma parte del denominador.

Cada resultado debe incluir:

- Metric Definition versionada;
- inputs exactos;
- numerador y denominador cuando proceda;
- valor;
- exclusiones;
- snapshot de consulta;
- checksum de inputs;
- checksum de output;
- versión del calculador;
- fecha y responsable.

## 13. Revisión científica

La revisión final debe confirmar:

- cinco condiciones planificadas;
- correspondencia uno a uno entre ejecución y observación primaria;
- artefactos disponibles y con checksum;
- exclusiones justificadas;
- citas verificadas;
- ausencia de datos `TEST-` en los resultados reales;
- definiciones métricas correctas;
- reproducibilidad de los cálculos;
- coherencia de numeradores, denominadores y muestra;
- limitaciones documentadas.

No publicar resultados hasta completar esta revisión.

## 14. Backup de cierre

Al finalizar la captura y antes de iniciar la codificación final:

```bash
bash scripts/backup-research-state.sh
bash scripts/verify-research-backup.sh <directorio-del-backup>
```

Después de validar métricas debe realizarse otro backup final.

El procedimiento completo está en:

```text
docs/PROCEDIMIENTO_ALMACENAMIENTO_BACKUP_RECUPERACION_ES.md
```

## 15. Entregables del piloto

- cinco Prompt Executions o el conjunto completo con exclusiones conservadas;
- Research Artifacts y Evidence verificables;
- Observations revisadas;
- Citations verificadas;
- cuatro Metric Results o resultados indefinidos debidamente documentados;
- manifiesto de exclusiones;
- backup verificado;
- acta de revisión científica;
- primera versión del dataset;
- informe técnico del piloto.

## 16. Condición de cierre

El piloto se considera cerrado cuando:

- no quedan observaciones o citas pendientes de revisión;
- todas las exclusiones están justificadas;
- los resultados se reproducen desde los inputs congelados;
- el backup final supera la verificación;
- la restauración aislada ha sido documentada;
- el investigador responsable aprueba el informe de cierre.
