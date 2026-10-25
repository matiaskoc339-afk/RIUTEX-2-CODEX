const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H,Level:L}=X,I=run('IntroPursuit'),S=run('SessionSave');g.init();
function start(pov=false){
 g.startLvl='mansion';g.start(false);H.toHospital(g);g.state='play';g.story.restrained=false;g.story.seq='room';g.story.armCut=g.story.armHealed=false;
 g.player.x=22.5*32;g.player.y=7.5*32;g.player.knx=g.player.kny=0;g.player.hidden=false;g.keys={};g.mouse={x:500,y:300,clicked:false,down:false,rclick:false};
 run(`FirstPerson.setEnabled(${pov})`);L.openDoor(L.doors.find(d=>d.id==='hab12'));g.enemies=[g.carn];H.tick(g,.01);return g.carn;
}
function tick(n){for(let i=0;i<n;i++)g.update(1/60);}
function walkTo(x,y,until=()=>false){
 const target=[(x+.5)*32,(y+.5)*32],path=X.Nav.path(g.player.x,g.player.y,...target);assert.ok(path,'Ruta transitable');
 for(let i=0;i<1200&&g.state==='play'&&!until();i++){
  while(path.length&&Math.hypot(path[0][0]-g.player.x,path[0][1]-g.player.y)<5)path.shift();
  if(!path.length){g.keys={};return;}
  const [tx,ty]=path[0],dx=tx-g.player.x,dy=ty-g.player.y;
  g.player.angle=Math.atan2(dy,dx);g.mouse.x=tx-g.cam.x;g.mouse.y=ty-g.cam.y;
  g.keys=run('FirstPerson.enabled')?{KeyW:true,ShiftLeft:true}:{KeyD:dx>3,KeyA:dx< -3,KeyS:dy>3,KeyW:dy< -3,ShiftLeft:true};
  g.update(1/60);
 }
 g.keys={};
}
test('El inicio sella la vuelta a la habitación y el cierre impide retroceder',()=>{
 const c=start(),d=L.doors.find(d=>d.id==='hab12');assert.ok(!d.open&&!g.doorOk(d));assert.equal(d.key,I.rearKey);
 c.stagger=5;g.player.x=14.5*32;g.keys={KeyA:true};tick(60);assert.ok(g.player.x>=13*32+g.player.r);assert.equal(g.story.seq,'run');
});
test('Esquivar al perseguidor o intentar esconderse no hace que abandone el guion',()=>{
 const c=start();g.player.x=25.5*32;c.x=27.5*32;c.y=7.5*32;c.hunt=false;c.state='patrol';g.player.hidden=true;
 c.update(.05,g);assert.equal(c.hunt,true);assert.equal(c.lostT,0);assert.equal(g.player.hidden,false);assert.equal(c.state,'chase');assert.equal(c.tgt[0],g.player.x);
});
test('Llegar a la puerta bloquea el movimiento pero permite mirar y recuperar estamina',()=>{
 const c=start(true);g.player.x=43.5*32;I.sync(g);c.stagger=5;const before=[g.player.x,g.player.y];g.player.stamina=30;g.keys={KeyW:true,KeyA:true,ShiftLeft:true};
 run('FirstPerson.look(40,20,Game)');const angle=g.player.angle;tick(30);
 assert.equal(I.bracing(g),true);assert.deepEqual([g.player.x,g.player.y],before);assert.ok(g.player.stamina>=30);assert.equal(g.player.angle,angle);
});
test('El recorrido real de obstáculos termina con un único golpe obligatorio en ambos modos',()=>{
 for(const pov of [false,true])for(const row of [6,7,8]){
  const c=start(pov);walkTo(43,row,()=>I.bracing(g));assert.ok(I.bracing(g),'Llega al cierre');g.keys={};
  for(let i=0;i<600&&g.story.seq==='run';i++)g.update(1/60);
  assert.equal(g.story.seq,'wounded_run');assert.equal(g.story.firstDoorHits,1);assert.equal(g.player.hp,25);assert.ok(g.story.armCut&&!g.story.armHealed);assert.ok(L.doors.find(d=>d.id==='forced').open);
  assert.equal(I.bracing(g),false);assert.equal(c.hunt,true);c.hitPlayer(g);assert.equal(g.story.firstDoorHits,1);
 }
});
test('La huida herido alcanza el vestíbulo y devuelve el control y la puerta trasera',()=>{
 start();g.player.x=43.5*32;I.sync(g);g.carn.hitPlayer(g);g.keys={};
 walkTo(52,17);H.tick(g,.01);assert.ok(L.doors.find(d=>d.id==='shutter').open);walkTo(52,24);
 assert.equal(g.story.seq,'lobby_inject');assert.ok(g.carn.dormant);assert.equal(g.carn.scripted,false);const rear=L.doors.find(d=>d.id==='hab12');assert.equal(rear.key,null);assert.ok(rear.open);
 run('Guidebook.close(Game)');g.useInj();assert.equal(g.story.seq,'free');assert.ok(g.story.armHealed);const before=g.player.x;L.move(g.player,4,0);assert.ok(g.player.x>before);
});
test('Una sesión cerrada mientras se empuja reanuda el golpe sin congelación permanente',()=>{
 start();g.player.x=43.5*32;I.sync(g);g.carn.x=38.5*32;g.carn.y=7.5*32;
 const hp=g.player.hp,s=S.capture(g);assert.ok(S.valid(s));S.resume(s);assert.equal(I.bracing(g),true);assert.equal(g.player.hp,hp);assert.ok(!L.doors.find(d=>d.id==='hab12').open);
 for(let i=0;i<600&&g.story.seq==='run';i++)g.update(1/60);
 assert.equal(g.story.seq,'wounded_run');assert.equal(g.story.firstDoorHits,1);assert.equal(I.bracing(g),false);
});
test('Una camilla antigua en run reconstruye al Carnicero fuera del muro',()=>{
 start();g.player.x=43.5*32;I.sync(g);const sv=g.save(null);g.start(false,sv);
 assert.ok(!g.carn.dormant&&g.carn.scripted);assert.ok(!L.blocked(g.carn.x,g.carn.y,g.carn.r));assert.equal(I.bracing(g),true);
});
test('Fuera de la secuencia el Carnicero conserva la ocultación y el jugador puede moverse',()=>{
 start();g.story.seq='free';g.carn.scripted=false;I.sync(g);g.player.hidden=true;g.carn.hunt=false;g.carn.state='routine';g.carn.routineT=10;g.noise=null;g.carn.update(.1,g);
 assert.equal(g.player.hidden,true);assert.equal(g.carn.hunt,false);g.player.hidden=false;const before=g.player.x;L.move(g.player,3,0);assert.ok(g.player.x>before);
});
