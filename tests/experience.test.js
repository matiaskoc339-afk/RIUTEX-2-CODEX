// Solo bajas, documentos nuevos y muestras consumidas: premios y progreso real.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {X,run}=require('./harness');const {Game:g,Hospital:H,Enemy,ENEMY_TYPES:E}=X;g.init();
const floors=['mansion','hospital','hospital1','hospitalb','hospitalworks','hospitalcastle','hospitalcastle1','hospitalumbra'];
const report={version:require('../package.json').version,floors:{},bosses:[]};
function start(){g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.player.xp=0;g.carn=null;}
function reward(def,boss=false,lvl='hospital',mod=0){g.lvl=lvl;return run(`mutationXPReward(${JSON.stringify(def)},${boss},{mod:()=>${mod}})`);}
// Media exacta de los premios aleatorios anteriores a v0.18.0, incluido el ×2,5.
function previousMean(def,boss=false){const n=def.xp||10,pool=boss||n>=200?[10,12,15,18,20,25]:n<=40?[1,1,1,1,3,3,5]:n<=80?[2,2,2,3,3,5]:n<=130?[3,3,4,5,5,7]:[4,5,5,7,8,10];return pool.reduce((a,b)=>a+Math.round(b*2.5),0)/pool.length;}
test('Las bajas iniciales aportan al menos 80 % menos XP; los mapas posteriores al menos 60 % menos',()=>{
 start();for(const level of floors){const entries=run(`R2_DATA('${level}').enemies`);let before=0,total=0;const amounts=[];
  for(const [,type]of entries){const xp=reward(E[type],false,level);assert.ok(Number.isInteger(xp)&&xp>=1);before+=previousMean(E[type]);total+=xp;amounts.push(xp);}
  const ratio=level==='mansion'||/^hospital(?:1|b)?$/.test(level)?.2:.4;
  assert.ok(total<=before*ratio,level+': '+total+' / '+before);
  report.floors[level]={count:entries.length,before_mean:before,total,min:Math.min(...amounts),max:Math.max(...amounts),reduction_pct:Math.round((1-total/before)*100)};
 }
});
test('Enemigos del laboratorio y élites dan más que pacientes iniciales; arañas débiles no heredan grandes premios',()=>{
 start();const early=reward(E.sonambulo),works=reward(E.wx_listener,false,'hospitalworks'),castle=reward(E.cl_halberd,false,'hospitalcastle'),lab=reward(E.lf_sentinel,false,'hospitalumbra');
 assert.ok(early<works&&works<castle&&castle<lab);assert.equal(early,1);assert.equal(lab,4);
 assert.equal(reward(E.ds_spider,false,'hospitalworks'),1);assert.equal(reward(E.ds_spider,false,'hospitalumbra'),1);
});
test('Minijefes y cuatro jefes conservan recompensas mayores, con progresión entre finales de zona',()=>{
 start();const rows=[['c17','hospital',run('new EscoltaC17(1197,100,100,360).def')],['carnicero','hospitalchem',run('new FinalCarnicero(100,100).def')],['keeper','hospitalpit',E.wx_keeper],['suit_guard','hospitalworks',E.ds_guard],['matriarch','hospitalnest',E.ds_matriarch],['blind','hospitalcells',E.cl_blind],['regent','hospitalroyal',E.cl_regent],['wren','hospitalorigin',E.lf_wren]];
 for(const [id,level,def]of rows){const xp=reward(def,true,level);assert.ok(xp>=6&&xp<previousMean(def,true));report.bosses.push({id,level,before_mean:previousMean(def,true),after:xp});}
 const get=id=>report.bosses.find(b=>b.id===id).after;
 assert.ok(get('c17')>2&&get('keeper')>2&&get('blind')>3);assert.ok(get('carnicero')<get('matriarch')&&get('matriarch')<get('regent')&&get('regent')<get('wren'));
});
test('No hay jackpots aleatorios de XP por bajas y el botín conserva su clasificación de élite',()=>{
 start();const random=Math.random;try{for(const r of [0,.5,.999999]){Math.random=()=>r;assert.equal(reward(E.sonambulo),1);assert.equal(reward(E.lf_sentinel,false,'hospitalumbra'),4);}}finally{Math.random=random;}
 assert.equal(E.lf_sentinel.xp,100);assert.equal(E.wx_mauler.xp,80);
});
test('Diez bajas iniciales reales dan 10 XP; una misma muerte no paga dos veces en ninguna perspectiva',()=>{
 for(const pov of [false,true]){start();run(`FirstPerson.setEnabled(${pov})`);g.enemies=[];for(let i=0;i<10;i++){const e=new Enemy('sonambulo',1400,944,98000+i);g.enemies.push(e);e.hurt(1000,0,g);assert.ok(e.dead);const xp=g.player.xp,items=g.items.length;e.hurt(1000,0,g);e.die(g);assert.equal(g.player.xp,xp);assert.equal(g.items.length,items);}assert.equal(g.player.xp,10);}
 run('FirstPerson.setEnabled(false)');
});
test('El Carnicero final solo entrega su XP al morir, después de las tres fases',()=>{
 start();H.goto(g,'hospitalchem');const b=g.boss;g.player.xp=0;
 for(let phase=1;phase<=3;phase++){b.mode='recover';b.hurt(100000,0,g);assert.equal(g.player.xp,phase===3?11:0);}
 assert.ok(b.dead);b.hurt(100000,0,g);b.die(g);assert.equal(g.player.xp,11);
});
test('La progresión sigue permitiendo comprar y guardar mejoras sin modificar XP ya acumulada',()=>{
 start();g.enemies=[];for(let i=0;i<4;i++)new Enemy('sonambulo',1400,944,99000+i).hurt(1000,0,g);
 assert.equal(g.player.xp,4);assert.equal(g.mut.canBuy('vigor',g.player.xp),null);g.buySkill('vigor');assert.ok(g.mut.has('vigor'));assert.equal(g.player.xp,0);
 g.player.xp=123;g.save(0);g.start(false,g.getSaveSlots()[0]);assert.equal(g.player.xp,123);assert.ok(g.mut.has('vigor'));
});
test('Descubrir salas no da XP; cada documento nuevo da 2, sin repetir al releer, revisitar o cargar',()=>{
 for(const pov of [false,true]){start();run(`FirstPerson.setEnabled(${pov})`);g.story.visited={};g.player.x=44.5*32;g.player.y=29.5*32;run('Blue.discover(Game)');assert.equal(g.player.xp,0);assert.ok(Object.keys(g.story.visited).length);run('Blue.discover(Game)');assert.equal(g.player.xp,0);
  const doc=g.items.find(i=>i.doc==='a1');assert.ok(doc);g.take(doc);assert.equal(g.player.xp,2);assert.ok(!g.items.some(i=>i.id===doc.id));g.take(doc);assert.equal(g.player.xp,2);g.openDoc('a1');assert.equal(g.player.xp,2);
  const duplicate={...doc,id:'duplicate_a1'};g.items.push(duplicate);g.take(duplicate);assert.equal(g.player.xp,2);
  g.resume();g.save(0);g.start(false,g.getSaveSlots()[0]);g.openDoc('a1');assert.equal(g.player.xp,2);assert.ok(!g.items.some(i=>i.id===doc.id));
 }run('FirstPerson.setEnabled(false)');
});
test('La inyección inicial y recoger equipo no conceden XP automática',()=>{
 g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;assert.equal(g.player.xp,0);H.inject(g);assert.equal(g.player.xp,0);H.lobbyReached(g);
 const gun=g.items.find(i=>i.id==='pp1');g.take(gun);assert.ok(g.player.weapons.pistol);assert.equal(g.player.xp,0);
});
test('Las muestras dan 15 XP solo al consumirlas; recogerlas, dejarlas en el baúl o cargar no las duplica',()=>{
 for(const pov of [false,true]){start();run(`FirstPerson.setEnabled(${pov})`);
  const sample=g.items.find(i=>i.type==='sample');assert.ok(sample);g.take(sample);assert.equal(g.player.xp,0);assert.equal(g.inv.samples,1);
  g.injectSample();assert.equal(g.player.xp,15);assert.equal(g.inv.samples,0);g.injectSample();assert.equal(g.player.xp,15);
  g.save(0);g.start(false,g.getSaveSlots()[0]);g.injectSample();assert.equal(g.player.xp,15);assert.ok(!g.items.some(i=>i.id===sample.id));
  g.inv.items=[];while(g.inv.add('inj_yellow')){};const stash=g.stash.length;run("BluePuzzles.reward(Game,'sample')");assert.equal(g.stash.length,stash+1);assert.equal(g.player.xp,15);g.injectSample();assert.equal(g.player.xp,15);
  assert.match(X.ITEMS.sample.desc,/15 EXP/);
 }run('FirstPerson.setEnabled(false)');
});
test('El puzle EEG entrega una muestra, sin XP hasta absorberla',()=>{
 start();run("BluePuzzles.open(Game,'eeg');BluePuzzles.cur.values=[2,4,3]");assert.ok(run('BluePuzzles.complete(Game)'));assert.equal(g.player.xp,0);assert.equal(g.inv.samples,1);g.injectSample();assert.equal(g.player.xp,15);
 assert.equal(run('BluePuzzles.complete(Game)'),false);assert.equal(g.player.xp,15);
});
test('Presupuesto finito por mapas y compras avanzadas sin XP de salas o misiones',()=>{
 start();const seen=new Set();let budget=0;report.sources={};
 for(const lvl of floors){g.lvl=lvl;const d=run(`R2_DATA('${lvl}')`),docIds=d.items.filter(i=>i[1]==='doc').map(i=>i[4].doc).filter(id=>{if(seen.has(id))return false;seen.add(id);return true;}),samples=d.items.filter(i=>i[1]==='sample').length;
  const kills=d.enemies.reduce((n,e)=>n+reward(E[e[1]],false,lvl),0),docs=docIds.length*2,sampleXP=samples*15;budget+=kills+docs+sampleXP;
  report.sources[lvl]={kills,documents:docIds.length,document_xp:docs,samples,sample_xp:sampleXP,total:kills+docs+sampleXP};
 }
 assert.ok(report.sources.mansion.total<=25);assert.ok(budget<900);
 report.sources_total=budget;report.advanced_paths={};
 for(const target of ['gold_fire_discipline','gold_organic_reactor']){start();g.player.xp=budget;const order=[],seenPath=new Set();
  const visit=id=>{if(seenPath.has(id))return;seenPath.add(id);for(const req of X.SKILLS[id].requires||[])visit(req);if(id!=='core')order.push(id);};visit(target);
  const cost=order.reduce((n,id)=>n+X.SKILLS[id].cost,0);assert.ok(cost<=budget*.6,target+': '+cost+' / '+budget);
  for(const id of order){assert.equal(g.mut.canBuy(id,g.player.xp),null,id);g.buySkill(id);assert.ok(g.mut.has(id),id);}assert.ok(g.mut.has(target));report.advanced_paths[target]={cost,nodes:order.length};
 }
});
test('Las crías invocadas siguen sin aportar XP y las bajas no reaparecen al cargar',()=>{
 start();const child=run('new MutantSpider(1400,944,99500,true)');child.hurt(1000,0,g);assert.equal(g.player.xp,0);
 const target=g.enemies.find(e=>e.type==='sonambulo'),id=target.id;target.hurt(1000,0,g);assert.equal(g.player.xp,1);g.save(0);g.start(false,g.getSaveSlots()[0]);assert.ok(g.killed.has(id));assert.ok(!g.enemies.some(e=>e.id===id&&!e.dead));assert.equal(g.player.xp,1);
});
test('El cálculo de RIUTEX 1 conserva sus premios y modificadores anteriores',()=>{
 start();const random=Math.random;try{Math.random=()=>0;assert.equal(reward(E.sonambulo,false,'asylum'),1);Math.random=()=>.999999;assert.equal(reward(E.sonambulo,false,'asylum'),5);assert.equal(reward(E.lf_wren,true,'lab'),25);assert.equal(reward(E.lf_wren,true,'lab',.5),38);}finally{Math.random=random;}
});
test.after(()=>{report.scope='Presupuestos finitos de ocho mapas: bajas colocadas, documentos únicos y muestras colocadas. No incluyen oleadas, minijefes, jefes ni muestras de puzles. Se compran dos rutas avanzadas por separado con el presupuesto calculado; no es una simulación de dificultad humana.';fs.writeFileSync(path.join(__dirname,'../artifacts/xp-balance-results.json'),JSON.stringify(report,null,2)+'\n');});
