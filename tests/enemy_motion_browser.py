"""Animación WebGL y presión de combate: escenarios preparados, sin medir dificultad humana."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

ROOT = Path(__file__).resolve().parents[1]
passed, errors = [], []
def check(name, condition):
    assert condition, name
    passed.append(name)
    print('PASS', name, flush=True)

with local_server(ROOT) as url, sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--enable-webgl'])
    page = browser.new_page(viewport={'width':1280,'height':800})
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url); start_new_game(page)
    page.evaluate("Game.loop=()=>{};Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.story.armCut=true;Game.state='play';UI.screen(null);FirstPerson.setEnabled(true);Game.render()")
    page.evaluate("""window.motionQA={
      pose(root){const out=[];root.traverse(n=>{if(n.isGroup)out.push(...n.position.toArray(),...n.quaternion.toArray(),...n.scale.toArray());});return JSON.stringify(out);},
      advance(root,e,frames=30){for(let i=0;i<frames;i++){Game.t+=1/60;POV3DAssets.animateEnemy(root,e,Game,Game.t,1/60);}root.updateMatrixWorld(true);},
      prepare(){const g=Game;Hospital.goto(g,'hospital');g.state='play';UI.screen(null);g.enemies=[];g.custodio=null;g.player.x=44.5*32;g.player.y=29.5*32;g.player.angle=0;g.player.hurtFlash=g.player.poison=0;g.player.knx=g.player.kny=0;g.keys={};g.player.hidden=false;g.carn.dormant=false;g.carn.active=false;g.carn.scripted=false;g.carn.x=g.player.x+135;g.carn.y=g.player.y;g.carn.face=Math.PI;g.carn.state='chase';g.enemies=[g.carn];g.inv.items=[];g.player.weapon=null;g.giveWeapon('pistol',12,true);g.t+=.02;FirstPerson.pitch=0;g.update(0);g.render();UI.hud(g.player,g.inv,g.mut);}
    };""")
    result = page.evaluate("""()=>{const out=[];for(const type of [...Object.keys(ENEMY_TYPES),'carnicero']){
      const e={type,def:ENEMY_TYPES[type]||{},id:42,phase:1,x:0,y:0,mode:'idle'},r=POV3DAssets.enemy(e,Game);
      motionQA.advance(r,e,1);const a=motionQA.pose(r);motionQA.advance(r,e);const b=motionQA.pose(r);
      let invalid=false;r.traverse(n=>{invalid||=!n.matrixWorld.elements.every(Number.isFinite);});
      out.push({type,idle:a!==b,invalid});POV3DRenderer.disposeObject(r);
    }return out;}""")
    check('Todas las criaturas articuladas se mueven en reposo; la torreta conserva su base fija', all(r['idle'] or r['type']=='torreta' for r in result))
    check('Las 43 especies y el Carnicero conservan matrices finitas', not any(r['invalid'] for r in result))
    page.evaluate('motionQA.prepare()')
    check('El render real del hospital invoca el nuevo sistema de movimiento', page.evaluate("POV3DRenderer.actors.get(900).root.userData.motion.mode==='chase'"))
    page.evaluate("Game.carn.state='windup';Game.carn.mt=.45;Game.carn.dir=Game.carn.face;Game.t+=.02;Game.render();window.qaRoot=POV3DRenderer.actors.get(900).root;window.qaWind=motionQA.pose(qaRoot)")
    check('Preparación del Carnicero usa state aunque mode sea chase', page.evaluate("qaRoot.userData.motion.mode==='windup'&&qaRoot.userData.rig.arms[1].rotation.x<-.9"))
    page.evaluate("Game.carn.mt=.03;Game.t+=.2;Game.render()")
    check('El corte progresa con su aviso, sin pose única estática', page.evaluate('motionQA.pose(qaRoot)!==qaWind'))
    page.screenshot(path=str(ROOT/'artifacts/motion-carnicero-v0220.png'))
    page.evaluate("Game.carn.state='recover';Game.carn.mt=.5;for(let i=0;i<8;i++){Game.t+=1/60;Game.render();}")
    check('El golpe muestra su seguimiento antes de recuperar', page.evaluate('qaRoot.userData.motion.impact>0'))
    page.evaluate("Game.carn.state='rushWind';Game.carn.mt=.4;Game.carn.dir=Game.carn.face;Game.t+=.03;Game.render()")
    check('La carga nueva tiene aviso físico proyectado al suelo', page.evaluate('POV3DRenderer.stats.groundCues>0&&qaRoot.userData.motion.mode===\'rushWind\''))
    page.evaluate("window.qaPause=motionQA.pose(qaRoot);window.qaClock=qaRoot.userData.motion.time;Game.state='pause';Game.t+=.5;Game.render()")
    check('Pausar mantiene las articulaciones y el reloj de la animación', page.evaluate('motionQA.pose(qaRoot)===qaPause&&qaRoot.userData.motion.time===qaClock'))
    page.evaluate("Game.state='play';Game.carn.frozen=2;Game.t+=.5;Game.render()")
    check('El poder de congelar conserva la pose hasta descongelar', page.evaluate('motionQA.pose(qaRoot)===qaPause'))
    page.evaluate("Game.carn.frozen=0;FirstPerson.setEnabled(false);Game.t+=.5;Game.render()")
    check('Topdown no ejecuta las animaciones 3D', page.evaluate('qaRoot.userData.motion.time===qaClock&&!POV3DRenderer.visible'))
    page.evaluate('FirstPerson.setEnabled(true);Game.state=\'play\';motionQA.prepare()')
    measurements = page.evaluate("""()=>{const out=[];for(const type of ['carnicero','ds_matriarch','cl_regent','lf_wren'])for(const phase of [1,2,3]){
      const e={type,def:ENEMY_TYPES[type]||{},id:9,phase,x:Game.player.x+120,y:Game.player.y,mode:'wind',clock:.03,windMax:.8,active:true,attack:'cleave'};
      const r=POV3DAssets.enemy(e,Game);POV3DRenderer.fitActor(r,e,Game);let maxY=0;
      for(const mode of ['wind','recover','rush','mutate'])for(let i=0;i<25;i++){
        e.mode=mode;motionQA.advance(r,e,1);const bounds=new THREE.Box3().setFromObject(r);maxY=Math.max(maxY,bounds.max.y);
      }
      out.push({type,phase,ceiling:POV3DRenderer.ceilingAt(e.x,e.y,Game),maxY,invalid:!Number.isFinite(maxY)});
      POV3DRenderer.disposeObject(r);
    }return out;}""")
    check('Las doce mutaciones admiten animación con geometría finita', not any(r['invalid'] for r in measurements))
    check('Las armas y mutaciones animadas respetan la altura de un techo bajo', all(r['maxY']<=r['ceiling'] for r in measurements))
    check('La vista clásica vuelve a POV sin duplicar manos ni criaturas', page.evaluate('POV3DRenderer.visible&&POV3DRenderer.stats.hands===2&&POV3DRenderer.stats.visibleEnemies===1'))
    check('No hay errores JavaScript durante los cambios de postura o perspectiva', not errors)
    (ROOT/'artifacts/enemy-motion-browser-results.json').write_text(json.dumps({
        'version':json.loads((ROOT/'package.json').read_text())['version'], 'passed':passed,'errors':errors,
        'models':result,'boss_bounds':measurements,'scope':'WebGL real con SwiftShader. Estados y tiempos preparados; no es una campaña humana ni una garantía de FPS.'
    },ensure_ascii=False,indent=2)+'\n')
    browser.close()
