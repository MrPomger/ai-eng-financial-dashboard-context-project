# Tech stack

Este inventario se basa en los manifiestos y archivos presentes; no presupone servicios o dependencias no declarados.

## Frontend (`frontend/`)

- **React 19** y **React DOM 19** con **TypeScript 6** (`frontend/package.json`). Aplicación de entrada en `frontend/src/main.tsx`; pantalla principal en `frontend/src/App.tsx`.
- **Vite 8** con `@vitejs/plugin-react` y `@tailwindcss/vite` (`frontend/package.json`, `frontend/vite.config.ts`). Alias `@` apunta a `frontend/src` (`vite.config.ts`, `tsconfig.app.json`).
- **Tailwind CSS 4** y `autoprefixer` para estilos (`package.json`, `frontend/src/index.css`).
- **Recharts 3** para visualizaciones (`frontend/src/components/dashboard/income-outcome-chart.tsx`, `profit-percent-chart.tsx`).
- **lucide-react** para iconos; **class-variance-authority**, **clsx** y **tailwind-merge** aparecen como dependencias UI/utilitarias (`package.json`, `frontend/src/lib/utils.ts`).
- **Vitest 4** y `@vitest/coverage-v8` para pruebas; **ESLint 9** con TypeScript, React Hooks y React Refresh (`package.json`, `frontend/eslint.config.js`).
- Scripts disponibles: `dev`, `build`, `lint`, `preview`, `test`, `test:watch`, `test:coverage` (`frontend/package.json`).

## Backend (`backend/`)

- **Python 3.13** en la imagen Docker (`backend/Dockerfile`).
- **FastAPI** para la API y **Uvicorn** como servidor ASGI (`backend/requirements.txt`, `backend/Dockerfile`).
- **Pydantic** para los modelos de respuesta, provisto por el stack FastAPI (`backend/app/routes.py`).
- **debugpy** para depuración remota; **pytest**, **pytest-cov** y **httpx** para pruebas (`backend/requirements.txt`).
- No hay ORM, driver de base de datos ni servicio persistente declarado en los archivos de dependencias/configuración revisados.

## Orquestación y desarrollo

- **Docker Compose** orquesta frontend en `5173:5173` y backend en `8000:8000`; también publica el puerto de depuración `5678:5678` para el backend (`docker-compose.yml`).
- La imagen frontend usa **Node 24 Alpine** y Vite en puerto 5173 (`frontend/Dockerfile`). La imagen backend usa `python:3.13-slim`, Uvicorn con recarga y debugpy (`backend/Dockerfile`).
- Vite reenvía `/api` a `http://backend:8000`, resolviendo el nombre del servicio Compose (`frontend/vite.config.ts`).
- El flujo de arranque documentado es `docker compose up --build` (`README.md`, `README.es.md`).

## Versionado de dependencias

El frontend mantiene `frontend/package-lock.json`; el Dockerfile usa `npm install`. `backend/requirements.txt` no fija versiones. Tener esto presente al buscar builds reproducibles; no implica que el repositorio ya garantice versiones backend inmutables.
