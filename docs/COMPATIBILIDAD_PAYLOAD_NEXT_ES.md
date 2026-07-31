# Compatibilidad Payload / Next.js

## Estado validado

GSLHub utiliza actualmente la siguiente combinación en producción:

```text
Payload CMS       3.75.0
@payloadcms/next  3.75.0
@payloadcms/ui    3.75.0
Next.js           16.2.10
React             19.2.7
React DOM         19.2.7
```

Esta combinación fue verificada el **31 de julio de 2026** en `gslhub.com`.

Pruebas completadas con éxito:

- login nativo de Payload visible;
- autenticación correcta;
- dashboard y navegación administrativa;
- listado de colecciones;
- formulario de creación de Administrative Batches;
- listado de Metric Results;
- acceso a registros existentes;
- APIs y MongoDB operativos.

## Incidencia encontrada

La actualización de los paquetes Payload desde 3.75.0 hasta 3.86.0 mantuvo Next.js 16.2.10 y React 19.2.7, pero provocó que el administrador renderizara una frontera React Server Components vacía en producción.

Durante el diagnóstico se verificó que:

- las respuestas `/admin` devolvían estado `200`;
- el usuario autenticado estaba disponible;
- el servidor generaba el payload RSC completo;
- no existían errores RSC;
- el navegador recibía una frontera completada sin contenido visible.

La regresión controlada de todos los paquetes Payload a 3.75.0 recuperó inmediatamente el login, dashboard, formularios y listados. Por tanto, la incompatibilidad queda asociada a la actualización posterior de Payload o a su interacción con esta combinación de Next.js y el entorno de producción.

## Política de versiones

No actualizar automáticamente los siguientes paquetes:

```text
payload
@payloadcms/next
@payloadcms/ui
@payloadcms/db-mongodb
@payloadcms/richtext-lexical
next
react
react-dom
```

Toda actualización futura debe realizarse en una rama aislada y superar estas pruebas antes de llegar a `main`:

1. `npm run lint`;
2. `npm run typecheck`;
3. `npm run build`;
4. login nativo de Payload;
5. dashboard autenticado;
6. listado de una colección;
7. creación o edición de un registro de prueba;
8. cierre y nueva apertura de sesión;
9. rutas públicas y APIs;
10. comprobación de que no se modificaron documentos de MongoDB de forma inesperada.

No ejecutar `npm audit fix --force` en producción sin revisar y probar las versiones resultantes.

## Reproducibilidad pendiente

Las dependencias directas están fijadas con versiones exactas, pero el repositorio todavía no contiene `package-lock.json`.

Debe generarse y confirmarse un lockfile después de una instalación y build limpios con la combinación validada. Esto permitirá fijar también las dependencias transitivas usadas por Hostinger.

## Almacenamiento actual

La integración S3 se retiró del runtime para la fase doctoral actual.

La colección `research-artifacts` utiliza almacenamiento local nativo de Payload:

```ts
upload: {
  staticDir: 'research-artifacts'
}
```

El almacenamiento local es suficiente para el volumen previsto del primer piloto, pero antes de recopilar evidencia irremplazable deben verificarse:

1. persistencia después de reiniciar la aplicación;
2. persistencia después de un nuevo despliegue;
3. backup del directorio `research-artifacts/`;
4. backup de MongoDB;
5. restauración documentada de base de datos y archivos.

S3-compatible object storage queda aplazado hasta que aumenten el volumen, la colaboración, la necesidad de alta disponibilidad o los requisitos formales de preservación.

## Resultado

La regresión queda **aceptada y validada** como configuración de producción de GSLHub 0.4.0.

El desarrollo puede continuar con la gobernanza métrica, el codebook, la preparación de los registros reales y las primeras cinco ejecuciones controladas.
