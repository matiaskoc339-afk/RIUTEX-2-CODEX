"""Decisiones reales y avisos en ambas vistas; las victorias se prueban aparte."""
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
    page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url)
    page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()')
    for pov in [False,True]:
        label='POV' if pov else 'Topdown'
        page.evaluate("""pov=>{FirstPerson.enabled=false;Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.carn=null;Game.noise=Game.worksNoise=null;Game.clSounds=[];Game.keys={};Game.player.hidden=false;Game.player.cloak=0;Game.player.x=800;Game.player.y=600;Game.player.angle=Math.PI;Game.player.hurtFlash=Game.player.poison=0;
          Level.W=40;Level.H=30;Level.grid=Array.from({length:30},(_,y)=>Array.from({length:40},(_,x)=>!x||!y||x===39||y===29?1:0));Level.props={};Level.doors=[];Level.lamps=[];Level.safeRects=[];Level.rooms=[{n:'Sala de prueba',x:1,y:1,w:38,h:28}];
          Game.enemies=[new Enemy('cazador',560,550,90101),new Enemy('cazador',560,650,90102)];for(const e of Game.enemies)e.face=0;FirstPerson.enabled=pov;FirstPerson.captureWanted=false;for(let i=0;i<6;i++)for(const e of Game.enemies)e.update(.1,Game);Game.render();}""",pov)
        check(label+': los corredores se colocan en flancos distintos',page.evaluate("Game.enemies.every(e=>e.miState==='flank')&&Math.abs(Game.enemies[0].miGoalY-Game.enemies[1].miGoalY)>80"))
        page.evaluate('window.qaClues=Game.enemies.map(e=>[e.miLastX,e.miLastY]);Game.player.hidden=true;Game.player.x=1000;Game.player.y=750;for(let i=0;i<15;i++)for(const e of Game.enemies)e.update(.1,Game)')
        check(label+': ocultarse conserva la última pista sin seguir la posición nueva',page.evaluate('Game.enemies.every((e,i)=>e.miLastX===qaClues[i][0]&&e.miLastY===qaClues[i][1]&&!e.miVisible)'))
        if pov:check('Los nuevos comportamientos usan actores WebGL reales',page.evaluate('POV3DRenderer.stats.realMeshes&&POV3DRenderer.stats.billboards===0'))
        for level in ['hospitalchem','hospitalnest','hospitalroyal','hospitalorigin']:
            info=page.evaluate("""level=>{FirstPerson.enabled=false;Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Game.story.seq='free';Game.state='play';Hospital.goto(Game,level);Game.state='play';UI.screen(null);Game.keys={};Game.player.hidden=false;Game.player.cloak=0;Game.player.invuln=0;Game.player.hurtFlash=Game.player.poison=0;
              const b=Game.boss;b.active=true;Game.curBoss=b;Game.enemies=[b];const point=BossIntelligence.clamp(b,b.x+270,b.y+70,110);Game.player.x=point[0];Game.player.y=point[1];Game.player.reloading=1.5;b.mode='recover';b.clock=3;
              FirstPerson.enabled=window.qaPov;FirstPerson.captureWanted=false;for(let i=0;i<9;i++){Game.player.y+=2;Game.t+=.05;b.update(.05,Game);}b.mode='stalk';b.clock=0;b.choose(Game);window.qaBoss=b;const result={attack:b.attack,reason:b.biReason,clock:b.clock,decisions:b.biDecisions,mode:b.mode};Game.render();return result;}""".replace('window.qaPov','true' if pov else 'false'),level)
            check(label+' / '+level+': decide según observación y anuncia su ataque',info['decisions']>0 and info['mode']=='wind' and info['clock']>=.6)
            fixed=page.evaluate("""(()=>{const b=qaBoss,dir=b.dir,target=[...b.target];Game.player.x-=70;Game.player.y+=65;b.update(.1,Game);return b.dir===dir&&b.target[0]===target[0]&&b.target[1]===target[1];})()""")
            check(label+' / '+level+': desplazarse después del aviso no redirige el golpe',fixed)
            hidden=page.evaluate("""(()=>{const b=qaBoss,x=b.biX,y=b.biY;Game.player.hidden=true;Game.player.x+=150;b.mode='stalk';b.clock=0;b.update(.1,Game);const attacks=b.biDecisions;b.choose(Game);return b.biX===x&&b.biY===y&&b.biDecisions===attacks&&b.mode!=='wind';})()""")
            check(label+' / '+level+': al perderte busca el último punto sin ataque mágico',hidden)
    check('No hay errores JavaScript en las cuatro arenas y ambas perspectivas',not errors)
    (ROOT/'artifacts/intelligence-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'scope':'Escenarios preparados de grupo y cuatro arenas, observación y ataques reales en topdown/POV WebGL. Sin forzar daño; victorias completas en los controladores de campaña separados.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
