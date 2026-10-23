// Gráficos de primera persona. Materiales y siluetas frontales propios, todos locales.
// Ningún dibujo altera actores, inventario, colisiones o daño del juego.
const POVArt = {
  textures:new Map(), sprites:new Map(), ready:false,
  init(){if(this.ready)return true;if(typeof HTMLCanvasElement==='undefined')return false;this.ready=true;return true;},
  canvas(w=128,h=w){const c=document.createElement('canvas');c.width=w;c.height=h;return c;},
  rng(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};},
  hash(s){let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;},
  theme(g){const id=typeof g==='string'?g:g?.lvl||'';if(id==='mansion')return'mansion';if(/castle|cells|royal/.test(id))return'castle';if(/umbra|origin|lab/.test(id))return'lab';if(/street/.test(id))return'street';if(/works|nest|sewer|chem|^(?:hospital)?pit$/.test(id))return'works';return'hospital';},
  palette(t){return ({hospital:['#879b94','#2f6767','#b4bcb0','#536f70'],mansion:['#9a9482','#493c32','#b9aa8c','#655244'],works:['#788275','#3a4d43','#9c9270','#54655c'],castle:['#83847d','#5e5d54','#a7a393','#727166'],lab:['#9caeaa','#4b707a','#d1d9c9','#66858b'],street:['#85847e','#515f60','#b7ada0','#65706f']})[t]||['#879b94','#2f6767','#b4bcb0','#536f70'];},
  line(c,points,color,width=1){c.strokeStyle=color;c.lineWidth=width;c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.stroke();},
  ellipse(c,x,y,rx,ry,color,rotation=0){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);c.fill();},
  polygon(c,points,fill,stroke){c.fillStyle=fill;c.beginPath();for(let i=0;i<points.length;i++)i?c.lineTo(...points[i]):c.moveTo(...points[i]);c.closePath();c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.3;c.stroke();}},
  material(c,colors){const g=c.createLinearGradient(0,0,128,128);g.addColorStop(0,colors[0]);g.addColorStop(.52,colors[1]||colors[0]);g.addColorStop(1,colors[2]||colors[0]);return g;},
  grain(c,rnd,n,light=.08,dark=.12){for(let i=0;i<n;i++){c.fillStyle=i%3?`rgba(236,237,215,${light*rnd()})`:`rgba(2,8,11,${dark*rnd()})`;c.fillRect(rnd()*128,rnd()*128,.5+rnd()*2,.5+rnd()*2);}},
  wall(theme,id=0){
    if(!this.init())return null;theme=this.theme(theme)||theme;const kind=String(id),key='wall:'+theme+':'+kind;if(this.textures.has(key))return this.textures.get(key);
    const image=this.canvas(),c=image.getContext('2d'),rnd=this.rng(this.hash(key)),p=this.palette(theme);
    if(/door|puerta/.test(kind)){this.paintDoor(c,theme,rnd,kind);}
    else if(kind.startsWith('prop:')&&!/crate|wood|shelf|locker|metal|machine|counter/.test(kind)){this.paintCover(c,theme,kind.slice(5),rnd);}
    else if(/crate|wood|shelf/.test(kind)){
      c.fillStyle=this.material(c,['#78634b','#51432e','#302b24']);c.fillRect(0,0,128,128);for(let x=0;x<128;x+=21){this.line(c,[[x,0],[x,128]],'#201f1c',2);for(let n=0;n<12;n++)this.line(c,[[x+3+rnd()*16,0],[x+3+rnd()*16,128]],'#b1a17c15',.7);}this.line(c,[[4,4],[124,124]],'#ad957359',12);this.line(c,[[124,4],[4,124]],'#443b2a99',10);for(const x of[7,121])for(const y of[7,121])this.ellipse(c,x,y,2,2,'#252a29');
    }else if(/locker|metal|machine|counter/.test(kind)){
      c.fillStyle=this.material(c,['#6e8583','#486467','#263c43']);c.fillRect(0,0,128,128);c.strokeStyle='#1a3036';c.lineWidth=3;c.strokeRect(3,3,122,122);this.line(c,[[64,5],[64,124]],'#162d35',2);for(let i=0;i<6;i++){c.fillStyle='#173039';c.fillRect(14,13+i*5,34,2);c.fillStyle='#a6b6a737';c.fillRect(14,15+i*5,34,1);}c.fillStyle='#171e20';c.fillRect(51,66,6,18);c.fillStyle='#b5bbb0';c.fillRect(52,67,3,14);this.grain(c,rnd,220,.08,.18);
    }else if(theme==='castle'){
      c.fillStyle='#353b3a';c.fillRect(0,0,128,128);for(let y=0;y<128;y+=32)for(let x=-64;x<160;x+=64){const xx=x+(y%64?32:0);c.fillStyle=this.material(c,[p[0],p[1],p[3]]);c.fillRect(xx+2,y+2,61,29);this.line(c,[[xx+3,y+3],[xx+61,y+3]],'#c0baa84a');this.line(c,[[xx+3,y+30],[xx+61,y+30]],'#151f237d');for(let n=0;n<7;n++){c.fillStyle='#0a17201b';c.fillRect(xx+rnd()*60,y+rnd()*29,6+rnd()*20,1+rnd()*3);}}this.grain(c,rnd,440,.07,.14);
    }else if(theme==='mansion'){
      c.fillStyle=this.material(c,['#b2aa92','#8b8a7b','#75776c']);c.fillRect(0,0,128,128);c.fillStyle='#4e4234';c.fillRect(0,77,128,51);for(let x=0;x<128;x+=32){c.strokeStyle='#241f1a';c.lineWidth=2;c.strokeRect(x+3,82,27,42);this.line(c,[[x+6,85],[x+26,85],[x+26,119]],'#baa07540');}c.fillStyle='#2c2721';c.fillRect(0,75,128,4);c.fillStyle='#b3a283';c.fillRect(0,74,128,1);for(let i=0;i<9;i++){c.strokeStyle='#65574320';c.beginPath();c.arc(8+i*16,28,12,0,Math.PI*2);c.stroke();}this.grain(c,rnd,400,.07,.12);
    }else if(theme==='works'){
      c.fillStyle=this.material(c,['#858b79','#566c60','#3d5450']);c.fillRect(0,0,128,128);for(let y=0;y<128;y+=32)for(let x=0;x<128;x+=32){c.strokeStyle='#1b393c88';c.lineWidth=1.3;c.strokeRect(x,y,32,32);}for(let i=0;i<30;i++){c.fillStyle=i%2?'#743f2448':'#182d2855';c.fillRect(rnd()*128,rnd()*95,1+rnd()*7,15+rnd()*45);}c.fillStyle='#334a48';c.fillRect(0,96,128,32);this.line(c,[[0,95],[128,95]],'#8d9b7a7d',2);this.grain(c,rnd,400,.06,.18);
    }else if(theme==='street'){
      c.fillStyle=this.material(c,['#8c8b7d','#6b736b','#545e5e']);c.fillRect(0,0,128,128);for(let y=0;y<128;y+=32){const off=y%64?32:0;this.line(c,[[0,y],[128,y]],'#394744',2);for(let x=off;x<128;x+=64)this.line(c,[[x,y],[x,y+32]],'#374440',2);}this.grain(c,rnd,800,.07,.2);
    }else{
      c.fillStyle=this.material(c,[p[2],p[0],p[3]]);c.fillRect(0,0,128,128);c.fillStyle=this.material(c,[p[1],p[3],p[1]]);c.fillRect(0,72,128,56);
      for(let y=76;y<128;y+=24)for(let x=0;x<128;x+=32){c.strokeStyle='#183c3f99';c.lineWidth=1;c.strokeRect(x,y,32,24);this.line(c,[[x+2,y+2],[x+30,y+2]],'#b5cbc12d');}c.fillStyle='#233c3d';c.fillRect(0,69,128,5);c.fillStyle='#b4c5b3';c.fillRect(0,69,128,1);
      if(theme==='lab'){c.fillStyle='#324e59';c.fillRect(0,15,128,3);c.fillStyle='#6e9598';c.fillRect(0,19,128,2);for(const x of[5,122])for(const y of[6,63]){this.ellipse(c,x,y,1.5,1.5,'#4c6468');this.ellipse(c,x-.4,y-.4,.5,.5,'#c6d5c5');}}
      this.grain(c,rnd,700,.07,.14);
    }
    if(!/door|crate|wood|shelf|locker|metal|machine|counter/.test(kind)){
      // Suciedad vertical, grietas y manchas secas de sangre.
      for(let i=0;i<10;i++){const x=rnd()*128,y=rnd()*100;c.fillStyle='#16272819';c.fillRect(x,y,1+rnd()*4,7+rnd()*20);}if(this.hash(key)%4===1){c.strokeStyle='#3b342e80';c.lineWidth=.7;c.beginPath();c.moveTo(27,0);c.lineTo(31,13);c.lineTo(27,20);c.lineTo(38,32);c.lineTo(40,46);c.stroke();}if(this.hash(key)%7===3){c.fillStyle='#5a22274d';c.fillRect(82,76,3,25);this.ellipse(c,84,75,9,4,'#6f28325a');}
      if(theme==='hospital'||theme==='lab'){const variant=this.hash(key)%6;if(variant===2||variant===3){c.fillStyle='#192c31';c.fillRect(39,31,53,21);c.fillStyle='#a8c1b6';c.font='bold 9px Rajdhani,sans-serif';c.textAlign='center';c.fillText(variant===2?'SG / 02':'RIUTEX',65,43);c.fillStyle=theme==='lab'?'#8b719d':'#709f91';c.fillRect(44,47,43,1);}}
    }
    this.textures.set(key,image);return image;
  },
  paintCover(c,theme,type,rnd){
    const wood=/desk|table|bench/.test(type)&&theme!=='lab';c.fillStyle=this.material(c,wood?['#8b795b','#65543e','#3d3d31']:['#9cac9e','#6c8985','#344f57']);c.fillRect(0,0,128,128);
    if(/bed/.test(type)){c.fillStyle='#b7c3ac';c.fillRect(0,3,128,39);c.fillStyle='#779b90';c.fillRect(0,40,128,36);this.line(c,[[0,76],[128,76]],'#c6d0b7',5);for(const x of[6,119]){c.fillStyle='#94b1ab';c.fillRect(x,0,4,128);}this.ellipse(c,77,31,16,7,'#7d414569');this.line(c,[[0,80],[128,80]],'#193c47',3);}
    else if(/pillar/.test(type)){for(let x=0;x<128;x+=21)this.line(c,[[x,0],[x,128]],'#b9c1a51d',3);this.line(c,[[6,0],[6,128]],'#d2d3b94d',3);this.line(c,[[121,0],[121,128]],'#18333e88',4);}
    else if(/bars/.test(type)){c.fillStyle='#18313a';c.fillRect(0,0,128,128);for(let x=7;x<128;x+=24){c.fillStyle='#627f81';c.fillRect(x,0,7,128);c.fillStyle='#b9c8ae';c.fillRect(x+1,0,1,128);}for(const y of[20,108]){c.fillStyle='#4c6b74';c.fillRect(0,y,128,6);}}
    else{c.fillStyle=wood?'#ae9670':'#bec8b0';c.fillRect(0,2,128,8);c.fillStyle=wood?'#3d4234':'#375660';c.fillRect(9,31,110,34);c.fillRect(9,74,110,38);c.fillStyle='#c1c7a5';c.fillRect(54,44,22,4);c.fillRect(54,88,22,4);this.line(c,[[10,32],[117,32]],'#b3bba54d',1);}
    this.grain(c,rnd,220,.07,.14);
  },
  paintDoor(c,theme,rnd,kind){
    const wood=theme==='mansion'||theme==='castle';c.fillStyle='#1b2b30';c.fillRect(0,0,128,128);c.fillStyle=wood?this.material(c,['#8e7955','#5e5039','#3b352b']):this.material(c,['#7d9694','#58757a','#38545e']);c.fillRect(7,3,114,125);c.strokeStyle='#b1bbb171';c.lineWidth=2;c.strokeRect(7,3,114,124);
    if(wood){for(const x of[15,68]){c.strokeStyle='#252c29';c.strokeRect(x,15,44,44);c.strokeRect(x,70,44,44);this.line(c,[[x+3,18],[x+40,18],[x+40,56]],'#c5b18b40');}}else{c.fillStyle='#172e38';c.fillRect(27,19,74,36);c.fillStyle='#6b8e8b';c.fillRect(31,23,66,28);this.line(c,[[33,25],[89,25]],'#c3dbbe6a',2);this.line(c,[[35,48],[76,25]],'#d1dfca24',6);c.fillStyle='#27414a';c.fillRect(12,91,104,24);c.fillStyle='#8ca1a2';c.fillRect(14,92,100,1);}
    c.fillStyle='#1b272b';c.fillRect(99,64,8,18);c.fillStyle='#c5c7b1';c.fillRect(98,70,14,3);this.ellipse(c,103,77,1,1,'#1c2728');this.grain(c,rnd,260,.06,.15);
    if(/locked|cerr/.test(kind)){c.fillStyle='#ac5f42';c.fillRect(16,62,10,5);}else{c.fillStyle='#7cae9d';c.fillRect(16,62,10,5);}
  },
  floor(theme){
    if(!this.init())return null;theme=this.theme(theme);const key='floor:'+theme;if(this.textures.has(key))return this.textures.get(key);const image=this.canvas(),c=image.getContext('2d'),r=this.rng(this.hash(key));
    if(theme==='mansion'){c.fillStyle='#564c3d';c.fillRect(0,0,128,128);for(let y=0;y<128;y+=16){c.fillStyle=y%32?'#5e5443':'#4c473a';c.fillRect(0,y,128,15);this.line(c,[[0,y],[128,y]],'#242b28');for(let n=0;n<14;n++)this.line(c,[[r()*128,y+r()*13],[r()*128,y+r()*13]],'#ac9d7120',.6);}}
    else if(theme==='works'){c.fillStyle='#354b48';c.fillRect(0,0,128,128);for(let x=0;x<128;x+=8){c.fillStyle='#172e34';c.fillRect(x,0,4,128);c.fillStyle='#6e82752a';c.fillRect(x+5,0,1,128);}for(let y=0;y<128;y+=32){c.fillStyle='#6e7e6c';c.fillRect(0,y,128,3);for(let x=10;x<128;x+=32)this.ellipse(c,x,y+1,1.4,1.4,'#14262c');}}
    else if(theme==='castle'){c.fillStyle='#535b55';c.fillRect(0,0,128,128);for(let y=0;y<128;y+=32)for(let x=0;x<128;x+=32){c.fillStyle=(x+y)%64?'#626a5e':'#4f5953';c.fillRect(x+1,y+1,30,30);this.line(c,[[x+2,y+2],[x+29,y+2]],'#a9a79440');}for(let i=0;i<20;i++)this.line(c,[[r()*128,r()*128],[r()*128,r()*128]],'#1d303031',.7);}
    else if(theme==='street'){c.fillStyle='#3c4949';c.fillRect(0,0,128,128);for(let i=0;i<1800;i++){const x=r()*128,y=r()*128;c.fillStyle=i%3?'#b5b7a31b':'#111f2b54';c.fillRect(x,y,1+r()*2,1+r()*2);}}
    else{c.fillStyle='#667974';c.fillRect(0,0,128,128);for(let y=0;y<128;y+=32)for(let x=0;x<128;x+=32){c.fillStyle=(x+y)%64?'#788b81':'#536c68';if(theme==='lab')c.fillStyle=(x+y)%64?'#8da19a':'#697f81';c.fillRect(x+1,y+1,30,30);this.line(c,[[x+2,y+2],[x+29,y+2]],'#c5d0bc40');this.line(c,[[x+1,y+30],[x+30,y+30]],'#233c3c66');}}
    this.grain(c,r,550,.06,.14);this.textures.set(key,image);return image;
  },
  ceiling(theme){if(!this.init())return null;theme=this.theme(theme);const key='ceiling:'+theme;if(this.textures.has(key))return this.textures.get(key);const image=this.canvas(),c=image.getContext('2d'),r=this.rng(this.hash(key));c.fillStyle=theme==='castle'?'#3e4a49':'#667773';c.fillRect(0,0,128,128);for(let y=0;y<128;y+=64)for(let x=0;x<128;x+=64){c.strokeStyle='#263f42';c.lineWidth=2;c.strokeRect(x,y,64,64);this.line(c,[[x+3,y+3],[x+60,y+3]],'#b9c9b12e');}this.grain(c,r,360,.08,.12);this.textures.set(key,image);return image;},
  sprite(e,kind='enemy',g){
    if(!this.init())return null;const type=String(e?.type||e?.kind||e||'unknown'),phase=Math.max(1,Math.min(3,e?.phase||1));const pose=/wind|attack|swing|slash|chain|charge|rush/.test(e?.mode||e?.state||'')?1:0;
    const angle=g?.player&&Number.isFinite(e?.face)?Math.atan2(g.player.y-e.y,g.player.x-e.x)-e.face:0,back=kind==='enemy'&&Math.cos(angle)<-.55;
    const gait=kind==='enemy'&&g?.state==='play'?Math.floor((g.t||0)*5+(Number(e.id)||0))%2:0;
    const key=[kind,type,phase,pose,back?1:0,gait,e?.colony?1:0].join(':');if(this.sprites.has(key))return this.sprites.get(key);
    const image=this.canvas(256),c=image.getContext('2d');image.povHeight=42;image.povWidth=25;
    if(kind==='enemy')this.enemy(c,e,g,{phase,pose,back,gait,image});
    else if(kind==='ally'){this.ally(c,e);image.povHeight=42;image.povWidth=40;}
    else if(kind==='body'){this.body(c,e);image.povHeight=7;image.povWidth=28;}
    else if(kind==='helicopter'){this.helicopter(c);image.povHeight=48;image.povWidth=100;}
    else if(kind==='prop'){this.prop(c,type);image.povHeight=/locker|shelf|pillar|bars/.test(type)?46:20;image.povWidth=30;}
    else if(kind==='barrel'){this.barrel(c);image.povHeight=26;image.povWidth=19;}
    else this.item(c,e,{image,theme:this.theme(g)});
    if(this.sprites.size>=128)this.sprites.delete(this.sprites.keys().next().value);this.sprites.set(key,image);return image;
  },
  ally(c,e){
    const uniform=e.col||'#3e5760';this.ellipse(c,128,249,66,5,'#060c10a0');
    this.polygon(c,[[95,152],[122,153],[119,232],[90,233]],'#26383f');this.polygon(c,[[136,153],[160,152],[170,231],[140,233]],'#2b4248');
    this.ellipse(c,106,239,23,9,'#17262c');this.ellipse(c,156,239,23,9,'#17262c');
    const vest=c.createLinearGradient(80,85,170,180);vest.addColorStop(0,uniform);vest.addColorStop(.5,'#52706c');vest.addColorStop(1,'#20373f');this.polygon(c,[[90,77],[163,77],[180,107],[165,180],[87,180],[76,107]],vest,'#1b343e');
    this.polygon(c,[[99,92],[153,92],[156,169],[97,169]],'#233c43');for(let i=0;i<3;i++){c.fillStyle='#54736d';c.fillRect(101+i*17,117,13,33);this.line(c,[[102+i*17,123],[113+i*17,123]],'#98a49566');}
    this.arm(c,77,99,'#b29f87',uniform,0,1,false);this.arm(c,181,99,'#ad9f8b',uniform,-.3,1,false);
    this.ellipse(c,128,49,22,28,'#a99e88');this.polygon(c,[[104,43],[108,23],[122,15],[140,17],[151,28],[152,44]],'#2a4141','#73877c');c.fillStyle='#182c35';c.fillRect(109,42,40,9);this.line(c,[[112,44],[144,44]],'#819b9466',2);this.line(c,[[122,62],[135,62]],'#655b51',1.5);
    this.polygon(c,[[80,116],[178,128],[177,142],[77,132]],'#1b3039','#8a9d97');this.polygon(c,[[113,132],[133,133],[140,161],[121,161]],'#263e46');this.line(c,[[174,131],[204,134]],'#8f9e97',4);
  },
  enemy(c,e,g,o){
    const type=String(e.type||''),name=e.def?.name||'',{phase,pose,back,gait,image}=o;
    const butcher=e.id===900||/Carnicero|Carcelero/.test(name)||/butcher|carnicero/.test(type),wren=type==='lf_wren',regent=type==='cl_regent',blind=type==='cl_blind',spider=/spider|matriarch/.test(type),boss=!!e.isBoss||butcher;
    if(spider){this.spider(c,e,phase,pose,gait);image.povHeight=type==='ds_matriarch'?42+phase*9:12;image.povWidth=type==='ds_matriarch'?70+phase*8:28;return;}
    if(type==='rastrero'){this.crawler(c,pose,gait);image.povHeight=24;image.povWidth=46;return;}
    if(type==='cl_hound'||type==='wx_scuttler'){this.beast(c,type,pose,gait);image.povHeight=24;image.povWidth=35;return;}
    if(type==='cl_moth'){this.moth(c,pose,gait);image.povHeight=29;image.povWidth=48;return;}
    image.povHeight=boss?butcher?58+phase*5:regent?62+phase*8:wren?58+phase*15:55:blind?54:/hinchado|mauler|sentinel|ds_guard/.test(type)?49:42;
    image.povWidth=boss?wren?64+phase*18:66+phase*8:blind?58:/hinchado|mauler|sentinel/.test(type)?50:40;
    // Sombra de apoyo y cuerpo frontal, con variante posterior.
    this.ellipse(c,129,250,72,5,'#060c10a0');
    const bulk=butcher||wren||regent||/hinchado|mauler|sentinel|ds_guard|keeper/.test(type),lean=/rastrero|listener|runner|vacio/.test(type),scaleX=bulk?1.17:lean?.84:1;
    c.save();c.translate(128,0);c.scale(scaleX,1);c.translate(-128,0);
    const skin=wren?phase===3?'#9e7799':phase===2?'#869c91':'#a5b8a5':blind?'#a29582':butcher?'#a79487':/listener|mirror/.test(type)?'#a092ac':/spitter|spore|hinchado/.test(type)?'#899b6b':'#a5af95';
    const clothing=butcher?'#716a5b':regent?'#596c6c':wren?phase===1?'#afbab1':'#53685f':/enfermera|cirujano/.test(type)?'#a2b4aa':/camillero|ds_guard|sentinel/.test(type)?'#4b6f76':/halberd|shield/.test(type)?'#647975':'#4e625b';
    const step=gait?4:-4;
    this.polygon(c,[[94,156],[123,154],[120+step,228],[92+step,232],[87,207]],'#283c3e','#101f25');this.polygon(c,[[133,154],[161,155],[168-step,226],[141-step,231],[133,205]],'#354749','#14262c');
    this.ellipse(c,106+step,239,24,10,'#172a2d');this.ellipse(c,156-step,239,24,10,'#1a2d30');this.line(c,[[89+step,235],[124+step,237]],'#6b817844',2);
    const torso=c.createLinearGradient(79,82,177,174);torso.addColorStop(0,clothing);torso.addColorStop(.5,bulk?'#7b8875':clothing);torso.addColorStop(1,'#263c3d');c.fillStyle=torso;c.beginPath();c.moveTo(91,77);c.quadraticCurveTo(65,96,80,135);c.lineTo(82,178);c.quadraticCurveTo(128,193,174,177);c.lineTo(173,131);c.quadraticCurveTo(193,88,158,77);c.closePath();c.fill();
    this.line(c,[[89,104],[89,165]],'#b4c1a72c',3);this.line(c,[[165,99],[168,172]],'#172d3266',3);
    if(back){this.line(c,[[126,89],[126,171]],'#20363877',2);this.line(c,[[95,102],[159,102]],'#b4c3b32b',2);}else{
      if(/enfermera|cirujano/.test(type)||wren&&phase===1){this.polygon(c,[[96,81],[124,100],[112,127],[91,99]],'#c6ccba');this.polygon(c,[[158,81],[130,100],[141,125],[168,98]],'#9cafaa');this.line(c,[[129,103],[129,179]],'#324c504d',2);c.fillStyle='#74918b';c.fillRect(142,117,23,16);c.fillStyle='#3b686d';c.fillRect(147,120,13,2);}
      else if(butcher){this.polygon(c,[[100,91],[154,90],[164,181],[88,181]],'#b0a692','#4d5d55');for(const [x,y]of[[110,114],[143,130],[102,162]]){this.ellipse(c,x,y,8,12,'#652c33aa');this.line(c,[[x,y],[x+1,y+25]],'#572c35',2);}}
      else{this.line(c,[[129,96],[127,175]],'#1d363a',2);this.line(c,[[98,112],[115,116],[112,131]],'#a5b2a342',2);}
    }
    this.arm(c,75,99,skin,clothing,pose?-1:0,lean?-1:1,back);this.arm(c,181,98,skin,clothing,pose?1:0,1,back);
    this.ellipse(c,128,68,13,17,skin);const head=c.createLinearGradient(106,30,150,65);head.addColorStop(0,'#c0c7af');head.addColorStop(.5,skin);head.addColorStop(1,'#596d63');this.ellipse(c,128,46,23,31,head);
    this.ellipse(c,106,49,4,7,skin);this.ellipse(c,150,49,4,7,'#6e8270');
    if(back){this.ellipse(c,128,34,23,20,'#2c403b');this.line(c,[[116,69],[126,77],[139,67]],'#516e63',2);}
    else{
      this.polygon(c,[[112,33],[119,27],[137,28],[146,37],[144,22],[131,14],[113,20]],'#33453c');
      this.ellipse(c,118,43,7,5,'#344c45');this.ellipse(c,138,43,7,5,'#263f3d');
      if(!blind&&!/listener/.test(type)){this.ellipse(c,119,44,2,1.8,regent||wren?'#e2d4a3':'#d4d4ac');this.ellipse(c,138,44,2,1.8,regent||wren?'#dbbc9a':'#cad5af');}
      this.line(c,[[128,45],[124,56],[131,57]],'#6a8170',2);this.polygon(c,[[116,62],[139,60],[136,69],[122,70]],'#351d27');for(let x=121;x<136;x+=4){c.fillStyle='#bfc3a2';c.fillRect(x,61,2,3);}this.line(c,[[114,54],[111,58],[118,57]],'#752c37',2);
      if(/enfermera|cirujano/.test(type)){c.fillStyle='#b5c5b1';c.fillRect(108,53,38,13);this.line(c,[[111,56],[142,56],[142,62],[111,62]],'#678581',1);}
      if(blind||/listener/.test(type)){this.polygon(c,[[106,33],[151,31],[152,50],[106,50]],'#54585c','#c0aea060');this.line(c,[[108,36],[149,47]],'#272b36',3);this.line(c,[[110,45],[146,34]],'#8b8782',2);}
    }
    if(/spitter|spore|hinchado/.test(type)){for(const [x,y,r]of[[96,107,12],[153,133,14],[119,155,17],[162,95,8]]){this.ellipse(c,x,y,r,r*1.2,'#9baa72');this.ellipse(c,x-3,y-4,r*.45,r*.4,'#c1c79769');this.ellipse(c,x+2,y+4,3,4,'#566a37');}}
    if(butcher){this.cleaver(c,pose);if(phase>1)this.growth(c,phase,'butcher');}
    if(blind){for(const sign of[-1,1])for(let i=0;i<3;i++)this.polygon(c,[[128+sign*(76+i*3),154+i*4],[128+sign*(90+i*7),218-i*6],[128+sign*(73+i*4),174+i*3]],'#b1b7a6','#44575b');this.line(c,[[92,81],[105,92],[98,119],[118,144]],'#774951',3);}
    if(regent||/halberd|shield/.test(type)){this.knight(c,e,phase,pose,back);if(regent&&phase>1)this.growth(c,phase,'regent');}
    if(wren&&phase>1)this.growth(c,phase,'wren');
    if(/mauler|keeper|ds_guard|sentinel/.test(type)){this.polygon(c,[[85,85],[63,56],[93,72]],'#a9b19a','#344c48');this.polygon(c,[[169,85],[192,56],[165,72]],'#9ba88e','#344c48');this.line(c,[[102,126],[127,143],[151,130]],'#bdba9d',5);}
    this.clothDamage(c,type,back);
    if(/mirror/.test(type)){this.line(c,[[93,85],[128,110],[161,86]],'#b399bb',3);this.line(c,[[105,145],[127,165],[152,142]],'#baa3bd',2);}
    c.restore();
  },
  clothDamage(c,type,back){
    const rnd=this.rng(this.hash(type));for(let i=0;i<23;i++){const x=87+rnd()*78,y=98+rnd()*72;this.line(c,[[x,y],[x+5+rnd()*9,y+1+rnd()*3]],i%3?'#d5d7ba12':'#172c3633',.7);}
    for(const x of[101,153]){this.line(c,[[x,149],[x-4,162],[x+3,176]],'#162f373d',1.3);this.line(c,[[x+1,150],[x-2,162]],'#c0cbb029',1);}
    if(!back&&!/cl_|lf_mirror/.test(type)){const x=96+rnd()*53,y=106+rnd()*56;this.polygon(c,[[x,y],[x+11,y-4],[x+7,y+11],[x+3,y+8],[x,y+17]],'#713c4759');this.line(c,[[x+6,y+7],[x+6,y+25]],'#592c3977',1);}
  },
  crawler(c,pose,gait){
    this.ellipse(c,128,248,116,7,'#061019a0');this.ellipse(c,128,183,61,45,'#5b7168');for(const sign of[-1,1]){const step=gait?6:-6;this.polygon(c,[[128+sign*45,168],[128+sign*81,172],[128+sign*(103+step),221],[128+sign*90,241],[128+sign*66,233],[128+sign*62,203]],'#9ca88a','#405d59');this.ellipse(c,128+sign*83,237,22,10,'#9daa8c');for(let i=0;i<4;i++)this.line(c,[[128+sign*(72+i*7),237],[128+sign*(74+i*7),247]],'#566e5e',1.3);}
    this.ellipse(c,128,129,37,43,'#aab498');this.polygon(c,[[96,117],[107,93],[141,92],[164,117],[149,108],[109,108]],'#3f5a4c');for(const x of[111,146]){this.ellipse(c,x,128,10,8,'#324d49');this.ellipse(c,x+1,128,3,2.5,'#d3cfab');}this.line(c,[[127,130],[122,144],[132,146]],'#6d876f',2);this.polygon(c,[[105,153],[152,151],[149,172],[124,179],[109,169]],'#3e2330','#8c7c75');for(let i=0;i<7;i++)this.polygon(c,[[110+i*6,153],[113+i*6,164],[116+i*6,153]],'#cccfaa');this.line(c,[[109,182],[126,198],[148,183]],'#b0b49a',4);for(let i=0;i<4;i++)this.polygon(c,[[102+i*14,169],[106+i*14,153],[112+i*14,174]],'#849e84');
  },
  arm(c,x,y,skin,cloth,pose,side,back){
    c.save();c.translate(x,y);c.rotate(pose?side*.5:side*-.14);c.fillStyle=cloth;c.beginPath();c.ellipse(0,15,14,28,side*.1,0,7);c.fill();this.polygon(c,[[-10,29],[10,29],[12,65],[3,79],[-9,67]],skin,'#334d4760');this.ellipse(c,1,72,10,13,skin);this.line(c,[[-7,74],[9,72]],back?'#52675a':'#687f6c',1.5);for(let i=0;i<3;i++)this.line(c,[[-5+i*5,75],[-6+i*5,82]],'#53695d',1);c.restore();
  },
  cleaver(c,pose){
    c.save();c.translate(197,pose?100:172);c.rotate(pose?-.65:.12);this.line(c,[[0,-18],[0,55]],'#4b3e31',8);this.line(c,[[1,-18],[1,53]],'#b19b78',2);this.polygon(c,[[2,-21],[35,-24],[44,16],[4,24]],'#9aa99c','#1b373e');this.line(c,[[34,-21],[41,14],[6,21]],'#d4d7bd',2);this.ellipse(c,12,-11,3,3,'#384f4f');this.polygon(c,[[20,8],[42,8],[43,16],[22,19]],'#773137aa');c.restore();
  },
  growth(c,phase,which){
    const purple=which==='wren',skin=purple?'#9f95ad':'#a7a18a';
    for(const sign of[-1,1]){this.ellipse(c,128+sign*(33+phase*4),87,20+phase*3,28+phase*4,skin,sign*.3);for(let i=0;i<4;i++){const x=128+sign*(37+i*8),y=76+i*16;this.polygon(c,[[x,y+12],[x+sign*(20+phase*4),y-24],[x-sign*3,y+3]],i%2?'#778a87':'#c1c2aa','#3b5559');}this.line(c,[[128+sign*23,81],[128+sign*45,107],[128+sign*30,140]],purple?'#775b89':'#74464c',3);}
    this.polygon(c,[[109,108],[145,105],[161,153],[132,181],[105,163],[93,133]],purple?'#66566d':'#67575a','#b6b2a5');
    for(let i=0;i<5;i++)this.line(c,[[104+i*9,115],[112+i*8,154]],'#c4c5aa',3);
    if(phase===3){for(let i=0;i<6;i++){const a=i*.6-1.5,x=128+Math.cos(a)*53,y=60+Math.sin(a)*22;this.polygon(c,[[x-6,y+13],[x+Math.cos(a)*35,y+Math.sin(a)*33],[x+7,y+9]],purple?'#b8a7bf':'#c1b8a5','#3b4e57');}this.ellipse(c,128,135,18,22,'#271b31');this.ellipse(c,128,132,8,11,purple?'#c79ed7':'#c6856d');}
  },
  knight(c,e,phase,pose,back){
    const boss=e.type==='cl_regent';if(boss&&phase>1)return;
    this.polygon(c,[[90,88],[127,98],[162,87],[168,137],[129,154],[86,137]],'#79877e','#253b42');this.polygon(c,[[97,94],[128,107],[157,94],[151,124],[129,139],[104,125]],'#9ba393','#465c5c');this.line(c,[[128,105],[128,145]],'#394f53',3);
    this.polygon(c,[[104,25],[128,11],[151,25],[149,62],[128,79],[105,62]],'#8b9689','#2b454b');if(!back){c.fillStyle='#1b3038';c.fillRect(108,42,40,6);this.line(c,[[128,20],[128,67]],'#c7c8aa',3);}
    if(boss||e.type==='cl_shield'){this.polygon(c,[[55,109],[83,100],[111,111],[109,160],[83,190],[54,161]],'#536865','#152e38');this.polygon(c,[[60,114],[83,106],[105,115],[103,157],[83,182],[60,157]],'#a5a48c','#d2c5a1');this.line(c,[[83,110],[83,176]],'#5b6b60',5);this.line(c,[[65,135],[101,135]],'#5b6b60',5);}
    c.save();c.translate(193,pose?76:154);c.rotate(pose?.45:-.15);this.polygon(c,[[-3,-92],[2,-108],[8,-92],[8,35],[2,44],[-3,35]],'#adb7aa','#38555c');this.line(c,[[2,-93],[2,34]],'#eef0cf',1.3);this.line(c,[[-15,39],[19,39]],'#a49b71',6);this.line(c,[[2,42],[2,65]],'#4a3a32',7);c.restore();
  },
  spider(c,e,phase,pose,gait){
    const boss=e.type==='ds_matriarch';const color=boss?phase===3?'#968477':phase===2?'#8f9674':'#7e9076':'#7f9771';this.ellipse(c,128,246,107,7,'#061019a6');
    for(const sign of[-1,1])for(let i=0;i<4;i++){
      const x=128+sign*(28+i*6),y=123+i*11,xx=128+sign*(88+i%2*19),yy=103+i*22+(gait?i%2*8:0);
      this.line(c,[[x,y],[xx,yy],[128+sign*(108-i*7),236-i*8]],'#172d35',10);this.line(c,[[x-1,y-2],[xx-1,yy-2],[128+sign*(108-i*7),232-i*8]],color,6);this.ellipse(c,xx,yy,5,5,'#b7bd91');
    }
    const abdomen=c.createLinearGradient(80,95,177,190);abdomen.addColorStop(0,'#b7bb91');abdomen.addColorStop(.5,color);abdomen.addColorStop(1,'#334c4c');this.ellipse(c,128,115,55,68,abdomen);this.ellipse(c,128,174,42,39,'#576c5f');
    for(let i=0;i<5;i++)this.line(c,[[94,82+i*20],[125,90+i*21],[158,83+i*20]],'#273f3f77',3);
    for(const sign of[-1,1]){this.polygon(c,[[128+sign*17,182],[128+sign*(37+(pose?12:0)),210],[128+sign*13,233],[128+sign*20,204]],'#c3c4a0','#304b48');for(let i=0;i<3;i++)this.ellipse(c,128+sign*(10+i*9),163+i%2*6,3.5-i*.5,3,'#dbc3a0');}
    for(const [x,y]of[[118,86],[144,105],[102,116],[130,134]])this.ellipse(c,x,y,boss?10:6,boss?11:6,'#a5ba6777');
    if(boss&&phase>1){for(const sign of[-1,1])for(let i=0;i<4;i++)this.polygon(c,[[128+sign*(30+i*4),75+i*20],[128+sign*(67+i*5),54+i*21],[128+sign*(39+i*4),89+i*20]],'#b7b99c','#3e5753');}
    if(boss&&phase===3){this.ellipse(c,128,135,23,27,'#593b51');this.ellipse(c,128,132,13,18,'#c4b18a');this.line(c,[[128,111],[128,154]],'#452a3b',3);}
  },
  beast(c,type,pose,gait){
    const hound=type==='cl_hound';this.ellipse(c,127,249,109,5,'#061019a0');for(const sign of[-1,1]){this.polygon(c,[[128+sign*34,146],[128+sign*70,176],[128+sign*(85+(gait?5:0)),234],[128+sign*55,242],[128+sign*48,195]],hound?'#747a64':'#8e9278','#314c48');}
    this.ellipse(c,128,147,68,51,hound?'#696f5d':'#86917b');this.ellipse(c,128,102,43,37,'#939d80');this.polygon(c,[[94,97],[96,58],[112,87]],'#8c967c','#3c5550');this.polygon(c,[[146,86],[161,54],[163,104]],'#8d977d','#3c5550');
    this.polygon(c,[[98,107],[158,106],[150,157],[128,174],[106,153]],'#4a3c3e','#adad8b');this.ellipse(c,113,103,6,4,'#d1c4a0');this.ellipse(c,145,103,6,4,'#d1c4a0');this.ellipse(c,128,119,11,7,'#283c40');for(let i=0;i<7;i++)this.polygon(c,[[108+i*6,132],[112+i*6,144],[115+i*6,132]],'#d5d1a7');this.line(c,[[104,157],[128,163],[151,153]],'#a26b67',3);
    if(!hound){for(let i=0;i<6;i++)this.polygon(c,[[88+i*14,131],[91+i*14,96-i%2*9],[101+i*14,132]],'#afa995','#506f65');}
  },
  moth(c,pose,gait){
    for(const sign of[-1,1]){this.polygon(c,[[128,112],[128+sign*91,39+(gait?12:0)],[128+sign*105,116],[128+sign*64,186],[128+sign*8,155]],'#a7ab92','#435b5a');for(let i=0;i<5;i++)this.line(c,[[128,121],[128+sign*(62+i*10),64+i*20]],'#667d7099',2);this.ellipse(c,128+sign*64,115,17,24,'#647d74');this.ellipse(c,128+sign*64,115,8,12,'#bdbda0');}
    this.ellipse(c,128,139,22,70,'#88937d');this.ellipse(c,128,74,19,23,'#a6af95');this.line(c,[[119,60],[101,34]],'#aebca3',2);this.line(c,[[138,60],[153,33]],'#aebca3',2);this.ellipse(c,120,77,5,6,'#c6cba1');this.ellipse(c,137,77,5,6,'#c6cba1');
  },
  body(c,e){this.ellipse(c,127,244,100,10,'#13202a9a');this.ellipse(c,135,229,78,14,'#5c3d42');this.polygon(c,[[40,226],[85,203],[160,217],[205,237],[162,248],[88,231]],'#60716a','#263c3d');this.ellipse(c,66,215,15,14,'#9b9f84');this.line(c,[[95,222],[126,232],[169,228]],'#713a42',4);},
  barrel(c){const g=c.createLinearGradient(59,0,193,0);g.addColorStop(0,'#3d3531');g.addColorStop(.4,'#9f5b3f');g.addColorStop(1,'#42382f');c.fillStyle=g;c.fillRect(60,77,135,164);this.ellipse(c,127,77,67,17,'#a56e4e');this.ellipse(c,127,241,67,12,'#493d34');for(const y of[108,210]){c.fillStyle='#8f9372';c.fillRect(61,y,133,6);c.fillStyle='#273c3d';c.fillRect(61,y+6,133,2);}this.polygon(c,[[127,131],[153,174],[101,174]],'#c6ac65','#2f3934');c.fillStyle='#303e34';c.fillRect(124,143,6,18);this.ellipse(c,127,167,3,3,'#303e34');},
  prop(c,type){
    if(/locker|shelf|pillar|bars/.test(type)){
      if(/bars/.test(type)){for(let x=31;x<236;x+=31){c.fillStyle='#203a42';c.fillRect(x,4,11,246);c.fillStyle='#9aad9e';c.fillRect(x+2,4,2,246);}for(const y of[23,220]){c.fillStyle='#4a676c';c.fillRect(13,y,230,9);}return;}
      c.fillStyle=this.material(c,['#8ba29a','#5b7777','#263f48']);c.fillRect(27,8,203,241);c.strokeStyle='#1b333c';c.lineWidth=5;c.strokeRect(27,8,203,241);
      if(/shelf/.test(type)){for(let y=28;y<240;y+=49){c.fillStyle='#263e40';c.fillRect(38,y,179,35);for(let i=0;i<8;i++){c.fillStyle=['#8d9276','#57797b','#90796d'][i%3];c.fillRect(43+i*21,y+5,13,29);}c.fillStyle='#b3b7a1';c.fillRect(34,y+36,187,3);}}
      else{for(const x of[47,144])for(let y=30;y<60;y+=7){c.fillStyle='#263e45';c.fillRect(x,y,63,3);}this.line(c,[[129,11],[129,246]],'#1b343d',4);for(const x of[114,144]){c.fillStyle='#b5c2ab';c.fillRect(x,113,5,24);}c.fillStyle='#7e9587';c.fillRect(53,85,40,16);}return;
    }
    if(/bed|bench/.test(type)){this.bed(c);return;}
    if(/machine/.test(type)){this.machine(c);return;}
    const wood=/crate|desk|table/.test(type),g=c.createLinearGradient(28,100,222,220);g.addColorStop(0,wood?'#8c795d':'#8ca39b');g.addColorStop(1,wood?'#4d4936':'#405c63');c.fillStyle=g;c.fillRect(24,111,209,112);this.polygon(c,[[24,111],[56,88],[214,88],[233,111]],wood?'#a08d6b':'#a9b6a8','#2d4544');
    if(/crate/.test(type)){this.line(c,[[33,122],[221,212]],'#cab08169',11);this.line(c,[[221,122],[33,212]],'#9c805b99',9);c.strokeStyle='#374538';c.lineWidth=5;c.strokeRect(29,117,198,99);}else{for(const x of[37,211]){c.fillStyle='#273b3d';c.fillRect(x,217,9,34);}c.fillStyle='#233e45';c.fillRect(144,135,65,57);c.fillStyle='#8fa99d';c.fillRect(170,147,16,4);}
  },
  bed(c){
    for(const x of[45,207]){this.line(c,[[x,136],[x,238]],'#739095',9);this.ellipse(c,x,244,14,9,'#172f38');this.ellipse(c,x,244,6,5,'#8fa49c');}this.polygon(c,[[26,157],[58,109],[201,109],[231,157],[224,185],[33,185]],'#aab6a3','#354e52');c.fillStyle='#c2c7ae';c.fillRect(68,111,117,25);this.polygon(c,[[39,154],[218,155],[214,177],[39,177]],'#72928d');this.line(c,[[27,121],[27,182],[231,182],[231,122]],'#a5bab0',6);this.ellipse(c,151,156,26,8,'#77334083');this.line(c,[[92,142],[123,160],[161,164]],'#dce0c144',2);
  },
  machine(c){c.fillStyle='#2b434b';c.fillRect(57,30,143,216);c.fillStyle=this.material(c,['#a6b5a5','#789792','#3c6268']);c.fillRect(61,36,135,205);c.fillStyle='#122f39';c.fillRect(75,52,108,65);c.fillStyle='#8ec0af';c.fillRect(82,59,94,46);this.line(c,[[86,83],[100,83],[108,68],[115,96],[122,79],[153,79],[165,72]],'#d6e3b8',2);for(let y=140;y<222;y+=22){c.fillStyle='#2e5055';c.fillRect(77,y,103,11);c.fillStyle='#bfd0b3';c.fillRect(84,y+3,55,2);this.ellipse(c,168,y+5,3,3,y%44?'#b99a61':'#83b5a5');}},
  item(c,e,o){
    const t=String(e?.type||''),id=String(e?.id||'');o.image.povHeight=10;o.image.povWidth=13;
    if(t==='h_hide'){this.prop(c,'locker');o.image.povHeight=43;o.image.povWidth=30;return;}
    if(t==='h_clock'){
      c.fillStyle='#3e382f';c.fillRect(62,36,134,214);this.polygon(c,[[56,39],[88,12],[170,12],[202,39]],'#8c7b59','#273d3c');c.fillStyle='#8f7b55';c.fillRect(69,43,120,201);c.fillStyle='#423d31';c.fillRect(82,137,94,96);this.ellipse(c,128,88,48,48,'#b5b599');this.ellipse(c,128,88,43,43,'#d2ceb0');for(let i=0;i<12;i++){const a=i*Math.PI/6;this.line(c,[[128+Math.cos(a)*35,88+Math.sin(a)*35],[128+Math.cos(a)*40,88+Math.sin(a)*40]],'#425851',2);}this.line(c,[[128,88],[146,89]],'#2e4747',4);this.line(c,[[128,88],[102,107]],'#2e4747',3);this.ellipse(c,128,88,4,4,'#607a66');this.line(c,[[128,142],[128,196]],'#b8aa79',4);this.ellipse(c,128,209,21,21,'#b8aa79');c.fillStyle='#3f3f31';c.fillRect(56,243,147,10);o.image.povHeight=42;o.image.povWidth=26;return;
    }
    if(t==='h_vial'){
      this.polygon(c,[[101,65],[153,65],[158,220],[98,220]],'#a1c7bf33','#adc8b9');c.fillStyle='#ae8bd399';c.fillRect(104,119,48,93);c.fillStyle='#536f76';c.fillRect(95,52,67,21);c.fillStyle='#bed5bd';c.fillRect(98,53,61,4);for(const [x,y]of[[115,186],[138,161],[121,141]])this.ellipse(c,x,y,4,8,'#dcc0e696');this.line(c,[[107,82],[107,210]],'#d9e4ce77',3);c.fillStyle='#a9c0ae';c.fillRect(91,220,77,10);o.image.povHeight=16;o.image.povWidth=10;return;
    }
    if(t==='h_safe'){
      c.fillStyle='#2f474f';c.fillRect(30,63,198,186);c.fillStyle='#8ca498';c.fillRect(37,69,183,174);c.strokeStyle='#203d48';c.lineWidth=7;c.strokeRect(48,83,160,146);this.ellipse(c,115,150,33,33,'#344f57');this.ellipse(c,115,150,25,25,'#bdc7ad');for(let i=0;i<10;i++){const a=i*Math.PI/5;this.line(c,[[115+Math.cos(a)*18,150+Math.sin(a)*18],[115+Math.cos(a)*23,150+Math.sin(a)*23]],'#4b6663');}this.line(c,[[169,127],[169,180]],'#d4d5bb',8);o.image.povHeight=25;o.image.povWidth=28;return;
    }
    if(t==='h_cab'){this.prop(c,'locker');c.fillStyle='#d0d5bd';c.fillRect(95,79,64,69);c.fillStyle='#8e4d4d';c.fillRect(120,86,15,55);c.fillRect(102,105,50,15);o.image.povHeight=36;o.image.povWidth=29;return;}
    if(/radio/.test(t)){
      c.fillStyle='#304a4d';c.fillRect(83,97,94,142);c.fillStyle='#7e9486';c.fillRect(91,111,77,122);this.line(c,[[102,100],[101,43]],'#c0c8ad',5);c.fillStyle='#1e3d43';c.fillRect(101,124,59,33);c.fillStyle='#7ea291';c.fillRect(105,129,51,22);for(let y=171;y<220;y+=9){c.fillStyle='#233f45';c.fillRect(99,y,60,3);}this.ellipse(c,150,100,9,8,'#b2c2a5');o.image.povHeight=13;o.image.povWidth=8;return;
    }
    if(/_case$|_cache$|_reserve$/.test(t)){
      c.fillStyle='#2d4a54';c.fillRect(30,120,196,118);c.fillStyle='#748f87';c.fillRect(33,124,189,36);c.fillStyle='#9cb4a0';c.fillRect(36,126,183,3);for(const x of[45,197]){c.fillStyle='#bfbb90';c.fillRect(x,143,10,37);}this.line(c,[[108,117],[108,98],[150,98],[150,117]],'#b3bda3',7);c.strokeStyle='#1b3b47';c.lineWidth=3;c.strokeRect(34,125,188,107);o.image.povHeight=17;o.image.povWidth=27;return;
    }
    if(/part|sample|ingredient/.test(t)){
      if(/lf_/.test(t)){c.fillStyle='#b5c9b4';c.fillRect(75,87,106,19);c.fillStyle='#2a4b54';c.fillRect(79,106,98,127);c.fillStyle='#92ada3';c.fillRect(89,117,77,101);c.fillStyle='#becab1';c.fillRect(98,149,60,33);this.line(c,[[109,162],[145,162]],'#5d8180',5);c.fillStyle='#b396ce';c.fillRect(96,197,63,13);o.image.povHeight=14;o.image.povWidth=11;}
      else{const part=e.part||'';if(/cell/.test(part)){c.fillStyle='#8c9c7c';c.fillRect(77,93,103,140);c.fillStyle='#364d45';c.fillRect(80,118,97,76);c.fillStyle='#c3bc86';c.fillRect(94,81,20,12);c.fillRect(148,81,20,12);this.line(c,[[128,137],[128,174]],'#c7cea6',5);this.line(c,[[109,156],[146,156]],'#c7cea6',5);}else{for(let i=0;i<12;i++){c.save();c.translate(128,171);c.rotate(i*Math.PI/6);c.fillStyle='#a3ad91';c.fillRect(-9,-76,18,27);c.restore();}this.ellipse(c,128,171,60,60,'#6f8778');this.ellipse(c,128,171,38,38,'#a5b298');this.ellipse(c,128,171,23,23,'#2b4b54');this.line(c,[[97,127],[99,151]],'#d4d4b8',3);}o.image.povHeight=12;o.image.povWidth=15;}return;
    }
    if(t==='savebed'){this.bed(c);o.image.povHeight=25;o.image.povWidth=37;this.ellipse(c,128,98,13,13,'#b9d8b966');this.line(c,[[128,91],[128,105]],'#e0ebca',3);this.line(c,[[121,98],[135,98]],'#e0ebca',3);return;}
    if(t==='caja'||/stash|chest/.test(t)){this.prop(c,'crate');o.image.povHeight=23;o.image.povWidth=32;this.line(c,[[126,119],[126,164]],'#b4c7a2',7);return;}
    if(/workbench|bench/.test(t)){this.prop(c,'desk');this.line(c,[[74,82],[112,118]],'#c8c9ac',6);this.ellipse(c,72,81,10,10,'#adb9a7');this.ellipse(c,72,81,5,6,'#38585d');c.fillStyle='#708e88';c.fillRect(143,59,35,46);this.ellipse(c,161,57,19,9,'#a4b6a2');o.image.povHeight=26;o.image.povWidth=38;return;}
    if(/stairs|_up|_down|to_cells|to_hub|finish|leave|exit|return|_back/.test(t)){for(let i=0;i<6;i++){c.fillStyle=i%2?'#8ca39a':'#6d8885';c.fillRect(31+i*12,229-i*29,194-i*24,22);}this.line(c,[[31,219],[94,49],[190,49]],'#bccbbc',4);o.image.povHeight=38;o.image.povWidth=35;return;}
    if(t==='doc'||/doc|note|letter|file|record/.test(t)||typeof DOCS!=='undefined'&&DOCS[id]&&/document|paper/.test(t)){
      c.save();c.translate(128,162);c.rotate(-.12);c.fillStyle='#253e43';c.fillRect(-61,-71,124,151);c.fillStyle='#c0c3aa';c.fillRect(-54,-65,108,139);c.fillStyle='#778e82';c.fillRect(-19,-74,42,15);c.fillStyle='#455f5c';c.fillRect(-40,-46,57,7);for(let i=0;i<10;i++)c.fillRect(-40,-25+i*7,69-i%3*13,2);c.strokeStyle='#9a4e4c';c.lineWidth=2;c.strokeRect(-17,40,55,19);this.ellipse(c,-30,48,9,5,'#863a4266');c.restore();o.image.povHeight=12;o.image.povWidth=10;return;
    }
    if(/key|llave|valve|part|sample|ingredient|medallion/.test(t)||/key|valve/.test(id)){
      if(/valv/.test(t+id)){this.ellipse(c,128,176,71,57,'#475e58');c.strokeStyle='#b39362';c.lineWidth=13;c.beginPath();c.arc(128,171,55,0,Math.PI*2);c.stroke();for(let i=0;i<4;i++){const a=i*Math.PI/2;this.line(c,[[128,171],[128+Math.cos(a)*55,171+Math.sin(a)*55]],'#baa06c',8);}this.ellipse(c,128,171,13,13,'#d6b577');o.image.povHeight=16;o.image.povWidth=18;}
      else{c.save();c.translate(128,182);c.rotate(-.4);this.ellipse(c,-33,-13,27,27,'#bcad79');this.ellipse(c,-33,-13,15,15,'#243d43');this.line(c,[[-9,-13],[64,-13]],'#d4c28a',13);this.line(c,[[35,-14],[35,11]],'#c0ac76',10);this.line(c,[[57,-13],[57,4]],'#c0ac76',10);c.restore();o.image.povHeight=9;o.image.povWidth=15;}return;
    }
    if(/inj_|serum|riutex|cure/.test(t)){
      const color=/green/.test(t)?'#83ba91':/yellow/.test(t)?'#d7bc7e':/blue/.test(t)?'#79b8c1':'#b794cf';c.save();c.translate(128,173);c.rotate(.35);c.fillStyle='#d0d6c1';c.fillRect(-6,-65,12,38);c.fillStyle='#6b8888';c.fillRect(-31,-28,62,9);c.fillStyle='#b4cbc22e';c.fillRect(-20,-18,40,63);c.strokeStyle='#c2d4bc';c.lineWidth=3;c.strokeRect(-20,-18,40,63);c.fillStyle=color;c.fillRect(-15,7,30,30);c.fillStyle='#698a8d';c.fillRect(-8,45,16,13);this.line(c,[[0,58],[0,86]],'#b8cebd',2);for(let i=0;i<4;i++)c.fillRect(-20,-7+i*10,9,1);c.restore();o.image.povHeight=11;o.image.povWidth=6;return;
    }
    if(/w_|pistol|shotgun|viper|rifle|r98|flamethrower|gl6|launcher|ak/.test(t)){
      c.save();c.translate(125,185);c.rotate(-.2);c.fillStyle='#8b9f99';c.fillRect(-83,-18,150,24);c.fillStyle='#233d45';c.fillRect(-90,-22,147,11);c.fillStyle='#b0c0ae';c.fillRect(-58,-22,70,3);this.polygon(c,[[-12,5],[11,4],[25,49],[-4,49]],'#37515a','#9eada1');c.fillStyle='#7f694c';c.fillRect(-80,7,49,14);c.fillStyle='#1b343e';c.fillRect(65,-16,30,15);c.restore();o.image.povHeight=10;o.image.povWidth=22;return;
    }
    if(/am_|ammo|shell|fuel|grenade/.test(t)){
      c.fillStyle='#405b55';c.fillRect(46,124,163,110);this.polygon(c,[[46,124],[68,105],[195,105],[209,124]],'#879d7d','#314a4e');c.fillStyle='#a4ad83';c.fillRect(57,148,141,44);c.fillStyle='#3d5449';c.font='bold 29px Rajdhani,sans-serif';c.textAlign='center';c.fillText(/fuel/.test(t)?'FL-4':/gl6/.test(t)?'GL-6':/shell/.test(t)?'12 GA':'MUNICIÓN',127,178);c.fillStyle='#bdab75';for(let i=0;i<5;i++)c.fillRect(63+i*26,205,9,22);o.image.povHeight=9;o.image.povWidth=12;return;
    }
    // Los mecanismos son consolas físicas, identificables por pantalla y mandos.
    if(/puzzle|terminal|reactor|mix|hydro|generator|bell|radio|safe|pad|cab|panel|h_/.test(t)){
      if(o.theme==='castle'){this.prop(c,'desk');c.fillStyle='#b29e72';c.fillRect(71,40,116,102);c.strokeStyle='#485d55';c.lineWidth=3;c.strokeRect(78,47,102,89);this.ellipse(c,129,90,31,31,'#697a63');this.ellipse(c,129,90,25,25,'#c4bc8e');for(let i=0;i<8;i++){const a=i*Math.PI/4;this.line(c,[[129,90],[129+Math.cos(a)*25,90+Math.sin(a)*25]],'#62765e',2);}this.ellipse(c,129,90,7,7,'#415c57');}
      else this.machine(c);if(/bell/.test(t)){c.clearRect(0,0,256,256);this.line(c,[[34,39],[220,39]],'#4a615c',18);this.line(c,[[128,35],[128,69]],'#a19b78',9);c.fillStyle='#b6a16e';c.beginPath();c.moveTo(86,69);c.quadraticCurveTo(123,48,163,69);c.quadraticCurveTo(167,149,197,177);c.lineTo(57,177);c.quadraticCurveTo(88,137,86,69);c.fill();this.ellipse(c,127,178,72,17,'#746441');this.line(c,[[128,178],[126,225]],'#bba573',9);}o.image.povHeight=34;o.image.povWidth=24;return;
    }
    c.fillStyle='#6d877a';c.fillRect(63,145,129,86);this.polygon(c,[[63,145],[88,123],[174,123],[192,145]],'#a8b194','#3d5a59');c.fillStyle='#d2ceb0';c.fillRect(97,162,60,26);this.line(c,[[111,175],[143,175]],'#637e71',4);o.image.povHeight=10;o.image.povWidth=12;
  },
  helicopter(c){
    this.ellipse(c,128,125,62,42,'#485e5d');this.polygon(c,[[79,99],[120,87],[160,91],[178,116],[140,124],[83,120]],'#aac0b1','#162f38');this.line(c,[[122,89],[125,124]],'#29434b',5);this.polygon(c,[[172,124],[240,112],[248,117],[178,147]],'#4a6465','#213a44');this.line(c,[[128,82],[128,56]],'#7f9992',7);this.line(c,[[20,56],[236,56]],'#94a99d',7);for(const x of[83,172])this.line(c,[[x,153],[x,187]],'#5d797d',5);this.line(c,[[53,191],[202,191]],'#a2b6a9',6);this.ellipse(c,92,137,5,4,'#c7a082');
  },
  drawWeapon(c,g,w,h,time=0){
    const p=g?.player;if(!p)return;const id=p.weapon?.id||'',predator=p.predator>0,blade=p.blade>0,missing=g.story?.armCut&&!g.story?.armHealed;
    const moving=!!p.running||!!(g.keys&&(g.keys.KeyW||g.keys.KeyA||g.keys.KeyS||g.keys.KeyD)),bob=moving?Math.sin(p.walkT||time*6)*2.4:Math.sin(time*.9)*.35;
    const heavy=['ak','shotgun','rifle','r98','flamethrower','gl6','launcher'].includes(id);
    const base=Math.min(w/1000,h/650),flash=p.flash>0,scale=base*.9,reload=p.reloading>0,anchor=id?(heavy?.55:.52):.57;
    c.save();c.translate(w*anchor+bob*base,h+18*base+(flash?10:0)*base);c.scale(scale,scale);c.rotate(reload?-.26:0);
    const skin=p.evo>.5?'#a9a590':'#bca88c',mut=p.evo>.15?'#786e83':'#45626a';
    if(predator){this.hand(c,-104,-45,skin,true,-1);this.hand(c,152,-15,skin,true,1);for(const sign of[-1,1])for(let i=0;i<3;i++)this.polygon(c,[[sign*(75+i*24),-85],[sign*(60+i*30),-264-i*8],[sign*(90+i*24),-83]],'#b6c6b1','#405863');}
    else if(!id){this.hand(c,111,-12,skin,blade,1);if(!missing)this.hand(c,-133,-5,skin,blade,-1);if(blade)this.polygon(c,[[86,-48],[4,-254],[63,-278],[131,-56]],'#b5c5b7','#486876');}
    else{
      this.polygon(c,[[57,21],[71,-143],[121,-163],[180,-70],[227,24]],mut,'#203d49');
      if(!missing)this.polygon(c,[[-154,22],[-145,-93],[-52,-203],[-15,-172],[-69,-29],[-68,23]],'#456269','#1d3b48');
      this.hand(c,113,-87,skin,false,1);
      if(heavy)this.longWeapon(c,id,p,flash);else this.shortWeapon(c,id,p,flash);
      if(!missing){c.save();c.translate(-48,-184);c.rotate(.72);this.ellipse(c,0,0,22,34,skin);for(let i=0;i<4;i++)this.line(c,[[-17+i*9,-6],[-11+i*9,17]],'#776f604a',2);c.restore();}
    }
    if(id&&!predator&&blade&&!missing){this.polygon(c,[[-124,-51],[-164,-258],[-135,-284],[-94,-65]],'#aebfb0','#456b72');this.line(c,[[-121,-75],[-141,-223]],'#bda1d177',3);}
    if(p.slash>0){c.save();c.translate(-90,-80);c.rotate(-.8+p.slash*8);this.hand(c,0,0,skin,blade,-1);if(blade)this.polygon(c,[[-25,-34],[-68,-224],[-11,-259],[24,-27]],'#bed0c0','#476877');c.restore();}
    c.restore();
  },
  hand(c,x,y,skin,mutant,side){
    c.save();c.translate(x,y);c.rotate(side*.24);const g=c.createLinearGradient(-24,-80,35,20);g.addColorStop(0,skin);g.addColorStop(.5,mutant?'#9593a4':skin);g.addColorStop(1,'#766f65');this.polygon(c,[[-28,49],[-26,-39],[-15,-71],[15,-76],[36,-44],[30,18],[18,55]],g,'#4a5b57');for(let i=0;i<4;i++)this.line(c,[[-15+i*11,-46],[-15+i*11,-18]],'#6f7262',1.4);this.line(c,[[-12,-7],[7,-14],[23,-10]],'#e4d2b16b',1.4);if(mutant){this.line(c,[[-12,35],[-7,-3],[11,-24],[10,-66]],'#73567d',3);this.polygon(c,[[9,-65],[16,-112],[23,-68]],'#c3cfbb','#57727c');}c.restore();
  },
  shortWeapon(c,id,p,flash){
    const uzi=id==='viper',metal=c.createLinearGradient(-49,-260,73,-90);metal.addColorStop(0,'#b3c2b8');metal.addColorStop(.18,'#667e83');metal.addColorStop(.52,'#354e5a');metal.addColorStop(1,'#152f3d');
    this.polygon(c,[[6,-30],[-22,-155],[24,-174],[66,-79],[54,-16]],'#233c47','#7c9090');this.polygon(c,[[-39,-137],[-39,-249],[22,-283],[65,-146]],metal,'#18323e');
    this.polygon(c,[[-33,-246],[20,-274],[31,-233],[-27,-218]],'#98aaa8','#cbd2bb');this.polygon(c,[[-33,-245],[-41,-251],[12,-283],[21,-276]],'#d0d5bf');
    c.fillStyle='#102b39';c.fillRect(-15,-203,21,9);this.line(c,[[-27,-213],[-18,-152]],'#b1bcb354',2);for(let i=0;i<5;i++)this.line(c,[[37+i*3,-174],[44+i*3,-151]],'#9aaba066',1.5);
    this.line(c,[[-22,-124],[21,-130],[34,-111],[28,-88],[3,-92]],'#1b323c',7);this.line(c,[[8,-126],[12,-106]],'#acb7a7',4);
    if(uzi){this.polygon(c,[[-54,-157],[-63,-257],[2,-280],[70,-189],[63,-151]],metal,'#c3cbb359');for(let i=0;i<5;i++)this.line(c,[[-47+i*11,-196],[-47+i*11,-223]],'#122f3b',5);this.polygon(c,[[5,-144],[35,-151],[61,-53],[29,-36]],'#263e46','#849a98');this.line(c,[[-27,-264],[7,-277],[33,-258]],'#afbcb2',3);}
    this.polygon(c,[[-22,-261],[15,-281],[27,-264],[-10,-246]],'#5f7d83','#b7c8b6');this.line(c,[[-13,-259],[17,-275]],'#d9debf',2);this.line(c,[[3,-281],[4,-290]],'#a1b5ad',3);this.line(c,[[-11,-210],[-6,-216],[3,-215],[9,-207]],'#c4d0bd',2);if(flash)this.muzzle(c,0,-284,45,p);
  },
  longWeapon(c,id,p,flash){
    const flame=id==='flamethrower',gl=id==='gl6'||id==='launcher',shotgun=id==='shotgun',ak=id==='ak',rifle=id==='rifle'||id==='r98';
    const metal=c.createLinearGradient(-85,-300,136,-85);metal.addColorStop(0,'#a2b8b0');metal.addColorStop(.18,'#63828a');metal.addColorStop(.55,'#304f5e');metal.addColorStop(1,'#142f40');
    this.polygon(c,[[29,12],[-14,-146],[32,-179],[127,-32],[140,23]],ak?'#8c6d4f':'#3d5961','#182f3d');this.polygon(c,[[-50,-118],[-84,-267],[-34,-303],[96,-162],[85,-103]],metal,'#152e3f');
    this.polygon(c,[[-64,-254],[-48,-305],[-28,-322],[19,-221]],'#193644','#9db4ae');this.line(c,[[-45,-301],[-24,-317],[15,-220]],'#a9bdb4',3);
    const fore=shotgun||ak?'#8c7453':flame?'#697d6d':'#536d72';this.polygon(c,[[-66,-219],[-43,-267],[-11,-248],[37,-175],[13,-151]],fore,'#203b47');for(let i=0;i<6;i++)this.line(c,[[-53+i*8,-233+i*8],[-32+i*8,-247+i*8]],'#273f46',3);
    this.polygon(c,[[6,-139],[47,-152],[78,-80],[43,-48]],'#263f4a','#809991');this.line(c,[[-37,-123],[-4,-135],[12,-115],[11,-89],[-11,-84]],'#102c3a',8);this.line(c,[[-12,-131],[-6,-108]],'#9aaea5',4);
    if(ak){this.polygon(c,[[12,-139],[40,-149],[86,-63],[81,-16],[57,-4],[56,-44]],'#253f49','#8ca096');this.line(c,[[28,-132],[68,-53],[68,-20]],'#81958b',2);}
    if(shotgun){this.line(c,[[-52,-291],[-23,-195]],'#536e76',13);this.line(c,[[-53,-293],[-23,-197]],'#b0c2b7',3);}
    if(rifle){this.polygon(c,[[-42,-212],[-63,-265],[-45,-279],[-19,-232]],'#193542','#aabdb3');this.ellipse(c,-48,-255,27,18,'#516f77',.7);this.ellipse(c,-52,-261,18,13,'#0a2332',.7);this.ellipse(c,-54,-264,11,8,'#4a827d88',.7);this.line(c,[[-35,-219],[-9,-166]],'#b0c0b6',3);}
    if(gl){this.polygon(c,[[-72,-188],[-86,-260],[-44,-297],[18,-211]],'#7f8b76','#bac4ac');this.ellipse(c,-61,-266,31,21,'#92a18d',.6);this.ellipse(c,-65,-271,23,15,'#6c837f',.6);this.line(c,[[-84,-274],[-48,-260]],'#b8c9b7',3);this.line(c,[[-68,-282],[-69,-266]],'#294650',4);for(let i=0;i<3;i++){this.ellipse(c,35+i*16,-165+i*23,8,13,'#b4a15f',-.4);this.ellipse(c,31+i*16,-171+i*23,5,6,'#d1cba7',-.4);}}
    if(flame){this.polygon(c,[[-78,-171],[-105,-238],[-59,-274],[11,-194]],'#658272','#bbbf9b');this.ellipse(c,-78,-245,34,22,'#9daf9b',.6);this.ellipse(c,-85,-250,24,14,'#6f8e84',.6);this.line(c,[[-103,-257],[-70,-243]],'#bdc8ab',3);this.line(c,[[40,-101],[94,-138],[59,-219],[-20,-251]],'#bb9667',10);this.line(c,[[42,-103],[94,-141],[59,-219],[-21,-251]],'#e0c78e',2);this.ellipse(c,42,-166,22,23,'#b6c4ad');this.ellipse(c,42,-166,17,18,'#21404a');this.line(c,[[42,-166],[51,-177]],'#d7c486',2);this.ellipse(c,42,-166,3,3,'#c7cdb2');}
    if(flash)this.muzzle(c,flame?-88:gl?-66:-43,flame?-267:gl?-288:-324,flame?76:gl?78:shotgun?68:52,p,flame);
  },
  muzzle(c,x,y,size,p,flame=false){
    c.save();c.translate(x,y);const glow=c.createRadialGradient(0,0,1,0,0,size);glow.addColorStop(0,'#fff1b7f0');glow.addColorStop(.16,flame?'#ffcc62d0':'#ffe8a1d0');glow.addColorStop(.5,'#e999535a');glow.addColorStop(1,'#ff8b3500');c.fillStyle=glow;c.fillRect(-size,-size,size*2,size*2);
    const points=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?size*.17:size*(.45+((i*7)%5)*.08);points.push([Math.cos(a)*r,Math.sin(a)*r]);}this.polygon(c,points,'#fff0b6e6');if(flame){this.ellipse(c,-7,-26,17,42,'#ffc65a99',-.2);this.ellipse(c,5,-68,19,31,'#e8753f77',.25);}c.restore();
  }
};
