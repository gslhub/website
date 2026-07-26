# Manual de usuario de GSLHub

## Gobernanza, ciclos de vida e integridad científica

**Versión documental:** 0.1.0  
**Fecha:** 26 de julio de 2026  
**Ámbito:** Payload CMS de GSLHub

Este documento explica cómo deben trabajar administradores, editores e investigadores dentro de GSLHub sin romper la trazabilidad, la reproducibilidad ni la integridad de los registros científicos.

> Regla principal: un registro científico validado o liberado no se corrige sobrescribiendo su contenido histórico. Se documenta la revisión, se excluye o rechaza cuando corresponde, se archiva, o se crea una nueva versión o un nuevo registro.

---

## 1. Roles y permisos

### Administrador

Puede:

- gestionar usuarios;
- crear y eliminar lotes de datos de prueba;
- ejecutar la generación de escenarios sintéticos;
- eliminar registros cuando la política de la colección lo permite;
- revisar incidencias de integridad y limpieza;
- administrar configuraciones críticas.

### Editor

Puede:

- crear y actualizar contenido científico y editorial;
- preparar borradores;
- completar metadatos;
- relacionar entidades;
- revisar contenido antes de su validación o publicación.

No debe:

- alterar identificadores ya reservados;
- intentar reabrir registros científicos congelados;
- utilizar el espacio de nombres `TEST-`;
- publicar datos sintéticos como resultados científicos.

### Investigador

Puede:

- preparar proyectos, protocolos, prompts y ejecuciones;
- codificar observaciones;
- registrar evidencias y citas;
- revisar resultados y completar metadatos científicos;
- documentar decisiones, limitaciones y exclusiones.

Debe conservar siempre la condición experimental exacta y evitar cualquier modificación retroactiva del dato observado.

---

## 2. Borrador, publicación y visibilidad

GSLHub distingue dos niveles diferentes:

1. **Estado editorial de Payload**
   - Draft.
   - Published.

2. **Estado científico propio de cada colección**
   - Planned, Active, Validated, Released, Published, Archived, etc.

Un registro puede estar científicamente validado y seguir como borrador editorial. En ese caso permanece visible en el CMS autenticado, pero no aparece en la web pública ni en la API anónima.

Los datos de prueba y los archivos privados nunca deben publicarse.

---

## 3. Identificadores científicos

Los códigos reales utilizan espacios de nombres controlados:

```text
GSL-EXEC-GEO-0001   Prompt Execution
GSL-OBS-GEO-0001    Observation
GSL-ART-GEO-0001    Research Artifact
GSL-EVD-GEO-0001    Evidence
GSL-CIT-GEO-0001    Citation
GSL-MET-GEO-0001    Metric Result
```

Reglas:

- se convierten automáticamente a mayúsculas;
- deben terminar con una numeración de al menos cuatro dígitos;
- no pueden modificarse después de crear el registro;
- deben ser únicos en su colección;
- el prefijo debe corresponder al tipo de registro.

El espacio `TEST-` está reservado al administrador y a **Test Data Batches**:

```text
TEST-GSL-TD-YYYYMMDDTHHMMSS-XXXXXX-EXEC-0001
```

No se deben crear códigos de prueba manualmente fuera del flujo administrativo.

---

## 4. Regla de nueva versión

Debe crearse una nueva versión cuando cambia cualquiera de estos elementos:

- texto exacto del prompt;
- protocolo o criterios del experimento;
- métricas o sistemas incluidos en un benchmark;
- perfil de acceso, versión visible o capacidades de un sistema de IA;
- metodología o alcance de un proyecto activo;
- contenido de un recurso ya disponible;
- metodología o archivos de un dataset liberado;
- implementación o metadatos de software liberado;
- metadatos académicos de un preprint o publicación;
- fórmula o entradas de una métrica validada.

No se debe utilizar la nueva versión para ocultar un error. La versión anterior debe conservarse y, cuando corresponda, marcarse como deprecated, rejected, excluded o archived.

---

## 5. Proyectos

### Estados permitidos

```text
Planned → Active | Archived
Active → Paused | Completed | Archived
Paused → Active | Completed | Archived
Completed → Archived
Archived → sin reapertura
```

### Antes de activar

Se requiere:

- Start Date;
- Methodology.

### Al pasar a Active

Quedan congelados:

- Project Code;
- Slug;
- Project Type;
- Objectives;
- Methodology;
- Start Date;
- Research Areas.

Pueden seguir actualizándose:

- Title;
- Summary;
- Researchers;
- Repository URL;
- Featured;
- End Date, hasta completar el proyecto.

### Al completar

Se requiere End Date, que queda congelada desde `Completed`.

---

## 6. Benchmarks

### Estados permitidos

