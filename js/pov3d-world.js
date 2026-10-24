// Arquitectura tridimensional: superficies sólidas, materiales locales y puertas sin planos duplicados.
const POV3DWorld = {
  height: 62,
  hash(text){let n=2166136261;for(const ch of String(text))n=Math.imul(n^ch.charCodeAt(0),16777619);return n>>>0;},
  rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};},
  theme(g){return g.lvl==='hospitalnest'?'cave':typeof POVArt!=='undefined'?POVArt.theme(g):'hospital';},
  canvas(size=512){const cv=document.createElement('canvas');cv.width=cv.height=size;return cv;},
  textureSet(state,theme,kind){
    const T=state.T,cv=this.canvas(),c=cv.getContext('2d'),n=512,r=this.rng(this.hash(theme+kind));
    const colors={hospital:{floor:'#69776e',wall:'#9ba498',ceiling:'#606e69'},mansion:{floor:'#66523c',wall:'#a49b84',ceiling:'#6f6e5b'},castle:{floor:'#5b6059',wall:'#72756b',ceiling:'#4a4f49'},works:{floor:'#3a4a45',wall:'#677368',ceiling:'#394846'},lab:{floor:'#899b96',wall:'#a5b2ac',ceiling:'#72837f'},street:{floor:'#3b4140',wall:'#777b71',ceiling:'#2d393c'},cave:{floor:'#4b5144',wall:'#485247',ceiling:'#364137'}}[theme];
    c.fillStyle=colors[kind];c.fillRect(0,0,n,n);
    if(kind==='floor'){
      if(theme==='mansion'){
        for(let y=0;y<n;y+=64){c.fillStyle=y%128?'#69563f':'#5b4d39';c.fillRect(0,y,n,63);for(let x=-128;x<n;x+=256){const off=y%128?128:0;c.strokeStyle='#272c23';c.lineWidth=3;c.strokeRect(x+off,y,256,64);}for(let i=0;i<45;i++){c.strokeStyle='rgba(189,159,108,.08)';c.lineWidth=.5+r()*2;c.beginPath();const yy=y+r()*60;c.moveTo(r()*n,yy);c.lineTo(r()*n,yy+2);c.stroke();}}
      }else if(theme==='works'){
        c.fillStyle='#182a2d';c.fillRect(0,0,n,n);for(let x=0;x<n;x+=32){c.fillStyle='#64756b';c.fillRect(x,0,13,n);c.fillStyle='#b2bb9b';c.fillRect(x+2,0,2,n);}for(let y=0;y<n;y+=128){c.fillStyle='#3f514b';c.fillRect(0,y,n,12);c.fillStyle='#83917d';c.fillRect(0,y,n,2);}
      }else if(theme==='cave'||theme==='street'){
        for(let i=0;i<1800;i++){c.fillStyle=i%2?'#b4b19c15':'#101b1a20';c.beginPath();c.ellipse(r()*n,r()*n,1+r()*5,1+r()*3,r()*6,0,7);c.fill();}
      }else{
        const size=theme==='castle'?128:128;
        for(let y=0;y<n;y+=size)for(let x=0;x<n;x+=size){c.fillStyle=(x+y)%256===0?(theme==='lab'?'#879c98':theme==='castle'?'#62675d':'#748176'):(theme==='lab'?'#9caca3':theme==='castle'?'#555d55':'#606f67');c.fillRect(x+3,y+3,size-6,size-6);c.strokeStyle='#1b302c99';c.lineWidth=3;c.strokeRect(x+1.5,y+1.5,size-3,size-3);c.strokeStyle='#bdc9b04d';c.lineWidth=2;c.beginPath();c.moveTo(x+5,y+size-5);c.lineTo(x+5,y+5);c.lineTo(x+size-5,y+5);c.stroke();}
      }
      for(let i=0;i<14;i++){const x=r()*n,y=r()*n,rad=7+r()*40,g=c.createRadialGradient(x,y,1,x,y,rad);g.addColorStop(0,theme==='works'?'#49351b35':'#10221b35');g.addColorStop(1,'#15241f00');c.fillStyle=g;c.fillRect(x-rad,y-rad,rad*2,rad*2);}
      if(theme!=='mansion'&&theme!=='lab'){c.strokeStyle='#172b2935';c.lineWidth=1.3;for(let i=0;i<8;i++){const x=r()*n,y=r()*n;c.beginPath();c.moveTo(x,y);c.lineTo(x+4+r()*25,y+3+r()*9);c.lineTo(x+18+r()*45,y-3+r()*10);c.stroke();}}
    }else if(kind==='wall'){
      if(theme==='hospital'||theme==='lab'){
        c.fillStyle=theme==='lab'?'#4d696c':'#3f5d5e';c.fillRect(0,278,n,234);
        for(let y=284;y<n;y+=57)for(let x=0;x<n;x+=85){c.strokeStyle='#1c3a3b77';c.lineWidth=2;c.strokeRect(x+1,y+1,83,55);c.strokeStyle='#b9c9b335';c.lineWidth=1;c.beginPath();c.moveTo(x+3,y+53);c.lineTo(x+3,y+3);c.lineTo(x+80,y+3);c.stroke();}
        c.fillStyle='#263f40';c.fillRect(0,269,n,9);c.fillStyle='#bdc8b4';c.fillRect(0,268,n,2);
        if(theme==='lab'){for(let x=0;x<n;x+=128){c.strokeStyle='#425e6060';c.lineWidth=2;c.strokeRect(x,0,128,267);}c.fillStyle='#4a737c';c.fillRect(0,72,n,10);c.fillStyle='#94b4b5';c.fillRect(0,72,n,2);}
      }else if(theme==='mansion'){
        c.fillStyle='#4c3d2d';c.fillRect(0,292,n,220);for(let x=0;x<n;x+=128){c.strokeStyle='#2b2d23';c.lineWidth=7;c.strokeRect(x+10,309,108,185);c.strokeStyle='#927750';c.lineWidth=2;c.strokeRect(x+15,314,98,175);}c.fillStyle='#b0986d';c.fillRect(0,287,n,5);c.fillStyle='#302f25';c.fillRect(0,292,n,7);for(let x=0;x<n;x+=64){c.strokeStyle='#67553d22';c.lineWidth=2;c.beginPath();c.moveTo(x+32,10);c.bezierCurveTo(x-10,85,x+70,161,x+32,255);c.stroke();}
      }else if(theme==='castle'||theme==='street'){
        for(let y=0;y<n;y+=85)for(let x=-128;x<n;x+=171){const off=y%170?85:0;c.fillStyle=(x+y)%3?'#787c6e':'#686f63';c.fillRect(x+off+4,y+4,164,78);c.strokeStyle='#273b3260';c.lineWidth=3;c.strokeRect(x+off+2,y+2,168,82);c.strokeStyle='#bfc0a544';c.lineWidth=2;c.beginPath();c.moveTo(x+off+7,y+75);c.lineTo(x+off+7,y+7);c.lineTo(x+off+159,y+7);c.stroke();}
      }else{
        for(let i=0;i<90;i++){const x=r()*n,y=r()*n;c.fillStyle=i%3===0?'#283a2f60':'#a5aa7b14';c.beginPath();c.ellipse(x,y,8+r()*35,10+r()*60,r()*2,0,7);c.fill();}
        if(theme==='works'){for(let x=0;x<n;x+=128){c.strokeStyle='#172b2d66';c.lineWidth=3;c.strokeRect(x+2,2,124,508);}for(let i=0;i<28;i++){c.fillStyle=i%2?'#79472955':'#23372a44';c.fillRect(r()*n,r()*n,1+r()*8,15+r()*180);}}
      }
      for(let i=0;i<35;i++){const x=r()*n,y=r()*n;c.strokeStyle=theme==='lab'?'#263d3610':'#24372b20';c.lineWidth=1+r()*3;c.beginPath();c.moveTo(x,y);c.lineTo(x+(r()-.5)*8,Math.min(n,y+14+r()*110));c.stroke();}
    }else{
      if(theme==='castle'||theme==='mansion'){
        for(let x=0;x<n;x+=128){c.fillStyle=theme==='castle'?'#303d34':'#433f2e';c.fillRect(x,0,14,n);c.fillStyle='#8f8e6a44';c.fillRect(x+2,0,2,n);}for(let y=0;y<n;y+=128){c.fillStyle='#24342c';c.fillRect(0,y,n,8);}
      }else if(theme!=='cave'&&theme!=='street'){
        for(let y=0;y<n;y+=128)for(let x=0;x<n;x+=128){c.strokeStyle='#213b3955';c.lineWidth=5;c.strokeRect(x+2,y+2,124,124);c.strokeStyle='#c1cdb32d';c.lineWidth=1;c.strokeRect(x+6,y+6,116,116);}for(let i=0;i<400;i++){c.fillStyle='#182a2418';c.fillRect(r()*n,r()*n,1,1);}
      }
    }
    for(let i=0;i<6000;i++){c.fillStyle=i%2?'#e1debd0c':'#0b211a10';c.fillRect(r()*n,r()*n,1+r()*2,1+r()*2);}
    const img=c.getImageData(0,0,n,n),normal=this.canvas(),rough=this.canvas(),nc=normal.getContext('2d'),rc=rough.getContext('2d'),nn=nc.createImageData(n,n),rr=rc.createImageData(n,n),luma=new Float32Array(n*n);
    for(let i=0;i<n*n;i++)luma[i]=(img.data[i*4]*.3+img.data[i*4+1]*.59+img.data[i*4+2]*.11)/255;
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const k=y*n+x,i=k*4,dx=luma[y*n+(x+1)%n]-luma[y*n+(x+n-1)%n],dy=luma[((y+1)%n)*n+x]-luma[((y+n-1)%n)*n+x];nn.data[i]=128-dx*160;nn.data[i+1]=128+dy*160;nn.data[i+2]=250;nn.data[i+3]=255;const v=theme==='lab'?180+luma[k]*40:197+luma[k]*43;rr.data[i]=rr.data[i+1]=rr.data[i+2]=v;rr.data[i+3]=255;}
    nc.putImageData(nn,0,0);rc.putImageData(rr,0,0);
    const make=(canvas,color)=>{const t=new T.CanvasTexture(canvas);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(color&&T.SRGBColorSpace)t.colorSpace=T.SRGBColorSpace;state.textures.push(t);return t;};
    return {map:make(cv,true),normalMap:make(normal,false),roughnessMap:make(rough,false)};
  },
  build(root,g,kit){
    const T=kit.THREE,theme=this.theme(g),ceilingHeight=/hospital(?:origin|royal|nest)$/.test(g.lvl)?128:/hospital(?:chem|pit)$/.test(g.lvl)?92:this.height,state={T,root,kit,theme,ceilingHeight,doors:new Map(),lamps:[],textures:[],materials:[],resources:[],fluids:[],meshesCount:0,ambient:{color:0xa5b5ac,ground:0x101a1e,intensity:.42}};
    const material=(kind,settings={})=>{const maps=this.textureSet(state,theme,kind),m=new T.MeshStandardMaterial({color:0xffffff,...maps,roughness:.82,metalness:theme==='lab'?.12:.03,normalScale:new T.Vector2(.18,.18),...settings});state.materials.push(m);return m;};
    const floor=material('floor',{roughness:theme==='lab'?.5:theme==='works'?.68:.8,metalness:theme==='works'?.58:.03}),wall=material('wall'),ceiling=material('ceiling',{roughness:.95}),trim=kit.mat(theme==='mansion'?'#594831':theme==='castle'?'#666759':'#667a78',.63,theme==='castle'?.05:.32),dark=kit.mat('#1a2a2b',.8,.2);
    if(g.lvl==='hospitalchem'){
      const mask=this.canvas(),c=mask.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,512,512);c.fillStyle='#fff';for(let x=0;x<512;x+=32)c.fillRect(x,0,13,512);for(let y=0;y<512;y+=128)c.fillRect(0,y,512,12);const alpha=new T.CanvasTexture(mask);alpha.wrapS=alpha.wrapT=T.RepeatWrapping;alpha.anisotropy=4;state.textures.push(alpha);floor.alphaMap=alpha;floor.alphaTest=.4;floor.needsUpdate=true;
    }
    const floors=[],roofs=[],walls=[],skirting=[],rails=[],ledges=[],fluidBoxes=[[],[]],outside=new Set();
    if(g.lvl==='hospitalstreet')for(let y=0;y<Level.H;y++)for(let x=0;x<Level.W;x++)outside.add(x+','+y);
    for(const r of Level.rooms||[])if(/jard[ií]n|patio|exterior|calle|invernadero/i.test(r.n||''))for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)outside.add(x+','+y);
    const open=(x,y)=>{const v=Level.grid[y]?.[x];return v!==undefined&&v!==1;},add=(array,x,y,z,sx,sy,sz)=>array.push({x,y,z,sx,sy,sz});
    for(let z=0;z<Level.H;z++)for(let x=0;x<Level.W;x++){
      const v=Level.grid[z][x],wx=(x+.5)*TILE,wz=(z+.5)*TILE;
      if(v!==1){
        add(floors,wx,-.65,wz,TILE,1.3,TILE);
        if(!outside.has(x+','+z))add(roofs,wx,ceilingHeight+.7,wz,TILE,1.4,TILE);
        const fluid=Level.fluidAt(wx,wz);if(fluid===1||fluid===2)add(fluidBoxes[fluid-1],wx,.18,wz,TILE-.4,.24,TILE-.4);
      }else if([-1,0,1].some(dz=>[-1,0,1].some(dx=>(dx||dz)&&open(x+dx,z+dz)))){
        add(walls,wx,(ceilingHeight+2)/2,wz,TILE,ceilingHeight+2,TILE);
        for(const [dx,dz]of [[-1,0],[1,0],[0,-1],[0,1]])if(open(x+dx,z+dz)){
          const xx=wx+dx*(TILE/2+.45),zz=wz+dz*(TILE/2+.45),sx=dx?1.2:TILE,sz=dz?1.2:TILE;
          add(skirting,xx,2.2,zz,sx,3.8,sz);
          if(theme==='hospital'||theme==='lab')add(rails,xx,23.5,zz,dx?2.1:TILE,2.1,dz?2.1:TILE);
          else if(theme==='mansion')add(rails,xx,26,zz,dx?1.8:TILE,1.5,dz?1.8:TILE);
          else if(theme==='castle')add(ledges,xx,53.5,zz,dx?3:TILE,3.3,dz?3:TILE);
        }
      }
    }
    for(const [boxes,m]of [[floors,floor],[roofs,ceiling],[walls,wall],[skirting,dark],[rails,trim],[ledges,trim]])if(boxes.length){const mesh=kit.batchBox(root,boxes,m);if(mesh){mesh.receiveShadow=true;mesh.castShadow=boxes===walls;state.meshesCount++;}}
    const waters=[new T.MeshStandardMaterial({color:0x314d4b,metalness:.25,roughness:.24,transparent:true,opacity:.72}),new T.MeshStandardMaterial({color:0x536c35,emissive:0x192b0a,emissiveIntensity:.28,metalness:.1,roughness:.3,transparent:true,opacity:.72})];
    state.materials.push(...waters);
    for(let i=0;i<2;i++)if(fluidBoxes[i].length){const mesh=kit.batchBox(root,fluidBoxes[i],waters[i]);if(mesh){mesh.receiveShadow=true;state.fluids.push({mesh,material:waters[i],toxic:i===1,type:i+1,cells:fluidBoxes[i],active:fluidBoxes[i].map(()=>true)});state.meshesCount++;}}
    state.fluidTick=-1;state.fluidMatrix=new T.Matrix4();state.fluidPosition=new T.Vector3();state.fluidScale=new T.Vector3();state.fluidQuaternion=new T.Quaternion();
    this.buildDoors(state,g);this.buildFixtures(state,g);this.buildArchitecture(state,g);
    if(theme==='lab')state.ambient={color:0xb8c7c5,ground:0x111f29,intensity:.46};
    if(theme==='works'||theme==='cave')state.ambient={color:0x8da39c,ground:0x111919,intensity:.4};
    if(theme==='castle'||theme==='mansion')state.ambient={color:0xbab29c,ground:0x211b17,intensity:.4};
    return state;
  },
  buildDoors(state,g){
    const {T,root,kit,theme}=state,wood=theme==='mansion'||theme==='castle',frameMat=kit.mat(wood?'#514733':'#5b7073',.65,wood?.05:.5),panelMat=kit.mat(wood?'#796246':'#49656b',wood?.72:.54,wood?.02:.38),recessMat=kit.mat('#1a2d32',.58,.2),handleMat=kit.mat('#b5b8a4',.28,.78),glassMat=new T.MeshStandardMaterial({color:0x24464a,metalness:.42,roughness:.15});state.materials.push(glassMat);
    for(const d of Level.doors){
      const xs=d.tiles.map(v=>v[0]),zs=d.tiles.map(v=>v[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);let horizontal=maxX-minX>=maxZ-minZ;
      if(maxX===minX&&maxZ===minZ){const wall=(x,z)=>Level.grid[z]?.[x]===1;horizontal=Number(wall(minX-1,minZ))+Number(wall(minX+1,minZ))>=Number(wall(minX,minZ-1))+Number(wall(minX,minZ+1));}
      const span=(horizontal?maxX-minX+1:maxZ-minZ+1)*TILE,group=new T.Group();group.name='door:'+d.id;group.position.set((minX+maxX+1)*TILE/2,0,(minZ+maxZ+1)*TILE/2);group.rotation.y=horizontal?0:Math.PI/2;root.add(group);
      kit.box(group,-span/2+1.35,27,0,2.7,54,7,frameMat);kit.box(group,span/2-1.35,27,0,2.7,54,7,frameMat);kit.box(group,0,57.5,0,span,9,7,frameMat);kit.box(group,0,.45,0,span,.9,7,handleMat);
      if(state.ceilingHeight>62)kit.box(group,0,(62+state.ceilingHeight)/2,0,span,state.ceilingHeight-62,7,frameMat);
      const left=new T.Group(),right=new T.Group();group.add(left,right);const leafWidth=(span-5.8)/2;
      for(const [leaf,sign]of [[left,-1],[right,1]]){
        kit.box(leaf,sign*leafWidth/2,27,0,leafWidth,52.5,3.7,panelMat);
        if(wood){kit.box(leaf,sign*leafWidth/2,37,2.02,Math.max(3,leafWidth-6),16,.45,recessMat);kit.box(leaf,sign*leafWidth/2,14,2.02,Math.max(3,leafWidth-6),17,.45,recessMat);kit.box(leaf,sign*leafWidth/2,37,-2.02,Math.max(3,leafWidth-6),16,.45,recessMat);}
        else if(leafWidth>11){kit.box(leaf,sign*leafWidth/2,38,1.97,Math.max(4,leafWidth-6),13,.5,recessMat);kit.box(leaf,sign*leafWidth/2,38,2.3,Math.max(2,leafWidth-8),10,.35,glassMat);kit.box(leaf,sign*leafWidth/2,10,2.03,Math.max(4,leafWidth-5),11,.45,frameMat);kit.box(leaf,sign*leafWidth/2,38,-1.97,Math.max(4,leafWidth-6),13,.5,recessMat);}
        for(const face of [-1,1]){kit.box(leaf,sign*3.5,23,face*2.7,1.4,6,1.1,recessMat);kit.box(leaf,sign*4.7,24.2,face*3.4,4.4,1,1,handleMat);}
      }
      const signalMat=new T.MeshStandardMaterial({color:d.key?0xb87c55:0x76a997,emissive:d.key?0x7c3320:0x305f52,emissiveIntensity:.6,roughness:.6});state.materials.push(signalMat);kit.box(group,span/2-1.2,41,4.1,1,3.8,.6,signalMat);
      const progress=d.open?1:0,leftBase=0,rightBase=0;left.position.x=-progress*(leafWidth+3.3);right.position.x=progress*(leafWidth+3.3);
      state.doors.set(d.id,{door:d,group,left,right,leafWidth,progress,signalMat,leftBase,rightBase,span,horizontal});state.meshesCount+=group.children.length;
    }
  },
  buildFixtures(state,g){
    const {kit,root,theme}=state,housing=kit.mat(theme==='castle'?'#453d2e':'#283a3e',.62,.45),glass=kit.mat('#c4d5c5',.35,.1,'#9dbca7'),warm=kit.mat('#cdb27f',.4,.1,'#b28445'),fixtures=[];
    const lamps=(Level.lamps||[]).filter(l=>Number.isFinite(l.x)&&Number.isFinite(l.y));
    lamps.forEach((l,i)=>{
      const tile=Level.grid[Math.floor(l.y/TILE)]?.[Math.floor(l.x/TILE)];if(tile===undefined||tile===1)return;
      const isWarm=theme==='mansion'||theme==='castle'||i%7===5,exterior=g.lvl==='hospitalstreet',y=exterior?54:state.ceilingHeight-3.2;
      if(exterior){kit.box(root,l.x,27,l.y,1.2,54,1.2,housing);kit.box(root,l.x+5,54,l.y,12,2,5,housing);kit.box(root,l.x+5,52.8,l.y,9,.6,3,warm);}
      else if(isWarm&&theme==='castle'){
        kit.box(root,l.x,y-3,l.y,6,5,6,housing);kit.sphere(root,l.x,y-5,l.y,2.4,3.2,2.4,warm);
      }else{
        kit.box(root,l.x,y+1,l.y,22,2.4,7.6,housing);kit.box(root,l.x,y-.4,l.y,19,.5,5.3,isWarm?warm:glass);kit.box(root,l.x-8,y-.9,l.y,.6,.5,5.3,housing);kit.box(root,l.x+8,y-.9,l.y,.6,.5,5.3,housing);
      }
      fixtures.push({x:l.x,y:exterior?48:state.ceilingHeight-8.5,z:l.y,color:isWarm?0xffc891:theme==='lab'?0xc6e2df:theme==='works'?0xb7ccb3:0xc8decf,intensity:isWarm?3100:4400,distance:Math.min(260,Math.max(150,l.r||180)),decay:1.6,flicker:!!l.flicker,seed:i*.83});
    });
    state.lamps=fixtures;
  },
  buildArchitecture(state,g){
    const {T,root,kit,theme}=state,metal=kit.mat('#53676b',.56,.6),rust=kit.mat('#6f523d',.83,.42),stone=kit.mat('#62695b',.9,.03),wood=kit.mat('#514332',.84,.05),pipes=[];
    for(const r of Level.rooms||[]){
      if(r.w<5||r.h<5||/jard[ií]n|patio|exterior|calle|invernadero/i.test(r.n||''))continue;
      const cx=(r.x+r.w/2)*TILE,cz=(r.y+r.h/2)*TILE;
      if(theme==='works'||theme==='lab'){
        const length=Math.min(150,r.w*TILE-20),z=(r.y+.5)*TILE;
        if(Level.grid[Math.floor(z/TILE)]?.[Math.floor(cx/TILE)]!==1){kit.rod(root,[cx-length/2,state.ceilingHeight-5.8,z],[cx+length/2,state.ceilingHeight-5.8,z],theme==='works'?2.1:1.1,theme==='works'?rust:metal);kit.rod(root,[cx-length/2,state.ceilingHeight-3,z+7],[cx+length/2,state.ceilingHeight-3,z+7],1.1,metal);for(let i=-1;i<=1;i++)kit.box(root,cx+i*length*.34,state.ceilingHeight-4,z+3,1,5,12,metal);}
      }else if(theme==='castle'||theme==='mansion'){
        const span=Math.min(180,r.w*TILE-6),z=cz;
        kit.box(root,cx,state.ceilingHeight-3,z,span,5,5,theme==='castle'?stone:wood);
        if(theme==='castle'&&r.w>=8&&r.h>=6){for(const sign of [-1,1]){const x=(sign<0?r.x+.25:r.x+r.w-.25)*TILE;kit.box(root,x,state.ceilingHeight-17,z,4,28,5,stone);kit.box(root,x,state.ceilingHeight-5,z,8,6,9,stone);}}
      }else if(theme==='cave'){
        const random=this.rng(this.hash(r.n||'nest'));for(let i=0;i<Math.min(25,Math.floor(r.w*r.h/7));i++){const x=(r.x+random()*r.w)*TILE,z=(r.y+random()*r.h)*TILE;kit.sphere(root,x,state.ceilingHeight+1,z,9+random()*15,4+random()*5,8+random()*15,stone);}
      }
    }
    if(g.lvl==='hospitalchem'){
      // Bajo la plataforma se distingue la cuba; los conductos quedan fuera del paso.
      const poison=kit.mat('#344f27',.25,.12,'#183008');kit.box(root,19*TILE,-8,17*TILE,29*TILE,1,24*TILE,poison);
      for(const x of [3.4,34.4])for(const z of [7,14,22,28]){kit.cylinder(root,x*TILE,10,z*TILE,3,3,20,rust);kit.box(root,x*TILE,20.5,z*TILE,8,2,8,metal);}
    }
  },
  update(state,g,time,dt){
    const blend=1-Math.exp(-24*Math.min(.1,Math.max(0,dt||1/60)));
    for(const d of state.doors.values()){
      const current=Level.doors.find(o=>o.id===d.door.id)||d.door,target=current.open?1:0;d.progress+=(target-d.progress)*blend;if(Math.abs(d.progress-target)<.001)d.progress=target;
      const offset=d.progress*(d.leafWidth+3.3);d.left.position.x=d.leftBase-offset;d.right.position.x=d.rightBase+offset;
      const locked=!!current.key&&!current.open;d.signalMat.color.setHex(locked?0xb87c55:0x76a997);d.signalMat.emissive.setHex(locked?0x7c3320:0x305f52);
    }
    const tick=Math.floor(time*3),checkFluid=tick!==state.fluidTick;state.fluidTick=tick;
    for(const fluid of state.fluids){fluid.material.opacity=(fluid.toxic?.7:.66)+Math.sin(time*.75)*.035;if(checkFluid){let changed=false;fluid.cells.forEach((b,i)=>{const active=Level.fluidAt(b.x,b.z)===fluid.type;if(active===fluid.active[i])return;fluid.active[i]=active;state.fluidPosition.set(b.x,b.y,b.z);state.fluidScale.set(active?b.sx:0,active?b.sy:0,active?b.sz:0);state.fluidMatrix.compose(state.fluidPosition,state.fluidQuaternion,state.fluidScale);fluid.mesh.setMatrixAt(i,state.fluidMatrix);changed=true;});if(changed)fluid.mesh.instanceMatrix.needsUpdate=true;}}
  },
  dispose(state){
    for(const texture of state?.textures||[])texture.dispose();
    for(const material of state?.materials||[])material.dispose();
    for(const resource of state?.resources||[])resource.dispose?.();
  }
};
