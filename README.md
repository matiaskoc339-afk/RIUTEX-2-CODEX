# RIUTEX 2 · El Custodio · Historia completa · v0.23.0

Esta versión amplía **RIUTEX2_fase1_v0.2.2.zip**, la base que aportaste. Conserva su motor, historia, protagonistas y persecución. El contenido jugable comprende la mansión, el hospital las cloacas y fábrica de San Gabriel y el museo-fortaleza de Valcárcel y el laboratorio UMBRAL con sus dos desenlaces.

## Jugar

La entrega incluye [RIUTEX2_Historia_Completa_v0.23.0.html](dist/RIUTEX2_Historia_Completa_v0.23.0.html), con gráficos, estilos y código integrados y sin descargas externas. Ábrelo en un navegador de escritorio con teclado y ratón. El modo 3D requiere WebGL; la vista clásica sigue disponible. El sonido comienza con la primera interacción.

Para ejecutar el proyecto fuente: `npm start` (o `python3 -m http.server 8000`). No hay dependencias de npm que instalar. Los guardados se almacenan en el navegador y dependen de la ubicación desde la que abras el juego. Esta edición utiliza guardados propios; conserva los de v0.2.2 sin importarlos a mapas que han cambiado.

## Elegir perspectiva · v0.23.0

Al pulsar **Nueva partida**, una pantalla con dos tarjetas e imágenes del propio juego permite elegir **Primera persona** o **Topdown**. La elección inicia la historia y se conserva en los ajustes. La ventana recuerda que puedes cambiarla en cualquier momento; admite teclado y ratón, y cancelar vuelve al menú. Continuar, cargar y reintentar conservan el flujo directo.

En primera persona hay un balanceo leve de pasos, algo más intenso al correr, que se suaviza al detenerte. Respeta pausa y **Reducir movimiento**. El movimiento conserva la dirección de la mira y comparte la altura del ojo con los disparos. [Diseño y comportamiento](docs/ELEGIR_PERSPECTIVA.md).

## Animaciones y dificultad · v0.22.0

En primera persona, los enemigos respiran, cambian la postura, buscan con la cabeza, articulan la marcha y preparan, ejecutan y recuperan cada ataque. Los cuadrúpedos mueven la mandíbula y las arañas también las rodillas y los colmillos. Las mutaciones tienen espasmos propios; pausa y congelación detienen la pose.

En ambas perspectivas, los cuatro jefes responden al combate cercano, recuperan antes el ritmo y castigan más sus golpes principales. Los puños tienen menos eficacia contra jefes; acertar durante su recuperación y desarrollar las cuchillas conserva ventaja. Las pausas tras cargar una partida y los avisos de peligros químicos se mantienen. El Carnicero perseguidor avanza más rápido, adelanta el cuerpo en su corte y tiene una carga recta anunciada. Resiste el bloqueo por golpes repetidos y sigue respetando refugios, paredes y escondites. [Cambios y validación](docs/COMBATE_ANIMACIONES.md).

## Personajes en primera persona · v0.21.0

El rediseño adopta geometría facetada y texturas de píxel nítidas para enemigos, jefes, escuadrón y brazos del protagonista. Rehace proporciones, rostros, ropa, extremidades, mandíbulas, patas, alas y armaduras. Las manos usan planos biselados y una postura nueva al sujetar armas; la infección tiene piel azul texturada, y la amputación y la cura conservan su efecto.

El rediseño visual de v0.21.0 conserva el entorno y la vista topdown; el ajuste de combate actual se describe arriba. Los personajes siguen siendo mallas 3D con profundidad, sombras y articulación. No se aplica un filtro retro a la pantalla. [Dirección visual y galería](docs/MODELOS_POV.md).

## Ajustes de v0.20.1

Se retira el destello al disparar en RIUTEX 2, incluida la subida de luz del entorno y las manos. Se conservan el retroceso, los trazadores y los impactos. Los recogibles tienen un halo discreto y una pequeña señal luminosa en ambas perspectivas; respetan paredes, puertas y reducción de movimiento.

El POV recupera la captura con la siguiente pulsación de movimiento o clic si el navegador rechazó el primer intento. Las ventanas liberan el cursor y volver al juego lo captura automáticamente. Perder el foco mantiene la pausa; Reanudar recupera el ratón sin otro botón.

La fábrica pasa de 42 a 58 enemigos ambientales, distribuidos por sus tres sectores. Cuatro recorren patrullas cortas y las abandonan al detectar al jugador. El refugio sigue protegido y hay seis suministros adicionales finitos fuera de él. Las bajas mantienen sus valores pequeños y no reaparecen al cargar.

## Guardado web e itch.io · v0.20.1

Para itch.io usa [RIUTEX2_itchio_v0.23.0.zip](dist/RIUTEX2_itchio_v0.23.0.zip): contiene un `index.html` integrado en la raíz. Se genera con `npm run build`. Sube ese ZIP como juego HTML para navegador y permite pantalla completa.

La sesión se guarda cada diez segundos, al cerrar u ocultar la página, al pausar o volver al menú y tras recoger objetos, fabricar, consumir muestras o comprar habilidades. **Continuar → Continuar sesión** recupera posición, recursos, inventario, documentos, habilidades, puzles, enemigos heridos y fases de jefes. Los datos se comprimen para evitar llenar la cuota del navegador, conservando la lectura de guardados anteriores. Los tres huecos de las camillas y el punto de Reintentar se mantienen separados. Tras morir, la sesión continúa desde ese punto de control.

