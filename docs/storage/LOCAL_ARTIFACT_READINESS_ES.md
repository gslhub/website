# Verificación de almacenamiento local para el piloto doctoral

Estado: obligatorio antes de crear las cinco ejecuciones reales del primer piloto.

## Objetivo

Comprobar que los artefactos científicos guardados por Payload en `research-artifacts/` sobreviven al funcionamiento normal del servidor y que pueden recuperarse junto con MongoDB desde una copia de seguridad.

El almacenamiento S3 no forma parte de esta fase.

## Prueba A — roundtrip y persistencia

1. Crear o subir un artefacto de prueba claramente identificado como `TEST-STORAGE-ROUNDTRIP`.
2. Registrar su nombre de archivo, fecha, tamaño y checksum SHA-256 si está disponible.
3. Abrir o descargar el archivo desde el registro de Payload y comprobar que su contenido coincide.
4. Reiniciar la aplicación Node.js desde Hostinger sin redesplegar.
5. Volver a abrir el mismo registro y comprobar que el archivo sigue disponible e íntegro.
6. Realizar un redeploy controlado de la misma versión de la aplicación.
7. Volver a comprobar el registro y el archivo.
8. Si el archivo sigue presente e íntegro después del redeploy, registrar la fecha ISO-8601 UTC en la variable:

```text
PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT=YYYY-MM-DDTHH:MM:SSZ
```

9. Si el archivo desaparece después del redeploy, NO completar la variable. El almacenamiento local del entorno gestionado no es apto como archivo científico persistente y deberá cambiarse antes del piloto real.

## Prueba B — backup y recuperación

La copia debe incluir conjuntamente:

- base de datos MongoDB `gslhub`;
- directorio `research-artifacts/`;
- variables de entorno necesarias para restaurar la aplicación.

Procedimiento:

1. Crear una copia de seguridad de MongoDB.
2. Copiar íntegramente `research-artifacts/` fuera del directorio activo de la aplicación.
3. Registrar fecha, número de archivos y, cuando sea viable, checksums.
4. Restaurar la copia en un entorno de prueba o mediante un procedimiento controlado que no destruya la única copia existente.
5. Comprobar que el registro de Payload y el archivo físico restaurado siguen relacionados.
6. Abrir el artefacto restaurado y comprobar integridad.
7. Solo después de una recuperación satisfactoria, registrar:

```text
PILOT_BACKUP_RECOVERY_VERIFIED_AT=YYYY-MM-DDTHH:MM:SSZ
```

## Criterio de aprobación

El almacenamiento local está listo para el piloto únicamente cuando existen ambas marcas:

```text
PILOT_ARTIFACT_ROUNDTRIP_VERIFIED_AT
PILOT_BACKUP_RECOVERY_VERIFIED_AT
```

Estas variables son evidencia operativa, no sustituyen la copia de seguridad real.

## Importante

No utilizar documentos doctorales únicos o irremplazables para estas pruebas. Utilizar exclusivamente artefactos de prueba hasta confirmar el comportamiento del almacenamiento durante restart, redeploy y restore.
