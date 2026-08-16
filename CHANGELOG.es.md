# Historial de cambios

Aquí se registran los cambios relevantes de la plataforma GSLHub. Los resultados científicos y los datasets formales conservan su propio historial gobernado dentro de Payload.

## 0.6.2 — 2026-08-16

### Corregido

- El dashboard Research Operations utiliza ahora tokens nativos `--theme-*` de Payload en lugar de valores estáticos `--color-*`.
- Hero, pasos del workflow, tarjetas de acceso, bordes y textos secundarios se adaptan automáticamente a los modos claro y oscuro de Payload con contraste legible.
- No se modifican schemas científicos, hooks de ciclo de vida, calculadores métricos ni registros de investigación.

## 0.6.1 — 2026-08-15

### Corregido

- Evitado que HTML almacenado en caché siga apuntando a CSS/JS de un despliegue anterior.
- Añadido `deploymentId` de Next.js derivado de `NEXT_DEPLOYMENT_ID`, del commit Git actual o de un fallback seguro de versión.
- Forzada la capa documental del sitio público a renderizado dinámico para que el HTML no se reutilice entre redeploys, manteniendo el cacheado normal e inmutable de assets con hash.
- No se modifican schemas científicos, hooks de ciclo de vida, calculadores métricos ni registros de investigación.

## 0.6.0 — 2026-08-15

### Añadido

- UI Doctoral-ready responsive en frontend público, login CMS y administrador Payload.
- Dashboard propio de Research Operations después del login.
- Localización inglés/español del dashboard interno de Research Operations.
- Demostrador público bilingüe de Research Infrastructure:
  - `/research-infrastructure`
  - `/es/research-infrastructure`
- Acceso directo al Research CMS privado desde el header público.
- Separación clara entre difusión científica pública y operaciones gobernadas privadas.

### Modificado

- Navegación, espaciados, cards, metadatos largos, grupos CTA y dashboards adaptados a móvil, tablet, portátil y escritorio.
- Las tablas científicas de Payload conservan el comportamiento nativo con desplazamiento horizontal seguro en pantallas pequeñas.
- El icono del Admin se adapta al slot nativo del breadcrumb sin recortarse.
- GitHub deja de mostrarse como botón independiente en móvil y queda disponible dentro del menú.
- Los CTA claros fuerzan contraste de texto oscuro cuando se muestran sobre fondos oscuros.
- La versión de plataforma pasa a `0.6.0`.

### Regresión de desarrollo completada

- Pipeline completo verificado con 27 registros TEST conectados y descartables.
- Verificada la relación Evidence ↔ Research Artifact del modelo actual.
- Calculadores deterministas superados:
  - AIR = `3 / 4 = 0.75`
  - CR = `2 / 4 = 0.50`
  - MCP = `6 / 3 = 2.00`
  - RCR = `3 / 4 = 0.75`
- Todos los batches TEST y resultados métricos sintéticos se eliminaron correctamente.
- Los registros reales de desarrollo permanecieron intactos:
  - `GSL-EXEC-GEO-0001` Completed
  - `GSL-EXEC-GEO-0002`–`0005` Planned

### Frontera científica

- La plataforma continúa en Development Mode.
- Final Development Reset no se ha ejecutado.
- Doctoral Research Mode no está activado.
- Datos doctorales reales: 0.

## 0.5.0–0.5.6 — 2026-08-13 a 2026-08-15

### Añadido y reforzado

- Almacenamiento persistente de artefactos fuera de los releases de despliegue.
- Verificación Restart, Redeploy y Recovery con SHA-256.
- Research Environment con Development Mode, limpieza TEST, Final Development Reset y bloqueo de activación doctoral.
- Protección de snapshots de Prompt Execution y confirmación segura de nueva sesión.
- Comparación semántica del entorno para evitar falsos cambios por campos opcionales vacíos.
- Relación directa Evidence ↔ Research Artifact limitada a la misma Prompt Execution.
- Autoenlace seguro de Evidence al único Research Artifact de la ejecución.
- Primera ejecución gobernada completa `GSL-EXEC-GEO-0001`.
- Cadena validada de evidencia TXT y captura.

## 0.4.2 — 2026-08-04

### Añadido

- Bloque específico `Technical Review` para Metric Definitions.
- Campos separados para autorrevisión técnica y revisión independiente.
- Estado de validación determinista, fechas, revisores y notas bilingües.

### Gobernanza y seguridad

- `Validated At` y `Validated By` permanecen vacíos mientras una definición está `planned` o `under-review`.
- La validación formal exige technical review, prueba determinista y revisión independiente.
- Los campos científicos quedan congelados después de la validación.

## 0.4.1 — 2026-08-04

### Añadido

- Registro bilingüe central para AIR, CR, MCP y RCR v0.1.0.
- Servicio idempotente de sincronización de Metric Definitions permanentes.
- Runbooks de sincronización y validación determinista.

### Seguridad

- Las definiciones validadas o archivadas no pueden ser sobrescritas por sincronización.
- Los duplicados detienen la operación antes de escribir.

## 0.4.0 — 2026-07-31

### Modificado

- Restaurada la combinación validada Payload 3.75.0, Next.js 16.2.10 y React 19.2.7.
- Eliminada la dependencia S3 del runtime para la fase actual.
- Seleccionadas subidas locales de Payload para los artefactos de investigación.
- Restaurado el administrador nativo de Payload en producción.
