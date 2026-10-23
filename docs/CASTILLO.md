# Valcárcel · fase 3 · v0.13.0

Este documento contiene spoilers. La salida oriental de la Matriarca continúa por una escalera hasta los calabozos del museo-castillo. No elimina equipo, experiencia, habilidades ni desgaste del S-4. Los guardados anteriores con la araña vencida pueden usar esa salida.

## Calabozo y oído

Antes de la reja hay camilla, baúl, suministros finitos y una advertencia. Entrar en el patio sella el regreso y crea un punto de control previo. El Tallador, antiguo restaurador del museo, lleva implantes de cuchillas y no tiene percepción visual.

Patrulla seis posiciones fijas alrededor de las columnas. El recorrido no consulta la posición del jugador; así pasa por zonas cercanas sin seguirlo a escondidas. Caminar tranquilamente sobre piedra limpia no le da un destino, aunque el motor antiguo conserve su señal genérica de pasos. Correr, pisar cristales/cadenas/metal, golpear mobiliario al moverse y disparar producen eventos acústicos localizados. Las paredes reducen su alcance. El contacto físico también provoca una reacción.

Tras escuchar tiene 0,65 s de reacción y corre hacia el origen guardado. Una vez iniciada la carrera no sigue posiciones posteriores del jugador. A distancia de corte avisa 0,8 s y golpea un arco de 155 px; por contacto, avisa 0,55 s. Su daño base es 34 antes del multiplicador y las defensas del motor. Después queda expuesto 2,2 s y recibe más daño. Vuelve a patrullar cuando termina. Ruido continuado no reinicia eternamente su reacción. La navegación tiene en cuenta su radio para rodear las columnas.

Tiene 720 HP. La derrota deja una llave real en el lugar donde cayó; matar al enemigo sin recogerla no abre la escalera. Recogerla libera tanto el regreso como el acceso al vestíbulo. Su salud, muerte y llave pendiente se conservan al cargar.

## Dos plantas y refugio

| Mapa | Casillas | Salas | Puertas |
|---|---:|---:|---:|
| Calabozos | 65 × 50 | 7 | 5 |
| Castillo, planta baja | 132 × 100 | 24 | 26 |
| Castillo, planta alta | 132 × 91 | 20 | 28 |
| Sala real y accesos | 49 × 43 | 3 | 2 |

Las plantas abiertas tienen tres pares de escaleras: vestíbulo/balcón central, claustro/archivo de linajes y capilla/observatorio. Las galerías y la pasarela sur ofrecen bucles. Solo las torres y la sala real requieren sus mecanismos principales; las búsquedas de equipo se pueden intercalar.

El vestíbulo tiene camilla con tres espacios manuales, baúl compartido y banco con alimentación independiente del generador opcional del hospital. Es refugio: impide daño y veneno mientras permaneces dentro. No regala curas, munición ni reparación del traje. Las criaturas corrientes conservan salud y posición al salir y regresar; las muertas no reaparecen. Se dan dos segundos de margen al restaurar enemigos vivos.

## Campanas: recorridos principales

Se pueden completar en cualquier orden. Tocar una campana no sustituye los mecanismos de la otra; las dos liberan el cierre real en la planta baja. Las pistas principales indican alas amplias en el mapa. Los documentos y artefactos dan las relaciones entre salas. El mapa no revela habitaciones sin visitar.

