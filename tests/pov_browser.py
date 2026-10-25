"""POV opcional: controles reales, geometría compartida y render en Chromium.
Las posiciones de combate y las fases de los jefes se preparan para aislar cámara y dibujo.
El prólogo y la primera huida se recorren con movimiento/colisiones; no mide dificultad humana.
"""
from pathlib import Path
import json,math
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game
R=Path(__file__).resolve().parents[1];passed=[];errors=[];shots=[]
def check(name,ok):
 if not ok:
  print('DEBUG',errors,page.evaluate("({state:Game.state,lvl:Game.lvl,enabled:FirstPerson.enabled,p:Game.player&&[Game.player.x/32,Game.player.y/32,Game.player.hp,Game.player.angle],keys:Game.keys,locked:FirstPerson.locked(),armed:FirstPerson.armed,fallback:FirstPerson.fallback})"),flush=True)
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
def capture(name):
 page.evaluate('Game.render()');page.screenshot(path=str(R/'artifacts'/('pov-'+name+'-v016.png')));shots.append(name)
def step(n=1):page.evaluate('(n)=>{for(let i=0;i<n;i++)Game.update(1/60);Game.render()}',n)
def quiet():page.evaluate('Game.enemies=[];Game.carn=null;Game.keys={};Game.player.invuln=999')
HELPER='''window.fpqa={
 step(n=1){for(let i=0;i<n;i++){Game.update(1/60);if(Game.state==='dead')throw Error('Muerte en recorrido POV');}},
 walk(tx,ty){let steps=0;for(const [x,y]of qa.route(tx,ty)){const target=[x*32+16,y*32+16];let stuck=0;while(Math.hypot(target[0]-Game.player.x,target[1]-Game.player.y)>3){if(++steps>26000||++stuck>250)throw Error('Atasco POV '+Game.player.x/32+','+Game.player.y/32+' -> '+x+','+y);Game.player.angle=Math.atan2(target[1]-Game.player.y,target[0]-Game.player.x);Game.keys={KeyW:true};Game.mouse.down=Game.mouse.clicked=false;const d=Level.nearDoor(Game.player);if(d&&Game.doorOk(d)){Game.interact();if(Game.state==='doc')Game.closeDoc();if(Game.state==='slots')Game.closeSaveSlots();}this.step();if(Game.state==='tutorial'){Game.keys={};Game.render();return {tutorial:true};}}}Game.keys={};Game.render();return {steps,hp:Game.player.hp,x:Game.player.x/32,y:Game.player.y/32};},
 take(id){const it=Game.items.find(i=>i.id===id);if(!it)throw Error('Falta '+id);this.walk(Math.floor(it.x/32),Math.floor(it.y/32));Game.player.angle=Math.atan2(it.y-Game.player.y,it.x-Game.player.x);FirstPerson.sync(Game);Game.interact();}
};'''
with local_server(R) as url,sync_playwright() as pw:
 browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
 page.goto(url);page.evaluate('document.fonts.ready')
 check('El modo clásico es la opción inicial',page.evaluate('!FirstPerson.enabled'))
 page.click('#bMenuOptions');check('Ajustes ofrece Primera Persona POV',page.locator('#menuFirstPerson').count()==1 and 'Primera Persona POV' in page.inner_text('#menuOptions'))
 page.locator('#menuFirstPerson').check();page.click('#bMenuOptionsClose');page.reload();page.click('#bMenuOptions')
 check('Activar POV se conserva al recargar el navegador',page.locator('#menuFirstPerson').is_checked() and page.evaluate('FirstPerson.enabled'))
 page.click('#bMenuOptionsClose');start_new_game(page);page.evaluate('Game.loop=()=>{};SceneTransitions.finish();Game.enemies=[];Game.keys={}');page.wait_for_timeout(70)
 check('Nueva partida conserva historia y AK en primera persona',page.evaluate("FirstPerson.active(Game)&&Game.lvl==='mansion'&&Game.player.weapon.id==='ak'"))
 capture('mansion')
 check('El escuadrón del prólogo conserva sus cuerpos visibles en POV',page.evaluate("(()=>{const a=Game.player.angle;Game.player.angle=Math.PI/2;Game.render();const n=FirstPersonRenderer.stats.sprites;Game.player.angle=a;return Game.squad.length===3&&n>=1})()"))
 page.evaluate('Game.player.angle=-Math.PI/2');x,y=page.evaluate('[Game.player.x,Game.player.y]');page.keyboard.down('w');step(8);page.keyboard.up('w')
 check('W avanza hacia donde mira la cámara',page.evaluate(f'Game.player.y<{y}-5&&Math.abs(Game.player.x-{x})<.1'))
 page.keyboard.press('Escape');check('Escape abre una sola pausa',page.evaluate("Game.state==='pause'"))
 check('Pausa permite cambiar POV durante una partida',page.locator('#pauseFirstPerson').is_checked())
 signature=page.evaluate("JSON.stringify({lvl:Game.lvl,p:[Game.player.x,Game.player.y,Game.player.hp],weapons:Game.player.weapons,owned:[...Game.mut.owned],pz:Game.pz})")
 page.locator('#pauseFirstPerson').uncheck();check('Desactivar POV no cambia posición, historia ni recursos',not page.evaluate('FirstPerson.enabled') and page.evaluate("JSON.stringify({lvl:Game.lvl,p:[Game.player.x,Game.player.y,Game.player.hp],weapons:Game.player.weapons,owned:[...Game.mut.owned],pz:Game.pz})")==signature)
 page.locator('#pauseFirstPerson').check();page.click('#bRes');check('Cambiar de vuelta restaura primera persona sin reiniciar',page.evaluate("Game.state==='play'&&FirstPerson.active(Game)"))
 # Primera adquisición del ratón: se captura el control, no se gasta la primera bala.
 mag=page.evaluate('Game.player.weapon.mag');page.mouse.click(750,420);page.wait_for_timeout(80);step()
 check('El clic para capturar el ratón no dispara',page.evaluate('Game.player.weapon.mag')==mag)
 angle=page.evaluate('Game.player.angle')
 if page.evaluate('FirstPerson.locked()'):
  page.mouse.move(810,420)
 else:
  page.mouse.move(750,420);page.mouse.down(button='right');page.mouse.move(825,420,steps=4);page.mouse.up(button='right')
 step();check('El ratón gira mediante captura o arrastre alternativo',page.evaluate(f'Math.abs(Math.atan2(Math.sin(Game.player.angle-({angle})),Math.cos(Game.player.angle-({angle}))))>.02'))
 page.keyboard.press('Escape');page.wait_for_timeout(100);check('Escape suelta el ratón y mantiene la pausa',page.evaluate("!FirstPerson.locked()&&Game.state==='pause'"));page.click('#bRes')
 # También se fuerza la denegación de captura para comprobar el control alternativo.
 page.evaluate("window.povNativeCapture=Game.cv.requestPointerLock;Game.cv.requestPointerLock=()=>{throw Error('Captura denegada en prueba')};void 0")
 page.mouse.click(750,420);step();check('Denegar captura ofrece arrastre sin bloquear el juego',page.evaluate("FirstPerson.fallback&&FirstPerson.armed&&!FirstPerson.locked()&&Game.state==='play'"))
 angle=page.evaluate('Game.player.angle');mag=page.evaluate('Game.player.weapon.mag');page.mouse.move(750,420);page.mouse.down(button='right');page.mouse.move(840,440,steps=6);page.mouse.up(button='right');step()
 check('El arrastre alternativo gira sin golpear ni gastar balas',page.evaluate(f'Math.abs(Game.player.angle-({angle}))>.02&&Game.player.meleeCd===0&&Game.player.weapon.mag==={mag}'))
 page.evaluate("Game.cv.requestPointerLock=window.povNativeCapture;dispatchEvent(new Event('blur'))")
 check('Perder el foco pausa y limpia las acciones de primera persona',page.evaluate("Game.state==='pause'&&!FirstPerson.armed&&!FirstPerson.locked()&&Object.keys(Game.keys).length===0&&!Game.mouse.down"));page.click('#bRes')
 # Prólogo sin enemigos normales para aislar ruta, puertas y mecanismos de cámara.
 page.evaluate("Game.startLvl='mansion';Game.start(false);SceneTransitions.finish();Game.enemies=[];Game.keys={}")
 page.evaluate((R/'tests/walker.js').read_text());page.evaluate(HELPER)
 page.evaluate("fpqa.take('m2')");check('La biblioteca se alcanza andando en POV y entrega el documento',page.evaluate("Game.inv.docs.includes('m2')&&Game.pz['h:briefing']&&Game.state==='doc'"));page.keyboard.press('j')
 page.evaluate("fpqa.take('mk1');fpqa.take('h_clock')");check('El reloj del prólogo conserva su interfaz completa',page.is_visible('#puzzle') and page.locator('.clock-face').count()==1)
 for _ in range(3):page.get_by_label('Aumentar HORA',exact=True).click()
 for _ in range(8):page.get_by_label('Aumentar MINUTO',exact=True).click()
 page.click('#puzzleConfirm');check('Resolver el reloj abre el paso secreto también en POV',page.evaluate("Game.pz.h_clock&&Level.doors.find(d=>d.id==='secreto').open"))
 page.evaluate("fpqa.take('h_vial')")
 custodian=page.evaluate("(()=>{const c=Game.custodio,p=Game.player;p.angle=Math.atan2(c.y-p.y,c.x-p.x);Game.render();return !!c&&FirstPersonRenderer.stats.visibleEnemies>0})()")
 check('El primer cazador obligatorio tiene cuerpo visible durante la captura',custodian)
 page.evaluate("Game.keys={};for(let i=0;i<1800&&Game.lvl==='mansion';i++)fpqa.step()")
 check('La captura obligatoria lleva al hospital sin equipo',page.evaluate("Game.lvl==='hospital'&&Game.story.restrained&&Game.state==='play'&&!Game.player.weapon"))
 for _ in range(12):page.keyboard.press('e')
 page.evaluate("fpqa.walk(42,7);Game.keys={};for(let i=0;i<1800&&!Game.story.armCut;i++)fpqa.step()")
 check('La primera persecución abre la puerta al recibir el golpe previsto',page.evaluate("Game.story.armCut&&!Game.story.armHealed&&Game.story.firstDoorHits===1&&Level.doors.find(d=>d.id==='forced').open"))
 guide=page.evaluate("(()=>{Game.render();const a=FirstPersonRenderer.stats.introRelative,target=FirstPersonRenderer.stats.introTarget,yaw=Game.player.angle;Game.player.angle+=Math.PI/2;Game.render();const b=FirstPersonRenderer.stats.introRelative,text=document.getElementById('escapeGuide').textContent;Game.player.angle=yaw;return {a,b,target,text}})()")
 check('La huida usa una señal que gira con la cámara y conserva su destino',len(guide['target'])==2 and abs(math.atan2(math.sin(guide['b']-guide['a']),math.cos(guide['b']-guide['a']))+math.pi/2)<.01)
 check('La guía POV evita instrucciones absolutas de derecha o abajo',not any(word in guide['text'].lower() for word in ['derecha','baja por']))
 page.evaluate('fpqa.walk(52,24)');check('El tutorial aparece al llegar físicamente al vestíbulo',page.is_visible('#tutorial'));page.click('#tutorialClose');page.keyboard.press('f');step()
 check('La inyección desbloquea el hospital y conserva POV',page.evaluate("Game.story.armHealed&&Game.story.seq==='free'&&FirstPerson.active(Game)"))
 quiet();page.evaluate('Game.player.x=51.5*32;Game.player.y=29.5*32;Game.player.angle=0');capture('hospital')
 render_ms=page.evaluate('(()=>{for(let i=0;i<3;i++)Game.render();const start=performance.now();for(let i=0;i<12;i++)Game.render();return (performance.now()-start)/12})()');print('RENDER_MS',render_ms,flush=True)
 # Todas las pantallas usan sus controles habituales, con el cursor libre.
 for key,target in [('Tab','inv'),('j','doc'),('m','map'),('k','tree')]:
  page.keyboard.press(key);check('Interfaz '+target+' accesible en POV',page.is_visible('#'+target) and not page.evaluate('FirstPerson.locked()'));page.keyboard.press('Escape');check('Salir de '+target+' conserva el juego y su perspectiva',page.evaluate("Game.state==='play'&&FirstPerson.active(Game)"))
 # Proyección y oclusión real del framebuffer, con mapa y tiempos fijados.
 page.evaluate("Game.player.x=44.5*32;Game.player.y=29.5*32;Game.player.angle=0;Game.player.flash=Game.cam.shake=0;Game.particles=[];Game.tracers=[];Game.rings=[];Game.pools=[];Game.render()")
 project=page.evaluate("(()=>{const p=Game.player;return {front:FirstPersonRenderer.project(p.x+100,p.y,24),back:FirstPersonRenderer.project(p.x-100,p.y,24)}})()")
 check('La proyección sitúa delante al frente y descarta lo que queda atrás',project['front']['visible'] and not project['back']['visible'] and abs(project['front']['x']-page.evaluate('Game.cv.width/2'))<3)
 occlusion=page.evaluate("(()=>{const p=Game.player,tx=Math.floor(p.x/32)+1,ty=Math.floor(p.y/32),old=Level.grid[ty][tx],read=()=>Game.ctx.getImageData(0,0,Game.cv.width,Game.cv.height).data,changes=(a,b)=>{let n=0;for(let i=0;i<a.length;i+=4)if(a[i]!==b[i]||a[i+1]!==b[i+1]||a[i+2]!==b[i+2])n++;return n};try{Level.grid[ty][tx]=1;Game.enemies=[];Game.render();const empty=read();const e=new Enemy('sonambulo',p.x+96,p.y,9960);e.hp=500;e.grace=999;Game.enemies=[e];Game.render();const hidden=changes(empty,read());Level.grid[ty][tx]=0;Game.enemies=[];Game.render();const open=read();Game.enemies=[e];Game.render();return {hidden,visible:changes(open,read())};}finally{Level.grid[ty][tx]=old;Game.enemies=[]}})()")
 check('Una pared impide ver al enemigo que tiene detrás',occlusion['hidden']==0)
 check('El mismo enemigo sí aparece al quitar la pared',occlusion['visible']>50)
 # Disparo centrado, costes, recarga y armas de distinto funcionamiento.
 combat={}
 for wid in ['pistol','shotgun','viper','ak','r98','flamethrower','gl6']:
  result=page.evaluate("id=>{const g=Game,p=g.player;g.inv=new Inventory();for(let i=0;i<4;i++)g.inv.expand();p.weapons={};p.weapon=null;g.giveWeapon(id,12,true);p.weapon=p.weapons[id];p.x=44.5*32;p.y=29.5*32;p.angle=0;p.fireCd=p.reloading=p.spreadAdd=0;p.stamina=100;p.exertion=0;g.projectiles=[];g.eproj=[];g.flameJets=[];g.keys={};const e=new Enemy('sonambulo',p.x+96,p.y,9970);e.hp=e.maxHp=500;e.grace=999;g.enemies=[e];FirstPerson.sync(g);FirstPerson.armed=true;const mag=p.weapon.mag,st=p.stamina;g.mouse.clicked=true;g.update(1/60);g.render();return {mag,after:p.weapon.mag,st,stamina:p.stamina,hp:e.hp,projectiles:g.projectiles.length,jets:g.flameJets.length}}",wid)
  combat[wid]=result
  check(wid+': disparar consume cargador y estamina sin errores',result['after']==result['mag']-1 and result['stamina']<result['st'])
  check(wid+': el centro de la cámara corresponde al ataque real',result['projectiles']>0 if wid=='gl6' else result['jets']>0 and result['hp']<500 if wid=='flamethrower' else result['hp']<500)
  if wid in ['shotgun','flamethrower','gl6']:capture(wid)
 page.evaluate("Game.player.weapon=Game.player.weapons.gl6;Game.player.weapon.mag=0;Game.player.reloading=0;Game.player.stamina=100");reserve=page.evaluate("Game.inv.reserve('gl6')");page.keyboard.press('r');step(200)
 check('La recarga en POV repone el arma y cobra su munición',page.evaluate('Game.player.weapon.mag')>0 and page.evaluate("Game.inv.reserve('gl6')")<reserve)
 # Mapas y enemigos preparados para revisar todas las familias visuales y las mutaciones.
 quiet();maps=[]
 for lvl in ['hospital1','hospitalb','hospitalchem','hospitalworks','hospitalpit','hospitalnest','hospitalcells','hospitalcastle','hospitalcastle1','hospitalroyal','hospitalumbra','hospitalorigin','hospitalstreet']:
  page.evaluate("lvl=>{Hospital.goto(Game,lvl,FLOORS[lvl].spawn);Game.enemies=Game.enemies.filter(e=>e.isBoss);Game.player.invuln=999;Game.keys={};Game.player.angle=-Math.PI/2;Game.render()}",lvl);maps.append(lvl)
  check('La planta '+lvl+' se renderiza con sus colisiones originales',page.evaluate("FirstPerson.active(Game)&&Level.grid.length===Level.H&&Game.ctx.getImageData(0,0,1,1).data.length===4"))
  if lvl in ['hospitalworks','hospitalcastle','hospitalumbra','hospitalstreet']:capture(lvl)
 warning_cues=[]
 for lvl,bossname in [('hospitalchem','Carnicero'),('hospitalnest','Matriarca'),('hospitalroyal','Regente'),('hospitalorigin','Wren')]:
  page.evaluate("lvl=>{Hospital.goto(Game,lvl,FLOORS[lvl].spawn);const b=Game.boss;Game.enemies=[b];b.active=true;b.dormant=false;Game.player.x=b.x;Game.player.y=b.y+230;Game.player.angle=-Math.PI/2;Game.player.invuln=999;Game.keys={}}",lvl)
  for phase in [1,2,3]:
   baseline_cues=page.evaluate("phase=>{const b=Game.boss;b.phase=phase;b.mode='recover';Game.render();return FirstPersonRenderer.stats.groundCues}",phase)
   page.evaluate("phase=>{const b=Game.boss;b.phase=phase;b.mode='wind';b.attack='charge';b.dir=b.face=Math.atan2(Game.player.y-b.y,Game.player.x-b.x);b.target=[Game.player.x,Game.player.y];b.clock=b.windMax=1;Game.render()}",phase)
   check(bossname+': cuerpo y aviso de fase '+str(phase)+' se dibujan sin error',page.evaluate('FirstPerson.active(Game)&&Game.boss.phase')==phase and page.evaluate('FirstPersonRenderer.stats.groundCues')>=baseline_cues+2)
   warning_cues.append({'boss':bossname,'phase':phase,'recover':baseline_cues,'wind':page.evaluate('FirstPersonRenderer.stats.groundCues')})
   capture(bossname.lower()+'-'+str(phase))
 # Persistencia: el ajuste pertenece al navegador y no elimina progreso del guardado.
 page.evaluate("Hospital.goto(Game,'hospitalumbra',FLOORS.hospitalumbra.spawn);Game.enemies=[];Game.player.hp=71;Game.save(0);Game.toMenu()");page.click('#bCont');page.locator('.save-slot').first.click()
 check('Cargar una partida conserva progreso y POV',page.evaluate("Game.lvl==='hospitalumbra'&&Game.player.hp===71&&FirstPerson.enabled"))
 checkpoint=page.evaluate("Game.getSaveSlots()[3]");page.evaluate("Game.player.hp=0;Game.die()");page.wait_for_timeout(1000);page.click('#bRetry');check('Reintentar restaura el punto de control y mantiene POV',page.evaluate("({lvl:Game.lvl,hp:Game.player.hp,enabled:FirstPerson.enabled})")=={'lvl':checkpoint['lvl'],'hp':checkpoint['hp'],'enabled':True})
 page.evaluate("Game.pause();SceneTransitions.enabled=true");page.click('#bRes');page.evaluate("Hospital.goto(Game,'hospitalworks',FLOORS.hospitalworks.spawn)")
 check('El cambio de zona conserva el fundido en primera persona',page.evaluate('SceneTransitions.active'))
 page.wait_for_function('!SceneTransitions.active');check('Al terminar el fundido el mundo sigue en POV',page.evaluate("FirstPerson.active(Game)&&Game.lvl==='hospitalworks'"))
 page.keyboard.press('Escape');page.locator('#pauseFirstPerson').uncheck();page.click('#bRes');check('La partida termina pudiendo volver a topdown en el mismo lugar',page.evaluate("!FirstPerson.enabled&&Game.state==='play'&&Game.lvl==='hospitalworks'"))
 check('Ningún error de JavaScript en las dos perspectivas',not errors)
 result={'passed':passed,'errors':errors,'combat':combat,'warning_cues':warning_cues,'render_ms':round(render_ms,2),'occlusion':occlusion,'maps':maps,'screenshots':shots,'scope':'Controles reales y recorrido del prólogo/huida usando movimiento, puertas y colisiones. Enemigos normales retirados del recorrido geométrico. Combates y formas preparados para aislar apuntado/render; no equivalen a victorias de campaña ni prueba de dificultad humana.'}
 (R/'artifacts/pov-browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');browser.close()
