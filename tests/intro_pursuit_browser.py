"""Recorrido inicial con IA y colisiones reales; revisión de brazos POV."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[];routes=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url);start_new_game(page);page.evaluate('Game.loop=()=>{}')
    page.evaluate("""window.introQA={
      start(pov){const g=Game;SceneTransitions.finish();g.startLvl='mansion';g.start(false);Hospital.toHospital(g);g.state='play';UI.screen(null);g.story.restrained=false;g.story.seq='room';g.player.x=22.5*32;g.player.y=7.5*32;g.player.knx=g.player.kny=0;g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;g.enemies=[g.carn];Level.openDoor(Level.doors.find(d=>d.id==='hab12'));FirstPerson.setEnabled(pov);Hospital.tick(g,.01);},
      walk(x,y,stopAtBrace=false){const g=Game,p=g.player,path=Nav.path(p.x,p.y,(x+.5)*32,(y+.5)*32);if(!path)throw Error('Sin ruta');let frames=0;for(;frames<1200&&g.state==='play';frames++){
        if(stopAtBrace&&IntroPursuit.bracing(g))break;
        while(path.length&&Math.hypot(path[0][0]-p.x,path[0][1]-p.y)<5)path.shift();if(!path.length)break;
        const [tx,ty]=path[0],dx=tx-p.x,dy=ty-p.y;p.angle=Math.atan2(dy,dx);g.mouse.x=tx-g.cam.x;g.mouse.y=ty-g.cam.y;
        g.keys=FirstPerson.enabled?{KeyW:true,ShiftLeft:true}:{KeyD:dx>3,KeyA:dx< -3,KeyS:dy>3,KeyW:dy< -3,ShiftLeft:true};g.update(1/60);
      }g.keys={};return frames;}
    };""")
    for pov in [False,True]:
        mode='POV' if pov else 'Topdown';page.evaluate('pov=>introQA.start(pov)',pov)
        check(mode+': la puerta trasera queda cerrada durante la huida',page.evaluate("!Level.doors.find(d=>d.id==='hab12').open&&Level.doors.find(d=>d.id==='hab12').key===IntroPursuit.rearKey"))
        page.evaluate("Game.carn.hunt=false;Game.carn.state='search';Game.player.hidden=true;Game.carn.update(.02,Game)")
        check(mode+': el perseguidor mantiene el objetivo aunque intentes perderlo',page.evaluate("Game.carn.hunt&&Game.carn.state==='chase'&&!Game.player.hidden"))
        page.evaluate('introQA.walk(43,7,true);Game.render()')
        check(mode+': se puede recorrer el pasillo y sus obstáculos hasta el cierre',page.evaluate("IntroPursuit.bracing(Game)&&Game.player.x>=43*32&&Game.story.seq==='run'"))
        page.evaluate("window.qaHeld=[Game.player.x,Game.player.y];window.qaStamina=Game.player.stamina;Game.carn.stagger=1;Game.keys={KeyW:true,KeyA:true,ShiftLeft:true};for(let i=0;i<25;i++)Game.update(1/60);Game.render()")
        check(mode+': empujar evita la esquiva final sin consumir estamina',page.evaluate('JSON.stringify(qaHeld)===JSON.stringify([Game.player.x,Game.player.y])&&Game.player.stamina>=qaStamina'))
        page.screenshot(path=str(ROOT/f'artifacts/intro-bracing-{mode.lower()}-v0240.png'))
        if pov:
            page.evaluate('window.qaSession=SessionSave.capture(Game);SessionSave.resume(qaSession);Game.state=\'play\';UI.screen(null)')
            check('POV: cerrar y reanudar durante el forcejeo conserva el recorrido',page.evaluate("IntroPursuit.bracing(Game)&&Game.player.x===qaSession.data.x&&Game.player.hp===qaSession.data.hp"))
        info=page.evaluate("""()=>{Game.carn.stagger=0;Game.keys={};let frames=0;for(;frames<600&&Game.story.seq==='run';frames++)Game.update(1/60);Game.render();return {frames,seq:Game.story.seq,hits:Game.story.firstDoorHits,hp:Game.player.hp,cut:Game.story.armCut,healed:Game.story.armHealed,open:Level.doors.find(d=>d.id==='forced').open};}""");routes.append({'mode':mode,**info})
        check(mode+': el golpe único abre la puerta y permite salir herido',info['seq']=='wounded_run' and info['hits']==1 and info['hp']==25 and info['cut'] and not info['healed'] and info['open'])
        page.evaluate('introQA.walk(52,17);Hospital.tick(Game,.01);introQA.walk(52,24)')
        check(mode+': el vestíbulo completa la huida y restaura el acceso trasero',page.evaluate("Game.story.seq==='lobby_inject'&&Game.carn.dormant&&Level.doors.find(d=>d.id==='hab12').open&&Level.doors.find(d=>d.id==='hab12').key===null"))
        page.evaluate('Guidebook.close(Game);Game.useInj();Game.render()')
        check(mode+': inyectarse devuelve la exploración normal',page.evaluate("Game.story.seq==='free'&&Game.story.armHealed&&!IntroPursuit.bracing(Game)"))
    page.evaluate("""Hospital.goto(Game,'hospital');Game.state='play';UI.screen(null);Game.player.x=48.5*32;Game.player.y=26.5*32;Game.player.angle=0;Game.player.hp=Game.player.maxHp;Game.player.stamina=100;Game.player.knx=Game.player.kny=0;Game.particles=[];Game.rings=[];Game.tracers=[];Game.projectiles=[];POVCameraMotion.reset();UI.msg('',1);Game.player.hidden=false;Game.player.hurtFlash=Game.player.poison=Game.player.slash=0;Game.carn=null;Game.enemies=[];Game.keys={};FirstPerson.pitch=0;FirstPerson.setEnabled(true);Game.inv.items=[];Game.player.weapons={};Game.player.weapon=null;Game.giveWeapon('pistol',12,true);Game.player.weapon=Game.player.weapons.pistol;Game.update(0);Game.render();UI.hud(Game.player,Game.inv,Game.mut);""")
    check('Los dos antebrazos tienen volumen mayor y las manos conservan el agarre',page.evaluate("POV3DViewmodel.arms.length===2&&POV3DViewmodel.arms.every(a=>a.forearm.scale.x>=.07&&a.sleeve.scale.x>=.1&&Math.abs(a.palm.scale.x)>=1.1&&a.gripDigits.visible)"))
    page.screenshot(path=str(ROOT/'artifacts/arms-pistol-v0240.png'))
    page.evaluate('Game.player.weapon=null;Game.render()');page.screenshot(path=str(ROOT/'artifacts/arms-unarmed-v0240.png'))
    check('Sin arma se muestran dos puños sobre los brazos existentes',page.evaluate('POV3DRenderer.stats.hands===2&&POV3DViewmodel.arms.every(a=>a.fistDigits.visible&&!a.gripDigits.visible)'))
    check('No hay errores JavaScript durante huida, carga o poses',not errors)
    (ROOT/'artifacts/intro-pursuit-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'routes':routes,'scope':'Recorrido preparado con entradas de movimiento, IA activa y colisiones de hospital en ambos modos. Empuje y golpe reales, sesión reanudada, inyección y revisión de mallas de brazos. WebGL mediante SwiftShader; no mide una campaña humana ni FPS de una GPU física.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
