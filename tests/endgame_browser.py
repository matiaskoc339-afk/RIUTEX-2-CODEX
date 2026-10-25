"""Recorrido de UMBRAL y ambos desenlaces. Geometría y combate se aíslan explícitamente."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game
R=Path(__file__).resolve().parents[1];passed=[]
def check(n,v):
 assert v,n
 passed.append(n);print('PASS',n,flush=True)
def take(id):
 page.evaluate('id=>qa.take(id)',id)
 if page.evaluate("Game.state==='doc'"):page.keyboard.press('j')
def click(i):page.locator('[data-lf="'+str(i)+'"]').click()
def path(goal,kind):return page.evaluate("""o=>{const start=EndPuzzles.values(Game).v,q=[start],s=new Map([[start.join(','),[]]]);for(let pos=0;pos<q.length;pos++){const a=q[pos],p=s.get(a.join(','));if(a.join(',')===o.goal.join(','))return p;const n=o.kind==='thermal'?3:o.kind==='shot'?2:4;for(let i=0;i<n;i++){const b=a.map((v,j)=>o.kind==='thermal'?(v+(i===j?2:7))%8:o.kind==='shot'?(v+(i===j?1:2))%10:Math.abs(i-j)<=1?v^1:v),k=b.join(',');if(!s.has(k)){s.set(k,[...p,i]);q.push(b)}}}}""",{'goal':goal,'kind':kind})
def stop():
 page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70);page.evaluate((R/'tests/walker.js').read_text())
with local_server(R) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');start_new_game(page);stop()
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Game.story.seq='free';Game.pz['h:boss']=Game.pz['h:ds_spider']=Game.pz['h:cl_regent']=true;Game.killed.add(900);Game.resume();Hospital.goto(Game,'hospitalroyal',[43,18]);Game.giveWeapon('pistol',24,true);Game.giveWeapon('r98',8,true)")
 page.keyboard.down('d');page.evaluate("for(let i=0;i<30&&Game.lvl==='hospitalroyal';i++)Game.update(1/30)");page.keyboard.up('d');page.evaluate('Game.enemies=[];Game.update(.01);Game.render()');check('Caminar por la compuerta del Regente inicia UMBRAL con equipo',page.evaluate("Game.lvl==='hospitalumbra'&&Game.player.weapons.r98&&Castle.data().complete"));page.screenshot(path=str(R/'artifacts/endgame-arrival-v014.png'))
 take('lf_save');check('Refugio conserva tres espacios de guardado',page.locator('.save-slot').count()==3);page.locator('.save-slot').first.click();take('lf_arrival');take('lf_protocol');take('lf_core');check('Núcleo rechaza acceso sin tres muestras',page.evaluate("Game.lvl==='hospitalumbra'&&Endgame.data().ingredients.length===0"))
 take('lf_cryo_note');take('lf_thermal');page.click('#lfConfirm');check('Intercambiador exige refrigerante y explica qué falta','refrigerante' in page.inner_text('#lfPuzzleFeedback'));page.keyboard.press('Escape');take('lf_coolant_pick');take('lf_thermal')
 for i in path([4,4,4],'thermal'):click(i)
 page.screenshot(path=str(R/'artifacts/endgame-thermal-v014.png'));page.click('#lfConfirm');take('lf_cryo')
 for i in range(3):
  page.wait_for_function('i=>{const n=EndPuzzles.pulse(i);return n>.44&&n<.56}',arg=i);click(i)
 check('Tres válvulas se sellan pulsando durante la banda verde',page.evaluate('EndPuzzles.values(Game).v.every(Boolean)'));page.screenshot(path=str(R/'artifacts/endgame-cryo-v014.png'));page.click('#lfConfirm');check('Primera ruta aísla suero sin conceder otras muestras',page.evaluate("Endgame.data().ingredients.join(',')==='lf_serum'"))
 take('lf_genome_note');take('lf_probe_pick');take('lf_spectrum');click(0);click(5);page.keyboard.press('Escape');page.evaluate('Game.save(0)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();stop();page.evaluate('Game.enemies=[]');take('lf_spectrum');check('Recargar conserva filtros parciales y la sonda',page.evaluate("EndPuzzles.values(Game).v.join(',')==='1,4,0'&&Game.inv.keys.includes('lf_probe')"))
 for i in [1,3,7,8]:click(i)
 page.screenshot(path=str(R/'artifacts/endgame-spectrum-v014.png'));page.click('#lfConfirm');take('lf_slide_pick');take('lf_genome')
 for i,n in enumerate([1,0,3,2,1,0]):
  for _ in range(n):click(i)
 page.screenshot(path=str(R/'artifacts/endgame-dna-v014.png'));page.click('#lfConfirm');check('Segunda ruta combina filtros y cadena complementaria',page.evaluate("Game.inv.keys.includes('lf_genome')&&Endgame.data().ingredients.length===2"))
 take('lf_catalyst_note');take('lf_filter_pick');take('lf_feed_pick');take('lf_culture');click(15);check('Cultivo rechaza saltos sobre tramos no conectados','contaminado' in page.inner_text('#lfPuzzleFeedback'))
 for i in [4,8,9,13,14,15]:click(i)
 page.screenshot(path=str(R/'artifacts/endgame-culture-v014.png'));page.click('#lfConfirm');take('lf_rotor_pick');take('lf_catalyst');click(2);page.screenshot(path=str(R/'artifacts/endgame-centrifuge-v014.png'));page.click('#lfConfirm');check('Tercera ruta completa antídoto sin exigir secundarios',page.evaluate("Endgame.data().ingredients.length===3&&!Endgame.data().gl&&Endgame.data().modules.length===0&&Endgame.data().wrenSeen"))
 for id in ['lf_gl_note','lf_breech_pick','lf_gl_tube_pick']:take(id)
 take('lf_gl_case')
 for i in ['breech','tube','fuse','test']:click(i)
 page.click('#lfConfirm');check('GL-6 se obtiene con piezas y seguro propios',page.evaluate("Endgame.data().gl&&(Game.player.weapons.gl6||Game.stash.some(i=>i.id==='gl6'))"))
 for id in ['lf_m9_note','lf_m9_chip_pick','lf_shot_note','lf_shot_piston_pick','lf_uzi_note','lf_uzi_drive_pick','lf_r98_note','lf_r98_lens_pick','lf_fl_note','lf_fl_seal_pick']:take(id)
 for kind,id in [('m9','lf_m9_case'),('shot','lf_shot_case')]:
  take(id)
  for i in path([0,0,0,0] if kind=='m9' else [5,5],kind):click(i)
  page.click('#lfConfirm')
 take('lf_uzi_case')
 for i in range(4):
  j=page.evaluate('i=>EndPuzzles.values(Game).v.indexOf(i)',i)
  if i!=j:click(i);click(j)
 page.click('#lfConfirm');take('lf_r98_case')
 for i,n in enumerate([5,2,0]):
  for _ in range(n):click(i)
 page.click('#lfConfirm');take('lf_fl_case')
 for i in ['seal','mesh','ceramic']:click(i)
 page.click('#lfConfirm');check('Cinco expedientes y sus mecanismos conceden cinco mejoras',page.evaluate('Endgame.data().modules.length===5&&new Set(Endgame.data().modules).size===5'))
 take('lf_bag_note');old=page.evaluate('Game.inv.level');take('lf_case');check('Sala de extracción permite ampliar el maletín',page.evaluate('Game.inv.level')==old+1)
 for id in ['lf_wren_1','lf_wren_2','lf_wren_3']:take(id)
 check('Archivo vincula Wren con la mansión y explica pérdida de brazo y evacuación',page.evaluate("DOCS.lf_wren_1.text.includes('mansión')&&DOCS.lf_wren_2.text.includes('brazo')&&DOCS.lf_wren_3.text.includes('humanos')"))
 for room in page.evaluate('Level.rooms.map(r=>({...r}))'):
  dest=page.evaluate("r=>{for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)if(Level.grid[y][x]===0)return [x,y]}",room);page.evaluate('v=>qa.walk(...v)',dest);check('Recorrido físico: '+room['n'],page.evaluate('n=>!!Game.story.visited[Game.lvl+":"+n]',room['n']))
 page.keyboard.press('m');check('Plano integra el laboratorio con el museo visitado',page.get_by_role('button',name='Laboratorio UMBRAL',exact=True).count()==1 and page.get_by_role('button',name='Sala real',exact=True).count()==1);page.screenshot(path=str(R/'artifacts/endgame-map-v014.png'));page.keyboard.press('m')
 # Preparación explícita para comprobar equipo, separada del recorrido de recursos naturales.
 page.evaluate("const g=Game,keys=[...g.inv.keys],docs=[...g.inv.docs],gl=g.player.weapons.gl6||g.stash.find(i=>i.id==='gl6');g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.inv.keys=keys;g.inv.docs=docs;g.inv.place(gl);g.inv.syncWeapons(g.player);g.giveWeapon('flamethrower',2,true);g.player.weapon=g.player.weapons.flamethrower;g.inv.addAmmo('screw_large',3);g.inv.addAmmo('powder_large',4);for(const t of ['screw_small','powder_small'])g.inv.addAmmo(t,20)")
 page.keyboard.press('5');gl=page.evaluate('Game.player.weapon.id');page.keyboard.press('5');check('Tecla 5 alterna GL-6 y FL-4 sin nuevas teclas reservadas',gl=='gl6' and page.evaluate("Game.player.weapon.id==='flamethrower'"));page.keyboard.press('Tab');page.click('[data-desk=craft]');page.click('[data-recipe=gl6]');check('Construcción fabrica dos granadas GL-6 con coste exacto',page.evaluate("Game.inv.reserve('gl6')===2&&FieldDesk.count(Game.inv,'screw_large')===0&&FieldDesk.count(Game.inv,'powder_large')===0"));page.screenshot(path=str(R/'artifacts/endgame-craft-v014.png'));page.keyboard.press('Escape');take('lf_bench');page.click('[data-bench-weapon=gl6]')
 for stat in ['damage','effort','precision','capacity']:page.click('[data-upgrade='+stat+']')
 check('Banco permite cuatro mejoras independientes del GL-6',page.evaluate("['damage','effort','precision','capacity'].every(s=>Workshop.rank(Game,'gl6',s)===1)"));page.screenshot(path=str(R/'artifacts/endgame-bench-v014.png'));page.keyboard.press('Escape')
 take('lf_core');check('Tres muestras dan acceso al núcleo con jefe aún inactivo',page.evaluate("Game.lvl==='hospitalorigin'&&!Game.boss.active"));take('lf_final_note');take('lf_reserve');n=page.evaluate('Game.inv.items.length+Game.stash.length');take('lf_reserve');check('Reserva de la antesala no se duplica',page.evaluate('Game.inv.items.length+Game.stash.length')==n);take('lf_core_back');page.evaluate('Game.enemies=[]');check('Antes de síntesis puedes volver al refugio',page.evaluate("Game.lvl==='hospitalumbra'"));take('lf_core')
 page.evaluate("const g=Game,keys=[...g.inv.keys],docs=[...g.inv.docs];g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();g.inv.keys=keys;g.inv.docs=docs;g.player.weapons={};g.player.weapon=null;g.giveWeapon('r98',40,true);g.player.weapon=g.player.weapons.r98;for(let i=0;i<4;i++)g.inv.add('inj_green');g.player.hp=g.player.maxHp=100;g.player.stamina=g.player.maxStamina=100;g.player.mods={mag:0,pow:0,prec:0,rate:0,mask:0};g.player.poison=0;g.mut.owned=new Set(['core']);Workshop.ensure(g).levels.r98={};Endgame.data().modules=[];Game.story.works.suit={owned:false,hp:0,levels:{}}")
 take('lf_mix');check('Activar síntesis consume muestras y sella la contención',page.evaluate("Game.boss.active&&Game.boss.mode==='intro'&&!Game.inv.keys.includes('lf_serum')&&!Level.doors.find(d=>d.id==='lf_core_entry').open"));page.evaluate('Game.render()');page.screenshot(path=str(R/'artifacts/endgame-injection-v014.png'))
 idle=page.evaluate("(()=>{Game.keys={};for(let i=0;i<5000&&Game.state==='play';i++)Game.update(1/30);return Game.state})()");check('Quedarse quieto ante Wren termina en muerte',idle=='dead');page.click('#bRetry');stop();check('Reintentar restaura tres muestras y punto anterior a la síntesis',page.evaluate("!Game.boss.active&&Game.boss.hp===3600&&Game.inv.keys.includes('lf_serum')&&Game.player.hp===100"));take('lf_mix')
 combat=page.evaluate((R/'tests/endgame_controller.js').read_text());print('WREN_COMBAT',combat,flush=True);check('Combate real vence tres formas con R-98 base y recursos finitos',combat['won'] and combat['phases']==[1,2,3] and combat['hp']>0);page.screenshot(path=str(R/'artifacts/endgame-victory-v014.png'));page.evaluate("for(let i=0;i<120&&Game.state==='play';i++)Game.update(1/30)");check('Cura terminada muestra exactamente dos decisiones sin abrir salida',page.is_visible('#lfDecision') and page.locator('.lf-choices button').count()==2 and page.evaluate("!Level.doors.find(d=>d.id==='lf_core_exit').open"));page.screenshot(path=str(R/'artifacts/endgame-decision-v014.png'))
 page.evaluate("Game.mut.owned.add('brazo');Game.mut.owned.add('elite');Game.mut.owned.add('gold_abyssal_heart');Game.player.maxHp+=12;Game.mut.bindings.brazo='KeyZ';Game.save(0)");pre_cure=page.evaluate('Game.getSaveSlots()[0]')
 for choice,button in [('cure','#lfTakeCure'),('mutate','#lfRejectCure')]:
  if choice=='mutate':
   page.evaluate('sv=>Game.start(true,sv)',pre_cure);stop();page.evaluate('Game.update(.01)')
  page.click(button);check('Decisión '+choice+' abre salida y conserva habilidades correspondientes',page.evaluate("c=>{const q=Endgame.data();return q.choice===c&&Level.doors.find(d=>d.id==='lf_core_exit').open&&Game.mut.has('elite')&&(c==='cure'?!Game.mut.has('brazo')&&!Game.story.armHealed:Game.mut.has('brazo')&&Game.story.armHealed)}",choice));page.evaluate('Game.save(1)');page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').nth(1).click();stop();check('Cargar decisión '+choice+' no permite volver a elegir',page.evaluate('c=>Endgame.data().choice===c&&Game.state===\'play\'',choice))
  page.evaluate('qa.walk(53,23)');page.keyboard.down('d');page.evaluate("for(let i=0;i<40&&Game.lvl==='hospitalorigin';i++)Game.update(1/30)");page.keyboard.up('d');check('Salida '+choice+' deja caminar por calles antes del helicóptero',page.evaluate("Game.lvl==='hospitalstreet'&&!Endgame.data().street.active&&Game.state==='play'"));page.evaluate('qa.walk(32,31)');page.keyboard.down('w');page.evaluate("for(let i=0;i<40&&!Endgame.data().street.active;i++)Game.update(1/30)");page.keyboard.up('w');check('Avanzar físicamente llama al helicóptero: '+choice,page.evaluate('Endgame.data().street.active'));page.evaluate('for(let i=0;i<210;i++)Game.update(1/30);Game.render()');page.screenshot(path=str(R/'artifacts'/('endgame-helicopter-'+choice+'-v014.png')));page.evaluate("for(let i=0;i<200&&Game.state==='play';i++)Game.update(1/30);Game.render()");check('Desenlace '+choice+' termina tras rescate o disparos',page.is_visible('#end') and page.inner_text('#endH')==('FINAL HUMANO' if choice=='cure' else 'FINAL MUTANTE') and page.evaluate('Endgame.data().complete'));page.screenshot(path=str(R/'artifacts'/('endgame-ending-'+choice+'-v014.png')))
 check('Sin errores de JavaScript',not errors)
 (R/'artifacts/endgame-browser-results.json').write_text(json.dumps({'passed':passed,'errors':errors,'combat':combat,'scope':'Rutas e instrumentos con movimiento, colisiones, puertas y botones reales, sin enemigos para aislar geometría. Combate aparte con IA: R-98 base, 44 balas totales preparadas, 100 HP, cuatro curas, sin módulos, habilidades ni traje. Controlador conoce patrones; no equivale a dificultad humana ni balance de campaña. Ambos finales recorren salida, calle y helicóptero reales. Para comprobar pérdida/conservación de habilidades se añaden habilidades después del combate; no intervienen en su victoria.'},ensure_ascii=False,indent=2));b.close()
