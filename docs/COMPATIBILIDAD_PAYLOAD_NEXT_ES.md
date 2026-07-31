# Compatibilidad Payload / Next.js

## Estado actual

GSLHub está ejecutando una **regresión controlada** con:

- Payload 3.75.0
- Next.js 16.2.10
- React 19.2.7
- React DOM 19.2.7

Esta era la combinación activa antes de la actualización de Payload a 3.86.0, tras la cual el administrador comenzó a renderizar una frontera RSC vacía en producción.

## Almacenamiento

La integración S3 ha sido retirada del runtime durante esta fase. La colección `research-artifacts` utiliza el almacenamiento local nativo de Payload mediante:

```ts
upload: {
  staticDir: 'research-artifacts'
}
```

Para el proyecto doctoral actual, el almacenamiento local es suficiente. El uso de S3-compatible object storage se reevaluará cuando aumenten el volumen de archivos, la colaboración, la necesidad de alta disponibilidad o los requisitos formales de preservación.

## Prueba de aceptación

Después de desplegar:

1. Abrir `/admin/login` y confirmar que se muestra el login nativo de Payload.
2. Iniciar sesión.
3. Confirmar que `/admin` muestra navegación y dashboard.
4. Abrir una lista de colección.
5. Abrir una vista de edición.
6. Confirmar que las páginas públicas y APIs siguen respondiendo.

## Interpretación

- Si el administrador funciona, la regresión queda asociada a la actualización posterior de Payload o a su combinación con el framework.
- Si continúa vacío, la causa estará en el entorno de ejecución/streaming o en una incompatibilidad independiente de la versión de Payload, y se priorizará un panel administrativo propio.
