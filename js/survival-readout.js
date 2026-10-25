// Información de supervivencia en tiempo real; refleja las reglas, nunca concede recursos.
const SurvivalReadout={
  signature:'',nodes:new Map(),
  skill(g,id){
    const s=SKILLS[id],p=g.player,m=g.mut,human=s.resource==='stamina',field=human?'stamina':'energy';
    let cost=Number(s.energy)||0;
    if(!human&&p.over>0)cost*=.5;
    if(s.resource==='energy'&&m.has('gold_catalyst'))cost*=SkillBalance.value(g,'gold_catalyst',.88);
    const cooldown=Math.max(0,m.cd[id]||0);
    let blocked=p.hidden?'OCULTO':p[field]<cost?'SIN '+(human?'ESTAMINA':'RIUTEX'):'';
    if(id==='respiracion'&&['KeyW','KeyA','KeyS','KeyD'].some(k=>g.keys[k]))blocked='DETENTE';
    if(id==='trueque'&&p.hp<=13)blocked='SALUD BAJA';
    if(id==='camuflaje'&&!Specializations.inShadow(p))blocked='BUSCA SOMBRA';
    return {id,name:s.name,key:g.keyName(m.bindings[id]),human,cost,cooldown,
      state:cooldown>0?'cooldown':blocked?'blocked':'ready',
      label:cooldown>0?(Math.ceil(cooldown*10)/10).toFixed(1)+' s':blocked||'LISTA',
      fraction:cooldown>0?Math.max(0,1-cooldown/Math.max(cooldown,s.cd||1)):1};
  },
  snapshot(g=Game){
    if(!g.player||!g.mut||!isR2lvl(g.lvl))return null;
    const p=g.player,ids=Object.keys(g.mut.bindings||{}).filter(id=>g.mut.has(id)&&SKILLS[id]?.type==='active'&&g.mut.bindings[id]);
    const eq=ids.indexOf(g.mut.equipped);if(eq>0)ids.unshift(ids.splice(eq,1)[0]);
    const skills=g.mut.tutorial?ids.slice(0,5).map(id=>this.skill(g,id)):[];
    const weapon=p.predator>0?null:p.weapon,w=weapon&&Weapons.effective(p,weapon.id);
    const effort=w?Weapons.staminaCost(g,p,w):0;
    const total=Math.max(p.reloading||0,p.reloadDuration||w?.reload||1),remaining=Math.max(0,p.reloading||0);
    return {skills,extra:Math.max(0,ids.length-skills.length),reload:remaining>0?{remaining,fraction:Math.max(0,Math.min(1,1-remaining/total))}:null,
      effort:Math.ceil(effort*10)/10,hasWeapon:!!w,flame:!!w?.flame,exhausted:!!w&&p.stamina<effort,
      poison:Math.max(0,p.poison||0),resist:Math.max(0,p.resist||0),hidden:!!p.hidden,tired:!!p.tired};
  },
  init(){
    if(typeof HTMLCanvasElement==='undefined'||this.root)return;
    const root=document.createElement('section');root.id='survivalReadout';root.setAttribute('aria-label','Habilidades y estado');
    root.innerHTML='<div id="survivalConditions"></div><div id="abilityDock"></div>';UI.$('hud').appendChild(root);this.root=root;
    const progress=document.createElement('div');progress.id='reloadReadout';progress.innerHTML='<span id="reloadCountdown"></span><div class="reload-track"><i></i></div>';
    UI.$('weaponHUD').appendChild(progress);
    const effort=document.createElement('span');effort.id='weaponEffort';UI.$('weaponHUD').appendChild(effort);
  },
  text(el,value){if(el.textContent!==value)el.textContent=value;},
  layout(count){
    const scale=ExperienceSettings.values.hud/100,key=[innerWidth,innerHeight,scale,count].join(':');
    if(this.layoutKey===key)return;this.layoutKey=key;
    if(innerWidth<=640){this.root.style.left='';this.root.style.maxWidth='';return;}
    const vital=document.querySelector('#hud .clinical-bars')?.getBoundingClientRect(),weapon=UI.$('weaponHUD')?.getBoundingClientRect();
    if(!vital||!weapon)return;
    const gap=Math.max(140,weapon.left-vital.right-26);
    this.root.style.left=(vital.right+weapon.left)/2+'px';this.root.style.maxWidth=Math.floor(gap/scale)+'px';
  },
  render(g=Game){
    if(!this.root)return;
    const visible=g.state==='play'&&isR2lvl(g.lvl);this.root.hidden=!visible;
    const v=this.snapshot(g);if(!v)return;
    const sig=v.skills.map(s=>[s.id,s.key,s.name].join(':')).join('|')+'|'+v.extra;
    if(sig!==this.signature){
      this.signature=sig;this.nodes.clear();const dock=UI.$('abilityDock');dock.replaceChildren();
      for(const s of v.skills){
        const node=document.createElement('div');node.className='ability-chip '+(s.human?'human':'mutant');node.dataset.ability=s.id;
        const key=document.createElement('kbd');key.textContent=s.key;
        const name=document.createElement('strong');name.textContent=s.name;
        const status=document.createElement('span'),cost=document.createElement('small'),bar=document.createElement('i');
        node.append(key,name,status,cost,bar);dock.appendChild(node);this.nodes.set(s.id,{node,status,cost,bar});
      }
      if(v.extra){const extra=document.createElement('span');extra.className='ability-extra';extra.textContent='K · +'+v.extra+' poderes';dock.appendChild(extra);}
    }
    for(const s of v.skills){const n=this.nodes.get(s.id);n.node.dataset.state=s.state;this.text(n.status,s.label);this.text(n.cost,(Math.round(s.cost*10)/10)+' '+(s.human?'EST':'RTX'));n.bar.style.transform='scaleX('+s.fraction+')';n.node.setAttribute('aria-label',s.key+', '+s.name+', '+s.label+', coste '+s.cost+' '+(s.human?'estamina':'Riutex'));}
    if(visible)this.layout(v.skills.length);else this.layoutKey='';
    const conditions=[];
    if(v.hidden)conditions.push('OCULTO · E para salir');
    if(v.poison>0)conditions.push('VENENO · '+Math.ceil(v.poison)+' s');
    else if(v.resist>0)conditions.push('RESISTENCIA · '+Math.ceil(v.resist)+' s');
    if(v.tired)conditions.push('AGOTADO · recupera el aliento');
    this.text(UI.$('survivalConditions'),conditions.join(' / '));UI.$('survivalConditions').hidden=!conditions.length;
    const reload=UI.$('reloadReadout');reload.hidden=!v.reload||!visible;
    if(v.reload){this.text(UI.$('reloadCountdown'),'RECARGA · '+v.reload.remaining.toFixed(1)+' s');reload.querySelector('i').style.transform='scaleX('+v.reload.fraction+')';}
    const effort=UI.$('weaponEffort');effort.hidden=!v.hasWeapon||!visible;
    this.text(effort,v.exhausted?'SIN ALIENTO PARA DISPARAR':v.effort+' EST / '+(v.flame?'PULSO':'DISPARO'));effort.classList.toggle('exhausted',v.exhausted);
    // Los nombres y teclas ya están en el dock; la zona del arma conserva solo la inyección.
    const selected=g.inv.selItem();this.text(UI.$('equipmentHints'),'[F] '+(selected&&ITEMS[selected.type].use?ITEMS[selected.type].short:'inyección · TAB para elegir'));
  }
};
(()=>{
  const init=Game.init;Game.init=function(){init.call(this);SurvivalReadout.init();};
  const render=Game.render;Game.render=function(){const result=render.call(this);SurvivalReadout.render(this);return result;};
  const screen=UI.screen;UI.screen=function(name){const result=screen.call(this,name);if(name&&SurvivalReadout.root)SurvivalReadout.root.hidden=true;return result;};
})();
