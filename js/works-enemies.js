// Fauna del vertido. El rastreador solo adquiere destinos a través del sonido.
Object.assign(ENEMY_TYPES, {
 wx_scuttler:{name:'Corredor de jaula',hp:95,speed:118,dmg:14,detect:340,range:30,cooldown:1.2,xp:35,small:true,r:10,color:'#988c75'},
 wx_listener:{name:'Rastreador ciego',hp:195,speed:112,dmg:23,detect:0,range:40,cooldown:1.5,xp:65,small:false,r:13,color:'#98829a'},
 wx_spitter:{name:'Sifón anfibio',hp:155,speed:57,dmg:13,detect:360,range:36,cooldown:2.7,xp:55,small:false,r:14,color:'#7e9170'},
 wx_mauler:{name:'Cornudo de fundición',hp:285,speed:62,dmg:27,detect:340,range:55,cooldown:1.8,xp:80,small:false,r:17,armor:.15,color:'#8b7766'},
 wx_keeper:{name:'El Repetidor K-9',hp:920,speed:84,dmg:29,detect:900,range:62,cooldown:1.6,xp:230,small:false,r:23,color:'#916775'},
});
class WorksEnemy extends Enemy {
 constructor(type,x,y,id) {
  super(type,x,y,id);this.home=[x,y];this.maxHp=this.hp;this.mode='idle';this.clock=.8+(id%7)*.15;this.target=null;this.memory=0;this.skillCd=1.5;this.path=null;this.pathClock=0;this.isBoss=type==='wx_keeper';this.enraged=false;
 }
 hurt(dmg,angle,g) {
  if(this.dead)return;
  if(this.mode==='recover')dmg*=1.25;
  if(this.isBoss){this.hp-=dmg;this.hitFlash=.15;g.sparks(this.x,this.y,7,'#a14c5b');if(this.hp<=0)this.die(g);}
  else super.hurt(dmg,angle,g);
  if(this.dead)return;
  this.target=[g.player.x,g.player.y];this.memory=7;
  if(this.mode==='idle'||this.mode==='search')this.mode='stalk';
 }
 acquire(g,dt) {
  const p=g.player,dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy);
  if(WorksMap.safe(p)){this.memory=0;this.target=null;return;}
  const noise=g.worksNoise?.life>0?g.worksNoise:g.noise;
  if(this.type==='wx_listener') {
   const radius=noise?.r||0,nd=noise?Math.hypot(noise.x-this.x,noise.y-this.y):Infinity;
   if(d<this.r+p.r+4&&!p.hidden){this.target=[p.x,p.y];this.memory=2;}
   if(noise&&nd<radius*(Level.los(this.x,this.y,noise.x,noise.y)?1:.58)) {
    const was=this.memory<=0;this.target=[noise.x,noise.y];this.memory=5.5;
    if(was){this.clock=Math.max(this.clock,.45);Sound.tone(155,.22,.14,'sawtooth');}
   }
  } else if(!p.hidden&&!Specializations.concealed(p)&&d<(this.isBoss?950:this.def.detect)&&Level.los(this.x,this.y,p.x,p.y)) {this.target=[p.x,p.y];this.memory=5;}
  this.memory=Math.max(0,this.memory-dt);
  if(this.memory<=0)this.target=null;
 }
 moveToward(x,y,amount) {
  const d=Math.hypot(x-this.x,y-this.y)||1;
  if(Nav.fatLos(this.x,this.y,x,y,this.r-2)){Level.move(this,(x-this.x)/d*Math.min(d,amount),(y-this.y)/d*Math.min(d,amount));return;}
  if(this.pathClock<=0||!this.path){this.path=Nav.path(this.x,this.y,x,y);this.pathClock=.75;}
  while(this.path?.length&&Math.hypot(this.path[0][0]-this.x,this.path[0][1]-this.y)<9)this.path.shift();
  const t=this.path?.[0];if(!t)return;
  if(Level.grid[Math.floor(t[1]/32)]?.[Math.floor(t[0]/32)]!==0){this.path=null;return;}
  const dx=t[0]-this.x,dy=t[1]-this.y,n=Math.hypot(dx,dy)||1;Level.move(this,dx/n*Math.min(n,amount),dy/n*Math.min(n,amount));
 }
 wind(kind,g) {
  this.mode='wind';this.attack=kind;this.dir=this.face=Math.atan2((this.target?.[1]??g.player.y)-this.y,(this.target?.[0]??g.player.x)-this.x);
  this.clock=this.windMax=kind==='spit'?.85:kind==='charge'?1.05:kind==='roar'?1.15:kind==='lunge'?.6:.65;
  if(this.isBoss&&this.enraged)this.clock=this.windMax*=.88;
 }
 execute(g) {
  const p=g.player,d=Math.hypot(p.x-this.x,p.y-this.y),a=Math.atan2(p.y-this.y,p.x-this.x),arc=Math.abs(Math.atan2(Math.sin(a-this.dir),Math.cos(a-this.dir)));
  if(this.attack==='lunge'||this.attack==='charge'){this.mode='rush';this.clock=this.attack==='lunge'?.36:.84;this.rushHit=false;return;}
  if(this.attack==='spit') {
   for(const off of [-.12,.12])g.eproj.push({x:this.x,y:this.y,vx:Math.cos(this.dir+off)*260,vy:Math.sin(this.dir+off)*260,life:1.7,dmg:this.def.dmg,poison:3.5});
  } else if(this.attack==='roar') {
   if(d<175&&Level.los(this.x,this.y,p.x,p.y))p.hurt(25,a,g);
   g.ring(this.x,this.y,175,'#d2b487');g.cam.shake=7;
  } else if(d<this.def.range+22&&arc<1.2&&Level.los(this.x,this.y,p.x,p.y))p.hurt(this.def.dmg,a,g);
  this.mode='recover';this.clock=this.isBoss?1.4:1.2;this.skillCd=2.1;Sound.play('attack');
 }
 update(dt,g) {
  if(this.dead||g.state!=='play')return;
  const echo=g.fleshEcho;if(echo&&!this.isBoss&&Math.hypot(g.player.x-this.x,g.player.y-this.y)>90&&Math.hypot(echo.x-this.x,echo.y-this.y)<260&&Level.los(this.x,this.y,echo.x,echo.y)){const proxy=Object.create(g);proxy.player=echo;proxy.fleshEcho=null;proxy.noise={x:echo.x,y:echo.y,r:260};return this.update(dt,proxy);}
  if(WorksMap.safe(g.player)) {if(this.mode==='wind'||this.mode==='rush'){this.mode='idle';this.clock=1;}return;}
  dt*=Specializations.fieldFactor(this,g);if(dt<=0)return;
  this.t+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);this.pathClock-=dt;this.skillCd-=dt;
  if(this.isBoss&&this.hp<this.maxHp*.45&&!this.enraged){this.enraged=true;this.mode='recover';this.clock=1.8;g.ring(this.x,this.y,140,'#ba8494');UI.msg(this.type==='wx_keeper'?'La radio sale de su garganta. La voz ya no pide ayuda.':'El custodio revienta sus correas. Sus cargas se vuelven más rápidas.',4500);}
  if(this.isBoss)this.frozen=0;
  if(this.frozen>0){this.frozen-=dt;return;}
  if(!this.isBoss&&this.stagger>0){this.stagger-=dt;return;}
  if(this.grace>0){this.grace-=dt;return;}
  this.acquire(g,dt);this.clock-=dt;
  if(this.mode==='wind'){if(this.clock<=0)this.execute(g);return;}
  if(this.mode==='rush') {
   const ox=this.x,oy=this.y,speed=this.attack==='lunge'?340:this.enraged?445:385,dist=speed*dt;
   Level.move(this,Math.cos(this.dir)*dist,Math.sin(this.dir)*dist);
   const p=g.player;
   if(!this.rushHit&&FinalEncounter.segmentDistance(p.x,p.y,ox,oy,this.x,this.y)<this.r+p.r&&Level.los(this.x,this.y,p.x,p.y)){p.hurt(this.def.dmg,this.dir,g);this.rushHit=true;}
   const wall=Math.hypot(this.x-ox,this.y-oy)<dist*.65;
   if(wall||this.clock<=0){this.mode='recover';this.clock=wall?1.9:1.3;this.skillCd=this.isBoss?1.3:2.7;if(wall)g.ring(this.x,this.y,55,'#b8ab89');}
   return;
  }
  if(this.mode==='recover'){if(this.clock<=0){this.mode='stalk';this.clock=this.isBoss?.5:.7;}return;}
  if(!this.target){this.mode='idle';this.face+=dt*.5;return;}
  this.mode='stalk';
  const [x,y]=this.target,dx=x-this.x,dy=y-this.y,d=Math.hypot(dx,dy)||1;
  this.face=Math.atan2(dy,dx);
  // El ciego golpea el último lugar oído, nunca adquiere al jugador con la vista.
  const p=g.player,pd=Math.hypot(p.x-this.x,p.y-this.y);
  if(this.clock<=0&&this.memory>0&&Level.los(this.x,this.y,x,y)) {
   if(this.type==='wx_spitter'&&d<365&&this.skillCd<=0){this.wind('spit',g);return;}
   if(this.isBoss&&pd<165&&this.skillCd<=0){this.wind('roar',g);return;}
   if((this.type==='wx_mauler'||this.isBoss)&&d>120&&d<390&&this.skillCd<=0){this.wind('charge',g);return;}
   if((this.type==='wx_scuttler'||this.type==='wx_listener')&&d<125&&this.skillCd<=0){this.wind('lunge',g);return;}
   if(d<this.def.range+10){this.wind('bite',g);return;}
  }
  if(d>this.def.range*.75) {
   if(this.type==='wx_spitter'&&pd<145){const a=Math.atan2(this.y-p.y,this.x-p.x);Level.move(this,Math.cos(a)*this.def.speed*dt,Math.sin(a)*this.def.speed*dt);}
   else this.moveToward(x,y,(this.def.speed*(this.enraged?1.22:1))*dt);
  } else if(this.type==='wx_listener'&&pd>100){this.mode='search';this.memory=Math.min(this.memory,2);}
 }
 draw(c) {
  c.save();c.translate(this.x,this.y);
  c.fillStyle='rgba(0,0,0,.45)';c.beginPath();c.ellipse(3,6,this.r+4,this.r,0,0,6.283);c.fill();c.rotate(this.face);
  const sc=this.isBoss?1.9:this.type==='wx_mauler'?1.5:1;c.scale(sc,sc);
  const sw=Math.sin(this.t*8)*4,col=this.hitFlash>0?'#f1ded0':this.frozen>0?'#b59ad4':this.def.color;
  c.fillStyle=col;c.beginPath();c.ellipse(-3,0,this.type==='wx_spitter'?16:14,this.type==='wx_listener'?9:12,0,0,6.283);c.fill();
  c.strokeStyle=col;c.lineWidth=this.type==='wx_listener'?5:4;
  for(const [yy,s]of [[-11,1],[11,-1]]){c.beginPath();c.moveTo(-7,yy*.6);c.lineTo(-14+sw*s,yy);c.lineTo(-18+sw*s,yy*1.5);c.moveTo(7,yy*.5);c.lineTo(17-sw*s,yy);c.lineTo(20-sw*s,yy*1.3);c.stroke();}
  c.fillStyle='#b09b8b';c.beginPath();c.ellipse(11,0,9,7,0,0,6.283);c.fill();
  c.fillStyle='#4d2635';c.fillRect(14,-4,8,8);
  if(this.type==='wx_listener'){c.fillStyle='#74657b';c.fillRect(9,-6,9,12);c.strokeStyle='#d6b8c6';c.lineWidth=2;for(const y of [-8,8]){c.beginPath();c.moveTo(12,y);c.quadraticCurveTo(29,y*2.5,35+Math.sin(this.t*5)*3,y*2);c.stroke();}}
  else {c.fillStyle='#dfaf73';c.fillRect(14,-5,3,2);c.fillRect(14,3,3,2);}
  if(this.type==='wx_mauler'||this.isBoss){c.strokeStyle='#bdb29c';c.lineWidth=4;for(const y of [-7,7]){c.beginPath();c.moveTo(10,y);c.lineTo(20,y*2.2);c.lineTo(27,y*1.8);c.stroke();}c.fillStyle='#4a4240';c.fillRect(-9,-9,10,18);}
  if(this.type==='wx_spitter'){c.fillStyle=this.mode==='wind'?'#bdcc7f':'#81945f';c.beginPath();c.ellipse(0,0,this.mode==='wind'?14:9,8,0,0,6.283);c.fill();}
  if(this.type==='wx_keeper'){c.fillStyle='#242b30';c.fillRect(-3,-11,7,22);c.fillStyle='#c2b29a';c.fillRect(0,-5,2,10);c.strokeStyle='#8b566a';c.lineWidth=2;c.beginPath();c.moveTo(-10,-6);c.lineTo(3,9);c.stroke();}
  c.restore();
 }
 drawCue(c) {
  if(this.mode==='wind') {
   c.save();c.strokeStyle='#e0b47b';c.fillStyle='rgba(203,151,85,.15)';c.lineWidth=2;
   if(this.attack==='roar'){c.beginPath();c.arc(this.x,this.y,175,0,6.283);c.fill();c.stroke();}
   else {const len=this.attack==='charge'?340:this.attack==='spit'?350:this.attack==='lunge'?140:85; c.translate(this.x,this.y);c.rotate(this.dir);c.fillRect(0,-(this.r+8),len,(this.r+8)*2);c.strokeRect(0,-(this.r+8),len,(this.r+8)*2);}
   c.restore();
  }
 }
}
