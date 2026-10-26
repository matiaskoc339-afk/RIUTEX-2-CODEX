const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {X,run}=require('./harness');
if(run("typeof MonsterIntelligence==='undefined'"))run(fs.readFileSync(path.join(__dirname,'../js/monster-intelligence.js'),'utf8'));
const M=run('MonsterIntelligence'),g=X.Game,L=X.Level;g.init();
function start(pov=false){
 g.startLvl='mansion';g.start(false);X.Hospital.toHospital(g);g.story.restrained=false;X.Hospital.inject(g);X.Hospital.lobbyReached(g);g.story.seq='free';g.state='play';
 g.enemies=[];g.carn=null;g.barrels=[];g.eproj=[];g.projectiles=[];g.pools=[];g.noise=g.worksNoise=null;g.clSounds=[];g.keys={};
 L.W=45;L.H=35;L.grid=Array.from({length:35},(_,y)=>Array.from({length:45},(_,x)=>!x||!y||x===44||y===34?1:0));L.safeRects=[];L.props={};L.rooms=[];L.lamps=[];L.doors=[];
 Object.assign(g.player,{x:17.5*32,y:10.5*32,hidden:false,hp:100,invuln:0,cloak:0,knx:0,kny:0});run(`FirstPerson.setEnabled(${pov})`);return g.player;
}
function foe(type='sonambulo',id=4000,x=10.5*32,y=10.5*32){const e=type.startsWith('wx_')?run(`new WorksEnemy('${type}',${x},${y},${id})`):new X.Enemy(type,x,y,id);e.face=0;e.alert=true;g.enemies.push(e);return e;}
function tick(e,n=20){for(let i=0;i<n;i++)e.update(.05,g);}
test('La última vista se recuerda en ambos modos; esconderse no sigue actualizando el destino',()=>{
 for(const pov of [false,true]){const p=start(pov),e=foe();p.x=15.5*32;tick(e,5);const last=[e.miLastX,e.miLastY];assert.ok(e.miMemory>0);p.hidden=true;p.x=29.5*32;p.y=24.5*32;tick(e,20);assert.deepEqual([e.miLastX,e.miLastY],last);assert.equal(e.miVisible,false);tick(e,100);assert.equal(e.miMemory,0);assert.equal(e.target,null);assert.equal(e.alert,false);}
});
test('El ruido da una pista de su origen, aunque el jugador esté oculto en otro punto',()=>{
 const p=start(),e=foe();e.alert=false;p.hidden=true;p.x=35.5*32;p.y=28.5*32;g.noise={x:13.5*32,y:12.5*32,r:500};e.update(.05,g);
 assert.equal(e.miLastX,g.noise.x);assert.equal(e.miLastY,g.noise.y);assert.equal(e.miVisible,false);assert.ok(e.miMemory>0);assert.notEqual(e.miLastX,p.x);
});
test('La memoria visual deja de actualizarse tras una pared, sin usar coordenadas nuevas',()=>{
 const p=start(),e=foe();p.x=12.5*32;tick(e,3);const last=[e.miLastX,e.miLastY];for(let y=1;y<34;y++)L.grid[y][14]=1;p.x=16.5*32;tick(e,12);
 assert.equal(e.miVisible,false);assert.deepEqual([e.miLastX,e.miLastY],last);assert.ok(e.x<14*32);
});
test('La ruta de un infectado no abre ni cruza puertas cerradas; abrirlas permite pasar',()=>{
 start();const e=foe('sonambulo',4000,12.5*32,10.5*32);for(let y=1;y<34;y++)L.grid[y][14]=1;L.grid[10][14]=2;
 assert.equal(M.path(e,17.5*32,10.5*32),null);const x=e.x;for(let i=0;i<60;i++){e.pathClock-=.05;M.move(e,17.5*32,10.5*32,5);}
 assert.equal(L.grid[10][14],2);assert.ok(e.x<14*32);L.grid[10][14]=0;e.path=null;assert.ok(M.path(e,17.5*32,10.5*32));assert.ok(e.x>=x);
});
test('A* rodea un obstáculo real con presupuesto limitado y sin atravesar sus bordes',()=>{
 start();const e=foe('cazador');for(let y=7;y<=13;y++)L.grid[y][14]=1;const target=[18.5*32,10.5*32],route=M.path(e,...target);assert.ok(route?.length>8);
 for(let i=0;i<700&&Math.hypot(e.x-target[0],e.y-target[1])>8;i++){e.pathClock-=1/60;const old=[e.x,e.y];M.move(e,...target,2);assert.ok(Math.hypot(e.x-old[0],e.y-old[1])<=2.001);assert.ok(!L.blocked(e.x,e.y,e.r));}
 assert.ok(Math.hypot(e.x-target[0],e.y-target[1])<8);
});
test('Los tiradores retroceden de un atacante cercano durante su enfriamiento',()=>{
 const p=start(),e=foe('enfermera');p.x=e.x+80;e.cd=2;e.miPlanT=0;const before=Math.hypot(p.x-e.x,p.y-e.y);tick(e,12);
 assert.ok(Math.hypot(p.x-e.x,p.y-e.y)>before+10);assert.equal(e.miState,'retreat');assert.equal(e.windup,0);
});
test('Un tirador con un compañero en la línea se recoloca antes de avisar su disparo',()=>{
 const p=start(),e=foe('enfermera');foe('sonambulo',4001,13.5*32,10.5*32);const y=e.y;e.update(.05,g);
 assert.equal(e.windup,0);assert.equal(e.miState,'reposition');tick(e,10);assert.ok(Math.abs(e.y-y)>2);assert.ok(M.clearShot(e,g,p.x,p.y)||e.windup===0);
});
test('Dos corredores buscan flancos diferentes; un pesado mantiene la presión frontal',()=>{
 start();const a=foe('cazador',4000),b=foe('cazador',4001,10.5*32,11.5*32),heavy=foe('bruto',4002,11.5*32,9.5*32);
 for(const e of [a,b,heavy])M.sense(e,.2,g);const ga=M.goal(a,g),gb=M.goal(b,g);M.goal(heavy,g);
 assert.equal(a.miState,'flank');assert.equal(b.miState,'flank');assert.ok((ga[1]-g.player.y)*(gb[1]-g.player.y)<0);assert.equal(heavy.miState,'press');
});
test('Un refugio detiene conocimiento, movimiento y ataques de los infectados',()=>{
 const p=start(),e=foe();p.x=e.x+20;L.safeRects=[[10,10,12,12]];const pos=[e.x,e.y];tick(e,20);assert.equal(p.hp,100);assert.equal(e.miMemory,0);assert.deepEqual([e.x,e.y],pos);
});
test('Pausa, tregua y congelación no permiten atacar ni planear movimientos',()=>{
 const p=start(),e=foe('wx_scuttler');p.x=e.x+35;const pos=[e.x,e.y];g.state='pause';e.update(.5,g);assert.deepEqual([e.x,e.y],pos);assert.equal(e.miMemory,0);
 g.state='play';e.grace=1;e.update(.2,g);assert.deepEqual([e.x,e.y],pos);assert.equal(e.miMemory,0);e.grace=0;e.frozen=1;e.update(.2,g);assert.deepEqual([e.x,e.y],pos);assert.equal(p.hp,100);
});
test('Las ráfagas y los golpes ya anunciados mantienen su dirección al cambiar de lado',()=>{
 const p=start(),e=foe('enfermera');e.update(.05,g);assert.ok(e.windup>0);const angle=e.attackFace;p.y+=200;tick(e,14);assert.equal(e.attackFace,angle);assert.ok(g.eproj.length>0);assert.ok(g.eproj.every(q=>Math.abs(q.vy)<70));
});
test('El ciego, los jefes y RIUTEX 1 conservan sus controladores propios',()=>{
 start();const listener=foe('wx_listener'),boss=run('new SpiderMatriarch(600,600)');assert.equal(M.enabled(listener,g),false);assert.equal(M.enabled(boss,g),false);assert.equal(M.enabled(foe(),{lvl:'asylum'}),false);
});
test('La sesión conserva memoria y plan, y reconstruye la ruta tras cargar',()=>{
 start();X.Hospital.buildLevel(g,'hospital',null);g.story.seq='free';const e=g.enemies.find(e=>!e.isBoss&&e.type!=='wx_listener');assert.ok(e);
 Object.assign(e,{miMemory:3.2,miLastX:e.x+32,miLastY:e.y,miVx:45,miVy:0,miGoalX:e.x+16,miGoalY:e.y,miState:'flank',miSearchStep:2});
 const id=e.id,S=run('SessionSave'),save=S.capture(g);assert.ok(S.valid(save));S.resume(save);const loaded=g.enemies.find(e=>e.id===id);assert.equal(loaded.miMemory,3.2);assert.equal(loaded.miVx,45);assert.equal(loaded.miSearchStep,2);assert.equal(loaded.miState,'flank');assert.equal(loaded.path,null);assert.ok(loaded.grace>=1);
});