**Pausa → Partidas y copias** permite descargar e importar una copia JSON. Si el navegador bloquea el almacenamiento, el juego avisa y ofrece la copia. El progreso pertenece al mismo navegador y origen web; no se sincroniza con la cuenta de itch.io. Borrar datos o usar una sesión privada puede eliminarlo. [Publicación y alcance de las pruebas](docs/ITCHIO_GUARDADO.md).

## Primera persona 3D · v0.20.1

**Primera Persona POV** activa una escena Three.js/WebGL con mallas reales. Enemigos, jefes, objetos, mobiliario, puertas y armas tienen volumen y profundidad. La anatomía se articula al respirar, andar y atacar; las fases de los jefes cambian sus cuerpos. Los materiales de suelo, muros y techo incorporan textura, relieve e iluminación. Hay linterna con sombras suaves, luces de las instalaciones, señales y avisos de ataques sobre el suelo y escaleras con peldaños, barandillas y flecha en 3D.

Se presenta a la resolución de la ventana, con antialiasing y escala de píxel acotada. El estilo es 3D procedural: no depende de descargas de modelos ni de imágenes planas para los actores. Three.js y su licencia MIT se incluyen localmente y dentro del HTML integrado. La campaña conserva su simulación y colisiones; puedes cambiar a topdown en el mismo punto, con el mismo progreso.

**El ratón se captura al entrar o volver al juego y se libera al abrir una ventana.** Al cerrar habilidades, inventario, diario, mapa o pausa se intenta recuperarlo automáticamente. Esc libera y pausa sin un bucle de captura. Si el navegador exige otro gesto, el botón **Bloquear ratón** permite reintentar; también funcionan el arrastre derecho y las flechas. La barra de sensibilidad, de 25 % a 250 %, aplica la misma ganancia angular a X e Y y se guarda en el navegador. La mirada vertical llega a ±1,4 radianes y la retícula permanece centrada.

Los disparos normales en POV consideran la altura de la mira y los cuerpos: apuntar al techo o al suelo no golpea un enemigo que queda fuera del rayo. La vista clásica conserva su disparo horizontal. Los enemigos con vista mantienen un alcance limitado y reaccionan al jugador delante de una puerta abierta; los ciegos conservan su comportamiento auditivo. Los dos brazos usan mallas articuladas: el golpe mueve el izquierdo existente, la infección vuelve azul el tejido regenerado y cada desenlace refleja la decisión del antídoto.

Detalles y alcance de las comprobaciones: [Primera persona](docs/PRIMERA_PERSONA.md), [modelos](docs/MODELOS_POV.md) y [cuerpo/visión](docs/POV_CUERPO_Y_VISION.md).

## Artefactos e historia · ambos modos

Las llaves y piezas dejan Artefactos cuando terminan todos sus usos. Los accesos ya desbloqueados se recuerdan al cerrar puertas, cambiar de planta y cargar; las llaves que todavía sirven para otra cerradura permanecen con una explicación. Las piezas instaladas mantienen sus efectos y las misiones conservan lo ya realizado.

Se añaden **24 documentos de lore**, unas 3358 palabras, repartidos desde la mansión hasta UMBRAL. Cartas, testimonios y registros cuentan la vida de Axel, Wren, pacientes, trabajadores y víctimas del proyecto, sin añadir soluciones de mecanismos ni requisitos nuevos. Cada hoja nueva conserva sus 2 XP habituales. [Catálogo y reglas de consumo](docs/LORE_Y_ARTEFACTOS.md).

## Progresión de XP · v0.20.1

Solo conceden XP las bajas, absorber muestras de Riutex y recoger documentos nuevos. Enemigos: 1–2 XP en el hospital, 1–2 en cloacas, 2–3 en el castillo y 3–4 en el laboratorio. Los minijefes dan 6–10 y los cuatro jefes finales 11, 14, 18 y 29. Cada muestra consumida da 15 XP (antes 40), cada documento nuevo 2 (antes 4). Recoger una muestra no adelanta su premio.

Entrar en salas, resolver puzles, obtener armas, conseguir el traje, recoger el maletín de la arena, tocar campanas y la inyección inicial de la historia ya no conceden XP. Sus objetos, mecanismos y accesos siguen funcionando. Las muertes y los documentos no permiten cobrar dos veces; las crías invocadas no dan XP. La XP y habilidades ya guardadas se conservan. [Presupuestos y compras avanzadas comprobadas](docs/PROGRESION_XP.md).

## Controles POV

Activa **Primera Persona POV** en Opciones o desde **Esc → Pausa**. Empieza desactivada y el ajuste se recuerda. **W/S** avanza y retrocede; **A/D** se desplaza de lado; **Shift** corre. **E** interactúa, **R** recarga, **clic derecho** golpea, **Tab** abre inventario, **J** documentos, **M** mapa y **K** habilidades. El primer clic destinado a recuperar el ratón no gasta una bala.

Solo en POV se ven habitaciones no visitadas a través de puertas abiertas; muros y puertas cerradas siguen tapando. El plano descubre salas al entrar y topdown conserva su oscuridad de exploración. Los recursos, habilidades, puzles y guardados se comparten entre ambas perspectivas.

## Menú, transiciones y progresión · v0.15.0

