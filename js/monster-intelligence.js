// Sentidos, memoria y colocación de los infectados. Los jefes y ciegos tienen
// sus propios controladores. No consulta teclas ni acciones futuras del jugador.
const MonsterIntelligence = {
  enabled(e,g) { return isR2lvl(g?.lvl) && !e.isBoss && !['wx_listener','cl_blind'].includes(e.type); },
  safe(g,p) {
    return Nav.safe(Math.floor(p.x/TILE),Math.floor(p.y/TILE)) ||
      (WorksMap.is(g)&&WorksMap.safe(p)) || (CastleMap.is(g)&&CastleMap.safe(p,g)) || (EndMap.is(g)&&EndMap.safe(p,g));
  },
  line(e,p,g) { return typeof POVPerception!=='undefined'&&POVPerception.active(g)?POVPerception.line(e,p):Level.los(e.x,e.y,p.x,p.y); },
  visible(e,g,dt) {
    const p=g.player,d=Math.hypot(p.x-e.x,p.y-e.y);
    if(p.hidden||g.story?.restrained||this.safe(g,p)||(Specializations.concealed(p)&&d>90))return false;
    if(typeof POVPerception!=='undefined'&&POVPerception.active(g))return POVPerception.notice(e,g,dt);
    if(d>(e.def.detect||0)+(e.miMemory>0?24:0))return false;
    const a=Math.atan2(p.y-e.y,p.x-e.x)-e.face;
    if(d>88&&!e.alert&&e.miMemory<=0&&Math.abs(Math.atan2(Math.sin(a),Math.cos(a)))>1.65)return false;
    return Level.los(e.x,e.y,p.x,p.y);
  },
  remember(e,x,y,seconds,seen=false,dt=0) {
    if(!Number.isFinite(x)||!Number.isFinite(y))return;
    if(seen&&dt>0&&e.miVisible&&Number.isFinite(e.miLastX)&&Math.hypot(x-e.miLastX,y-e.miLastY)<80){
      const gain=Math.min(1,dt*9),vx=Math.max(-260,Math.min(260,(x-e.miLastX)/dt)),vy=Math.max(-260,Math.min(260,(y-e.miLastY)/dt));
      e.miVx+=(vx-e.miVx)*gain;e.miVy+=(vy-e.miVy)*gain;
    } else if(!seen||!e.miVisible){e.miVx=e.miVy=0;}
    if(e.miLastX===null||Math.hypot(x-e.miLastX,y-e.miLastY)>64)e.miSearchStep=0;
    e.miLastX=x;e.miLastY=y;e.miMemory=seconds;e.alert=true;e.miWasSearching=false;
  },
  injured(e,angle,g) {
    if(!this.enabled(e,g)||e.dead)return;
    const p=g.player,d=Math.hypot(p.x-e.x,p.y-e.y);
    if(!p.hidden&&!this.safe(g,p)&&d<Math.max(360,e.def.detect||0)&&this.line(e,p,g))this.remember(e,p.x,p.y,5,true);
    else this.remember(e,e.x-Math.cos(angle)*80,e.y-Math.sin(angle)*80,3.5);
    e.miPlanT=0;
  },
  sense(e,dt,g) {
    e.miPlanT=Math.max(0,e.miPlanT-dt);e.miHearT=Math.max(0,e.miHearT-dt);e.miMemory=Math.max(0,e.miMemory-dt);
    // Destinos proporcionados por una oleada o por un sonido previo son pistas,
    // no una autorización para seguir actualizando la posición sin verla.
    if(e.miLastX===null&&e.target&&e.memory>0)this.remember(e,e.target[0],e.target[1],Math.min(6,e.memory));
    const seen=this.visible(e,g,dt),p=g.player;
    if(seen)this.remember(e,p.x,p.y,e instanceof WorksEnemy?5.5:4.5,true,dt);
    else if(!e.def.latent&&e.miHearT<=0){
      const noises=[g.worksNoise?.life>0?g.worksNoise:null,g.noise,...(g.clSounds||[]).filter(n=>n.life>0)];
      let clue=null,best=0;
      for(const n of noises){
        if(!n||![n.x,n.y,n.r].every(Number.isFinite)||n.r<=0)continue;
        const distance=Math.hypot(n.x-e.x,n.y-e.y),range=n.r*(Level.los(e.x,e.y,n.x,n.y)?1:.52),weight=range-distance;
        if(weight>best){best=weight;clue=n;}
      }
      if(clue){this.remember(e,clue.x,clue.y,3.8);e.miHearT=.55;e.miPlanT=0;}
    }
    e.miVisible=seen;
    if(this.safe(g,p)){e.miMemory=0;e.miVisible=false;}
    e.memory=e.miMemory;e.target=e.miMemory>0&&e.miLastX!==null?[e.miLastX,e.miLastY]:null;
    if(e.miMemory<=0){e.alert=false;e.miState='idle';e.target=null;e.miGoalX=e.miGoalY=null;e.path=null;e.miSearchStep=0;e.miWasSearching=false;}
    return seen;
  },
  floor(e,x,y) {
    return Number.isFinite(x)&&Number.isFinite(y)&&Level.grid[Math.floor(y/TILE)]?.[Math.floor(x/TILE)]===0&&
      !Nav.safe(Math.floor(x/TILE),Math.floor(y/TILE))&&!Level.blocked(x,y,e.r+.5);
  },
  nearest(e,x,y) {
    if(this.floor(e,x,y))return [x,y];
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);let best=null,score=Infinity;
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const xx=(tx+dx+.5)*TILE,yy=(ty+dy+.5)*TILE,d=Math.hypot(xx-x,yy-y);
      if(d<score&&this.floor(e,xx,yy)){best=[xx,yy];score=d;}
    }
    return best;
  },
  path(e,x,y) {
    const goal=this.nearest(e,x,y);if(!goal)return null;
    const W=Level.W,sx=Math.floor(e.x/TILE),sy=Math.floor(e.y/TILE),gx=Math.floor(goal[0]/TILE),gy=Math.floor(goal[1]/TILE);
    if(sx===gx&&sy===gy)return [goal];
    const id=(x,y)=>y*W+x,start=id(sx,sy),end=id(gx,gy),scores=new Map([[start,0]]),prev=new Map(),closed=new Set(),heap=[];
    const push=row=>{heap.push(row);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p][0]<=row[0])break;heap[i]=heap[p];i=p;}heap[i]=row;};
    const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[c][0]>=last[0])break;heap[i]=heap[c];i=c;}heap[i]=last;}return first;};
    const heuristic=(x,y)=>Math.abs(x-gx)+Math.abs(y-gy);push([heuristic(sx,sy),sx,sy]);let expanded=0;
    while(heap.length&&expanded++<2200){
      const [,cx,cy]=pop(),current=id(cx,cy);if(closed.has(current))continue;if(current===end)break;closed.add(current);
      for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=cx+dx,ny=cy+dy,k=id(nx,ny);
        if(nx<1||ny<1||nx>=Level.W-1||ny>=Level.H-1||closed.has(k)||!this.floor(e,(nx+.5)*TILE,(ny+.5)*TILE))continue;
        const score=scores.get(current)+1;if(score>=(scores.get(k)??Infinity))continue;
        scores.set(k,score);prev.set(k,current);push([score+heuristic(nx,ny),nx,ny]);
      }
    }
    if(!prev.has(end))return null;
    const points=[];let current=end;
    while(current!==start&&points.length<2200){points.push([(current%W+.5)*TILE,(Math.floor(current/W)+.5)*TILE]);current=prev.get(current);if(current===undefined)return null;}
    points.reverse();points[points.length-1]=goal;return points;
  },
  move(e,x,y,amount) {
    if(amount<=0||!Number.isFinite(amount))return;
    const direct=this.floor(e,x,y)&&Nav.fatLos(e.x,e.y,x,y,e.r+.5),key=Math.floor(x/TILE)+','+Math.floor(y/TILE);
    let target=direct?[x,y]:null;
    if(!target){
      if(e.pathClock<=0||e.miPathGoal!==key){e.path=this.path(e,x,y);e.pathClock=.65+(Math.abs(Number(e.id)||0)%5)*.03;e.miPathGoal=key;}
      while(e.path?.length&&Math.hypot(e.path[0][0]-e.x,e.path[0][1]-e.y)<5)e.path.shift();
      if(e.path?.length){
        for(let i=Math.min(e.path.length-1,3);i>0;i--)if(Nav.fatLos(e.x,e.y,...e.path[i],e.r+.5)){e.path.splice(0,i);break;}
        target=e.path[0];
      }
    }
    if(!target)return;
    const dx=target[0]-e.x,dy=target[1]-e.y,d=Math.hypot(dx,dy)||1,step=Math.min(amount,d),nx=e.x+dx/d*step,ny=e.y+dy/d*step;
    if(Nav.safe(Math.floor(nx/TILE),Math.floor(ny/TILE)))return;
    Level.move(e,dx/d*step,dy/d*step);
  },
  ranged(e) {return !!(e.def.rng||e.def.spitter||['wx_spitter','cl_moth','lf_spore'].includes(e.type));},
  fast(e) {return !!(e.def.flank||['wx_scuttler','cl_hound','ds_spider','lf_runner'].includes(e.type));},
  clearShot(e,g,x,y,fromX=e.x,fromY=e.y) {
    if(!Level.los(fromX,fromY,x,y))return false;
    const dx=x-fromX,dy=y-fromY,den=dx*dx+dy*dy;if(den<1)return true;
    for(const other of g.enemies){
      if(other===e||other.dead||other.dormant)continue;
      const t=((other.x-fromX)*dx+(other.y-fromY)*dy)/den;
      if(t>.06&&t<.92&&Math.hypot(other.x-fromX-dx*t,other.y-fromY-dy*t)<other.r+5)return false;
    }
    return true;
  },
  goal(e,g) {
    if(!e.target)return null;
    const [x,y]=e.target,d=Math.hypot(x-e.x,y-e.y),angle=Math.atan2(e.y-y,e.x-x);
    if(!e.miVisible){
      e.miState='search';
      if(!e.miWasSearching){e.miWasSearching=true;e.miSearchStep=0;e.miSearchWait=0;e.miSearchAngle=Math.hypot(e.miVx,e.miVy)>20?Math.atan2(e.miVy,e.miVx):e.face;}
      if(e.miSearchWait>0)return [e.x,e.y];
      const a=e.miSearchAngle+(e.miSearchStep===2?1.35:e.miSearchStep===3?-1.35:0),distance=e.miSearchStep===0?0:95;
      const point=this.nearest(e,x+Math.cos(a)*distance,y+Math.sin(a)*distance)||this.nearest(e,x,y);
      if(point&&Math.hypot(point[0]-e.x,point[1]-e.y)<25&&e.miSearchStep<3){e.miSearchStep++;e.miSearchWait=.4;return [e.x,e.y];}
      return point;
    }
    if(d<e.def.range+48&&!this.ranged(e)){e.miState='press';return [x,y];}
    if(e.miPlanT>0&&e.miGoalX!==null&&this.floor(e,e.miGoalX,e.miGoalY))return [e.miGoalX,e.miGoalY];
    let desired=[x,y];e.miState='press';
    if(this.ranged(e)){
      const range=e.def.rng||{},radius=Math.max(160,Math.min(245,(range.min||145)+50)),candidates=[[e.x,e.y]];
      for(const off of [0,e.miSide*.55,-e.miSide*.55,e.miSide*.95,-e.miSide*.95])candidates.push([x+Math.cos(angle+off)*radius,y+Math.sin(angle+off)*radius]);
      let score=Infinity;
      for(const point of candidates){
        const q=this.nearest(e,...point);if(!q)continue;
        const distance=Math.hypot(q[0]-x,q[1]-y),hasLine=Level.los(...q,x,y);
        let rank=Math.hypot(q[0]-e.x,q[1]-e.y)*.6+Math.abs(distance-radius)*1.8+(hasLine?0:400);
        for(const o of g.enemies)if(o!==e&&!o.dead&&Math.hypot(o.x-q[0],o.y-q[1])<o.r+e.r+18)rank+=180;
        if(!this.clearShot(e,g,x,y,...q))rank+=280;
        if(rank<score){score=rank;desired=q;}
      }
      e.miState=d<radius*.65?'retreat':Math.hypot(desired[0]-e.x,desired[1]-e.y)>20?'reposition':'hold';
    } else if(this.fast(e)&&d>105&&d<420){
      const allies=g.enemies.filter(o=>o!==e&&!o.dead&&!o.isBoss&&Math.hypot(o.x-e.x,o.y-e.y)<250&&o.miMemory>0);
      const lead=.22,offset=(allies.length?90:50)*e.miSide;
      const dx=x-e.x,dy=y-e.y,n=Math.hypot(dx,dy)||1;
      desired=this.nearest(e,x+Math.max(-45,Math.min(45,e.miVx*lead))-dy/n*offset,y+Math.max(-45,Math.min(45,e.miVy*lead))+dx/n*offset)||[x,y];e.miState='flank';
    } else if(d>115){desired=this.nearest(e,x+Math.max(-30,Math.min(30,e.miVx*.16)),y+Math.max(-30,Math.min(30,e.miVy*.16)))||[x,y];}
    e.miGoalX=desired[0];e.miGoalY=desired[1];e.miPlanT=.65+(Math.abs(Number(e.id)||0)%4)*.08;return desired;
  },
  separate(e,dt,g) {
    for(const o of g.enemies){
      if(o===e||o.dead||o.dormant)continue;
      const dx=e.x-o.x,dy=e.y-o.y,d=Math.hypot(dx,dy),need=e.r+o.r+5;
      if(d>0&&d<need){const step=Math.min(22*dt,(need-d)*.25),nx=e.x+dx/d*step,ny=e.y+dy/d*step;if(this.floor(e,nx,ny))Level.move(e,dx/d*step,dy/d*step);}
    }
  },
  generic(e,dt,g) {
    if(e.dead||g.state!=='play'||dt<=0)return;
    e.t+=dt;e.lastHit+=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.pathClock-=dt;e.miSearchWait=Math.max(0,e.miSearchWait-dt);
    if(e.def.regen&&e.lastHit>2&&e.hp<e.mhp)e.hp=Math.min(e.mhp,e.hp+e.def.regen*dt);
    if(e.grace>0){e.grace=Math.max(0,e.grace-dt);e.windup=0;e.shots=0;e.attackLocked=false;return;}
    if(e.frozen>0){e.frozen-=dt;return;}if(e.stagger>0){e.stagger-=dt;return;}
    e.cd-=dt;const awake=e.alert,seen=this.sense(e,dt,g),p=g.player;
    if(e.def.latent&&!awake&&seen){e.stagger=.7;Sound.play('attack');return;}
    const d=Math.hypot(p.x-e.x,p.y-e.y)||1;
    if(e.windup>0||e.shots>0){
      e.face=e.attackFace;
      if(this.ranged(e)){
        const R=e.def.rng||{speed:230,burst:1,wind:.55,range:280,poison:3};
        if(e.shots>0){e.shotT-=dt;if(e.shotT<=0){const a=e.attackFace+(Math.random()-.5)*(R.spread||0);g.eproj.push({x:e.x,y:e.y,vx:Math.cos(a)*R.speed,vy:Math.sin(a)*R.speed,life:2.2,dmg:e.def.dmg,poison:R.poison||0,bullet:!!R.bullet});e.shots--;e.shotT=R.gap||.12;Sound.play('attack');}}
        else{e.windup-=dt;if(e.windup<=0){e.shots=R.burst;e.shotT=0;e.cd=e.def.cooldown;}}
      } else {
        e.windup-=dt;if(e.windup<=0){
          const a=Math.atan2(p.y-e.y,p.x-e.x),arc=Math.abs(Math.atan2(Math.sin(a-e.attackFace),Math.cos(a-e.attackFace)));
          if(d<e.def.range+12&&arc<1.25&&!p.hidden&&!this.safe(g,p)&&Level.los(e.x,e.y,p.x,p.y)){const invuln=p.invuln;p.hurt(e.def.dmg,a,g);if(e.def.poison&&p.invuln>invuln)p.addPoison(e.def.poison);}
          e.cd=e.def.cooldown;e.attackLocked=false;
        }
      }
      return;
    }
    e.attackLocked=false;
    if(!e.target){e.miState='idle';e.face+=dt*.22;return;}
    e.face=Math.atan2(e.target[1]-e.y,e.target[0]-e.x);
    if(e.def.howler&&seen){
      e.shriek=(e.shriek||3)-dt;
      if(e.shriek<=0){e.shriek=7;g.ring(e.x,e.y,300,'#c04040');Sound.play('attack');for(const o of g.enemies)if(o!==e&&!o.dead&&!o.isBoss&&Math.hypot(o.x-e.x,o.y-e.y)<360&&Level.los(e.x,e.y,o.x,o.y))this.remember(o,e.miLastX,e.miLastY,4);UI.msg('¡Un aullido atrae a los demás!',2200);}
    }
    if(seen&&e.cd<=0){
      if(this.ranged(e)){
        const R=e.def.rng||{wind:.55,range:280};
        if(d<R.range&&this.clearShot(e,g,p.x,p.y)){e.windup=R.wind;e.attackFace=e.face;e.attackLocked=true;e.miState='aim';return;}
      } else if(d<e.def.range&&Level.los(e.x,e.y,p.x,p.y)){e.windup=.38;e.attackFace=e.face;e.attackLocked=true;e.miState='strike';Sound.play('attack');return;}
    }
    if(!e.def.turret&&!e.def.rng?.fixed){const goal=this.goal(e,g);if(goal)this.move(e,...goal,e.def.speed*dt);this.separate(e,dt,g);}
  },
  works(e,dt,g) {
    const seen=this.sense(e,dt,g);e.clock-=dt;e.miSearchWait=Math.max(0,e.miSearchWait-dt);
    if(e.mode==='wind'){if(e.clock<=0)e.execute(g);return;}
    if(e.mode==='rush'){
      const ox=e.x,oy=e.y,speed=e.attack==='lunge'?340:385,dist=speed*dt,nx=e.x+Math.cos(e.dir)*dist,ny=e.y+Math.sin(e.dir)*dist;
      if(!Nav.safe(Math.floor(nx/TILE),Math.floor(ny/TILE)))Level.move(e,Math.cos(e.dir)*dist,Math.sin(e.dir)*dist);
      const p=g.player;
      if(!e.rushHit&&!p.hidden&&!this.safe(g,p)&&FinalEncounter.segmentDistance(p.x,p.y,ox,oy,e.x,e.y)<e.r+p.r&&Level.los(e.x,e.y,p.x,p.y)){p.hurt(e.def.dmg,e.dir,g);e.rushHit=true;}
      const wall=Math.hypot(e.x-ox,e.y-oy)<dist*.65;if(wall||e.clock<=0){e.mode='recover';e.clock=wall?1.9:1.3;e.skillCd=2.7;if(wall)g.ring(e.x,e.y,55,'#b8ab89');}return;
    }
    if(e.mode==='recover'){if(e.clock<=0){e.mode='stalk';e.clock=.7;}return;}
    if(!e.target){if(e.patrol(dt,g))return;e.mode='idle';e.face+=dt*.5;return;}
    e.mode=e.miVisible?'stalk':'search';const [x,y]=e.target,d=Math.hypot(x-e.x,y-e.y);e.face=Math.atan2(y-e.y,x-e.x);
    if(seen&&e.clock<=0&&Level.los(e.x,e.y,x,y)){
      if(this.ranged(e)&&d<365&&e.skillCd<=0&&this.clearShot(e,g,x,y)){e.wind('spit',g);return;}
      if(['wx_mauler','cl_halberd','cl_shield','lf_sentinel','lf_mirror'].includes(e.type)&&d>120&&d<350&&e.skillCd<=0){e.wind('charge',g);return;}
      if(['wx_scuttler','cl_hound','lf_runner'].includes(e.type)&&d<125&&e.skillCd<=0){e.wind('lunge',g);return;}
      if(d<e.def.range+10){e.wind('bite',g);return;}
    }
    const goal=this.goal(e,g);if(goal)this.move(e,...goal,e.def.speed*dt);this.separate(e,dt,g);
  }
};
