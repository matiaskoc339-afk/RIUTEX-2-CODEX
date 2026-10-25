// Acústica de cada sector. Es presentación: no emite Game.noise ni altera IA.
const Soundscape={
  profile:'hospital',safe:false,elapsed:0,next:8,player:null,level:null,stepSide:1,
  profiles:{
    mansion:{frequency:43,air:310,airGain:.10,level:.58},
    hospital:{frequency:50,air:470,airGain:.13,level:.68},
    factory:{frequency:38,air:730,airGain:.20,level:.85},
    castle:{frequency:57,air:1150,airGain:.17,level:.65},
    laboratory:{frequency:60,air:520,airGain:.12,level:.75},
    street:{frequency:40,air:1100,airGain:.25,level:.42},
    refuge:{frequency:55,air:320,airGain:.08,level:.30}
  },
  sector(g){const id=g.lvl||'';return id==='mansion'?'mansion':/works|nest|depths|sewer/.test(id)?'factory':/castle|royal|cells/.test(id)?'castle':/umbra|origin|lab/.test(id)?'laboratory':/street/.test(id)?'street':'hospital';},
  room(p){return Level.rooms.find(r=>p.x>=r.x*TILE&&p.x<(r.x+r.w)*TILE&&p.y>=r.y*TILE&&p.y<(r.y+r.h)*TILE);},
  isSafe(p){return (Level.safeRects||[]).some(([x0,y0,x1,y1])=>p.x>=x0*TILE&&p.x<x1*TILE&&p.y>=y0*TILE&&p.y<y1*TILE);},
  surface(g){
    const p=g.player;if(!p)return'tile';if(Level.fluidAt(p.x,p.y))return'water';
    const room=this.room(p)?.n||'',sector=this.sector(g);
    if(/rejilla|pasarela|máquina|caldera|reactor|colector|turbina/i.test(room))return'metal';
    if(sector==='factory')return'metal';if(sector==='mansion')return /jardín|exterior/i.test(room)?'stone':'wood';
    if(sector==='castle')return'stone';return'tile';
  },
  reset(g){this.player=g?.player||null;this.level=g?.lvl||null;this.elapsed=0;this.next=8;this.stepSide=1;this.sample=null;this.lastMix=null;},
  refresh(g=Game){
    if(!g.player||!Sound.ambient)return;
    this.profile=this.sector(g);this.safe=this.isSafe(g.player);
    const enabled=g.state==='play'&&!document.hidden,key=[this.profile,this.safe,enabled].join(':');
    if(this.lastMix===key&&this.lastAmbient===Sound.ambient)return;
    this.lastMix=key;this.lastAmbient=Sound.ambient;
    Sound.ambientProfile(this.profiles[this.safe?'refuge':this.profile],enabled);
  },
  tick(g,dt){
    if(this.player!==g.player||this.level!==g.lvl)this.reset(g);
    if(g.state!=='play'||document.hidden){this.refresh(g);return;}
    this.refresh(g);this.elapsed+=Math.max(0,Math.min(.1,Number(dt)||0));
    if(this.safe||this.elapsed<this.next)return;
    this.next=this.elapsed+12+Math.random()*12;
    const pan=(Math.random()-.5)*.75,o={ambient:true,pan};
    if(this.profile==='factory'){Sound.tone(850,.075,.12,'sine',{...o,endFreq:320});Sound.noise(.22,.20,1500,'bandpass',{...o,delay:.07});}
    else if(this.profile==='castle'||this.profile==='mansion'){Sound.noise(.5,.13,220,'bandpass',o);Sound.tone(74,.42,.06,'triangle',{...o,endFreq:59});}
    else if(this.profile==='laboratory'){Sound.noise(.045,.12,2400,'highpass',o);Sound.tone(720,.09,.06,'sine',{...o,delay:.09});}
    else if(this.profile==='hospital'){Sound.noise(.11,.11,820,'bandpass',o);Sound.tone(97,.22,.04,'triangle',{...o,endFreq:73});}
  }
};
(()=>{
  const play=Sound.play;
  Sound.play=function(name,context={}){
    if(name==='step'&&typeof Game!=='undefined'&&Game.player){
      // Player.update solicita un paso por intención de movimiento; exige además
      // desplazamiento real para que empujar una pared no produzca pisadas.
      const p=Game.player,s=Soundscape.sample;
      if(Game.state!=='play'||p.hidden||Game.story?.restrained||!s||s.player!==p||Math.hypot(p.x-s.x,p.y-s.y)<.01)return;
      Soundscape.stepSide*=-1;context={...context,surface:Soundscape.surface(Game),running:p.running,pan:Soundscape.stepSide*.08};
    }
    return play.call(this,name,context);
  };
  const update=Game.update;
  Game.update=function(dt){
    if(Soundscape.player!==this.player||Soundscape.level!==this.lvl)Soundscape.reset(this);
    const p=this.player;Soundscape.sample=p?{player:p,x:p.x,y:p.y}:null;
    const result=update.call(this,dt);Soundscape.tick(this,dt);return result;
  };
  const screen=UI.screen;
  UI.screen=function(...args){const result=screen.apply(this,args);Soundscape.refresh(Game);return result;};
  const start=Game.start;
  Game.start=function(...args){const result=start.apply(this,args);Soundscape.reset(this);Soundscape.refresh(this);return result;};
  const finish=Weapons.finishReload;
  Weapons.finishReload=function(p){
    const wp=p.weapon,before=wp?.mag,result=finish.call(this,p);
    if(wp&&p.weapon===wp&&wp.mag>before){p.reloadDuration=0;p.reloadWeaponId='';Sound.play('reloadend',{weaponId:wp.id});}return result;
  };
  const reload=Weapons.reload;
  Weapons.reload=function(p){
    const before=p.reloading,result=reload.call(this,p);
    if(before<=0&&p.reloading>0){p.reloadDuration=p.reloading;p.reloadWeaponId=p.weapon?.id||null;}return result;
  };
  window.addEventListener('blur',()=>{Soundscape.lastMix=null;Sound.ambientProfile(null,false);});
  document.addEventListener?.('visibilitychange',()=>{Soundscape.lastMix=null;if(document.hidden)Sound.ambientProfile(null,false);else Soundscape.refresh(Game);});
})();
