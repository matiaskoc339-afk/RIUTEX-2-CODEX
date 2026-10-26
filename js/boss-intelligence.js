// Decisiones de los cuatro jefes: observación, espacio y memoria limitada.
// Las animaciones, avisos, impactos y recuperaciones siguen en cada encuentro.
const BossIntelligence = {
  init(e) {
    if(Object.hasOwn(e,'biTime'))return;
    Object.assign(e,{biTime:0,biSeenAt:-100,biVisible:false,biX:e.x,biY:e.y,biVX:0,biVY:0,
      biSpeed:0,biSamples:0,biStill:0,biOrbit:0,biReload:0,biReactionCd:0,biLast:'',biPrevious:'',
      biDecisions:0,biReason:'observar',biSide:e.id%2?1:-1,biMoveT:0,biGoalX:e.x,biGoalY:e.y,
      biPathT:0,biHomeX:e.x,biHomeY:e.y,biChoosing:false});
  },
  kind(e){return e instanceof FinalCarnicero?'carnicero':e instanceof SpiderMatriarch?'matriarch':e instanceof RoyalRegent?'regent':'wren';},
  visible(e,g){
    const p=g.player;
    if(!p||p.hidden||g.story?.restrained||Math.hypot(p.x-e.x,p.y-e.y)>950)return false;
    if(Specializations.concealed(p)&&Math.hypot(p.x-e.x,p.y-e.y)>90)return false;
    return typeof POVPerception!=='undefined'&&POVPerception.active(g)?POVPerception.line(e,p):Level.los(e.x,e.y,p.x,p.y);
  },
  observe(e,dt,g){
    this.init(e);
    if(e.dead||e.active===false||g.state!=='play')return;
    const step=Math.max(0,Math.min(.1,Number(dt)||0))*Specializations.fieldFactor(e,g);
    e.biTime+=step;e.biReactionCd=Math.max(0,e.biReactionCd-step);
    const seen=this.visible(e,g);e.biVisible=seen;
    if(!seen){e.biReload=0;e.biSamples=0;e.biVX=e.biVY=e.biSpeed=0;e.biOrbit=Math.max(0,e.biOrbit-step);return;}
    const p=g.player,gap=e.biTime-e.biSeenAt;
    let vx=0,vy=0;
    if(gap>0&&gap<=.18&&e.biSamples>0){
      vx=(p.x-e.biX)/gap;vy=(p.y-e.biY)/gap;
      // Teletransporte, cambio de planta y esquiva no enseñan velocidad futura.
      if(Math.hypot(vx,vy)>330){vx=vy=0;e.biSamples=0;}
    }
    e.biVX=e.biSamples?e.biVX*.65+vx*.35:0;e.biVY=e.biSamples?e.biVY*.65+vy*.35:0;
    e.biSpeed=Math.hypot(e.biVX,e.biVY);e.biStill=e.biSpeed<25?Math.min(5,e.biStill+step):0;
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1,lateral=(dx*e.biVY-dy*e.biVX)/d;
    if(Math.abs(lateral)>60){
      const side=lateral>0?1:-1;
      e.biOrbit=Math.sign(e.biOrbit)===side?Math.max(-3,Math.min(3,e.biOrbit+side*step)):side*step;
    }else e.biOrbit*=Math.exp(-step*3);
    e.biReload=p.reloading>0?Math.min(4,e.biReload+step):0;
    e.biX=p.x;e.biY=p.y;e.biSeenAt=e.biTime;e.biSamples=Math.min(20,e.biSamples+1);
  },
  clamp(e,x,y,margin=e.r+5){
    return e instanceof FinalCarnicero?FinalEncounter.clamp(x,y,margin):e instanceof SpiderMatriarch?Depths.clamp(x,y,margin):e instanceof RoyalRegent?Castle.clamp(x,y,margin):Endgame.clamp(x,y,margin);
  },
  point(e,x,y,margin=e.r+5){
    const q=this.clamp(e,x,y,margin);
    return Number.isFinite(q[0])&&Number.isFinite(q[1])&&!Level.blocked(q[0],q[1],e.r+1)?q:null;
  },
  aim(e,g,attack){
    const p=g.player;
    if(!e.biChoosing||!this.visible(e,g)||e.biSamples<3||e.biSpeed<35||
       !['charge','rush','hook','venom','needles','leap','pounce','vents','marks','quake'].includes(attack))return p;
    const horizon=(attack==='venom'||attack==='needles'?.19:.25)+(e.phase===3?.04:0);
    const dist=Math.min(72,e.biSpeed*horizon),scale=dist/Math.max(1,e.biSpeed);
    const q=this.point(e,p.x+e.biVX*scale,p.y+e.biVY*scale,Math.max(90,e.r+10));
    if(!q||!Level.los(e.x,e.y,...q))return p;
    const forecast=Object.create(p);forecast.x=q[0];forecast.y=q[1];return forecast;
  },
  close(e,d){
    if(d>112)return null;
    return e instanceof FinalCarnicero?'cleave':e instanceof SpiderMatriarch?'claw':e instanceof RoyalRegent?(e.phase===2?'hammer':'slash'):(e.phase===2?'slam':'chain');
  },
  weights(e,d){
    const k=this.kind(e),phase=e.phase;
    if(k==='carnicero')return phase===1?{charge:4,hook:3,cleave:d<165?4:0}:phase===2?{charge:3,leap:3.6,vents:2.8,cleave:d<170?5:0}:{charge:3.5,leap:3.3,vents:3,hook:2.8,cleave:d<175?5:0};
    if(k==='matriarch')return phase===1?{venom:6,claw:d<145?5:0}:phase===2?{rush:4,pounce:3.4,claw:d<170?5:0}:{venom:4.2,rush:3.5,pounce:3.5,claw:d<170?5:0};
    if(k==='regent')return phase===1?{charge:4,slash:d<195?5:0,bash:d<165?4:0}:phase===2?{charge:3.4,hammer:d<245?5:0,quake:3.2}:{charge:4,slash:d<220?5:0,leap:3.3,quake:2.9};
    return phase===1?{needles:4.4,charge:3.2,chain:d<250?5:0}:phase===2?{slam:d<285?5:0,marks:3.4,charge:3.6,wave:3.1}:{chain:d<285?5:0,leap:3.4,needles:4,charge:3.4,marks:3.2,wave:3};
  },
  choose(e,g){
    this.init(e);
    if(!this.visible(e,g)){
      e.biReason='buscar último rastro';e.clock=.35;return false;
    }
    const d=Math.hypot(g.player.x-e.x,g.player.y-e.y),k=this.kind(e),w=this.weights(e,d),close=this.close(e,d),reasons={};
    let attack=close,reason=close?'defender espacio':'variar presión';
    const lane=Nav.fatLos(e.x,e.y,g.player.x,g.player.y,e.r+1),orbit=Math.abs(e.biOrbit)>1;
    if(!attack){
      // Un ataque elegido durante recarga sigue teniendo su aviso completo.
      if(e.biReload>=.28&&e.biReactionCd<=0){
        const pressure=k==='carnicero'?(d<520&&lane?'charge':'hook'):k==='matriarch'?(e.phase===1?'venom':lane?'rush':'pounce'):k==='regent'?'charge':e.phase===2?'charge':'needles';
        if(w[pressure]>0){w[pressure]+=5;reasons[pressure]='presionar recarga observada';}
      }
      if(e.biStill>1.2){
        const zone=k==='carnicero'?'vents':k==='matriarch'?'venom':k==='regent'?'quake':'marks';
        if(w[zone]>0){w[zone]+=4;reasons[zone]||='sacar de una posición fija';}
      }
      if(orbit){
        const cut=k==='carnicero'?(e.phase===1?'hook':'leap'):k==='matriarch'?(e.phase===1?'venom':'pounce'):k==='regent'?(e.phase===1?'charge':'quake'):(e.phase===1?'needles':'marks');
        if(w[cut]>0){w[cut]+=3.5;reasons[cut]||='interceptar rodeo observado';}
      }
      if(!lane){if(w.charge)w.charge*=.15;if(w.rush)w.rush*=.15;}
      // No ejecuta el mismo mazo cíclico: el contexto decide y los últimos golpes pesan menos.
      for(const name of Object.keys(w)){
        if(name===e.biLast)w[name]*=.27;else if(name===e.biPrevious)w[name]*=.78;
        const jitter=((Math.imul((e.id||1)+e.biDecisions*17+name.length*53,1103515245)>>>8)%101)/100;
        w[name]*=.94+jitter*.12;
      }
      attack=Object.keys(w).reduce((best,name)=>w[name]>w[best]?name:best,Object.keys(w)[0]);
      reason=reasons[attack]||reason;
    }
    if(!attack)return false;
    e.biPrevious=e.biLast;e.biLast=attack;e.biDecisions++;e.step++;
    e.biReason=reason;if(reason==='presionar recarga observada')e.biReactionCd=3.5;
    // Alternar lados evita una órbita mecánica sin leer hacia dónde se pulsa.
    if(e.biDecisions%3===0)e.biSide*=-1;
    e.biMoveT=0;e.biChoosing=true;
    try{e.begin(attack,g);}finally{e.biChoosing=false;}
    return true;
  },
  move(e,x,y,amount){
    const dx=x-e.x,dy=y-e.y,d=Math.hypot(dx,dy)||1;
    if(Nav.fatLos(e.x,e.y,x,y,e.r+1)){Level.move(e,dx/d*Math.min(d,amount),dy/d*Math.min(d,amount));return;}
    if(e.biPathT<=0||!e.path){e.path=CastleNav.path(e,x,y);e.biPathT=.7;}
    while(e.path?.length&&Math.hypot(e.path[0][0]-e.x,e.path[0][1]-e.y)<8)e.path.shift();
    if(e.path?.length){const t=e.path[0],n=Math.hypot(t[0]-e.x,t[1]-e.y)||1;Level.move(e,(t[0]-e.x)/n*Math.min(n,amount),(t[1]-e.y)/n*Math.min(n,amount));}
  },
  stalk(e,dt,g){
    this.init(e);const step=Math.max(0,Math.min(.1,Number(dt)||0));e.biMoveT-=step;e.biPathT-=step;
    const kind=this.kind(e),phase=e.phase,speed=kind==='carnicero'?(phase===3?144:phase===2?122:108):kind==='matriarch'?(phase===1?65:phase===2?152:160):kind==='regent'?(phase===2?88:phase===3?165:155):(phase===1?160:phase===2?112:175);
    if(!this.visible(e,g)){
      if(e.biTime-e.biSeenAt<3.5){
        const d=Math.hypot(e.biX-e.x,e.biY-e.y);
        if(d>40)this.move(e,e.biX,e.biY,speed*.72*step);else e.face+=step*.75;
      }else e.face+=step*.6;
      e.clock=Math.max(.25,e.clock);return;
    }
    const p=g.player,dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.face=Math.atan2(dy,dx);
    if(e.biMoveT<=0){
      const preferred=kind==='carnicero'?110:kind==='matriarch'?(phase===1?280:135):kind==='regent'?(phase===2?175:145):(phase===1?245:phase===2?190:215);
      let radial=d>preferred+40?1:d<preferred-35?-.65:0;
      let lateral=kind==='carnicero'?.28:kind==='matriarch'?(phase===1?.75:.3):kind==='regent'?(phase===2?.18:.42):.5;
      if(d>480||e.biReload>.28){radial=d>preferred?1:0;lateral*=.25;}
      if(d<112)radial=lateral=0;
      const side=Math.abs(e.biOrbit)>1?-Math.sign(e.biOrbit):e.biSide;
      let q=this.point(e,e.x+(dx/d*radial-dy/d*lateral*side)*95,e.y+(dy/d*radial+dx/d*lateral*side)*95);
      if(!q)q=this.point(e,e.x+(dx/d*radial+dy/d*lateral*side)*75,e.y+(dy/d*radial-dx/d*lateral*side)*75);
      e.biGoalX=q?.[0]??e.x;e.biGoalY=q?.[1]??e.y;e.biMoveT=.4;e.biPathT=0;
    }
    this.move(e,e.biGoalX,e.biGoalY,speed*step);
    [e.x,e.y]=this.clamp(e,e.x,e.y,e.r);
    if(e.clock<=0)this.choose(e,g);
  }
};
for(const Boss of [FinalCarnicero,SpiderMatriarch,RoyalRegent,OriginWren]){
  const update=Boss.prototype.update,begin=Boss.prototype.begin;
  Boss.prototype.update=function(dt,g){BossIntelligence.observe(this,dt,g);return update.call(this,dt,g);};
  Boss.prototype.begin=function(kind,g){
    const p=BossIntelligence.aim(this,g,kind);
    if(p===g.player)return begin.call(this,kind,g);
    const proxy=Object.create(g);proxy.player=p;return begin.call(this,kind,proxy);
  };
}
