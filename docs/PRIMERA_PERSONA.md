# Primera Persona POV · v0.17.2

## Uso

La casilla «Primera Persona POV» está en Opciones y en Pausa. Arranca desactivada y se guarda como preferencia del navegador, separada del progreso de la campaña. Puedes volver a topdown en el mismo lugar y con los mismos recursos.

En v0.17.2 puedes mirar mucho más arriba y abajo: el recorrido vertical es cinco veces mayor, con ratón o flechas. La sensibilidad elegida conserva su velocidad y la retícula permanece centrada.

La barra **Sensibilidad del ratón** está en Opciones y Pausa: de **25 % a 250 %**, con **100 %** como valor normal. Se aplica al instante a la mirada horizontal y vertical y se recuerda al volver a abrir el juego.

Pulsa **Bloquear ratón** en la ayuda inferior para capturar el cursor en primera persona. **Esc** lo libera y pausa. El botón reaparece al reanudar; si el navegador rechaza la captura, puedes reintentar o usar el arrastre con clic derecho.

W/S avanza o retrocede respecto de la cámara; A/D hace desplazamiento lateral. Shift corre. El ratón controla la mirada en sentido normal (subir mira arriba, bajar mira abajo) tras hacer clic en la escena; el clic que adquiere el control no dispara. Esc libera y pausa una sola vez. Las ventanas, transiciones, muerte, pérdida de foco y cambio de pestaña limpian el disparo y liberan el control. Reanudar requiere un clic explícito para recuperar el ratón. Si el bloqueo del puntero se rechaza, se puede mirar arrastrando con clic derecho o mediante flechas que no estén asignadas a un poder; un clic derecho breve golpea.

Los demás controles y ventanas conservan su comportamiento: E interactúa por proximidad, R recarga, F usa inyección, Tab abre inventario, J documentos, M mapa, K habilidades y las teclas asignadas activan poderes.

## Integración

- `pov.js`: ajuste, entrada relativa, captura/alternativa de ratón y coordinación con ventanas. Los únicos enganches a Player.update/dodge son condicionales al modo activo.
- `pov-renderer.js`: proyección desde la posición del jugador, profundidad por píxel, suelo/techo, paredes, puertas, cobertura, actores, proyectiles, campos y señales.
- `pov-models.js`: treinta identidades de criaturas/encuentros, mutaciones, objetos sueltos y claves visuales de caché independientes de los tipos heredados. [Catálogo](MODELOS_POV.md).
- `pov-art.js`: materiales y arte frontal propios, armamento en manos, enemigos y sus mutaciones, escuadrón, primer Custodio, documentos, suministros, mecanismos y helicóptero. Recursos locales y cachés acotadas.
- `pov.css`: ajuste accesible y ayuda de control, incluidos 720p.

Se mantiene la simulación original en dos dimensiones. El render usa paredes extruidas y actores frontales, con oclusión real; no es una ampliación del dibujo topdown. La inclinación vertical es visual y la retícula permanece en el centro al mirar arriba o abajo y el combate conserva su plano horizontal: no añade saltos, disparos a alturas independientes ni bonificaciones por disparar a la cabeza. La vida, armas, munición, habilidades, colisiones, IA, requisitos y guardados conservan sus reglas.

Solo la vista POV prescinde de la máscara de habitaciones no visitadas: se puede mirar dentro por una puerta abierta antes de entrar. La oclusión por profundidad sigue ocultando lo que queda detrás de paredes y puertas cerradas. HorrorVision.prepare conserva el registro de visitas y el plano descubre cada sala al entrar. Al volver a topdown se mantiene su máscara de exploración original. El mobiliario sólido alcanza el plano de combate, por lo que la cobertura sigue bloqueando los disparos como en la vista clásica.

Los avisos originales de los jefes pasan por un adaptador que proyecta sus mismos círculos, arcos y líneas al suelo. Las bandas amplias conservan grosor en coordenadas del mundo. Se incluyen presión química y ganchos del Carnicero, veneno/saltos/crías de la Matriarca, marcas y cargas del Regente y marcas/ondas/cadenas de Wren. Los campos Riutex y los residuos se muestran en sus coordenadas reales. Durante la huida inicial se reutiliza el destino de EscapeGuide con una señal relativa a la cámara, sin instrucciones absolutas de izquierda/derecha.

## Comprobaciones

La batería del motor incluye dieciocho pruebas específicas de la nueva perspectiva: valores por defecto, movimiento cardinal y diagonal, esquiva, paredes, apuntado, consumo/recarga, melee, proyectil mutante, guardado, quince mapas, puertas, cobertura e inclinación.

El navegador comprueba ajuste/persistencia, cambio de vista en pausa sin alterar recursos, captura permitida y alternativa rechazada, foco, ventanas, recorrido del prólogo y reloj, captura obligatoria y primera huida hasta inyectarse. Se preparan enemigos para comprobar siete armas, proyectiles, costes, recarga y píxeles de oclusión. Se preparan doce formas de jefes y se comparan avisos con recuperación. Los escenarios adicionales aíslan marcas, ondas, crías, charcos, veneno, poderes, escondite, caída y los dos epílogos con helicóptero/cuerda/disparos. El HTML integrado comprueba que el modo POV y la vuelta al clásico estén incluidos.

La revisión v0.16.1 repite motor, integración, quince mapas y cinco grupos de navegador (165 comprobaciones). Añade catorce comprobaciones enfocadas con eventos reales de ratón/flechas y comparación de píxeles a través de dos puertas: estancia desconocida visible, puerta cerrada oculta, plano sin descubrir y máscara clásica conservada. La ejecución de los otros grupos completos de campaña corresponde al historial v0.16.0.

Los recorridos geométricos retiran enemigos normales para aislar movimiento y requisitos. Las presentaciones de formas y epílogos usan estados preparados; no son victorias adicionales. Los combates clásicos independientes conservan IA, movimiento y recursos finitos. El controlador automatizado de la Matriarca fija la semilla aleatoria 369 y la restaura al terminar, para repetir exactamente el ensayo sin cambiar la aleatoriedad del juego normal. Una ejecución previa sin semilla agotó su munición; no se alteró la dificultad ni se concedieron recursos durante las pruebas.

No se ha jugado toda la campaña en primera persona con una única provisión natural de recursos ni se ha medido dificultad humana. Las cifras de render en Chromium headless son diagnósticas, no una garantía de FPS en todos los dispositivos. Chromium administrado bloquea file://; el HTML autocontenido se prueba por HTTP sin descargas externas.
