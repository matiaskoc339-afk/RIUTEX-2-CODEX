"""Arquitectura por sectores, rótulos y luces de sala en mapas reales (Chromium/SwiftShader)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1]
passed=[];errors=[];maps=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
 page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(url)
 page.evaluate("""Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish();Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);FirstPerson.setEnabled(true);Game.enemies=[];Game.carn=Game.custodio=null;Game.player.hp=100;Game.player.hurtFlash=Game.player.poison=0;Game.particles=[];Game.keys={};Game.t=20;""")
 for level in ['hospital','hospitalworks','hospitalcastle','hospitalumbra']:
  info=page.evaluate("""level=>{Game.buildLevel(level,null);Game.state='play';Game.enemies=[];Game.carn=Game.custodio=null;Game.player.hurtFlash=0;Game.particles=[];Game.render();const state=POV3DRenderer.worldState;return {...POV3DRenderer.stats,level,instances:state.staticBatches.reduce((n,m)=>n+m.count,0),chunks:state.staticBatches.length,labels:state.signs.map(s=>s.userData.roomLabel),finite:state.staticBatches.every(m=>Number.isFinite(m.boundingSphere.radius)),allocated:state.staticBatches.every(m=>state.resources.includes(m))};}""",level)
  maps.append(info);print('GEOMETRY',level,info['triangles'],flush=True)
  check(level+': sectores finitos conservan todas las instancias',info['chunks']>20 and info['instances']>1000 and info['finite'] and info['allocated'])
  check(level+': rótulos legibles pertenecen a las habitaciones del mapa',len(info['labels'])>=8 and all(bool(label) for label in info['labels']))
  # Presupuesto geométrico de la vista de entrada real; no implica medir FPS de una GPU física.
  check(level+': la cámara de entrada no envía el mapa completo a la GPU',info['triangles']<{'hospital':190176,'hospitalworks':256432,'hospitalcastle':261342,'hospitalumbra':416444}[level]*.75)
 page.evaluate("""Hospital.goto(Game,'hospital');Game.state='play';Game.enemies=[];Game.carn=Game.custodio=null;Game.player.x=52.5*TILE;Game.player.y=28.5*TILE;Game.player.angle=-Math.PI/2;Game.player.hp=100;Game.player.hurtFlash=Game.player.poison=0;Game.particles=[];FirstPerson.pitch=.03;Game.t=20;Game.update(0);Game.render();""")
 page.screenshot(path=str(ROOT/'artifacts/world-hospital-v025-after.png'))
 labels=page.evaluate("""(()=>{const s=POV3DRenderer.worldState,d=[...s.doors.values()].find(d=>s.signs.some(sign=>sign.parent===d.group));const sign=s.signs.find(sign=>sign.parent===d.group);return {label:sign.userData.roomLabel,plane:sign.isMesh&&!sign.isSprite,physical:d.group.children.some(c=>c.isMesh&&c.geometry.type==='BoxGeometry'),face:sign.position.z};})()""")
 check('Los rótulos son superficies fijadas al marco, sin billboards',labels['plane'] and labels['physical'] and abs(labels['face'])>4)
 preserved=page.evaluate("""(()=>{const old=POV3DRenderer.worldState;let freed=0;for(const b of old.staticBatches)b.addEventListener('dispose',()=>freed++);const expected=old.staticBatches.length;Game.buildLevel('hospitalworks',null);Game.state='play';Game.render();return {freed,expected};})()""")
 check('Cambiar de zona libera los buffers instanciados del mapa anterior',preserved['expected']>20 and preserved['freed']==preserved['expected'])
 light=page.evaluate("""(()=>{const r=POV3DRenderer,p={x:176,y:176},lamp={x:336,z:176};const original=Level.grid;try{Level.grid=Array.from({length:20},()=>Array(20).fill(0));const open=r.lampVisible(lamp,p);Level.grid[5][8]=2;const closed=r.lampVisible(lamp,p);Level.grid[5][8]=1;const wall=r.lampVisible(lamp,p);return {open,closed,wall};}finally{Level.grid=original;}})()""")
 check('La iluminación de otra sala respeta puertas y paredes',light['open'] and not light['closed'] and not light['wall'])
 page.evaluate('FirstPerson.setEnabled(false);Game.render()')
 check('La vista clásica conserva su render y oculta el mundo WebGL',page.evaluate("!POV3DRenderer.visible&&getComputedStyle(POV3DRenderer.canvas).display==='none'"))
 check('Sin errores JavaScript en cambios entre las cuatro regiones',not errors)
 (ROOT/'artifacts/pov-world-polish-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'maps':maps,'scope':'Mapas reales y cámaras de entrada preparadas en Chromium con SwiftShader: sectores con culling, menor geometría enviada, buffers liberados, rótulos físicos y luces que no cruzan puertas/muros. No mide FPS de una GPU física ni una campaña humana.'},ensure_ascii=False,indent=2)+'\n')
 browser.close()
