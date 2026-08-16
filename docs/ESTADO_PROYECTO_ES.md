# Estado operativo de GSLHub

**Fecha de corte:** 16 de agosto de 2026  
**Versión de plataforma:** `0.6.2`  
**Entorno:** `Development Mode`  
**Doctoral Research Mode:** no activado  
**Datos doctorales reales:** `0`

---

## 1. Resumen ejecutivo

GSLHub ha completado la validación funcional principal, la regresión científica de desarrollo y la fase **Doctoral-ready UI**.

La plataforma dispone de:

- infraestructura desplegada en Hostinger;
- MongoDB Atlas;
- administrador Payload gobernado;
- frontend público responsive;
- Research Operations Dashboard EN/ES y compatible con tema claro/oscuro;
- demostrador público bilingüe de Research Infrastructure;
- persistencia de artefactos fuera de los releases;
- verificación Restart / Redeploy / Recovery con SHA-256;
- pipeline Execution → Artifact → Evidence → Observation → Citation / Metric;
- AIR, CR, MCP y RCR con validación determinista de software;
- Research Environment con separación Development / Doctoral;
- regresión interna completa y cleanup TEST seguro;
- protección de assets por deployment ID y procedimiento operativo de purga de caché Hostinger.

La plataforma **todavía no contiene datos doctorales reales** y debe permanecer en Development Mode hasta congelar el protocolo doctoral y ejecutar Final Development Reset.

---

## 2. Estado por área

| Área | Estado | Situación |
| --- | --- | --- |
| Hosting / deploy | ✅ Operativo | `main` despliega correctamente a Hostinger. |
| Caché producción | ✅ Procedimiento definido | Tras cambios frontend/CSS: purge server cache + CDN si aplica + smoke test. |
| Payload CMS | ✅ Operativo | Login, listas, formularios, drafts, versiones y gobernanza funcionan. |
| Dark mode Admin | ✅ Corregido | Dashboard propio usa tokens nativos de tema de Payload. |
| MongoDB Atlas | ✅ Operativo | Persistencia científica activa. |
| Research Artifacts | ✅ Verificado | Almacenamiento persistente con checksum. |
| Restart / Redeploy | ✅ Verificado | Artefactos conservados con mismo SHA-256. |
| Recovery drill | ✅ Verificado | Recuperación controlada completada. |
| Metric Definitions | ✅ Validación desarrollo | AIR, CR, MCP y RCR v0.1.0. |
| Pipeline científico | ✅ Verificado | Relaciones y sellado funcionando end-to-end. |
| Regresión TEST | ✅ Completada | Full pipeline + AIR/CR/MCP/RCR + cleanup. |
| Responsive público | ✅ Completado | Móvil, tablet, portátil y escritorio. |
| Responsive Admin | ✅ Completado | Listas, tablas y dashboard adaptados. |
| Research Operations Dashboard | ✅ Operativo | Vista útil tras login, EN/ES, light/dark. |
| Research Infrastructure demo | ✅ Operativo | EN y ES en frontend público. |
| Project Matrix | ✅ Documentada | `docs/PROJECT-MATRIX.md`. |
| Doctoral Demo | ✅ Documentada | `docs/DOCTORAL-DEMO.md`. |
| Final Development Reset | ⏳ Pendiente | Ejecutar al congelar el protocolo doctoral. |
| Doctoral Research Mode | ⛔ No activado | Activar solo con baseline limpia. |

---

## 3. Regresión final de desarrollo

### Full research pipeline

Se generó y verificó un escenario interno con `27` registros TEST conectados:

```text
5 Prompt Executions
5 Observations
5 Research Artifacts
5 Evidences
3 Citations
4 Metrics
-------------------
27 TEST records
```

Resultado:

```text
Prompt Executions     Completed
Observations          Validated
Evidences             Validated
Artifact provenance   Verified
Citations             Positions 1, 2, 3
AIR                    0.8 synthetic pipeline value
CR                     0.6 synthetic pipeline value
MCP                    2.0 synthetic pipeline value
RCR                    0.8 synthetic pipeline value
```

### Calculadores deterministas

```text
AIR = 3 / 4 = 0.75   PASS
CR  = 2 / 4 = 0.50   PASS
MCP = 6 / 3 = 2.00   PASS
RCR = 3 / 4 = 0.75   PASS
```

### Cleanup

Todos los Administrative Batches y registros TEST generados fueron eliminados correctamente.

```text
Administrative Batches TEST   0
Metrics TEST                  0
Prompt Executions TEST        0
```

Los registros reales de desarrollo quedaron intactos.

---

## 4. Ejecuciones reales de desarrollo

```text
GSL-EXEC-GEO-0001   Completed / Published
GSL-EXEC-GEO-0002   Planned
GSL-EXEC-GEO-0003   Planned
GSL-EXEC-GEO-0004   Planned
GSL-EXEC-GEO-0005   Planned
```

`GSL-EXEC-GEO-0001` conserva:

```text
2 Research Artifacts verificados por SHA-256
2 Evidence records validados
1 Observation validada / publicada
0 Citation records observados
```

No se crearon AIR/CR/MCP para esta ejecución porque el prompt no definía un target específico. Todo este conjunto continúa siendo **desarrollo**, no resultado doctoral.

---

## 5. Matriz conceptual de GSLHub

