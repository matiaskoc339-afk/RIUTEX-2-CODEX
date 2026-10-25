"""Capturas del juego para las tarjetas de perspectiva; no usa recursos externos."""
from pathlib import Path
import base64, io
from PIL import Image
from playwright.sync_api import sync_playwright
from browser_server import local_server

ROOT = Path(__file__).resolve().parents[1]
with local_server(ROOT) as url, sync_playwright() as pw:
    browser = pw.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox','--enable-webgl','--enable-unsafe-swiftshader','--use-angle=swiftshader'])
    page = browser.new_page(viewport={'width':960,'height':600})
    page.goto(url)
    page.evaluate("""Game.loop=()=>{};SceneTransitions.enabled=false;SceneTransitions.finish();
      Game.startLvl='mansion';Game.start(false);Hospital.toHospital(Game);
      Game.story.restrained=false;Hospital.inject(Game);Hospital.lobbyReached(Game);
      Game.story.seq='free';Game.story.armCut=true;Game.state='play';UI.screen(null);
      Game.player.x=52.5*32;Game.player.y=28.5*32;Game.player.angle=-Math.PI/2;
      Game.player.hp=100;Game.player.hurtFlash=Game.player.poison=0;Game.player.hidden=false;
      Game.keys={};Game.carn=null;Game.enemies=[];Game.inv.items=[];Game.player.weapons={};Game.player.weapon=null;
      Game.giveWeapon('pistol',12,true);Game.player.weapon=Game.player.weapons.pistol;
      Game.t=20;Game.update(0);MenuScene.reduced=true;""")
    for mode, enabled in [('pov',True),('topdown',False)]:
        data = page.evaluate("""enabled=>{FirstPerson.setEnabled(enabled);FirstPerson.pitch=.02;
          Game.cam.x=Game.player.x-Game.cv.width/2;Game.cam.y=Game.player.y-Game.cv.height/2;
          Game.update(0);Game.render();
          const c=document.createElement('canvas');c.width=960;c.height=600;const ctx=c.getContext('2d');
          if(enabled)ctx.drawImage(POV3DRenderer.canvas,0,0,960,600);
          ctx.drawImage(Game.cv,0,0,960,600);return c.toDataURL('image/png');}""", enabled)
        img = Image.open(io.BytesIO(base64.b64decode(data.split(',',1)[1]))).convert('RGB')
        img.save(ROOT/f'assets/perspective-{mode}.webp',quality=91,method=6)
        print(mode, (ROOT/f'assets/perspective-{mode}.webp').stat().st_size, flush=True)
    browser.close()
