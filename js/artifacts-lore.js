// Investigación: los objetos permanecen mientras tengan un uso pendiente; el progreso no es el llavero.
const ArtifactLifecycle = {
  floors:['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet'],
  uses:new Map(),
  token(lvl,kind,id){return lvl+':'+kind+':'+id;},
  data(g){
    const q=g.story.artifactState||(g.story.artifactState={version:1,doors:{},stairs:{},consumed:{}});
    q.doors||={};q.stairs||={};q.consumed||={};return q;
  },
  register(){
    this.uses.clear();
    const add=(key,use)=>{if(!this.uses.has(key))this.uses.set(key,[]);this.uses.get(key).push(use);};
    for(const lvl of this.floors){const d=R2_DATA(lvl);
      for(const row of d.doors||[]){const key=row[5];if(key&&!key.startsWith('h:'))add(key,{kind:'doors',token:this.token(lvl,'door',row[0]),lvl,id:row[0]});}
      for(const row of d.items||[])if(row[1]==='h_stairs'&&row[4]?.need)add(row[4].need,{kind:'stairs',token:this.token(lvl,'stairs',row[0]),lvl,id:row[0]});
    }
  },
  pending(g,key){const q=this.data(g);return (this.uses.get(key)||[]).filter(use=>!q[use.kind][use.token]);},
  consume(g,keys){
    if(!keys.length)return;
    const q=this.data(g),gone=new Set(keys);
    for(const key of keys)if(g.inv.keys.includes(key))q.consumed[key]=true;
    g.inv.keys=g.inv.keys.filter(key=>!gone.has(key));
  },
  sweep(g){
    if(!g.story||!g.inv||!isR2lvl(g.lvl))return;
    const q=this.data(g),done=[];
    // Una cerradura ya abierta también se reconoce al cargar JSON de ediciones anteriores.
    for(const [key,uses]of this.uses)for(const use of uses)if(use.kind==='doors'&&use.lvl===g.lvl){const d=Level.doors.find(d=>d.id===use.id);if(d&&(d.open||d.key===null))q.doors[use.token]=true;}
    for(const key of g.inv.keys)if(this.uses.has(key)&&this.pending(g,key).length===0)done.push(key);
    if(g.pz['h:power'])done.push('fusible_a','fusible_b');
    if(g.pz['adv:shotgun'])done.push('rack_crank');
    if(g.pz['adv:optics'])done.push('optic_lens','optic_cell');
    const shop=g.story.workshop;
    if(shop?.powered)done.push('aux_fuse','aux_cable');
    for(const [attachment,key]of [['optic_pistol','escort_tool'],['brace_shotgun','damper_spring'],['scope_rifle','scope_film']])if(shop?.attachments?.includes(attachment))done.push(key);
    for(const [kind,keys]of Object.entries(WorksPuzzles.needs))if(g.pz['h:wx_'+kind])done.push(...keys);
    const works=g.story.works,depths=works?.depths;
    if(works?.filter)done.push('wx_filter');
    if(works?.radioDone)done.push('wx_radio');
    for(const id of works?.installed||[])done.push('wx_valve_'+id);
    if(depths?.gun)done.push(...DepthsPuzzle.needs.ds_gun);
    if(depths?.guard?.active||depths?.guard?.won)done.push(...DepthsPuzzle.needs.ds_suit);
    if(g.pz['h:cl_prison']||g.story.castle?.prison?.won&&g.picked.has('cl_carver_key'))done.push('cl_prison_key');
    for(const [kind,def]of Object.entries(CastlePuzzles.defs))if(g.pz['h:cl_'+kind])done.push(...def[2]);
    for(const [kind,def]of Object.entries(EndPuzzles.defs))if(g.pz['h:lf_'+kind])done.push(...def[2]);
    if(g.story.endgame?.started||g.story.endgame?.choice)done.push(...Endgame.samples);
    this.consume(g,done);
    if(FieldDesk.artifact&&!g.inv.keys.includes(FieldDesk.artifact))FieldDesk.artifact=null;
  },
  apply(g){
    if(!g.story||!isR2lvl(g.lvl))return;
    const q=this.data(g);
    for(const d of Level.doors)if(q.doors[this.token(g.lvl,'door',d.id)]){
      d.key=null;
      if(!d.open)Level.closeDoor(d,true);
    }
    this.sweep(g);
  },
  knowledge(g){
    if(!isR2lvl(g.lvl)||!g.story?.artifactState)return g;
    const proxy=Object.create(g),inv=Object.create(g.inv);
    const unlocked=[...this.uses.keys()].filter(key=>this.pending(g,key).length===0);
    inv.keys=[...new Set([...g.inv.keys,...Object.keys(g.story.artifactState.consumed||{}),...unlocked])];proxy.inv=inv;return proxy;
  }
};
ArtifactLifecycle.register();
(()=>{
  const open=Level.openDoor;
  Level.openDoor=function(d){
    const g=Game,key=d?.key,lvl=g.lvl,result=open.call(this,d);
    if(key&&isR2lvl(lvl)&&g.story&&(ArtifactLifecycle.uses.get(key)||[]).some(use=>use.kind==='doors'&&use.lvl===lvl&&use.id===d.id)){
      ArtifactLifecycle.data(g).doors[ArtifactLifecycle.token(lvl,'door',d.id)]=true;ArtifactLifecycle.sweep(g);
    }
    return result;
  };
  const build=Hospital.buildLevel;Hospital.buildLevel=function(g,...args){const result=build.call(this,g,...args);ArtifactLifecycle.apply(g);return result;};
  const use=Hospital.use;Hospital.use=function(g,it){
    if(it.type!=='h_stairs'||!it.need)return use.call(this,g,it);
    const lvl=g.lvl,key=it.need,token=ArtifactLifecycle.token(lvl,'stairs',it.id),q=ArtifactLifecycle.data(g),allowed=g.inv.keys.includes(key)||q.stairs[token];
    const result=use.call(this,g,q.stairs[token]?{...it,need:null}:it);
    if(allowed&&g.lvl!==lvl){q.stairs[token]=true;ArtifactLifecycle.sweep(g);}return result;
  };
  const start=Game.start;Game.start=function(...args){const result=start.apply(this,args);ArtifactLifecycle.apply(this);return result;};
  const save=Game.save;Game.save=function(...args){ArtifactLifecycle.sweep(this);return save.apply(this,args);};
  const take=Game.take;Game.take=function(...args){const result=take.apply(this,args);ArtifactLifecycle.sweep(this);return result;};
  const artifacts=FieldDesk.renderArtifacts;FieldDesk.renderArtifacts=function(g,...args){
    ArtifactLifecycle.sweep(g);const result=artifacts.call(this,g,...args),uses=ArtifactLifecycle.uses.get(this.artifact),pending=uses&&ArtifactLifecycle.pending(g,this.artifact);
    if(pending?.length&&pending.length<uses.length){const note=document.createElement('p');note.className='artifact-remaining';note.textContent='Todavía abre otros accesos. Se retira cuando ya no queda ningún uso pendiente.';UI.$('artifactDetail').appendChild(note);}return result;
  };
  const current=HospitalCompass.current;HospitalCompass.current=function(g){return current.call(this,ArtifactLifecycle.knowledge(g));};
  const objective=Hospital.objective;Hospital.objective=function(g){return objective.call(this,ArtifactLifecycle.knowledge(g));};
})();

