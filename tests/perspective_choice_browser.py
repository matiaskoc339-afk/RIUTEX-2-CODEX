"""Elección con clic/teclado, captura nativa, transición real y balanceo de pasos."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server

ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);page.click('#bNew')
    check('Nueva partida pregunta antes de crear al jugador o guardar una partida',page.evaluate("PerspectiveChoice.visible&&Game.state==='menu'&&!Game.player&&!SessionSave.read()&&!FirstPerson.locked()"))
    check('La pregunta, dos tarjetas y aviso de Ajustes están presentes',page.locator('#perspectiveChoice .perspective-card').count()==2 and page.get_by_role('heading',name='¿Cómo quieres jugar?').is_visible() and 'Opciones' in page.locator('#perspectiveNote').inner_text())
    loaded=page.evaluate("""async()=>{return Promise.all([...document.querySelectorAll('.perspective-preview')].map(e=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i.width===960&&i.height===600);i.onerror=()=>resolve(false);i.src=getComputedStyle(e).backgroundImage.slice(5,-2);})));}""")
    check('Las dos imágenes son capturas locales completas del juego',all(loaded))
    layout=page.evaluate("(()=>{const [a,b]=[...document.querySelectorAll('.perspective-card')].map(e=>e.getBoundingClientRect());return a.right<b.left&&Math.abs(a.top-b.top)<1;})()")
    check('Las dos opciones se presentan lado a lado en escritorio',layout)
    page.screenshot(path=str(ROOT/'artifacts/perspective-choice-v0230.png'))
    page.keyboard.press('Escape');check('Escape cancela sin iniciar ni alterar una partida',page.evaluate("!PerspectiveChoice.visible&&Game.state==='menu'&&!Game.player&&document.activeElement.id==='bNew'"))
    page.click('#bNew');page.set_viewport_size({'width':390,'height':844})
    check('En pantalla estrecha las tarjetas se apilan sin desbordamiento horizontal',page.evaluate("(()=>{const [a,b]=[...document.querySelectorAll('.perspective-card')].map(e=>e.getBoundingClientRect());return a.bottom<b.top&&a.left>=0&&a.right<=innerWidth&&document.documentElement.scrollWidth<=innerWidth;})()"))
    page.screenshot(path=str(ROOT/'artifacts/perspective-choice-mobile-v0230.png'))
    page.set_viewport_size({'width':1280,'height':720})
    check('Tarjetas, aviso y regreso caben en 720p',page.evaluate("['bPerspectivePOV','bPerspectiveTopdown','perspectiveNote','bPerspectiveBack'].every(id=>{const b=document.getElementById(id).getBoundingClientRect();return b.top>=0&&b.bottom<=innerHeight;})"))
    page.keyboard.press('Tab');page.keyboard.press('Tab')
    check('El foco permanece en la ventana al recorrer con Tab',page.evaluate("document.querySelector('#perspectiveChoice').contains(document.activeElement)"))
    page.locator('#bPerspectiveTopdown').focus();page.keyboard.press('ArrowLeft')
    check('Las flechas permiten pasar de una perspectiva a la otra',page.evaluate("document.activeElement.id==='bPerspectivePOV'"))
    page.keyboard.press('Enter');page.wait_for_function("Game.state==='play'&&!SceneTransitions.active&&FirstPerson.locked()")
    check('Elegir POV con teclado inicia con fundido y captura automática',page.evaluate("FirstPerson.enabled&&!PerspectiveChoice.visible&&Game.lvl==='mansion'&&POV3DRenderer.ready"))
    page.evaluate('Game.loop=()=>{}')
    check('Elegir no dispara ni gasta estamina al entrar',page.evaluate("!Game.mouse.down&&!Game.mouse.clicked&&!Game.mouse.rclick&&Game.player.stamina===100&&Game.player.weapon.mag===WEAPONS[Game.player.weapon.id].mag"))
    page.evaluate('SessionSave.flush(Game);window.qaSaved=[Game.player.x,Game.player.y,Game.player.hp];Game.toMenu()');page.wait_for_function('!FirstPerson.locked()')
    page.click('#bCont');page.click('#bResumeSession');page.wait_for_function("Game.state==='play'&&!SceneTransitions.active")
    check('Continuar conserva perspectiva y partida sin volver a preguntar',page.evaluate("FirstPerson.enabled&&!PerspectiveChoice.visible&&JSON.stringify([Game.player.x,Game.player.y,Game.player.hp])===JSON.stringify(qaSaved)"))
    page.evaluate("Game.toMenu();window.qaSession=localStorage.getItem(SessionSave.key)");page.wait_for_function('!FirstPerson.locked()');page.click('#bNew')
    page.evaluate('for(let i=0;i<20;i++)Game.update(1)')
    check('Esperar en la elección no sobrescribe la sesión anterior',page.evaluate('localStorage.getItem(SessionSave.key)===qaSession'))
    page.click('#bPerspectiveTopdown');page.wait_for_function("Game.state==='play'&&!SceneTransitions.active");page.evaluate('Game.render()')
    check('Topdown anula la preferencia POV anterior y mantiene libre el ratón',page.evaluate("!FirstPerson.enabled&&!FirstPerson.locked()&&Game.lvl==='mansion'&&!POV3DRenderer.visible"))
    page.evaluate('Game.pause()');page.locator('#pauseFirstPerson').check();page.click('#bRes');page.wait_for_function('FirstPerson.locked()')
    check('La misma partida permite cambiar a POV desde Ajustes',page.evaluate("FirstPerson.active(Game)&&!PerspectiveChoice.visible"))
    page.evaluate("""SceneTransitions.enabled=false;SceneTransitions.finish();Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Game.story.seq='free';Game.state='play';UI.screen(null);
      Game.carn=Game.custodio=null;Game.enemies=[];Game.items=[];Game.barrels=[];Game.bodies=[];Game.player.x=280;Game.player.y=336;Game.player.angle=0;Game.player.walkT=0;Game.player.knx=Game.player.kny=0;
      Level.W=40;Level.H=30;Level.grid=Array.from({length:30},(_,y)=>Array.from({length:40},(_,x)=>!x||!y||x===39||y===29?1:0));Level.rooms=[];Level.props={};Level.doors=[];Level.lamps=[];Level.safeRects=[];
      MenuScene.reduced=false;POVCameraMotion.reset();Game.keys={KeyW:true};window.qaSteps=[];
      for(let i=0;i<90;i++){Game.update(1/60);if(i%6===0){Game.render();const r=POV3DRenderer,dir=new THREE.Vector3();r.camera3D.getWorldDirection(dir);const ray=POV3DBallistics.ray(Game,Game.player);qaSteps.push({y:r.camera3D.position.y,eye:ray.eye,roll:POVCameraMotion.pose(Game).roll,dir:dir.toArray()});}}""")
    steps=page.evaluate('qaSteps')
    check('Caminar balancea suavemente la cámara dentro de medio punto de altura',max(s['y'] for s in steps)-min(s['y'] for s in steps)>.6 and all(abs(s['y']-35)<=.5 for s in steps))
    check('El balanceo conserva dirección y alineación del ojo y los disparos',all(abs(s['y']-s['eye'])<1e-8 and abs(s['dir'][1])<1e-8 and abs(s['dir'][0]-1)<1e-8 for s in steps))
    page.evaluate('Game.keys={};for(let i=0;i<100;i++)Game.update(1/60);Game.render()')
    check('Al parar vuelve al centro sin dejar inclinación residual',page.evaluate('POV3DRenderer.camera3D.position.y===35&&POVCameraMotion.pose(Game).roll===0'))
    page.evaluate('Game.keys={KeyW:true};MenuScene.reduced=true;for(let i=0;i<30;i++)Game.update(1/60);Game.render()')
    check('Reducir movimiento desactiva por completo el balanceo',page.evaluate('POV3DRenderer.camera3D.position.y===35&&POVCameraMotion.amplitude===0'))
    check('No hay errores JavaScript en elección, carga, cambios o movimiento',not errors)
    (ROOT/'artifacts/perspective-choice-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'steps':steps,'scope':'Clics y teclado reales, fundido y Pointer Lock nativo; vistas a 1440/1280/390 px. Movimiento preparado con física real en un suelo de prueba. No mide una campaña humana ni FPS de una GPU física.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
