# UMBRAL · fase final · v0.14.0

Contiene spoilers y soluciones. Después de vencer al Regente, cruza la puerta de la galería del trono: su compuerta secreta desciende al laboratorio. Los guardados anteriores con el jefe del museo vencido pueden continuar. Conservas equipo, inventario, habilidades y desgaste del S-4. La inyección de vida máxima que reemplazó el rifle del hospital sigue en Sala de pruebas; el R-98 del castillo permanece.

## Zona y objetivo

El laboratorio es un mapa continuo de **156 × 128 casillas, 26 espacios y 40 puertas**. Las galerías cruzan cinco filas de sectores con rutas alternativas. Tiene 35 enemigos fijos: receptores ágiles con abalanzamiento, custodios de presión con carga, portadores de esporas y dobles que protegen el frente. El vestíbulo central ofrece camilla de tres espacios, baúl compartido y banco con alimentación independiente. El refugio impide daño y veneno sin curar salud ni reparar traje.

Hay tres muestras para el antídoto. Puedes completar sus rutas en cualquier orden. Las tres cámaras tienen cierres que no se pueden rodear por la conexión vecina. Los instrumentos conservan ajustes al salir, guardar y recargar. Los documentos se conservan en J y las piezas tienen pistas en Artefactos.

| Muestra | Recorrido |
|---|---|
| Suero crioprotector | Ampolla del Almacén refrigerante, suroeste → Intercambiador térmico, noroeste → Criobóveda 01. |
| Plantilla de reversión A-0 | Sonda de Criogenia → Control espectral; portamuestras del Biobanco → Cámara de genoma, noreste. |
| Catalizador de exclusión | Filtro de Sala de extracción y medio nutritivo de Secuenciación → Cultivos; rotor de Centrífugas → Bóveda de catalizadores, sureste. |

La tercera muestra activa una transmisión de Wren y el acceso al núcleo desde el vestíbulo. El doctor espera allí. En la antesala puedes leer el protocolo, tomar una reserva única y volver al refugio. El núcleo ocupa otro mapa de 60 × 56, con tres salas. La consola central combina las muestras, sella la contención e inicia la síntesis y el combate. El punto para Reintentar es anterior a esa activación y conserva los tres materiales.

## Instrumentos principales

- **Intercambiador:** cada mando añade dos pasos a su canal y resta uno a cada vecino, sobre una escala circular de ocho. Centra los tres en cuatro. Consume la ampolla refrigerante al confirmar correctamente.
- **Criobóveda:** pulsa SELLAR cuando la aguja atraviese la banda verde de cada válvula. Son tres sellos independientes. Una pulsación fuera de banda no consume materiales ni reinicia los sellos buenos. Se mide tiempo real solo mientras consultas el instrumento; el combate permanece pausado.
- **Control espectral:** combina filtros rojo/verde/azul para igualar el testigo de cada ventana. Ventanas: amarillo (R+V), magenta (R+A), cian (V+A).
- **Memoria A-0:** cadena superior A–T–C–G–A–T; completa debajo T–A–G–C–T–A. Requiere portamuestras y control espectral restaurado.
- **Cultivo:** conecta las celdas desde entrada hasta cápsula evitando pozos contaminados. Se puede retroceder por el último tramo. Una solución por índices, de izquierda a derecha y arriba abajo: 0 → 4 → 8 → 9 → 13 → 14 → 15.
- **Centrífuga:** las masas 2, 3 y 5 se colocan en seis alojamientos orientados; las fuerzas horizontal y vertical deben ser cero. Una solución usa las masas 2 y 3 en +X y la de 5 en −X. Requiere rotor y cultivo estéril.

## Equipo y desvíos opcionales

**Lanzagranadas GL-6:** lee el expediente de Ensayos balísticos. Recupera cierre en Criobóveda y tubo en Cámara de genoma. En el estuche de Ensayos ordena CIERRE → TUBO → ESPOLETA → PRUEBA. Entrega arma con cargador inicial y cinco granadas de reserva; excedentes al baúl. No es necesario para el antídoto ni para derrotar a Wren.

Usa **5** para alternar GL-6 y FL-4 si llevas ambos. La identidad `gl6` y la munición `am_gl6` son independientes de la conversión histórica del LG-4 al lanzallamas. El GL-6 tiene un disparo base, daño 210, recarga de 3,1 s y coste base de 42 de estamina antes de mejoras. El proyectil explota al chocar o al agotar recorrido. Respeta paredes; la explosión también puede herirte a corta distancia. Los jefes reciben el multiplicador de explosión del motor.

Construcción: **3 tornillos grandes + 4 pólvoras grandes → 2 granadas GL-6**, apilables hasta tres. Hay munición finita en la zona y en la reserva del núcleo. El banco permite daño, aguante, precisión y capacidad, con tres niveles por atributo; capacidad añade un disparo por nivel y no rellena el cargador.

