// Fundido con reloj de presentación independiente: ni enemigos ni recursos avanzan ocultos.
const SceneTransitions={
 names:{mansion:'La mansión de Wren',hospital:'Hospital · Planta baja',hospital1:'Hospital · Primer piso',hospitalb:'Hospital · Sótano',hospitalchem:'Contención C-0',hospitalworks:'Cloacas / Fábrica',hospitalpit:'Almacén de ensayo',hospitalnest:'Último colector',hospitalcells:'Calabozos de Valcárcel',hospitalcastle:'Castillo · Planta baja',hospitalcastle1:'Castillo · Planta alta',hospitalroyal:'Sala real',hospitalumbra:'Laboratorio UMBRAL',hospitalorigin:'Núcleo ORIGEN',hospitalstreet:'Calles de San Gabriel'},
 enabled:true,active:false,serial:0,held:new Set(),movement:new Set(['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ShiftRight']),
 supported(){return this.enabled&&typeof HTMLCanvasElement!=='undefined'&&!!Game.cv;},
 init(){
  if(this.overlay||typeof HTMLCanvasElement==='undefined')return;
  const e=document.createElement('div');e.id='sceneTransition';e.className='hidden';e.setAttribute('aria-hidden','true');e.innerHTML='<canvas></canvas><span class="scene-label"></span>';document.body.appendChild(e);this.overlay=e;this.canvas=e.querySelector('canvas');this.label=e.querySelector('.scene-label');
  window.addEventListener('keydown',e=>{if(this.movement.has(e.code))this.held.add(e.code);if(this.active){e.preventDefault();e.stopImmediatePropagation();}},true);
  window.addEventListener('keyup',e=>{this.held.delete(e.code);if(this.active){Game.keys[e.code]=false;e.stopImmediatePropagation();}},true);
  window.addEventListener('blur',()=>{this.held.clear();Game.keys={};});
 },
 finish(){this.serial++;this.active=false;this.menuSnapshot?.remove();this.menuSnapshot=null;if(this.overlay){this.overlay.classList.add('hidden');this.overlay.style.opacity='0';}document.body.classList.remove('scene-changing');Game.last=performance.now();if(Game.state==='play'){Game.keys={};for(const code of this.held)Game.keys[code]=true;}},
 run(g,action,title){
  if(!this.supported()||this.active)return action();this.init();
  const token=++this.serial,old=document.createElement('canvas');old.width=g.cv.width;old.height=g.cv.height;const ctx=old.getContext('2d');
  if(g.state==='menu'&&MenuScene.canvas){
   const snapshot=UI.$('menu').cloneNode(true);snapshot.classList.add('menu-snapshot');snapshot.removeAttribute('id');snapshot.setAttribute('aria-hidden','true');for(const node of snapshot.querySelectorAll('[id]'))node.removeAttribute('id');
   snapshot.querySelector('canvas').getContext('2d').drawImage(MenuScene.canvas,0,0);this.overlay.prepend(snapshot);this.menuSnapshot=snapshot;
  }else ctx.drawImage(g.cv,0,0);
  this.active=true;g.mouse.down=false;g.mouse.rclick=false;g.mouse.clicked=false;g.keys={};this.overlay.classList.remove('hidden');document.body.classList.add('scene-changing');this.overlay.style.opacity='1';
  let result;try{result=action();}catch(e){this.finish();throw e;}
  // La llegada ya existe detrás del velo; ningún update corre hasta que sea visible.
  const dest=typeof title==='function'?title():title;this.label.textContent=dest||this.names[g.lvl]||'SAN GABRIEL';
  this.canvas.width=old.width;this.canvas.height=old.height;const c=this.canvas.getContext('2d');
  const duration=MenuScene.motionReduced()?160:680,start=performance.now();
  const frame=now=>{
   if(token!==this.serial)return;const p=Math.min(1,(now-start)/duration),black=Math.min(1,p/.35);c.globalAlpha=1;c.clearRect(0,0,old.width,old.height);if(!this.menuSnapshot)c.drawImage(old,0,0);c.fillStyle=`rgba(3,5,7,${black})`;c.fillRect(0,0,old.width,old.height);
   this.overlay.style.opacity=String(p<.48?1:Math.max(0,(1-p)/.52));this.label.style.opacity=String(MenuScene.motionReduced()?0:Math.max(0,1-Math.abs(p-.5)*4));
   if(p>=1){this.finish();return;}requestAnimationFrame(frame);
  };frame(start);requestAnimationFrame(frame);return result;
 }
};
(()=>{
 const init=Game.init;Game.init=function(){init.call(this);SceneTransitions.init();};
 const update=Game.update;Game.update=function(dt){if(SceneTransitions.active)return;return update.call(this,dt);};
 const hurt=Player.prototype.hurt;Player.prototype.hurt=function(...args){if(SceneTransitions.active)return;return hurt.apply(this,args);};
 for(const method of ['goto','toHospital']){const original=Hospital[method];Hospital[method]=function(g,...args){return SceneTransitions.run(g,()=>original.call(this,g,...args));};}
 const start=Game.start;Game.start=function(...args){return SceneTransitions.run(this,()=>start.apply(this,args),()=>SceneTransitions.names[this.lvl]||'SAN GABRIEL');};
 const menu=Game.toMenu;Game.toMenu=function(...args){SceneTransitions.finish();return menu.apply(this,args);};
 const finish=Endgame.finish;Endgame.finish=function(g,...args){const q=this.data(g);if(q.complete||!q.choice||!q.boss.won)return finish.call(this,g,...args);return SceneTransitions.run(g,()=>finish.call(this,g,...args),'FIN DE RIUTEX 2');};
})();
