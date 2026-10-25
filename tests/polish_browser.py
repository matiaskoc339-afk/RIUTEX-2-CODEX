"""v0.15: presentación y fundidos con requestAnimationFrame real (sin desactivarlos)."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game
ROOT=Path(__file__).resolve().parents[1];passed=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
def arrived():page.wait_for_function('!SceneTransitions.active')
with local_server(ROOT) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url);page.evaluate('document.fonts.ready')
 check('Logo centrado y tres opciones debajo',page.evaluate("(()=>{const a=document.querySelector('#menu h1').getBoundingClientRect(),b=document.querySelector('#bNew').getBoundingClientRect();return Math.abs(a.x+a.width/2-innerWidth/2)<2&&b.top>a.bottom&&document.querySelectorAll('#menu .menu-actions button:not(.hidden)').length===3})()"))
 page.screenshot(path=str(ROOT/'artifacts/menu-v016.png'))
 page.evaluate("Game.state='menuStill';MenuScene.draw(.8)")
 page.screenshot(path=str(ROOT/'artifacts/menu-quiet-v016.png'))
 brightness=page.evaluate("(()=>{const x=Math.round(MenuScene.width*.73*MenuScene.ratio),y=Math.round(MenuScene.height*.24*MenuScene.ratio),sample=()=>{const d=MenuScene.ctx.getImageData(x-25,y-15,50,30).data;let sum=0;for(let i=0;i<d.length;i+=4)sum+=.2126*d[i]+.7152*d[i+1]+.0722*d[i+2];return sum/(d.length/4);};const quiet=sample();MenuScene.draw(1.62);return {quiet,shot:sample()}})()")
 page.screenshot(path=str(ROOT/'artifacts/menu-shot-v016.png'))
 check('El disparo produce un reflejo claramente más luminoso en la sangre',brightness['shot']>brightness['quiet']+20)
 page.evaluate("Game.state='menu';MenuScene.draw(.8)")
 before=page.evaluate('MenuScene.canvas.toDataURL()');page.wait_for_timeout(240)
 check('El charco cambia con reflejos animados',before!=page.evaluate('MenuScene.canvas.toDataURL()'))
 check('El pie del menú no invade las opciones',page.locator('#menu .menu-footer').evaluate("e=>e.getBoundingClientRect().top>document.getElementById('bMenuOptions').getBoundingClientRect().bottom+20"))
 page.click('#bMenuOptions');check('Opciones accesibles sin iniciar partida',page.evaluate("Game.state==='menuOptions'&&!Game.player") and page.is_visible('#menuOptions'))
 page.locator('#menuVolume').fill('42');page.locator('#menuReduceMotion').check();check('Volumen y movimiento se guardan',page.evaluate("Sound.volume===.42&&MenuScene.reduced&&JSON.parse(localStorage.getItem('riutex_presentation_v015')).volume===.42"))
 page.keyboard.press('Tab');pov_focused=page.evaluate("document.activeElement.id==='menuFirstPerson'");page.keyboard.press('Tab');sensitivity_focused=page.evaluate("document.activeElement.id==='menuFirstPersonSensitivity'");page.keyboard.press('Tab');image_focused=page.evaluate("document.activeElement.id==='bMenuExperience'");page.keyboard.press('Tab');check('El teclado navega por POV, sensibilidad, imagen y regreso al menú',pov_focused and sensitivity_focused and image_focused and page.evaluate("document.activeElement.id==='bMenuOptionsClose'"))
 page.screenshot(path=str(ROOT/'artifacts/menu-options-v016.png'));page.keyboard.press('Escape');check('Escape devuelve el foco al menú',page.evaluate("Game.state==='menu'&&document.activeElement.id==='bMenuOptions'"))
 page.reload();page.click('#bMenuOptions');check('Preferencias sobreviven una recarga',page.locator('#menuReduceMotion').is_checked() and page.locator('#menuVolume').input_value()=='42')
 page.locator('#menuReduceMotion').uncheck();page.keyboard.press('Escape')
 for w,h in [(1280,720),(1920,1080),(640,720)]:
  page.set_viewport_size({'width':w,'height':h})
  check(f'Menú completo y sin desbordes en {w}×{h}',page.locator('#bMenuOptions').evaluate('e=>{let r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.bottom<innerHeight-40}') and page.evaluate('document.documentElement.scrollWidth===innerWidth'))
  page.screenshot(path=str(ROOT/f'artifacts/menu-{w}-v016.png'))
 page.set_viewport_size({'width':1440,'height':900});start_new_game(page);page.keyboard.down('w')
 check('Nueva partida comienza con fundido',page.evaluate('SceneTransitions.active&&!document.getElementById("sceneTransition").classList.contains("hidden")'))
 check('La instantánea conserva las opciones y no duplica identificadores',page.evaluate("(()=>{const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);return document.querySelectorAll('.menu-snapshot .perspective-card').length===2&&new Set(ids).size===ids.length})()"))
 page.screenshot(path=str(ROOT/'artifacts/transition-start-v016.png'))
 check('Durante el fundido se congela posición, reloj y daño',page.evaluate("(()=>{const p=Game.player,x=p.x,y=p.y,t=Game.t,hp=p.hp;for(let i=0;i<30;i++)Game.update(.05);p.hurt(100,0,Game);return p.x===x&&p.y===y&&Game.t===t&&p.hp===hp})()"))
 arrived();y=page.evaluate('Game.player.y');page.wait_for_timeout(180);page.keyboard.up('w')
 check('Mantener dirección reanuda el movimiento al llegar',page.evaluate(f'Game.player.y<{y}-5'))
 ticks=page.evaluate('MenuScene.ticks');page.wait_for_timeout(90);check('El fondo del menú deja de dibujar durante la partida',page.evaluate('MenuScene.ticks')==ticks)
 page.evaluate('Hospital.toHospital(Game)');check('El despertar en el hospital también usa transición',page.evaluate("SceneTransitions.active&&Game.lvl==='hospital'"));arrived()
 page.evaluate("Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.state='play';Game.enemies=[];Game.carn=null;Game.player.invuln=50;UI.screen(null)")
 # Carga todas las plantas reales con los fundidos habilitados. Enemigos retirados para aislar presentación.
 for lvl in ['hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']:
  page.evaluate(f"Hospital.goto(Game,'{lvl}',FLOORS.{lvl}.spawn);Game.enemies=[];Game.carn=null;Game.player.invuln=50;Game.state='play'")
  check('Fundido y rótulo al llegar a '+lvl,page.evaluate(f"SceneTransitions.active&&Game.lvl==='{lvl}'&&document.querySelector('.scene-label').textContent===SceneTransitions.names['{lvl}']"));arrived()
 check('Las transiciones sucesivas no dejan bloqueados pantalla ni controles',page.evaluate("!SceneTransitions.active&&!document.body.classList.contains('scene-changing')&&getComputedStyle(document.getElementById('sceneTransition')).display==='none'"))
 page.evaluate("Hospital.goto(Game,'hospitalumbra',FLOORS.hospitalumbra.spawn);Game.enemies=[];Game.player.invuln=50");arrived()
 page.evaluate('Level.openDoor(Level.doors[0])');check('Abrir una puerta normal conserva el recorrido continuo',page.evaluate('!SceneTransitions.active'))
 page.evaluate('Game.save(0);Game.pause()');page.click('#bMenu');page.click('#bCont');page.locator('.save-slot').first.click()
 check('Cargar partida utiliza el mismo fundido seguro',page.evaluate("SceneTransitions.active&&Game.lvl==='hospitalumbra'"));arrived()
 page.evaluate("Game.story.restrained=false;Game.enemies=[];Game.carn=null;Game.player.hp=0;Game.die()");page.wait_for_timeout(1000);page.click('#bRetry')
 check('Reintentar muestra transición y recupera el guardado',page.evaluate("SceneTransitions.active&&Game.player.hp>0&&Game.lvl==='hospitalumbra'"));arrived()
 page.evaluate("const q=Endgame.data(Game);q.boss.won=true;q.choice='cure';q.complete=false;Endgame.finish(Game)")
 check('El final aparece mediante un fundido',page.evaluate("SceneTransitions.active&&Game.state==='end'"));arrived();check('El final permanece visible tras la transición',page.is_visible('#end') and not page.is_visible('#sceneTransition'))
 page.click('#bEnd');page.click('#bMenuOptions');page.locator('#menuReduceMotion').check();page.keyboard.press('Escape')
 # Dos tiempos fijos deben producir exactamente la misma superficie en movimiento reducido.
 check('Movimiento reducido elimina ondas y fogonazos',page.evaluate("(()=>{MenuScene.draw(.8);const a=MenuScene.canvas.toDataURL();MenuScene.draw(1.62);return MenuScene.motionReduced()&&a===MenuScene.canvas.toDataURL()})()"))
 start_new_game(page);page.wait_for_timeout(250);check('Movimiento reducido conserva un fundido breve sin bloqueo',page.evaluate("!SceneTransitions.active&&Game.state==='play'"))
 page.evaluate('MenuScene.reduced=false');page.emulate_media(reduced_motion='reduce');check('También se respeta la preferencia de movimiento del sistema',page.evaluate('MenuScene.motionReduced()'))
 check('Sin errores de JavaScript en presentación ni transiciones',not errors)
 (ROOT/'artifacts/polish-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'shot_luminance':brightness,'scope':'Menú v0.15.1, sin figuras humanas. Fundidos con reloj real; mapas y finales preparados para aislar presentación. No evalúa dificultad.'},ensure_ascii=False,indent=2)+'\n');b.close()
