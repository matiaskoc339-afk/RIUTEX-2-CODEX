"""Botón de captura POV: activación real, liberación y alternativa sin disparar."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server

R = Path(__file__).resolve().parents[1]
passed, errors = [], []

def check(name, ok):
    assert ok, name
    passed.append(name)
    print('PASS', name, flush=True)

with local_server(R) as url, sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url)
    button = page.locator('#povCaptureButton')
    check('El botón no aparece en el menú clásico', not button.is_visible())
    page.click('#bNew')
    page.evaluate('Game.loop=()=>{};SceneTransitions.finish();Game.enemies=[];Game.keys={}')
    page.wait_for_timeout(60)
    check('El botón no aparece durante el juego topdown', not button.is_visible())
    page.evaluate('FirstPerson.setEnabled(true)')
    check('Activar POV muestra el botón Bloquear ratón', button.is_visible() and 'Bloquear ratón' in button.inner_text())
    before = page.evaluate('({mag:Game.player.weapon.mag,stamina:Game.player.stamina,energy:Game.player.energy})')
    button.click()
    page.wait_for_function('FirstPerson.locked()')
    check('El clic del botón captura el ratón mediante la API nativa', page.evaluate('document.pointerLockElement===Game.cv&&FirstPerson.armed'))
    check('El botón se oculta mientras el ratón está capturado', not button.is_visible())
    check('Capturar no dispara ni consume recursos', page.evaluate('({mag:Game.player.weapon.mag,stamina:Game.player.stamina,energy:Game.player.energy})') == before and page.evaluate('!Game.mouse.down&&!Game.mouse.clicked&&!Game.mouse.rclick'))
    angle = page.evaluate('Game.player.angle')
    page.mouse.move(800, 420)
    check('El ratón capturado controla la mirada', page.evaluate(f'Math.abs(Game.player.angle-({angle}))>.01'))
    page.keyboard.press('Escape')
    page.wait_for_timeout(250)
    check('Escape libera el ratón y pausa', page.evaluate("!FirstPerson.locked()&&Game.state==='pause'"))
    check('Pausa mantiene el botón oculto', not button.is_visible())
    page.click('#bRes')
    check('Reanudar vuelve a mostrar el botón de captura', button.is_visible())
    page.evaluate("window.captureAttempts=0;window.nativeCapture=Game.cv.requestPointerLock;Game.cv.requestPointerLock=()=>{captureAttempts++;throw Error('Captura rechazada para la prueba')};void 0")
    button.click()
    check('Si el navegador rechaza la captura conserva la alternativa jugable', page.evaluate("FirstPerson.fallback&&FirstPerson.armed&&!FirstPerson.locked()&&Game.state==='play'"))
    check('La captura rechazada permite volver a intentarlo desde el botón', button.is_visible())
    button.click()
    check('Reintentar solicita la captura de nuevo sin disparar', page.evaluate('captureAttempts===2&&!Game.mouse.down&&!Game.mouse.clicked&&!Game.mouse.rclick') and page.evaluate('Game.player.weapon.mag') == before['mag'])
    page.evaluate('Game.cv.requestPointerLock=window.nativeCapture;FirstPerson.setEnabled(false)')
    check('Volver a topdown oculta el botón y limpia la captura', not button.is_visible() and page.evaluate('!FirstPerson.locked()&&!FirstPerson.armed'))
    check('Sin errores JavaScript', not errors)
    version = json.loads((R/'package.json').read_text())['version']
    (R/'artifacts/pov-capture-browser-results.json').write_text(json.dumps({
        'version': version, 'passed': passed, 'errors': errors,
        'scope': 'Clic real del botón y captura nativa en Chromium; Escape/pausa, vista clásica y rechazo de captura preparado.'
    }, ensure_ascii=False, indent=2)+'\n')
    browser.close()
