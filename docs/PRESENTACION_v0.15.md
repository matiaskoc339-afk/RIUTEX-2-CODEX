# RIUTEX 2 · Presentación y progresión · v0.15.0

El menú sigue el boceto: título centrado, opciones debajo, charco sobre baldosas grises, sangre oscura, camilla y expediente en los extremos. En v0.15.1 se elimina el corredor: solo permanecen ondas, reflejos del hospital y fogonazos más notorios en el charco. La sangre tiene textura y un borde húmedo; se renuevan suelo, camilla, expediente, vial, logo y botones. El dibujo usa Canvas y fuentes locales; no requiere descargas externas. Solo se anima mientras el menú está visible, a un máximo de 30 cuadros por segundo.

Opciones conserva volumen y reducción de movimiento. Reducir movimiento detiene los reflejos animados y acorta los fundidos. La preferencia del sistema también se respeta. El fondo de habilidades conserva su comportamiento anterior.

## Mejoras del árbol

Se actualizan 50 parámetros porcentuales y 12 reservas Riutex pequeñas. También mejoran las pasivas y técnicas con porcentajes propios. No se cambian conexiones, requisitos, EXP, costes base de poderes, teclas ni las cuatro parejas doradas. La red sigue teniendo 153 opciones, con 149 compatibles por partida. Las habilidades ya adquiridas aplican los nuevos efectos al cargar; las reservas se recalculan sin acumularse entre cargas.

| Parámetro porcentual de un nodo | Antes | Ahora |
|---|---:|---:|
| Velocidad pequeña | 2,5 % | 4 % |
| Daño / movimiento pequeño | 4 % | 6 % |
| Recarga pequeña | 4,5 % | 6 % |
| Recarga de acceso | 5 % | 7 % |
| Daño, regeneración o eficiencia | 8 % | 12 % |
| Recuperación / daño orgánico | 10 % | 14 % |
| Recarga | 12 % | 16 % |
| Bonos de 15 % | 15 % | 20 % |
| Bonos de 20 % | 20 % | 25 % |
| Regeneración dorada | 30 % | 36 % |
| Reserva Riutex pequeña (puntos) | +8 / +10 | +12 / +14 |

Los valores siguientes son efectos de cada habilidad, antes de combinar otras mejoras:

| Habilidad | Antes | Ahora |
|---|---|---|
| Paso sigiloso | Ruido −35 % | Ruido −42 % |
| Chaleco y disciplina | Daño recibido −20 % | −25 % |
| Medicina de campaña | Curación verde +50 % | +60 % |
| Adrenalina | Consumo al correr −40 % | −45 % |
| Sombra | Búsqueda aproximadamente 40 % más corta | 45 % más corta |
| Mente fría | Regeneración Riutex +60 % | +70 % |
| Humanidad plena | Regenera hasta 70 % de salud | Hasta 75 % |
| Fuerza aumentada / cuchilla inicial | Daño +25 % | +32 % |
| Piel endurecida | Daño recibido −25 % | −30 % |
| Maestría de puntería | Daño +25 % a enemigos bajo 30 % de salud | +32 %; mismo umbral |
| Maestría vital | Regenera fuera de peligro hasta 60 % | Hasta 65 % |
| Maestría de sigilo / paso sombrío | Ruido −25 % | −32 % |
| Maestría de esquiva | Distancia +20 % | +26 % |
| Sinapsis | Recarga de poderes −15 % | −20 % |
| Maestría de flujo | Daño recibido −10 % | −14 % |
| Recuperación táctica | Último cartucho +35 % | +42 % |
| Paso ligero | Ruido de pasos −65 % | −70 % |
| Coraza | Daño recibido −40 % | −45 %; conserva penalización de velocidad |
| Catalizador | Coste Riutex −12 % | −16 % |
| Evolución | Duración de transformación +50 % | +60 % |
| Disparo sereno | Daño +30 % | +36 % |
| Suspensión | Ralentiza jefes 75 % | 78 %; no los paraliza |
| Forma del acechador | Velocidad +20 %, daño recibido −25 % | +26 % / −30 % |
| Zancada de corredor | Sprint +8 % | +12 % |
| Segundo aliento | Sprint +24 %, desgaste −25 % | +30 % / −32 % |
| Cambio de guardia | Consumo, retroceso y tiempo de recarga −20 % | −25 % |

Las eficiencias de disparo y golpes se aplican como divisores del coste; por ejemplo, +12 % de eficiencia divide el coste entre 1,12. Los costes no llegan a cero y se conservan los límites de reducción existentes. Las mejoras del banco y los accesorios de armas mantienen sus valores.

## Transiciones

Fundidos de 680 ms entre plantas y escenas físicas, desde la nueva partida, al despertar en el hospital, al cargar, reintentar y mostrar el desenlace. Con movimiento reducido duran 160 ms. Incluyen el nombre de la zona de destino. Las puertas interiores mantienen la exploración continua.

Una instantánea conserva la imagen de salida; en el menú incluye logo y opciones. El destino se prepara detrás del velo. Durante el fundido se detienen los updates del juego y el daño, se bloquean acciones y se limpia el disparo. Al terminar se restaura únicamente el movimiento que siga físicamente pulsado; soltar teclas o perder foco evita entradas atascadas. Los fundidos usan un reloj visual independiente del mundo.

## Validación

- Ocho nuevas pruebas del motor: todas las modificaciones porcentuales, idempotencia, textos/umbrales, regeneración real, reservas entre cargas, daño, gasto/cooldowns y compatibilidad con R1.
- Cuarenta y una comprobaciones de navegador con animación y reloj reales: menú, reflejos, opciones/teclado/persistencia, tres resoluciones, captura del menú sin IDs duplicados, simulación pausada, movimiento sostenido, todas las plantas, carga, reintento, desenlace y movimiento reducido.
- Las suites anteriores aíslan los efectos de presentación para sus recorridos y combates con reloj controlado. El grupo nuevo mantiene los fundidos habilitados.
- Las pruebas de animación preparan posiciones y finales para aislar presentación. No constituyen una partida humana completa ni una medida de dificultad.

## Revisión visual v0.15.1

Solo cambia la pantalla principal. Las superficies del suelo y de la sangre se precalculan; durante el menú se animan la luz, los reflejos y las ondas, sin personas, armas dibujadas ni pasos. Los fogonazos iluminan la sangre con núcleo cálido, trazos reflejados y brillo sobre las baldosas cercanas. Las ráfagas cortas quedan separadas por pausas. Con movimiento reducido el charco permanece inmóvil, incluso al pedir cuadros de distintos tiempos.

Se inspeccionaron cuadros en reposo y durante el disparo; una muestra de píxeles del reflejo verifica un aumento de luminosidad superior a 20 unidades sobre 255. Las 41 comprobaciones del menú y los fundidos y las 15 del HTML integrado se repitieron en esta revisión. La suite completa anterior de 572 comprobaciones se conserva como historial, sin presentarla como repetida.
