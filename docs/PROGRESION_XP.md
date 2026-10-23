# Progresión de XP · v0.18.0

Se elimina el multiplicador ×2,5 de las bajas de RIUTEX 2 y se sustituyen los premios aleatorios por cantidades pequeñas y predecibles. Se aplica al modo clásico y a primera persona. Los enemigos avanzados siguen aportando más; las crías invocadas mantienen su recompensa nula.

| Zona | XP por enemigo normal |
| --- | ---: |
| Mansión | 1 |
| Hospital | 1–2 |
| Cloacas / fábrica | 1–2 |
| Castillo | 2–3 |
| Laboratorio | 3–4 |

La cantidad depende de la peligrosidad original del enemigo y de la zona. Las arañas débiles del vertido dan 1 XP; no reciben una recompensa de élite por aparecer más adelante.

| Encuentro | XP por victoria |
| --- | ---: |
| C-17, opcional del hospital | 6 |
| Carnicero final | 11 |
| Repetidor K-9, arena opcional | 10 |
| Custodio S-4 | 6 |
| Matriarca | 14 |
| Tallador | 8 |
| Regente | 18 |
| Wren | 29 |

Los cuatro jefes finales pagan al terminar el encuentro, no en cada mutación. Los cadáveres ya no vuelven a conceder XP, regeneración por baja ni botín si reciben daño repetido.

## Comparación de presupuestos

Solo se cuentan las bajas de los enemigos colocados en el mapa. El valor anterior es la media exacta del cálculo aleatorio previo, no una cantidad garantizada en cada partida.

| Mapa | Media anterior | Ahora | Reducción |
| --- | ---: | ---: | ---: |
| Mansión | 41 | 7 | 83 % |
| Hospital, planta baja | 239 | 38 | 84 % |
| Hospital, primer piso | 204 | 35 | 83 % |
| Hospital, sótano | 129 | 22 | 83 % |
| Cloacas / fábrica | 273 | 60 | 78 % |
| Castillo, planta baja | 149 | 48 | 68 % |
| Castillo, planta alta | 161 | 52 | 68 % |
| Laboratorio | 335 | 123 | 63 % |

Explorar una sala nueva conserva sus 5 XP y recoger un documento nuevo sus 4 XP. También se conservan muestras, puzles, misiones, costes del árbol y recompensas de equipo. Así las bajas complementan la exploración. Cuatro bajas básicas siguen permitiendo comprar Vigor, de 4 XP.

El cambio se aplica a las nuevas bajas. Las partidas existentes conservan su XP y habilidades. Los valores de peligrosidad de las definiciones de enemigos permanecen separados del premio efectivo: siguen sirviendo para clasificar el botín de élites. El cálculo de recompensas de RIUTEX 1 se conserva.

Las diez pruebas del motor verifican presupuestos, jerarquía, bajas reales, una única recompensa, tres fases del Carnicero, compra, guardado, exploración, crías y compatibilidad. El navegador comprueba el HUD y un disparo letal en ambas perspectivas, los ocho encuentros preparados y compra/guardado. Las muertes preparadas aíslan las recompensas; no equivalen a combates completos ni miden dificultad humana.
