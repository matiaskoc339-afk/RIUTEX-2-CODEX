// Investigación a partir de pistas observadas: nunca consulta al jugador oculto.
const HunterIntelligence = {
  initialize(e) {
    Object.assign(e,{hiKnown:false,hiX:0,hiY:0,hiVX:0,hiVY:0,hiAge:99,hiKind:'',hiPlan:[],hiIndex:0,hiPause:0,hiNoiseX:null,hiNoiseY:null});
  },
  floor(x,y,r=14){
    const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
    return Number.isFinite(x)&&Number.isFinite(y)&&Level.grid[ty]?.[tx]===0&&!Nav.safe(tx,ty)&&!Level.blocked(x,y,r);
  },
  observe(c,p,dt) {
    const elapsed=c.hiAge,dx=p.x-c.hiX,dy=p.y-c.hiY;
    if(c.hiKnown&&c.hiKind==='sight'&&elapsed>0&&elapsed<.3&&Math.hypot(dx,dy)<65){
      const vx=dx/elapsed,vy=dy/elapsed,speed=Math.hypot(vx,vy),k=speed>240?240/speed:1;
      c.hiVX=c.hiVX*.6+vx*k*.4;c.hiVY=c.hiVY*.6+vy*k*.4;
    }else c.hiVX=c.hiVY=0;
    c.hiKnown=true;c.hiKind='sight';c.hiX=p.x;c.hiY=p.y;c.hiAge=0;
    const distance=Math.hypot(p.x-c.x,p.y-c.y),lead=Math.min(.4,Math.max(0,(distance-125)/550));
    const x=p.x+c.hiVX*lead,y=p.y+c.hiVY*lead;
    // El corte de ruta solo se usa si tiene anchura real y un pasillo libre.
    return distance>160&&this.floor(x,y,c.r)&&Nav.fatLos(c.x,c.y,x,y,c.r)?[x,y]:[p.x,p.y];
  },
  hear(c,n){
    if(!n||![n.x,n.y].every(Number.isFinite))return;
    c.hiNoiseX=n.x;c.hiNoiseY=n.y;c.hiX=n.x;c.hiY=n.y;c.hiKind='noise';c.hiKnown=true;c.hiAge=0;
    c.hiVX=c.hiVY=0;c.lastHeard=[n.x,n.y];
  },
  plan(e,x,y,vx=0,vy=0) {
    const points=[],add=(a,b)=>{
      // Centrar la pista en una casilla deja holgura para cuerpos grandes.
      const xx=(Math.floor(a/TILE)+.5)*TILE,yy=(Math.floor(b/TILE)+.5)*TILE;
      if(this.floor(xx,yy,e.r)&&!points.some(p=>Math.hypot(p[0]-xx,p[1]-yy)<28))points.push([xx,yy]);
    };
    add(x,y);
    const speed=Math.hypot(vx,vy),a=speed>25?Math.atan2(vy,vx):e.face||0;
    // Comprueba la continuación del pasillo y dos rincones de la misma zona.
    for(const off of [0,1.25,-1.25])for(const distance of [96,64]){
      const xx=x+Math.cos(a+off)*distance,yy=y+Math.sin(a+off)*distance;
      if(Nav.fatLos(x,y,xx,yy,Math.min(e.r,12))){add(xx,yy);break;}
    }
    return points.slice(0,4);
  },
  startSearch(c){
    const anchor=c.hiKnown?[c.hiX,c.hiY]:c.lastSeen||c.lastHeard||[c.x,c.y];
    c.hiPlan=this.plan(c,...anchor,c.hiVX,c.hiVY);c.hiIndex=0;c.hiPause=0;c.searchT=6.5;
    c.tgt=c.hiPlan[0]?.slice()||anchor.slice();c.path=null;c.pathT=0;
  },
  search(c,dt,g){
    const shadow=g.mut.has('sombra')&&g.player.hidden&&!c.hideWitness?SkillBalance.value(g,'sombra',1.7):1;
    c.searchT-=dt*shadow;
    if(c.searchT<=0){c.hideWitness=null;c.hiPlan=[];StalkerMind.choose(c,g,true);return;}
    const point=c.hiPlan[c.hiIndex];
    if(!Array.isArray(point)||!point.every(Number.isFinite)){c.face+=dt*.8;return;}
    if(c.hiPause>0){c.hiPause=Math.max(0,c.hiPause-dt);c.face+=dt*1.1;if(c.hiPause===0){c.hiIndex++;c.path=null;c.pathT=0;}return;}
    c.tgt=point.slice();
    if(Math.hypot(c.x-point[0],c.y-point[1])<30){c.hiPause=.55;c.path=null;return;}
    if(c.pathT<=0&&!c.setPath(...point)){c.hiIndex++;c.pathT=.4;return;}
    if(c.path?.length)c.follow(dt,72);
  }
};

