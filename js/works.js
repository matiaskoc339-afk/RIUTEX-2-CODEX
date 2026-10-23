// Estado persistente de la fábrica; mantiene el equipo y la red del hospital.
const Works = {
 data(g=Game) {
  const q=g.story.works||(g.story.works={});
  q.installed||=[];q.mechanisms||={};q.upgrades||=[];
  q.arena||={active:false,wave:0,cleared:0,plate:0,timer:0,cache:[],enemies:[]};
  q.arena.cache||=[];q.arena.enemies||=[];return q;
 },
 enter(g){this.data(g);g.story.finalEncounter={...(g.story.finalEncounter||{}),escaped:true};Hospital.goto(g,WorksMap.id,[64,12]);UI.msg('Bajo el hospital sigue funcionando algo. El vestíbulo conserva una línea segura.',6500);},
 flag(g,kind){return !!g.pz['h:wx_'+kind];},
 openDoors(g){for(const d of Level.doors)if(d.key?.startsWith('h:wx_')&&g.pz[d.key])Level.openDoor(d);},
 rememberArena(g) {
  if(g.lvl!==WorksMap.pit)return;
  this.data(g).arena.enemies=g.enemies.filter(e=>e instanceof WorksEnemy&&!e.dead).map(e=>({type:e.type,id:e.id,x:e.x,y:e.y,hp:e.hp,enraged:e.enraged,target:e.target,memory:e.memory}));
 },
 install(g,id) {
  const q=this.data(g);if(!['a','b','c'].includes(id)||q.installed.includes(id)||!g.inv.keys.includes('wx_valve_'+id))return false;
  q.installed.push(id);g.inv.keys=g.inv.keys.filter(k=>k!=='wx_valve_'+id);Sound.play('door');
  if(q.installed.length===3){g.pz['h:wx_gate']=true;this.openDoors(g);UI.msg('Los tres ramales responden. La compuerta principal empieza a abrirse.',6500);g.cam.shake=8;}
  Hospital.checkpoint(g);return true;
 },
 part(g,it) {
  if(g.picked.has(it.id))return;
  if(!g.inv.keys.includes(it.part))g.inv.keys.push(it.part);
  g.picked.add(it.id);g.items=g.items.filter(i=>i.id!==it.id);Sound.play('pickup');
  UI.msg(KEYS[it.part]+' recuperada. Consulta su pista en Artefactos.',4500);
 },
 radio(g) {
  const q=this.data(g);q.radio=true;
  if(!g.inv.keys.includes('wx_radio'))g.inv.keys.push('wx_radio');
  if(!g.inv.docs.includes('wx_radio_log'))g.inv.docs.push('wx_radio_log');
  g.state='doc';UI.screen('doc');UI.renderJournal(g,'wx_radio_log');Sound.tone(380,.15,.12,'square');
 },
 use(g,it) {
  if(it.type==='wx_part'||it.type==='wx_valve')return this.part(g,it);
  if(it.type==='wx_puzzle')return WorksPuzzles.open(g,it.id.replace('wx_',''));
  if(it.type==='wx_main')return WorksPuzzles.open(g,'main');
  if(it.type==='wx_radio')return this.radio(g);
  if(it.type==='wx_wash'){g.player.poison=0;g.player.resist=Math.max(g.player.resist,12);Sound.noise(.2,.1,450);return UI.msg('Ducha de descontaminación: residuos retirados. Las heridas permanecen.',4000);}
  if(it.type==='wx_pit') {
   if(!this.data(g).radio)return UI.msg('La autorización del almacén llega por una frecuencia militar. Hay una radio en el vivario.',5000);
   return Hospital.goto(g,WorksMap.pit,[5,23]);
  }
  if(it.type==='wx_return') {
   if(this.data(g).arena.active)return UI.msg('El cierre está retenido por el ensayo. Todavía hay actividad dentro.',4500);
   return Hospital.goto(g,WorksMap.id,[118,67]);
  }
  if(it.type==='wx_plate')return WorksArena.plate(g,it);
  if(it.type==='wx_cache')return WorksArena.cache(g);
  if(it.type==='wx_reward') {
   const q=this.data(g);if(!this.flag(g,'arena'))return UI.msg('El maletín está tras el cierre de inspección.');
   if(q.upgrades.includes('uzi_cycle'))return UI.msg('El maletín de inspección ya está vacío.');
   q.upgrades.push('uzi_cycle');q.radioDone=true;g.picked.add(it.id);g.items=g.items.filter(i=>i.id!==it.id);
   Hospital.checkpoint(g);return UI.msg('Kit de ciclo UZI: −18 % de esfuerzo y −15 % de dispersión. La petición de auxilio era una grabación.',7500);
  }
  if(it.type==='wx_exit') {
   if(!this.flag(g,'gate'))return UI.msg('La presión de los tres ramales mantiene la salida cerrada.');
   this.data(g).complete=true;g.save(3);g.keys={};g.state='end';Sound.stopAmbient();
   UI.$('endH').textContent='COLECTOR ABIERTO';UI.$('endS').textContent='San Gabriel · Fábrica de vertidos';UI.$('endB').textContent='Los tres volantes responden. Axel deja atrás el vivario y la planta de depuración.\n\nHasta aquí llega esta entrega. Puedes seguir explorando desde tu guardado del vestíbulo.\n\nVálvulas instaladas: 3 / 3\nEnsayo del almacén: '+(this.flag(g,'arena')?'superado':'no completado');UI.screen('end');
  }
 },
 label(it) {
  const names={wx_part:'Recoger '+(KEYS[it.part]||'pieza'),wx_valve:'Recuperar '+(KEYS[it.part]||'válvula'),wx_wash:'Usar ducha de descontaminación',wx_main:'Examinar tomas de la compuerta',wx_radio:'Escuchar radio · 3-6-9AK',wx_pit:'Bajar a la cámara del almacén',wx_return:'Escalera de Depósito logístico',wx_reward:'Abrir maletín de inspección',wx_cache:'Abrir reserva del ensayo',wx_exit:'Cruzar el colector abierto'};
  if(it.type==='wx_plate')return 'Confirmar placa · '+({wx_plate_drop:'GOTA',wx_plate_paw:'HUELLA',wx_plate_sun:'SOL'}[it.id]);
  if(it.type==='wx_puzzle')return {wx_pumps:'Cuadro de trasvase',wx_cages:'Panel de las nueve jaulas',wx_gears:'Alinear tren de presión',wx_filter:'Ensamblar filtro de vertidos',wx_hoist:'Grúa del cajón del armero'}[it.id];
  return names[it.type]||it.type;
 },
 objective(g) {
  const q=this.data(g),goal=HospitalCompass.goal;
  if(g.lvl===WorksMap.pit)return goal('wx_trial',this.flag(g,'arena')?'Silencio al otro lado':'La voz del almacén',this.flag(g,'arena')?'El cierre de inspección ha cedido. La grabación se ha detenido.':q.arena.active?'El círculo responde por ciclos. Conserva fuerzas entre exposiciones.':'La radio dejó un orden de tres símbolos. Todavía puedes regresar.',WorksMap.pit,[24,24,16,15],'Cámara de ensayo');
  if(this.flag(g,'gate'))return goal('wx_leave','Tres ramales, una salida','La presión ha cambiado en el vestíbulo. El colector ya responde.',WorksMap.id,[72,10,12,9],'Cabecera del colector');
  if(['a','b','c'].some(k=>g.inv.keys.includes('wx_valve_'+k)))return goal('wx_return','Devolver el control','La pieza recuperada encaja en una de las tomas del refugio.',WorksMap.id,[72,14,17,11],'Vestíbulo de servicio');
  const choices=[['a','Bajo el agua','Las bombas y el vertido comparten el mismo pulso. Los registros de mantenimiento conservan una salida.',[25,49,23,27],'Sector de depuración'],['b','Lo que quedó en las jaulas','Los ensayos animales dejaron una red de cierres. Sigue los registros de cuarentena.',[111,44,27,23],'Sector del vivario'],['c','Dientes bajo presión','El metal continúa trabajando bajo la galería de escoria. La presión no baja sola.',[59,79,22,27],'Sector de fundición']];
  const next=choices.find(([k])=>!q.installed.includes(k));return goal('wx_'+next[0],next[1],next[2],WorksMap.id,next[3],next[4]);
 },
};
const WorksArena = {
 waves:[['wx_scuttler','wx_scuttler'],['wx_scuttler','wx_spitter'],['wx_listener','wx_scuttler'],['wx_mauler','wx_scuttler','wx_scuttler'],['wx_spitter','wx_listener','wx_scuttler'],['wx_mauler','wx_spitter','wx_scuttler'],['wx_listener','wx_spitter','wx_scuttler','wx_scuttler'],['wx_keeper','wx_scuttler','wx_scuttler']],
 mouths:[[24.5*32,11.5*32],[36.5*32,23.5*32],[24.5*32,35.5*32],[12.5*32,23.5*32]],
 plate(g,it) {
  const a=Works.data(g).arena;if(Works.flag(g,'arena'))return UI.msg('El ensayo ha terminado. Los cierres están libres.');
  if(a.active)return UI.msg('La voz ha cambiado. El ensayo ya está en marcha.');
  const order=['wx_plate_drop','wx_plate_paw','wx_plate_sun'];
  if(it.id!==order[a.plate]){a.plate=0;Sound.play('empty');return UI.msg('La autorización se borra. La radio dejó un orden: consulta su registro.',4500);}
  a.plate++;Sound.play('door');
  if(a.plate<3)return UI.msg('Confirmación '+a.plate+' / 3. La radio repite el siguiente símbolo.',3000);
  a.active=true;a.wave=0;a.cleared=0;a.timer=5;a.pending=null;a.enemies=[];
  const entry=Level.doors.find(d=>d.id==='wx_pit_entry');entry.key='h:wx_arena';Level.closeDoor(entry,true);
  Hospital.checkpoint(g);g.cam.shake=12;
  UI.msg('«AUTORIZACIÓN ACEPTADA. INICIANDO ALIMENTACIÓN.» La voz era una grabación. Ocho ciclos.',7000);
 },
 live(g){return g.enemies.filter(e=>e instanceof WorksEnemy&&!e.dead);},
 prepare(g,a) {
  const roster=this.waves[a.wave],p=g.player;
  a.wave++;a.pending=roster.map((type,j)=>{
   const options=this.mouths.map(([x,y],i)=>({x,y,i,d:Math.hypot(x-p.x,y-p.y)})).sort((u,v)=>v.d-u.d);
   const m=options[j%2],off=j<2?-22:22,dx=(m.x-24.5*32)/384,dy=(m.y-23.5*32)/384;return {type,id:6100+a.wave*10+j,x:m.x-dy*off,y:m.y+dx*off};
  });a.timer=2.1;
  Sound.tone(100,.4,.18,'sawtooth');
 },
 tick(g,dt) {
  const a=Works.data(g).arena;if(g.lvl!==WorksMap.pit||!a.active||g.state!=='play')return;
  if(a.pending) {
   a.timer-=dt;
   if(a.timer<=0){for(const s of a.pending){const e=new WorksEnemy(s.type,s.x,s.y,s.id);e.target=[g.player.x,g.player.y];e.memory=9;e.mode='stalk';e.grace=.5;g.enemies.push(e);}a.pending=null;}
   return;
  }
  if(this.live(g).length)return;
  if(a.wave>a.cleared){a.cleared=a.wave;a.timer=6;
   if(a.cleared===8){a.active=false;g.pz['h:wx_arena']=true;Works.openDoors(g);const entry=Level.doors.find(d=>d.id==='wx_pit_entry');Level.openDoor(entry);Hospital.checkpoint(g);UI.msg('El octavo ciclo ha cesado. El maletín espera en la salida de inspección.',6500);return;}
   UI.msg('Ciclo '+a.cleared+' superado. La reserva del muro norte tiene suministros.',4500);
  }
  a.timer-=dt;if(a.timer<=0)this.prepare(g,a);
 },
 cache(g) {
  const a=Works.data(g).arena,stage=a.cleared;
  if(a.cache.includes(stage))return UI.msg('La reserva de este ciclo está vacía.');
  if(!a.active&&stage===0)return UI.msg('La reserva se libera al comenzar el ensayo. Prepárate antes de confirmar las placas.');
  const id=g.player.weapon?.id||'pistol',supply={pistol:['am_pistol',12],shotgun:['am_shells',4],viper:['am_smg',30],rifle:['am_rifle',4]}[id]||['am_pistol',12];
  BluePuzzles.reward(g,...supply);if(stage===2||stage===4||stage===6)BluePuzzles.reward(g,'inj_green');
  a.cache.push(stage);Sound.play('pickup');UI.msg('Reserva '+stage+' recuperada. Si no cabía, queda en el baúl del refugio.',3500);
 },
};

