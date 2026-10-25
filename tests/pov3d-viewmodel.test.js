const test=require('node:test'),assert=require('node:assert/strict');
const {X,run}=require('./harness');
X.Game.init();X.Game.startLvl='mansion';X.Game.start(false);
const V=run('POV3DViewmodel'),core={kitAPI:run('POV3DRenderer.kit()'),width:800,height:600,renderer:{clearDepth(){},render(){}},stats:{}};
V.init(core);
function frame({id='',infected=false,cut=false,cure=false,slash=0,blade=0}={}){const g=X.Game;g.state='play';g.collapse=null;g.player.hidden=false;g.player.weapon=id?{id,mag:12}:null;g.player.slash=slash;g.player.blade=blade;g.player.predator=0;g.story={armCut:cut,armHealed:infected,riutexUsed:infected?1:0,endgame:{choice:cure?'cure':null}};V.render(core,g,1,.016);return V.arms;}
test('El rig tiene dos manos 3D con puño y agarre distintos, sin sprites',()=>{const arms=frame();assert.equal(arms.length,2);for(const a of arms){assert.ok(a.root.visible&&a.fistDigits.visible&&!a.gripDigits.visible);a.root.traverse(o=>assert.notEqual(o.isSprite,true));assert.ok(a.parts.filter(m=>m.userData.handTone==='knuckle').length>=8);}});
test('Las armas usan geometría real cacheada y ambas manos sujetan el arma',()=>{for(const id of ['pistol','viper','ak','shotgun','flamethrower','gl6']){const arms=frame({id});assert.equal(core.stats.weapon3D,id);assert.equal(V.weaponMesh.userData.weaponId,id);assert.ok(V.weaponMesh.children[0].geometry.attributes.position.count>100);assert.ok(arms.every(a=>a.gripDigits.visible&&!a.fistDigits.visible));assert.equal(V.weapon(id),V.weaponMesh);}});
test('El golpe mueve el brazo izquierdo existente y conserva solo dos manos',()=>{const arms=frame({id:'pistol'}),roots=arms.map(a=>a.root),before=arms[1].palm.position.clone();frame({id:'pistol',infected:true,slash:.075});assert.deepEqual(arms.map(a=>a.root),roots);assert.ok(arms[1].palm.position.distanceTo(before)>.1);assert.ok(arms[1].fistDigits.visible&&!arms[1].gripDigits.visible);assert.ok(arms[0].gripDigits.visible);assert.equal(core.stats.hands,2);});
test('La mutación azul y las venas solo afectan al brazo infectado; la amputación y cura se respetan',()=>{let arms=frame({infected:true});assert.equal(arms[0].forearm.material,V.skinShadow);assert.ok(!arms[0].veins.visible);assert.equal(arms[1].forearm.material,V.blueDark);assert.ok(arms[1].veins.visible);arms=frame({cut:true});assert.ok(!arms[1].root.visible&&arms[0].root.visible);assert.equal(core.stats.hands,1);arms=frame({infected:true,cure:true});assert.ok(!arms[1].root.visible);assert.ok(!arms[0].veins.visible);assert.equal(core.stats.armInfected,false);});
test('Los antebrazos tienen más volumen y los puños y agarres conservan dos manos sin tapar la mira',()=>{
 const T=run('THREE');for(const id of ['', 'pistol','viper','ak','shotgun','r98','flamethrower','gl6']){
  const arms=frame({id,infected:true});const ray=new T.Raycaster(new T.Vector3(0,0,0),new T.Vector3(0,0,-1));
  for(const a of arms){assert.ok(a.forearm.scale.x>=.07);assert.ok(a.sleeve.scale.x>=.1);assert.ok(Math.abs(a.palm.scale.x)>=1.1);a.root.updateMatrixWorld(true);const b=new T.Box3().setFromObject(a.palm);assert.ok(b.max.z<-.1);assert.equal(ray.intersectObject(a.root,true).length,0);}
 }
});
