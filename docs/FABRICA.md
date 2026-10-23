# Fábrica de vertidos · implementación y comprobación

La zona continúa el hospital con el mismo inventario y árbol. Archivos: `works-levels.js` (geometría, piezas, documentos), `works-enemies.js` (fauna), `works-puzzles.js` (mecanismos), `works.js` (progresión, ensayo y persistencia), `works-art.js` y `works.css` (representación).

## Recorrido principal

- Flujo: rotor del taller → cuadro de trasvase → aliviadero y esclusa → volante azul del pozo.
- Cuarentena: batería de la cámara frigorífica → nueve indicadores de Veterinaria → quirófano → volante ámbar. La radio queda en este recorrido, sin obligar a escucharla.
- Presión: acople de Herrería → engranajes de la Sala de presión → prensa → volante verde.
- Volver al panel del vestíbulo e instalar los tres. La salida no consulta los estados de la radio, filtro, grúa ni arena.

## Opcionales y reglas

El filtro pide carbón del Aliviadero y membrana de Veterinaria; el orden es malla, carbón, membrana. La grúa requiere el precinto de Registro de hornos; sus tres soportes deben pasar al poste de descarga sin colocar uno grande sobre otro pequeño. El módulo obtenido modifica únicamente la M12. El maletín del almacén modifica únicamente la UZI. Ambos aparecen en el banco.

La radio guarda su transcripción. La autorización física del almacén pide gota, huella, sol. Un error borra el orden y no inicia la trampa. Antes de confirmar la tercera placa puedes volver al depósito. Después se cierran ambos lados. Ocho ciclos, 22 enemigos en total, con K-9 en el último. Cada grupo aparece tras aviso en bocas distantes; los individuos se separan para evitar una pila de cuerpos en el mismo punto. La reserva da una carga por ciclo y algunas inyecciones. No se vuelve a generar al cargar.

`story.works` guarda piezas montadas, mecanismos, filtro, módulos, radio y ensayo. La partida almacena instantáneas de tipo, identidad, posición, salud y último destino de los enemigos del ensayo. Al cargar tienen una breve tregua; no se duplican muertos, reservas ni recompensa. Reintentar tras morir carga el checkpoint del cierre inicial, con los recursos que se llevaban entonces.

## Límites de validación

El navegador recorre las 30 salas con colisiones, puertas y piezas reales, retirando enemigos solo para aislar geometría. Resuelve mecanismos con botones y recarga la página. Se prueban veneno, oído, daño, muerte y guardado por separado. La arena se combate con IA activa, movimiento y recargas del motor, salud y munición finitas preparadas. El controlador conoce las posiciones y avisos; no sustituye una partida humana ni mide el equilibrio de recursos de toda la zona.

Los planos completos contienen spoilers. El colector principal conduce a la última estación y a la Matriarca. La salida posterior a su victoria continúa por las escaleras del museo (fase 3 en v0.13.0).


## Extensión de v0.12.0 y reemplazo del FL-4 en v0.12.1

Los archivos `depths-levels.js`, `protection.js`, `arachnids.js`, `depths.js`, `depths-art.js` y `depths.css` añaden la última estación, una cueva y dos misiones opcionales. Las 30 salas de fábrica y su red no cambian; se añaden 14 arañas ambientales en cuatro grupos. El último colector tiene cuatro espacios y dos cierres, en otro mapa de 64 × 53.

### Recorridos opcionales (contiene soluciones)

FL-4: documento del Depósito logístico → regulador del Taller de rotores + válvula de inyección de Calderas → estuche del Muelle de chatarra → plano deslizante. Los ocho fragmentos A–H deben coincidir con la guía y dejar el hueco abajo a la derecha. Una recompensa por partida; arma y tres tanques de reserva van al baúl si no caben. La identidad del expediente, las piezas y el estuche se conserva para no repetir progreso de guardados anteriores.

S-4: Seguridad en vestíbulo → tejido del Pozo de flujo (pide bombas) + sellos de Veterinaria + resina de Calderas → presión detenida en Fundición → Celdas de recuperación (pide cuarentena) → circuito del esterilizador → custodio de 560 HP y tres crías → estuche del traje. El circuito tiene entrada a la izquierda y salida en el último nodo de la derecha. Todos los ramales deben recibir corriente. Las posiciones persisten y se pueden restablecer sin perder componentes. Comprobar un circuito correcto inicia la batalla; el checkpoint anterior conserva sus piezas para reintentar. La celda se bloquea durante el encuentro. La victoria abre el acceso, pero el traje se recoge físicamente después.

### Traje y persistencia

