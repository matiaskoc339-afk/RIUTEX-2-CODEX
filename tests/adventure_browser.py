"""HUD con entradas reales; rutas opcionales recorridas con colisiones y sin enemigos.
El recorrido con enemigos del prólogo se comprueba aparte en browser_blue.py.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game
root=Path(__file__).resolve().parents[1];passed=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
def walker(page):
 page.evaluate((root/'tests/walker.js').read_text())
 page.evaluate('Game.enemies=[];Game.carn=null;Game.keys={}')
def take_doc(page,id):
 page.evaluate("qa.take('"+id+"')");check('Documento leído: '+id,page.evaluate("Game.inv.docs.includes('"+id+"')&&CLUES.has('"+id+"')"));page.keyboard.press('j')
def slide(page,piece,delta,count):
 page.get_by_role('button',name='Seleccionar '+piece,exact=True).click()
 for _ in range(count):page.get_by_role('button',name='Deslizar '+('atrás' if delta<0 else 'adelante'),exact=True).click()
with local_server(root) as url,sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');start_new_game(page);page.wait_for_timeout(180)
 check('AK preparado con imagen, cargador circular y reserva',page.locator('#weaponName').inner_text()=='AK de asalto' and page.locator('#weaponLoaded').inner_text()=='30' and page.locator('#weaponCapacity').inner_text()=='30' and '90' in page.locator('#weaponReserve').inner_text())
 ak=page.locator('#weaponIllustration').inner_html();page.mouse.click(900,430);page.wait_for_timeout(180)
 check('Disparar reduce el número y el arco de munición',int(page.locator('#weaponLoaded').inner_text())<30 and float(page.locator('#ammoArc').get_attribute('data-fraction'))<1)
 page.keyboard.press('r');page.wait_for_timeout(120);check('La recarga se muestra sin rellenar balas antes de tiempo','RECARGANDO' in page.locator('#weaponReload').inner_text())
 page.wait_for_timeout(2100);check('La recarga completa resta reserva y llena el arco',page.locator('#weaponLoaded').inner_text()=='30' and page.locator('#ammoArc').get_attribute('data-fraction')=='1')
 page.screenshot(path=str(root/'artifacts/ak-v070.png'))
 page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70)
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.player.x=52.5*32;Game.player.y=24.5*32")
 walker(page);page.evaluate('qa.step();Game.render()')
 check('Sin equipo del prólogo y pistola accesible al llegar',page.evaluate("!Game.player.weapon&&Game.inv.items.length===0&&Game.items.find(i=>i.id==='pp1').y===26.5*32"))
 page.screenshot(path=str(root/'artifacts/pistol-beacon-v070.png'))
 page.evaluate("qa.take('pp1');qa.step();Game.render()")
 check('M9 cambia la imagen y su cargador máximo',page.locator('#weaponIllustration').inner_html()!=ak and page.locator('#weaponName').inner_text()=='Pistola M9' and page.locator('#weaponCapacity').inner_text()=='12')
 page.screenshot(path=str(root/'artifacts/weapon-pistol-v070.png'))
 page.click('#objectiveMap');check('El botón del objetivo abre su zona aproximada en el mapa',page.is_visible('#map') and page.locator('.main-search-area').count()==1)
 check('El contorno no revela salas ni alijos por descubrir','Farmacia' not in page.locator('#mapDrawing').inner_text() and 'UZI' not in page.locator('#mapGuidance').inner_text() and 'escopeta' not in page.locator('#mapGuidance').inner_text())
 page.screenshot(path=str(root/'artifacts/mission-map-v070.png'));page.keyboard.press('m')
 take_doc(page,'w_exit_note');take_doc(page,'w_shot_notice')
 page.evaluate("qa.take('q_shot_rack')");check('El soporte no abre sin la manivela',page.evaluate("Game.state==='play'&&!Game.pz['adv:shotgun']&&!Game.player.weapons.shotgun"))
 take_doc(page,'w_shot_manual');page.evaluate("qa.take('q_crank');qa.take('q_shot_rack')")
 check('El recorrido de Mantenimiento habilita el tablero físico',page.is_visible('.rack-board') and '182, 99, 87' in page.locator('.rack-piece').first.evaluate('e=>getComputedStyle(e).backgroundImage'))
 page.click('#puzzleConfirm');check('Un soporte sin liberar no entrega el arma',page.evaluate("!Game.pz['adv:shotgun']&&!Game.items.some(i=>i.id==='q_shotgun')"))
 slide(page,'Balda superior',-1,1);page.keyboard.press('Escape');page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);walker(page)
 page.evaluate("qa.take('q_shot_rack')");check('La corredera conserva su posición tras recargar',page.evaluate('BluePuzzles.cur.positions[2][0]===1'))
 slide(page,'Balda superior',-1,1);slide(page,'Traba azul',-1,2);slide(page,'Contrapeso inferior',-1,3);slide(page,'Traba verde',1,2);slide(page,'Corredera roja',1,4)
 page.screenshot(path=str(root/'artifacts/rack-v070.png'));page.click('#puzzleConfirm')
 check('La escopeta espera en el soporte abierto hasta recogerla',page.evaluate("Game.pz['adv:shotgun']&&Game.items.some(i=>i.id==='q_shotgun')&&!Game.player.weapons.shotgun"))
 page.evaluate("qa.take('q_shotgun');qa.step()");page.keyboard.press('2');page.evaluate('qa.step()')
 check('Escopeta ganada, equipable y con imagen propia',page.evaluate("Game.player.weapon.id==='shotgun'") and page.locator('#weaponCapacity').inner_text()=='6')
 page.screenshot(path=str(root/'artifacts/weapon-shotgun-v070.png'))
 page.evaluate("qa.take('hk_pase');qa.take('stairs_up')");walker(page);check('Ruta física a la planta alta con su pase',page.evaluate("Game.lvl==='hospital1'"))
 take_doc(page,'w_uzi_notice');take_doc(page,'w_uzi_manual');page.evaluate("qa.take('q_cell');qa.take('q_optic_case')")
 check('La celda sola no abre el cierre óptico',page.evaluate("Game.state==='play'&&!Game.pz['adv:optics']&&!Game.player.weapons.viper"))
 page.evaluate("qa.take('stairs_dn')");walker(page);take_doc(page,'w_uzi_optics');page.evaluate("qa.take('q_prism');qa.take('stairs_up')");walker(page)
 page.evaluate("qa.take('q_optic_case')");check('Piezas de dos plantas reunidas sin saltar paredes',page.is_visible('.optics-board') and page.locator('.optic-mirror').count()==6)
 page.click('#puzzleConfirm');check('Un haz incompleto no libera la UZI',page.evaluate("!Game.pz['adv:optics']"))
 for letter in 'ABCDEF':page.get_by_role('button',name='Girar espejo '+letter,exact=True).click()
 check('Los espejos encienden tres testigos y el receptor','3 / 3' in page.locator('.optics-readout').inner_text() and 'RECEPTOR ALINEADO' in page.locator('.optics-readout').inner_text())
 page.screenshot(path=str(root/'artifacts/optics-v070.png'));page.click('#puzzleConfirm');page.evaluate("qa.take('q_uzi');qa.step()");page.keyboard.press('3');page.evaluate('qa.step();Game.render()')
 check('UZI recuperada y equipada con su propio cargador',page.evaluate("Game.player.weapon.id==='viper'") and page.locator('#weaponName').inner_text()=='UZI' and page.locator('#weaponCapacity').inner_text()=='30')
 page.screenshot(path=str(root/'artifacts/weapon-uzi-v070.png'))
 page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.wait_for_timeout(200)
 check('Continuar conserva alijos, armas y piezas consumidas',page.evaluate("Game.pz['adv:shotgun']&&Game.pz['adv:optics']&&Game.player.weapons.shotgun&&Game.player.weapons.viper&&Game.picked.has('q_uzi')&&!Game.inv.keys.includes('optic_cell')"))
 page.set_viewport_size({'width':1280,'height':720});page.wait_for_timeout(100);page.screenshot(path=str(root/'artifacts/weapon-small-v070.png'))
 check('El HUD circular permanece dentro de 720p',page.locator('.weapon-dial').evaluate('e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.bottom<=innerHeight}'))
 check('Sin errores JavaScript',not errors)
 (root/'artifacts/adventure-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'scope':'HUD con entradas reales. Rutas opcionales con movimiento, colisiones y puertas reales; enemigos desactivados para aislar geometría, pistas, mecanismos y guardado.'},ensure_ascii=False,indent=2))
 browser.close()
