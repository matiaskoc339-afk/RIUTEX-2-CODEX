Object.assign(ENEMY_TYPES,{
 cl_hound:{name:'Lebrel de vitrina',hp:135,speed:137,dmg:19,detect:390,range:30,cooldown:1.2,xp:50,small:true,r:11,color:'#938978'},
 cl_halberd:{name:'Guardián del tapiz',hp:280,speed:83,dmg:28,detect:400,range:80,cooldown:1.8,xp:80,small:false,r:15,armor:.12,color:'#7f8290'},
 cl_moth:{name:'Polilla de ceniza',hp:170,speed:79,dmg:19,detect:410,range:32,cooldown:2,xp:65,small:false,r:13,color:'#b0a08b'},
 cl_shield:{name:'Portador del relicario',hp:360,speed:73,dmg:31,detect:390,range:65,cooldown:1.7,xp:95,small:false,r:18,armor:.12,color:'#9c8563'},
 cl_blind:{name:'El Tallador',hp:720,speed:73,dmg:34,detect:0,range:145,cooldown:2,xp:180,small:false,r:24,color:'#a38b7e'},
 cl_regent:{name:'El Regente Hueco',hp:2400,speed:155,dmg:30,detect:1500,range:145,cooldown:1.6,xp:400,small:false,r:29,color:'#8e9190'}
});
const CastleNoise={
 emit(g,x,y,r,kind='ruido'){if(!CastleMap.is(g))return;g.clSounds||=[];const n={id:g.clSoundSerial=(g.clSoundSerial||0)+1,x,y,r,kind,life:1};g.clSounds.push(n);if(g.clSounds.length>24)g.clSounds.shift();if(g.lvl===CastleMap.cells){g.ring(x,y,Math.min(95,r/10),'#d0ac76');UI.msg(kind==='cristales'?'Los cristales crujen. Abandona ese lugar.':kind==='choque'?'El metal responde al golpe. Aléjate del ruido.':kind==='carrera'?'Tus pasos resuenan en la piedra.':'El ruido recorre el calabozo.',2200);}return n;},
 latest(g,e){return (g.clSounds||[]).filter(n=>n.id>(e.heardId||0)&&Math.hypot(n.x-e.x,n.y-e.y)<n.r*(Level.los(e.x,e.y,n.x,n.y)?1:.72)).sort((a,b)=>b.id-a.id)[0];},
 tick(g,dt){for(const n of g.clSounds||[])n.life-=dt;g.clSounds=(g.clSounds||[]).filter(n=>n.life>0);},
};
const CastleNav={
 path(e,tx,ty){const sx=Math.floor(e.x/32),sy=Math.floor(e.y/32),gx=Math.floor(tx/32),gy=Math.floor(ty/32),allowed=(x,y)=>Level.grid[y]?.[x]===0&&!Level.blocked(x*32+16,y*32+16,e.r+.5);let goal=null;for(let r=0;r<4&&!goal;r++)for(let y=gy-r;y<=gy+r&&!goal;y++)for(let x=gx-r;x<=gx+r;x++)if(allowed(x,y)){goal=[x,y];break;}if(!goal)return null;const key=(x,y)=>y*Level.W+x,start=key(sx,sy),end=key(...goal),prev=new Map([[start,null]]),q=[[sx,sy]];for(let i=0;i<q.length&&!prev.has(end);i++){const [x,y]=q[i];for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!allowed(nx,ny)||prev.has(k))continue;prev.set(k,key(x,y));q.push([nx,ny]);}}if(!prev.has(end))return null;const out=[];let k=end;while(k!==start){out.push([(k%Level.W)*32+16,Math.floor(k/Level.W)*32+16]);k=prev.get(k);}return out.reverse();},
 move(e,x,y,amount){const dx=x-e.x,dy=y-e.y,d=Math.hypot(dx,dy)||1;if(!Level.blocked(x,y,e.r)&&Nav.fatLos(e.x,e.y,x,y,e.r)){const ox=e.x,oy=e.y;Level.move(e,dx/d*Math.min(amount,d),dy/d*Math.min(amount,d));if(Math.hypot(e.x-ox,e.y-oy)>amount*.3||d<3)return;}const key=Math.floor(x/32)+','+Math.floor(y/32);if(e.pathClock<=0||!e.path||e.pathGoal!==key){e.path=this.path(e,x,y);e.pathClock=.75;e.pathGoal=key;}while(e.path?.length&&Math.hypot(e.path[0][0]-e.x,e.path[0][1]-e.y)<5)e.path.shift();let target=e.path?.[0];if(!target)return;for(let i=Math.min(4,e.path.length-1);i>0;i--)if(Nav.fatLos(e.x,e.y,...e.path[i],e.r)){target=e.path[i];e.path.splice(0,i);break;}const ax=target[0]-e.x,ay=target[1]-e.y,n=Math.hypot(ax,ay)||1;Level.move(e,ax/n*Math.min(amount,n),ay/n*Math.min(amount,n));}
};
class CastleEnemy extends WorksEnemy{
 moveToward(x,y,amount){CastleNav.move(this,x,y,amount);}
 hurt(d,a,g){if(this.type==='cl_shield'&&this.mode!=='recover'&&Math.cos(a+Math.PI-this.face)>.35)d*=.35;return super.hurt(d,a,g);}
 acquire(g,dt){if(CastleMap.safe(g.player,g)){this.target=null;this.memory=0;return;}super.acquire(g,dt);const n=CastleNoise.latest(g,this);if(n){this.heardId=n.id;this.target=[n.x,n.y];this.memory=5;}}
 update(dt,g){if(CastleMap.safe(g.player,g)){if(['wind','rush'].includes(this.mode)){this.mode='idle';this.clock=1;}return;}
  if(!this.dead&&['idle','stalk','search'].includes(this.mode)&&this.target&&this.clock<=0&&this.skillCd<=0){const d=Math.hypot(this.target[0]-this.x,this.target[1]-this.y);if(Level.los(this.x,this.y,...this.target)){
   if(this.type==='cl_hound'&&d<170)this.wind('lunge',g);
   if((this.type==='cl_halberd'||this.type==='cl_shield')&&d>100&&d<350)this.wind('charge',g);
   if(this.type==='cl_moth'&&d<440)this.wind('spit',g);
  }}super.update(dt,g);
 }
 execute(g){if(this.attack==='spit'&&this.type==='cl_moth'){for(const off of [-.13,0,.13])g.eproj.push({x:this.x,y:this.y,vx:Math.cos(this.dir+off)*330,vy:Math.sin(this.dir+off)*330,life:1.8,dmg:19,poison:0,bullet:true});this.mode='recover';this.clock=1.35;this.skillCd=2.6;Sound.play('attack');return;}super.execute(g);}
 draw(c){CastleArt.creature(c,this);}
}
class BlindCarver extends WorksEnemy{
 moveToward(x,y,amount){CastleNav.move(this,x,y,amount);}
 constructor(x,y){super('cl_blind',x,y,10001);Object.assign(this,{isBoss:true,active:false,mode:'patrol',patrolIndex:0,patrolTarget:null,clock:0,heardId:0,face:0,grace:0});if(typeof HunterIntelligence!=='undefined')HunterIntelligence.initialize(this);this.hiSearchTime=0;}
 anchors(){return [[17,15],[31,14],[43,17],[43,28],[31,29],[16,28]].map(([x,y])=>[(x+.5)*32,(y+.5)*32]);}
 hear(n){if(!this.active||['wind','recover'].includes(this.mode))return;this.heardId=Math.max(this.heardId,n.id||0);this.target=[Math.max(11*32,Math.min(49*32,n.x)),Math.max(11*32,Math.min(33*32,n.y))];if(this.mode!=='listen'){this.mode='listen';this.clock=.65;}this.memory=5;Sound.tone(118,.16,.13,'triangle');}
 hurt(d,a,g){if(this.dead||!this.active||!Number.isFinite(d)||d<=0)return;this.hp-=d*(this.mode==='recover'?1.4:.9);this.hitFlash=.15;g.sparks(this.x,this.y,5,'#a96562');if(this.hp<=0)return this.die(g);if(Math.hypot(g.player.x-this.x,g.player.y-this.y)<90)this.hear({x:g.player.x,y:g.player.y,id:g.clSoundSerial||0});}
 die(g){if(this.dead)return;super.die(g);const q=Castle.data(g);q.prison={active:false,won:true,hp:0,x:this.x,y:this.y};g.pz['h:cl_carver']=true;Castle.syncKey(g);g.eproj=[];g.pools=[];Hospital.checkpoint(g);UI.msg('Las cuchillas dejan de rozar piedra. La llave cae junto a su cuerpo.',5500);}
 update(dt,g){if(this.dead||g.state!=='play')return;dt*=Specializations.fieldFactor(this,g);this.t+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);this.frozen=this.stagger=0;this.pathClock-=dt;if(this.grace>0){this.grace-=dt;return;}this.clock-=dt;
  if(!this.active)return;
  const p=g.player,d=Math.hypot(p.x-this.x,p.y-this.y),touch=d<this.r+p.r+4;
  const n=CastleNoise.latest(g,this);if(n&&!['wind','recover','rush'].includes(this.mode))this.hear(n);
  if(touch&&!['wind','recover'].includes(this.mode)){this.target=[p.x,p.y];this.mode='wind';this.dir=this.face=Math.atan2(p.y-this.y,p.x-this.x);this.clock=.55;}
  if(this.mode==='listen'){if(this.clock<=0){this.mode='rush';this.clock=5;}return;}
  if(this.mode==='rush'){
   const [x,y]=this.target;const dist=Math.hypot(x-this.x,y-this.y);this.face=Math.atan2(y-this.y,x-this.x);
   if(dist<110||this.clock<=0){this.mode='wind';this.dir=this.face;this.clock=.8;return;}
   this.moveToward(x,y,340*dt);return;
  }
  if(this.mode==='wind'){if(this.clock<=0){const a=Math.atan2(p.y-this.y,p.x-this.x),arc=Math.abs(Math.atan2(Math.sin(a-this.dir),Math.cos(a-this.dir)));if(d<155+p.r&&arc<1.35&&Level.los(this.x,this.y,p.x,p.y))p.hurt(38,a,g);g.ring(this.x,this.y,150,'#d4ad88');Sound.play('attack');this.mode='recover';this.clock=1.65;this.target=null;}return;}
  if(this.mode==='recover'){if(this.clock<=0){this.mode='patrol';this.patrolTarget=null;}return;}
  this.mode='patrol';if(!this.patrolTarget||Math.hypot(this.patrolTarget[0]-this.x,this.patrolTarget[1]-this.y)<22){this.patrolIndex=(this.patrolIndex+1)%6;this.patrolTarget=this.anchors()[this.patrolIndex];}
  this.face=Math.atan2(this.patrolTarget[1]-this.y,this.patrolTarget[0]-this.x);this.moveToward(...this.patrolTarget,73*dt);
 }
 draw(c){CastleArt.creature(c,this);}
 drawCue(c){if(this.mode!=='wind')return;c.save();c.fillStyle='rgba(202,143,87,.16)';c.strokeStyle='#e1be91';c.lineWidth=2;c.beginPath();c.moveTo(this.x,this.y);c.arc(this.x,this.y,155,this.dir-1.35,this.dir+1.35);c.closePath();c.fill();c.stroke();c.restore();}
}
class RoyalRegent extends WorksEnemy{
 constructor(x,y){super('cl_regent',x,y,10300);Object.assign(this,{isBoss:true,active:false,phase:1,mode:'dormant',clock:0,step:0,combo:0,marks:[],dir:0});if(typeof BossIntelligence!=='undefined')BossIntelligence.init(this);}
 hurt(d,a,g){if(this.dead||!this.active||['intro','mutate'].includes(this.mode)||!Number.isFinite(d)||d<=0)return;
  const shield=this.phase===1&&this.mode!=='recover'&&Math.cos(a+Math.PI-this.face)>.25;
  const floor=(3-this.phase)*800;this.hp=Math.max(floor,this.hp-d*(shield?.28:this.mode==='recover'?1.25:1));this.hitFlash=.12;g.sparks(this.x,this.y,shield?3:6,shield?'#d9c7a0':'#a85e69');
  if(this.hp<=floor){if(this.phase===3)return this.die(g);this.phase++;this.r=this.phase===2?36:39;[this.x,this.y]=Castle.clamp(this.x,this.y,this.r);this.mode='mutate';this.clock=3;this.step=0;this.combo=0;this.marks=[];g.eproj=[];g.pools=[];g.cam.shake=16;Sound.tone(47,1,.24,'sawtooth');UI.msg(this.phase===2?'El cuerpo rompe el hierro. El escudo ya no tiene un brazo que lo sostenga.':'La carne vuelve a moverse antes que los huesos. Su juramento se ha roto.',5000);}
 }
 die(g){if(this.dead)return;this.dead=true;this.hp=0;this.active=false;this.mode='dead';this.marks=[];g.killed.add(this.id);g.pz['h:cl_regent']=true;Castle.data(g).regent={won:true,active:false,hp:0,phase:3};g.player.xp+=mutationXPReward(this.def,true,g.mut);g.player.onKill(g);g.eproj=[];g.pools=[];g.projectiles=[];g.curBoss=null;for(const d of Level.doors)Level.openDoor(d);g.ring(this.x,this.y,210,'#d6c398');g.cam.shake=18;g.save(3);UI.msg('El Regente cae. La puerta tras el trono se libera.',6500);}
 recover(t){this.mode='recover';this.clock=t;}
 begin(kind,g){const p=g.player;this.attack=kind;this.mode='wind';this.dir=this.face=Math.atan2(p.y-this.y,p.x-this.x);this.target=Castle.clamp(p.x,p.y,90);this.origin=[this.x,this.y];this.clock=this.windMax=kind==='quake'?1.15:kind==='leap'?1.1:kind==='charge'?.95:this.phase===2?1.15:.75;this.combo=kind==='slash'?(this.phase===3?3:this.phase===1?2:1):0;Sound.tone(kind==='charge'?80:150,.14,.12,'triangle');}
 choose(g){if(typeof BossIntelligence!=='undefined')return BossIntelligence.choose(this,g);this.begin(BossPressure.closeAttack(this,'charge',g),g);}
 execute(g){const p=g.player,a=Math.atan2(p.y-this.y,p.x-this.x),d=Math.hypot(p.x-this.x,p.y-this.y),arc=Math.abs(Math.atan2(Math.sin(a-this.dir),Math.cos(a-this.dir)));
  if(this.attack==='charge'){this.mode='rush';this.clock=this.phase===1?.7:.9;this.rushHit=false;return;}
  if(this.attack==='leap'){this.mode='air';this.clock=.35;return;}
  if(this.attack==='quake'){const [x,y]=this.target;this.marks=[[x,y],[x-165,y],[x+165,y]].map(([a,b])=>{const [xx,yy]=Castle.clamp(a,b,65);return {x:xx,y:yy,r:68,warning:1.25,life:.8};});this.recover(3);return;}
  const reach=this.attack==='hammer'?185:this.attack==='bash'?115:155,spread=this.attack==='hammer'?1.5:1.1;
  if(d<reach+p.r&&arc<spread&&Level.los(this.x,this.y,p.x,p.y)){p.hurt(this.phase===2?43:this.phase===3?38:32,a,g);if(this.attack==='bash')p.stamina=Math.max(0,p.stamina-20);}
  g.ring(this.x,this.y,reach,'#d2b18d');Sound.play('attack');
  if(this.attack==='slash'&&this.combo>1){this.combo--;this.dir=this.face=a;this.clock=this.windMax=this.phase===3?.62:.78;return;}
  this.combo=0;this.recover(this.phase===2?2.1:1.5);
 }
 update(dt,g){if(this.dead||!this.active||g.state!=='play')return;dt*=Specializations.fieldFactor(this,g);if(dt<=0)return;this.t+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);this.frozen=this.stagger=0;this.clock-=dt;const p=g.player;
  for(const m of this.marks){if(m.warning>0)m.warning-=dt;else{m.life-=dt;if(Math.hypot(p.x-m.x,p.y-m.y)<m.r+p.r&&Level.los(m.x,m.y,p.x,p.y))p.hurt(26,Math.atan2(p.y-m.y,p.x-m.x),g);}}this.marks=this.marks.filter(m=>m.life>0);
  if(['intro','mutate'].includes(this.mode)){if(this.clock<=0)this.recover(1.2);return;}
  if(this.mode==='recover'){if(this.clock<=0){this.mode='stalk';this.clock=this.phase===3?.45:.65;}return;}
  if(this.mode==='wind'){if(this.clock<=0)this.execute(g);return;}
  if(this.mode==='rush'){const ox=this.x,oy=this.y,speed=this.phase===3?560:this.phase===2?375:490,dist=speed*dt;Level.move(this,Math.cos(this.dir)*dist,Math.sin(this.dir)*dist);const [x,y]=Castle.clamp(this.x,this.y,this.r);const wall=Math.hypot(this.x-ox,this.y-oy)<dist*.65||x!==this.x||y!==this.y;this.x=x;this.y=y;
   if(!this.rushHit&&FinalEncounter.segmentDistance(p.x,p.y,ox,oy,this.x,this.y)<this.r+p.r&&Level.los(this.x,this.y,p.x,p.y)){p.hurt(this.phase===2?40:this.phase===3?36:30,this.dir,g);this.rushHit=true;}
   if(wall||this.clock<=0){this.recover(wall?2.5:1.65,wall);if(wall){g.cam.shake=11;g.ring(this.x,this.y,75,'#ccbea0');}}return;}
  if(this.mode==='air'){const k=Math.max(0,Math.min(1,1-this.clock/.35));this.x=this.origin[0]+(this.target[0]-this.origin[0])*k;this.y=this.origin[1]+(this.target[1]-this.origin[1])*k;if(this.clock<=0){[this.x,this.y]=this.target;if(Math.hypot(p.x-this.x,p.y-this.y)<105+p.r&&Level.los(this.x,this.y,p.x,p.y))p.hurt(37,this.dir,g);g.ring(this.x,this.y,110,'#d3b799');g.cam.shake=10;this.recover(1.9);}return;}
  if(typeof BossIntelligence!=='undefined')return BossIntelligence.stalk(this,dt,g);
  const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1;this.face=Math.atan2(dy,dx);const speed=this.phase===2?88:this.phase===3?165:155;if(d>120)Level.move(this,dx/d*speed*dt,dy/d*speed*dt);if(this.clock<=0)this.choose(g);
 }
 draw(c){CastleArt.creature(c,this);}
 drawCue(c){c.save();for(const m of this.marks){c.fillStyle=m.warning>0?'rgba(205,164,90,.13)':'rgba(180,112,87,.35)';c.strokeStyle='#dbb98d';c.lineWidth=2;c.beginPath();c.arc(m.x,m.y,m.r,0,6.283);c.fill();c.stroke();}if(!['wind','air'].includes(this.mode)){c.restore();return;}c.fillStyle='rgba(196,136,87,.15)';c.strokeStyle='#e1b88b';c.lineWidth=2.5;
  if(this.attack==='charge'){c.translate(this.x,this.y);c.rotate(this.dir);c.fillRect(0,-this.r-8,510,(this.r+8)*2);c.strokeRect(0,-this.r-8,510,(this.r+8)*2);}
  else if(this.attack==='leap'){c.beginPath();c.arc(...this.target,105,0,6.283);c.fill();c.stroke();}
  else if(this.attack!=='quake'){c.beginPath();c.moveTo(this.x,this.y);c.arc(this.x,this.y,this.attack==='hammer'?185:this.attack==='bash'?115:155,this.dir-(this.attack==='hammer'?1.5:1.1),this.dir+(this.attack==='hammer'?1.5:1.1));c.closePath();c.fill();c.stroke();}c.restore();
 }
}
