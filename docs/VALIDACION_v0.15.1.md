# Validación de v0.15.1 · pantalla de inicio

Esta revisión modifica el dibujo y el estilo del menú: se elimina la figura humana, se aumenta el reflejo de disparos y se mejoran sangre, suelo de hospital, elementos ambientales, logo y botones. Conserva la campaña y el balance de v0.15.0.

## Comprobaciones repetidas en esta versión

- `npm test`: 245 pruebas del motor, 103 comprobaciones de integración y 15 mapas, sin fallos.
- `tests/polish_browser.py`: 41 comprobaciones de menú, opciones, preferencias persistentes, teclado, resoluciones 640×720 / 1280×720 / 1920×1080 y fundidos con reloj real. El reflejo de disparo supera en más de 20 unidades de luminosidad a la muestra en reposo. Movimiento reducido mantiene estático el cuadro incluso al pedir tiempos distintos. Se inspeccionaron las capturas del menú en reposo, durante el disparo y a 640×720.
- `tests/standalone_blue.py`: 15 comprobaciones del HTML autocontenido, incluyendo nueva partida, movimiento, menús conectados, guardados, las cuatro zonas, sus mecanismos y CSS. Sin recursos externos ni errores JavaScript.
- El empaquetador verifica que el HTML contenga los módulos actuales y que cada fuente y el HTML coincidan byte a byte dentro del ZIP.

Los fundidos se comprueban en todas las plantas, al cargar, reintentar y mostrar el desenlace, con simulación y daño detenidos mientras no es visible la llegada. Los destinos y finales se preparan para aislar presentación; estas pruebas no evalúan dificultad.

## Historial y límites

La suite completa de navegador de v0.15.0 (572 comprobaciones en 20 grupos) figura en VALIDACION_v0.15.0.md y en regression_baseline de RESULTADOS.json. Esta revisión repite los dos grupos directamente afectados, que suman 56 comprobaciones; no presenta las pruebas históricas de campaña como repetidas.

Chromium administrado bloquea file:// con ERR_BLOCKED_BY_ADMINISTRATOR. El intento no se cuenta como superado; el HTML se valida por HTTP sin solicitudes externas. Los guardados dependen de la ubicación/origen del navegador. No se ha completado toda la campaña con una única provisión natural de munición y curas ni se ha medido la dificultad mediante partidas humanas completas.
