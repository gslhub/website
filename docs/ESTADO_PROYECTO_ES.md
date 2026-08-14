# Estado operativo de GSLHub

**Fecha de corte:** 14 de agosto de 2026  
**Versión de plataforma:** `0.5.5`  
**Entorno:** `Development Mode`  
**Doctoral Research Mode:** no activado  
**Objetivo del documento:** dejar una fotografía operativa exacta para saber dónde retomar el desarrollo sin confundir registros de validación con datos doctorales reales.

---

## 1. Resumen ejecutivo

GSLHub ya ha superado la fase de prototipo básico. La plataforma está desplegada en producción, el administrador Payload funciona, el modelo científico está conectado, los artefactos persisten fuera del árbol de despliegue, la recuperación local ha sido probada y el primer flujo end-to-end de una ejecución controlada se ha completado.

El proyecto **todavía no está en fase de recogida doctoral real**. Todos los registros actuales deben interpretarse como validación de producto y metodología en `Development Mode`.

La posición actual puede resumirse así:

```text
Infraestructura              Operativa
Persistencia de artefactos   Verificada
Recovery drill               Verificado
Métricas v0.1.0              Probadas y revisadas en desarrollo
Research Environment         Implementado
Primera ejecución completa   Completada
Repeticiones 2–5             Planned
Final Development Reset      Pendiente
Doctoral Research Mode       No activado
Datos doctorales reales      0
```

---

## 2. Estado por área

| Área | Estado | Observación |
| --- | --- | --- |
| Hostinger | ✅ Operativo | Aplicación desplegada y funcionando. |
| Deploy desde GitHub | ✅ Operativo | `main` despliega correctamente. |
| Payload CMS | ✅ Operativo | Login, colecciones, drafts, versiones y validaciones funcionan. |
| MongoDB Atlas | ✅ Operativo | Base científica persistente. |
| Research Artifacts | ✅ Operativo | Uploads con checksum e integridad. |
| Ruta persistente de artefactos | ✅ Verificada | Fuera del directorio de release/despliegue. |
| Restart Node.js | ✅ Verificado | Artefacto conservado con mismo SHA-256 y HTTP 200. |
| Redeploy | ✅ Verificado | Artefacto conservado con mismo SHA-256 y HTTP 200. |
| Recovery drill | ✅ Verificado | Backup/restauración local controlada completada. |
| Storage Verification audit | ✅ Creado | Evidencia permanente de infraestructura. |
| Metric Definitions | ✅ Desarrollo validado | AIR, CR, MCP y RCR v0.1.0. |
| Technical Review | ✅ Implementado | Autorrevisión técnica separada de revisión independiente. |
| Independent Review | ✅ Probado en desarrollo | Se usó `Rocio Tapia (TEST)` exclusivamente como perfil de validación de producto. |
| Evidence ↔ Research Artifacts | ✅ Implementado | Relación directa y validada por Prompt Execution. |
| Research Environment | ✅ Implementado | Development Mode, TEST Reset, Final Development Reset y activación doctoral. |
| Primera ejecución end-to-end | ✅ Completada | `GSL-EXEC-GEO-0001`. |
| Repeticiones restantes | ⏳ Pendientes | `GSL-EXEC-GEO-0002` a `0005`. |
| Final Development Reset | ⏳ Pendiente | No ejecutar hasta terminar validación del producto. |
| Doctoral Research Mode | ⛔ No activado | La activación debe hacerse solo con baseline limpia. |

---

## 3. Infraestructura de almacenamiento validada

Ruta persistente de producción:

```text
/home/<usuario-hostinger>/domains/gslhub.com/gslhub-data/research-artifacts
```

Secuencia verificada:

```text
Payload upload
   ↓
fichero en ruta persistente
   ↓
HTTP 200 autenticado
   ↓
Node.js Restart
   ↓
mismo fichero + mismo SHA-256 + HTTP 200
   ↓
Redeploy
   ↓
mismo fichero + mismo SHA-256 + HTTP 200
   ↓
Recovery drill
   ↓
restauración desde copia verificada + mismo SHA-256
```

Conclusión: la ruta actual es adecuada para la fase presente siempre que el backup operativo incluya MongoDB, el directorio persistente de artefactos y la configuración necesaria para reconstruir el entorno.

S3-compatible storage queda como mejora futura de escalabilidad, no como bloqueo actual.

---

## 4. Métricas científicas

Las definiciones permanentes disponibles son:

| Código | Métrica | Versión |
| --- | --- | --- |
| AIR | Answer Inclusion Rate | 0.1.0 |
| CR | Citation Rate | 0.1.0 |
| MCP | Mean Citation Position | 0.1.0 |
| RCR | Response Consistency Rate | 0.1.0 |

Durante desarrollo se comprobó:

