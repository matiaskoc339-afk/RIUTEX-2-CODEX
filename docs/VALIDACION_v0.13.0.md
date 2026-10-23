# Validación de v0.13.0 · 21 de octubre de 2026

Base: RIUTEX2_fase1_v0.2.2 aportada por el usuario. Se conservan mansión, hospital, Carnicero, Cloacas / Fábrica, ocho oleadas opcionales, FL-4, S-4 y Matriarca. La salida de esta última ahora continúa hasta Valcárcel. Cruzar la galería después del Regente termina la fase 3.

## Resultados

- `npm test`: **209 pruebas del motor**, **103 comprobaciones de integración** y geometría de **12 mapas**, sin fallos.
- `npm run test:browser`: **456 comprobaciones en 17 grupos** con Chromium y Playwright, sin errores JavaScript.
- `npm run maps`: doce planos generados desde la geometría real. Contienen spoilers.
- HTML autocontenido validado sin solicitudes de recursos externos; código, fuentes, SVG y estilos integrados, incluido `castle.css`.

Los JSON individuales, registros y capturas se incluyen en el ZIP. `RESULTADOS.json` conserva los conteos y resultados de combate. Los scripts de construcción y empaquetado comprueban que el código del HTML coincida con los fuentes y que los archivos del ZIP coincidan byte a byte.

## Nueva fase

`tests/castle.test.js` añade 37 pruebas: transición desde la araña con equipo conservado; 44 salas y tres pares de escaleras; puertas de torres y calabozo sin atajos; oído sin percepción visual; marcha silenciosa, carreras, cristales y colisiones; destino del sonido fijado; contacto y corte avisado; patrulla continua que rodea columnas; posiciones de aparición válidas para el radio completo de todos los enemigos; llave física y guardado; refugio; doce mecanismos y sus requisitos; ambas órdenes de campanas; R-98, receta, cuatro mejoras, cinco módulos, lore; salud y posición de enemigos persistentes; tres formas del Regente, escudo, combos, cargas, marcas, guardado, victoria y final. Una prueba coloca al Regente contra los bordes durante ambas mutaciones y carga la partida: aumentar su radio no lo deja dentro de una pared.

`tests/castle_browser.py`: 76 comprobaciones. Camina por la salida de la Matriarca, entra en el calabozo, verifica muerte por contacto durante la patrulla y reintento, recoge la llave y llega al refugio. Después completa ambas rutas mediante movimiento y botones, sin asignar soluciones: retratos, cuatro espejos, pesas, trasvases, astrolabio y canto. Guarda y recarga un mecanismo parcial. Obtiene las piezas opcionales, resuelve los seis estuches y recorre físicamente las 44 salas de ambas plantas. Comprueba las pestañas del mapa, alternancia de rifles con 4, fabricación de R-98, cuatro mejoras del banco, guardado, reserva finita de la antesala, combate del Regente, carga de victoria y final al cruzar la galería.

Se retiran enemigos corrientes solo en el recorrido geométrico. El desenlace del Tallador se fuerza únicamente en ese recorrido para obtener la llave; su combate completo se prueba aparte. El combate final de ese recorrido sí usa disparos reales con el R-98 obtenido y cuatro mejoras de nivel 1, 31 balas totales preparadas, 100 HP, cuatro curas disponibles, sin traje ni habilidades compradas. Ganó con 18 disparos y sin curas, atravesando las tres formas.

`tests/castle_combat_probe.py`: cuatro comprobaciones y dos combates independientes, sin forzar daño, con M9 base, 192 balas iniciales totales, 100 HP y cuatro curas disponibles, sin traje ni habilidades compradas. El Tallador se derrotó con 31 disparos; el Regente, con 80 y sus tres formas activas. En ambos se conservaron 100 HP y no se usaron curas. La munición es finita. Los controladores conocen posiciones y avisos y evitan acercarse sin necesidad; estos resultados no miden la dificultad de un jugador nuevo.

`tests/castle_visual.py`: 17 comprobaciones. Teclado y ratón reales para caminar, correr, pisar cristales, chocar y disparar; verifica que el Tallador corra al origen acústico sin actualizarlo al mover al jugador. Aísla contacto y su aviso, seguridad del refugio y ocultación de zonas. Comprueba mecanismos y avisos a 720p. Las tres siluetas del Regente se preparan para presentar arte y legibilidad, y no se cuentan como tres combates ganados.

