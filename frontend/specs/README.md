# Especificación de funcionalidades del dashboard financiero

Este documento relaciona las tres funcionalidades con los endpoints y tipos previstos para su consumo. Los componentes descritos son especificaciones, no afirmaciones de que ya estén implementados.

> **Verificación de rutas:** las rutas y sus parámetros se contrastaron con los decoradores, firmas y modelos de respuesta en `backend/app/routes.py`. No se pudo verificar una instancia activa de `/docs` en esta sesión: `http://localhost:8000/docs` y `/openapi.json` no estaban accesibles (conexión rechazada). Por ello, no se afirma que la documentación interactiva haya sido inspeccionada en vivo. Una vez iniciado el backend, las rutas se pueden contrastar en `/docs`.

## Resumen de tipos

| Archivo | Tipos relevantes |
|---|---|
| [`api-types.ts`](./api-types.ts) | `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse` |
| [`param-types.ts`](./param-types.ts) | `DateRangeFilter`, `AlertsParams`, `TopCategoriesParams` |
| [`../src/lib/financial-types.ts`](../src/lib/financial-types.ts) | `FinancialMovement`, `OperationType`, `Category`, `BusinessType` — se usan donde `api-types.ts` no declara un tipo de movimiento o enum nuevo. |
| [`components.md`](./components.md) | Contratos de props y reglas de UI propuestos para `DateRangeFilterBar`, `AnomalyAlertsTable` y `B2CComparisonView`. |

Los parámetros frontend de fecha son `startDate` y `endDate`; antes de enviar la petición deben serializarse como `start_date` y `end_date`. La API acepta fechas calendario ISO `YYYY-MM-DD` y los límites se aplican de manera inclusiva.

## Funcionalidad 1: filtro de fechas y movimientos

### Endpoints de consumo

| Método y ruta | Uso | Respuesta tipada |
|---|---|---|
| `GET /api/metrics/facets` | Obtener opciones de filtros y extremos disponibles. No tiene parámetros de query. | `FacetsResponse` |
| `GET /api/metrics` | Obtener movimientos con filtros. | `FinancialMovement[]` |

### Tipos asignados a la vista

- `DateRangeFilter` para los límites de fecha editados por `DateRangeFilterBar`.
- `FacetsResponse` para `operation_types`, `business_types`, `categories`, `min_date` y `max_date`.
- `FinancialMovement[]` (desde `src/lib/financial-types.ts`) para el resultado de `/api/metrics`; el endpoint devuelve una lista, posiblemente vacía.
- Las opciones de categoría y operación se tipan con `Category` y `OperationType` de `src/lib/financial-types.ts`.

### Restricciones y parámetros de query

| Parámetro | Tipo / valores válidos | Opcionalidad y comportamiento |
|---|---|---|
| `start_date` | Fecha calendario `YYYY-MM-DD`; límite inferior inclusivo. | Opcional; se omite cuando no hay `startDate`. |
| `end_date` | Fecha calendario `YYYY-MM-DD`; límite superior inclusivo. | Opcional; se omite cuando no hay `endDate`. |
| `category` | `suppliers`, `sales`, `operational`, `administrative` o `others`. | Opcional; si se omite, no filtra por categoría. |
| `operation_type` | `income` o `outcome`. | Opcional; si se omite, no filtra por tipo de operación. |

`/api/metrics/facets` no acepta parámetros. Sus fechas se devuelven como `min_date` y `max_date` en formato de fecha serializado. Las facetas reflejan las opciones disponibles en el dataset servido; no garantizan que una combinación particular de filtros vaya a producir movimientos.

### Casos límite y comportamiento esperado de la UI

