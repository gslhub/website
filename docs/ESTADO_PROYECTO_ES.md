# Estado operativo de GSLHub

**Fecha de corte:** 15 de agosto de 2026  
**Versión de plataforma:** `0.6.0`  
**Entorno:** `Development Mode`  
**Doctoral Research Mode:** no activado  
**Datos doctorales reales:** `0`

---

## 1. Resumen ejecutivo

GSLHub ha completado la validación funcional principal y la fase **Doctoral-ready UI**.

La plataforma ya dispone de:

- infraestructura desplegada en Hostinger;
- MongoDB Atlas;
- administrador Payload gobernado;
- persistencia de artefactos fuera de los releases;
- verificación Restart / Redeploy / Recovery con SHA-256;
- pipeline Execution → Artifact → Evidence → Observation → Citation / Metric;
- AIR, CR, MCP y RCR con validación determinista;
- Research Environment con separación Development / Doctoral;
- regresión interna completa y cleanup TEST seguro;
- frontend y Admin responsive;
- dashboard interno de Research Operations EN/ES;
- demostrador público bilingüe de la infraestructura científica.

La plataforma **todavía no contiene datos doctorales reales** y debe permanecer en Development Mode hasta ejecutar el Final Development Reset y congelar el protocolo doctoral.

---

## 2. Estado por área

| Área | Estado | Situación |
| --- | --- | --- |
| Hosting / deploy | ✅ Operativo | `main` despliega correctamente a Hostinger. |
| Payload CMS | ✅ Operativo | Login, listas, formularios, drafts, versiones y gobernanza funcionan. |
| MongoDB Atlas | ✅ Operativo | Persistencia científica activa. |
| Research Artifacts | ✅ Verificado | Almacenamiento persistente con checksum. |
| Restart / Redeploy | ✅ Verificado | Artefactos conservados con mismo SHA-256. |
| Recovery drill | ✅ Verificado | Recuperación controlada completada. |
| Metric Definitions | ✅ Validación desarrollo | AIR, CR, MCP y RCR v0.1.0. |
| Pipeline científico | ✅ Verificado | Relaciones y sellado funcionando end-to-end. |
| Regresión TEST | ✅ Completada | Full pipeline + AIR/CR/MCP/RCR + cleanup. |
| Responsive público | ✅ Completado | Móvil, tablet, portátil y escritorio. |
| Responsive Admin | ✅ Completado | Listas, tablas y dashboard adaptados. |
| Research Operations Dashboard | ✅ Operativo | Vista útil tras login, EN/ES. |
| Research Infrastructure demo | ✅ Operativo | EN y ES en frontend público. |
| Final Development Reset | ⏳ Pendiente | Se ejecutará cuando el protocolo doctoral quede congelado. |
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

Se ejecutaron por separado los calculadores reales:

```text
AIR = 3 / 4 = 0.75   PASS
CR  = 2 / 4 = 0.50   PASS
MCP = 6 / 3 = 2.00   PASS
RCR = 3 / 4 = 0.75   PASS
```

### Cleanup

Todos los Administrative Batches y registros TEST generados fueron eliminados correctamente.

Comprobaciones posteriores:

```text
Administrative Batches TEST   0
Metrics TEST                  0
Prompt Executions TEST        0
```

Los registros reales de desarrollo quedaron intactos.

---

## 4. Estado de las ejecuciones reales de desarrollo

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

No se crearon AIR/CR/MCP para esta ejecución porque el prompt no definía un target específico. Esto es metodológicamente correcto.

Todo este conjunto continúa siendo **desarrollo**, no resultado doctoral.

---

## 5. Infraestructura de artefactos

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

El backup operativo debe incluir:

- MongoDB;
- directorio persistente `research-artifacts`;
- configuración necesaria para reconstruir producción.

---

## 6. GSLHub 0.6.0 — Doctoral-ready UI

La UI se ha validado visualmente en distintos tamaños de pantalla.

### Frontend público

- header responsive;
- navegación móvil;
- Home, Research, Benchmarks, Dashboard, Publications, People, Software, Datasets y Resources adaptados;
- metadatos largos sin desbordes relevantes;
- botones apilables;
- acceso visible al Research CMS;
- GitHub integrado correctamente en navegación responsive.

