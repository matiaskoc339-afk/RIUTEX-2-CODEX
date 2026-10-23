# Validación de v0.14.0 · historia completa

Esta entrega conserva la base RIUTEX2_fase1_v0.2.2 y las ampliaciones anteriores. La compuerta posterior al Regente continúa hasta el laboratorio UMBRAL, Wren/ORIGEN y los dos finales. Se conserva el cambio anterior: Sala de pruebas entrega una inyección amarilla de +20 vida máxima en lugar del rifle.

## Resultados actuales

- `npm test`: **237 pruebas del motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- `npm run test:browser`: **532 comprobaciones en 19 grupos**, sin errores JavaScript.
- `npm run maps`: quince planos generados desde la geometría real; contienen spoilers.
- HTML autocontenido con código, fuentes, SVG y CSS integrados. Se comprueba sin solicitudes de recursos externos.

RESULTADOS.json contiene los conteos, alcances y métricas de combate. El ZIP incluye fuentes, pruebas, resultados, registros y capturas. El empaquetador coteja el código integrado con cada archivo fuente y verifica todos los archivos del ZIP byte a byte.

## Laboratorio y desenlaces

`tests/endgame.test.js`: 28 pruebas de transición con equipo conservado, 26 espacios/40 puertas, tres cámaras sin pasos alternativos que eludan sus cierres, radios de aparición, refugio seguro sin curación gratis, los seis instrumentos principales y sus requisitos, persistencia parcial, órdenes diferentes de las tres rutas, muestras físicas, GL-6 independiente de la migración FL-4, receta, costes de disparo y cuatro mejoras, cinco módulos opcionales, guardado de enemigos heridos, activación del reactor, mutaciones sin saltos y sin encajarse al crecer, ataques con aviso, limpieza de victoria, ventana de decisión, pérdida de mutaciones/salud mutante/bindings al curarse, conservación del entrenamiento y pérdida del brazo, transformación alternativa, recorrido de evacuación, helicóptero, ambos finales guardables y la inyección que reemplazó al rifle.

`tests/endgame_browser.py`: 63 comprobaciones. Se recorre físicamente la compuerta del museo, las 26 salas de UMBRAL, las rutas de las tres muestras y los doce instrumentos, usando puertas, colisiones y botones reales. Las válvulas de Criobóveda se sellan esperando la banda verde en tiempo real. Se guarda y carga un mecanismo parcial, se obtienen piezas, GL-6, cinco módulos y ampliación de maletín, se consulta el mapa, se alternan GL-6/FL-4 con 5, se fabrican granadas y se compran las cuatro mejoras del GL-6. Los enemigos se retiran solo para aislar este recorrido geométrico.

El combate se prepara después de la geometría con **R-98 base, 44 balas totales, 100 HP y cuatro curas**, sin traje, habilidades compradas ni módulos. Permanecer quieto mata al jugador; Reintentar recupera el punto anterior a síntesis con las tres muestras. La victoria posterior usa IA activa, movimiento, tiros y recargas reales: Wren atraviesa las tres formas, ejecuta espinas, cargas, marcas, ondas y salto y cae tras 30 disparos en aproximadamente 99,4 segundos simulados. Quedan 100 HP y no se gastan curas. El controlador conoce posiciones y avisos y mantiene distancia: ese resultado no mide dificultad humana ni demuestra todos los combos de proximidad. Cadenas e impactos se prueban además en el motor.

La ventana de la cura se verifica después del combate real. Se añaden entonces habilidades humanas y mutantes para comprobar las consecuencias de ambos botones; no intervienen en la victoria. Cada opción se guarda/carga, atraviesa físicamente la salida y camina por las calles. En evacuación se activa la aeronave: cuerda y extracción para el humano, disparos y muerte para el transformado. Los dos finales se muestran y persisten.

`tests/endgame_visual.py`: 12 comprobaciones de disparo, proyectil, explosión, estamina y recarga reales del GL-6 contra un enemigo preparado; HUD del arma; refugio; instrumentación, avisos y decisión a 720p; tres siluetas de Wren. Las posiciones de esas siluetas son presentaciones controladas, no tres victorias adicionales. El combate íntegro está registrado en el grupo anterior.

## Regresión

Los diecisiete grupos anteriores siguen pasando con la fase final cargada: prólogo/captura, visibilidad por píxeles, refugios/escondites, tutorial e inyección, sombras, HUD, 153 habilidades y cuatro parejas doradas, teclado y guardados, maletín/documentos/mapa conectados, recetas, M9/M12/UZI y sus misiones, generador/bancos, Carnicero de tres formas, fábrica con treinta zonas, ocho oleadas y K-9, FL-4/S-4, Matriarca, calabozo/Tallador, ambas plantas del castillo y dos campanas, R-98/cinco módulos, Regente y HTML integrado.

Se actualizó la antigua expectativa de Sala de pruebas para comprobar la inyección solicitada en vez de exigir el rifle retirado. El cierre del castillo ahora comprueba la transición al laboratorio en lugar de una pantalla de fin de fase 3.

El HTML integrado también abre UMBRAL, su fauna, refugio, GL-6 y ADN con su CSS incluido. Las partidas antiguas con Matriarca o Regente vencidos pueden continuar por sus salidas. El GL-6 usa identificadores nuevos; no se confunde con el LG-4 histórico convertido al FL-4. El desgaste del S-4, las cuatro parejas doradas y el progreso anterior siguen probados.

## Interpretación y límites

Los recorridos geométricos sin enemigos comprueban movimiento, puertas, piezas y requisitos; no equivalen a sobrevivir a todos los encuentros. Las pruebas de progresión del motor pueden fijar posiciones y forzar daño para aislar transiciones. Los combates de navegador registrados aparte usan recursos preparados finitos y el motor real; sus controladores conocen los patrones.

No se ha completado toda la campaña desde la mansión hasta ambos finales con una única provisión natural de munición y curas. El balance de recursos y dificultad humana requiere partidas de jugadores. La muestra de FPS del JSON corresponde al vestíbulo, no a todos los dispositivos o sectores.

Chromium administrado bloquea la apertura directa `file://` con `ERR_BLOCKED_BY_ADMINISTRATOR`; el intento no se cuenta como superado. El HTML se valida por HTTP sin recursos externos. Los guardados dependen de la ubicación/origen desde el que el navegador abre el juego. Las elecciones finales son permanentes dentro de esa continuación, pero un guardado anterior permite ver la otra opción.

El detalle anterior se conserva en VALIDACION_v0.13.0.md como historial; sus conteos no se suman a los resultados actuales.
