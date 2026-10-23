// Percepción exclusiva del POV: frente amplio, cercanía, memoria breve y oclusión física.
const POVPerception = {
  active(g){return typeof FirstPerson!=='undefined'&&FirstPerson.active(g);},
  blind(e){return e.type==='wx_listener'||e.type==='cl_blind'||e.def?.detect===0;},
  line(e,p){
    const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),steps=Math.ceil(d/6);
    for(let i=1;i<steps;i++){
      const x=Math.floor((e.x+dx*i/steps)/TILE),y=Math.floor((e.y+dy*i/steps)/TILE),v=Level.grid[y]?.[x];
      if(v===0)continue;
      if(v===4&&FirstPersonRenderer.propHeight(Level.props[x+','+y]||'crate')<36)continue;
      return false;
    }
    return true;
  },
  sees(e,g){
    const p=g.player,d=Math.hypot(p.x-e.x,p.y-e.y);
    if(e.dead||e.dormant||this.blind(e)||p.hidden||g.story?.restrained)return false;
    if((WorksMap.is(g)&&WorksMap.safe(p))||(CastleMap.is(g)&&CastleMap.safe(p,g))||(EndMap.is(g)&&EndMap.safe(p,g)))return false;
    if(Specializations.concealed(p)&&d>90)return false;
    const range=e.def?.latent?Math.min(150,e.def.detect):Math.max(260,Math.min(360,e.def?.detect||260));
    if(d>(e.alert||e.memory>0?Math.min(400,range+40):range))return false;
    const a=Math.atan2(p.y-e.y,p.x-e.x)-(e.face||0),angle=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
    // A menos de tres casillas no puede ignorarte; más lejos debe mirarte.
    if(d>96 && !e.alert && !(e.memory>0) && angle>(d<180?1.75:1.18))return false;
    return this.line(e,p);
  },
  notice(e,g,dt){
    const visible=this.sees(e,g),d=Math.hypot(g.player.x-e.x,g.player.y-e.y);
    e.povNotice=visible?Math.min(1,(e.povNotice||0)+dt/(d<96?.08:.18)):0;
    if(visible&&e.povNotice>=1){e.povMemory=2.5;return true;}
    e.povMemory=Math.max(0,(e.povMemory||0)-dt);return false;
  }
};
(()=>{
  const hurt=Enemy.prototype.hurt;Enemy.prototype.hurt=function(d,a,g,...rest){const hp=this.hp,result=hurt.call(this,d,a,g,...rest);if(POVPerception.active(g)&&this.hp<hp&&!POVPerception.blind(this)){this.povMemory=2.5;this.face=Math.atan2(g.player.y-this.y,g.player.x-this.x);}return result;};
})();
