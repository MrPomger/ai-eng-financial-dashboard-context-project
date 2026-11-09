# Fase 1: Rastro de Verificación del Handover

Este documento registra la validación del resumen entregado por el coding agent frente a la evidencia real encontrada en el código fuente del repositorio del Dashboard Financiero.

---

## Servicios y Entorno de Ejecución

- **Comando de arranque principal:** `docker compose up --build` (respaldado por la raíz del proyecto).
- **Servicios identificados:**
  - **Backend:** 
    - Ruta/Tecnología: `backend/` con FastAPI y Uvicorn (descrito en `docker-compose.yml` y `backend/requirements.txt`).
    - Puerto real: `http://localhost:8000` (con documentación interactiva en `/docs`).
  - **Frontend:** 
    - Ruta/Tecnología: `frontend/` con React, TypeScript y Vite (configurado en `vite.config.ts`).
    - Puerto real: `http://localhost:5173` (mediante proxy `/api` apuntando al backend).

---

## Matriz de Verificación del Resumen del Agente

| # | Afirmación / Supuesto del Agente | Estado | Evidencia Concreta (Archivo y Línea) | Corrección / Nota |
|---|----------------------------------|--------|-------------------------------------|-------------------|
| 1 | "La app es un panel financiero con React/TypeScript y backend FastAPI" | ✅ Verificado | `README.es.md`, `frontend/src/App.tsx`, `backend/app/main.py` | Confirmado en los entry points de ambos servicios. |
| 2 | "Los datos provienen de una base de datos persistente (PostgreSQL/MySQL)" | ❌ Incorrecto | `backend/app/routes.py` (`generate_mock_movements`) | **Corrección:** Los datos son de prueba y se generan proceduralmente; `seed=42` reproduce la secuencia aleatoria, mientras las fechas dependen de `date.today()`. |
| 3 | "El título del panel '2024 - Full Year' define estrictamente el rango de datos del backend" | ❌ Incorrecto | `frontend/src/App.tsx` y `backend/app/routes.py` | **Corrección:** Es un texto estático/fijo en la interfaz; las fechas reales generadas por el backend dependen dinámicamente del calendario actual. |
| 4 | "En desarrollo, el proxy de Vite reenvía `/api` a `http://backend:8000`" | ✅ Verificado | `frontend/vite.config.ts` | Configurado correctamente en el proxy de Vite para Docker. |
| 5 | "El archivo `mock-data.ts` es el que alimenta la pantalla principal del panel" | ❌ Incorrecto | `frontend/src/App.tsx` | **Corrección:** `App.tsx` realiza una petición HTTP a la API (`GET /api/metrics`), no importa localmente `mock-data.ts`. |

---

## Notas de Verificación y Correcciones del Handover

- **Afirmación Incorrecta (Origen de datos):** Inicialmente se podría asumir una base de datos por tratarse de un dashboard financiero enterprise, pero la evidencia en `backend/app/routes.py` demuestra que utiliza un generador procedural (`generate_mock_movements`) de 360 registros. La semilla `42` fija la secuencia aleatoria; el año de los registros cambia con la fecha actual.
- **Diferencia de Idiomas:** Aunque existe un archivo de documentación en español (`README.es.md`), la interfaz de usuario y los componentes visuales (`dashboard-header.tsx`, `kpi-row.tsx`) están implementados completamente en inglés.

# Fase 1: Rastro de Verificación de la API

## Endpoints Verificados (contra backend/app/routes.py y modelos Pydantic)
- **Filtro de fechas y facetas:** `GET /api/metrics/facets` (retorna `min_date`, `max_date`, `categories`, `business_types`, `operation_types`).
- **Filtrado de movimientos:** `GET /api/metrics` (soporta `start_date`, `end_date`, `category`, `operation_type`).
- **Tabla de anomalías:** `GET /api/metrics/alerts` (soporta `threshold`, `group_by`, `start_date`, `end_date`, `business_type`). Devuelve `period`, `outcome_total`, `baseline_average`, `increase_ratio`.
- **Vista comparativa B2B vs B2C:** `GET /api/metrics/categories/top` (soporta `operation_type`, `limit`, `business_type`, `start_date`, `end_date`).

## Resolución de Desajustes (Wording del PM vs. API Real)
1. **Porcentaje de incremento de anomalías:** El PM solicita un porcentaje, pero la API expone `increase_ratio` (razón decimal, ej. `0.3`). *Resolución en spec:* Se documentará la regla de presentación de multiplicar por 100 en el frontend, manteniendo el contrato intacto.
2. **Comparativa B2B vs B2C:** El endpoint `/facets` solo lista los tipos de negocio disponibles y no métricas separadas. *Resolución en spec:* Se especificará que el cliente debe invocar dos veces `/categories/top` (una con `business_type=B2B` y otra con `business_type=B2C`).