(()=>{
 const g=Game,p=g.player,b=g.boss;let shots=0,recoveries=0,lastMode=b.mode,shoot=true,phases=new Set(),attacks=new Set();
 const corners=[[250,300],[950,300],[950,800],[250,800]];let corner=0,history=[];
 for(let i=0;i<16000&&g.state==='play'&&!b.dead;i++){
  phases.add(b.phase);if(b.attack)attacks.add(b.attack);
  if(b.mode==='recover'&&lastMode!=='recover')recoveries++;lastMode=b.mode;
  // Mantiene espacio, sin acelerar para esquivar cuando basta caminar.
  const target=corners[corner];if(Math.hypot(p.x-target[0],p.y-target[1])<50)corner=(corner+1)%corners.length;
  let best=null;
  for(const [dx,dy]of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]){
   const n=Math.hypot(dx,dy)||1,x=p.x+dx/n*70,y=p.y+dy/n*70;
   if(Level.blocked(x,y,14)||x<135||x>1080||y<195||y>920)continue;
   const d=Math.hypot(x-b.x,y-b.y);let score=-Math.abs(d-280)*.13-Math.hypot(x-corners[corner][0],y-corners[corner][1])*.025;
   if(d<150)score-=(150-d)*3;
   if(b.mode==='wind'||b.mode==='charge'){
    const a=b.dir,ax=x-b.x,ay=y-b.y,along=ax*Math.cos(a)+ay*Math.sin(a),across=Math.abs(-ax*Math.sin(a)+ay*Math.cos(a));
    if(['charge','hook'].includes(b.attack)&&along>0&&along<520&&across<b.r+35)score-=500+100-across;
    if(b.attack==='cleave'&&d<155&&Math.abs(Math.atan2(Math.sin(Math.atan2(ay,ax)-a),Math.cos(Math.atan2(ay,ax)-a)))<1.3)score-=650;
   }
   if(['wind','air'].includes(b.mode)&&b.attack==='leap'){const d=Math.hypot(x-b.target[0],y-b.target[1]);if(d<160)score-=700+(160-d)*12;}
   for(const v of b.vents){const d=Math.hypot(x-v.x,y-v.y);if(d<v.r+40)score-=650+(v.r+40-d)*12;}
   for(const h of b.hooks){const a=Math.atan2(h.vy,h.vx),ax=x-h.x,ay=y-h.y;if(ax*Math.cos(a)+ay*Math.sin(a)>-15&&Math.abs(-ax*Math.sin(a)+ay*Math.cos(a))<40)score-=700;}
   if(!best||score>best.score)best={dx,dy,score};
  }
  g.keys=best?{KeyA:best.dx<0,KeyD:best.dx>0,KeyW:best.dy<0,KeyS:best.dy>0}:{};
  g.mouse.x=b.x-g.cam.x;g.mouse.y=b.y-g.cam.y;
  if(p.stamina<32)shoot=false;if(p.stamina>94)shoot=true;
  const safe=!['wind','charge','air'].includes(b.mode);
  const mag=p.weapon.mag;
  if(shoot&&safe&&p.fireCd<=0&&b.mode!=='mutate'&&b.mode!=='intro')g.mouse.clicked=true;
  if(mag===0)Weapons.reload(p);
  g.update(1/30);if(p.weapon.mag<mag)shots++;
  if(i%30===0)g.render();
  if(i%300===0)history.push({t:i/30,hp:p.hp,bhp:b.hp,mode:b.mode,p:[Math.round(p.x),Math.round(p.y)]});
 }
 g.keys={};g.mouse.clicked=false;g.render();
 return {dead:b.dead,hp:p.hp,bhp:b.hp,shots,phases:[...phases],attacks:[...attacks],recoveries,history,state:g.state,reserve:g.inv.reserve('pistol')};
})()
