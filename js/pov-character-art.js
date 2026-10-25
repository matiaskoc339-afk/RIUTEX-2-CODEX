// Dirección de personajes: escultura de planos biselados y texturas de píxel pintadas.
// Solo las fábricas de personajes y las manos utilizan esta biblioteca; el escenario no cambia.
const POVCharacterArt={
  geometryCache:new Map(),materials:new Map(),textures:new Map(),depth:0,
  init(kit){this.k=kit;this.T=kit.THREE;return this;},
  hash(s){let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;},
  texture(kind,color){
    const key=kind+color;if(this.textures.has(key))return this.textures.get(key);
    if(typeof document==='undefined')return null;
    const T=this.T,cv=document.createElement('canvas'),face=kind.startsWith('face'),w=face?32:64,h=face?40:64;cv.width=w;cv.height=h;
    const c=cv.getContext('2d'),im=c?.createImageData?.(w,h);if(!im?.data)return null;
    const base=new T.Color(color),rgb=[base.r,base.g,base.b].map(v=>Math.round(T.MathUtils.clamp(v,0,1)*255));
    const srgb=new T.Color(color).getHexString();for(let j=0;j<3;j++)rgb[j]=parseInt(srgb.slice(j*2,j*2+2),16);
    const put=(x,y,col)=>{if(x<0||y<0||x>=w||y>=h)return;const i=(y*w+x)*4;im.data[i]=col[0];im.data[i+1]=col[1];im.data[i+2]=col[2];im.data[i+3]=255;};
    const tint=f=>rgb.map(v=>Math.min(255,Math.max(0,Math.round(v*f))));
    const rect=(x,y,a,b,col)=>{for(let yy=y;yy<y+b;yy++)for(let xx=x;xx<x+a;xx++)put(xx,yy,col);};
    let seed=this.hash(key),random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const grain=random(),fold=kind==='cloth'||kind==='apron'?Math.floor((Math.sin(x*.27)+1)*2)/45:0;
      put(x,y,tint((grain<.035?.86:grain>.975?1.06:.97)+fold));
    }
    if(face){
      // Cuencas, pómulos, cejas y boca: píxeles dibujados en el rostro, sin globos oculares flotantes.
      rect(0,0,5,40,tint(.77));rect(27,0,5,40,tint(.72));rect(2,27,5,10,tint(.67));rect(25,27,5,10,tint(.68));
      rect(6,4,20,2,tint(1.07));rect(7,11,7,2,tint(.53));rect(19,11,7,2,tint(.49));
      rect(7,13,7,4,tint(.59));rect(19,13,7,4,tint(.57));rect(8,15,6,2,[34,37,34]);rect(19,15,6,2,[34,37,34]);
      put(10,15,[115,120,104]);put(21,15,[115,120,104]);rect(8,18,6,1,tint(.7));rect(19,18,6,1,tint(.68));
      rect(15,16,3,9,tint(1.09));rect(13,24,2,2,tint(.65));rect(18,24,2,2,tint(.6));
      rect(8,23,4,3,tint(.87));rect(22,23,3,3,tint(.86));rect(12,29,10,1,tint(.51));rect(14,31,6,1,tint(.68));rect(12,35,11,1,tint(.84));
      if(kind==='face-infected'){rect(23,17,2,11,[89,64,61]);rect(24,28,3,3,[91,57,56]);rect(7,25,2,6,tint(.5));rect(12,29,10,2,[67,43,45]);put(14,29,[175,165,134]);put(18,29,[175,165,134]);}
      if(kind==='face-clean'){rect(11,31,13,3,tint(.79));rect(4,21,2,4,tint(.75));}
      if(kind==='face-nurse'){rect(7,11,7,2,tint(.82));rect(19,11,7,2,tint(.82));rect(8,12,6,1,[80,66,57]);rect(19,12,6,1,[80,66,57]);rect(12,29,10,2,[113,68,65]);rect(14,31,7,1,tint(.88));rect(5,19,2,10,[114,69,65]);rect(7,25,2,4,[122,72,66]);}
      if(kind==='face-wren'){for(const y of [5,8])rect(8,y,17,1,tint(.7));rect(5,18,3,8,tint(.62));rect(25,18,2,10,tint(.59));rect(8,15,6,2,[20,28,29]);put(21,15,[152,169,163]);}
    }else if(kind==='skin'||kind==='mutant'){
      for(let j=0;j<22;j++){const x=Math.floor(random()*60),y=Math.floor(random()*60);rect(x,y,1+Math.floor(random()*4),2+Math.floor(random()*3),tint(j%3?.9:.8));}
      for(let y=10;y<54;y++){const x=23+Math.floor(Math.sin(y*.15)*3);put(x,y,kind==='mutant'?[103,149,156]:tint(.84));if(y%9<4)put(x+1,y,kind==='mutant'?[72,112,126]:tint(.89));}
      if(kind==='mutant')for(let y=20;y<40;y++){const x=26+Math.floor((y-20)*.5);put(x,y,[91,133,145]);}
    }else if(kind==='cloth'||kind==='apron'){
      for(const x of [3,59]){rect(x,0,1,64,tint(.63));for(let y=1;y<64;y+=4)rect(x+1,y,1,2,tint(1.11));}
      rect(9,21,18,1,tint(.67));rect(9,21,1,13,tint(.67));rect(26,21,1,13,tint(.67));rect(10,33,16,1,tint(.73));
      if(kind==='apron'){
        for(let j=0;j<7;j++){const x=28+j*3,y=18+Math.floor(random()*17);rect(x,y,2+Math.floor(random()*4),4+Math.floor(random()*8),[91+j%2*12,44,43]);for(let k=0;k<12+j;k++)if(k<9||k%3)put(x+1,y+k,[103,47,43]);}
        rect(38,39,9,3,[96,45,43]);rect(35,41,8,2,[108,52,47]);rect(9,58,44,2,tint(.58));
      }
    }else if(kind==='metal'){
      for(let j=0;j<24;j++){const x=Math.floor(random()*60),y=Math.floor(random()*60);rect(x,y,2+Math.floor(random()*6),1,tint(j%2?.63:1.18));}
      rect(1,0,1,64,tint(1.17));rect(61,0,2,64,tint(.56));
    }else if(kind==='wing'){
      for(let y=0;y<64;y++)for(let x=0;x<64;x++)if((x+y*2)%17<2)put(x,y,tint(.66));
      for(let y=14;y<37;y++)for(let x=25;x<47;x++){const r=((x-36)/11)**2+((y-25)/11)**2;if(r<1)put(x,y,tint(r<.3?.4:r<.58?.75:.51));}
    }else if(kind==='chitin'){
      for(let y=7;y<64;y+=12){rect(0,y,64,2,tint(.58));rect(0,y+2,64,1,tint(1.15));}
      for(let x=9;x<64;x+=18)rect(x,0,1,64,tint(.7));
    }
    c.putImageData(im,0,0);const texture=new T.CanvasTexture(cv);texture.magFilter=T.NearestFilter;texture.minFilter=T.NearestMipmapNearestFilter;texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=1;texture.userData.pixelCharacter=true;texture.userData.kind=kind;this.textures.set(key,texture);return texture;
  },
  material(source,kind=null){
    if(source?.userData?.pixelCharacter&&(!kind||source.userData.kind===kind))return source;
    if(!source?.isMaterial)source=this.k.mat(source||'#889284');
    const palette=POV3DAssets.palette||{},skin=[palette.flesh,palette.pale,palette.bruise,palette.wound,palette.poison].includes(source),shell=/spider|matriarch|hound|scuttler/.test(this.entity?.type||'');
    kind||=shell&&(skin||source===palette.iron)?'chitin':skin?'skin':source===palette.riutex?'mutant':source.metalness>.3?'metal':'cloth';
    const key=source.uuid+kind;if(this.materials.has(key))return this.materials.get(key);
    const m=source.clone(),color=source.userData.baseColor||(source===palette.poison&&kind==='skin'?'#747a68':'#'+source.color.getHexString()),texture=this.texture(kind,color);
    m.map=texture;m.normalMap=m.bumpMap=m.roughnessMap=null;m.flatShading=true;m.roughness=kind==='metal'?.76:.96;m.metalness=kind==='metal'?.22:0;
    if(texture)m.color.set('#ffffff');m.userData.pixelCharacter=true;m.userData.baseColor=color;m.userData.kind=kind;m.needsUpdate=true;this.materials.set(key,m);return m;
  },
  geometry(key,make){if(!this.geometryCache.has(key)){const g=make();g.userData.shared=true;g.userData.pixelCharacter=true;this.geometryCache.set(key,g);}return this.geometryCache.get(key);},
  mesh(p,geo,material){const m=new this.T.Mesh(geo,material);m.castShadow=m.receiveShadow=true;m.userData.pixelCharacter=true;p.add(m);return m;},
  loftGeometry(sections){
    const T=this.T,ring=[[-.65,-1],[.65,-1],[1,-.64],[1,.64],[.65,1],[-.65,1],[-1,.64],[-1,-.64]],pos=[],uv=[];
    const point=(j,i)=>{const [y,x,z,off=0]=sections[j],[a,b]=ring[i%8];return [a*x,y,b*z+off];};
    const tri=(a,b,c,ta,tb,tc)=>{pos.push(...a,...b,...c);uv.push(...ta,...tb,...tc);};
    for(let j=0;j<sections.length-1;j++)for(let i=0;i<8;i++){
      const a=point(j,i),b=point(j,(i+1)%8),c=point(j+1,(i+1)%8),d=point(j+1,i),u=i/8,v=j/(sections.length-1),v2=(j+1)/(sections.length-1);
      tri(a,c,b,[u,v],[(i+1)/8,v2],[(i+1)/8,v]);tri(a,d,c,[u,v],[u,v2],[(i+1)/8,v2]);
    }
    for(const j of [0,sections.length-1])for(let i=0;i<8;i++){
      const center=[0,sections[j][0],sections[j][3]||0],a=point(j,i),b=point(j,(i+1)%8);if(j===0)tri(center,a,b,[.5,.5],[0,1],[1,1]);else tri(center,b,a,[.5,.5],[1,1],[0,1]);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();g.userData.pixelCharacter=true;return g;
  },
  loft(p,sections,mat,kind=null){return this.mesh(p,this.loftGeometry(sections),this.material(mat,kind));},
  volume(p,x,y,z,rx,ry,rz,mat){
    if(ry===12&&rx===11.5&&mat===POV3DAssets.palette?.poison){rx=8.6;ry=8.5;rz=6.2;z+=1.3;y+=1;}
    const g=this.geometry('sculpt',()=>this.loftGeometry([[-1,.48,.48],[-.75,.86,.86],[0,1,1],[.72,.88,.88],[1,.5,.5]])),mesh=this.mesh(p,g,this.material(mat));mesh.position.set(x,y,z);mesh.scale.set(rx,ry,rz);return mesh;
  },
  box(p,x,y,z,sx,sy,sz,mat){const g=this.geometry('bevelbox',()=>this.loftGeometry([[-.5,.44,.44],[-.4,.5,.5],[.4,.5,.5],[.5,.44,.44]])),mesh=this.mesh(p,g,this.material(mat));mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);return mesh;},
  cylinder(p,x,y,z,rt,rb,h,mat,n=8){
    const scale=Math.max(rt,rb,.001),key='limb:'+rt/scale+':'+rb/scale,g=this.geometry(key,()=>this.loftGeometry([[-.5,rb/scale,.75*rb/scale],[-.32,.98*rb/scale,.82*rb/scale],[.22,rt/scale*1.08,.8*rt/scale],[.5,rt/scale,.7*rt/scale]])),mesh=this.mesh(p,g,this.material(mat));mesh.position.set(x,y,z);mesh.scale.set(scale,h,scale);return mesh;
  },
  rod(p,a,b,r,mat){const T=this.T,from=new T.Vector3(...a),to=new T.Vector3(...b),delta=to.clone().sub(from),mid=from.add(to).multiplyScalar(.5),m=this.cylinder(p,mid.x,mid.y,mid.z,r*.87,r,Math.max(.001,delta.length()),mat);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;},
  face(parent,skin,clean){
    const T=this.T,positions=[],uv=[],outline=[[-2.15,-2.9,1.92],[2.15,-2.9,1.92],[2.75,-1.4,2.33],[2.75,1.35,2.33],[2.1,2.8,2.04],[-2.1,2.8,2.04],[-2.75,1.35,2.33],[-2.75,-1.4,2.33]],center=[0,0,2.47];
    for(let i=0;i<8;i++)for(const p of [center,outline[i],outline[(i+1)%8]]){positions.push(...p);uv.push((p[0]+3)/6,(p[1]+3.6)/7.2);}
    const type=POV3DAssets.identity(this.entity||{}),kind=clean?'face-clean':type==='enfermera'?'face-nurse':type==='lf_wren'?'face-wren':'face-infected';
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return this.mesh(parent,geo,this.material(skin,kind));
  },
  humanoid(A,cfg={}){
    const m=A.palette,root=A.group(),body=A.group(root),nurse=!cfg.clean&&A.identity(this.entity||{})==='enfermera',skin=this.material(cfg.skin||m.flesh,'skin'),cloth=this.material(cfg.cloth||m.cloth,'cloth'),wide=(cfg.wide||1)*(nurse?.9:1),rig={body,arms:[],elbows:[],legs:[],knees:[],skin,cloth};
    this.loft(body,[[18.4,4.6*wide,2.5],[21,5.1*wide,3],[25,5.6*wide,3.1],[29.8,7.1*wide,3.7],[32.6,6.9*wide,3.3],[34.1,4.4*wide,2.35]],cloth);
    this.loft(body,[[16.8,4.8*wide,2.5],[18.5,5.2*wide,2.9],[20.5,4.7*wide,2.6]],cloth);
    this.box(body,0,20.2,.1,10*wide,.8,5.5,m.rubber);this.box(body,.5,20.2,3.03,1.8,1.1,.3,m.iron);
    this.cylinder(body,0,35.4,0,1.55,2,3,skin);const head=rig.head=A.group(body,0,39.7,.1);head.scale.set(.88,.82,.87);head.userData.characterHead=true;
    this.loft(head,[[-3.8,1.85,1.55],[-2.65,2.6,2.05],[-.5,3.3,2.35],[1.9,3.2,2.25],[3.5,2.5,1.85],[4.1,1.65,1.2]],skin);
    this.face(head,skin,cfg.clean);this.volume(head,0,-.25,2.48,.48,.85,.63,skin);
    for(const s of [-1,1])this.box(head,s*3.25,-.2,0,.65,1.8,1.15,skin);
    if(cfg.blind){this.box(head,0,.6,2.58,6.1,2,.3,m.rubber);this.rod(head,[-2.7,1.4,2.83],[2.7,-.25,2.83],.12,m.ivory);}
    if(cfg.mask){this.box(head,0,-1.6,2.7,5.2,2.1,.45,m.gown);this.rod(head,[-2.3,-1.45,2.98],[2.3,-1.45,2.98],.08,m.iron);}
    if(!cfg.bald)this.volume(head,0,2.7,-.35,3.25,1.7,2.6,cfg.hair||m.dark);
    if(nurse)this.volume(head,0,1.4,-2.2,1.5,1.8,1.1,m.dark);
    for(const side of [-1,1]){
      const hip=A.group(root,side*2.9*wide,18.6,0),knee=A.group(hip,0,-8.7,.1);rig.legs.push(hip);rig.knees.push(knee);
      this.loft(hip,[[-9,1.45*wide,1.65],[-6,1.8*wide,1.85],[-2,2.3*wide,2.05],[.9,2.05*wide,1.9]],cloth);
      this.loft(knee,[[-8.8,1.25*wide,1.25],[-6.5,1.45*wide,1.55],[-2.4,1.65*wide,1.7],[.4,1.5*wide,1.6]],cfg.bareLegs?skin:cloth);
      this.box(knee,0,-8.7,1.25,3.4*wide,2.3,5.9,m.rubber);this.box(knee,0,-9.8,1.4,3.5*wide,.45,6.1,m.dark);
      const shoulder=A.group(body,side*7.15*wide,32.4,0),elbow=A.group(shoulder,side*.4,-7.5,0);rig.arms.push(shoulder);rig.elbows.push(elbow);
      this.loft(shoulder,[[-7.8,1.35*wide,1.35],[-5.9,1.65*wide,1.65],[-2.1,2.1*wide,1.9],[.65,1.75*wide,1.7]],cfg.bareArms?skin:cloth);
      this.loft(elbow,[[-7.2,1.05*wide,.85],[-5.1,1.25*wide,1.1],[-2.3,1.65*wide,1.45],[.3,1.35*wide,1.3]],skin);
      this.box(elbow,0,-8,.15,2.5*wide,2.8,1.6,skin);
      for(let i=0;i<4;i++){const x=(i-1.5)*.58*wide;this.rod(elbow,[x,-8.4,.7],[x,-10.35+.18*Math.abs(i-1.5),1],.27*wide,skin);}
      this.rod(elbow,[-side*1.1,-7.4,.75],[-side*1.5,-8.9,1.1],.35,skin);
    }
    if(cfg.coat){
      for(const side of [-1,1])this.loft(body,[[12.2,2.45*wide,.26,3.4],[16,2.75*wide,.3,3.6],[23,2.55*wide,.32,3.5],[29,2.8*wide,.3,3.75]],cloth).position.x=side*2.85*wide;
      this.box(body,0,25,4.1,.38,11,.2,m.dark);for(const y of [22,26,30])this.box(body,.3,y,4.3,.35,.35,.2,m.ivory);
    }
    if(!cfg.clean){this.box(body,-3.4*wide,28.3,3.45,2.1,4.6,.14,m.wound);this.rod(body,[2.6,31,3.8],[4.1,25.8,3.5],.16,m.bruise);}
    const type=cfg.clean?'':A.identity(this.entity||{});rig.lean=/vacio|trepador|aullador|listener/.test(type)?.16:/sonambulo|enfermera/.test(type)?.07:0;
    root.userData.rig=rig;root.userData.height=44.5;root.userData.artStyle='pixel-sculpt';return root;
  },
  apron(A,p){
    const T=this.T,m=A.palette,geo=new T.PlaneGeometry(15,23,8,8),a=geo.attributes.position;
    for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),f=(y+11.5)/23,width=f>.63?.64+(1-f)*.5:1;a.setXYZ(i,x*width,y,5.2-x*x*.016+Math.cos(x*.65)*.1);}
    geo.computeVertexNormals();const mat=this.material(m.gown,'apron');mat.side=T.DoubleSide;const mesh=this.mesh(p,geo,mat);mesh.position.y=24.5;
    for(const s of [-1,1])this.rod(p,[s*4.4,35,2.7],[s*3.5,32,4.8],.29,m.rubber);
    this.box(p,0,28.8,5.4,12,.55,.35,m.rubber);return mesh;
  },
  quadruped(A,id){
    const m=A.palette,root=A.group(),body=A.group(root),legs=[],rat=id==='rata',frog=id==='escupidor',skin=this.material(id==='cl_hound'?m.pale:frog?m.poison:m.bruise,'skin'),dark=m.dark;
    this.volume(body,0,14,-4,frog?8:5.6,frog?8:5.8,11.5,skin);this.volume(body,0,17,5,6,6.5,7.5,skin);
    this.loft(body,[[11,3.4,4,12],[15,4.2,5.4,11],[19,3.6,4.7,10],[21,2.2,3.1,9]],skin);
    this.box(body,0,13.6,17,4.5,1.9,7.4,skin);
    const jaw=A.group(body,0,12.4,13),tail=rat?A.group(body,0,13,-14):null;
    this.box(jaw,0,-.7,3.5,4.4,.9,6.8,dark);
    for(const s of [-1,1]){
      this.box(body,s*3.1,18.3,13.5,.4,.65,1.8,dark);this.box(body,s*3.15,18.4,14,.22,.23,.7,m.eyes);
      if(!frog){const ear=this.loft(body,[[19.5,1.35,1.1,9],[22,1,.75,8],[25,.05,.05,7]],skin);ear.position.x=s*3.1;}
      for(let i=0;i<3;i++)this.cylinder(jaw,s*(.8+i*.65),-.1,2.1+i*.95,0,.35,2,m.ivory);
      for(const [j,z]of [-9,6].entries()){
        const leg=A.group(body,s*4.5,14,z);legs.push(leg);const knee=[s*1.8,-5,j?-1.5:3.2],ankle=[s*2.4,-11.3,j?1:1.8];
        this.rod(leg,[0,0,0],knee,j?1.55:2.1,skin);this.rod(leg,knee,ankle,j?1:1.15,skin);this.box(leg,ankle[0],-12.6,ankle[2]+1.6,2.7,1.5,4.1,skin);
        for(let k=-1;k<=1;k++)this.rod(leg,[ankle[0]+k*.7,-12.7,ankle[2]+2.5],[ankle[0]+k*.8,-13.1,ankle[2]+4],.2,m.ivory);
      }
    }
    if(id==='cl_hound')for(let i=0;i<4;i++)for(const s of [-1,1])this.rod(body,[s*1.4,19-i*.5,-8+i*3],[s*5.8,14-i*.2,-8+i*3],.26,m.ivory);
    if(frog)for(let i=0;i<6;i++)this.volume(body,Math.sin(i*2.3)*6,18+Math.cos(i*2.3)*2,-5+i,1.2,1.5,1.4,m.poison);
    if(rat){root.scale.setScalar(.64);this.rod(tail,[0,0,0],[3,-5,-11],.7,m.bruise);this.rod(tail,[3,-5,-11],[0,-9,-19],.4,m.bruise);}
    if(id==='rastrero')root.scale.set(1.1,.76,1.1);
    root.userData.rig={body,quadrupedLegs:legs,jaw,tail};return root;
  },
  moth(A){
    const T=this.T,m=A.palette,root=A.group(),body=A.group(root),wings=[];this.volume(body,0,27,0,2.4,10,2.6,m.bruise);this.volume(body,0,36,0,3.1,3.3,2.6,m.pale);
    for(const s of [-1,1]){
      const wing=A.group(body,s*1.5,29,-1);wings.push(wing);const shape=new T.Shape(),outline=[[0,0],[s*6,15],[s*18,20],[s*25,12],[s*22,0],[s*17,-16],[s*6,-13],[s*2,-5]];shape.moveTo(...outline[0]);for(const p of outline.slice(1))shape.lineTo(...p);shape.closePath();
      const geo=new T.ExtrudeGeometry(shape,{depth:.65,bevelEnabled:false}),pos=geo.attributes.position,uv=geo.attributes.uv;
      for(let i=0;i<pos.count;i++)uv.setXY(i,(Math.abs(pos.getX(i)))/25,(pos.getY(i)+16)/36);
      const mat=this.material(m.cloth,'wing');mat.side=T.DoubleSide;this.mesh(wing,geo,mat);
      for(let i=0;i<3;i++)this.rod(body,[s*1.5,27-i*4,1],[s*5,23-i*4,6],.25,m.dark);
      this.rod(body,[s*1.2,37,1],[s*4,43,2],.22,m.ivory);
    }
    root.userData.rig={body,wings};return root;
  },
  spider(A,boss,phase=1){
    const m=A.palette,root=A.group(),body=A.group(root),legs=[],knees=[],fangs=[];root.scale.setScalar(boss?1+(phase-1)*.13:.27);
    const shell=this.material(m.bruise,'chitin'),plate=this.material(m.iron,'chitin');this.volume(body,0,22,-12,16,13,22,shell);this.volume(body,0,18,10,10,8,11,plate);this.volume(body,0,15.5,22,6.6,4.4,5.6,shell);
    for(const s of [-1,1]){
      for(let i=0;i<4;i++){
        const z=-11+i*7.4,leg=A.group(body,s*6.5,16,z);legs.push(leg);const knee=[s*(18+Math.abs(i-1.5)*2),11-i%2*2,(i-1.5)*5],ankle=[s*(29+Math.abs(i-1.5)*2),-13,(i-1.5)*12];
        this.rod(leg,[0,0,0],knee,1.8,plate);this.volume(leg,...knee,2,2,2,shell);
        const lower=A.group(leg,...knee);knees.push(lower);const foot=ankle.map((v,j)=>v-knee[j]);
        this.rod(lower,[0,0,0],foot,1.05,plate);this.rod(lower,foot,[foot[0]+s*3,-16-knee[1],foot[2]+2],.48,m.ivory);
      }
      for(let i=0;i<3;i++){this.box(body,s*(1.4+i*1.4),17.1-i*.25,26.1-i*.6,.7,.7,.3,m.dark);this.volume(body,s*(1.4+i*1.4),17.2-i*.25,26.3-i*.6,.18,.16,.15,m.eyes);}
      const fang=A.group(body,s*2.9,13.5,24);fangs.push(fang);
      this.rod(fang,[0,0,0],[s*2.1,-4,5],1,m.ivory);this.rod(fang,[s*2.1,-4,5],[-s*.3,-5.5,7],.45,m.ivory);
    }
    if(boss){for(let i=0;i<5;i++)this.volume(body,Math.sin(i*2.4)*8,31+Math.cos(i*2.4)*2,-12+Math.cos(i*2.3)*11,2.1,2.6,2.1,m.poison);A.spikes(body,3+phase,19,29,-4,5+phase*2);if(phase>1)for(const s of [-1,1])this.volume(body,s*8,25,7,5,2.5,7,m.ivory);}
    root.userData.rig={body,spiderLegs:legs,spiderKnees:knees,fangs};return root;
  }
};
(()=>{
  const A=POV3DAssets,C=POVCharacterArt,init=A.init;A.init=function(kit){C.init(kit);return init.call(this,kit);};
  for(const [name,method]of [['s','volume'],['b','box'],['cy','cylinder'],['rod','rod']]){const base=A[name];A[name]=function(...args){
    if(!C.depth)return base.apply(this,args);
    if(args[0]?.userData.characterHead){
      if(name==='rod'){args[1]=args[1].map((v,i)=>v*[.78,.76,.6][i]);args[2]=args[2].map((v,i)=>v*[.78,.76,.6][i]);args[3]*=.73;}
      else{for(let i=1;i<=3;i++)args[i]*=[.78,.76,.6][i-1];if(name==='cy'){args[4]*=.74;args[5]*=.74;args[6]*=.76;}else for(let i=4;i<=6;i++)args[i]*=[.78,.76,.6][i-4];}
    }
    return C[method](...args);
  };}
  const organic=A.organic;A.organic=function(p,points,z,m){return C.depth?C.loft(p,points.map(v=>[v[0],v[1],v[1]*z]),m):organic.apply(this,arguments);};
  const ring=A.ring;A.ring=function(p,x,y,z,r,t,m,axis){return ring.call(this,p,x,y,z,r,t,C.depth?C.material(m):m,axis);};
  A.humanoid=function(cfg){return C.humanoid(this,cfg);};A.apron=function(p){return C.apron(this,p);};
  A.quadruped=function(id){return C.quadruped(this,id);};A.moth=function(){return C.moth(this);};A.spider=function(boss,phase){return C.spider(this,boss,phase);};
  for(const name of ['enemy','ally']){const base=A[name];A[name]=function(e,g){const previous=C.entity;C.entity=e;C.depth++;try{const root=base.call(this,e,g);root.userData.artStyle='pixel-sculpt';return root;}finally{C.depth--;C.entity=previous;}};}
  const animate=A.animateEnemy;A.animateEnemy=function(root,...args){animate.call(this,root,...args);const r=root.userData.rig;if(r?.body)r.body.rotation.x+=r.lean||0;if(root.userData.ally&&r){r.arms[0].rotation.set(-1.0,0,.42);r.elbows[0].rotation.x=-.45;r.arms[1].rotation.set(-.55,0,-.33);r.elbows[1].rotation.x=-1;}};
})();
