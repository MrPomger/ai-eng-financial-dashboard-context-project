# Sincronización de contratos API

## Alcance

Aplica a toda modificación de los datos que cruzan entre FastAPI y React/TypeScript: campos, tipos, nombres, valores admitidos y formas de respuesta.

## Justificación

Los modelos Pydantic de respuesta están declarados en `backend/app/routes.py` (`FinancialMovement`, `MetricsFacets`, `MetricsSummaryItem`, `TopCategoryItem`, `MetricsComparison` y `MetricsAlert`). El frontend mantiene tipos equivalentes en `frontend/src/lib/financial-types.ts`, y `frontend/src/App.tsx` consume `/api/metrics` como `FinancialMovement[]`. No hay generación automática de tipos compartida en la configuración actual.

## Directrices

1. **Cada cambio en un modelo Pydantic que afecte una respuesta debe reflejarse en el tipo TypeScript correspondiente.** Revisa conjuntamente `backend/app/routes.py` y `frontend/src/lib/financial-types.ts`; no cierres el cambio actualizando solo uno de los lados.
2. **Mantén los nombres JSON del contrato iguales en ambos lados.** Los movimientos usan `create_date`, `operation_type` y `business_type` en Pydantic y TypeScript; no los conviertas a camelCase en un solo lado sin introducir y documentar una transformación explícita.
3. **Mantén sincronizados los valores enumerados.** `OperationType`, `Category` y `BusinessType` aparecen como `Literal` en `backend/app/routes.py` y como uniones de literales en `frontend/src/lib/financial-types.ts`; actualiza ambas declaraciones al añadir o retirar un valor.
4. **Distingue los campos del API de los tipos derivados de la interfaz.** `KPIMetrics` y `MonthlyDataPoint` en `financial-types.ts` son estructuras calculadas por `frontend/src/lib/financial-utils.ts`, no modelos de respuesta Pydantic actuales. No los presentes como campos que devuelve `/api/metrics`.
5. **Valida el contrato al cambiarlo.** Ajusta o añade pruebas de endpoint en `backend/tests/test_routes.py` y pruebas de cálculo en `frontend/src/lib/financial-utils.test.ts` según corresponda; comprueba que `App.tsx` pueda consumir el payload resultante.
6. **Cita los nombres y respuestas reales al documentar endpoints.** FastAPI define las rutas y sus `response_model` en `backend/app/routes.py`; usa esas declaraciones como fuente al actualizar ejemplos o documentación.
