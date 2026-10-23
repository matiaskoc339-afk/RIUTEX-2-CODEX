# Cuerpo y percepción POV · v0.19.0

## Percepción

El alcance visual habitual queda entre 260 y 360 px por especie, con un frente de unos 135 grados. A distancia intermedia la periferia se amplía y a menos de 96 px reconocen al jugador aunque no mirasen exactamente en su dirección. La reacción necesita aproximadamente 0,08–0,18 s de visibilidad continua. Los latentes conservan su despertar cercano.

Las paredes, puertas cerradas y muebles altos siguen ocultando. El chequeo POV distingue los muebles bajos de una pared completa y permite ver por encima. Abrir una puerta permite adquirir al jugador sin depender del descubrimiento del mapa o de que haya entrado en la habitación. La memoria visual común dura 2,5 s al perder contacto; las especies con IA de investigación conservan su memoria y sonidos propios.

El rastreador ciego y el Tallador no obtienen visión. Esconderse, el camuflaje y los refugios siguen funcionando. Los encuentros obligatorios y las arenas de jefes conservan sus reglas. La perspectiva clásica utiliza sus reglas anteriores.

## Dos brazos

El nuevo rig contiene como máximo una mano izquierda y una derecha, conectadas a antebrazos con volumen. Las palmas, dedos y arma se dibujan en capas para representar el agarre; no son manos adicionales.

El golpe desplaza el brazo izquierdo ya existente mientras la mano derecha baja el arma. La cuchilla y las transformaciones nacen de esos mismos brazos. No se dibuja una tercera mano durante la animación.

- En el prólogo se mantiene piel humana.
- Después de consumir Riutex, el tejido del brazo regenerado se vuelve azul y aparecen venas del compuesto.
- Mientras falta el brazo, se muestra solo la mano derecha y un muñón vendado.
- La cura elimina el azul, las garras y el brazo regenerado.
- El desenlace mutante transforma ambos brazos existentes.

## Armas

M9, M12, UZI, AK, R-98, FL-4 y GL-6 usan cuerpos de perspectiva con caras y cañones proyectados, biseles, miras, cargadores, empuñaduras y detalles diferenciados. Las manos siguen los puntos de agarre. Hay balanceo, retroceso y descenso de recarga; el disparo y los costes siguen usando la simulación del arma equipada.

La perspectiva del modelo converge hacia el centro de la mira y se adapta al tamaño de la ventana. No requiere archivos externos ni modifica los dibujos de topdown.

## Pruebas

Las pruebas de motor verifican alcance, cono, reacción cercana, ocultación, puerta abierta sin descubrir la sala, muebles bajos y altos, pérdida visual, ciegos, camuflaje y estados de brazos. En Chromium se abre una puerta con E para adquirir al jugador y se dibujan las siete armas, el golpe, la pérdida del brazo y ambos finales. Se comprueban siluetas distintas, tejido azul y una única palma dibujada por brazo.

Las capturas preparadas se revisan visualmente y no se cuentan como partidas o victorias de campaña. Los resultados se conservan en RESULTADOS.json.
