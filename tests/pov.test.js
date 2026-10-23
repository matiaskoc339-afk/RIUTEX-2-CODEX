// POV v0.16: la perspectiva cambia entrada/render, nunca los recursos ni la geometría.
const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H,Level:L,Weapons:W,Enemy,Inventory}=X;
g.init();
const fp=()=>run('FirstPerson');const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
function fixture(enabled=true){
 fp().setEnabled(false);g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.enemies=[];g.carn=null;g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;g.player.x=44.5*32;g.player.y=29.5*32;g.player.angle=0;g.player.knx=g.player.kny=0;g.player.poison=0;g.player.blade=g.player.over=g.player.predator=0;fp().setEnabled(enabled);return g.player;
}
function equip(id){g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.player.weapons={};g.player.weapon=null;g.giveWeapon(id,12,true);g.player.weapon=g.player.weapons[id];g.player.fireCd=g.player.reloading=g.player.spreadAdd=0;g.player.stamina=100;return g.player.weapon;}
function foe(x,y,id=99900){const e=new Enemy('sonambulo',x,y,id);e.hp=e.maxHp=500;e.grace=999;g.enemies.push(e);return e;}
test('Primera persona empieza desactivada y no se aplica a los niveles de RIUTEX 1',()=>{
 assert.equal(fp().enabled,false);const p=fixture();assert.equal(fp().active(g),true);assert.equal(fp().active({...g,lvl:'asylum'}),false);assert.equal(fp().active({...g,lvl:'hospital',player:null}),false);
});
test('La entrada gira con la cámara en los cuatro puntos cardinales',()=>{
 fixture();for(const a of [0,Math.PI/2,Math.PI,-Math.PI/2]){g.player.angle=a;let v=fp().vector(0,-1,g);near(v.x,Math.cos(a));near(v.y,Math.sin(a));v=fp().vector(1,0,g);near(v.x,-Math.sin(a));near(v.y,Math.cos(a));}
});
test('El movimiento real WASD mira hacia delante y el modo clásico conserva ejes mundiales',()=>{
 const p=fixture();g.keys={KeyW:true};const x=p.x,y=p.y;g.update(.04);assert.ok(p.x>x+4);near(p.y,y);
 fixture(false);g.player.angle=0;g.mouse.x=g.player.x+200-g.cam.x;g.mouse.y=g.player.y-g.cam.y;g.keys={KeyW:true};const xx=g.player.x,yy=g.player.y;g.update(.04);near(g.player.x,xx);assert.ok(g.player.y<yy-4);
});
test('Mover en diagonal conserva la misma distancia que avanzar',()=>{
 let p=fixture(),x=p.x,y=p.y;g.keys={KeyW:true};g.update(.04);const straight=Math.hypot(p.x-x,p.y-y);
 p=fixture();x=p.x;y=p.y;g.keys={KeyW:true,KeyD:true};g.update(.04);near(Math.hypot(p.x-x,p.y-y),straight);
});
test('Esquivar usa el mismo vector de cámara y conserva velocidad y duración',()=>{
 const p=fixture();p.angle=Math.PI/2;g.keys={KeyD:true};p.dodge(g,100,.2);near(p.dashVx,-500);near(p.dashVy,0);near(p.dashT,.2);assert.ok(p.invuln>=.35);
 fixture(false);g.keys={KeyD:true};g.player.angle=Math.PI/2;g.player.dodge(g,100,.2);near(g.player.dashVx,500);near(g.player.dashVy,0);
});
test('El movimiento de primera persona respeta exactamente las paredes existentes',()=>{
 const p=fixture();const tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=L.grid[ty][tx];try{L.grid[ty][tx]=1;g.keys={KeyW:true};for(let i=0;i<30;i++)g.update(.02);assert.ok(p.x+p.r<tx*32+.001);assert.equal(L.blocked(p.x,p.y,p.r),false);}finally{L.grid[ty][tx]=old;}
});
test('Sincronizar la mira no mueve al jugador ni consume recursos',()=>{
 const p=fixture();p.angle=.7;const before=[p.x,p.y,p.hp,p.energy,p.stamina,p.weapon];fp().sync(g);assert.deepEqual([p.x,p.y,p.hp,p.energy,p.stamina,p.weapon],before);const a=Math.atan2(g.mouse.y+g.cam.y-p.y,g.mouse.x+g.cam.x-p.x);near(Math.atan2(Math.sin(a-p.angle),Math.cos(a-p.angle)),0);
});
test('La mira de primera persona dispara hacia delante con munición y estamina reales',()=>{
 const p=fixture(),gun=equip('pistol'),front=foe(p.x+96,p.y),back=foe(p.x-96,p.y,99901),mag=gun.mag,st=p.stamina;fp().sync(g);W.fire(g,p);assert.ok(front.hp<500);assert.equal(back.hp,500);assert.equal(gun.mag,mag-1);assert.ok(p.stamina<st);assert.ok(g.tracers.length>0);
});
test('Los disparos siguen bloqueados por una pared aunque la cámara mire al enemigo',()=>{
 const p=fixture(),gun=equip('pistol'),tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=L.grid[ty][tx],e=foe(p.x+96,p.y);try{L.grid[ty][tx]=1;fp().sync(g);W.fire(g,p);assert.equal(e.hp,500);assert.ok(gun.mag<X.WEAPONS.pistol.mag);}finally{L.grid[ty][tx]=old;}
});
test('Cambiar perspectiva no permite disparar sin aliento ni recargar gratis',()=>{
 const p=fixture(),gun=equip('pistol');p.stamina=0;const mag=gun.mag;W.fire(g,p);assert.equal(gun.mag,mag);fp().setEnabled(false);fp().setEnabled(true);assert.equal(p.stamina,0);assert.equal(gun.mag,mag);p.fireCd=0;p.stamina=100;gun.mag=2;const reserve=g.inv.reserve('pistol');W.reload(p);assert.ok(p.reloading>0);fp().setEnabled(false);assert.equal(gun.mag,2);near(g.inv.reserve('pistol'),reserve);
});
test('Cuerpo a cuerpo conserva coste y arco al cambiar de perspectiva',()=>{
 let p=fixture(),e=foe(p.x+32,p.y),en=p.energy;fp().sync(g);p.melee(g);const cost=en-p.energy,damage=500-e.hp;assert.ok(cost>10&&damage>0);
 p=fixture(false);e=foe(p.x+32,p.y);en=p.energy;p.angle=0;p.melee(g);near(en-p.energy,cost);near(500-e.hp,damage);
});
test('El proyectil mutante sale por el mismo vector que la cámara',()=>{
 const p=fixture();p.angle=Math.PI/2;g.mut.owned.add('proyeccion');p.energy=100;g.castSkill('proyeccion');const q=g.projectiles.at(-1);assert.ok(q);near(q.vx,0);assert.ok(q.vy>400);assert.ok(p.energy<100);
});
test('La preferencia POV no modifica habilidades, llaves, armas ni progreso al guardar/cargar',()=>{
 const p=fixture();equip('pistol');g.mut.owned.add('sigilo');g.inv.keys.push('pov_test_key');p.hp=73;p.weapon.mag=4;g.save(0);const save=g.getSaveSlots()[0];fp().setEnabled(false);g.start(false,save);assert.equal(g.player.hp,73);assert.equal(g.player.weapon.mag,4);assert.ok(g.mut.has('sigilo')&&g.inv.keys.includes('pov_test_key'));assert.equal(fp().enabled,false);fp().setEnabled(true);g.start(false,save);assert.equal(fp().enabled,true);assert.equal(g.player.hp,73);assert.equal(g.player.weapon.mag,4);
});
test('Las quince plantas conservan su geometría y perspectivas con el mismo guardado',()=>{
 fixture();for(const lvl of ['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']){if(lvl==='mansion')g.start(false);else H.goto(g,lvl);assert.equal(fp().active(g),true,lvl);assert.ok(L.grid.length===L.H&&L.grid[0].length===L.W,lvl);const shape=JSON.stringify(L.grid);fp().setEnabled(false);assert.equal(JSON.stringify(L.grid),shape);fp().setEnabled(true);assert.equal(JSON.stringify(L.grid),shape);}
});
test('El raycaster usa la misma pared física que los proyectiles',()=>{
 const p=fixture(),tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=L.grid[ty][tx];try{L.grid[ty][tx]=1;const ray=run('FirstPersonRenderer.castRay(1,0,Game)');assert.equal(ray.value,1);near(ray.distance,16);}finally{L.grid[ty][tx]=old;}
});
test('Abrir una puerta cambia el rayo visual sin alterar sus baldosas ni inventar accesos',()=>{
 const p=fixture(),tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=L.grid[ty][tx],door={id:'pov_test',open:false,key:null,tiles:[[tx,ty]]};try{L.grid[ty][tx]=2;L.doors.push(door);const closed=run('FirstPersonRenderer.castRay(1,0,Game)');assert.equal(closed.value,2);near(closed.distance,16);L.openDoor(door);const opened=run('FirstPersonRenderer.castRay(1,0,Game)');assert.ok(opened.distance>32);assert.equal(door.open,true);assert.equal(L.grid[ty][tx],0);}finally{L.grid[ty][tx]=old;L.doors=L.doors.filter(d=>d!==door);}
});
test('El mobiliario visible sigue bloqueando la línea de combate',()=>{
 const p=fixture(),tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=L.grid[ty][tx],key=tx+','+ty,prop=L.props[key];try{L.grid[ty][tx]=4;L.props[key]='bed';const ray=run('FirstPersonRenderer.castRay(1,0,Game)'),hit=ray.hits.find(h=>h.value===4);assert.ok(hit);near(hit.distance,16);assert.ok(hit.height>=26);assert.equal(L.los(p.x,p.y,p.x+96,p.y),false);}finally{L.grid[ty][tx]=old;if(prop)L.props[key]=prop;else delete L.props[key];}
});

test('Mirar arriba y abajo no cambia la dirección ni el plano de combate',()=>{
 const p=fixture(),renderer=run('FirstPersonRenderer');p.angle=.71;renderer.W=800;renderer.H=600;fp().pitch=0;
 const landmark=[p.x+Math.cos(p.angle)*100,p.y+Math.sin(p.angle)*100,24],screenY=()=>{renderer.setup(g);return renderer.project(...landmark).y;},center=screenY();
 fp().look(0,-100,g);assert.ok(screenY()>center,'Mirar arriba baja el punto fijo en pantalla');near(p.angle,.71);
 fp().pitch=0;fp().look(0,100,g);assert.ok(screenY()<center,'Mirar abajo sube el punto fijo en pantalla');near(p.angle,.71);
 assert.ok(Number.isFinite(fp().pitch)&&Math.abs(fp().pitch)<=.35);fp().sync(g);near(Math.atan2(g.mouse.y+g.cam.y-p.y,g.mouse.x+g.cam.x-p.x),.71);
});
