# Compatibilidad temporal Payload 3.86 / Next.js

## Estado

GSLHub utiliza temporalmente **Next.js 15.4.11** con Payload **3.86.0**.

La combinación anterior con Next.js 16.2.x producía una interfaz administrativa vacía tanto en rutas públicas como autenticadas. El servidor respondía `200`, generaba el payload RSC completo y mantenía la sesión, pero el navegador recibía una frontera Suspense completada sin contenido.

La incidencia oficial de referencia es `payloadcms/payload#17545`. La reproducción de GSLHub amplía el alcance observado: en el entorno de producción también afecta al dashboard autenticado.

## Decisión

Se fija Next.js 15.4.11 porque es la última versión de la rama 15 incluida explícitamente en el rango de compatibilidad de `@payloadcms/next@3.86.0` y es la combinación verificada que restaura el administrador.

La pantalla `/cms-login` se conserva. Autentica mediante la API REST oficial de Payload, verifica la cookie HTTP-only y redirige a `/admin`.

## Riesgo temporal

Next.js 15.4.11 no contiene los parches de seguridad publicados posteriormente para las ramas 15.5 y 16.2. Este modo de compatibilidad debe considerarse temporal.

En el código actual de GSLHub:

- no existe middleware o proxy de autorización;
- no existen rewrites o redirects externos con hostname controlado por parámetros;
- no se utiliza `next/image`;
- no se utilizan Cache Components;
- no se implementan WebSocket upgrades.

Estas ausencias reducen la exposición a varias vulnerabilidades conocidas, pero no eliminan todos los riesgos, especialmente los relacionados con React Server Components y denegación de servicio.

## Controles operativos

Mientras siga activo este modo:

1. Mantener el origen detrás de la protección y limitación de tráfico de Hostinger.
2. No añadir rewrites externos dinámicos, middleware de autorización ni WebSocket upgrades sin revisión de seguridad.
3. Mantener `/admin` y las APIs científicas protegidas mediante las reglas de acceso de Payload, no solo mediante rutas o middleware.
4. Revisar periódicamente la incidencia oficial y las nuevas versiones estables de Payload.

## Criterio de salida

Volver a una rama de Next.js con parches vigentes cuando se cumplan todos estos puntos:

1. Payload publique una versión estable que corrija la pérdida del árbol RSC con Next.js 16 o admita una rama 15.5 segura.
2. `npm run build` finalice sin conflictos de dependencias.
3. Funcionen `/cms-login`, `/admin`, una lista de colección y una vista de edición.
4. Las rutas públicas y los endpoints de readiness continúen respondiendo correctamente.
5. Se elimine este pin temporal en un cambio explícito y revisado.

## Prueba de aceptación actual

Después de desplegar:

1. Abrir `/admin/login` y confirmar la redirección a `/cms-login`.
2. Iniciar sesión.
3. Confirmar que `/admin` muestra navegación y dashboard.
4. Abrir `Metric Definitions` y un documento existente.
5. Cerrar sesión y repetir el acceso.
