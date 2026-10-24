# RIUTEX 2 · Historia completa · v0.20.1

La campaña parte de tu base v0.2.2 y recorre mansión, hospital, cloacas/fábrica, museo-castillo y laboratorio UMBRAL, con cuatro jefes finales de tres formas y dos desenlaces.

## Jugar y publicar

Abre `RIUTEX2_Historia_Completa_v0.20.1.html` en un navegador de escritorio con teclado y ratón. Para el proyecto fuente, ejecuta `npm start` y visita `http://localhost:8000`. El sonido comienza con la primera interacción. No hay dependencias de npm que instalar.

Para itch.io utiliza **RIUTEX2_itchio_v0.20.1.zip**, que contiene un `index.html` integrado en la raíz. Súbelo como juego HTML para navegador y permite pantalla completa. El HTML incluye código, estilos, fuentes, Three.js y recursos locales: no descarga modelos ni bibliotecas de una CDN. Los archivos se generan con `npm run build`.

## Primera persona 3D

Activa **Primera Persona POV** en Opciones o desde Esc → Pausa. Empieza desactivada. Puedes cambiar a la vista clásica en el mismo lugar y con los mismos recursos, sin reiniciar. El ajuste se recuerda en el navegador.

El POV usa una escena WebGL con mallas reales: criaturas articuladas, mutaciones de jefes, armas, muebles, mecanismos y objetos del suelo. Hay materiales de ambiente con relieve y rugosidad, linterna con sombras, luces de instalaciones, techos sólidos y puertas con marcos y apertura animada. Las escaleras tienen peldaños, pasamanos y una flecha 3D. Es un estilo procedural generado localmente y requiere WebGL; si el navegador no puede iniciarlo, conserva disponible la vista clásica.

El ratón se captura al entrar o volver al juego. Se libera al abrir habilidades, inventario, diario, mapa, mecanismos o pausa y se intenta recuperar al cerrar la ventana. **Esc libera y pausa.** Si el navegador exige otro gesto, usa **Bloquear ratón**; también puedes mirar arrastrando con clic derecho o con flechas. El primer clic destinado a recuperar el control no gasta una bala.

La sensibilidad va de 25 % a 250 %, con 100 % normal. X e Y comparten la misma ganancia angular. Arriba mira arriba y abajo mira abajo; la inclinación llega a unos 80 grados por dirección. La retícula permanece centrada. Los disparos normales consideran la altura de la mira y de los cuerpos; los muebles bajos pueden cubrir las piernas sin ocultar una cabeza. El golpe mueve el brazo izquierdo existente. La regeneración muestra tejido azul y los desenlaces reflejan la decisión del antídoto.

Solo en POV se puede ver una habitación desconocida a través de una puerta abierta. Paredes y puertas cerradas siguen tapando. El plano descubre cada sala al entrar; topdown conserva su oscuridad de exploración. La campaña comparte simulación, colisiones y progreso entre ambas vistas.

## Artefactos y documentos

Las llaves desaparecen de Artefactos al terminar todos sus usos. Si todavía sirven para otra cerradura permanecen con una explicación. Las puertas ya desbloqueadas recuerdan ese acceso al cerrarlas, cambiar de planta o cargar. Las piezas instaladas dejan el maletín de artefactos sin perder su efecto ni el progreso del mecanismo. También se limpian sobrantes de partidas anteriores.

Se añaden 24 documentos narrativos, unas 3358 palabras, con cartas y testimonios sobre Axel, Wren, pacientes, familiares, trabajadores y víctimas del proyecto. Complementan la exploración sin introducir requisitos nuevos ni soluciones de puzles. Se conservan en J para releerlos.

## Guardado al salir

El juego guarda una sesión cada diez segundos, al pausar, ocultar o cerrar normalmente la página y después de acciones importantes. **Continuar → Continuar sesión** recupera posición, recursos, inventario, documentos, habilidades, mecanismos y enemigos heridos. Los tres huecos de las camillas y el punto de Reintentar siguen separados.

