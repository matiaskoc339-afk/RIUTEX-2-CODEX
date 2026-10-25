"""Sensibilidad POV: control nativo, movimiento, persistencia y ajustes antiguos."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

R=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)

with local_server(R) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':720});page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("if(localStorage.getItem('riutex_pov_v016')===null)localStorage.setItem('riutex_pov_v016',JSON.stringify({enabled:true}));addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url);page.click('#bMenuOptions');slider=page.locator('#menuFirstPersonSensitivity')
    check('Ajustes antiguos conservan POV y reciben sensibilidad normal',page.evaluate('FirstPerson.enabled&&FirstPerson.sensitivityPercent===100&&FirstPerson.sensitivity===.00235'))
    check('La barra accesible aparece en Opciones con valor visible',slider.is_visible() and page.locator('#menuFirstPersonSensitivityValue').inner_text()=='100 %' and slider.get_attribute('type')=='range')
    slider.focus();page.keyboard.press('End')
    check('Mover la barra cambia el valor al instante y lo guarda',slider.input_value()=='250' and page.locator('#menuFirstPersonSensitivityValue').inner_text()=='250 %' and page.evaluate("JSON.parse(localStorage.getItem(FirstPerson.key)).sensitivityPercent===250"))
    page.locator('#menuFirstPerson').uncheck();page.reload();page.click('#bMenuOptions')
    check('Recargar conserva sensibilidad y el estado independiente de POV',slider.input_value()=='250' and not page.locator('#menuFirstPerson').is_checked())
    page.locator('#menuFirstPerson').check();page.click('#bMenuOptionsClose');start_new_game(page)
    page.evaluate('Game.loop=()=>{};SceneTransitions.finish();Game.enemies=[];Game.keys={}')
    page.wait_for_timeout(60)
    resources=page.evaluate('JSON.stringify([Game.player.hp,Game.player.stamina,Game.player.energy,Game.player.weapon.mag])')
    def drag(percent):
        page.evaluate('v=>{FirstPerson.setSensitivity(v);Game.player.angle=0;FirstPerson.pitch=0;FirstPerson.clearActions(Game)}',percent)
        page.mouse.move(620,350);page.mouse.down(button='right');page.mouse.move(680,380,steps=6);page.mouse.up(button='right')
        return page.evaluate('({yaw:Game.player.angle,pitch:FirstPerson.pitch})')
    low=drag(25);high=drag(250)
    check('Un mismo arrastre gira diez veces más a 250 % que a 25 %',low['yaw']>0 and abs(high['yaw']/low['yaw']-10)<.001)
    check('La inclinación vertical usa la misma sensibilidad',low['pitch']>0 and abs(high['pitch']/low['pitch']-10)<.001)
    check('Ajustar la sensibilidad y arrastrar no dispara ni consume recursos',resources==page.evaluate('JSON.stringify([Game.player.hp,Game.player.stamina,Game.player.energy,Game.player.weapon.mag])') and page.evaluate('!Game.mouse.clicked&&!Game.mouse.rclick'))
    page.keyboard.press('Escape');pause=page.locator('#pauseFirstPersonSensitivity');pause.scroll_into_view_if_needed()
    check('Pausa ofrece la misma barra y valor a 720p',pause.is_visible() and pause.input_value()=='250' and pause.evaluate('e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth}'))
    pause.focus();page.keyboard.press('Home');page.keyboard.press('ArrowRight')
    check('El control nativo de pausa sincroniza ambas barras',pause.input_value()=='30' and slider.input_value()=='30' and page.locator('#pauseFirstPersonSensitivityValue').inner_text()=='30 %')
    page.click('#bRes');page.wait_for_timeout(250);page.keyboard.press('Escape')
    check('Reanudar y pausar conserva la sensibilidad elegida',pause.input_value()=='30' and page.evaluate("FirstPerson.sensitivityPercent===30&&Game.state==='pause'"))
    for value,expected in [(999,250),(-50,25),('inválido',100)]:
        page.evaluate('v=>localStorage.setItem(FirstPerson.key,JSON.stringify({enabled:true,sensitivityPercent:v}))',value);page.reload()
        check('Valor guardado '+str(value)+' se normaliza sin romper ajustes',page.evaluate('FirstPerson.sensitivityPercent')==expected and page.evaluate('Number.isFinite(FirstPerson.sensitivity)'))
    check('Sin errores JavaScript',not errors)
    page.click('#bMenuOptions');page.screenshot(path=str(R/'artifacts/pov-sensitivity-options-v0171.png'))
    version=json.loads((R/'package.json').read_text())['version']
    (R/'artifacts/pov-sensitivity-browser-results.json').write_text(json.dumps({'version':version,'passed':passed,'errors':errors,'drag_low':low,'drag_high':high,'scope':'Barra nativa con teclado, arrastre real, preferencias antiguas, recarga y pausa a 720p. Escenario sin enemigos para aislar el control.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
