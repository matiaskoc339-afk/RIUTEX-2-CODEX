# Modelos y objetos en primera persona · v0.17.0

Esta revisión solo cambia la presentación POV. Las estadísticas, IA, ataques, avisos, colisiones, progresión y guardados mantienen sus reglas. La vista clásica utiliza sus dibujos originales.

## Identidades

`POVModels.identity` resuelve la criatura antes de consultar la caché de imágenes. El Carnicero conserva internamente `type=vacio` por herencia; C-17 conserva `type=camillero`. Ahora ambos tienen claves visuales propias, independientemente de qué enemigo se dibuje primero. El Custodio inicial, el perseguidor del hospital y el Carnicero final comparten su identidad de carnicero, con las mutaciones correspondientes.

Las treinta identidades tienen siluetas diferentes, además de ropa, equipo y materiales:

| Zona | Criatura / encuentro | Rasgos visuales |
| --- | --- | --- |
| Mansión | Vacío | Cuerpo estrecho, ropa desgastada y cabeza caída |
| Mansión/hospital | Latente | Cuerpo encorvado y envuelto en vendas |
| Mansión | Trepador | Brazos largos, apoyo bajo y espinas |
| Hospital | Sonámbulo | Bata clínica, pulsera y postura erguida |
| Hospital | Rastrero | Apoyo sobre manos, tórax bajo y mandíbula abierta |
| Hospital | Enfermera | Toca, mascarilla, delantal y material clínico |
| Hospital | Cirujano | Uniforme quirúrgico, espejo frontal y sierra |
| Hospital | Camillero | Hombros anchos, correas y barra de camilla |
| Hospital | Hinchado | Abdomen voluminoso y sacos tóxicos |
| Captura/hospital | Carnicero | Capucha cosida, máscara metálica, delantal, gancho y cuchilla |
| Hospital opcional | C-17 | Arnés del escolta, casco, tórax abierto en placas y cargador |
| Cloacas/fábrica | Corredor de jaula | Cuadrúpedo de incisivos largos, costillas y cola |
| Cloacas/fábrica | Rastreador ciego | Ojos sellados, orejas expuestas y brazos prolongados |
| Cloacas/fábrica | Sifón anfibio | Patas plegadas y saco de garganta que se hincha al atacar |
| Cloacas/fábrica | Cornudo | Cuernos, delantal industrial y brazo mineral |
| Arena opcional | Repetidor K-9 | Altavoz en la garganta, cables y arnés; cambia al enfurecer |
| Cloacas/fábrica | Araña del vertido | Ocho patas, abdomen segmentado y colmillos |
| Encuentro del traje | Custodio S-4 | Traje de contención, visor, filtros y brazo reforzado |
| Cueva | Matriarca | Corona quitinosa, puesta y patas falciformes |
| Castillo | Lebrel | Mandíbula canina y placas ornamentales |
| Castillo | Guardián del tapiz | Alabarda, casco y telas colgantes |
| Castillo | Portador del relicario | Escudo ancho y armadura pesada |
| Castillo | Polilla | Alas marcadas, antenas y abdomen suspendido |
| Calabozo | Tallador | Ojos sellados, correas cruzadas y cuchillas en ambas manos |
| Sala real | Regente | Corona, escudo y espada; pierde armadura al mutar |
| Laboratorio | Receptor ágil | Cuerpo fino, cánulas y equipo de ensayo |
| Laboratorio | Custodio de presión | Depósitos, visor cerrado, manómetro y pistones |
| Laboratorio | Portador de esporas | Tejido cubierto por hongos y esporangios |
| Laboratorio | Doble de ensayo | Rostro facetado y placas reflectantes |
| ORIGEN | Wren | Bata y gafas, brazo asimétrico y mutación torácica |

Los cuatro jefes finales presentan doce formas en total. Las fases modifican masa, extremidades y tejido; no se limitan a recolorear. Los dibujos se generan localmente y se guardan en una caché acotada. El render conserva oclusión por píxel e iluminación de la escena.

## Objetos del suelo y mira

Las armas sueltas usan su propia silueta: pistola, escopeta, UZI, AK, R-98, lanzallamas y GL-6. Las reservas distinguen balas, cartuchos, combustible y granadas. Los documentos muestran hojas clínicas, sellos y manchas; muestras, llaves, tornillos, pólvora y maletines tienen dibujos propios. Las piezas muestran batería, rotor, manivela, óptica, tejido, filtro, muelle, circuito y otros componentes según su función.

La caché incluye la pieza o arma concreta, evitando que dos recompensas con el mismo tipo interno compartan el dibujo equivocado. Los objetos sueltos eliminan el margen transparente sobrante de su imagen para que sean reconocibles y queden apoyados sobre el suelo. Su posición y recogida no cambian.

La retícula permanece en el centro de la pantalla al mirar arriba o abajo. El mundo se desplaza al inclinar la cámara. Se conserva la simulación de combate del juego original, sin añadir daño localizado por altura.

## Comprobación

`tests/pov_models_browser.py` comprueba treinta identidades y máscaras de silueta diferentes, doce imágenes de fases, treinta y seis muestras de objetos, instancias reales de Carnicero y C-17, objetos dibujados sobre el suelo y píxeles de la retícula centrada en tres inclinaciones. Genera paneles y escenas de revisión en `artifacts/`. Son situaciones preparadas; no equivalen a victorias ni miden dificultad humana.
