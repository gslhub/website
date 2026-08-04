# Sincronización y validación determinista de las métricas del piloto

**Alcance:** AIR, CR, MCP y RCR v0.1.0  
**Ciclo científico:** Under review  
**Objetivo:** sincronizar los registros permanentes de Payload con el registro bilingüe revisado y comprobar los cuatro calculadores antes de la validación formal.

## Requisitos previos

- El administrador ha iniciado sesión en Payload.
- Existe el proyecto `GSL-GEO-BENCH-01`.
- Existe el benchmark `GSL-BENCH-GEO-01`.
- Existe el investigador `eduardo-yauri`.
- Existe el área de investigación `GEO`.
- Los registros Resource del protocolo y Software del toolkit son recomendables, pero opcionales.
- AIR, CR, MCP y RCR deben seguir en `planned` o `under-review` para poder sincronizarse.

La sincronización se niega a sobrescribir definiciones cuyo ciclo científico sea `validated`, `active`, `deprecated` o `archived`.

## 1. Desplegar y compilar

Desplegar la rama `main` actual y confirmar que la compilación de Next.js/Payload termina correctamente.

## 2. Sincronizar las definiciones permanentes

En Payload:

1. Abrir **Administration → Administrative Batches**.
2. Crear un lote nuevo.
3. Seleccionar:

```text
Permanent pilot metric definitions — create or synchronize AIR, CR, MCP and RCR v0.1.0
```

4. Guardar el lote.
5. Ejecutar la acción administrativa generada.
6. Confirmar estado `Completed` y `recordCount = 4`.

La acción es idempotente:

- crea las definiciones que falten;
- sincroniza las existentes en `planned` o `under-review`;
- se detiene ante duplicados;
- nunca sobrescribe definiciones científicamente congeladas.

## 3. Verificar los cuatro registros permanentes

Abrir **Research Operations → Metric Definitions** y comprobar:

```text
GSL-MDEF-AIR-0001
GSL-MDEF-CR-0001
GSL-MDEF-MCP-0001
GSL-MDEF-RCR-0001
```

En cada registro verificar:

- Versión `0.1.0`.
- Lifecycle Status `Under review`.
- Estado editorial `Draft`.
- Missing Data Policy `Report separately`.
- Open Methodology activado.
- `Validated At` vacío.
- `Validated By` vacío.
- Contenido localizado en inglés y español.
- Fórmula, inputs, supuestos, limitaciones y validación coincidentes con el registro revisado.

Precisión esperada:

```text
AIR: 4 decimales
CR:  4 decimales
MCP: 2 decimales
RCR: 4 decimales
```

## 4. Ejecutar los escenarios deterministas

Crear y ejecutar un Administrative Batch nuevo para cada escenario, en este orden:

```text
AIR deterministic validation
CR deterministic validation
MCP deterministic validation
RCR deterministic validation
```

No reutilizar un lote completado. Cada escenario crea registros descartables `TEST-` y un Metric Result calculado vinculado a la definición permanente.

## 5. Resultados esperados

### AIR

```text
Numerador:    3
Denominador:  4
Valor:        0,7500
Excluidos:    1
```

### CR

```text
Numerador:    2
Denominador:  4
Valor:        0,5000
```

### MCP

```text
Posiciones:   1, 2, 3
Suma:         6
Denominador:  3
Valor:        2,00
```

### RCR

```text
Base:         1 observación not-assessed
Niveles:      none, low, low, high
Numerador:    3
Denominador:  4
Valor:        0,7500
Excluidos:    1 registro base
```

## 6. Revisar cada Metric Result calculado

En cada resultado determinista comprobar:

- relación correcta con la `metricDefinition` permanente;
- código, nombre, versión, categoría, dirección y unidad heredados;
- fórmula heredada;
- Missing Data Policy heredada `Report separately`;
- numerador, denominador y valor esperados;
- checksums SHA-256 de entrada y salida;
- query snapshot con exclusiones informadas;
- control de calidad todavía en `Pending`.

Los Metric Results deterministas son registros sintéticos de validación. No deben promocionarse como resultados reales del doctorado.

## 7. Limpieza

Después de revisar cada escenario determinista, eliminar su Administrative Batch para ejecutar la limpieza controlada de los registros `TEST-`.

No eliminar el lote de sincronización permanente esperando borrar las definiciones científicas. Los registros permanentes AIR, CR, MCP y RCR se conservan independientemente del registro administrativo de auditoría.

## 8. Puerta de promoción

No cambiar una definición a `Validated` hasta completar todo lo siguiente:

- sincronización bilingüe comprobada;
- codebook revisado;
- escenario determinista superado;
- fórmula y resultado recalculados de forma independiente;
- checksums estables;
- diccionario del objetivo aprobado para AIR y CR;
- superficie primaria de citación aprobada para MCP;
- regla de base y codebook de variación aprobados para RCR;
- `Validated At` y al menos un investigador en `Validated By` preparados.

La validación formal congela los campos científicos protegidos. Los cambios metodológicos posteriores requieren una nueva versión semántica en lugar de sobrescribir v0.1.0.
