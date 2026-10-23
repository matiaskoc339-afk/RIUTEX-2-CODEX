(()=>{
 const g=Game,p=g.player,cfg=window.depthsQA||{},nest=g.lvl==='hospitalnest',cx=(nest?31.5:135)*32,cy=(nest?20.5:65)*32,history=[],seen=new Set(),attacks=new Set();let shots=0,heals=0,shotsOpen=0,shoot=true,frames=0;
 const originalRandom=Math.random;let randomState=(cfg.seed??369)>>>0;Math.random=()=>{randomState=(Math.imul(randomState,1664525)+1013904223)>>>0;return randomState/4294967296;};
 try{
 const liveBoss=()=>nest?g.boss:g.enemies.find(e=>e instanceof SuitCustodian&&!e.dead);
 for(let i=0;i<36000&&g.state==='play'&&liveBoss()&&!liveBoss().dead;i++){
  frames=i;const b=liveBoss(),foes=g.enemies.filter(e=>!e.dead&&e.active!==false),small=foes.filter(e=>e instanceof MutantSpider);if(nest){if(!seen.has(b.phase)){seen.add(b.phase);history.push({phase:b.phase,hp:p.hp,armor:ProtectionSuit.data().hp,reserve:g.inv.reserve('pistol')});}if(b.mode==='wind')attacks.add(b.attack);}
  // Circula por un óvalo interior. Penaliza trayectorias anunciadas, proyectiles y charcos.
  const angle=Math.atan2((p.y-cy)/(nest?300:125),(p.x-cx)/(nest?420:190))+.24,target=[cx+Math.cos(angle)*(nest?390:190),cy+Math.sin(angle)*(nest?290:125)];let best=null;
  for(const [dx,dy]of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const n=Math.hypot(dx,dy)||1,x=p.x+dx/n*65,y=p.y+dy/n*65;if(Level.blocked(x,y,16)||nest&&!DepthsMap.inside(x,y,45)||!nest&&(x<126*32||x>142.5*32||y<60.3*32||y>70.2*32))continue;
   let score=-Math.hypot(x-target[0],y-target[1])*.6;
   for(const e of foes){const d=Math.hypot(x-e.x,y-e.y),safe=e.isBoss?(nest?185:165):72;if(d<safe)score-=(safe-d)*7;
    if(['wind','rush','air'].includes(e.mode)){
     const along=(x-e.x)*Math.cos(e.dir)+(y-e.y)*Math.sin(e.dir),cross=Math.abs(-(x-e.x)*Math.sin(e.dir)+(y-e.y)*Math.cos(e.dir));
     if(['rush','charge','venom','spit'].includes(e.attack)&&along>0&&along<800&&cross<(e.attack==='venom'?38:e.r+48))score-=1000+(e.r+48-cross)*15;
     if(e.attack==='pounce'&&Math.hypot(x-e.target[0],y-e.target[1])<140)score-=1800+(140-Math.hypot(x-e.target[0],y-e.target[1]))*12;
     if(e.attack==='claw'&&d<185)score-=1600;
     if(e.attack==='roar'&&d<215)score-=1700;
    }
   }
   for(const q of g.eproj){const v=Math.hypot(q.vx,q.vy)||1,along=((x-q.x)*q.vx+(y-q.y)*q.vy)/v,cross=Math.abs(-(x-q.x)*q.vy+(y-q.y)*q.vx)/v;if(along>-15&&along<200&&cross<37)score-=1300+(37-cross)*20;}
   for(const pl of g.pools){const d=Math.hypot(x-pl.x,y-pl.y);if(d<pl.r+32)score-=800+(pl.r+32-d)*15;}
   if(!best||score>best.score)best={dx,dy,score};
  }
  g.keys=best?{KeyA:best.dx<0,KeyD:best.dx>0,KeyW:best.dy<0,KeyS:best.dy>0}:{};
  if(p.hp<55&&heals<(cfg.maxHeals??4)){const j=g.inv.items.findIndex(it=>it.type==='inj_green');if(j>=0){g.inv.sel=j;g.useInj();heals++;}}
  if(p.stamina<28)shoot=false;if(p.stamina>87)shoot=true;
  const targetEnemy=small.filter(e=>Math.hypot(e.x-p.x,e.y-p.y)<255&&Level.los(p.x,p.y,e.x,e.y)).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y))[0]||b;
  if(targetEnemy&&Level.los(p.x,p.y,targetEnemy.x,targetEnemy.y)){g.mouse.x=targetEnemy.x-g.cam.x;g.mouse.y=targetEnemy.y-g.cam.y;if(shoot&&p.fireCd<=0&&(!targetEnemy.isBoss||!['intro','mutate'].includes(targetEnemy.mode)))g.mouse.clicked=true;}
  const mag=p.weapon.mag;if(mag===0)Weapons.reload(p);g.update(1/30);if(p.weapon.mag<mag){shots++;if(targetEnemy===b)shotsOpen++;}if(i%30===0)g.render();
 }
 g.keys={};g.mouse.clicked=g.mouse.down=false;g.render();return{won:nest?!!g.pz['h:ds_spider']:!!Depths.data().guard.won,state:g.state,hp:p.hp,armor:ProtectionSuit.data().hp,shots,shotsOpen,heals,seconds:frames/30,phases:[...seen],attacks:[...attacks],history,reserve:g.inv.reserve('pistol'),seed:cfg.seed??369};
 }finally{Math.random=originalRandom;}
})()
