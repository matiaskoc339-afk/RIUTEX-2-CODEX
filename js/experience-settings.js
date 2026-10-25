// Ajustes visuales locales: nunca alteran la partida, el daño ni la simulación.
const ExperienceSettings = {
  key: 'riutex_experience_v1',
  defaults: {fov:68, quality:'high', hud:100, sway:100, shake:100},
  values: {fov:68, quality:'high', hud:100, sway:100, shake:100},
  returnTo: 'pause',
  normalize(input) {
    const bounded=(key,min,max,step)=>{
      const raw=input?.[key], n=typeof raw==='number'?raw:NaN;
      return Number.isFinite(n)?Math.max(min,Math.min(max,Math.round(n/step)*step)):this.defaults[key];
    };
    return {fov:bounded('fov',60,85,1),quality:['economy','balanced','high'].includes(input?.quality)?input.quality:'high',
      hud:bounded('hud',85,120,5),sway:bounded('sway',0,100,10),shake:bounded('shake',0,100,10)};
  },
  load() {
    try { this.values=this.normalize(JSON.parse(localStorage.getItem(this.key)||'{}')); }
    catch(e) { this.values={...this.defaults}; }
  },
  set(key,value) {
    if(!Object.hasOwn(this.defaults,key))return;
    this.values=this.normalize({...this.values,[key]:value});
    try {localStorage.setItem(this.key,JSON.stringify(this.values));}catch(e){}
    this.apply();this.refresh();
  },
  pixelRatio() {return Math.min(window.devicePixelRatio||1,{economy:1,balanced:1.25,high:1.5}[this.values.quality]||1.5);},
  shakeFactor() {return MenuScene.motionReduced()?0:this.values.shake/100;},
  apply() {
    document.body.style.setProperty('--survival-hud-scale',this.values.hud/100);
    document.body.classList.toggle('comfort-reduced',MenuScene.motionReduced());
    const r=typeof POV3DRenderer!=='undefined'&&POV3DRenderer;
    if(!r?.ready)return;
    if(r.camera3D.fov!==this.values.fov){r.camera3D.fov=this.values.fov;r.camera3D.updateProjectionMatrix();}
    const size={economy:768,balanced:1024,high:1536}[this.values.quality];
    const shadow=r.flashlight.shadow;
    if(shadow.mapSize.x!==size){
      shadow.map?.dispose();shadow.map=null;
      shadow.mapSize.set(size,size);shadow.needsUpdate=true;
    }
  },
  open() {
    if(!['pause','menuOptions'].includes(Game.state)||!this.panel)return;
    this.returnTo=Game.state;Game.state='experienceOptions';Game.keys={};Game.mouse.down=Game.mouse.clicked=Game.mouse.rclick=false;
    UI.screen('experienceOptions');this.refresh();UI.$('experienceFov').focus();
  },
  close() {
    if(Game.state!=='experienceOptions')return;
    Game.state=this.returnTo;Game.keys={};UI.screen(this.returnTo);
    UI.$(this.returnTo==='pause'?'bPauseExperience':'bMenuExperience').focus();
  },
  refresh() {
    if(!this.panel)return;
    for(const [key,label]of Object.entries({fov:'°',hud:' %',sway:' %',shake:' %'})){
      const input=this.panel.querySelector('[data-experience="'+key+'"]');input.value=this.values[key];
      UI.$(input.id+'Value').textContent=this.values[key]+label;input.setAttribute('aria-valuetext',this.values[key]+label);
    }
    UI.$('experienceQuality').value=this.values.quality;
    UI.$('experienceReduced').checked=MenuScene.reduced;
  },
  init() {
    this.load();this.apply();
    if(typeof HTMLCanvasElement==='undefined'||this.panel)return;
    const panel=document.createElement('section');this.panel=panel;panel.id='experienceOptions';panel.className='screen hidden';
    panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','experienceTitle');
    const range=(id,key,title,description,min,max,step)=>'<label class="experience-control" for="'+id+'"><span>'+title+'<output id="'+id+'Value" for="'+id+'"></output></span><input id="'+id+'" data-experience="'+key+'" type="range" min="'+min+'" max="'+max+'" step="'+step+'" aria-describedby="'+id+'Help"><small id="'+id+'Help">'+description+'</small></label>';
    panel.innerHTML='<div class="experience-panel"><p class="experience-kicker">RIUTEX 2 / A TU MEDIDA</p><h2 id="experienceTitle">Imagen y comodidad</h2><p class="experience-intro">Ajusta la imagen y la interfaz. Se conserva al cerrar el juego.</p><div class="experience-grid">'+
      range('experienceFov','fov','Campo de visión POV','Ángulo vertical. Solo afecta a la vista en primera persona.',60,85,1)+
      '<label class="experience-control" for="experienceQuality"><span>Calidad 3D</span><select id="experienceQuality"><option value="economy">Ligera</option><option value="balanced">Equilibrada</option><option value="high">Alta</option></select><small>Resolución y sombras. Prueba Ligera si la primera persona va lenta.</small></label>'+
      range('experienceHud','hud','Tamaño de indicadores','Monitor vital, arma y habilidades en ambos modos.',85,120,5)+
      range('experienceSway','sway','Balanceo al caminar','Movimiento suave de la cámara POV. 0 % lo desactiva.',0,100,10)+
      range('experienceShake','shake','Sacudidas de cámara','Impactos y retroceso visual en topdown. No cambia la puntería.',0,100,10)+
      '<label class="experience-control experience-toggle" for="experienceReduced"><span>Reducir movimiento y destellos<input id="experienceReduced" type="checkbox"></span><small>Prioriza una imagen estable, también en menús y transiciones.</small></label></div><div class="experience-actions"><button id="bExperienceReset" type="button">Restablecer imagen</button><button id="bExperienceBack" type="button">Volver</button></div></div>';
    document.body.appendChild(panel);
    for(const [parent,id]of [[UI.$('pause'),'bPauseExperience'],[UI.$('menuOptions')?.querySelector('.presentation-options'),'bMenuExperience']]){
      if(!parent)continue;const b=document.createElement('button');b.id=id;b.type='button';b.className='experience-open';b.textContent='Imagen y comodidad';b.onclick=()=>this.open();
      const before=parent.querySelector(id==='bMenuExperience'?'#bMenuOptionsClose':'.pause-help');parent.insertBefore(b,before);
    }
    panel.querySelectorAll('[data-experience]').forEach(input=>{input.oninput=()=>this.set(input.dataset.experience,Number(input.value));});
    UI.$('experienceQuality').onchange=e=>this.set('quality',e.target.value);
    UI.$('experienceReduced').onchange=e=>{MenuScene.reduced=e.target.checked;MenuScene.save();UI.$('menuReduceMotion').checked=MenuScene.reduced;this.apply();};
    UI.$('bExperienceBack').onclick=()=>this.close();
    UI.$('bExperienceReset').onclick=()=>{this.values={...this.defaults};this.set('fov',68);};
    const volume=UI.$('blueVolume'),input=volume?.oninput;
    if(volume)volume.oninput=e=>{input?.call(volume,e);MenuScene.volume=Sound.volume;MenuScene.save();UI.$('menuVolume').value=volume.value;UI.$('menuVolumeValue').textContent=volume.value+' %';};
    window.addEventListener('keydown',e=>{
      if(Game.state!=='experienceOptions')return;
      if(e.code==='Escape'){e.preventDefault();this.close();}
      if(e.code==='Tab'){
        const nodes=[...panel.querySelectorAll('input,select,button')].filter(n=>!n.disabled),i=nodes.indexOf(document.activeElement);
        if((e.shiftKey&&i<=0)||(!e.shiftKey&&i===nodes.length-1)){e.preventDefault();nodes[e.shiftKey?nodes.length-1:0].focus();}
      }
      e.stopImmediatePropagation();
    },true);
    this.refresh();
  }
};
(()=>{
  const init=Game.init;Game.init=function(){init.call(this);ExperienceSettings.init();};
  const screen=UI.screen;UI.screen=function(name){const result=screen.call(this,name);ExperienceSettings.panel?.classList.toggle('hidden',name!=='experienceOptions');if(name==='experienceOptions')UI.$('hud').classList.add('hidden');return result;};
  const render=Game.render;Game.render=function(){
    ExperienceSettings.apply();const shake=this.cam.shake;this.cam.shake=shake*ExperienceSettings.shakeFactor();
    try{return render.call(this);}finally{this.cam.shake=shake;}
  };
  const pose=POVCameraMotion.pose;POVCameraMotion.pose=function(g=Game){const value=pose.call(this,g);value.y*=ExperienceSettings.values.sway/100;value.roll*=ExperienceSettings.values.sway/100;return value;};
})();
