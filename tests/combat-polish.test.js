const test = require('node:test'), assert = require('node:assert/strict');
const { X, run } = require('./harness');
const { Game:g, Hospital:H, Level:L, Enemy, Weapons:W, Inventory } = X;
g.init();
function start() {
  g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';
  g.carn=null;g.enemies=[];g.barrels=[];g.crystals=[];g.projectiles=[];g.eproj=[];g.pools=[];g.keys={};g.noise=null;g.worksNoise=null;
  g.mouse={x:500,y:300,down:false,clicked:false,rclick:false};
  L.W=40;L.H=30;L.grid=Array.from({length:L.H},(_,y)=>Array.from({length:L.W},(_,x)=>!x||!y||x===39||y===29?1:0));L.props={};L.doors=[];L.safeRects=[];L.rooms=[];
  Object.assign(g.player,{x:320,y:320,angle:0,invuln:0,hp:100,poison:0,stamina:100,energy:100,knx:0,kny:0});run('FirstPerson.setEnabled(false)');
  return g.player;
}
function foe(type,x=320,y=320){const e=new Enemy(type,x,y,991023);e.face=0;e.alert=true;g.enemies=[e];return e;}
function gun(id='pistol') {g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.giveWeapon(id,25,true);g.player.weapon=g.player.weapons[id];return g.player.weapon;}
test('Un cierre bloquea el golpe ya preparado de un infectado, también antes de cambiar de habitación',()=>{
  const p=start(),e=foe('hinchado',313,336);p.x=355;p.y=336;e.windup=.01;e.attackLocked=true;e.attackFace=e.face=0;L.grid[10][10]=2;
  e.update(.02,g);assert.equal(p.hp,100);assert.equal(p.poison,0);assert.ok(e.cd>0);
});
test('El infectado compromete la dirección de su golpe: pasar detrás durante el aviso evita el impacto',()=>{
  const p=start(),e=foe('sonambulo');p.x=343;e.update(.01,g);assert.ok(e.windup>0);assert.equal(e.face,0);
  p.x=297;e.update(.4,g);assert.equal(p.hp,100);assert.ok(e.cd>0);
  p.x=343;e.cd=0;e.update(.01,g);e.update(.4,g);assert.ok(p.hp<100,'seguir en el arco anunciado sí recibe daño');
});
test('Un golpe evitado con invulnerabilidad no aplica veneno; un impacto efectivo sí',()=>{
  let p=start(),e=foe('hinchado');p.x=343;p.invuln=1;e.update(.01,g);e.update(.4,g);assert.equal(p.hp,100);assert.equal(p.poison,0);
  p=start();e=foe('hinchado');p.x=343;e.update(.01,g);e.update(.4,g);assert.ok(p.hp<100);assert.ok(p.poison>0);
});
test('Los proyectiles genéricos conservan la dirección avisada, sin girar al jugador durante la ráfaga',()=>{
  const p=start(),e=foe('enfermera');p.x=560;e.update(.01,g);assert.ok(e.windup>0);p.x=320;p.y=560;e.update(.6,g);e.update(.01,g);
  assert.equal(g.eproj.length,1);assert.ok(g.eproj[0].vx>250);assert.ok(Math.abs(g.eproj[0].vy)<25);
});
test('La recarga comunica duración total, consume solo la munición necesaria y se interrumpe al cambiar de arma',()=>{
  const p=start(),w=gun();w.mag=2;const reserve=g.inv.reserve('pistol');assert.equal(W.reload(p),true);assert.equal(p.reloadDuration,p.reloading);assert.equal(p.reloadWeaponId,'pistol');
  p.reloading=0;assert.equal(W.finishReload(p),true);assert.equal(w.mag,W.magSize(p,W.effective(p,'pistol')));assert.equal(g.inv.reserve('pistol'),reserve-(w.mag-2));
  w.mag=2;assert.equal(W.reload(p),true);g.giveWeapon('viper',0,true);p.weapon=p.weapons.viper;const n=g.inv.reserve('pistol');p.update(.05,g);
  assert.equal(p.reloading,0);assert.equal(w.mag,2);assert.equal(g.inv.reserve('pistol'),n);
});
test('Acrobacia dorada solo se activa cuando entran balas: no crea estamina con cargador lleno o reserva vacía',()=>{
  const p=start(),w=gun();g.mut.owned.add('gold_reload');p.stamina=1;p.focus=0;
  const full=W.magSize(p,W.effective(p,'pistol'));w.mag=full;assert.equal(W.finishReload(p),false);assert.equal(p.stamina,1);assert.equal(p.focus,0);
  w.mag=full-1;W.reload(p);p.reloading=0;W.finishReload(p);assert.equal(w.mag,full);assert.equal(p.stamina,13);assert.equal(p.focus,3);
  g.inv.takeAmmo('pistol',999);w.mag=1;p.stamina=1;p.focus=0;W.finishReload(p);assert.equal(p.stamina,1);assert.equal(p.focus,0);
});
test('Un cargador antiguo que supera su capacidad no se vacía ni genera munición al finalizar una recarga',()=>{
  const p=start(),w=gun();w.mag=99;const reserve=g.inv.reserve('pistol');assert.equal(W.finishReload(p),false);assert.equal(w.mag,99);assert.equal(g.inv.reserve('pistol'),reserve);
});
test('Disparar con cargador vacío o durante recarga no crea munición negativa ni gasta esfuerzo',()=>{
  const p=start(),w=gun();w.mag=0;W.fire(g,p);assert.equal(w.mag,0);assert.equal(p.stamina,100);assert.equal(g.tracers.length,0);
  w.mag=2;W.reload(p);W.fire(g,p);assert.equal(w.mag,2);assert.equal(p.stamina,100);
});
test('Barriles y granadas respetan muros para daño, cadenas y cristales',()=>{
  let p=start(),e=foe('sonambulo',372,336);p.x=372;p.y=336;const b={x:300,y:336,dead:false},other={x:372,y:336,dead:false};g.barrels=[b,other];L.grid[10][10]=1;const hp=e.hp;
  g.explode(b);assert.equal(p.hp,100);assert.equal(e.hp,hp);assert.equal(other.chainDelay,undefined);
  start();const c={x:372,y:336,hp:60,dead:false},o={x:372,y:336,dead:false};g.barrels=[o];g.crystals=[c];L.grid[10][10]=1;g.blast(300,336,200);assert.equal(o.chainDelay,undefined);assert.equal(c.dead,false);
});
test('Las cadenas usan tiempo de juego: una pausa las congela y cambiar el mapa descarta detonaciones antiguas',()=>{
  const p=start();p.x=700;p.y=500;const a={x:300,y:336,dead:false},b={x:380,y:336,dead:false};g.barrels=[a,b];g.explode(a);assert.equal(b.chainDelay,.15);
  g.state='pause';g.update(.5);assert.equal(b.dead,false);assert.equal(b.chainDelay,.15);
  g.state='play';g.update(.1);assert.equal(b.dead,false);g.update(.06);assert.equal(b.dead,true);
  const c={x:450,y:336,dead:false};g.barrels=[c];g.blast(400,336);assert.ok(c.chainDelay>0);g.barrels=[];g.update(.3);assert.equal(c.dead,false);
});
test('Continuar una sesión a mitad de recarga conserva el arma, la duración y la reserva',()=>{
  let p=start();gun().mag=2;W.reload(p);p.reloading*=.5;const seconds=p.reloading,total=p.reloadDuration,reserve=g.inv.reserve('pistol');
  const S=run('SessionSave'),save=S.capture(g);S.resume(save);p=g.player;assert.equal(p.reloading,seconds);assert.equal(p.reloadDuration,total);assert.equal(p.reloadWeaponId,'pistol');
  p.update(seconds+.01,g);assert.equal(p.weapon.mag,12);assert.equal(g.inv.reserve('pistol'),reserve-10);
});

