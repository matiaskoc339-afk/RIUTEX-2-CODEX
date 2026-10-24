"""Planta alta y final C-0: rutas físicas con puertas, después combate con recursos finitos.
La exploración se aísla sin enemigos. El combate usa movimiento, tiros y recargas del motor.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1];passed=[]
def check(name,condition):
 assert condition,name
 passed.append(name);print('PASS',name,flush=True)
def take(page,id):
 page.evaluate("qa.take('"+id+"')")
 if page.evaluate("Game.state==='doc'"):page.keyboard.press('j')
def quiet(page):page.evaluate('Game.enemies=[];Game.carn=null;Game.keys={}')
with local_server(ROOT) as url,sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bNew');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((ROOT/'tests/walker.js').read_text())
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.resume();Game.story.seq='free';Game.player.x=52.5*32;Game.player.y=26.5*32;Game.inv.expand();Game.inv.expand();Game.inv.expand();Game.inv.expand()")
 quiet(page);take(page,'pp1');take(page,'hk_pase');take(page,'stairs_up');quiet(page)
 check('Subir desde vestíbulo con el pase y escalera reales',page.evaluate("Game.lvl==='hospital1'&&!Level.blocked(Game.player.x,Game.player.y,10)"))
 for id in ['hk_h07','p4','hk_bib','p3','hk_dir','p9','hk_fb','hrifle','h_safe']:take(page,id)
 check('La cadena UCI, habitación 07, Biblioteca, Dirección y Quirófano es transitable',page.is_visible('#pad') and page.evaluate("Game.inv.keys.includes('fusible_b')&&(Game.inv.keys.includes('director')||Game.story.artifactState.consumed.director)&&Game.picked.has('hrifle')&&Game.inv.items.some(i=>i.type==='inj_yellow')&&!Game.player.weapons.rifle"))
 for c in '0714':page.get_by_role('button',name=c,exact=True).click()
 page.get_by_role('button',name='OK',exact=True).click()
 check('La caja del director entrega la llave de la rampa',page.evaluate("Game.pz.h_safe&&Game.inv.keys.includes('garaje')"))
 rooms=page.evaluate("Level.rooms.map(r=>({n:r.n,x:r.x,y:r.y,w:r.w,h:r.h}))")
 for r in rooms:
  dest=page.evaluate("r=>{for(let dy=0;dy<r.h;dy++)for(let dx=0;dx<r.w;dx++){const x=r.x+(Math.floor(r.w/2)+dx)%r.w,y=r.y+(Math.floor(r.h/2)+dy)%r.h;if(Level.grid[y][x]===0)return [x,y];}}",r)
  page.evaluate('v=>qa.walk(...v)',dest)
  check('Planta alta: entrar y salir de '+r['n'],page.evaluate('r=>!!Game.story.visited["hospital1:"+r]',r['n']))
 take(page,'h_eeg')
 check('Electroencefalografía abre su mecanismo',page.evaluate("Game.state==='puzzle'&&BluePuzzles.cur.type==='eeg'"))
 # Frecuencias 2 / 4 / 3, usando los controles del tablero.
 for letter,n in [('A',1),('B',3),('C',2)]:
  for _ in range(n):page.get_by_label('Aumentar CANAL '+letter,exact=True).click()
 page.click('#puzzleConfirm');check('Calibración EEG resuelta y persistente',page.evaluate("Game.pz['blue:eeg']"))
 page.keyboard.press('m');check('Mapa de planta alta conserva las quince zonas visitadas',page.is_visible('#map') and page.evaluate('Object.keys(Game.story.visited).filter(k=>k.startsWith("hospital1:")).length===15'))
 page.screenshot(path=str(ROOT/'artifacts/upper-floor-v010.png'));page.keyboard.press('m');page.evaluate('Game.save(0)')
 # Regreso mediante ambas escaleras y comprobación de reentrada.
 take(page,'stairs_dn');quiet(page);take(page,'hk_coc');take(page,'hk_sot');take(page,'stairs_dn_b');quiet(page)
 check('Retorno al vestíbulo y acceso al sótano con la llave obtenida',page.evaluate("Game.lvl==='hospitalb'"))
 take(page,'stairs_up2');quiet(page);take(page,'stairs_up');quiet(page)
 check('Reentrada a la planta alta conserva puertas, objetos y EEG',page.evaluate("Game.pz['blue:eeg']&&!Game.items.some(i=>i.id==='hk_fb')&&Level.doors.find(d=>d.id==='dir').open"))
 take(page,'stairs_dn');quiet(page);take(page,'stairs_dn_b');quiet(page)
 # El circuito principal ya está cubierto por la prueba de progresión completa t4.
 page.evaluate("const oldKeys=[...Game.inv.keys],oldDocs=[...Game.inv.docs];Game.inv=new Inventory();Game.inv.keys=oldKeys;Game.inv.docs=oldDocs;for(let i=0;i<4;i++)Game.inv.expand();Game.player.weapons={};Game.player.weapon=null;Game.pz['h:power']=true;Level.openDoor(Level.doors.find(d=>d.id==='garage'));Game.giveWeapon('pistol',0,true);Game.player.weapon.mag=12;Game.inv.addAmmo('am_pistol',80);Game.player.hp=Game.player.maxHp=100;Game.player.stamina=100")
 page.evaluate('qa.walk(77,42);qa.step()')
 check('El garaje no fuerza un combate y permite aproximarse a la salida',page.evaluate("!Game.boss&&!Game.collapse&&Game.state==='play'"))
 page.keyboard.down('d');page.evaluate('qa.step(30)');page.keyboard.up('d')
 check('Caminar hacia la calle activa el hundimiento',page.evaluate('!!Game.collapse'))
 page.screenshot(path=str(ROOT/'artifacts/collapse-v010.png'));page.evaluate('qa.step(100);Game.render()')
 check('Caída sobre rejilla, con químicos debajo y jefe normal',page.evaluate("Game.lvl==='hospitalchem'&&Game.boss.phase===1&&Game.boss.active&&!Level.blocked(Game.player.x,Game.player.y,10)"))
 check('La llegada guarda un punto de control antes del combate',page.evaluate("Game.getSaveSlots()[3].lvl==='hospitalchem'&&Game.getSaveSlots()[3].x===9.5*32"))
 page.screenshot(path=str(ROOT/'artifacts/final-arena-v010.png'))
 page.keyboard.press('m');check('Plano C-0 disponible sin descubrir la galería',page.is_visible('#map') and page.get_by_role('button',name='Contención C-0',exact=True).count()==1 and page.evaluate("!Game.story.visited['hospitalchem:Galería lateral']"));page.keyboard.press('m')
 # Un primer intento inmóvil demuestra que los ataques son dañinos. Después se usa Reintentar.
 idle=page.evaluate("(()=>{const g=Game;g.keys={};for(let i=0;i<2000&&g.state==='play';i++)g.update(1/30);return {state:g.state,hp:g.player.hp};})()")
 check('Quedarse quieto ante el jefe acaba en muerte',idle['state']=='dead')
 page.click('#bRetry');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70)
 check('Reintentar devuelve a la llegada y a la primera forma',page.evaluate("Game.lvl==='hospitalchem'&&Game.boss.hp===1500&&Game.boss.phase===1&&Game.player.hp===100"))
 page.set_viewport_size({'width':1280,'height':720});page.wait_for_timeout(70);page.evaluate('Game.render()')
 check('Aviso y barra del jefe caben separados en 720p',page.locator('#finalCue').evaluate("e=>{const c=e.getBoundingClientRect(),b=document.getElementById('boss').getBoundingClientRect();return c.top>=0&&c.bottom<=b.top&&c.left>=0&&c.right<=innerWidth}"))
 page.screenshot(path=str(ROOT/'artifacts/final-720-v010.png'));page.set_viewport_size({'width':1440,'height':900});page.wait_for_timeout(70)
 # Preparación explícita: M9 base, 92 balas totales, 100 HP, sin habilidades ni mejoras.
 # Controlador conoce avisos: camina para conservar estamina y corre solo en peligro.
 combat=page.evaluate((ROOT/'tests/final_controller.js').read_text())
 print('COMBAT',combat,flush=True)
 check('Combate completo con tres formas, munición y salud finitas',combat['dead'] and combat['hp']>0 and combat['phases']==[1,2,3] and combat['shots']>25)
 check('Patrones distintos y ventanas de respuesta ejecutados',all(x in combat['attacks'] for x in ['charge','hook','leap','vents']) and combat['recoveries']>5)
 page.screenshot(path=str(ROOT/'artifacts/final-victory-v010.png'))
 check('Victoria desbloquea solo la puerta lateral',page.evaluate("Game.pz['h:boss']&&Level.doors.find(d=>d.id==='containment_exit').open&&Game.state==='play'"))
 page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((ROOT/'tests/walker.js').read_text())
 check('Cargar victoria conserva al jefe muerto y la compuerta abierta',page.evaluate("Game.boss.dead&&Game.pz['h:boss']&&Level.doors[0].open"))
 page.evaluate('qa.walk(36,19)');page.keyboard.down('d');page.evaluate('qa.step(15)');page.keyboard.up('d')
 check('La galería permite llegar a la escalera sin terminar la partida',page.evaluate("Game.state==='play'&&Game.lvl==='hospitalchem'"));page.evaluate("qa.take('wx_down')");check('La escalera lateral lleva al vestíbulo de la fábrica con el equipo',page.evaluate("Game.lvl==='hospitalworks'&&WorksMap.safe()&&!!Game.player.weapon"))
 page.screenshot(path=str(ROOT/'artifacts/final-ending-v010.png'))
 check('Sin errores JavaScript',not errors)
 (ROOT/'artifacts/finale-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'combat':combat,'scope':'Quince salas altas con movimiento y puertas, enemigos retirados solo para revisar geometría. Combate C-0 separado: M9 base, 92 balas, 100 HP, sin habilidades ni daño forzado. Controlador automatizado conoce los avisos; no representa la dificultad de una primera partida humana.'},ensure_ascii=False,indent=2))
 browser.close()