(() => {
 // La escalera del costado sustituye únicamente el punto final de la entrega anterior.
 FinalEncounter.ending=function(g){if(g.state==='play'&&g.pz['h:boss']){if(g.lvl==='hospitalb')Hospital.goto(g,'hospitalchem',[39,19]);}};
 const init=Game.init;
 Game.init=function(){init.call(this);WorksPuzzles.init(this);const el=document.createElement('div');el.id='worksStatus';el.className='hidden';UI.$('hud').appendChild(el);UI.$('menu').querySelector('h2').textContent='EL CUSTODIO · HOSPITAL Y FÁBRICA';UI.$('menu').querySelector('.menu-footer').innerHTML='<span>RIUTEX 2</span><span>HOSPITAL + FÁBRICA / v0.11.0</span><span>WASD + RATÓN</span>';};
 const build=Hospital.buildLevel;
 Hospital.buildLevel=function(g,lvl,sv){
  build.call(this,g,lvl,sv);g.worksNoise=null;
  if(!WorksMap.is(g))return;
  g.enemies=g.enemies.filter(e=>e!==g.carn);g.carn=null;g.boss=null;g.curBoss=null;g.carnT=0;
  const q=Works.data(g);
  for(const id of [...g.picked,...g.items.map(i=>i.id)]){const m=String(id).match(/^drop(?:_mat_)?(\d+)$/);if(m)g.dropN=Math.max(g.dropN,Number(m[1]));}
  if(lvl===WorksMap.id)g.story.finalEncounter={...(g.story.finalEncounter||{}),escaped:true};
  if(lvl===WorksMap.id){g.enemies=g.enemies.map(e=>{const n=new WorksEnemy(e.type,e.x,e.y,e.id);n.dead=e.dead;return n;});}
  else {
   for(const s of q.arena.enemies||[])if(!g.killed.has(s.id)){const e=new WorksEnemy(s.type,s.x,s.y,s.id);e.hp=Math.max(1,Math.min(e.maxHp,s.hp));e.enraged=!!s.enraged;e.mode='stalk';e.target=s.target===null?null:(s.target||[sv?.x??g.player.x,sv?.y??g.player.y]).slice();e.memory=s.memory??8;e.grace=2;g.enemies.push(e);}
   if(q.arena.active){const d=Level.doors.find(d=>d.id==='wx_pit_entry');d.key='h:wx_arena';Level.closeDoor(d,true);}
  }
  Works.openDoors(g);
 };
 const bossDrops=Hospital.bossDrops;Hospital.bossDrops=function(g){if(!WorksMap.is(g))return bossDrops.call(this,g);};
 const save=Game.save;Game.save=function(...args){if(WorksMap.is(this))Works.rememberArena(this);return save.apply(this,args);};
 const goto=Hospital.goto;Hospital.goto=function(g,...args){if(WorksMap.is(g))Works.rememberArena(g);return goto.call(this,g,...args);};
 const take=Game.take;Game.take=function(it){if(it?.type.startsWith('wx_'))return Works.use(this,it);return take.call(this,it);};
 const label=Puzzles.label;Puzzles.label=function(it){if(it.type.startsWith('wx_'))return Works.label(it);if(it.id==='wx_down')return 'Bajar a la fábrica de vertidos';if(it.id==='wx_back')return 'Subir a la contención C-0';return label.call(this,it);};
 const item=itemLabel;itemLabel=function(it){return it.type.startsWith('wx_')||it.id==='wx_down'||it.id==='wx_back'?Puzzles.label(it):item(it);};
 const why=Game.doorWhy;Game.doorWhy=function(d){return ({'h:wx_pumps':'El trasvase mantiene la esclusa bloqueada.','h:wx_cages':'La cuarentena todavía tiene señales activas.','h:wx_gears':'La prensa sigue bajo presión.','h:wx_gate':'Las tres tomas del colector necesitan sus volantes.','h:wx_arena':'El ensayo retiene el cierre de inspección.'})[d.key]||why.call(this,d);};
 const current=HospitalCompass.current;HospitalCompass.current=function(g){return WorksMap.is(g)?Works.objective(g):current.call(this,g);};
 const tick=Hospital.tick;Hospital.tick=function(g,dt){tick.call(this,g,dt);if(!WorksMap.is(g)||g.state!=='play')return;
  if(g.worksNoise)g.worksNoise.life-=dt;
  if(g.lvl===WorksMap.id&&!Works.data(g).radio&&!Works.data(g).radioPing&&Math.hypot(g.player.x-128.5*32,g.player.y-49.5*32)<230){Works.data(g).radioPing=true;UI.msg('Una radio militar pide ayuda entre las bandejas del vivario. [E] para escuchar.',5500);Sound.tone(380,.25,.15,'square');}
  WorksArena.tick(g,dt);const q=Works.data(g),el=UI.$('worksStatus');el.classList.remove('hidden');
  if(g.lvl===WorksMap.pit){const a=q.arena;el.innerHTML='<span>ALMACÉN / ENSAYO</span><strong>'+ (Works.flag(g,'arena')?'8 / 8 · CIERRE LIBRE':a.active?'OLEADA '+Math.max(1,a.wave)+' / 8':'AUTORIZACIÓN '+a.plate+' / 3')+'</strong><small>'+(a.pending?'Vibración en las bocas de servicio…':WorksArena.live(g).length?WorksArena.live(g).length+' presencias activas':a.active?'Pausa entre ciclos · reserva al norte':Works.flag(g,'arena')?'Maletín en la salida de inspección':'La radio conserva el orden de placas')+'</small>';
   const boss=g.enemies.find(e=>e.type==='wx_keeper'&&!e.dead);if(boss)el.innerHTML+='<div class="wx-boss"><b>EL REPETIDOR K-9</b><i style="width:'+Math.max(0,boss.hp/boss.maxHp*100)+'%"></i></div>';
  }else el.innerHTML='<span>COLECTOR / CONTROL</span><strong>'+q.installed.length+' / 3 VÁLVULAS</strong><small>'+(WorksMap.safe()?'REFUGIO · CAMILLA / BAÚL / ARMERO':g.player.poison>0?'EXPOSICIÓN A VERTIDOS':q.radio&&!q.radioDone?'Radio 3-6-9AK · petición pendiente':'Fábrica de vertidos')+'</small>';
 };
 const bench=Workshop.render;Workshop.render=function(g,id){bench.call(this,g,id);const q=g.story.works;if(!q)return;const mods=q.upgrades||[];const text=[mods.includes('shot_compensator')?'M12 · Compensador (+12 % daño / −10 % esfuerzo)':'',mods.includes('uzi_cycle')?'UZI · Ciclo de inspección (−18 % esfuerzo / −15 % dispersión)':''].filter(Boolean);if(text.length){const p=document.createElement('p');p.className='wx-bench-mods';p.textContent='MÓDULOS DE FÁBRICA: '+text.join(' · ');UI.$('benchPower').appendChild(p);}};
 const discover=Blue.discover;Blue.discover=function(g){discover.call(this,g);if(WorksMap.is(g))UI.$('phaseBadge').textContent='CLOACAS / FÁBRICA · '+(g.lvl===WorksMap.pit?'ENSAYO':'EXPLORACIÓN');};
 const render=Game.render;Game.render=function(){render.call(this);if(!WorksMap.is(this))UI.$('worksStatus').classList.add('hidden');};
 const noiseFire=Weapons.fire;Weapons.fire=function(g,p,...args){const mag=p.weapon?.mag;const r=noiseFire.call(this,g,p,...args);if(WorksMap.is(g)&&p.weapon?.mag<mag)g.worksNoise={x:p.x,y:p.y,r:p.weapon.id==='flamethrower'?420:650,life:.65};return r;};
 const updatePlayer=Player.prototype.update;Player.prototype.update=function(dt,g){if(g.lvl===WorksMap.id&&Level.fluidAt(this.x,this.y)===2)this.addPoison(dt*1.5);return updatePlayer.call(this,dt,g);};
 const poison=Player.prototype.addPoison;Player.prototype.addPoison=function(s){if(WorksMap.safe(this))return;if(WorksMap.is()&&Works.data().filter)s*=.55;return poison.call(this,s);};
 const hurt=Player.prototype.hurt;Player.prototype.hurt=function(...args){if(WorksMap.safe(this))return;return hurt.apply(this,args);};
 const effective=Weapons.effective;Weapons.effective=function(p,id){const w=effective.call(this,p,id);if(!isR2())return w;const q=Game.story.works;if(!q)return w;
  if(id==='shotgun'&&q.upgrades?.includes('shot_compensator'))return {...w,dmg:w.dmg*1.12,stam:w.stam*.9};
  if(id==='viper'&&q.upgrades?.includes('uzi_cycle'))return {...w,stam:w.stam*.82,spread:w.spread*.85,bloomFactor:(w.bloomFactor||1)*.85};return w;
 };
 const escape=Game.resume;Game.resume=function(...args){WorksPuzzles.cur=null;return escape.apply(this,args);};
 addEventListener('keydown',e=>{if(Game.state==='worksPuzzle'&&e.code==='Escape'){Game.resume();e.preventDefault();e.stopImmediatePropagation();}},true);
})();
