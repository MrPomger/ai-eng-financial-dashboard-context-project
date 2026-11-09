# Especificación de componentes del dashboard financiero

Este documento define los contratos de presentación para tres funcionalidades del dashboard. Especifica componentes y props; no implica que estos componentes ya estén implementados. Los tipos referenciados proceden de `api-types.ts` y `param-types.ts`.

## 1. Filtro de fechas

### `DateRangeFilterBar`

Barra controlada con dos campos de fecha para filtrar las consultas del dashboard. Las fechas son límites inclusivos y usan formato de calendario `YYYY-MM-DD`.

| Prop | Tipo | Descripción |
|---|---|---|
| `value` | `DateRangeFilter` | Valores actuales de `startDate` y `endDate`; cada límite puede estar ausente de forma independiente. |
| `facets` | `FacetsResponse \| undefined` | Facetas opcionales de `GET /api/metrics/facets`; `min_date` y `max_date` pueden servir como límites visuales de los inputs. |
| `onChange` | `(next: DateRangeFilter) => void` | Notifica cada edición, preservando el otro límite y eliminando la propiedad cuando su input se limpia. |
| `onApply` | `(filter: DateRangeFilter) => void` | Aplica el filtro actual al solicitar los datos. La capa HTTP mapea `startDate` → `start_date` y `endDate` → `end_date`. |
| `disabled` | `boolean \| undefined` | Si es `true`, deshabilita ambos inputs y la acción de aplicar mientras haya una solicitud en curso. |

#### Renderizado condicional y casos límite

- **Ambos inputs vacíos:** mostrar ambos campos vacíos. Al aplicar, emitir `{}` y no enviar `start_date` ni `end_date`; el backend recibe ambos límites omitidos y devuelve datos sin restricción de fechas.
- **Solo `startDate` presente:** conservar y serializar únicamente `start_date`. Se interpreta como límite inferior inclusivo sin límite superior explícito.
- **Solo `endDate` presente:** conservar y serializar únicamente `end_date`. Se interpreta como límite superior inclusivo sin límite inferior explícito.
- **Ambos presentes:** enviar los dos límites inclusivos con nombres API `start_date` y `end_date`.
- No completar automáticamente el extremo ausente ni cambiar el filtro a un año o periodo predeterminado. Si ambos valores están presentes y `startDate > endDate`, mostrar un error de validación asociado al formulario e impedir `onApply`; los valores aislados no son un error.
- Si `facets` no está disponible, los campos siguen utilizables sin límites visuales derivados de `min_date`/`max_date`.

## 2. Alertas de anomalías

### `AnomalyAlertsTable`

Tabla de anomalías de gasto obtenidas de `GET /api/metrics/alerts`.

| Prop | Tipo | Descripción |
|---|---|---|
| `params` | `AlertsParams` | Parámetros efectivos de la consulta: umbral, agrupación, fechas y segmento opcionales. `threshold` se expresa como razón decimal (por ejemplo, `0.3` = 30%). |
| `alerts` | `AlertsResponse` | Filas recibidas; es una lista que puede estar vacía. |
| `loading` | `boolean` | Indica que la petición correspondiente a `params` está pendiente. |
| `error` | `string \| null` | Mensaje de error de carga, o `null` si la consulta no ha fallado. |
| `onRetry` | `(() => void) \| undefined` | Acción opcional para volver a solicitar las alertas tras un error. |

#### Renderizado condicional y casos límite

