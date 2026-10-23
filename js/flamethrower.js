// FL-4: combustible por pulsos, recarga por tanque y quemado breve sin acumulación.
const Flamethrower = {
  id: 'flamethrower',
  ammo: 'am_fuel',
  burnSeconds: 3,
  burnDps: 1.8,
  damage(g, e, amount, angle) {
    if (e.dead || e.dormant || (e.isBoss && e.active === false)) return 0;
    const before = {hp:e.hp, x:e.x, y:e.y, stagger:e.stagger, windup:e.windup};
    e.hurt(amount, angle, g);
    // El chorro no encadena aturdimientos ni empuja: la criatura puede contraatacar.
    if (!e.isBoss && !e.dead) {
      e.x=before.x; e.y=before.y; e.stagger=before.stagger; e.windup=before.windup;
    }
    return Math.max(0, before.hp-e.hp);
  },
  fire(g, p, w) {
    if (g.state !== 'play' || !p.weapon || p.weapon.mag <= 0 || p.reloading > 0) return false;
    const cost = Weapons.staminaCost(g,p,w);
    if (p.stamina < cost) {p.fireCd=.2; return false;}
    p.weapon.mag--; p.fireCd=w.rate;
    p.stamina=Math.max(0,p.stamina-cost); p.exertion=1.1; p.flash=.08;
    const damage=w.dmg*(1+.3*(p.mods.pow||0))*(1+g.mut.mod('gun'));
    const targets=g.enemies.filter(e=> {
      if(e.dead||e.dormant||(e.isBoss&&e.active===false))return false;
      const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
      const a=Math.atan2(dy,dx)-p.angle,delta=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
      return d-e.r<=w.range&&delta<=.21+Math.asin(Math.min(1,e.r/Math.max(1,d)))&&Level.los(p.x,p.y,e.x,e.y);
    }).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,3);
    for(const e of targets) {
      if(this.damage(g,e,damage*(e.isBoss?.7:1),p.angle)>0&&!e.dead) {
        e.flameBurn={left:this.burnSeconds,pending:e.flameBurn?.pending||0,dps:this.burnDps*(e.isBoss?.5:1)*(1+.1*Workshop.rank(g,this.id,'damage'))};
      }
    }
    const jets=g.flameJets||(g.flameJets=[]);
    for(let j=0;j<4;j++) {
      const a=p.angle+(Math.random()-.5)*w.spread,ray=Math.max(10,w.range-8),step=5;
      let distance=16;
      while(distance<ray&&!Level.solid(p.x+Math.cos(a)*distance,p.y+Math.sin(a)*distance))distance+=step;
      jets.push({x:p.x,y:p.y,a,reach:Math.max(10,distance-step),life:.23,max:.23,seed:Math.random()});
    }
    if(jets.length>80)jets.splice(0,jets.length-80);
    Sound.noise(.13,.12,800);
    return true;
  },
  tick(g,dt) {
    if(g.state!=='play')return;
    for(const j of g.flameJets||[])j.life-=dt;
    g.flameJets=(g.flameJets||[]).filter(j=>j.life>0);
    if(!isR2lvl(g.lvl))return;
    for(const e of g.enemies) {
      const burn=e.flameBurn;
      if(!burn||e.dead)continue;
      const elapsed=Math.min(dt,Math.max(0,burn.left));
      burn.left=Math.max(0,burn.left-elapsed);
      // Se respeta la tregua de una mutación; no se salta ninguna fase con daño residual.
      burn.pending=(burn.pending||0)+elapsed;
      if(burn.pending>=.5||burn.left<=0){if(!['intro','mutate'].includes(e.mode))this.damage(g,e,burn.dps*burn.pending,e.face||0);burn.pending=0;}
      if(burn.left<=0)e.flameBurn=null;
    }
  },
  migrateSave(save) {
    if(!save||!isR2lvl(save.lvl))return save;
    const sv=JSON.parse(JSON.stringify(save));
    const levels=sv.story?.workshop?.levels||{},old=levels.launcher||{};
    const rank=Math.max(0,Math.min(3,Number(old.capacity)||0));
    const newRank=levels.flamethrower?.capacity??rank;
    const capacity=80+15*newRank+4*(Number(sv.mods?.mag)||0);
    const convert=it=>{
      if(!it)return;
      if(it.type==='w_launcher'||it.id==='launcher'&&it.type?.startsWith('w_')) {
        const fraction=Math.max(0,Math.min(1,(Number(it.mag)||0)/(1+rank)));
        it.type='w_flamethrower';it.id=this.id;it.mag=Math.floor(fraction*capacity);
      }
      if(it.type==='am_grenade')it.type=this.ammo;
      if(it.type==='grenade')it.type='fuel';
      if(it.carry)convert(it.carry);
    };
    for(const it of [...(sv.inv?.items||[]),...(sv.stash||[]),...(sv.drops||[])])convert(it);
    if(sv.cur==='launcher')sv.cur=this.id;
    if(levels.launcher){levels.flamethrower||={...old};delete levels.launcher;}
    return sv;
  },
  draw(g) {
    if(!isR2lvl(g.lvl)||!HorrorVision.polygon.length)return;
    const c=g.ctx;c.save();c.beginPath();
    c.moveTo(HorrorVision.polygon[0][0]-g.cam.x,HorrorVision.polygon[0][1]-g.cam.y);
    for(const [x,y]of HorrorVision.polygon)c.lineTo(x-g.cam.x,y-g.cam.y);
    c.closePath();c.clip();c.translate(-g.cam.x,-g.cam.y);
    for(const j of g.flameJets||[]) {
      const age=1-j.life/j.max,end=Math.min(j.reach,35+age*600);
      c.save();c.translate(j.x,j.y);c.rotate(j.a);c.globalAlpha=Math.min(1,j.life/.07)*.75;
      const grad=c.createLinearGradient(13,0,Math.max(14,end),0);
      grad.addColorStop(0,'#c8d9ba');grad.addColorStop(.2,'#f5c37e');grad.addColorStop(.6,'#df7b40');grad.addColorStop(1,'#9d3b2d00');
      c.fillStyle=grad;c.beginPath();c.moveTo(14,-2);c.quadraticCurveTo(end*.65,-8-age*8,end,Math.sin(j.seed*20)*8);c.quadraticCurveTo(end*.65,8+age*8,14,2);c.fill();c.restore();
    }
    for(const e of g.enemies)if(!e.dead&&e.flameBurn?.left>0) {
      c.save();c.translate(e.x,e.y);c.globalAlpha=.65;
      for(let j=0;j<3;j++){const a=g.t*3+j*2.1,r=e.r*.7;c.fillStyle=j%2?'#e6bb77':'#c66b45';c.beginPath();c.ellipse(Math.cos(a)*r,Math.sin(a)*r-3,2,4,Math.sin(a),0,6.283);c.fill();}
      c.restore();
    }
    c.restore();
  },
};
WEAPONS.flamethrower={name:'Lanzallamas FL-4',mag:80,dmg:2.3,rate:.1,spread:.18,recoil:.15,reload:2.8,range:170,pellets:1,auto:true,stam:2.7,reserveMax:8,flame:true};
ITEMS.w_flamethrower={name:'Lanzallamas FL-4',short:'FL-4',color:'#b39466',w:3,h:2,use:false,desc:'Mantén clic para un chorro continuo de alcance corto. Quemado leve, sin acumulación. Tecla 5. R cambia un tanque completo y descarta el combustible restante.'};
ITEMS.am_fuel={name:'Tanque de combustible',short:'Tanque FL',color:'#bc945f',w:1,h:1,use:false,cap:4,desc:'Un tanque repone el depósito del FL-4. R consume uno completo; el combustible restante se descarta. Se fabrica en Construcción y se apila hasta 4.'};
AMMO.flamethrower='am_fuel';
DeskRecipes.flamethrower={cost:{screw_large:2,powder_large:3},ammo:'am_fuel',count:1,label:'1 tanque de combustible FL-4',group:'munición'};
Workshop.weaponIds=Workshop.weaponIds.map(id=>id==='launcher'?'flamethrower':id);
Workshop.attachments.flamethrower={id:'flame_nozzle',name:'Boquilla térmica FL-4',desc:'Boquilla térmica integrada.'};
WeaponGlyphs.paths.flamethrower='<path fill="#77877b" d="M15 44h142v24H68L56 99H35l9-31H15z"/><path fill="#b1a281" d="M23 35h93v16H23zM145 42h36v29h-36z"/><path fill="#a17a4d" d="M76 69h33v41H76z"/><path fill="none" d="M84 69V57m17 12V57M89 110q-1 16 29 11t17-52M20 34V24h26v11M173 47h17v19h-17"/><path fill="#dfb56e" d="M187 54l6-6-2 10 7-2-6 9-7-5z"/>';
(() => {
  const effective=Workshop.effective;
  Workshop.effective=function(g,p,id){const w=effective.call(this,g,p,id);return id==='flamethrower'?{...w,range:w.range+10*this.rank(g,id,'precision')}:w;};
  const mag=Weapons.magSize;
  Weapons.magSize=function(p,w){return w.flame?w.mag+15*Workshop.rank(Game,'flamethrower','capacity')+4*(p.mods.mag||0):mag.call(this,p,w);};
  const reload=Weapons.reload;
  Weapons.reload=function(p){if(p.weapon?.id!=='flamethrower')return reload.call(this,p);
    const w=this.effective(p,'flamethrower');if(p.reloading>0||p.weapon.mag>=this.magSize(p,w)||Game.inv.reserve('flamethrower')<1)return false;
    p.reloading=w.reload*(p.focus>0?.7:1)*(1-Math.min(.5,Game.mut.mod('reload')));p.flameReloadWeapon=p.weapon;Sound.play('reload');return true;
  };
  const finish=Weapons.finishReload;
  Weapons.finishReload=function(p){if(p.weapon?.id!=='flamethrower')return finish.call(this,p);
    if(p.flameReloadWeapon!==p.weapon||p.reloading>0)return false;
    p.flameReloadWeapon=null;
    if(Game.inv.takeAmmo('flamethrower',1)!==1)return false;
    p.weapon.mag=this.magSize(p,this.effective(p,'flamethrower'));return true;
  };
  const start=Game.start;
  Game.start=function(load,sv){
    if(load&&!sv){sv=this.getSaveSlots().find(Boolean)||null;if(!sv){try{sv=JSON.parse(localStorage.getItem(SAVE_KEY));}catch{}}}
    return start.call(this,load,Flamethrower.migrateSave(sv));
  };
  const build=Hospital.buildLevel;
  Hospital.buildLevel=function(g,...args){g.flameJets=[];return build.call(this,g,...args);};
  const update=Game.update;
  Game.update=function(dt){update.call(this,dt);Flamethrower.tick(this,dt);};
  const render=Game.render;
  Game.render=function(){render.call(this);Flamethrower.draw(this);};
  const take=Game.take;
  Game.take=function(it){
    if(it?.type!=='fuel')return take.call(this,it);
    const n=it.amount||it.count||1,got=this.inv.addAmmo('am_fuel',n);
    if(!got)return UI.msg('Sin espacio para el tanque. Haz sitio o usa el baúl.',3500);
    if(got<n){it.amount=n-got;return UI.msg('Recogiste '+got+' tanque(s); el resto sigue aquí.');}
    this.picked.add(it.id);this.items=this.items.filter(i=>i!==it);Sound.play('pickup');UI.msg('Combustible FL-4 · +'+got+' tanque(s).');
  };
  const label=itemLabel;
  itemLabel=function(it){return it.type==='fuel'?'Recoger tanque de combustible':label(it);};
  const icon=DeskIcons.svg;
  DeskIcons.svg=function(t){return t==='am_fuel'?'<svg class="item-glyph" viewBox="0 0 64 64"><g stroke="#d1c3a1" stroke-width="2"><path d="M23 12h18v8H23z" fill="#41594f"/><rect x="17" y="20" width="30" height="38" rx="8" fill="#a38353"/><path d="M17 32h30M17 48h30M41 16h12v25" fill="none"/><path d="M31 29l-7 12 9-3-2 11 9-15-9 3z" fill="#e3c07c"/></g></svg>':icon.call(this,t);};
  const drawItem=Game.drawItem;
  Game.drawItem=function(c,it){if(it.type!=='fuel')return drawItem.call(this,c,it);c.save();c.translate(it.x,it.y);c.fillStyle='#9c7b4d';c.strokeStyle='#d3bc86';c.lineWidth=1.5;c.beginPath();c.roundRect(-8,-10,16,23,5);c.fill();c.stroke();c.fillStyle='#617365';c.fillRect(-4,-15,8,6);c.strokeStyle='#d7c799';c.beginPath();c.moveTo(-8,-3);c.lineTo(8,-3);c.moveTo(-8,6);c.lineTo(8,6);c.stroke();c.restore();};
  const monitor=WeaponMonitor.update;
  WeaponMonitor.update=function(g){monitor.call(this,g);if(g.player.weapon?.id==='flamethrower'&&g.player.predator<=0){const n=g.inv.reserve('flamethrower');UI.$('weaponReserve').textContent=n+' TANQUE'+(n===1?'':'S')+' · COMBUSTIBLE';UI.$('weaponReload').textContent=g.player.reloading>0?'CAMBIANDO TANQUE':g.player.weapon.mag===0?'R · CAMBIAR TANQUE':'';}};
  const bench=Workshop.render;
  Workshop.render=function(g,id){bench.call(this,g,id);if(id!=='flamethrower')return;
    const w=Weapons.effective(g.player,id),detail=UI.$('benchDetail');
    const hero=detail.querySelector('.bench-hero p');if(hero)hero.textContent='Chorro '+Math.round(w.dmg/w.rate)+' daño/s · Alcance corto · '+Weapons.magSize(g.player,w)+' de combustible por tanque · Quemado leve';
    detail.querySelector('.bench-attachment')?.classList.add('hidden');
    for(const [stat,title,desc]of [['effort','Aguante','−8 % de estamina por nivel mientras mantienes el chorro.'],['precision','Control del chorro','+10 de alcance por nivel y menor dispersión visual.'],['capacity','Depósito','+15 de combustible por tanque y nivel. La mejora no rellena el depósito.']]){
      const card=detail.querySelector('[data-upgrade="'+stat+'"]')?.parentNode;if(!card)continue;const h=card.querySelector('h4'),p=card.querySelector('p');if(h)h.textContent=title;if(p)p.textContent=desc;
    }
  };
})();
