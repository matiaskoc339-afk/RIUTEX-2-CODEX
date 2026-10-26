# IA táctica · v0.26.0

La dificultad se basa en observar, elegir una posición y comprometer un ataque. La revisión conserva la salud, el daño, los premios de EXP y las fases existentes. Funciona en topdown y primera persona con la misma simulación.

## Los cuatro jefes principales

El Carnicero, la Matriarca, el Regente y Wren eligen ataques según distancia y fase. Su memoria reciente distingue movimiento lateral repetido, permanencia en un lugar y una recarga que realmente hayan podido observar. Las últimas elecciones reducen la probabilidad de repetir siempre la misma secuencia.

- **Carnicero:** presión cercana, gancho y embestida; en mutaciones posteriores combina intercepción y presión química. Busca un carril libre antes de favorecer una carga.
- **Matriarca:** conserva el veneno y la distancia en la primera forma; las siguientes favorecen cargas, saltos e intercepción cuando el jugador rodea la arena.
- **Regente:** mantiene distancia de espada y escudo, se coloca lateralmente y cambia a presión pesada y control de zona en sus otras formas.
- **Wren:** alterna agujas, presión cercana, cargas, ondas y zonas según su mutación y lo que haya observado.

Una recarga debe observarse durante al menos 0,28 segundos antes de influir en una respuesta, y esa respuesta tiene su propio intervalo. No cancela el aviso de un ataque en marcha ni la recuperación que permite contraatacar.

La anticipación utiliza desplazamiento observado y se limita a 72 unidades del mundo. Se calcula **antes** de anunciar el ataque: dirección y marca permanecen fijas después. Los avisos completos, choques contra paredes y pausas de recuperación se conservan. Los jefes no leen teclas ni órdenes futuras del ratón. Si pierden visión o el jugador se oculta, investigan el último punto visto durante un tiempo limitado; no actualizan su destino con coordenadas ocultas.

## Monstruos comunes

Los infectados recuerdan la última posición vista y el origen de un ruido. Al perder la pista revisan varios puntos cercanos y después dejan de buscar. Los refugios, el camuflaje, los armarios y la oclusión siguen limitando sus sentidos.

Los corredores, cazadores y arañas se distribuyen por flancos diferentes. Los pesados presionan desde el frente. Los tiradores buscan distancia y una línea de fuego despejada cuando un compañero les tapa. Las ráfagas y los golpes anunciados mantienen su dirección; una maniobra lateral no redirige el ataque a mitad de ejecución.

La navegación usa suelo transitable, respeta el tamaño del cuerpo y evita refugios y puertas cerradas. Una búsqueda de ruta tiene un presupuesto máximo de 2200 nodos y se reutiliza durante un intervalo; no ejecuta una búsqueda completa cada frame.

## Perseguidores

El Carnicero de las plantas explora una continuación probable del recorrido cuando ve movimiento. Al perderte comprueba el último lugar visto y rincones próximos, con pausas para escuchar. Un armario sin testigos no revela tu posición. La persecución inicial y su golpe obligatorio en el cierre conservan su guion.

El Tallador sigue siendo ciego: después de fallar y recuperarse investiga el entorno del último ruido, acepta una nueva pista audible y termina regresando a patrulla. No obtiene tu posición silenciosa ni puede cambiar el corte ya anunciado. La pausa detiene estas investigaciones.

## Guardado y comprobación

Los campos de memoria están inicializados en los constructores y se conservan con la sesión web. Las sesiones anteriores empiezan sin inventar observaciones previas. Las rutas se reconstruyen al cargar; los ataques peligrosos siguen utilizando la tregua existente.

Las pruebas nuevas cubren observación, búsqueda, flancos, puertas, disparos, reacción a recarga, ocultación, avisos, pausa y guardados. Los cuatro jefes se prueban también con controladores que mueven al jugador, disparan, recargan y consumen recursos finitos, sin modificar la vida del jefe para ganar. El controlador de la Matriarca prioriza amenazas cercanas y evita gastar munición en crías lejanas que flanquean.

Los controladores conocen los avisos y no representan una primera partida humana. Las pruebas de navegador usan Chromium y SwiftShader; no son una medición de FPS de una GPU física. Los resultados y el alcance de cada escenario figuran en [VALIDACION.md](VALIDACION.md) y [RESULTADOS.json](RESULTADOS.json).

## Distribución

El paquete para itch.io conserva un único `index.html` integrado. El ZIP editable se entrega sin duplicar compilados, capturas, registros ni planos exportados regenerables. Se retiró la ilustración antigua del menú: quedaba completamente cubierta por el fondo Canvas actual y se quitó también su referencia CSS. Se conservan recursos activos, documentación, pruebas y licencias. [Auditoría de archivos](DISTRIBUCION.md).
