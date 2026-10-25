# Brazos y huida inicial · v0.24.0

## Volumen de los brazos POV

Aumenta el grosor del antebrazo aproximadamente un 47 % en la parte próxima al codo y un 23 % en la muñeca. Las mangas aumentan aproximadamente un 40 % y las manos un 8–10 %. Conserva el estrechamiento hacia la muñeca y los puntos de agarre de las armas. Son cambios en el modelo de primera persona; la vista clásica conserva su personaje.

Los materiales humanos y azules, la falta del brazo tras la amputación, la cura, las garras y la animación del golpe mantienen sus condiciones. Se comprueban las siete armas y los puños para conservar dos manos como máximo, agarres, geometría finita y la línea central de visión libre en reposo.

## Persecución inicial del hospital

`IntroPursuit` solo actúa mientras la historia está en `run` en la planta baja. Al abandonar la habitación, el cierre trasero se bloquea cuando el jugador y el Carnicero ya lo han cruzado. El perseguidor usa navegación y colisiones reales alrededor de las camillas y cajas, siempre conserva el objetivo y no abandona este tramo por ocultación o pérdida visual. La persecución libre posterior conserva su IA.

Al llegar al cierre del fondo, dentro de sus tres carriles transitables, Axel entra en un forcejeo breve. Puede mirar, pero los desplazamientos y la esquiva no le permiten abandonar esa posición. Mantener movimiento o sprint no drena estamina durante el forcejeo. El Carnicero se acerca físicamente y prepara un golpe anunciado; al conectar abre la puerta, arranca el brazo y devuelve el movimiento para huir al vestíbulo. El evento ocurre una sola vez. Los golpes anteriores solo empujan y presionan para seguir avanzando.

No se abre la puerta con un temporizador: se espera el golpe del enemigo. En las rutas automatizadas, tras llegar al cierre el avance y el golpe tardan alrededor de dos segundos. La navegación, posición y obstáculos determinan el tiempo exacto. La persiana y la inyección del vestíbulo conservan su secuencia. Allí se libera de nuevo el acceso trasero para explorar normalmente.

## Partidas y alcance

El estado de forcejeo y el cierre se guardan en la historia, usando los formatos y claves de sesión existentes. Reanudar durante ese momento mantiene la posición y permite recibir el golpe y salir; una camilla antigua en `run` reconstruye al perseguidor en suelo transitable si antes quedaba dormido en el muro. La normalización del cierre también se aplica después de restaurar actores y puertas de una sesión.

La suite de motor recorre los obstáculos hacia las tres filas de la puerta en ambos modos, comprueba bloqueo trasero, persecución, estamina, golpe único, llegada, inyección, reanudación y ausencia de restricciones en exploración libre. El navegador reproduce la ruta con IA y colisiones activas, incluyendo reanudar durante el forcejeo y revisar las mallas de brazos. Son escenarios preparados, no una campaña humana ni mediciones de GPU física.
