# Product overview — Financial Metrics Dashboard

## Resumen del producto

Aplicación web que presenta un resumen visual de métricas financieras. El repositorio implementa un frontend React/TypeScript y una API FastAPI. La pantalla principal obtiene movimientos desde `GET /api/metrics`, calcula indicadores y agregaciones mensuales en el frontend, y los muestra en tarjetas KPI y gráficos (`frontend/src/App.tsx`, `frontend/src/lib/financial-utils.ts`).

Los datos disponibles actualmente son simulados por código en `backend/app/routes.py` mediante `generate_mock_movements`; no hay conexión a base de datos configurada en `docker-compose.yml` ni en `backend/requirements.txt`.

## Características verificadas

- KPI: ingresos totales, egresos, ganancia y margen (`frontend/src/components/dashboard/kpi-row.tsx`, `frontend/src/lib/financial-utils.ts`).
- Gráficos mensuales de ingresos frente a egresos y porcentaje de ganancia (`frontend/src/components/dashboard/income-outcome-chart.tsx`, `profit-percent-chart.tsx`).
- API para movimientos filtrados por fecha, categoría y tipo de operación, además de endpoints para facetas, resumen, categorías principales, comparación, alertas y segmentación B2B/B2C (`backend/app/routes.py`).
- La interfaz muestra estado de carga y un mensaje de error si no puede cargar los datos (`frontend/src/App.tsx`).

## Personas de usuario

El código no define personas, roles, autenticación ni permisos. Como hipótesis de producto (no como capacidad verificada), el panel parece dirigido a:

- **Persona propietaria o responsable de un negocio:** necesita una lectura rápida de ingresos, egresos y margen.
- **Persona analista o responsable de finanzas:** necesita observar tendencias y consultar desgloses por periodo, categoría o tipo de negocio.

Validar estas hipótesis con el equipo/usuarios antes de convertirlas en requisitos funcionales.

## Métricas de éxito

No se encontraron objetivos de producto, telemetría, analítica de uso ni SLO definidos en el código o README. Como criterios de validación iniciales propuestos, no como métricas actualmente instrumentadas:

1. Exactitud de KPIs y agregados comparada con casos de prueba controlados (`frontend/src/lib/financial-utils.test.ts`).
2. Respuestas correctas y filtradas de los endpoints (`backend/tests/test_routes.py`).
3. Carga correcta del dashboard mediante el flujo documentado en `README.md` y `docker-compose.yml`.

Añadir métricas cuantitativas de adopción o rendimiento requiere definir e instrumentar telemetría; no asumir que ya se recopila.