test('Reanudar frente a un infectado devuelve una tregua y un aviso completo en vez de un golpe invisible',()=>{
  let p=start(),e=foe('sonambulo',320,320);p.x=343;e.windup=.001;e.attackFace=e.face=0;e.attackLocked=true;
  const S=run('SessionSave'),snapshot=S.capture(g);S.resume(snapshot);p=g.player;e=g.enemies.find(x=>x.id===991023);
  // Los actores del motor se reconstruyen del mapa; este caso usa un enemigo real más abajo.
  assert.equal(e,undefined);
  const real=g.enemies.find(x=>!x.isBoss&&!x.def.rng&&!x.def.spitter&&!x.def.latent);
  assert.ok(real);p.x=real.x+20;p.y=real.y;real.alert=true;real.windup=.001;real.attackLocked=true;real.attackFace=real.face=0;
  const second=S.capture(g);S.resume(second);p=g.player;e=g.enemies.find(x=>x.id===real.id);const hp=p.hp;
  e.update(.05,g);assert.equal(p.hp,hp);assert.equal(e.windup,0);assert.equal(e.shots,0);assert.ok(e.grace>0);
  for(let i=0;i<25;i++)e.update(.05,g);assert.ok(p.hp===hp);assert.ok(e.windup>0,'vuelve a preparar el golpe');
});

test('Un proyectil evitado no inyecta veneno a través de la invulnerabilidad; el charco sigue siendo peligroso',()=>{
  let p=start();p.invuln=1;g.eproj=[{x:p.x-1,y:p.y,vx:10,vy:0,life:1,dmg:10,poison:3,bullet:true}];g.update(.02);assert.equal(p.hp,100);assert.equal(p.poison,0);
  p=start();g.eproj=[{x:p.x-1,y:p.y,vx:10,vy:0,life:1,dmg:10,poison:3,bullet:true}];g.update(.02);assert.ok(p.hp<100);assert.ok(p.poison>0);
  p=start();p.invuln=1;g.pools=[{x:p.x,y:p.y,r:22,life:3}];g.update(.02);assert.ok(p.poison>0,'la esquiva no vuelve inocuos los charcos');
});
