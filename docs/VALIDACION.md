# Validación de v0.23.0 · Elección y cámara POV

- **377 pruebas de motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- **141 comprobaciones de navegador**: elección 20, WebGL 52, captura nativa 26, HTML integrado 17 y persistencia 26. Sin errores JavaScript.
- Nueva partida muestra dos tarjetas con capturas locales antes de crear al jugador. Se prueban cancelación, foco y flechas/Tab/Enter, clics, preferencia previa, fundido real y captura nativa. Continuar conserva partida y perspectiva sin repetir la elección. Esperar en la ventana no sobrescribe la sesión.
- Se revisa el diseño a 1440, 1280 y 390 píxeles. En 720p se ven ambas tarjetas, aviso y regreso; en pantalla estrecha se apilan sin desbordamiento horizontal.
- Balanceo con física real de movimiento: amplitud acotada, sprint, centrado al parar, pausa y reducción de movimiento. Empujar una pared o estar oculto no produce pasos. El eje de visión conserva su dirección y el ojo de cámara coincide con la altura del disparo.
- La vista clásica, las quince escenas, geometría y manos siguen pasando. El guardado se recupera tras cerrar/reabrir el perfil y en iframe local de otro origen. El HTML final y el ZIP integran ambas imágenes, scripts, estilos y fuentes, sin solicitudes externas.

Los recorridos son escenarios preparados con WebGL mediante SwiftShader; no miden una campaña humana ni FPS de una GPU física. La prueba de iframe usa orígenes locales y no publica el juego en itch.io. [Diseño y comportamiento](ELEGIR_PERSPECTIVA.md).

---

# Validación de v0.22.0 · Animaciones y presión de jefes

- **370 pruebas de motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- **402 comprobaciones de navegador**: hospital/final 38, fábrica 61, colonia 29, castillo 76, laboratorio/finales 63, WebGL 52, captura nativa 26, HTML integrado 17, persistencia 26 y animación 14. Sin errores JavaScript.
- El golpe real contra jefes se prueba en ambos modos, con costes y diferencias de puño/cuchilla. Perseguirlos a puro puño sin esquivar pierde antes de superar la primera fase. Los avisos permiten salir del arco; las pausas de reanudación y peligros persistentes conservan su duración.
- Los controladores de combate vencen al Carnicero, Matriarca, Regente y Wren con IA activa y recursos finitos. También se comprueban el Custodio del traje y la arena de ocho oleadas. Las victorias y las salidas se conservan al cargar.
- La carga del perseguidor se anuncia, mantiene dirección, usa colisión continua, conecta una vez y se detiene ante paredes y refugios. Cerrar durante una carga conserva posición y enfriamiento al reanudar, con pausa de seguridad. Las pruebas conservan ocultación, investigación, puerta inicial y amputación guionizada. El estrés de navegación vuelve a pasar en las tres plantas.
- Las articulaciones distinguen reposo, marcha, preparación, golpe, recuperación e impactos. Pausa y congelación detienen la pose; repetir un frame no acumula inclinación. Todas las especies y fases tienen matrices finitas; no se modifican entidades ni se crean mallas por frame. Se comprueba holgura de techo para doce mutaciones animadas.
- El HTML integrado incluye todos los recursos y su `index.html` coincide con el ZIP de itch.io. Guardado probado al cerrar/reabrir el perfil y en un iframe local de otro origen.

Los combates automatizados utilizan escenarios preparados y controladores que conocen los peligros; verifican que se puede vencer, no que la dificultad sea idéntica para todas las personas. WebGL usa SwiftShader y no mide FPS de una GPU física. La prueba local de iframe no publica el juego en itch.io. [Detalle de los cambios](COMBATE_ANIMACIONES.md).

---

# Validación de v0.21.0 · Personajes y brazos en POV

