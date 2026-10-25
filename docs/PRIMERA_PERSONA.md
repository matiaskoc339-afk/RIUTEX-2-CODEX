# Primera Persona POV · v0.21.0

## Uso y ratón

La casilla **Primera Persona POV** está en Opciones y Pausa. Empieza desactivada y se guarda como preferencia del navegador, separada de la campaña. Puedes volver a topdown en el mismo lugar y con los mismos recursos.

Al iniciar o volver al juego se intenta capturar el cursor automáticamente. Abrir habilidades, inventario, documentos, mapa, mecanismos o pausa lo libera; cerrar la ventana vuelve a solicitarlo. Esc libera y pausa una sola vez, sin recapturarlo mientras estás en el menú. Transiciones, muerte, pérdida de foco y cambio de pestaña limpian las acciones para que no continúe un disparo.

Si el navegador impide una captura automática por falta de un gesto de usuario o por las restricciones del iframe, aparece **Bloquear ratón** para reintentar. También funcionan el arrastre con clic derecho y las flechas que no estén asignadas a un poder. El clic destinado a capturar no dispara; un clic derecho breve conserva el golpe.

La barra **Sensibilidad del ratón**, de 25 % a 250 % en pasos de 5 %, aplica la misma ganancia angular a X e Y. El valor normal es 100 % y se recuerda entre sesiones. Mover arriba mira arriba y mover abajo mira abajo. La inclinación alcanza ±1,4 radianes, unos 80 grados por dirección. La retícula permanece centrada.

W/S avanza y retrocede respecto de la cámara; A/D se desplaza de lado y Shift corre. E interactúa por proximidad, R recarga, F usa inyección, Tab abre inventario, J documentos, M mapa y K habilidades. Las teclas asignadas siguen activando poderes.

## Escena 3D

El POV usa una escena Three.js/WebGL con profundidad, mallas y materiales físicos. Actores y objetos no son imágenes frontales. Los enemigos tienen anatomía articulada, ropa, equipo y materiales según su especie; respiran, andan y anuncian ataques con sus extremidades. Los cuatro jefes cambian de volumen y anatomía al mutar. Los recogibles, muebles y mecanismos tienen cuerpos sólidos. Las escaleras incluyen peldaños, barandillas y una flecha tridimensional visible.

Paredes, suelos y techos usan texturas locales de 512 píxeles con mapas de relieve y rugosidad por ambiente. Hay linterna con sombras suaves, luminarias, destello del arma y niebla a distancia. Las puertas tienen marcos, hojas, tiradores e indicadores y se abren con desplazamiento animado hacia sus laterales. Los techos son geometría estable; patios y espacios exteriores permanecen abiertos y las arenas grandes tienen más altura.

El canvas 3D se presenta al tamaño de la ventana, con antialiasing y densidad de píxel limitada a 1,5 para controlar el coste. Las formas se generan localmente: el estilo es 3D procedural y no requiere modelos remotos ni texturas de una CDN. Three.js r160 y su licencia MIT se incluyen en `vendor/` y dentro del HTML integrado. Hace falta WebGL para esta vista. Si no puede iniciarse, se informa y queda disponible el modo clásico.

Solo POV prescinde de la máscara de habitaciones no visitadas. Se puede mirar por una puerta abierta antes de entrar; los muros y puertas cerradas siguen ocultando físicamente. El registro de visitas y el plano descubren cada sala al entrar. Al volver a topdown se mantiene su máscara original.

## Simulación y combate

La campaña conserva su simulación y colisiones en dos dimensiones: no hay salto libre ni navegación vertical. Vida, recursos, habilidades, IA, requisitos y guardados comparten el mismo estado entre vistas. Los enemigos con vista tienen alcance limitado y reaccionan en una puerta abierta; los ciegos siguen investigando sonidos.

Los disparos instantáneos normales en POV usan la inclinación de la mira, la altura del cuerpo y las superficies. Un disparo al suelo o techo no alcanza a un enemigo fuera del rayo, y los muebles bajos pueden cubrir las piernas sin borrar la cabeza. No se añade daño extra por un disparo en la cabeza. Granadas, poderes y el lanzallamas conservan su comportamiento de simulación anterior; la vista clásica conserva su disparo horizontal.

