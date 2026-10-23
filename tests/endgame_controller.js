(()=>{
 const g=Game,p=g.player,b=g.boss,cx=29.5*32,cy=24.5*32;let shots=0,heals=0,frames=0,shoot=true;const phases=[],attacks=new Set(),history=[];
 for(let i=0;i<24000&&g.state==='play'&&!b.dead;i++){
  frames=i;if(!phases.includes(b.phase)){phases.push(b.phase);history.push({phase:b.phase,hp:p.hp,ammo:g.inv.reserve(p.weapon.id)});}if(b.mode==='wind')attacks.add(b.attack);
  const angle=Math.atan2((p.y-cy)/400,(p.x-cx)/560)+.22,target=[cx+Math.cos(angle)*550,cy+Math.sin(angle)*410];let best=null;
  for(const [dx,dy]of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const n=Math.hypot(dx,dy)||1,x=p.x+dx/n*65,y=p.y+dy/n*65;if(Level.blocked(x,y,15)||x<6*32||x>53*32||y<6*32||y>43*32)continue;let score=-Math.hypot(x-target[0],y-target[1])*.5,d=Math.hypot(x-b.x,y-b.y);if(d<310)score-=(310-d)*7;
   if(['wind','rush','air'].includes(b.mode)){const along=(x-b.x)*Math.cos(b.dir)+(y-b.y)*Math.sin(b.dir),cross=Math.abs(-(x-b.x)*Math.sin(b.dir)+(y-b.y)*Math.cos(b.dir));if(b.attack==='charge'&&along>0&&along<700&&cross<b.r+60)score-=2000+(b.r+60-cross)*20;
    if(['chain','slam'].includes(b.attack)){const a=Math.atan2(y-b.y,x-b.x),arc=Math.abs(Math.atan2(Math.sin(a-b.dir),Math.cos(a-b.dir)));if(d<300&&arc<1.65)score-=2200+(300-d)*15;}
    if(b.attack==='needles'){const a=Math.atan2(y-b.y,x-b.x),arc=Math.abs(Math.atan2(Math.sin(a-b.dir),Math.cos(a-b.dir)));if(d<650&&arc<.75)score-=1400+(.75-arc)*900;}
    if(b.attack==='leap'&&Math.hypot(x-b.target[0],y-b.target[1])<180)score-=2400+(180-Math.hypot(x-b.target[0],y-b.target[1]))*18;
    if(b.attack==='wave'&&d<570)score-=570-d;
   }
   for(const m of b.marks)if(Math.hypot(x-m.x,y-m.y)<m.r+45)score-=2100+(m.r+45-Math.hypot(x-m.x,y-m.y))*12;
   for(const w of b.waves){const delta=Math.hypot(x-w.x,y-w.y)-w.r;if(delta> -20&&delta<145)score-=1900+(145-Math.abs(delta))*13;}
   for(const q of g.eproj){const vx=q.vx,vy=q.vy,t=Math.max(0,Math.min(.5,((x-q.x)*vx+(y-q.y)*vy)/(vx*vx+vy*vy))),distance=Math.hypot(x-q.x-vx*t,y-q.y-vy*t);if(distance<40)score-=1500+(40-distance)*35;}
   if(!best||score>best.score)best={dx,dy,score};
  }
  const nearWave=b.waves.some(w=>{const d=Math.hypot(p.x-w.x,p.y-w.y)-w.r;return d>0&&d<180;});const danger=(Math.hypot(p.x-b.x,p.y-b.y)<280&&!['recover','intro','mutate'].includes(b.mode))||nearWave;
  g.keys=best?{KeyA:best.dx<0,KeyD:best.dx>0,KeyW:best.dy<0,KeyS:best.dy>0,ShiftLeft:danger&&p.stamina>25}:{};
  if(p.hp<58&&heals<4){const j=g.inv.items.findIndex(it=>it.type==='inj_green');if(j>=0){g.inv.sel=j;g.useInj();heals++;}}
  if(p.stamina<30)shoot=false;if(p.stamina>86)shoot=true;
  if(shoot&&!g.keys.ShiftLeft&&!['intro','mutate'].includes(b.mode)&&Level.los(p.x,p.y,b.x,b.y)){g.mouse.x=b.x-g.cam.x;g.mouse.y=b.y-g.cam.y;if(p.fireCd<=0)g.mouse.clicked=true;}
  const mag=p.weapon.mag;if(mag===0)Weapons.reload(p);g.update(1/30);if(p.weapon.mag<mag)shots++;if(i%25===0)g.render();
 }
 g.keys={};g.mouse.down=g.mouse.clicked=false;g.render();return {won:b.dead,state:g.state,hp:p.hp,bhp:b.hp,shots,heals,seconds:frames/30,phases,attacks:[...attacks],history,weapon:p.weapon?.id,reserve:p.weapon?g.inv.reserve(p.weapon.id):0};
})()
