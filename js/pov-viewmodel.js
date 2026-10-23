// Rig de dos brazos y armas de perspectiva real. El golpe anima el brazo izquierdo existente.
const POVViewmodel={
  stats:{},faces:[],
  state(g){
    const p=g.player,s=g.story||{},choice=s.endgame?.choice,cured=choice==='cure',missing=cured||!!(s.armCut&&!s.armHealed),infected=!cured&&!!(s.armHealed||s.riutexUsed>0),terminal=!!choice&&!cured;
    return {missing,infected,terminal,blade:!missing&&!cured&&(p.blade>0||p.predator>0||terminal),predator:!cured&&(p.predator>0||terminal),strike:!missing&&p.slash>0};
  },
  plan(g,time=0,aimY=325){
    const p=g.player,state=this.state(g),id=state.predator?'':p.weapon?.id||'',heavy=['ak','shotgun','rifle','r98','flamethrower','gl6','launcher'].includes(id);
    const progress=state.strike?Math.max(0,Math.min(1,1-p.slash/.15)):0,strike=state.strike?Math.sin(progress*Math.PI):0;
    const moving=!!p.running||Object.entries(g.keys||{}).some(([k,v])=>v&&['KeyW','KeyA','KeyS','KeyD'].includes(k)),bob=MenuScene.motionReduced()?0:moving?Math.sin(p.walkT||time*6)*2.7:Math.sin(time*.8)*.7;
    const reload=p.reloading>0?1:0,recoil=p.flash>0?Math.min(1,p.flash/.07):0;
    this.rig={cx:610+bob+(p.running?9:0),cy:487+bob*.4+strike*78+reload*32+recoil*9,focal:500,depth:300,slopeX:-.22,slopeY:(487-aimY)/500,angle:reload?-.17:recoil*.018};
    const right=id?this.point(14,-34,-28):[663,552],left=id?heavy?this.point(-9,-9,70):this.point(-13,-29,-15):[338,566];
    const hands=[{side:1,x:right[0],y:right[1],angle:id?-.24:.12,scale:id?1.04:1.15,infected:state.terminal,veins:state.infected,grip:!!id}];
    if(!state.missing)hands.push({side:-1,x:left[0]+(558-left[0])*strike,y:left[1]+(394-left[1])*strike,angle:state.strike?-.3+strike*.8:id?heavy?.55:.18:-.12,scale:1+strike*.18,infected:state.infected,veins:state.infected,grip:!!id&&!state.strike,attacking:state.strike});
    return {...state,id,heavy,hands,strike,reload,recoil};
  },
  point(x,y,z){
    const v=this.rig,k=v.focal/(v.depth+z),a=v.angle||0,px=(x+z*v.slopeX)*k,py=-(y+z*v.slopeY)*k;
    return [v.cx+px*Math.cos(a)-py*Math.sin(a),v.cy+px*Math.sin(a)+py*Math.cos(a)];
  },
  face(vertices,color,light=0){this.faces.push({v:vertices,base:color,light,color:POVModels.tone(color,light),z:vertices.reduce((n,v)=>n+v[2],0)/vertices.length});},
  stock(color){
    // La culata va al hombro derecho, fuera del eje de la mira y de la mano de disparo.
    const ring=(x,y,z)=>[[x-14,y-12,z],[x+14,y-12,z],[x+14,y+12,z],[x-14,y+12,z]],a=ring(58,-27,-132),b=ring(4,-6,-58);
    this.face(a,'#202a33',-.1);for(const [i,j,n]of [[0,1,-.2],[1,2,-.12],[2,3,.17],[3,0,.02]])this.face([a[i],a[j],b[j],b[i]],color,n);
  },
  box(x,y,z,w,h,d,color){
    if(Math.min(w,h,d)>=7){
      const b=Math.min(2.5,w*.16,h*.16),ring=t=>[[x+b,y,z+t],[x+w-b,y,z+t],[x+w,y+b,z+t],[x+w,y+h-b,z+t],[x+w-b,y+h,z+t],[x+b,y+h,z+t],[x,y+h-b,z+t],[x,y+b,z+t]],a=ring(0),f=ring(d);
      this.face(a,color,-.13);this.face(f,color,-.22);
      for(let i=0;i<8;i++){const j=(i+1)%8;this.face([a[i],a[j],f[j],f[i]],color,[-.28,-.12,-.14,.05,.24,.15,.02,-.08][i]);}return;
    }
    const v=[[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z],[x,y,z+d],[x+w,y,z+d],[x+w,y+h,z+d],[x,y+h,z+d]];
    for(const [ids,light]of [[[0,1,2,3],-.18],[[4,7,6,5],-.28],[[3,2,6,7],.22],[[0,4,5,1],-.34],[[1,5,6,2],-.12],[[0,3,7,4],.05]])this.face(ids.map(i=>v[i]),color,light);
  },
  tube(x,y,z,len,r,color){
    const sides=12,ring=t=>Array.from({length:sides},(_,i)=>[x+Math.cos(i*Math.PI*2/sides)*r,y+Math.sin(i*Math.PI*2/sides)*r,z+t]);
    const a=ring(0),b=ring(len);for(let i=0;i<sides;i++){const j=(i+1)%sides;this.face([a[i],a[j],b[j],b[i]],color,Math.sin(i*Math.PI*2/sides)*.2-.1);}
    this.face(a,color,-.3);this.face(b,color,-.2);
  },
  gun(id){
    this.faces=[];const metal='#52616b',steel='#8a979c',dark='#202a33',wood='#72513c',olive='#55685b';let muzzle=[0,22,100];
    const grip=()=>{this.box(1,-58,-47,24,52,26,dark);this.box(-18,-25,-24,37,4,27,metal);this.box(-18,-24,-24,4,18,27,metal);this.box(-17,-10,-24,34,3,27,metal);this.box(9,-20,-14,3,17,8,steel);};
    if(id==='pistol'){
      grip();this.box(-15,-5,-47,30,24,67,dark);this.box(-16,18,-49,32,14,112,metal);this.tube(0,24,61,39,6,steel);
      this.box(-13,32,-40,6,6,7,dark);this.box(7,32,-40,6,6,7,dark);this.box(-2,32,57,4,6,5,steel);
      this.box(14,21,-15,3,7,20,dark);for(let i=0;i<5;i++)this.box(-17,19,-44+i*5,2,11,2,steel);
    }else if(id==='viper'){
      grip();this.box(-22,0,-51,44,39,121,metal);this.box(-18,39,-40,36,5,97,dark);this.tube(0,19,69,54,7,steel);this.tube(0,19,119,7,9,dark);
      this.box(2,-93,-38,23,42,24,metal);this.box(-11,-4,-110,22,13,60,dark);this.box(-15,45,-36,5,8,6,steel);this.box(10,45,-36,5,8,6,steel);this.box(-2,43,63,4,9,6,steel);
      for(let i=0;i<6;i++)this.box(-23,13,i*12,2,15,6,dark);muzzle=[0,19,127];
    }else{
      grip();this.box(-18,-7,-58,36,32,101,id==='flamethrower'?olive:metal);this.box(-13,25,-52,26,7,97,dark);
      this.stock(id==='ak'?wood:dark);
      if(id==='shotgun'){
        this.tube(0,22,28,225,8,steel);this.tube(0,3,32,171,6,metal);this.box(-15,-8,46,30,29,67,wood);for(let i=0;i<7;i++)this.box(-16,-7,48+i*9,32,26,2,dark);
        this.box(-4,31,228,8,6,8,steel);this.box(17,4,-25,2,15,30,dark);muzzle=[0,22,254];
      }else if(id==='ak'){
        this.box(-15,-3,39,30,29,78,wood);this.tube(0,14,112,93,6,steel);this.tube(0,30,74,115,4,metal);this.box(-7,32,171,14,20,7,dark);this.box(-3,52,173,6,4,4,steel);
        this.box(-13,-45,0,26,38,26,dark);this.box(-13,-76,13,26,34,26,metal);this.box(-13,-94,32,26,23,25,dark);for(let i=0;i<4;i++)this.box(-14,-68+i*9,14+i*3,2,2,23,steel);muzzle=[0,14,207];
      }else if(id==='flamethrower'){
        this.tube(0,18,44,157,13,metal);this.tube(0,18,181,25,18,steel);this.tube(0,18,202,4,13,dark);this.tube(17,16,147,65,4,'#b19a68');
        this.tube(-30,1,-30,83,16,olive);this.box(-47,-11,-18,34,6,11,dark);this.box(-47,-11,35,34,6,11,dark);this.box(17,6,-17,13,22,20,'#ac9e78');muzzle=[0,18,210];
      }else if(id==='gl6'||id==='launcher'){
        this.tube(0,15,-6,68,24,olive);this.tube(0,22,57,116,17,metal);this.tube(0,22,160,16,20,steel);this.tube(0,22,172,5,16,dark);this.box(18,-4,-10,7,37,61,steel);this.box(-3,43,93,6,19,7,dark);muzzle=[0,22,177];
      }else{
        this.box(-14,-6,37,28,23,77,dark);this.tube(0,17,87,182,6,steel);this.box(-9,28,-9,18,15,76,metal);this.tube(0,49,-12,112,12,dark);this.tube(0,49,-17,10,16,steel);this.tube(0,49,-18,2,12,'#1f383f');this.tube(0,49,94,12,15,steel);muzzle=[0,17,271];
      }
      this.box(18,8,-28,2,11,33,dark);for(let i=0;i<7;i++)this.box(-14,32,-47+i*12,28,2,4,steel);
    }
    return muzzle;
  },
  paintGun(c){
    this.faces.sort((a,b)=>b.z-a.z);
    for(const f of this.faces){
      const points=f.v.map(v=>this.point(...v)),xs=points.map(v=>v[0]),ys=points.map(v=>v[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
      const surface=c.createLinearGradient(x,y,x+Math.max(1,w),y+Math.max(1,h));surface.addColorStop(0,POVModels.tone(f.base,Math.min(.4,f.light+.07)));surface.addColorStop(.42,f.color);surface.addColorStop(1,POVModels.tone(f.base,Math.max(-.55,f.light-.1)));
      POVArt.polygon(c,points,surface,'#192731');
    }
  },
  arm(c,h,p){
    const start=[h.side<0?255:862,744],wrist=[h.x+h.side*7,h.y+35],elbow=[start[0]*.58+wrist[0]*.42,648],skin=h.infected?'#6087a2':'#a28b78';
    const cloth=c.createLinearGradient(...start,...elbow);cloth.addColorStop(0,'#111e28');cloth.addColorStop(.6,'#35444a');cloth.addColorStop(1,'#17262f');
    POVArt.polygon(c,[[start[0]-58,start[1]],[start[0]+58,start[1]],[elbow[0]+32,elbow[1]-4],[elbow[0]-32,elbow[1]-4]],cloth,'#111b23');
    const grad=c.createLinearGradient(elbow[0]-25,elbow[1],wrist[0]+20,wrist[1]);grad.addColorStop(0,h.infected?'#274258':'#665a50');grad.addColorStop(.48,skin);grad.addColorStop(.7,h.infected?'#83a4bb':'#bcaa94');grad.addColorStop(1,h.infected?'#314b68':'#72695e');
    const dx=wrist[0]-elbow[0],dy=wrist[1]-elbow[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,mx=(elbow[0]+wrist[0])/2,my=(elbow[1]+wrist[1])/2;
    c.fillStyle=grad;c.strokeStyle='#192a35';c.lineWidth=1.5;c.beginPath();c.moveTo(elbow[0]-nx*35,elbow[1]-ny*35);c.quadraticCurveTo(mx-nx*37,my-ny*37,wrist[0]-nx*20,wrist[1]-ny*20);c.lineTo(wrist[0]+nx*20,wrist[1]+ny*20);c.quadraticCurveTo(mx+nx*33,my+ny*33,elbow[0]+nx*35,elbow[1]+ny*35);c.closePath();c.fill();c.stroke();
    POVArt.line(c,[[elbow[0]-27,elbow[1]-2],[elbow[0]+27,elbow[1]-2]],'#4c6266',5);
    if(h.veins){c.save();c.globalAlpha=h.infected?.7:.25;POVArt.line(c,[[elbow[0],elbow[1]-8],[wrist[0]-6,wrist[1]+29],[wrist[0]+6,wrist[1]+9]],'#60b6e8',2);POVArt.line(c,[[wrist[0]-6,wrist[1]+29],[wrist[0]-20,wrist[1]+41]],'#4285b5',1.3);c.restore();}
    if(p.flash>0){c.save();c.globalAlpha=.12;POVArt.line(c,[[elbow[0]+13,elbow[1]-8],[wrist[0]+12,wrist[1]+4]],'#ffcb89',7);c.restore();}
  },
  palm(c,h){
    c.save();c.translate(h.x,h.y);c.rotate(h.angle);c.scale(h.side*h.scale,h.scale);
    const color=c.createLinearGradient(-25,-45,31,39);color.addColorStop(0,h.infected?'#a0b9c9':'#d1baa0');color.addColorStop(.4,h.infected?'#7297b3':'#ad9681');color.addColorStop(1,h.infected?'#334f6c':'#695c52');
    c.fillStyle=color;c.strokeStyle='#28343a';c.lineWidth=1.6;c.beginPath();c.moveTo(-18,39);c.quadraticCurveTo(-35,3,-24,-28);c.quadraticCurveTo(-15,-51,8,-43);c.quadraticCurveTo(30,-39,30,-18);c.lineTo(25,21);c.lineTo(17,38);c.closePath();c.fill();c.stroke();
    // Base del pulgar y nudillos: volumen y articulación, sin guantes duplicados.
    POVArt.ellipse(c,-19,2,12,20,h.infected?'#638aaa':'#b49b81',-.3);
    for(let i=0;i<4;i++){const x=-17+i*11;POVArt.ellipse(c,x,-31+Math.abs(1.5-i)*2,6.8,10,h.infected?'#89a9bf':'#c7b098');POVArt.line(c,[[x-4,-28],[x+3,-27]],h.infected?'#3d6789':'#786b5d',1);}
    POVArt.line(c,[[-14,12],[-3,7],[15,13]],h.infected?'#375977':'#796d60',1.2);
    if(h.veins){POVArt.line(c,[[-10,30],[-5,14],[6,-3],[1,-24]],'#5db8ed',1.7);POVArt.line(c,[[6,-3],[19,-12]],'#4998ce',1.2);}
    c.restore();
  },
  fingers(c,h){
    c.save();c.translate(h.x,h.y);c.rotate(h.angle);c.scale(h.side*h.scale,h.scale);
    for(let i=0;i<4;i++){
      const y=-23+i*10;c.strokeStyle='#283840';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(-17,y);c.quadraticCurveTo(3,y+9,20,y+3);c.stroke();c.strokeStyle=h.infected?'#81a5bf':'#bfa98f';c.lineWidth=6;c.stroke();
    }
    POVArt.line(c,[[-23,-8],[-28,-25],[-13,-34]],h.infected?'#9bb8ca':'#d0b99b',8);c.restore();
  },
  claws(c,h){
    c.save();c.translate(h.x,h.y);c.rotate(h.angle);c.scale(h.side*h.scale,h.scale);
    for(let i=0;i<3;i++){const x=-13+i*14;POVArt.polygon(c,[[x-5,-32],[x-8,-75],[x+6,-126-i*9],[x+7,-72],[x+6,-31]],'#a6c4d3','#416c8d');POVArt.line(c,[[x+2,-41],[x+1,-80],[x+6,-119-i*9]],'#d5e8ec',1.3);}
    c.restore();
  },
  draw(c,g,w,h,time=0){
    if(!g.player)return;const p=g.player,base=Math.min(w/1000,h/650),plan=this.plan(g,time,650-h/(2*base));
    this.stats={weapon:plan.id,hands:plan.hands.map(v=>v.side<0?'left':'right'),missingLeft:plan.missing,infected:plan.infected,terminal:plan.terminal,strike:plan.strike>0,meshFaces:0};
    c.save();c.translate((w-1000*base)/2,h-650*base);c.scale(base,base);
    for(const hand of plan.hands)this.arm(c,hand,p);
    for(const hand of plan.hands)if(!hand.attacking)this.palm(c,hand);
    if(plan.id){const muzzle=this.gun(plan.id);this.stats.meshFaces=this.faces.length;this.paintGun(c);
      if(plan.id==='flamethrower'){const pts=[[-29,-12,-10],[-68,-32,18],[-40,-22,99],[5,7,135]].map(v=>this.point(...v));POVArt.line(c,pts,'#1d292d',9);POVArt.line(c,pts,'#877956',3);}
      for(const hand of plan.hands)if(hand.grip)this.fingers(c,hand);
      if(p.flash>0){const m=this.point(...muzzle);POVArt.muzzle(c,m[0],m[1],plan.id==='flamethrower'?52:35,p,plan.id==='flamethrower');}
    }
    for(const hand of plan.hands){if(hand.attacking)this.palm(c,hand);if(plan.blade&&(hand.side<0||plan.predator))this.claws(c,hand);}
    if(plan.missing){POVArt.polygon(c,[[121,650],[183,650],[184,627],[155,615],[130,624]],'#605b55','#26343a');POVArt.line(c,[[130,630],[179,639]],'#b7b0a0',10);POVArt.line(c,[[145,627],[162,635]],'#6d3b40',5);}
    c.restore();
  }
};