- Mantener el encabezado y la estructura de la tabla durante los estados de carga, error y lista vacía; la tabla no debe desaparecer cuando no hay filas.
- Con `loading === true`, mostrar una fila de carga dentro del cuerpo de la tabla (o un indicador equivalente dentro de su contenedor) y no presentar una respuesta vacía obsoleta como resultado definitivo.
- Con `error !== null`, mostrar el error en el contenedor de la tabla y, si existe `onRetry`, una acción para reintentar. No presentar el error como si significara cero anomalías.
- **Con `loading === false`, `error === null` y `alerts.length === 0`, conservar la tabla y renderizar una fila vacía que abarque las cuatro columnas (`period`, `outcome_total`, `baseline_average`, `increase_ratio`).** Mensaje exacto: **“No se detectaron anomalías para el umbral seleccionado.”** Debajo o en el mismo bloque se puede mostrar el umbral aplicado, formateado como porcentaje (`params.threshold * 100`). Usar un fondo neutro, icono informativo opcional y texto centrado; no usar un estado de éxito verde ni colapsar/ocultar la tabla.
- Con filas, renderizar una fila por `AlertEntry`, conservando el periodo devuelto por API y mostrando `increase_ratio` como porcentaje (`increase_ratio * 100`), sin tratar la razón como un porcentaje ya multiplicado.

## 3. Comparativa B2B vs B2C

### `B2CComparisonView`

Vista lado a lado para comparar las categorías agregadas de ambas líneas de negocio. Obtiene los datos mediante dos solicitudes separadas a `GET /api/metrics/categories/top`, porque el endpoint devuelve un segmento por petición.

| Prop | Tipo | Descripción |
|---|---|---|
| `params` | `Omit<TopCategoriesParams, "business_type">` | Parámetros comunes de ambas peticiones: `operation_type`, `limit` y los límites de fecha opcionales. El componente fija el segmento en cada solicitud y no acepta un segmento común que pueda sesgar una de las dos columnas. |
| `b2bCategories` | `TopCategoriesResponse` | Respuesta de la petición con `business_type=B2B`. Puede ser una lista vacía. |
| `b2cCategories` | `TopCategoriesResponse` | Respuesta de la petición con `business_type=B2C`. Puede ser una lista vacía. |
| `loading` | `boolean` | Indica que una o ambas solicitudes paralelas siguen pendientes. |
| `b2bError` | `string \| null` | Error de la solicitud B2B, o `null` si tuvo éxito. |
| `b2cError` | `string \| null` | Error de la solicitud B2C, o `null` si tuvo éxito. |
| `onRetry` | `((businessType: BusinessType) => void) \| undefined` | Acción opcional para reintentar el segmento fallido (`B2B` o `B2C`) sin descartar una respuesta correcta del otro. |

#### Estrategia de consulta y renderizado condicional

- Al cambiar `params`, disparar **dos llamadas** a `/api/metrics/categories/top`, idealmente en paralelo:
  1. `params` más `business_type=B2B` para poblar `b2bCategories`.
  2. `params` más `business_type=B2C` para poblar `b2cCategories`.
- Ambas llamadas comparten `operation_type`, `limit`, `start_date` y `end_date`; serializar las fechas camelCase como los nombres de query API snake_case y no incluir límites ausentes. No combinar ambas líneas en una sola petición ni sumar sus resultados.
- Renderizar siempre las dos columnas/paneles, titulados **B2B** y **B2C**, incluso si una solicitud falla o devuelve una lista vacía. Cada `CategoryEntry` muestra su categoría y `total_amount`; no asumir que las dos listas contienen las mismas categorías ni el mismo número de elementos.
- Mientras las solicitudes están pendientes, mostrar estado de carga en los paneles correspondientes (o en ambos si se mantiene un único `loading`). Si solo una respuesta ya está disponible, se puede mostrar esa respuesta mientras la otra carga.
- Si solo B2B devuelve `[]`, conservar el panel B2B y mostrar **“No hay categorías para B2B con los filtros seleccionados.”**; la lista B2C se renderiza normalmente. Aplicar el equivalente a B2C: **“No hay categorías para B2C con los filtros seleccionados.”**
- Si ambas listas están vacías, conservar ambos paneles y mostrar el mensaje vacío específico en cada uno. Una lista vacía de un segmento no debe ocultar el otro segmento ni convertirse en error.
- Si una petición falla, presentar el error y una acción de reintento solo en el panel de ese segmento; mantener visible la respuesta válida del otro panel.
