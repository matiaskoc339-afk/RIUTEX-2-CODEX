"""Visión por una puerta con E y revisión visual del rig, armas y desenlaces."""
from pathlib import Path
import json,base64
from playwright.sync_api import sync_playwright
from browser_server import local_server
ROOT=Path(__file__).resolve().parents[1];passed=[];errors=[]
def check(name,ok):
 assert ok,name
 passed.append(name);print('PASS',name,flush=True)
with local_server(ROOT) as url,sync_playwright() as pw:
 b=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
 page.add_init_script("addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});")
 page.goto(url);page.click('#bNew');page.evaluate("Game.loop=()=>{};Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);Game.story.seq='free';Game.state='play';UI.screen(null);FirstPerson.setEnabled(true)")
 page.evaluate("""(()=>{const g=Game;g.items=[];g.carn=null;g.noise=g.worksNoise=null;g.player.x=272;g.player.y=336;g.player.angle=Math.PI;g.player.invuln=100;Level.grid=Array.from({length:24},(_,y)=>Array.from({length:40},(_,x)=>!x||!y||x===39||y===23?1:0));Level.W=40;Level.H=24;Level.props={};Level.safeRects=[];Level.doors=[{id:'qa_door',tiles:[[7,10]],open:false,key:null}];Level.grid[10][7]=2;const e=window.qaEnemy=new Enemy('sonambulo',208,336,99199);e.face=0;g.enemies=[e];e.update(.2,g);})()""")
 check('POV: no detecta a través de la puerta cerrada',page.evaluate('!qaEnemy.alert'))
 page.keyboard.press('e');page.evaluate('qaEnemy.update(.2,Game)')
 check('POV: abrir la puerta con E permite que el enemigo de enfrente te vea',page.evaluate('Level.doors[0].open&&qaEnemy.alert'))
 page.evaluate("Hospital.goto(Game,'hospital');Game.story.armHealed=true;Game.story.armCut=false;Game.story.riutexUsed=1;Game.story.endgame=null;Game.state='play';Game.enemies=[];Game.player.poison=0;Game.player.invuln=0;Game.giveWeapon('pistol',12,true);Game.player.angle=0;Game.player.x=52*32;Game.player.y=28*32;Game.render()")
 page.screenshot(path=str(ROOT/'artifacts/pov-weapon-gameplay-v0190.png'))
 visual=page.evaluate("""(()=>{const g=Game,p=g.player,ids=['pistol','shotgun','viper','ak','r98','flamethrower','gl6'],cases=[...ids.map(id=>({id,label:id})),{id:'ak',human:true,label:'Humano / prólogo'},{id:'pistol',strike:true,label:'Golpe / mismo brazo'},{id:'',missing:true,label:'Brazo perdido'},{id:'',cure:true,label:'Final / cura'},{id:'',mutant:true,label:'Final / mutación'}];
  const gallery=document.createElement('canvas');gallery.width=1800;gallery.height=1800;const all=gallery.getContext('2d'),results=[];
  const palm=POVViewmodel.palm;
  for(let i=0;i<cases.length;i++){const row=cases[i];g.story.armCut=!!row.missing;g.story.armHealed=!row.human&&!row.missing;g.story.riutexUsed=row.human||row.missing?0:1;g.story.endgame=row.cure?{choice:'cure'}:row.mutant?{choice:'mutant'}:null;p.weapon=row.id?{id:row.id}:null;p.slash=row.strike?.075:0;p.predator=p.blade=p.flash=p.reloading=0;g.keys={};
   const cv=document.createElement('canvas');cv.width=600;cv.height=390;const c=cv.getContext('2d');c.fillStyle='#10161c';c.fillRect(0,0,600,390);let calls=[];POVViewmodel.palm=function(c,h){calls.push(h.side);return palm.call(this,c,h);};POVViewmodel.draw(c,g,600,390,0);POVViewmodel.palm=palm;
   const pixels=c.getImageData(0,0,600,390).data;let hash=0,blue=0;for(let n=0;n<pixels.length;n+=4){hash=(hash+pixels[n]*((n%101)+1)+pixels[n+1]*3+pixels[n+2]*5)>>>0;if(pixels[n+2]>pixels[n]+20&&pixels[n+2]>pixels[n+1]+8)blue++;}
   const x=(i%3)*600,y=Math.floor(i/3)*450;all.drawImage(cv,x,y+35);all.fillStyle='#d9e0df';all.font='20px sans-serif';all.fillText(row.label,x+25,y+27);results.push({label:row.label,hash,blue,calls,stats:JSON.parse(JSON.stringify(POVViewmodel.stats))});
  }return {results,image:gallery.toDataURL('image/png').split(',')[1]};})()""")
 (ROOT/'artifacts/pov-viewmodels-v0190.png').write_bytes(base64.b64decode(visual.pop('image')))
 rows=visual['results'];weapons=rows[:7]
 check('Siete armas tienen geometría y silueta distintas',len({r['hash'] for r in weapons})==7 and all(r['stats']['meshFaces']>=50 for r in weapons))
 for row in weapons:check(row['label']+': dos manos sostienen el arma, sin duplicar palmas',len(row['calls'])==2 and sorted(row['calls'])==[-1,1])
 strike=rows[8];check('El golpe dibuja una sola palma por brazo, sin tercera mano',strike['stats']['strike'] and sorted(strike['calls'])==[-1,1])
 check('El tejido después de Riutex es visiblemente azul',rows[0]['blue']>rows[7]['blue']+500)
 check('Sin brazo solo se dibuja la mano derecha',rows[9]['calls']==[1])
 check('La cura retira azul y mano regenerada',rows[10]['calls']==[1] and not rows[10]['stats']['infected'] and rows[10]['blue']<rows[0]['blue']/3)
 check('El final mutante conserva dos brazos transformados',len(rows[11]['calls'])==2 and rows[11]['stats']['terminal'])
 check('Sin errores JavaScript',not errors)
 (ROOT/'artifacts/pov-combat-browser-results.json').write_text(json.dumps({'version':json.loads((ROOT/'package.json').read_text())['version'],'passed':passed,'errors':errors,'viewmodels':rows,'scope':'Puerta preparada operada con E; rig renderizado en Canvas real, siete armas y cuatro estados narrativos. Las capturas no son partidas completas.'},ensure_ascii=False,indent=2)+'\n')
 b.close()
