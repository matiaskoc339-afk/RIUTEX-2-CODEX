"""Navegador real: introducción recorrida con colisiones, controles y minijuegos.
La segunda mitad usa posiciones controladas para comprobar menús/guardado; no mide dificultad.
"""
from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1]
RESULT=[]
def record(name,value):
 assert value,name
 RESULT.append(name)
 print('PASS',name,flush=True)
with local_server(ROOT) as base_url, sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 errors=[];missing=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
 page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(base_url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
 page.screenshot(path=str(ROOT/'artifacts/blue-menu.png'))
 page.click('#bNew');page.wait_for_timeout(100)
 page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()')
 page.wait_for_timeout(60)
 page.evaluate((ROOT/'tests/walker.js').read_text())
 record('Inicio jugable y cámara del jugador',page.evaluate("Game.lvl==='mansion'&&Game.state==='play'&&Math.abs(Game.player.x-Game.cam.x-Game.cv.width/2)<4"))
 # La biblioteca se alcanza caminando por suelo y puertas reales, sin cambiar posiciones.
 print('biblioteca',page.evaluate("qa.take('m2');({hp:Game.player.hp,state:Game.state})"),flush=True)
 record('Prólogo guiado: biblioteca antes del comedor',page.evaluate("Game.inv.docs.includes('m2')&&Game.pz['h:briefing']"))
 page.screenshot(path=str(ROOT/'artifacts/horror-document.png'));page.keyboard.press('j')
 page.evaluate("qa.take('mk1');qa.take('h_clock')")
 record('El reloj usa agujas y botones accesibles',page.is_visible('#puzzle') and page.locator('.clock-face').count()==1)
 page.click('#puzzleConfirm');record('Una hora incorrecta no avanza la historia',page.evaluate('!Game.pz.h_clock'))
 for _ in range(3):page.get_by_label('Aumentar HORA',exact=True).click()
 for _ in range(8):page.get_by_label('Aumentar MINUTO',exact=True).click()
 page.screenshot(path=str(ROOT/'artifacts/blue-clock.png'))
 page.click('#puzzleConfirm');record('03:40 abre el paso secreto',page.evaluate("Game.pz.h_clock&&Level.doors.find(d=>d.id==='secreto').open"))
 page.evaluate("qa.take('h_vial');Game.keys={};for(let i=0;i<850&&Game.lvl==='mansion';i++)qa.step()")
 record('Emboscada y despertar sin pantallas de texto',page.evaluate("Game.lvl==='hospital'&&Game.story.restrained&&Game.state==='play'"))
 for _ in range(12):page.keyboard.press('e')
 page.evaluate("qa.walk(42,7);Game.keys={};for(let i=0;i<900&&!Game.story.armCut;i++)qa.step()")
 print('Estado persecución',page.evaluate('({seq:Game.story.seq,p:[Game.player.x/32,Game.player.y/32],c:[Game.carn.x/32,Game.carn.y/32],mode:Game.carn.state,script:Game.carn.scripted})'),flush=True)
 record('Un golpe abre la puerta y deja al jugador herido',page.evaluate("Game.story.armCut&&!Game.story.armHealed&&Game.story.firstDoorHits===1&&Level.doors.find(d=>d.id==='forced').open"))
 page.keyboard.press('f');record('No hay inyección antes del vestíbulo',page.evaluate('!Game.story.armHealed'))
 page.evaluate('qa.walk(52,24)')
 record('Tutorial visual al llegar a salvo',page.is_visible('#tutorial') and page.locator('.manual-cards article').count()==6 and page.locator('.manual-cards svg').count()==6)
 page.screenshot(path=str(ROOT/'artifacts/tutorial-v050.png'));page.click('#tutorialClose')
 page.keyboard.press('f');record('F regenera y deja las técnicas iniciales como compras opcionales',page.evaluate("Game.story.armHealed&&Game.story.seq==='free'&&!Game.mut.has('reflejos')&&!Game.mut.has('instinto')"))
 page.evaluate("qa.take('pp1')")
 record('Tras el vestíbulo se abre la exploración libre',page.evaluate("Game.story.seq==='free'&&Game.player.weapon.id==='pistol'"))
 page.evaluate('qa.step();Game.render()');page.wait_for_timeout(350);page.screenshot(path=str(ROOT/'artifacts/blue-hospital.png'))
 # Camino nuevo: acceso al patio y galería sur, con vuelta por otra puerta.
 page.evaluate("qa.walk(63,38);qa.walk(51,44);qa.walk(50,51);qa.walk(29,52)")
 record('Patio y galería sur se recorren con movimiento continuo',page.evaluate("!!Game.story.visited['hospital:Patio de invierno']&&!!Game.story.visited['hospital:Galería sur']"))
 page.keyboard.press('m');record('Plano y descubrimiento sin revelar el hospital entero',page.is_visible('#map') and page.locator('#mapDrawing svg').count()==1)
 page.screenshot(path=str(ROOT/'artifacts/blue-map.png'));page.keyboard.press('m')
 # Interfaz del árbol con la EXP realmente obtenida en la introducción y exploración.
 page.keyboard.press('k');record('Una red con inicio común y 153 opciones',page.locator('.network-branch').count()==3 and page.evaluate('Object.keys(SKILLS).length===153'))
 page.locator('[data-skill="vigor"]').click();xp=page.evaluate('Game.player.xp');page.click('#bBuy')
 record('Comprar descuenta EXP y cambia salud máxima',page.evaluate(f"Game.mut.has('vigor')&&Game.player.xp==={xp}-4&&Game.player.maxHp===110"))
 page.screenshot(path=str(ROOT/'artifacts/blue-skills.png'))
 page.get_by_role('button',name='Mostrar nombres',exact=True).click();page.get_by_role('button',name='Ocultar nombres',exact=True).click();page.wait_for_timeout(100)
 record('Red completa con zoom y selección de nodos',page.locator('.network-node').count()==153)
 page.screenshot(path=str(ROOT/'artifacts/blue-atlas.png'));page.keyboard.press('k')
 # Cada mecanismo se abre desde un objeto real; posición de prueba controlada para aislar interfaz.
 for kind,item,values in [('mix','h_mix',[2,1,3]),('hydro','h_hydro',[1,1,1])]:
  page.evaluate(f"Game.player.x=Game.items.find(i=>i.id==='{item}').x;Game.player.y=Game.items.find(i=>i.id==='{item}').y;Game.interact()")
  assert page.is_visible('#puzzle')
  for i,n in enumerate(values):
   for _ in range(n):page.get_by_label('Aumentar CANAL '+chr(65+i),exact=True).click()
  page.click('#puzzleConfirm');record('Mecanismo '+kind+' resuelto por controles',page.evaluate(f"!!Game.pz['blue:{kind}']"))
 page.evaluate("BluePuzzles.open(Game,'security')")
 solution=page.evaluate("(()=>{for(let n=0;n<262144;n++){let v=[],k=n;for(let i=0;i<9;i++){v.push(k%4);k=Math.floor(k/4)}if(BluePuzzles.circuitReach(v).has(9))return v;}})()")
 for i,n in enumerate(solution):
  for _ in range(n):page.get_by_label('Girar pieza '+str(i+1),exact=True).click()
 page.screenshot(path=str(ROOT/'artifacts/blue-circuit.png'));page.click('#puzzleConfirm')
 record('Circuito conectado libera un acceso alternativo',page.evaluate("Game.pz['blue:security']&&Level.doors.find(d=>d.id==='arch').open"))
 # Guardado conserva red, mapa, mecanismos y baúl. Reinicio de página y carga desde el menú.
 page.evaluate('Game.save(0)');saved=page.evaluate('({xp:Game.player.xp,maxHp:Game.player.maxHp,visited:Object.keys(Game.story.visited).length,stash:Game.stash.length})')
 page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.wait_for_timeout(100)
 record('Continuar restaura progreso y mecanismos',page.evaluate(f"Game.mut.has('vigor')&&Game.pz['blue:security']&&Game.player.maxHp==={saved['maxHp']}&&Object.keys(Game.story.visited).length>={saved['visited']}"))
 page.keyboard.press('Tab');record('Maletín accesible',page.is_visible('#inv'));page.screenshot(path=str(ROOT/'artifacts/blue-inventory.png'));page.keyboard.press('Tab')
 for w,h in [(1280,720),(1920,1080)]:
  page.set_viewport_size({'width':w,'height':h});page.keyboard.press('k');record(f'Árbol utilizable en {w}×{h}',page.locator('#bTreeClose').is_visible());page.keyboard.press('k')
 record('Sin errores JavaScript ni recursos fallidos',not errors and not missing)
 out={'passed':RESULT,'errors':errors,'missing':missing,'circuit_solution':solution,'save':saved,'scope':'Prólogo y acceso a galerías con movimiento real; mecanismos, guardado e interfaz con posiciones de prueba controladas.'}
 (ROOT/'artifacts/browser-blue-results.json').write_text(json.dumps(out,ensure_ascii=False,indent=2))
 browser.close()
