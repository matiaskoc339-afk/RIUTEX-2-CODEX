"""Escena WebGL real, profundidad, arquitectura y actores; fixtures preparados, sin medir dificultad."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[];console_errors=[];maps=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader','--enable-webgl'])
 page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('console',lambda msg:console_errors.append(msg.text) if msg.type=='error' and '404' not in msg.text else None)
 page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
 page.goto(url);page.click('#bNew');page.evaluate("Game.loop=()=>{};Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);FirstPerson.setEnabled(true);Game.keys={};Game.player.hidden=false;Game.player.hurtFlash=0;Game.render()")
 check('Primera persona inicia WebGL con geometría real y sin billboards',page.evaluate("POV3DRenderer.ready&&!POV3DRenderer.failed&&POV3DRenderer.stats.realMeshes&&POV3DRenderer.stats.billboards===0&&POV3DRenderer.renderer.getContext() instanceof WebGL2RenderingContext"))
 check('El mundo y la mira se presentan a resolución de pantalla',page.evaluate("POV3DRenderer.canvas.width===1280&&POV3DRenderer.canvas.height===800&&Game.cv.width===1280&&Game.cv.height===800"))
 check('El lienzo de juego recibe el ratón y el de WebGL permite el paso',page.evaluate("getComputedStyle(POV3DRenderer.canvas).pointerEvents==='none'&&getComputedStyle(Game.cv).display!=='none'"))
 page.evaluate("window.meshQA={stats(root){let meshes=0,sprites=0,invalid=0,standard=0;root.updateMatrixWorld(true);root.traverse(o=>{if(o.isSprite)sprites++;if(o.isMesh){meshes++;if(o.material.isMeshStandardMaterial)standard++;const a=o.geometry.attributes.position;if(a&&!Array.from(a.array).every(Number.isFinite))invalid++;}if(!o.matrixWorld.elements.every(Number.isFinite))invalid++;});return {meshes,sprites,invalid,standard};}, flat(){const g=Game;g.carn=g.custodio=null;g.squad=null;g.enemies=[];g.items=[];g.barrels=[];g.bodies=[];g.fleshEcho=null;g.rings=[];g.particles=[];g.tracers=[];g.eproj=[];g.projectiles=[];g.pools=[];g.flameJets=[];g.lvl='hospital';Level.W=24;Level.H=20;Level.grid=Array.from({length:20},(_,y)=>Array.from({length:24},(_,x)=>!x||!y||x===23||y===19?1:0));Level.rooms=[];Level.props={};Level.lamps=[];Level.doors=[];Level.safeRects=[];g.player.x=5.5*TILE;g.player.y=10.5*TILE;g.player.angle=0;g.player.hp=g.player.maxHp;FirstPerson.pitch=0;g.state='play';UI.screen(null);POV3DRenderer.levelGrid=null;}}")
 level_ids=['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']
 for level in level_ids:
  info=page.evaluate("level=>{Game.buildLevel(level,null);Game.state='play';Game.player.hidden=false;Game.render();const s=POV3DRenderer.worldState;return {...meshQA.stats(POV3DRenderer.world),level,ceiling:s.ceilingHeight,doors:s.doors.size,expectedDoors:Level.doors.length,textures:s.textures.length,props:POV3DRenderer.props.length,drawCalls:POV3DRenderer.stats.drawCalls,theme:s.theme};}",level);maps.append(info)
  check(level+': arquitectura, puertas y superficies finitas',info['meshes']>0 and info['invalid']==0 and info['sprites']==0 and info['doors']==info['expectedDoors'] and info['textures']>=9)
 check('Las arenas de jefes tienen altura suficiente para las mutaciones',all(m['ceiling']>=92 for m in maps if m['level'] in ['hospitalchem','hospitalnest','hospitalroyal','hospitalorigin']))
 page.evaluate("Hospital.goto(Game,'hospital');Game.state='play';Game.player.hidden=false;Game.render()")
 door=page.evaluate("(()=>{const s=POV3DRenderer.worldState,d=[...s.doors.values()][0];d.door.open=false;for(let i=0;i<25;i++)POV3DWorld.update(s,Game,i*.1,.1);const closed=[d.left.position.x,d.right.position.x];d.door.open=true;for(let i=0;i<25;i++)POV3DWorld.update(s,Game,3+i*.1,.1);return {closed,open:[d.left.position.x,d.right.position.x],progress:d.progress,meshes:meshQA.stats(d.group).meshes,span:d.span};})()")
 check('Las puertas tienen marco, manijas y hojas que se apartan físicamente',door['meshes']>=20 and door['progress']==1 and door['open'][0]<door['closed'][0]-5 and door['open'][1]>door['closed'][1]+5)
 # Fixture explícito para probar oclusión y detección a través de una puerta operada con E.
 page.evaluate("meshQA.flat();Game.player.x=272;Game.player.y=336;Game.player.angle=Math.PI;Level.doors=[{id:'qa_door',tiles:[[7,10]],open:false,key:null}];Level.grid[10][7]=2;window.qaEnemy=new Enemy('sonambulo',208,336,99199);qaEnemy.face=0;Game.enemies=[qaEnemy];qaEnemy.update(.2,Game);Game.render()")
 check('La puerta cerrada bloquea la visión del enemigo de enfrente',page.evaluate('!qaEnemy.alert&&POV3DRenderer.stats.visibleEnemies===0'))
 page.keyboard.press('e');page.evaluate('qaEnemy.update(.2,Game);Game.render()')
 check('Abrir con E permite detectar al jugador directamente enfrente',page.evaluate('Level.doors[0].open&&qaEnemy.alert&&POV3DRenderer.stats.visibleEnemies===1'))
 page.evaluate("meshQA.flat();Level.grid[10][8]=1;Game.enemies=[new Enemy('sonambulo',10.5*TILE,10.5*TILE,10001)];Game.items=[{type:'sample',id:'depthitem',x:10.5*TILE,y:10.5*TILE}];Game.render()")
 check('Muros sólidos ocultan enemigos y objetos por profundidad',page.evaluate('POV3DRenderer.stats.visibleEnemies===0&&POV3DRenderer.stats.visibleItems===0'))
 page.evaluate('Level.grid[10][8]=0;POV3DRenderer.levelGrid=null;Game.render()')
 check('La misma escena descubre volúmenes al retirar la pared',page.evaluate('POV3DRenderer.stats.visibleEnemies===1&&POV3DRenderer.stats.visibleItems===1'))
 check('Los objetos recogibles llevan halo y brillo físico sin luces que iluminen la sala',page.evaluate("(()=>{const root=POV3DRenderer.items.get('depthitem').root,b=root.userData.pickupBeacon;return b.marker.visible&&b.ring.isMesh&&b.glint.isMesh&&b.ring.material.depthTest&&!root.children.some(o=>o.isLight);})()"))
 check('La señal de recogida desaparece al recoger el objeto',page.evaluate("Game.take(Game.items[0]);Game.render();!POV3DRenderer.items.has('depthitem')"))
 check('Disparar no crea destello ni aumenta la luz del escenario o las manos',page.evaluate("(()=>{Game.player.flash=0;POV3DRenderer.lights(Game,Game.t);const before=POV3DRenderer.flashlight.intensity;Game.player.flash=.06;Game.render();let flashLights=0;POV3DViewmodel.scene.traverse(o=>{if(o.isPointLight)flashLights++;});return before===POV3DRenderer.flashlight.intensity&&flashLights===0&&!POV3DRenderer.muzzleLight;})()"))
 page.evaluate("Game.bodies=[{x:Game.player.x+80,y:Game.player.y,a:0}];Game.fleshEcho={x:Game.player.x+110,y:Game.player.y+15,life:4};Game.enemies[0].hooks=[{x:Game.player.x+70,y:Game.player.y+20,vx:1,vy:0}];Game.render()")
 check('Cadáveres, eco mutante y cadenas conservan volumen físico',page.evaluate('POV3DRenderer.stats.visibleBodies===1&&POV3DRenderer.stats.echoVisible&&POV3DRenderer.stats.visibleHooks===1&&meshQA.stats(POV3DRenderer.scene).invalid===0'))
 page.evaluate('Game.bodies=[];Game.fleshEcho=null;Game.enemies[0].hooks=[]')
 models=page.evaluate("(()=>{const out=[];for(const [type,def]of Object.entries(ENEMY_TYPES)){const e={type,def,id:10,phase:1,x:0,y:0,face:0,mode:'idle'},r=POV3DAssets.enemy(e,Game),s=meshQA.stats(r);POV3DAssets.animateEnemy(r,e,Game,1,.016);const b=r.userData.rig?.body,first=b?.position.y;POV3DAssets.animateEnemy(r,e,Game,1.3,.016);out.push({type,...s,height:r.userData.height,animated:b?first!==b.position.y:true});POV3DRenderer.disposeObject(r);}return out;})()")
 check('Todas las especies usan mallas físicas sin imágenes planas',len(models)>=35 and all(m['meshes']>=4 and m['invalid']==0 and m['sprites']==0 and m['standard']==m['meshes'] for m in models))
 check('Los rigs tienen respiración y movimiento articulado',all(m['animated'] for m in models))
 bosses=page.evaluate("(()=>{const out=[];for(const type of ['carnicero','ds_matriarch','cl_regent','lf_wren'])for(const phase of [1,2,3]){const r=POV3DAssets.enemy({type,phase,id:1,def:ENEMY_TYPES[type]||{name:type}},Game);out.push({type,phase,height:r.userData.height,...meshQA.stats(r)});POV3DRenderer.disposeObject(r);}return out;})()")
 for boss in ['carnicero','ds_matriarch','cl_regent','lf_wren']:
  rows=[r for r in bosses if r['type']==boss]
  check(boss+': tres mutaciones volumétricas progresivas',rows[2]['meshes']>rows[0]['meshes'] and rows[2]['height']>=rows[0]['height'] and all(r['invalid']==0 for r in rows))
 props=page.evaluate("(()=>{const out=[];for(const type of ['h_stairs','ds_finish','cl_finish','lf_return','savebed','doc','sample','key','pistol','ammo','inj_green','screw_small','wx_part','h_workbench']){const r=POV3DAssets.item({type,id:type,part:'wx_cell'},Game);out.push({type,...meshQA.stats(r),stairs:r.userData.modelIdentifier==='stairs',arrow:!!r.userData.arrow,marker:r.userData.markerHeight});POV3DRenderer.disposeObject(r);}return out;})()")
 check('Los objetos del suelo y estaciones poseen volumen propio',all(p['meshes']>=2 and p['sprites']==0 and p['invalid']==0 for p in props))
 check('Las escaleras tienen peldaños, pasamanos y señal tridimensional visible',all(p['stairs'] and p['arrow'] and p['marker']>=40 for p in props[:4]))
 page.evaluate("meshQA.flat();Game.render()")
 camera=[]
 for pitch in [-1.4,0,1.4]:
  info=page.evaluate("pitch=>{FirstPerson.pitch=pitch;Game.render();const v=new THREE.Vector3();POV3DRenderer.camera3D.getWorldDirection(v);return {pitch,vertical:v.y,aim:POV3DRenderer.stats.crosshair,width:Game.cv.width,height:Game.cv.height,invalid:meshQA.stats(POV3DRenderer.scene).invalid};}",pitch);camera.append(info)
  check('Cámara y mira correctas a inclinación '+str(pitch),info['invalid']==0 and info['aim']['x']==info['width']/2 and info['aim']['y']==info['height']/2)
 check('La cámara mira arriba al subir el ratón y abajo al bajarlo',camera[0]['vertical']>.98 and camera[2]['vertical']<-.98)
 roof=page.evaluate("(()=>{const s=POV3DRenderer.worldState,p=Game.player,ray=new THREE.Raycaster(new THREE.Vector3(p.x,35,p.y),new THREE.Vector3(0,1,0));POV3DRenderer.world.updateMatrixWorld(true);const hit=ray.intersectObject(POV3DRenderer.world,true)[0];return {height:s.ceilingHeight,y:hit?.point.y};})()")
 check('El techo es una superficie física continua sobre el jugador',roof.get('y') is not None and abs(roof['y']-roof['height'])<1)
 hands=[]
 for label,story in [('human',{'armHealed':False,'armCut':False,'riutexUsed':0,'endgame':None}),('infected',{'armHealed':True,'armCut':False,'riutexUsed':1,'endgame':None}),('missing',{'armHealed':False,'armCut':True,'riutexUsed':0,'endgame':None}),('cure',{'armHealed':True,'armCut':False,'riutexUsed':1,'endgame':{'choice':'cure'}}),('mutant',{'armHealed':True,'armCut':False,'riutexUsed':1,'endgame':{'choice':'mutant'}})]:
  row=page.evaluate("([label,story])=>{Object.assign(Game.story,story);Game.player.slash=0;Game.player.blade=0;Game.player.predator=0;Game.player.weapon=null;FirstPerson.pitch=0;Game.render();return {label,hands:POV3DRenderer.stats.hands,infected:POV3DRenderer.stats.armInfected,...meshQA.stats(POV3DViewmodel.scene)};}",[label,story]);hands.append(row)
 check('Dos extremidades reales, sin manos extra durante la infección',hands[0]['hands']==2 and hands[1]['hands']==2 and hands[1]['infected'])
 check('La amputación y la cura retiran la mano regenerada',hands[2]['hands']==1 and hands[3]['hands']==1 and not hands[3]['infected'])
 check('El final mutante conserva dos brazos transformados',hands[4]['hands']==2 and hands[4]['infected'])
 weapons=page.evaluate("(()=>{Game.story.endgame=null;Game.story.armHealed=true;Game.story.riutexUsed=1;const out=[];for(const id of ['pistol','shotgun','viper','ak','r98','flamethrower','gl6']){Game.inv.items=[];Game.player.weapon=null;Game.giveWeapon(id,20,true);Game.player.weapon=Game.player.weapons[id];Game.render();const m=POV3DViewmodel.weaponMesh;out.push({id,actual:POV3DRenderer.stats.weapon3D,hands:POV3DRenderer.stats.hands,verts:m.children[0].geometry.attributes.position.count,invalid:meshQA.stats(m).invalid});}Game.player.slash=.075;Game.render();return {weapons:out,strikeHands:POV3DRenderer.stats.hands};})()")
 check('Siete armas se sostienen como mallas tridimensionales',all(w['actual']==w['id'] and w['verts']>=100 and w['hands']==2 and w['invalid']==0 for w in weapons['weapons']))
 check('El golpe anima el brazo existente y conserva dos manos',weapons['strikeHands']==2)
 captured=page.evaluate("(()=>{const draw=CanvasRenderingContext2D.prototype.drawImage,ids=[];CanvasRenderingContext2D.prototype.drawImage=function(source,...args){ids.push(source.id);return draw.call(this,source,...args);};try{SceneTransitions.enabled=true;SceneTransitions.run(Game,()=>{},'QA');return ids.includes('pov3dCanvas');}finally{CanvasRenderingContext2D.prototype.drawImage=draw;SceneTransitions.finish();SceneTransitions.enabled=false;}})()")
 check('Los fundidos capturan la escena WebGL junto con la mira',captured)
 page.evaluate("Hospital.goto(Game,'hospital');Game.state='play';Game.enemies=[];Game.carn=Game.custodio=null;Game.player.x=52.5*TILE;Game.player.y=28.5*TILE;Game.player.angle=-Math.PI/2;Game.player.hurtFlash=0;Game.player.poison=0;Game.player.slash=0;Game.inv.items=[];Game.player.weapon=null;Game.giveWeapon('pistol',12,true);Game.player.weapon=Game.player.weapons.pistol;FirstPerson.pitch=.03;Game.update(0);Game.render()")
 page.screenshot(path=str(ROOT/'artifacts/pov3d-hospital-v020.png'))
 page.evaluate("FirstPerson.setEnabled(false);Game.render()")
 check('Regresar a topdown restaura el lienzo clásico sin superponer WebGL',page.evaluate("!FirstPerson.enabled&&!POV3DRenderer.visible&&getComputedStyle(POV3DRenderer.canvas).display==='none'&&Game.cv.width===Math.ceil(innerWidth/1.35)"))
 check('Sin errores JavaScript ni geometrías NaN en WebGL',not errors and not console_errors)
 (ROOT/'artifacts/pov3d-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'console_errors':console_errors,'maps':maps,'models':models,'bosses':bosses,'items':props,'camera':camera,'hands':hands,'weapons':weapons,'scope':'Chromium real con WebGL 2 mediante SwiftShader; fixtures controlados de 15 mapas, puerta operada con E, paredes y techos físicos, mallas articuladas, armas, estados narrativos, captura de transición y regreso a topdown. No simula una partida completa ni mide dificultad o rendimiento de GPU física.'},ensure_ascii=False,indent=2)+'\n')
 browser.close()