La pantalla principal sitúa el logo centrado sobre un charco de sangre, con baldosas de hospital, camilla y expediente. La superficie refleja ondas y disparos más intensos, sin ninguna persona caminando. La revisión v0.15.1 añade sangre texturada con bordes húmedos, reflejos del ventanal, baldosas desgastadas, camilla, expediente y vial roto. El logo y los botones también se han retocado. Nueva partida, Continuar y Opciones quedan debajo. Opciones conserva volumen y reducción de movimiento; también se respeta la preferencia del sistema.

Las entradas y cambios de planta usan fundidos breves con el nombre del destino. El juego pausa simulación, daño y controles de acción mientras el destino no es visible; mantener una dirección permite seguir caminando al terminar. Cargar, reintentar y el desenlace también usan transición. Las puertas de una misma planta mantienen el recorrido continuo.

Las mejoras porcentuales del árbol aumentan de forma moderada: regeneración Riutex 8→12 %, recuperación de estamina 10→14 %, recarga 12→16 % y daño de élite 20→25 %, entre otras. Las pequeñas reservas Riutex de +8 pasan a +12 puntos. Los poderes y pasivas con porcentajes propios también mejoran; las condiciones y penalizaciones conservan su función. Consulta [PRESENTACION_v0.15.md](docs/PRESENTACION_v0.15.md) para el detalle. Los nodos ya comprados usan los nuevos efectos al cargar.

## Laboratorio UMBRAL y final · v0.14.0

La compuerta del Regente conduce al laboratorio bajo el museo. Conservas equipo y habilidades; puedes continuar desde guardados anteriores con el jefe del castillo vencido.

- **Exploración:** mapa continuo de 156 × 128 casillas, 26 espacios y 40 puertas, con refugio central, tres espacios de guardado, baúl y banco independiente. Nuevos enemigos, suministros, ampliación de inventario y documentos del Dr. Elias Wren.
- **Antídoto:** tres rutas en cualquier orden para suero, plantilla A-0 y catalizador. Hay transferencias térmicas, válvulas de sincronización, filtros espectrales, ADN complementario, cultivo estéril y equilibrio de una centrífuga. Los ajustes se guardan.
- **GL-6 opcional:** recupera cierre y tubo y resuelve el seguro de Ensayos balísticos. Tecla **5** alterna GL-6 y FL-4. Granadas propias fabricables y cuatro mejoras del banco; las explosiones también pueden herirte de cerca. Cinco expedientes adicionales llevan a módulos de M9, M12, UZI, R-98 y FL-4.
- **Wren / ORIGEN:** el doctor de la mansión se inyecta la fórmula avanzada al activar la síntesis. Tiene tres mutaciones cada vez mayores, con espinas, cargas, cortes, marcas, ondas y salto. La cura termina después de vencerlo.
- **Dos finales:** tomar el antídoto elimina poderes mutantes y el brazo reconstruido, conservando el entrenamiento humano. Rechazarlo completa la transformación corporal. En ambos casos sales y caminas por San Gabriel. El helicóptero rescata al Axel humano; abre fuego contra el transformado. La decisión y el final se conservan al cargar.

Detalles y soluciones con spoilers: [docs/LABORATORIO_FINAL.md](docs/LABORATORIO_FINAL.md). Se conserva la inyección de +20 vida máxima en lugar del antiguo rifle del hospital; el R-98 sigue disponible en el castillo.

## Castillo de Valcárcel · fase 3

Tras vencer a la Matriarca, sube las escaleras de su salida. Conservas equipo, habilidades, materiales y traje. También puedes continuar desde un guardado anterior con la araña vencida.

- **Calabozo:** El Tallador lleva cuchillas en las manos y no ve. Patrulla continuamente entre columnas. Correr, disparar, pisar cristales o metal y chocar contra objetos revelan el lugar del ruido; carga hacia ese punto y anuncia un corte ancho. No actualiza ese destino al verte moverte. El contacto también lo alerta. Tras matarlo, recoge físicamente su llave y sube al museo.
- **Dos plantas abiertas:** 24 salas abajo y 20 arriba, tres pares de escaleras, bucles y salidas alternativas. El vestíbulo es refugio con tres espacios de guardado, baúl compartido y banco alimentado. El daño de los enemigos y los mecanismos se conservan al cambiar de piso y cargar.
- **Dos campanas:** poniente enlaza retratos, espejos y contrapesos; levante enlaza trasvases, astrolabio y canto con símbolos. Puedes completar primero cualquiera de las dos. Cada ruta cruza las plantas; las dos campanas liberan la sala real.
- **Exploración opcional:** el R-98 Vésper requiere recuperar cañón y visor y reconstruir su plano. Mayor daño, alcance y precisión que el rifle anterior, a cambio de cargador pequeño, cadencia lenta y 38 de estamina base. La tecla **4 alterna ambos rifles** si llevas los dos. Tiene munición propia fabricable y cuatro mejoras de banco. Cinco búsquedas adicionales, cada una con pieza, documento y mecanismo, añaden módulos a M9, M12, UZI, rifle anterior y FL-4.
- **Fauna y archivo:** lebreles de vitrina, guardianes de alabarda, polillas de ceniza y portadores con escudo. Los expedientes del Proyecto UMBRAL explican la exposición previa de Axel y por qué conserva su memoria; no lo hacen inmune al daño.
- **El Regente Hueco:** primera forma de espada y escudo con movilidad rápida; segunda rompe la armadura, golpea más fuerte y se mueve más despacio; tercera combina furia, cadenas de cortes, cargas, ondas y saltos. Cada ataque tiene aviso y recuperación. La puerta tras el trono permanece cerrada hasta vencer sus tres formas. Cruzarla conduce a la compuerta secreta del laboratorio final.

