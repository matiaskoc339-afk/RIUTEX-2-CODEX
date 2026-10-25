"""Cerrar la pestaña conserva objetos destruidos y no detona cadenas al reanudar."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server,start_new_game
ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context();context.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);start_new_game(page,False)
    page.evaluate("""Game.loop=()=>{};SceneTransitions.finish();Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;Game.player.x=48.5*TILE;Game.player.y=26.5*TILE;Game.keys={};
        Game.explode(Game.barrels[0]);Game.barrels[1].chainDelay=.04;SessionSave.flush(Game);""")
    saved=page.evaluate("({dead:Game.barrels[0].dead,pending:Game.barrels[1].chainDelay,hp:Game.player.hp,xp:Game.player.xp})")
    check('La sesión contiene un barril destruido y una cadena pendiente reales',saved['dead'] and saved['pending']==.04)
    page.close(run_before_unload=True);page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);page.evaluate('Game.loop=()=>{}');page.click('#bCont');page.click('#bResumeSession');page.evaluate('Game.enemies=[];Game.carn=null;Game.keys={};Game.mouse.down=false;Game.mouse.clicked=false')
    check('Cerrar y volver conserva el barril destruido',page.evaluate('Game.barrels[0].dead'))
    check('La cadena reanuda con un segundo de tregua y no daña al entrar',page.evaluate('!Game.barrels[1].dead&&Game.barrels[1].chainDelay===1&&Game.player.hp')==saved['hp'])
    before=page.evaluate('Game.barrels[1].chainDelay');page.evaluate("Game.pause();Game.update(.5)")
    check('La pausa congela la cadena restaurada',page.evaluate('Game.barrels[1].chainDelay')==before and not page.evaluate('Game.barrels[1].dead'))
    page.evaluate("Game.resume();Game.update(.2)")
    check('Reanudar no provoca una explosión inmediata',not page.evaluate('Game.barrels[1].dead'))
    check('Recuperar objetos no concede XP adicional',page.evaluate('Game.player.xp')==saved['xp'])
    check('No hay errores JavaScript al cerrar, continuar y pausar',not errors)
    (ROOT/'artifacts/persistence-world-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'scope':'Pestaña nueva del mismo contexto/origen, estado real de barriles de hospital. La extensión afecta a la sesión de la planta actual.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