En **Pausa → Partidas y copias** puedes descargar una copia JSON e importarla después. El guardado pertenece al mismo navegador y origen web; no se sincroniza con la cuenta de itch.io. Borrar datos, cambiar de dominio o usar navegación privada puede perderlo. Un cierre forzado puede impedir el último guardado: conserva una copia descargada para trasladar o respaldar la partida. Si el navegador bloquea el almacenamiento, el juego avisa.

## Progresión

Solo dan XP las bajas, los documentos nuevos y las muestras consumidas. Leer un documento nuevo da **2 XP** una sola vez; absorber una muestra desde K da **15 XP** y consume el objeto. Recoger una muestra sin absorberla no adelanta su premio.

Los enemigos normales dan 1–2 XP en hospital y cloacas, 2–3 en castillo y 3–4 en laboratorio. Los minijefes dan 6–10; los jefes finales, 11, 14, 18 y 29. Las crías invocadas no dan XP y una misma muerte no vuelve a pagar. Explorar salas, resolver mecanismos, recoger equipo, tocar campanas o completar recompensas opcionales da sus objetos y accesos, sin XP adicional. Las partidas conservan experiencia y habilidades ya obtenidas.

La red de K tiene 153 opciones, comienzo común, cruces, ramas humanas azules y mutantes moradas, y cuatro decisiones doradas de dos alternativas: dos humanas y dos mutantes. Cada pareja permite escoger una. Las habilidades activas permiten asignar una tecla libre. El panel explica costes, requisitos y qué alternativa se cierra.

## Equipo y controles

El AK pertenece al prólogo. Al despertar en el hospital pierdes ese equipo. La M9 está en el vestíbulo; la escopeta y la UZI requieren exploración y mecanismos opcionales. La antigua recompensa de rifle del hospital es una inyección de vida máxima. El FL-4 se consigue en la fábrica, el R-98 en el castillo y el GL-6 en el laboratorio mediante sus rutas opcionales. El banco permite mejorar daño, aguante, control o precisión y capacidad según el arma. El traje S-4 es opcional y su barra solo se recupera reparándolo en el banco.

- **WASD / Shift:** moverte y correr; en POV, A/D se desplaza de lado.
- **Ratón / clic:** apuntar y disparar. **Clic derecho:** golpe. **R:** recargar. **1–5:** equipar armas; algunas teclas alternan dos armas.
- **E:** interactuar y cerrar puertas abiertas. **F:** inyección.
- **Tab:** maletín. Sus pestañas conectan Construcción, Artefactos, Documentos, Mapa y Adaptación.
- **J / M / K:** documentos, mapa y habilidades. Repite el atajo activo o pulsa Esc para volver.
- **Esc:** pausa o cierre de ventanas; libera el ratón en POV.

Los disparos gastan estamina según el arma y el golpe infectado consume Riutex. Mucho ruido fuerte seguido puede atraer al Carnicero desde lejos. Rompe su línea de visión antes de entrar en una taquilla: si te ve esconderte, puede comprobarla. Los enemigos ciegos investigan ruidos y contacto.

La primera captura de la mansión y la huida del hospital son secuencias jugables. Durante la primera huida, alcanza la puerta del fondo para que el primer golpe rompa el cierre; sigue la señal hasta el vestíbulo. Tras la guía, pulsa F para inyectarte. Después queda abierta la exploración del hospital.

Consulta [README.md](README.md) para el contenido completo y [docs/VALIDACION.md](docs/VALIDACION.md) para las pruebas y su alcance. Los planos revelan el mapa entero y contienen spoilers. Las pruebas automatizadas no sustituyen una partida humana completa ni garantizan rendimiento en todos los equipos.

## Ajustes de v0.20.1

Disparar ya no produce destello ni ilumina de golpe el escenario. Los objetos recogibles muestran un halo y un brillo pequeño, también en topdown. La captura del ratón se recupera con una interacción si el navegador rechazó el intento automático; no hace falta pulsar un botón de bloqueo aparte. Al perder el foco se pausa y Reanudar vuelve a capturarlo.

La fábrica tiene 58 enemigos ambientales (16 más), con cuatro patrullas, grupos variados y seis suministros finitos adicionales. El vestíbulo se mantiene como refugio. No se aumenta la XP por enemigo.
