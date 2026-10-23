"""Regenera planos de la geometría real; no interviene en el juego."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import subprocess,json,os
r=Path(__file__).resolve().parents[1];tmp=r/'artifacts/maps.json';tmp.parent.mkdir(exist_ok=True)
subprocess.run(['node','tests/render_maps.js'],cwd=r,env={**os.environ,'OUT':str(tmp)},check=True)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',11)
for name,d in json.loads(tmp.read_text()).items():
 s=16;im=Image.new('RGB',(d['W']*s,d['H']*s+60),'#081522');draw=ImageDraw.Draw(im)
 for y,row in enumerate(d['grid']):
  for x,v in enumerate(row):
   if v!=1:draw.rectangle((x*s,y*s,(x+1)*s-1,(y+1)*s-1),fill={0:'#234357',2:'#64b9cb',3:'#bf896d',4:'#566d7c'}[v])
 for room in d['rooms']:
  x,y,w,h=(room[k]*s for k in ['x','y','w','h']);draw.text((x+w/2,y+h/2),room['n'],font=font,fill='#daedf6',anchor='mm',stroke_width=2,stroke_fill='#142f42')
 for _,kind,x,y in d['items']:
  if kind in ['savebed','key'] or kind.startswith('h_'):draw.ellipse((x*s+4,y*s+4,x*s+11,y*s+11),fill='#c3e99f' if kind=='savebed' else '#e6cb95')
 draw.text((20,d['H']*s+14),'RIUTEX 2 · Fases 1–4 · v0.15.0 / '+name+' · Plano completo con spoilers',font=font,fill='#a6cadf')
 im.save(r/'planos'/('plano_'+name+'.png'))
 print(name,len(d['rooms']),'espacios')