- sincronización de definiciones;
- validación determinista de calculadores;
- technical self-review;
- flujo de independent review mediante perfil TEST;
- sellado de definiciones y snapshots.

### Importante

Los resultados sintéticos usados para comprobar los calculadores **no son resultados doctorales**.

Los calculadores imponen requisitos reales:

```text
AIR → targetType + targetValue + observaciones validadas/aceptadas
CR  → targetType + targetValue + observaciones validadas/aceptadas
MCP → citas/posiciones codificables
RCR → varias ejecuciones comparables con observaciones aceptadas
```

Por ello no debe crearse un resultado `0` simplemente porque una ejecución no tenga target o no sea aplicable a una métrica.

---

## 5. Primera ejecución end-to-end completada

### Prompt Execution

```text
GSL-EXEC-GEO-0001
Lifecycle Status: Completed
Editorial Status: Published
Repetition Number: 1
AI System: ChatGPT Search
```

Prompt utilizado:

```text
What factors determine whether a website is selected, cited or recommended by generative search systems? Provide a concise explanation and cite the most relevant sources you rely on.
```

Resultado observado:

```text
Response Status: Partial response
Explicit Citations Shown: No
Source Links Shown: No
Sources Panel Shown: No
Visible Citation Count: 0
```

Se codificó como `Partial response` porque la respuesta respondió al contenido sustantivo, pero no cumplió la parte del prompt que pedía citas explícitas.

### Research Artifacts

```text
GSL-ART-GEO-0001
→ raw response TXT
→ SHA-256 verificado físicamente contra almacenamiento persistente

GSL-ART-GEO-0002
→ screenshot de la sesión aislada
→ SHA-256 verificado físicamente contra almacenamiento persistente
```

### Evidences

```text
GSL-EVD-GEO-0001
→ Response export
→ Validated

GSL-EVD-GEO-0002
→ Screenshot
→ Validated
```

### Observation

```text
GSL-OBS-GEO-0001
→ Response-level observation
→ Validated
→ Published
```

### Citations

No se creó ningún registro Citation porque no se observó ninguna cita explícita. La ausencia está documentada en la Observation y en las Evidence correspondientes.

### Metrics de esta ejecución

No se han creado AIR/CR/MCP para `GSL-EXEC-GEO-0001` porque el prompt no definía una marca, dominio o entidad objetivo concreta.

RCR tampoco puede calcularse todavía porque solo existe una repetición completada del conjunto real de desarrollo.

---

## 6. Ejecuciones reservadas

Estado actual:

```text
GSL-EXEC-GEO-0001   Completed
GSL-EXEC-GEO-0002   Planned
GSL-EXEC-GEO-0003   Planned
GSL-EXEC-GEO-0004   Planned
GSL-EXEC-GEO-0005   Planned
```

La primera ejecución demostró el flujo completo, pero antes de continuar automáticamente con 0002–0005 existe una decisión metodológica pendiente.

---

## 7. Decisión metodológica pendiente

El prompt actual es general y no define un target específico.

Esto significa:

```text
Sirve para:
- probar repetición controlada;
- probar consistencia de respuestas;
- probar RCR cuando existan varias observaciones comparables;
- estudiar presencia/ausencia de citas en respuestas generales.

No sirve directamente para:
- AIR target-specific;
- CR target-specific;
- MCP de un target concreto si no existen citas codificables.
```

### Recomendación antes de continuar

No asumir que las ejecuciones 0002–0005 deben repetirse sin revisar el diseño.

Conviene decidir entre:

**Opción A — mantener 0002–0005 con el prompt general**  
Objetivo: probar repetibilidad y RCR del workflow general.

**Opción B — reservar parte del desarrollo para un prompt target-specific**  
Objetivo: probar AIR, CR y MCP end-to-end con un dominio/marca/entidad objetivo bien definido.

La opción más completa es hacer ambas cosas durante Development Mode antes del Final Development Reset.

---

## 8. Incidencias de desarrollo detectadas y resueltas

Durante la validación end-to-end aparecieron problemas útiles para endurecer la plataforma:

1. **Ruta persistente mal derivada** por composición duplicada de dominio.
   - Corregido.
   - Ruta definitiva verificada.

2. **Variables de entorno de Hostinger no adecuadas para depender de configuración manual persistente.**
   - Se adoptó derivación automática y almacenamiento fuera del release.

3. **`New Session Confirmed` bloqueado por snapshot sellado.**
   - Corregido para permitir únicamente la transición segura `false → true` después del inicio.

4. **Payload reenviaba opcionales vacíos como representaciones distintas.**
   - Se introdujo comparación semántica para evitar falsos cambios del Execution Environment.

5. **Edición de Response bloqueada por comparación estructural del entorno.**
   - Corregido en la protección de Prompt Execution.

6. **Evidence no enlazaba directamente Research Artifacts.**
   - Añadida relación multiple con validación de misma Prompt Execution.