**Poniente:** lee la nota de la galería occidental. El aceite está en Cocinas, abajo. Úsalo en la Galería de retratos y reconstruye SEMILLA → RAMAS → SOL → ESCARCHA. Esto devuelve alimentación a los cuatro espejos de la Biblioteca alta. Desde la entrada izquierda a media altura, dirige el haz al receptor inferior izquierdo: espejos `/`, `/`, `\`, `/`. Después recupera las pesas de la Forja y llévalas al Taller de contrapesos, arriba. Reparte las seis entre ambas bandejas: 1 + 2 + 3 + 5 frente a 4 + 7. Con luz y once unidades por lado se abre la torre de poniente. Entra y toca su campana.

**Levante:** recoge el pasador de Conservación y ve a Sala de mareas, abajo. Capacidades 12/7/5, estado inicial 12/0/0 y meta 6/6/0. Cada trasvase termina al vaciar origen o llenar destino. Una solución, usando A/B/C, es A→B, B→C, C→A, B→C, A→B, B→C, C→A, B→C, A→B, B→C, C→A. Recupera la carta en Archivo del subsuelo y sube al Archivo astral: alinea BÚHO, LUNA, SERPIENTE de fuera hacia dentro. En Sala de resonancia repite HOJA → OLA → LUNA → OLA → HOJA. Su reproducción tiene audio y texto; no depende de distinguir tonos. La torre de levante se libera. Entra y toca su campana.

Cada mecanismo conserva ajustes al cerrar con Esc, cambiar de piso y guardar. Equivocarse no gasta componentes. Confirmar la solución consume únicamente las piezas correspondientes. Los documentos permanecen en J.

## R-98 y cinco búsquedas opcionales

| Equipo | Expediente y piezas | Mecanismo y recompensa |
|---|---|---|
| R-98 Vésper | Armería histórica; cañón en Conservación y visor en Cartografía | Estuche del Mausoleo: desliza las placas A–H con el hueco abajo a la derecha. Entrega rifle, ocho cartuchos de reserva y su cargador inicial; si no cabe, va al baúl. |
| M9 · Cerrojo de seda | Depósito de guardia; placa en Archivo de la guarnición | Capilla de servicio: HOJA, SOL, LUNA, ESCARCHA. −10 % esfuerzo, −15 % dispersión y expansión de mira. |
| M12 · Choke de cortina | Registro de cazadores; resorte en Capilla de servicio | Tres indicadores al centro. +8 % daño y +12 % alcance. |
| UZI · Alimentador de torre | Bodega; leva en Archivo de adquisiciones | Cuatro ruedas acopladas: girar una mueve la siguiente en sentido opuesto; centra todas las muescas. +8 balas de capacidad. |
| Rifle anterior · Cámara de enfoque | Cartografía; lámina en Guardería de los herederos | Abre cinco obturadores; cada mando afecta también a sus dos vecinos. Desde el inicio, pulsa una vez cada mando. +10 % daño y −15 % dispersión. |
| FL-4 · Válvula cerámica | Conservación; válvula en Relojería monumental | Ordena MALLA → CERÁMICA → COBRE. −10 % esfuerzo y +10 combustible por tanque; conserva el quemado leve. |

Las cinco mejoras se instalan una sola vez y aparecen en el banco. Comprar capacidad no rellena un cargador. No requieren poseer ya el arma: el módulo se aplica al recuperarla. Cada búsqueda entrega además cuatro tornillos pequeños y tres pólvoras pequeñas, con excedentes al baúl.

El R-98 tiene 110 de daño, 1260 px de alcance, dispersión 0,0015, cargador de cuatro y recarga de 2,9 s. Su cadencia lenta y coste de 38 de estamina base obligan a elegir los tiros. Usa cartuchos propios en pilas de ocho. Construcción: tres tornillos grandes y tres pólvoras grandes producen cuatro cartuchos. El banco permite daño, aguante, precisión y capacidad, tres niveles cada uno; capacidad añade una bala por nivel sin recargar gratis. La tecla 4 alterna ambos rifles si están en el maletín.

## Enemigos y archivo

Hay 37 enemigos fijos entre las dos plantas: lebreles de vitrina rápidos con abalanzamiento, guardianes del tapiz con alabarda y carga, polillas de ceniza con tres proyectiles y portadores del relicario que protegen el frente con escudo. Sus ataques tienen avisos. La progresión no genera enemigos o materiales infinitos.

Los expedientes UMBRAL revelan que Axel recibió una transfusión experimental años antes del hospital. Su receptor celular le permite revertir tejido sin perder la identidad. Sigue siendo vulnerable al daño y al agotamiento; esa condición no es una cura universal. El archivo también conserva su capacidad para negarse a ser una muestra del Custodio.

## Regente Hueco y final

La antesala ofrece documento de combate, una reserva única y regreso al refugio. Entrar en la sala sella la puerta y crea un punto de control. Tiene 2400 HP, divididos en tres tramos obligatorios de 800. Durante las mutaciones no recibe daño; un disparo fuerte no salta formas.

1. **Hierro juramentado:** espada y escudo, movimiento ágil. El escudo reduce daño frontal mientras no esté recuperándose; los flancos quedan expuestos. Cortes dobles, golpe de escudo y cargas.
2. **Carne bajo el blasón:** rompe la armadura y aumenta de tamaño. Camina más despacio; golpes pesados y cargas hacen más daño. Las ondas dibujan tres marcas antes de activarse.
3. **Juramento roto:** acelera, encadena tres cortes con un aviso nuevo entre golpes y combina cargas, saltos al punto marcado y ondas. El destino del salto queda fijado antes de ejecutarlo.

Las cargas que chocan con piedra dejan una recuperación larga. Las pausas reciben un 25 % más de daño. Las habilidades temporales ralentizan al jefe sin congelarlo ni saltarse fases. Guardar conserva fase, salud y posición; cargar durante combate da una recuperación de tres segundos. La victoria elimina sus efectos, abre la puerta tras el trono y conserva ese estado al cargar. Cruzar la galería conduce ahora a la compuerta secreta y al laboratorio UMBRAL, fase 4 (v0.14.0).

## Comprobación y límites

Las rutas de las 44 salas, los doce tableros, las piezas, los dos cierres de torre, el equipamiento y las cargas se prueban con movimiento, colisiones, puertas y botones reales, retirando enemigos solo para aislar geometría. El Tallador se derrota por separado con IA activa, M9 base y recursos finitos. El Regente se prueba tanto con M9 base como con el R-98 ganado y cuatro mejoras de nivel 1. Los controladores conocen los avisos y no representan una primera partida humana. Las capturas preparadas de las formas tampoco equivalen a combates completos. Los resultados precisos están en RESULTADOS.json y los registros incluidos en el ZIP.