La arquitectura conceptual permanente se conserva en:

- `docs/PROJECT-MATRIX.md`

Vista resumida:

```text
Problema científico
→ Hipótesis
→ Experimento
→ Ejecución
→ Evidencia
→ Observación
→ Métricas / Citas
→ Reproducibilidad
→ Difusión pública
```

La matriz debe utilizarse como referencia al explicar qué es GSLHub y cómo funciona, evitando empezar una presentación por las colecciones internas del CMS.

---

## 6. Demostración académica

El guion bilingüe de presentación de cinco minutos se conserva en:

- `docs/DOCTORAL-DEMO.md`

Rutas públicas:

```text
EN  /research-infrastructure
ES  /es/research-infrastructure
```

Objetivo del demostrador:

```text
Problema científico
→ diseño experimental
→ ejecución
→ evidencia preservada
→ métricas
→ reproducibilidad
```

Está pensado para posible dirección de tesis, comisión doctoral, universidad o colaboración científica, sin exponer datos privados ni artefactos restringidos.

---

## 7. Infraestructura de artefactos

Ruta persistente:

```text
/home/<usuario-hostinger>/domains/gslhub.com/gslhub-data/research-artifacts
```

Secuencia probada:

```text
Upload
→ HTTP 200
→ Node.js Restart
→ mismo fichero + mismo SHA-256
→ Redeploy
→ mismo fichero + mismo SHA-256
→ Recovery drill
→ restauración + mismo SHA-256
```

El backup operativo debe incluir MongoDB, el directorio persistente de artefactos y la configuración necesaria para reconstruir producción.

---

## 8. Producción, caché y despliegues

En pruebas reales se detectó que Hostinger podía servir HTML antiguo después de un redeploy, dejando temporalmente el frontend sin CSS aunque Next.js estuviera correcto.

La baseline 0.6.2 mantiene protección `deploymentId`, pero el procedimiento obligatorio tras cambios de frontend/CSS es:

```text
Deploy main
→ build/restart correcto
→ Purge All en caché de Hostinger
→ Flush CDN si está activa
→ smoke test escritorio
→ smoke test móvil
```

No diagnosticar un frontend sin estilos como bug de responsive antes de descartar primero caché de Hostinger.

---

## 9. Línea doctoral asociada

Proyecto provisional:

> **Del SEO al GEO (Generative Engine Optimization): desarrollo y validación de un modelo científico para optimizar la visibilidad de organizaciones en motores de búsqueda basados en Inteligencia Artificial.**

GSLHub actúa como infraestructura experimental y demostración de viabilidad técnica y metodológica.

El foco inmediato debe estar en:

- preproyecto doctoral;
- estado del arte y research gap;
- preguntas de investigación;
- hipótesis;
- metodología y diseño experimental;
- muestra y targets;
- sistemas generativos y protocolo de repetición;
- justificación y validación de AIR / CR / MCP / RCR;
- plan de análisis y publicaciones.

---

## 10. Research Environment

```text
Mode                     Development
Final Development Reset  No ejecutado
Doctoral Research Mode   No activado
```

**No activar Doctoral Research Mode todavía.**

Development Mode continúa siendo el entorno para ajustes, documentación, pruebas de producto y cualquier validación previa a la congelación metodológica.

---

## 11. Gate antes del Final Development Reset

- [ ] cerrar título y alcance del proyecto doctoral;
- [ ] cerrar preguntas de investigación;
- [ ] cerrar hipótesis;
- [ ] definir población / muestra / targets;
- [ ] decidir plataformas generativas;
- [ ] congelar prompts y reglas de repetición;
- [ ] justificar y congelar reglas AIR / CR / MCP / RCR;
- [ ] cerrar protocolo de timestamp y ejecución real;
- [ ] congelar codebook;
- [ ] preparar procedimiento de backup del primer run doctoral.

---

## 12. Final Development Reset

Cuando el protocolo esté congelado:

1. ejecutar `Preview Final Development Reset`;
2. revisar registros afectados y preservados;
3. confirmar preservación de Storage Verification y auditorías de infraestructura;
4. confirmar eliminación de perfiles y datos TEST;
5. ejecutar Final Development Reset;
6. comprobar baseline limpia;
7. verificar que no quedan datos de desarrollo confundibles con datos doctorales;
8. activar Doctoral Research Mode.

---

## 13. Punto exacto para retomar

```text
GSLHub 0.6.2 estable
        ↓
Preproyecto doctoral
        ↓
CV investigador
        ↓
Dossier / demostración para dirección de tesis
        ↓
Congelación metodológica
        ↓
Final Development Reset
        ↓
Baseline limpia
        ↓
Doctoral Research Mode
        ↓
Primer piloto doctoral real
```

No es necesario ejecutar manualmente `GSL-EXEC-GEO-0002`–`0005` para seguir validando el software.

---

## 14. Principio operativo

```text
DESARROLLO
probar → detectar fallos → corregir → validar → limpiar

DOCTORADO
congelar protocolo → ejecutar → preservar → validar → analizar → publicar
```

**Estado actual:** GSLHub 0.6.2 constituye una baseline funcional, responsive y presentable. El siguiente foco es la candidatura y preparación metodológica doctoral, no seguir añadiendo funcionalidades sin necesidad científica.
