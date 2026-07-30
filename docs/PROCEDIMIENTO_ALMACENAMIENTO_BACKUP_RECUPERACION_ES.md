# Procedimiento de almacenamiento, backup y recuperación de GSLHub

**Versión:** 0.1.0  
**Estado:** Preparado para configuración y prueba de recuperación  
**Ámbito:** MongoDB Atlas, Research Artifacts y evidencia científica del primer piloto

## 1. Objetivo

Este procedimiento establece cómo configurar almacenamiento duradero para los archivos científicos de GSLHub, crear copias coherentes de la base de datos y de los objetos, verificar su integridad y restaurarlos en un entorno aislado.

Una copia no se considera válida hasta que:

1. contiene el archivo de MongoDB;
2. contiene todos los objetos esperados;
3. supera la verificación SHA-256 del manifiesto;
4. puede restaurarse en un entorno aislado;
5. los registros restaurados conservan sus relaciones;
6. los archivos restaurados coinciden con los checksums científicos almacenados en Payload.

## 2. Arquitectura de almacenamiento

GSLHub admite dos modos:

| Modo | Uso | Validez para evidencia irreemplazable |
| --- | --- | --- |
| `local` | Desarrollo, pruebas y transición | No |
| `s3-compatible` | Producción con bucket privado y backup independiente | Sí, después de superar la recuperación |

El adaptador S3 se activa únicamente con:

```env
S3_ENABLED=true
```

Cuando está desactivado, Payload mantiene el directorio local `research-artifacts`.

Cuando está activado:

- Payload almacena los uploads de `research-artifacts` en el bucket;
- el bucket permanece privado;
- la descarga continúa pasando por Payload para conservar su control de acceso;
- cada nuevo artefacto registra proveedor, bucket, región, endpoint, clave de objeto y fecha en `storageMetadata`;
- el checksum SHA-256 científico continúa calculándose antes del almacenamiento.

Referencia técnica del adaptador: <https://payloadcms.com/docs/upload/storage-adapters>

## 3. Requisitos del bucket

Antes de activar S3 deben cumplirse estas condiciones:

- bucket dedicado a GSLHub o prefijo exclusivo;
- acceso público deshabilitado;
- cifrado en reposo activado;
- versionado de objetos activado cuando el proveedor lo permita;
- credenciales exclusivas para la aplicación;
- permisos mínimos de lectura, escritura, listado y eliminación sobre el prefijo configurado;
- logs o auditoría de operaciones habilitados cuando el proveedor los ofrezca;
- una política de retención compatible con la gobernanza científica;
- una copia independiente fuera de la cuenta o ubicación primaria.

No debe utilizarse una URL pública directa para los Research Artifacts privados.

## 4. Variables de entorno

```env
S3_ENABLED=false
S3_BUCKET=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
S3_REGION=us-east-1
S3_ENDPOINT=
S3_FORCE_PATH_STYLE=false
S3_PREFIX=research-artifacts
```

### AWS S3

Normalmente:

```env
S3_ENABLED=true
S3_BUCKET=gslhub-research-production
S3_REGION=eu-west-1
S3_ENDPOINT=
S3_FORCE_PATH_STYLE=false
S3_PREFIX=research-artifacts
```

### Servicio compatible con S3

Además del bucket y las credenciales, suele requerir:

```env
S3_ENDPOINT=https://endpoint-del-proveedor.example
S3_FORCE_PATH_STYLE=true
```

La configuración concreta debe comprobarse con la documentación del proveedor.

## 5. Despliegue seguro

1. Crear el bucket y el usuario técnico.
2. Confirmar que el bucket no es público.
3. Configurar las variables en Hostinger sin incluirlas en Git.
4. Mantener inicialmente `S3_ENABLED=false`.
5. Desplegar el código y confirmar que el sitio funciona con almacenamiento local.
6. Cambiar `S3_ENABLED=true`.
7. Ejecutar un único despliegue y esperar a que termine.
8. Consultar el endpoint administrativo:

```text
GET /api/test-data-batches/storage-readiness
```

El endpoint requiere una sesión de administrador y no devuelve secretos.

El resultado esperado antes del piloto es:

```json
{
  "readyForPilot": true,
  "checks": {
    "databaseConfigured": true,
    "payloadSecretConfigured": true,
    "durableArtifactStorageEnabled": true,
    "bucketConfigured": true,
    "regionConfigured": true,
    "endpointValid": true
  }
}
```

Este resultado confirma configuración, no conectividad ni recuperación. La prueba real sigue siendo obligatoria.

## 6. Prueba funcional de almacenamiento

Crear un Research Artifact de prueba con código `TEST-` mediante el framework administrativo o un registro controlado.

Comprobar:

- upload completado;
- acceso anónimo denegado;
- descarga autenticada permitida;
- `integrity.checksumAlgorithm = sha256`;
- `integrity.checksum` contiene 64 caracteres hexadecimales;
- `storageMetadata.provider = s3-compatible`;
- `storageMetadata.durabilityStatus = durable-object-storage`;
- `storageMetadata.objectKey` coincide con el objeto del bucket;
- el checksum del archivo descargado coincide con el registrado;
- la eliminación controlada elimina también el objeto físico.

No usar todavía evidencia real del piloto para esta prueba.

## 7. Herramientas necesarias para backup

