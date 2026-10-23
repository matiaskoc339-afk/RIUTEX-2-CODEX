(()=>{
 const g=Game,p=g.player;let shots=0,heals=0,keeper=false,kills0=g.killed.size,frames=0,lastCleared=-1;const history=[];
 let shoot=true;
 for(let i=0;i<42000&&g.state==='play'&&!g.pz['h:wx_arena'];i++){
  frames=i;const a=Works.data(g).arena,foes=g.enemies.filter(e=>e instanceof WorksEnemy&&!e.dead);if(foes.some(e=>e.type==='wx_keeper'))keeper=true;
  const canCache=!a.cache.includes(a.cleared),cx=24.5*32,cy=23.5*32,angle=Math.atan2(p.y-cy,p.x-cx)+.35;
  const target=canCache?[24.5*32,12.5*32]:[cx+Math.cos(angle)*275,cy+Math.sin(angle)*275];
  let best=null;
  for(const [dx,dy]of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const n=Math.hypot(dx,dy)||1,x=p.x+dx/n*56,y=p.y+dy/n*56;if(Level.blocked(x,y,13)||Math.hypot(x-cx,y-cy)>387)continue;
   let score=-Math.hypot(x-target[0],y-target[1])*.25;
   for(const e of foes){const d=Math.hypot(x-e.x,y-e.y);if(d<155)score-=(155-d)*5;
    if(e.mode==='wind'||e.mode==='rush'){
     const ax=x-e.x,ay=y-e.y,along=ax*Math.cos(e.dir)+ay*Math.sin(e.dir),across=Math.abs(-ax*Math.sin(e.dir)+ay*Math.cos(e.dir));
     if(['charge','lunge','spit'].includes(e.attack)&&along>0&&along<400&&across<e.r+35)score-=450+(e.r+35-across)*7;
     if(e.attack==='roar'&&d<205)score-=600+(205-d)*12;
    }
   }
   for(const q of g.eproj){const speed=Math.hypot(q.vx,q.vy)||1,ax=x-q.x,ay=y-q.y,along=(ax*q.vx+ay*q.vy)/speed,across=Math.abs(-ax*q.vy+ay*q.vx)/speed;if(along>-15&&along<125&&across<33)score-=600+(33-across)*7;}
   for(const pool of g.pools){const d=Math.hypot(x-pool.x,y-pool.y);if(d<pool.r+25)score-=300+(pool.r+25-d)*10;}
   if(!best||score>best.score)best={dx,dy,score};
  }
  g.keys=best?{KeyA:best.dx<0,KeyD:best.dx>0,KeyW:best.dy<0,KeyS:best.dy>0}:{};
  if(canCache&&Math.hypot(p.x-24.5*32,p.y-12.5*32)<36)g.interact();
  if(p.hp<55&&heals<4){const j=g.inv.items.findIndex(it=>it.type==='inj_green');if(j>=0){g.inv.sel=j;g.useInj();heals++;}}
  const foe=foes.filter(e=>Level.los(p.x,p.y,e.x,e.y)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0];
  if(p.stamina<30)shoot=false;if(p.stamina>90)shoot=true;
  if(foe){g.mouse.x=foe.x-g.cam.x;g.mouse.y=foe.y-g.cam.y;if(shoot&&p.fireCd<=0)g.mouse.clicked=true;}
  const mag=p.weapon.mag;if(mag===0)Weapons.reload(p);g.update(1/30);if(p.weapon.mag<mag)shots++;if(i%20===0)g.render();
  if(a.cleared!==lastCleared){history.push({cleared:a.cleared,wave:a.wave,hp:Math.round(p.hp),reserve:g.inv.reserve('pistol')});lastCleared=a.cleared;}
 }
 g.keys={};g.mouse.clicked=false;g.render();
 return {won:!!g.pz['h:wx_arena'],hp:p.hp,wave:Works.data(g).arena.wave,shots,heals,keeper,kills:g.killed.size-kills0,seconds:frames/30,reserve:g.inv.reserve('pistol'),history,state:g.state};
})()
