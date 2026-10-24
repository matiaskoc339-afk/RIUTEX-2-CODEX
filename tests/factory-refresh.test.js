const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const g=X.Game,L=X.Level;g.init();
function start(){g.startLvl='mansion';g.start(false);X.Hospital.toHospital(g);g.story.restrained=false;X.Hospital.inject(g);g.story.seq='free';g.state='play';X.Hospital.buildLevel(g,'hospitalworks',null);g.player.x=71.5*32;g.player.y=43.5*32;g.player.hidden=true;g.noise=g.worksNoise=null;return g;}
test('Dieciséis encuentros adicionales están separados del refugio y usan IDs únicos',()=>{
 start();assert.equal(g.enemies.length,58);const extra=g.enemies.filter(e=>e.id>=5300&&e.id<5316);assert.equal(extra.length,16);assert.equal(new Set(g.enemies.map(e=>e.id)).size,58);
 for(const e of extra){assert.equal(L.grid[Math.floor(e.y/32)][Math.floor(e.x/32)],0);assert.ok(!run('WorksMap.safe({x:'+e.x+',y:'+e.y+'})'));assert.ok(Math.hypot(e.x-64.5*32,e.y-12.5*32)>350);}
});
test('Cuatro patrullas recorren suelo válido sin teletransportarse ni abandonar la fábrica',()=>{
 start();const routes=run('WorksMap.patrols');assert.equal(Object.keys(routes).length,4);
 for(const [id,route]of Object.entries(routes)){for(const [x,y]of route)assert.equal(L.grid[y][x],0);const e=g.enemies.find(e=>e.id===Number(id)),origin=[e.x,e.y];let travel=0;
  for(let i=0;i<300;i++){const old=[e.x,e.y];e.update(.05,g);const d=Math.hypot(e.x-old[0],e.y-old[1]);travel+=d;assert.ok(d<=e.def.speed*.32*.05+.01);assert.ok(!L.solid(e.x,e.y));}
  assert.ok(travel>100,id);assert.ok(Math.hypot(e.x-origin[0],e.y-origin[1])>5,id);
 }
});
test('Las patrullas interrumpen su ronda al detectar al jugador y el refugio detiene ataques',()=>{
 start();const e=g.enemies.find(e=>e.id===5300);e.update(.1,g);assert.equal(e.mode,'patrol');g.player.hidden=false;g.player.x=e.x+45;g.player.y=e.y;e.face=0;e.update(.2,g);assert.ok(e.target);assert.notEqual(e.mode,'patrol');
 g.player.x=65.5*32;g.player.y=12.5*32;const pos=[e.x,e.y],hp=g.player.hp;for(let i=0;i<100;i++)e.update(.05,g);assert.deepEqual([e.x,e.y],pos);assert.equal(g.player.hp,hp);
});
test('Las bajas nuevas no reaparecen al cargar ni entregan XP extra; el apoyo es finito',()=>{
 start();const e=g.enemies.find(e=>e.id===5300),xp=g.player.xp;e.hurt(9999,0,g);const reward=g.player.xp-xp;assert.ok(reward>=1&&reward<=2);e.hurt(9999,0,g);assert.equal(g.player.xp,xp+reward);
 const supplies=g.items.filter(i=>String(i.id).startsWith('wx_reinforcement_supply_'));assert.equal(supplies.length,6);assert.ok(supplies.every(i=>i.type!=='sample'&&i.type!=='doc'));
 const ammo=supplies.find(i=>i.type==='ammo');g.take(ammo);const count=g.inv.reserve('pistol');g.save(0);g.start(true,g.getSaveSlots()[0]);assert.ok(g.enemies.find(e=>e.id===5300).dead);assert.ok(!g.items.some(i=>i.id===ammo.id));assert.equal(g.inv.reserve('pistol'),count);assert.equal(g.player.xp,xp+reward);
});
