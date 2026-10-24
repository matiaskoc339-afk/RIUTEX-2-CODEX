// Brillo de recogida: discreto, con profundidad y sin revelar objetos tras paredes.
const LootFeedback={
  materials:new Map(),
  pickup(it,g=Game){return !!(it&&!it.fixed&&!g.picked?.has(it.id));},
  color(it){return it.type==='doc'?'#ddc48e':it.type==='sample'?'#8ac2dc':'#c8d8c7';},
  pulse(time,it){return MenuScene.motionReduced()?.7:.55+.25*Math.sin(time*1.8+(POVArt.hash(String(it.id))%17));},
  material(T,color){
    if(!this.materials.has(color))this.materials.set(color,new T.MeshBasicMaterial({color,transparent:true,opacity:.65,depthWrite:false,toneMapped:false,side:T.DoubleSide}));
    return this.materials.get(color);
  },
  decorate(root,it,g,kit){
    if(!this.pickup(it,g))return;
    const T=kit.THREE,marker=new T.Group(),material=this.material(T,this.color(it));
    if(!this.ringGeometry){this.ringGeometry=new T.RingGeometry(5.2,6.1,36);this.ringGeometry.userData.shared=true;this.glintGeometry=new T.OctahedronGeometry(.8);this.glintGeometry.userData.shared=true;}
    const ring=new T.Mesh(this.ringGeometry,material),glint=new T.Mesh(this.glintGeometry,material);
    ring.rotation.x=-Math.PI/2;ring.position.y=.9;glint.position.y=Math.min(20,(root.userData.markerHeight||12)+2);
    marker.name='pickup-beacon';marker.add(ring,glint);root.add(marker);root.userData.pickupBeacon={marker,ring,glint,height:glint.position.y};
  },
  animate(root,it,g,time){
    const b=root.userData.pickupBeacon;if(!b)return;
    b.marker.visible=this.pickup(it,g)&&Math.hypot(it.x-g.player.x,it.y-g.player.y)<400;
    const pulse=this.pulse(time,it);b.ring.scale.setScalar(.9+pulse*.22);b.glint.scale.setScalar(.65+pulse*.65);
    b.glint.position.y=b.height+(MenuScene.motionReduced()?0:Math.sin(time*1.8)*1.2);b.glint.rotation.y=MenuScene.motionReduced()?0:time*.65;
  },
  draw(c,it,g){
    if(!isR2lvl(g.lvl)||!this.pickup(it,g)||Math.hypot(it.x-g.player.x,it.y-g.player.y)>300)return;
    if(!Level.los(g.player.x,g.player.y,it.x,it.y))return;
    const pulse=this.pulse(g.t,it);c.save();c.translate(it.x,it.y);c.strokeStyle=this.color(it);c.fillStyle=this.color(it);c.globalAlpha=.35+pulse*.4;
    c.lineWidth=1.2;c.shadowColor=this.color(it);c.shadowBlur=5;c.beginPath();c.ellipse(0,3,10+pulse*2,6+pulse,0,0,Math.PI*2);c.stroke();
    c.translate(0,-15-pulse*2);c.beginPath();c.moveTo(0,-3);c.lineTo(2,0);c.lineTo(0,3);c.lineTo(-2,0);c.closePath();c.fill();c.restore();
  }
};
(()=>{const draw=Game.drawItem;Game.drawItem=function(c,it){LootFeedback.draw(c,it,this);return draw.call(this,c,it);};})();