## Contenido anterior conservado

Los primeros catorce grupos siguen pasando con el nuevo contenido cargado:

| Grupo | Alcance |
|---|---|
| `browser_blue.py` | Prólogo y captura con movimiento y puertas; interfaces posteriores en escenarios preparados. |
| `horror_browser.py` | Oclusión por píxeles, puertas, memoria, escondites, red y documentos. |
| `revision_browser.py` | Tutorial, pausa, inyección, sombras de muebles y elecciones persistentes. |
| `presentation_browser.py` | Monitores, colores, reservas, nombres, puertas, fondo continuo y resoluciones. |
| `adventure_browser.py` | HUD de armas, rutas físicas y mecanismos de escopeta/UZI. |
| `fielddesk_browser.py` | Seis pestañas, fabricación, artefactos, iconos, mapa, arrastre/zoom/marca y baúl; 720p/1080p. |
| `survival_browser.py` | Costes, aparición lejana del Carnicero por ruido, teclas activas, accesorios, generador, banco y C-17. |
| `gold_browser.py` | Cuatro parejas doradas independientes, requisitos, exclusión y carga. |
| `finale_browser.py` | Quince salas del segundo piso del hospital, llaves, EEG y escaleras; derrumbe y Carnicero de tres formas con M9 y recursos finitos; carga y fábrica. |
| `works_browser.py` | Treinta zonas, cinco mecanismos, válvulas, ocho oleadas con 22 enemigos/K-9, recompensa UZI y banco. Geometría y combates aislados. |
| `depths_browser.py` | FL-4, circuito, custodio, traje S-4, reparación, cueva y Matriarca con recursos finitos; salida ahora comprobada hasta el calabozo. |
| `depths_visual.py` | Tres formas de la Matriarca, avisos y HUD a 720p. Presentaciones controladas. |
| `flamethrower_browser.py` | Chorro sostenido, costes, alcance, paredes, quemado leve sin acumulación, tanques, fabricación, cuatro mejoras y migración del LG-4. |
| `standalone_blue.py` | HTML final con movimiento, inventario, árbol, mapa, guardado, jefes, fábrica y castillo, sus mecanismos y CSS, sin solicitudes externas. |

El total de 17 grupos incluye los tres específicos del castillo descritos antes. Cada grupo utiliza un servidor local efímero. Los nombres internos `hospitalcells`, `hospitalcastle`, `hospitalcastle1` y `hospitalroyal` reutilizan el motor R2; la interfaz los presenta como calabozo, plantas del museo y sala real.

## Guardados y límites

Se mantiene la clave de guardado y el progreso anterior. Valcárcel almacena campanas, mecanismos, módulos, enemigos y jefes en `story.castle`. Las muertes y recompensas no se duplican al cargar. Reintentar usa puntos previos a encuentros obligatorios. Los guardados con Matriarca vencida pueden continuar hacia el museo; no se repiten válvulas ni se pierde equipo. Los guardados del LG-4 siguen migrando al FL-4 sin repetir la conversión.

Las pruebas de progresión del motor pueden fijar posiciones o forzar daño para aislar la historia. Los combates de navegador citados usan IA, disparos, movimiento y recargas reales, con provisiones preparadas finitas. El controlador conoce los patrones. Las rutas sin enemigos validan geometría y requisitos, no la supervivencia a todos los combates de la ruta.

No se ha recorrido toda la campaña de mansión a castillo con una sola provisión natural de salud y munición. El equilibrio y la dificultad humana de la campaña completa requieren partidas de jugadores. La muestra de FPS del JSON corresponde a una escena del vestíbulo, no a todos los dispositivos o zonas.

Se intentó abrir el HTML directamente sin conexión, pero el Chromium administrado bloquea `file://` con `ERR_BLOCKED_BY_ADMINISTRATOR`. Esa apertura no se cuenta como superada. El HTML integrado sí se prueba por HTTP sin recursos externos. Los guardados del navegador dependen de la ubicación/origen desde el que se abre el juego.

## Ajuste puntual: vida máxima

El rifle de Sala de pruebas se sustituye por una inyección amarilla (+20 salud máxima al usarla). Se verificaron recogida, uso, persistencia al guardar/cargar y ausencia de duplicación. Los conteos anteriores pertenecen a la suite completa previa a este ajuste. El R-98 del castillo se conserva.
