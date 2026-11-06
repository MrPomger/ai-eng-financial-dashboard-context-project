# Arquitectura

## Vista de alto nivel

El repositorio contiene dos aplicaciones orquestadas con Docker Compose:

```text
Navegador
  └─ React/TypeScript (frontend/src)
       └─ fetch /api/metrics
            └─ proxy Vite → http://backend:8000
                 └─ FastAPI (backend/app)
                      └─ generación procedural de movimientos
```

`docker-compose.yml` configura los servicios `frontend` y `backend`, sus puertos publicados y volúmenes de desarrollo. El comando documentado es `docker compose up --build`.

## Backend

- `backend/app/main.py` crea la aplicación FastAPI, añade middleware CORS e incluye el router.
- `backend/app/routes.py` contiene modelos Pydantic, tipos `Literal`, generación procedural (`generate_mock_movements`), filtros, agregaciones y rutas HTTP.
- Los endpoints crean datos con `generate_mock_movements(seed=42)`; no hay capa de repositorio ni base de datos configurada. El generador modifica el estado global del módulo `random` mediante `random.seed` y usa `date.today()` para determinar años.
- Rutas actuales incluyen `/health`, `/api/metrics`, `/api/metrics/facets`, `/api/metrics/summary`, `/api/metrics/categories/top`, `/api/metrics/comparison`, `/api/metrics/alerts`, `/api/metrics/b2b` y `/api/metrics/b2c` (`backend/app/routes.py`).

## Frontend

- `frontend/src/main.tsx` es el punto de entrada React y `frontend/src/App.tsx` compone el dashboard.
- Los componentes de página se organizan en `frontend/src/components/dashboard/`; componentes compartidos de UI están en `frontend/src/components/ui/`.
- `frontend/src/lib/financial-types.ts` define tipos de movimientos y métricas; `financial-utils.ts` implementa cálculos y formato; `mock-data.ts` contiene datos locales, pero `App.tsx` carga la API y no importa `mock-data.ts`.
- `App.tsx` hace `fetch` de `/api/metrics`, calcula KPI/agregados y mantiene estados de carga/error. No hay una capa de cliente API separada en la estructura actual.

## Comunicación y contrato

- En desarrollo, `frontend/vite.config.ts` reenvía el prefijo `/api` al servicio Docker `backend:8000`.
- El frontend usa `VITE_API_BASE_URL` con valor vacío por defecto (`frontend/src/App.tsx`); el endpoint consumido en la pantalla es `/api/metrics`.
- Los modelos Pydantic del backend y las definiciones TypeScript del frontend son fuentes paralelas y deben actualizarse coordinadamente. No hay generación automática de tipos configurada.

## Pruebas y límites de entorno

- `backend/tests/test_routes.py` usa `TestClient` para comprobar generador, filtros y endpoints.
- `frontend/src/lib/financial-utils.test.ts` verifica funciones puras; no se ven pruebas de componentes en la estructura actual.
- `backend/app/main.py` permite todos los orígenes CORS con credenciales habilitadas. Es una configuración observable del repositorio, no una recomendación para producción.
- El periodo del encabezado frontend está escrito como `2024 - Full Year` en `frontend/src/App.tsx`, mientras el backend deriva las fechas del calendario actual; no existe sincronización del rango mostrado con la API en el flujo principal.