// El Tallador registra el lugar del ruido después de fallar y después se marcha.
const BlindInvestigation={
  start(b){
    if(!b.hiKnown)return;
    b.hiPlan=HunterIntelligence.plan(b,b.hiX,b.hiY);b.hiIndex=0;b.hiPause=.3;b.hiSearchTime=4.8;
    b.mode='search';b.path=null;b.pathClock=0;
  },
  update(b,dt,g){
    if(b.dead||!b.active||g.state!=='play')return;
    dt*=Specializations.fieldFactor(b,g);if(dt<=0)return;
    b.t+=dt;b.hitFlash=Math.max(0,b.hitFlash-dt);b.pathClock-=dt;
    if(b.grace>0){b.grace=Math.max(0,b.grace-dt);return;}
    const p=g.player,n=CastleNoise.latest(g,b),d=Math.hypot(p.x-b.x,p.y-b.y);
    if(n){b.hear(n);return;}
    if(!p.hidden&&d<b.r+p.r+4&&Level.los(b.x,b.y,p.x,p.y)){
      b.target=[p.x,p.y];b.mode='wind';b.dir=b.face=Math.atan2(p.y-b.y,p.x-b.x);b.clock=.65;Sound.play('attack');return;
    }
    b.hiSearchTime-=dt;
    if(b.hiSearchTime<=0){b.mode='patrol';b.patrolTarget=null;b.hiPlan=[];return;}
    if(b.hiPause>0){b.hiPause=Math.max(0,b.hiPause-dt);b.face+=dt*.85;return;}
    const point=b.hiPlan[b.hiIndex];
    if(!Array.isArray(point)||!point.every(Number.isFinite)){b.face+=dt*.85;return;}
    if(Math.hypot(point[0]-b.x,point[1]-b.y)<30){b.hiIndex++;b.hiPause=.45;return;}
    b.face=Math.atan2(point[1]-b.y,point[0]-b.x);b.moveToward(...point,80*dt);
  }
};
(()=>{
  const hear=BlindCarver.prototype.hear;
  BlindCarver.prototype.hear=function(n){
    hear.call(this,n);
    if(this.mode==='listen'&&n&&[n.x,n.y].every(Number.isFinite)){
      this.hiKnown=true;this.hiX=this.target[0];this.hiY=this.target[1];this.hiKind='noise';
    }
  };
  const update=BlindCarver.prototype.update;
  BlindCarver.prototype.update=function(dt,g){
    if(this.mode==='search')return BlindInvestigation.update(this,dt,g);
    const before=this.mode,result=update.call(this,dt,g);
    if(!this.dead&&this.active&&before==='recover'&&this.mode==='patrol')BlindInvestigation.start(this);
    return result;
  };
  const hud=Castle.hud;Castle.hud=function(g){hud.call(this,g);if(g.lvl===CastleMap.cells&&g.prisoner?.mode==='search')UI.$('castleCue').textContent='REGISTRA EL ÚLTIMO RUIDO · MUÉVETE EN SILENCIO';};
})();
