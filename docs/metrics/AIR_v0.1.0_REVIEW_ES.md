# AIR v0.1.0 — Revisión científica

**Código de métrica:** AIR  
**Código de definición:** GSL-MDEF-AIR-0001  
**Estado:** Under review  
**Versión:** 0.1.0  
**Categoría:** Visibilidad  
**Dirección:** Valores más altos son mejores  
**Unidad:** Proporción  
**Unidad de análisis:** Experimento  
**Agregación:** Ratio

## Propósito

Answer Inclusion Rate mide la proporción de ejecuciones controladas elegibles en las que un objetivo evaluado y definido previamente aparece de forma visible en el cuerpo de la respuesta generada.

AIR es una métrica operativa de visibilidad propia de GSLHub. Mide únicamente presencia dentro de la respuesta. Debe mantenerse separada de la aparición de citas, calidad de citación, fuerza de recomendación, prominencia, uso factual y sentimiento.

## Fórmula canónica

Sea `E` el conjunto congelado de ejecuciones elegibles y sea `M_i` el código binario de inclusión para la ejecución `i`:

```text
M_i = 1 cuando el objetivo evaluado aparece visiblemente en el cuerpo de la respuesta
M_i = 0 cuando el objetivo evaluado no aparece visiblemente

AIR = (Σ M_i) / |E|, para i ∈ E
```

Rango válido: `[0, 1]`.

AIR se informa con cuatro decimales, pero siempre debe publicarse también el numerador y el denominador originales.

## Objetivo evaluado

Antes de comenzar la codificación, el protocolo debe congelar:

- tipo de objetivo: dominio, URL, organización, persona, producto/servicio o tema;
- valor canónico del objetivo;
- nombres, alias y variantes normalizadas aceptadas;
- variantes ambiguas no aceptadas;
- reglas de coincidencia específicas por idioma;
- tratamiento de empresas matrices, filiales, redirecciones y dominios alternativos.

La definición del objetivo debe ser idéntica en todas las ejecuciones incluidas en un mismo resultado AIR.

## Regla de codificación de inclusión

Marcar `visibilityCoding.mentioned = true` únicamente cuando el objetivo sea visible dentro del cuerpo de la respuesta generada mediante una forma de coincidencia predefinida e inequívoca.

Cuenta como inclusión:

- el nombre canónico exacto;
- un alias o variante normalizada definida previamente;
- una referencia textual inequívoca cubierta por el codebook congelado.

No cuenta como inclusión en la respuesta cuando el objetivo aparece únicamente en:

- el prompt del usuario;
- metadatos ocultos o logs de recuperación;
- la barra de direcciones del navegador;
- un panel de fuentes, tarjeta de cita o lista de referencias sin aparecer en el cuerpo de la respuesta;
- un homónimo o uso ambiguo no relacionado.

La aparición únicamente como fuente pertenece al análisis de citación y no debe transformarse en inclusión AIR.

## Elegibilidad y denominador

Una ejecución pertenece a `E` cuando:

1. se ejecutó con el proyecto, benchmark, experimento, prompt, perfil de sistema y protocolo de repetición congelados;
2. alcanzó un estado analítico completado;
3. existe exactamente una observación de nivel respuesta que la representa;
4. la observación superó el control de calidad y fue aceptada para análisis;
5. la respuesta y la evidencia de interfaz permiten codificar la inclusión.

Una ejecución válida en la que el objetivo no aparece permanece en el denominador con `M_i = 0`.

Una negativa o rechazo del sistema permanece en el denominador cuando es una respuesta real producida bajo el protocolo; la inclusión se codifica desde el texto visible de esa respuesta. Un fallo técnico que impida observar una respuesta puede excluirse únicamente mediante una regla definida previamente y debe informarse por separado.

## Política de datos ausentes

Política recomendada: **Report separately**.

- No imputar resultados AIR.
- No tratar “objetivo no mencionado” como dato ausente; es un cero válido.
- Registrar cada ejecución excluida o no codificable y su motivo.
- Informar `N_planificadas`, `N_completadas`, `N_elegibles`, `N_incluidas` y `N_excluidas`.

## Inputs requeridos

| Colección | Campo | Obligatorio | Función |
| --- | --- | ---: | --- |
| Observations | `visibilityCoding.targetType` | Sí | Identifica la clase del objetivo evaluado. |
| Observations | `visibilityCoding.targetValue` | Sí | Guarda el valor congelado del objetivo. |
| Observations | `visibilityCoding.mentioned` | Sí | Resultado binario de AIR. |
| Observations | `qualityControl.reviewStatus` | Sí | Restringe el denominador a observaciones aceptadas. |
| Observations | `responseAssessment.errorObserved` | Sí | Permite revisar fallos técnicos y exclusiones. |
| Prompt Executions | `lifecycleStatus` | Sí | Confirma finalización y elegibilidad. |

