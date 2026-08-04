# Autorrevisión técnica de las métricas del piloto

**Alcance:** AIR, CR, MCP y RCR v0.1.0  
**Versión de plataforma:** 0.4.2  
**Ciclo científico después de esta acción:** `Under review`  
**Persona autorrevisora:** Eduardo José Yauri Luna  
**Revisión independiente:** todavía pendiente

## Objetivo

Este procedimiento registra la verificación técnica ya completada para las cuatro métricas del piloto sin presentar la autorrevisión del autor como una validación científica independiente.

La acción escribe en el grupo específico `Technical Review` y deja intencionadamente vacíos los campos formales:

```text
Validated At: vacío
Validated By: vacío
Lifecycle Status: Under review
Editorial Status: Draft
```

## Requisitos previos

- La versión 0.4.2 ha compilado y se ha desplegado correctamente.
- Existe el investigador `eduardo-yauri` como Eduardo José Yauri Luna.
- Existen una sola vez las cuatro definiciones permanentes:

```text
GSL-MDEF-AIR-0001
GSL-MDEF-CR-0001
GSL-MDEF-MCP-0001
GSL-MDEF-RCR-0001
```

- Cada definición está en versión `0.1.0`, `Under review` y `Draft`.
- Los escenarios deterministas han sido superados y sus registros descartables `TEST-` han sido eliminados.

## Ejecutar la acción permanente

1. Abrir **Administration → Administrative Batches**.
2. Crear un lote nuevo.
3. Seleccionar:

```text
Record pilot metric author technical review — AIR, CR, MCP and RCR v0.1.0
```

4. Guardar el lote.
5. Pulsar **Run selected action**.
6. Confirmar:

```text
Status: Completed
Record Count: 4
```

Es una acción de documentación permanente. Eliminar su registro de auditoría Administrative Batch no elimina la información de Technical Review guardada en las cuatro Metric Definitions.

## Valores esperados en cada Metric Definition

Abrir cada definición y revisar `Technical Review`.

```text
Status: Completed
Review Mode: Author self-review
Reviewed At: informado
Reviewed By: Eduardo José Yauri Luna
Deterministic Validation Status: Passed
Independent Review Status: Pending
Independent Reviewed At: vacío
Independent Reviewed By: vacío
```

Las notas deben estar presentes en inglés y español e incluir el resultado determinista observado para la métrica correspondiente.

## Resultados deterministas esperados

```text
AIR: 3 / 4 = 0,7500, con 1 exclusión informada
CR:  2 / 4 = 0,5000, con 1 exclusión informada
MCP: posiciones 1, 2 y 3; media = 2,00
RCR: none, low, low, high; 3 / 4 = 0,7500
```

Las notas también deben indicar que:

- la revisión fue una autorrevisión técnica;
- los registros sintéticos `TEST-` fueron eliminados después de la comprobación;
- las Metric Definitions permanentes fueron conservadas;
- la revisión independiente continúa pendiente.

## Reglas de gobernanza

Mientras una definición esté en `planned` o `under-review`, Payload rechazará cualquier intento de completar `Validated At` o `Validated By`.

El cambio a `Validated` exige todo lo siguiente:

- Technical Review completada;
- estado de validación determinista `Passed`;
- revisión independiente completada;
- una persona revisora independiente diferente del autorrevisor;
- campos formales `Validated At` y `Validated By` informados;
- definiciones de numerador y denominador para las métricas de tipo ratio.

Después de la validación formal, Technical Review y el resto de la definición científica quedan congelados. Los cambios metodológicos posteriores requieren una nueva versión semántica.
