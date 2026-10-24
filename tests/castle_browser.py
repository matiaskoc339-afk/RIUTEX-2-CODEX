"""Museo: recorrido físico, mecanismos, equipo y jefe. Combate ciego aislado en otro grupo."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
R=Path(__file__).resolve().parents[1];passed=[]
def check(n,v):
 assert v,n
 passed.append(n);print('PASS',n,flush=True)
def quiet():page.evaluate('Game.enemies=Game.enemies.filter(e=>e instanceof BlindCarver||e instanceof RoyalRegent);Game.carn=null;Game.keys={}')
def take(id):
 page.evaluate('id=>qa.take(id)',id)
 if page.evaluate("Game.state==='doc'"):page.keyboard.press('j')
def floor(up):
 target='hospitalcastle1' if up else 'hospitalcastle'
 if page.evaluate('Game.lvl')!=target:take('cl_mid_up' if up else 'cl_mid_down');quiet()
def click(i):page.locator('[data-cl="'+str(i)+'"]').click()
def order(target):
 for i,n in enumerate(target):
  j=page.evaluate('n=>CastlePuzzles.values(Game).v.indexOf(n)',n)
  if i!=j:click(i);click(j)
def pour_path():return page.evaluate("""(()=>{const start=CastlePuzzles.values(Game).v,q=[start],s=new Map([[start.join(','),[]]]);for(let pos=0;pos<q.length;pos++){const a=q[pos],p=s.get(a.join(','));if(a.join(',')==='6,6,0')return p;for(let i=0;i<3;i++)for(let j=0;j<3;j++)if(i!==j){const b=a.slice(),n=Math.min(a[i],[12,7,5][j]-a[j]);b[i]-=n;b[j]+=n;const k=b.join(',');if(!s.has(k)){s.set(k,[...p,[i,j]]);q.push(b);}}}})()""")
def gears_path():return page.evaluate("""(()=>{const q=[CastlePuzzles.values(Game).v],s=new Map([[q[0].join(','),[]]]);for(let pos=0;pos<q.length;pos++){const a=q[pos],p=s.get(a.join(','));if(a.every(v=>v===0))return p;for(let i=0;i<4;i++){const b=a.slice();b[i]=(b[i]+1)%6;b[(i+1)%4]=(b[(i+1)%4]+5)%6;const k=b.join(',');if(!s.has(k)){s.set(k,[...p,i]);q.push(b);}}}})()""")
def slide_path():return page.evaluate("""(()=>{const q=[CastlePuzzles.values(Game).v],s=new Map([[q[0].join(','),[]]]);for(let pos=0;pos<q.length;pos++){const a=q[pos],p=s.get(a.join(','));if(a.every((n,i)=>n===i))return p;const h=a.indexOf(8);for(const i of [h-3,h-1,h+1,h+3])if(i>=0&&i<9&&Math.abs(i%3-h%3)+Math.abs(Math.floor(i/3)-Math.floor(h/3))===1){const b=a.slice();[b[i],b[h]]=[b[h],b[i]];const k=b.join(',');if(!s.has(k)){s.set(k,[...p,i]);q.push(b);}}}})()""")
with local_server(R) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bNew');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text())
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Game.story.seq='free';Game.pz['h:boss']=Game.pz['h:ds_spider']=true;Game.killed.add(900);Game.resume();Hospital.goto(Game,'hospitalnest',[53,21]);Game.giveWeapon('pistol',24,true)")
 page.keyboard.down('d');page.evaluate("for(let i=0;i<30&&Game.lvl==='hospitalnest';i++)Game.update(1/30)");page.keyboard.up('d');page.evaluate('Game.update(.01);Game.render()');check('Caminar por la salida de la Matriarca sube al calabozo con el equipo',page.evaluate("Game.lvl==='hospitalcells'&&Game.state==='play'&&!!Game.player.weapon&&Depths.data().complete&&!Game.prisoner.active"));page.screenshot(path=str(R/'artifacts/castle-arrival-v013.png'))
 take('cl_silence');check('Advertencia explica suelo limpio, correr, cristales, ruido y contacto',page.evaluate("Game.inv.docs.includes('cl_silence')&&DOCS.cl_silence.text.includes('EL LUGAR DONDE SONÓ')"))
 # Estado controlado para revisar la entrada y el corte; el combate real tiene grupo propio.
 page.evaluate('qa.walk(17,31);qa.step();Game.render()');check('Cruzar la reja inicia al Tallador sin atrapar al jugador dentro de la puerta',page.evaluate("Game.prisoner.active&&!Level.blocked(Game.player.x,Game.player.y,Game.player.r)&&!Level.doors.find(d=>d.id==='cl_cells_entry').open"));page.screenshot(path=str(R/'artifacts/castle-prison-v013.png'))
 page.evaluate('qa.walk(31,29)')
 idle=page.evaluate("(()=>{Game.keys={};for(let i=0;i<10000&&Game.state==='play';i++)Game.update(1/30);return {state:Game.state,hp:Game.player.hp}})()");check('Patrullar puede encontrar por contacto a un jugador inmóvil y matarlo',idle['state']=='dead');page.click('#bRetry');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text());check('Reintentar conserva el punto de entrada al calabozo',page.evaluate("Game.lvl==='hospitalcells'&&Game.prisoner.hp===720&&Game.player.hp===100"))
 page.evaluate("Game.prisoner.active=true;Game.prisoner.hurt(9999,0,Game);Game.keys={}")
 # Solo se fuerza el desenlace de este encuentro en la comprobación geométrica.
 key_id=page.evaluate("Game.items.find(i=>i.type==='cl_keydrop').id");take(key_id);check('La llave se recoge del suelo y abre la escalera del museo',page.evaluate("!Game.inv.keys.includes('cl_prison_key')&&Game.pz['h:cl_prison']&&Level.doors.find(d=>d.id==='cl_cells_exit').open"));take('cl_cells_up');quiet();page.evaluate('qa.step();Game.render()');check('Vestíbulo permite regresar, guardar, usar baúl y mejorar armas',page.evaluate("Game.lvl==='hospitalcastle'&&CastleMap.safe()&&Workshop.powered(Game)&&Game.items.some(i=>i.type==='savebed')&&Game.items.some(i=>i.type==='caja')"));page.screenshot(path=str(R/'artifacts/castle-hub-v013.png'))
 take('cl_hub_save');check('La camilla conserva los tres espacios de guardado',page.locator('.save-slot').count()==3);page.locator('.save-slot').first.click();take('cl_welcome');take('cl_west_note');take('cl_portrait_note');take('cl_portraits');page.click('#clPuzzleConfirm');check('Retratos exige su pieza sin consumir progreso',not page.evaluate("Game.pz['h:cl_portraits']") and 'Aceite' in page.inner_text('#clPuzzleFeedback'));page.keyboard.press('Escape')
 take('cl_oil_pick');take('cl_portraits');click(0);click(2);page.keyboard.press('Escape');page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text());quiet();take('cl_portraits');check('Intercambios parciales sobreviven a recargar la partida',page.evaluate("CastlePuzzles.values(Game).v.join(',')==='0,1,3,2'"));order([0,1,2,3]);page.screenshot(path=str(R/'artifacts/castle-portraits-v013.png'));page.click('#clPuzzleConfirm');check('Historia de los cuadros devuelve luz sin regalar la campana',page.evaluate("Game.pz['h:cl_portraits']&&!Game.pz['h:cl_balance']"))
 floor(True);take('cl_light_note');take('cl_west_light');
 for i,n in enumerate([0,0,1,0]):
  if page.evaluate('i=>CastlePuzzles.values(Game).v[i]',i)!=n:click(i)
 check('El haz de cuatro espejos llega al receptor correcto',page.evaluate('CastlePuzzles.mirror(CastlePuzzles.values(Game)).ok'));page.screenshot(path=str(R/'artifacts/castle-mirrors-v013.png'));page.click('#clPuzzleConfirm');floor(False);take('cl_weight_pick');floor(True);take('cl_balance_note');take('cl_west_balance')
 for i,n in enumerate([1,1,1,2,1,2]):
  for _ in range(n):click(i)
 page.screenshot(path=str(R/'artifacts/castle-balance-v013.png'));page.click('#clPuzzleConfirm');take('cl_bell_w');check('Ruta de poniente completa retratos, luz, pesas y campana',page.evaluate("Castle.data().bells.includes('w')&&!Game.pz['h:cl_bells']"))
 floor(False);take('cl_east_note');take('cl_pump_pin_pick');take('cl_chart_pick');take('cl_tides_note');take('cl_tide')
 for i,j in pour_path():click(i);click(j)
 page.screenshot(path=str(R/'artifacts/castle-cistern-v013.png'));page.click('#clPuzzleConfirm');floor(True);take('cl_stars_note');take('cl_star_machine')
 for i,n in enumerate([2,5,1]):
  for _ in range(n):click(i)
 page.screenshot(path=str(R/'artifacts/castle-stars-v013.png'));page.click('#clPuzzleConfirm');take('cl_song_note');take('cl_resonator');page.click('#clReplay');click(1);check('El canto da respuesta visual al error y no depende solo del audio','frase' in page.inner_text('#clPuzzleFeedback'))
 for i in [0,2,1,2,0]:click(i)
 page.click('#clPuzzleConfirm');take('cl_bell_e');check('Dos rutas independientes abren la sala real sin exigir arma ni módulos',page.evaluate("Game.pz['h:cl_bells']&&Castle.data().bells.length===2&&!Castle.data().r98&&Castle.data().modules.length===0"));floor(False);check('La puerta real de la planta baja recuerda las dos campanas',page.evaluate("Level.doors.find(d=>d.id==='cl_royal_gate').open"))
 # Misiones secundarias: cada pieza se obtiene recorriendo su sala y cada tablero usa botones.
 for id in ['cl_r98_note','cl_r98_barrel_pick','cl_m9_note','cl_shot_spring_pick','cl_uzi_note','cl_uzi_cam_pick','cl_fire_note']:take(id)
 floor(True)
 for id in ['cl_r98_scope_pick','cl_m9_plate_pick','cl_shotgun_note','cl_optic_note','cl_optic_film_pick','cl_fire_valve_pick','cl_special_2','cl_special_3','cl_royal_history']:take(id)
 take('cl_r98_case')
 for i in slide_path():click(i)
 page.screenshot(path=str(R/'artifacts/castle-r98-puzzle-v013.png'));page.click('#clPuzzleConfirm');check('R-98 se gana con dos piezas y plano sin alterar las campanas',page.evaluate("Castle.data().r98&&Castle.data().bells.length===2&&(Game.player.weapons.r98||Game.stash.some(i=>i.id==='r98'))"))
 take('cl_shot_case')
 for i in range(3):
  n=page.evaluate('i=>CastlePuzzles.values(Game).v[i]',i)
  for _ in range(abs(5-n)):page.locator('[data-cl="'+str(i)+'"][data-d="'+('1' if n<5 else '-1')+'"]').click()
 page.click('#clPuzzleConfirm');take('cl_optic_case')
 for i in range(5):click(i)
 page.click('#clPuzzleConfirm');floor(False);take('cl_special_1');take('cl_m9_case');order([0,2,1,3]);page.click('#clPuzzleConfirm');take('cl_uzi_case')
 for i in gears_path():click(i)
 page.click('#clPuzzleConfirm');take('cl_fire_case')
 for id in ['mesh','ceramic','copper']:page.locator('[data-cl="'+id+'"]').click()
 page.click('#clPuzzleConfirm');check('Cinco búsquedas y tableros distintos conceden cinco módulos únicos',page.evaluate("Castle.data().modules.length===5&&new Set(Castle.data().modules).size===5"));check('El archivo explica la excepción de Axel y sus límites',page.evaluate("['cl_special_1','cl_special_2','cl_special_3'].every(id=>Game.inv.docs.includes(id))&&DOCS.cl_special_2.text.includes('No significa inmunidad')"))
 # Recorrer todas las salas con colisiones reales, retirando solo los enemigos de geometría.
 for up in [False,True]:
  floor(up);rooms=page.evaluate('Level.rooms.map(r=>({...r}))')
  for room in rooms:
   dest=page.evaluate("r=>{for(let y=r.y+1;y<r.y+r.h;y++)for(let x=r.x+1;x<r.x+r.w;x++)if(Level.grid[y][x]===0)return [x,y]}",room);page.evaluate('v=>qa.walk(...v)',dest);check('Ruta física: '+room['n'],page.evaluate('n=>!!Game.story.visited[Game.lvl+":"+n]',room['n']))
 page.keyboard.press('m');check('Mapa conecta las dos plantas visitadas con sus propias pestañas',page.get_by_role('button',name='Castillo · planta baja',exact=True).count()==1 and page.get_by_role('button',name='Castillo · planta alta',exact=True).count()==1);page.screenshot(path=str(R/'artifacts/castle-map-v013.png'));page.keyboard.press('m');floor(False);take('cl_hub_stash')
 # Preparación explícita de equipo para verificar interfaz y combate separado del recorrido.
 page.evaluate("Game.resume();const g=Game,keys=[...g.inv.keys],docs=[...g.inv.docs],gun=g.inv.items.find(i=>i.id==='r98')||g.stash.find(i=>i.id==='r98');g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.inv.keys=keys;g.inv.docs=docs;g.stash=g.stash.filter(i=>i!==gun);g.inv.place(gun);g.inv.syncWeapons(g.player);g.player.weapon=gun;g.giveWeapon('rifle',0,true);for(const t of ['screw_small','powder_small'])g.inv.addAmmo(t,20);g.inv.addAmmo('screw_large',3);g.inv.addAmmo('powder_large',3)")
 page.keyboard.press('4');old=page.evaluate('Game.player.weapon.id');page.keyboard.press('4');check('Tecla 4 alterna el R-98 con el rifle anterior',old=='rifle' and page.evaluate("Game.player.weapon.id==='r98'"));page.keyboard.press('Tab');page.click('[data-desk=craft]');page.click('[data-recipe=r98]');check('Cartuchos R-98 fabricables con materiales propios',page.evaluate("Game.inv.reserve('r98')===4&&FieldDesk.count(Game.inv,'screw_large')===0&&FieldDesk.count(Game.inv,'powder_large')===0"));page.screenshot(path=str(R/'artifacts/castle-r98-craft-v013.png'));page.keyboard.press('Escape');take('cl_hub_bench');page.locator('[data-bench-weapon=r98]').click()
 for stat in ['damage','effort','precision','capacity']:page.locator('[data-upgrade='+stat+']').click()
 check('R-98 admite daño, aguante, precisión y capacidad; banco muestra cinco módulos',page.evaluate("Workshop.rank(Game,'r98','damage')===1&&Workshop.rank(Game,'r98','capacity')===1") and 'VALCÁRCEL' in page.inner_text('#benchPower'));page.screenshot(path=str(R/'artifacts/castle-bench-v013.png'));page.keyboard.press('Escape');take('cl_hub_save');page.locator('.save-slot').first.click();page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text());quiet();check('Cargar conserva ambas campanas, rifle, mejoras y cinco módulos',page.evaluate("Castle.data().bells.length===2&&Castle.data().modules.length===5&&Game.player.weapons.r98&&Workshop.rank(Game,'r98','capacity')===1"))
 take('cl_to_royal');page.evaluate('qa.step();Game.render()');check('Antesala permite preparar equipo antes de activar al Regente',page.evaluate("Game.lvl==='hospitalroyal'&&!Game.boss.active"));take('cl_royal_cache');q=page.evaluate('Game.inv.items.length+Game.stash.length');take('cl_royal_cache');check('Reserva final se entrega una sola vez',page.evaluate('Game.inv.items.length+Game.stash.length')==q)
 page.evaluate("const g=Game,keys=[...g.inv.keys],docs=[...g.inv.docs],gun=g.player.weapons.r98;g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.inv.keys=keys;g.inv.docs=docs;g.inv.place(gun);g.inv.syncWeapons(g.player);g.player.weapon=gun;gun.mag=Weapons.magSize(g.player,WEAPONS.r98);g.inv.addAmmo('am_r98',26);for(let i=0;i<4;i++)g.inv.add('inj_green');g.player.hp=g.player.maxHp=100;g.player.stamina=100;g.player.mods={mag:0,pow:0,prec:0,rate:0,mask:0};g.mut.owned=new Set(['core'])")
 page.evaluate('qa.walk(24,29);qa.step();Game.render()');check('Entrar en sala real sella la puerta e inicia forma de espada y escudo',page.evaluate("Game.boss.active&&Game.boss.phase===1&&!Level.doors.find(d=>d.id==='cl_throne_entry').open&&!Level.blocked(Game.player.x,Game.player.y,Game.player.r)"))
 combat=page.evaluate((R/'tests/castle_controller.js').read_text());print('ROYAL R98',combat,flush=True);check('R-98 ganado y mejorado supera tres formas con IA y recursos finitos',combat['won'] and combat['phases']==[1,2,3] and combat['weapon']=='r98' and combat['hp']>0);page.screenshot(path=str(R/'artifacts/castle-royal-victory-v013.png'));check('Victoria abre la galería sin terminar antes de cruzarla',page.evaluate("Game.state==='play'&&Level.doors.find(d=>d.id==='cl_throne_exit').open"));page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text());check('Cargar victoria mantiene al Regente muerto y su salida abierta',page.evaluate("Game.boss.dead&&Level.doors.find(d=>d.id==='cl_throne_exit').open"));page.evaluate('qa.walk(43,18)');page.keyboard.down('d');page.evaluate('qa.step(18)');page.keyboard.up('d');check('Cruzar la galería del castillo desciende al laboratorio final',page.evaluate("Game.state==='play'&&Game.lvl==='hospitalumbra'&&Castle.data().complete"));page.screenshot(path=str(R/'artifacts/castle-ending-v013.png'));check('Sin errores de JavaScript',not errors)
 (R/'artifacts/castle-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'royal_r98_combat':combat,'scope':'Geometría y misiones con movimiento, puertas y botones reales; enemigos retirados para aislar rutas. Tallador forzado solo en este recorrido: su combate M9 completo se prueba aparte. Regente combatido aquí con R-98 obtenido y cuatro mejoras de nivel 1, 31 balas totales, 100 HP y cuatro curas, sin traje ni habilidades compradas. El controlador conoce patrones; no representa dificultad de una primera partida humana ni equilibrio de toda la campaña.'},ensure_ascii=False,indent=2));b.close()
