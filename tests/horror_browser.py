"""Visibilidad de píxeles y sistemas nuevos en un navegador real. Usa escenarios controlados."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
root=Path(__file__).resolve().parents[1]
passed=[]
def check(name,ok):
    assert ok,name
    passed.append(name)
    print('PASS',name,flush=True)
with local_server(root) as base_url, sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900})
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(base_url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
    page.click('#bNew')
    page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()')
    page.wait_for_timeout(70)
    page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.player.x=38.5*32;Game.player.y=28.5*32;Game.player.angle=Math.PI;Game.cam.x=Game.player.x-Game.cv.width/2;Game.cam.y=Game.player.y-Game.cv.height/2;Level.openDoor(Level.doors.find(d=>d.id==='lob_w'));Game.story.visited={'hospital:Vestíbulo central':true};Game.story.mapTiles={};Game.render()")
    color=page.evaluate("Array.from(Game.ctx.getImageData(Math.floor(Game.cv.width/2-96),Math.floor(Game.cv.height/2),1,1).data)")
    check('Sala desconocida negra incluso con puerta abierta',color[:3]==[3,6,9])
    check('La sala desconocida tampoco aparece en el plano',page.evaluate("!Game.story.mapTiles.hospital.includes('35,28')"))
    page.evaluate("Game.player.x=35.5*32;Game.player.y=28.5*32;Game.cam.x=Game.player.x-Game.cv.width/2;Game.cam.y=Game.player.y-Game.cv.height/2;Game.render()")
    color=page.evaluate("Array.from(Game.ctx.getImageData(Math.floor(Game.cv.width/2-28),Math.floor(Game.cv.height/2),1,1).data)")
    check('Entrar revela la sala bajo la luz',sum(color[:3])>70)
    page.evaluate("Game.story.visited={'hospital:Oficinas':true,'hospital:Ala oeste':true};Game.player.x=16.5*32;Game.player.y=25.5*32;Game.cam.x=Game.player.x-Game.cv.width/2;Game.cam.y=Game.player.y-Game.cv.height/2;Game.player.angle=0;Game.render()")
    color=page.evaluate("Array.from(Game.ctx.getImageData(Math.floor(Game.cv.width/2+64),Math.floor(Game.cv.height/2),1,1).data)")
    check('Una puerta cerrada tapa otra zona ya visitada',color[:3]==[3,6,9])
    page.keyboard.press('k');page.wait_for_timeout(150)
    check('Una ventana con inicio común y evolución conectada',page.locator('.network-viewport').count()==1 and page.locator('.network-branch').count()==3 and page.locator('.discipline').count()==0)
    check('Los 153 opciones están en esa misma red',page.locator('.network-node').count()==153)
    old=page.evaluate('BlueSkills.view.z');page.get_by_role('button',name='+',exact=True).click();check('Zoom funcional sin cambiar de pantalla',page.evaluate('BlueSkills.view.z')>old)
    page.get_by_role('button',name='Encuadrar',exact=True).click()
    page.get_by_role('button',name='Mostrar nombres',exact=True).click();check('Nombres opcionales',page.locator('.network-node small').count()==153)
    page.get_by_role('button',name='Ocultar nombres',exact=True).click()
    page.screenshot(path=str(root/'artifacts/horror-tree.png'))
    page.keyboard.press('k')
    page.evaluate("Game.player.hidden=false;Game.mut.owned.add('concentracion');Game.player.stamina=100;Game.player.energy=100;Game.castSkill('concentracion')")
    check('Técnica humana usa estamina y conserva Riutex',page.evaluate('Game.player.stamina===82&&Game.player.energy===100'))
    page.evaluate("Game.mut.owned.add('coraza');Game.castSkill('coraza')")
    check('Poder orgánico consume Riutex y activa protección',page.evaluate('Game.player.energy===70&&Game.player.shell===6'))
    page.evaluate("Game.player.x=7.5*32;Game.player.y=6.5*32;Game.player.x=52.5*32;Game.player.y=24.5*32;Game.story.seq='lobby_inject';Game.story.armCut=true;Game.story.armHealed=false;EscapeGuide.tick(Game)")
    check('Inyección indicada de forma persistente',page.is_visible('#escapeGuide') and '[F]' in page.locator('#escapeGuide').inner_text())
    page.screenshot(path=str(root/'artifacts/horror-escape-guide.png'))
    page.keyboard.press('f');check('F regenera y cambia la instrucción',page.evaluate("Game.story.armHealed&&Game.story.seq==='free'"))
    page.evaluate('EscapeGuide.tick(Game)');check('Tras inyectarse se abre la exploración',page.evaluate("Game.story.seq==='free'"))
    page.evaluate("Hospital.lobbyReached(Game);Game.take(Game.items.find(i=>i.doc==='a1'))")
    check('Expediente con párrafos y tipografía editorial',page.locator('#docB p').count()>=2 and 'Georgia' in page.locator('#docB').evaluate('(e)=>getComputedStyle(e).fontFamily'))
    check('El contenido de las pistas se conserva', 'MÁS ANTIGUO' in page.locator('#docB').inner_text() and 'MÁS RECIENTE' in page.locator('#docB').inner_text())
    page.screenshot(path=str(root/'artifacts/horror-document.png'));page.keyboard.press('j')
    page.evaluate("Game.player.hidden=true;Game.noise=null;Game.player.x=10.5*32;Game.player.y=25.5*32;for(const d of Level.doors)if(!d.key)Level.openDoor(d);const c=Game.carn;c.dormant=false;c.scripted=false;c.state='chase';c.hunt=true;c.x=20.5*32;c.y=25.5*32;c.lastSeen=[c.x,c.y];c.tgt=c.lastSeen.slice();for(let i=0;i<600;i++){Game.t+=1/30;c.update(1/30,Game)}")
    check('Sin testigo: abandona búsqueda y no conoce el armario',page.evaluate("Game.player.hidden&&!Game.carn.hunt&&Math.hypot(Game.carn.x-Game.player.x,Game.carn.y-Game.player.y)>180"))
    check('Retoma su patrulla o rutina',page.evaluate("['patrol','routine','search'].includes(Game.carn.state)"))
    check('Sin errores de navegador',not errors)
    (root/'artifacts/horror-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'scope':'Escenarios controlados: píxeles, red, recursos, guía, documentos e IA.'},ensure_ascii=False,indent=2))
    browser.close()