El mapa sigue ocultando salas no visitadas. Los mecanismos conservan sus ajustes al salir y sus documentos se consultan desde J. Detalles y soluciones con spoilers en [docs/CASTILLO.md](docs/CASTILLO.md).

## Cierre de la fase 2 · v0.12.0

Tras las tres válvulas, el colector conduce a una última estación y un pasillo hacia la cueva de **la Matriarca del vertido**. Antes de entrar puedes volver al refugio y al armero. Dentro, el pasillo se sella hasta la victoria.

- **Forma 1:** veneno preciso y rápido, con dirección marcada antes del disparo, y crías que aparecen en capullos distantes tras un aviso.
- **Forma 2:** nuevas placas, patas más largas, embestidas rápidas y saltos físicos, con presión continua de crías.
- **Forma 3:** otra mutación combina el veneno, los saltos y las cargas. Los choques contra roca y las recuperaciones ofrecen oportunidades de respuesta.

Las arañas pequeñas tienen poca vida, atacan en grupos y dejan residuos venenosos al morir. Las invocadas por el jefe tienen un límite simultáneo y no dan materiales ni experiencia para evitar recursos infinitos. Los poderes ralentizan al jefe; no permiten saltar sus mutaciones. La derrota permite reintentar con los recursos del punto previo al combate. Al vencer se limpian crías y ataques, se abre la puerta del este y cruzarla conduce a las escaleras del museo y comienza la fase 3.

**Lanzallamas FL-4 (v0.12.1).** Sustituye al LG-4 en la misión opcional del armero. El expediente del Depósito logístico lleva al regulador del Taller de rotores, la válvula de Calderas y el estuche del Muelle de chatarra. Recompón el plano de placas deslizantes para recuperarlo. Si no cabe, la recompensa va al baúl.

Equipa con **5** y **mantén clic** para emitir fuego continuo. Su alcance es corto, el daño por contacto es moderado y cada pulso consume combustible y estamina. Puede alcanzar hasta tres blancos juntos; las paredes lo detienen. El quemado es leve, dura tres segundos y solo renueva su duración: no se acumula ni encadena aturdimientos. Los jefes reciben menos daño de fuego.

**R cambia un tanque completo** y descarta el combustible que quedaba en el depósito. Cada tanque base aporta 80 de combustible. En Construcción aparece la receta **1 tanque de combustible**, a cambio de 2 tornillos grandes y 3 pólvoras grandes. Los tanques ocupan una casilla y se apilan hasta cuatro. La misión, dos reservas de la fábrica y la última estación ofrecen combustible finito.

El armero permite mejorar **Daño, Aguante, Control del chorro y Depósito**. El control mejora el alcance; cada nivel de depósito añade 15 de combustible por tanque. Comprar capacidad no rellena el arma. Los guardados del LG-4 se convierten al FL-4 conservando la misión, mejoras y reservas: cada granada guardada pasa a ser un tanque, y el combustible cargado conserva la proporción del cargador antiguo. Un arma vacía sigue vacía; la conversión no se repite al guardar y cargar.

**Protección S-4, opcional.** Un expediente de Seguridad inicia una ruta por depuración, Veterinaria, Calderas y Celdas de recuperación. Hay que preparar tres componentes, detener el tren de presión y conectar un esterilizador de nueve ramales. Activarlo inicia la contención del custodio S-4 y sus crías; derrotarlo libera el estuche del traje. No hace falta para las válvulas ni para acceder al jefe final.

El traje se equipa como defensa integrada y aparece junto a las armas en el banco. Tiene una barra propia de 90 puntos que absorbe impactos antes que la salud, con exceso de daño que pasa a la vida cuando se rompe. Mejora Protección para reducir desgaste, Durabilidad para añadir hasta 90 puntos de capacidad y Resistencia al veneno para reducir tanto acumulación como daño continuo. Solo **Reparar capa**, en un banco con materiales, restaura esa barra. Las inyecciones, el cambio de zona, cargar una partida y aumentar la durabilidad conservan el desgaste. Al romperse pierde también el filtrado hasta repararlo.

Los guardados de v0.11.0 mantienen sus válvulas y opcionales. Una partida que terminaba en el colector ahora puede recorrer la estación y la cueva sin repetir las válvulas. El árbol de habilidades conserva sus 153 opciones y cuatro decisiones doradas.

## Cloacas / Fábrica conservada de v0.11.0

La puerta lateral del Carnicero conduce ahora a una escalera de servicio. Baja con E: conservas armas, maletín, habilidades, materiales y progreso. Las partidas que ya habían vencido al Carnicero también pueden usar esta escalera.

La fábrica ocupa un mapa continuo de **148 × 110 casillas, 30 zonas y 33 puertas**, con tres sectores conectados por galerías y atajos. El pequeño vestíbulo central tiene camilla con tres espacios, baúl compartido, ducha para retirar veneno y banco de armas con alimentación propia. Volver aquí no cura salud ni regala munición.

