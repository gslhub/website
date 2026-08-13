# Drill de recuperación de artefactos locales

Estado: prueba operacional para la fase pre-piloto doctoral.

## Propósito

Verificar que un archivo sintético guardado en `research-artifacts/` puede copiarse, retirarse temporalmente, restaurarse y recuperar exactamente el mismo tamaño y checksum SHA-256.

La prueba trabaja exclusivamente con archivos cuyo nombre contiene `test-gsl-td-`. No debe ejecutarse con evidencia doctoral real.

## Comando

```bash
npm run verify:local-artifact-recovery
```

Por defecto se selecciona el archivo TEST modificado más recientemente.

Para fijar un archivo concreto:

```bash
GSLHUB_RECOVERY_TEST_FILE="nombre-del-archivo-test.txt" npm run verify:local-artifact-recovery
```

## Operaciones realizadas

1. Calcula tamaño y SHA-256 del original.
2. Crea una copia temporal de backup.
3. Verifica tamaño y SHA-256 de la copia.
4. Retira temporalmente el original a una zona de cuarentena.
5. Restaura el archivo desde la copia de backup.
6. Verifica que el restaurado coincide exactamente con el original.
7. Elimina las copias temporales después del éxito.
8. Ante un error, intenta restaurar primero la copia original de cuarentena.

## Resultado esperado

```json
{
  "ok": true,
  "testType": "local-artifact-backup-recovery-drill",
  "filename": "...test-gsl-td-....txt",
  "bytes": 349,
  "sha256": "...",
  "backupCopyVerified": true,
  "originalTemporarilyRemoved": true,
  "restoredCopyVerified": true,
  "verifiedAt": "YYYY-MM-DDTHH:MM:SSZ"
}
```

Conservar el JSON de salida como evidencia operacional.

## Alcance

Esta prueba demuestra recuperación del archivo local dentro del entorno desplegado. No equivale por sí sola a una copia externa ni a una restauración completa de MongoDB Atlas. La estrategia de backup del piloto debe conservar además la base `gslhub`, las variables de entorno necesarias y una copia externa de los artefactos.

`PILOT_BACKUP_RECOVERY_VERIFIED_AT` no debe rellenarse hasta que la recuperación exigida para la fase haya sido ejecutada y documentada.
