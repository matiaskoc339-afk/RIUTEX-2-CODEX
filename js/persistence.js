// Sesión web persistente. Claves estables entre versiones y separadas de camillas/reintentos.
const SessionSave = {
  key: 'riutex2_session_v1', backupKey: 'riutex2_session_backup_v1',
  interval: 10, elapsed: 0, loading: false, restoring: false, issue: false, warned: false,
  clone(v) { return JSON.parse(JSON.stringify(v)); },
  parse(text) {
    if (typeof text !== 'string' || text.length > 5000000) return null;
    try { return JSON.parse(text, (k,v) => ['__proto__','prototype','constructor'].includes(k) ? undefined : v); }
    catch (e) { return null; }
  },
  valid(s) {
    const d=s?.data, f=d && (d.lvl==='mansion'?MANSION:FLOORS[d.lvl]);
    return !!(s?.format==='RIUTEX2-session' && s.schema===1 && Game.validSave(d) &&
      isR2lvl(d.lvl) && f && d.hp>0 && d.x>=0 && d.y>=0 && d.x<f.W*TILE && d.y<f.H*TILE &&
      d.xp>=0 && d.inv.cols>=1 && d.inv.cols<=20 && d.inv.rows>=1 && d.inv.rows<=20 &&
      d.inv.items.every(i=>i && Object.hasOwn(ITEMS,i.type)) &&
      d.inv.docs.every(id=>Object.hasOwn(DOCS,id)) &&
      (!s.runtime || (typeof s.runtime==='object' && Array.isArray(s.runtime.actors) &&
        s.runtime.player && [s.runtime.player.x,s.runtime.player.y,s.runtime.player.hp].every(Number.isFinite) &&
        s.runtime.player.hp===d.hp && s.runtime.player.x===d.x && s.runtime.player.y===d.y)));
  },
  read() {
    for (const key of [this.key,this.backupKey]) {
      try { const s=SaveCodec.decode(localStorage.getItem(key)); if(this.valid(s))return s; }
      catch (e) { this.issue=true; }
    }
    return null;
  },
  canCapture(g=Game) {
    return !this.loading && !this.restoring && g.player?.hp>0 && isR2lvl(g.lvl) &&
      !['menu','dead','cine'].includes(g.state) &&
      (g.state!=='slots' || !['menu','dead'].includes(g.slotReturnState));
  },
  // Solo campos propios serializables: no se guardan prototipos, funciones ni definiciones.
  fields(o, arrays=false) {
    const d={};
    for (const [k,v] of Object.entries(o||{})) {
      if (['id','type','def','path','weapon','weapons','mods'].includes(k))continue;
      if (v===null || typeof v==='boolean' || typeof v==='string' || (typeof v==='number' && Number.isFinite(v)))d[k]=v;
      else if (arrays && Array.isArray(v) && k!=='path')d[k]=this.clone(v);
    }
    return d;
  },
  capture(g=Game) {
    if (!this.canCapture(g))return null;
    const data=g.save(null); // Reutiliza también todos los remember() de las cuatro fases.
    if (!data)return null;
    const runtime={player:this.fields(g.player),actors:g.enemies.map(e=>({id:e.id,type:e.type,state:this.fields(e,true)})),
      squad:(g.squad||[]).map(e=>this.fields(e)),custodio:g.custodio&&this.clone(g.custodio),
      hospital:{q:Hospital.q,seen:[...Hospital.seen],ft:Hospital.ft||0,hb:Hospital.hb,msgT:Hospital.msgT},
      collapse:g.collapse&&this.clone(g.collapse),carnT:g.carnT||0,povPitch:FirstPerson.pitch,
      doors:Level.doors.map(d=>({id:d.id,key:d.key||null,open:!!d.open}))};
    if(g.state==='end')runtime.ending={title:UI.$('endH').textContent,subtitle:UI.$('endS').textContent,body:UI.$('endB').textContent};
    return this.clone({format:'RIUTEX2-session',schema:1,savedAt:data.savedAt,data,runtime,retry:g.getSaveSlots()[3]});
  },
  persist(s) {
    if(!this.valid(s))return false;
    try {
      const text=SaveCodec.encode(s);localStorage.setItem(this.key,text);
      // Una copia permite recuperar una clave dañada; el éxito principal es suficiente.
      try { localStorage.setItem(this.backupKey,text); } catch(e) {}
      this.issue=false;this.warned=false;return true;
    } catch(e) { this.failure();return false; }
  },
  failure() {
    this.issue=true;
    if(!this.warned){this.warned=true;UI.msg('El navegador bloqueó el guardado. En Pausa → Partidas y copias puedes descargar tu partida.',8000);}
    this.status();
  },
  flush(g=Game) {
    try { const s=this.capture(g);if(!s)return false;const ok=this.persist(s);this.elapsed=0;return ok; }
    catch(e) { this.failure();return false; }
  },
  tick(g,dt) {
    if(!this.canCapture(g)||SceneTransitions.active)return;
    this.elapsed+=Math.max(0,Math.min(Number(dt)||0,1));
    if(this.elapsed>=this.interval)this.flush(g);
  },
  applyFields(target,state) {
    for(const [k,v] of Object.entries(state||{}))if(Object.hasOwn(target,k) && !['id','type','def','weapon','weapons','mods'].includes(k))target[k]=this.clone(v);
  },
  restore(g,s) {
    const r=s.runtime;if(!r)return;
    this.applyFields(g.player,r.player);
    if(g.player.reloading>0&&g.player.weapon?.id==='flamethrower')g.player.flameReloadWeapon=g.player.weapon;
    for(const row of r.actors) {
      const e=g.enemies.find(e=>e.id===row.id && e.type===row.type);if(!e)continue;
      this.applyFields(e,row.state);
      if(!e.dead){e.path=null;e.grace=Math.max(e.grace||0,1);}
    }
    if(r.hospital){Hospital.q=this.clone(r.hospital.q||[]);Hospital.seen=new Set(r.hospital.seen||[]);for(const k of ['ft','hb','msgT'])Hospital[k]=Number(r.hospital[k])||0;}
    if(g.squad)r.squad?.forEach((s,i)=>{if(g.squad[i])this.applyFields(g.squad[i],s);});
    g.custodio=r.custodio&&this.clone(r.custodio);g.collapse=r.collapse&&this.clone(r.collapse);g.carnT=r.carnT||0;
    for(const row of r.doors||[]){const d=Level.doors.find(d=>d.id===row.id);if(!d)continue;d.key=typeof row.key==='string'?row.key:null;if(row.open)Level.openDoor(d);else Level.closeDoor(d,true);}
    if(g.lvl==='mansion'&&g.story.finale)Level.lamps=[];
    // Los proyectiles transitorios se limpian al reconstruir; las reservas y heridas no.
    // No reanudamos un golpe invisible: cada jefe vuelve a un aviso o recuperación.
    for(const e of g.enemies)if(!e.dead&&e.mode&&['wind','rush','charge','attack','leap'].includes(e.mode)){
      if(typeof e.recover==='function')e.recover(1);else {e.mode='recover';e.clock=1;}
    }
    if(r.ending){g.state='end';UI.$('endH').textContent=r.ending.title;UI.$('endS').textContent=r.ending.subtitle;UI.$('endB').textContent=r.ending.body;UI.screen('end');}
    g.keys={};g.mouse.down=g.mouse.clicked=g.mouse.rclick=false;
    if(FirstPerson.enabled){FirstPerson.pitch=Math.max(-FirstPerson.maxPitch,Math.min(FirstPerson.maxPitch,Number(r.povPitch)||0));FirstPerson.sync(g);}
  },
  resume(s=this.read()) {
    if(!this.valid(s))return UI.msg('No hay una sesión válida para continuar.');
    this.restoring=true;
    try{Game.start(false,s.data);this.restore(Game,s);}finally{this.restoring=false;}
    if(Game.validSave(s.retry)){
      try{const slots=Game.getSaveSlots();slots[3]=s.retry;localStorage.setItem(SAVE_SLOTS_KEY,SaveCodec.encode(slots));}catch(e){this.failure();}
    }
    this.flush(Game);
  },
  died(g) {
    const retry=g.getSaveSlots()[3];
    if(Game.validSave(retry)&&retry.hp>0)this.persist({format:'RIUTEX2-session',schema:1,savedAt:new Date().toISOString(),data:retry,retry,runtime:null});
  },
  status() {
    const e=UI.$('sessionSaveStatus');
    e.textContent=this.issue?'El navegador no permite guardar. Descarga una copia para conservar tu partida.':'La sesión se guarda automáticamente en este navegador. Las copias permiten trasladarla o recuperarla.';
    e.classList.toggle('save-error',this.issue);
  },
  render(g,mode) {
    const s=this.read(),b=UI.$('bResumeSession');
    b.classList.toggle('hidden',mode!=='load'||!s);
    b.textContent=s?'CONTINUAR SESIÓN · '+(SceneTransitions.names[s.data.lvl]||s.data.lvl)+' · '+new Date(s.savedAt).toLocaleString():'';
    b.onclick=()=>this.resume();UI.$('bExportSession').disabled=!this.canCapture(g)&&!s;this.status();
  },
  export() {
    const s=this.capture()||this.read();if(!this.valid(s))return UI.msg('No hay partida para descargar.');
    const blob=new Blob([JSON.stringify(s)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='RIUTEX2-partida-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  },
  import(text) {
    const s=this.parse(text);if(!this.valid(s))return UI.msg('Esta copia de partida no es válida. Tu progreso se conserva.',5000);
    // Los nombres del plano son los del juego; los archivos nunca aportan HTML.
    s.data.levelName=SceneTransitions.names[s.data.lvl]||s.data.lvl;
    const previous=this.capture()||this.read();
    try{this.resume(s);return true;}
    catch(e){if(previous)this.resume(previous);UI.msg('No se pudo recuperar esta copia. Tu partida anterior se conserva.',5000);return false;}
  },
  init(g) {
    UI.$('bSessionSlots').onclick=()=>g.openSaveSlots('load');
    UI.$('bExportSession').onclick=()=>this.export();
    UI.$('bImportSession').onclick=()=>UI.$('sessionImportFile').click();
    UI.$('sessionImportFile').onchange=async e=>{
      const f=e.target.files?.[0];if(!f)return;
      try { if(f.size>5000000)throw new Error('size');this.import(await f.text()); }
      catch(e){UI.msg('No se pudo leer la copia. La partida actual se conserva.');}
      finally {UI.$('sessionImportFile').value='';}
    };
    window.addEventListener('pagehide',()=>this.flush(g));
    document.addEventListener?.('visibilitychange',()=>{if(document.hidden)this.flush(g);});
    // Ningún diálogo al salir: escritura síncrona, también dentro del iframe de itch.io.
    window.addEventListener('beforeunload',()=>this.flush(g));
  }
};
(()=>{
  const init=Game.init;Game.init=function(){init.call(this);SessionSave.init(this);};
  const start=Game.start;Game.start=function(...args){SessionSave.loading=true;try{return start.apply(this,args);}finally{SessionSave.loading=false;SessionSave.elapsed=0;SessionSave.flush(this);}};
  const update=Game.update;Game.update=function(dt){const result=update.call(this,dt);SessionSave.tick(this,dt);return result;};
  const menu=Game.toMenu;Game.toMenu=function(...args){SessionSave.flush(this);return menu.apply(this,args);};
  const pause=Game.pause;Game.pause=function(...args){const result=pause.apply(this,args);SessionSave.flush(this);return result;};
  const die=Game.die;Game.die=function(...args){const result=die.apply(this,args);SessionSave.died(this);return result;};
  const save=Game.save;Game.save=function(slot=0){const result=save.call(this,slot);if(slot!==null&&result===true)SessionSave.flush(this);return result;};
  for(const method of ['take','buySkill','injectSample','craftAmmo']){
    const original=Game[method];Game[method]=function(...args){const result=original.apply(this,args);SessionSave.flush(this);return result;};
  }
  const has=Game.hasSave;Game.hasSave=function(){return !!SessionSave.read()||has.call(this);};
  const render=UI.renderSaveSlots;UI.renderSaveSlots=function(g,mode){render.call(this,g,mode);SessionSave.render(g,mode);};
  const close=Game.closeSaveSlots;Game.closeSaveSlots=function(){if(this.slotReturnState==='pause'){this.pause();return;}return close.call(this);};
})();
