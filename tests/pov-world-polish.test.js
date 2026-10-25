// Geometría real y luces locales: comprobar culling y oclusión sin necesitar una GPU.
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),T=require('../vendor/three.min.js');
function setup(){
 const ctx={THREE:T,TILE:32,Level:{grid:Array.from({length:50},()=>Array(50).fill(0)),doors:[]},Game:{player:{x:176,y:176,angle:0},render(){}},FirstPerson:{active:()=>false},window:{devicePixelRatio:1}};
 vm.createContext(ctx);for(const file of ['pov3d-world.js','pov3d-renderer.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../js',file),'utf8'),ctx);
 return {ctx,W:vm.runInContext('POV3DWorld',ctx),R:vm.runInContext('POV3DRenderer',ctx)};
}
test('Los sectores conservan todas las baldosas y tienen límites finitos que pueden descartarse',()=>{
 const {W}=setup(),root=new T.Group(),geometry=new T.BoxGeometry(),material=new T.MeshStandardMaterial(),boxes=[];
 for(let z=0;z<72;z++)for(let x=0;x<96;x++)boxes.push({x:x*32+16,y:0,z:z*32+16,sx:32,sy:1.3,sz:32});
 const state={T,root,resources:[],staticBatches:[],meshesCount:0,kit:{batchBox(parent,items,mat){const mesh=new T.InstancedMesh(geometry,mat,items.length),m=new T.Matrix4();items.forEach((b,i)=>{m.makeScale(b.sx,b.sy,b.sz);m.setPosition(b.x,b.y,b.z);mesh.setMatrixAt(i,m);});parent.add(mesh);return mesh;}}};
 W.batchArchitecture(state,boxes,material,'floor');assert.equal(state.staticBatches.length,12);assert.equal(state.staticBatches.reduce((n,m)=>n+m.count,0),boxes.length);
 const seen=new Set(),matrix=new T.Matrix4();for(const mesh of state.staticBatches){assert.ok(mesh.frustumCulled);assert.ok(mesh.boundingSphere.radius>0);const span=mesh.boundingBox.getSize(new T.Vector3());assert.ok(span.x<=W.chunkSize&&span.z<=W.chunkSize);for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);const x=matrix.elements[12],z=matrix.elements[14];seen.add(x+','+z);}}
 assert.equal(seen.size,boxes.length);assert.ok(state.staticBatches.every(m=>state.resources.includes(m)));assert.ok(state.staticBatches.every(m=>m.geometry.index.count===6));
});
test('La descarga de un mapa libera buffers instanciados, rótulos, materiales y texturas propios',()=>{
 const {W}=setup(),counts={instance:0,geometry:0,material:0,texture:0},geometry=new T.PlaneGeometry(1,1),mesh=new T.InstancedMesh(new T.BoxGeometry(),new T.MeshStandardMaterial(),1),material=new T.MeshStandardMaterial(),texture=new T.Texture();
 for(const [object,key]of [[mesh,'instance'],[geometry,'geometry'],[material,'material'],[texture,'texture']])object.addEventListener('dispose',()=>counts[key]++);
 W.dispose({textures:[texture],materials:[material],resources:[mesh,geometry]});assert.deepEqual(counts,{instance:1,geometry:1,material:1,texture:1});
});
test('Los focos no iluminan a través de muros o puertas cerradas y sí por puertas abiertas',()=>{
 const {ctx,R}=setup(),lamp={x:336,z:176},p=ctx.Game.player;assert.ok(R.lampVisible(lamp,p));
 for(const tile of [1,2,3]){ctx.Level.grid[5][8]=tile;assert.equal(R.lampVisible(lamp,p),false);}
 ctx.Level.grid[5][8]=0;assert.ok(R.lampVisible(lamp,p));ctx.Level.grid[5][8]=4;assert.ok(R.lampVisible(lamp,p),'una mesa baja no apaga la lámpara del techo');
});
test('La asignación de los focos permanece estable cuando cambia su orden de distancia',()=>{
 const {ctx,R}=setup(),g=ctx.Game;R.camera3D=new T.PerspectiveCamera();R.forward=new T.Vector3(1,0,0);R.flashlight=new T.SpotLight();R.localLights=Array.from({length:3},()=>new T.PointLight());
 R.worldState={lamps:[{id:1,x:220,z:176,y:54,intensity:4400,distance:200},{id:2,x:150,z:176,y:54,intensity:3100,distance:200},{id:3,x:176,z:210,y:54,intensity:4400,distance:200}]};R.stats={};
 R.lights(g,1);const initial=R.localLights.map(l=>l.userData.sourceId);g.player.x=209;R.lights(g,1.2);assert.deepEqual(R.localLights.map(l=>l.userData.sourceId),initial);assert.equal(R.stats.activeRoomLights,3);
});
test('La luz propia de una sala inaccesible queda fuera del presupuesto de focos',()=>{
 const {ctx,R}=setup(),g=ctx.Game;R.camera3D=new T.PerspectiveCamera();R.forward=new T.Vector3(1,0,0);R.flashlight=new T.SpotLight();R.localLights=Array.from({length:2},()=>new T.PointLight());R.stats={};
 ctx.Level.grid[5][8]=2;R.worldState={lamps:[{id:7,x:336,z:176,y:54,intensity:4400,distance:260},{id:8,x:176,z:210,y:54,intensity:3100,distance:200}]};R.lights(g,1);assert.equal(R.stats.activeRoomLights,1);assert.ok(!R.localLights.some(l=>l.userData.sourceId===7));
 ctx.Level.grid[5][8]=0;R.lights(g,1.2);assert.equal(R.stats.activeRoomLights,2);assert.ok(R.localLights.some(l=>l.userData.sourceId===7));
});
test('El descarte horizontal admite el borde visible con FOV alto en monitores ultraanchos',()=>{
 const {ctx,R}=setup(),p=ctx.Game.player,a=1.24,x=p.x+Math.cos(a)*200,z=p.y+Math.sin(a)*200;R.camera3D=new T.PerspectiveCamera(85,32/9);assert.ok(R.lineVisible(x,z,0));R.camera3D.aspect=16/10;assert.equal(R.lineVisible(x,z,0),false);
});
test('Las hojas de puerta se actualizan también tras restaurar el conjunto de puertas',()=>{
 const {ctx,W}=setup(),door={id:'saved',open:false},view={door,left:new T.Group(),right:new T.Group(),signalMat:new T.MeshStandardMaterial(),leafWidth:20,leftBase:0,rightBase:0,progress:0},state={doors:new Map([['saved',view]]),fluids:[]};ctx.Level.doors=[door];W.update(state,{},1,.1);assert.equal(view.progress,0);
 ctx.Level.doors=[{id:'saved',open:true}];for(let i=0;i<8;i++)W.update(state,{},1+i*.1,.1);assert.equal(view.progress,1);assert.ok(view.left.position.x<-20&&view.right.position.x>20);
 const R=vm.runInContext('POV3DRenderer',ctx),group=new T.Group();group.position.set(336,0,176);const frame={group,span:32,horizontal:false,tileKeys:new Set(['10,5'])};ctx.Level.grid[5][10]=2;assert.ok(R.doorVisible(frame,ctx.Game),'la hoja cerrada del propio umbral no desaparece');ctx.Level.grid[5][8]=1;assert.equal(R.doorVisible(frame,ctx.Game),false,'el marco detrás de un tabique no se dibuja');
});
test('Las superficies conservan altura, orientación y continuidad al mirar al suelo o al techo',()=>{
 const {W}=setup(),root=new T.Group(),state={T,root,resources:[],staticBatches:[],meshesCount:0},material=new T.MeshStandardMaterial(),floors=[],roofs=[];
 for(let z=0;z<4;z++)for(let x=0;x<4;x++){floors.push({x:x*32+16,y:-.65,z:z*32+16,sx:32,sy:1.3,sz:32});roofs.push({x:x*32+16,y:62.7,z:z*32+16,sx:32,sy:1.4,sz:32});}
 W.batchArchitecture(state,floors,material,'floor');W.batchArchitecture(state,roofs,material,'ceiling');root.updateMatrixWorld(true);
 for(const [x,z]of [[16,16],[32,32],[64,96],[112,112]])for(const dir of [-1,1]){const hit=new T.Raycaster(new T.Vector3(x,35,z),new T.Vector3(0,dir,0)).intersectObject(root,true)[0];assert.ok(hit,'sin huecos en la baldosa o sus bordes');assert.ok(Math.abs(hit.point.y-(dir<0?0:62))<.0001);}
});
