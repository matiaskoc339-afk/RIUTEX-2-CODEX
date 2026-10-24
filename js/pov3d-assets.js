// Anatomía, equipo y utilería volumétrica. Todo comparte geometrías/materiales del renderer.
// Los grupos miran hacia +Z; las coordenadas corresponden a las unidades del hospital.
const POV3DAssets = {
  init(kit){this.k=kit;this.T=kit.THREE;this.palette={
    flesh:kit.mat('#a39c89',.92),pale:kit.mat('#b6b19e',.9),bruise:kit.mat('#654a51',.96),wound:kit.mat('#65313b',.86),dark:kit.mat('#142027',.8),
    cloth:kit.mat('#56645d',.96),gown:kit.mat('#9ca899',.98),teal:kit.mat('#3f7774',.86),blue:kit.mat('#3d5969',.88),
    steel:kit.mat('#8a9693',.36,.78),iron:kit.mat('#475152',.61,.62),rust:kit.mat('#765541',.85,.31),gold:kit.mat('#9c8350',.4,.65),
    ivory:kit.mat('#c3c4ae',.72),wood:kit.mat('#65513c',.95),rubber:kit.mat('#202a2c',.97),paper:kit.mat('#c6c1aa',.93),
    poison:kit.mat('#648151',.6,.08,'#13210d'),riutex:kit.mat('#477e9b',.35,.12,'#0c3445'),glass:kit.mat('#8eaba8',.25,.28),
    eyes:kit.mat('#77715c',.38,.06,'#171911'),red:kit.mat('#8b5149',.8),lamp:kit.mat('#b9d4c9',.35,.1,'#345343')};this.finishMaterials();this.palette.glass.transparent=true;this.palette.glass.opacity=.48;this.palette.glass.depthWrite=false;return this;},
  // Texturas generadas una vez; la anatomía sigue siendo volumen, nunca una lámina orientada a cámara.
  finishMaterials(){
    if(typeof document==='undefined'||!document.createElement)return;
    const T=this.T,make=(kind)=>{
      const cv=document.createElement('canvas');cv.width=cv.height=512;const c=cv.getContext('2d');if(!c?.createImageData)return null;
      let seed=kind==='skin'?73411:kind==='apron'?18231:41813;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const img=c.createImageData(512,512);if(!img?.data)return null;
      for(let y=0;y<512;y++)for(let x=0;x<512;x++){
        const i=(y*512+x)*4,n=(random()-.5)*27,fold=kind==='skin'?Math.sin(x*.038+y*.015)*6:Math.sin(x*.085+Math.sin(y*.016)*.6)*10+(x%6===0||y%6===0?-9:2),base=kind==='skin'?180:kind==='apron'?176:197;
        img.data[i]=base+n+fold;img.data[i+1]=base+n+fold-(kind==='skin'?6:2);img.data[i+2]=base+n+fold-(kind==='skin'?10:7);img.data[i+3]=255;
      }c.putImageData(img,0,0);
      if(kind==='skin'){
        for(let j=0;j<45;j++){const x=random()*512,y=random()*512,g=c.createRadialGradient(x,y,0,x,y,18+random()*45);g.addColorStop(0,j%3?'#69475236':'#9a7d5625');g.addColorStop(1,'#977c5900');c.fillStyle=g;c.fillRect(x-65,y-65,130,130);}
        c.lineWidth=.8;for(let j=0;j<25;j++){const x=random()*512,y=random()*512;c.strokeStyle=j%2?'#603d4040':'#69786845';c.beginPath();c.moveTo(x,y);c.bezierCurveTo(x+7,y+12,x-7,y+22,x+random()*16-8,y+37);c.stroke();}
      }else{
        for(let j=0;j<(kind==='apron'?38:14);j++){const x=random()*512,y=random()*512,r=kind==='apron'?4+random()*40:5+random()*16,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,kind==='apron'?'#3b0d16bd':'#30362d35');g.addColorStop(.5,kind==='apron'?'#53182578':'#484b3830');g.addColorStop(1,'#39212200');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);if(kind==='apron'&&j%5===0){c.strokeStyle='#3d10195c';c.lineWidth=2+random()*4;c.beginPath();c.moveTo(x,y);c.lineTo(x+(random()-.5)*8,Math.min(512,y+25+random()*85));c.stroke();}}
        for(let x=8;x<512;x+=91){c.strokeStyle='#2b32254a';c.lineWidth=1;c.setLineDash([4,3]);c.beginPath();c.moveTo(x,0);c.lineTo(x,512);c.stroke();}c.setLineDash([]);
      }
      const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=4;return tex;
    };
    const skin=make('skin'),cloth=make('cloth'),apron=make('apron');
    for(const key of ['flesh','pale','bruise','wound','poison'])if(skin){const mat=this.palette[key].clone();mat.map=skin;mat.bumpMap=skin;mat.bumpScale=.075;mat.roughness=key==='wound'?.58:.87;this.palette[key]=mat;}
    for(const key of ['cloth','gown','teal','blue'])if(cloth){const mat=this.palette[key].clone();mat.map=cloth;mat.bumpMap=cloth;mat.bumpScale=.045;this.palette[key]=mat;}
    this.palette.apron=new T.MeshStandardMaterial({color:'#aca68d',map:apron||cloth,bumpMap:apron||cloth,bumpScale:.07,roughness:.94,side:T.DoubleSide});
  },
  organic(p,points,zScale,m){
    const T=this.T,profile=points.map(v=>new T.Vector2(v[1],v[0]));
    if(profile[0].x>0)profile.unshift(new T.Vector2(0,profile[0].y));
    if(profile[profile.length-1].x>0)profile.push(new T.Vector2(0,profile[profile.length-1].y));
    const geometry=new T.LatheGeometry(profile,20),mesh=new T.Mesh(geometry,m);mesh.scale.z=zScale;mesh.castShadow=mesh.receiveShadow=true;p.add(mesh);return mesh;
  },
  apron(p){
    const T=this.T,m=this.palette,geo=new T.PlaneGeometry(14.5,22.5,10,12),attr=geo.attributes.position;
    for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),f=(y+11.25)/22.5;attr.setXYZ(i,x*(1.03-f*.13),y,7.6-x*x*.025+Math.cos(x*.45)*.2+Math.sin(y*.22+x*.7)*.14);}
    geo.computeVertexNormals();const mesh=new T.Mesh(geo,m.apron||this.k.mat('#857766',.98));mesh.position.set(0,23.6,0);mesh.castShadow=mesh.receiveShadow=true;p.add(mesh);
    for(const side of[-1,1])this.rod(p,[side*5.4,34.8,3.3],[side*5.2,32.5,5.2],.36,m.rubber);
    this.rod(p,[-6.3,27.8,5.2],[6.3,27.8,5.2],.25,m.rubber);return mesh;
  },
  tone(material,color){const key=material.uuid+'|'+color;this.tones||=new Map();if(!this.tones.has(key)){const m=material.clone();m.color.set(color);this.tones.set(key,m);}return this.tones.get(key);},
  group(parent,x=0,y=0,z=0){const g=new this.T.Group();g.position.set(x,y,z);if(parent)parent.add(g);return g;},
  b(p,x,y,z,sx,sy,sz,m){return this.k.box(p,x,y,z,sx,sy,sz,m);},
  s(p,x,y,z,sx,sy,sz,m){return this.k.sphere(p,x,y,z,sx,sy,sz,m);},
  cy(p,x,y,z,r1,r2,h,m,n=12){return this.k.cylinder(p,x,y,z,r1,r2,h,m,n);},
  rod(p,a,b,r,m){return this.k.rod(p,a,b,r,m);},
  ring(p,x,y,z,r,t,m,axis='z'){
    const geo=new this.T.TorusGeometry(r,t,6,16),mesh=new this.T.Mesh(geo,m);mesh.position.set(x,y,z);if(axis==='y')mesh.rotation.x=Math.PI/2;if(axis==='x')mesh.rotation.y=Math.PI/2;mesh.castShadow=mesh.receiveShadow=true;p.add(mesh);return mesh;
  },
  mark(p,x,y,z,m,size=1){this.b(p,x,y,z,size*.42,size*1.8,.2,m);this.b(p,x,y,z,size*1.8,size*.42,.22,m);},
  identity(e){return typeof POVModels!=='undefined'?POVModels.identity(e):e.type||'vacio';},
  humanoid(cfg={}){
    const m=this.palette,root=this.group(),body=this.group(root),skin=cfg.skin||m.flesh,cloth=cfg.cloth||m.cloth,wide=cfg.wide||1,rig={body,arms:[],elbows:[],legs:[],knees:[],skin,cloth};
    this.s(body,0,17.5,0,6.3*wide,4.3,4.2,cloth);this.organic(body,[[17,5.4*wide],[20,6.3*wide],[23,6.5*wide],[27,8.1*wide],[30.5,8.3*wide],[33,6.1*wide],[34,3.7*wide]],.64,cloth);this.s(body,0,33.2,0,5.8*wide,2.3,3.5,skin);
    this.cy(body,0,35.5,0,2.1,2.6,4,skin);const head=rig.head=this.group(body,0,39.8,.2);
    this.organic(head,[[-5.2,2.35],[-4.2,3.35],[-1.2,4.15],[2,4.45],[4.8,3.45],[5.6,1.8]],.86,skin);this.s(head,0,-3.5,1.3,3.25,1.9,2.5,skin);
    for(const side of [-1,1]){
      this.s(head,side*4.4,-.1,0,.9,1.65,1,skin);
      if(!cfg.blind){this.s(head,side*1.7,.8,3.38,1.45,.65,.52,m.bruise);this.s(head,side*1.7,.65,3.75,.85,.34,.25,m.dark);this.s(head,side*1.7,.68,3.96,.18,.16,.12,cfg.clean?m.dark:m.eyes);const brow=this.s(head,side*1.65,1.6,3.57,1.75,.58,.68,skin);brow.rotation.z=side*-.18;}
    }
    this.s(head,0,-.4,3.7,.7,1.35,.75,skin);this.s(head,0,-1.22,4,.85,.47,.62,skin);this.s(head,0,-2.9,3.35,1.85,.39,.43,m.wound);
    this.rod(head,[-2.6,-2.25,3.8],[2.5,-2.45,3.85],.15,m.bruise);
    if(cfg.blind){this.b(head,0,.9,4.2,9.6,3.3,1.1,m.rubber);this.rod(head,[-4,2.1,4.7],[4,-.5,4.7],.26,m.ivory);}
    if(cfg.mask){this.b(head,0,-2,4.4,7,2.5,1.4,m.gown);this.rod(head,[-3.2,-1.6,5.15],[3.2,-1.6,5.15],.12,m.iron);}
    if(!cfg.bald){this.s(head,0,3.25,-.4,4.6,2.5,4.3,cfg.hair||m.dark);}
    for(const side of [-1,1]){
      const hip=this.group(root,side*3.8*wide,17.2,0),knee=this.group(hip,0,-8.4,0);rig.legs.push(hip);rig.knees.push(knee);
      this.s(hip,0,-3.8,0,3.15*wide,5.8,3.15,cloth);this.s(knee,0,-3.9,.25,2.5*wide,5.2,2.6,cfg.bareLegs?skin:cloth);this.s(knee,0,-7.9,1.5,3.1*wide,1.9,4.7,m.rubber);
      const shoulder=this.group(body,side*8.6*wide,32.7,0),elbow=this.group(shoulder,side*.7,-7.8,0);rig.arms.push(shoulder);rig.elbows.push(elbow);
      this.organic(shoulder,[[-8.2,1.95*wide],[-6.3,2.65*wide],[-3.3,3.5*wide],[-.8,3.25*wide],[1.1,2.3*wide]],.95,cfg.bareArms?skin:cloth);const fore=this.organic(elbow,[[-8.2,1.6*wide],[-6,1.8*wide],[-2.4,2.65*wide],[0,2.05*wide]],.86,skin);fore.position.z=.2;this.s(elbow,0,-8.7,.8,2.15*wide,2.7,1.55,skin);
      for(let i=0;i<3;i++)this.rod(elbow,[side*(i-1)*.9,-10.2,1.5],[side*(i-1)*1,-12.3,1.8],.32,skin);
    }
    if(cfg.coat){this.cy(body,0,18.6,0,6.2*wide,8.1*wide,15,cloth,12);this.b(body,0,24.4,5.05,.55,17,.24,m.iron);for(let i=0;i<3;i++)this.s(body,0,22+i*4,5.25,.35,.35,.24,m.ivory);}
    if(!cfg.clean){this.s(body,-2.3,26.5,4.4,2.1,4.1,.8,m.wound);this.rod(body,[2,30,4.6],[4.5,24.5,4.3],.3,m.bruise);}
    root.userData.rig=rig;root.userData.height=46;return root;
  },
  claws(p,length=15,count=3,material){const m=material||this.palette.ivory;for(let i=0;i<count;i++){const x=(i-(count-1)/2)*1.6;this.rod(p,[x,-9,2],[x,-13,6],.65,m);this.rod(p,[x,-13,6],[x,-10,length],.4,m);}},
  ribs(p,y=27,width=6){const m=this.palette;for(let i=0;i<4;i++)for(const side of[-1,1])this.rod(p,[side*.8,y+5-i*2.4,5],[side*(width-i*.35),y+3-i*2.4,4.3],.42,m.ivory);},
  armor(root,rig,heavy=false){const m=this.palette;this.s(rig.body,0,26.8,1,heavy?10:8,8.8,5.6,m.iron);this.b(rig.body,0,28.5,6.2,heavy?14:12,11,.65,m.steel);this.b(rig.body,0,20.3,5.1,13,2.5,.9,m.rubber);for(const side of[-1,1]){this.s(rig.arms[side>0?1:0],0,-1,0,5,3.7,4.7,m.iron);this.b(rig.body,side*4.2,24.4,6.8,3.8,5,1.5,m.blue);}},
  spikes(p,count=5,span=9,y=30,z=-4,size=10){const m=this.palette;for(let i=0;i<count;i++){const x=(i-(count-1)/2)*span/Math.max(1,count-1),g=this.group(p,x,y-Math.abs(x)*.2,z);const cone=this.cy(g,0,size*.35,-size*.1,0,1.6,size,m.ivory,7);cone.rotation.x=-.35;cone.rotation.z=-x*.035;}},
  enemy(e,g){
    const id=this.identity(e),m=this.palette,phase=Math.max(1,Math.min(3,e.phase||1));let root,rig;
    if(/^(ds_spider|ds_matriarch)$/.test(id))root=this.spider(id==='ds_matriarch',phase);
    else if(['cl_hound','wx_scuttler','rata','escupidor','rastrero'].includes(id))root=this.quadruped(id);
    else if(id==='cl_moth')root=this.moth();
    else if(id==='torreta'){root=this.group();this.cy(root,0,4,0,6,9,8,m.iron);this.s(root,0,12,0,7,5,6,m.steel);this.rod(root,[0,14,2],[0,14,19],2.1,m.iron);this.s(root,0,13,7,1,.7,.6,m.eyes);}
    else{
      const nurse=id==='enfermera',surgeon=id==='cirujano',butcher=id==='carnicero',blind=id==='cl_blind'||id==='wx_listener',guard=id==='ds_guard'||id==='lf_sentinel',knight=/^cl_(halberd|shield|regent)$/.test(id),wren=id==='lf_wren',bloated=/hinchado|fundido|lf_spore|wx_spitter/.test(id),bulk=butcher||guard||id==='wx_mauler'||id==='wx_keeper'||id==='c17'||/bruto|coloso|abominacion/.test(id);
      root=this.humanoid({skin:wren?m.pale:bloated?m.poison:blind?m.pale:m.flesh,cloth:nurse?m.gown:surgeon?m.teal:guard?this.tone(m.cloth,id==='ds_guard'?'#938052':'#50636b'):knight?m.iron:wren?m.gown:butcher?this.tone(m.cloth,'#6f6559'):/lf_/.test(id)?m.blue:m.cloth,wide:bulk?1.3:wren&&phase>1?1.4:1,coat:nurse||surgeon||wren||id==='sonambulo',blind,bald:blind||butcher||bloated||wren,bareArms:blind||butcher||id==='vacio'||id==='trepador',mask:surgeon});rig=root.userData.rig;
      if(nurse){this.b(rig.head,0,5.35,0,10,1.5,7.2,m.gown);this.mark(rig.head,0,5.5,3.8,m.red,1);this.b(rig.body,-3.7,29,5.4,3.5,4,.35,m.paper);}
      if(surgeon){this.b(rig.body,3.5,28.2,5.4,4,3.7,.4,m.dark);this.rod(rig.elbows[1],[0,-10,1],[0,-18,3],.55,m.steel);this.b(rig.elbows[1],0,-20,3.5,1.2,6,.35,m.ivory);}
      if(id==='sonambulo'){this.b(rig.body,2.4,29,5.1,3.7,4,.3,m.paper);this.b(rig.elbows[0],0,-6.4,1.8,4,.8,.35,m.teal);rig.head.rotation.x=.18;}
      if(id==='vacio'||id==='trepador'||id==='regenerador'){this.ribs(rig.body);if(id==='trepador'){root.scale.set(.88,1.1,.9);this.claws(rig.elbows[0],12);this.claws(rig.elbows[1],12);}if(id==='regenerador')for(let i=0;i<4;i++)this.s(rig.body,(-1)**i*5,22+i*3,-4,2.6,3.5,2.5,m.bruise);}
      if(id==='latente'){root.userData.sleeping=true;this.b(rig.body,0,21,5,8,2,.8,m.rubber);}
      if(id==='aullador'){this.s(rig.head,0,-2,4.1,2.6,2.6,1.5,m.dark);this.s(rig.head,0,-2,4.8,1.5,2,1,m.wound);this.s(rig.body,0,34,3.4,3.5,3.5,2.4,m.bruise);}
      if(id==='camillero'){this.armor(root,rig);this.b(rig.body,0,24,-6,14,22,2,m.blue);for(const side of[-1,1])this.rod(rig.body,[side*8,11,-7],[side*8,40,-7],.7,m.steel);this.b(rig.body,0,25,-7.3,12,12,2,m.gown);}
      if(bloated){this.s(rig.body,0,22,1.5,11.5,12,8,m.poison);for(let i=0;i<5;i++)this.s(rig.body,Math.sin(i*2.4)*9,20+i*3,4+Math.cos(i*2.4)*3,1.5+i%2,2,1.7,m.bruise);root.scale.set(1.12,1.02,1.1);}
      if(id==='wx_listener'){this.s(rig.head,-5.2,1.4,0,2.4,3.1,1.6,m.bruise);this.s(rig.head,5.2,1.4,0,2.4,3.1,1.6,m.bruise);this.rod(rig.body,[-4,31,-3],[-3,17,-4],.5,m.ivory);root.scale.set(.95,1.16,.9);rig.head.rotation.x=.15;}
      if(id==='cl_blind'){root.scale.set(1.35,1.24,1.35);this.ribs(rig.body,27,7);for(const arm of rig.elbows)this.claws(arm,25,3,m.steel);for(const side of[-1,1])this.rod(rig.body,[side*6,34,3.7],[-side*5,18,4],.8,m.rubber);this.b(rig.head,0,1,4.4,10.6,4.1,1,m.ivory);this.rod(rig.head,[-4,2.7,5.1],[4,-.4,5.1],.4,m.bruise);}
      if(id==='wx_mauler'){root.scale.set(1.22,1.1,1.15);for(const side of[-1,1]){this.rod(rig.head,[side*3.4,3.1,1.6],[side*7.5,7,3],1.45,m.ivory);this.rod(rig.head,[side*7.5,7,3],[side*6.2,10,4],.8,m.ivory);}this.armor(root,rig,true);}
      if(id==='wx_keeper'){root.scale.set(1.28,1.21,1.18);this.b(rig.body,0,28,6,12,11,3,m.rust);this.cy(rig.body,0,29,8,4,4,1,m.dark).rotation.x=Math.PI/2;for(let i=0;i<4;i++)this.b(rig.body,0,26+i*1.7,8.8,7,.45,.4,m.steel);this.rod(rig.body,[5,34,6],[8,45,3],.35,m.iron);}
      if(guard||id==='c17'||/soldado|coloso|artillero/.test(id)){this.armor(root,rig,guard||id==='c17');this.s(rig.head,0,0,0,5.2,6.5,5.1,guard?(id==='ds_guard'?m.gold:m.iron):m.iron);this.b(rig.head,0,.6,4.7,7.2,3.7,1,m.dark);if(guard){this.ring(rig.head,0,-1,5.8,3.1,.6,m.steel);this.mark(rig.body,0,29,7.1,m.gold,1.6);for(const side of[-1,1])this.rod(rig.body,[side*3,34,5],[side*7,27,5],.7,m.rubber);}if(id==='c17'){root.scale.set(1.2,1.2,1.2);this.b(rig.elbows[0],0,-10,4,11,19,2,m.iron);}}
      if(butcher){root.scale.set(1.35+phase*.13,1.26+phase*.065,1.2+phase*.12);this.apron(rig.body);this.s(rig.body,-6.7,31.6,2.8,2.2,2.5,1.7,m.bruise);this.b(rig.head,0,-1.6,4.3,7.8,3.5,.9,m.rubber);this.rod(rig.elbows[1],[0,-8,0],[0,-16,0],.7,m.wood);this.b(rig.elbows[1],2,-19,2,7,10,1,m.steel);this.b(rig.elbows[1],-1.4,-19,2.6,.7,10,.4,m.rust);this.claws(rig.elbows[0],12,2,m.steel);if(phase>1){this.spikes(rig.body,5,17,32,-5,10+phase*2);this.s(rig.arms[0],0,-3,0,5+phase,7,5,m.bruise);}if(phase===3)this.ribs(rig.body,27,8);}
      if(knight){this.armor(root,rig,id==='cl_regent');this.s(rig.head,0,0,0,5.1,6,4.9,m.steel);this.b(rig.head,0,1.1,4.7,8,.8,1,m.dark);this.b(rig.head,0,-1.2,4.9,.8,4,.7,m.dark);this.rod(rig.elbows[1],[0,-12,1],[0,-6,1],.7,m.gold);this.b(rig.elbows[1],0,-6,2,6.8,1.1,1,m.gold);this.b(rig.elbows[1],0,7,1,2.3,26,.7,m.steel);if(id!=='cl_halberd'&&phase===1){this.s(rig.elbows[0],0,-10,5.6,7.2,11,1.5,m.wood);this.s(rig.elbows[0],0,-10,6,6.5,10.3,1.25,m.iron);this.mark(rig.elbows[0],0,-10,7.5,m.gold,2.5);}if(id==='cl_halberd'){this.rod(rig.elbows[1],[0,-13,1],[0,25,1],.7,m.wood);this.b(rig.elbows[1],3,25,1,7,9,1,m.steel);}if(id==='cl_regent'){root.scale.setScalar(1.43+phase*.1);if(phase>1){this.s(rig.body,0,28,5,10.3,8.8,4.1,m.bruise);this.ribs(rig.body,28,9);this.s(rig.arms[0],0,-4,0,7,8,6,m.flesh);this.claws(rig.elbows[0],20,3,m.ivory);}if(phase===3)this.spikes(rig.body,7,20,34,-5,15);}}
      if(guard){root.scale.multiplyScalar(1.12);if(id==='lf_sentinel')for(const side of[-1,1]){this.cy(rig.body,side*4.5,24,-6.5,2.2,2.2,15,m.blue);this.rod(rig.body,[side*4.5,32,-6],[side*5,35,2],.55,m.rubber);}}
      if(id==='lf_runner'){root.scale.set(.93,1.1,.92);for(const side of[-1,1])this.s(rig.head,side*4,2.2,0,.7,.8,.7,m.riutex);this.rod(rig.body,[-3,33,4],[-4,21,5],.33,m.riutex);this.claws(rig.elbows[1],11,2,m.ivory);}
      if(id==='lf_spore'){for(let i=0;i<6;i++){const x=Math.sin(i*2.3)*7,y=23+i*2.5,z=-5-Math.cos(i*2.3)*2;this.rod(rig.body,[x*.5,y-5,-3],[x,y,z],.8,m.bruise);this.s(rig.body,x,y,z,2.5+i%2,3.4,2.8,m.poison);}this.s(rig.head,0,2,-3,5,5,3,m.poison);}
      if(id==='lf_mirror'){this.b(rig.head,0,0,4.3,7.8,8.1,1,this.k.mat('#788e98',.2,.85));this.rod(rig.body,[-5,33,3.8],[5,18,5],.4,m.riutex);this.rod(rig.body,[5,33,3.8],[-5,18,5],.4,m.riutex);this.s(rig.arms[0],0,-2.7,0,4.2,6,4,m.bruise);}
      if(wren){root.scale.setScalar(phase===1?1.35:phase===2?1.66:1.93);this.s(rig.head,0,3.5,-1,4.7,3.3,4,m.pale);this.b(rig.body,3.6,29,5.8,3.6,4,.25,m.paper);this.ribs(rig.body,28,7);this.s(rig.body,0,26.7,5.1,3.2+phase,4.5+phase,2.5,m.wound);this.s(rig.body,0,27.5,6.7,1.8+phase*.55,2.5+phase*.5,1.5,m.riutex);if(phase>1){this.spikes(rig.body,7,16,34,-5,11+phase*2);for(const side of[-1,1]){const extra=this.group(rig.body,side*7,25,-3);this.rod(extra,[0,0,0],[side*7,-3,-5],2.4,m.flesh);this.rod(extra,[side*7,-3,-5],[side*10,-13,1],1.5,m.flesh);this.s(extra,side*10,-14,1,2.1,3,2,m.bruise);rig.extraArms||=[];rig.extraArms.push(extra);}}if(phase===3){for(const side of[-1,1])this.s(rig.arms[side>0?1:0],side*.4,-3,-1,6,7,6,m.bruise);this.claws(rig.elbows[0],23);this.claws(rig.elbows[1],23);}}
      if(['bruto','coloso','abominacion','prototipo','cazador','hoja','espectro'].includes(id)){const heavy=['bruto','coloso','abominacion'].includes(id);root.scale.multiplyScalar(heavy?1.35:1.08);if(/cazador|hoja/.test(id))for(const arm of rig.elbows)this.claws(arm,19,2,m.ivory);if(/abominacion|prototipo/.test(id))this.spikes(rig.body,6,15,31,-5,12);if(id==='espectro'){root.scale.x*=.82;this.rod(rig.body,[0,32,5],[0,18,4],.5,m.riutex);}}
    }
    const bounds=new this.T.Box3().setFromObject(root);root.userData.height=Math.max(1,bounds.max.y);root.name='enemy-'+id+'-phase-'+phase;root.userData.modelIdentifier=id;root.userData.phase=phase;root.userData.kind='enemy';root.userData.clock=(Number(e.id)||0)*.137;return root;
  },
  spider(boss,phase=1){
    const m=this.palette,root=this.group(),body=this.group(root),scale=boss?1+(phase-1)*.13:.27,legs=[];root.scale.setScalar(scale);
    this.s(body,0,18,-12,18,15,23,boss?m.bruise:m.iron);this.s(body,0,19,9,11.5,10,13,m.iron);this.s(body,0,18.5,21,8,6.2,7,m.bruise);
    for(const side of[-1,1]){
      for(let i=0;i<4;i++){const z=-12+i*8.5,knee=[side*(26+Math.abs(i-1.5)*3),29-i%2*3,z+side*2],ankle=[side*(41+Math.abs(i-1.5)*3),2,z+(i-1.5)*9],leg=this.group(body,side*8,19,z);legs.push(leg);this.rod(leg,[0,0,0],[knee[0]-side*8,knee[1]-19,knee[2]-z],2.1,m.iron);this.s(leg,knee[0]-side*8,knee[1]-19,knee[2]-z,2.6,2.7,2.6,m.bruise);this.rod(leg,[knee[0]-side*8,knee[1]-19,knee[2]-z],[ankle[0]-side*8,ankle[1]-19,ankle[2]-z],1.4,m.iron);this.rod(leg,[ankle[0]-side*8,ankle[1]-19,ankle[2]-z],[ankle[0]-side*8+side*2,-19,ankle[2]-z+2],.65,m.ivory);}
      for(let i=0;i<3;i++)this.s(body,side*(2+i*2),21-i*.5,26-i*.5,.8+i*.15,.8,.65,m.eyes);
      this.rod(body,[side*4,16,23],[side*6,12,30],1.1,m.ivory);this.rod(body,[side*6,12,30],[side*3,10,32],.65,m.ivory);
    }
    if(boss){for(let i=0;i<5;i++)this.s(body,Math.sin(i*2.4)*11,24+Math.cos(i*2.4)*6,-13+Math.cos(i*2.1)*12,3+i%2,3.8,3.6,m.poison);this.spikes(body,3+phase,19,27,-4,6+phase*2);if(phase>1)for(const side of[-1,1])this.s(body,side*9,25,8,7,4,8,m.ivory);}
    root.userData.rig={body,spiderLegs:legs};root.userData.height=(boss?34:12)*scale;return root;
  },
  quadruped(id){
    const m=this.palette,root=this.group(),body=this.group(root),frog=id==='escupidor',rat=id==='rata',crawler=id==='rastrero',legs=[];
    const skin=frog?m.poison:id==='cl_hound'?this.tone(m.flesh,'#847b6d'):crawler?m.flesh:m.bruise;
    this.s(body,0,13,-2,rat?4:6.5,frog?7:5,rat?8:11,skin);this.s(body,0,17,8,rat?3:4.7,3.9,6,skin);this.s(body,0,15.2,14,3.4,2.3,5.8,skin);this.b(body,0,14.5,17.6,5.8,.65,4,m.dark);
    for(const side of[-1,1]){this.s(body,side*3,18,11,1.1,.9,1.1,m.dark);this.s(body,side*3,18,11.6,.35,.35,.35,m.eyes);this.cy(body,side*3.1,21,8,0,1.7,5,skin,7).rotation.z=side*-.2;for(const z of[-8,7]){const leg=this.group(body,side*5.2,12,z);legs.push(leg);this.rod(leg,[0,0,0],[side*1.8,-5.5,-1.5],1.8,skin);this.rod(leg,[side*1.8,-5.5,-1.5],[side*2.7,-11.2,1],1.2,skin);this.s(leg,side*2.7,-11.2,2,1.8,1,3,m.rubber);}}
    for(let i=0;i<3;i++)for(const side of[-1,1])this.rod(body,[side*(2-i*.5),14.7,15+i*1.5],[side*(2-i*.5),12.9,15+i*1.5],.4,m.ivory);
    if(rat){this.rod(body,[0,12,-10],[2,8,-20],1,m.bruise);this.rod(body,[2,8,-20],[-1,5,-26],.6,m.bruise);root.scale.setScalar(.65);}
    if(frog){this.s(body,0,13,3,8,7,10,m.poison);for(let i=0;i<5;i++)this.s(body,Math.sin(i*2.4)*6,18,Math.cos(i*2.4)*7,1.7,2.2,1.8,m.bruise);}
    if(crawler){root.scale.set(1.1,.78,1.06);this.ribs(body,14,5);}
    if(id==='cl_hound'){for(const side of[-1,1])this.rod(body,[side*2,20,8],[side*6,26,4],.8,m.ivory);this.ribs(body,15,6);}
    root.userData.rig={body,quadrupedLegs:legs};root.userData.height=rat?16:26;return root;
  },
  moth(){const m=this.palette,root=this.group(),body=this.group(root),wings=[];this.s(body,0,25,0,3.2,10,3.5,m.bruise);this.s(body,0,34,1,3.4,4,3.8,m.flesh);for(const side of[-1,1]){const wing=this.group(body,side*2.4,29,-1);wings.push(wing);this.s(wing,side*10,4,0,13.5,17,1.2,this.tone(m.cloth,'#908472'));this.s(wing,side*9,-10,.1,10,11,.9,m.bruise);this.s(wing,side*11,4,1,4.5,5.5,.4,m.dark);this.s(wing,side*11,4,1.4,2,2.6,.25,m.gold);for(let i=0;i<3;i++)this.rod(wing,[0,-5,1],[side*(10+i*4),14-i*4,1],.22,m.ivory);this.rod(body,[side*1.3,35,2],[side*4,42,3],.3,m.ivory);}root.userData.rig={body,wings};root.userData.height=43;return root;},
  animateEnemy(root,e,g,time,dt=.016){
    const d=root.userData,rig=d.rig;if(!rig)return;const step=Math.min(.05,Math.max(0,dt));if(g?.state==='play')d.clock=(d.clock||0)+step;const t=d.clock||time||0,dist=d.lastX===undefined?0:Math.hypot(e.x-d.lastX,e.y-d.lastY),speed=Math.min(1,dist/Math.max(.001,step)/105);d.lastX=e.x;d.lastY=e.y;
    const moving=speed>.03,cycle=t*(moving?10:1.8),attack=/wind|attack|swing|slash|chain|charge|rush|lunge|bite|cleave/.test(e.mode||e.state||'')||e.windup>0||e.slash>0,awake=!(d.sleeping&&!e.alert),frozen=e.frozen>0;
    const walk=frozen?0:speed;
    if(rig.body){rig.body.position.y=Math.sin(t*2.1)*.22;rig.body.scale.y=1+Math.sin(t*2.1)*.011;rig.body.rotation.z=Math.sin(cycle*.5)*.022*walk;rig.body.rotation.x=awake?0:.7;}
    if(rig.head){rig.head.rotation.y=Math.sin(t*.73)*.055;rig.head.rotation.z=Math.sin(t*.39+1)*.035;}
    rig.legs?.forEach((joint,i)=>{joint.rotation.x=awake?Math.sin(cycle+i*Math.PI)*.46*walk:-1.2;});
    rig.knees?.forEach((joint,i)=>{joint.rotation.x=awake?Math.max(0,Math.sin(cycle+i*Math.PI))*.42*walk:1.35;});
    rig.arms?.forEach((joint,i)=>{joint.rotation.x=d.ally?-.9+Math.sin(cycle)*.06*walk:(attack?-1.03+Math.sin(t*13+i)*.13:Math.sin(cycle+(1-i)*Math.PI)*.36*walk)-.12;joint.rotation.z=(i?-.07:.07)+(attack?(i?.15:-.15):0);});
    rig.elbows?.forEach((joint,i)=>{joint.rotation.x=d.ally?-.6:attack?-.35:Math.sin(t*1.3+i)*.035;});
    rig.extraArms?.forEach((joint,i)=>{joint.rotation.x=Math.sin(t*2.3+i)*.15-(attack?.7:.1);joint.rotation.y=Math.sin(t*1.7+i)*.2;});
    rig.spiderLegs?.forEach((joint,i)=>{joint.rotation.z=Math.sin(cycle+i*Math.PI*.7)*.1*(.2+walk);joint.rotation.y=Math.cos(cycle+i*Math.PI*.7)*.08*walk;});
    rig.quadrupedLegs?.forEach((joint,i)=>{joint.rotation.x=Math.sin(cycle+(i===0||i===3?0:Math.PI))*.55*walk;});
    rig.wings?.forEach((joint,i)=>{joint.rotation.y=Math.sin(t*7+i*Math.PI)*.48;});
    if(rig.wings&&rig.body)rig.body.position.y+=Math.sin(t*2.7)*1.2;
  },
  ally(a,g){const root=this.humanoid({skin:this.palette.flesh,cloth:this.k.mat(a.col||'#485c4b',.9),clean:true,mask:false,hair:this.palette.dark});root.userData.modelIdentifier='squad';const r=root.userData.rig;this.armor(root,r);this.s(r.head,0,3,0,5.1,3.6,4.9,this.palette.blue);const weapon=this.weapon('ak',.6);weapon.position.set(0,26,8);weapon.rotation.x=.2;root.add(weapon);root.userData.ally=true;for(const a of r.arms)a.rotation.x=-.9;for(const a of r.elbows)a.rotation.x=-.6;return root;},
  weapon(id='pistol',scale=1){
    const m=this.palette,r=this.group(),heavy=!['pistol','viper'].includes(id);this.b(r,0,1,0,heavy?3.4:2.4,2.4,heavy?10:6,m.iron);this.b(r,.5,-2,-1,1.8,5,2.2,m.rubber);this.cy(r,0,1.6,heavy?12:6,.65,.65,heavy?13:6,m.steel).rotation.x=Math.PI/2;
    this.b(r,0,2.5,-1,2.2,.9,heavy?8:5,m.steel);if(id==='shotgun'){this.b(r,0,0,6,2.4,2.4,6,m.wood);this.cy(r,0,.1,11,.5,.5,12,m.iron).rotation.x=Math.PI/2;}if(id==='ak'){this.b(r,0,.5,5,2.7,2.6,5,m.wood);this.b(r,0,-3.8,1,2,5,2.6,m.iron);}if(id==='viper')this.b(r,0,-4.1,-1,1.9,7,2,m.iron);if(/rifle|r98/.test(id)){this.cy(r,0,4.2,1,1.5,1.5,7,m.dark).rotation.x=Math.PI/2;this.cy(r,0,4.2,-3,1.7,1.7,.5,m.steel).rotation.x=Math.PI/2;}if(/flame|gl6|launcher/.test(id)){this.cy(r,0,1.2,9,1.8,1.8,10,m.iron).rotation.x=Math.PI/2;this.cy(r,-3,0,0,2.1,2.1,8,m.teal).rotation.x=Math.PI/2;}
    if(heavy){this.b(r,0,.5,-8,2.8,3,6,id==='ak'?m.wood:m.rubber);this.b(r,0,.6,-11,3.5,4,.9,m.rubber);}r.scale.setScalar(scale);return r;
  },
  prop(type,g){
    const m=this.palette,r=this.group();r.name='prop-'+type;r.userData.modelIdentifier=type;
    if(/bed|camilla/.test(type)){
      this.b(r,0,8,0,24,2,29,m.iron);this.b(r,0,10.8,0,22.8,4.5,27,m.gown);this.b(r,0,13.2,0,22.6,.7,26,m.ivory);this.s(r,0,14,-8,7.5,1.4,4,m.paper);
      for(const x of[-10,10])for(const z of[-12,12]){this.rod(r,[x,7,z],[x,2,z],.8,m.steel);this.cy(r,x,1.8,z,1.7,1.7,1,m.rubber,10).rotation.z=Math.PI/2;}
      for(const z of[-13.5,13.5]){for(const x of[-11,11])this.rod(r,[x,8,z],[x,17,z],.7,m.steel);this.rod(r,[-11,17,z],[11,17,z],.7,m.steel);}return r;
    }
    if(/locker|wardrobe/.test(type)){
      this.b(r,0,22,0,27,44,26,m.blue);this.b(r,0,22,13.2,25,41,.8,m.iron);this.b(r,-11.5,22,13.8,.4,40,.3,m.steel);for(let i=0;i<4;i++)this.b(r,0,34-i*2,13.8,14,.55,.45,m.dark);this.b(r,7,20,14.2,1,5,1,m.steel);this.b(r,-6,25,14.1,5,2,.2,m.paper);return r;
    }
    if(/shelf|book/.test(type)){
      this.b(r,0,23,-12,29,46,1.2,m.wood);for(const x of[-14,14])this.b(r,x,23,0,1.5,46,27,m.wood);for(const y of[2,14,28,42])this.b(r,0,y,0,29,1.4,27,m.wood);
      for(let j=0;j<3;j++)for(let i=0;i<4;i++){const book=this.b(r,-10+i*6,8.5+j*14,4,3.7,9+i%2*2,11,[m.blue,m.rust,m.teal,m.paper][(i+j)%4]);book.rotation.z=(i===2?.13:0);}return r;
    }
    if(/pillar/.test(type)){this.b(r,0,30,0,30,60,30,m.iron);this.b(r,0,5,0,32,5,32,m.steel);this.b(r,0,56,0,32,4,32,m.steel);return r;}
    if(/bars/.test(type)){for(const x of[-12,-4,4,12])this.rod(r,[x,0,0],[x,58,0],.7,m.iron);for(const y of[4,49])this.rod(r,[-15,y,0],[15,y,0],1.1,m.iron);return r;}
    if(/machine|generator/.test(type)){this.b(r,0,16,0,26,32,27,m.iron);this.b(r,0,27,14,18,7,1,m.dark);this.b(r,0,27.5,14.6,14,4.3,.2,m.riutex);this.cy(r,-5,15,14,3,3,1.5,m.steel).rotation.x=Math.PI/2;this.cy(r,6,15,14,3,3,1.5,m.rust).rotation.x=Math.PI/2;for(let i=0;i<4;i++)this.b(r,0,5+i*1.8,14,20,.65,.7,m.dark);return r;}
    if(/barrel|drum/.test(type)){this.cy(r,0,12,0,10,10,24,m.rust,16);this.ring(r,0,5,0,10,.8,m.iron,'y');this.ring(r,0,19,0,10,.8,m.iron,'y');this.cy(r,3,24,0,1.4,1.4,.5,m.iron);return r;}
    if(/crate|chest|caja/.test(type)){this.b(r,0,9,0,26,18,25,m.wood);for(const y of[3,15])this.b(r,0,y,12.7,27,2.6,1,m.iron);for(const x of[-9,9])this.b(r,x,9,13.2,1.4,18,.8,m.iron);this.b(r,0,11,13.8,3.8,4,1,m.gold);return r;}
    const table=/table|counter|desk|workbench/.test(type),bench=/bench/.test(type);
    if(table||bench){const y=bench?11:18;this.b(r,0,y,0,30,2.7,27,m.wood);for(const x of[-12,12])for(const z of[-10,10])this.b(r,x,y*.5,z,1.7,y,1.7,m.iron);if(type==='desk'){this.b(r,7,11,-1,12,12,21,m.wood);for(let i=0;i<2;i++)this.b(r,7,8+i*5,10,4,.6,1,m.steel);}if(type==='counter')this.b(r,0,8.5,0,28,15,25,m.blue);return r;}
    if(/chair/.test(type)){this.b(r,0,10,0,11,2,12,m.wood);this.b(r,0,18,-5,11,16,1.4,m.wood);for(const x of[-4,4])for(const z of[-4,4])this.b(r,x,5,z,1.2,10,1.2,m.iron);return r;}
    this.b(r,0,7,0,19,14,18,m.iron);this.b(r,0,14.3,0,17,.8,16,m.steel);return r;
  },
  stairs(it){const m=this.palette,r=this.group();for(let i=0;i<7;i++){const h=(i+1)*2.5;this.b(r,0,h*.5,12-i*4,24,h,4.2,i%2?m.iron:m.steel);this.b(r,0,h+.14,13.2-i*4,24,.28,.55,m.ivory);}for(const side of[-1,1]){this.rod(r,[side*13,3,14],[side*13,24,-14],.65,m.steel);this.rod(r,[side*13,12,14],[side*13,32,-14],.65,m.steel);for(const z of[-12,12])this.rod(r,[side*13,z<0?17:3,z],[side*13,z<0?32:12,z],.6,m.iron);}
    const arrow=this.group(r,0,35,0),down=/down|stairs_dn|cl_finish/.test((it.id||'')+' '+(it.type||''));this.cy(arrow,0,0,0,.75,.75,8,m.lamp,10);const cone=this.cy(arrow,0,down?-7:7,0,0,3,6,m.lamp,10);if(down)cone.rotation.z=Math.PI;r.userData.arrow=arrow;r.userData.arrowBase=35;r.userData.markerHeight=46;r.userData.modelIdentifier='stairs';return r;},
  item(it,g){
    const t=String(it.type||''),id=String(it.id||''),m=this.palette;let r=this.group();r.name='item-'+t;r.userData.modelIdentifier=t;r.userData.markerHeight=12;
    if(/stairs|_up|_down|to_cells|to_hub|finish|leave|exit|return|_back/.test(t)||/^(wx_down|ds_finish|cl_finish|lf_return)$/.test(id))return this.stairs(it);
    if(t==='doc'||/document|note|letter|record/.test(t)){for(let i=0;i<3;i++)this.b(r,-i*.13,.14+i*.18,i*.14,8,.14,10,m.paper);for(let i=0;i<6;i++)this.b(r,-.5,.73,-3+i*.9,5-i%3*.8,.06,.12,m.iron);this.b(r,1.7,.74,3.1,3.1,.07,1.6,m.red);const fold=this.b(r,3.4,1,-4.2,1.2,.1,1.8,m.ivory);fold.rotation.z=.55;r.rotation.y=(POVArt.hash(id)%9)*.13;return r;}
    if(t==='savebed'){r=this.prop('bed',g);this.rod(r,[12,0,-12],[12,27,-12],.65,m.steel);this.b(r,12,25,-11,5.2,6.2,.7,m.ivory);this.mark(r,12,25,-10.5,m.teal,1.7);this.b(r,0,13.7,5,22.4,.15,3,m.blue);r.userData.markerHeight=30;r.userData.modelIdentifier='savebed';return r;}
    if(t==='caja'||/stash|chest/.test(t))return this.prop('crate',g);
    if(t==='h_hide')return this.prop('locker',g);
    if(/workbench/.test(t)){r=this.prop('desk',g);this.rod(r,[-8,20,-3],[5,20,5],.6,m.steel);this.ring(r,-9,20,-4,2,.6,m.steel,'y');this.cy(r,8,21,-6,2.8,3.2,5,m.iron);r.userData.markerHeight=29;return r;}
    if(/wash|shower/.test(t)){this.b(r,0,.5,0,25,1,26,m.iron);for(let i=0;i<7;i++)this.b(r,-9+i*3,.8,0,.55,.5,23,m.steel);this.rod(r,[10,1,-10],[10,47,-10],.8,m.steel);this.rod(r,[10,47,-10],[0,47,1],.8,m.steel);this.cy(r,0,46.5,1,4.8,4.8,1,m.steel);this.b(r,10,27,-8,3,9,3,m.blue);this.s(r,10,28,-6.4,.65,.65,.4,m.lamp);r.userData.markerHeight=49;return r;}
    if(/safe|cab/.test(t)){this.b(r,0,12,0,22,24,19,m.iron);this.b(r,0,12,10,19.5,21,1.2,m.steel);this.ring(r,2,13,11.2,3.1,.5,m.iron);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;this.rod(r,[2,13,11.5],[2+Math.sin(a)*3,13+Math.cos(a)*3,11.5],.3,m.iron);}this.b(r,-6,13,11.2,1.2,6,.8,m.gold);r.userData.markerHeight=27;return r;}
    if(/mix|hydro|eeg/.test(t)){r=this.prop('desk',g);if(/mix/.test(t))for(let i=0;i<3;i++){const x=-7+i*7;this.cy(r,x,23,0,1.7,1.7,7,m.glass);this.cy(r,x,22.3,0,1.3,1.3,4.7,[m.riutex,m.poison,m.gold][i]);this.cy(r,x,27,0,1.9,1.9,1,m.steel);}else if(/hydro/.test(t))for(let i=0;i<3;i++){this.rod(r,[-8+i*8,19,-5],[-8+i*8,31,-5],.7,m.steel);this.ring(r,-8+i*8,28,-3,2.7,.45,i%2?m.rust:m.gold);}else{this.b(r,0,26,-3,15,12,8,m.blue);this.b(r,0,27,1.2,12,7,.35,m.dark);for(let i=0;i<6;i++)this.b(r,-4.5+i*1.8,27+Math.sin(i*2.2),1.5,1.3,.25,.15,m.lamp);this.rod(r,[5,22,0],[10,19,8],.2,m.iron);}r.userData.markerHeight=33;return r;}
    if(t==='lf_core'){this.cy(r,0,5,0,10,12,10,m.iron,20);for(const side of[-1,1])this.rod(r,[side*8,10,0],[side*8,35,0],.9,m.steel);this.cy(r,0,22,0,7,7,23,m.glass,20);this.cy(r,0,22,0,3.5,3.5,17,m.riutex,14);this.cy(r,0,35,0,9,9,4,m.iron,20);for(const y of[13,30])this.ring(r,0,y,0,7.5,.6,m.gold,'y');this.b(r,0,12,10,9,7,3,m.blue);this.b(r,0,13,11.6,6,3,.3,m.lamp);r.userData.markerHeight=41;return r;}
    if(/clock/.test(t)){this.b(r,0,17,0,14,34,9,m.wood);this.cy(r,0,26,5,5.3,5.3,1,m.ivory,20).rotation.x=Math.PI/2;this.ring(r,0,26,5.7,5.1,.35,m.gold);for(let i=0;i<12;i++){const a=i*Math.PI/6;this.s(r,Math.sin(a)*4.3,26+Math.cos(a)*4.3,5.8,.2,.2,.15,m.iron);}const hour=this.group(r,0,26,6),minute=this.group(r,0,26,6.15);this.b(hour,0,1.3,0,.35,2.6,.15,m.dark);this.b(minute,0,1.9,0,.22,3.8,.15,m.dark);this.rod(r,[0,18,4.9],[0,9,4.9],.25,m.gold);this.s(r,0,9,4.9,2,2,.6,m.gold);r.userData.hour=hour;r.userData.minute=minute;r.userData.markerHeight=37;return r;}
    if(/bell/.test(t)){for(const x of[-10,10])this.b(r,x,18,0,2,36,3,m.wood);this.b(r,0,36,0,24,3,4,m.wood);const bell=this.group(r,0,31,0);this.cy(bell,0,-5,0,3,8,10,m.gold,20);this.ring(bell,0,-10,0,8,.5,m.gold,'y');this.rod(bell,[0,-6,0],[0,-14,0],.4,m.iron);this.s(bell,0,-14,0,1.1,1.4,1.1,m.iron);r.userData.bell=bell;r.userData.markerHeight=40;return r;}
    if(/radio/.test(t)){this.b(r,0,4,0,11,8,6,m.blue);this.b(r,-2,4,3.2,5,4,.3,m.dark);for(let i=0;i<4;i++)this.b(r,-2,2.7+i*.9,3.5,4.2,.22,.15,m.steel);this.s(r,3.6,5.6,3.5,.4,.4,.3,m.lamp);this.rod(r,[4,8,0],[5.8,20,0],.22,m.steel);r.userData.markerHeight=21;return r;}
    if(/case|cache|reserve|reward/.test(t)){this.b(r,0,4,0,17,8,12,m.blue);this.b(r,0,8.2,0,17.5,.9,12.3,m.iron);for(const x of[-5,5])this.b(r,x,5.3,6.2,1,4,.6,m.gold);this.rod(r,[-2,8.5,0],[-2,10.5,0],.4,m.steel);this.rod(r,[2,8.5,0],[2,10.5,0],.4,m.steel);this.rod(r,[-2,10.5,0],[2,10.5,0],.4,m.steel);return r;}
    if(t==='sample'||/inj_|serum|cure|vial/.test(t)){const color=t==='sample'?m.riutex:/green|cure/.test(t)?m.poison:/yellow/.test(t)?m.gold:m.riutex;this.cy(r,0,5,0,1.6,1.6,7,m.glass,12);this.cy(r,0,4,0,1.25,1.25,4.7,color,12);this.cy(r,0,9,0,1.9,1.9,1.5,m.steel,12);this.cy(r,0,.9,0,1.65,1.65,1,m.iron);if(/^inj_/.test(t)){this.rod(r,[0,10,0],[0,14,0],.16,m.steel);this.b(r,0,8.5,0,5,.5,1,m.ivory);}this.b(r,0,5.3,1.65,2.1,2.6,.15,m.paper);return r;}
    if(t==='key'||/llave|medallion/.test(t)||/key/.test(id)){this.ring(r,-2,.65,0,2,.4,m.gold,'y');this.rod(r,[0,.65,0],[5,.65,0],.45,m.gold);for(const x of[2.3,4.6])this.b(r,x,.7,1.2,.8,.8,2,m.gold);this.b(r,-2,.25,-2.5,4,.3,2,m.paper);return r;}
    if(/valve|valv/.test(t+id)){this.ring(r,0,5,0,4.2,.65,m.rust);for(let i=0;i<4;i++){const a=i*Math.PI/2;this.rod(r,[0,5,0],[Math.sin(a)*4.2,5+Math.cos(a)*4.2,0],.35,m.rust);}this.cy(r,0,5,-1,.9,.9,3,m.steel).rotation.x=Math.PI/2;return r;}
    if(t==='adv_weapon'||/^w_|^(?:pistol|shotgun|viper|rifle|r98|flamethrower|gl6|launcher|ak)$/.test(t)){const wid=it.weapon||t.replace(/^w_/,'')||'pistol',gun=this.weapon(wid,.75);gun.rotation.z=Math.PI/2;gun.position.y=3.2;r.add(gun);this.b(r,0,.2,0,10,.35,23,m.rubber);return r;}
    if(/am_|ammo|shell|fuel|grenade/.test(t)){this.b(r,0,2.8,0,9,5.6,7,m.teal);this.b(r,0,5.9,0,9.4,.6,7.4,m.iron);this.b(r,0,3,3.6,7.2,2.4,.2,m.paper);for(let i=0;i<3;i++){this.cy(r,-2+i*2,6.7,1.4,.37,.52,1.7,m.gold,8);this.s(r,-2+i*2,7.7,1.4,.37,.5,.37,m.steel);}return r;}
    if(/screw|powder|material/.test(t)){if(/powder/.test(t)){this.cy(r,0,3.3,0,2.5,2.5,6.6,m.iron);this.cy(r,0,6.8,0,2.8,2.8,.7,m.steel);this.b(r,0,3,2.55,3.3,3,.15,m.paper);}else for(let i=0;i<3;i++){this.rod(r,[-3+i*2,.6,-2],[i*2,.6,3],.35,m.steel);this.cy(r,-3+i*2,.6,-2,.8,.8,.6,m.iron).rotation.x=Math.PI/2;}return r;}
    if(/part|ingredient|artefact/.test(t)){if(/cell|battery/.test(it.part||'')){this.b(r,0,4,0,6,8,5,m.blue);this.b(r,0,8.2,0,6.2,.6,5.2,m.steel);for(const x of[-1.7,1.7])this.cy(r,x,9,0,.6,.6,1,m.gold);}else{this.ring(r,0,4.6,0,3.4,.85,m.steel);for(let i=0;i<8;i++){const a=i*Math.PI/4,part=this.b(r,Math.sin(a)*4.2,4.6+Math.cos(a)*4.2,0,1.3,1.7,1.8,m.iron);part.rotation.z=-a;}this.cy(r,0,4.6,0,1,1,2,m.gold).rotation.x=Math.PI/2;}return r;}
    if(/puzzle|terminal|reactor|mix|hydro|generator|safe|pad|cab|panel|h_|cl_|lf_|wx_|ds_/.test(t)){this.b(r,0,10,0,15,20,10,m.iron);this.b(r,0,21,0,18,3,13,m.blue);this.b(r,0,17,5.4,11,5,.6,m.dark);this.b(r,0,17.4,5.8,8.5,3,.2,m.riutex);for(const x of[-4,0,4])this.s(r,x,10,5.6,.7,.7,.5,x?m.gold:m.red);this.b(r,0,4.5,5.4,10,2.5,.3,m.paper);r.userData.markerHeight=26;return r;}
    this.b(r,0,3,0,7,6,7,m.blue);this.b(r,0,6.3,0,7.4,.6,7.4,m.steel);return r;
  },
  animateItem(root,it,g,time,dt){
    const d=root.userData;if(d.arrow)d.arrow.position.y=d.arrowBase+Math.sin(time*1.7)*.5;
    if(d.hour||d.minute){const v=g?.story?.mechanisms?.clock||[12,0];if(d.hour)d.hour.rotation.z=-((v[0]%12)+v[1]/60)*Math.PI/6;if(d.minute)d.minute.rotation.z=-v[1]*Math.PI/30;}
    if(d.bell)d.bell.rotation.z=Math.sin(time*.8)*.018;
  }
};
