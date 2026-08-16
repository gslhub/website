# GSLHub Doctoral Demo / Demostración Doctoral de GSLHub

**Version / Versión:** 0.6.2  
**Use / Uso:** five-minute explanation for a thesis supervisor, doctoral committee, university evaluator or research collaborator. / Explicación de cinco minutos para dirección de tesis, comisión doctoral, universidad o colaboración científica.

---

# Español

## Objetivo de la demostración

En cinco minutos, la persona que escucha debe entender cuatro ideas:

1. existe un **problema científico emergente** alrededor de la visibilidad en motores generativos;
2. GSLHub no es una web de marketing, sino una **infraestructura experimental gobernada**;
3. el sistema permite pasar de una pregunta a evidencia preservada y métricas reproducibles;
4. la plataforma ya está construida y validada técnicamente, pero los datos actuales siguen separados de la futura investigación doctoral real.

## Guion de 5 minutos

### 0:00–0:40 — Problema

> Los motores de búsqueda generativos están cambiando la forma en la que las organizaciones aparecen, son citadas y son recomendadas. El SEO tradicional explica parte del fenómeno, pero todavía falta un modelo científico suficientemente validado para estudiar esta visibilidad de forma reproducible.

Mostrar:

- Home de GSLHub;
- `/es/research-infrastructure`.

### 0:40–1:20 — Pregunta e hipótesis

> La línea de investigación propuesta estudia el paso del SEO al GEO. La hipótesis general es que determinados factores de visibilidad en sistemas generativos pueden operacionalizarse, observarse mediante experimentos controlados y medirse de forma reproducible.

No presentar todavía AIR/CR/MCP/RCR como métricas definitivamente validadas por la comunidad científica. Presentarlas como **métricas operacionales desarrolladas y técnicamente validadas para la fase experimental**, pendientes de justificación y validación dentro del trabajo doctoral.

### 1:20–2:10 — Diseño experimental

Mostrar el flujo:

```text
Problema científico
→ Hipótesis
→ Experimento
→ Ejecución
```

Explicar:

- prompts versionados;
- AI Systems registrados;
- repeticiones controladas;
- entorno de ejecución registrado;
- separación entre Development Mode y futuro Doctoral Research Mode.

### 2:10–3:10 — Evidencia y trazabilidad

Mostrar el dashboard privado o capturas preparadas del CMS.

Explicar:

```text
Execution
→ Research Artifact
→ Evidence
→ Observation
→ Citation / Metric
```

Mensaje principal:

> Cada ejecución puede conservar su respuesta original, capturas y metadatos. Los artefactos pueden verificarse mediante SHA-256 y se almacenan fuera de los releases de despliegue. La evidencia queda relacionada con la ejecución y con la observación codificada.

No mostrar datos sensibles ni artefactos restringidos durante una presentación externa.

### 3:10–4:10 — Métricas

Presentar:

| Métrica | Función |
| --- | --- |
| AIR | medir inclusión del target en respuestas elegibles |
| CR | medir citación del target |
| MCP | medir posición media visible de las citas |
| RCR | medir consistencia entre respuestas repetidas |

Añadir:

> Los calculadores ya han pasado pruebas deterministas de software. La fase doctoral deberá justificar teóricamente las métricas, sus reglas de elegibilidad y su validez para responder las preguntas de investigación.

### 4:10–4:45 — Reproducibilidad

Explicar brevemente:

- snapshots gobernados e inmutables;
- SHA-256;
- almacenamiento persistente;
- Restart / Redeploy / Recovery verificados;
- control de calidad;
- revisión independiente;
- Final Development Reset antes de datos reales.

Mensaje:

> La plataforma ha sido diseñada para que desarrollo y datos doctorales no se mezclen.

### 4:45–5:00 — Cierre

> GSLHub demuestra que la propuesta no parte únicamente de una idea conceptual. Existe ya una infraestructura operativa capaz de soportar experimentos controlados y reproducibles. El siguiente paso científico es congelar el protocolo doctoral, ejecutar el reset de desarrollo e iniciar la recogida de datos reales bajo el diseño aprobado.

---

## Qué enseñar

### Público

1. `https://gslhub.com`
2. `https://gslhub.com/es/research-infrastructure`
3. `https://gslhub.com/dashboard` cuando contenga indicadores adecuados para difusión.

### Privado, solo si aporta valor

- Research Operations Dashboard;
- Prompt Executions;
- Evidence;
- Research Artifacts;
- Metric Definitions / Metrics;
- Storage Verifications.

No navegar por todos los campos del CMS. Utilizar el dashboard como mapa y abrir como máximo uno o dos ejemplos.

---

## Ejemplo de desarrollo que puede enseñarse

`GSL-EXEC-GEO-0001` sirve como ejemplo de que el pipeline funciona:

```text
GSL-EXEC-GEO-0001
├── 2 Research Artifacts verificados
├── 2 Evidence records validados
├── 1 Observation validada/publicada
└── 0 Citation records observados
```

Aclaración obligatoria:

