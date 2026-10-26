// Colonia: crías frágiles y madre de tres formas. Ataques comprometidos, nunca teledirigidos.
Object.assign(ENEMY_TYPES,{
 ds_spider:{name:'Araña del vertido',hp:22,speed:116,dmg:9,detect:310,range:22,cooldown:1.3,xp:9,small:true,r:8,color:'#847d56'},
 ds_guard:{name:'Custodio S-4',hp:560,speed:88,dmg:26,detect:800,range:56,cooldown:1.6,xp:140,small:false,r:22,color:'#817263'},
 ds_matriarch:{name:'La Matriarca del vertido',hp:1800,speed:75,dmg:28,detect:1400,range:90,cooldown:1.8,xp:320,small:false,r:39,color:'#82735a'}
});
class MutantSpider extends WorksEnemy {
 constructor(x,y,id,colony=false){super('ds_spider',x,y,id);this.colony=colony;this.grace=colony?1:0;}
 execute(g){const p=g.player,can=this.attack==='bite'&&p.invuln<=0,old=p.invuln;super.execute(g);if(can&&p.invuln>old)p.addPoison(3);}
 update(dt,g){super.update(dt,g);if(this.dead)return;for(const o of g.enemies)if(o!==this&&!o.dead&&o.type==='ds_spider'){const dx=this.x-o.x,dy=this.y-o.y,d=Math.hypot(dx,dy);if(d>0&&d<23)Level.move(this,dx/d*35*dt,dy/d*35*dt);}}
 die(g){if(this.dead)return;if(!this.colony)super.die(g);else{this.dead=true;g.killed.add(this.id);g.sparks(this.x,this.y,7,'#83905b');}g.pools.push({x:this.x,y:this.y,r:20,life:2.8});}
 draw(c){ArachnidArt.draw(c,this,false);}
}
class SuitCustodian extends WorksEnemy {
 constructor(x,y,id=7350){super('ds_guard',x,y,id);this.isBoss=this.active=true;this.mode='recover';this.clock=2;}
 die(g){if(this.dead)return;super.die(g);const q=Depths.data(g);q.guard={won:true,active:false,hp:0};g.pz['h:ds_guard']=true;for(const e of g.enemies)if(e instanceof MutantSpider&&e.colony)e.dead=true;g.eproj=[];g.pools=[];Depths.guardDoor(g,false);Hospital.checkpoint(g);UI.msg('El custodio deja de tirar del cierre. El traje sigue dentro del estuche.',6500);}
}
class SpiderMatriarch extends WorksEnemy {
 constructor(x,y){super('ds_matriarch',x,y,7400);Object.assign(this,{isBoss:true,active:false,mode:'dormant',phase:1,r:39,step:0,clock:3,summonClock:5,brood:[],shots:[],target:[x,y]});if(typeof BossIntelligence!=='undefined')BossIntelligence.init(this);}
 recover(t){this.mode='recover';this.clock=t;}
 hurt(d,a,g){if(this.dead||!this.active||['intro','mutate'].includes(this.mode)||!Number.isFinite(d)||d<=0)return;const floor=(3-this.phase)*600;this.hp=Math.max(floor,this.hp-d*(this.mode==='recover'?1.2:1));this.hitFlash=.13;g.sparks(this.x,this.y,5,'#a97674');if(this.hp<=floor){if(this.phase===3)return this.die(g);this.phase++;this.r=39+this.phase*3;this.mode='mutate';this.clock=3;this.step=0;this.shots=[];this.brood=[];g.eproj=[];g.pools=[];this.summonClock=3.5;g.cam.shake=15;Sound.tone(49,1,.24,'sawtooth');UI.msg(this.phase===2?'El abdomen se abre. Sus patas ya no buscan apoyo: buscan carne.':'Las placas revientan. El veneno vuelve a llenar sus mandíbulas.',5000);}}
 die(g){if(this.dead)return;this.dead=true;this.hp=0;this.active=false;this.mode='dead';this.shots=[];this.brood=[];g.killed.add(this.id);g.pz['h:ds_spider']=true;const q=Depths.data(g);q.nest={active:false,won:true,hp:0,phase:3};g.player.xp+=mutationXPReward(this.def,true,g.mut);g.player.onKill(g);for(const e of g.enemies)if(e instanceof MutantSpider&&e.colony)e.dead=true;g.eproj=[];g.pools=[];g.projectiles=[];g.curBoss=null;for(const d of Level.doors)Level.openDoor(d);g.ring(this.x,this.y,200,'#cbbd92');g.cam.shake=17;Sound.play('enemydie');g.save(3);UI.msg('La colonia calla. El cierre de emergencia del este se abre.',6500);}
 begin(kind,g){const p=g.player;this.attack=kind;this.mode='wind';this.target=Depths.clamp(p.x,p.y,85);this.dir=this.face=Math.atan2(this.target[1]-this.y,this.target[0]-this.x);this.origin=[this.x,this.y];this.clock=this.windMax=kind==='venom'?.9:kind==='pounce'?1.15:kind==='rush'?.95:.8;Sound.tone(kind==='venom'?190:85,.18,.13,'triangle');}
 choose(g){if(typeof BossIntelligence!=='undefined')return BossIntelligence.choose(this,g);this.begin(BossPressure.closeAttack(this,'venom',g),g);}
 execute(g){const p=g.player;if(this.attack==='venom'){this.shots=[{clock:0,dir:this.dir},{clock:.2,dir:this.dir+.025}];this.recover(1.45);}
 else if(this.attack==='rush'){this.mode='rush';this.clock=.85;this.rushHit=false;}
 else if(this.attack==='pounce'){this.mode='air';this.clock=.34;}
 else{const a=Math.atan2(p.y-this.y,p.x-this.x),arc=Math.abs(Math.atan2(Math.sin(a-this.dir),Math.cos(a-this.dir)));if(Math.hypot(p.x-this.x,p.y-this.y)<145&&arc<1.2&&Level.los(this.x,this.y,p.x,p.y))p.hurt(this.phase===3?39:34,a,g);g.ring(this.x,this.y,140,'#cca88b');this.recover(1.55);}}
 scheduleBrood(g){const alive=g.enemies.filter(e=>e instanceof MutantSpider&&e.colony&&!e.dead).length,cap=this.phase===3?9:7,n=Math.min(this.phase===1?3:4,cap-alive-this.brood.length);if(n<=0)return;const mouths=[[19,10],[44,10],[16,28],[47,28]].map(([x,y])=>({x:(x+.5)*32,y:(y+.5)*32})).filter(s=>Math.hypot(s.x-g.player.x,s.y-g.player.y)>250).sort((a,b)=>Math.hypot(b.x-g.player.x,b.y-g.player.y)-Math.hypot(a.x-g.player.x,a.y-g.player.y));if(!mouths.length)return;for(let i=0;i<n;i++){const s=mouths[i%mouths.length];this.brood.push({x:s.x+(i%2?12:-12),y:s.y,clock:1.8});}Sound.noise(.25,.1,520);}
 update(dt,g){if(this.dead||!this.active||g.state!=='play')return;dt*=Specializations.fieldFactor(this,g);if(dt<=0)return;this.t+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);this.frozen=this.stagger=0;this.clock-=dt;
  if(['intro','mutate'].includes(this.mode)){if(this.clock<=0)this.recover(1.2);return;}
  for(const s of this.shots){s.clock-=dt;if(s.clock<=0&&!s.done){s.done=true;g.eproj.push({x:this.x+Math.cos(s.dir)*(this.r+8),y:this.y+Math.sin(s.dir)*(this.r+8),vx:Math.cos(s.dir)*520,vy:Math.sin(s.dir)*520,life:1.9,dmg:this.phase===3?22:19,poison:5});Sound.play('attack');}}this.shots=this.shots.filter(s=>!s.done);
  this.summonClock-=dt;if(this.summonClock<=0){this.scheduleBrood(g);this.summonClock=this.phase===1?12:this.phase===2?8:6.5;}
  for(const s of this.brood){s.clock-=dt;if(s.clock<=0){const q=Depths.data(g),e=new MutantSpider(s.x,s.y,++q.nextId,true);e.target=[g.player.x,g.player.y];e.memory=9;g.enemies.push(e);}}this.brood=this.brood.filter(s=>s.clock>0);
  const p=g.player;if(this.mode==='recover'){if(this.clock<=0){this.mode='stalk';this.clock=this.phase===1?.65:.45;}return;}
  if(this.mode==='wind'){if(this.clock<=0)this.execute(g);return;}
  if(this.mode==='rush'){const ox=this.x,oy=this.y,speed=this.phase===3?600:550,dist=speed*dt;Level.move(this,Math.cos(this.dir)*dist,Math.sin(this.dir)*dist);const wall=Math.hypot(this.x-ox,this.y-oy)<dist*.65;if(!this.rushHit&&FinalEncounter.segmentDistance(p.x,p.y,ox,oy,this.x,this.y)<this.r+p.r&&Level.los(this.x,this.y,p.x,p.y)){p.hurt(this.phase===3?41:36,this.dir,g);this.rushHit=true;}if(wall||this.clock<=0){this.recover(wall?2.4:1.75,wall);if(wall){g.ring(this.x,this.y,70,'#c7bb98');g.cam.shake=10;}}return;}
  if(this.mode==='air'){const k=Math.max(0,Math.min(1,1-this.clock/.34));this.x=this.origin[0]+(this.target[0]-this.origin[0])*k;this.y=this.origin[1]+(this.target[1]-this.origin[1])*k;if(this.clock<=0){[this.x,this.y]=this.target;if(Math.hypot(p.x-this.x,p.y-this.y)<95+p.r&&Level.los(this.x,this.y,p.x,p.y))p.hurt(this.phase===3?35:30,this.dir,g);g.ring(this.x,this.y,100,'#c4a28d');g.cam.shake=9;this.recover(1.8);}return;}
  if(typeof BossIntelligence!=='undefined')return BossIntelligence.stalk(this,dt,g);
  const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1;this.face=Math.atan2(dy,dx);const sp=this.phase===1?65:this.phase===2?152:160;if(this.phase===1&&d<230)Level.move(this,-dx/d*sp*dt,-dy/d*sp*dt);else if(d>(this.phase===1?310:125))Level.move(this,dx/d*sp*dt,dy/d*sp*dt);if(this.clock<=0)this.choose(g);
 }
 draw(c){ArachnidArt.draw(c,this,true);}
 drawCue(c){
  c.save();for(const s of this.brood){c.strokeStyle='#d9ba83';c.fillStyle='rgba(179,149,74,.13)';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,33+Math.sin(this.t*10)*4,0,6.283);c.fill();c.stroke();}
  if(['wind','air'].includes(this.mode)){c.strokeStyle=this.attack==='venom'?'#d4dfa1':'#e5b78e';c.fillStyle=this.attack==='venom'?'rgba(174,194,97,.12)':'rgba(213,141,97,.13)';c.lineWidth=2.5;
   if(this.attack==='pounce'){c.beginPath();c.arc(...this.target,95,0,6.283);c.fill();c.stroke();c.beginPath();c.arc(...this.target,95*Math.max(.1,this.clock/this.windMax),0,6.283);c.stroke();}
   else if(this.attack==='claw'){c.beginPath();c.moveTo(this.x,this.y);c.arc(this.x,this.y,145,this.dir-1.2,this.dir+1.2);c.closePath();c.fill();c.stroke();}
   else{c.translate(this.x,this.y);c.rotate(this.dir);const half=this.attack==='venom'?12:this.r+10;c.fillRect(this.r,-half,690,half*2);c.strokeRect(this.r,-half,690,half*2);}
  }c.restore();
 }
}