1. **Dataset vacío o rango fuera de los límites disponibles:** `/api/metrics` se representa como una lista vacía. Mantener visible la barra de filtros y mostrar un estado de “sin movimientos para los filtros seleccionados” en el área de resultados; no tratar la lista vacía como error ni ocultar los controles. Si las facetas no están disponibles, los campos pueden seguir utilizándose sin límites visuales derivados de `min_date`/`max_date`.
2. **Solo `startDate` o solo `endDate`:** enviar únicamente el query param correspondiente. El primero aplica desde esa fecha inclusiva en adelante; el segundo hasta esa fecha inclusiva. No rellenar automáticamente el extremo ausente ni rechazar el filtro por estar incompleto.
3. **Ambos límites vacíos:** emitir la consulta sin `start_date` ni `end_date`, lo que no restringe por fecha.
4. **Límite inicial posterior al final:** si ambos valores existen y `startDate > endDate`, marcar error de validación en la barra e impedir el envío; el backend no debe recibir un rango invertido desde esta UI.

## Funcionalidad 2: tabla de alertas de anomalías

### Endpoint de consumo

| Método y ruta | Uso | Respuesta tipada |
|---|---|---|
| `GET /api/metrics/alerts` | Detectar periodos con aumento de egresos frente a una línea base. | `AlertsResponse` (`AlertEntry[]`, puede estar vacío) |

### Tipos asignados a la vista

- `AlertsParams` para los parámetros enviados por `AnomalyAlertsTable`.
- `AlertsResponse` para la respuesta y `AlertEntry` para cada fila (`period`, `outcome_total`, `baseline_average`, `increase_ratio`).

### Restricciones y parámetros de query

| Parámetro | Tipo / valores válidos | Opcionalidad y comportamiento |
|---|---|---|
| `threshold` | Número `>= 0` para la API. La especificación de producto documenta un rango recomendado de `0.01` a `1.0`, inclusive. Es una razón decimal: `0.3` representa 30%. | Opcional en el backend; default `0.3`. `AlertsParams.threshold` actualmente es requerido en TypeScript, así que el cliente debe enviar un valor explícito (por ejemplo, `0.3`) o alinear ese tipo en un cambio separado. TypeScript no restringe el rango numérico en runtime. |
| `group_by` | `day`, `week` o `month`. | Opcional; default `month`. |
| `start_date` | `YYYY-MM-DD`, inclusivo. | Opcional; limitar por fecha inicial. |
| `end_date` | `YYYY-MM-DD`, inclusivo. | Opcional; limitar por fecha final. |
| `business_type` | `B2B` o `B2C`. | Opcional; omitido incluye ambos segmentos. |

No hay límite superior validado por el backend para `threshold` (`Query` impone `ge=0`); el rango de producto `0.01–1.0` debe aplicarse mediante validación frontend si se requiere como regla efectiva.

### Casos límite y comportamiento esperado de la UI

1. **Umbral extremo `1.0` sin anomalías:** si la API devuelve `[]`, mantener el encabezado y la tabla visibles y mostrar una fila vacía que abarque sus cuatro columnas. Texto: **“No se detectaron anomalías para el umbral seleccionado.”** Se puede indicar el umbral aplicado como porcentaje (`threshold × 100`). La lista vacía es un resultado válido, no un error.
2. **Rango de fechas combinado con umbral estricto:** enviar en la misma solicitud el `threshold` y los límites presentes (`start_date`, `end_date`). Aplicar límites inclusivos. Si no hay periodos que alcancen el umbral, mostrar el mismo estado vacío explícito sin ocultar la tabla; no ampliar fechas ni reducir el umbral automáticamente.
3. **Error o carga:** conservar el contenedor/encabezado de la tabla; mostrar estado de carga o error de forma diferenciada. No representar un error de red como cero anomalías.

## Funcionalidad 3: comparativa de categorías B2B vs B2C

### Endpoint de consumo

| Método y ruta | Uso | Respuesta tipada |
|---|---|---|
| `GET /api/metrics/categories/top` | Obtener categorías agregadas para un tipo de operación, opcionalmente dentro de un segmento. | `TopCategoriesResponse` (`CategoryEntry[]`, puede tener menos filas que `limit` o estar vacío) |

