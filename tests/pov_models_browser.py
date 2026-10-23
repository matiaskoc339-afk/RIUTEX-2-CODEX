"""Identidades POV, colisiones de caché, siluetas, objetos y retícula centrada.
Los paneles y combates visuales usan entidades preparadas; no miden dificultad.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server

R=Path(__file__).resolve().parents[1]
passed=[]
def check(name,ok):
    assert ok,name
    passed.append(name)
    print('PASS',name,flush=True)

with local_server(R) as url,sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':1440,'height':900});errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
    page.goto(url);page.evaluate('document.fonts.ready');page.click('#bNew')
    page.evaluate("Game.loop=()=>{};SceneTransitions.finish();Game.enemies=[];Game.keys={};FirstPerson.setEnabled(true)")
    page.wait_for_timeout(60)
    page.evaluate("""window.modelqa={
      hash(cv,mask=false){let h=2166136261,n=0;const p=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;for(let i=0;i<p.length;i+=4){if(p[i+3]>20)n++;if(mask)h=Math.imul(h^(p[i+3]>20?1:0),16777619);else for(let j=0;j<4;j++)h=Math.imul(h^p[i+j],16777619);}return {hash:h>>>0,pixels:n};},
      entity(type,phase=1){return {type,phase,id:80001,x:Game.player.x+100,y:Game.player.y,face:Math.PI,def:ENEMY_TYPES[type]||{name:type},mode:'recover',isBoss:['carnicero','cl_blind','ds_guard','wx_keeper','ds_matriarch','cl_regent','lf_wren'].includes(type)};},
      panel(entries,kind,title){const cv=document.createElement('canvas'),cols=6,cell=256;cv.width=cols*cell;cv.height=48+Math.ceil(entries.length/cols)*294;const c=cv.getContext('2d');c.fillStyle='#101a20';c.fillRect(0,0,cv.width,cv.height);c.font='600 24px Rajdhani';c.fillStyle='#d4ddcd';c.fillText(title,20,30);entries.forEach((e,i)=>{const image=POVArt.sprite(e,kind,Game),x=i%cols*cell,y=48+Math.floor(i/cols)*294;c.fillStyle=i%2?'#1c2b2d':'#1a272a';c.fillRect(x+4,y+4,248,283);const k=246/Math.max(image.width,image.height);c.drawImage(image,x+(256-image.width*k)/2,y+(256-image.height*k)/2,image.width*k,image.height*k);c.fillStyle='#c7d0bc';c.font='600 17px Rajdhani';c.fillText(e.label||e.def?.name||e.type,x+12,y+274);});return cv.toDataURL();}
    };Game.t=1;Game.state='play'""")
    # Instancias reales: ambos heredan type=vacio; su imagen nunca debe compartirse.
    cache=page.evaluate("""(()=>{const a=new Enemy('vacio',100,100,1),b=new Carnicero(900,100,100),get=e=>POVArt.sprite(e,'enemy',Game);POVArt.sprites.clear();const common=get(a),butcher=get(b);POVArt.sprites.clear();const reverse=get(b),after=get(a);return {same:common===butcher||reverse===after,common:common.povModel,butcher:butcher.povModel,diff:modelqa.hash(common).hash!==modelqa.hash(butcher).hash};})()""")
    check('Carnicero real y Vacío no comparten caché en ningún orden',not cache['same'] and cache['common']=='vacio' and cache['butcher']=='carnicero' and cache['diff'])
    check('C-17 real conserva identidad distinta del Camillero que hereda',page.evaluate("(()=>{const a=POVArt.sprite(new Enemy('camillero',100,100,1),'enemy',Game),b=POVArt.sprite(new EscoltaC17(1197,100,100,360),'enemy',Game);return b.povModel==='c17'&&a!==b&&modelqa.hash(a).hash!==modelqa.hash(b).hash;})()"))
    models=page.evaluate("""(()=>{const types=[...new Set(['carnicero',...['mansion','hospital','hospital1','hospitalb','hospitalworks','hospitalcastle','hospitalcastle1','hospitalumbra'].flatMap(l=>R2_DATA(l).enemies.map(e=>e[1])),'wx_keeper','ds_guard','ds_spider','ds_matriarch','cl_blind','cl_regent','lf_wren','c17'])];window.modelEnemies=types.map(t=>modelqa.entity(t));return modelEnemies.map(e=>{const cv=POVArt.sprite(e,'enemy',Game);return {type:e.type,model:cv.povModel,...modelqa.hash(cv),mask:modelqa.hash(cv,true).hash,width:cv.povWidth,height:cv.povHeight};});})()""")
    for m in models:
        check(m['type']+': anatomía propia, opaca y con tamaño válido',m['model']==m['type'] and m['pixels']>500 and 0<m['width']<120 and 0<m['height']<100)
    check('Todas las familias de enemigos tienen imágenes diferentes',len({m['hash'] for m in models})==len(models))
    check('Las familias tienen siluetas diferentes, no solo recolores',len({m['mask'] for m in models})==len(models))
    # Guardar paneles locales de los mismos dibujos que consume el renderer.
    import base64
    def panel(name,expr,kind,title):
        data=page.evaluate('([entries,kind,title])=>modelqa.panel(entries,kind,title)',[page.evaluate(expr),kind,title])
        (R/'artifacts'/name).write_bytes(base64.b64decode(data.split(',',1)[1]))
    panel('pov-enemies-v017.png','modelEnemies','enemy','RIUTEX 2 / IDENTIDADES EN PRIMERA PERSONA')
    bosses=page.evaluate("""(()=>{window.modelBosses=['carnicero','ds_matriarch','cl_regent','lf_wren'].flatMap(t=>[1,2,3].map(p=>({...modelqa.entity(t,p),label:t+' / '+p})));return modelBosses.map(e=>({type:e.type,phase:e.phase,...modelqa.hash(POVArt.sprite(e,'enemy',Game))}));})()""")
    for t in ['carnicero','ds_matriarch','cl_regent','lf_wren']:
        check(t+': las tres mutaciones tienen aspecto diferente',len({b['hash'] for b in bosses if b['type']==t})==3)
    panel('pov-bosses-v017.png','modelBosses','enemy','RIUTEX 2 / LAS TRES MUTACIONES DE CADA JEFE')
    items=page.evaluate("""(()=>{window.modelItems=['pistol','w_shotgun','w_viper','w_ak','w_r98','w_flamethrower','w_gl6','ammo','shells','smg','rifleammo','fuel','lf_ammo','inj_green','inj_blue','inj_yellow','inj_cure','doc','key','sample','screw_small','screw_large','powder_small','powder_large','case','ds_suit_case'].map(type=>({type,id:type,doc:type==='doc'?'a1':undefined}));modelItems.push(...['wx_cell','wx_rotor','rack_crank','optic_lens','lf_coolant','cl_chart','cl_shot_spring','ds_fabric','lf_filter','lf_m9_chip'].map(part=>({type:'wx_part',part,label:part})));return modelItems.map(e=>({type:e.type,part:e.part,...modelqa.hash(POVArt.sprite(e,'item',Game))}));})()""")
    check('Armas, munición, documentos, materiales y piezas muestran dibujos propios',len({i['hash'] for i in items})==len(items) and all(i['pixels']>200 for i in items))
    parts=page.evaluate("""(()=>{const a=POVArt.sprite({type:'wx_part',part:'wx_cell'},'item',Game),b=POVArt.sprite({type:'wx_part',part:'wx_rotor'},'item',Game),s=POVArt.sprite({type:'adv_weapon',weapon:'shotgun'},'item',Game),u=POVArt.sprite({type:'adv_weapon',weapon:'viper'},'item',Game);return a!==b&&s!==u&&modelqa.hash(a).hash!==modelqa.hash(b).hash&&modelqa.hash(s).hash!==modelqa.hash(u).hash;})()""")
    check('Piezas y armas opcionales no se confunden por compartir tipo interno',parts)
    panel('pov-items-v017.png','modelItems','item','RIUTEX 2 / OBJETOS RECONOCIBLES EN EL SUELO')
    # Registro real de la huida: el Carnicero creado por Hospital.build sigue siendo él.
    page.evaluate("Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);Game.player.x=44.5*32;Game.player.y=29.5*32;Game.player.angle=0;Game.player.invuln=999;Game.player.hidden=false;Game.cam.shake=0;Game.player.hurtFlash=0;Game.particles=[];Game.rings=[];Game.tracers=[];Game.keys={};Game.carn.dormant=false;Game.carn.x=Game.player.x+120;Game.carn.y=Game.player.y;Game.carn.face=Math.PI;Game.enemies=[Game.carn];Game.update(0);Game.render()")
    check('El Carnicero del hospital usa su modelo incluso conservando type=vacio',page.evaluate("Game.carn.type==='vacio'&&POVArt.sprite(Game.carn,'enemy',Game).povModel==='carnicero'&&FirstPersonRenderer.stats.visibleEnemies===1"))
    page.screenshot(path=str(R/'artifacts/pov-butcher-hospital-v017.png'))
    for item_type in ['pistol','ammo','inj_green','doc','screw_small']:
        visible=page.evaluate("type=>{const g=Game,p=g.player;g.enemies=[];g.items=[];FirstPerson.pitch=.16;g.render();const before=g.ctx.getImageData(0,0,g.cv.width,g.cv.height).data;g.items=[{type,id:'model_drop_test',doc:type==='doc'?'a1':undefined,x:p.x+80,y:p.y}];g.render();const after=g.ctx.getImageData(0,0,g.cv.width,g.cv.height).data;let changed=0;for(let i=0;i<before.length;i+=4)if(before[i]!==after[i]||before[i+1]!==after[i+1]||before[i+2]!==after[i+2])changed++;return changed;}",item_type)
        check(item_type+': el objeto suelto se ve realmente sobre el suelo',visible>50)
    page.evaluate("Game.items=['pistol','ammo','inj_green','doc','screw_small'].map((type,i)=>({type,id:'model_drop_'+i,doc:type==='doc'?'a1':undefined,x:Game.player.x+70+i%2*40,y:Game.player.y+(i-2)*12}));Game.render()")
    page.screenshot(path=str(R/'artifacts/pov-floor-loot-v017.png'))
    page.evaluate('Game.items=[];Game.carn=null')
    aim=[]
    for pitch in [-.23,0,.23]:
        d=page.evaluate("pitch=>{FirstPerson.pitch=pitch;Game.render();const W=Game.cv.width,H=Game.cv.height;return {pitch,crosshair:FirstPersonRenderer.stats.crosshair,center:[W/2,H/2],horizon:FirstPersonRenderer.camera.horizon,pixel:Array.from(Game.ctx.getImageData(Math.floor(W/2),Math.floor(H/2),1,1).data)}}",pitch);aim.append(d)
        check('La mira permanece centrada al inclinar '+str(pitch),d['crosshair']['x']==d['center'][0] and d['crosshair']['y']==d['center'][1] and d['pixel'][:3]==[221,228,213])
    check('La cámara se inclina mientras la retícula queda fija',aim[0]['horizon']>aim[1]['horizon']>aim[2]['horizon'])
    FirstPersonOff=page.evaluate("FirstPerson.setEnabled(false);Game.render();Game.state==='play'&&!FirstPerson.enabled")
    check('El mismo escenario permite regresar al render clásico',FirstPersonOff)
    check('Sin errores JavaScript',not errors)
    version=json.loads((R/'package.json').read_text())['version']
    (R/'artifacts/pov-models-browser-results.json').write_text(json.dumps({'version':version,'passed':passed,'errors':errors,'models':models,'bosses':bosses,'items':items,'crosshair':aim,'scope':'Paneles y escena del Carnicero preparados; caché, siluetas y retícula comprobadas con canvas/Chromium real. No equivale a completar combates.'},ensure_ascii=False,indent=2)+'\n')
    browser.close()