- **353 pruebas de motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- **121 comprobaciones de navegador**: WebGL 52, captura nativa 26, HTML integrado 17 y persistencia 26. Sin errores JavaScript ni geometrías no finitas.
- Las 43 especies usan la nueva dirección visual con superficies biseladas, materiales de píxel y filtrado nearest. No conservan piezas esféricas. Los materiales de escenario y mobiliario mantienen su estado anterior.
- Se generan las doce formas de los cuatro jefes; sus fases cambian volumen y detalle. Crear las mallas no modifica salud, radio, posición, fase ni definiciones de combate. Se comprueban respiración, articulaciones y movimientos.
- Las manos conservan dos brazos como máximo, golpe sobre el brazo existente, infección azul y estados de amputación y cura. Se prueban siete armas, oclusión, techo físico, puertas operadas con E, fundidos y regreso a topdown.
- El HTML final contiene todos los recursos y se ejecuta sin peticiones externas. El guardado se recupera al cerrar y reabrir el mismo perfil, también en un iframe local de otro origen.

La galería visual usa luz de estudio y poses preparadas para revisar las formas. Las capturas dentro del hospital usan la iluminación del juego. El contexto WebGL real se ejecuta mediante SwiftShader; estas pruebas no representan una campaña humana ni una garantía de FPS en GPU física. Los resultados anteriores quedan como historial.

---

# Validación de v0.20.1 · Disparos, recogibles y fábrica

- **350 pruebas de motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- **213 comprobaciones de navegador**: captura nativa 26, WebGL 49, fábrica 61, XP 34, persistencia 26 y HTML integrado 17. Sin errores JavaScript.
- La captura se recupera con una tecla de desplazamiento después de un rechazo asíncrono, sin pulsar Bloquear ratón. Perder el foco pausa; Reanudar vuelve a capturar. Los menús liberan y recuperan el cursor.
- El render no incorpora luces de destello ni intensifica la linterna al disparar. Los recogibles tienen señal 3D con profundidad que desaparece al recoger; se revisan capturas en POV y topdown. La escena mantiene armas y retroceso.
- Se verifican los 16 enemigos adicionales en suelo accesible fuera del refugio, cuatro patrullas con movimiento y colisiones, transición a persecución, ausencia de respawn al cargar y XP por baja pequeña. La ruta de tres válvulas y la arena de ocho oleadas vuelven a pasar.
- El HTML integrado incluye todos los scripts y se ejecuta sin solicitudes externas; su index.html es idéntico al del ZIP de itch.io. Guardado probado al cerrar/reabrir el mismo perfil y en un iframe local de otro origen.

Los recorridos y combates son escenarios preparados; no representan una campaña humana completa ni una medición de GPU física. Los resultados anteriores se conservan como historial.

---

# Validación de v0.20.0 · Escena WebGL, control y archivo

El render POV usa mallas Three.js para criaturas, recogibles, puertas, techos y armas, con materiales físicos, profundidad y sombras. La captura del ratón se coordina con las ventanas y ambos ejes comparten ganancia angular. Los cambios generales retiran artefactos agotados y añaden 24 documentos narrativos.

La ejecución consolidada en `RESULTADOS.json` registra **345 pruebas de motor**, **103 comprobaciones de integración**, **15 mapas** y **434 comprobaciones de navegador** en once grupos, sin fallos. Los nuevos grupos de motor cubren captura, anatomía y armas 3D, disparos con altura y artefactos/lore. En navegador: WebGL 46, captura nativa 22, artefactos/lore 13, persistencia 26, XP 34, supervivencia 38, fábrica 61, castillo 76, final hospital 38, laboratorio/finales 63 y HTML integrado 17. El presupuesto de XP se ha recalculado desde los mapas: 716 XP en los ocho mapas principales, con 25 en la mansión. Los premios por fuente conservan su valor.

La revisión gráfica renderiza los 15 mapas, 43 especies y 12 fases de jefes sin geometrías no finitas ni errores JavaScript. Comprueba puertas operadas con E y detección al abrirlas, techos sólidos, oclusión, escaleras con flecha física, cadáveres/eco/cadenas, siete armas, infección/amputación/cura, mira centrada a ±1,4 radianes, fundidos con captura 3D y retorno a topdown. La revisión visual usa escenas preparadas y un contexto WebGL real de Chromium con render por software. Comprueba la integración gráfica y errores de ejecución; no mide una campaña humana completa ni garantiza FPS en otro equipo. Las pruebas del render antiguo que comparaban imágenes frontales no se consideran pruebas de las mallas nuevas. El paquete autocontenido incluye Three.js local y se prueba por HTTP sin solicitudes de recursos externos. La prueba local de iframe no publica el juego en un dominio real de itch.io.

