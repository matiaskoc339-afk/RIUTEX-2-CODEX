"""Controles reales del expediente; búsquedas locales y mapa sin revelar salas."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

ROOT = Path(__file__).resolve().parents[1]
checks, errors = [], []
def record(name, value):
    assert value, name
    checks.append(name)
    print('PASS', name, flush=True)

with local_server(ROOT) as url, sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox'])
    page = browser.new_page(viewport={'width': 1280, 'height': 720})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(url)
    page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
    start_new_game(page, False)
    page.evaluate("""Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish();
      Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);
      Game.enemies=[];Game.carn=null;Game.resume();Game.inv=new Inventory();Game.inv.expand();Game.inv.expand();
      Game.giveWeapon('pistol',9,true);Game.giveWeapon('shotgun',2,false);Game.inv.docs=['m1','h1','b_diag','w_shot_notice','cl_silence','lf_arrival','wx_intro'];
      Game.story.read=[];Game.player.x=52.5*32;Game.player.y=26.5*32;Game.update(.01);Game.render();Game.openJournal();""")
    xp = page.evaluate('Game.player.xp')
    page.fill('#journalSearch', 'VALCARCEL')
    record('Buscar por procedencia ignora tildes y solo lista lo recogido', page.locator('#jItems [data-doc="cl_silence"]').count() == 1 and page.evaluate("[...document.querySelectorAll('#jItems .journal-entry')].every(e=>Game.inv.docs.includes(e.dataset.doc))"))
    page.click('#journalClear')
    page.locator('#journalSearch').press_sequentially('jkmfr morgue', delay=30)
    record('Escribir atajos de juego en el buscador conserva la pausa y el texto', page.evaluate("Game.state==='doc'&&!Game.mut.bindingTarget") and page.input_value('#journalSearch') == 'jkmfr morgue')
    page.fill('#journalSearch', '<script>')
    record('Una búsqueda vacía de resultados conserva el documento abierto', page.locator('#jItems .journal-entry').count() == 0 and 'No hay documentos' in page.inner_text('#jItems') and page.inner_text('#docT') != '')
    page.click('#journalClear')
    page.locator('#jTabs button', has_text='Sin leer').click()
    remaining = page.locator('#jItems .journal-entry').count()
    page.locator('#jItems .journal-entry').first.click()
    record('Sin leer se actualiza al abrir el papel sin marcar los demás', page.locator('#jItems .journal-entry').count() == remaining - 1 and page.evaluate('Game.story.read.length') == 2)
    page.locator('#jTabs button', has_text='Todos').click()
    page.locator('#jItems [data-doc="cl_silence"]').focus()
    page.keyboard.press('Enter')
    record('Las entradas son botones accesibles con teclado y membretes por zona', page.evaluate("Game.jSel==='cl_silence'") and 'VALCÁRCEL' in page.inner_text('.clinical-letterhead') and page.locator('#jPaper').get_attribute('data-sector') == 'castle')
    record('Buscar y releer no regala EXP', page.evaluate('Game.player.xp') == xp)
    page.click('#journalNext')
    record('Anterior y siguiente recorren los resultados sin salir del archivo', page.evaluate("Game.state==='doc'&&Game.jSel!=='cl_silence'"))
    page.evaluate("UI.renderJournal(Game,'lf_arrival')")
    record('Un documento de UMBRAL conserva su origen al leerlo en el hospital', 'UMBRAL' in page.inner_text('.clinical-letterhead') and page.locator('#jPaper').get_attribute('data-sector') == 'umbra')
    page.screenshot(path=str(ROOT/'artifacts/archivo-v0250.png'))
    page.keyboard.press('Tab')
    page.locator('#invGrid [data-item-type="w_shotgun"]').click()
    mag = page.evaluate("Game.inv.items.find(i=>i.id==='shotgun').mag")
    page.evaluate('Game.player.reloading=1')
    page.click('#bEquip')
    record('Equipar desde el maletín cambia el arma real sin fabricar munición', page.evaluate(f"Game.player.weapon.id==='shotgun'&&Game.player.reloading===0&&Game.player.weapon.mag==={mag}") and page.is_disabled('#bEquip'))
    record('La ficha del arma informa cargador, reserva y esfuerzo vigente', page.locator('.inventory-weapon-stats dd').count() == 3 and 'ESFUERZO' in page.inner_text('#invInfo'))
    page.screenshot(path=str(ROOT/'artifacts/maletin-v0250.png'))
    page.keyboard.press('m')
    page.evaluate("Game.story.visited={hospital:{}};Game.story.visited={'hospital:Vestíbulo central':true};Game.story.mapTiles={hospital:[]};Blue.renderMap(Game)")
    page.locator('.atlas-room[aria-label="Vestíbulo central"]').click()
    record('Una sala visitada sin accesos observados no revela conexiones desconocidas', '0 conexiones observadas' in page.inner_text('#mapReadout') and not page.locator('.atlas-door').count())
    page.locator('#mapDrawing svg').focus()
    initial = page.locator('#mapDrawing svg').get_attribute('viewBox')
    page.keyboard.press('+')
    zoomed = page.locator('#mapDrawing svg').get_attribute('viewBox')
    record('El plano admite zoom y desplazamiento con teclado', float(zoomed.split()[2]) < float(initial.split()[2]))
    page.keyboard.press('ArrowRight')
    record('Mover el plano no mueve al protagonista', page.evaluate('Game.player.x===52.5*32'))
    for w, h in [(1280, 720), (1920, 1080)]:
        page.set_viewport_size({'width': w, 'height': h})
        page.click('[data-desk="doc"]')
        record(f'Búsqueda, lista y lectura caben en {w}×{h}', page.evaluate("document.body.scrollWidth<=innerWidth&&document.querySelector('#jItems').getBoundingClientRect().height>70&&document.querySelector('#jPaper').getBoundingClientRect().right<innerWidth"))
        page.click('[data-desk="map"]')
    page.evaluate("Game.startLvl='asylum';Game.start(false);Game.state='inv';UI.renderInv(Game);UI.screen('inv')")
    record('Cambiar al legado restaura Usar y oculta Equipar del expediente nuevo', page.locator('#bEquip').get_attribute('class') == 'hidden' and not 'hidden' in (page.locator('#bUse').get_attribute('class') or ''))
    page.evaluate("Game.inv.docs=['d1'];Game.openDoc('d1')")
    record('RIUTEX 1 conserva su lector sin controles ni membretes de otra campaña', not page.is_visible('#journalTools') and page.locator('.clinical-letterhead').count() == 0)
    record('No hay errores de JavaScript', not errors)
    (ROOT/'artifacts/fielddesk-polish-browser-results.json').write_text(json.dumps({'passed': checks, 'errors': errors, 'scope': 'Navegador Chromium, controles reales sobre escenarios preparados de expediente y mapa.'}, ensure_ascii=False, indent=2))
    browser.close()