En el equipo o runner seguro de backup:

- MongoDB Database Tools: `mongodump` y `mongorestore`;
- AWS CLI compatible con el proveedor S3;
- `sha256sum` o `shasum`;
- `gzip`;
- acceso de solo lectura al origen y escritura al repositorio de backups.

Las copias deben almacenarse en un volumen cifrado y con acceso restringido.

## 8. Crear una copia

Desde la raíz del repositorio:

```bash
export DATABASE_URL='mongodb+srv://...'
export S3_ENABLED=true
export S3_BUCKET='gslhub-research-production'
export S3_PREFIX='research-artifacts'
export S3_REGION='eu-west-1'
# Solo para servicios compatibles:
export S3_ENDPOINT='https://endpoint.example'

bash scripts/backup-research-state.sh
```

Puede definirse otro destino:

```bash
export BACKUP_ROOT='/ruta/cifrada/gslhub-backups'
```

El resultado contiene:

```text
gslhub-YYYYMMDDTHHMMSSZ/
├── mongodb.archive.gz
├── research-artifacts/
├── backup-metadata.txt
└── manifest.sha256
```

La copia de MongoDB y la copia de objetos deben realizarse en la misma ventana operativa. Durante el primer piloto, no deben editarse registros ni subirse archivos mientras se crea el backup final de la ronda.

## 9. Verificar una copia

```bash
bash scripts/verify-research-backup.sh \
  /ruta/cifrada/gslhub-backups/gslhub-YYYYMMDDTHHMMSSZ
```

La verificación:

- comprueba que existe el archivo de MongoDB;
- prueba la integridad gzip;
- verifica todos los SHA-256 del manifiesto;
- comprueba que existe el directorio de objetos;
- informa del número de artefactos incluidos.

Un backup con cualquier error queda rechazado y no debe sustituir a una copia válida anterior.

## 10. Restauración aislada

La restauración está bloqueada salvo confirmación explícita.

```bash
export RESTORE_CONFIRMATION='RESTORE_GSLHUB_ISOLATED'
export TARGET_DATABASE_URL='mongodb+srv://.../gslhub-recovery'
export RESTORE_S3_ENABLED=true
export RESTORE_S3_BUCKET='gslhub-recovery-test'
export RESTORE_S3_PREFIX='research-artifacts'
export RESTORE_S3_ENDPOINT='https://endpoint.example'

bash scripts/restore-research-state.sh \
  /ruta/cifrada/gslhub-backups/gslhub-YYYYMMDDTHHMMSSZ
```

Por defecto, el script rechaza restaurar sobre la misma `DATABASE_URL` de producción.

Solo para una restauración formal autorizada puede habilitarse:

```env
ALLOW_PRODUCTION_RESTORE=true
```

No debe utilizarse durante las pruebas periódicas.

## 11. Validación posterior a la restauración

En el entorno recuperado:

1. iniciar GSLHub con la base y el bucket restaurados;
2. comprobar acceso al administrador;
3. comparar recuentos por colección;
4. verificar proyectos, benchmark, experimento, prompt y sistema;
5. abrir una muestra de Prompt Executions;
6. abrir sus Observations, Evidence y Citations relacionadas;
7. descargar todos los artefactos del primer piloto;
8. recalcular SHA-256;
9. comparar cada resultado con `Research Artifacts → Integrity → Checksum`;
10. comprobar que usuarios anónimos no acceden a archivos restringidos;
11. ejecutar los calculadores deterministas sobre una copia de los inputs;
12. documentar fecha, responsable, duración y resultado de la recuperación.

## 12. Criterios de aprobación

El almacenamiento y recuperación se consideran aprobados únicamente cuando:

- el endpoint de readiness devuelve `readyForPilot: true`;
- un upload de prueba llega al bucket;
- la descarga autenticada conserva el mismo SHA-256;
- el objeto no es accesible públicamente;
- el backup incluye MongoDB y objetos;
- el manifiesto pasa sin errores;
- la restauración aislada finaliza;
- los recuentos y relaciones son correctos;
- todos los artefactos muestreados conservan sus checksums;
- la prueba queda registrada en una evidencia o acta interna.

## 13. Frecuencia mínima

Durante el piloto:

- backup antes de iniciar la ronda;
- backup después de cada jornada de captura;
- backup final al cerrar la ronda;
- verificación automática de cada copia;
- prueba de restauración antes de la primera ronda real;
- prueba de restauración al menos trimestral mientras exista investigación activa.

## 14. Retención recomendada

Como regla inicial:

- conservar todas las copias del primer piloto hasta su publicación y revisión;
- no eliminar la última copia válida de una versión científica;
- mantener al menos una copia fuera del proveedor primario;
- documentar cualquier eliminación de evidencia o backup;
- aplicar la normativa legal y contractual cuando existan datos personales o restringidos.

## 15. Incidentes

Ante pérdida, corrupción o acceso no autorizado:

1. detener nuevas escrituras;
2. preservar logs y estado del sistema;
3. identificar la última copia válida;
4. no sobrescribir producción durante el diagnóstico;
5. restaurar primero en un entorno aislado;
6. comparar checksums y relaciones;
7. documentar el incidente y las decisiones;
8. crear nuevos registros o versiones cuando la integridad científica haya quedado afectada.
