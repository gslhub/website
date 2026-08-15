<p align="center">
  <img src="./public/brand/gslhub-logo.svg" alt="GSLHub — Generative Search Lab Hub" width="520" />
</p>

<p align="center">
  <strong>Infraestructura científica para búsqueda generativa, GEO, evidencia, métricas gobernadas e investigación reproducible con IA.</strong>
</p>

<p align="center">
  <a href="./README.md">English</a> · <strong>Español</strong> · <a href="./docs/ESTADO_PROYECTO_ES.md">Estado actual del proyecto</a>
</p>

<p align="center">
  <a href="https://gslhub.com">Web</a> ·
  <a href="https://gslhub.com/research">Investigación</a> ·
  <a href="https://gslhub.com/es/research-infrastructure">Infraestructura de investigación</a> ·
  <a href="https://gslhub.com/dashboard">Dashboard científico</a> ·
  <a href="https://github.com/gslhub">GitHub</a>
</p>

<p align="center">
  <img alt="Estado" src="https://img.shields.io/badge/estado-UI%20doctoral--ready-2563EB" />
  <img alt="Versión" src="https://img.shields.io/badge/plataforma-0.6.0-7C3AED" />
  <img alt="Payload CMS" src="https://img.shields.io/badge/Payload%20CMS-3.75.0-0B132B" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.2.10-0B132B" />
  <img alt="Almacenamiento" src="https://img.shields.io/badge/artefactos-local%20persistente-16A34A" />
</p>

---

# GSLHub

**GSLHub — Generative Search Lab Hub** es una plataforma independiente de investigación aplicada para estudiar cómo los sistemas de IA generativa descubren, seleccionan, citan, resumen y recomiendan información digital.

La plataforma se desarrolla como infraestructura de investigación para la línea doctoral:

> **Del SEO al GEO (Generative Engine Optimization): desarrollo y validación de un modelo científico para optimizar la visibilidad de organizaciones en motores de búsqueda generativos basados en inteligencia artificial.**

GSLHub conecta experimentos controlados, ejecuciones de prompts, observaciones, artefactos de investigación, evidencias, citas y métricas gobernadas dentro de un único flujo auditable.

## Versión actual — 0.6.0

La versión `0.6.0` cierra el hito **Doctoral-ready UI**.

### Capa de producto

- frontend público responsive para móvil, tablet, portátil y escritorio;
- administrador Payload responsive con scroll seguro en tablas científicas;
- dashboard de Research Operations después del login;
- dashboard interno bilingüe EN/ES;
- demostrador público bilingüe de la infraestructura científica;
- acceso directo al Research CMS privado desde el frontend;
- separación clara entre dashboard científico público y operaciones privadas;
- navegación móvil y contraste de CTA revisados.

### Capa de flujo científico

La regresión final de desarrollo se completó correctamente:

```text
Full research pipeline TEST   PASS
├── 5 Prompt Executions
├── 5 Observations
├── 5 Research Artifacts
├── 5 Evidence records
├── 3 Citations
└── 4 synthetic metric records

Calculadores deterministas
├── AIR = 3/4 = 0.75   PASS
├── CR  = 2/4 = 0.50   PASS
├── MCP = 6/3 = 2.00   PASS
└── RCR = 3/4 = 0.75   PASS

Limpieza TEST               PASS
```

Después del cleanup no quedan Administrative Batches TEST ni resultados métricos TEST.

## Piloto gobernado de desarrollo

La primera ejecución completa se conserva como evidencia de validación de producto, no como dato doctoral:

```text
GSL-EXEC-GEO-0001                  Completed / Published
├── GSL-ART-GEO-0001               Respuesta raw / SHA-256 verificado
├── GSL-ART-GEO-0002               Captura / SHA-256 verificado
├── GSL-EVD-GEO-0001               Evidencia validada
├── GSL-EVD-GEO-0002               Evidencia validada
└── GSL-OBS-GEO-0001               Observación Validated / Published
```

Las ejecuciones reservadas siguen intactas:

```text
GSL-EXEC-GEO-0002   Planned
GSL-EXEC-GEO-0003   Planned
GSL-EXEC-GEO-0004   Planned
GSL-EXEC-GEO-0005   Planned
```

Estos registros son **validación de desarrollo**, no hallazgos doctorales.

## Métricas científicas principales

| Código | Métrica | Versión | Unidad |
| --- | --- | --- | --- |
| AIR | Answer Inclusion Rate | 0.1.0 | proporción |
| CR | Citation Rate | 0.1.0 | proporción |
| MCP | Mean Citation Position | 0.1.0 | posición |
| RCR | Response Consistency Rate | 0.1.0 | proporción |

