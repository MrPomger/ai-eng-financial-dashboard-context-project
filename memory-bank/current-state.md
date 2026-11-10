# Estado actual

## Qué funciona según el repositorio

- La app tiene dos servicios definidos en `docker-compose.yml`: frontend y backend. El arranque local documentado es `docker compose up --build` (`README.md`, `README.es.md`).
- FastAPI publica `/health` y endpoints bajo `/api/metrics` (`backend/app/routes.py`); FastAPI genera documentación interactiva en `/docs` (`backend/app/main.py`).
- `GET /api/metrics` genera y ordena movimientos financieros simulados, y admite filtros por fecha, categoría y tipo (`backend/app/routes.py`). El generador crea 360 movimientos (12 meses × 30) y se invoca con `seed=42` desde los endpoints.
- El dashboard obtiene y valida esos movimientos, calcula KPI y datos mensuales, muestra carga/error, deriva el periodo de las fechas recibidas y permite consultar los valores del gráfico en tablas accesibles (`frontend/src/App.tsx`, `frontend/src/lib/financial-types.ts`, `frontend/src/lib/financial-utils.ts`, `frontend/src/components/dashboard/`).
- Se respeta la preferencia de movimiento reducido para animaciones y transiciones (`frontend/src/index.css`).
- Hay pruebas backend de generador, filtros y endpoints en `backend/tests/test_routes.py`, y pruebas unitarias de utilidades financieras en `frontend/src/lib/financial-utils.test.ts`.

## Gaps conocidos basados en el código

- **Datos de demostración, no persistentes:** no se configura almacenamiento externo; las fechas dependen de `date.today()` en `backend/app/routes.py`. La semilla fija la secuencia aleatoria, no el año.
- **Tipos duplicados sin generación común:** los modelos Pydantic están en `backend/app/routes.py` y los tipos TypeScript en `frontend/src/lib/financial-types.ts`; requieren mantenimiento coordinado.
- **Pruebas sin cobertura visible de interfaz:** los archivos de pruebas presentes verifican utilidades frontend y endpoints backend; no se encontraron pruebas de componentes o del flujo de estados de `App.tsx`.
- **CORS permisivo:** `backend/app/main.py` establece `allow_origins=["*"]` y credenciales habilitadas; revisar antes de desplegar fuera del desarrollo.
- **Reproducibilidad backend limitada:** `backend/requirements.txt` no fija versiones.
- **Documentación de verificación corregida parcialmente:** `verification.md` cita actualmente `backend/app/main.py` y `backend/app/routes.py`; mantener esas rutas si se mueve código.

## Prioridades sugeridas (propuestas, no compromisos del proyecto)

1. Añadir pruebas de componente para el flujo de carga/error de `App.tsx` y, si se considera necesario, integración que compruebe el contrato HTTP completo.
2. Mantener Pydantic y TypeScript sincronizados al cambiar modelos o enums.
3. Revisar CORS y fijación de versiones según el entorno de despliegue que se defina.
4. Definir si los datos simulados siguen siendo el objetivo del producto antes de introducir persistencia; no añadir una base de datos por suposición.

No se documentan aquí tareas como existentes: las prioridades anteriores son recomendaciones derivadas de los gaps observados.
