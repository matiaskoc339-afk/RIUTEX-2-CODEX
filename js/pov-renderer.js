// RIUTEX 2 · Perspectiva opcional. La simulación y sus coordenadas no cambian.
// Proyección con profundidad por píxel, materiales y avisos sobre el mismo suelo del juego.
const FirstPersonRenderer = {
  wallHeight:54, eyeHeight:26, far:900, near:3, fov:78*Math.PI/180,
  frame:0, camera:null, stats:{}, textureCache:new Map(),
  init(g){
    if(typeof HTMLCanvasElement==='undefined')return false;
    const W=g.cv.width,H=g.cv.height;
    if(this.W!==W||this.H!==H){
      this.W=W;this.H=H;this.depth=new Float32Array(W*H);
      this.floorCanvas=document.createElement('canvas');this.floorCanvas.width=Math.ceil(W/3);this.floorCanvas.height=Math.ceil(H/3);this.floorCtx=this.floorCanvas.getContext('2d',{alpha:false});this.floorPixels=this.floorCtx.createImageData(this.floorCanvas.width,this.floorCanvas.height);
    }
    POVArt.init();return true;
  },
  propHeight(type){return /pillar|bars/.test(type)?54:/shelf|locker|wardrobe|book|machine/.test(type)?47:31;},
  castRay(dx,dy,g,allowFog=false){
    const p=g.player,sx=dx<0?-1:1,sy=dy<0?-1:1,stepX=Math.abs(TILE/dx),stepY=Math.abs(TILE/dy);
    let x=Math.floor(p.x/TILE),y=Math.floor(p.y/TILE),tx=Math.abs(((dx<0?x*TILE:(x+1)*TILE)-p.x)/dx),ty=Math.abs(((dy<0?y*TILE:(y+1)*TILE)-p.y)/dy),distance=0,side=0;
    const hits=[];if(!Number.isFinite(dx)||!Number.isFinite(dy)||Math.abs(dx)+Math.abs(dy)<1e-8)return {hits,distance:this.far,value:0,x,y};
    for(let i=0;i<140&&distance<this.far;i++){
      if(tx<ty){distance=tx;tx+=stepX;x+=sx;side=0;}else{distance=ty;ty+=stepY;y+=sy;side=1;}
      const value=Level.grid[y]?.[x]??1;
      const fog=allowFog&&this.allowedCells&&value!==1&&!this.allowed(x,y);
      if(value===0&&!fog)continue;
      const door=this.doorTiles?.get(x+','+y),type=Level.props[x+','+y],height=value===4&&!fog?this.propHeight(type||'crate'):this.wallHeight;
      const wx=p.x+dx*distance,wy=p.y+dy*distance;let u=((side?wx:wy)/TILE)%1;if(u<0)u+=1;if((side===0&&dx>0)||(side===1&&dy<0))u=1-u;
      if(door){const along=door.horizontal?wx/TILE:wy/TILE;u=Math.max(0,Math.min(.999,(along-door.start)/door.span));}
      hits.push({distance:Math.max(.01,distance),value,x,y,side,u,height,door:door?.door,fog,type,wx,wy});
      if(fog||value!==4||hits.length>=9)break;
    }
    const last=hits[hits.length-1];return {hits,distance:last?.distance??this.far,value:last?.value??0,x:last?.x??x,y:last?.y??y};
  },
  allowed(x,y){return this.allowedCells?.has(x+','+y)||false;},
  project(x,y,z=0){
    const v=this.camera;if(!v)return {x:0,y:0,depth:-1,scale:0,visible:false};const dx=x-v.x,dy=y-v.y,depth=dx*v.cos+dy*v.sin,lateral=-dx*v.sin+dy*v.cos,scale=v.focal/Math.max(this.near,depth);
    return {x:this.W*.5+lateral*scale,y:v.horizon+(v.eye-z)*scale,depth,scale,visible:depth>this.near&&depth<this.far};
  },
  setup(g){
    const p=g.player,W=this.W,H=this.H,yaw=p.angle||0,pitch=typeof FirstPerson!=='undefined'?FirstPerson.pitch||0:0;
    const bob=MenuScene.motionReduced()?0:Math.sin(p.walkT||0)*(p.running?.35:.18);
    this.camera={x:p.x,y:p.y,cos:Math.cos(yaw),sin:Math.sin(yaw),focal:W/(2*Math.tan(this.fov/2)),horizon:H*.49+pitch*H*.62,eye:this.eyeHeight+bob,yaw};
    this.current=g;this.theme=POVArt.theme(g);this.doorTiles=new Map();
    for(const door of Level.doors){const xs=door.tiles.map(t=>t[0]),ys=door.tiles.map(t=>t[1]),horizontal=Math.max(...xs)-Math.min(...xs)>=Math.max(...ys)-Math.min(...ys),start=horizontal?Math.min(...xs):Math.min(...ys),span=(horizontal?Math.max(...xs):Math.max(...ys))-start+1;for(const [x,y]of door.tiles)this.doorTiles.set(x+','+y,{door,horizontal,start,span});}
    HorrorVision.prepare(g);const discoveryKey=g.lvl+'|'+(HorrorVision.entered||[]).map(r=>r.n).join('|');
    if(this.discoveryKey!==discoveryKey){this.discoveryKey=discoveryKey;this.allowedCells=new Set();
    // La geometría conocida se conserva hasta entrar en otra estancia.
    for(const r of HorrorVision.entered||[])for(let y=r.y;y<r.y+r.h;y++)for(let x=r.x;x<r.x+r.w;x++)this.allowedCells.add(x+','+y);
    for(const d of Level.doors)for(const [x,y]of d.tiles)this.allowedCells.add(x+','+y);
    for(const [a,b,w,h]of R2_DATA(g.lvl).cuts||[])for(let y=b;y<b+h;y++)for(let x=a;x<a+w;x++)this.allowedCells.add(x+','+y);
    }
    const room=HorrorVision.roomAt(p.x/TILE,p.y/TILE);this.outside=g.lvl==='hospitalstreet'||/Jardín|Patio|Calle|Invernadero|exterior/i.test(room?.n||'');
    this.lamps=Level.lamps.filter(l=>Math.hypot(l.x-p.x,l.y-p.y)<700).slice(0,18);this.cellCache=new Map();this.stats={level:g.lvl,columns:W,sprites:0,groundCues:0,visibleEnemies:0,occludedSprites:0};
  },
  texData(canvas){
    let data=this.textureCache.get(canvas);if(!data){data={pixels:canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data,w:canvas.width,h:canvas.height};data.mips=[data];
      for(let level=1;level<=3;level++){const cv=document.createElement('canvas');cv.width=Math.max(8,canvas.width>>level);cv.height=Math.max(8,canvas.height>>level);const c=cv.getContext('2d');c.imageSmoothingEnabled=true;c.drawImage(canvas,0,0,cv.width,cv.height);data.mips.push({pixels:c.getImageData(0,0,cv.width,cv.height).data,w:cv.width,h:cv.height});}this.textureCache.set(canvas,data);}return data;
  },
  cell(x,y){
    const key=x+','+y;let c=this.cellCache.get(key);if(c)return c;
    const wx=(x+.5)*TILE,wy=(y+.5)*TILE;let ambient=0;
    for(const l of this.lamps){const d=Math.hypot(l.x-wx,l.y-wy);if(d<l.r)ambient=Math.max(ambient,.19*(1-d/l.r));}
    c={allowed:this.allowed(x,y),fluid:Level.fluidAt(wx,wy),ambient};this.cellCache.set(key,c);return c;
  },
  light(distance,nx,wx,wy){
    const ambient=this.cell(Math.floor(wx/TILE),Math.floor(wy/TILE)).ambient;
    const spot=Math.pow(Math.max(0,1-Math.abs(nx)*.75),1.6);
    return Math.min(1,.13+ambient+.82*spot/(1+Math.pow(distance/190,1.7))+(this.current.player.flash>0?.22/(1+distance/260):0));
  },
  floor(g){
    const W=this.floorCanvas.width,H=this.floorCanvas.height,actualH=this.H,actualW=this.W,v=this.camera,out=this.floorPixels.data;
    const floor=this.texData(POVArt.floor(this.theme)),ceiling=this.texData(POVArt.ceiling(this.theme)),horizon=v.horizon,plane=Math.tan(this.fov/2);
    for(let y=0;y<H;y++){
      const sy=(y+.5)*actualH/H,ground=sy>horizon,height=ground?v.eye:this.wallHeight-v.eye,distance=Math.min(this.far+50,height*v.focal/Math.max(.01,Math.abs(sy-horizon)));
      const startX=v.x+(v.cos+v.sin*plane)*distance,startY=v.y+(v.sin-v.cos*plane)*distance,stepX=-2*v.sin*plane*distance/W,stepY=2*v.cos*plane*distance/W,baseTexture=ground?floor:ceiling,mip=Math.max(0,Math.min(3,Math.round(Math.log2(Math.max(1,2*plane*distance/W*baseTexture.w/TILE))))),texture=baseTexture.mips[mip];
      for(let x=0;x<W;x++){
        const i=(y*W+x)*4,wx=startX+stepX*x,wy=startY+stepY*x;
        if(!ground&&this.outside){const a=Math.max(0,Math.min(1,sy/(horizon||1)));out[i]=7+a*9;out[i+1]=14+a*14;out[i+2]=23+a*16;out[i+3]=255;continue;}
        const cell=this.cell(Math.floor(wx/TILE),Math.floor(wy/TILE));
        if(distance>this.far||!cell.allowed){out[i]=3;out[i+1]=6;out[i+2]=9;out[i+3]=255;continue;}
        const tx=((Math.floor(wx/TILE*texture.w)%texture.w)+texture.w)%texture.w,ty=((Math.floor(wy/TILE*texture.h)%texture.h)+texture.h)%texture.h,ti=(ty*texture.w+tx)*4;
        const nx=x/W*2-1,spot=Math.pow(Math.max(0,1-Math.abs(nx)*.75),1.6),light=Math.min(.95,.12+cell.ambient+.68*spot/(1+Math.pow(distance/175,1.6))+(g.player.flash>0?.12:0)),fog=Math.max(0,Math.min(.85,(distance-320)/680));
        let r=texture.pixels[ti],b=texture.pixels[ti+2],green=texture.pixels[ti+1];
        if(ground&&cell.fluid){const wave=.8+.2*Math.sin(wx*.12+wy*.09+g.t*2);r=cell.fluid===2?45*wave:r*.5;green=cell.fluid===2?102*wave:green*.7;b=cell.fluid===2?39*wave:b*.75;}
        if(ground&&g.lvl==='hospitalchem'){const gx=((wx%32)+32)%32,gy=((wy%32)+32)%32;if(gx<3||gy<3){r=114;green=129;b=120;}else {r=22;green=64;b=47;}}
        if(ground&&g.lvl==='hospitalstreet'&&Math.abs(wx-33*TILE)<2&&Math.floor(wy/30)%2===0){r=146;green=145;b=118;}
        out[i]=r*light*(1-fog)+3*fog;out[i+1]=green*light*(1-fog)+6*fog;out[i+2]=b*light*(1-fog)+9*fog;out[i+3]=255;
      }
    }
    this.floorCtx.putImageData(this.floorPixels,0,0);g.ctx.imageSmoothingEnabled=true;g.ctx.drawImage(this.floorCanvas,0,0,actualW,actualH);
  },
  wallTexture(hit){
    if(hit.value===4){const key='prop:'+String(hit.type||'crate');return POVArt.wall(this.theme,key);}
    return POVArt.wall(this.theme,hit.door?(hit.door.key?'locked-door':'door'):'wall');
  },
  walls(g){
    const c=g.ctx,W=this.W,H=this.H,v=this.camera,plane=Math.tan(this.fov/2);this.depth.fill(this.far);
    for(let x=0;x<W;x++){
      const nx=2*(x+.5)/W-1,dx=v.cos-v.sin*plane*nx,dy=v.sin+v.cos*plane*nx,result=this.castRay(dx,dy,g,true);
      for(let j=result.hits.length-1;j>=0;j--){
        const hit=result.hits[j],depth=Math.max(this.near,hit.distance),scale=v.focal/depth,top=v.horizon+(v.eye-hit.height)*scale,bottom=v.horizon+v.eye*scale,a=Math.max(0,Math.floor(top)),b=Math.min(H,Math.ceil(bottom));if(b<=a)continue;
        if(hit.fog){c.fillStyle='#030609';c.fillRect(x,a,1,b-a);}
        else{
          const texture=this.wallTexture(hit),u=Math.max(0,Math.min(texture.width-1,Math.floor(hit.u*texture.width))),light=this.light(depth,nx,hit.wx,hit.wy)*(hit.side?.86:1);
          const sourceY=(a-top)/(bottom-top)*texture.height,sourceH=(b-a)/(bottom-top)*texture.height;
          c.drawImage(texture,u,sourceY,1,sourceH,x,a,1,b-a);c.fillStyle=`rgba(2,6,10,${Math.min(.96,1-light)})`;c.fillRect(x,a,1,b-a);
        }
        for(let y=a;y<b;y++)this.depth[y*W+x]=depth;
      }
    }
  },
  // Proyecta los avisos originales de los enemigos; sus radios y tiempos son los del motor.
  floorContext(g){
    const renderer=this,c=g.ctx,stack=[],styleStack=[];let matrix=[1,0,0,1,0,0],paths=[],path=null;
    const point=(x,y)=>[matrix[0]*x+matrix[2]*y+matrix[4],matrix[1]*x+matrix[3]*y+matrix[5]];
    const add=(x,y,move=false)=>{if(move||!path){path=[];paths.push(path);}path.push(point(x,y));};
    const adapter={
      beginPath(){paths=[];path=null;},moveTo(x,y){add(x,y,true);},lineTo(x,y){add(x,y);},closePath(){if(path?.length)path.push(path[0]);},
      arc(x,y,r,a,b,ccw=false){let span=b-a;if(!ccw&&span<0)span+=Math.PI*2;if(ccw&&span>0)span-=Math.PI*2;const steps=Math.max(4,Math.ceil(Math.abs(span)*14));for(let i=0;i<=steps;i++)add(x+Math.cos(a+span*i/steps)*r,y+Math.sin(a+span*i/steps)*r);},
      ellipse(x,y,rx,ry,rotation,a,b){const n=Math.max(8,Math.ceil(Math.abs(b-a)*14));for(let i=0;i<=n;i++){const t=a+(b-a)*i/n,dx=Math.cos(t)*rx,dy=Math.sin(t)*ry;add(x+dx*Math.cos(rotation)-dy*Math.sin(rotation),y+dx*Math.sin(rotation)+dy*Math.cos(rotation));}},
      rect(x,y,w,h){this.moveTo(x,y);this.lineTo(x+w,y);this.lineTo(x+w,y+h);this.lineTo(x,y+h);this.closePath();},
      fill(){for(const pts of paths)renderer.groundPolygon(pts,true);},stroke(){for(const pts of paths){if(c.lineWidth>=8)renderer.groundBand(pts,c.lineWidth);else renderer.groundPolygon(pts,false);}},
      fillRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.fill();},strokeRect(x,y,w,h){this.beginPath();this.rect(x,y,w,h);this.stroke();},
      save(){stack.push(matrix.slice());c.save();styleStack.push(this.lineWidth);},restore(){matrix=stack.pop()||[1,0,0,1,0,0];c.restore();this.lineWidth=styleStack.pop()||1;},
      translate(x,y){matrix[4]+=matrix[0]*x+matrix[2]*y;matrix[5]+=matrix[1]*x+matrix[3]*y;},
      rotate(a){const [m0,m1,m2,m3]=matrix,cos=Math.cos(a),sin=Math.sin(a);matrix[0]=m0*cos+m2*sin;matrix[1]=m1*cos+m3*sin;matrix[2]=m2*cos-m0*sin;matrix[3]=m3*cos-m1*sin;},
      scale(x,y){matrix[0]*=x;matrix[1]*=x;matrix[2]*=y;matrix[3]*=y;},setLineDash(a){c.setLineDash(a);},lineWidth:1,
    };
    for(const key of ['strokeStyle','fillStyle','globalAlpha','shadowBlur','shadowColor','lineCap','lineJoin','lineWidth'])Object.defineProperty(adapter,key,{get:()=>c[key],set:value=>{c[key]=value;}});
    return adapter;
  },
  groundPolygon(points,fill,z=.15){
    if(points.length<2)return;const v=this.camera,near=this.near,depth=p=>(p[0]-v.x)*v.cos+(p[1]-v.y)*v.sin;
    let clipped=[];
    if(fill){for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],da=depth(a),db=depth(b);if(da>=near)clipped.push(a);if((da>=near)!==(db>=near)){const t=(near-da)/(db-da);clipped.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}}if(clipped.length<3)return;}
    const c=this.current.ctx;c.beginPath();let drawn=false;
    if(fill){for(const [x,y]of clipped){const p=this.project(x,y,z);if(!drawn)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);drawn=true;}c.closePath();c.fill();}
    else for(let i=1;i<points.length;i++){let a=points[i-1],b=points[i],da=depth(a),db=depth(b);if(da<near&&db<near)continue;if(da<near){const t=(near-da)/(db-da);a=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];}if(db<near){const t=(near-db)/(da-db);b=[b[0]+(a[0]-b[0])*t,b[1]+(a[1]-b[1])*t];}const pa=this.project(...a,z),pb=this.project(...b,z);c.moveTo(pa.x,pa.y);c.lineTo(pb.x,pb.y);drawn=true;}if(!fill&&drawn){c.lineWidth=Math.max(1,Math.min(7,c.lineWidth));c.stroke();}
    if(drawn)this.stats.groundCues++;
  },
  groundBand(points,width){
    const c=this.current.ctx;c.save();c.fillStyle=c.strokeStyle;
    for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,nx=-dy/len*width*.5,ny=dx/len*width*.5;this.groundPolygon([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]],true);}
    c.restore();
  },
  introGuide(g){
    if(g.lvl!=='hospital'||g.story.seq==='free'||g.state!=='play')return;
    const body=UI.$('escapeGuide')?.querySelector('span'),seq=g.story.seq;
    if(body&&seq==='room')body.textContent='Abre con [E] y sigue la señal hacia el pasillo.';
    else if(body&&seq==='run')body.textContent=g.player.x>40*TILE?'Acércate al cierre: el primer golpe romperá la puerta.':'Corre hacia la puerta señalada. Mantén [Shift].';
    else if(body&&seq==='wounded_run')body.textContent='Cruza la puerta y sigue la señal hasta el vestíbulo. Todavía no uses el frasco.';
    if(!EscapeGuide.target)return;
    const p=g.player,[x,y]=EscapeGuide.target,a=Math.atan2(y-p.y,x-p.x)-p.angle,relative=Math.atan2(Math.sin(a),Math.cos(a)),c=g.ctx;
    this.stats.introTarget=EscapeGuide.target.slice();this.stats.introRelative=relative;c.save();c.translate(this.W*.5,this.H*.31);c.rotate(relative);c.strokeStyle='#ddcf9f';c.fillStyle='#c3b47855';c.lineWidth=1.8;c.beginPath();c.moveTo(0,-13);c.lineTo(9,7);c.lineTo(0,3);c.lineTo(-9,7);c.closePath();c.fill();c.stroke();c.restore();
  },
  groundCircle(x,y,r,color,fillColor){const c=this.current.ctx;c.save();c.strokeStyle=color||'#b892cd';c.fillStyle=fillColor||'transparent';const pts=[];for(let i=0;i<=64;i++){const a=i/64*Math.PI*2;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);}if(fillColor)this.groundPolygon(pts,true);this.groundPolygon(pts,false);c.restore();},
  cues(g){
    const c=g.ctx,adapter=this.floorContext(g);c.save();
    for(const pool of g.pools||[])if(pool.life>0)this.groundCircle(pool.x,pool.y,pool.r,'#9cbf53','rgba(75,128,43,.38)');
    for(const r of g.rings||[])this.groundCircle(r.x,r.y,r.r*(1-r.life/r.max),r.c);
    for(const [key,r,color]of [['temporalField',280,'#bc9dd6'],['gravityWell',155,'#aa7ed6'],['psychicAnchor',90,'#9e9fda']]){const q=g[key];if(q)this.groundCircle(q.x,q.y,r,color);}
    for(const e of g.enemies){if(e.dead||e.dormant)continue;
      if(typeof e.drawTelegraphs==='function')e.drawTelegraphs(adapter);
      else if(typeof e.drawCue==='function')e.drawCue(adapter);
      else if(e.state==='windup'){c.fillStyle='rgba(203,114,76,.2)';c.strokeStyle='#dda17e';const angle=e.face||0,r=e.def.range+30,pts=[[e.x,e.y]];for(let i=0;i<=20;i++){const a=angle-1.1+2.2*i/20;pts.push([e.x+Math.cos(a)*r,e.y+Math.sin(a)*r]);}pts.push(pts[0]);this.groundPolygon(pts,true);this.groundPolygon(pts,false);}
    }
    for(const q of g.story.works?.arena?.pending||[])this.groundCircle(q.x,q.y,42,'#dbba81','rgba(165,97,60,.2)');
    for(const d of Level.decals||[]){if(Math.hypot(d.x-g.player.x,d.y-g.player.y)>400)continue;c.fillStyle=d.c||'#621b2580';const pts=[];for(let j=0;j<12;j++){const a=j/12*Math.PI*2;pts.push([d.x+Math.cos(a)*d.r,d.y+Math.sin(a)*d.r*.65]);}this.groundPolygon(pts,true);}
    c.restore();
  },
  shade(image,light){
    const level=Math.max(1,Math.min(8,Math.round(light*8)));if(level===8)return image;
    if(!this.shades)this.shades=new Map();let variants=this.shades.get(image);if(!variants){if(this.shades.size>40)this.shades.clear();variants=new Map();this.shades.set(image,variants);}if(variants.has(level))return variants.get(level);
    const out=document.createElement('canvas');out.width=image.width;out.height=image.height;const c=out.getContext('2d');c.drawImage(image,0,0);c.globalCompositeOperation='source-atop';c.fillStyle=`rgba(0,5,10,${1-level/8})`;c.fillRect(0,0,out.width,out.height);variants.set(level,out);return out;
  },
  sprite(image,x,y,z,width,height,g,enemy=false,emissive=false){
    const base=this.project(x,y,z),top=this.project(x,y,z+height);if(!base.visible)return false;
    const screenW=width*base.scale,screenH=height*base.scale,left=base.x-screenW/2,yTop=top.y;if(left>this.W||left+screenW<0||yTop>this.H||base.y<0)return false;
    const a=Math.max(0,Math.floor(left)),b=Math.min(this.W,Math.ceil(left+screenW)),ya=Math.max(0,Math.floor(yTop)),yb=Math.min(this.H,Math.ceil(base.y));if(b<=a||yb<=ya)return false;
    const light=emissive?1:this.light(base.depth,(base.x/this.W)*2-1,x,y),tex=this.shade(image,light),c=g.ctx;let drawn=false;
    // Oclusión por píxel: la cobertura puede ocultar piernas sin borrar el resto del cuerpo.
    for(let sx=a;sx<b;sx+=2){
      const tx=Math.max(0,Math.min(tex.width-1,(sx-left)/screenW*tex.width));let run=-1;
      for(let sy=ya;sy<=yb;sy++){
        const visible=sy<yb&&base.depth<this.depth[sy*this.W+sx]-.08;
        if(visible&&run<0)run=sy;
        if(!visible&&run>=0){const ty=Math.max(0,(run-yTop)/screenH*tex.height),th=(sy-run)/screenH*tex.height;c.drawImage(tex,tx,ty,Math.max(.5,tex.width/screenW*2),Math.min(tex.height-ty,th),sx,run,Math.min(2,b-sx),sy-run);drawn=true;run=-1;}
      }
    }
    if(drawn){this.stats.sprites++;if(enemy)this.stats.visibleEnemies++;}else this.stats.occludedSprites++;return drawn;
  },
  glowImage(color='#e5cb93'){
    if(!this.glows)this.glows=new Map();if(this.glows.has(color))return this.glows.get(color);const cv=document.createElement('canvas');cv.width=cv.height=64;const c=cv.getContext('2d'),g=c.createRadialGradient(32,32,1,32,32,30);g.addColorStop(0,color);g.addColorStop(.2,color+'cc');g.addColorStop(1,color+'00');c.fillStyle=g;c.fillRect(0,0,64,64);this.glows.set(color,cv);return cv;
  },
  actors(g){
    const list=[];
    for(const ally of g.squad||[])list.push({entity:{...ally,type:'squad-'+ally.name},kind:ally.dead?'body':'ally',x:ally.x,y:ally.y,z:0});
    if(g.custodio)list.push({entity:{...g.custodio,type:'carnicero',id:900,isBoss:true,phase:1,def:{name:'El Custodio'}},kind:'enemy',x:g.custodio.x,y:g.custodio.y,z:0});
    for(const e of g.enemies)if(!e.dead&&!e.dormant)list.push({entity:e,kind:'enemy',x:e.x,y:e.y,z:e.mode==='air'?15:0});
    for(const item of g.items)list.push({entity:item,kind:'item',x:item.x,y:item.y,z:0});
    for(const b of g.bodies||[])list.push({entity:b,kind:'body',x:b.x,y:b.y,z:.2});
    for(const b of g.barrels||[])if(!b.dead)list.push({entity:b,kind:'barrel',x:b.x,y:b.y,z:0});
    if(g.fleshEcho)list.push({entity:{...g.fleshEcho,type:'echo',def:{color:'#9a78c1'}},kind:'enemy',x:g.fleshEcho.x,y:g.fleshEcho.y,z:0});
    list.sort((a,b)=>Math.hypot(b.x-g.player.x,b.y-g.player.y)-Math.hypot(a.x-g.player.x,a.y-g.player.y));
    for(const obj of list){
      if(!this.allowed(Math.floor(obj.x/TILE),Math.floor(obj.y/TILE)))continue;
      const image=POVArt.sprite(obj.entity,obj.kind,g),height=image.povHeight||(obj.kind==='enemy'?42:obj.kind==='item'?16:10),width=image.povWidth||height;
      this.sprite(image,obj.x,obj.y,obj.z,width,height,g,obj.kind==='enemy');
      const p=this.project(obj.x,obj.y,obj.z+height);
      if(obj.kind==='item'&&p.depth<120&&p.depth>10&&Math.abs(p.x-this.W/2)<this.W*.35&&Level.los(g.player.x,g.player.y,obj.x,obj.y)){
        const c=g.ctx;c.save();c.fillStyle='#ded9b9';c.font='600 '+Math.max(10,this.H/68)+'px Rajdhani,sans-serif';c.textAlign='center';c.shadowColor='#000';c.shadowBlur=4;const label=p.depth<48?'[E] '+itemLabel(obj.entity):/doc/.test(obj.entity.type)?'DOCUMENTO':obj.entity.id==='pp1'?'M9 · [E]':'';c.fillText(label,p.x,Math.max(18,p.y-8));c.restore();
      }
    }
  },
  line3D(a,b,color,width=2){
    let pa=this.project(...a),pb=this.project(...b);if(pa.depth<this.near&&pb.depth<this.near)return;
    if(pa.depth<this.near){const t=(this.near-pa.depth)/(pb.depth-pa.depth);a=a.map((v,i)=>v+(b[i]-v)*t);pa=this.project(...a);}
    if(pb.depth<this.near){const t=(this.near-pb.depth)/(pa.depth-pb.depth);b=b.map((v,i)=>v+(a[i]-v)*t);pb=this.project(...b);}
    const c=this.current.ctx,steps=Math.max(2,Math.min(300,Math.ceil(Math.hypot(pb.x-pa.x,pb.y-pa.y)/3)));c.save();c.strokeStyle=color;c.lineWidth=width;c.beginPath();let started=false;
    for(let i=0;i<=steps;i++){const t=i/steps,pt=a.map((v,j)=>v+(b[j]-v)*t),p=this.project(...pt),x=Math.floor(p.x),y=Math.floor(p.y),visible=x>=0&&y>=0&&x<this.W&&y<this.H&&p.depth<this.depth[y*this.W+x];if(visible){if(!started)c.moveTo(p.x,p.y);else c.lineTo(p.x,p.y);started=true;}else started=false;}c.stroke();c.restore();
  },
  effects(g){
    for(const q of g.eproj||[]){const color=q.bullet?'#ffe0a1':'#addb70',image=this.glowImage(color);this.sprite(image,q.x,q.y,18,9,9,g,false,true);}
    for(const q of g.projectiles||[]){const grenade=!!q.grenade||q.type==='gl6';this.sprite(this.glowImage(grenade?'#e7b177':'#b79ae4'),q.x,q.y,grenade?10:18,grenade?8:12,grenade?8:12,g,false,true);}
    for(const tr of g.tracers||[])this.line3D([tr.x1,tr.y1,24],[tr.x2,tr.y2,24],'#f7d694aa',1.3);
    for(const e of g.enemies)for(const h of e.hooks||[]){this.line3D([e.x,e.y,23],[h.x,h.y,20],'#bab8a9',1.5);this.sprite(this.glowImage('#ddc8a2'),h.x,h.y,18,7,7,g,false,true);}
    for(const jet of g.flameJets||[]){
      const reach=jet.reach||130,angle=jet.a??g.player.angle;for(let i=1;i<=7;i++){const d=i/7*reach,x=jet.x+Math.cos(angle)*d,y=jet.y+Math.sin(angle)*d;if(Level.solid(x,y))break;const size=8+i*2;g.ctx.save();g.ctx.globalAlpha=Math.max(.15,Math.min(.75,jet.life/(jet.max||.22)));this.sprite(this.glowImage(i%2?'#f3a655':'#e7cd7b'),x,y,8+i,size,size,g,false,true);g.ctx.restore();}
    }
    for(const q of (g.particles||[]).slice(-60)){const size=Math.min(4,Math.max(1,q.sz||2));this.sprite(this.glowImage(/^#[a-f0-9]{6}$/i.test(q.c)?q.c:'#c3a6bb'),q.x,q.y,8,size,size,g,false,true);}
    // Instinto conserva su función: siluetas sin revelar la geometría de otras salas.
    if(g.player.sense>0){const c=g.ctx;c.save();c.strokeStyle='#bca1d28c';c.lineWidth=1;for(const e of g.enemies){if(e.dead||e.dormant||Math.hypot(e.x-g.player.x,e.y-g.player.y)>280)continue;const p=this.project(e.x,e.y,22);if(p.depth>10&&p.depth<280){c.beginPath();c.ellipse(p.x,p.y,Math.min(30,12*p.scale),Math.min(65,22*p.scale),0,0,7);c.stroke();}}c.restore();}
  },
  doors(g){
    // El umbral y los travesaños siguen mostrando qué hueco es una puerta abierta.
    for(const door of Level.doors){if(!door.open)continue;const xs=door.tiles.map(t=>t[0]),ys=door.tiles.map(t=>t[1]),x0=Math.min(...xs)*TILE,y0=Math.min(...ys)*TILE,x1=(Math.max(...xs)+1)*TILE,y1=(Math.max(...ys)+1)*TILE;
      const center=[(x0+x1)/2,(y0+y1)/2];if(Math.hypot(center[0]-g.player.x,center[1]-g.player.y)>260||!Level.los(g.player.x,g.player.y,...center))continue;
      this.line3D([x0,y0,0],[x1,y1,0],'#a9b6ae88',1.5);
      if(x1-x0>=y1-y0){this.line3D([x0,center[1],51],[x1,center[1],51],'#9cb8b075',3);this.line3D([x0,center[1],0],[x0,center[1],51],'#8ca69a77',2);this.line3D([x1,center[1],0],[x1,center[1],51],'#8ca69a77',2);}else{this.line3D([center[0],y0,51],[center[0],y1,51],'#9cb8b075',3);this.line3D([center[0],y0,0],[center[0],y0,51],'#8ca69a77',2);this.line3D([center[0],y1,0],[center[0],y1,51],'#8ca69a77',2);}
    }
  },
  lampsAndExit(g){
    for(const l of this.lamps){const p=this.project(l.x,l.y,52);if(!p.visible||p.x<0||p.x>this.W||!this.allowed(Math.floor(l.x/TILE),Math.floor(l.y/TILE)))continue;const image=this.glowImage('#b9d1b9');g.ctx.save();g.ctx.globalAlpha=.46;this.sprite(image,l.x,l.y,50,18,3,g,false,true);g.ctx.restore();}
    if(g.lvl!=='hospitalstreet')return;const q=g.story.endgame,s=q?.street;if(!s?.active)return;
    const t=s.elapsed,base=s.start||[32.5*TILE,29.5*TILE],x=base[0]+Math.max(0,3-t)*180,y=base[1]-190-Math.max(0,3-t)*80;
    const image=POVArt.sprite({type:'helicopter',t:g.t},'helicopter',g);this.sprite(image,x,y,65,125,52,g,false,true);
    if(q.choice==='cure'&&t>4)this.line3D([x-15,y,68],[base[0],base[1]-Math.max(0,t-6)*34,2],'#bac2a1',2);
    if(g.state==='play'&&Math.floor(t*5)!==this.rotorStamp){this.rotorStamp=Math.floor(t*5);Sound.noise(.09,.035,120);}
    const c=g.ctx;c.save();c.strokeStyle='#9ab3c22b';c.lineWidth=.7;for(let i=0;i<65;i++){const xx=(i*127+g.t*20)%this.W,yy=(i*83+g.t*270)%this.H;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-3,yy+13);c.stroke();}c.restore();
  },
  overlay(g){
    const c=g.ctx,W=this.W,H=this.H,p=g.player,v=this.camera;c.save();
    const vignette=c.createRadialGradient(W/2,H*.5,H*.2,W/2,H*.5,W*.68);vignette.addColorStop(0,'#03070b00');vignette.addColorStop(.7,'#02060b18');vignette.addColorStop(1,'#010408b5');c.fillStyle=vignette;c.fillRect(0,0,W,H);
    if(p.poison>0){c.fillStyle=`rgba(72,123,38,${Math.min(.2,p.poison*.02)})`;c.fillRect(0,0,W,H);}
    if(p.hidden){c.fillStyle='#020608d9';c.fillRect(0,0,W,H*.27);c.fillRect(0,H*.34,W,H*.12);c.fillRect(0,H*.53,W,H*.47);c.strokeStyle='#78918c50';c.lineWidth=3;c.strokeRect(4,H*.27,W-8,H*.07);c.strokeRect(4,H*.46,W-8,H*.07);}
    if(g.collapse){const t=g.collapse.t;c.fillStyle=`rgba(2,5,8,${Math.max(0,Math.min(.95,(t-.5)/1.2))})`;c.fillRect(0,0,W,H);c.strokeStyle='#b5b2a983';c.lineWidth=3;for(let i=0;i<9;i++){const a=i*6.283/9;c.beginPath();c.moveTo(W/2+Math.cos(a)*20,H*.8);c.lineTo(W/2+Math.cos(a)*W*.45,H*.8+Math.sin(a)*H*.6);c.stroke();}}
    if(g.state==='play'&&!p.hidden&&!g.collapse){
      POVArt.drawWeapon(c,g,W,H,g.t);
      const aimY=v.horizon,gap=p.focus>0?5:8+Math.min(10,(p.spreadAdd||0)*35);c.strokeStyle=p.stamina<12?'#c28a79':'#d4ded2b0';c.lineWidth=1;c.beginPath();for(const sign of [-1,1]){c.moveTo(W/2+sign*gap,aimY);c.lineTo(W/2+sign*(gap+5),aimY);c.moveTo(W/2,aimY+sign*gap);c.lineTo(W/2,aimY+sign*(gap+5));}c.stroke();c.fillStyle='#dde4d5';c.fillRect(W/2-1,aimY-1,2,2);
      let threat=null,dist=420;for(const e of g.enemies){if(e.dead||e.dormant||!['wind','windup','air'].includes(e.mode||e.state))continue;const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<dist&&Level.los(p.x,p.y,e.x,e.y)){dist=d;threat=e;}}
      if(threat){const angle=Math.atan2(threat.y-p.y,threat.x-p.x)-p.angle,relative=Math.atan2(Math.sin(angle),Math.cos(angle));if(Math.abs(relative)>this.fov*.42){const x=relative>0?W*.91:W*.09,y=H*.52;c.fillStyle='#e5aa7f';c.beginPath();c.moveTo(x+(relative>0?8:-8),y);c.lineTo(x,y-7);c.lineTo(x,y+7);c.closePath();c.fill();c.font='600 11px Rajdhani,sans-serif';c.textAlign='center';c.fillText(Math.abs(relative)>2?'DETRÁS':'PELIGRO',x,y+23);}}
    }
    if(p.hurtFlash>0){c.fillStyle=`rgba(128,24,38,${Math.min(.19,p.hurtFlash*.5)})`;c.fillRect(0,0,W,H);}
    c.restore();
  },
  hud(g){
    ProtectionSuit.hud(g);
    for(const [id,test]of [['worksStatus',()=>WorksMap.is(g)],['nestCue',()=>DepthsMap.is(g)],['castleStatus',()=>CastleMap.is(g)],['castleCue',()=>CastleMap.is(g)],['lfStatus',()=>EndMap.is(g)],['lfCue',()=>EndMap.is(g)]])if(!test())UI.$(id)?.classList.add('hidden');
  },
  render(g){
    if(['menu','menuOptions'].includes(g.state)||!this.init(g))return;const c=g.ctx;c.save();c.setTransform(1,0,0,1,0,0);this.setup(g);this.floor(g);this.cues(g);this.walls(g);this.actors(g);this.doors(g);this.effects(g);this.lampsAndExit(g);this.overlay(g);this.introGuide(g);this.hud(g);c.restore();this.stats.wallColumns=this.stats.columns;this.stats.spriteCount=this.stats.sprites;this.stats.telegraphCount=this.stats.groundCues;this.frame++;
  }
};
(()=>{
  const render=Game.render;
  Game.render=function(){if(FirstPerson.active(this))return FirstPersonRenderer.render(this);return render.call(this);};
})();
