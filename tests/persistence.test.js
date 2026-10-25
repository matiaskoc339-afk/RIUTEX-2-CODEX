const test=require('node:test'),assert=require('node:assert/strict');
const {X,run,sandbox}=require('./harness');
const {Game:g,Hospital:H}=X;const S=run('SessionSave');g.init();
function start(lvl='hospital'){
 g.startLvl='mansion';g.start(false);
 if(lvl!=='mansion'){H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';if(lvl!=='hospital')H.goto(g,lvl);}
 g.state='play';g.keys={};g.mouse.down=false;g.player.invuln=0;S.flush(g);return g;
}
test('La sesión se guarda en claves estables y no ocupa ni sobrescribe camillas o Reintentar',()=>{
 start();for(let i=0;i<3;i++){g.player.xp=i+1;assert.equal(g.save(i),true);}const slots=JSON.stringify(g.getSaveSlots());
 g.player.xp=17;g.player.hp=43;assert.ok(S.flush(g));assert.equal(S.read().data.xp,17);assert.equal(JSON.stringify(g.getSaveSlots()),slots);assert.equal(g.getSaveSlots().length,4);
});
test('Reanudar conserva heridas, veneno, estamina, Riutex, munición, inventario, habilidades y enfriamientos',()=>{
 start();g.giveWeapon('pistol',12,true);g.player.weapon.mag=5;g.mut.owned.add('reflejos');g.mut.cd.reflejos=.7;
 g.player.hp=37;g.player.xp=19;g.player.stamina=23;g.player.energy=28;g.player.poison=4;g.player.resist=2;g.player.angle=1.2;
 run('ProtectionSuit.acquire(Game);ProtectionSuit.data().hp=27');const inv=JSON.stringify(g.inv.serialize()),s=S.capture(g);
 start();S.resume(s);assert.equal(g.player.hp,37);assert.equal(g.player.stamina,23);assert.equal(g.player.energy,28);assert.equal(g.player.poison,4);assert.equal(g.player.resist,2);assert.equal(g.player.xp,19);assert.equal(g.player.weapon.mag,5);assert.equal(g.player.angle,1.2);assert.equal(JSON.stringify(g.inv.serialize()),inv);assert.ok(g.mut.has('reflejos'));assert.equal(g.mut.cd.reflejos,.7);assert.equal(run('ProtectionSuit.data().hp'),27);
});
test('La sesión conserva documentos, objetos recogidos, muertos y heridas de enemigos sin volver a cobrar XP',()=>{
 start();const doc=g.items.find(i=>i.doc==='a1');g.take(doc);g.resume();const dead=g.enemies.find(e=>e.type==='sonambulo'),hurt=g.enemies.find(e=>e.type==='enfermera');dead.hurt(9999,0,g);hurt.hp=13;const xp=g.player.xp,id=dead.id,hid=hurt.id,s=S.capture(g);
 S.resume(s);assert.equal(g.player.xp,xp);assert.ok(g.inv.docs.includes('a1'));assert.ok(g.picked.has(doc.id));assert.ok(g.killed.has(id));assert.ok(!g.items.some(i=>i.id===doc.id));assert.ok(!g.enemies.some(e=>e.id===id&&!e.dead));assert.equal(g.enemies.find(e=>e.id===hid).hp,13);
});
test('Salir durante una recarga del FL-4 conserva el cambio de tanque y solo consume uno al terminar',()=>{
 start();g.giveWeapon('flamethrower',2,true);g.player.weapon=g.player.weapons.flamethrower;g.player.weapon.mag=5;X.Weapons.reload(g.player);assert.ok(g.player.reloading>0);const tanks=g.inv.reserve('flamethrower'),s=S.capture(g);S.resume(s);assert.ok(g.player.reloading>0);g.player.reloading=0;assert.equal(X.Weapons.finishReload(g.player),true);assert.equal(g.inv.reserve('flamethrower'),tanks-1);assert.ok(g.player.weapon.mag>5);assert.equal(X.Weapons.finishReload(g.player),false);assert.equal(g.inv.reserve('flamethrower'),tanks-1);
});
test('Los quince mapas admiten una sesión válida y recuperan mapa y posición',()=>{
 for(const lvl of ['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']){
  start(lvl);const s=S.capture(g);assert.ok(S.valid(s),lvl);S.resume(s);assert.equal(g.lvl,lvl);assert.equal(g.player.x,s.data.x);assert.equal(g.player.y,s.data.y);
 }
});
test('Cerrar durante los cuatro jefes conserva su fase y salud, sin reiniciar la pelea ni curar al jugador',()=>{
 for(const [lvl,hp] of [['hospitalchem',750],['hospitalnest',900],['hospitalroyal',1200],['hospitalorigin',1800]]){
  start(lvl);g.boss.phase=2;g.boss.hp=hp;g.boss.mode='recover';g.boss.active=true;g.player.hp=31;
  const s=S.capture(g);S.resume(s);assert.equal(g.boss.phase,2,lvl);assert.equal(g.boss.hp,hp,lvl);assert.equal(g.player.hp,31,lvl);
 }
});
test('El encuentro del frasco conserva al Custodio y su temporizador, sin atascar el prólogo',()=>{
 start('mansion');const vial=g.items.find(i=>i.id==='h_vial');g.player.x=vial.x;g.player.y=vial.y;H.finale(g);H.ft=8;g.custodio.x=1000;const s=S.capture(g);S.resume(s);assert.ok(g.story.finale);assert.ok(g.custodio);assert.equal(g.custodio.x,1000);assert.equal(H.ft,8);assert.equal(X.Level.lamps.length,0);const door=X.Level.doors.find(d=>d.id==='secreto');assert.equal(door.open,false);assert.equal(door.key,'h:capture');for(let i=0;i<300&&g.lvl==='mansion';i++)H.finaleTick(g,1/30);assert.equal(g.lvl,'hospital');
});
test('La huida herido conserva el brazo perdido, la puerta y al perseguidor',()=>{
 start();g.story.armCut=true;g.story.armHealed=false;g.story.seq='wounded_run';g.player.hp=12;g.carn.dormant=false;g.carn.scripted=true;g.carn.state='chase';const s=S.capture(g);S.resume(s);assert.equal(g.player.hp,12);assert.ok(g.story.armCut&&!g.story.armHealed);assert.equal(g.story.seq,'wounded_run');assert.equal(g.carn.dormant,false);assert.equal(g.carn.scripted,true);
});
test('Cerrar durante una carga del perseguidor conserva su posición y reanuda con pausa segura',()=>{
 for(const state of ['windup','rushWind','rush']){
  start();g.carn.dormant=false;g.carn.active=false;g.carn.state=state;g.carn.mt=.1;g.carn.dir=.5;g.carn.burstCd=5;g.carn.rushHit=false;g.player.hp=41;
  const s=S.capture(g),x=g.carn.x,y=g.carn.y;S.resume(s);
  assert.equal(g.carn.state,'recover');assert.ok(g.carn.mt>=1);assert.equal(g.carn.burstCd,5);assert.equal(g.carn.x,x);assert.equal(g.carn.y,y);assert.equal(g.player.hp,41);
  const hp=g.player.hp;g.carn.update(.2,g);assert.equal(g.player.hp,hp);assert.equal(g.carn.state,'recover');
 }
});
test('El periódico guarda cada diez segundos y el menú no sobrescribe la última sesión',()=>{
 start();g.player.xp=77;for(let i=0;i<9;i++)S.tick(g,1);assert.notEqual(S.read().data.xp,77);S.tick(g,1);assert.equal(S.read().data.xp,77);g.toMenu();g.player.xp=999;assert.equal(S.flush(g),false);assert.equal(S.read().data.xp,77);
});
test('Recoger documentos y comprar habilidades guardan inmediatamente, sin esperar al periódico',()=>{
 start();g.player.xp=10;g.buySkill('vigor');assert.ok(S.read().data.mut.owned.includes('vigor'));assert.equal(S.read().data.xp,6);const doc=g.items.find(i=>i.doc==='a1');g.take(doc);assert.ok(S.read().data.inv.docs.includes('a1'));assert.equal(S.read().data.xp,8);
});
test('Morir conserva Reintentar y no permite recuperar una sesión viva anterior a la derrota',()=>{
 start();g.player.xp=7;g.save(3);g.player.xp=9;g.player.hp=30;S.flush(g);g.player.hp=0;g.die();const s=S.read();assert.equal(s.data.xp,7);assert.equal(s.data.hp,100);assert.equal(s.runtime,null);assert.equal(S.flush(g),false);S.resume(s);assert.equal(g.player.xp,7);assert.equal(g.player.hp,100);
});
test('Una copia dañada recupera el respaldo y los huecos corruptos no rompen el menú',()=>{
 start();const expected=S.read().data.lvl;sandbox.localStorage.setItem(S.key,'{roto');assert.equal(S.read().data.lvl,expected);sandbox.localStorage.setItem(run('SAVE_SLOTS_KEY'),'{}');assert.equal(g.getSaveSlots().length,4);assert.ok(g.getSaveSlots().every(v=>v===null));assert.doesNotThrow(()=>g.refreshMenu());
});
test('La cuota agotada no anuncia un guardado correcto ni destruye la sesión anterior',()=>{
 start();g.player.xp=3;S.flush(g);const set=sandbox.localStorage.setItem;try{
  sandbox.localStorage.setItem=()=>{throw new Error('QuotaExceededError');};g.player.xp=91;assert.equal(S.flush(g),false);assert.equal(S.read().data.xp,3);g.openSaveSlots('save');g.chooseSaveSlot(0);assert.equal(g.state,'slots');assert.equal(S.issue,true);
 }finally{sandbox.localStorage.setItem=set;}
});
test('Un navegador con almacenamiento bloqueado sigue siendo jugable y permite crear una copia en memoria',()=>{
 const get=sandbox.localStorage.getItem,set=sandbox.localStorage.setItem;try{
  sandbox.localStorage.getItem=()=>{throw new Error('SecurityError');};sandbox.localStorage.setItem=()=>{throw new Error('SecurityError');};assert.doesNotThrow(()=>start());assert.equal(S.flush(g),false);assert.ok(S.valid(S.capture(g)));assert.equal(g.state,'play');assert.equal(S.issue,true);
 }finally{sandbox.localStorage.getItem=get;sandbox.localStorage.setItem=set;}
});
test('Importar una copia válida recupera recursos; archivos inválidos no alteran la sesión actual',()=>{
 start();g.player.xp=23;g.player.hp=45;const copy=JSON.stringify(S.capture(g));start();assert.equal(S.import(copy),true);assert.equal(g.player.xp,23);assert.equal(g.player.hp,45);const before=JSON.stringify(S.read());for(const text of ['{}','no es JSON',JSON.stringify({format:'RIUTEX2-session',schema:999})]){assert.notEqual(S.import(text),true);assert.equal(g.player.xp,23);assert.equal(JSON.stringify(S.read()),before);}
});
test('La compresión conserva Unicode y reinicia su diccionario sin perder datos; admite JSON de versiones anteriores',()=>{
 const codec=run('SaveCodec'),d={text:'Riutex · veneno, 🧬 mutación y armadura. '.repeat(6000),values:Array.from({length:14000},(_,i)=>({id:i,name:'documento_'+i,x:i%156,y:i%128}))};
 const packed=codec.encode(d);assert.ok(packed.startsWith(codec.prefix));assert.ok(packed.length<JSON.stringify(d).length*.55);assert.equal(JSON.stringify(codec.decode(packed)),JSON.stringify(d));assert.equal(JSON.stringify(codec.decode(JSON.stringify(d))),JSON.stringify(d));assert.throws(()=>codec.decode(codec.prefix+'\uffff'));
 start();const legacy=g.save(null);sandbox.localStorage.setItem(run('SAVE_SLOTS_KEY'),JSON.stringify([legacy,null,null,null]));assert.equal(g.getSaveSlots()[0].lvl,'hospital');assert.equal(g.getSaveSlots()[0].xp,legacy.xp);
});
test('Toda la cartografía, tres huecos, Reintentar y dos copias de sesión caben bajo 5 MiB',()=>{
 start();g.story.mapTiles={};g.story.visited={};
 for(const lvl of ['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']){
  H.goto(g,lvl);const known=[];for(let y=0;y<X.Level.H;y++)for(let x=0;x<X.Level.W;x++)if(X.Level.grid[y][x]===0)known.push(x+','+y);g.story.mapTiles[lvl]=known;for(const r of X.Level.rooms)g.story.visited[lvl+':'+r.n]=true;
 }
 const keys=[run('SAVE_SLOTS_KEY'),run('SAVE_KEY'),S.key,S.backupKey],set=sandbox.localStorage.setItem,limit=5*1024*1024;let peak=0;
 try{sandbox.localStorage.setItem=(key,value)=>{const bytes=keys.reduce((n,k)=>n+2*(k.length+String(k===key?value:sandbox.localStorage.getItem(k)||'').length),0);if(bytes>limit)throw new Error('QuotaExceededError');peak=Math.max(peak,bytes);set(key,value);};
  for(let i=0;i<4;i++)assert.equal(g.save(i),true);assert.equal(S.flush(g),true);assert.ok(peak<limit*.7);const s=S.read();assert.equal(Object.keys(s.data.story.mapTiles).length,15);assert.equal(s.data.story.mapTiles.hospitalumbra.length,g.story.mapTiles.hospitalumbra.length);
  const data=g.save(null),rawBytes=2*(JSON.stringify(g.getSaveSlots()).length+JSON.stringify(data).length+2*JSON.stringify(s).length),tiles=Object.values(g.story.mapTiles).reduce((n,a)=>n+a.length,0);
  require('node:fs').writeFileSync(require('node:path').join(__dirname,'../artifacts/storage-budget-results.json'),JSON.stringify({tiles,maps:15,raw_estimated_bytes:rawBytes,compressed_peak_bytes:peak,quota_bytes:limit,scope:'Todos los suelos descubiertos, tres huecos, punto Reintentar, legado y sesión con respaldo. Límite simulado de 5 MiB contando UTF-16; datos preparados, no una partida humana.'},null,2)+'\n');
 }finally{sandbox.localStorage.setItem=set;}
});
