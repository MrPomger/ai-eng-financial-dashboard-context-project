# Persistencia y origen de datos

## Alcance

Aplica a cambios del backend que generan, almacenan o sirven movimientos financieros, y a cualquier propuesta de añadir persistencia externa (por ejemplo, PostgreSQL, MySQL o un servicio alojado).

## Justificación

Actualmente no hay una base de datos configurada en `docker-compose.yml` ni dependencias de acceso a bases de datos en `backend/requirements.txt`. Los datos se generan proceduralmente mediante `generate_mock_movements` en `backend/app/routes.py`; los endpoints la invocan con `seed=42` (por ejemplo, `/api/metrics`, cerca de la línea 255). El generador produce 30 movimientos por cada uno de 12 meses y deriva el año de `date.today()` (`backend/app/routes.py`, funciones `_year_for_month` y `generate_mock_movements`). Por tanto, la semilla repite la secuencia aleatoria, pero las fechas dependen del calendario actual.

## Directrices

1. **No añadas una base de datos externa, servicio de persistencia o credenciales de conexión sin autorización explícita y documentación del cambio.** Si se aprueba, actualiza también `docker-compose.yml`, las dependencias y la documentación de ejecución/migración; no supongas que existe una base de datos por tratarse de datos financieros.
2. **Conserva el generador procedural existente como fuente de datos de prueba.** No sustituyas ni omitas `generate_mock_movements` (`backend/app/routes.py`) al modificar endpoints salvo que el alcance aprobado requiera cambiar el origen de datos.
3. **Mantén la semilla `42` en los endpoints que hoy la utilizan**, a menos que el cambio solicite deliberadamente otra política. Comprueba sus usos en `backend/app/routes.py` antes de cambiar el generador.
4. **No describas los resultados como un año fijo o persistente.** `_year_for_month` y `date.today()` hacen que las fechas cambien con el calendario; ajusta textos y documentación para distinguir la semilla reproducible del periodo dinámico.
5. **Al modificar el generador, valida sus invariantes con pruebas.** `backend/tests/test_routes.py` comprueba actualmente los 360 registros y su orden en `test_generate_mock_movements_returns_full_year_sorted_data`.
