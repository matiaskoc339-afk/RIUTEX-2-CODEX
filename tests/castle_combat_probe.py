"""Combate aislado real de los dos encuentros de Valcárcel; recursos finitos."""
from pathlib import Path
import json
from playwright.sync_api import sync_playwright
from browser_server import local_server
R=Path(__file__).resolve().parents[1];passed=[]
with local_server(R) as url,sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);page=b.new_page(viewport={'width':1440,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.add_init_script("window.addEventListener('load',()=>{SceneTransitions.enabled=false;SceneTransitions.finish();});");page.goto(url);page.click('#bNew');page.evaluate('Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish()');page.wait_for_timeout(70)
 results={}
 for lvl in ['hospitalcells','hospitalroyal']:
  page.evaluate("lvl=>{Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);Game.story.restrained=false;Hospital.inject(Game);Game.story.seq='free';Game.pz['h:boss']=Game.pz['h:ds_spider']=true;Game.killed.add(900);Game.resume();Hospital.goto(Game,lvl);Game.inv=new Inventory();for(let i=0;i<4;i++)Game.inv.expand();Game.player.weapons={};Game.player.weapon=null;Game.giveWeapon('pistol',180,true);for(let i=0;i<4;i++)Game.inv.add('inj_green');Game.player.hp=Game.player.maxHp=100;Game.player.stamina=100;Game.player.mods={mag:0,pow:0,prec:0,rate:0,mask:0};Game.mut.owned=new Set(['core']);if(lvl==='hospitalcells'){Game.player.x=17.5*32;Game.player.y=31.5*32;Castle.beginPrison(Game);}else{Game.player.x=24.5*32;Game.player.y=29.5*32;Castle.beginRoyal(Game);}Game.keys={};}",lvl)
  result=page.evaluate((R/'tests/castle_controller.js').read_text());print(lvl,result,flush=True);results[lvl]=result;page.screenshot(path=str(R/'artifacts'/('castle-combat-'+lvl+'-v013.png')))
  assert result['won'] and result['hp']>0,result
  passed.append(('Tallador' if lvl=='hospitalcells' else 'Regente')+' derrotado con M9 base, 192 balas y 100 HP, sin forzar daño')
  if lvl=='hospitalroyal':
   assert result['phases']==[1,2,3],result
   passed.append('Regente atraviesa tres formas durante combate real')
 assert not errors,errors
 passed.append('Sin errores de JavaScript')
 (R/'artifacts/castle-combat-results.json').write_text(json.dumps({'passed':passed,'combats':results,'errors':errors,'scope':'Combates aislados: M9 base, 192 balas totales, 100 HP, cuatro curas disponibles, sin S-4 ni habilidades compradas; tiros, movimiento, ruido y recargas reales. El controlador conoce los avisos, no simula una primera partida humana.'},ensure_ascii=False,indent=2));b.close()
