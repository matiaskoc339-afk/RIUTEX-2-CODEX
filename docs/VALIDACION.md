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
