# Guardado web e itch.io · v0.19.0

## Archivo para publicar

Ejecuta `npm run build` y sube `dist/RIUTEX2_itchio_v0.19.0.zip` a itch.io. Elige un proyecto HTML que se reproduce en el navegador. El ZIP contiene un único `index.html` en la raíz con scripts, estilos, fuentes y gráficos integrados, sin descargas externas. Activa pantalla completa para la experiencia de escritorio; teclado y ratón siguen siendo necesarios.

El paquete de fuentes y el HTML de descarga individual son entregas distintas del ZIP listo para itch.io. No hay que poner el juego dentro de otra carpeta al preparar la subida.

## Qué se guarda

La sesión usa `localStorage` con claves estables `riutex2_session_v1` y `riutex2_session_backup_v1`. Cada escritura es síncrona y conserva una segunda copia. El almacenamiento se comprime con un diccionario limitado; los guardados JSON anteriores se siguen leyendo. No depende de un servidor ni de esperar una petición de red durante el cierre.

Se captura una sesión:

- Al empezar o cargar una partida y cada diez segundos de juego.
- Al recoger objetos, comprar habilidades, consumir muestras y fabricar munición.
- Al pausar, volver al menú, ocultar la pestaña, navegar a otra página o cerrarla normalmente (`visibilitychange`, `pagehide`, `beforeunload`).

Se incluyen mapa y posición, salud, estamina, veneno, Riutex, munición, inventario, baúl, documentos, habilidades y enfriamientos; también puzles, puertas y cierres dinámicos, enemigos heridos, fase y salud de los jefes, progreso de las oleadas y secuencias iniciales. Las manos y las preferencias POV corresponden con la historia restaurada.

Los proyectiles transitorios se limpian al reconstruir. Un ataque de jefe que estuviera ejecutándose vuelve a una recuperación o aviso, para evitar un golpe invisible al cargar. No se rellenan recursos ni se cura al jugador por cerrar el juego.

## Continuar y Reintentar

En **Continuar** aparece **Continuar sesión** además de los tres huecos manuales. Las camillas guardan y cargan esos tres espacios. El guardado periódico no los sustituye ni modifica el punto de Reintentar.

Al morir, la sesión persistente pasa al último punto de control de Reintentar: cerrar el navegador en la pantalla de muerte no recupera una instantánea viva anterior a la derrota. Empezar una partida nueva reemplaza la sesión automática, conservando los tres espacios manuales.

## Copias y límites del navegador

En **Pausa → Partidas y copias** puedes descargar una copia JSON e importarla después, también para cambiar de navegador o trasladar la partida. Las copias dañadas no sustituyen una partida válida. La importación no ejecuta código del archivo.

Cuando el navegador bloquea el almacenamiento o se agota su cuota, el juego no anuncia un guardado manual exitoso y muestra un aviso. Puedes descargar la partida actual aunque ese almacenamiento esté bloqueado.

El progreso pertenece al mismo navegador y origen web. No es un guardado en la cuenta de itch.io ni viaja automáticamente entre dispositivos. Borrar datos del sitio, usar navegación privada o cambiar de dominio puede perder el almacenamiento; conserva una copia descargada. Un cierre forzado del proceso, un corte de energía o una caída del sistema pueden impedir los eventos de salida: el guardado periódico limita la pérdida ordinaria a los cambios desde la última captura.

## Validación

El presupuesto preparado de los quince mapas descubre 53.114 casillas y ocupa aproximadamente 1,4 MB con tres huecos, Reintentar, legado y dos copias de sesión, bajo una cuota simulada de 5 MiB contando UTF-16. Sin compresión rondaba los 8 MB. Las copias descargadas siguen siendo JSON normal.

El navegador se prueba con el HTML integrado dentro de un iframe real con `sandbox`, servido desde otro origen local. Se cierra la pestaña normalmente y se cierra Chromium; después se abre el mismo perfil y se recupera la sesión en topdown y POV. Se comprueban recarga, periódico, menú, espacios manuales, recursos, documentos y enemigo herido. Otro escenario bloquea `localStorage` y descarga e importa una copia mediante los controles reales.

Las pruebas de motor cubren quince mapas, cuatro jefes, prólogo del frasco, huida sin brazo, recursos y enfriamientos, daño de enemigos, cuota agotada y recuperación de una copia dañada. Estos escenarios usan estados preparados y no equivalen a una campaña humana completa. La publicación final en un dominio real de itch.io depende de la configuración del proyecto; no se ha publicado desde estas pruebas.
