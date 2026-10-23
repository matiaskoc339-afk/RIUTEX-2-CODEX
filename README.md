# RIUTEX 2 · El Custodio · Historia completa · v0.17.1

Esta versión amplía **RIUTEX2_fase1_v0.2.2.zip**, la base que aportaste. Conserva su motor, historia, protagonistas y persecución. El contenido jugable comprende la mansión, el hospital las cloacas y fábrica de San Gabriel y el museo-fortaleza de Valcárcel y el laboratorio UMBRAL con sus dos desenlaces.

## Jugar

La entrega incluye [RIUTEX2_Historia_Completa_v0.17.1.html](dist/RIUTEX2_Historia_Completa_v0.17.1.html), con gráficos, estilos y código integrados y sin descargas externas. Ábrelo en un navegador de escritorio con teclado y ratón. El sonido comienza con la primera interacción.

Para ejecutar el proyecto fuente: `npm start` (o `python3 -m http.server 8000`). No hay dependencias de npm que instalar. Los guardados se almacenan en el navegador y dependen de la ubicación desde la que abras el juego. Esta edición utiliza guardados propios; conserva los de v0.2.2 sin importarlos a mapas que han cambiado.

## Primera Persona POV · v0.17.1

En **Opciones**, activa **Primera Persona POV**. También puedes cambiarla desde **Esc → Pausa** durante la partida. Empieza desactivada: la vista clásica sigue disponible. El ajuste se recuerda en el navegador y puedes cambiarlo sin reiniciar ni perder progreso.

La barra **Sensibilidad del ratón** está en Opciones y Pausa: de **25 % a 250 %**, con **100 %** como valor normal. Se aplica al instante a la mirada horizontal y vertical y se recuerda al volver a abrir el juego.

Pulsa **Bloquear ratón** en la ayuda inferior para capturar el cursor en primera persona. **Esc** lo libera y pausa. El botón reaparece al reanudar; si el navegador rechaza la captura, puedes reintentar o usar el arrastre con clic derecho.

En POV, **W/S** avanza y retrocede; **A/D** se desplaza de lado. Haz clic en la escena para controlar la mirada con el ratón. Ese primer clic captura el control y no gasta una bala. **Esc** libera el ratón y pausa; abrir inventario, documentos, mapa, habilidades o un mecanismo también libera el cursor. Si el navegador no permite capturarlo, usa **arrastre con clic derecho** para mirar o las **flechas** para girar. Un clic derecho breve conserva el golpe.

Las paredes, puertas y muebles tienen profundidad; los enemigos tienen siluetas frontales y las armas se ven en las manos. Los materiales distinguen mansión, hospital, fábrica, castillo, laboratorio y calle. Los avisos de ataques y poderes se proyectan sobre el suelo, con las mismas posiciones y tamaños del motor. La primera huida muestra una señal orientada respecto de la cámara.

Desde v0.16.1, el ratón y las flechas miran arriba/abajo en sentido normal. Solo en POV puedes ver habitaciones aún no visitadas a través de puertas abiertas; las paredes y puertas cerradas siguen tapando la vista. El plano conserva su descubrimiento al entrar y la vista clásica conserva su oscuridad de exploración.

La revisión v0.17.0 da identidad propia a treinta familias y encuentros: el Carnicero, C-17, personal del hospital, fauna experimental y enemigos del castillo/laboratorio. Los cuatro jefes finales cambian de forma en sus tres fases. Armas del suelo, munición, frascos, documentos, llaves y piezas tienen formas reconocibles. La mira permanece centrada al inclinar la cámara. Detalles: [Modelos POV](docs/MODELOS_POV.md).

La simulación, los costes de armas y habilidades, el inventario, los puzles, las colisiones y los guardados se comparten entre ambas perspectivas. Detalles técnicos y alcance de pruebas: [docs/PRIMERA_PERSONA.md](docs/PRIMERA_PERSONA.md).

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
- **Puertas reconocibles:** hoja, ventanilla, barra antipánico, bisagras, marco y señal de cierre. Los accesos visibles conservan detalle en la oscuridad; una sala no visitada permanece oculta.
- **Interfaz:** botones y menús con tipografía Rajdhani local, mayor tamaño de texto, bordes y estados de foco coherentes. La fuente y su licencia SIL OFL van incluidas.
- **Progreso por explorar:** descubrir espacios y leer documentos también da EXP. Los mecanismos opcionales conceden recompensas una sola vez. Los sueros y la munición sobrante pueden ir al baúl compartido; las armas de los alijos nuevos permanecen disponibles para recogerlas cuando tengas espacio.
- **Minijuegos:** reloj con agujas, circuitos giratorios para seguridad y generador, mezcla de suero, presión hidráulica y calibración de frecuencias. Los teclados de Farmacia y Dirección incorporan las pistas del diario que hayas reunido. Los mecanismos conservan sus ajustes al salir.
- **Inicio guiado y jugable:** biblioteca → comedor → estudio → pasadizo → frasco y captura → hospital → primer golpe en la puerta → vestíbulo → tutorial e inyección. Tomar el frasco sella la cámara y ralentiza al personaje únicamente durante la captura física del Custodio. En el hospital, el primer golpe junto al cierre abre la puerta: ya no hace falta mantener E. La inyección con F espera hasta llegar al vestíbulo y cerrar la guía.
- **Oscuridad con acentos azules:** conserva los personajes y el hospital vectorial, con menos saturación y luz ambiental. Las paredes y puertas cerradas bloquean la visión; los muebles conservan colisión y proyectan sombras cortas y suaves, sin borrar media sala. Una sala nueva permanece negra hasta que entras; el plano recuerda lo explorado. Sin grano ni filtro retro.
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

El detalle de la validación y sus límites está en `docs/VALIDACION.md`. Es una ampliación jugable en 2D con arte vectorial y sonido sintetizado; el equilibrio de una partida completa aún requiere pruebas con jugadores.
