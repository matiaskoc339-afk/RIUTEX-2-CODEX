// Escena WebGL real: geometría, profundidad, materiales físicos y actores articulados.
// La cuadrícula y las reglas de topdown siguen siendo la fuente de colisiones y progreso.
const POV3DRenderer={
  ready:false,failed:false,rendering:false,frame:0,eyeHeight:35,stats:{},actors:new Map(),items:new Map(),props:[],
  geometryCache:new Map(),materialCache:new Map(),cueBatches:new Map(),
  mat(color='#65727a',roughness=.8,metalness=0,emissive=null){
    if(color?.isMaterial)return color;
    const key=[color,roughness,metalness,emissive].join('|');if(this.materialCache.has(key))return this.materialCache.get(key);
    const m=new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:emissive||0x000000,emissiveIntensity:emissive?.28:0});this.materialCache.set(key,m);return m;
  },
  geometry(key,make){if(!this.geometryCache.has(key)){const g=make();g.userData.shared=true;this.geometryCache.set(key,g);}return this.geometryCache.get(key);},
  mesh(parent,geometry,material){const m=new THREE.Mesh(geometry,this.mat(material));m.castShadow=!m.material.transparent;m.receiveShadow=true;parent.add(m);return m;},
  kit(){
    const r=this;
    return {THREE,mat:(...a)=>r.mat(...a),
      box(parent,x,y,z,sx,sy,sz,material){const m=r.mesh(parent,r.geometry('box',()=>new THREE.BoxGeometry(1,1,1)),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;},
      sphere(parent,x,y,z,rx,ry,rz,material){const m=r.mesh(parent,r.geometry('sphere',()=>new THREE.SphereGeometry(1,18,12)),material);m.position.set(x,y,z);m.scale.set(rx,ry,rz);return m;},
      cylinder(parent,x,y,z,rt,rb,height,material,segments=12){const radius=Math.max(rt,rb,.001),key=['cylinder',rt/radius,rb/radius,segments].join(':');const m=r.mesh(parent,r.geometry(key,()=>new THREE.CylinderGeometry(rt/radius,rb/radius,1,segments)),material);m.position.set(x,y,z);m.scale.set(radius,height,radius);return m;},
      rod(parent,a,b,radius,material){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av),m=r.mesh(parent,r.geometry('rod',()=>new THREE.CylinderGeometry(1,1,1,10)),material);m.position.copy(av.add(bv).multiplyScalar(.5));m.scale.set(radius,Math.max(.001,delta.length()),radius);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m;},
      batchBox(parent,boxes,material){const mesh=new THREE.InstancedMesh(r.geometry('box',()=>new THREE.BoxGeometry(1,1,1)),r.mat(material),boxes.length),dummy=new THREE.Object3D();for(let i=0;i<boxes.length;i++){const b=boxes[i];dummy.position.set(b.x,b.y,b.z);dummy.scale.set(b.sx,b.sy,b.sz);dummy.rotation.set(0,b.ry||0,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
    };
  },
  init(g){
    if(this.ready)return true;if(this.failed||typeof THREE==='undefined'||typeof HTMLCanvasElement==='undefined')return false;
    try{
      const canvas=document.createElement('canvas');canvas.id='pov3dCanvas';canvas.setAttribute('aria-hidden','true');canvas.style.cssText='position:fixed;inset:0;width:100vw;height:100vh;z-index:0;pointer-events:none;display:none';document.body.prepend(canvas);
      this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
      this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
      this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.autoClear=false;this.renderer.info.autoReset=false;
      this.canvas=canvas;this.scene=new THREE.Scene();this.scene.background=new THREE.Color('#070d13');this.scene.fog=new THREE.FogExp2('#101b24',.0021);
      this.camera3D=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.45,1550);this.scene.add(this.camera3D);
      this.ambient=new THREE.HemisphereLight('#a5bdcf','#1b1b20',.75);this.scene.add(this.ambient);
      this.fill=new THREE.DirectionalLight('#9caeb7',.33);this.fill.position.set(-80,100,50);this.scene.add(this.fill);
      this.flashlight=new THREE.SpotLight('#e5edf1',150,640,Math.PI/6,.72,1.15);this.flashlight.castShadow=true;this.flashlight.shadow.mapSize.set(1536,1536);this.flashlight.shadow.bias=-.00035;this.flashlight.shadow.normalBias=.2;this.flashlight.shadow.camera.near=1;this.flashlight.shadow.camera.far=680;this.scene.add(this.flashlight,this.flashlight.target);
      this.localLights=Array.from({length:6},()=>{const l=new THREE.PointLight('#c7d7df',0,220,1.25);this.scene.add(l);return l;});
      this.world=new THREE.Group();this.scene.add(this.world);this.actorRoot=new THREE.Group();this.scene.add(this.actorRoot);this.itemRoot=new THREE.Group();this.scene.add(this.itemRoot);this.effectRoot=new THREE.Group();this.scene.add(this.effectRoot);this.cueRoot=new THREE.Group();this.scene.add(this.cueRoot);
      this.kitAPI=this.kit();POV3DAssets.init(this.kitAPI);
      this.vector=new THREE.Vector3();this.forward=new THREE.Vector3();this.effectPool=[];
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();this.contextLost=true;UI.msg('Se está recuperando la vista 3D…',4000);});
      canvas.addEventListener('webglcontextrestored',()=>{this.contextLost=false;this.levelGrid=null;});
      this.ready=true;this.resize(g);return true;
    }catch(error){this.failed=true;this.failure=String(error);UI.msg('Este navegador no pudo iniciar 3D. La vista clásica sigue disponible.',7000);return false;}
  },
  resize(g){
    const width=Math.max(320,innerWidth),height=Math.max(240,innerHeight),ratio=Math.min(1.5,window.devicePixelRatio||1);
    if(this.width!==width||this.height!==height||this.ratio!==ratio){this.width=width;this.height=height;this.ratio=ratio;this.renderer.setPixelRatio(ratio);this.renderer.setSize(width,height,false);this.camera3D.aspect=width/height;this.camera3D.updateProjectionMatrix();}
    // La capa de mira/avisos también se presenta a resolución completa.
    if(g.cv.width!==width||g.cv.height!==height){g.cv.width=width;g.cv.height=height;g.lc.width=width;g.lc.height=height;g.cam.x=g.player.x-width/2;g.cam.y=g.player.y-height/2;}
    g.cv.style.position='fixed';g.cv.style.inset='0';g.cv.style.zIndex='1';g.cv.style.background='transparent';
  },
  hide(g){
    if(this.canvas)this.canvas.style.display='none';
    if(this.visible){this.visible=false;const w=Math.ceil(innerWidth/1.35),h=Math.ceil(innerHeight/1.35);g.cv.width=g.lc.width=w;g.cv.height=g.lc.height=h;if(g.player){g.cam.x=g.player.x-w/2;g.cam.y=g.player.y-h/2;}document.body.classList.remove('pov3d-active');}
  },
  disposeObject(root){if(!root)return;root.traverse(o=>{if(o.geometry&&!o.geometry.userData.shared)o.geometry.dispose();});root.removeFromParent();},
  rebuild(g){
    if(this.worldState)POV3DWorld.dispose(this.worldState);
    for(const a of this.allies||[])this.disposeObject(a);this.allies=null;this.props=[];
    for(const a of this.remains?.values()||[])this.disposeObject(a);this.remains=new Map();
    if(this.echo){this.disposeObject(this.echo);this.echo=null;}
    this.world.clear();for(const m of this.actors.values())this.disposeObject(m.root);for(const m of this.items.values())this.disposeObject(m.root);this.actors.clear();this.items.clear();
    this.worldState=POV3DWorld.build(this.world,g,this.kitAPI);
    for(const [cell,type]of Object.entries(Level.props||{})){const [x,z]=cell.split(',').map(Number);if(Level.grid[z]?.[x]!==4)continue;const root=POV3DAssets.prop(type,g);root.position.set((x+.5)*TILE,0,(z+.5)*TILE);this.world.add(root);this.props.push({root,x:root.position.x,z:root.position.z});}
    for(const barrel of g.barrels||[]){const root=POV3DAssets.prop('barrel',g);root.position.set(barrel.x,0,barrel.y);this.world.add(root);this.props.push({root,x:barrel.x,z:barrel.y,barrel});}
    this.levelGrid=Level.grid;this.level=g.lvl;this.renderer.renderLists.dispose();
    const ambient=this.worldState.ambient;if(typeof ambient==='object'){this.ambient.intensity=ambient.intensity??.6;this.ambient.color.set(ambient.color||'#a5bdcf');this.ambient.groundColor.set(ambient.ground||'#1b1b20');}else this.ambient.intensity=ambient??.75;
    this.scene.fog.color.set(g.lvl==='hospitalstreet'?'#192a38':'#101b24');
    this.stats={backend:this.renderer.capabilities.isWebGL2?'WebGL 2':'WebGL',level:g.lvl,realMeshes:true,billboards:0,roomMask:false,ceilingHeight:this.worldState.ceilingHeight||62};
    this.lastTime=g.t||0;
  },
  propHeight(type){return /pillar|bars/.test(type)?62:/shelf|locker|wardrobe|book/.test(type)?47:/machine|cabinet/.test(type)?43:/bed|bench|table|desk|counter/.test(type)?22:28;},
  ceilingAt(x,y,g=Game){if(g.lvl==='hospitalstreet')return Infinity;const tx=x/TILE,ty=y/TILE;if((Level.rooms||[]).some(r=>/jard[ií]n|patio|exterior|calle|invernadero/i.test(r.n||'')&&tx>=r.x&&tx<r.x+r.w&&ty>=r.y&&ty<r.y+r.h))return Infinity;return this.worldState?.ceilingHeight||62;},
  bodyHeight(e){const root=this.actors.get(e.id)?.root;if(root?.userData.height)return root.userData.height;const type=POVModels.identity(e);return /spider/.test(type)&&!/matriarch/.test(type)?13:/hound|scuttler/.test(type)?27:/moth/.test(type)?36:/wren/.test(type)?60+(e.phase||1)*14:/regent|carnicero|blind|keeper|guard/.test(type)?64:45;},
  fitActor(root,e,g){
    const height=root.userData.height,roof=this.ceilingAt(e.x,e.y,g),clearance=roof-(e.mode==='air'?16:1.5);
    if(Number.isFinite(roof)&&height>clearance&&clearance>20){root.scale.multiplyScalar(clearance/height);root.userData.height=clearance;}
    return root;
  },
  lineVisible(x,z,r=0){
    const p=Game.player,dx=x-p.x,dz=z-p.y,d=Math.hypot(dx,dz);if(d>1100)return false;
    if(d>r+70){const a=Math.atan2(dz,dx)-p.angle;if(Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))>1.25)return false;}
    // Solo ocultan muros y puertas; una mesa puede cubrir las piernas sin borrar la cabeza.
    for(const side of [0,-1,1]){const nx=d?(-dz/d*r*side):0,nz=d?(dx/d*r*side):0,steps=Math.ceil(d/14);let clear=true;
      for(let i=1;i<steps;i++){const tx=Math.floor((p.x+(dx+nx)*i/steps)/TILE),ty=Math.floor((p.y+(dz+nz)*i/steps)/TILE),v=Level.grid[ty]?.[tx];if(v===1||v===2||v===3||v===undefined){clear=false;break;}}
      if(clear)return true;
    }return false;
  },
  syncActors(g,time,dt){
    const present=new Set();let visible=0;
    const entities=[...g.enemies];if(g.custodio)entities.push({...g.custodio,id:'intro-custodio',type:'carnicero',isBoss:true,phase:1,def:{name:'El Custodio'}});
    for(const e of entities){const id=e.id,presentKey=[POVModels.identity(e),e.phase||1,!!e.enraged].join(':');present.add(id);let entry=this.actors.get(id);
      const shown=!e.dead&&!e.dormant&&this.lineVisible(e.x,e.y,(e.r||16)*1.5);
      if(!shown){if(entry)entry.root.visible=false;continue;}
      if(!entry||entry.key!==presentKey){if(entry)this.disposeObject(entry.root);const root=this.fitActor(POV3DAssets.enemy(e,g),e,g);root.userData.entityId=id;this.actorRoot.add(root);entry={root,key:presentKey};this.actors.set(id,entry);}
      entry.root.visible=true;entry.root.position.set(e.x,e.mode==='air'?15:0,e.y);entry.root.rotation.y=Math.PI/2-(e.face||0);POV3DAssets.animateEnemy(entry.root,e,g,time,dt);visible++;
    }
    for(const [id,e]of this.actors)if(!present.has(id)){this.disposeObject(e.root);this.actors.delete(id);}
    if(g.squad){if(!this.allies)this.allies=[];for(let i=0;i<g.squad.length;i++){const a=g.squad[i];if(!this.allies[i]){const m=POV3DAssets.ally?POV3DAssets.ally(a,g):POV3DAssets.enemy({type:'soldado',id:70000+i,def:{name:'Escuadrón'}},g);this.actorRoot.add(m);this.allies[i]=m;}const m=this.allies[i];m.visible=!a.dead&&this.lineVisible(a.x,a.y,24);m.position.set(a.x,0,a.y);m.rotation.y=Math.PI/2-(a.face??g.player.angle);if(m.visible)POV3DAssets.animateEnemy(m,a,g,time,dt);}}
    else if(this.allies){for(const a of this.allies)this.disposeObject(a);this.allies=null;}
    this.stats.visibleEnemies=visible;this.stats.actorModels=this.actors.size;
  },
  syncRemains(g,time,dt){
    // Los cuerpos, el señuelo mutante y las cadenas también pertenecen al mundo 3D.
    const present=new Set();let visible=0;
    for(let i=0;i<(g.bodies||[]).length;i++){
      const b=g.bodies[i];present.add(i);let root=this.remains.get(i);
      const shown=Math.hypot(b.x-g.player.x,b.y-g.player.y)<500&&this.lineVisible(b.x,b.y,22);
      if(!shown){if(root)root.visible=false;continue;}
      if(!root){
        const dead=g.enemies.find(e=>e.dead&&Math.hypot(e.x-b.x,e.y-b.y)<10),body=POV3DAssets.enemy(dead||{type:'sonambulo',id:i,phase:1,def:{}},g);
        root=new THREE.Group();root.add(body);body.rotation.x=-Math.PI/2;body.position.y=6;
        const rig=body.userData.rig;rig?.arms?.forEach((a,j)=>{a.rotation.x=.3+j*.3;a.rotation.z=j?-.25:.25;});
        this.actorRoot.add(root);this.remains.set(i,root);
      }
      root.visible=true;root.position.set(b.x,0,b.y);root.rotation.y=Math.PI/2-(b.a||0);visible++;
    }
    for(const [id,root]of this.remains)if(!present.has(id)){this.disposeObject(root);this.remains.delete(id);}
    const q=g.fleshEcho;
    if(q){
      if(!this.echo){this.echo=POV3DAssets.enemy({type:'sonambulo',id:'flesh-echo',def:{}},g);this.echo.traverse(o=>{if(o.isMesh)o.material=this.mat('#79648d',.68,.05,'#3c254f');});this.actorRoot.add(this.echo);}
      this.echo.visible=this.lineVisible(q.x,q.y,20);this.echo.position.set(q.x,0,q.y);this.echo.rotation.y=Math.PI/2-g.player.angle;
      POV3DAssets.animateEnemy(this.echo,q,g,time,dt);
    }else if(this.echo)this.echo.visible=false;
    this.stats.visibleBodies=visible;this.stats.echoVisible=!!this.echo?.visible;
  },
  syncItems(g,time,dt){
    const present=new Set();let visible=0;
    for(const it of g.items){const id=it.id;present.add(id);let entry=this.items.get(id);const shown=this.lineVisible(it.x,it.y,12);if(!shown){if(entry)entry.root.visible=false;continue;}
      const key=[it.type,it.part,it.weapon,it.key].join(':');if(!entry||entry.key!==key){if(entry)this.disposeObject(entry.root);const root=POV3DAssets.item(it,g);LootFeedback.decorate(root,it,g,this.kitAPI);this.itemRoot.add(root);entry={root,key};this.items.set(id,entry);}
      entry.root.visible=true;entry.root.position.set(it.x,0,it.y);POV3DAssets.animateItem(entry.root,it,g,time,dt);LootFeedback.animate(entry.root,it,g,time);visible++;
    }
    for(const [id,e]of this.items)if(!present.has(id)){this.disposeObject(e.root);this.items.delete(id);}
    this.stats.visibleItems=visible;
  },
  lights(g,time){
    const p=g.player,c=this.camera3D;this.flashlight.position.copy(c.position);this.flashlight.position.y-=2;
    this.flashlight.target.position.copy(c.position).addScaledVector(this.forward,300);this.flashlight.intensity=p.hidden?0:140;
    const lights=(this.worldState.lamps||[]).map(l=>({l,d:(l.x-p.x)**2+(l.z-p.y)**2})).filter(v=>v.d<650**2).sort((a,b)=>a.d-b.d);
    for(let i=0;i<this.localLights.length;i++){const light=this.localLights[i],source=lights[i]?.l;if(!source){light.intensity=0;continue;}light.position.set(source.x,source.y??54,source.z);light.color.set(source.color||'#c4d5d4');light.distance=source.distance||200;light.decay=source.decay||1.6;light.intensity=(source.intensity||26)*(source.flicker?(.87+.13*Math.sin(time*9+i*1.9)):1);}
  },
  cueStyle(css,alpha=1){
    let opacity=alpha,color=css||'#e0ba89';if(typeof color==='string'&&color.startsWith('rgba')){const v=color.match(/[\d.]+/g);if(v?.length>=4){opacity*=Number(v[3]);color='rgb('+v.slice(0,3).join(',')+')';}}
    if(/^#[\da-f]{8}$/i.test(color)){opacity*=parseInt(color.slice(7,9),16)/255;color=color.slice(0,7);}return {color,opacity:Math.max(.02,Math.min(.8,opacity))};
  },
  cuePolygon(points,fill,ctx){
    if(points.length<2||points.some(p=>!Number.isFinite(p[0])||!Number.isFinite(p[1])))return;const style=this.cueStyle(fill?ctx.fillStyle:ctx.strokeStyle,ctx.globalAlpha),key=style.color+'|'+style.opacity.toFixed(2);let b=this.cueBatches.get(key);
    if(!b){const geometry=new THREE.BufferGeometry(),material=new THREE.MeshBasicMaterial({color:style.color,transparent:true,opacity:style.opacity,depthWrite:false,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2});const mesh=new THREE.Mesh(geometry,material);mesh.frustumCulled=false;this.cueRoot.add(mesh);b={mesh,points:[]};this.cueBatches.set(key,b);}
    const add=(a,c,d)=>b.points.push(a[0],.35,a[1],c[0],.35,c[1],d[0],.35,d[1]);
    if(fill){for(let i=1;i<points.length-1;i++)add(points[0],points[i],points[i+1]);}
    else for(let i=1;i<points.length;i++){const a=points[i-1],c=points[i],dx=c[0]-a[0],dz=c[1]-a[1],len=Math.hypot(dx,dz)||1,w=Math.max(.35,Math.min(2,(ctx.lineWidth||1)*.35)),nx=-dz/len*w,nz=dx/len*w;const v=[[a[0]-nx,a[1]-nz],[a[0]+nx,a[1]+nz],[c[0]+nx,c[1]+nz],[c[0]-nx,c[1]-nz]];add(v[0],v[1],v[2]);add(v[0],v[2],v[3]);}
  },
  cues(g){
    for(const b of this.cueBatches.values())b.points.length=0;
    const proxy=Object.create(FirstPersonRenderer);proxy.current=g;proxy.groundPolygon=(points,fill)=>this.cuePolygon(points,fill,g.ctx);
    FirstPersonRenderer.cues.call(proxy,g);
    let count=0;for(const b of this.cueBatches.values()){b.mesh.visible=!!b.points.length;if(!b.mesh.visible)continue;const required=b.points.length;let attr=b.mesh.geometry.getAttribute('position');if(!attr||attr.array.length<required){attr=new THREE.BufferAttribute(new Float32Array(Math.ceil(Math.max(required,16384)/3)*3),3);b.mesh.geometry.setAttribute('position',attr);}attr.array.set(b.points);attr.needsUpdate=true;b.mesh.geometry.setDrawRange(0,required/3);count++;}
    this.stats.groundCues=count;
  },
  effects(g,time){
    const sources=[];for(const q of g.projectiles||[])sources.push({x:q.x,z:q.y,y:q.height??25,r:q.grenade?3:1.5,color:q.grenade?'#eec89a':'#ecdca4'});for(const q of g.eproj||[])sources.push({x:q.x,z:q.y,y:q.height??25,r:q.bullet?1.3:3,color:q.bullet?'#ffe3a5':'#91bb58'});
    for(const p of (g.particles||[]).slice(-90))sources.push({x:p.x,z:p.y,y:Math.max(1,18+(p.life||0)*7),r:Math.max(.25,Math.min(1.8,p.sz||.6)),color:p.c||'#b6c8d0'});
    for(let i=0;i<Math.min(150,sources.length);i++){const q=sources[i];let mesh=this.effectPool[i];if(!mesh){mesh=this.kitAPI.sphere(this.effectRoot,0,0,0,1,1,1,this.mat('#ffdf9b',.25,0,'#db9c47'));mesh.castShadow=false;this.effectPool.push(mesh);}mesh.visible=this.lineVisible(q.x,q.z,8);mesh.position.set(q.x,q.y,q.z);mesh.scale.setScalar(q.r);mesh.material=this.mat(q.color,.3,0,q.color);}
    for(let i=sources.length;i<this.effectPool.length;i++)this.effectPool[i].visible=false;
    if(!this.tracePool)this.tracePool=[];
    for(let i=0;i<(g.tracers||[]).length;i++){const t=g.tracers[i];let m=this.tracePool[i];if(!m){m=this.mesh(this.effectRoot,this.geometry('rod',()=>new THREE.CylinderGeometry(1,1,1,10)),new THREE.MeshBasicMaterial({color:'#e9cb94',transparent:true,opacity:.75}));m.castShadow=false;this.tracePool.push(m);}const a=new THREE.Vector3(t.x1,t.height1??this.eyeHeight,t.y1),b=new THREE.Vector3(t.x2,t.height2??this.eyeHeight,t.y2),d=b.clone().sub(a);m.visible=true;m.position.copy(a.add(b).multiplyScalar(.5));m.scale.set(.075,Math.max(.01,d.length()),.075);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}
    for(let i=(g.tracers||[]).length;i<this.tracePool.length;i++)this.tracePool[i].visible=false;
    this.chains(g);this.flames(g,time);this.helicopter(g,time);
  },
  chains(g){
    if(!this.chainPool)this.chainPool=[];let used=0;
    for(const e of g.enemies)for(const h of e.dead?[]:e.hooks||[]){
      let entry=this.chainPool[used++];
      if(!entry){const root=new THREE.Group(),steel=this.mat('#b0b7af',.37,.8),rope=this.kitAPI.rod(root,[0,0,0],[0,1,0],.34,steel),head=new THREE.Group();root.add(head);this.kitAPI.rod(head,[-2,-1,0],[0,2,0],.65,steel);this.kitAPI.rod(head,[0,2,0],[2,0,0],.65,steel);this.kitAPI.rod(head,[2,0,0],[1,-2,0],.55,steel);this.effectRoot.add(root);entry={root,rope,head};this.chainPool.push(entry);}
      const a=new THREE.Vector3(e.x,30,e.y),b=new THREE.Vector3(h.x,19,h.y),delta=b.clone().sub(a);entry.root.visible=true;entry.rope.position.copy(a.add(b).multiplyScalar(.5));entry.rope.scale.set(.34,Math.max(.01,delta.length()),.34);entry.rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());entry.head.position.copy(b);entry.head.rotation.y=Math.atan2(h.vx||0,h.vy||0);
    }
    for(let i=used;i<this.chainPool.length;i++)this.chainPool[i].root.visible=false;
    this.stats.visibleHooks=used;
  },
  flames(g,time){
    if(!this.flamePool)this.flamePool=[];const points=[];
    for(const j of (g.flameJets||[]).slice(-12))for(let i=1;i<=5;i++){const f=i/5;points.push({x:j.x+Math.cos(j.a)*j.reach*f,z:j.y+Math.sin(j.a)*j.reach*f,y:27+Math.sin(time*19+j.seed*9+i)*3,r:(2+f*6)*(j.life/j.max),color:i%2?'#de7d34':'#facb72'});}
    for(let i=0;i<points.length;i++){const q=points[i];let m=this.flamePool[i];if(!m){m=this.kitAPI.sphere(this.effectRoot,0,0,0,1,1,1,new THREE.MeshBasicMaterial({color:'#f7bb58',transparent:true,opacity:.6,depthWrite:false,blending:THREE.AdditiveBlending}));m.castShadow=false;this.flamePool.push(m);}m.visible=true;m.position.set(q.x,q.y,q.z);m.scale.set(q.r,q.r*.8,q.r);m.material.color.set(q.color);}
    for(let i=points.length;i<this.flamePool.length;i++)this.flamePool[i].visible=false;
  },
  helicopter(g,time){
    const s=g.story.endgame?.street,shown=g.lvl==='hospitalstreet'&&s?.active;
    if(!shown){if(this.aircraft)this.aircraft.visible=false;return;}
    if(!this.aircraft){const k=this.kitAPI,root=new THREE.Group(),steel=this.mat('#627077',.45,.6),glass=this.mat('#17313e',.2,.55);k.sphere(root,0,0,0,19,12,30,steel);k.sphere(root,0,2,-18,14,9,17,glass);k.rod(root,[0,3,20],[0,9,69],4,steel);k.box(root,0,16,68,3,18,12,steel);for(const sign of [-1,1]){k.rod(root,[sign*12,-4,-10],[sign*18,-17,-10],1.3,steel);k.rod(root,[sign*13,-3,17],[sign*18,-17,17],1.3,steel);k.rod(root,[sign*18,-17,-25],[sign*18,-17,28],1.5,steel);}const rotor=new THREE.Group();rotor.position.y=17;root.add(rotor);k.rod(root,[0,8,0],[0,17,0],2,steel);k.box(rotor,0,0,0,110,1.1,3,steel);k.box(rotor,0,0,0,3,1.1,110,steel);root.userData.rotor=rotor;this.scene.add(root);this.aircraft=root;}
    const t=s.elapsed||0,base=s.start||[32.5*TILE,29.5*TILE];this.aircraft.visible=true;this.aircraft.position.set(base[0]+Math.max(0,3-t)*180,82,base[1]-190-Math.max(0,3-t)*80);this.aircraft.userData.rotor.rotation.y=time*24;
  },
  project(x,z,height=0,g=Game){const v=this.vector.set(x,height,z).project(this.camera3D),dx=x-g.player.x,dz=z-g.player.y,depth=dx*Math.cos(g.player.angle)+dz*Math.sin(g.player.angle);return {x:(v.x*.5+.5)*g.cv.width,y:(-v.y*.5+.5)*g.cv.height,depth,visible:v.z>-1&&v.z<1&&Math.abs(v.x)<1.2&&Math.abs(v.y)<1.3};},
  overlay(g){
    const c=g.ctx,legacy=FirstPersonRenderer;legacy.W=g.cv.width;legacy.H=g.cv.height;legacy.current=g;legacy.camera={x:g.player.x,y:g.player.y,cos:Math.cos(g.player.angle),sin:Math.sin(g.player.angle),eye:35};legacy.stats=this.stats;
    const draw=POVArt.drawWeapon;POVArt.drawWeapon=()=>{};try{legacy.overlay(g);}finally{POVArt.drawWeapon=draw;}
    if(g.player.sense>0){c.save();c.strokeStyle='#bca1d28c';c.lineWidth=1.5;for(const e of g.enemies){if(e.dead||e.dormant||Math.hypot(e.x-g.player.x,e.y-g.player.y)>280)continue;const s=this.project(e.x,e.y,this.bodyHeight(e)*.5,g);if(!s.visible||s.depth<4)continue;const scale=Math.min(2,90/s.depth);c.beginPath();c.ellipse(s.x,s.y,13*scale,25*scale,0,0,Math.PI*2);c.stroke();}c.restore();}
    legacy.introGuide(g);legacy.hud(g);
    const near=g.nearItem();if(near&&this.lineVisible(near.x,near.y,4)){const s=this.project(near.x,near.y,/stairs|finish|down|return/.test(near.type)?40:18,g);if(s.visible){c.save();c.textAlign='center';c.font='600 '+Math.max(14,g.cv.height/53)+'px Rajdhani,sans-serif';c.fillStyle='#e6e9d6';c.shadowBlur=8;c.shadowColor='#02060a';c.fillText('[E] '+itemLabel(near),s.x,Math.max(32,s.y-16));c.restore();}}
  },
  render(g){
    if(['menu','menuOptions'].includes(g.state)){this.hide(g);return true;}
    if(!this.init(g))return false;if(this.contextLost)return true;
    this.rendering=true;try{
      this.resize(g);this.canvas.style.display='block';this.visible=true;document.body.classList.add('pov3d-active');
      HorrorVision.prepare(g);
      if(this.levelGrid!==Level.grid||this.level!==g.lvl)this.rebuild(g);
      const time=g.t||0,dt=Math.min(.1,Math.max(0,time-this.lastTime));this.lastTime=time;const p=g.player,pitch=-(FirstPerson.pitch||0),bob=MenuScene.motionReduced()?0:Math.sin(p.walkT||0)*(p.running?.4:.16);
      this.camera3D.position.set(p.x,35+bob,p.y);this.forward.set(Math.cos(p.angle)*Math.cos(pitch),Math.sin(pitch),Math.sin(p.angle)*Math.cos(pitch));this.camera3D.lookAt(this.camera3D.position.clone().add(this.forward));this.camera3D.updateMatrixWorld();
      POV3DWorld.update(this.worldState,g,time,dt);this.syncActors(g,time,dt);this.syncRemains(g,time,dt);this.syncItems(g,time,dt);this.lights(g,time);this.cues(g);this.effects(g,time);
      for(const p of this.props)p.root.visible=(!p.barrel||!p.barrel.dead)&&this.lineVisible(p.x,p.z,20);
      this.renderer.info.reset();this.renderer.clear();this.renderer.render(this.scene,this.camera3D);
      if(typeof POV3DViewmodel!=='undefined')POV3DViewmodel.render(this,g,time,dt);
      g.ctx.clearRect(0,0,g.cv.width,g.cv.height);this.overlay(g);
      this.stats.drawCalls=this.renderer.info.render.calls;this.stats.triangles=this.renderer.info.render.triangles;this.stats.pixelWidth=this.canvas.width;this.stats.pixelHeight=this.canvas.height;this.stats.spriteCount=0;this.stats.telegraphCount=this.stats.groundCues;this.stats.renderer='Three.js / WebGL';this.frame++;
      return true;
    }finally{this.rendering=false;}
  }
};
(()=>{
  const render=Game.render;Game.render=function(){
    if(FirstPerson.active(this)){
      if(POV3DRenderer.render(this))return;
      if(typeof HTMLCanvasElement!=='undefined'&&POV3DRenderer.failed)FirstPerson.setEnabled(false);
    }else POV3DRenderer.hide(this);
    return render.call(this);
  };
})();
