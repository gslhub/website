# Regresión controlada Payload 3.75

## Objetivo

Comprobar si la interfaz administrativa vuelve a funcionar con la combinación que estaba operativa antes de la actualización:

- Payload 3.75.0
- Next.js 16.2.10
- React 19.2.7
- React DOM 19.2.7

## Alcance

La prueba mantiene MongoDB, las colecciones, relaciones, validaciones, hooks científicos y los datos actuales.

La integración S3 queda retirada del runtime. Los archivos de `research-artifacts` se almacenan mediante el `staticDir` local de Payload durante esta fase del proyecto doctoral.

## Criterios de aceptación

1. `/admin/login` muestra el acceso nativo de Payload.
2. `/admin` muestra navegación y dashboard.
3. Abre una lista de colección.
4. Abre una vista de edición.
5. Crea o edita un registro de prueba sin alterar registros científicos permanentes.
6. Las APIs y páginas públicas continúan respondiendo.

## Decisión posterior

- Si el administrador funciona, la regresión queda atribuida a la actualización posterior de Payload o a su combinación con Next.
- Si continúa vacío, el siguiente sospechoso será el entorno de renderizado de Hostinger y se priorizará un panel administrativo propio.
- S3 se reconsiderará en una fase posterior cuando el volumen, la colaboración o los requisitos de conservación lo justifiquen.