- **Depuración:** recupera el rotor, resuelve el trasvase de depósitos y libera el pozo de la válvula de flujo. Al bajar el agua se abre también un atajo.
- **Vivario:** recupera una batería refrigerada, apaga los indicadores de las nueve jaulas y accede a la válvula de cuarentena. Aquí puedes escuchar la radio militar.
- **Fundición:** recupera el acople, alinea las cuatro ruedas del tren y libera la prensa de la válvula de presión. Se cortan sus fugas al resolverlo.

Puedes explorar los sectores en el orden que prefieras. Instala cada volante en su toma del vestíbulo; las tres abren la compuerta principal. La misión de radio y los secretos no son obligatorios para esa salida.

El agua y los residuos acumulan veneno y reducen salud; existen pasos secos. Además de las arañas, hay cuatro especies del vertido: corredor de jaula (abalanzamiento), rastreador ciego (último sonido oído, no visión), sifón anfibio (descargas tóxicas) y cornudo de fundición (embestida pesada). Sus ataques se anuncian antes de ejecutarse. Las habilidades de suspensión, señuelo y atracción conservan su función.

Los documentos del complejo cuentan los ensayos animales y cómo contaminaron el colector. Dos recorridos opcionales conectan varias salas: ensamblar un filtro (−45 % de acumulación de veneno, sin inmunidad) y resolver la grúa del armero para obtener un compensador M12 (+12 % de daño y −10 % de esfuerzo). El banco muestra estos módulos además de las mejoras habituales.

La radio pide rescatar a un supuesto militar del escuadrón **3-6-9AK** en el almacén. Hay que confirmar físicamente tres placas siguiendo su transmisión. Es una trampa: la cámara circular se sella y comienza un ensayo de **ocho oleadas**. La octava incluye al minijefe **El Repetidor K-9**. Las bocas de servicio avisan antes de liberar enemigos lejos del jugador. Hay pausas y reservas finitas entre ciclos. Los cierres solo se liberan al sobrevivir a todos; el maletín de la salida da el kit de ciclo UZI (−18 % de esfuerzo y −15 % de dispersión) y termina la misión.

La llegada, los mecanismos, las piezas, las válvulas instaladas y las recompensas se guardan. Un guardado durante el ensayo conserva la oleada y la salud de sus enemigos vivos; Reintentar usa el punto de control al sellarse la cámara. Las reservas y el maletín no se duplican al cargar.

## Final del hospital · v0.10.0


Al acercarte a la calle después de activar la energía del garaje, el suelo se rompe. Axel cae sobre una plataforma de rejilla elevada sobre una cuba de productos químicos. Se conserva el inventario; la caída no quita salud. La zona C-0 solo aparece en el mapa cuando llegas.

El Carnicero tiene 1500 de salud repartidos en tres formas obligatorias: normal, mutada y furia terminal. Se transforma al llegar a 1000 y 500. Un ataque potente no puede saltarse una forma. El normal usa machete, gancho y embestida; el mutado añade salto y descargas químicas; la furia acelera la persecución, añade doble corte y amplía las descargas. Cada dirección o zona queda marcada antes del golpe. Los avisos permanecen legibles dentro de tu campo de visión. Un choque contra el borde deja al jefe expuesto durante más tiempo; las recuperaciones reciben un 25 % más de daño. Las técnicas de suspensión lo ralentizan sin detenerlo completamente.

Hay un punto de control al aterrizar. Reintentar restaura esos recursos y reinicia las tres formas. Los suministros recogidos y la victoria no se duplican al cargar. Al vencerlo cesan sus ataques y se abre una única compuerta lateral; su escalera conecta con la fábrica. Las partidas antiguas con el jefe del garaje vencido llegan a esa escalera sin repetir el combate.

Se han recorrido las quince zonas de la planta alta, sus llaves, caja, EEG y ambos sentidos de las escaleras. Se corrigió una interacción en el acceso al sótano: cuando coinciden puerta y escalera, la puerta cerrada más cercana tiene prioridad.

## Habilidades conservadas de v0.9.1

Solo se amplía el árbol con dos parejas doradas avanzadas, situadas después de las maestrías finales de cada rama. Cada opción cuesta 48 EXP y elegirla cierra únicamente su alternativa:

| Rama | Opción | Efecto |
|---|---|---|
| Humano, después de Control total | Disciplina de fuego | +25 % de eficiencia de disparo y +12 % de daño con armas |
| Humano, misma pareja | Reserva del veterano | +28 de estamina máxima y +12 de salud máxima |
| Mutante, después de Sobrecarga estable | Reactor orgánico | +36 % de recuperación Riutex y +20 % de eficiencia de golpes orgánicos |
| Mutante, misma pareja | Corazón abisal | +40 de reserva Riutex y +12 de salud máxima |

Las dos parejas anteriores siguen siendo independientes de estas. Hay cuatro decisiones doradas por partida: dos humanas y dos mutantes, con una habilidad por pareja. La red contiene 153 opciones y permite completar 149. Se conservan las elecciones y partidas anteriores.

## Novedades conservadas de v0.9.0