Las cifras y combates de las versiones anteriores se conservan a continuación como historial.

---

# Validación de v0.19.0 · Guardado web y cuerpo POV

- **305 pruebas de motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- **17 pruebas de persistencia**: espacios y Reintentar separados, recursos sin curación, estados de quince mapas, fase y salud de los cuatro jefes, prólogo y persecución, documentos y bajas sin duplicar, recarga del FL-4, cuota agotada, almacenamiento bloqueado, copias, Unicode, compresión y JSON antiguo.
- **11 pruebas de visión y cuerpo POV**: puerta cerrada/abierta sin visitar sala, alcance y frente, proximidad, muebles y paredes, reacción y pérdida visual, ciegos, camuflaje, dos brazos, golpe e historia de infección/cura.
- **214 comprobaciones de navegador en seis grupos**: persistencia 26, visión/armas 16, regresión POV 83, HTML integrado 17, supervivencia/camillas 38 y XP 34. Sin errores JavaScript.
- El HTML integrado se ejecuta dentro de un iframe real con sandbox desde otro origen local. Se cierra normalmente la pestaña y el proceso de Chromium y se vuelve a abrir el mismo perfil. Se conservan posición, recursos, documento, arma y enemigo herido en topdown y POV. El escenario bloqueado descarga e importa una copia mediante los controles reales.
- Presupuesto preparado de **53.114 casillas exploradas** en quince mapas, tres espacios, Reintentar, legado y dos copias de sesión: aproximadamente **1,4 MB comprimidos**, frente a **8 MB** sin comprimir, bajo una cuota simulada de **5 MiB** contando UTF-16. Se mantiene la lectura del JSON anterior.
- Se revisa una galería de siete armas, el golpe, el brazo perdido y ambos desenlaces. No se añade una mano al golpear; la paleta azul corresponde con la infección.
- ZIP de itch.io: un `index.html` integrado en la raíz, idéntico al HTML probado. El paquete de fuentes incluye registros y se coteja byte a byte.

Las pruebas de mapas, combate y presupuesto preparan estados para aislar cada comportamiento. No son una campaña humana completa ni una garantía de dificultad o rendimiento en cualquier equipo. El iframe usa dos puertos locales diferentes: no se publica ni se prueba un dominio real de itch.io. La persistencia se verifica para un cierre normal, no para un cierre forzado del sistema. Los datos pertenecen al mismo navegador y origen; las copias descargables permiten conservarlos fuera del almacenamiento del sitio. El HTML se prueba por HTTP porque el Chromium administrado bloquea file://.

---

# Validación de v0.18.1 · Tres fuentes de XP

Solo conceden XP las bajas, los documentos nuevos (2) y las muestras consumidas (15). Se retiran los premios de salas, puzles, equipo, campanas, maletín de la arena, ingredientes y primera inyección obligatoria. Los mecanismos y sus recompensas materiales siguen funcionando.

- Motor: **277 pruebas**, **103 comprobaciones de integración** y **15 mapas**, sin fallos. El ajuste final de la prueba de inyección se vuelve a ejecutar dentro de las **14 pruebas específicas de XP**, todas correctas.
- Los puzles existentes del hospital, fábrica, traje, armas, castillo y laboratorio comprueban sus recompensas sin sumar XP. También se comprueban campanas y maletín de la arena sin premio adicional.
- Navegador: **75 comprobaciones en 3 grupos**: fuentes de XP/HUD/guardado **34**, prólogo y hospital **24**, HTML integrado **17**. Sin errores JavaScript ni solicitudes externas del HTML integrado.
- El navegador consume una muestra mediante el botón real del árbol, que anuncia +15 EXP; resuelve un puzle por sus botones sin cobrar XP. Se repite en ambas perspectivas, junto con documentos y guardado/carga.
- El recorrido inicial usa la XP de dos documentos para comprar Vigor; caminar y resolver el reloj no regalan experiencia.
- Presupuesto finito de ocho mapas: **670 XP** de bajas normales, documentos únicos y muestras colocadas, sin incluir jefes, oleadas ni la muestra EEG. Las pruebas compran por separado rutas avanzadas humana de **310 XP / 24 nodos** y mutante de **348 XP / 27 nodos** con requisitos reales.