Los calculadores aplican reglas de elegibilidad y procedencia. No se crean métricas target-specific cuando no existe el target o la evidencia requerida.

## Controles de reproducibilidad

GSLHub ya soporta:

- prompts, experimentos y Metric Definitions versionados;
- ejecuciones repetidas y controladas;
- snapshots científicos inmutables después de transiciones gobernadas;
- procedencia directa Evidence ↔ Research Artifact;
- almacenamiento persistente fuera de los releases;
- verificación SHA-256;
- control de calidad y revisión independiente;
- separación Development / Doctoral Research;
- Final Development Reset controlado;
- audits permanentes de Storage Verification.

## Demostrador de Research Infrastructure

La explicación pública de cinco minutos está disponible en ambos idiomas:

- English: `https://gslhub.com/research-infrastructure`
- Español: `https://gslhub.com/es/research-infrastructure`

El demostrador presenta:

```text
Problema científico
→ Hipótesis
→ Experimento
→ Ejecución
→ Evidencia
→ Métricas
→ Reproducibilidad
```

Está diseñado para presentaciones académicas sin exponer registros privados ni artefactos restringidos.

## Research CMS

Las personas investigadoras autorizadas utilizan el CMS privado para las operaciones gobernadas. El dashboard de Research Operations ofrece accesos directos a:

- Research Environment;
- Prompt Executions;
- Evidence;
- Metrics;
- demostrador público de Research Infrastructure;
- dashboard científico público.

El dashboard interno sigue el locale seleccionado en Payload y cambia entre inglés y español.

## Artefactos persistentes

Los artefactos de investigación de producción se almacenan fuera del árbol de despliegue Node.js:

```text
/home/<usuario-hostinger>/domains/gslhub.com/gslhub-data/research-artifacts
```

Secuencia verificada:

```text
Upload → HTTP 200
Restart → mismo SHA-256 / HTTP 200
Redeploy → mismo SHA-256 / HTTP 200
Recovery drill → fichero restaurado / mismo SHA-256
```

## Frontera actual de investigación

```text
Research Environment       Development Mode
Final Development Reset    No ejecutado
Doctoral Research Mode     No activado
Datos doctorales reales    0
```

GSLHub debe permanecer en Development Mode hasta congelar el protocolo doctoral y obtener una baseline limpia mediante Final Development Reset.

## Siguiente fase

El foco pasa de validación funcional a preparación doctoral:

1. preparar el preproyecto y dossier de candidatura;
2. utilizar el demostrador bilingüe como apoyo académico;
3. congelar protocolo científico, diccionario de targets, prompts, AI Systems y codebooks;
4. ejecutar el preview y posteriormente el Final Development Reset cuando el protocolo esté cerrado;
5. verificar baseline limpia;
6. activar Doctoral Research Mode;
7. iniciar la recogida de datos doctorales reales.

## Stack validado

```text
Plataforma GSLHub  0.6.0
Payload CMS        3.75.0
Next.js            16.2.10
React              19.2.7
Driver MongoDB     6.21.0
Base de datos      MongoDB Atlas
Hosting            Hostinger
Artefactos         Almacenamiento local persistente fuera de releases
```

Las versiones de framework permanecen fijadas hasta que cualquier actualización supere en una rama aislada el administrador y el flujo científico completos.

## Desarrollo local

```bash
git clone https://github.com/gslhub/website.git
cd website
npm install
cp .env.example .env.local
npm run dev
```

Quality gate:

```bash
npm run lint
npm run typecheck
npm run build
```

## Documentación

- [Estado operativo actual](./docs/ESTADO_PROYECTO_ES.md)
- [Manual de usuario](./docs/MANUAL_USUARIO_ES.md)
- [Protocolo del primer piloto](./docs/PROTOCOLO_PRIMER_PILOTO_ES.md)
- [Codebook de observaciones y citas](./docs/CODEBOOK_OBSERVACIONES_CITAS_ES.md)
- [Procedimiento de almacenamiento, backup y recuperación](./docs/PROCEDIMIENTO_ALMACENAMIENTO_BACKUP_RECUPERACION_ES.md)
- [Historial en español](./CHANGELOG.es.md)
- [Changelog en inglés](./CHANGELOG.md)

## Contacto

- Web: [gslhub.com](https://gslhub.com)
- GitHub: [github.com/gslhub](https://github.com/gslhub)
- Correo: [research@gslhub.com](mailto:research@gslhub.com)

---

<p align="center"><strong>Investigación · GEO · Evidencia · Métricas · Reproducibilidad · Ciencia abierta</strong></p>
<p align="center">Última actualización: 15 de agosto de 2026</p>