| Mejora opcional | Pieza y destino | Mecanismo y efecto |
|---|---|---|
| M9 · Memoria de impacto | Matriz de Cultivos → Galería occidental | Apaga cuatro celdas; cada mando invierte también las contiguas. −10 % esfuerzo. |
| M12 · Compresión estable | Pistón de Control espectral → Descontaminación | Dos cilindros acoplados: +1 al propio y +2 al vecino; centra ambos en cinco. −10 % esfuerzo. |
| UZI · Alimentación constante | Motor del Almacén refrigerante → Depósito de seguridad | Intercambia placas: ENTRADA, CIERRE, TUBO, SALIDA. +6 balas de capacidad sin rellenar. |
| R-98 · Colimador | Cristal de Bóveda de catalizadores → Intercambiador | Anillos exterior a interior: LUNA, BÚHO, SOL. +8 % daño, −15 % dispersión. |
| FL-4 · Sello refractario | Sello de Archivo de donantes → Taller de contención | SELLO → MALLA → CERÁMICA. −10 % esfuerzo; no cambia el quemado leve. |

Cada mejora tiene su expediente, exige su pieza, se entrega una vez y añade cuatro tornillos pequeños y tres pólvoras pequeñas. El banco muestra los módulos instalados. Sala de extracción ofrece una ampliación de maletín; Descontaminación, una inyección amarilla. Hay suministros médicos y materiales repartidos por los sectores, sin generadores infinitos.

## Elias Wren / ORIGEN

Es el Dr. Elias Wren que el escuadrón buscaba en la mansión. Al activar la consola se inyecta la formulación ORIGEN mientras avanza la síntesis. La introducción es breve, permite moverse y no admite daño contra el jefe. Tiene **3600 HP en tres tramos obligatorios de 1200**. Sus transformaciones son invulnerables y aumentan radio y silueta; los límites de arena se ajustan para que no quede atrapado al crecer junto a un borde.

1. **Primera dosis:** anatomía todavía reconocible, abrigo roto, cuchillas, espinas y cargas rápidas.
2. **Masa replicante:** cuerpo mayor, avance más pesado, impactos amplios, cargas, marcas de contención y ondas expansivas.
3. **Reescritura total:** mayor tamaño, cargas de hasta 650 px/s, tres cortes con avisos individuales, salto al punto señalado, abanico más denso de espinas, marcas y ondas.

Cada ataque tiene anticipación y recuperación. Las cargas que chocan con piedra dejan 2,6 s de exposición; recibir impactos durante recuperación aumenta el daño un 25 %. Las ondas son anillos que se expanden, no un daño instantáneo sobre toda la sala. Las marcas y saltos fijan su destino antes del impacto. Las habilidades temporales lo ralentizan sin congelarlo ni saltarse fases.

Guardar conserva fase, salud y posición; cargar combate concede recuperación de tres segundos. Al vencer se cancelan proyectiles, ondas, marcas y campos temporales. La síntesis completa un último ciclo de tres segundos. No se abre la salida ni se elige un final automáticamente.

## Dos decisiones y epílogo jugable

La ventana del antídoto muestra dos opciones y pausa la partida. No hay una selección automática. La decisión se guarda y no puede cambiarse dentro de esa misma continuación. Puedes mantener un guardado manual anterior para ver la otra.

**Tomar el antídoto:** elimina todas las habilidades de la rama Mutante y los poderes neutros asociados al compuesto, sus asignaciones, efectos activos y mejoras de salud mutantes. Conserva entrenamiento humano, objetos e inyecciones de salud adquiridas. El Riutex queda a cero y desaparece su barra. Se pierde el brazo reconstruido; el original no vuelve. La salida lateral se abre.

**No tomarlo:** conserva las adaptaciones y el cuerpo adquiere una silueta de transformación completa. La salida lateral también se abre.

En ambos casos hay que atravesar la salida y caminar por las calles de San Gabriel hacia el norte. El mapa del epílogo tiene 66 × 62 y cuatro espacios. Al llegar a evacuación aparece el helicóptero: con cura desciende la cuerda y Axel es extraído con vida; sin cura los soldados abren fuego y lo abaten. Los rotores, la aeronave, la cuerda o los disparos se representan en la escena antes del final. La secuencia final no admite combate del jugador. Se puede pausar; el tiempo no avanza en otras ventanas. Cargar un final terminado vuelve a mostrar su resultado.

## Verificación

`endgame.test.js` prueba progresión, cierres, instrumentos, equipo, radio de apariciones, guardados, tres formas, pérdida de poderes y ambos finales. `endgame_browser.py` recorre físicamente las 26 salas y los doce mecanismos, retirando enemigos para aislar geometría; después combate Wren con R-98 base, 44 balas totales iniciales, 100 HP y cuatro curas, sin traje, módulos ni habilidades compradas. Su controlador conoce patrones: valida respuestas posibles, no dificultad humana. Para comprobar los botones finales se añaden habilidades después del combate, sin intervenir en la victoria. Ambos desenlaces recorren salida, calle, aeronave y carga reales.

`endgame_visual.py` comprueba disparo, explosión y recarga reales del GL-6, instrumentos, decisión y HUD a 720p. Las capturas preparadas de las tres formas ilustran arte y avisos; son independientes del combate íntegro. Los resultados completos están en RESULTADOS.json y los registros del ZIP. El equilibrio de recursos de toda la campaña sigue requiriendo partidas humanas.