## Interpretación

Los valores AIR más altos indican que el objetivo aparece en una mayor proporción de respuestas elegibles bajo la condición exacta evaluada.

AIR no demuestra:

- que el objetivo haya sido citado o enlazado;
- que haya influido en la respuesta;
- que la mención sea prominente o favorable;
- que la afirmación generada sea correcta;
- que el objetivo vaya a aparecer con otro prompt, sistema, cuenta, ubicación, idioma, fecha o versión de interfaz.

AIR debe interpretarse como una estimación muestral obtenida mediante ejecuciones controladas repetidas, no como una propiedad permanente del sistema generativo.

## Supuestos

- La identidad del objetivo y sus reglas de coincidencia se congelan antes de codificar.
- Cada ejecución elegible aporta exactamente un resultado binario.
- Las repeticiones utilizan el mismo protocolo congelado.
- Los codificadores disponen de evidencia preservada suficiente.
- Las reglas de exclusión se definen antes de inspeccionar el resultado siempre que sea posible.

## Limitaciones

AIR reduce todas las menciones válidas a un resultado binario. No mide posición, prominencia, contribución semántica, citación, recomendación, exactitud ni calidad.

Las muestras pequeñas producen estimaciones muy discretas. En el primer piloto de cinco ejecuciones, AIR solo puede variar en incrementos de `0,20`; por ello debe enfatizarse el recuento original y no debe afirmarse estabilidad general a partir de una sola ronda.

La variabilidad entre ejecuciones y a lo largo del tiempo puede modificar AIR aunque el prompt y el objetivo permanezcan constantes. Los estudios posteriores deberán aumentar las repeticiones e informar intervalos de incertidumbre.

## Procedimiento de validación

1. Congelar la muestra analítica y el diccionario del objetivo.
2. Verificar que cada ejecución incluida cumple el protocolo.
3. Confirmar una única observación aceptada de nivel respuesta por ejecución.
4. Realizar doble codificación independiente de las cinco observaciones del piloto.
5. Resolver desacuerdos utilizando la respuesta y la evidencia de interfaz preservadas.
6. Registrar el acuerdo bruto; utilizar una estadística corregida por azar solo cuando el tamaño muestral sea suficiente.
7. Recontar independientemente `N_incluidas` y `N_elegibles`.
8. Recalcular AIR mediante la fórmula canónica.
9. Comparar el resultado independiente con el Metric Result almacenado.
10. Informar numerador, denominador, exclusiones, definición del objetivo, perfil del sistema, versión del prompt, fechas de captura y redondeo.

## Valores recomendados en Payload

```text
Title: Tasa de inclusión en la respuesta
Metric Code: AIR
Version: 0.1.0
Lifecycle Status: Under review
Category: Visibility
Direction: Higher is better
Unit of Analysis: Experiment
Value Type: Number
Unit: Proportion
Aggregation Method: Ratio
Missing Data Policy: Report separately
Rounding Precision: 4
Minimum: 0 inclusive
Maximum: 1 inclusive
Open Methodology: true
```

No debe cambiarse esta definición a `Validated` hasta aprobar el codebook de observaciones, las reglas de coincidencia del objetivo y el procedimiento de revisión independiente.

## Base científica

- Aggarwal, P., Murahari, V., Rajpurohit, T., Kalyan, A., Narasimhan, K., & Deshpande, A. (2024). *GEO: Generative Engine Optimization*. Proceedings of KDD 2024, 5–16. DOI: 10.1145/3637528.3671900.
- Liu, N. F., Zhang, T., & Liang, P. (2023). *Evaluating Verifiability in Generative Search Engines*. Findings of EMNLP 2023, 7001–7025. DOI: 10.18653/v1/2023.findings-emnlp.467.
- Xu, Y. et al. (2025). *CiteEval: Principle-Driven Citation Evaluation for Source Attribution*. ACL 2025, 32759–32778. DOI: 10.18653/v1/2025.acl-long.1574.
- Schulte, J., Bleeker, M., & Kaufmann, P. (2026). *Don't Measure Once: Measuring Visibility in AI Search (GEO)*. Documento de trabajo, arXiv:2604.07585.