> Es una ejecución de validación de desarrollo y no constituye un resultado de la futura tesis doctoral.

---

## Mensajes clave para una posible directora de tesis

- El proyecto nace de una pregunta de comunicación estratégica y visibilidad digital, no de una simple necesidad de software.
- La experiencia profesional se transforma en una ventaja metodológica: permite construir y ejecutar investigación aplicada compleja.
- GSLHub hace visible la capacidad de diseñar protocolos, preservar datos, medir resultados y trabajar con reproducibilidad.
- El sistema está deliberadamente preparado para limpiar los datos de desarrollo antes de iniciar la investigación doctoral real.
- La tesis sigue necesitando dirección académica, estado del arte, formulación final de hipótesis, diseño muestral y validación metodológica.

---

# English

## Demo objective

After five minutes, the audience should understand four ideas:

1. generative-search visibility is an emerging **scientific problem**;
2. GSLHub is not a marketing website but a **governed experimental infrastructure**;
3. the system connects research questions to preserved evidence and reproducible metrics;
4. the platform already exists and has been technically validated, while current development records remain separate from future doctoral data.

## Five-minute script

### 0:00–0:40 — Problem

> Generative search engines are changing how organizations appear, are cited and are recommended. Traditional SEO explains part of this phenomenon, but a sufficiently validated scientific model for reproducibly studying generative-search visibility is still missing.

Show:

- GSLHub Home;
- `/research-infrastructure`.

### 0:40–1:20 — Research question and hypothesis

> The proposed research line investigates the transition from SEO to GEO. The general hypothesis is that relevant visibility factors in generative systems can be operationalized, observed through controlled experiments and measured reproducibly.

Do not present AIR/CR/MCP/RCR as universally established scientific metrics. Present them as **operational metrics developed and technically validated for experimental use**, whose theoretical justification and scientific validity remain part of the doctoral work.

### 1:20–2:10 — Experimental design

Show:

```text
Scientific problem
→ Hypothesis
→ Experiment
→ Execution
```

Explain:

- versioned prompts;
- registered AI Systems;
- controlled repetitions;
- recorded execution environment;
- Development Mode separated from future Doctoral Research Mode.

### 2:10–3:10 — Evidence and traceability

Show the private Research Operations Dashboard or prepared screenshots.

Explain:

```text
Execution
→ Research Artifact
→ Evidence
→ Observation
→ Citation / Metric
```

Core message:

> Each execution can preserve the original response, screenshots and metadata. Research artifacts can be verified with SHA-256 and are stored outside deployment releases. Evidence remains connected to both the execution and the coded observation.

Do not expose restricted artifacts or private records during an external presentation.

### 3:10–4:10 — Metrics

| Metric | Function |
| --- | --- |
| AIR | target inclusion in eligible answers |
| CR | target citation frequency |
| MCP | mean visible citation position |
| RCR | consistency across repeated responses |

Add:

> The calculators have already passed deterministic software validation. The doctoral phase must establish their theoretical justification, eligibility rules and validity for answering the research questions.

### 4:10–4:45 — Reproducibility

Mention:

- governed immutable snapshots;
- SHA-256;
- persistent storage;
- verified Restart / Redeploy / Recovery;
- quality control;
- independent review;
- Final Development Reset before real doctoral data.

Core message:

> The platform is deliberately designed so development records and doctoral data cannot be silently mixed.

### 4:45–5:00 — Closing

> GSLHub shows that the proposal does not start only from a conceptual idea. An operational infrastructure already exists for controlled and reproducible experimentation. The next scientific step is to freeze the doctoral protocol, reset development data and begin real data collection under the approved design.

---

## Recommended presentation sequence

```text
Public Home
→ Research Infrastructure
→ Project Matrix diagram
→ private Research Operations Dashboard
→ one example Execution/Evidence chain
→ metrics overview
→ reproducibility controls
→ doctoral next steps
```

---

## One-slide summary

**GSLHub — Research Infrastructure for Generative Search Visibility**

```text
Question
↓
Controlled experiment
↓
Repeatable execution
↓
Preserved evidence
↓
Governed observation
↓
Metrics and citations
↓
Reproducible research output
```

**Scientific purpose:** support the development and empirical validation of a GEO visibility model.  
**Current status:** platform 0.6.2, Development Mode, zero real doctoral data.  
**Next gate:** freeze doctoral methodology → Final Development Reset → Doctoral Research Mode.

---

## Related documentation / Documentación relacionada

- [PROJECT-MATRIX.md](./PROJECT-MATRIX.md)
- [ESTADO_PROYECTO_ES.md](./ESTADO_PROYECTO_ES.md)
- [PROTOCOLO_PRIMER_PILOTO_ES.md](./PROTOCOLO_PRIMER_PILOTO_ES.md)
- [CODEBOOK_OBSERVACIONES_CITAS_ES.md](./CODEBOOK_OBSERVACIONES_CITAS_ES.md)

**Last updated / Última actualización:** 16 August / agosto 2026
