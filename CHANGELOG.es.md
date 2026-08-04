# Historial de cambios

Aquí se registran los cambios relevantes de la plataforma GSLHub. Los resultados científicos y las publicaciones formales de datasets conservan su propio historial gobernado dentro de Payload.

## 0.4.1 — 2026-08-04

### Añadido

- Registro bilingüe central para AIR, CR, MCP y RCR v0.1.0.
- Servicio idempotente de sincronización de Metric Definitions permanentes.
- Runbooks en inglés y español para sincronización y validación determinista.
- Registros revisados de inputs requeridos para las cuatro métricas del piloto.

### Modificado

- El aprovisionamiento permanente crea las definiciones ausentes y sincroniza los registros existentes en `planned` o `under-review`.
- La política de datos ausentes de las cuatro definiciones pasa a `report-separately`.
- La generación descartable y el aprovisionamiento permanente utilizan la misma fuente científica.
- La versión del proyecto pasa de 0.4.0 a 0.4.1.

### Seguridad

- Las definiciones en estado `validated`, `active`, `deprecated` o `archived` no pueden ser sobrescritas.
- Los duplicados de identidad o de código/versión detienen la operación antes de escribir.
- Si falla la localización española después de crear una definición inglesa, se elimina el registro nuevo incompleto.
- La sincronización no completa ni modifica `Validated At` o `Validated By`.

### Secuencia operativa

1. Desplegar y compilar.
2. Ejecutar el lote permanente de sincronización de definiciones métricas.
3. Verificar ambos idiomas y el estado `Under review`.
4. Ejecutar por separado los escenarios deterministas AIR, CR, MCP y RCR.
5. Revisar y limpiar sus registros descartables `TEST-`.

## 0.4.0 — 2026-07-31

### Modificado

- Restaurada la combinación validada Payload 3.75.0, Next.js 16.2.10 y React 19.2.7.
- Eliminada la dependencia S3 del runtime para la fase doctoral actual.
- Seleccionadas las subidas locales de Payload para los artefactos de investigación.
- Restaurado el administrador nativo de Payload en producción.
