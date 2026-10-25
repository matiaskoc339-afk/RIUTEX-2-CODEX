const test = require('node:test'), assert = require('node:assert/strict');
const {X, run} = require('./harness');
const {Game:g, Hospital:H, Level:L} = X;
const pressure = run('BossPressure');
g.init();
function start(pov = false) {
  g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);
  g.story.seq='free';g.story.armCut=true;g.state='play';g.t=10;g.keys={};g.mouse={x:600,y:600,down:false,clicked:false,rclick:false};g.cam.x=g.cam.y=0;
  g.player.x=700;g.player.y=600;g.player.hp=g.player.maxHp=100;g.player.invuln=0;g.player.hidden=false;g.player.knx=g.player.kny=0;
  g.enemies=[];g.carn=null;g.noise=g.worksNoise=null;L.W=L.H=80;
  L.grid=Array.from({length:80},(_,y)=>Array.from({length:80},(_,x)=>!x||!y||x===79||y===79?1:0));
  L.safeRects=[];L.props={};L.doors=[];L.lamps=[];run(`FirstPerson.setEnabled(${pov})`);
}
function boss(name, x=600, y=600) { const b=run(`new ${name}(${x},${y})`);b.active=true;b.mode='stalk';b.clock=0;b.face=0;g.enemies=[b];return b; }
function tick(e, seconds) { for(let i=0;i<Math.ceil(seconds*60);i++){g.t+=1/60;e.update(1/60,g);} }
test('El golpe real reduce daño a jefes, conserva costes y premia su exposición en ambos POV',()=>{
  for(const pov of [false,true])for(const blade of [false,true]){
    start(pov);const b=boss('SpiderMatriarch');g.player.x=640;g.player.angle=Math.PI;run('FirstPerson.angle=Math.PI');
    g.player.blade=blade?3:0;g.player.energy=100;let hp=b.hp;g.player.melee(g);const guarded=hp-b.hp;
    assert.ok(guarded>0&&guarded<16*(blade?1.25:1));assert.equal(g.player.energy,blade?68:76);
    g.player.meleeCd=0;g.player.energy=100;b.mode='recover';hp=b.hp;g.player.melee(g);assert.ok(hp-b.hp>guarded);
    const normal=new X.Enemy('vacio',600,600,111);assert.equal(pressure.meleeDamage(normal,16,blade),16);
  }
});
test('Los cuatro jefes responden a distancia de puño y mantienen ataques de largo alcance',()=>{
  start();for(const [name,close,ranged]of [['FinalCarnicero','cleave','charge'],['SpiderMatriarch','claw','venom'],['RoyalRegent','slash','charge'],['OriginWren','chain','needles']]){
    const b=boss(name);b.step=0;b.choose(g);assert.equal(b.attack,close,name);assert.ok(b.clock>=.6);
    b.x=300;b.step=0;b.choose(g);assert.equal(b.attack,ranged,name);
  }
});
test('Las pausas de combate son más cortas; choques, reanudación y peligros conservan espacio',()=>{
  start();for(const name of ['FinalCarnicero','SpiderMatriarch','RoyalRegent','OriginWren']){
    const b=boss(name);b.attack='charge';b.recover(1.5);assert.ok(b.clock>=.7&&b.clock<1.5);
    b.recover(2.5,true);
    assert.ok(b.clock>=2&&b.clock<=2.5);b.recover(3);assert.equal(b.clock,3);
    for(const attack of ['vents','marks','quake']){b.attack=attack;b.recover(3.25);assert.equal(b.clock,3.25);}
  }
});
test('No hay daño antes del aviso y salir del arco evita la respuesta corta de cada jefe',()=>{
  start();for(const [name,attack]of [['FinalCarnicero','cleave'],['SpiderMatriarch','claw'],['RoyalRegent','slash'],['OriginWren','chain']]){
    const b=boss(name);g.player.x=670;g.player.y=600;g.player.hp=100;g.player.invuln=0;b.begin(attack,g);tick(b,.3);assert.equal(g.player.hp,100,name);
    const dir=b.dir;g.player.x=350;tick(b,.25);assert.equal(b.dir,dir,name);tick(b,.35);assert.equal(g.player.hp,100,name);
  }
});
test('Perseguir al jefe a puro puño sin esquivar pierde antes de completar una fase',()=>{
  for(const pov of [false,true])for(const name of ['FinalCarnicero','SpiderMatriarch','RoyalRegent','OriginWren']){
    start(pov);const b=boss(name);g.player.x=650;let elapsed=0;
    while(g.player.hp>0&&elapsed<25){
      g.t+=1/60;elapsed+=1/60;g.player.angle=Math.atan2(b.y-g.player.y,b.x-g.player.x);
      const close=Math.hypot(b.x-g.player.x,b.y-g.player.y)<48;
      g.keys=pov?(close?{}:{KeyW:true}):(close?{}:{KeyA:b.x<g.player.x-5,KeyD:b.x>g.player.x+5,KeyW:b.y<g.player.y-5,KeyS:b.y>g.player.y+5});
      g.mouse.x=b.x;g.mouse.y=b.y;g.mouse.rclick=true;g.player.update(1/60,g);b.update(1/60,g);
    }
    assert.ok(g.player.hp<=0,name+': '+elapsed);assert.equal(b.phase,1,name);assert.ok(!b.dead,name);
  }
});
test('La carga del perseguidor se anuncia, compromete dirección y se esquiva lateralmente',()=>{
  start();const c=run('new Carnicero(900,500,600)');c.dormant=false;c.state='chase';c.face=0;c.hunt=true;c.burstCd=0;g.enemies=[c];
  c.update(.01,g);assert.equal(c.state,'rushWind');const direction=c.dir;tick(c,.35);assert.equal(g.player.hp,100);
  g.player.y=730;tick(c,1);assert.equal(g.player.hp,100);assert.equal(c.dir,direction);assert.equal(c.state,'recover');assert.ok(c.burstCd>4);
});
test('La carga golpea una vez, se detiene contra muros y nunca entra al refugio',()=>{
  for(const obstruction of ['none','wall','safe']){
    start();g.player.x=690;const c=run('new Carnicero(900,500,600)');c.dormant=false;c.hunt=true;c.face=0;c.state='chase';g.enemies=[c];
    if(obstruction==='wall')for(let y=0;y<80;y++)L.grid[y][19]=1;
    if(obstruction==='safe')L.safeRects=[[20,18,22,20]];
    // Empezar el aviso permite probar un muro que se cierre durante su preparación.
    c.state='rushWind';c.dir=0;c.mt=.7;c.burstCd=6.5;tick(c,1.3);
    if(obstruction==='none'){assert.ok(g.player.hp<100&&g.player.hp>=50);assert.equal(c.rushHit,true);}
    else {assert.equal(g.player.hp,100);assert.ok(c.x<(obstruction==='wall'?19:20)*32);assert.equal(c.state,'recover');}
  }
});
test('Un puñetazo repetido no mantiene al Carnicero inmóvil ni cancela su preparación',()=>{
  start();const c=run('new Carnicero(900,500,600)');c.dormant=false;c.hunt=true;c.state='chase';c.hurt(16,0,g);assert.ok(c.stagger>0);c.stagger=0;
  g.t+=.3;c.hurt(16,0,g);assert.equal(c.stagger,0);g.t+=2;c.state='rushWind';c.hurt(16,0,g);assert.equal(c.stagger,0);assert.equal(c.hp,c.maxHp);
});
test('La huida inicial exige correr pero conserva la puerta y el golpe guionizado',()=>{
  start();g.story.seq='run';g.story.armHealed=false;g.story.armCut=false;g.player.x=41.6*32;g.player.y=7.5*32;
  const c=run('new Carnicero(900,37*32,7.5*32)');c.scripted=true;c.dormant=false;c.hunt=true;c.state='chase';c.burstCd=0;g.enemies=[c];
  const x=c.x;c.update(.1,g);assert.ok(c.x-x>13&&c.x-x<21.5);assert.notEqual(c.state,'rushWind');
  c.hitPlayer(g);assert.equal(g.story.seq,'wounded_run');assert.ok(g.story.armCut);
});
test('Recibir daño deja de mantener el destello de impacto del infectado para siempre',()=>{
  start();const e=new X.Enemy('sonambulo',500,600,111);e.hurt(1,0,g);assert.ok(e.hitFlash>0);tick(e,.2);assert.equal(e.hitFlash,0);
});