Las muertes preparadas de jefes aíslan sus recompensas y no equivalen a victorias adicionales. El presupuesto exige obtener todo lo contado; no mide una primera partida humana ni una campaña completa con recursos naturales. Los combates y grupos antiguos se conservan como historial debajo y en RESULTADOS.json. El HTML se prueba por HTTP: el Chromium administrado bloquea file:// y ese acceso no se cuenta como validado.

---

# Validación de v0.18.0 · Progresión de XP

Las nuevas bajas de RIUTEX 2 dan cantidades pequeñas y predecibles según peligrosidad, zona y condición de jefe. Se elimina el multiplicador ×2,5. Cada muerte de un enemigo común solo procesa sus recompensas una vez, aunque vuelva a recibir daño.

- Motor repetido: **273 pruebas**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- Diez pruebas específicas de XP cubren presupuestos de ocho mapas, jerarquía de encuentros, bajas reales en ambas perspectivas, duplicación, tres fases del Carnicero, compras, guardado, exploración, crías y cálculo clásico de RIUTEX 1.
- Navegador repetido: **77 comprobaciones en 3 grupos**: XP/HUD/encuentros preparados/compra y guardado 22, supervivencia y armero 38, HTML integrado 17. Sin errores JavaScript.
- Las primeras plantas reducen la XP de sus enemigos colocados un 83–84 % frente a la media anterior; los mapas avanzados un 63–78 %. Se conservan los premios de explorar, documentos, muestras, puzles y misiones, además de los costes del árbol y el progreso existente.
- Presupuesto numérico: `PROGRESION_XP.md`, `RESULTADOS.json` y los registros incluidos en el ZIP. El paquete se coteja byte a byte con las fuentes y el HTML.

Los escenarios de recompensa de jefes preparan la muerte para aislar el premio y no equivalen a victorias adicionales. No se volvió a recorrer toda la campaña con una única provisión natural de recursos ni se midió dificultad humana. Las validaciones anteriores se conservan debajo como historial.

---

# Validación de v0.17.2 · Recorrido vertical ampliado

El límite vertical pasa de ±0,28 a ±1,4 en el desplazamiento visual del renderer: cinco veces más recorrido para mirar techo y suelo, mediante ratón o flechas. La sensibilidad y velocidad anteriores se conservan. No son grados de rotación; la representación mantiene la proyección del motor POV existente.

- Motor repetido: **263 pruebas**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- Navegador repetido: **102 comprobaciones en 5 grupos**: recorrido vertical 42, mirada/visibilidad 14, sensibilidad 14, captura 15 y HTML integrado 17.
- El arrastre real supera el límite anterior y alcanza ambos extremos. La dirección contraria responde inmediatamente; flechas y sensibilidades 25/250 % conservan todo el recorrido. Se verifican retícula centrada, recursos intactos y los quince mapas en ambos extremos sin errores JavaScript.
- Las otras validaciones se conservan debajo como historial; no se repitieron todos los combates de campaña para este ajuste de cámara.

---

# Validación de v0.17.1 · Sensibilidad del ratón

La barra nativa de Opciones y Pausa controla ambos ejes del ratón en POV de 25 % a 250 %, en pasos de 5 %. El valor predeterminado de 100 % conserva el ajuste anterior. Se guarda por navegador y las dos ventanas se sincronizan. Los ajustes antiguos reciben el valor normal; valores guardados inválidos se normalizan.

- Motor repetido: **263 pruebas**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- Navegador repetido: **87 comprobaciones en 4 grupos**: sensibilidad 14, captura 15, presentación/fundidos 41 y HTML integrado 17.
- Un arrastre real idéntico produce diez veces el giro y la inclinación a 250 % que a 25 %. Se verifican persistencia, control con teclado, pausa a 720p y ausencia de disparos o gasto de recursos.
- Las demás validaciones, incluidas las de modelos y campaña, se conservan debajo como historial.