- **Carnicero y ruido acumulado:** una sucesión de disparos o explosiones en 12 s provoca aviso y una espera de 2,5 s. Para llegar a la planta necesita un punto alcanzable, fuera de cámara y de visión, a un mínimo de 640 px y con al menos 24 pasos de ruta. La distancia mínima aumenta con el tamaño de la ventana. Si no existe un punto justo, se aplaza; nunca se usa un punto cercano como alternativa. Investiga el origen del ruido y pasa a cazar al verte. Si ya está activo, se desplaza desde su posición. El silencio ya no activa el antiguo temporizador automático.
- **Estamina por disparo:** M9 12, M12 28, UZI 5, rifle 32 y AK 7 antes de mejoras. La recuperación espera 1,1 s tras disparar; sin estamina suficiente no sale una bala. Las mejoras, el enfoque y la preparación táctica reducen el coste. La UZI consume estamina por cada bala, no por ráfaga.
- **Golpes con Riutex:** tras reconstruir el brazo, cada golpe normal cuesta 24 de Riutex y cada golpe de cuchilla 32, antes de mejoras. La primera cuchilla dura 5 s, cuesta 34 al activar y aporta +32 % de daño base. Fuerza aumentada aporta +32 %, en lugar de duplicar el daño. En la mansión, antes de la infección, el golpe físico usa estamina. Mientras falta el brazo no puedes golpear.
- **Elecciones de habilidades:** la inyección abre el árbol pero solo entrega el núcleo. Reflejos e Instinto se compran si los quieres. Cada activa comprada en el árbol abre un diálogo para elegir una tecla; rechaza las teclas reservadas y puedes dejarla pendiente. Una activa sin asignar conserva ese estado al cargar. Las partidas anteriores conservan sus habilidades y teclas ya adquiridas.
- **Doce nodos / cuatro ramales nuevos:** Humano: Segundo aliento (mejor sprint temporal) y Cambio de guardia (control del disparo y recarga). Mutante: Singularidad (atrae infectados visibles sin atravesar paredes ni arrastrar jefes) y Eco de carne (señuelo con salud y duración limitadas). Son recorridos opcionales con dos mejoras previas por rama. La red ampliada tiene 153 opciones, 149 compatibles por las cuatro elecciones doradas.
- **Vestíbulo:** camilla junto al lateral para guardar en tres espacios y alternar al modo de cargar. El personaje herido deja pequeñas manchas de sangre al caminar hasta inyectarse.
- **Accesorios por exploración:** cuatro cadenas opcionales para M9, M12, UZI y rifle, con cinco documentos nuevos, componentes, mecanismos de sello, enfoque y presión. Cada accesorio afecta solo a su arma, aunque la recuperes después.
- **C-17, El Escolta:** encuentro opcional del Banco de sangre, anunciado por un documento y un precinto que puedes dejar cerrado. Embestida y grito tienen aviso. Puedes retirarte; no sale de su sala. Su salud, derrota y botín se conservan al guardar. Entrega un cargador especial para UZI.
- **Banco de mejoras:** una misión de Mantenimiento lleva a recuperar cable y fusible y conectar el generador auxiliar de Calderas. Alimenta la mesa de Mantenimiento; no activa el generador de la salida ni sustituye sus fusibles. El banco cobra tornillos y pólvora por daño, aguante, precisión y capacidad, con tres niveles por atributo y por arma. Puede ajustar armas del baúl. No rellena balas al ampliar cargadores. Los antiguos accesorios gratuitos de las salas pasan a materiales.

## Novedades conservadas de v0.8.0

- **Expediente conectado:** Tab abre solo Inventario. La barra superior cambia a Construcción, Artefactos, Documentos, Mapa o Adaptación. J, M y K abren directamente su pestaña desde el juego o desde otra sección; repetir el atajo de la pestaña activa o pulsar Esc vuelve al juego. La partida queda pausada mientras consultas el expediente.
- **Maletín y baúl:** iconos vectoriales propios para cada familia, siluetas de armas, cantidades, estado de arma equipada y vista del objeto seleccionado. Las llaves y los documentos tienen sus propias secciones.
- **Construcción:** cuatro recetas de munición y cuatro de preparación de materiales, con coste, existencias y motivo de bloqueo. Fabricar cuenta los huecos que liberan los ingredientes. Si no cabe el resultado completo, no gasta materiales. Las conversiones consumen recursos y no permiten multiplicarlos.
- **Artefactos:** llaves y piezas con descripción, pista de uso y enlaces a los documentos relacionados que ya hayas recogido. Las piezas consumidas por un mecanismo dejan de aparecer.
- **Plano de memoria:** panel lateral de orientación, zoom, arrastre, centrar posición, selección de salas visitadas, filtro de servicios, pulso de posición y una marca personal que se guarda con la partida. El primer encuadre usa lugares descubiertos. No dibuja salas sin visitar ni marca soluciones o búsquedas opcionales.
- **Documentos:** membrete clínico, sellos, marcas de archivo, papel con pliegues, perforaciones y manchas suaves en los márgenes. Se conserva el texto de todas las pistas y su legibilidad; las cartas de Wren y los registros de mantenimiento tienen variantes de papel.
- **Adaptación visible:** las habilidades mutantes añaden gradualmente venas, un antebrazo ligeramente asimétrico y pequeños relieves. La ruta humana mantiene la silueta. Son detalles visuales sin penalizaciones nuevas.
- **Distribución:** siete taquillas junto a paredes o bordes de paso, y un único reloj junto al muro del estudio con interacción desde el suelo contiguo. Se conservan los recorridos y mecanismos del prólogo.