```text
Planned → Pilot
Pilot → Active | Completed | Archived
Active → Completed | Archived
Completed → Archived
Archived → sin reapertura
```

### Antes de Pilot

Se requiere Start Date.

### Desde Pilot

Quedan congelados:

- Benchmark Code;
- Slug;
- Benchmark Type;
- Version;
- Scope;
- Protocol;
- Systems;
- Metrics;
- Start Date;
- Project;
- Research Areas.

Pueden seguir actualizándose:

- Title;
- Summary;
- Researchers;
- Software;
- Datasets;
- Publications;
- Featured;
- Last Run Date.

Para `Completed` se requiere Last Run Date.

---

## 7. Experimentos

### Estados permitidos

```text
Planned → Ready | Cancelled
Ready → Running | Cancelled | Archived
Running → Paused | Completed | Cancelled
Paused → Running | Completed | Cancelled
Completed → Archived
Cancelled → Archived
Archived → sin reapertura
```

### Desde Ready

Quedan congelados:

- Experiment Code;
- Slug;
- Experiment Type;
- Version;
- Research Question;
- Hypothesis;
- Objective;
- Protocol;
- Sampling Strategy;
- Inclusion Criteria;
- Exclusion Criteria;
- Independent Variables;
- Dependent Variables;
- Control Variables;
- Planned Repetitions;
- Project;
- Benchmark;
- Research Areas.

Pueden seguir actualizándose:

- Title;
- Summary;
- Start Date;
- End Date;
- Preregistration URL;
- Notes;
- Researchers;
- Software;
- Datasets;
- Resources;
- Publications;
- Featured.

Para `Completed` se requiere End Date.

---

## 8. Prompts

### Estados permitidos

```text
Planned → Under review
Under review → Planned | Validated
Validated → Active | Deprecated | Archived
Active → Deprecated | Archived
Deprecated → Archived
Archived → sin reapertura
```

### Antes de validar

Se debe completar `Validated At`.

### Desde Validated

Quedan congelados:

- Prompt Code;
- Slug;
- Prompt Text;
- Prompt Type;
- Research Intent;
- Version;
- Prompt Language;
- Difficulty;
- Controlled;
- Execution Instructions;
- Expected Behaviour;
- Variable Placeholders;
- Constraints;
- Validated At;
- Project;
- Benchmarks;
- Experiments;
- Research Areas.

Pueden seguir actualizándose:

- Title;
- Description;
- Tags;
- Validation Notes;
- Researchers;
- Resources;
- Publications;
- Featured.

Un cambio de una sola palabra en `Prompt Text` exige una nueva versión.

---

## 9. Sistemas de IA

### Estados permitidos

```text
Preview → Active | Limited | Unavailable | Archived
Active → Limited | Deprecated | Unavailable | Archived
Limited → Active | Deprecated | Unavailable | Archived
Deprecated → Archived
Unavailable → Active | Limited | Deprecated | Archived
Archived → sin reapertura
```

### Antes de congelar el perfil

Se requiere:

- First Observed At;
- Last Verified At.

### Desde Active, Limited, Deprecated, Unavailable o Archived

Quedan congelados:

- System Code;
- Slug;
- Provider;
- System Type;
- Versioning Mode;
- Model Version;
- Interface Version;
- Release Channel;
- Access Modes;
- Account Tier;
- Capabilities;
- Languages;
- Geographic Availability;
- Identification Method;
- Knowledge Cutoff;
- First Observed At;
- Benchmarks;
- Experiments;
- Research Areas.

Pueden seguir actualizándose:

- Last Verified At;
- documentación y URLs informativas;
- reproducibility notes;
- observaciones editoriales.

Cuando cambia la interfaz, la modalidad de acceso o el modelo visible, debe crearse un nuevo perfil o snapshot.

---

## 10. Prompt Executions

### Unicidad experimental

No pueden existir dos ejecuciones reales con la misma combinación:

```text
Experiment
Prompt
Prompt Version
AI System
Repetition Number
```

Los lotes `TEST-` quedan fuera de esta restricción para permitir pruebas repetibles.

### Inmutabilidad

Cuando la ejecución empieza, se sellan:

- prompt, versión, idioma y snapshot exacto;
- proyecto, benchmark, experimento y sistema de IA;
- número de repetición y metadatos de ronda;
- fecha y entorno de ejecución.

Cuando termina, también se sellan:

- respuesta completa;
- citas o fuentes presentadas;
- tiempos;
- uso y tokens cuando existan;
- metadatos técnicos de la ejecución.

Una ejecución completada no puede regresar a Running o Planned.

Para corregir un problema se debe:

- documentar Validation Notes;
- marcar la ejecución como Excluded cuando corresponda;
- crear una nueva ejecución con una repetición o condición distinta.

---

## 11. Observations