`story.works.suit` guarda propiedad, capa actual y tres niveles (0–3). Capacidad: 90 + 30 × durabilidad. Desgaste: daño recibido × (0,85 − 0,08 × protección). La absorción termina al agotarse la capa y el exceso llega a salud. Las invulnerabilidades y reducciones previas se mantienen. Veneno entrante: × (0,70 − 0,12 × resistencia), daño continuo: × (0,75 − 0,12 × resistencia), solo mientras la capa esté intacta. El filtro opcional se combina con la reducción de exposición del traje, sin inmunidad.

Reparar exige banco con corriente y materiales del maletín: un tornillo pequeño por cada 30 puntos faltantes (redondeado arriba) y una pólvora pequeña por cada 60. Solo se consume al completar una operación válida. Aumentar capacidad no cambia la capa actual; tampoco curar, entrar al refugio o cargar. El equipo no ocupa una casilla del maletín y no se puede duplicar guardándolo en el baúl. Se consulta y mejora en la misma lista del armero que las armas.

### Matriarca y cierre de fase

El mapa `hospitalnest` tiene una estación de preparación, pasillo, cueva y salida. Se entra por el colector con tres volantes instalados. La reserva es finita; antes de cruzar al interior puede regresarse al armero. La cueva oculta sus zonas sin explorar y conserva la visión dirigida al jugador.

Matriarca: 1800 HP repartidos en tres tramos de 600; el daño no salta tramos y cada mutación dura tres segundos. Fase 1: dos proyectiles venenosos de 520 px/s sobre una dirección fijada durante un aviso de 0,9 s. Fase 2: carga de 550 px/s, salto con destino anunciado y mandíbulas; fase 3 combina los tres, carga a 600 px/s y vuelve al veneno. Cada patrón tiene recuperación. Choque contra roca: 2,4 s de exposición. Daño durante recuperación: +20 %. Los poderes de tiempo ralentizan sin congelar.

Capullos con aviso de 1,8 s y aparición distante. Intervalos de invocación 12 / 8 / 6,5 s; límite de 7 / 7 / 9 crías vivas. No otorgan materiales ni EXP. Cada cría tiene 22 HP y deja una pequeña charca temporal. Al vencer, se cancelan ataques y crías, se abren los cierres y se guarda. Cruzar la salida este conduce ahora al calabozo de Valcárcel.

`story.works.depths` guarda mecanismo, custodio, reserva, contador de identidades y estado de la Matriarca. Un guardado explícito durante el combate conserva fase, salud, posición y crías con una tregua al cargar. El checkpoint de reintento es el punto previo al combate, con sus recursos. La victoria no reaparece al cargar. Una partida antigua de v0.11.0 conserva sus tres válvulas y ahora accede a la estación.


### FL-4: combate, combustible y guardados

`flamethrower.js` define un arma automática de alcance base 170, 80 de combustible y un pulso nominal cada 0,1 segundos. Cada pulso cuesta 2,7 de estamina antes de mejoras y causa 2,3 de daño directo a un máximo de tres enemigos en un cono estrecho. Respeta paredes. Los jefes reciben ×0,7 del contacto. No genera explosiones. El quemado dura tres segundos, causa 1,8 de daño por segundo (×0,5 contra jefes) y renueva su duración sin sumar intensidades. El daño residual se aplica en intervalos; las mutaciones de los jefes conservan su tregua. El daño de fuego no añade empuje ni aturdimiento a enemigos normales, de modo que puedan contraatacar.

Cada recarga de 2,8 segundos consume un objeto `am_fuel` y llena el depósito. El combustible sobrante se descarta; no se devuelven tanques parciales. Una recarga cancelada no consume el tanque. Fabricar añade un tanque a la reserva, nunca al depósito cargado. El coste es 2 tornillos grandes y 3 pólvoras grandes; la receta está visible en Construcción para RIUTEX 2. Los tanques se apilan hasta cuatro y tienen icono propio. La reserva del HUD cuenta tanques, mientras el aro cuenta combustible.

El armero conserva los cuatro costes y niveles existentes por arma: daño +10 % por nivel, aguante −8 % de estamina por nivel, control +10 de alcance por nivel y depósito +15 de combustible por nivel. Un depósito gastado conserva su combustible después de comprar capacidad o cargar la partida. El traje S-4 no cambia.

Antes de cargar una partida RIUTEX 2, se transforma una copia de los datos: `w_launcher` → `w_flamethrower`, `am_grenade` → `am_fuel`, selección activa y niveles de mejora hacia el nuevo identificador. Se convierte la proporción cargada respecto al antiguo cargador mejorado; cero sigue cero. También se convierten baúl y objetos soltados. Los objetos que ya usan el nuevo identificador no se vuelven a convertir. Las definiciones del lanzagranadas de los niveles internos de RIUTEX 1 se conservan.
