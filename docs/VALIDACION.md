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