La comparación necesita **dos llamadas separadas y paralelas** al mismo endpoint: una con `business_type=B2B` y otra con `business_type=B2C`. El backend permite un solo `business_type` por solicitud; no devuelve ambos segmentos juntos.

### Tipos asignados a la vista

- `TopCategoriesParams` como base de los parámetros comunes (`operation_type`, `limit` y fechas); para la comparación, cada llamada establece `business_type` a un valor distinto.
- `TopCategoriesResponse` para cada panel y `CategoryEntry` para cada elemento (`category`, `operation_type`, `total_amount`).
- `BusinessType` de `src/lib/financial-types.ts` para los literales `B2B` y `B2C`.
- El contrato de props de `B2CComparisonView` usa `Omit<TopCategoriesParams, "business_type">` para expresar que el componente aplica el segmento independientemente en cada solicitud.

### Restricciones y parámetros de query

| Parámetro | Tipo / valores válidos | Opcionalidad y comportamiento |
|---|---|---|
| `operation_type` | `income` o `outcome`. | Opcional en el backend; default `outcome`. Requerido por `TopCategoriesParams`, por lo que el cliente debe proporcionar explícitamente la operación de ambas llamadas. |
| `limit` | Entero entre `1` y `20`, inclusive. | Opcional en el backend; default `5`. Requerido como `number` por `TopCategoriesParams`; validar que sea entero dentro del rango antes de enviar. |
| `start_date` | `YYYY-MM-DD`, inclusivo. | Opcional; fecha inicial común a ambas llamadas. |
| `end_date` | `YYYY-MM-DD`, inclusivo. | Opcional; fecha final común a ambas llamadas. |
| `business_type` | `B2B` o `B2C`. | Opcional para el endpoint individual; debe fijarse explícitamente a `B2B` en una llamada y a `B2C` en la otra para comparar segmentos. Si se omite en una llamada, el backend incluye ambos y esa respuesta deja de ser una columna segmentada. |

El orden de la respuesta es descendente por `total_amount`. No se debe asumir que ambos segmentos tienen el mismo conjunto o cantidad de categorías.

### Casos límite y comportamiento esperado de la UI

1. **Una línea no posee categorías de ingresos:** con `operation_type=income`, una de las respuestas puede ser `[]`. Mantener ambos paneles visibles; en el panel vacío mostrar, según corresponda, **“No hay categorías para B2B con los filtros seleccionados.”** o **“No hay categorías para B2C con los filtros seleccionados.”** Renderizar normalmente las categorías del otro segmento; no convertir el vacío en error.
2. **Cambio del rango de fechas:** al cambiar `startDate` o `endDate`, emitir de nuevo las dos solicitudes con los mismos límites actualizados y sus respectivos valores de `business_type`. Actualizar cada panel con resultados del nuevo rango y evitar mezclar respuestas de rangos anteriores (por ejemplo, cancelar solicitudes previas o ignorar respuestas obsoletas).
3. **Un segmento falla y el otro responde:** mantener los dos paneles, mostrar el error/reintento solo en el panel fallido y conservar la respuesta válida del otro.
4. **Ambos segmentos sin categorías:** mostrar el mensaje vacío específico en cada panel; no ocultar la comparativa entera.

## Contratos y fuentes

- Rutas, parámetros y respuestas: decoradores `@router.get`, firmas y `response_model` de `backend/app/routes.py`.
- Tipos TypeScript de esta especificación: `frontend/specs/api-types.ts`, `frontend/specs/param-types.ts` y `frontend/src/lib/financial-types.ts`.
- Reglas visuales: `frontend/specs/components.md`.
- Las restricciones de valores numéricos documentadas por TypeScript no sustituyen la validación runtime. Las fechas deben validarse como calendario `YYYY-MM-DD` antes de serializarlas.
