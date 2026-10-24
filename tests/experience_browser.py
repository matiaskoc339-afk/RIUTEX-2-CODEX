"""Solo bajas, documentos y muestras: premios, controles, guardado y HUD."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server

R=Path(__file__).resolve().parents[1];passed=[];errors=[];metrics={}
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)

with local_server(R) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url);page.click('#bNew');page.evaluate("Game.loop=()=>{};SceneTransitions.finish();Game.cv.requestPointerLock=()=>{throw Error('La captura nativa se verifica en controls_v020; esta prueba aísla XP con el respaldo de control')};void 0");page.wait_for_timeout(60)
    page.evaluate("""window.xpqa={start(level='hospital'){
      const g=Game;g.startLvl='mansion';g.start(false);Hospital.toHospital(g);g.story.restrained=false;Hospital.inject(g);Hospital.lobbyReached(g);
      if(level!=='hospital')Hospital.goto(g,level,FLOORS[level].spawn);
      SceneTransitions.finish();g.story.seq='free';g.state='play';UI.screen(null);g.enemies=[];g.carn=null;g.keys={};g.player.invuln=999;
      if(level==='hospital'){g.player.x=44.5*32;g.player.y=29.5*32;}
      g.story.visited||={};for(const r of Level.rooms)g.story.visited[g.lvl+':'+r.n]=true;
      g.player.xp=0;g.player.angle=0;g.update(0);g.player.xp=0;g.render();
    }}""")
    for pov in [False,True]:
        result=page.evaluate("""pov=>{xpqa.start();const g=Game,p=g.player;FirstPerson.setEnabled(pov);g.giveWeapon('pistol',12,true);p.angle=0;p.stamina=100;p.spreadAdd=p.fireCd=0;
          const e=new Enemy('sonambulo',p.x+96,p.y,98100);e.hp=1;e.grace=999;g.enemies=[e];const mag=p.weapon.mag;Weapons.fire(g,p);g.update(0);g.render();const xp=p.xp,items=g.items.length;e.hurt(1000,0,g);e.die(g);
          return {xp,after:p.xp,dead:e.dead,spent:mag-p.weapon.mag,hud:document.getElementById('xp').textContent,items,afterItems:g.items.length};}""",pov)
        label='POV' if pov else 'Topdown';metrics[label]=result
        check(label+': un disparo letal real entrega 1 XP y lo muestra el HUD',result['dead'] and result['spent']==1 and result['xp']==1 and result['hud'].startswith('EXP 1 '))
        check(label+': daño repetido sobre el cadáver no duplica XP ni botín',result['after']==1 and result['items']==result['afterItems'])
        sources=page.evaluate("""pov=>{xpqa.start();const g=Game;FirstPerson.setEnabled(pov);g.story.visited={};g.update(0);const room=g.player.xp;
          const doc=g.items.find(i=>i.doc==='a1');g.take(doc);const document=g.player.xp;g.resume();g.take(doc);const repeated=g.player.xp;
          const sample=g.items.find(i=>i.type==='sample');g.take(sample);g.resume();return {room,document,repeated,pickup:g.player.xp,samples:g.inv.samples};}""",pov)
        check(label+': descubrir salas no da XP; documento nuevo da 2 una sola vez',sources['room']==0 and sources['document']==2 and sources['repeated']==2)
        check(label+': recoger una muestra no anticipa la XP de consumirla',sources['pickup']==2 and sources['samples']==1)
        page.keyboard.press('k')
        page.wait_for_function("Game.state==='tree'&&!FirstPerson.locked()&&!FirstPerson.capturePending")
        check(label+': el botón del árbol anuncia la recompensa real de 15 EXP','+15 EXP' in page.locator('#bSample').inner_text())
        page.click('#bSample')
        check(label+': absorber con el botón consume una muestra y suma exactamente 15 XP',page.evaluate('Game.player.xp===17&&Game.inv.samples===0') and page.locator('#bSample').is_disabled())
        page.keyboard.press('k')
        page.evaluate("BluePuzzles.open(Game,'mix')")
        for i,n in enumerate([2,1,3]):
            for _ in range(n):page.get_by_label('Aumentar CANAL '+chr(65+i),exact=True).click()
        page.click('#puzzleConfirm')
        check(label+': resolver el puzle con botones entrega inyecciones sin XP',page.evaluate("Game.player.xp===17&&Game.pz['blue:mix']&&(Game.inv.items.some(i=>i.type==='inj_green')||Game.stash.some(i=>i.type==='inj_green'))"))
        saved=page.evaluate("""(()=>{const g=Game;g.save(0);g.start(false,g.getSaveSlots()[0]);g.injectSample();g.openDoc('a1');return {xp:g.player.xp,samples:g.inv.samples,doc:g.inv.docs.includes('a1'),picked:g.picked.has('blue_sample_1')};})()""")
        check(label+': guardar/cargar, releer y absorber sin muestra no conceden XP',saved=={'xp':17,'samples':0,'doc':True,'picked':True})
    cases=[('hospital','sonambulo',1),('hospital1','cirujano',2),('hospitalworks','wx_listener',2),('hospitalworks','wx_mauler',2),('hospitalcastle','cl_hound',2),('hospitalcastle1','cl_shield',3),('hospitalumbra','lf_runner',3),('hospitalumbra','lf_sentinel',4)]
    for level,kind,expected in cases:
        xp=page.evaluate("""([level,type])=>{xpqa.start(level);const g=Game,e=type.startsWith('wx_')?new WorksEnemy(type,g.player.x+80,g.player.y,98200):type.startsWith('cl_')?new CastleEnemy(type,g.player.x+80,g.player.y,98200):type.startsWith('lf_')?new EndEnemy(type,g.player.x+80,g.player.y,98200):new Enemy(type,g.player.x+80,g.player.y,98200);g.enemies=[e];e.hurt(100000,0,g);return g.player.xp;}""",[level,kind])
        check(kind+': recompensa baja y correspondiente a su zona',xp==expected)
    bosses=[('hospital','new EscoltaC17(1197,100,100,360)',6),('hospitalchem','Game.boss',11),('hospitalpit',"new WorksEnemy('wx_keeper',100,100,6900)",10),('hospitalworks','new SuitCustodian(100,100)',6),('hospitalnest','Game.boss',14),('hospitalcells','Game.prisoner',8),('hospitalroyal','Game.boss',18),('hospitalorigin','Game.boss',29)]
    for level,ctor,expected in bosses:
        result=page.evaluate("""([level,ctor])=>{xpqa.start(level);const g=Game,b=eval(ctor);g.enemies=[b];b.die(g);const xp=g.player.xp;b.die(g);return {xp,after:g.player.xp,dead:b.dead};}""",[level,ctor])
        check(level+': jefe/minijefe entrega su premio una sola vez',result['dead'] and result['xp']==expected and result['after']==expected)
    purchase=page.evaluate("""(()=>{xpqa.start();const g=Game;g.enemies=[];for(let i=0;i<4;i++)new Enemy('sonambulo',1400,944,98300+i).hurt(1000,0,g);const earned=g.player.xp;g.buySkill('vigor');const after=g.player.xp,owned=g.mut.has('vigor');g.player.xp=123;g.save(0);g.start(false,g.getSaveSlots()[0]);return {earned,after,owned,loaded:g.player.xp,skill:g.mut.has('vigor')};})()""")
    check('Cuatro bajas permiten una primera mejora; guardar/cargar conserva XP y habilidad',purchase=={'earned':4,'after':0,'owned':True,'loaded':123,'skill':True})
    check('Sin errores JavaScript',not errors)
    version=json.loads((R/'package.json').read_text())['version']
    (R/'artifacts/experience-browser-results.json').write_text(json.dumps({'version':version,'passed':passed,'errors':errors,'kills':metrics,'scope':'Disparo letal preparado, documentos y muestras reales, botón de absorción y puzle por controles en ambas perspectivas, compra y guardado. La captura nativa se deniega deliberadamente para aislar XP durante reinicios rápidos; se prueba aparte en controls_v020. El modo POV sí renderiza WebGL. Las muertes preparadas de jefes aíslan XP y no son combates completos.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