## Qué cambia respecto a la base

- **HUD de armamento:** una silueta distinta para AK, M9, escopeta, UZI y rifle; arco que representa las balas que quedan en el cargador, número actual / capacidad real y reserva separada. Muestra la recarga y las manos vacías o la forma orgánica cuando corresponde.
- **Equipo del prólogo:** AK automático de 30 balas, más potente que la M9, con 90 balas de reserva y munición propia en la mansión. Al despertar se pierde todo el equipo, incluido el baúl del prólogo. La M9 aparece destacada en el centro del vestíbulo, cerca de la llegada.
- **Armas del hospital:** M9, escopeta M12 y UZI. La Sala de pruebas contiene ahora una inyección amarilla de +20 salud máxima en lugar del rifle de precisión. La escopeta y la UZI se obtienen en desvíos opcionales: documentos, componentes y cierres espaciales. Farmacia y Dirección conservan sus llaves de progresión, pero ya no regalan estas armas.
- **Alijos con recorrido propio:** el soporte de la escopeta usa trabas deslizantes; la caja de la UZI usa espejos y tres testigos ópticos, con piezas repartidas entre dos plantas. Los ajustes se guardan al salir y al cargar. Abrir el mecanismo deja el arma disponible en el mundo; si el maletín está lleno puedes volver a recogerla. Las notas nuevas aparecen en «Pistas» del diario.
- **Rumbo principal:** indicaciones breves y un botón que abre M. El mapa señala sectores amplios con un contorno ámbar; no revela la geometría de salas sin visitar. Las búsquedas de armas y otros hallazgos opcionales se descubren explorando y leyendo, sin sustituir la pista principal.
- **Hospital más amplio:** pasa de 38 a 60 espacios entre habitaciones, salas, corredores y galerías. Mantiene tres plantas. Añade patio de invierno seguro, seguridad, rehabilitación, fisioterapia, hidroterapia, diagnóstico, banco de sangre, invernadero, mantenimiento, pediatría, EEG, aislamiento, anfiteatro y salas de bombas/turbinas/criogenia. Hay recorridos entre alas y segundas entradas a zonas conocidas.
- **Exploración:** plano con M, descubrimiento progresivo, posición, objetos vistos, cierres, escaleras y refugios. Las habitaciones de una planta comparten un mapa continuo. Solo las escaleras y los acontecimientos de historia cambian de mapa.
- **153 opciones en una sola red:** seis mejoras iniciales comunes antes de abrir recorridos que evolucionan hacia Humano y Mutante. Las conexiones se reencuentran, algunos nodos necesitan dos requisitos y tres uniones combinan ambas tendencias. Puedes combinar las ramas. Zoom, arrastre, encuadre y nombres opcionales permanecen en la misma pantalla.
- **Especializaciones doradas:** cuatro parejas, dos humanas y dos mutantes. Las parejas iniciales son Táctica serena / Triaje de combate y Catalizador / Simbiosis; las avanzadas son Disciplina de fuego / Reserva del veterano y Reactor orgánico / Corazón abisal. Se elige una de cada pareja y las cuatro decisiones son independientes. El panel compara sus efectos, explica qué alternativa se cierra y conserva la elección al guardar. Son 149 desarrollos compatibles. El fondo mantiene su animación al seleccionar o comprar; los nombres aparecen al pasar el ratón o enfocar con el teclado.
- **Humano:** control de armas, estamina máxima, recuperación, sigilo, medicina con suministros y técnicas que consumen estamina. Incluye respiración táctica, desplazamiento silencioso, golpe de separación y bonificación de la última bala.
- **Mutante:** transformación corporal, psicoquinesis, energía Riutex, regeneración, ancla psíquica, coraza orgánica e intercambio de salud por energía. Las mejoras pequeñas también aumentan vida y estamina.
- **Ramales con final propio:** camuflaje en penumbra y ventana de precisión (estamina); suspensión temporal y forma del acechador (Riutex). Cada uno tiene dos mejoras de preparación y un final que no exige volver a unir todas las ramas. La suspensión dura 3 s y ralentiza a los jefes; la forma del acechador dura 9 s, cambia la silueta y prioriza la cuchilla sobre las armas.
- **Monitor vital:** ECG animado que cambia gradualmente de verde a rojo al bajar la salud, tubo Riutex morado con burbujas y reserva de estamina naranja vertical. Números y estados acompañan a los colores.
- **Puertas reconocibles:** hoja, ventanilla, barra antipánico, bisagras, marco y señal de cierre. Los accesos visibles conservan detalle en la oscuridad; en topdown una sala no visitada permanece oculta.
- **Interfaz:** botones y menús con tipografía Rajdhani local, mayor tamaño de texto, bordes y estados de foco coherentes. La fuente y su licencia SIL OFL van incluidas.
- **Progreso:** solo las bajas, los documentos nuevos y las muestras consumidas dan EXP. Los mecanismos opcionales conceden sus objetos y accesos una sola vez. Los sueros y la munición sobrante pueden ir al baúl compartido; las armas de los alijos nuevos permanecen disponibles para recogerlas cuando tengas espacio.
- **Minijuegos:** reloj con agujas, circuitos giratorios para seguridad y generador, mezcla de suero, presión hidráulica y calibración de frecuencias. Los teclados de Farmacia y Dirección incorporan las pistas del diario que hayas reunido. Los mecanismos conservan sus ajustes al salir.
- **Inicio guiado y jugable:** biblioteca → comedor → estudio → pasadizo → frasco y captura → hospital → primer golpe en la puerta → vestíbulo → tutorial e inyección. Tomar el frasco sella la cámara y ralentiza al personaje únicamente durante la captura física del Custodio. En el hospital, el primer golpe junto al cierre abre la puerta: ya no hace falta mantener E. La inyección con F espera hasta llegar al vestíbulo y cerrar la guía.
- **Oscuridad con acentos azules:** conserva los personajes y el hospital vectorial, con menos saturación y luz ambiental. Las paredes y puertas cerradas bloquean la visión; los muebles conservan colisión y proyectan sombras cortas y suaves, sin borrar media sala. En topdown, una sala nueva permanece negra hasta que entras; el plano recuerda lo explorado en ambas vistas. Sin grano ni filtro retro.
- **Carnicero con memoria:** persigue lo que ve, investiga ruidos y busca tu última posición conocida. Si no te ve entrar en la taquilla, abandona la búsqueda y continúa sus patrullas y rutinas. Si presencia cómo te escondes, inspecciona esa taquilla.
- **Guía de la primera huida:** indicaciones persistentes y flecha para llegar al cierre, atravesarlo después del golpe y bajar hasta la persiana. En el vestíbulo aparece un tutorial pausado con seis dibujos sencillos, controles y mecánicas. Puedes volver a consultarlo desde la pausa.
- **Puertas reparadas:** tabiques y accesos controlados en almacén/criogenia hacia la rampa y en el lateral del invernadero. Los marcos permanecen al abrir la hoja. En cruces con dos cierres cercanos, E elige la puerta más próxima.
- **Expedientes:** papeles reconocibles en el suelo, indicación de lectura al acercarte, títulos, párrafos, tipografía editorial y resaltado de códigos en el diario.
- **Combate y comodidad:** costes de combate exigentes, pausa de recuperación tras disparar, salud inicial de 100, golpe bloqueado por paredes, control de volumen y pausa. El Carnicero final utiliza el encuentro de tres formas de C-0, sin pantallas de diálogo durante el combate.