// Documentos narrativos sin requisitos de misión ni recompensas especiales.
const R2LoreArchive = {documents: [
  {
    "id": "lore20_01",
    "title": "Cuaderno de Rojas · antes de entrar",
    "text": "COPIA DE NOTAS DE CAMPO / ROJAS\n\nEl capitán volvió a preguntar si había personal civil dentro. En el informe solo figura Wren. «Solo figura» no significa que la casa esté vacía. Lo apunté porque el mando dejó de responder justo después de esa pregunta.\n\nDunn bromea cuando está nervioso. Ibarra comprueba dos veces lo que los demás dan por seguro. Axel nos deja terminar antes de hablar. Son cosas pequeñas. En una operación suelen ser las cosas que te permiten reconocer a un compañero aunque no le veas la cara.\n\nSi este cuaderno acaba en un informe, que no escriban «tres efectivos de apoyo». Escriban nuestros nombres. Y si el capitán vuelve a pedir que comprobemos si queda alguien atrás, compruébenlo. Es la razón por la que todavía lo seguimos.",
    "lvl": "mansion",
    "room": "Vestíbulo",
    "x": 32,
    "y": 38
  },
  {
    "id": "lore20_02",
    "title": "Marta · las cosas que dejamos puestas",
    "text": "ARCHIVO FAMILIAR / COPIA DE UN CUADERNO DOMÉSTICO\n\nElias quiere que recoja su plato. Dice que no es sano seguir poniendo la mesa para tres. Después lo encuentro mirando la silla hasta que se enfría su comida.\n\nNo he guardado sus zapatos. No porque crea que va a entrar hoy, sino porque no quiero que una habitación vacía termine decidiendo lo que ocurrió. Se la llevaron. Nadie ha tenido el valor de decirme adónde. Ningún sello en un papel transforma eso en una despedida.\n\nAntes discutíamos por cosas pequeñas: un vaso fuera de sitio, el jardín sin regar. Ahora Elias habla del cuerpo como si reparar cada parte pudiera devolver también esos días. Yo daría cualquier cosa por volver a discutir por el jardín.\n\nSi lees esto, Elias, recuerda que aún hay alguien en esta casa a quien puedes responder.",
    "lvl": "hospital1",
    "room": "Biblioteca médica",
    "x": 61,
    "y": 33
  },
  {
    "id": "lore20_03",
    "title": "Diario de cocina · la última comida caliente",
    "text": "CUADERNO DEL PERSONAL / PÁGINA MANCHADA\n\nEl doctor dejó de pedir lo mismo de siempre. Primero apartó la carne. Luego devolvió el pan porque le parecía demasiado dulce. Ayer preguntó si yo también oía el agua dentro de las tuberías cuando estaban cerradas.\n\nNo supe qué contestar. Le serví sopa. Hacía semanas que nadie cocinaba para otra persona en esta casa, aunque seguíamos poniendo tres platos por costumbre.\n\nLa señora Marta bajó mientras él comía. No hablaron del hospital, ni de la niña, ni de los hombres que venían después de medianoche. Hablaron de que iba a llover. Me quedé junto a la puerta más tiempo del necesario porque parecía una conversación de antes.\n\nHe dejado limpio el cucharón. No sé por qué necesitaba escribirlo. Supongo que todavía quiero que algo aquí siga siendo un trabajo normal.",
    "lvl": "mansion",
    "room": "Cocina",
    "x": 57,
    "y": 36
  },
  {
    "id": "lore20_04",
    "title": "Wren · el margen de una fotografía",
    "text": "ANEXO PRIVADO / COPIA DEL REVERSO DE UNA FOTOGRAFÍA FAMILIAR\n\nEn esta foto llevo una venda en un dedo. Ella se había caído en el jardín y quiso curarme también para que no le diera vergüenza llorar. Marta dijo que los dos éramos pacientes difíciles.\n\nHe conservado esa venda durante años. Hoy la miré pensando qué habría cambiado si entonces hubiese conocido el compuesto. Una rodilla sin cicatriz. Un dedo sin corte. Dos motivos menos para sentarnos juntos aquella tarde.\n\nSigo llamando a esto investigación porque esa palabra no exige explicar lo demás. Sé reparar tejido. No sé qué parte de un padre empieza a pudrirse cuando acepta hacer daño a otra familia para recuperar la suya.\n\nNo he encontrado una respuesta en ningún ensayo. Aun así, mañana volveré a revisar los resultados. Esa es la parte que más miedo debería darme.",
    "lvl": "hospital1",
    "room": "Laboratorio de Wren",
    "x": 31,
    "y": 47
  },
  {
    "id": "lore20_05",
    "title": "Turno de noche · los nombres del parte",
    "text": "SAN GABRIEL / REGISTRO NO OFICIAL DE ENFERMERÍA\n\nLa hoja nueva dice «traslados internos». En la anterior escribíamos nombres. Cada vez que dejan de darnos nombres, alguien termina preguntando por una persona que nosotros fingimos no haber visto.\n\nEl hombre de la habitación doce llegó con marcas de equipo militar en la ropa. Antes de sedarlo preguntó por otros tres. No preguntó dónde estaba él. Repitió sus nombres hasta que tuvo que elegir entre hablar y respirar.\n\nAnoté la pregunta en el margen. El supervisor me hizo arrancar la página porque no era una observación clínica. Por eso la copio aquí, donde guardábamos los cambios de turno y los cumpleaños.\n\nSi alguien de fuera lee esto: los pacientes no entraron todos enfermos. Algunos entraron buscando a otra persona. No permitan que el registro final diga que ninguno tenía a nadie esperando.",
    "lvl": "hospital",
    "room": "Sala de descanso",
    "x": 10,
    "y": 37
  },
  {
    "id": "lore20_06",
    "title": "Carta sin entregar · para cuando abra el hospital",
    "text": "SOBRE SIN FRANQUEO / DESTINATARIA: MAMÁ\n\nNo te preocupes por haberme recomendado este puesto. Al principio era un hospital. Había gente desagradable, turnos largos y máquinas que nadie sabía reparar. También había personas que salían caminando por la puerta.\n\nHoy una señora me preguntó si podía quedarse con la pulsera de su marido. Le dije que tenía que consultar el procedimiento. Me oí decirlo y me dio vergüenza. No necesitaba un procedimiento; necesitaba que alguien le contestara como una persona.\n\nLe di la pulsera. Después volví a mi mesa y cumplí otras tres órdenes que no debería haber cumplido. No escribo esto para que me perdones antes de saberlas.\n\nCuando vuelva, si vuelvo, no me preguntes primero si fui valiente. Pregúntame qué hice cuando todavía podía decir que no. Quiero aprender a contestarte sin esconderme detrás del uniforme.",
    "lvl": "hospital",
    "room": "Capilla",
    "x": 30,
    "y": 39
  },
  {
    "id": "lore20_07",
    "title": "Registro de una conversación interrumpida",
    "text": "SERVICIO DE LIMPIEZA / NOTA PERSONAL\n\nLos médicos seguían reuniéndose aquí cuando cerraron el comedor del personal. Dejaban sobre las mesas dibujos de huesos y hablaban de «material recuperable». Después pedían café sin azúcar y se quejaban del frío.\n\nUna vez uno de ellos se quedó hasta el final del turno. Miraba una taza vacía. Me preguntó si creía que una persona podía acostumbrarse a cualquier cosa. Le dije que yo me había acostumbrado a trabajar de noche. Se rio, pero no parecía una risa.\n\nAl día siguiente cambiaron su nombre en la puerta por una referencia de laboratorio. Dejé de verlo en la cafetería. Nadie volvió a sentarse en su sitio, aunque siguieron viniendo los demás.\n\nHe limpiado esa mesa muchas veces. Todavía encuentro marcas de uñas en la parte de abajo. Las hicieron mientras alguien seguía hablando de trabajo.",
    "lvl": "hospital",
    "room": "Cafetería",
    "x": 73,
    "y": 21
  },
  {
    "id": "lore20_08",
    "title": "Paciente sin nombre · cosas que todavía recuerdo",
    "text": "HOJAS DOBLADAS DENTRO DE UNA FUNDA DE ALMOHADA\n\nRecuerdo una persiana que golpeaba la pared cuando había viento. Recuerdo que alguien me decía que me apartara de la ventana porque la comida se enfriaba. No recuerdo su cara. Eso es lo que reviso cada mañana, antes de mirar qué ha cambiado en mis manos.\n\nEl doctor pregunta por las manos. Si puedo cerrar los dedos. Si siento dolor. Si reconozco mi reflejo. Nunca pregunta por la persiana. Cuando intento explicárselo, escribe «respuesta no pertinente».\n\nSi dejo de reconocer estas hojas, no las tiren. Léanmelas como si fueran de otra persona. A lo mejor puedo sentir pena por ella antes de recordar que era yo.\n\nTodavía me enfado cuando entran sin llamar. Quiero creer que eso significa que algo de esta habitación sigue siendo mío.",
    "lvl": "hospital1",
    "room": "Habitación 07",
    "x": 14,
    "y": 47
  },
  {
    "id": "lore20_09",
    "title": "Dictado de Wren · continuidad",
    "text": "TRANSCRIPCIÓN PARCIAL / GRABACIÓN PRIVADA\n\nDecimos que el receptor conserva su identidad si puede decirnos su nombre. Es una prueba cómoda. También la supera una grabación. Ninguno de nosotros debería confundir obedecer una pregunta con seguir siendo alguien.\n\nHay un hombre que, incluso después del daño, sigue preguntando por los que entraron con él. No porque se lo hayamos pedido. No porque esa respuesta reduzca su dolor. Lo hace aunque le digamos que no importa.\n\nEso es lo que no hemos conseguido fabricar. Podemos producir músculo, reflejos y hambre. No sabemos producir una razón para volver por otra persona.\n\nHe utilizado esta observación para justificar que continúe el estudio. Quien lea el informe debe conocer también esa frase. Reconocer que un sujeto sigue siendo humano no me hizo detenerme. Me dio otra excusa para no hacerlo.",
    "lvl": "hospital1",
    "room": "Laboratorio de Wren",
    "x": 29,
    "y": 47
  },
  {
    "id": "lore20_10",
    "title": "Parte del sótano · cuando dejó de hablar",
    "text": "MANTENIMIENTO / ANOTACIÓN FUERA DEL PARTE\n\nAntes de que lo llamaran Carnicero, venía a lavarse las botas aquí. Casi nunca hablaba de su trabajo. Una noche preguntó si el ruido de las calderas llegaba a las habitaciones. Le dije que no. Me dio las gracias como si yo le hubiera hecho un favor.\n\nDespués empezaron a traerlo sujeto entre varios. La última vez ya no preguntó nada. Apoyó la frente contra una tubería y estuvo allí hasta que lo obligaron a moverse.\n\nNo sé cuánto de él queda debajo de todo eso. Tampoco sé si recordarlo vuelve más fácil lo que habrá que hacer cuando vuelva a oírlo en el pasillo.\n\nEn el registro figura que entregamos una sala de trabajo. Yo firmé esa entrega. No puedo seguir escribiendo que lo que sucede abajo empezó el día que dejaron de abrir las puertas.",
    "lvl": "hospitalb",
    "room": "Calderas",
    "x": 24,
    "y": 20
  },
  {
    "id": "lore20_11",
    "title": "Veterinaria · no eran números al llegar",
    "text": "CUADERNO DE INGRESOS / LETRA DE UNA AUXILIAR\n\nLa primera perra sabía dar la pata. No estaba adiestrada para el laboratorio; alguien la había educado para vivir en una casa. Durante semanas mantuvo esa costumbre aunque ya no pudiera apoyar bien las otras tres.\n\nNos prohibieron ponerles nombres. Decían que alteraba la observación. Yo anoté las manchas del pelo, la forma de dormir, cuál se acercaba primero cuando traíamos comida. Era otra manera de hacerlo y todos lo sabíamos.\n\nAl final dejaron de preguntar si comían. Solo preguntaban si el tejido seguía respondiendo. Los camiones que llegaban al hospital regresaban cada vez más vacíos; los nuestros salían cada vez más llenos.\n\nSi encuentran estas páginas, no se queden únicamente con las fotografías del resultado. Antes de las placas, de los frascos y de las etiquetas, estuvieron vivos de una manera que reconocíamos.",
    "lvl": "hospitalworks",
    "room": "Recepción zoológica",
    "x": 88,
    "y": 34
  },
  {
    "id": "lore20_12",
    "title": "Informe rechazado · olor a lluvia",
    "text": "CONTROL AMBIENTAL / COPIA SIN SELLO DE RECEPCIÓN\n\nLa muestra de la salida no coincide con la de la entrada. La diferencia permanece después del tratamiento habitual. Se solicitó detener el vertido hasta identificarla. La solicitud regresó con una casilla nueva: «¿Existe alteración visible para el público?».\n\nLa técnica que recogió la muestra vive junto al canal. Dice que de pequeña sabía que iba a llover por el olor del agua. Ahora lo sabe porque los pájaros dejan de acercarse.\n\nNo podemos asegurar hasta dónde ha llegado el compuesto. Esa incertidumbre se ha utilizado como argumento para seguir descargando. He vuelto a escribir la conclusión con palabras más sencillas: no saber el alcance no significa que no exista daño.\n\nEsta copia no lleva firma porque la original sí la llevaba. Quiero que quede constancia de que alguien entendió el resultado antes de que empezaran a desaparecer los animales.",
    "lvl": "hospitalworks",
    "room": "Archivo de vertidos",
    "x": 37,
    "y": 66
  },
  {
    "id": "lore20_13",
    "title": "Lista de la compra · turno que no terminó",
    "text": "PAPEL DOBLADO EN CUATRO\n\nPan. Jabón. Algo para la tos de Inés. Llamar al dueño del cuarto antes de que cobre otra semana.\n\nDebajo, con otro bolígrafo:\n\nHoy nos han pedido quedarnos hasta terminar la descarga. Han pagado por adelantado. Eso nunca ocurre aquí. Ramiro lo celebró porque podrá mandar dinero a casa sin esperar al viernes. Me sentí mala persona por no alegrarme con él.\n\nLlevamos horas sin oír el montacargas, pero arriba siguen firmando que reciben los envíos. Nadie quiere ser quien pregunte cómo se está haciendo el trabajo.\n\nSi salgo de este turno compraré todo lo de la lista, aunque ya no haga falta. Sobre todo el pan. Quiero volver a preocuparme por una cosa que pueda acabarse, comprarse otra vez y seguir siendo exactamente lo que era.",
    "lvl": "hospitalworks",
    "room": "Comedor de operarios",
    "x": 57,
    "y": 34
  },
  {
    "id": "lore20_14",
    "title": "Registro de comportamiento · reconocimiento",
    "text": "VIVARIO / OBSERVACIÓN ADJUNTA AL ENSAYO\n\nEl sujeto reaccionó al sonido del carro de comida y no a la voz del nuevo cuidador. Cuando apareció la auxiliar anterior, la respuesta cambió. No fue menor. Fue distinta.\n\nSe solicitó repetir la observación sin que ella estuviera presente. La solicitud fue aceptada; la pregunta sobre reconocimiento se retiró del informe. En su lugar se escribió «estímulo no controlado».\n\nLa auxiliar pidió que no la volvieran a llamar para las pruebas. Dijo que no podía seguir entrando si el animal todavía esperaba que ella arreglara algo. El supervisor respondió que estaba atribuyendo intenciones humanas a un resultado biológico.\n\nNo sé cómo medir la espera. Sí sé reconocerla. He visto la misma expresión en las familias que permanecían junto a la puerta del hospital después de que les dijeran que no habría más visitas.",
    "lvl": "hospitalworks",
    "room": "Boxes de observación",
    "x": 88,
    "y": 55
  },
  {
    "id": "lore20_15",
    "title": "Incidencia cerrada · peso de salida",
    "text": "ADMINISTRACIÓN DE RESIDUOS / CORRECCIÓN MANUSCRITA\n\nSe nos exige que el peso de entrada coincida con el de salida. Cuando no coincide, el sistema lo marca como pérdida de material. Hemos recibido instrucciones de corregir el peso de entrada.\n\nAl principio pensábamos que alguien estaba robando piezas. Luego vimos lo que llegaba desde Veterinaria. Hay cuerpos que siguen produciendo tejido cuando ya no deberían tener fuerzas para sostenerlo. Ninguna hoja de cálculo estaba preparada para registrar eso.\n\nAyer uno de los operarios preguntó si debíamos seguir contando los movimientos de los sacos como un problema de la balanza. Nadie respondió. El encargado firmó y nos mandó a comer.\n\nEsta incidencia figura como cerrada. No significa que se haya resuelto. Significa que hemos aprendido a escribir una cifra que no obligue a nadie de arriba a bajar y mirar.",
    "lvl": "hospitalworks",
    "room": "Registro de hornos",
    "x": 63,
    "y": 104
  },
  {
    "id": "lore20_16",
    "title": "Carta del prisionero · las manos de antes",
    "text": "PAPEL RASPADO CON LETRA DESIGUAL\n\nAntes me ganaba la vida reparando cosas pequeñas. Mi hija me traía juguetes y se quedaba mirando hasta que volvían a moverse. Si tardaba mucho, me preguntaba si les dolía estar abiertos.\n\nAhora mantengo las manos lejos de la cara. No quiero saber si todavía podría tocar una fotografía sin romperla. Intento recordar cómo sujetaba una taza: el peso en el asa, el borde caliente contra el pulgar. Es un esfuerzo absurdo para algo que hice todos los días.\n\nLos hombres que vienen a observarme dicen que me adaptaré. Lo dicen desde el otro lado. No les he oído preguntarse a qué debería adaptarme exactamente.\n\nSi mi hija llega a preguntar por mí, díganle que dejé algo sin terminar. No le digan que al final aprendí a romperlo todo.",
    "lvl": "hospitalcells",
    "room": "Celdas occidentales",
    "x": 7,
    "y": 27
  },
  {
    "id": "lore20_17",
    "title": "Conservadora · el museo después del cierre",
    "text": "VALCÁRCEL / DIARIO DE CONSERVACIÓN\n\nLos visitantes preguntaban si las armaduras estaban vacías. Los niños insistían incluso después de ver el interior. Les gustaba imaginar que alguien seguía allí, esperando a que el museo cerrara.\n\nAhora nos prohíben abrir las vitrinas nuevas. No consta autor, procedencia ni fecha de ingreso. Los formularios dicen «préstamo institucional» y llevan la misma dirección de San Gabriel. Cuando pregunto por la documentación, recibo otra copia del formulario.\n\nHe seguido preparando las etiquetas. Es lo que hago cuando no sé qué hacer. Pero hoy me detuve antes de escribir «ejemplar». Había una mano apoyada contra el cristal por el otro lado.\n\nNo se movió cuando me acerqué. Tampoco la aparté de mi vista. Me quedé allí el tiempo que habría dedicado a explicarle una pieza a un visitante, porque no sabía qué otra forma de compañía podía ofrecerle.",
    "lvl": "hospitalcastle",
    "room": "Archivo de adquisiciones",
    "x": 39,
    "y": 74
  },
  {
    "id": "lore20_18",
    "title": "Turno de guardia · palabras aprendidas",
    "text": "CUADERNO DE UN VIGILANTE\n\nNos pidieron que tratáramos a los recién llegados como personal. No utilizar la palabra paciente. No comentar las vendas. Si alguno olvidaba una orden, repetirla sin levantar la voz.\n\nA uno le enseñaron a sostener el escudo de la colección. Le hacían repetir un juramento que habían copiado de una placa del museo. Al principio se equivocaba siempre en la misma frase y se reía, avergonzado. Después dejó de equivocarse. También dejó de reírse.\n\nLa dirección consideró que el ejercicio había dado resultado. Yo anoté lo contrario en este cuaderno, que no forma parte del informe.\n\nNo sé si obedecer es lo último que conservan o lo primero que nosotros les quitamos. Solo sé que, cuando terminaba su turno, aquel hombre seguía esperando a que alguien le dijera que podía bajar el brazo.",
    "lvl": "hospitalcastle",
    "room": "Dormitorio del servicio",
    "x": 94,
    "y": 91
  },
  {
    "id": "lore20_19",
    "title": "Registro de traslado · la familia de A-0",
    "text": "ANEXO PERSONAL / DOCUMENTACIÓN CLÍNICA RECUPERADA\n\nLa familia acudió por una urgencia, no por una convocatoria de investigación. Preguntó si había tratamiento. Firmó los papeles que le pusieron delante mientras el menor seguía necesitando sangre.\n\nEl consentimiento archivado describe una intervención asistencial. Las muestras conservadas después pertenecen a otro procedimiento, con otra finalidad. La autorización para ese segundo uso no figura en ninguna de las copias recibidas.\n\nEn los informes posteriores se le llama receptor A-0. Su familia lo llamaba Axel. La diferencia no es un detalle administrativo: uno de esos nombres permite discutir resultados sin imaginar al muchacho que tuvo que quedarse aquella noche.\n\nAdjunto esta observación porque se nos ha pedido describirlo como una oportunidad excepcional. Antes de ser excepcional fue alguien a quien prometimos ayudar. Esa promesa no desaparece porque ahora resulte útil para otra cosa.",
    "lvl": "hospitalcastle1",
    "room": "Archivo de la guarnición",
    "x": 16,
    "y": 86
  },
  {
    "id": "lore20_20",
    "title": "Restauradora · la parte que no se conserva",
    "text": "PÁGINA PRENSADA ENTRE DOS HOJAS SECAS\n\nEn conservación nos enseñaron a distinguir la pieza de las reparaciones. No fingir que un añadido estuvo allí desde el principio. Dejar que quien mire sepa qué se perdió y qué decidimos colocar en su lugar.\n\nLos médicos utilizan nuestra palabra. Conservación. Hablan de conservar una vida mientras cambian cada vez más partes de la persona que la vive. Si alguien señala la diferencia, responden que lo importante es que el resultado siga funcionando.\n\nYo he restaurado objetos hermosos que ya no podían cumplir su antigua función. Nadie habría propuesto destruirlos por eso. Tampoco me habrían permitido llamar original a una copia solo porque soportara más peso.\n\nDejo esta página aquí porque todavía crece algo sin que tengamos que ordenárselo. No sé si eso la convierte en una prueba. A mí me basta para querer que siga creciendo.",
    "lvl": "hospitalcastle1",
    "room": "Jardín de invierno",
    "x": 64,
    "y": 33
  },
  {
    "id": "lore20_21",
    "title": "Comité de revisión · el informe que no se votó",
    "text": "UMBRAL / ACTA INCOMPLETA\n\nLa propuesta de suspensión no cuestiona si el compuesto funciona. Cuestiona qué se considera un resultado aceptable y quién está autorizado a decidirlo por los receptores.\n\nSe han presentado recuperaciones de tejido como equivalentes a recuperaciones de la persona. Los testimonios que contradicen esa equivalencia se apartaron por no disponer de una medida común. La ausencia de una medida no vuelve irrelevante el sufrimiento descrito.\n\nEl doctor Wren solicitó prolongar los ensayos para resolver esa objeción. Es la misma respuesta que recibimos en la revisión anterior. Cada prolongación necesita nuevos sujetos, mientras los anteriores siguen sin poder retirarse.\n\nLa votación quedó aplazada por una incidencia de seguridad. Antes de abandonar la sala, la secretaria preguntó si debía destruir las copias de trabajo. Le pedimos que conservara al menos una. Esta es la que no llegó al archivo oficial.",
    "lvl": "hospitalumbra",
    "room": "Archivo de donantes",
    "x": 77,
    "y": 22
  },
  {
    "id": "lore20_22",
    "title": "Marta · copia de una carta devuelta",
    "text": "CORRESPONDENCIA PERSONAL / SIN CONSTANCIA DE ENTREGA\n\nElias:\n\nHe encontrado un dibujo que hizo para ti. No sé qué edad tenía entonces. Hay tres figuras en un jardín y todas tienen las manos demasiado grandes. Supongo que eran importantes para ella: las usábamos para llevarla, levantarla, peinarla y decirle adiós desde la puerta.\n\nNo te envío el dibujo. Quiero poder dártelo cuando regreses y preguntarte qué recuerdas de esa tarde. Quiero que me contestes como la persona que estaba allí, no como el médico que siempre tiene algo más urgente que terminar.\n\nNo te pido que dejes de buscarla. Te pido que no conviertas a todos los demás en una forma de no aceptar que todavía no la has encontrado.\n\nSi vuelve y yo no estoy, enséñale el dibujo antes de explicarle nada. Déjala recordar cómo éramos antes de que tú decidas cómo deberíamos haber sido.",
    "lvl": "hospitalumbra",
    "room": "Biobanco",
    "x": 47,
    "y": 46
  },
  {
    "id": "lore20_23",
    "title": "Entrevista A-0 · una respuesta que no servía",
    "text": "ARCHIVO DE MEMORIA AUTOBIOGRÁFICA / COPIA\n\nSe solicita al receptor que describa un recuerdo anterior a San Gabriel. La pregunta se repite con tres formulaciones. Responde que recuerda haber esperado en un coche mientras alguien volvía a buscar a otra persona bajo la lluvia.\n\nNo aporta una imagen precisa del rostro. Recuerda el ruido del agua sobre el techo y la preocupación de pensar que quizá no regresaría. Cuando se le pregunta qué ocurrió después, responde: «Volvió».\n\nLa referencia fue excluida de la batería comparativa por no identificar al acompañante ni establecer una fecha verificable. El receptor preguntó por qué la fecha importaba más que el regreso.\n\nNo se registró respuesta del entrevistador. Conservo esta copia porque describe algo que los demás ensayos no consiguen separar: el hecho que recuerda y la razón por la que aún le importa recordarlo.",
    "lvl": "hospitalumbra",
    "room": "Microscopía",
    "x": 107,
    "y": 46
  },
  {
    "id": "lore20_24",
    "title": "Wren · el último razonamiento",
    "text": "DICTADO PRIVADO / CORRECCIÓN A MANO\n\nDurante mucho tiempo pensé que mi error había sido detenerme demasiado pronto. Cada límite del compuesto me parecía una pared y cada nueva dosis, una forma de atravesarla. Nunca pregunté quién tendría que recoger los cuerpos al otro lado.\n\nAhora tengo miedo de que el límite no pertenezca al compuesto. De que fuera la parte de nosotros capaz de decidir cuándo basta. Esa posibilidad debería obligarme a detener el trabajo. He pasado la noche buscando una manera de demostrar que no es cierta.\n\nAxel todavía puede rechazar lo que le ofrezco. Me irrita más de lo que debería. Le he llamado inestable por conservar esa libertad, mientras utilizaba su sangre para estudiar precisamente aquello que conserva.\n\nLa versión final del informe dice que he superado el miedo. No he querido borrar este primer dictado. Tal vez alguien deba saber qué clase de victoria estoy preparando.",
    "lvl": "hospitalumbra",
    "room": "Galería norte",
    "x": 77,
    "y": 46
  }
],
  install(){
    for(const doc of this.documents){
      DOCS[doc.id]={title:doc.title,text:doc.text,lore:true,chapter:doc.lvl};
      const map=R2_DATA(doc.lvl);
      if(!map.items.some(row=>row[0]===doc.id))map.items.push([doc.id,'doc',doc.x,doc.y,{doc:doc.id,narrative:true}]);
    }
  }
};
R2LoreArchive.install();
