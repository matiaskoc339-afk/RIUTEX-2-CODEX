// Documentos del asilo: cuentan la historia y contienen las pistas de los puzzles.
const DOCS = {
  d1: { title: 'Ficha clínica: Sujeto 17', text: `Paciente: I. Wilson, 23 años. Repartidor. Sin antecedentes.
Compatibilidad con el compuesto: 94 %.

Tolerancia a RIUTEX-V1: 1 entre 1.000.000.
El Sujeto 17 es el PRIMERO en sobrevivir a la dosis completa. Los otros 999.999 perfiles murieron, enloquecieron o se deformaron en horas.

Manifestación mutante: NINGUNA.
Clasificación: DESCARTE. Sin utilidad para el programa.
No informar a la familia.` },
  s1: { title: 'Rayado en la pared', text: `Escrito con las uñas, ya casi borrado:

"I., si lees esto, no confíes en el doctor. Dicen que me llevan abajo. Aguanta. Te quiero.
— E."` },
  e2: { title: 'Registro de aislamiento', text: `Celdas de aislamiento: numeradas del 01 al 07.
La celda 07 fue soldada tras el incidente Mendoza y ya no cuenta como activa.
Las celdas activas siguen en uso hasta nuevo aviso.` },
  d2: { title: 'Registro de recepción', text: `Visitas suspendidas desde marzo.
La llave de la enfermería quedó en el cuerpo del guardia nocturno, cerca de la entrada.

Cuando abrieron la sala de contención empezó el ruido. Nadie volvió a contestar el intercomunicador.
A las 03:40 se apagaron las luces. Después, los gritos.` },
  e3: { title: 'Plano de evacuación', text: `PLANTA BAJA: Recepción, Enfermería, Oficinas, Archivo, Dirección, Cocina y almacén, Seguridad.
SUBSUELO 01: Lavandería.
SUBSUELO 02: Sala de contención.

En caso de emergencia, la salida sur solo se abre con la llave de la salida.` },
  d6: { title: 'Orden de evacuación', text: `ASUNTO: ABANDONO TOTAL DEL COMPLEJO HOLLOW.

La contención ha fallado en tres sectores. Se ordena evacuar al personal clave y sellar los accesos.
Los pacientes y sujetos de prueba NO serán trasladados.
El proyecto será negado ante cualquier autoridad. Este edificio nunca existió.

Firmado: Dirección del programa Riutex.` },
  d3: { title: 'Diario de la enfermera', text: `Los pacientes no mueren. Se quedan quietos y luego se levantan.
La doctora Lang dejó la llave del almacén al fondo de la enfermería.

Hoy trajeron a un muchacho encadenado a una camilla. Le inyectaron lo gris. Esperé a que gritara, a que se retorciera... y no pasó nada. Solo respiraba.
El doctor Voss lo miró como quien mira un billete de lotería roto. Lo dejaron tirado.
Yo no puedo dejar de pensar: ¿y si no se rompió? ¿y si solo está esperando?` },
  e4: { title: 'Diagrama del generador', text: `Interruptores del generador de emergencia, con su consumo:
  Cocina: 40 kW
  Lavandería: 30 kW
  Enfermería: 20 kW
  Seguridad: 10 kW

REGLA DE ARRANQUE: siempre de mayor a menor consumo.
Un error provoca un cortocircuito y hay que empezar de nuevo.` },
  f2: { title: 'Expediente 2/3: Ortega', text: `Paciente Ortega. Reacción al compuesto: pérdida total de voluntad. Deambula sin rumbo.
Trasladada a la planta baja, sin tratamiento.

Fragmento de clave del archivo (2/3): 7` },
  d4: { title: 'Memorándum del Dr. Voss', text: `Riutex-V1 responde en uno de cada cuarenta sujetos; en el resto, el cuerpo lo rechaza de formas... creativas.
Si Wilson sobrevive, se repetirá el resultado de la paciente E.

La tarjeta de seguridad está en la cocina, junto al almacén. Ahí también guardamos lo que nadie debe encontrar.

PD: Sobrevivió. Pero el compuesto no hace nada en él. Una decepción. Prescindan del sujeto.` },
  f3: { title: 'Expediente 3/3: Salas', text: `Paciente Salas. Reacción: crecimiento acelerado de la masa muscular. Agresividad extrema. Dolor suprimido.
Se recomienda confinamiento permanente.

Fragmento de clave del archivo (3/3): 2` },
  d5: { title: 'Informe RIUTEX-V1', text: `Compuesto gris con fluorescencia violeta.
Cada fase de mutación exige una muestra nueva, y las muestras solo se extraen de los sujetos más evolucionados.
La evolución es opcional: el sujeto conserva su voluntad mientras no la complete.

ANOMALÍA: en el Sujeto 17 el compuesto no fue rechazado ni expresado. Permanece en sangre, estable, inactivo.
Hipótesis A: es inerte en él.
Hipótesis B (descartada por Voss): el cuerpo lo está reteniendo para algo.` },
  s4: { title: 'Informe: Prototipo Cero', text: `Capturado en el edificio de la calle Lázaro 14. No era un paciente. Era el primer huésped del compuesto, mucho antes de nosotros.
Voss lo llama Prototipo Cero. Es el que trae a los sujetos nuevos.
Sigue abajo, esperando. Nadie quiere ser el siguiente en bajar.` },
  d7: { title: 'Informe de incidentes', text: `EFECTOS DE RIUTEX-V1 SEGÚN SUJETO:
- VACÍOS: pierden la voluntad. Caminan, golpean, no piensan.
- TREPADORES: huesos alargados, velocidad extrema.
- BRUTOS: crecimiento descontrolado, dolor suprimido.
- AULLADORES: cuerdas vocales mutadas; su grito atrae a los demás.
- LATENTES: caen como cadáveres y despiertan cuando algo se acerca.

Conclusión: el compuesto no crea monstruos. Amplifica lo que cada cuerpo ya es.` },
  e1: { title: 'Memo del director', text: `De nuevo olvidé la combinación de mi caja fuerte. Anoto el recordatorio donde nadie lo entienda:

Cuatro cifras.
Las dos primeras: la celda de aislamiento ACTIVA con el número más alto.
Las dos últimas: el subsuelo donde está la sala de contención.` },
  f1: { title: 'Expediente 1/3: Mendoza', text: `Paciente Mendoza. Incidente en la celda de aislamiento: atacó a dos enfermeros antes de ser sedado.
La celda quedó clausurada.

Fragmento de clave del archivo (1/3): 4` },
  e5: { title: 'Nota junto al terminal', text: `ARCHIVO RESTRINGIDO.
La clave de 3 dígitos se arma con los fragmentos de los expedientes de Mendoza, Ortega y Salas, en ese orden (1/3, 2/3, 3/3).` },
  d8: { title: 'Carta sin enviar', text: `Adrian:

Te lo dije. El chico no es un fracaso. Todos los demás cambiaron en minutos y él lleva días intacto. Eso no es inmunidad, es control.
Si alguna vez despierta, no será como los otros. Será algo que nosotros no diseñamos.

No lo toques. No lo dejes aquí.

— Lang` },
  s2: { title: 'Parte médico: el Carcelero', text: `Paciente Gideon Marsh, 2,10 m. Fuerza descomunal y paranoia. Embiste a ciegas contra lo que se le pone delante.
Se le colocaron correas y cadenas. Trasladado a la sala de contención, subsuelo 02.

Lleva la llave de la salida en el cinturón. Si se suelta, no hay puerta que lo detenga... salvo una pared.` },
  d9: { title: 'Registro de la paciente E.', text: `Paciente E. Respuesta atípica a RIUTEX-V1.
Su sangre reaccionó al compuesto SIN haber sido inyectada. Voss: "Alguien se lo dio antes que nosotros."

No muestra agresividad. Pregunta cada noche por alguien llamado "I." y dice que ya viene.
Trasladada al nivel inferior. Expediente restringido.` }
};
const CLUES = new Set(['e1', 'e2', 'e3', 'e4', 'e5', 'f1', 'f2', 'f3', 'c_turno_tarde']); // documentos que sirven para resolver puzzles

DOCS.c_turno_tarde = { title: 'Parte de turno · tarde / documento recuperado', text: `PROGRAMA RIUTEX — REGISTRO DE DESCARTES
Turno: TARDE
Fecha: 11 de marzo
Responsable: Operario Ramos

El recuento del turno no coincide con el registro del sistema. Dos sujetos fueron trasladados antes de que llegara el supervisor y el formulario quedó sin firma.

NOTA AL DORSO: «Si alguien necesita abrir mi casillero, la fecha está escrita como la pedían en mantenimiento: DÍA primero, MES después. DDMM. No uses el formato del terminal médico».

La hoja está húmeda. En el margen alguien escribió tres veces: NO FUE UNA EVACUACIÓN.` };