## Controles

| Acción | Control |
|---|---|
| Mover / correr | WASD / Shift |
| Apuntar / disparar | Ratón / clic izquierdo |
| Golpear | Clic derecho |
| Interactuar / cerrar puerta | E |
| Recargar / elegir arma | R / 1–5 |
| Usar inyección | F |
| Habilidades activas | Comprar en K y elegir una tecla libre |
| Inventario / girar objeto | Tab / R dentro del maletín |
| Construcción / artefactos | Pestañas superiores del expediente |
| Diario / adaptación / plano | J / K / M |
| Pausa / cerrar mecanismo | Esc |

Las habilidades activas nuevas se asignan desde K. Camuflaje necesita penumbra y termina al correr, atacar o recibir daño; la ventana de precisión termina al correr. La suspensión afecta a infectados y proyectiles hostiles dentro del campo y no atraviesa paredes. Sus recargas se conservan al guardar. Si una partida v0.5 tenía ambas doradas de una pareja nueva, se conserva la primera y se devuelve la EXP de la alternativa. Las camillas permiten guardar en tres huecos manuales. El juego también conserva un punto de control para reintentar.

## Desarrollo y comprobaciones

- `npm test`: pruebas de progresión, recursos, mecanismos, visibilidad, escondites, puertas, historia de fase 1, guardado/estrés y navegación. Node 18 o superior.
- `npm run test:browser`: genera el HTML y ejecuta las pruebas con Chromium real, Python y Playwright. Cada prueba inicia su propio servidor efímero; no requiere un servidor previo. Recorre físicamente el prólogo y el acceso a las galerías, comprueba controles, mecanismos, compras, carga, ocultación por píxeles, documentos y resoluciones de escritorio. Se puede indicar un servidor externo mediante `RIUTEX_TEST_URL`.
- `npm run build`: genera el HTML autocontenido con Python 3, sin acceso a red.
- `npm run maps`: regenera planos completos desde los mapas reales; necesita Pillow. Los planos contienen spoilers.

El castillo se concentra en `js/castle-levels.js`, `js/castle-enemies.js`, `js/castle-puzzles.js`, `js/castle.js`, `js/castle-art.js` y `castle.css`. El reemplazo del FL-4 se concentra en `js/flamethrower.js`. Los archivos `js/blue-*.js`, `js/blue.js`, `js/horror.js`, `js/revision.js`, `js/presentation.js`, `js/adventure.js`, `js/weapon-puzzles.js`, `js/fielddesk.js`, `js/survival.js`, `js/workshop.js`, `fielddesk.css`, `survival.css`, `blue.css`, `horror.css`, `revision.css`, `presentation.css` y `adventure.css` concentran la ampliación. Se ajustaron también entrada, cámara, combate y persecución en el motor original. Los módulos de RIUTEX 1 siguen como dependencias internas del motor recibido; el menú de esta entrega ofrece las cuatro fases y ambos finales de RIUTEX 2.

El detalle de la validación y sus límites está en `docs/VALIDACION.md`. La simulación se comparte entre la vista clásica 2D y la escena 3D de primera persona. El arte se genera localmente y el sonido es sintetizado; el equilibrio de una partida completa aún requiere pruebas con jugadores.
