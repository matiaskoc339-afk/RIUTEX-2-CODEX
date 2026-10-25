const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game:g,Hospital:H}=X,E=run('ExperienceSettings'),R=run('SurvivalReadout'),FP=run('FirstPerson');g.init();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} != ${b}`);
function fixture(){g.startLvl='mansion';g.start(false);H.toHospital(g);g.story.restrained=false;H.inject(g);H.lobbyReached(g);g.story.seq='free';g.state='play';g.enemies=[];g.carn=null;g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;E.values={...E.defaults};run('MenuScene.reduced=false');return g.player;}
test('Opciones corruptas y fuera de rango conservan valores visuales válidos',()=>{
 for(const value of [null,{},[],{fov:'82',hud:Infinity,quality:'ultra',sway:NaN}])assert.deepEqual({...E.normalize(value)},{...E.defaults});
 const s=E.normalize({fov:999,hud:3,sway:-1,shake:23,quality:'economy'});assert.equal(s.fov,85);assert.equal(s.hud,85);assert.equal(s.sway,0);assert.equal(s.shake,20);assert.equal(s.quality,'economy');
});
test('Imagen se conserva separada de la sesión y nunca compra habilidades ni recursos',()=>{
 const p=fixture(),before=JSON.stringify([p.hp,p.xp,p.energy,p.stamina,g.mut.serialize(),g.inv.serialize()]);
 E.set('fov',81);E.set('hud',115);E.set('quality','balanced');E.values={...E.defaults};E.load();assert.equal(E.values.fov,81);assert.equal(E.values.hud,115);assert.equal(E.values.quality,'balanced');
 E.set('__proto__',0);assert.equal(JSON.stringify([p.hp,p.xp,p.energy,p.stamina,g.mut.serialize(),g.inv.serialize()]),before);
});
test('Balanceo configurable mantiene cámara y trayectoria al mismo nivel sin acumular escala',()=>{
 fixture();FP.setEnabled(true);const M=run('POVCameraMotion');M.player=g.player;M.level=g.lvl;M.amplitude=.5;g.player.walkT=.6;
 E.values.sway=100;const full=M.pose(g).y;assert.ok(Math.abs(full)>.1);
 E.values.sway=50;near(M.pose(g).y,full*.5);near(M.pose(g).y,full*.5);near(run('POV3DBallistics.ray(Game,Game.player).eye'),35+full*.5);
 E.values.sway=0;near(M.eye(g),35);run('MenuScene.reduced=true');E.values.sway=100;near(M.eye(g),35);near(E.shakeFactor(),0);FP.setEnabled(false);
});
test('Indicador de poderes respeta costes reales, catalizador y sobrecarga',()=>{
 const p=fixture();for(const id of ['suspension','gold_catalyst'])g.mut.owned.add(id);g.mut.bindings.suspension='KeyQ';g.mut.cd.suspension=0;p.over=4;
 const s=R.skill(g,'suspension'),before=p.energy;g.castSkill('suspension');near(before-p.energy,s.cost);assert.equal(s.key,'Q');assert.equal(s.state,'ready');assert.equal(R.skill(g,'suspension').state,'cooldown');
});
test('Poder humano muestra estamina; falta de recursos, ocultación y requisitos son claros',()=>{
 const p=fixture();for(const id of ['reflejos','respiracion','trueque','camuflaje']){g.mut.owned.add(id);g.mut.bindings[id]='KeyZ';}
 p.stamina=0;assert.match(R.skill(g,'reflejos').label,/ESTAMINA/);p.stamina=100;g.keys.KeyW=true;assert.equal(R.skill(g,'respiracion').label,'DETENTE');g.keys={};
 p.hidden=true;assert.equal(R.skill(g,'respiracion').label,'OCULTO');p.hidden=false;p.hp=12;assert.equal(R.skill(g,'trueque').label,'SALUD BAJA');
 const lamps=X.Level.lamps;X.Level.lamps=[{x:p.x,y:p.y,r:300}];assert.equal(R.skill(g,'camuflaje').label,'BUSCA SOMBRA');X.Level.lamps=lamps;
});
test('HUD calcula esfuerzo real del arma y progreso de recarga sin gastar balas',()=>{
 const p=fixture();g.giveWeapon('pistol',24,true);p.weapon=p.weapons.pistol;p.weapon.mag=0;X.Weapons.reload(p);
 const before=JSON.stringify([g.inv.serialize(),p.stamina,p.energy,p.xp]);p.reloading=p.reloadDuration*.5;
 const s=R.snapshot(g);near(s.reload.fraction,.5);near(s.effort,Math.ceil(X.Weapons.staminaCost(g,p,X.Weapons.effective(p,'pistol'))*10)/10);assert.equal(JSON.stringify([g.inv.serialize(),p.stamina,p.energy,p.xp]),before);
 p.stamina=0;assert.equal(R.snapshot(g).exhausted,true);p.reloading=0;assert.equal(R.snapshot(g).reload,null);
});
test('Solo habilidades adquiridas y asignadas aparecen; seleccionada conserva prioridad',()=>{
 fixture();const ids=Object.keys(X.SKILLS).filter(id=>X.SKILLS[id].type==='active').slice(0,7);g.mut.bindings={};
 ids.forEach((id,i)=>{g.mut.owned.add(id);g.mut.bindings[id]='Digit'+(i+1);});g.mut.equipped=ids[6];g.mut.bindings.fake='KeyZ';
 const s=R.snapshot(g);assert.equal(s.skills.length,5);assert.equal(s.skills[0].id,ids[6]);assert.equal(s.extra,2);assert.ok(!s.skills.some(i=>i.id==='fake'));
});
test('Leer poderes después de guardar y cargar conserva recursos y enfriamientos',()=>{
 fixture();g.mut.owned.add('suspension');g.mut.bindings.suspension='KeyQ';g.mut.cd.suspension=7.5;const S=run('SessionSave'),sv=S.capture(g);S.resume(sv);
 const p=g.player,stats=[p.hp,p.energy,p.stamina,p.xp];assert.equal(R.skill(g,'suspension').cooldown,7.5);R.snapshot(g);assert.deepEqual([p.hp,p.energy,p.stamina,p.xp],stats);
});
