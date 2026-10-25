# Animaciones y presión de combate · v0.22.0

## Primera persona

`pov-enemy-motion.js` anima las mallas existentes. La marcha usa distancia recorrida, con caderas, rodillas, hombros y transferencia de peso. El reposo tiene respiración, movimientos de cabeza y pequeñas variaciones por criatura. Los ciegos ladean la cabeza y tantean con los brazos; los cuerpos pesados tienen una zancada más lenta. Mandíbulas, cola de rata, ocho rodillas y colmillos de araña añaden articulaciones propias.

Preparación, ejecución, seguimiento y recuperación usan el estado y el reloj del ataque real. El reinicio del reloj identifica cortes sucesivos de un combo. Hay reacción a impactos y espasmos de mutación. En techos bajos los cortes se preparan al costado y las mallas mantienen holgura para la animación. Pausa y congelación mantienen la pose. Los datos visuales viven en la malla, sin modificar posición, daño, radio, temporizadores de IA ni guardado. Topdown no ejecuta estas animaciones.

## Jefes en ambas perspectivas

No aumenta su vida ni sus premios de XP. Los cuatro encuentros principales mantienen las tres fases y sus barreras de mutación.

- A menos de 112 unidades, la selección de ataque puede responder con corte del Carnicero, garra de la Matriarca, espada/martillo del Regente o cadena/golpe de Wren. Carnicero y Matriarca alternan esa respuesta con su secuencia para conservar variedad.
- Preparaciones un 7 % más rápidas, o un 12 % en tercera fase, con aviso mínimo de 0,6 segundos. La dirección de cada ataque se compromete durante el aviso; un corte posterior del combo puede adquirir una dirección nueva.
- Recuperaciones normales un 20 % más breves. Los choques conservan una ventana mayor y los peligros persistentes mantienen su duración. Las pausas de tres segundos o más, incluidas las de reanudación, se conservan completas.
- Los golpes principales de los cuatro jefes hacen aproximadamente un 10–17 % más daño base. Conservan las defensas y mejoras del jugador.
- Contra jefes, el puño aplica un factor de 0,38, o 0,65 si están recuperándose. La cuchilla aplica 0,72, o 1 durante su recuperación. Estos factores se aplican antes de armadura y vulnerabilidad propias. El golpe a enemigos normales, costes, árbol y armas conservan sus valores.
- El Repetidor y el Custodio S-4 recuperan antes entre ataques y acortan su preparación; el Tallador tarda menos en recuperar tras el corte. Mantienen sus condiciones de adquisición y comportamiento ciego.

## Carnicero perseguidor

Camina a 158 unidades/s y presiona de cerca a 184, frente a 132/150 anteriormente. El sprint base del jugador sigue siendo 215. Su corte tiene 0,48 segundos de aviso, adelanta el cuerpo en la primera parte y mantiene la dirección al resolver el arco.

Entre 140 y 310 unidades, con visión y espacio libre, puede preparar una carga recta durante 0,7 s. Recorre hasta 165 unidades a 330 unidades/s; no gira durante la carga. Su pausa entre cargas es de 6,5 s. El corredor tiene una señal en el suelo en ambas perspectivas. Una pared o el límite de un refugio detienen el avance; cada carga solo conecta una vez. Ocultación, investigación de ruido y pérdida visual conservan sus reglas. Si se cierra la página durante la carga, reanudar conserva la posición y el enfriamiento y deja al menos un segundo de recuperación antes de volver a atacar.

Los impactos solo provocan un freno breve cada 1,6 s y no cancelan una preparación de ataque, evitando inmovilizarlo con golpes repetidos. El sonido de metal cercano se oye con más presencia. La huida inicial usa el 93 % de su velocidad original de persecución en lugar del 55 %; exige correr, conserva ventaja para el sprint y mantiene el golpe de la puerta, amputación y llegada al vestíbulo guionizados. La carga nueva no aparece en ese tutorial.

## Verificación

La suite de motor comprueba el golpe real en ambos POV, sus costes y diferencias entre puño/cuchilla; respuestas cercanas; avisos evitables; pérdidas al perseguir a los jefes a puro puño sin esquivar; carga con colisión continua; refugios, resistencia al bloqueo y puerta inicial. Los rigs se prueban con todas las especies y fases, sin mutar entidades ni crear mallas por frame.

El navegador verifica articulaciones, estados, pausa/congelación, topdown, avisos 3D y altura del techo. Las suites de campaña utilizan IA y recursos finitos para comprobar que los cuatro combates siguen siendo ganables, además de carga de victoria y salidas. Son escenarios y controladores preparados que conocen peligros; no sustituyen una partida humana ni garantizan un nivel de dificultad universal. Los recuentos y resultados finales están en [VALIDACION.md](VALIDACION.md) y [RESULTADOS.json](RESULTADOS.json).
