# Fase 2 — Hallazgos de Ingeniería y Reglas Propuestas

Este documento recopila los hallazgos técnicos extraídos directamente del análisis del codebase del repositorio, agrupados por categorías, y establece las reglas propuestas para guiar futuras ediciones de agentes y desarrolladores.

---

## Hallazgos por Categoría (Vinculados a Código Real)

### A. Arquitectura y Origen de Datos
- **Convención útil y hallazgo:** Separar los componentes de pantalla y la lógica financiera. La pantalla principal se encuentra en `App.tsx`, agrupando sus componentes en `dashboard/` y los cálculos en `financial-utils.ts` (líneas 15–20 y 29–34). Las peticiones se hacen a `GET /api/metrics`.
- **Patrón arriesgado / Riesgo:** La generación de datos tiene efectos globales de aleatoriedad. La función `generate_mock_movements(seed)` ejecuta `random.seed(seed)` en `backend/app/routes.py` (líneas 94–104), reiniciando el generador global compartido de Python. Además, la fecha generada depende de `date.today()` (líneas 65–68), lo que puede generar discrepancias con textos estáticos de la interfaz como "2024 - Full Year" en `App.tsx:49`.
- **Configuración CORS:** El archivo `main.py` configura `allow_origins=["*"]` con `allow_credentials=True` (líneas 5–11), lo cual es muy permisivo para entornos fuera del desarrollo local.

### B. Naming (Nomenclatura y Contratos)
- **Convención útil:** Los componentes de visualización identifican claramente su propósito en el nombre del archivo (ej. `kpi-row.tsx`, `income-outcome-chart.tsx`, `profit-percent-chart.tsx`).
- **Patrón arriesgado:** Los contratos transportados usan `snake_case` (ej. `create_date`, `operation_type` en `financial-types.ts:5-10`), mientras que los tipos derivados del frontend usan `camelCase` (ej. `totalIncome`, `profitPercent`). Además, hay una duplicación de etiquetas de periodo entre `App.tsx:49` y `dashboard-header.tsx:5`.

### C. Testing
- **Convención útil:** Las pruebas del backend verifican reglas y comportamiento HTTP (`test_routes.py`), mientras que los cálculos del frontend tienen pruebas unitarias independientes de la UI (`financial-utils.test.ts`).
- **Patrón arriesgado:** La prueba del backend depende del calendario actual debido al uso de `date.today()` en el generador, por lo que su comportamiento puede variar según la fecha de ejecución a pesar de tener una semilla fija.

### D. Documentación y DX (Experiencia de Desarrollador)
- **Convención útil:** El desarrollo local está estandarizado mediante Docker Compose (`docker-compose.yml`) y el proxy de Vite (`vite.config.ts`), permitiendo levantar los servicios de forma limpia en los puertos locales.
- **Riesgo:** No existe un archivo lockfile reproducible para Python (`requirements.txt` lista paquetes sin versiones fijadas), lo que puede causar discrepancias en futuras instalaciones con `pip`.

---

## Set de Reglas Propuestas

1. **Regla de Persistencia y Generación Procedural:**
   - *Hecho de soporte:* `backend/app/routes.py` (`generate_mock_movements`).
   - *Directriz:* Queda prohibido asumir bases de datos persistentes externas o alterar el comportamiento determinista de las semillas sin actualizar las pruebas correspondientes.
2. **Regla de Sincronización de Contratos API:**
   - *Hecho de soporte:* `frontend/src/lib/financial-types.ts` y modelos Pydantic en `routes.py`.
   - *Directriz:* Al modificar campos transportados entre la API y el cliente, se deben actualizar de forma simultánea los tipos en TypeScript para evitar fallos de ejecución.
3. **Regla de Ejecución y Entorno:**
   - *Hecho de soporte:* `docker-compose.yml` y `vite.config.ts`.
   - *Directriz:* Todo cambio estructural o prueba de integración debe ejecutarse respetando el flujo de Docker Compose y el proxy configurado en Vite.