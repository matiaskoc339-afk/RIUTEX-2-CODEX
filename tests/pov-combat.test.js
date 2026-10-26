const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H,Level:L,Enemy}=X;const P=run('POVPerception'),V=run('POVViewmodel');g.init();
function start(pov=true){g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.enemies=[];g.carn=null;g.noise=g.worksNoise=null;g.player.hidden=false;g.player.cloak=0;g.player.x=352;g.player.y=320;L.grid=Array.from({length:24},(_,y)=>Array.from({length:40},(_,x)=>!x||!y||x===39||y===23?1:0));L.W=40;L.H=24;L.safeRects=[];L.props={};L.lamps=[];L.doors=[];run(`FirstPerson.setEnabled(${pov})`);}
function enemy(type='sonambulo',distance=240){const e=new Enemy(type,g.player.x-distance,g.player.y,98765);e.face=0;g.enemies=[e];return e;}
test('En POV un paciente mirando al jugador reacciona a distancia corta razonable; topdown mantiene su alcance',()=>{
 start(false);let e=enemy();e.update(.2,g);assert.equal(e.alert,false);start(true);e=enemy();e.update(.2,g);assert.equal(e.alert,true);assert.equal(X.ENEMY_TYPES.sonambulo.detect,190);
});
test('Puerta cerrada bloquea visión; abrirla permite detectar sin entrar ni descubrir la sala',()=>{
 start();const e=enemy(),d={id:'pov_door_test',tiles:[[7,10]],open:false,key:null};L.doors=[d];L.grid[10][7]=2;g.story.visited={};e.update(.2,g);assert.equal(e.alert,false);L.openDoor(d);e.update(.2,g);assert.equal(e.alert,true);assert.equal(Object.keys(g.story.visited).length,0);
});
test('El mueble bajo permite ver por encima; armarios y paredes siguen tapando',()=>{
 for(const [value,type,expected]of [[4,'bed',true],[4,'locker',false],[1,'wall',false]]){start();const e=enemy();L.grid[10][7]=value;L.props['7,10']=type;e.update(.2,g);assert.equal(e.alert,expected,type);}
});
test('No detectan desde lejos ni con visión omnidireccional; muy cerca sí reaccionan',()=>{
 start();let e=enemy('enfermera',500);for(let i=0;i<20;i++)e.update(.1,g);assert.equal(e.alert,false);
 start();e=enemy();e.face=Math.PI;e.update(.2,g);assert.equal(e.alert,false);g.player.x=e.x+70;e.update(.2,g);assert.equal(e.alert,true);
});
test('La detección tiene reacción breve y pierde al jugador al quedar oculto, sin seguirlo eternamente',()=>{
 start();const e=enemy();e.update(.03,g);assert.equal(e.alert,false);e.update(.16,g);assert.equal(e.alert,true);const clue=[e.miLastX,e.miLastY];g.player.hidden=true;g.player.x+=400;for(let i=0;i<30;i++)e.update(.1,g);assert.deepEqual([e.miLastX,e.miLastY],clue);for(let i=0;i<30;i++)e.update(.1,g);assert.equal(e.alert,false);
});
test('Los dos enemigos ciegos conservan la ceguera y el rastreador sigue respondiendo a sonidos',()=>{
 start();for(const type of ['wx_listener','cl_blind']){const e=new Enemy(type,180,320,8765);e.face=0;assert.equal(P.sees(e,g),false);}
 const e=run("new WorksEnemy('wx_listener',180,320,8766)");e.acquire(g,.2);assert.equal(e.target,null);g.worksNoise={x:g.player.x,y:g.player.y,r:600,life:1};e.acquire(g,.2);assert.ok(e.target);
});
test('Esconderse y el camuflaje a distancia siguen impidiendo detectar al jugador',()=>{
 start();const e=enemy();g.player.hidden=true;e.update(.2,g);assert.equal(e.alert,false);g.player.hidden=false;g.player.cloak=4;assert.ok(run('Specializations.concealed(Game.player)'));e.update(.2,g);assert.equal(e.alert,false);
});
test('El rig solo tiene los dos brazos originales; el golpe reutiliza el izquierdo y baja el arma',()=>{
 start();g.giveWeapon('pistol',12,true);let pose=V.plan(g);assert.equal(pose.hands.length,2);const idleY=pose.hands.find(h=>h.side===1).y;g.player.slash=.075;pose=V.plan(g);assert.equal(pose.hands.length,2);assert.equal(pose.hands.filter(h=>h.attacking).length,1);assert.equal(pose.hands.find(h=>h.attacking).side,-1);assert.ok(pose.hands.find(h=>h.side===1).y>idleY);
});
test('El brazo regenera con tejido azul al inyectarse; el prólogo sigue siendo humano',()=>{
 start();g.story.armHealed=false;g.story.armCut=false;g.story.riutexUsed=0;assert.equal(V.state(g).infected,false);H.inject(g);assert.equal(V.state(g).infected,true);const p=V.plan(g);assert.equal(p.hands.find(h=>h.side===-1).infected,true);
});
test('Perder el brazo o elegir la cura elimina la mano izquierda, sus garras y el azul',()=>{
 start();g.story.armCut=true;g.story.armHealed=false;g.player.slash=.075;let pose=V.plan(g);assert.equal(pose.hands.length,1);assert.equal(pose.hands[0].side,1);assert.equal(pose.strike,0);
 g.story.endgame={choice:'cure'};g.player.blade=8;g.player.predator=8;pose=V.plan(g);assert.equal(pose.hands.length,1);assert.equal(pose.infected,false);assert.equal(pose.blade,false);assert.equal(pose.predator,false);assert.equal(pose.hands[0].veins,false);
});
test('Rechazar la cura transforma ambos brazos existentes; no añade miembros',()=>{
 start();g.story.endgame={choice:'mutant'};const pose=V.plan(g);assert.equal(pose.hands.length,2);assert.ok(pose.hands.every(h=>h.infected));assert.equal(pose.id,'');assert.ok(pose.blade&&pose.predator);
});
