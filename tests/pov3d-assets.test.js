// Mallas reales con Three.js sin crear un contexto WebGL ni modificar la simulación.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),T=require('../vendor/three.min.js');
const {X,run}=require('./harness');X.Game.init();X.Game.startLvl='mansion';X.Game.start(false);
const context={POVModels:run('POVModels'),POVArt:run('POVArt')};vm.createContext(context);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/pov3d-assets.js'),'utf8')+';globalThis.A=POV3DAssets;',context);const A=context.A;
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../js/pov-character-art.js'),'utf8'),context);
const materials=new Map(),sphere=new T.SphereGeometry(1,14,10),box=new T.BoxGeometry(1,1,1);
function mesh(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);parent.add(m);return m;}
A.init({THREE:T,mat:(c,r=.8,metal=0,e=null)=>{const k=[c,r,metal,e].join(':');if(!materials.has(k))materials.set(k,new T.MeshStandardMaterial({color:c,roughness:r,metalness:metal,emissive:e||'#000000'}));return materials.get(k);},
 box:(p,x,y,z,a,b,c,m)=>mesh(p,box,m,x,y,z,a,b,c),sphere:(p,x,y,z,a,b,c,m)=>mesh(p,sphere,m,x,y,z,a,b,c),
 cylinder:(p,x,y,z,a,b,h,m,n=12)=>mesh(p,new T.CylinderGeometry(a,b,h,n),m,x,y,z),rod:(p,a,b,r,m)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av),out=mesh(p,new T.CylinderGeometry(r,r,delta.length(),8),m,...av.add(bv).multiplyScalar(.5).toArray());out.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return out;}});
function checkMesh(root){const size=new T.Box3().setFromObject(root).getSize(new T.Vector3());assert.ok([size.x,size.y,size.z].every(n=>Number.isFinite(n)&&n>0));let meshes=0;root.traverse(o=>{assert.notEqual(o.isSprite,true);if(o.isMesh){meshes++;assert.ok(o.geometry.attributes.position.count>0);assert.ok(o.material.isMeshStandardMaterial);}});assert.ok(meshes>0);return {size,meshes};}
test('Cada especie de la campaña tiene anatomía volumétrica y ninguna usa billboards',()=>{
 for(const [type,def]of Object.entries(X.ENEMY_TYPES)){const e={type,def,id:80,phase:1,x:0,y:0},root=A.enemy(e,X.Game),before=JSON.stringify(e);checkMesh(root);assert.equal(root.userData.modelIdentifier,type);A.animateEnemy(root,e,X.Game,1,.016);assert.equal(JSON.stringify(e),before);}
});
test('La identidad heredada del Carnicero y C-17 no usa mallas de paciente o camillero',()=>{
 const c=run('new Carnicero(900,0,0)'),escort=run('new EscoltaC17(1197,0,0,360)');assert.equal(A.enemy(c,X.Game).userData.modelIdentifier,'carnicero');assert.equal(A.enemy(escort,X.Game).userData.modelIdentifier,'c17');
});
test('Las mutaciones de los cuatro jefes cambian volumen y complejidad',()=>{
 for(const type of ['carnicero','ds_matriarch','cl_regent','lf_wren']){const def=type==='carnicero'?{name:'El Carnicero'}:X.ENEMY_TYPES[type],first=checkMesh(A.enemy({type,def,phase:1,id:900},X.Game)),last=checkMesh(A.enemy({type,def,phase:3,id:900},X.Game));assert.ok(last.size.y>=first.size.y,type);assert.ok(last.meshes>first.meshes,type);}
});
test('Respiración, andar, ataques, patas y alas se articulan sin cambiar al enemigo',()=>{
 for(const type of ['sonambulo','cl_blind','ds_matriarch','cl_hound','cl_moth']){const e={type,def:X.ENEMY_TYPES[type],id:12,x:0,y:0,mode:'idle'},r=A.enemy(e,X.Game);A.animateEnemy(r,e,{state:'play'},1,.016);e.x=2;A.animateEnemy(r,e,{state:'play'},1.02,.016);assert.ok(r.userData.clock>0);assert.notEqual(r.userData.rig.body.position.y,0);if(r.userData.rig.arms){e.mode='wind';A.animateEnemy(r,e,{state:'play'},1.04,.016);assert.ok(r.userData.rig.arms[0].rotation.x<-.8);}}
});
test('Los muebles y objetos tienen volumen; las escaleras poseen peldaños y flecha 3D',()=>{
 for(const type of ['bed','locker','shelf','pillar','bars','machine','crate','desk','table','bench','barrel'])checkMesh(A.prop(type,X.Game));
 for(const type of ['doc','savebed','h_hide','h_stairs','ds_finish','cl_finish','lf_return','inj_green','sample','key','wx_valve','adv_weapon','am_pistol','screw_small','wx_part','h_clock','cl_bell','h_workbench','wx_radio','wx_wash','h_safe','h_mix','h_eeg','lf_core']){const root=A.item({type,id:type},X.Game);checkMesh(root);A.animateItem(root,{type},X.Game,1,.016);if(/stairs|finish|return/.test(type)){assert.equal(root.userData.modelIdentifier,'stairs');assert.ok(root.userData.arrow?.isGroup);assert.ok(root.userData.markerHeight>=40);}}
});
test('Las armas recogibles tienen cuerpos sólidos y la librería reutiliza materiales',()=>{
 const before=materials.size;for(const id of ['pistol','shotgun','viper','ak','r98','flamethrower','gl6'])checkMesh(A.weapon(id,.75));for(let i=0;i<10;i++)A.enemy({type:'sonambulo',def:X.ENEMY_TYPES.sonambulo,id:i},X.Game);assert.ok(materials.size-before<5);
});
test('Todas las especies comparten la dirección de píxel 3D y abandonan las piezas esféricas',()=>{
 for(const [type,def]of Object.entries(X.ENEMY_TYPES)){const root=A.enemy({type,def,id:1,phase:1},X.Game);assert.equal(root.userData.artStyle,'pixel-sculpt');root.traverse(o=>{if(o.isMesh){assert.notEqual(o.geometry.type,'SphereGeometry');assert.equal(o.material.userData.pixelCharacter,true);assert.equal(o.material.flatShading,true);}});}
});
test('Crear personajes no cambia los materiales ni la geometría del mobiliario',()=>{
 const palette=Object.values(A.palette),before=palette.map(m=>[m.color.getHex(),m.flatShading,m.map]);
 A.enemy({type:'lf_wren',id:4,phase:3,def:X.ENEMY_TYPES.lf_wren},X.Game);A.ally({name:'Rojas',col:'#44554c'},X.Game);
 palette.forEach((m,i)=>assert.deepEqual([m.color.getHex(),m.flatShading,m.map],before[i]));
 const bed=A.prop('bed',X.Game);bed.traverse(o=>{if(o.isMesh)assert.notEqual(o.material.userData.pixelCharacter,true);});assert.equal(vm.runInContext('POVCharacterArt.depth',context),0);
});
test('El nuevo diseño y las tres mutaciones no modifican los datos de combate',()=>{
 for(const type of ['carnicero','ds_matriarch','cl_regent','lf_wren'])for(const phase of [1,2,3]){const e={type,phase,def:X.ENEMY_TYPES[type]||{name:type},id:57,hp:71,r:17,x:200,y:400},before=JSON.stringify(e);A.enemy(e,X.Game);assert.equal(JSON.stringify(e),before);}
});
