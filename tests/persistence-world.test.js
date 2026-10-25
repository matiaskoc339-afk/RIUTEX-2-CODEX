const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H}=X,S=run('SessionSave');g.init();
function start(lvl='hospital'){
  g.startLvl='mansion';g.start(false);
  if(lvl!=='mansion'){H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';if(lvl!=='hospital')H.goto(g,lvl);}
  g.state='play';g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;g.enemies=[];g.carn=null;
  return g.player;
}
test('Continuar una sesión conserva barriles detonados y no repone su daño explosivo',()=>{
  start();const b=g.barrels[0];b.dead=true;const position=[b.x,b.y],s=S.capture(g);assert.ok(S.valid(s));S.resume(s);
  const restored=g.barrels.find(o=>o.x===position[0]&&o.y===position[1]);assert.ok(restored.dead);const hp=g.player.hp;g.explode(restored);assert.equal(g.player.hp,hp);
  assert.equal(S.read().runtime.world.barrels.find(o=>o.x===position[0]&&o.y===position[1]).dead,true);
});
test('Una cadena pendiente reanuda con tregua; la pausa no consume su temporizador',()=>{
  start();g.barrels[0].chainDelay=.04;const s=S.capture(g);S.resume(s);g.enemies=[];g.carn=null;
  const b=g.barrels[0],hp=g.player.hp;assert.equal(b.chainDelay,1);assert.equal(b.dead,false);g.update(.05);assert.equal(b.dead,false);assert.equal(g.player.hp,hp);
  const remaining=b.chainDelay;g.state='pause';g.update(.5);assert.equal(b.chainDelay,remaining);assert.equal(b.dead,false);
  g.state='play';g.update(remaining+.01);assert.equal(b.dead,true);assert.equal(b.chainDelay,null);
});
test('Las sesiones schema 1 antiguas sin estado del mundo siguen cargando',()=>{
  start();const s=S.capture(g);delete s.runtime.world;assert.equal(S.valid(s),true);assert.doesNotThrow(()=>S.resume(s));assert.ok(g.barrels.every(b=>!b.dead));
});
test('Los objetos se emparejan por coordenadas aunque cambie su orden; no se crean barriles del archivo',()=>{
  start();g.barrels[0].dead=true;const world=S.captureWorld(g),first={...g.barrels[0]};g.barrels.forEach(b=>b.dead=false);g.barrels.reverse();S.restoreWorld(g,world);
  assert.equal(g.barrels.find(b=>b.x===first.x&&b.y===first.y).dead,true);assert.equal(g.barrels.filter(b=>b.dead).length,1);
  const before=JSON.stringify(g.barrels),unknown=S.clone(world);unknown.barrels[0].x=16;unknown.barrels[0].y=16;unknown.barrels[0].dead=false;
  S.restoreWorld(g,unknown);assert.equal(JSON.stringify(g.barrels),before);
});
test('Estado externo inválido se rechaza antes de tocar objetos o aceptar la partida',()=>{
  start();const good=S.capture(g),make=fn=>{const s=S.clone(good);fn(s.runtime.world);return s;};
  for(const bad of [
    make(w=>w.barrels[0].chainDelay=-1),make(w=>w.barrels[0].chainDelay=Infinity),make(w=>w.barrels[0].x=NaN),
    make(w=>w.barrels[0].dead='true'),make(w=>w.barrels[0].index=-1),make(w=>w.barrels[0].mine='false'),
    make(w=>w.barrels.push({...w.barrels[0]})),make(w=>w.barrels=Array(4097).fill(w.barrels[0])),
    make(w=>w.crystals=[{index:0,x:16,y:16,dead:false,hp:60,respawn:-1}]),
  ])assert.equal(S.valid(bad),false);
  const before=JSON.stringify(g.barrels);S.restoreWorld(g,{barrels:null,crystals:[]});assert.equal(JSON.stringify(g.barrels),before);
});
test('Cristales conservan salud, rotura y tiempo de regeneración sin copiar campos ajenos',()=>{
  start();g.crystals=[{x:16*32+16,y:20*32+16,hp:17,dead:false,respawn:0},{x:17*32+16,y:20*32+16,hp:-12,dead:true,respawn:3.5}];
  const world=S.captureWorld(g);assert.equal(world.crystals[1].hp,0);assert.ok(S.validWorld(world,run('FLOORS.hospital')));
  g.crystals.forEach(c=>{c.dead=false;c.hp=60;c.respawn=0;});world.crystals[0].injected='ignored';S.restoreWorld(g,JSON.parse(JSON.stringify(world)));
  assert.equal(g.crystals[0].hp,17);assert.equal(g.crystals[0].injected,undefined);assert.equal(g.crystals[1].dead,true);assert.equal(g.crystals[1].respawn,3.5);
});
test('La extensión opcional valida las quince plantas sin alterar XP, inventario ni progreso',()=>{
  for(const lvl of ['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']){
    start(lvl);const xp=g.player.xp,inv=JSON.stringify(g.inv.serialize());
    const s=S.capture(g);assert.ok(S.valid(s),lvl);S.resume(s);assert.equal(g.lvl,lvl);assert.equal(g.player.xp,xp);assert.equal(JSON.stringify(g.inv.serialize()),inv);
  }
});
