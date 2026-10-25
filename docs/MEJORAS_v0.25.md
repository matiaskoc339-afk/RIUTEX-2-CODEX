# Revisión general · v0.25.0

La revisión mejora el combate, la exploración, la presentación y la sesión web de las cuatro fases. Conserva los recorridos, los puzles, las elecciones doradas, la economía de EXP y los dos finales. La huida inicial mantiene el golpe obligatorio de la puerta y los brazos gruesos de v0.24.0.

## Combate y recursos

Los infectados comunes mantienen la dirección anunciada al preparar golpes y ráfagas. Un corte no atraviesa una puerta cerrada durante la preparación. Esquivar un contacto evita también su veneno; los charcos y el agua contaminada siguen siendo peligros ambientales. Al reanudar, los infectados respetan la tregua y vuelven a anunciar su ataque.

Las explosiones comprueban paredes y puertas para dañar o encadenar barriles. Las cadenas avanzan con el juego y se congelan en pausa. Una explosión pendiente no puede afectar a otra planta después de cambiar de mapa.

Las recargas conservan identidad y duración: cambiar de arma las cancela sin transferir balas al cargador equivocado. El bono dorado exige que haya entrado munición. El HUD indica el esfuerzo por disparo y el progreso de recarga. No se reduce el coste de las armas ni la resistencia de los jefes.

## Poderes e imagen

El nuevo indicador muestra teclas, costes reales, recuperación y condiciones como falta de Riutex, estamina o sombra. La habilidad seleccionada tiene prioridad; se muestran hasta cinco para dejar espacio a la acción. El resto sigue disponible en Adaptación. El indicador respeta catalizador, sobrecarga, curación y las teclas asignadas.

**Opciones / Pausa → Imagen y comodidad** permite ajustar campo de visión POV (60–85°, vertical), calidad 3D, escala de indicadores (85–120 %), balanceo y sacudidas. Los valores iniciales conservan la presentación previa. Ligera limita la resolución a DPR 1 y sombras de 768; Equilibrada a 1,25 / 1024; Alta a 1,5 / 1536, siempre respetando el DPR del dispositivo. La calidad no modifica colisiones, IA ni alcance. La reducción de movimiento puede activarse también desde pausa y el volumen cambiado allí se conserva.

La altura del balanceo se comparte con el origen del disparo. Cambiar FOV no gira la mira ni altera la sensibilidad. Los paneles liberan el cursor y regresar al juego utiliza el sistema de captura automática existente.

## Expediente y orientación

Los documentos recuperados pueden buscarse por título, contenido y procedencia, con búsqueda sin tildes, filtro «Sin leer» y navegación entre resultados. Los membretes distinguen mansión, hospital, fábrica, museo y laboratorio. Las pistas y los textos de historia conservan su contenido.

El inventario permite equipar el arma seleccionada y consultar cargador, reserva y esfuerzo real. El mapa cuenta conexiones y recursos observados, identifica bancos de mejoras y permite navegar con teclado. Los servicios y las pistas pendientes no se revelan al buscar.

## Mundo en primera persona

Las puertas llevan rótulos físicos con nombres de recintos. Las luces locales respetan muros y puertas y conservan su identidad al moverse. La niebla distingue regiones. La arquitectura se divide en sectores; suelo y techo utilizan caras interiores planas a las mismas alturas, conservando profundidad y continuidad. Al cambiar de mapa se liberan los recursos propios del anterior.

En cuatro cámaras de entrada preparadas se enviaron entre un 70 % y un 83 % menos de triángulos que en v0.24.0. La sectorización también modifica las llamadas de dibujo: esta cifra no demuestra un aumento de FPS. Las pruebas usan Chromium y SwiftShader, no una GPU física. La vista clásica conserva su arquitectura y su oscuridad de exploración.

## Sonido y sesión

Armas, explosiones y recargas tienen sonidos diferenciados. Los pasos responden a madera, piedra, metal, agua o baldosa y exigen desplazamiento real. Las zonas tienen ambiente propio, más tenue en refugios y silenciado en pausa. La mezcla limita las voces y libera los nodos terminados; no añade fuentes de ruido a la IA ni destellos de disparo.

La sesión web conserva los barriles destruidos y las cadenas pendientes de la planta actual. Una cadena restaurada dispone de al menos un segundo antes de detonar. La extensión es opcional y conserva la lectura de sesiones antiguas. Las camillas y los cambios de planta mantienen su comportamiento anterior; no se promete memoria global de todos los barriles. Los proyectiles y charcos transitorios siguen limpiándose al reanudar para evitar impactos invisibles.

## Comprobación y entrega

`npm test` comprueba motor, integración, mapas y navegación. `npm run test:browser` recorre los escenarios preparados de campaña, puzles, los cuatro jefes, ambos finales, interfaz, captura, WebGL, sonido, persistencia y HTML integrado. El resumen de la ejecución actual figura en [RESULTADOS.json](RESULTADOS.json) y [VALIDACION.md](VALIDACION.md).

`npm run build` integra todos los estilos y scripts declarados en `index.html`, sus recursos locales y la licencia de Three.js. `python3 scripts/package.py --out /workspace/output` crea el HTML, el ZIP de itch.io y el código fuente; comprueba cada entrada y escribe un manifiesto con commit y hashes. Las pruebas automatizadas no sustituyen una campaña completa jugada por una persona ni prueban la publicación en el dominio real de itch.io.
