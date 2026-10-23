// Primera Persona POV · Opción de presentación independiente de las partidas.
// La simulación, las colisiones, los costes y el apuntado horizontal siguen siendo los mismos.
const FirstPerson = {
  key:'riutex_pov_v016', enabled:false, ready:false, armed:false, fallback:false,
  dragging:false, dragMoved:false, dragDistance:0, pitch:0, turnKeys:{},
  sensitivity:.00235, ignoreUnlock:false, ignoreEscapeUntil:0,
  active(g=Game){return !!(this.enabled&&g?.player&&typeof isR2lvl==='function'&&isR2lvl(g.lvl));},
  playable(g=Game){return this.active(g)&&g.state==='play'&&!g.mut?.bindingTarget&&!(typeof SceneTransitions!=='undefined'&&SceneTransitions.active);},
  locked(){return typeof document!=='undefined'&&document.pointerLockElement===Game.cv&&!!Game.cv;},
  pointerLocked(){return this.locked();},
  vector(dx,dy,g=Game){
    if(!this.active(g))return {x:dx,y:dy};
    const a=g.player.angle||0,c=Math.cos(a),s=Math.sin(a);
    return {x:-dy*c-dx*s,y:-dy*s+dx*c};
  },
  look(dx,dy,g=Game){
    if(!this.active(g))return;
    const p=g.player,a=(p.angle||0)+Math.max(-200,Math.min(200,Number(dx)||0))*this.sensitivity;
    p.angle=Math.atan2(Math.sin(a),Math.cos(a));
    this.pitch=Math.max(-.28,Math.min(.28,this.pitch+(Number(dy)||0)*this.sensitivity*.7));
    this.sync(g);
  },
  sync(g=Game){
    if(!this.active(g)||!g.cam||!g.mouse)return;
    const p=g.player,a=Number.isFinite(p.angle)?p.angle:0;p.angle=a;
    // Ancla psíquica y otras acciones dirigidas reciben un punto visible frente al jugador.
    let distance=240;
    if(typeof Level!=='undefined'&&typeof Level.solid==='function')for(let d=20;d<=240;d+=8){
      if(Level.solid(p.x+Math.cos(a)*d,p.y+Math.sin(a)*d)){distance=Math.max(12,d-12);break;}
    }
    g.mouse.x=p.x-g.cam.x+Math.cos(a)*distance;
    g.mouse.y=p.y-g.cam.y+Math.sin(a)*distance;
  },
  clearActions(g=Game){
    if(g.mouse){g.mouse.down=false;g.mouse.clicked=false;g.mouse.rclick=false;}
  },
  release(g=Game){
    this.armed=false;this.dragging=false;this.dragMoved=false;this.dragDistance=0;this.turnKeys={};
    this.clearActions(g);if(g.keys)g.keys={};
    if(this.locked()&&typeof document.exitPointerLock==='function'){
      this.ignoreUnlock=true;try{document.exitPointerLock();}catch(e){this.ignoreUnlock=false;}
    }
    this.refreshUI(g);
  },
  setEnabled(value){
    const next=!!value;
    if(next!==this.enabled){this.release(Game);this.enabled=next;this.pitch=0;}
    try{localStorage.setItem(this.key,JSON.stringify({enabled:this.enabled}));}catch(e){}
    this.sync(Game);this.refreshUI(Game);return this.enabled;
  },
  refreshUI(g=Game){
    if(typeof document==='undefined')return;
    const active=this.active(g),playing=active&&g.state==='play';
    document.body.classList.toggle('pov-enabled',active);
    document.body.classList.toggle('pov-playing',playing);
    document.body.classList.toggle('pov-captured',playing&&this.locked());
    document.body.classList.toggle('pov-dragging',playing&&this.dragging);
    if(this.menuCheck&&this.menuCheck.checked!==this.enabled)this.menuCheck.checked=this.enabled;
    if(this.pauseCheck&&this.pauseCheck.checked!==this.enabled)this.pauseCheck.checked=this.enabled;
    if(this.hint){
      this.hint.classList.toggle('hidden',!this.playable(g)||this.locked());
      const text=this.armed&&this.fallback
        ?'Arrastra con clic derecho para mirar · Flechas: girar · Clic derecho corto: golpe'
        :'Clic para controlar la mirada · WASD: moverte · Flechas: girar · Esc: pausa';
      if(this.hint.textContent!==text)this.hint.textContent=text;
    }
  },
  requestCapture(g=Game){
    if(!this.playable(g))return;
    this.armed=true;this.fallback=false;this.clearActions(g);
    if(typeof g.cv?.requestPointerLock!=='function'){this.fallback=true;this.refreshUI(g);return;}
    try{
      const request=g.cv.requestPointerLock();
      if(request&&typeof request.catch==='function')request.catch(()=>{
        if(this.playable(g)&&!this.locked()){this.fallback=true;this.refreshUI(g);}
      });
    }catch(e){this.fallback=true;}
    this.refreshUI(g);
  },
  arrowAvailable(code,g=Game){
    return !Object.entries(g.mut?.bindings||{}).some(([id,key])=>key===code&&g.mut.has(id));
  },
  tick(dt,g=Game){
    if(!this.active(g))return;
    if(!this.playable(g)){
      if(this.armed||this.locked()||this.dragging)this.release(g);
      this.refreshUI(g);return;
    }
    if(!this.armed)this.clearActions(g);
    const speed=Math.min(.05,Math.max(0,dt))*1.65,
      turn=(this.turnKeys.ArrowRight?1:0)-(this.turnKeys.ArrowLeft?1:0),
      tilt=(this.turnKeys.ArrowDown?1:0)-(this.turnKeys.ArrowUp?1:0);
    if(turn||tilt){
      const p=g.player,a=p.angle+turn*speed;p.angle=Math.atan2(Math.sin(a),Math.cos(a));
      this.pitch=Math.max(-.28,Math.min(.28,this.pitch+tilt*speed*.45));
    }
    this.sync(g);this.refreshUI(g);
  },
  init(){
    if(this.ready||typeof HTMLCanvasElement==='undefined')return;this.ready=true;
    try{this.enabled=JSON.parse(localStorage.getItem(this.key)||'{}')?.enabled===true;}catch(e){this.enabled=false;}
    const makeSetting=(id,helpId)=>{
      const row=document.createElement('div');row.className='pov-setting';
      row.innerHTML='<label for="'+id+'"><span>Primera Persona POV</span><input id="'+id+'" type="checkbox" aria-describedby="'+helpId+'"></label><p id="'+helpId+'">W/S: avanzar y retroceder · A/D: desplazarte de lado.<br>Ratón: mirar · Flechas: alternativa. Desactiva para volver a la vista clásica.</p>';
      return row;
    };
    const menu=UI.$('menuOptions')?.querySelector('.presentation-options');
    if(menu){const row=makeSetting('menuFirstPerson','menuFirstPersonHelp');menu.insertBefore(row,UI.$('bMenuOptionsClose'));this.menuCheck=UI.$('menuFirstPerson');this.menuCheck.onchange=()=>this.setEnabled(this.menuCheck.checked);}
    const pause=UI.$('pause');if(pause){pause.appendChild(makeSetting('pauseFirstPerson','pauseFirstPersonHelp'));this.pauseCheck=UI.$('pauseFirstPerson');this.pauseCheck.onchange=()=>this.setEnabled(this.pauseCheck.checked);}
    this.hint=document.createElement('div');this.hint.id='povControlHint';this.hint.className='hidden';this.hint.setAttribute('role','status');document.body.appendChild(this.hint);
    const stop=e=>{e.preventDefault();e.stopImmediatePropagation();};
    window.addEventListener('keydown',e=>{
      if(!this.active(Game))return;
      if(e.code==='Escape'&&performance.now()<this.ignoreEscapeUntil){stop(e);return;}
      if(!this.playable(Game))return;
      if(e.code==='Escape'){
        stop(e);this.ignoreEscapeUntil=performance.now()+220;this.release(Game);Game.pause();return;
      }
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)&&this.arrowAvailable(e.code)){
        this.turnKeys[e.code]=true;stop(e);return;
      }
      // Los poderes pueden activarse entre dos cuadros; su punto de mira ya debe estar alineado.
      this.sync(Game);
    },true);
    window.addEventListener('keyup',e=>{
      if(this.turnKeys[e.code]){delete this.turnKeys[e.code];e.preventDefault();e.stopImmediatePropagation();}
    },true);
    window.addEventListener('mousemove',e=>{
      if(!this.playable(Game)||(e.target!==Game.cv&&!this.locked()&&!this.dragging))return;
      if(this.locked())this.look(e.movementX||0,e.movementY||0,Game);
      else if(this.dragging){
        const dx=Number.isFinite(e.movementX)?e.movementX:e.clientX-this.dragX,
          dy=Number.isFinite(e.movementY)?e.movementY:e.clientY-this.dragY;
        this.dragX=e.clientX;this.dragY=e.clientY;this.dragDistance+=Math.abs(dx)+Math.abs(dy);
        if(this.dragDistance>=3){this.dragMoved=true;this.look(dx,dy,Game);}
      }
      e.stopImmediatePropagation();
    },true);
    window.addEventListener('mousedown',e=>{
      if(!this.playable(Game)||e.target!==Game.cv)return;
      if(e.button===0){
        stop(e);Sound.unlock();
        if(!this.armed){this.requestCapture(Game);return;}
        Game.mouse.down=true;Game.mouse.clicked=true;this.sync(Game);return;
      }
      if(e.button===2){
        stop(e);
        if(this.locked()){Game.mouse.rclick=true;this.sync(Game);return;}
        this.suppressRightClick=!this.armed;this.armed=true;this.fallback=true;
        this.dragging=true;this.dragMoved=false;this.dragDistance=0;this.dragX=e.clientX;this.dragY=e.clientY;this.refreshUI(Game);
      }
    },true);
    window.addEventListener('mouseup',e=>{
      if(!this.active(Game))return;
      if(e.button===0)Game.mouse.down=false;
      if(e.button===2&&this.dragging){
        const hit=!this.dragMoved&&!this.suppressRightClick&&this.playable(Game);
        this.dragging=false;this.dragMoved=false;this.dragDistance=0;
        if(hit){Game.mouse.rclick=true;this.sync(Game);}
        this.refreshUI(Game);e.preventDefault();e.stopImmediatePropagation();
      }
    },true);
    document.addEventListener('pointerlockchange',()=>{
      const now=this.locked(),was=this.wasLocked;this.wasLocked=now;
      if(now){this.armed=true;this.fallback=false;this.ignoreUnlock=false;}
      else{
        const deliberate=this.ignoreUnlock;this.ignoreUnlock=false;this.armed=false;this.clearActions(Game);
        if(was&&!deliberate&&this.active(Game)&&Game.state==='play'){
          this.ignoreEscapeUntil=performance.now()+220;Game.pause();
        }
      }
      this.refreshUI(Game);
    });
    document.addEventListener('pointerlockerror',()=>{
      if(this.playable(Game)&&!this.locked()){this.fallback=true;this.refreshUI(Game);}
    });
    window.addEventListener('blur',()=>{if(this.active(Game))this.release(Game);});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.active(Game)){this.release(Game);if(Game.state==='play')Game.pause();}});
    this.refreshUI(Game);
  }
};
(()=>{
  const init=Game.init;Game.init=function(){const result=init.call(this);FirstPerson.init();return result;};
  const update=Game.update;Game.update=function(dt){
    if(FirstPerson.active(this))FirstPerson.tick(dt,this);
    const result=update.call(this,dt);
    if(FirstPerson.active(this)){if(!FirstPerson.playable(this)){FirstPerson.clearActions(this);if(FirstPerson.armed||FirstPerson.locked())FirstPerson.release(this);}FirstPerson.sync(this);FirstPerson.refreshUI(this);}
    return result;
  };
  const screen=UI.screen;UI.screen=function(name){
    if(FirstPerson.enabled&&name)FirstPerson.release(Game);
    const result=screen.call(this,name);FirstPerson.refreshUI(Game);return result;
  };
  const start=Game.start;Game.start=function(...args){
    if(FirstPerson.enabled)FirstPerson.release(this);
    const result=start.apply(this,args);
    if(FirstPerson.active(this)){
      FirstPerson.pitch=0;
      const p=this.player,dx=this.mouse.x+this.cam.x-p.x,dy=this.mouse.y+this.cam.y-p.y;
      if(Math.hypot(dx,dy)>1)p.angle=Math.atan2(dy,dx);
      FirstPerson.sync(this);
    }
    FirstPerson.refreshUI(this);return result;
  };
  const cast=Game.castSkill;Game.castSkill=function(...args){if(FirstPerson.active(this))FirstPerson.sync(this);return cast.apply(this,args);};
})();
