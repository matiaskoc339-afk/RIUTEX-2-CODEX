"""POV: framebuffer de avisos, poderes, caída y evacuación.
Estados de jefes y cronología se preparan para aislar presentación; no son victorias nuevas.
Las comparaciones mantienen tiempo/cámara fijos y ocultan solo el efecto examinado.
"""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
R=Path(__file__).resolve().parents[1];passed=[];errors=[];metrics={};shots=[]
def check(name,value):
 if not value:print('DEBUG',page.evaluate("({state:Game.state,lvl:Game.lvl,p:[Game.player.x,Game.player.y,Game.player.angle],stats:FirstPersonRenderer.stats})"),errors,flush=True)
 assert value,name
 passed.append(name);print('PASS',name,flush=True)
def capture(name):
 page.screenshot(path=str(R/'artifacts'/('pov-effects-'+name+'-v016.png')));shots.append(name)
HELPERS=r'''window.fxqa={
 read(){return Game.ctx.getImageData(0,0,Game.cv.width,Game.cv.height).data;},
 diff(a,b,top=.48,bottom=.97){let changed=0,energy=0;const W=Game.cv.width,H=Game.cv.height;for(let y=Math.floor(H*top);y<Math.floor(H*bottom);y++)for(let x=0;x<W;x++){const i=(y*W+x)*4,d=Math.abs(a[i]-b[i])+Math.abs(a[i+1]-b[i+1])+Math.abs(a[i+2]-b[i+2]);if(d>5)changed++;energy+=d;}return {changed,energy};},
 render(){UI.hud(Game.player,Game.inv,Game.mut);if(EndMap.is(Game))Endgame.hud(Game);Game.render();},
 scene(lvl,x,y,angle=-Math.PI/2){
  Game.startLvl='mansion';Game.start(false);Hospital.goto(Game,lvl,FLOORS[lvl].spawn);
  Game.story.restrained=false;Game.story.armCut=true;Game.story.armHealed=true;Game.story.seq='free';Game.mut.tutorial=true;
  Game.state='play';UI.screen(null);Game.enemies=[];Game.carn=null;Game.items=[];Game.bodies=[];Game.barrels=[];
  Game.particles=[];Game.tracers=[];Game.rings=[];Game.pools=[];Game.eproj=[];Game.projectiles=[];Game.flameJets=[];
  Game.temporalField=Game.gravityWell=Game.psychicAnchor=Game.fleshEcho=null;
  Game.player.x=x;Game.player.y=y;Game.player.angle=angle;Game.player.hp=Game.player.maxHp=100;
  Game.player.weapon=null;Game.player.hidden=false;Game.player.poison=0;Game.player.flash=Game.player.hurtFlash=Game.cam.shake=0;
  Game.player.walkT=0;Game.player.invuln=999;Game.player.stamina=Game.player.maxStamina=1000;Game.player.energy=Game.player.maxEnergy=1000;
  Game.keys={};Game.t=42;FirstPerson.pitch=0;FirstPerson.setEnabled(true);FirstPerson.armed=true;FirstPerson.sync(Game);
  this.render();
 },
 isolateCues(b){
  this.render();const withCue=this.read(),original=b.drawCue;b.drawCue=()=>{};
  this.render();const difference=this.diff(withCue,this.read());b.drawCue=original;this.render();return difference;
 },
 frameMean(top=0,bottom=.25){const data=this.read(),W=Game.cv.width,H=Game.cv.height;let total=0,n=0;for(let y=Math.floor(H*top);y<Math.floor(H*bottom);y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4;total+=.2126*data[i]+.7152*data[i+1]+.0722*data[i+2];n++;}return total/n;}
};'''
with local_server(R) as url,sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
 page.goto(url);page.evaluate('document.fonts.ready');page.evaluate('Game.loop=()=>{}');page.evaluate(HELPERS)
 # Tres cuerpos y ataques reales de ORIGEN. El segundo contraste aísla exactamente sus trazos del suelo.
 page.evaluate("fxqa.scene('hospitalorigin',29.5*32,38.5*32);Game.boss=new OriginWren(29.5*32,24.5*32);Game.boss.active=true;Game.enemies=[Game.boss];Game.curBoss=Game.boss")
 for phase,attack in [(1,'needles'),(2,'slam'),(3,'charge')]:
  result=page.evaluate("([phase,attack])=>{const b=Game.boss;b.phase=phase;b.r=[0,27,40,54][phase];b.recover(3);fxqa.render();const rest=fxqa.read();b.begin(attack,Game);fxqa.render();const wind=fxqa.diff(rest,fxqa.read());const cue=fxqa.isolateCues(b);return {phase,attack,wind,cue}}",[phase,attack]);metrics['wren_'+str(phase)]=result
  check('Wren fase '+str(phase)+': aviso previo cambia el suelo respecto a recuperación',result['wind']['changed']>30)
  check('Wren fase '+str(phase)+': los píxeles proceden del aviso original proyectado',result['cue']['changed']>30)
 marks=page.evaluate("(()=>{const b=Game.boss;b.phase=3;b.begin('marks',Game);b.execute(Game);fxqa.render();const withMarks=fxqa.read(),saved=b.marks;b.marks=[];fxqa.render();const diff=fxqa.diff(withMarks,fxqa.read());b.marks=saved;fxqa.render();return {count:saved.length,diff}})()");metrics['wren_marks']=marks
 check('Las cuatro marcas de contención son visibles mientras el jefe se recupera',marks['count']==4 and marks['diff']['changed']>50)
 waves=page.evaluate("(()=>{const b=Game.boss;b.begin('wave',Game);b.execute(Game);b.update(1.5,Game);fxqa.render();const withWave=fxqa.read(),saved=b.waves;b.waves=[];fxqa.render();const diff=fxqa.diff(withWave,fxqa.read());b.waves=saved;fxqa.render();return {count:saved.length,r:saved[0]?.r,diff}})()");metrics['wren_wave']=waves
 check('La onda expansiva activa tiene banda visible propia en el framebuffer',waves['count']==1 and waves['r']>300 and waves['diff']['changed']>50)
 capture('wren-cues')
 # Matriarca: avisos, crías reales después del temporizador, residuos y veneno.
 page.evaluate("fxqa.scene('hospitalnest',31.5*32,31.5*32);Game.boss=new SpiderMatriarch(31.5*32,18.5*32);Game.boss.active=true;Game.boss.dormant=false;Game.boss.phase=3;Game.boss.recover(10);Game.boss.summonClock=999;Game.enemies=[Game.boss];Game.curBoss=Game.boss")
 for attack in ['venom','pounce']:
  result=page.evaluate("attack=>{const b=Game.boss;b.recover(3);fxqa.render();const rest=fxqa.read();b.begin(attack,Game);fxqa.render();return {wind:fxqa.diff(rest,fxqa.read()),cue:fxqa.isolateCues(b)}}",attack);metrics['spider_'+attack]=result
  check('Matriarca: '+attack+' conserva su aviso preciso sobre el suelo',result['wind']['changed']>30 and result['cue']['changed']>30)
 brood=page.evaluate("(()=>{const b=Game.boss;b.recover(8);b.scheduleBrood(Game);fxqa.render();const withCue=fxqa.read(),saved=b.brood;b.brood=[];fxqa.render();const diff=fxqa.diff(withCue,fxqa.read());b.brood=saved;return {n:saved.length,diff}})()");metrics['brood']=brood
 check('Los capullos programados avisan antes de crear crías',brood['n']>0 and brood['diff']['changed']>20)
 spawned=page.evaluate("(()=>{Game.boss.update(1.85,Game);const children=Game.enemies.filter(e=>e instanceof MutantSpider&&e.colony&&!e.dead);return children.length})()")
 check('Terminar la señal crea las arañas mutadas originales',spawned==brood['n'])
 poison=page.evaluate("(()=>{const b=Game.boss;b.recover(20);Game.pools=[{x:Game.player.x,y:Game.player.y-90,r:45,life:4}];fxqa.render();const pool=fxqa.read();Game.pools=[];fxqa.render();const poolDiff=fxqa.diff(pool,fxqa.read());Game.pools=[{x:Game.player.x,y:Game.player.y-90,r:45,life:4}];Game.player.poison=0;fxqa.render();const clear=fxqa.read();Game.player.poison=10;fxqa.render();return {pool:poolDiff,overlay:fxqa.diff(clear,fxqa.read(),0,1)}})()");metrics['poison']=poison
 check('El veneno del suelo tiene superficie visible',poison['pool']['changed']>30)
 check('Estar envenenado añade un efecto visible propio',poison['overlay']['changed']>1000)
 capture('spider-poison')
 # Poderes originales en la geometría del núcleo, con efecto visible y consumo real.
 page.evaluate("fxqa.scene('hospitalorigin',29.5*32,37.5*32)")
 for skill,field in [('suspension','temporalField'),('singularidad','gravityWell'),('ancla','psychicAnchor')]:
  result=page.evaluate("([skill,field])=>{const g=Game,p=g.player;g.temporalField=g.gravityWell=g.psychicAnchor=null;g.rings=[];g.mut.owned.add(skill);g.mut.cd={};p.energy=1000;fxqa.render();const before=fxqa.read();g.castSkill(skill);fxqa.render();return {exists:!!g[field],cost:1000-p.energy,diff:fxqa.diff(before,fxqa.read())}}",[skill,field]);metrics[skill]=result
  check(skill+': activa el poder original, consume Riutex y se ve su campo',result['exists'] and result['cost']>0 and result['diff']['changed']>20)
 echo=page.evaluate("(()=>{const g=Game,p=g.player;g.temporalField=g.gravityWell=g.psychicAnchor=null;g.rings=[];g.mut.owned.add('eco_carnal');g.mut.cd={};p.energy=1000;g.castSkill('eco_carnal');p.y+=100;fxqa.render();const withEcho=fxqa.read(),echo=g.fleshEcho;g.fleshEcho=null;fxqa.render();const diff=fxqa.diff(withEcho,fxqa.read(),0,1);g.fleshEcho=echo;fxqa.render();return {exists:!!echo,diff}})()");metrics['echo']=echo
 check('Eco de carne conserva el señuelo visible al separarse de él',echo['exists'] and echo['diff']['changed']>30)
 hidden=page.evaluate("(()=>{Game.fleshEcho=null;Game.player.poison=0;Game.player.hidden=false;fxqa.render();const open=fxqa.frameMean();Game.player.hidden=true;fxqa.render();const shut=fxqa.frameMean();const x=Game.player.x,y=Game.player.y;Game.keys={KeyW:true};Game.update(.1);return {open,shut,stationary:Game.player.x===x&&Game.player.y===y}})()");metrics['hide']=hidden
 check('Ocultarse muestra rendijas oscuras y bloquea el movimiento',hidden['shut']<hidden['open']*.5 and hidden['stationary'])
 # Caída real: disparador del sótano, bloqueo del control y llegada a la arena C-0.
 page.evaluate("fxqa.scene('hospitalb',79*32,42*32);Game.pz['h:power']=true;Game.pz['h:boss']=false;Game.story.finalEncounter=null;Game.update(.01)")
 check('El disparador del sótano inicia la caída en POV',page.evaluate('!!Game.collapse&&FirstPerson.active(Game)'))
 fall=page.evaluate("(()=>{const g=Game,p=g.player,x=p.x,y=p.y;g.collapse.t=.2;g.t=42;fxqa.render();const before=fxqa.read();g.keys={KeyW:true};g.update(1.1);g.t=42;fxqa.render();return {blocked:p.x===x&&p.y===y,diff:fxqa.diff(before,fxqa.read(),0,1)}})()");metrics['fall']=fall
 check('La caída oscurece la vista sin dejar caminar al personaje',fall['blocked'] and fall['diff']['changed']>500)
 page.evaluate('SceneTransitions.enabled=true;Game.update(.6)');check('La llegada a C-0 conserva el fundido y el Carnicero',page.evaluate("Game.lvl==='hospitalchem'&&Game.boss instanceof FinalCarnicero&&SceneTransitions.active"));page.wait_for_function('!SceneTransitions.active');page.evaluate('fxqa.render();SceneTransitions.enabled=false');check('La rejilla y el combate siguen en primera persona tras caer',page.evaluate("!Game.collapse&&FirstPerson.active(Game)&&Game.boss.phase===1&&Game.boss.hp===1500"))
 # Dos elecciones reales, preparadas tras victoria; la calle progresa con su cronología original.
 for choice in ['cure','mutate']:
  page.set_viewport_size({'width':1440,'height':900} if choice=='cure' else {'width':1280,'height':720})
  page.evaluate("choice=>{fxqa.scene('hospitalorigin',29.5*32,37.5*32);const q=Endgame.data(Game);q.boss.won=true;q.process=1;Game.boss.dead=true;Game.boss.hp=0;Game.boss.active=false;Game.pz['h:lf_wren']=true;Game.state='lfDecision';UI.screen('lfDecision');Endgame.choose(Game,choice);Hospital.goto(Game,'hospitalstreet',[32,53]);Game.player.x=32.5*32;Game.player.y=29.5*32;Game.player.angle=-Math.PI/2;Game.player.invuln=0;Endgame.tick(Game,0);Game.keys={};Game.t=42}",choice)
  check('La calle inicia la evacuación '+choice+' conservando POV',page.evaluate("Endgame.data(Game).street.active&&FirstPerson.active(Game)&&Game.state==='play'"))
  target=5.2 if choice=='cure' else 7.4
  page.evaluate("target=>{while(Endgame.data(Game).street.elapsed<target){Game.t+=.05;Endgame.tick(Game,.05)}fxqa.render()}",target)
  helicopter=page.evaluate("(()=>{fxqa.render();const withAircraft=fxqa.read(),original=POVArt.sprite;POVArt.sprite=function(e,k,g){return k==='helicopter'?POVArt.canvas(256,128):original.call(this,e,k,g)};try{fxqa.render();return fxqa.diff(withAircraft,fxqa.read(),0,.6)}finally{POVArt.sprite=original;fxqa.render()}})()");metrics['helicopter_'+choice]=helicopter
  check('El helicóptero '+choice+' se ve realmente sobre la calle',helicopter['changed']>50)
  rope=page.evaluate("(()=>{fxqa.render();const withRope=fxqa.read(),original=FirstPersonRenderer.line3D;let calls=0;FirstPersonRenderer.line3D=function(a,b,color,...args){if(color==='#bac2a1'){calls++;return}return original.call(this,a,b,color,...args)};try{fxqa.render();return {calls,diff:fxqa.diff(withRope,fxqa.read(),0,1)}}finally{FirstPersonRenderer.line3D=original;fxqa.render()}})()");metrics['rope_'+choice]=rope
  check('La cuerda solo aparece en la extracción humana' if choice=='cure' else 'La extracción mutante no dibuja una cuerda de rescate',rope['calls']==1 and rope['diff']['changed']>20 if choice=='cure' else rope['calls']==0)
  if choice=='mutate':
   military=page.evaluate("(()=>{Game.tracers=[];for(let i=0;i<10&&!Game.tracers.length;i++){Game.t+=1/30;Endgame.tick(Game,1/30)}fxqa.render();const withShots=fxqa.read(),saved=Game.tracers;Game.tracers=[];fxqa.render();const diff=fxqa.diff(withShots,fxqa.read(),0,1);Game.tracers=saved;fxqa.render();return {count:saved.length,hp:Game.player.hp,diff}})()");metrics['military_shots']=military
   check('El desenlace mutante muestra disparos reales y pérdida de salud',military['count']>0 and military['hp']<100 and military['diff']['changed']>5)
  capture('street-'+choice)
  page.evaluate("for(let i=0;i<220&&Game.state==='play';i++){Game.t+=.1;Endgame.tick(Game,.1)}")
  check('La cronología termina en FINAL '+('HUMANO' if choice=='cure' else 'MUTANTE'),page.evaluate("Game.state==='end'&&document.getElementById('endH').textContent")=='FINAL '+('HUMANO' if choice=='cure' else 'MUTANTE'))
 check('Los efectos y los dos epílogos no producen errores JavaScript',not errors)
 result={'version':'0.16.0','passed':passed,'errors':errors,'metrics':metrics,'captures':shots if isinstance(shots,list) else ['wren-cues','spider-poison','street-cure','street-mutate'],'scope':'Estados de ataque, poderes y cronología preparados para comparar framebuffer real, con posiciones y tiempos fijados. Las elecciones usan Endgame.choose y las salidas Endgame.tick; no son victorias adicionales ni una campaña completa.'}
 (R/'artifacts/pov-effects-browser-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');browser.close()
