"""v0.9.1: dos nuevas elecciones doradas avanzadas en la red y guardado."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
root=Path(__file__).resolve().parents[1];passed=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
with local_server(root) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bNew');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(60)
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.resume();Game.enemies=[];Game.carn=null;Game.player.x=52.5*32;Game.player.y=26.5*32;Game.player.xp=10000")
 page.keyboard.press('k')
 check('La misma red contiene 153 opciones y ocho doradas',page.locator('.network-node').count()==153 and page.locator('.network-node.gold').count()==8)
 page.locator('[data-skill=gold_fire_discipline]').click()
 check('La pareja humana avanzada muestra solo sus dos alternativas',page.locator('#goldChoice [data-choice]').count()==2 and 'Disciplina de fuego' in page.inner_text('#goldChoice') and 'Reserva del veterano' in page.inner_text('#goldChoice'))
 check('No se puede saltar la progresión avanzada',page.locator('#bBuy').is_disabled() and 'Control total' in page.inner_text('#treeInfo'))
 page.evaluate("for(const[id,s]of Object.entries(SKILLS))if(!s.gold)Game.mut.owned.add(id);UI.renderTree(Game)")
 page.locator('[data-skill=gold_reload]').click();page.click('#bBuy')
 page.locator('[data-skill=gold_catalyst]').click();page.click('#bBuy')
 page.locator('[data-skill=gold_fire_discipline]').click();page.click('#bBuy')
 check('La nueva elección humana se combina con las dos elecciones anteriores',page.evaluate("Game.mut.has('gold_reload')&&Game.mut.has('gold_catalyst')&&Game.mut.has('gold_fire_discipline')&&Game.mut.mod('effort')>=.2"))
 page.locator('[data-choice=gold_veteran_reserve]').click()
 check('Su alternativa queda bloqueada con explicación',page.locator('#bBuy').is_disabled() and 'Elección sellada' in page.inner_text('#treeInfo'))
 page.locator('[data-skill=gold_organic_reactor]').click();page.click('#bBuy')
 check('La elección mutante avanzada es independiente de las otras tres',page.evaluate("Game.mut.has('gold_organic_reactor')&&[...Game.mut.owned].filter(id=>SKILLS[id].gold).length===4"))
 page.locator('[data-choice=gold_abyssal_heart]').click()
 check('La alternativa mutante queda cerrada sin afectar a las otras parejas',page.locator('#bBuy').is_disabled() and 'Elección sellada' in page.inner_text('#treeInfo'))
 page.screenshot(path=str(root/'artifacts/gold-advanced-v091.png'))
 page.keyboard.press('k');page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.wait_for_timeout(120);page.keyboard.press('k')
 check('Guardar y cargar conserva las cuatro decisiones',page.evaluate("['gold_reload','gold_catalyst','gold_fire_discipline','gold_organic_reactor'].every(id=>Game.mut.has(id))&&!Game.mut.has('gold_veteran_reserve')&&!Game.mut.has('gold_abyssal_heart')"))
 for w,h in [(1280,720),(1920,1080)]:
  page.set_viewport_size({'width':w,'height':h});page.locator('[data-skill=gold_abyssal_heart]').click()
  check(f'La comparación de ambas opciones sigue accesible en {w}×{h}',page.locator('#goldChoice').is_visible() and page.locator('#goldChoice [data-choice]').count()==2 and page.locator('#bTreeClose').evaluate('e=>e.getBoundingClientRect().bottom<=innerHeight'))
 check('Sin errores JavaScript',not errors)
 (root/'artifacts/gold-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'scope':'Escenario preparado para aislar requisitos avanzados, exclusión, independencia de las cuatro parejas, reservas y persistencia.'},ensure_ascii=False,indent=2));b.close()