Las relaciones se heredan de Prompt Execution:

- Project;
- Benchmark;
- Experiment;
- Prompt;
- AI System.

Una observación no puede vincularse a una ejecución diferente de la que originó su contexto.

Desde `Validated` quedan congelados:

- Prompt Execution;
- relaciones científicas;
- Response Assessment;
- Citation Assessment;
- Source Observations;
- Visibility Coding;
- Semantic Coding;
- Comparison.

Permanecen editables:

- Quality Control;
- Validation Notes;
- Reviewers;
- Exclusion Reason;
- notas generales.

Una observación validada solo puede rechazarse/excluirse o archivarse según las opciones de su colección; no debe reabrirse para recodificarla.

---

## 12. Research Artifacts

Los artefactos conservan archivos de investigación como:

- capturas;
- PDF;
- HTML;
- JSON y JSON-LD;
- CSV;
- logs;
- ZIP;
- exportaciones de respuesta.

Reglas:

- el código del artefacto queda reservado;
- el contexto se hereda de Prompt Execution;
- el archivo permanece privado salvo decisión formal;
- SHA-256 se calcula automáticamente;
- los campos de integridad generados no deben alterarse manualmente;
- un archivo sustituido debe tratarse como un artefacto nuevo, no como una edición silenciosa.

Actualmente el almacenamiento es local y privado. Antes de capturar evidencia irremplazable a escala debe migrarse a almacenamiento duradero compatible con S3 u otro archivo versionado.

---

## 13. Evidence

La evidencia hereda el contexto de la ejecución y valida que la observación seleccionada pertenezca a la misma ejecución.

Para alcanzar `Validated` se requiere:

- Integrity Verified;
- Checksum cuando el algoritmo lo exige;
- Quality Control aceptado;
- Validated At.

Desde `Validated` se congelan:

- Evidence Code;
- tipo y fecha de captura;
- ejecución y observación;
- relaciones científicas;
- metadatos del artefacto;
- Capture Context;
- Preserved Content;
- Integrity;
- Ethical and Legal Notes.

La cadena de custodia es append-only:

- no se eliminan eventos anteriores;
- no se modifican eventos anteriores;
- sí pueden añadirse nuevos eventos al final.

Una evidencia validada debe rechazarse o archivarse, no volver a Captured.

---

## 14. Citations

Una cita debe utilizar:

- una Prompt Execution;
- una Observation compatible;
- Evidence compatible;
- el mismo Project, Benchmark, Experiment, Prompt y AI System.

Desde `Validated` quedan congelados:

- Citation Type;
- Citation Function;
- Citation Position;
- fuente, URL y dominio;
- metadatos del editor o autor;
- contexto visible de la cita;
- claim supported;
- target coding;
- verificación;
- integridad;
- relaciones con ejecución, observación y evidencia.

Pueden seguir actualizándose notas de revisión y control de calidad.

---

## 15. Metrics

Los resultados métricos validan que sus entradas pertenezcan al mismo contexto científico:

- Prompt Executions;
- Observations;
- Citations;
- Evidence;
- Project;
- Benchmark;
- Experiment;
- Prompt;
- AI System.

También se comprueba:

- tipo de valor;
- rangos de porcentaje y proporción;
- posiciones válidas;
- denominadores positivos;
- tamaño de muestra positivo;
- estado de revisión y fecha de validación.

Desde `Validated` se congelan:

- código y versión;
- fórmula;
- método de cálculo;
- resultado;
- numerador y denominador;
- tamaño de muestra;
- breakdowns;
- intervalo de confianza;
- entradas analíticas;
- metadatos de reproducibilidad.

Una corrección requiere un nuevo resultado métrico o un rechazo documentado.

---

## 16. Resources

### Estados permitidos

```text
Planned → In development | Archived
In development → Planned | Available | Archived
Available → Archived
Archived → sin reapertura
```

Para pasar a `Available` se requiere:

- Publication Date;
- Content, External URL o Repository URL.

Desde `Available` quedan congelados:

- Slug;
- Resource Type;
- Version;
- Content;
- External URL;
- Repository URL;
- Publication Date;
- License;
- Authors;
- Project;
- Research Areas;
- Benchmarks;
- Software;
- Datasets;
- Publications;
- Open Access.

Cambios de contenido exigen una nueva versión del recurso.

---

## 17. Datasets

### Estados permitidos

```text
Planned → Collecting | Archived
Collecting → Planned | Cleaning | Archived
Cleaning → Collecting | Validating | Archived
Validating → Cleaning | Released | Archived
Released → Archived
Archived → sin reapertura
```

Para pasar a `Released` se requiere:

- Release Date;
- Data Availability definitiva;
- al menos un formato;
- Record Count mayor que cero.

Para un dataset público se requiere además:

- Repository URL o DOI;
- License;
- Open Data activado.

Desde `Released` quedan congelados metodología, versión, fechas, disponibilidad, DOI, repositorio, licencia, formatos, recuento y relaciones científicas.

Una actualización de datos exige una nueva versión del dataset.

---

## 18. Software

### Estados permitidos

```text
Planned → Alpha | Beta | Archived
Alpha → Beta | Deprecated | Archived
Beta → Stable | Deprecated | Archived
Stable → Maintenance | Deprecated | Archived
Maintenance → Deprecated | Archived
Deprecated → Archived
Archived → sin reapertura
```

Desde `Alpha` se requiere:

- Release Date;
- Source Availability definitiva;
- al menos un lenguaje de programación.

Para software público se requiere:

- Repository URL;
- License;
- Open Source activado.

Desde la primera versión liberada quedan congelados versión, descripción técnica, tipo, URLs, licencia, lenguajes, tecnologías y relaciones científicas.

Una modificación funcional exige una nueva versión.

---

## 19. Publications

### Estados permitidos

```text
Planned → In preparation | Archived
In preparation → Planned | Preprint | Published | Archived
Preprint → Published | Archived
Published → Archived
Archived → sin reapertura
```

Para pasar a `Preprint` o `Published` se requiere:

- Publication Date;
- al menos un autor;
- DOI o External URL;
- Venue.

Desde `Preprint` quedan congelados:

- Title;
- Slug;
- Abstract;
- Keywords;
- Publication Type;
- Publication Date;
- DOI;
- External URL;
- Venue;
- Volume, Issue y Pages;
- BibTeX;
- Authors;
- Project;
- Research Areas;
- Software;
- Datasets;
- Open Access.

Una corrección posterior debe representarse mediante una nueva versión o un registro formal de corrección.

---

## 20. Test Data Batches

Solo un administrador puede generar o eliminar lotes.

### Escenarios disponibles

```text
Pilot prompt executions — 5 records
Full research pipeline — 27 connected records
```

El escenario completo crea:

```text
5 Prompt Executions
5 Observations
5 Research Artifacts
5 Evidence records
3 Citations
4 Metric results
────────────────────
27 connected records
```

Reglas de seguridad:

- todos los registros quedan como draft o privados;
- cada registro pertenece a un batch mediante código y ID;
- los fallos parciales ejecutan rollback;
- los lotes fallidos pueden reintentarse;
- un lote generado no puede duplicarse;
- la eliminación ocurre en orden inverso de dependencias;
- los cinco archivos físicos también se eliminan;
- los datos sintéticos nunca se presentan como resultados reales.

---

## 21. Cómo actuar ante un error

### Antes de validar

Corregir el campo y guardar normalmente.

### Después de validar o liberar

Elegir una de estas acciones:

1. añadir Validation Notes o Review Notes;
2. marcar Excluded, Rejected, Deprecated o Archived cuando corresponda;
3. crear una nueva versión;
4. crear una nueva ejecución u observación;
5. documentar una corrección formal para publicaciones.

No se debe:

- cambiar el código;
- editar el dato observado;
- sustituir un archivo manteniendo el mismo artefacto;
- cambiar una fórmula manteniendo la misma versión;
- reabrir un registro archivado;
- utilizar una relación de otra ejecución.

---

## 22. Checklist antes del primer piloto real

- [ ] Revisar y congelar el proyecto real.
- [ ] Revisar y pasar el benchmark a Pilot.
- [ ] Revisar y pasar el experimento a Ready.
- [ ] Revisar y validar el prompt `GSL-PROMPT-GEO-001` v0.1.0.
- [ ] Confirmar el perfil de ChatGPT Search y su Last Verified At.
- [ ] Finalizar el codebook de observaciones y citas.
- [ ] Congelar las definiciones AIR, CR, MCP y RCR.
- [ ] Verificar almacenamiento duradero de evidencia.
- [ ] Probar backup y recuperación de MongoDB y archivos.
- [ ] Crear cinco ejecuciones reales con condiciones únicas.
- [ ] Preparar checklist de captura y revisión.
- [ ] Definir reglas de exclusión y responsabilidades de revisión.

---

## 23. Documentación pendiente

Este manual es la base operativa. Todavía deben añadirse:

- capturas de pantalla de cada colección;
- procedimientos detallados por rol;
- ejemplos completos del primer piloto;
- guía de revisión y control de calidad;
- protocolo de backup y recuperación;
- procedimiento de publicación en Zenodo;
- creación de DOI y metadatos de citación;
- exportación de datasets;
- resolución de incidencias frecuentes.

---

## 24. Principio final

GSLHub conserva la historia científica. Una corrección legítima añade información y trazabilidad; no elimina ni reescribe silenciosamente lo que ocurrió.
