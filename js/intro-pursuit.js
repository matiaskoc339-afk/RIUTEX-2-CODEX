// Solo la huida inicial del hospital. La persecución libre conserva StalkerMind.
const IntroPursuit = {
  rearKey: 'h:intro_back',
  active(g=Game,c=g.carn) { return g.lvl==='hospital'&&g.story?.seq==='run'&&!!c&&c===g.carn&&!c.active&&!c.dead; },
  bracing(g=Game) { return this.active(g)&&!!g.story.introPursuit?.bracing; },
  sync(g) {
    if(g.lvl!=='hospital'||!g.story)return;
    const s=g.story,p=g.player,c=g.carn,rear=Level.doors.find(d=>d.id==='hab12');
    let q=s.introPursuit;
    if(!this.active(g)) {
      if(q)q.bracing=false;
      if(q?.rearClosed&&s.seq==='wounded_run'&&rear){rear.key=this.rearKey;Level.closeDoor(rear,true);}
      if(q&&s.seq!=='wounded_run'&&rear&&(q.rearClosed||rear.key===this.rearKey)) {
        rear.key=q.rearOriginalKey??null;
        if(q.rearWasOpen)Level.openDoor(rear);else Level.closeDoor(rear,true);
        q.rearClosed=false;
      }
      return;
    }
    q=s.introPursuit||=( {bracing:false,rearClosed:false,rearWasOpen:!!rear?.open,rearOriginalKey:rear?.key??null} );
    c.scripted=true;c.r=14;
    // Las camillas antiguas no guardaban al perseguidor: reconstruirlo en suelo
    // válido permite continuar el tramo sin una carga instantánea al aparecer.
    if(c.dormant||Level.blocked(c.x,c.y,c.r)) {
      c.x=14.5*TILE;c.y=7.5*TILE;c.dormant=false;c.state='chase';c.path=null;c.pathT=0;c.atkCd=Math.max(c.atkCd,1);
    }
    if(rear&&(q.rearClosed||(p.x>13.5*TILE&&c.x>13.5*TILE&&p.y<9*TILE&&c.y<9*TILE))) {
      const changed=!q.rearClosed;
      rear.key=this.rearKey;Level.closeDoor(rear,true);q.rearClosed=true;
      if(c.opening===rear){c.opening=null;c.openT=0;}
      if(changed)Sound.play('door');
    }
    // Una partida previa puede reanudar antes del umbral: no inmovilizarla lejos
    // del cierre. En los tres carriles de la puerta se puede iniciar el forcejeo.
    if(q.bracing&&(p.x<42*TILE||p.y<6*TILE||p.y>=9*TILE))q.bracing=false;
    if(p.x>=43*TILE&&p.x<44*TILE&&p.y>=6*TILE&&p.y<9*TILE)q.bracing=true;
    p.hidden=false;
    if(q.bracing){p.knx=p.kny=p.dashT=0;}
  },
  update(c,dt,g) {
    if(g.state!=='play')return;
    this.sync(g);const p=g.player,q=g.story.introPursuit;
    c.t+=dt;c.hitFlash=Math.max(0,c.hitFlash-dt);c.atkCd-=dt;c.pathT-=dt;
    c.hunt=true;c.lostT=0;c.tgt=[p.x,p.y];c.frozen=0;
    if(c.stagger>0){c.stagger=Math.max(0,c.stagger-dt);return;}
    if(c.openT>0){c.openT-=dt;if(c.openT<=0&&c.opening){Level.openDoor(c.opening);c.opening=null;c.pathT=0;}return;}
    const d=Math.hypot(p.x-c.x,p.y-c.y),a=Math.atan2(p.y-c.y,p.x-c.x);
    if(c.state==='windup') {
      c.mt-=dt;
      if(c.mt<=0) {
        if(d<c.def.range+28&&Level.los(c.x,c.y,p.x,p.y))c.hitPlayer(g);
        c.atkCd=1.2;c.state='recover';c.mt=.55;
        if(g.story.seq!=='run')q.bracing=false;
      }
      return;
    }
    if(c.state==='recover'){c.mt-=dt;if(c.mt<=0)c.state='chase';return;}
    c.state='chase';c.face=a;
    if(d<c.def.range+10&&c.atkCd<=0&&Level.los(c.x,c.y,p.x,p.y)) {
      c.state='windup';c.mt=.6;c.dir=c.face=a;Sound.play('attack');return;
    }
    if(c.pathT<=0)c.setPath(p.x,p.y);
    const speed=q.bracing?245:d>280?210:185;
    if(Nav.fatLos(c.x,c.y,p.x,p.y,c.r-1)) {
      const step=Math.min(Math.max(0,d-c.r-p.r-4),speed*dt);
      Level.move(c,Math.cos(a)*step,Math.sin(a)*step);
    }else c.follow(dt,speed);
  }
};
KEYS['h:intro_back']='Cierre de emergencia del pasillo';
(() => {
  const tick=Hospital.tick;Hospital.tick=function(g,dt){const result=tick.call(this,g,dt);IntroPursuit.sync(g);return result;};
  const update=Carnicero.prototype.update;Carnicero.prototype.update=function(dt,g){if(IntroPursuit.active(g,this))return IntroPursuit.update(this,dt,g);return update.call(this,dt,g);};
  const move=Level.move;Level.move=function(e,dx,dy){if(e===Game.player&&IntroPursuit.bracing(Game))return;return move.call(this,e,dx,dy);};
  const player=Player.prototype.update;Player.prototype.update=function(dt,g){
    if(!IntroPursuit.bracing(g))return player.call(this,dt,g);
    const keys=g.keys;g.keys={...keys,KeyW:false,KeyA:false,KeyS:false,KeyD:false,ShiftLeft:false,ShiftRight:false};
    try{return player.call(this,dt,g);}finally{g.keys=keys;}
  };
  const start=Game.start;Game.start=function(...args){const result=start.apply(this,args);IntroPursuit.sync(this);return result;};
  const restore=SessionSave.restore;SessionSave.restore=function(g,s){const result=restore.call(this,g,s);IntroPursuit.sync(g);return result;};
  const guide=EscapeGuide.tick;EscapeGuide.tick=function(g){
    const result=guide.call(this,g);
    if(IntroPursuit.bracing(g))UI.$('escapeGuide').innerHTML='<strong>EL CIERRE ESTÁ ATASCADO</strong><span>Axel empuja la puerta. El Carnicero se acerca.</span>';
    return result;
  };
  const why=Game.doorWhy;Game.doorWhy=function(d){return d.key===IntroPursuit.rearKey?'El cierre de emergencia está trabado. Sigue hasta la puerta del fondo.':why.call(this,d);};
  const prompt=Game.promptText;Game.promptText=function(){return IntroPursuit.bracing(this)?'El cierre no cede. Axel lo está empujando.':prompt.call(this);};
})();
