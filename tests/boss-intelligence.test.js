const fs=require('node:fs'),path=require('node:path'),test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');
if(run('typeof BossIntelligence')==='undefined')run(fs.readFileSync(path.join(__dirname,'../js/boss-intelligence.js'),'utf8'));
const B=run('BossIntelligence'),{Game:g,Hospital:H,Level:L}=X;g.init();
const classes=['FinalCarnicero','SpiderMatriarch','RoyalRegent','OriginWren'];
function fixture(name='FinalCarnicero',pov=false){
 g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';
 g.enemies=[];g.carn=null;g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;g.temporalField=null;
 L.W=L.H=80;L.grid=Array.from({length:80},(_,y)=>Array.from({length:80},(_,x)=>!x||!y||x===79||y===79?1:0));L.props={};L.doors=[];L.safeRects=[];L.lamps=[];
 const b=run(`new ${name}(600,600)`);b.active=true;b.mode='stalk';b.clock=0;b.face=0;g.enemies=[b];g.player.x=1000;g.player.y=600;g.player.hidden=false;g.player.cloak=0;g.player.hp=g.player.maxHp=1000;g.player.invuln=0;g.player.reloading=0;g.player.knx=g.player.kny=0;
 run(`FirstPerson.setEnabled(${pov})`);return b;
}
function observe(b,seconds,move){for(let i=0;i<Math.ceil(seconds*60);i++){move?.(i);B.observe(b,1/60,g);}}
test('Cada jefe conserva su defensa cercana, recursos y avisos completos en ambas vistas',()=>{
 for(const pov of [false,true])for(const [name,attack]of [['FinalCarnicero','cleave'],['SpiderMatriarch','claw'],['RoyalRegent','slash'],['OriginWren','chain']]){
  const b=fixture(name,pov),hp=b.hp,player=[g.player.hp,g.player.stamina,g.player.energy,g.player.xp];g.player.x=700;
  b.choose(g);assert.equal(b.attack,attack);assert.ok(b.clock>=.6);assert.equal(b.hp,hp);assert.deepEqual([g.player.hp,g.player.stamina,g.player.energy,g.player.xp],player);
 }
});
test('La recarga vista tiene reacción acotada; no cancela la preparación ni recuperación',()=>{
 const b=fixture('FinalCarnicero');b.phase=2;g.player.reloading=1;observe(b,.35);b.choose(g);
 assert.equal(b.attack,'charge');assert.equal(b.biReason,'presionar recarga observada');assert.equal(b.biReactionCd,3.5);const dir=b.dir,clock=b.clock;
 g.player.y+=70;b.update(.1,g);assert.equal(b.dir,dir);assert.ok(b.clock<clock&&b.mode==='wind');
 b.recover(2.5,true);const recovery=b.clock;b.update(.1,g);assert.equal(b.mode,'recover');assert.ok(b.clock<recovery&&b.clock>2);
});
test('Un rodeo observado provoca intercepción; fase uno de Matriarca sigue siendo venenosa',()=>{
 const b=fixture('SpiderMatriarch');b.phase=2;
 observe(b,1.5,i=>{const a=i/60*.3;g.player.x=b.x+Math.cos(a)*400;g.player.y=b.y+Math.sin(a)*400;});b.choose(g);
 assert.equal(b.attack,'pounce');assert.equal(b.biReason,'interceptar rodeo observado');
 b.phase=1;b.biLast=b.biPrevious='';b.choose(g);assert.equal(b.attack,'venom');
});
test('La quietud provoca control de zona en fases avanzadas y la selección evita una cadena fija',()=>{
 for(const [name,phase,zone]of [['FinalCarnicero',2,'vents'],['RoyalRegent',2,'quake'],['OriginWren',3,'marks']]){
  const b=fixture(name);b.phase=phase;observe(b,1.5);b.choose(g);assert.equal(b.attack,zone,name);
  const selected=[b.attack];for(let i=0;i<6;i++){b.mode='stalk';b.choose(g);selected.push(b.attack);}g.player.x=b.x+160;b.choose(g);selected.push(b.attack);assert.ok(new Set(selected).size>=3,name+': '+selected.join(','));
 }
});
test('La previsión se limita a desplazamiento observado y no cambia después del aviso',()=>{
 for(const name of classes){const b=fixture(name);b.phase=3;observe(b,.4,()=>g.player.y+=1.8);
  b.biChoosing=true;b.begin(name==='SpiderMatriarch'?'pounce':name==='FinalCarnicero'?'leap':name==='RoyalRegent'?'leap':'marks',g);b.biChoosing=false;
  assert.ok(Math.hypot(b.target[0]-g.player.x,b.target[1]-g.player.y)<=72.000001,name);const target=[...b.target],dir=b.dir;
  g.player.x-=100;b.update(.1,g);assert.deepEqual([...b.target],target,name);assert.equal(b.dir,dir,name);
 }
});
test('El jefe busca el último punto visto sin apuntar a una posición nueva tras paredes u ocultación',()=>{
 for(const hidden of [false,true])for(const name of classes){const b=fixture(name);observe(b,.2);const last=[b.biX,b.biY];
  g.player.x=1300;g.player.y=700;g.player.hidden=hidden;if(!hidden)for(let y=1;y<79;y++)L.grid[y][35]=1;
  b.update(.05,g);assert.deepEqual([b.biX,b.biY],last,name);assert.notEqual(b.mode,'wind');assert.equal(b.biVisible,false);
  b.biSeenAt=b.biTime-4;const before=[b.x,b.y];b.update(.05,g);assert.deepEqual([b.x,b.y],before,name);
 }
});
test('Reposicionarse usa suelo real y queda dentro del recinto, sin movimiento en pausa',()=>{
 for(const name of classes){const b=fixture(name);b.phase=3;b.clock=10;g.player.x=900;
  const start=[b.x,b.y];for(let i=0;i<20;i++)b.update(1/60,g);assert.ok(Math.hypot(b.x-start[0],b.y-start[1])>1,name);assert.ok(Math.abs(b.y-start[1])>1,name);
  assert.ok(!L.blocked(b.x,b.y,b.r));const snapshot=[b.x,b.y,b.biTime,b.clock];g.state='pause';b.update(.5,g);assert.deepEqual([b.x,b.y,b.biTime,b.clock],snapshot);
 }
});
test('La mente no lee teclas o ratón y respeta la ralentización de los poderes',()=>{
 const b=fixture();const keys=g.keys,mouse=g.mouse;g.keys=new Proxy({}, {get(){throw Error('Lectura de teclas');}});g.mouse=new Proxy({}, {get(){throw Error('Lectura de ratón');}});
 try{assert.doesNotThrow(()=>{B.observe(b,.05,g);b.choose(g);});}finally{g.keys=keys;g.mouse=mouse;}
 g.temporalField={x:b.x,y:b.y,life:3};const time=b.biTime;B.observe(b,.1,g);assert.ok(b.biTime-time<.1&&b.biTime-time>0);g.temporalField=null;
});
test('La sesión conserva conocimiento y variedad, y las sesiones viejas empiezan sin memoria falsa',()=>{
 const levels=['hospitalchem','hospitalnest','hospitalroyal','hospitalorigin'];
 for(let i=0;i<classes.length;i++){
  fixture();H.goto(g,levels[i]);g.state='play';const b=g.boss;b.active=true;b.mode='stalk';b.clock=0;g.player.x=b.x+180;g.player.y=b.y;observe(b,.2);b.choose(g);
  const expected=[b.biLast,b.biPrevious,b.biDecisions,b.biX,b.biY],S=run('SessionSave'),save=S.capture(g);assert.ok(S.valid(save),classes[i]);S.resume(save);
  assert.deepEqual([g.boss.biLast,g.boss.biPrevious,g.boss.biDecisions,g.boss.biX,g.boss.biY],expected,classes[i]);
  for(const key of Object.keys(save.runtime.actors.find(e=>e.id===b.id).state))if(key.startsWith('bi'))delete save.runtime.actors.find(e=>e.id===b.id).state[key];
  S.resume(save);assert.equal(g.boss.biDecisions,0);assert.equal(g.boss.biSeenAt,-100);
 }
});
