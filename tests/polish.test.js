const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');const {Game,Hospital,SKILLS,Trees,Inventory,Weapons}=X;Game.init();
function fixture(){Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.enemies=[];Game.carn.dormant=true;Game.state='play';Game.player.x=44.5*32;Game.player.y=28.5*32;Game.mouse.down=false;Game.keys={};}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Todo bono porcentual de T2 aumenta una vez, con incremento máximo de seis puntos',()=>{
 fixture();const audit=JSON.parse(run('JSON.stringify(SkillBalance.audit)'));assert.ok(audit.length>50);
 for(const {id,key,before,after} of audit){assert.ok(after>before);if(key!=='en')assert.ok(after-before<=.0600001);near(SKILLS[id].mod[key],after);}
 const snapshot=JSON.stringify(SKILLS);run('SkillBalance.apply()');assert.equal(JSON.stringify(SKILLS),snapshot);
 near(SKILLS.blue_body_3.mod.eregen,.12);near(SKILLS.blue_aim_3.mod.stam,.14);near(SKILLS.blue_aim_5.mod.speed,.04);
});
test('Textos y condiciones conservan sentido: potencia mayor, umbrales y penalizaciones intactos',()=>{
 fixture();assert.match(SKILLS.blue_body_3.desc,/12 %/);assert.match(SKILLS.blue_aim_3.desc,/14 %/);assert.match(SKILLS.blue_aim_7.desc,/32 %.*30 %/);assert.match(SKILLS.coraza.desc,/45 %.*15 %/);assert.match(SKILLS.forma_acechador.desc,/26 %.*30 %/);
 for(const [id,s] of Object.entries(SKILLS))if(s.mod?.en===12)assert.match(s.desc,/12 de/,id);
});
test('Regeneración Riutex y estamina aumentan realmente sin regalar mejoras al empezar',()=>{
 fixture();const p=Game.player;p.energy=0;p.stamina=0;p.exertion=0; p.update(.1,Game);const baseE=p.energy,baseS=p.stamina;
 Game.mut.owned.add('blue_body_3');Game.mut.owned.add('blue_aim_3');p.energy=0;p.stamina=0;p.update(.1,Game);near(p.energy,baseE*1.12);near(p.stamina,baseS*1.14);
});
test('Reservas Riutex pequeñas se recalculan al cargar, sin duplicarse entre guardados',()=>{
 fixture();Game.update(0);const base=Game.player.maxEnergy;Game.mut.owned.add('foco');Game.update(0);near(Game.player.maxEnergy,base+14);Game.save(0);Game.start(true,Game.getSaveSlots()[0]);Game.update(0);near(Game.player.maxEnergy,base+14);Game.save(0);Game.start(true,Game.getSaveSlots()[0]);Game.update(0);near(Game.player.maxEnergy,base+14);
});
test('Protección pasiva y activa aplican el nuevo daño sin afectar al jugador sin habilidades',()=>{
 fixture();const p=Game.player;p.hp=p.maxHp=1000;p.invuln=0;p.hurt(40,0,Game);near(1000-p.hp,50);
 Game.mut.owned.add('chaleco');Game.mut.owned.add('piel');Game.mut.owned.add('blue_flow_7');p.hp=1000;p.invuln=0;p.hurt(40,0,Game);near(1000-p.hp,50*.75*.70*.86);
 p.shell=6;p.hp=1000;p.invuln=0;p.hurt(40,0,Game);near(1000-p.hp,50*.75*.70*.86*.55);
});
test('Catalizador y Sinapsis reducen coste y recarga reales, sin alterar metadatos tras lanzar',()=>{
 fixture();Game.mut.owned.add('instinto');Game.mut.owned.add('gold_catalyst');Game.mut.owned.add('blue_neural_7');const s=SKILLS.instinto,cost=s.energy;Game.player.energy=100;Game.castSkill('instinto');near(Game.player.energy,100-cost*.84);near(Game.mut.cd.instinto,s.cd*.8);near(s.energy,cost);
});
test('Apoyo de armas ahorra estamina de verdad y las mejoras del banco conservan su escala',()=>{
 fixture();Game.giveWeapon('pistol',24,true);const p=Game.player;const cost=run('CombatPressure.shotCost(Game,Game.player,WEAPONS.pistol)');p.coverWindow=6;near(run('CombatPressure.shotCost(Game,Game.player,WEAPONS.pistol)'),cost*.75);Game.mut.owned.add('gun_support');near(run('CombatPressure.shotCost(Game,Game.player,WEAPONS.pistol)'),cost*.75/1.12);
});
test('R1 conserva su árbol y factores anteriores; en Node los fundidos no bloquean simulación',()=>{
 fixture();Trees.use('r1');assert.equal(run("SkillBalance.value({lvl:'asylum'},'piel',.75)"),.75);assert.equal(run('SceneTransitions.active'),false);assert.equal(run('SceneTransitions.supported()'),false);Trees.use('r2');
});
