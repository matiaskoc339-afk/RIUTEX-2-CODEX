"""Sesión en iframe de otro origen: cerrar pestaña y navegador, reabrir perfil y copias."""
from pathlib import Path
from tempfile import TemporaryDirectory
import json,zipfile
from urllib.parse import quote
from playwright.sync_api import sync_playwright
from browser_server import local_server

ROOT=Path(__file__).resolve().parents[1]
VERSION=json.loads((ROOT/'package.json').read_text())['version']
passed=[];errors=[]
def check(name,ok):
    assert ok,name
    passed.append(name);print('PASS',name,flush=True)

def opened(context,base,hostbase):
    context.add_init_script("addEventListener('load',()=>{if(typeof SceneTransitions!=='undefined'){SceneTransitions.enabled=false;SceneTransitions.finish();}});")
    page=context.new_page()
    src=base+'/dist/RIUTEX2_Historia_Completa_v'+VERSION+'.html'
    host=hostbase+'/tests/itch-host.html?game='+quote(src,safe='')
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(host)
    page.wait_for_selector('iframe')
    frame=page.frame(name='riutex')
    frame.wait_for_function("typeof Game!=='undefined'&&!!Game.cv")
    frame.evaluate('Game.loop=()=>{};SceneTransitions.finish()')
    return page,frame

def prepare(frame,pov=False):
    frame.click('#bNew')
    frame.evaluate("""pov=>{const g=Game;Hospital.toHospital(g);g.story.restrained=false;Hospital.inject(g);Hospital.lobbyReached(g);g.story.seq='free';g.carn=null;g.state='play';UI.screen(null);g.giveWeapon('pistol',12,true);FirstPerson.setEnabled(pov);
      g.take(g.items.find(i=>i.doc==='a1'));g.resume();g.save(0);
      g.player.hp=37;g.player.stamina=21;g.player.energy=26;g.player.poison=4;g.player.xp=22;g.player.weapon.mag=5;
      const e=g.enemies.find(e=>e.type==='enfermera');e.hp=13;window.sessionEnemy=e.id;g.render();}""",pov)

