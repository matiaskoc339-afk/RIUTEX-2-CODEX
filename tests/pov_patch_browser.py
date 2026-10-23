"""Regresión POV: mirada vertical y estancias sin visitar, con oclusión física real."""
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
    page.click('#bNew')
    page.evaluate('Game.loop=()=>{};SceneTransitions.finish()')
    page.wait_for_timeout(60)
    page.evaluate("""Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);
      Game.story.seq='free';Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;Game.keys={};
      Game.player.x=44.5*32;Game.player.y=29.5*32;Game.player.angle=0;Game.player.walkT=0;
      Game.player.flash=Game.cam.shake=0;Game.particles=[];Game.tracers=[];Game.rings=[];Game.pools=[];
      FirstPerson.setEnabled(true);FirstPerson.pitch=0;Game.render();
      window.povLandmark=()=>{Game.render();return FirstPersonRenderer.project(Game.player.x+120,Game.player.y,26).y};
    """)
    # La ruta alternativa recibe eventos reales del navegador, sin llamar a look().
    baseline = page.evaluate('povLandmark()')
    yaw = page.evaluate('Game.player.angle')
    page.mouse.move(740, 430)
    page.mouse.down(button='right')
    page.mouse.move(740, 350, steps=4)
    page.mouse.up(button='right')
    up = page.evaluate('povLandmark()')
    check('Arrastrar el ratón arriba mira arriba: el punto fijo baja en pantalla', up > baseline + 20)
    page.evaluate('FirstPerson.pitch=0')
    page.mouse.move(740, 350)
    page.mouse.down(button='right')
    page.mouse.move(740, 430, steps=4)
    page.mouse.up(button='right')
    down = page.evaluate('povLandmark()')
    check('Arrastrar el ratón abajo mira abajo: el punto fijo sube en pantalla', down < baseline - 20)
    check('La mirada vertical conserva el giro horizontal', abs(page.evaluate('Game.player.angle') - yaw) < 1e-8)
    page.evaluate('FirstPerson.pitch=0')
    page.keyboard.down('ArrowUp')
    page.evaluate('for(let i=0;i<10;i++)FirstPerson.tick(1/60,Game)')
    page.keyboard.up('ArrowUp')
    check('Flecha arriba tiene el mismo sentido de cámara', page.evaluate('povLandmark()') > baseline + 20)
    page.evaluate('FirstPerson.pitch=0')
    page.keyboard.down('ArrowDown')
    page.evaluate('for(let i=0;i<10;i++)FirstPerson.tick(1/60,Game)')
    page.keyboard.up('ArrowDown')
    check('Flecha abajo tiene el mismo sentido de cámara', page.evaluate('povLandmark()') < baseline - 20)

    # Comparar el framebuffer con/sin el mismo enemigo a tiempo fijo evita confundir
    # una estancia dibujada con una entidad filtrada antes de comprobar profundidad.
    page.evaluate("""window.povRoomProbe=(cfg)=>{
      const g=Game,p=g.player,d=Level.doors.find(d=>d.id===cfg.door);
      p.x=cfg.p[0]*32;p.y=cfg.p[1]*32;p.angle=Math.PI;p.walkT=0;FirstPerson.pitch=0;
      g.story.visited={[g.lvl+':'+cfg.origin]:true};g.story.mapTiles={};g.enemies=[];
      const e=new Enemy('sonambulo',cfg.enemy[0]*32,cfg.enemy[1]*32,99881);e.hp=e.maxHp=500;e.grace=999;
      const read=()=>g.ctx.getImageData(0,0,g.cv.width,g.cv.height).data;
      const changes=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n};
      const frame=(enemy)=>{g.enemies=enemy?[e]:[];const random=Math.random;try{Math.random=()=>.5;g.render();return read()}finally{Math.random=random}};
      Level.openDoor(d);const empty=frame(false),visible=changes(empty,frame(true));
      const visited=!!g.story.visited[g.lvl+':'+cfg.target];
      const mapped=(g.story.mapTiles[g.lvl]||[]).includes(cfg.tile);
      Level.closeDoor(d,true);const closed=frame(false),occluded=changes(closed,frame(true));
      Level.openDoor(d);FirstPerson.setEnabled(false);g.cam.x=p.x-g.cv.width/2;g.cam.y=p.y-g.cv.height/2;
      frame(true);
      const classicPixel=Array.from(g.ctx.getImageData(Math.floor(e.x-g.cam.x),Math.floor(e.y-g.cam.y),1,1).data).slice(0,3);
      FirstPerson.setEnabled(true);g.enemies=[e];g.render();
      return {visible,occluded,classicPixel,visited,mapped};
    };void 0""")
    fixtures = [
        {'door': 'lob_w', 'p': [38.5, 28.5], 'enemy': [34.5, 28.5], 'origin': 'Vestíbulo central', 'target': 'Pasillo oeste', 'tile': '34,28'},
        {'door': 'ofi', 'p': [18.5, 25.5], 'enemy': [14.5, 25.5], 'origin': 'Ala oeste', 'target': 'Oficinas', 'tile': '14,25'},
    ]
    probes = []
    for fixture in fixtures:
        result = page.evaluate('povRoomProbe', fixture)
        probes.append({'room': fixture['target'], **result})
        check(fixture['target'] + ': POV ve al enemigo antes de entrar por la puerta abierta', result['visible'] > 50)
        check(fixture['target'] + ': cerrar la puerta oculta al mismo enemigo', result['occluded'] == 0)
        check(fixture['target'] + ': mirar desde fuera no descubre visitas ni plano', not result['visited'] and not result['mapped'])
        check(fixture['target'] + ': topdown conserva la máscara de estancia desconocida', result['classicPixel'] == [3, 6, 9])

    page.evaluate("Game.player.weapons={};Game.player.weapon=null;Game.giveWeapon('pistol',24,true);Game.update(0);Game.render()")
    page.screenshot(path=str(R / 'artifacts/pov-unvisited-office-v0161.png'))
    check('Sin errores JavaScript durante los cambios de perspectiva', not errors)
    version = json.loads((R / 'package.json').read_text())['version']
    (R / 'artifacts/pov-patch-browser-results.json').write_text(json.dumps({
        'version': version, 'passed': passed, 'errors': errors, 'occlusion': probes,
        'look': {'baseline': baseline, 'up': up, 'down': down},
        'scope': 'Eventos reales de arrastre y flechas; framebuffer en dos puertas físicas. Escenarios preparados, sin simular combate.'
    }, ensure_ascii=False, indent=2) + '\n')
    browser.close()
