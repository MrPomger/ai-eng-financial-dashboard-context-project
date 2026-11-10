---
name: frontend-qa-validation
description: "Estandariza la validación local de cambios en frontend/ con pruebas, compilación y lint ejecutados desde el directorio correcto."
---

# Validación y QA del frontend financiero

## 1. Objetivo claro

Estandarizar la validación local de cambios en `frontend/` para este repositorio. Evitar ejecutar scripts npm desde la raíz —donde no existe `package.json` y se produce un error `ENOENT`— y comprobar de forma consistente pruebas, compilación TypeScript/Vite y lint antes de considerar validado un cambio del frontend.

## 2. Inputs definidos

- **Cambios bajo revisión:** archivos modificados, añadidos o eliminados en `frontend/` y resumen de su propósito.
- **Directorio del repositorio:** raíz que contiene `frontend/package.json`.
- **Scripts disponibles:** consultar `frontend/package.json` como fuente de verdad. Actualmente incluye `test`, `build` y `lint` (además de scripts de desarrollo, preview y cobertura).
- **Entorno de ejecución:** Node/npm y dependencias frontend instaladas según `frontend/package-lock.json`.
- **Alcance de integración:** indicar si el cambio afecta proxy/API, Docker Compose o configuración de ejecución; en ese caso revisar también las instrucciones de entorno en `.agents/rules/entorno-ejecucion.md` y el flujo canónico documentado.

## 3. Output esperado

Un resumen de QA que incluya:

1. Los comandos ejecutados, siempre desde `frontend/` o precedidos por `cd frontend &&` desde la raíz.
2. El resultado individual de pruebas, build y lint, sin atribuir éxito a comandos no ejecutados.
3. Errores y advertencias relevantes. Un warning de tamaño de bundle de Vite debe quedar reportado aunque el build termine con código cero; no confundirlo con un fallo de compilación.
4. Para fallos, el mensaje observado y la validación pendiente. No cerrar la tarea como validada si alguno de los controles aplicables falló.
5. Si se modificó la integración de Compose, Dockerfile o proxy de Vite, declarar además si se verificaron los servicios/conectividad indicados por las reglas de entorno; no inferir esa verificación a partir de la suite local.

## 4. Criterios de aceptación

- Ejecutar los controles desde el directorio `frontend/`; no lanzar `npm test`, `npm run build` o `npm run lint` desde la raíz del repositorio.
- Para cambios de frontend, ejecutar como mínimo, en este orden:

  ```bash
  cd frontend
  npm test
  npm run build
  npm run lint
  ```

  También se permite ejecutar desde la raíz con `npm --prefix frontend run test`, `npm --prefix frontend run build` y `npm --prefix frontend run lint`.
- Considerar tests aprobados solo si Vitest finaliza con código cero; considerar build aprobada solo si terminan correctamente `tsc -b` y Vite; considerar lint aprobado solo si ESLint finaliza con código cero.
- Informar fallos por separado y corregirlos o declararlos pendientes; no ocultar un fallo porque otro control haya pasado.
- Informar warnings no bloqueantes que aparezcan durante build/lint, especialmente los de tamaño de bundle, sin cambiar umbrales de herramienta para silenciarlos salvo que exista una decisión explícita del proyecto.
- No sustituir estos controles por `docker compose up --build`: Compose es la validación canónica de integración/ejecución, mientras que los scripts npm anteriores son los controles específicos de código frontend.
- Ajustar los comandos a los scripts realmente declarados si `frontend/package.json` cambia, y actualizar esta skill en el mismo cambio cuando cambie el procedimiento de QA.