7. **Sellado de Evidence después de Validated.**
   - Confirmado como comportamiento correcto.
   - Regla operativa: completar snapshot primero, validar después.

Estas incidencias son una parte valiosa de la validación del producto y justifican mantener Development Mode hasta completar todos los flujos críticos.

---

## 9. Research Environment y transición doctoral

Estado actual:

```text
Mode: Development
```

Development Mode permite:

- registros TEST;
- revisores TEST;
- ejecución de escenarios sintéticos;
- pruebas end-to-end;
- resets de desarrollo.

El sistema dispone de:

```text
Preview TEST reset
Preview Final Development Reset
Doctoral Research Mode activation gate
```

La activación doctoral está intencionadamente bloqueada mientras existan registros científicos de desarrollo que deban limpiarse.

**No activar Doctoral Research Mode todavía.**

---

## 10. Lo que falta antes del Final Development Reset

### Validación funcional recomendada

- [ ] Completar la estrategia de ejecuciones 0002–0005.
- [ ] Probar varias repeticiones comparables para RCR.
- [ ] Probar un flujo target-specific end-to-end para AIR.
- [ ] Probar un flujo target-specific end-to-end para CR.
- [ ] Probar MCP con citas realmente observadas y orden codificable.
- [ ] Confirmar que no se crean Metric Results cuando una métrica no aplica.
- [ ] Revisar timestamp real de ejecución antes de sellar cada run.
- [ ] Repetir al menos una cadena completa sin incidencias manuales inesperadas.

### Validación del reset

- [ ] Ejecutar Preview Final Development Reset.
- [ ] Revisar exactamente qué colecciones serán eliminadas o restauradas.
- [ ] Confirmar preservación de Storage Verification y contexto de infraestructura.
- [ ] Confirmar eliminación de `Rocio Tapia (TEST)` y otros perfiles TEST.
- [ ] Confirmar restauración limpia de definiciones permanentes que deban conservarse.

---

## 11. Lo que falta antes de activar Doctoral Research Mode

Después del Final Development Reset:

- [ ] Confirmar baseline limpia.
- [ ] Congelar proyecto y benchmark doctoral.
- [ ] Congelar protocolo experimental.
- [ ] Congelar prompts y versiones.
- [ ] Aprobar diccionario de targets.
- [ ] Aprobar reglas AIR/CR/MCP/RCR definitivas.
- [ ] Congelar perfiles de AI Systems y condiciones de acceso.
- [ ] Congelar codebook de observaciones y citas.
- [ ] Verificar procedimiento de backup previo al primer run real.
- [ ] Activar Doctoral Research Mode.

La activación deberá considerarse un cambio de fase irreversible desde la interfaz.

---

## 12. Punto exacto para retomar

**No continuar automáticamente con datos doctorales.**

El siguiente bloque de trabajo recomendado es:

```text
1. Revisar diseño metodológico de las repeticiones 0002–0005.
2. Decidir qué pruebas se usarán para RCR.
3. Diseñar al menos un prompt/target de desarrollo específico para AIR/CR/MCP.
4. Ejecutar las pruebas restantes en Development Mode.
5. Verificar Final Development Reset.
6. Limpiar todo el desarrollo.
7. Solo entonces preparar el protocolo doctoral real.
```

Si se decide continuar primero con la repetición 2 del prompt general, el siguiente registro operativo es:

```text
GSL-EXEC-GEO-0002
Lifecycle Status actual: Planned
Repetition Number: 2
```

pero su objetivo debe quedar definido explícitamente como **validación de repetibilidad/RCR en desarrollo**, no como dato doctoral.

---

## 13. Registros que no deben interpretarse como resultados doctorales

Hasta ejecutar Final Development Reset y activar Doctoral Research Mode, deben considerarse exclusivamente de desarrollo:

- `GSL-EXEC-GEO-0001` y cualquier 0002–0005 ejecutado antes del reset;
- `GSL-ART-GEO-*` asociados a estas ejecuciones;
- `GSL-EVD-GEO-*` asociados a estas ejecuciones;
- `GSL-OBS-GEO-*` asociados a estas ejecuciones;
- cualquier Citation/Metric Result creado durante estas pruebas;
- revisión atribuida a `Rocio Tapia (TEST)`;
- resultados sintéticos de validación de AIR, CR, MCP y RCR.

---

## 14. Principio operativo

GSLHub debe preservar una separación inequívoca entre:

```text
DESARROLLO
probar → detectar fallos → corregir → resetear

DOCTORADO
congelar protocolo → ejecutar → preservar → validar → analizar
```

El proyecto está actualmente al final del primer bloque: **el flujo principal ya funciona, pero todavía debemos demostrar repetibilidad, completar los casos métricos target-specific y ejecutar una limpieza final controlada antes de iniciar investigación doctoral real.**
