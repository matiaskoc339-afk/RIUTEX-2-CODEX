"""Llaves por E, ficha de Artefactos y documentos narrativos nuevos en navegador real."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game
ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader']);page=b.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
 page.goto(url)
 if page.evaluate("typeof ArtifactLifecycle==='undefined'"):page.add_script_tag(content=(ROOT/'js/artifacts-lore.js').read_text())
 start_new_game(page)
 page.evaluate("""Game.loop=()=>{};Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;Game.inv.keys=['archivo'];
 window.atDoor=id=>{const d=Level.doors.find(d=>d.id===id),[x,y]=d.tiles[0];for(const[dx,dy]of [[0,1],[0,-1],[1,0],[-1,0]])if(Level.grid[y+dy]?.[x+dx]===0){Game.player.x=(x+dx+.5)*32;Game.player.y=(y+dy+.5)*32;break;}Game.items=Game.items.filter(i=>Math.hypot(i.x-Game.player.x,i.y-Game.player.y)>64);};atDoor('arch');""")
 page.keyboard.press('e')
 check('E abre Archivo y retira su llave utilizada',page.evaluate("Level.doors.find(d=>d.id==='arch').open&&!Game.inv.keys.includes('archivo')"))
 page.keyboard.press('Tab');page.click('[data-desk="artifacts"]')
 check('Artefactos no muestra la llave consumida ni una selección obsoleta',page.locator('#artifactList .artifact-entry').count()==0 and page.evaluate('FieldDesk.artifact===undefined||FieldDesk.artifact===null'))
 page.evaluate("Game.resume();Level.closeDoor(Level.doors.find(d=>d.id==='arch'),true);Game.save(0)")
 page.reload()
 if page.evaluate("typeof ArtifactLifecycle==='undefined'"):page.add_script_tag(content=(ROOT/'js/artifacts-lore.js').read_text())
 page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish();Game.loop=()=>{}')
 page.click('#bCont');page.locator('.save-slot').first.click()
 check('Cerrar y cargar conserva el desbloqueo sin devolver la llave',page.evaluate("!Game.inv.keys.includes('archivo')&&Level.doors.find(d=>d.id==='arch').key===null&&!Level.doors.find(d=>d.id==='arch').open"))
 page.evaluate("Game.inv.keys=['morgue'];Level.openDoor(Level.doors.find(d=>d.id==='mor'));FieldDesk.open(Game,'artifacts')")
 check('Una llave compartida explica que todavía abre otros accesos',page.evaluate("Game.inv.keys.includes('morgue')") and page.locator('#artifactDetail .artifact-remaining').count()==1)
 page.evaluate("Game.resume();Level.openDoor(Level.doors.find(d=>d.id==='garden_link'));FieldDesk.open(Game,'artifacts')")
 check('Usar el último cierre retira también la llave compartida',page.locator('#artifactList .artifact-entry').count()==0 and page.evaluate("!Game.inv.keys.includes('morgue')"))
 for pov in [False,True]:
  page.evaluate("""pov=>{Game.resume();Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;FirstPerson.setEnabled(pov);const it=Game.items.find(i=>i.doc==='lore20_05');Game.player.x=it.x;Game.player.y=it.y;Game.player.xp=0;}""",pov)
  page.keyboard.press('e')
  label='POV' if pov else 'Topdown'
  check(label+': E abre el nuevo documento narrativo con texto completo',page.locator('#doc').is_visible() and 'Turno de noche' in page.locator('#docT').inner_text() and 'observación clínica' in page.locator('#docB').inner_text())
  check(label+': el documento da solamente los 2 XP habituales',page.evaluate('Game.player.xp===2'))
  page.click('#bDocClose');page.evaluate("Game.openDoc('lore20_05')")
  check(label+': releer no vuelve a conceder XP',page.evaluate('Game.player.xp===2'))
 check('Los 24 documentos están clasificados como historia, sin soluciones de puzles',page.evaluate("R2LoreArchive.documents.length===24&&R2LoreArchive.documents.every(d=>DOCS[d.id].lore&&!CLUES.has(d.id))"))
 check('Sin errores JavaScript',not errors)
 (ROOT/'artifacts/artifacts-lore-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'scope':'Acceso preparado con E, Artefactos y carga manual real; documento nuevo por E en ambos modos. No es un recorrido completo de las misiones.'},ensure_ascii=False,indent=2)+'\n')
 b.close()
