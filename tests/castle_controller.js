(()=>{
 const g=Game,p=g.player,royal=g.lvl==='hospitalroyal',b=royal?g.boss:g.prisoner,cx=(royal?23.5:30)*32,cy=(royal?18:22)*32;let shots=0,heals=0,frames=0,shoot=true;const phases=[],attacks=new Set(),history=[];
 for(let i=0;i<36000&&g.state==='play'&&!b.dead;i++){
  frames=i;if(royal&&!phases.includes(b.phase)){phases.push(b.phase);history.push({phase:b.phase,hp:p.hp,ammo:g.inv.reserve(p.weapon.id)});}if(royal&&b.mode==='wind')attacks.add(b.attack);
  const angle=Math.atan2((p.y-cy)/(royal?260:210),(p.x-cx)/(royal?380:400))+.24,target=[cx+Math.cos(angle)*(royal?355:380),cy+Math.sin(angle)*(royal?245:200)];let best=null;
  for(const [dx,dy]of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){const n=Math.hypot(dx,dy)||1,x=p.x+dx/n*64,y=p.y+dy/n*64;if(Level.blocked(x,y,15)||royal&&(x<6*32||x>41*32||y<5*32||y>31*32)||!royal&&(x<11*32||x>49*32||y<11*32||y>32*32))continue;let score=-Math.hypot(x-target[0],y-target[1])*.55;
   const d=Math.hypot(x-b.x,y-b.y),safe=royal&&b.phase===2?225:205;if(d<safe)score-=(safe-d)*8;
   if(['wind','rush','air'].includes(b.mode)){
    const along=(x-b.x)*Math.cos(b.dir)+(y-b.y)*Math.sin(b.dir),cross=Math.abs(-(x-b.x)*Math.sin(b.dir)+(y-b.y)*Math.cos(b.dir));
    if(b.attack==='charge'&&along>0&&along<550&&cross<b.r+50)score-=1700+(b.r+50-cross)*15;
    if((!royal||['slash','hammer','bash'].includes(b.attack))&&b.mode==='wind'){const a=Math.atan2(y-b.y,x-b.x),arc=Math.abs(Math.atan2(Math.sin(a-b.dir),Math.cos(a-b.dir))),r=b.attack==='hammer'?220:190;if(d<r&&arc<1.65)score-=2000+(r-d)*15;}
    if(royal&&b.attack==='leap'&&Math.hypot(x-b.target[0],y-b.target[1])<145)score-=2100+(145-Math.hypot(x-b.target[0],y-b.target[1]))*20;
   }
   for(const m of b.marks||[]){const d=Math.hypot(x-m.x,y-m.y);if(d<m.r+38)score-=1700+(m.r+38-d)*15;}
   if(!best||score>best.score)best={dx,dy,score};
  }
  const danger=Math.hypot(p.x-b.x,p.y-b.y)<(b.attack==='hammer'?210:175)&&!['recover','intro','mutate'].includes(b.mode);
  g.keys=best?{KeyA:best.dx<0,KeyD:best.dx>0,KeyW:best.dy<0,KeyS:best.dy>0,ShiftLeft:danger&&p.stamina>35}:{};
  if(p.hp<55&&heals<4){const j=g.inv.items.findIndex(it=>it.type==='inj_green');if(j>=0){g.inv.sel=j;g.useInj();heals++;}}
  if(p.stamina<28)shoot=false;if(p.stamina>85)shoot=true;
  const open=!royal||b.phase>1||b.mode==='recover';
  if(open&&shoot&&!g.keys.ShiftLeft&&!['intro','mutate'].includes(b.mode)&&Level.los(p.x,p.y,b.x,b.y)){g.mouse.x=b.x-g.cam.x;g.mouse.y=b.y-g.cam.y;if(p.fireCd<=0)g.mouse.clicked=true;}
  const mag=p.weapon.mag;if(mag===0)Weapons.reload(p);g.update(1/30);if(p.weapon.mag<mag)shots++;if(i%25===0)g.render();
 }
 g.keys={};g.mouse.down=g.mouse.clicked=false;g.render();return {won:b.dead,state:g.state,hp:p.hp,bhp:b.hp,shots,heals,seconds:frames/30,phases,attacks:[...attacks],history,weapon:p.weapon.id,reserve:g.inv.reserve(p.weapon.id)};
})()
