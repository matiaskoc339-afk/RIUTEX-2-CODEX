from pathlib import Path
import json, os
from playwright.sync_api import sync_playwright
from browser_server import local_server
r=Path(__file__).resolve().parents[1]
with local_server(r) as base_url, sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=b.new_page(viewport={'width':1440,'height':900});errors=[];requests=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 page.on('request',lambda req:requests.append(req.url))
 page.goto(base_url+'/dist/RIUTEX2_Historia_Completa_v0.16.0.html')
 page.click('#bNew');page.wait_for_function('!SceneTransitions.active');page.keyboard.down('w');page.wait_for_timeout(750);page.keyboard.up('w')
 assert page.evaluate("Game.lvl==='mansion'&&Game.player.y<46*32"),'El HTML no mueve al jugador'
 page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.player.x=52*32;Game.player.y=28*32;Game.giveWeapon('pistol',24,true)")
 page.wait_for_timeout(900)
 page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
 page.keyboard.press('Tab');assert page.is_visible('#inv') and page.locator('#invGrid .it svg').count()>0
 assert page.locator('#fieldDesk [data-desk]').count()==6
 page.click('[data-desk="craft"]');assert page.is_visible('#craft') and page.locator('.recipe-card').count()==11
 page.click('[data-desk="artifacts"]');assert page.is_visible('#artifactDetail')
 page.keyboard.press('j');assert page.is_visible('#doc')
 page.keyboard.press('k');assert page.locator('.network-branch').count()==3
 assert page.locator('.network-node').count()==153
 page.keyboard.press('k');page.keyboard.press('m');assert page.is_visible('#map');page.keyboard.press('m')
 page.evaluate("BluePuzzles.open(Game,'mix')");page.get_by_label('Aumentar CANAL A',exact=True).click();page.keyboard.press('Escape')
 page.evaluate('Game.save(0)');page.reload();page.click('#bCont');page.locator('.save-slot').first.click();page.wait_for_timeout(800)
 assert page.evaluate("Game.story.mechanisms.mix[0]===1&&Game.story.seq==='free'")
 page.evaluate('SceneTransitions.enabled=false;SceneTransitions.finish()')
 fps=page.evaluate('''()=>new Promise(resolve=>{let count=0,start=performance.now();function f(t){count++;if(t-start>2000)resolve(count*1000/(t-start));else requestAnimationFrame(f);}requestAnimationFrame(f);})''')
 page.screenshot(path=str(r/'artifacts/blue-final-gameplay.png'))
 page.evaluate("Hospital.goto(Game,'hospitalchem',[9,24]);Game.update(.01);Game.render()")
 assert page.evaluate("Game.boss instanceof FinalCarnicero&&Game.boss.phase===1&&Game.boss.hp===1500&&FLOORS.hospitalchem.rooms.length===2")
 page.screenshot(path=str(r/'artifacts/standalone-final-v010.png'))
 page.evaluate("Game.pz['h:boss']=true;Hospital.goto(Game,'hospitalworks',[64,12]);Game.update(.01);Game.render()")
 assert page.evaluate("Level.rooms.length===30&&Game.enemies.every(e=>e instanceof WorksEnemy)&&!!DOCS.wx_radio_log&&Workshop.powered(Game)")
 page.screenshot(path=str(r/'artifacts/standalone-works-v011.png'))
 page.evaluate("Hospital.goto(Game,'hospitalnest',[31,30]);ProtectionSuit.acquire(Game);Game.update(.01);Game.render()")
 assert page.evaluate("Game.boss instanceof SpiderMatriarch&&Game.boss.active&&Game.boss.phase===1&&ProtectionSuit.data().hp===90&&FLOORS.hospitalworks.items.some(i=>i[1]==='ds_launcher_case')")
 page.screenshot(path=str(r/'artifacts/standalone-nest-v012.png'))
 page.evaluate("Hospital.goto(Game,'hospitalworks',[64,12]);Workshop.open(Game);Workshop.render(Game,'suit')")
 assert page.locator('[data-bench-weapon=flamethrower]').count()==1 and page.locator('[data-suit]').count()==4
 page.keyboard.press('Escape');page.evaluate("Hospital.goto(Game,'hospitalcells',[17,31]);Game.update(.01);Game.render()")
 assert page.evaluate("Game.prisoner instanceof BlindCarver&&Game.prisoner.active&&FLOORS.hospitalcastle.rooms.length+FLOORS.hospitalcastle1.rooms.length===44")
 page.evaluate("Hospital.goto(Game,'hospitalcastle1',[64,47]);CastlePuzzles.open(Game,'light')")
 assert page.is_visible('#castlePuzzle') and page.locator('#clPuzzleBody svg').count()==1
 assert page.locator('.cl-panel').evaluate("e=>getComputedStyle(e).backgroundImage.includes('gradient')")
 page.screenshot(path=str(r/'artifacts/standalone-castle-v013.png'))
 page.keyboard.press('Escape');page.evaluate("Hospital.goto(Game,'hospitalumbra',[77,63]);Game.giveWeapon('gl6',3,true);Game.update(.01);Game.render()")
 assert page.evaluate("Level.rooms.length===26&&Game.enemies.every(e=>e instanceof EndEnemy)&&Game.player.weapons.gl6&&Workshop.powered(Game)")
 page.evaluate("EndPuzzles.open(Game,'dna')")
 assert page.is_visible('#lfPuzzle') and page.locator('.lf-dna button').count()==6
 assert page.locator('.lf-panel').evaluate("e=>getComputedStyle(e).backgroundImage.includes('gradient')")
 page.screenshot(path=str(r/'artifacts/standalone-endgame-v014.png'))
 page.evaluate("Game.resume();FirstPerson.setEnabled(true);Game.render()")
 assert page.evaluate("FirstPerson.active(Game)&&POVArt.ready&&FirstPersonRenderer.stats.level==='hospitalumbra'&&FirstPersonRenderer.stats.columns===Game.cv.width")
 page.screenshot(path=str(r/'artifacts/standalone-pov-v016.png'))
 page.keyboard.press('Escape');assert page.is_checked('#pauseFirstPerson');page.uncheck('#pauseFirstPerson');page.click('#bRes')
 assert page.evaluate("Game.state==='play'&&!FirstPerson.enabled&&Game.lvl==='hospitalumbra'")
 file_access={'attempted':True,'status':'not_run'}
 offline=b.new_context(offline=True);filepage=offline.new_page()
 try:
  filepage.goto((r/'dist/RIUTEX2_Historia_Completa_v0.16.0.html').as_uri())
  filepage.click('#bNew');filepage.wait_for_function('!SceneTransitions.active');filepage.keyboard.down('w');filepage.wait_for_timeout(400);filepage.keyboard.up('w')
  assert filepage.evaluate("Game.lvl==='mansion'&&Game.player.y<46*32")
  file_access={'attempted':True,'status':'passed'}
 except Exception as exc:
  if 'ERR_BLOCKED_BY_ADMINISTRATOR' not in str(exc):raise
  file_access={'attempted':True,'status':'blocked_by_environment','reason':'Chromium administrado bloquea file:// con ERR_BLOCKED_BY_ADMINISTRATOR. HTML validado por HTTP, sin recursos externos.'}
 finally:offline.close()
 external=[url for url in requests if not url.startswith('data:') and not url.endswith('/dist/RIUTEX2_Historia_Completa_v0.16.0.html')]
 assert not external,external
 assert not errors,errors
 result={'version':'0.16.0','standalone':True,'checks':['Movimiento','Inicio hospital','153 opciones','Plano','Expediente e iconos','Fabricación y artefactos','Mecanismo','Guardado tras recargar','Recursos integrados','POV y materiales integrados','Volver a vista clásica desde pausa en HTML integrado','Final C-0 integrado','Fábrica y fauna integradas','Cueva y Matriarca integradas','FL-4 y banco del S-4 integrados','Calabozo, 44 salas y mecanismos del castillo con CSS integrado','Laboratorio, GL-6 e instrumentación final integrados'],'external_requests':external,'errors':errors,'file_access':file_access,'headless_fps':round(fps,1)}
 (r/'artifacts/standalone-blue-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(result)
 b.close()
