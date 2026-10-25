"""WebAudio nativo: mezcla, colas, navegación y render de timbres sin red."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server,start_new_game
ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,value):
    assert value,name
    passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page=browser.new_page(viewport={'width':1280,'height':800});page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(url);start_new_game(page,False);page.evaluate('Game.loop=()=>{};Sound.stopTransient()')
    if page.evaluate("typeof Soundscape==='undefined'"):
        page.add_script_tag(url=url+'/js/soundscape.js')
    check('El gesto de inicio desbloquea WebAudio y la mezcla limitada',page.evaluate("Sound.ctx.state==='running'&&!!Sound.master&&!!Sound.limiter&&!!Sound.ambient"))
    page.evaluate("Sound.volume=.42;Soundscape.refresh(Game)");page.wait_for_timeout(240)
    check('El volumen se aplica una vez a efectos y al bus ambiental',page.evaluate('Math.abs(Sound.master.gain.value-.42)<.01&&Math.abs(Sound.ambientGain.gain.value-.021)<.002'))
    page.evaluate("Sound.stopTransient();for(let i=0;i<100;i++)Sound.play('enemyhit');")
    check('Un enjambre no supera el límite de voces de sonido',page.evaluate('Sound.voices.size<=40&&Sound.stats.dropped>0'))
    page.wait_for_timeout(250)
    check('onended libera todas las voces y nodos de los impactos',page.evaluate('Sound.voices.size===0'))
    page.evaluate("Game.state='pause';UI.screen('pause')");page.wait_for_timeout(400)
    check('La pausa apaga suavemente el ambiente',page.evaluate('Sound.ambientTarget===0&&Sound.ambient.root.gain.value<.005'))
    page.evaluate("Game.state='play';UI.screen(null)");page.wait_for_timeout(300)
    check('Volver a jugar recupera el ambiente sin recrear fuentes',page.evaluate('Sound.ambientTarget>0&&Sound.ambient.root.gain.value>.05'))
    check('Los seis sectores tienen perfiles distintos y los refugios son más silenciosos',page.evaluate("new Set(['mansion','hospital','hospitalworks','hospitalcastle','hospitalumbra','hospitalstreet'].map(lvl=>Soundscape.sector({lvl}))).size===6&&Soundscape.profiles.refuge.level<Soundscape.profiles.hospital.level"))
    profiles=page.evaluate("""async()=>{
      Sound.stopTransient();const backup={ctx:Sound.ctx,graphContext:Sound.graphContext,master:Sound.master,ambientGain:Sound.ambientGain,limiter:Sound.limiter,buffers:Sound.buffers,voices:Sound.voices,ambient:Sound.ambient},out={};
      try{for(const id of ['pistol','ak','viper','shotgun','gl6']){
        Sound.ctx=new OfflineAudioContext(1,48000,48000);Sound.graphContext=null;Sound.buffers=new Map();Sound.voices=new Set();Sound.ambient=null;Sound.graph();Sound.play('shot',{weaponId:id});
        const b=await Sound.ctx.startRendering(),d=b.getChannelData(0);let peak=0,sum=0,late=0;for(let i=0;i<d.length;i++){peak=Math.max(peak,Math.abs(d[i]));sum+=d[i]*d[i];if(i>7200)late+=d[i]*d[i];}
        out[id]={peak,rms:Math.sqrt(sum/d.length),tail:Math.sqrt(late/(d.length-7200))};
      }}finally{Object.assign(Sound,backup);}return out;
    }""")
    check('Cinco familias producen audio real finito y mantienen los picos bajo saturación',all(0<v['peak']<.99 and v['rms']>.0005 for v in profiles.values()))
    check('El cuerpo y la cola de la escopeta duran más que los del subfusil',profiles['shotgun']['tail']>max(.00001,profiles['viper']['tail']*2))
    page.evaluate("Sound.volume=0;Sound.play('shot',{weaponId:'shotgun'});");page.wait_for_timeout(200)
    check('Silenciar desde ajustes baja también los sonidos que ya estaban activos',page.evaluate('Sound.master.gain.value<.001&&Sound.ambientGain.gain.value<.001'))
    check('No hay errores JavaScript en la sesión de audio',not errors)
    (ROOT/'artifacts/audio-polish-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'profiles':profiles,'scope':'AudioContext y OfflineAudioContext reales en Chromium; comprueba síntesis, mezcla y duración, no sustituye escucha subjetiva en altavoces.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
