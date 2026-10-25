"""Ajustes reales, HUD de poderes y regreso a juego en ambas perspectivas."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server, start_new_game

ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1440,'height':900},device_scale_factor=1.5)
    page.on('pageerror',lambda e:errors.append(str(e)));page.goto(url)
    page.click('#bMenuOptions');page.click('#bMenuExperience')
    check('Opciones abre Imagen y comodidad sin iniciar una partida',page.evaluate("Game.state==='experienceOptions'&&!Game.player&&document.activeElement.id==='experienceFov'"))
    page.locator('#bExperienceBack').focus();page.keyboard.press('Tab')
    check('El panel conserva el foco con Tab',page.evaluate("document.activeElement.id==='experienceFov'"))
    page.locator('#experienceFov').fill('82');page.locator('#experienceHud').fill('110');page.locator('#experienceSway').fill('0');page.locator('#experienceShake').fill('0');page.select_option('#experienceQuality','economy')
    page.keyboard.press('Escape')
    check('Escape vuelve a opciones con el foco en el botón correcto',page.evaluate("Game.state==='menuOptions'&&document.activeElement.id==='bMenuExperience'"))
    page.locator('#bMenuOptionsClose').focus();page.keyboard.press('Tab')
    check('El recorrido del menú incluye todos los controles y vuelve al primero',page.evaluate("document.activeElement.id==='menuVolume'"))
    page.reload();page.click('#bMenuOptions');page.click('#bMenuExperience')
    check('FOV, calidad, escala y balanceo sobreviven al cerrar y volver',page.evaluate("ExperienceSettings.values.fov===82&&ExperienceSettings.values.quality==='economy'&&ExperienceSettings.values.hud===110&&ExperienceSettings.values.sway===0&&ExperienceSettings.values.shake===0"))
    page.screenshot(path=str(ROOT/'artifacts/experience-settings-v0250.png'))
    page.click('#bExperienceBack');page.click('#bMenuOptionsClose');start_new_game(page,True)
    try:
        page.wait_for_function("Game.state==='play'&&!SceneTransitions.active&&FirstPerson.locked()")
    except Exception:
        print('START_DIAGNOSTIC',page.evaluate("({state:Game.state,transition:SceneTransitions.active,locked:FirstPerson.locked(),wanted:FirstPerson.captureWanted,fallback:FirstPerson.fallback,focus:document.hasFocus()})"),errors,flush=True)
        raise
    page.evaluate('Game.loop=()=>{};Game.render()')
    check('POV aplica FOV, resolución ligera y sombras sin perder captura',page.evaluate("POV3DRenderer.camera3D.fov===82&&POV3DRenderer.ratio===1&&POV3DRenderer.flashlight.shadow.mapSize.x===768&&FirstPerson.locked()"))
    page.evaluate("""SceneTransitions.enabled=false;SceneTransitions.finish();Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.carn=null;Game.enemies=[];Game.items=[];Game.player.x=48.5*TILE;Game.player.y=26.5*TILE;Game.player.angle=0;FirstPerson.pitch=0;
        Game.giveWeapon('pistol',24,true);Game.player.weapon=Game.player.weapons.pistol;Game.player.energy=Game.player.maxEnergy;Game.player.hp=Game.player.maxHp;Game.player.stamina=100;Game.player.invuln=0;Game.keys={};Game.mouse.down=Game.mouse.clicked=false;Game.player.hurtFlash=0;Game.particles=[];Game.rings=[];
        for(const id of ['suspension','respiracion','camuflaje'])Game.mut.owned.add(id);Game.mut.bindings={suspension:'KeyQ',respiracion:'KeyZ',camuflaje:'KeyX'};Game.mut.equipped='suspension';Game.update(0);UI.msg('',0);Game.render();""")
    check('HUD muestra solo los poderes adquiridos con sus teclas',page.locator('#abilityDock .ability-chip').count()==3 and page.locator('[data-ability=suspension] kbd').inner_text()=='Q')
    page.evaluate("Game.castSkill('suspension');Game.render()")
    check('Lanzar un poder muestra su recuperación real y coste',page.evaluate("document.querySelector('[data-ability=suspension]').dataset.state==='cooldown'&&SurvivalReadout.skill(Game,'suspension').cooldown===Game.mut.cd.suspension"))
    page.evaluate("Game.player.energy=0;Game.mut.cd.suspension=0;Game.render()")
    check('Sin Riutex el indicador avisa sin permitir un lanzamiento gratis',page.locator('[data-ability=suspension]').get_attribute('data-state')=='blocked' and 'RIUTEX' in page.locator('[data-ability=suspension]').inner_text())
    page.evaluate("Game.player.energy=Game.player.maxEnergy;Game.player.weapon.mag=0;Weapons.reload(Game.player);Game.player.reloading=Game.player.reloadDuration*.5;Game.render()")
    check('La recarga tiene barra a mitad de progreso sin adelantar munición',page.evaluate("!document.querySelector('#reloadReadout').hidden&&document.querySelector('#reloadReadout i').style.transform==='scaleX(0.5)'&&Game.player.weapon.mag===0"))
    page.evaluate('Game.player.reloading=0;Weapons.finishReload(Game.player);Game.player.poison=4;Game.render()')
    check('Veneno y consumo de disparos tienen lectura visible',page.locator('#survivalConditions').is_visible() and 'VENENO' in page.locator('#survivalConditions').inner_text() and 'EST' in page.locator('#weaponEffort').inner_text())
    page.evaluate('Game.player.poison=0;Game.player.energy=Game.player.maxEnergy;Game.mut.cd.suspension=3.2;Game.temporalField=null;Game.render()');page.screenshot(path=str(ROOT/'artifacts/survival-hud-pov-v0250.png'))
    page.set_viewport_size({'width':1280,'height':720});page.evaluate("for(const [id,key]of [['desarme','KeyV'],['segundo_aliento','KeyB']]){Game.mut.owned.add(id);Game.mut.bindings[id]=key;}ExperienceSettings.set('hud',120);Game.render()")
    check('Cinco habilidades con HUD al 120 % no invaden los indicadores de esquina',page.evaluate("(()=>{const d=document.querySelector('#survivalReadout').getBoundingClientRect(),l=document.querySelector('.clinical-bars').getBoundingClientRect(),r=document.querySelector('#weaponHUD').getBoundingClientRect();return d.left>=l.right&&d.right<=r.left&&d.bottom<=innerHeight;})()"))
    page.set_viewport_size({'width':1440,'height':900});page.evaluate("for(const id of ['desarme','segundo_aliento']){Game.mut.owned.delete(id);delete Game.mut.bindings[id];}ExperienceSettings.set('hud',110);Game.render()")
    page.evaluate('Game.pause()');page.wait_for_function('!FirstPerson.locked()');page.click('#bPauseExperience')
    check('Abrir ajustes desde pausa mantiene el ratón libre',page.evaluate("Game.state==='experienceOptions'&&!FirstPerson.locked()&&document.querySelector('#survivalReadout').hidden"))
    page.locator('#experienceReduced').check();page.select_option('#experienceQuality','high');page.locator('#experienceSway').fill('100')
    check('Reducir movimiento desactiva sacudidas y balanceo',page.evaluate("MenuScene.motionReduced()&&ExperienceSettings.shakeFactor()===0&&POVCameraMotion.pose(Game).y===0&&document.body.classList.contains('comfort-reduced')"))
    page.locator('#experienceReduced').uncheck();page.evaluate('Game.render()');page.locator('#bExperienceBack').click();page.click('#bRes');page.wait_for_function('FirstPerson.locked()');page.evaluate('Game.render()')
    check('El HUD vuelve a su posición aunque se dibuje el juego detrás de Ajustes',page.evaluate("(()=>{const d=document.querySelector('#survivalReadout').getBoundingClientRect(),l=document.querySelector('.clinical-bars').getBoundingClientRect(),r=document.querySelector('#weaponHUD').getBoundingClientRect();return d.left>=l.right&&d.right<=r.left;})()"))
    check('Volver conserva la partida y recupera automáticamente la captura',page.evaluate("Game.state==='play'&&POV3DRenderer.camera3D.fov===82&&POV3DRenderer.ratio===1.5&&POV3DRenderer.flashlight.shadow.mapSize.x===1536"))
    page.evaluate('Game.pause()');page.wait_for_function('!FirstPerson.locked()');page.locator('#pauseFirstPerson').uncheck();page.click('#bRes');page.evaluate('Game.render()')
    check('Topdown conserva los mismos indicadores y deja libre el cursor',page.evaluate("!FirstPerson.enabled&&!FirstPerson.locked()&&!document.querySelector('#survivalReadout').hidden&&document.querySelectorAll('.ability-chip').length===3"))
    page.screenshot(path=str(ROOT/'artifacts/survival-hud-topdown-v0250.png'))
    page.evaluate('Game.pause()');page.click('#bPauseExperience');page.set_viewport_size({'width':390,'height':844})
    check('Ajustes estrechos se desplazan sin desbordamiento horizontal',page.evaluate("document.documentElement.scrollWidth<=innerWidth&&document.querySelector('.experience-panel').getBoundingClientRect().right<=innerWidth"))
    page.click('#bExperienceReset');check('Restablecer conserva el progreso y devuelve solo imagen a valores iniciales',page.evaluate("ExperienceSettings.values.fov===68&&ExperienceSettings.values.hud===100&&Game.player.weapons.pistol.mag>0&&Game.mut.has('suspension')"))
    page.click('#bExperienceBack');page.locator('#blueVolume').fill('36');page.reload()
    check('El volumen ajustado en pausa también sobrevive al cerrar la página',page.evaluate('Sound.volume===.36&&MenuScene.volume===.36'))
    check('No hay errores JavaScript en ajustes, HUD, recarga y perspectivas',not errors)
    (ROOT/'artifacts/experience-settings-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'scope':'Chromium WebGL y WebAudio local, menús y controles reales, partida hospital preparada para recarga/poderes. No es una campaña humana completa.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
