# Recursos

`blue-hospital.svg`: ilustración vectorial original creada para el menú de esta ampliación. Los personajes, enemigos, mobiliario y efectos se dibujan con Canvas 2D; el audio se sintetiza con WebAudio. No se necesitan descargas, fuentes remotas ni imágenes de terceros para jugar.

`fonts/Rajdhani-Medium.ttf` y `fonts/Rajdhani-SemiBold.ttf`: fuentes Rajdhani, de Indian Type Foundry, distribuidas bajo SIL Open Font License 1.1. La licencia completa está en `fonts/OFL.txt`. Se incluyen localmente y se integran en el HTML; no hay peticiones a servicios de fuentes. Fuente: https://github.com/google/fonts/tree/main/ofl/rajdhani

Las siluetas del HUD de armas se dibujan con SVG original integrado en `js/adventure.js`. Las piezas, guías, espejos y haces de los nuevos mecanismos también se generan localmente con HTML/SVG.

Los iconos de objetos, artefactos y materiales, la cartografía y los detalles físicos de adaptación se dibujan con SVG y Canvas originales en `js/fielddesk.js`. Las texturas del papel se generan con CSS local; no añaden imágenes externas.

El generador auxiliar, los discos de sello, el enfoque y el banco de armas usan interfaces locales en `js/workshop.js` y `survival.css`. C-17 se dibuja con Canvas y sus avisos se generan durante el juego. No se añaden recursos externos.

`perspective-pov.webp` y `perspective-topdown.webp`: capturas originales de las dos perspectivas del propio juego, generadas con `tests/generate_perspective_previews.py`. Se muestran en las tarjetas de Nueva partida y se integran como datos en el CSS del HTML de itch.io. No requieren red ni una segunda escena WebGL.