### Payload Admin

- icono GSLHub corregido para el breadcrumb nativo;
- tablas científicas desplazables horizontalmente en tablet/móvil;
- login adaptado;
- dashboard interno poblado;
- dashboard Research Operations localizado en inglés y español según `locale`.

### Demostrador académico

Rutas públicas:

```text
EN  /research-infrastructure
ES  /es/research-infrastructure
```

Recorrido conceptual:

```text
Problema científico
→ Hipótesis
→ Experimento
→ Ejecución
→ Evidencia
→ Métricas
→ Reproducibilidad
```

Este demostrador está pensado para explicar GSLHub en aproximadamente cinco minutos sin exponer los campos internos ni datos privados del CMS.

---

## 7. Línea doctoral asociada

El proyecto de investigación que GSLHub pretende soportar es:

> **Del SEO al GEO (Generative Engine Optimization): desarrollo y validación de un modelo científico para optimizar la visibilidad de organizaciones en motores de búsqueda basados en Inteligencia Artificial.**

GSLHub actúa como infraestructura experimental y demostración de viabilidad técnica y metodológica.

El siguiente trabajo ya no debe centrarse en añadir funcionalidades arbitrarias, sino en:

- preparar el preproyecto doctoral;
- definir problema científico y research gap;
- formular preguntas e hipótesis;
- congelar metodología y diseño experimental;
- decidir targets y muestra;
- definir protocolo de AI Systems y repeticiones;
- preparar plan de análisis y publicaciones.

---

## 8. Research Environment

Estado actual:

```text
Mode                     Development
Final Development Reset  No ejecutado
Doctoral Research Mode   No activado
```

Development Mode continúa permitiendo:

- registros TEST;
- escenarios sintéticos;
- pruebas de producto;
- reset controlado.

**No activar Doctoral Research Mode todavía.**

---

## 9. Gate antes del Final Development Reset

La validación funcional del software se considera cerrada para la versión `0.6.0`.

Antes del reset final debe completarse la preparación metodológica:

- [ ] cerrar título y alcance del proyecto doctoral;
- [ ] cerrar preguntas de investigación;
- [ ] cerrar hipótesis;
- [ ] definir población / muestra / targets;
- [ ] decidir plataformas generativas a estudiar;
- [ ] congelar prompts y reglas de repetición;
- [ ] congelar reglas AIR / CR / MCP / RCR;
- [ ] revisar timestamp y protocolo de ejecución real;
- [ ] congelar codebook;
- [ ] preparar procedimiento de backup antes del primer run doctoral.

---

## 10. Final Development Reset

Cuando el protocolo esté congelado:

1. ejecutar `Preview Final Development Reset`;
2. revisar las colecciones y registros afectados;
3. confirmar preservación de Storage Verification y auditorías de infraestructura;
4. confirmar eliminación de `Rocio Tapia (TEST)` y otros perfiles TEST;
5. ejecutar Final Development Reset;
6. comprobar baseline limpia;
7. verificar que no existen datos de desarrollo confundibles con datos doctorales;
8. activar Doctoral Research Mode.

---

## 11. Punto exacto para retomar

El siguiente bloque de trabajo recomendado es:

```text
GSLHub 0.6.0 cerrado
        ↓
Preproyecto doctoral
        ↓
CV investigador
        ↓
Dossier / demostrador para dirección de tesis
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

No es necesario ejecutar manualmente `GSL-EXEC-GEO-0002`–`0005` para seguir validando el software. Permanecen en Planned hasta decidir si se conservarán como parte del desarrollo histórico o se eliminarán en el Final Development Reset.

---

## 12. Principio operativo

```text
DESARROLLO
probar → detectar fallos → corregir → validar → limpiar

DOCTORADO
congelar protocolo → ejecutar → preservar → validar → analizar → publicar
```

**Estado actual:** la validación funcional y visual de producto está cerrada en `0.6.0`; el siguiente foco es la preparación académica y metodológica de la candidatura doctoral antes de iniciar cualquier recogida de datos reales.
