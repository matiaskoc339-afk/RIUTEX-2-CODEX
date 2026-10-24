# Modelos y objetos en primera persona · v0.20.0

Esta revisión sustituye las imágenes frontales del POV por grupos de mallas Three.js. La vista clásica conserva sus dibujos. Las estadísticas, ataques, avisos y progresión de los encuentros se comparten entre vistas; el disparo normal en POV considera también la altura de la mira y del cuerpo.

## Identidades

`POVModels.identity` resuelve la criatura antes de construir y consultar la caché de mallas. El Carnicero conserva internamente `type=vacio` por herencia; C-17 conserva `type=camillero`. Ahora ambos tienen claves visuales propias, independientemente de qué enemigo se dibuje primero. El Custodio inicial, el perseguidor del hospital y el Carnicero final comparten su identidad de carnicero, con las mutaciones correspondientes.

Las familias de la campaña tienen anatomía volumétrica, ropa, equipo y materiales propios. El catálogo principal incluye:

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

Los cuatro jefes finales presentan doce formas en total. Las fases modifican masa, extremidades y tejido; no se limitan a recolorear. Las mallas se generan localmente y comparten geometrías y materiales. Se articulan torso, cabeza, extremidades, patas y alas para respiración, marcha y ataques. La escena usa profundidad WebGL e iluminación física; cada cuerpo oculta lo que hay detrás según su volumen.

## Objetos del suelo y mira

Las armas sueltas tienen cuerpos sólidos propios: pistola, escopeta, UZI, AK, R-98, lanzallamas y GL-6. Las reservas distinguen balas, cartuchos, combustible y granadas. Los documentos muestran hojas clínicas, sellos y manchas; muestras, llaves, tornillos, pólvora y maletines tienen modelos propios. Las piezas muestran batería, rotor, manivela, óptica, tejido, filtro, muelle, circuito y otros componentes según su función.

La caché incluye la pieza o arma concreta, evitando que dos recompensas con el mismo tipo interno compartan el modelo equivocado. Los documentos y piezas quedan apoyados sobre el suelo; sus pequeños movimientos y marcadores ayudan a reconocerlos. Las escaleras tienen peldaños, pasamanos y flecha 3D; las camillas de guardado muestran manta azul y cruz clínica. Su posición e interacción mantienen el estado de la campaña.

La retícula permanece en el centro de la pantalla al mirar arriba o abajo. El mundo se desplaza al inclinar la cámara. Los disparos normales consideran el rayo de la cámara y la altura corporal, sin añadir bonificaciones de daño por cabeza.

## Comprobación

`tests/pov3d-assets.test.js` crea las mallas reales de cada especie sin contexto gráfico y verifica volumen, materiales, ausencia de sprites, articulación, identidades heredadas, mutaciones y recogibles. Las pruebas WebGL de navegador preparan escenas de campaña y comprueban su integración visual. Los paneles de `pov_models_browser.py` corresponden a los dibujos del render anterior y se conservan como historial, no como validación de las mallas nuevas.

Las capturas preparadas no representan victorias ni miden dificultad humana. Los resultados ejecutados se registran en [VALIDACION.md](VALIDACION.md).
