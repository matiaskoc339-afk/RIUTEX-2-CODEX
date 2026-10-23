// El traje es equipo persistente, independiente del maletín y de las curas.
const ProtectionSuit={
 data(g=Game){const q=Works.data(g);return q.suit||(q.suit={owned:false,hp:0,levels:{protection:0,durability:0,poison:0}});},
 max(g=Game){return 90+30*(this.data(g).levels.durability||0);},
 intact(g=Game){const s=this.data(g);return s.owned&&s.hp>0;},
 acquire(g){const s=this.data(g);if(s.owned)return false;s.owned=true;s.hp=this.max(g);if(!g.inv.keys.includes('ds_suit'))g.inv.keys.push('ds_suit');return true;},
 absorb(g,dmg){if(!isR2lvl(g.lvl)||!this.intact(g)||dmg<=0)return dmg;const s=this.data(g),factor=1-(.15+.08*(s.levels.protection||0)),blocked=Math.min(dmg,s.hp/factor);s.hp=Math.max(0,s.hp-blocked*factor);g.player.cloak=0;return Math.max(0,dmg-blocked);},
 poisonFactor(g=Game){return this.intact(g)?Math.max(.3,.7-.12*(this.data(g).levels.poison||0)):1;},
 poisonDamage(g=Game){return this.intact(g)?Math.max(.35,.75-.12*(this.data(g).levels.poison||0)):1;},
 repairCost(g){const missing=Math.max(0,this.max(g)-this.data(g).hp);return {screw_small:Math.ceil(missing/30),powder_small:Math.ceil(missing/60)};},
 transact(g,stat){
  const s=this.data(g);if(g.state!=='workbench'||!Workshop.powered(g)||!s.owned)return {ok:false,msg:'Recupera el traje y utiliza un banco de armero con corriente.'};
  if(!['repair','protection','durability','poison'].includes(stat))return {ok:false,msg:'Ajuste desconocido.'};
  const n=s.levels[stat]||0;if(stat==='repair'?s.hp>=this.max(g):n>=3)return {ok:false,msg:stat==='repair'?'El traje ya está íntegro.':'Mejora al máximo.'};
  const cost=stat==='repair'?this.repairCost(g):Workshop.cost(n);
  if(Object.entries(cost).some(([t,k])=>FieldDesk.count(g.inv,t)<k))return {ok:false,msg:'Faltan materiales en el maletín.'};
  FieldDesk.consume(g.inv,cost);if(stat==='repair')s.hp=this.max(g);else s.levels[stat]=n+1;
  Workshop.render(g,'suit');Hospital.checkpoint(g);Sound.play('pickup');return {ok:true,msg:stat==='repair'?'Capa S-4 reparada.':'Mejora instalada. Ampliar el traje no repara su desgaste.'};
 },
 nav(g,id){const b=document.createElement('button');b.className='bench-weapon'+(id==='suit'?' active':'');b.dataset.benchWeapon='suit';b.innerHTML=this.icon()+'<span>Protección S-4<small>'+(this.data(g).owned?'EQUIPO / '+Math.ceil(this.data(g).hp)+' · '+this.max(g):'POR RECUPERAR')+'</small></span>';b.onclick=()=>Workshop.render(g,'suit');UI.$('benchWeapons').appendChild(b);},
 icon(){return '<svg class="item-glyph" viewBox="0 0 64 64"><path d="M23 7h18l7 10 10 5-6 15-8-4v25H20V33l-8 4-6-15 10-5Z" fill="#62796e" stroke="#c5ceb2" stroke-width="2"/><path d="M25 8v10h14V8M23 25h18v22H23Z" fill="#273d37" stroke="#b8ab7c"/><path d="M32 27v17M26 35h12" stroke="#d9c48e" stroke-width="2"/></svg>';},
 render(g){
  Workshop.selected='suit';const s=this.data(g),box=UI.$('benchDetail');
  box.innerHTML='<div class="bench-hero">'+this.icon()+'<div><span class="eyebrow">DEFENSA PERSONAL / EQUIPO INTEGRADO</span><h3>Protección S-4</h3><p>Capa '+Math.ceil(s.hp)+' / '+this.max(g)+' · Solo se restaura reparando.</p></div></div><p>Absorbe los golpes hasta romperse. Reduce la acumulación y el daño del veneno mientras conserve capa. Las inyecciones, el descanso y las mejoras de capacidad no reparan el traje.</p><div class="bench-upgrades">'+Object.entries({protection:['Protección','−8 puntos porcentuales de desgaste por nivel. Base: −15 %.'],durability:['Durabilidad','+30 puntos de capacidad por nivel. Conserva el desgaste actual.'],poison:['Resistencia al veneno','Reduce exposición y daño del veneno en cada nivel. No da inmunidad.'],repair:['Reparar capa','Restaura toda la barra gastada a cambio de materiales.']}).map(([stat,[name,desc]])=>{const n=s.levels[stat]||0,cost=stat==='repair'?this.repairCost(g):Workshop.cost(n),err=!s.owned?'Traje no recuperado':!Workshop.powered(g)?'Sin corriente':stat==='repair'&&s.hp>=this.max(g)?'Capa íntegra':stat!=='repair'&&n>=3?'Máximo alcanzado':Object.entries(cost).some(([t,k])=>FieldDesk.count(g.inv,t)<k)?'Faltan materiales':'';return '<div class="bench-upgrade"><h4>'+name+(stat==='repair'?'':' · '+n+' / 3')+'</h4><p>'+desc+'</p><ul>'+Object.entries(cost).map(([t,k])=>'<li>'+ITEMS[t].name+' <b>'+FieldDesk.count(g.inv,t)+' / '+k+'</b></li>').join('')+'</ul><button data-suit="'+stat+'" '+(err?'disabled':'')+'>'+(err||(stat==='repair'?'Reparar':'Instalar nivel '+(n+1)))+'</button></div>';}).join('')+'</div>';
  box.querySelectorAll('[data-suit]').forEach(b=>b.onclick=()=>{const r=this.transact(g,b.dataset.suit);UI.$('benchFeedback').textContent=r.msg;});
 },
 hud(g){const el=UI.$('suitHud'),s=this.data(g);el.classList.toggle('hidden',!s.owned||!isR2lvl(g.lvl)||g.state==='menu');if(s.owned){el.classList.toggle('broken',s.hp<=0);el.innerHTML='<span>S-4 / '+(s.hp>0?'CAPA PROTECTORA':'ROTO · REPARA EN EL ARMERO')+'</span><div><i style="width:'+Math.max(0,s.hp/this.max(g)*100)+'%"></i></div><small>'+Math.ceil(s.hp)+' / '+this.max(g)+' · '+(s.hp>0?'FILTRADO ACTIVO':'SIN FILTRADO')+'</small>';}}
};
WEAPONS.launcher={...WEAPONS.launcher,name:'Lanzagranadas LG-4',dmg:180,stam:36};
Object.assign(ITEMS.w_launcher,{name:'Lanzagranadas LG-4',short:'LG-4',desc:'Arma opcional del muelle. Tecla 5. Explosión de área: mantén distancia. Munición fabricable en Construcción.'});
Workshop.weaponIds.push('launcher');
Workshop.attachments.launcher={id:'ds_launcher_stock',name:'Montaje LG-4',desc:'Montaje industrial del lanzagranadas.'};
(() => {
 const poison=Player.prototype.addPoison;Player.prototype.addPoison=function(s){return poison.call(this,s*ProtectionSuit.poisonFactor(Game));};
 const render=Workshop.render;Workshop.render=function(g,id){if(id==='suit'){render.call(this,g,'pistol');ProtectionSuit.nav(g,id);UI.$('benchWeapons').querySelectorAll('[data-bench-weapon]').forEach(b=>b.classList.toggle('active',b.dataset.benchWeapon===id));return ProtectionSuit.render(g);}render.call(this,g,id);ProtectionSuit.nav(g,id);};
 const bonus=Workshop.magBonus;Workshop.magBonus=function(g,id){return id==='launcher'?this.rank(g,id,'capacity'):bonus.call(this,g,id);};
 const init=Game.init;Game.init=function(){init.call(this);const el=document.createElement('div');el.id='suitHud';el.className='hidden';const bars=UI.$('hud').querySelector('.clinical-bars');bars.appendChild(el);bars.appendChild(UI.$('hint'));};
 const draw=Game.render;Game.render=function(){draw.call(this);ProtectionSuit.hud(this);};
 const pdraw=Player.prototype.draw;Player.prototype.draw=function(c){pdraw.call(this,c);if(!ProtectionSuit.data().owned||!isR2())return;c.save();c.translate(this.x,this.y);c.rotate(this.angle);c.strokeStyle=ProtectionSuit.intact()?'#c8c3a3':'#705b4a';c.lineWidth=2;c.strokeRect(-6,-8,11,16);c.fillStyle='#435f53';c.fillRect(-8,-7,4,14);c.restore();};
})();
