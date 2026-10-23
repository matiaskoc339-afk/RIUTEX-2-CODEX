"""Expediente v0.8: controles reales en escenarios preparados; no evalúa dificultad."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1]
RESULT=[]
def record(name,value):
 if not value: print("DEBUG", errors, page.evaluate("({state:Game.state,floor:Blue.floor,keys:Game.keys,binding:Game.mut.bindingTarget,nav:document.querySelector(\"#fieldDesk\").className})"),flush=True)
 assert value,name
 RESULT.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[];missing=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('response',lambda r:missing.append(r.url) if r.status>=400 else None)
 page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bNew');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(60)
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.resume();Game.enemies=[];Game.carn=null;Game.player.x=52.5*32;Game.player.y=26.5*32;Game.inv=new Inventory();Game.inv.expand();Game.inv.expand();Game.giveWeapon('pistol',12,true);Game.inv.add('inj_green');Game.inv.add('inj_blue');Game.inv.add('inj_yellow');Game.inv.addAmmo('screw_small',8);Game.inv.addAmmo('powder_small',8);Game.inv.addAmmo('powder_large',3);Game.inv.addAmmo('screw_large',2);Game.inv.add('sample');Game.inv.keys=['archivo','farmacia','rack_crank','optic_cell','optic_lens'];Game.inv.docs=['h1','h2','w_shot_notice','w_shot_manual','b_diag','b_blood','w_uzi_optics'];Game.inv.sel=0;Game.update(.01);Game.render()")
 page.keyboard.press('Tab')
 record('TAB abre solo el maletín con seis pestañas comunes',page.is_visible('#inv') and page.locator('#fieldDesk [data-desk]').count()==6 and page.locator('#inv .craft-actions').count()==0 and not page.locator('#invKeys').inner_text() and not page.locator('#invDocs').inner_text())
 record('Todos los objetos tienen icono propio y cantidades accesibles',page.evaluate("document.querySelectorAll('#invGrid .it svg').length===Game.inv.items.length&&document.querySelectorAll('#invGrid .it[aria-label]').length===Game.inv.items.length&&document.querySelectorAll('#invGrid .item-quantity').length===Game.inv.items.filter(i=>i.count!=null||i.mag!=null).length"))
 page.screenshot(path=str(ROOT/'artifacts/expediente-inventario-v080.png'))
 page.locator('#invGrid [data-item-type=inj_green]').click();page.evaluate('Game.player.hp=25');page.keyboard.press('f')
 record('F usa la inyección seleccionada sin abandonar el inventario',page.evaluate("Game.state==='inv'&&Game.player.hp===65&&!Game.inv.items.some(i=>i.type==='inj_green')"))
 page.click('[data-desk="craft"]');before=page.evaluate('Game.inv.reserve("pistol")');page.click('[data-recipe="pistol"]')
 record('Fabricar actualiza munición, costes y confirmación en su pestaña',page.evaluate(f"Game.state==='craft'&&Game.inv.reserve('pistol')==={before}+10&&FieldDesk.count(Game.inv,'screw_small')===6&&FieldDesk.count(Game.inv,'powder_small')===6") and 'Fabricaste' in page.inner_text('#craftFeedback'))
 page.screenshot(path=str(ROOT/'artifacts/expediente-construccion-v080.png'))
 page.click('[data-filter="preparación"]');record('Preparación transforma recursos con cuatro recetas',page.locator('.recipe-card').count()==4);page.click('[data-recipe="powder_split"]')
 record('Preparar recursos consume la pieza grande y entrega las pequeñas',page.evaluate("FieldDesk.count(Game.inv,'powder_large')===2&&FieldDesk.count(Game.inv,'powder_small')===9"))
 page.click('[data-desk="artifacts"]');page.locator('.artifact-entry',has_text='Manivela').click()
 record('Artefactos muestra descripción, pista y documentos recuperados relacionados',page.is_visible('#artifactDetail') and 'soporte' in page.inner_text('#artifactDetail') and page.locator('[data-related]').count()==2)
 page.locator('[data-related="w_shot_manual"]').click()
 record('La pista enlaza al documento correcto dentro del mismo expediente',page.evaluate("Game.state==='doc'&&Game.jSel==='w_shot_manual'") and page.locator('#fieldDesk [aria-current="page"]').inner_text().startswith('Documentos'))
 record('El expediente conserva el texto y tiene papel clínico con membrete y sello',page.evaluate("document.querySelector('#jPaper.worn-paper .clinical-letterhead')!==null&&document.querySelectorAll('#docB p').length>=2&&getComputedStyle(document.querySelector('#docB')).fontFamily.includes('Georgia')") and 'soporte' in page.inner_text('#docT').lower())
 page.evaluate("UI.renderJournal(Game,'b_diag')");page.screenshot(path=str(ROOT/'artifacts/expediente-documentos-v080.png'))
 page.keyboard.press('m');record('M cambia de documentos al mapa sin volver al juego',page.evaluate("Game.state==='map'") and page.is_visible('#fieldDesk'))
 record('El mapa no revela los nombres de salas aún no visitadas',page.evaluate("!document.querySelector('#mapDrawing').textContent.includes('Diagnóstico')&&!document.querySelector('#mapDrawing').textContent.includes('Morgue')"))
 initial=page.locator('#mapDrawing svg').get_attribute('viewBox');page.click('#mapZoomIn');zoomed=page.locator('#mapDrawing svg').get_attribute('viewBox')
 record('El zoom cambia la escala real del plano',float(zoomed.split()[2])<float(initial.split()[2]));page.click('#mapFit')
 box=page.locator('#mapDrawing svg').bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+80,box['y']+box['height']/2+35,steps=8);page.mouse.up()
 record('Arrastrar desplaza el plano sin mover al personaje',page.locator('#mapDrawing svg').get_attribute('viewBox')!=initial and page.evaluate('Game.player.x===52.5*32'))
 page.click('#mapFit');page.locator('.atlas-room[aria-label="Vestíbulo central"]').click()
 record('Seleccionar una sala visitada ofrece información de orientación',page.inner_text('#mapReadout').startswith('Vestíbulo central') and 'conexiones' in page.inner_text('#mapReadout'))
 def mapclick(x,y):
  xy=page.evaluate("""([x,y])=>{const s=document.querySelector('#mapDrawing svg'),p=s.createSVGPoint();p.x=x*10+5;p.y=y*10+5;const v=p.matrixTransform(s.getScreenCTM());return [v.x,v.y]}""",[x,y]);page.mouse.click(*xy)
 page.click('#mapPin');mapclick(52,26)
 record('La marca personal solo aparece en un lugar conocido',page.evaluate("Game.story.mapPin?.floor==='hospital'&&Game.story.mapPin.x===52&&Game.story.mapPin.y===26") and page.locator('.atlas-pin').count()==1)
 page.click('#mapPin');mapclick(110,70)
 record('No se puede marcar una zona desconocida ni revelar su geometría',page.evaluate('Game.story.mapPin.x===52&&Game.story.mapPin.y===26') and 'Aún no conoces' in page.inner_text('#mapReadout'))
 page.click('#mapPin');page.click('#mapLayer');record('El filtro de servicios cambia sin revelar salas nuevas','servicios' in page.inner_text('#mapLayer'))
 page.evaluate("for(const r of R2_DATA('hospital').rooms)if(r[1]<82&&r[2]>20)Game.story.visited['hospital:'+r[0]]=true;Blue.renderMap(Game)");page.screenshot(path=str(ROOT/'artifacts/expediente-mapa-v080.png'))
 page.keyboard.press('k');record('K cambia directamente del mapa a adaptación y marca el árbol como visto',page.evaluate("Game.state==='tree'&&Game.mut.seen") and page.locator('.network-node').count()==153)
 page.evaluate("Game.mut.owned.add('reflejos');Game.assignSkillKey('reflejos')");page.keyboard.press('x');record('Asignar una habilidad conserva el control de captura de teclas',page.evaluate("Game.mut.bindings.reflejos==='KeyX'&&!Game.mut.bindingTarget"))
 page.keyboard.press('Tab');record('TAB vuelve al inventario desde otra pestaña',page.evaluate("Game.state==='inv'"));page.keyboard.press('Tab');record('Repetir el atajo de la ventana activa vuelve al juego',page.evaluate("Game.state==='play'") and not page.is_visible('#fieldDesk'))
 page.evaluate("Game.inv=new Inventory();Game.inv.cols=2;Game.inv.rows=1;Game.inv.addAmmo('screw_small',2);Game.inv.addAmmo('powder_small',2);FieldDesk.craftFilter='all';FieldDesk.open(Game,'craft')")
 page.click('[data-recipe="pistol"]');record('Un maletín lleno fabrica si los materiales consumidos dejan hueco',page.evaluate("Game.inv.items.length===1&&Game.inv.reserve('pistol')===10"))
 page.evaluate("Game.inv=new Inventory();Game.inv.cols=2;Game.inv.rows=1;Game.inv.addAmmo('screw_small',3);Game.inv.addAmmo('powder_small',3);FieldDesk.renderCraft(Game)")
 record('La receta explica falta de espacio y no gasta materiales',page.locator('[data-recipe="pistol"]').is_disabled() and 'espacio' in page.locator('[data-recipe="pistol"]').inner_text() and page.evaluate('FieldDesk.count(Game.inv,"screw_small")===3'))
 page.evaluate("Game.inv=new Inventory();Game.resume();Game.openJournal()")
 record('J puede abrir documentos vacíos sin error',page.is_visible('#doc') and 'Un archivo por reconstruir' in page.inner_text('#docT'));page.keyboard.press('Escape')
 # Forma visible: misma posición, misma pose y mismo equipo; solo cambia la adaptación adquirida.
 mutation=page.evaluate("""(()=>{const old=Game.mut.owned,cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d'),p={...Game.player,x:64,y:64,angle:0,walkT:0,flash:0,hurtFlash:0,weapon:null,blade:0,slash:0,predator:0};function draw(){c.clearRect(0,0,128,128);BlueArt.human(c,p);return c.getImageData(0,0,128,128).data}Game.mut.owned=new Set(['core']);const base=draw();for(const id in SKILLS)if(SKILLS[id].br==='hum')Game.mut.owned.add(id);const human=draw();for(const id in SKILLS)if(SKILLS[id].br==='mut')Game.mut.owned.add(id);const mutant=draw();let hum=0,mut=0;for(let i=0;i<base.length;i+=4){if(base.slice(i,i+4).some((v,j)=>v!==human[i+j]))hum++;if(base.slice(i,i+4).some((v,j)=>v!==mutant[i+j]))mut++}Game.mut.owned=old;return {hum,mut}})()""")
 record('La ruta humana mantiene la silueta; la mutante añade detalles localizados',mutation['hum']==0 and 20<mutation['mut']<400)
 page.evaluate("Game.inv.keys=['archivo','optic_lens'];Game.inv.docs=['b_diag'];Game.save(0)")
 page.reload();page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()');page.click('#bCont');page.locator('.save-slot').first.click();page.wait_for_timeout(100)
 page.keyboard.press('m');record('Cargar restaura la marca personal y sus coordenadas',page.evaluate("Game.story.mapPin?.x===52&&Game.story.mapPin.y===26") and page.locator('.atlas-pin').count()==1)
 page.click('#mapErase');record('Borrar la marca no altera los lugares descubiertos',page.evaluate('!Game.story.mapPin') and page.locator('.atlas-room').count()>1)
 for w,h in [(1280,720),(1920,1080)]:
  page.set_viewport_size({'width':w,'height':h})
  for tab in ['inv','craft','artifacts','doc','map','tree']:
   page.click('[data-desk="'+tab+'"]')
   record(f'{tab} utilizable en {w}×{h}',page.locator('#fieldDesk').bounding_box()['y']==0 and page.locator('#'+tab).bounding_box()['y']>=80 and page.evaluate('document.body.scrollWidth<=innerWidth'))
   if w==1280:page.screenshot(path=str(ROOT/f'artifacts/expediente-{tab}-720-v080.png'))
 page.keyboard.press('Escape');page.evaluate("Game.stash=[{type:'am_pistol',count:7}];Game.state='stash';UI.renderStash(Game);UI.screen('stash')")
 record('El baúl comparte los iconos y permite retirar objetos',page.locator('#stList .jit svg').count()==1);page.locator('#stList .jit').click();record('Retirar del baúl conserva la cantidad de munición',page.evaluate("Game.inv.reserve('pistol')===7&&Game.stash.length===0"))
 record('Sin errores de JavaScript ni recursos fallidos',not errors and not missing)
 (ROOT/'artifacts/fielddesk-browser-results.json').write_text(json.dumps({'passed':RESULT,'errors':errors,'missing':missing,'mutation_pixels':mutation,'scope':'Controles reales con escenarios preparados de inventario, mapa, adaptación y guardado. No evalúa dificultad.'},ensure_ascii=False,indent=2))
 b.close()
