Object.assign(ENEMY_TYPES,{
 lf_runner:{name:'Receptor ágil',hp:175,speed:145,dmg:23,detect:400,range:32,cooldown:1.1,xp:65,small:true,r:12,color:'#839c96'},
 lf_sentinel:{name:'Custodio de presión',hp:390,speed:82,dmg:36,detect:430,range:72,cooldown:1.8,xp:100,small:false,r:21,armor:.12,color:'#87929d'},
 lf_spore:{name:'Portador de esporas',hp:235,speed:67,dmg:20,detect:440,range:35,cooldown:2.4,xp:85,small:false,r:17,color:'#9b9b72'},
 lf_mirror:{name:'Doble de ensayo',hp:320,speed:108,dmg:29,detect:440,range:60,cooldown:1.5,xp:95,small:false,r:18,armor:.08,color:'#8d829b'},
 lf_wren:{name:'Dr. Elias Wren / ORIGEN',hp:3600,speed:165,dmg:38,detect:1700,range:200,cooldown:1.3,xp:650,small:false,r:27,color:'#98aaa5'}
});
class EndEnemy extends WorksEnemy{
 moveToward(x,y,n){CastleNav.move(this,x,y,n);}
 hurt(d,a,g){if(this.type==='lf_mirror'&&this.mode!=='recover'&&Math.cos(a+Math.PI-this.face)>.3)d*=.5;super.hurt(d,a,g);}
 update(dt,g){if(EndMap.safe(g.player,g)){this.target=null;this.memory=0;this.mode='idle';return;}const t=this.type;this.type={lf_runner:'wx_scuttler',lf_sentinel:'wx_mauler',lf_spore:'wx_spitter',lf_mirror:'wx_mauler'}[t];super.update(dt,g);this.type=t;}
 execute(g){if(this.attack==='spit'&&this.type==='wx_spitter'){for(const a of [-.2,0,.2])g.eproj.push({x:this.x,y:this.y,vx:Math.cos(this.dir+a)*325,vy:Math.sin(this.dir+a)*325,life:1.8,dmg:20,poison:3});this.mode='recover';this.clock=1.4;this.skillCd=2.7;return;}super.execute(g);}
 draw(c){EndArt.creature(c,this);}
}
class OriginWren extends WorksEnemy{
 constructor(x,y){super('lf_wren',x,y,12000);Object.assign(this,{isBoss:true,active:false,phase:1,r:27,hp:3600,maxHp:3600,mode:'dormant',clock:0,step:0,marks:[],waves:[],combo:0});}
 clamp(){[this.x,this.y]=Endgame.clamp(this.x,this.y,this.r);}
 hurt(d,a,g){if(this.dead||!this.active||['intro','mutate'].includes(this.mode)||!Number.isFinite(d)||d<=0)return;const floor=(3-this.phase)*1200;this.hp=Math.max(floor,this.hp-d*(this.mode==='recover'?1.25:this.phase===3?.9:1));this.hitFlash=.15;g.sparks(this.x,this.y,6,'#a36b85');if(this.hp<=floor){if(this.phase===3)return this.die(g);this.phase++;this.r=this.phase===2?40:54;this.clamp();this.mode='mutate';this.clock=3.8;this.step=0;this.marks=[];this.waves=[];g.eproj=[];g.pools=[];g.cam.shake=18;Sound.tone(42,.9,.22,'sawtooth');UI.msg(this.phase===2?'Wren rompe su propio tórax. La segunda dosis sigue creciendo.':'La voz desaparece bajo el tejido. ORIGEN ya no cabe en un cuerpo humano.',6000);}}
 die(g){if(this.dead)return;this.dead=true;this.hp=0;this.active=false;this.marks=[];this.waves=[];g.killed.add(this.id);g.pz['h:lf_wren']=true;const q=Endgame.data(g);q.boss={won:true,active:false,phase:3,hp:0};q.cureWait=3;g.player.xp+=mutationXPReward(this.def,true,g.mut);g.player.onKill(g);g.eproj=[];g.pools=[];g.projectiles=[];g.curBoss=null;g.temporalField=g.gravityWell=g.fleshEcho=null;g.ring(this.x,this.y,220,'#a8d7c0');g.cam.shake=18;Hospital.checkpoint(g);UI.msg('Wren cae. La síntesis completa su último ciclo. La cura está a punto de salir.',5500);}
 recover(t){this.mode='recover';this.clock=t;}
 begin(kind,g){const p=g.player;this.attack=kind;this.mode='wind';this.dir=this.face=Math.atan2(p.y-this.y,p.x-this.x);this.target=Endgame.clamp(p.x,p.y,110);this.origin=[this.x,this.y];this.combo=kind==='chain'?(this.phase===3?3:2):0;this.clock=this.windMax=kind==='leap'?1.15:kind==='marks'?1.2:kind==='wave'?1.15:kind==='charge'?.95:this.phase===2?1.1:.82;Sound.tone(100,.15,.12,'triangle');}
 choose(g){const decks={1:['needles','charge','chain'],2:['slam','marks','charge','wave'],3:['chain','leap','needles','charge','marks','wave']};let kind=decks[this.phase][this.step++%decks[this.phase].length];if(['chain','slam'].includes(kind)&&Math.hypot(g.player.x-this.x,g.player.y-this.y)>270)kind='charge';this.begin(kind,g);}
 execute(g){const p=g.player,d=Math.hypot(p.x-this.x,p.y-this.y),a=Math.atan2(p.y-this.y,p.x-this.x),arc=Math.abs(Math.atan2(Math.sin(a-this.dir),Math.cos(a-this.dir)));
  if(this.attack==='charge'){this.mode='rush';this.clock=this.phase===3?.9:.8;this.rushHit=false;return;}
  if(this.attack==='leap'){this.mode='air';this.clock=.4;return;}
  if(this.attack==='needles'){const n=this.phase===3?7:5;for(let j=0;j<n;j++){const ang=this.dir+(j-(n-1)/2)*.16;g.eproj.push({x:this.x,y:this.y,vx:Math.cos(ang)*(this.phase===3?470:395),vy:Math.sin(ang)*(this.phase===3?470:395),life:2.1,dmg:this.phase===3?28:23,poison:0,bullet:true});}this.recover(1.8);return;}
  if(this.attack==='marks'){const [x,y]=this.target;this.marks=[[x,y],[x-185,y],[x+185,y],[x,y-185]].map(([a,b])=>{const [x,y]=Endgame.clamp(a,b,100);return {x,y,r:88,warning:1.3,life:.55,hit:false};});this.recover(2.9);return;}
  if(this.attack==='wave'){this.waves.push({x:this.x,y:this.y,r:65,life:2.5,hit:false});this.recover(2.1);return;}
  const reach=this.attack==='slam'?255:this.phase===3?235:195,spread=this.attack==='slam'?1.5:1.12;if(d<reach+p.r&&arc<spread&&Level.los(this.x,this.y,p.x,p.y))p.hurt(this.phase===1?33:this.phase===2?44:42,a,g);g.ring(this.x,this.y,reach,'#a7c7b6');Sound.play('attack');
  if(this.attack==='chain'&&this.combo>1){this.combo--;this.dir=this.face=a;this.clock=this.windMax=this.phase===3?.64:.8;return;}this.combo=0;this.recover(this.phase===2?2.2:1.55);
 }
 update(dt,g){if(this.dead||!this.active||g.state!=='play')return;dt*=Specializations.fieldFactor(this,g);if(dt<=0)return;this.t+=dt;this.hitFlash=Math.max(0,this.hitFlash-dt);this.frozen=this.stagger=0;this.clock-=dt;const p=g.player;
  for(const m of this.marks){if(m.warning>0)m.warning-=dt;else{m.life-=dt;if(!m.hit&&Math.hypot(p.x-m.x,p.y-m.y)<m.r+p.r&&Level.los(m.x,m.y,p.x,p.y)){p.hurt(35,Math.atan2(p.y-m.y,p.x-m.x),g);m.hit=true;}}}this.marks=this.marks.filter(m=>m.life>0);
  for(const w of this.waves){w.r+=185*dt;w.life-=dt;if(!w.hit&&Math.abs(Math.hypot(p.x-w.x,p.y-w.y)-w.r)<p.r+13&&Level.los(w.x,w.y,p.x,p.y)){p.hurt(32,Math.atan2(p.y-w.y,p.x-w.x),g);w.hit=true;}}this.waves=this.waves.filter(w=>w.life>0);
  if(['intro','mutate'].includes(this.mode)){if(this.clock<=0)this.recover(1.3);return;}
  if(this.mode==='recover'){if(this.clock<=0){this.mode='stalk';this.clock=this.phase===3?.38:.6;}return;}
  if(this.mode==='wind'){if(this.clock<=0)this.execute(g);return;}
  if(this.mode==='rush'){const ox=this.x,oy=this.y,speed=this.phase===3?650:this.phase===2?490:545,move=speed*dt;Level.move(this,Math.cos(this.dir)*move,Math.sin(this.dir)*move);const [x,y]=Endgame.clamp(this.x,this.y,this.r),wall=Math.hypot(this.x-ox,this.y-oy)<move*.6||x!==this.x||y!==this.y;this.x=x;this.y=y;if(!this.rushHit&&FinalEncounter.segmentDistance(p.x,p.y,ox,oy,this.x,this.y)<this.r+p.r&&Level.los(this.x,this.y,p.x,p.y)){p.hurt(this.phase===3?46:38,this.dir,g);this.rushHit=true;}if(wall||this.clock<=0){this.recover(wall?2.6:1.7);if(wall){g.cam.shake=12;g.ring(this.x,this.y,95,'#b6cdb8');}}return;}
  if(this.mode==='air'){const t=Math.max(0,Math.min(1,1-this.clock/.4));this.x=this.origin[0]+(this.target[0]-this.origin[0])*t;this.y=this.origin[1]+(this.target[1]-this.origin[1])*t;if(this.clock<=0){[this.x,this.y]=this.target;this.clamp();if(Math.hypot(p.x-this.x,p.y-this.y)<135+p.r&&Level.los(this.x,this.y,p.x,p.y))p.hurt(47,this.dir,g);g.ring(this.x,this.y,135,'#c5b9ce');g.cam.shake=14;this.recover(2);}return;}
  const dx=p.x-this.x,dy=p.y-this.y,d=Math.hypot(dx,dy)||1;this.face=Math.atan2(dy,dx);if(d>170){const n=(this.phase===1?160:this.phase===2?112:175)*dt;Level.move(this,dx/d*n,dy/d*n);}this.clamp();if(this.clock<=0)this.choose(g);
 }
 draw(c){EndArt.creature(c,this);}
 drawCue(c){c.save();c.strokeStyle='#b6e3c8';c.fillStyle='rgba(129,196,170,.15)';c.lineWidth=2;for(const m of this.marks){c.beginPath();c.arc(m.x,m.y,m.r,0,6.283);c.fillStyle=m.warning>0?'rgba(124,182,166,.16)':'rgba(191,138,174,.45)';c.fill();c.stroke();}for(const w of this.waves){c.lineWidth=16;c.strokeStyle='#9ce0ce77';c.beginPath();c.arc(w.x,w.y,w.r,0,6.283);c.stroke();}c.lineWidth=2;c.strokeStyle='#c4e8cd';c.fillStyle='rgba(128,191,159,.16)';if(this.mode==='wind'||this.mode==='air'){if(this.attack==='charge'){c.translate(this.x,this.y);c.rotate(this.dir);c.fillRect(0,-this.r-10,600,2*(this.r+10));c.strokeRect(0,-this.r-10,600,2*(this.r+10));}else if(this.attack==='leap'){c.beginPath();c.arc(...this.target,135,0,6.283);c.fill();c.stroke();}else if(this.attack==='wave'){c.beginPath();c.arc(this.x,this.y,65,0,6.283);c.stroke();}else if(this.attack!=='marks'){const r=this.attack==='needles'?460:this.attack==='slam'?255:this.phase===3?235:195,arc=this.attack==='needles'?.65:this.attack==='slam'?1.5:1.12;c.beginPath();c.moveTo(this.x,this.y);c.arc(this.x,this.y,r,this.dir-arc,this.dir+arc);c.closePath();c.fill();c.stroke();}}c.restore();}
}