---

# Validación de v0.17.0 · Criaturas, objetos y mira POV

La revisión diferencia treinta identidades, incluyendo a los enemigos comunes, los encuentros opcionales y los jefes. Se corrige la caché que confundía Carnicero/Vacío y C-17/Camillero. Los objetos sueltos se distinguen por función y arma/pieza concreta; la mira permanece centrada al inclinar la cámara.

- Motor: **263 pruebas**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- Navegador repetido: **232 comprobaciones en 7 grupos**: modelos/objetos/mira 52, controles y recorrido POV 83, efectos/epílogos 33, horror clásico 18, mirada/visibilidad 14, captura del ratón 15 y HTML integrado 17.
- Las treinta familias tienen imágenes y máscaras de silueta distintas. Los cuatro jefes finales tienen tres dibujos de fase cada uno. Se inspeccionan treinta y seis muestras de objetos y cinco objetos sobre el suelo del hospital.
- La retícula dibuja su centro real en el centro del canvas para inclinación negativa, neutra y positiva. La cámara sigue inclinándose.
- Paneles y escenas de revisión incluidos en la entrega. El empaquetador verifica scripts y ZIP byte a byte.

No se repitieron los combates completos de toda la campaña para este cambio de presentación. Sus validaciones anteriores permanecen abajo como historial. Los paneles y las fases preparadas no representan victorias ni una medición de dificultad humana.

---

# Validación de v0.16.2 · Botón Bloquear ratón

Botón visible durante la partida en POV cuando el cursor está libre. Un clic captura la mirada sin disparar ni consumir recursos. Esc libera el cursor y pausa; reanudar vuelve a mostrar el botón. Si el navegador rechaza la captura, se conserva la alternativa y el botón permite reintentar. La vista clásica no muestra el botón.

- Motor, integración y mapas repetidos: **263 pruebas**, **103 comprobaciones** y **15 mapas**, sin fallos.
- Navegador repetido: **129 comprobaciones en 4 grupos**: botón/captura 15, controles y recorrido POV 83, mirada/visibilidad 14 y HTML integrado 17. Sin errores JavaScript.
- Los demás grupos se conservan como historial; no se repitió la campaña completa para este cambio de interfaz.

---

# Validación de v0.16.1 · Ajuste de cámara y visibilidad POV

Solo en primera persona se elimina la máscara de estancias sin visitar. El mundo visible sigue limitado por paredes, puertas cerradas y cobertura. El mapa conserva el descubrimiento al entrar; la vista clásica mantiene su oscuridad de exploración. Ratón y flechas tienen mirada vertical normal.

- `npm test`: **263 pruebas del motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- Navegador repetido para esta revisión: **165 comprobaciones en 5 grupos**, sin errores JavaScript: ajuste enfocado 14, POV 83, efectos/epílogos 33, sistemas clásicos de horror 18 y HTML integrado 17.
- En los dos umbrales reales comprobados, el enemigo añade más de 14 700 píxeles por la puerta abierta y ninguno al cerrarla, aunque la sala no figure como visitada. El plano sigue sin descubrirla y el mismo punto vuelve a negro al pasar a topdown.
- Eventos reales de arrastre y flechas comprueban que mirar arriba baja un punto fijo en pantalla y mirar abajo lo sube; el giro horizontal no cambia.
- El HTML integrado contiene los scripts actuales y no solicita recursos externos. El ZIP se coteja byte a byte.

No se repitieron los otros grupos de combate y recorrido de la campaña en este parche: su ejecución completa v0.16.0 se conserva abajo y en `RESULTADOS.json` como historial. Las escenas de prueba preparadas no miden dificultad humana.

---

# Validación de v0.16.0 · Primera Persona POV

La perspectiva es opcional y comienza desactivada. Se cambia en Opciones o Pausa; guarda su preferencia separada del progreso. La vista clásica conserva sus controles y render anteriores.

## Resultados actuales

