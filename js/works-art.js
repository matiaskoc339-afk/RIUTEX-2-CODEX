// Acero, vertidos y hormigón húmedo. Las salas conservan la niebla de exploración.
const WorksArt = {
 glyph(c,kind,size=12){
  c.save();c.lineWidth=2;c.strokeStyle='#e2d5ac';c.fillStyle='#657f89';
  if(kind==='drop'){c.beginPath();c.moveTo(0,-size);c.bezierCurveTo(-size,size*.2,-size,size,0,size);c.bezierCurveTo(size,size,size,size*.2,0,-size);c.fill();c.stroke();}
  if(kind==='paw'){c.beginPath();c.ellipse(0,4,size*.6,size*.5,0,0,6.283);c.fill();c.stroke();for(const [x,y]of [[-9,-5],[-3,-10],[4,-10],[10,-4]]){c.beginPath();c.ellipse(x,y,3,4,0,0,6.283);c.fill();c.stroke();}}
  if(kind==='sun'){c.beginPath();c.arc(0,0,size*.55,0,6.283);c.fill();c.stroke();for(let j=0;j<8;j++){const a=j*.785;c.beginPath();c.moveTo(Math.cos(a)*size*.8,Math.sin(a)*size*.8);c.lineTo(Math.cos(a)*size*1.2,Math.sin(a)*size*1.2);c.stroke();}}
  c.restore();
 },
 valve(c,color){c.strokeStyle=color;c.lineWidth=4;c.beginPath();c.arc(0,0,13,0,6.283);c.stroke();for(let j=0;j<6;j++){const a=j*Math.PI/3;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*13,Math.sin(a)*13);c.stroke();}c.fillStyle='#b0b2a0';c.beginPath();c.arc(0,0,4,0,6.283);c.fill();},
 item(c,it){
  c.save();c.translate(it.x,it.y);const type=it.type;
  if(type==='wx_valve'){c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(0,6,19,11,0,0,6.283);c.fill();this.valve(c,{wx_valve_a:'#7ab3d0',wx_valve_b:'#d8b569',wx_valve_c:'#9ec29a'}[it.id]);}
  else if(type==='wx_plate'){c.fillStyle='#353e3c';c.fillRect(-21,-18,42,36);c.strokeStyle='#8c8c72';c.lineWidth=3;c.strokeRect(-21,-18,42,36);this.glyph(c,it.id.split('_').at(-1));}
  else if(type==='wx_radio'){c.fillStyle='#454e41';c.fillRect(-9,-13,18,25);c.fillStyle='#18231e';c.fillRect(-6,-9,12,6);c.fillStyle='#c2b98a';c.fillRect(-5,-7,5,2);c.strokeStyle='#aeaa8f';c.lineWidth=2;c.beginPath();c.moveTo(5,-12);c.lineTo(9,-29);c.stroke();for(let j=0;j<4;j++)c.fillRect(-5,-1+j*3,10,1);}
  else if(type==='wx_part'){c.fillStyle='#6a7974';c.fillRect(-11,-8,22,17);c.strokeStyle='#c7c1a3';c.lineWidth=2;c.strokeRect(-11,-8,22,17);c.fillStyle='#cca96b';c.fillRect(-5,-4,10,8);}
  else if(type==='wx_return'||type==='wx_pit'||type==='wx_exit'){c.fillStyle='#252d30';c.fillRect(-18,-17,36,34);c.strokeStyle='#aaa58c';c.lineWidth=2;for(let j=0;j<5;j++){c.beginPath();c.moveTo(-14,-11+j*6);c.lineTo(14,-11+j*6);c.stroke();}c.fillStyle='#c6b780';c.beginPath();c.moveTo(0,-13);c.lineTo(-5,-6);c.lineTo(5,-6);c.fill();}
  else if(type==='wx_puzzle'||type==='wx_main'){c.fillStyle='#394743';c.fillRect(-18,-16,36,32);c.strokeStyle='#8f9a88';c.lineWidth=2;c.strokeRect(-18,-16,36,32);c.fillStyle='#172b28';c.fillRect(-13,-11,26,12);c.fillStyle='#b6c297';for(let j=0;j<3;j++)c.fillRect(-11+j*9,5,5,5);if(it.id==='wx_gears')this.valve(c,'#b7a680');}
  else if(type==='wx_wash'){c.strokeStyle='#8aada7';c.lineWidth=3;c.beginPath();c.moveTo(-8,15);c.lineTo(-8,-15);c.lineTo(8,-15);c.stroke();c.fillStyle='#b3bcac';c.fillRect(2,-14,11,4);c.fillStyle='#8caba4';for(let j=0;j<3;j++)c.fillRect(4+j*3,-3+j*2,1,10);}
  else {c.fillStyle=type==='wx_reward'?'#887e59':'#4c6257';c.fillRect(-15,-10,30,20);c.strokeStyle='#c1bea3';c.strokeRect(-15,-10,30,20);c.fillStyle='#c5be96';c.fillRect(-3,-3,6,6);}
  if(type==='wx_radio'&&!Works.data().radio){c.strokeStyle='rgba(215,186,112,'+(.3+Math.sin(Game.t*4)*.2)+')';c.lineWidth=2;c.beginPath();c.arc(0,0,18+((Game.t*12)%18),0,6.283);c.stroke();}
  c.restore();
  const p=Game.player,d=Math.hypot(p.x-it.x,p.y-it.y);
  if(d<145&&Level.los(p.x,p.y,it.x,it.y)){
   c.save();c.font='600 10px Rajdhani, sans-serif';c.textAlign='center';c.fillStyle='#e4d5ad';c.fillText((d<40?'[E] ':'')+Works.label(it),it.x,it.y-34);c.restore();
  }
 },
 hazardActive(kind){return kind==='pump'?!Works.flag(Game,'pumps'):kind==='steam'?!Works.flag(Game,'gears'):true;},
};
(() => {
 const build=Level.buildR2;Level.buildR2=function(id){build.call(this,id);if(!WorksMap.is({lvl:id}))return;
  if(id===WorksMap.pit){for(let y=10;y<37;y++)for(let x=11;x<38;x++)if(Math.hypot(x-24,y-23)>13.35)this.grid[y][x]=1;}
  for(const r of this.rooms){const col=/Vestíbulo/.test(r.n)?'#65756d':/vivario|jaula|zoológica|Veterinaria|animal|frigorífica|observación/i.test(r.n)?'#667969':/fundición|Herrería|escoria|horno|caldera/.test(r.n)?'#7b6b59':'#657574';for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)this.surface[y][x]=col;}
 };
 const fluid=Level.fluidAt;Level.fluidAt=function(x,y){if(Game.lvl!==WorksMap.id)return fluid.call(this,x,y);const tx=x/32,ty=y/32;return FLOORS.hospitalworks.hazards.some(([a,b,w,h,k])=>tx>=a&&tx<a+w&&ty>=b&&ty<b+h&&WorksArt.hazardActive(k))?2:0;};
 const draw=Level.draw;Level.draw=function(c,cam,w,h){draw.call(this,c,cam,w,h);if(!WorksMap.is())return;
  c.save();
  if(Game.lvl===WorksMap.id){
   for(const [x,y,dw,dh,k]of FLOORS.hospitalworks.hazards){
    const active=WorksArt.hazardActive(k);c.fillStyle=active?'rgba(87,119,62,.72)':'rgba(51,73,62,.2)';
    for(let j=y;j<y+dh;j++)for(let i=x;i<x+dw;i++)if(Level.grid[j][i]===0){c.fillRect(i*32,j*32,32,32);if(active){c.strokeStyle='rgba(170,187,110,.35)';c.lineWidth=1;c.beginPath();c.ellipse(i*32+9+Math.sin(Game.t+j)*3,j*32+19,5,2,0,0,6.283);c.stroke();}}
    c.strokeStyle=active?'#c3a75e':'#4d5c52';c.lineWidth=3;c.setLineDash([12,10]);c.strokeRect(x*32,y*32,dw*32,dh*32);c.setLineDash([]);
   }
   // Tuberías y franjas al borde del eje, sin tapar el paso ni fingir paredes.
   c.strokeStyle='#545b4f';c.lineWidth=6;c.beginPath();c.moveTo(70*32+4,22*32);c.lineTo(70*32+4,85*32);c.stroke();
   c.strokeStyle='#b49c61';c.lineWidth=2;c.setLineDash([16,12]);c.beginPath();c.moveTo(74*32-4,22*32);c.lineTo(74*32-4,85*32);c.stroke();c.setLineDash([]);
   c.fillStyle='#c3bfa6';c.font='600 17px Rajdhani, sans-serif';c.fillText('SERVICIO / LÍNEA AUXILIAR',63*32,9*32);c.font='600 11px Rajdhani, sans-serif';c.fillText('REFUGIO · PURGA · ARMERO',63*32,9*32+18);
   if(Works.data().radio&&!Works.data().radioDone&&Math.hypot(Game.player.x-118*32,Game.player.y-68*32)<220){c.fillStyle='#cfb675';c.fillText('3-6-9AK / ALMACÉN',114*32,67*32);}
  }else {
   c.strokeStyle='rgba(169,141,91,.35)';c.lineWidth=3;for(const r of [95,210,330,419]){c.beginPath();c.arc(24.5*32,23.5*32,r,0,6.283);c.stroke();}
   c.fillStyle='#b8ad8b';c.font='600 15px Rajdhani, sans-serif';c.textAlign='center';c.fillText('ENSAYO DE CONTENCIÓN / 08 CICLOS',24.5*32,17*32);
   const a=Works.data().arena;if(a.pending)for(const s of a.pending){c.strokeStyle='#f0b178';c.fillStyle='rgba(165,75,47,.2)';c.lineWidth=3;c.beginPath();c.arc(s.x,s.y,42+Math.sin(Game.t*9)*5,0,6.283);c.fill();c.stroke();}
  }
  c.restore();
 };
 const render=Game.render;Game.render=function(){render.call(this);if(!WorksMap.is(this)||!HorrorVision.polygon.length)return;const c=this.ctx;c.save();c.beginPath();c.moveTo(HorrorVision.polygon[0][0]-this.cam.x,HorrorVision.polygon[0][1]-this.cam.y);for(const [x,y]of HorrorVision.polygon)c.lineTo(x-this.cam.x,y-this.cam.y);c.closePath();c.clip();c.translate(-this.cam.x,-this.cam.y);for(const e of this.enemies)if(e instanceof WorksEnemy&&!e.dead)e.drawCue(c);if(this.lvl===WorksMap.pit)for(const s of Works.data(this).arena.pending||[]){c.strokeStyle='#e5b981';c.fillStyle='rgba(187,102,58,.15)';c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,42+Math.sin(this.t*9)*5,0,6.283);c.fill();c.stroke();}c.restore();};
 const item=Game.drawItem;Game.drawItem=function(c,it){if(it.type.startsWith('wx_'))return WorksArt.item(c,it);return item.call(this,c,it);};
 const glyph=DeskIcons.svg;DeskIcons.svg=function(t){if(t.startsWith('wx_valve'))return '<svg class="item-glyph" viewBox="0 0 64 64"><g fill="none" stroke="'+({wx_valve_a:'#7ab3d0',wx_valve_b:'#d8b569',wx_valve_c:'#9ec29a'}[t])+'" stroke-width="4"><circle cx="32" cy="32" r="22"/><circle cx="32" cy="32" r="6"/><path d="M10 32h44M32 10v44M16 16l32 32m0-32L16 48"/></g></svg>';return glyph.call(this,t);};
})();
