"""Recorrido vertical ampliado: arrastre/flechas reales y render en los extremos."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

R=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)

with local_server(R) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1280,'height':720});page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url);start_new_game(page);page.evaluate("Game.loop=()=>{};SceneTransitions.finish();Game.enemies=[];Game.keys={};FirstPerson.setEnabled(true);FirstPerson.setSensitivity(100)");page.wait_for_timeout(60)
    page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;Game.player.x=51.5*32;Game.player.y=29.5*32;Game.player.angle=0;Game.giveWeapon('pistol',12,true);Game.update(0);Game.render()")
    signature=page.evaluate('JSON.stringify([Game.player.x,Game.player.y,Game.player.hp,Game.player.stamina,Game.player.energy,Game.player.weapon.mag])')
    def drag(direction,n=2):
        a,b=(70,640) if direction>0 else (640,70)
        for _ in range(n):
            page.mouse.move(640,a);page.mouse.down(button='right');page.mouse.move(640,b,steps=8);page.mouse.up(button='right')
    drag(-1)
    check('Arrastrar arriba supera ampliamente el antiguo límite',page.evaluate('FirstPerson.pitch<=-1.2'))
    for direction,name in [(-1,'techo'),(1,'suelo')]:
        drag(direction,5)
        frame=page.evaluate("()=>{Game.render();const v=FirstPersonRenderer.camera,W=Game.cv.width,H=Game.cv.height;return {pitch:FirstPerson.pitch,horizon:v.horizon,height:H,center:FirstPersonRenderer.stats.crosshair,pixel:Array.from(Game.ctx.getImageData(Math.floor(W/2),Math.floor(H/2),1,1).data),finite:[v.horizon,v.focal,v.eye].every(Number.isFinite)}}")
        check('Mirar al '+name+' alcanza el límite ampliado sin invertir la imagen',abs(frame['pitch']-direction*1.4)<1e-8 and frame['finite'] and (frame['horizon']>frame['height'] if direction<0 else frame['horizon']<0))
        check('La retícula permanece centrada mirando al '+name,frame['center']['y']==frame['height']/2 and frame['pixel'][:3]==[221,228,213])
        page.screenshot(path=str(R/('artifacts/pov-pitch-'+name+'-v0172.png')))
    page.mouse.move(640,380);page.mouse.down(button='right');page.mouse.move(640,300,steps=4);page.mouse.up(button='right')
    check('Invertir el ratón responde al instante tras alcanzar el tope',page.evaluate('FirstPerson.pitch<1.4&&FirstPerson.pitch>0'))
    for key,direction in [('ArrowUp',-1),('ArrowDown',1)]:
        page.evaluate('FirstPerson.pitch=0');page.keyboard.down(key);page.evaluate('for(let i=0;i<180;i++)FirstPerson.tick(1/60,Game)');page.keyboard.up(key)
        check(key+': las flechas alcanzan el mismo recorrido',abs(page.evaluate('FirstPerson.pitch')-direction*1.4)<1e-8)
    for sensitivity in [25,250]:
        page.evaluate('v=>{FirstPerson.setSensitivity(v);FirstPerson.pitch=0}',sensitivity);drag(-1,7)
        check('La sensibilidad '+str(sensitivity)+' % conserva el recorrido completo',abs(page.evaluate('FirstPerson.pitch')+1.4)<1e-8)
    check('Mirar en los extremos no mueve al jugador ni consume recursos',page.evaluate('JSON.stringify([Game.player.x,Game.player.y,Game.player.hp,Game.player.stamina,Game.player.energy,Game.player.weapon.mag])')==signature)
    maps=['mansion','hospital','hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']
    for level in maps:
        for pitch in [-1.4,1.4]:
            valid=page.evaluate("([level,pitch])=>{if(level==='mansion')Game.start(false);else Hospital.goto(Game,level,FLOORS[level].spawn);SceneTransitions.finish();Game.enemies=[];Game.carn=null;Game.keys={};Game.player.hidden=false;FirstPerson.pitch=pitch;Game.render();const p=FirstPersonRenderer.project(Game.player.x+90,Game.player.y,24);return FirstPerson.active(Game)&&[p.x,p.y,p.scale,p.depth,FirstPersonRenderer.camera.horizon].every(Number.isFinite)&&Game.ctx.getImageData(0,0,1,1).data[3]===255}",[level,pitch])
            check(level+': render estable con inclinación '+str(pitch),valid)
    check('Sin errores JavaScript',not errors)
    version=json.loads((R/'package.json').read_text())['version']
    (R/'artifacts/pov-pitch-browser-results.json').write_text(json.dumps({'version':version,'passed':passed,'errors':errors,'max_pitch':1.4,'previous_max_pitch':.28,'maps':maps,'scope':'Arrastre y flechas reales; límites y retícula. Quince mapas preparados en ambas inclinaciones extremas, sin enemigos para aislar cámara y render.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
