"""Escenarios controlados de v0.5: sombras, tutorial, requisitos y elecciones."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server

root = Path(__file__).resolve().parents[1]
passed = []


def check(name, condition):
    assert condition, name
    passed.append(name)
    print('PASS', name, flush=True)


with local_server(root) as base_url, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1440, 'height': 900})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(base_url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
    page.click('#bNew')
    page.wait_for_timeout(80)
    page.evaluate("""Hospital.toHospital(Game);Game.story.restrained=false;
        Game.story.armCut=true;Game.story.seq='wounded_run';
        Game.player.x=52.5*32;Game.player.y=24.5*32;Hospital.tick(Game,.1)""")
    check('Llegada: guía pausada antes de la inyección',
          page.is_visible('#tutorial') and page.evaluate(
              "Game.state==='tutorial'&&!Game.story.armHealed&&Game.carn.dormant"))
    check('Guía con seis dibujos y la indicación de F en el vestíbulo',
          page.locator('.manual-cards svg').count() == 6 and
          'pulsa F' in page.locator('#tutorialContext').inner_text())
    before = page.evaluate('[Game.player.x,Game.player.y]')
    page.keyboard.down('d')
    page.wait_for_timeout(150)
    page.keyboard.up('d')
    check('La guía detiene al personaje', before == page.evaluate('[Game.player.x,Game.player.y]'))
    page.screenshot(path=str(root/'artifacts/tutorial-v060.png'))
    page.set_viewport_size({'width': 1280, 'height': 720})
    check('Tutorial completo visible en 1280×720', page.locator('#tutorialClose').evaluate(
          '(e)=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>=0}'))
    page.screenshot(path=str(root/'artifacts/tutorial-small-v060.png'))
    page.set_viewport_size({'width': 1440, 'height': 900})
    page.click('#tutorialClose')
    page.keyboard.press('f')
    check('Cerrar la guía permite la regeneración en el vestíbulo', page.evaluate(
          "Game.state==='play'&&Game.story.tutorialSeen&&Game.story.armHealed&&Game.story.seq==='free'"))
    page.keyboard.press('Escape')
    page.click('#bTutorial')
    page.keyboard.press('Escape')
    check('La guía se puede consultar desde la pausa', page.evaluate("Game.state==='pause'"))
    page.keyboard.press('Escape')

    page.evaluate("""Game.player.x=44.5*32;Game.player.y=28.5*32;Game.player.angle=0;
        Game.story.visited={'hospital:Vestíbulo central':true};Game.update(.001);
        Game.cam.x=Game.player.x-Game.cv.width/2;Game.cam.y=Game.player.y-Game.cv.height/2;
        Game.mouse.x=Game.cv.width/2+160;Game.mouse.y=Game.cv.height/2;Game.player.angle=0;
        UI.$('location').textContent='Vestíbulo central';
        Game.render()""")
    color = page.evaluate("Array.from(Game.ctx.getImageData(Math.floor(Game.cv.width/2+160),Math.floor(Game.cv.height/2),1,1).data)")
    check('El pilar conserva colisión sin ocultar la zona tras él',
          sum(color[:3]) > 55 and page.evaluate('Level.blocked(47.5*32,28.5*32,10)'))
    page.screenshot(path=str(root/'artifacts/shadows-v060.png'))

    page.keyboard.press('k')
    check('Inicio común, enlaces dobles y cuatro opciones doradas', page.evaluate(
          "RevisionTree.common.every(k=>SKILLS[k].br==='neu')&&Object.values(SKILLS).filter(s=>s.requires?.length===2).length>=10")
          and page.locator('.network-node.gold').count() == 8)
    check('Fondo científico animado', page.locator('.riutex-reactor i').count() == 9 and
          page.locator('.riutex-reactor i').first.evaluate(
              '(e)=>getComputedStyle(e).animationName') == 'riutex-lava')
    page.screenshot(path=str(root/'artifacts/tree-v060.png'))
    # Requisitos suministrados para aislar las elecciones, sin simular EXP ganada jugando.
    page.evaluate("""for(const[id,s]of Object.entries(SKILLS))if(!s.gold)Game.mut.owned.add(id);
        Game.player.xp=1000;UI.renderTree(Game)""")
    page.locator('[data-skill="gold_reload"]').click()
    check('La especialización explica dos alternativas excluyentes',
          page.locator('[data-choice]').count() == 2 and
          'se cierra Triaje de combate' in page.locator('#treeInfo').inner_text())
    page.click('#bBuy')
    check('Elegir dorada descuenta su EXP', page.evaluate(
          "Game.mut.has('gold_reload')&&Game.player.xp===972"))
    page.locator('[data-skill="gold_triage"]').click()
    check('La alternativa queda bloqueada con explicación', page.locator('#bBuy').is_disabled()
          and 'Elección sellada' in page.locator('#treeInfo').inner_text())
    page.evaluate('Game.save(0)')
    page.reload()
    page.click('#bCont')
    page.locator('.save-slot').first.click()
    page.keyboard.press('k')
    page.locator('[data-skill="gold_triage"]').click()
    check('La exclusión dorada persiste al recargar y continuar',
          page.locator('#bBuy').is_disabled() and page.evaluate(
              "Game.mut.has('gold_reload')&&!Game.mut.has('gold_triage')"))
    check('Sin errores JavaScript', not errors)
    (root/'artifacts/revision-browser-results.json').write_text(json.dumps(
        {'passed': passed, 'errors': errors,
         'scope': 'Escenarios controlados de sombras, tutorial y elecciones doradas.'},
        ensure_ascii=False, indent=2))
    browser.close()