- `npm test`: **263 pruebas del motor**, **103 comprobaciones de integración** y **15 mapas**, sin fallos.
- `npm run test:browser`: **691 comprobaciones en 22 grupos**, sin errores JavaScript.
- POV: **18 pruebas del motor**, **83 comprobaciones de controles/recorrido/render** y **33 de efectos y epílogos**.
- HTML integrado: **17 comprobaciones**, incluyendo primera persona y regreso al clásico desde pausa. Sin solicitudes de recursos externos.
- El empaquetador coteja scripts actuales con el HTML y verifica byte a byte los archivos del ZIP.

## Primera persona

Se comprobaron valor predeterminado, persistencia, ambos ajustes, cambio durante pausa sin alterar recursos, movimiento cardinal/diagonal y esquiva relativos, colisiones y mismo vector de disparo. Captura de ratón permitida, captura rechazada con alternativa de arrastre, clic de adquisición sin disparo, pérdida de foco, Escape y ventanas sin recaptura ni disparo involuntarios.

El prólogo y la primera huida se recorren usando movimiento, puertas y colisiones: biblioteca, llave, reloj, frasco, primer Custodio visible, captura obligatoria, despertar sin equipo, golpe que abre la puerta, señal relativa a la cámara, vestíbulo, tutorial e inyección. El escuadrón conserva cuerpos propios. Se retiran enemigos normales para aislar esta geometría, no para medir supervivencia.

Se preparan enemigos para comprobar siete armas (M9, M12, UZI, AK, R-98, FL-4 y GL-6), costes reales, daño/proyectiles y recarga. La comparación de framebuffer confirma que el enemigo tras una pared no añade píxeles, y sí aparece al retirar la pared. Se cargan quince mapas y se presentan las tres formas de los cuatro jefes finales, comparando avisos contra recuperación; no se cuentan como victorias nuevas.

Un grupo independiente compara los píxeles de los avisos originales de Wren con ellos desactivados, marcas, ondas, veneno, salto de la Matriarca, capullos antes de crías, residuos y estado de envenenamiento. Comprueba poderes y consumo Riutex, señuelo, escondite, caída con movimiento bloqueado y llegada a la rejilla. Las dos decisiones finales se preparan tras una victoria; el helicóptero se ve, la cuerda aparece solo en la extracción humana y el final mutante presenta disparos y pérdida de salud. Ambos llegan a sus pantallas finales.

El HTML autocontenido abre POV en UMBRAL, incluye sus materiales y controles, y permite desactivarlo desde pausa. Las ventanas de documentos, mapa, inventario, puzles y árbol siguen conectadas.

## Vista clásica y repetibilidad

Se repitieron los veinte grupos anteriores de la campaña completa. Incluyen rutas, ambos pisos, fabricación, mejoras, refugios, ruido/IA, jefes y desenlaces. Las fuentes del juego no cambian daño, recursos, requisitos ni IA por activar la perspectiva.

La primera ejecución sin semilla del controlador automatizado de la Matriarca agotó su munición. Una ejecución diagnóstica sin cambios de juego logró la victoria. Se fijó la semilla 369 dentro de ese controlador de prueba y se restaura Math.random al salir: las pruebas ahora repiten los mismos tiros y decisiones, manteniendo los recursos finitos. Se conserva el registro diagnóstico. No se debilitó al jefe ni se añadieron recursos durante el combate.

## Alcance y límites

La simulación sigue siendo la del juego original en dos dimensiones. POV representa paredes con profundidad y actores frontales; la inclinación es visual, con la retícula en el plano de combate. No añade saltos ni daño localizado por altura.

Los combates automatizados usan recursos preparados y conocen posiciones y avisos. Los estados preparados de mutaciones/efectos no equivalen a victorias adicionales. No se ha completado toda la campaña en POV con una única provisión natural ni se ha medido dificultad humana. Las métricas headless no garantizan FPS para todos los dispositivos.

Chromium administrado bloquea file:// con ERR_BLOCKED_BY_ADMINISTRATOR; ese intento no se cuenta como superado. El HTML se comprobó por HTTP sin recursos externos. Los guardados dependen del origen/ubicación del navegador.

Detalles técnicos y controles: PRIMERA_PERSONA.md. Las validaciones anteriores se conservan como historial.
