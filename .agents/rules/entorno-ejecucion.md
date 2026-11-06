# Entorno de ejecución local

## Alcance

Aplica a instrucciones de arranque, cambios en Docker Compose y configuración de desarrollo del frontend/backend, incluidos puertos y llamadas de API.

## Justificación

El flujo de desarrollo documentado es `docker compose up --build` (`README.md` y `README.es.md`). `docker-compose.yml` publica el frontend en `5173` y el backend en `8000`. `frontend/vite.config.ts` escucha en `0.0.0.0` y reenvía `/api` a `http://backend:8000`, nombre de servicio válido dentro de Compose. El Dockerfile frontend arranca Vite en el puerto `5173`; el Dockerfile backend arranca Uvicorn en `8000`.

## Directrices

1. **Usa Docker Compose como entorno local canónico.** Para validar cambios de integración, arranca desde la raíz con `docker compose up --build`; no sustituyas ese flujo por instrucciones de ejecución independientes sin documentar el caso y sus diferencias.
2. **Conserva los puertos estándar publicados:** frontend `5173`, backend `8000` y documentación interactiva FastAPI en `http://localhost:8000/docs` (`docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile` y `README.md`). Si un cambio obliga a modificarlos, actualiza todos los lugares afectados y ambos README.
3. **Conserva el proxy de desarrollo de Vite para `/api`.** `frontend/vite.config.ts` debe apuntar al servicio Compose `http://backend:8000`, no a `localhost:8000` dentro del contenedor. `frontend/src/App.tsx` usa `/api/metrics` con base vacía por defecto (`VITE_API_BASE_URL`); conserva esa compatibilidad.
4. **No confundas el origen local del proxy con un origen alternativo.** Para apuntar a otro backend, el frontend admite `VITE_API_BASE_URL` (`frontend/src/App.tsx` y `frontend/.env.example`); documenta el valor y el archivo de entorno aplicable cuando cambies esa configuración.
5. **Después de tocar Compose, Dockerfiles o Vite, valida arranque y conectividad.** Comprueba la carga del frontend en `http://localhost:5173`, `/health` o `/docs` en `http://localhost:8000`, y una petición `/api` desde el frontend.