El arma y los dos brazos son otra escena 3D con agarres, retroceso, recarga y golpe. La mano izquierda existente ejecuta el golpe; no aparece una tercera mano. Los estados de pérdida, regeneración azul y desenlace del antídoto se deducen de la historia guardada.

Los avisos de los jefes conservan sus mismos círculos, arcos y líneas en las coordenadas del suelo: presión y ganchos del Carnicero, veneno y saltos de la Matriarca, marcas y cargas del Regente, y marcas/ondas/cadenas de Wren. También se muestran campos Riutex, residuos y proyectiles. La primera huida conserva su señal orientada respecto de la cámara. Los fundidos capturan la escena 3D junto con su interfaz.

## Módulos y comprobación

- `pov.js`: preferencia, movimiento relativo, sensibilidad y ciclo de captura con menús.
- `pov3d-renderer.js`: cámara, iluminación, profundidad, escena, efectos, interfaz y vuelta a la vista clásica.
- `pov3d-world.js`: materiales de ambiente, muros, techos, puertas, fluidos y luminarias.
- `pov3d-assets.js`: criaturas articuladas, mutaciones, muebles y recogibles volumétricos.
- `pov3d-viewmodel.js`: dos brazos y siete armas en una escena 3D de primera persona.
- `pov3d-ballistics.js`: trayectorias de armas normales con altura y oclusión en POV.
- `pov-models.js`, `pov-art.js`, `pov-renderer.js` y `pov-viewmodel.js`: catálogos, geometría auxiliar y adaptadores de avisos conservados de la presentación anterior.

Las pruebas específicas cubren controles y captura nativa, anatomía de las especies y mutaciones, ausencia de sprites en las mallas, animación, utilería y balística con altura. Las pruebas de navegador del render preparan escenas para comprobar la integración WebGL y los cambios de nivel. Los grupos antiguos que comparaban dibujos frontales pertenecen al render anterior y no prueban la geometría actual. Los resultados ejecutados y su alcance se registran en [VALIDACION.md](VALIDACION.md) y [RESULTADOS.json](RESULTADOS.json).

Los escenarios preparados no equivalen a una primera partida humana completa. El render de Chromium headless sirve para detectar errores e inspeccionar imágenes; no garantiza una tasa de FPS en todos los equipos. El HTML autocontenido se prueba por HTTP, sin descargas externas.

## Recogibles y captura en v0.20.1

Los disparos conservan retroceso e impactos y dejan de producir fogonazo, luz en manos o incremento de linterna. Los recogibles tienen halo sobre el suelo y una señal pequeña en 3D con profundidad; en topdown conservan el mismo criterio de recogida. Se ocultan al recoger, fuera del alcance visual o tras puertas y paredes. Reducción de movimiento mantiene la señal estática.

Tras un rechazo de captura, la siguiente tecla de desplazamiento o clic puede reintentar con interacción real, una vez por retorno al juego. Se mantiene el respaldo si el navegador sigue rechazando la API; no se reintenta en cada cuadro. Perder el foco pausa, y Reanudar recupera el cursor automáticamente.

## Personajes y brazos de v0.21.0

Las fábricas de personajes utilizan `pov-character-art.js`: perfiles cerrados de ocho lados, superficies biseladas, UV y texturas locales de 32–64 píxeles con filtrado de vecino más cercano. Sustituye las piezas esféricas de los personajes; conserva las geometrías y los materiales del escenario y los objetos. Los rostros tienen cuencas, cejas y heridas dibujadas sobre el volumen, con variantes para personal clínico, pacientes, soldados y Wren. Se ajustan gorros, máscaras y cascos a las nuevas proporciones.

El rig conserva articulaciones y nombres de especies. Los animales tienen patas, garras y mandíbula propias, y la polilla usa alas con espesor y silueta dentada. Los tres estados de los cuatro jefes continúan aumentando su volumen y detalle. El protagonista utiliza palmas y dedos biselados, antebrazos cónicos, piel de píxel y un agarre más próximo al cuerpo; no se añade una tercera mano al golpear.
