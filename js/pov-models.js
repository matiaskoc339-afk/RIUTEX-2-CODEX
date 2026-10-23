// Identidad y anatomía exclusivas del render POV. No modifica las entidades del motor.
const POVModels = {
  identity(e){
    // Carnicero hereda type='vacio': resolverlo ANTES de consultar la caché.
    if(e?.type==='carnicero'||/Carnicero|Carcelero|El Custodio/.test(e?.def?.name||'')||typeof Carnicero!=='undefined'&&e instanceof Carnicero)return 'carnicero';
    if(/^C-17/.test(e?.def?.name||'')||typeof EscoltaC17!=='undefined'&&e instanceof EscoltaC17)return 'c17';
    return String(e?.type||'vacio');
  },
  itemKey(e){return [e?.type,e?.part||'',e?.weapon||'',e?.key||'',e?.doc?POVArt.hash(e.doc)%4:'',e?.type==='wx_valve'?e.id:''].join('|');},
  tone(color,amount){const n=parseInt(color.slice(1),16),channel=v=>Math.max(0,Math.min(255,Math.round(amount>0?v+(230-v)*amount:v*(1+amount))));return 'rgb('+[n>>16,(n>>8)&255,n&255].map(channel).join(',')+')';},
  poly(c,p,color,edge='#18272b'){
    if(typeof color==='string'&&/^#[a-f0-9]{6}$/i.test(color)){
      const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]),g=c.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));g.addColorStop(0,this.tone(color,.16));g.addColorStop(.38,color);g.addColorStop(1,this.tone(color,-.32));color=g;
    }
    POVArt.polygon(c,p,color,edge);
  },
  line(c,p,color,width=2){POVArt.line(c,p,color,width);},
  oval(c,x,y,rx,ry,color,angle=0){
    if(typeof color==='string'&&/^#[a-f0-9]{6}$/i.test(color)){
      const g=c.createRadialGradient(x-rx*.3,y-ry*.3,1,x,y,Math.max(rx,ry));g.addColorStop(0,this.tone(color,.12));g.addColorStop(.45,color);g.addColorStop(1,this.tone(color,-.35));color=g;
    }
    POVArt.ellipse(c,x,y,rx,ry,color,angle);
  },
  metal(c,x1,y1,x2,y2,width=6){this.line(c,[[x1,y1],[x2,y2]],'#263840',width+3);this.line(c,[[x1-1,y1],[x2-1,y2]],'#a4b4ad',width);this.line(c,[[x1-2,y1],[x2-2,y2]],'#dae0cd',1);},
  shadow(c,width=75){this.oval(c,128,250,width,5,'#02090db0');},
  head(c,x,y,skin,back=false,mask=false){
    const shade=c.createLinearGradient(x-18,y-22,x+20,y+20);shade.addColorStop(0,'#b5b6a1');shade.addColorStop(.4,skin);shade.addColorStop(1,'#3c4a46');
    this.poly(c,[[x-17,y-18],[x-8,y-25],[x+10,y-24],[x+18,y-12],[x+16,y+12],[x+7,y+23],[x-8,y+20],[x-17,y+7]],shade);
    if(back){this.line(c,[[x,y-17],[x-3,y+11]],'#53574c',2);return;}
    for(const s of [-1,1]){this.oval(c,x+s*9,y-2,5,3,'#26342e');if(!mask)this.oval(c,x+s*9,y-2,1.3,1,'#bdbf93');}
    this.line(c,[[x,y],[x-3,y+7],[x+2,y+8]],'#505b4c',1.5);
    this.line(c,[[x-8,y+13],[x+7,y+14]],'#3b2729',2);this.line(c,[[x-12,y+5],[x-11,y+13]],'#805250',1);
  },
  person(c,o,cfg={}){
    const {pose,back,gait}=o,wide=cfg.wide||34,skin=cfg.skin||'#909580',cloth=cfg.cloth||'#52635d',neck=cfg.neck||67,hip=cfg.hip||174,headY=cfg.headY||43,step=gait?5:-5;
    this.shadow(c,wide+30);
    for(const s of [-1,1]){
      const x=128+s*wide*.48,foot=x+s*step;
      this.poly(c,[[x-12,hip-4],[x+12,hip-4],[foot+13,234],[foot-13,235],[x-13,210]],cfg.legs||'#28393b');
      this.oval(c,foot+s*3,242,20,7,'#182528');this.line(c,[[foot-12,238],[foot+12,238]],'#67766b',1);
    }
    const chest=c.createLinearGradient(128-wide,80,128+wide,hip);chest.addColorStop(0,cloth);chest.addColorStop(.46,cfg.light||cloth);chest.addColorStop(1,'#233734');
    this.poly(c,[[128-wide*.7,neck],[128+wide*.7,neck],[128+wide+9,101],[128+wide-4,hip],[128,hip+9],[128-wide+1,hip],[128-wide-9,100]],chest);
    this.line(c,[[128,neck+18],[126,hip-3]],back?'#253734':'#243c3c',2);
    for(const s of [-1,1]){
      const x=128+s*(wide+9),endX=x+s*(cfg.reach||14),endY=pose?cfg.attackY||128:cfg.handY||192;
      this.line(c,[[x,91],[x+s*9,132],[endX,endY]],'#182a2e',cfg.arm||21);
      this.line(c,[[x-2,91],[x+s*8-2,132],[endX-2,endY]],cfg.bare?skin:cloth,(cfg.arm||21)-4);
      this.oval(c,endX,endY,9,13,skin,s*.2);this.line(c,[[endX-5,endY],[endX+4,endY+6]],'#48594d',1);
    }
    this.oval(c,128,neck+1,11,13,skin);this.head(c,128,headY,skin,back,cfg.mask);
  },
  scars(c,points,color='#805058'){for(const [x,y]of points){this.line(c,[[x,y],[x+4,y+10],[x-2,y+19]],color,2);for(let i=0;i<3;i++)this.line(c,[[x-3,y+4+i*5],[x+6,y+2+i*5]],'#b6ad91',1);}},
  finish(c,id,back){
    // Luz lateral y microtextura recortadas al cuerpo; nada fuera de la silueta.
    c.save();c.globalCompositeOperation='source-atop';const g=c.createLinearGradient(25,0,240,0);g.addColorStop(0,'#d4dcc41c');g.addColorStop(.47,'#ffffff00');g.addColorStop(1,'#020e1766');c.fillStyle=g;c.fillRect(0,0,256,256);
    const rnd=POVArt.rng(POVArt.hash(id));for(let i=0;i<130;i++){c.fillStyle=i%3?'#dce0cb0c':'#040e1626';c.fillRect(rnd()*256,rnd()*256,.5+rnd()*1.5,.5+rnd()*3);}
    if(back){c.fillStyle='#07121a24';c.fillRect(0,0,256,256);}c.restore();
  },
  enemy(c,e,o){
    const id=this.identity(e),{image,phase,pose,back,gait}=o;let size=[42,35];
    switch(id){
      case 'carnicero':this.butcher(c,o);size=[56+(phase-1)*8,64+(phase-1)*10];break;
      case 'sonambulo':this.patient(c,o,false);size=[43,35];break;
      case 'vacio':this.patient(c,o,false,true);size=[42,31];break;
      case 'latente':this.patient(c,o,true);size=[36,39];break;
      case 'trepador':this.listener(c,o,true);size=[30,47];break;
      case 'rastrero':this.crawler(c,o);size=[24,46];break;
      case 'enfermera':this.nurse(c,o);size=[43,38];break;
      case 'cirujano':this.surgeon(c,o);size=[46,48];break;
      case 'camillero':this.orderly(c,o);size=[49,50];break;
      case 'c17':this.escort(c,o);size=[53,61];break;
      case 'hinchado':this.bloated(c,o);size=[46,56];break;
      case 'wx_listener':this.listener(c,o,false);size=[36,62];break;
      case 'wx_scuttler':this.scuttler(c,o);size=[22,43];break;
      case 'wx_spitter':this.amphibian(c,o);size=[29,51];break;
      case 'wx_mauler':this.foundry(c,o);size=[51,59];break;
      case 'wx_keeper':this.repeater(c,o,e.enraged);size=[57,e.enraged?75:68];break;
      case 'ds_guard':this.hazmat(c,o);size=[54,58];break;
      case 'ds_spider':POVArt.spider(c,e,1,pose,gait);size=[12,28];break;
      case 'ds_matriarch':this.matriarch(c,e,o);size=[49+(phase-1)*9,78+(phase-1)*9];break;
      case 'cl_hound':this.hound(c,o);size=[27,41];break;
      case 'cl_halberd':this.guardian(c,o,false);size=[52,55];break;
      case 'cl_shield':this.guardian(c,o,true);size=[48,59];break;
      case 'cl_moth':POVArt.moth(c,pose,gait);this.line(c,[[91,59],[77,77],[89,87],[64,101]],'#28383a',3);size=[30,50];break;
      case 'cl_blind':this.carver(c,o);size=[57,73];break;
      case 'cl_regent':this.regent(c,o);size=[61+(phase-1)*8,68+(phase-1)*10];break;
      case 'lf_runner':this.receiver(c,o);size=[44,42];break;
      case 'lf_sentinel':this.pressure(c,o);size=[54,61];break;
      case 'lf_spore':this.fungus(c,o);size=[49,58];break;
      case 'lf_mirror':this.mirror(c,o);size=[48,48];break;
      case 'lf_wren':this.wren(c,o);size=[55+(phase-1)*14,57+(phase-1)*19];break;
      default:return false;
    }
    image.povModel=id;[image.povHeight,image.povWidth]=size;this.finish(c,id,back);return true;
  },
  patient(c,o,latent,gaunt=false){
    this.person(c,o,{wide:latent?38:gaunt?21:28,headY:latent?77:gaunt?53:44,neck:latent?96:68,hip:180,cloth:latent?'#737669':gaunt?'#68716a':'#76948a',legs:'#747e70',handY:latent?215:192});
    if(latent){
      this.oval(c,128,131,44,58,'#787c65');for(let i=0;i<9;i++)this.line(c,[[88,105+i*10],[125,113+i*10],[169,106+i*10]],i%2?'#b9b39a':'#46584b',5);
      this.head(c,128,78,'#92917c',o.back);this.line(c,[[102,72],[151,85]],'#b5b39b',7);this.scars(c,[[142,118],[104,164]]);
    }else{
      this.poly(c,gaunt?[[112,89],[143,90],[145,159],[130,174],[108,161]]:[[106,80],[149,80],[158,187],[136,205],[112,190],[96,195]],gaunt?'#8a9886':'#8eaaa0');
      this.line(c,[[128,81],[127,189]],'#526b65',2);this.line(c,[[109,116],[118,141],[112,176]],'#652f3b',3);
      c.fillStyle='#bfc2a6';c.fillRect(141,104,13,9);this.line(c,[[141,107],[151,107]],'#4b625e',1);
      this.scars(c,[[120,25],[143,152]]);
    }
  },
  nurse(c,o){
    this.person(c,o,{wide:26,cloth:'#98a99a',hip:163,handY:182,skin:'#909d89'});
    this.poly(c,[[105,116],[153,116],[175,210],[132,219],[91,208]],'#adbaa8');this.line(c,[[128,121],[128,205]],'#687f74',2);
    this.poly(c,[[103,29],[107,13],[145,13],[153,29]],'#c3c6b1');c.fillStyle='#783d45';c.fillRect(122,15,7,13);c.fillRect(118,19,15,5);
    if(!o.back){this.poly(c,[[111,49],[145,49],[141,64],[114,63]],'#afc0ac');this.line(c,[[107,47],[114,57],[143,57],[150,45]],'#516d67',1);}
    this.metal(c,77,182,61,o.pose?116:218,3);this.line(c,[[167,111],[188,145],[185,195]],'#869f9155',3);this.oval(c,187,201,7,11,'#b2c1a277');this.scars(c,[[109,156]]);
  },
  surgeon(c,o){
    this.person(c,o,{wide:34,headY:51,neck:77,cloth:'#527e75',light:'#779b87',hip:188,mask:true,handY:172,reach:18});
    this.poly(c,[[91,85],[128,104],[162,85],[169,200],[129,210],[87,198]],'#6c8b78');this.line(c,[[94,114],[157,135],[108,180]],'#693c3f',5);
    this.poly(c,[[106,29],[107,18],[144,16],[151,34]],'#8ca394');
    if(!o.back){c.fillStyle='#a5b6a2';c.fillRect(109,54,37,14);this.line(c,[[110,58],[143,58]],'#59776d',1);this.oval(c,117,32,9,9,'#bdc9b9');this.oval(c,117,32,4,4,'#344d4e');}
    this.metal(c,69,161,42,199,7);this.poly(c,[[40,188],[62,198],[49,227],[21,214]],'#9caaa0');for(let i=0;i<7;i++)this.poly(c,[[24+i*4,211+i],[25+i*4,220+i],[29+i*4,215+i]],'#cad2bb');
    this.metal(c,189,171,207,219,3);this.oval(c,207,220,7,10,'#a9b5a3');
  },
  orderly(c,o){
    this.person(c,o,{wide:48,skin:'#8b8c78',cloth:'#445e68',light:'#6d8282',hip:171,arm:30,handY:193,reach:16,headY:48});
    this.poly(c,[[98,84],[155,83],[166,165],[128,178],[91,165]],'#354b54');c.fillStyle='#a6aa92';c.fillRect(86,155,85,12);
    this.line(c,[[96,91],[154,147]],'#a08d68',9);this.line(c,[[154,90],[98,147]],'#4b665f',6);
    this.metal(c,54,98,51,226,9);this.metal(c,45,109,64,109,5);this.metal(c,197,179,224,206,7);
    this.poly(c,[[112,19],[140,18],[148,38],[107,38]],'#566b68');this.scars(c,[[110,56],[171,111]]);
  },
  bloated(c,o){
    this.person(c,o,{wide:47,cloth:'#677c64',skin:'#a9a17d',hip:188,headY:62,neck:83,bare:true,arm:24,handY:194});
    const belly=c.createRadialGradient(112,127,4,129,145,75);belly.addColorStop(0,'#b3b184');belly.addColorStop(.55,'#8b9666');belly.addColorStop(1,'#465b4a');this.oval(c,128,143,70,67,belly);
    this.line(c,[[129,88],[117,112],[137,137],[125,192]],'#5c423e',4);for(const [x,y,r]of[[91,122,16],[152,111,21],[165,158,19],[105,177,14]]){this.oval(c,x,y,r,r,'#a6ae70');this.oval(c,x-4,y-5,r*.5,r*.45,'#cbd0a64d');this.oval(c,x+3,y+3,4,6,'#5b693c');}
    this.head(c,128,61,'#aca585',o.back);this.line(c,[[108,70],[130,88],[149,69]],'#686d4d',4);
  },
  escort(c,o){
    this.person(c,o,{wide:54,skin:'#948c7c',cloth:'#596653',hip:180,arm:32,headY:51,handY:200});
    this.poly(c,[[86,85],[111,76],[145,76],[175,89],[169,180],[90,180]],'#3e4f49');
    // El escolta conserva correas, placa de identificación y el cargador del arnés.
    this.line(c,[[93,82],[105,180]],'#a49371',8);this.line(c,[[159,80],[150,181]],'#8f9273',8);
    this.poly(c,[[110,96],[140,92],[155,134],[130,173],[101,134]],'#45313a');
    for(const s of[-1,1])for(let i=0;i<4;i++)this.poly(c,[[128+s*8,109+i*12],[128+s*34,91+i*12],[128+s*29,117+i*12],[128+s*7,119+i*12]],'#b7af93');
    this.poly(c,[[168,85],[198,60],[226,106],[207,150],[175,131]],'#8c947f');
    this.poly(c,[[102,28],[112,11],[145,13],[156,33],[148,40],[107,40]],'#566458');
    this.line(c,[[108,41],[146,41]],'#1d3435',5);this.line(c,[[114,69],[141,70]],'#9b8b71',5);
    this.poly(c,[[79,151],[98,152],[103,194],[82,197]],'#a7b299');this.poly(c,[[148,154],[169,150],[181,212],[161,219]],'#485f60');
    for(let i=0;i<4;i++)this.line(c,[[157,168+i*11],[171,165+i*11]],'#a7b39d',2);this.scars(c,[[113,48],[183,99]]);
  },
  butcher(c,o){
    const p=o.phase;this.person(c,o,{wide:p===1?51:p===2?65:73,skin:'#9a8a76',cloth:'#484b43',hip:185,headY:p===3?63:42,neck:p===3?85:69,arm:p===1?30:42,handY:186,reach:7});
    this.poly(c,[[95,80],[155,80],[173,216],[131,230],[83,212]],'#9c947b');this.line(c,[[96,83],[116,97],[144,96],[156,82]],'#362d2c',6);
    for(const [x,y]of[[108,115],[142,144],[99,183]]){this.poly(c,[[x-9,y-5],[x-5,y-12],[x+4,y-8],[x+8,y-1],[x+4,y+6],[x+6,y+13],[x-2,y+9],[x-11,y+2]],'#693738','#693738');this.line(c,[[x,y+4],[x+4,y+26]],'#542b32',2);this.oval(c,x-3,y-1,3,4,'#482d30');}
    // Capucha cosida y máscara de acero: la misma identidad en captura, huida y jefe.
    this.poly(c,[[105,19],[127,10],[149,20],[154,61],[139,78],[111,69]],'#463e36');
    if(!o.back){this.poly(c,[[110,33],[145,32],[144,64],[125,73],[110,60]],'#8c9287');this.line(c,[[114,43],[141,43]],'#14282b',4);for(let i=0;i<4;i++)this.line(c,[[116+i*7,55],[116+i*7,62]],'#364a48',2);}
    this.line(c,[[128,13],[130,30]],'#b4aa88',2);for(let i=0;i<5;i++)this.line(c,[[107+i,24+i*8],[112+i,28+i*8]],'#a19378',1);
    POVArt.cleaver(c,o.pose);this.metal(c,56,123,55,184,5);this.line(c,[[55,184],[39,199],[46,211],[60,208]],'#a8b3a4',5);
    if(p>1){this.poly(c,[[161,73],[187,43],[208,77],[227,140],[207,176],[176,135]],'#8e7d6d');for(let i=0;i<4;i++)this.poly(c,[[178+i*10,101+i*8],[193+i*12,70+i*6],[189+i*10,116+i*7]],'#c2baa0');this.scars(c,[[171,88],[190,118]]);}
    if(p===3){this.poly(c,[[81,87],[49,53],[23,82],[20,155],[48,184],[78,144]],'#847b69');this.poly(c,[[112,111],[143,105],[157,160],[134,184],[106,165]],'#392830');for(let i=0;i<5;i++){this.poly(c,[[110+i*8,122],[114+i*8,139],[118+i*8,122]],'#c5bda1');this.poly(c,[[110+i*8,158],[114+i*8,143],[118+i*8,158]],'#a7ae93');}this.line(c,[[79,72],[50,112],[56,163]],'#b2a788',6);}
  },
  listener(c,o,climber){
    this.shadow(c,112);const skin=climber?'#8d9780':'#a59c95',step=o.gait?9:-9;
    for(const s of [-1,1]){this.line(c,[[128+s*30,115],[128+s*76,152],[128+s*(107+step*.4),230]],'#263837',19);this.line(c,[[128+s*30,115],[128+s*76,152],[128+s*(107+step*.4),230]],skin,14);for(let i=0;i<4;i++)this.line(c,[[128+s*(99+i*4),229],[128+s*(103+i*5),247-i]],'#aeb59b',3);this.line(c,[[128+s*29,164],[128+s*49,203],[128+s*36,236]],'#566c5b',16);}
    this.oval(c,128,139,43,54,climber?'#566957':'#756b69');this.poly(c,[[104,111],[128,86],[154,111],[145,174],[125,186],[108,169]],skin);this.scars(c,[[116,121],[139,148]]);
    this.head(c,128,83,skin,o.back,true);if(!o.back){this.poly(c,[[108,76],[147,74],[148,88],[109,92]],'#76675f');for(let i=0;i<5;i++)this.line(c,[[111+i*7,77],[113+i*7,87]],'#343b3c',2);}
    if(!climber)for(const s of[-1,1]){this.oval(c,128+s*30,76,16,25,'#98847d',s*.4);this.oval(c,128+s*31,76,8,16,'#56434a',s*.4);this.line(c,[[128+s*32,68],[128+s*36,80],[128+s*27,86]],'#c4b59c',2);}
    else for(let i=0;i<6;i++)this.poly(c,[[108+i*7,120],[112+i*7,99-i%2*10],[116+i*7,123]],'#a2b397');
  },
  crawler(c,o){
    this.shadow(c,116);
    for(const s of[-1,1]){const step=o.gait?5:-5;this.poly(c,[[128+s*35,140],[128+s*81,167],[128+s*(102+step),227],[128+s*111,239],[128+s*73,244],[128+s*57,194]],'#8e9b84');for(let i=0;i<4;i++)this.line(c,[[128+s*(78+i*8),235],[128+s*(79+i*8),249]],'#b1b9a1',3);}
    this.oval(c,128,175,53,54,'#627864');for(let i=0;i<5;i++)this.line(c,[[100,153+i*12],[124,162+i*11],[156,152+i*12]],'#a3ad8e',4);
    this.poly(c,[[101,103],[119,79],[145,87],[160,115],[150,149],[129,174],[105,149],[94,121]],'#a9ae90');
    for(const s of[-1,1]){this.oval(c,128+s*16,115,10,5,'#2f443b');this.line(c,[[128+s*15,114],[128+s*13,114]],'#b8bb94',2);}
    this.poly(c,[[105,132],[149,130],[146,155],[128,168],[109,153]],'#3d2b30');for(let i=0;i<7;i++)this.poly(c,[[109+i*5,134],[112+i*5,146],[114+i*5,134]],'#c2bea0');this.scars(c,[[113,95],[142,175],[76,203]]);
  },
  scuttler(c,o){
    this.shadow(c,111);this.line(c,[[153,184],[207,165],[239,195],[220,222]],'#917766',9);
    for(const s of[-1,1]){this.poly(c,[[128+s*39,156],[128+s*83,192],[128+s*(91+(o.gait?4:-4)),237],[128+s*56,245],[128+s*47,202]],'#8d8973');}
    this.oval(c,128,161,61,48,'#6d7563');for(let i=0;i<6;i++)this.line(c,[[91,138+i*9],[127,152+i*8],[165,139+i*9]],'#c1b69a',3);
    this.poly(c,[[95,138],[89,89],[110,112],[127,100],[151,110],[171,85],[162,142],[145,172],[112,169]],'#9c9a7e');this.oval(c,128,151,24,18,'#51473f');this.oval(c,128,138,9,7,'#192d2d');for(const s of[-1,1]){this.oval(c,128+s*19,122,5,4,'#242f2c');this.line(c,[[128+s*27,148],[128+s*63,142]],'#aaa891',1);this.line(c,[[128+s*27,155],[128+s*65,162]],'#999581',1);}
    this.poly(c,[[120,157],[127,157],[126,174],[120,175]],'#d1c9a7');this.poly(c,[[130,157],[137,157],[137,174],[131,175]],'#b4bea3');
  },
  amphibian(c,o){
    this.shadow(c,115);for(const s of[-1,1]){this.oval(c,128+s*67,197,45,31,'#6d7c50',s*.5);this.poly(c,[[128+s*62,190],[128+s*98,227],[128+s*111,243],[128+s*75,239],[128+s*36,213]],'#8e9965');this.line(c,[[128+s*30,158],[128+s*58,209],[128+s*52,240]],'#b0b485',13);}
    this.oval(c,128,175,72,57,'#7e8c59');this.oval(c,128,139,58,46,'#a1a773');this.oval(c,128,169,o.pose?51:37,o.pose?43:28,'#c1bd7f');
    for(const s of[-1,1]){this.oval(c,128+s*35,105,18,19,'#8c9970');this.oval(c,128+s*36,101,11,11,'#b6b88b');this.line(c,[[128+s*36,92],[128+s*36,108]],'#223c33',3);}
    this.line(c,[[79,141],[103,150],[152,149],[178,138]],'#343e32',5);for(const [x,y]of[[78,183],[168,190],[103,210],[152,119]])this.oval(c,x,y,6,7,'#596a44');
    if(o.pose){this.oval(c,128,151,19,12,'#36432f');this.oval(c,128,155,11,6,'#abb75b');}
  },
  foundry(c,o){
    this.person(c,o,{wide:57,cloth:'#69584a',skin:'#8e816a',hip:183,arm:38,headY:50,handY:195});
    for(const s of[-1,1])this.poly(c,[[128+s*25,45],[128+s*46,12],[128+s*53,18],[128+s*47,61]],'#b5ae91');
    this.poly(c,[[92,85],[162,85],[168,198],[128,214],[85,198]],'#504f42');this.line(c,[[94,110],[157,107]],'#8c8062',12);
    this.poly(c,[[170,98],[210,95],[231,133],[225,200],[196,214],[173,179]],'#6c7064');for(let i=0;i<4;i++)this.line(c,[[183,113+i*20],[222,125+i*19]],'#a59d83',6);
    this.poly(c,[[106,37],[147,37],[153,54],[139,70],[112,61]],'#384c4a');this.line(c,[[111,46],[146,46]],'#beaa7c',2);this.scars(c,[[93,95],[141,144]]);
  },
  repeater(c,o,enraged){
    this.person(c,o,{wide:59,cloth:'#4f494d',skin:'#9f817e',hip:180,arm:34,headY:49,reach:21,bare:true});
    this.poly(c,[[93,82],[163,82],[178,177],[127,197],[79,177]],'#423c40');this.line(c,[[88,107],[168,107]],'#b0a07c',12);this.line(c,[[128,79],[128,180]],'#9b8871',10);
    this.poly(c,[[103,40],[128,23],[153,41],[162,88],[128,106],[96,87]],'#727b70');this.oval(c,128,69,27,26,'#28383b');for(let r=7;r<25;r+=5){c.strokeStyle=r%2?'#a0a78f':'#536a60';c.lineWidth=2;c.beginPath();c.arc(128,69,r,0,7);c.stroke();}
    for(const s of[-1,1]){this.line(c,[[128+s*25,90],[128+s*59,113],[128+s*54,166],[128+s*74,192]],'#a99872',4);this.oval(c,128+s*45,112,7,8,'#7b5655');}
    this.line(c,[[95,40],[84,10]],'#bdc3a9',3);this.line(c,[[160,43],[178,18]],'#b8b99e',3);
    if(enraged){this.poly(c,[[90,112],[61,83],[38,98],[73,147]],'#ba9f88');this.poly(c,[[167,108],[193,77],[224,106],[188,149]],'#ba9f88');this.oval(c,128,155,24,26,'#6b3445');for(let i=0;i<5;i++)this.line(c,[[109+i*8,139],[115+i*6,169]],'#c2b398',3);}
  },
  hazmat(c,o){
    // El custodio S-4 conserva el traje de contención y su respirador, no piel genérica.
    this.person(c,o,{wide:57,cloth:'#998a4e',light:'#baaa68',skin:'#5e6558',hip:184,arm:32,handY:200});
    this.oval(c,128,51,35,42,'#a79a5c');this.poly(c,[[101,27],[155,27],[159,67],[144,83],[111,79],[98,61]],'#273e43');this.poly(c,[[106,32],[149,32],[151,56],[108,61]],'#688a7e');this.line(c,[[109,35],[140,35]],'#d1d0ac77',3);
    for(const s of[-1,1]){this.oval(c,128+s*20,72,12,12,'#344e4b');this.oval(c,128+s*20,72,7,7,'#8f9e78');}
    this.line(c,[[128,93],[128,186]],'#3d5143',5);this.poly(c,[[123,109],[145,147],[101,147]],'#c4b46b');this.line(c,[[123,119],[123,135]],'#3b4537',4);
    this.poly(c,[[173,107],[208,96],[226,134],[216,211],[188,224],[170,172]],'#7d8b67');this.metal(c,193,124,205,186,9);this.line(c,[[96,87],[75,114],[68,164]],'#3c4a40',8);
  },
  hound(c,o){
    POVArt.beast(c,'cl_hound',o.pose,o.gait);this.poly(c,[[76,129],[90,103],[111,126],[109,172],[87,183],[72,160]],'#727a74');this.poly(c,[[151,126],[176,103],[190,134],[176,181],[150,168]],'#787a69');
    this.line(c,[[90,115],[170,115]],'#b89a67',7);for(const s of[-1,1])this.poly(c,[[128+s*27,128],[128+s*43,147],[128+s*27,166]],'#b9c0a5');this.line(c,[[128,164],[128,188]],'#693d49',5);
  },
  guardian(c,o,shield){
    this.person(c,o,{wide:shield?45:32,cloth:shield?'#6f6954':'#55566b',hip:178,headY:45,arm:24,handY:178});
    this.poly(c,[[90,77],[128,94],[167,77],[160,150],[126,165],[92,147]],'#798881');this.line(c,[[98,95],[127,111],[156,94]],'#c4b48b',3);
    this.poly(c,[[108,29],[128,15],[149,29],[150,65],[127,82],[105,61]],'#8c968a');if(!o.back)this.line(c,[[108,45],[146,45]],'#172c31',5);
    this.poly(c,[[87,136],[99,138],[104,215],[88,228],[79,216]],'#76705b');this.poly(c,[[149,142],[163,135],[175,220],[160,229],[149,206]],'#616a63');
    if(shield){this.poly(c,[[35,102],[83,87],[120,108],[117,208],[78,240],[34,210]],'#a9a184');this.poly(c,[[43,111],[82,96],[110,113],[109,204],[79,227],[44,205]],'#475b57');this.poly(c,[[64,123],[97,123],[95,181],[80,196],[63,180]],'#93835e');this.line(c,[[80,128],[80,187]],'#c9bd92',4);this.metal(c,186,102,200,222,6);}
    else{this.poly(c,[[86,94],[65,115],[74,226],[91,215]],'#66596c');this.poly(c,[[160,93],[182,116],[179,219],[160,231]],'#6a5866');this.metal(c,198,26,198,248,4);this.poly(c,[[198,28],[232,55],[230,94],[207,82],[206,68],[194,58]],'#bac0a9');this.poly(c,[[194,28],[197,4],[202,27]],'#c9cbb1');}
  },
  carver(c,o){
    this.person(c,o,{wide:61,cloth:'#62574f',skin:'#ae9b85',hip:173,bare:true,arm:37,headY:54,handY:168,reach:15});
    this.poly(c,[[94,81],[164,81],[176,150],[129,173],[81,149]],'#9c8e77');this.line(c,[[87,90],[169,138]],'#473f36',12);this.line(c,[[166,90],[89,138]],'#615744',12);
    this.poly(c,[[102,37],[151,36],[154,60],[102,63]],'#4b4c47');for(let i=0;i<6;i++)this.line(c,[[106+i*7,41],[109+i*7,58]],'#a0a28b',2);
    for(const s of[-1,1])for(let i=0;i<3;i++){const x=128+s*(82+i*6);this.poly(c,[[x,155+i*4],[x+s*25,192],[x+s*20,243-i*8],[x+s*11,194]],'#b6c2b5');this.line(c,[[x+s*3,170],[x+s*20,196]],'#e2e4c7',1);}
    this.scars(c,[[115,90],[143,117],[94,142]]);this.line(c,[[89,175],[164,176]],'#b5a788',8);
  },
  regent(c,o){
    if(o.phase===1){this.guardian(c,o,true);this.poly(c,[[87,85],[70,75],[66,202],[83,224],[98,182]],'#64444c');this.poly(c,[[162,81],[187,78],[188,210],[166,229],[158,179]],'#6c4a4f');
      for(let i=0;i<5;i++)this.poly(c,[[108+i*9,28],[112+i*9,6-i%2*4],[118+i*9,29]],'#b6a174');this.metal(c,198,22,204,192,8);this.line(c,[[181,178],[221,178]],'#bdab7a',8);return;}
    this.person(c,o,{wide:o.phase===3?72:63,skin:'#a09a85',cloth:'#5e6259',hip:182,bare:true,arm:40,headY:65,neck:88,handY:192});
    this.poly(c,[[85,84],[62,60],[45,99],[79,137]],'#7d8d83');this.poly(c,[[176,92],[210,68],[231,118],[188,153]],'#8a9180');
    this.poly(c,[[107,97],[144,95],[165,149],[129,181],[93,143]],'#3e3539');for(let i=0;i<5;i++)this.line(c,[[104+i*10,113],[116+i*6,155]],'#b4b99f',6);
    this.poly(c,[[109,50],[126,34],[150,51],[144,83],[122,94],[106,78]],'#9a9f8c');for(let i=0;i<5;i++)this.poly(c,[[106+i*10,52],[108+i*10,16-i%2*8],[116+i*10,53]],'#a99c7c');
    if(o.phase===3){for(const s of[-1,1])for(let i=0;i<3;i++)this.poly(c,[[128+s*(39+i*8),91+i*17],[128+s*(76+i*13),47+i*16],[128+s*(47+i*8),110+i*17]],'#b5b69e');this.oval(c,128,140,18,25,'#843d50');}
    this.scars(c,[[96,108],[159,133]]);
  },
  receiver(c,o){
    this.person(c,o,{wide:24,skin:'#9caea0',cloth:'#4b6e70',hip:161,bare:true,arm:16,reach:23,handY:212,headY:46});
    this.poly(c,[[111,80],[143,80],[152,164],[128,181],[104,161]],'#8ca59a');for(let i=0;i<6;i++)this.line(c,[[112,94+i*9],[126,98+i*9],[144,94+i*9]],'#425c57',2);
    this.metal(c,99,84,83,48,3);this.metal(c,153,88,170,51,3);this.oval(c,128,49,25,31,'#9bb8ac33');this.line(c,[[111,31],[126,22],[143,29]],'#bdccba',3);
    this.line(c,[[124,84],[130,121],[119,142],[128,168]],'#8b71a3',3);this.poly(c,[[93,184],[104,180],[102,226],[88,234]],'#59787a');
  },
  pressure(c,o){
    this.person(c,o,{wide:60,cloth:'#536d79',light:'#8a9b9b',hip:180,arm:35,handY:190,headY:50});
    for(const s of[-1,1]){this.poly(c,[[128+s*47,74],[128+s*70,59],[128+s*85,77],[128+s*85,170],[128+s*61,187]],'#7d9590');this.metal(c,128+s*65,92,128+s*65,157,9);}
    this.poly(c,[[98,80],[157,80],[172,145],[151,182],[103,182],[86,143]],'#8c9d96');this.oval(c,128,120,26,26,'#2e4a54');this.oval(c,128,120,21,21,'#c3c8ad');this.line(c,[[128,120],[143,109]],'#773d46',3);
    this.poly(c,[[102,24],[154,24],[161,66],[145,83],[111,81],[97,60]],'#526f78');this.poly(c,[[108,39],[149,39],[147,56],[109,55]],'#152d36');this.line(c,[[111,42],[145,42]],'#a5bdb0',2);
    this.metal(c,57,164,57,227,12);this.metal(c,199,164,207,228,12);this.line(c,[[111,157],[146,157]],'#b9a46b',6);
  },
  fungus(c,o){
    this.person(c,o,{wide:37,cloth:'#687555',skin:'#9eaa78',hip:183,headY:68,neck:88,arm:24,handY:197});
    for(const [x,y,r]of[[81,101,27],[163,87,33],[143,135,29],[100,158,25],[168,177,26]]){this.line(c,[[x,y+6],[x-4,y+36]],'#a8b486',10);this.oval(c,x,y,r,r*.55,'#b2b58b');this.oval(c,x,y+3,r*.85,r*.28,'#596947');this.oval(c,x-5,y-4,r*.38,r*.14,'#d2cda05c');}
    this.poly(c,[[106,52],[128,35],[155,52],[151,83],[133,101],[107,85]],'#838e68');for(let i=0;i<5;i++)this.line(c,[[110+i*8,63],[112+i*8,90]],'#c4bd8b',2);this.oval(c,128,51,37,13,'#a6aa7b');
    this.scars(c,[[117,117],[152,164]],'#5c6b4b');
  },
  mirror(c,o){
    this.person(c,o,{wide:32,cloth:'#4c5267',light:'#838394',skin:'#8f9fa1',hip:171,arm:19,reach:17,handY:198});
    for(const [points,color]of[
      [[[102,83],[127,103],[113,144],[91,117]],'#91aeb0'],[[[132,102],[157,82],[169,119],[148,145]],'#666783'],
      [[[112,144],[127,106],[146,144],[130,177]],'#babdb6'],[[[110,26],[126,14],[130,45],[106,58]],'#a8bcb6'],
      [[[131,15],[151,33],[147,65],[130,45]],'#6f7791'],[[[107,60],[130,48],[147,66],[126,79]],'#b1b1b7']])this.poly(c,points,color,'#263948');
    this.line(c,[[108,27],[129,46],[123,72]],'#e0e1d8',1.3);this.line(c,[[114,89],[135,123],[115,148],[132,169]],'#cec4e0',1.5);
    for(const s of[-1,1])this.poly(c,[[128+s*50,139],[128+s*76,116],[128+s*59,173]],'#98aeb5');
  },
  matriarch(c,e,o){
    POVArt.spider(c,e,o.phase,o.pose,o.gait);
    // Reina acorazada: óvulos, corona y patas falciformes que cambian con cada muda.
    this.poly(c,[[89,103],[101,47],[126,24],[153,46],[168,102],[148,119],[109,121]],o.phase===3?'#88705c':'#77805b');
    for(let i=0;i<4;i++)this.line(c,[[102,58+i*12],[127,72+i*12],[154,58+i*12]],'#bdbb92',3);
    for(const s of[-1,1]){this.oval(c,128+s*18,161,7,6,'#d6b990');this.oval(c,128+s*32,173,5,4,'#cfad84');}
    if(o.phase>1)for(const s of[-1,1])this.poly(c,[[128+s*42,148],[128+s*99,111],[128+s*115,173],[128+s*96,145],[128+s*55,179]],'#9ea48b');
    if(o.phase===3){for(const [x,y]of[[101,92],[128,106],[150,87]]){this.oval(c,x,y,10,14,'#5f3747');this.line(c,[[x,y-6],[x,y+8]],'#b99582',2);}this.poly(c,[[109,195],[100,222],[127,247],[122,216]],'#d0c3a2');this.poly(c,[[147,195],[157,223],[129,247],[136,216]],'#b8b69b');}
  },
  wren(c,o){
    if(o.phase===1){
      this.person(c,o,{wide:39,cloth:'#9cae9f',light:'#c4c8b2',hip:200,arm:24,headY:43,reach:14,handY:190});
      this.poly(c,[[100,78],[127,103],[117,139],[97,113]],'#dbd9c0');this.poly(c,[[151,79],[130,103],[143,140],[163,111]],'#aabca9');this.line(c,[[128,102],[128,202]],'#4e6d65',2);
      this.poly(c,[[84,150],[98,150],[99,222],[77,229]],'#8eaa9e');this.poly(c,[[154,148],[170,148],[179,221],[157,232]],'#c2c7af');
      this.oval(c,117,43,9,6,'#192e33');this.oval(c,141,43,9,6,'#192e33');this.line(c,[[126,42],[132,42]],'#b8bc9f',2);this.line(c,[[115,56],[141,57]],'#7f4c53',2);
      this.poly(c,[[165,90],[195,72],[210,105],[194,152],[170,144]],'#9ba087');this.scars(c,[[177,100],[149,153]]);return;
    }
    this.person(c,o,{wide:o.phase===3?72:57,cloth:'#657c6c',skin:'#a29e94',hip:184,arm:38,headY:o.phase===3?70:50,neck:88,bare:true,handY:194,reach:12});
    this.poly(c,[[92,83],[66,95],[79,188],[107,213],[103,135]],'#9fb2a4');this.poly(c,[[151,83],[167,103],[158,198],[140,216],[147,137]],'#acb8a6');
    // Brazo de ensayo asimétrico y caja torácica abierta.
    this.poly(c,[[166,79],[202,50],[228,86],[237,150],[213,214],[191,202],[198,154],[171,133]],'#968292');
    for(let i=0;i<4;i++)this.poly(c,[[209+i*5,170],[229+i*5,201],[221+i*4,237],[213+i*3,207]],'#bcb7b5');
    this.poly(c,[[109,102],[143,100],[159,144],[129,185],[96,143]],'#38283d');for(let i=0;i<5;i++){this.line(c,[[104+i*10,114],[116+i*6,160]],'#c2b8aa',5);this.line(c,[[112+i*7,129],[119+i*5,166]],'#78647f',2);}
    this.oval(c,129,143,13,18,'#a780b6');this.scars(c,[[157,93],[191,133]],'#6b4164');
    if(o.phase===3){
      this.poly(c,[[88,98],[55,48],[29,53],[18,119],[43,189],[74,149]],'#7e8380');for(const s of[-1,1])for(let i=0;i<4;i++)this.poly(c,[[128+s*(27+i*8),91+i*12],[128+s*(45+i*14),12+i*8],[128+s*(38+i*8),105+i*12]],'#a9aaa5');
      this.oval(c,128,65,26,35,'#998c9c');this.poly(c,[[108,59],[126,49],[151,58],[144,88],[127,106],[111,84]],'#352e42');for(let i=0;i<5;i++)this.line(c,[[111+i*8,65],[115+i*6,88]],'#d0c8b9',4);this.line(c,[[105,181],[77,212],[91,242]],'#9b8f9b',17);
    }
  },
  item(c,e,o){
    const t=String(e?.type||''),part=String(e?.part||''),alias={pistol:'pistol',ammo:'pistol',shells:'shells',smg:'smg',rifleammo:'rifle',fuel:'fuel',cl_ammo:'r98',lf_ammo:'gl6'};
    const size=(h,w)=>{o.image.povHeight=h;o.image.povWidth=w;};
    if(t==='adv_weapon'||t.startsWith('w_')||t==='pistol'){this.weaponDrop(c,t==='adv_weapon'?e.weapon:t==='pistol'?'pistol':t.slice(2));size(9,24);return true;}
    if(t.startsWith('am_')||t in alias&&t!=='pistol'){this.ammunition(c,t.startsWith('am_')?t.slice(3):alias[t]);size(/fuel/.test(t)?16:9,/fuel/.test(t)?10:15);return true;}
    if(t==='doc'){this.document(c,e);size(10,13);return true;}
    if(/screw|powder/.test(t)){this.materialDrop(c,t);size(/large/.test(t)?11:8,/screw/.test(t)?16:10);return true;}
    if(t==='sample'){this.sample(c,'#b293cd','R-2');size(13,9);return true;}
    if(t==='adv_part'||t==='wx_part'||t==='cl_part'||t==='lf_part'){this.part(c,part);size(12,/barrel|tube|crank/.test(part)?22:14);return true;}
    if(t==='key'){this.key(c,e);size(7,15);return true;}
    if(t==='case'){this.suitcase(c);size(15,24);return true;}
    if(t==='ds_suit_case'){this.caseBase(c);this.hazmatFolded(c);size(16,28);return true;}
    if(t==='ds_launcher_case'){this.caseBase(c);c.save();c.translate(8,-20);c.scale(.9,.9);this.weaponDrop(c,'flamethrower');c.restore();size(16,30);return true;}
    if(t==='h_service_loot'||t==='wx_reward'){this.caseBase(c);this.part(c,t==='wx_reward'?'uzi_magazine':'optic_scope');size(13,25);return true;}
    if(t==='h_service_boss'){this.oval(c,128,147,64,96,'#6c7059');for(let i=0;i<8;i++)this.line(c,[[79,80+i*21],[128,96+i*18],[180,82+i*20]],'#aaa482',4);size(33,27);return true;}
    if(t==='wx_plate'){this.poly(c,[[32,203],[80,149],[205,151],[236,207],[190,241],[69,240]],'#4c6360');this.poly(c,[[49,203],[85,162],[197,164],[217,206],[184,226],[76,226]],'#8e9a7f');size(3,25);return true;}
    if(t==='wx_valve'){const color=/a$/.test(e.id)?'#7f9da4':/b$/.test(e.id)?'#b49b69':'#879e74';c.strokeStyle=color;c.lineWidth=15;c.beginPath();c.ellipse(128,174,64,49,-.2,0,7);c.stroke();for(let i=0;i<3;i++){const a=i*2.094;this.line(c,[[128,174],[128+Math.cos(a)*61,174+Math.sin(a)*45]],color,8);}this.oval(c,128,174,15,12,'#b4bba2');size(11,19);return true;}
    return false;
  },
  label(c,text,x,y,color='#b7c1a4',size=17){c.fillStyle=color;c.font='600 '+size+'px Rajdhani,sans-serif';c.textAlign='center';c.fillText(text,x,y);},
  ammunition(c,id){
    if(id==='fuel'){this.oval(c,128,100,44,15,'#879a83');c.fillStyle='#725447';c.fillRect(84,100,88,121);this.oval(c,128,221,44,14,'#4e4940');this.line(c,[[87,117],[168,117]],'#b59f72',7);this.line(c,[[87,206],[168,206]],'#adb394',7);this.metal(c,128,80,128,99,8);this.line(c,[[112,77],[144,77]],'#a89c73',5);this.poly(c,[[128,141],[147,177],[109,177]],'#c5b879');this.label(c,'FL-4',128,198);return;}
    const shell=id==='shells',grenade=/gl6|grenade/.test(id),rifle=/rifle|r98|ak/.test(id),smg=id==='smg';
    this.poly(c,[[38,139],[64,119],[210,119],[231,141],[227,233],[39,233]],shell?'#6d4b44':grenade?'#4b6453':'#6c7357');
    c.fillStyle='#b9b697';c.fillRect(50,148,166,40);this.label(c,shell?'12 GA':grenade?'40 MM':rifle?'7.62':smg?'9 MM / 30':'9 MM',132,175,'#384a43',23);
    for(let i=0;i<(grenade?3:5);i++){const x=64+i*(grenade?52:30);c.fillStyle=grenade?'#526c52':shell?'#954e43':'#b3a170';c.fillRect(x,201,grenade?22:12,30);this.oval(c,x+(grenade?11:6),202,grenade?11:6,4,'#d3bd7f');if(rifle)this.poly(c,[[x,200],[x+6,183],[x+12,200]],'#9f9c86');}
  },
  weaponDrop(c,id){
    c.save();c.translate(127,188);c.rotate(-.22);const pistol=id==='pistol',uzi=id==='viper',flame=id==='flamethrower',gl=/gl6|launcher/.test(id),ak=id==='ak';
    const metal=c.createLinearGradient(0,-35,0,35);metal.addColorStop(0,'#b1bfb3');metal.addColorStop(.25,'#627e83');metal.addColorStop(1,'#213b47');
    if(pistol){this.poly(c,[[-68,-24],[64,-24],[70,-4],[4,2],[-13,60],[-43,52],[-27,0],[-68,-2]],metal);this.line(c,[[-56,-19],[54,-19]],'#d9dcc3',2);this.line(c,[[0,6],[19,8],[14,30],[-5,27]],'#879e94',3);}
    else if(uzi){this.poly(c,[[-72,-31],[51,-31],[70,-12],[67,10],[10,10],[14,64],[-8,64],[-19,7],[-70,8]],metal);this.line(c,[[64,-20],[105,-20]],'#8caaa4',8);this.line(c,[[-62,-36],[-20,-36]],'#b7c4b4',4);for(let i=0;i<5;i++)this.line(c,[[-48+i*13,-19],[-48+i*13,0]],'#203c47',3);}
    else{this.poly(c,[[-111,-5],[-62,-21],[52,-21],[61,1],[-60,5],[-94,29],[-113,20]],metal);this.metal(c,52,-17,117,-17,7);this.poly(c,[[-21,4],[-2,4],[8,36],[-12,41]],'#3d5254');
      if(id==='shotgun'){this.line(c,[[-48,-9],[21,-9]],'#a58a66',15);this.line(c,[[45,-5],[113,-5]],'#526c72',6);}
      if(ak){this.poly(c,[[-4,3],[18,2],[39,40],[31,63],[10,66],[15,42]],'#3e555b');this.line(c,[[27,-13],[66,-13]],'#9c7852',13);this.poly(c,[[-113,0],[-70,-13],[-71,14],[-108,27]],'#8d6f4f');}
      if(/rifle|r98/.test(id)){this.metal(c,-34,-35,27,-35,10);this.oval(c,-34,-35,7,10,'#7da19b');this.line(c,[[-30,-29],[-26,-17]],'#95aaa0',4);this.line(c,[[22,-28],[26,-17]],'#a0b2a2',4);}
      if(gl){this.oval(c,23,-4,30,31,'#8c9a7d');this.line(c,[[10,-25],[36,-25]],'#c3c3a0',3);this.metal(c,48,-15,111,-15,18);}
      if(flame){this.oval(c,-54,5,21,32,'#8a9c76');this.line(c,[[-35,12],[28,35],[67,22],[65,-9]],'#bc9c69',7);this.metal(c,51,-17,117,-17,14);this.line(c,[[96,-4],[117,-4]],'#c8b78b',5);}
    }c.restore();
  },
  document(c,e){
    const variant=POVArt.hash(e.doc||e.id||'doc')%4;c.save();c.translate(128,167);c.rotate(variant%2?-.18:.12);
    this.poly(c,[[-74,-66],[65,-73],[80,76],[-67,83]],variant===2?'#6c7768':'#4e615d');
    this.poly(c,[[-64,-66],[55,-67],[68,61],[59,73],[37,67],[23,76],[-58,73]],'#c8c4a6');
    c.fillStyle='#788d7b';c.fillRect(-61,-59,119,17);this.label(c,variant===1?'UMBRAL':'SAN GABRIEL',-2,-47,'#e2dcc0',13);
    c.fillStyle='#526756';for(let i=0;i<10;i++)c.fillRect(-47,-27+i*7,90-i%4*12,2);
    c.strokeStyle='#99524b';c.lineWidth=2;c.strokeRect(1,31,50,22);this.label(c,'ARCHIVO',26,46,'#92504a',11);
    this.oval(c,-32,43,11,7,'#76403955');this.line(c,[[-33,45],[-30,65]],'#7b424759',2);this.line(c,[[4,-63],[9,66]],'#8d8d7444',1);if(variant===3){c.fillStyle='#8b9c89';c.fillRect(-21,-73,47,14);}c.restore();
  },
  materialDrop(c,t){
    const large=t.includes('large');if(t.includes('screw')){this.poly(c,[[48,198],[74,145],[204,167],[231,224],[89,244]],'#726951');for(let i=0;i<(large?6:4);i++){const x=66+i*24,y=178+i%2*21;this.metal(c,x,y,x+39,y-24,large?9:6);this.oval(c,x,y,large?10:7,large?8:5,'#a7b3a3');this.line(c,[[x-4,y-3],[x+4,y+3]],'#3a5657',2);}}
    else{c.fillStyle='#647463';c.fillRect(79,109,99,121);this.oval(c,128,109,49,12,'#9a9b7d');this.oval(c,128,230,49,10,'#344c46');c.fillStyle='#b7b18c';c.fillRect(85,142,87,49);this.label(c,'PÓLVORA',128,162,'#344b42',16);this.label(c,large?'500 G':'100 G',128,180,'#536145',13);c.fillStyle='#58624b';c.fillRect(89,97,78,11);}
  },
  sample(c,color,label){
    this.poly(c,[[91,82],[163,82],[170,224],[85,224]],'#8caeaa50');c.fillStyle=color;c.fillRect(94,141,66,73);this.line(c,[[97,99],[99,210]],'#e0ead2aa',3);c.fillStyle='#b4c3aa';c.fillRect(86,71,83,22);c.fillStyle='#d1cbb0';c.fillRect(98,156,58,34);this.label(c,label,128,179,'#435d56',18);this.oval(c,144,128,4,7,color);
  },
  part(c,p){
    if(/culture|catalyst|enzyme|serum|blood|antigen|extract/.test(p)){this.sample(c,/blood/.test(p)?'#9a5966':'#a18abd','UM');return;}
    if(/coolant|resin|oil|charcoal/.test(p)){this.sample(c,/coolant/.test(p)?'#87b8ba':/resin/.test(p)?'#b9a16c':'#627269',/coolant/.test(p)?'C-0':'SG');return;}
    if(/lens|scope|optic|prism/.test(p)){this.oval(c,128,168,65,42,'#344e58',-.3);this.oval(c,113,156,45,35,'#a5b8ac',-.3);this.oval(c,113,156,35,27,'#315c72',-.3);this.oval(c,109,150,27,17,'#729eab99',-.3);this.line(c,[[90,149],[118,135]],'#d2dfcd',3);this.line(c,[[140,151],[175,169]],'#b2c4b1',4);return;}
    if(/cell/.test(p)){c.fillStyle='#6f8776';c.fillRect(77,113,105,115);c.fillStyle='#324f54';c.fillRect(85,138,89,71);this.line(c,[[104,151],[104,181]],'#c5c9a6',5);this.line(c,[[89,166],[119,166]],'#c5c9a6',5);c.fillStyle='#b6ab78';c.fillRect(90,97,22,17);c.fillRect(147,97,22,17);return;}
    if(/chart/.test(p)){this.document(c,{doc:p});this.line(c,[[87,156],[121,131],[155,167],[180,142]],'#887653',3);return;}
    if(/fabric|membrane|seal/.test(p)){this.poly(c,[[55,166],[89,106],[198,139],[210,218],[170,238],[80,211]],'#98a17e');for(let i=0;i<5;i++)this.line(c,[[81,145+i*13],[179,164+i*12]],'#4d6f5b',2);if(/seal/.test(p)){c.strokeStyle='#b8baa0';c.lineWidth=12;c.beginPath();c.ellipse(127,178,48,34,.2,0,7);c.stroke();}return;}
    if(/chip|film/.test(p)){this.poly(c,[[60,165],[156,118],[206,193],[108,239]],'#527668');for(let i=0;i<5;i++)this.line(c,[[79+i*15,165],[127+i*13,199]],'#b5af7b',2);this.poly(c,[[110,168],[141,151],[164,186],[136,202]],'#243f47');return;}
    if(/barrel|tube|breech|probe|pin|slide/.test(p)){this.metal(c,48,209,201,115,/tube|barrel/.test(p)?22:12);this.oval(c,49,209,/tube|barrel/.test(p)?16:10,12,'#829b91',.4);this.oval(c,49,209,8,6,'#294853',.4);this.line(c,[[115,154],[132,180]],'#b8baa0',7);return;}
    if(/magazine|feed/.test(p)){this.poly(c,[[91,100],[142,85],[181,195],[165,235],[119,226]],'#5b7377');for(let i=0;i<5;i++)this.line(c,[[104,120+i*17],[150,108+i*18]],'#a5b4a2',3);return;}
    if(/filter/.test(p)){c.fillStyle='#8da18a';c.fillRect(72,107,113,121);for(let i=0;i<10;i++)this.line(c,[[80+i*11,114],[80+i*11,220]],i%2?'#d0c7a2':'#4c6d67',5);return;}
    // Rotores, muelles y acoplamientos mantienen sus formas mecánicas propias.
    if(/spring|piston|drive|actuator/.test(p)){this.metal(c,75,217,179,117,8);for(let i=0;i<8;i++)this.line(c,[[77+i*12,191-i*10],[103+i*12,207-i*10]],'#a6b9ad',5);return;}
    if(/crank/.test(p)){this.metal(c,59,212,132,167,12);this.metal(c,132,167,123,114,12);this.metal(c,123,114,184,87,12);this.line(c,[[177,83],[195,112]],'#685d47',15);return;}
    if(/weight/.test(p)){this.poly(c,[[75,143],[156,120],[190,202],[110,236]],'#8f9380');this.metal(c,98,145,93,112,5);this.metal(c,93,112,143,103,5);this.metal(c,143,103,151,128,5);return;}
    for(let i=0;i<10;i++){c.save();c.translate(128,172);c.rotate(i*Math.PI/5);c.fillStyle='#a7b29a';c.fillRect(-10,-67,20,27);c.restore();}this.oval(c,128,172,52,52,'#78917f');this.oval(c,128,172,32,32,'#b5c1a8');this.oval(c,128,172,19,19,'#284851');
  },
  key(c,e){
    c.save();c.translate(127,185);c.rotate(-.35);this.oval(c,-35,0,23,23,'#bdb28b');this.oval(c,-35,0,13,13,'#2b4348');this.line(c,[[-12,0],[70,0]],'#c7ba8e',9);this.line(c,[[44,0],[44,18]],'#ad9c70',9);this.line(c,[[62,0],[62,12]],'#bba77b',9);this.poly(c,[[-39,-23],[-33,-56],[8,-55],[10,-23]],'#8ca69a');this.line(c,[[-27,-43],[-1,-43]],'#385955',2);c.restore();
  },
  suitcase(c){this.caseBase(c);this.poly(c,[[31,142],[224,142],[224,230],[31,230]],'#8a8c6e');this.line(c,[[49,143],[49,230]],'#465a50',10);this.line(c,[[204,143],[204,230]],'#465a50',10);this.line(c,[[108,138],[108,115],[150,115],[150,138]],'#c3b68f',7);},
  caseBase(c){this.poly(c,[[26,180],[52,116],[220,116],[234,184],[224,240],[36,240]],'#405d60');this.poly(c,[[39,185],[57,133],[211,133],[218,186]],'#1b343b');this.line(c,[[37,199],[225,199]],'#9dad99',4);for(const x of[51,203]){c.fillStyle='#b5ac81';c.fillRect(x,193,9,25);}},
  hazmatFolded(c){this.poly(c,[[90,150],[107,121],[151,121],[173,151],[155,167],[149,191],[107,192],[100,166]],'#ada063');this.oval(c,128,140,16,18,'#314d52');this.line(c,[[128,159],[128,190]],'#59664c',3);}
};
