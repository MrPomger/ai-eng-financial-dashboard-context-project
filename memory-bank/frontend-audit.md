# Auditoría de conformidad del frontend

**Fecha:** 2026-11-10  
**Alcance:** `frontend/` contra la evidencia de producto, el contrato FastAPI documentado en el código, las reglas de `.agents/rules/`, la skill de accesibilidad WCAG 2.2 y las recomendaciones React disponibles.  
**Resultado:** corregidos los hallazgos verificables que podían atenderse sin cambiar el contrato ni el alcance de producto.

## Especificaciones y límites respetados

- Se conserva React + TypeScript, la petición a `GET /api/metrics`, el proxy Vite `/api` y `VITE_API_BASE_URL` opcional.
- Se mantienen los nombres JSON `create_date`, `amount`, `operation_type`, `category`, `business_type` y los literales definidos en FastAPI. KPI y agregados mensuales siguen siendo cálculos frontend, no se presentan como respuestas de API.
- No se añadió persistencia, configuración de entorno nueva ni cambio al backend.
- El intervalo visible se deriva ahora del mínimo y máximo mes contenido en los movimientos; el generador usa fechas dinámicas y no justifica un año fijo.
- La UI continúa en inglés, como corresponde al contenido actual de la aplicación y a `lang="en"`.

## Hallazgos y cambios realizados

1. **Periodo fijo y contradictorio con los datos generados.** `App.tsx` fijaba `2024 - Full Year` mientras que los movimientos usan fechas dinámicas, y el encabezado tenía otro valor fijo como predeterminado. Se eliminó el valor por defecto del componente y se muestra el intervalo real en formato mes-año; una respuesta vacía indica `No data`. Así el encabezado no afirma un periodo que el API no devolvió.
2. **Riesgo de asignación a un mes incorrecto.** `new Date("YYYY-MM-DD")` se interpreta en UTC y los getters locales pueden desplazar fechas al mes anterior en ciertas zonas horarias. `computeMonthlyData` agrupa por los primeros siete caracteres del ISO calendar date del contrato.
3. **Contrato de API confiado sin validación de ejecución.** El tipo TypeScript no valida el JSON recibido. Se añadió `isFinancialMovement` que valida fecha ISO real, importe finito, operación, categoría y tipo de negocio; la carga rechaza estructuras incompatibles en vez de producir métricas silenciosamente erróneas. Los literales siguen alineados con los modelos Pydantic existentes.
4. **Carga asíncrona sin cancelación al desmontar.** La petición usa `AbortController` y el efecto cancela la solicitud al desmontarse. El estado se actualiza solo si el efecto sigue activo; esto también evita informar un error de red durante la cancelación.
5. **Agregación KPI con dos pasadas.** Se consolidaron los dos filtros/reducciones en una sola iteración, con la misma fórmula de ingresos, egresos, ganancia y margen.
6. **Representación visual de gráficos no suficiente para lectores de pantalla.** Se expone una tabla con los valores exactos de cada gráfico y encabezados/caption semánticos. Se agregó anuncio de estado de carga/resultado con `role="status"` para complementar el error `role="alert"` ya existente.
7. **Accesibilidad de movimiento.** `index.css` ahora reduce animaciones y transiciones cuando el usuario ha solicitado movimiento reducido, incluidas las animaciones del esqueleto.
8. **Textos accesibles y coherencia idiomática.** Se mantuvo `lang="en"` (idioma real de la interfaz), el enlace de salto y los encabezados accesibles en inglés; el mensaje de fallo también se alineó al idioma de la UI. No se cambió el idioma declarado a español porque la skill requiere que describa el idioma efectivo de la página.

## Archivos modificados y motivo

| Archivo | Motivo |
|---|---|
| `frontend/src/App.tsx` | Periodo dinámico, datos validados, cancelación de fetch y anuncio accesible del estado. |
| `frontend/src/lib/financial-types.ts` | Validador de tiempo de ejecución estricto para el contrato actual de movimiento. |
| `frontend/src/lib/financial-utils.ts` | Agrupación de fecha sin desplazamiento de zona horaria, formato de intervalo real y agregación KPI en una pasada. |
| `frontend/src/lib/financial-utils.test.ts` | Pruebas de periodo, fechas en límites de mes y validación de payload. |
| `frontend/src/components/dashboard/dashboard-header.tsx` | Hace obligatorio que quien usa el encabezado aporte el periodo, eliminando el fallback falso fijo. |
| `frontend/src/components/dashboard/income-outcome-chart.tsx` | Alternativa tabular accesible que presenta los importes del gráfico. |
| `frontend/src/components/dashboard/profit-percent-chart.tsx` | Alternativa tabular accesible con margen mensual exacto. |
| `frontend/src/index.css` | Soporte de `prefers-reduced-motion`. |
| `memory-bank/frontend-audit.md` | Registro de alcance, decisiones, hallazgos, archivos y validación. |

## Pruebas y validación

- `cd frontend && npm test`: 9 pruebas pasan.
- `cd frontend && npm run build`: compilación TypeScript y Vite exitosa.
- `cd frontend && npm run lint`: exitoso.
- Vite reporta que el chunk JavaScript de producción excede 500 kB minificados. Se registra como advertencia existente a evaluar por separado; dividir código podría ser útil, pero este dashboard carga ambos gráficos de inmediato y no se cambió el patrón de bundle sin evidencia de un impacto requerido.
- No se ejecutó Lighthouse ni prueba de árbol accesible/navegación real: las herramientas de navegador citadas por la skill no están disponibles en esta sesión. Tablas equivalentes y estados semánticos se verificaron por inspección de fuente y build.

## Nota de publicación de spec

La skill `to-spec` exige publicar en un issue tracker con la etiqueta `ready-for-agent`, pero el repositorio/sesión no proporcionó tracker, vocabulario de triage ni una integración de issues disponible. Por eso esta nota se deja en el memory bank y no se afirma que se haya creado un issue. Para habilitar publicación conforme a la skill, configura el tracker mediante `/setup-matt-pocock-skills`.