with local_server(ROOT) as base,local_server(ROOT) as hostbase,sync_playwright() as pw:
    for pov in [False,True]:
        label='POV' if pov else 'Topdown'
        with TemporaryDirectory(prefix='riutex-profile-') as profile:
            args={'executable_path':'/usr/bin/chromium','headless':True,'args':['--no-sandbox'],'viewport':{'width':1440,'height':900},'accept_downloads':True}
            context=pw.chromium.launch_persistent_context(profile,**args)
            page,frame=opened(context,base,hostbase);prepare(frame,pov)
            check(label+': carga dentro de iframe de otro origen',frame.evaluate('location.origin')!=page.evaluate('location.origin'))
            check(label+': el último cambio aún no se ha guardado por intervalo',frame.evaluate('SessionSave.read().data.xp!==22'))
            manual=frame.evaluate('JSON.stringify(Game.getSaveSlots().slice(0,3))')
            enemy=frame.evaluate('sessionEnemy')
            page.close(run_before_unload=True)
            context.close()
            context=pw.chromium.launch_persistent_context(profile,**args)
            page,frame=opened(context,base,hostbase)
            check(label+': Continuar está disponible tras cerrar el navegador',not frame.locator('#bCont').is_disabled())
            frame.click('#bCont')
            check(label+': sesión separada y tres huecos manuales',frame.locator('#bResumeSession').is_visible() and frame.locator('.save-slot').count()==3)
            frame.click('#bResumeSession')
            actual=frame.evaluate("""id=>{const g=Game;return {lvl:g.lvl,hp:g.player.hp,stamina:g.player.stamina,energy:g.player.energy,poison:g.player.poison,xp:g.player.xp,mag:g.player.weapon.mag,doc:g.inv.docs.includes('a1'),enemy:g.enemies.find(e=>e.id===id).hp,pov:FirstPerson.enabled};}""",enemy)
            check(label+': perfil reabierto conserva recursos, documento y enemigo herido',actual=={'lvl':'hospital','hp':37,'stamina':21,'energy':26,'poison':4,'xp':22,'mag':5,'doc':True,'enemy':13,'pov':pov})
            check(label+': el cierre no sobrescribe los tres guardados manuales',frame.evaluate('JSON.stringify(Game.getSaveSlots().slice(0,3))')==manual)
            frame.evaluate('Game.player.xp=24')
            page.reload();frame=page.frame(name='riutex');frame.wait_for_function("typeof Game!=='undefined'&&!!Game.cv");frame.evaluate('Game.loop=()=>{};SceneTransitions.finish()')
            frame.click('#bCont');frame.click('#bResumeSession')
            check(label+': recargar la página conserva el cambio más reciente',frame.evaluate('Game.player.xp===24'))
            frame.evaluate("Game.player.xp=27;Game.enemies=[];Game.player.poison=0;for(let i=0;i<610;i++)Game.update(1/60)")
            check(label+': el periódico persiste sin salir ni usar camilla',frame.evaluate('SessionSave.read().data.xp===27'))
            frame.evaluate('Game.player.xp=31;Game.toMenu()');frame.click('#bCont');frame.click('#bResumeSession')
            check(label+': volver al menú también guarda la sesión',frame.evaluate('Game.player.xp===31'))
            context.close()

    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':900},accept_downloads=True)
    context.add_init_script("Storage.prototype.getItem=function(){throw new DOMException('blocked','SecurityError')};Storage.prototype.setItem=function(){throw new DOMException('blocked','SecurityError')};")
    page,frame=opened(context,base,hostbase);prepare(frame)
    check('El almacenamiento bloqueado no impide jugar',frame.evaluate("Game.state==='play'&&Game.player.hp===37&&SessionSave.issue"))
    frame.evaluate('Game.pause()');frame.click('#bSessionSlots')
    check('La interfaz avisa del fallo real y ofrece una copia', 'no permite guardar' in frame.locator('#sessionSaveStatus').inner_text() and not frame.locator('#bExportSession').is_disabled())
    with page.expect_download() as download:
        frame.click('#bExportSession')
    with TemporaryDirectory(prefix='riutex-backup-') as directory:
        path=Path(directory)/'partida.json';download.value.save_as(path);data=path.read_bytes()
        check('La copia se descarga desde el iframe aun sin almacenamiento',json.loads(data)['data']['xp']==22)
        frame.locator('#sessionImportFile').set_input_files({'name':'roto.json','mimeType':'application/json','buffer':b'{roto'})
        frame.wait_for_function("document.getElementById('sessionImportFile').value===''")
        check('Importar un archivo dañado conserva la partida actual',frame.evaluate('Game.player.xp===22&&Game.player.hp===37'))
        frame.evaluate('Game.player.xp=1')
        frame.locator('#sessionImportFile').set_input_files({'name':'partida.json','mimeType':'application/json','buffer':data})
        frame.wait_for_function("document.getElementById('sessionImportFile').value===''")
        check('La copia importada recupera progreso incluso con almacenamiento bloqueado',frame.evaluate("Game.state==='play'&&Game.player.xp===22&&Game.player.hp===37&&Game.player.weapon.mag===5"))
    browser.close()

    with zipfile.ZipFile(ROOT/'dist'/('RIUTEX2_itchio_v'+VERSION+'.zip')) as archive:
        check('El ZIP para itch.io tiene index.html en la raíz',archive.namelist()==['index.html'])
        check('El ZIP contiene exactamente el HTML integrado probado',archive.read('index.html')==(ROOT/'dist'/('RIUTEX2_Historia_Completa_v'+VERSION+'.html')).read_bytes())
    check('Sin errores JavaScript',not errors)
    result={'version':VERSION,'passed':passed,'errors':errors,'scope':'Chromium con perfil persistente: iframe sandbox de otro origen, cierre normal de pestaña y proceso, reapertura del mismo perfil, recarga, periódico, menú y copia descargada/importada sin almacenamiento. No publica ni prueba un dominio real de itch.io; no simula cierre forzado del sistema.'}
    (ROOT/'artifacts/persistence-browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
