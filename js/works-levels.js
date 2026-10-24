// Continuación del hospital: planta de experimentación y vertidos San Gabriel.
const WorksMap = {
  id: 'hospitalworks', pit: 'hospitalpit',
  hub: [62,8,82,20],
  is(g = Game) { return g.lvl === this.id || g.lvl === this.pit; },
  safe(p = Game.player) { return Game.lvl === this.id && p.x >= 62*32 && p.x < 82*32 && p.y >= 8*32 && p.y < 20*32; },
  define() {
    const D = FLOORS.hospitalworks = {
      W:148,H:110,spawn:[64,12],safe:[this.hub],patrol:[],bossZone:null,
      rooms:[
        ['Vestíbulo de servicio',62,8,20,12],['Colector exterior',67,2,10,5],
        ['Eje de servicio',70,21,4,67],['Cruce de colectores',49,43,29,4],
        ['Control de bombas',8,23,19,12],['Taller de rotores',29,23,19,12],['Comedor de operarios',49,24,17,12],
        ['Dársena de toma',8,38,19,19],['Galería de filtros',29,38,19,15],['Aliviadero',8,60,19,13],
        ['Pozo de flujo',8,76,19,12],['Archivo de vertidos',29,56,18,12],['Pasarela de drenaje',49,49,4,22],
        ['Recepción zoológica',78,24,20,12],['Cámara frigorífica',101,24,21,12],
        ['Boxes de observación',78,39,20,18],['Veterinaria',101,39,21,16],['Quirófano animal',125,39,19,16],
        ['Patio de jaulas',78,60,20,15],['Depósito logístico',101,59,21,13],['Celdas de recuperación',125,59,19,13],
        ['Drenaje del vivario',101,76,21,12],['Desvío este',94,76,4,12],
        ['Sala de presión',56,55,11,15],['Prensa de fundición',56,73,11,11],['Herrería de servicio',31,74,20,12],
        ['Galería de escoria',31,88,70,4],['Muelle de chatarra',31,94,19,12],['Registro de hornos',54,94,18,12],['Sala de calderas',8,92,20,14],
      ],
      cuts:[[70,20,3,1],[70,7,3,1]],doors:[],furn:{machine:[],gen:[],crate:[],shelf:[],table:[],bed:[],locker:[],pillar:[]},decor:[],items:[],enemies:[],barrels:[],hazards:[],
    };
    const link=(id,x,y,w,h,key=null,vertical=false)=>{
      D.cuts.push([x,y,w,h]);D.doors.push([id,x,y,vertical?w:1,vertical?1:h,key]);
    };
    D.doors.push(['wx_hub',70,20,3,1,null],['wx_main',70,7,3,1,'h:wx_gate']);
    link('wx_rotor_w',27,27,2,3);
    link('wx_canteen',48,28,1,3);
    link('wx_canteen_e',66,28,4,3);
    link('wx_pump_s',16,35,3,3,null,true);
    link('wx_rotor_s',36,35,3,3,null,true);
    link('wx_dock_filter',27,44,2,3);
    link('wx_filter_e',48,43,1,3);
    link('wx_dock_s',16,57,3,3,null,true);
    link('wx_flow',16,73,3,3,'h:wx_pumps',true);
    link('wx_archive_n',36,53,3,3,null,true);
    link('wx_archive_w',27,63,2,3);
    link('wx_archive_e',47,63,2,3,'h:wx_pumps');
    D.cuts.push([49,47,4,2],[47,71,3,3],[47,73,3,2]);
    link('wx_reception',74,28,4,3);
    link('wx_freezer',98,28,3,3);
    link('wx_boxes_n',86,36,3,3,null,true);
    link('wx_boxes_w',74,43,4,3);
    link('wx_vet_n',109,36,3,3,null,true);
    link('wx_vet_w',98,45,3,3);
    link('wx_operating',122,45,3,3,'h:wx_cages');
    link('wx_yard_n',86,57,3,3,null,true);
    link('wx_warehouse_n',109,55,3,4,null,true);
    link('wx_yard_e',98,64,3,3);
    link('wx_recovery',122,64,3,3,'h:wx_cages');
    link('wx_drain_n',109,73,3,3,null,true);
    link('wx_yard_w',74,68,4,3);
    link('wx_detour_n',94,75,3,1,null,true);
    link('wx_drain_w',98,80,3,3);
    link('wx_pressure',67,60,3,3);
    link('wx_press',60,70,3,3,'h:wx_gears',true);
    D.cuts.push([38,86,3,2],[38,92,3,2],[60,92,3,2]);
    link('wx_scrap_w',28,97,3,3);
    link('wx_record_w',50,97,4,3);
    D.furn.machine.push([9,24],[10,24],[24,24],[30,24],[45,24],[102,25],[120,25],[102,40],[120,40],[126,40],[142,40],[57,56],[57,67],[57,74],[65,74],[9,93],[10,93],[25,103]);
    D.furn.gen.push([78,9],[79,9],[50,25],[51,25],[56,95],[69,95]);
    D.furn.shelf.push([30,39],[31,39],[44,39],[45,39],[30,57],[31,57],[43,57],[44,57],[102,60],[103,60],[119,60],[120,60],[32,95],[33,95],[47,95]);
    D.furn.crate.push([9,61],[24,61],[10,85],[24,85],[80,25],[95,25],[79,61],[96,61],[79,72],[102,77],[119,85],[126,60],[141,69],[33,75],[48,75],[33,83],[48,83],[32,89],[98,89]);
    D.furn.table.push([15,30],[16,30],[36,30],[37,30],[53,31],[54,31],[88,30],[89,30],[108,48],[109,48],[132,46],[133,46],[37,63],[38,63]);
    D.furn.bed.push([63,9],[64,9],[104,52],[117,52]);
    D.furn.locker.push([80,18],[50,34],[95,54],[120,69],[69,104]);
    D.furn.pillar.push([13,44],[23,51],[33,45],[43,48],[84,45],[93,52],[107,65],[117,65],[35,100],[46,102]);
    D.decor.push(['puddle',16,47],['wheel',86,49],['paper',35,61],['glass',62,79],['paper',113,68]);
    // Siempre existe un paso seco alternativo; los vertidos no son muros invisibles.
    D.hazards.push([10,47,14,7,'water'],[10,62,11,6,'pump'],[32,47,12,3,'water'],[82,47,12,6,'animal'],[103,43,7,4,'animal'],[104,79,14,5,'animal'],[57,60,4,7,'steam'],[77,89,13,2,'steam']);
    const docs=[['wx_intro',68,12],['wx_water',16,26],['wx_rotor_note',33,31],['wx_filter_note',43,42],['wx_archive',39,58],['wx_animal',82,28],['wx_freezer_note',115,31],['wx_cage_note',113,42],['wx_casualty',136,51],['wx_pressure',63,57],['wx_forge_note',36,78],['wx_shipping',40,97],['wx_record',66,101],['wx_supply',113,63],['wx_warning',85,65],['wx_kennel',111,81]];
    D.items.push(...docs.map(([id,x,y])=>_D(id,x,y)),
      _F('wx_save','savebed',65,11),_F('wx_stash','caja',64,17),_F('wx_bench','h_workbench',79,12),
      _FX('wx_back','h_stairs',64,14,{to:'hospitalchem',at:[39,20]}),
      _F('wx_shower','wx_wash',80,16),_F('wx_control','wx_main',76,17),
      _F('wx_pumps','wx_puzzle',21,27),_F('wx_cages','wx_puzzle',115,48),_F('wx_gears','wx_puzzle',63,65),
      _F('wx_filter','wx_puzzle',40,50),_F('wx_hoist','wx_puzzle',44,65),
      ['wx_rotor_pick','wx_part',42,31,{part:'wx_rotor'}],['wx_cell_pick','wx_part',117,33,{part:'wx_cell'}],['wx_coupling_pick','wx_part',34,82,{part:'wx_coupling'}],
      ['wx_charcoal_pick','wx_part',22,69,{part:'wx_charcoal'}],['wx_membrane_pick','wx_part',104,50,{part:'wx_membrane'}],['wx_seal_pick','wx_part',66,103,{part:'wx_seal'}],
      ['wx_valve_a','wx_valve',20,81,{part:'wx_valve_a'}],['wx_valve_b','wx_valve',139,49,{part:'wx_valve_b'}],['wx_valve_c','wx_valve',63,79,{part:'wx_valve_c'}],
      _F('wx_radio','wx_radio',128,49),_F('wx_pit','wx_pit',118,68),_F('wx_exit','wx_exit',72,3),
    );
    const provisions=[['ammo',67,16,18],['shells',69,17,6],['inj_green',67,11],['inj_cure',68,11],['rifleammo',77,16,5],['smg',77,18,30],['ammo',19,32,14],['inj_green',9,54],['shells',45,32,4],['inj_cure',35,50],['ammo',23,70,14],['rifleammo',39,66,4],['smg',51,68,24],['inj_green',51,33],['ammo',94,33,14],['inj_cure',103,33],['inj_green',120,53],['shells',141,53,6],['ammo',94,72,18],['smg',120,70,30],['inj_green',141,62],['rifleammo',118,86,4],['ammo',65,68,16],['inj_green',35,84],['shells',46,84,6],['smg',48,104,36],['rifleammo',25,100,5],['inj_green',13,101],['inj_cure',61,103]];
    provisions.forEach(([type,x,y,amount],i)=>D.items.push(['wx_supply_'+i,type,x,y,amount?{amount}:undefined]));
    [['screw_small',66,18,8],['powder_small',68,18,8],['screw_large',45,64,3],['powder_large',105,69,4],['screw_small',35,81,8],['powder_small',63,99,8]].forEach(([t,x,y,n],i)=>D.items.push(['wx_mat_'+i,t,x,y,{amount:n}]));
    const foes=[['wx_listener',19,42],['wx_scuttler',23,54],['wx_scuttler',10,68],['wx_spitter',22,64],['wx_mauler',39,28],['wx_scuttler',34,42],['wx_listener',39,61],['wx_spitter',51,60],['wx_mauler',87,29],['wx_scuttler',107,30],['wx_listener',85,49],['wx_spitter',93,53],['wx_scuttler',113,45],['wx_mauler',137,43],['wx_scuttler',88,69],['wx_scuttler',93,63],['wx_listener',111,65],['wx_spitter',135,66],['wx_mauler',114,81],['wx_scuttler',96,82],['wx_spitter',61,60],['wx_mauler',41,80],['wx_listener',57,89],['wx_scuttler',86,89],['wx_spitter',40,101],['wx_mauler',63,100],['wx_listener',17,97],['wx_scuttler',25,95]];
    D.enemies=foes.map(([t,x,y],i)=>[5000+i,t,x,y]);
    // Grupos finitos: presión distinta en cada sector, sin ocupar el refugio.
    const extra=[['wx_scuttler',55,29],['wx_scuttler',61,32],['wx_spitter',23,28],['wx_scuttler',13,32],
      ['wx_listener',43,43],['wx_scuttler',45,61],['wx_spitter',88,33],['wx_scuttler',119,29],
      ['wx_listener',115,51],['wx_scuttler',82,63],['wx_spitter',95,69],['wx_scuttler',117,84],
      ['wx_scuttler',34,78],['wx_listener',44,103],['wx_spitter',23,103],['wx_scuttler',71,78]];
    extra.forEach(([t,x,y],i)=>D.enemies.push([5300+i,t,x,y]));
    this.patrols={5300:[[55,29],[61,29],[61,32]],5307:[[119,29],[115,29],[115,32],[119,32]],
      5312:[[34,78],[37,78],[37,83],[34,83]],5315:[[71,78],[72,82],[71,86]]};
    [['ammo',21,30,18],['shells',90,34,4],['ammo',118,82,18],['smg',44,104,24],['inj_green',47,80],['powder_small',14,95,3]]
      .forEach(([t,x,y,n],i)=>D.items.push(['wx_reinforcement_supply_'+i,t,x,y,n?{amount:n}:undefined]));
    const P=FLOORS.hospitalpit={W:49,H:45,spawn:[5,23],safe:[],patrol:[],rooms:[['Antesala del almacén',3,21,7,6],['Cámara de ensayo circular',11,10,27,27],['Salida de inspección',39,21,8,7]],cuts:[[10,22,1,3],[38,22,1,3]],doors:[['wx_pit_entry',10,22,1,3,null],['wx_pit_exit',38,22,1,3,'h:wx_arena']],furn:{},decor:[],enemies:[],barrels:[],items:[
      _F('wx_pit_back','wx_return',5,24),_F('wx_plate_drop','wx_plate',20,32),_F('wx_plate_paw','wx_plate',24,34),_F('wx_plate_sun','wx_plate',28,32),
      _D('wx_pit_log',5,22),_F('wx_arena_cache','wx_cache',24,12),_F('wx_arena_loot','wx_reward',42,23),_F('wx_pit_out','wx_return',45,25),
    ]};
    // La escalera queda al otro lado de la puerta que solo abre la victoria.
    FLOORS.hospitalchem.items.push(_FX('wx_down','h_stairs',40,19,{to:'hospitalworks',at:[64,12]}));
  },
};
WorksMap.define();
Object.assign(KEYS,{
 wx_rotor:'Rotor de trasvase',wx_cell:'Batería veterinaria',wx_coupling:'Acople dentado',wx_charcoal:'Cartucho de carbón',wx_membrane:'Membrana estéril',wx_seal:'Precinto de carga',
 wx_valve_a:'Válvula azul · flujo',wx_valve_b:'Válvula ámbar · cuarentena',wx_valve_c:'Válvula verde · presión',wx_radio:'Radio del escuadrón 3-6-9AK',wx_filter:'Filtro de vertidos',
});
const WX_DOCS = {
 wx_intro:['Servicio bajo San Gabriel','La escalera C-0 termina en el vestíbulo de servicio. La línea auxiliar de esta sala aún alimenta la camilla, el baúl y el banco de armas.\n\nLa compuerta del colector necesita TRES VOLANTES, retirados durante la cuarentena: flujo (depuración), cuarentena (vivario) y presión (fundición). Cada sector mantiene un camino de vuelta a este refugio.\n\nEl agua negra no es lluvia. No bajen de las pasarelas. La ducha retira residuos; no cierra heridas.'],
 wx_water:['Trasvase · depósito partido','La válvula azul quedó bajo la esclusa del pozo de flujo. Para vaciar el aliviadero hay que equilibrar el depósito principal en DOS MITADES IGUALES y dejar el recipiente pequeño vacío.\n\nLos tanques tienen capacidad de 8, 5 y 3. No se añade ni se vierte líquido al suelo: abre una transferencia hasta que el origen se vacíe o el destino se llene.\n\nFalta el rotor del cuadro. El mecánico lo llevó al taller contiguo.'],
 wx_rotor_note:['Parte del mecánico','Guardé el rotor en el banco del taller; sus tres aletas todavía están enteras.\n\nCuando las bombas vuelvan, la puerta del pozo se desbloqueará y la pasarela del archivo abrirá un atajo. No gasten antídotos cruzando el vertido si pueden rodearlo por las rejillas.'],
 wx_filter_note:['Filtro personal · orden de capas','Las partículas grandes se paran primero en la MALLA. Después el CARBÓN retiene el compuesto. La MEMBRANA va al final, hacia el respirador.\n\nQuedó carbón sellado en el Aliviadero. Veterinaria conserva membranas estériles. El banco de filtros permite ensamblarlas sin corriente del resto de la planta.\n\nNo vuelve potable el agua. Solo reduce la exposición del portador.'],
 wx_archive:['Origen del vertido','REGISTRO DE LOTES / VIVARIO INFERIOR\n\nLos ensayos con perros, anfibios y reses se trasladaron aquí para que los gritos no alcanzaran el hospital. La carne rechazada y el agua de lavado acababan en el mismo colector.\n\nEl tratamiento neutralizaba bacterias. Nadie diseñó un filtro para un compuesto que reorganiza tejido. El agua empezó a latir antes de cambiar de color.'],
 wx_animal:['Turno de cuarentena','La válvula ámbar permanece en Quirófano animal. Su cierre responde a los indicadores de las nueve jaulas.\n\nANTES de liberar transferencias deben quedar TODOS APAGADOS. Cada mando cambia su propia jaula y las que comparten un lado. No las diagonales.\n\nEl panel necesita la batería que dejamos refrigerada en la cámara frigorífica.'],
 wx_freezer_note:['No es una luz de emergencia','El módulo de pared no ilumina: mantiene el bloqueo de las jaulas. Lo retiramos tras el corte y quedó sobre la mesa del fondo de esta cámara.\n\nAl devolverle corriente, comprueben las NUEVE señales. Una sola activa basta para que no abra el quirófano.'],
 wx_cage_note:['Notas del rastreador sin ojos','SUJETO A-14 / antes: perro de rastreo\n\nLas cuencas se sellaron en seis horas. Seguía encontrando al operario que corría. Ignoró una linterna, pero atravesó una jaula al oír un cargador caer.\n\nCaminar deja menos vibración que correr. Quedarse quieto lo confunde si no alcanzó a oír dónde paraste. No respira por la nariz: saborea las vibraciones del suelo.'],
 wx_casualty:['La última revisión animal','La válvula de cuarentena estaba montada junto a la bandeja de cirugía. No dejen que la sangre del suelo tape su pintura ámbar.\n\nHabía una radio militar. La misma petición se repite con la misma tos. No consigue contestar una sola pregunta.'],
 wx_pressure:['Cuatro dientes bajo presión','Para liberar el volante verde de la prensa, las CUATRO MUESCAS del tren deben apuntar al centro. Cada rueda arrastra a la siguiente en sentido opuesto.\n\nSin el acople dentado no transmiten movimiento. El herrero lo retiró a su sala al oeste de la galería de escoria.\n\nLa prensa está cerrada por seguridad. El sistema abre el cierre y corta las fugas de vapor al alinearse.'],
 wx_forge_note:['Inventario del herrero','Acople: estante bajo, junto al banco de esta herrería.\n\nNo volveré a la sala de presión. Lo que se escondió en el horno tiene pezuñas por debajo de los brazos. Cuando baja la cabeza, sal de su línea. Una carga fallida tarda en recoger el peso.'],
 wx_shipping:['Grúa del armero','El Archivo de vertidos guarda un cajón con un compensador M12. La grúa tiene tres postes y tres piezas de soporte.\n\nPasa toda la pila al poste de descarga, una pieza cada vez. Nunca una pieza grande sobre una pequeña: el tope la rechaza. El poste del centro es apoyo.\n\nHace falta el precinto de carga firmado que quedó en Registro de hornos. El compensador mejora daño y esfuerzo solo de la escopeta.'],
 wx_record:['Registro de hornos · última firma','Retiré el precinto de la grúa antes del motín. Lo dejé detrás de los libros de este registro.\n\nEl escuadrón 3-6-9AK fue enviado a recuperar tejidos. La última entrada dice «almacén», no «rescate». Nadie registró su salida.'],
 wx_supply:['Almacén · consulta por radio','La cámara de ensayo depende de una autorización de voz. La radio del quirófano conserva la frecuencia del escuadrón 3-6-9AK.\n\nLas tres placas están dentro del círculo: depuración, recepción animal, descontaminación. Un operario tiene que pisarlas y confirmar cada una con la mano.\n\nEl maletín de inspección queda fuera del cierre opuesto.'],
 wx_warning:['No lo provoques en el agua','Los sifones tragan el residuo y lo escupen como una manguera rota. Antes de cada descarga el saco del cuello se infla.\n\nLos corredores jóvenes frenan antes de abalanzarse. El grande gira mal al cargar. Todos oyen los golpes, pero el ciego no necesita verte.'],
 wx_kennel:['Módulo de voz / animal K-9','La repetición vocal no demuestra memoria ni comprensión. El sujeto K-9 reproduce las últimas frases oídas, incluido el tono de auxilio.\n\nNo obedecer instrucciones de una voz sin comprobar su origen. Si el ensayo ya empezó, completar su supervivencia es el único modo de liberar el cierre.'],
 wx_radio_log:['Transmisión · escuadrón 3-6-9AK','«Aquí el sargento Dávila, escuadrón 3-6-9AK. Estoy encerrado en la cámara del almacén. Necesito ayuda.\n\n»Entra desde Depósito logístico. Confirma las placas: primero la GOTA de depuración, después la HUELLA de recepción, por último el SOL de descontaminación. Gota, huella, sol.\n\n»Cuando el cierre me detecte, saldré. Tengo un maletín de equipo. Por favor…»\n\nLa tos se repite exactamente igual al reiniciar la señal.'],
 wx_pit_log:['Cámara de ensayo · ciclo de ocho cargas','Protocolo automático. Ocho exposiciones consecutivas; la octava incluye al custodio del almacén.\n\nNo hay descarga sin aviso en una boca de servicio. Al terminar cada exposición hay una pausa y una reserva de suministros junto a la pared norte.\n\nSi no continúa, comprobar que no queda ningún ejemplar vivo. No iniciar con poco equipo. La antesala permite regresar antes de confirmar las tres placas.'],
};
for(const [id,[title,text]]of Object.entries(WX_DOCS)){DOCS[id]={title,text};CLUES.add(id);}
for(const [id,note]of Object.entries({wx_rotor:['Pieza de tres aletas para el cuadro de trasvase.','La hoja del Control de bombas explica cómo equilibrar el agua.'],wx_cell:['Batería sellada de cuarentena.','Alimenta el panel de las nueve jaulas en Veterinaria.'],wx_coupling:['Acople con cuatro dientes.','Vuelve al tren de engranajes de la Sala de presión.'],wx_charcoal:['Carbón absorbente sellado.','Galería de filtros: la malla va antes que el carbón.'],wx_membrane:['Membrana estéril del vivario.','Galería de filtros: esta es la última capa.'],wx_seal:['Precinto firmado para el cajón del armero.','La grúa del Archivo de vertidos acepta este permiso.'],wx_valve_a:['Volante azul recuperado del pozo.','Encaja en la toma de flujo del panel del vestíbulo.'],wx_valve_b:['Volante ámbar del quirófano animal.','Encaja en la toma de cuarentena del vestíbulo.'],wx_valve_c:['Volante verde de la prensa.','Encaja en la toma de presión del vestíbulo.'],wx_radio:['Emite una petición de auxilio repetida.','Depósito logístico. El registro de la transmisión conserva el orden de placas.'],wx_filter:['Filtración de residuos instalada.','Reduce un 45 % la acumulación de veneno; no vuelve segura el agua.']}))FieldDesk.artifactNotes[id]=[note[0],note[1],'hospitalworks'];
