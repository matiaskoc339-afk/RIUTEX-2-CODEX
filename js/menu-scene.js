// v0.15.1 · Hospital abandonado: sangre húmeda y luz de disparos, sin figuras humanas.
const MenuScene = {
  ready:false, reduced:false, ticks:0, last:0, volume:.65,
  motionReduced(){return this.reduced||!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;},
  init(){
    if(this.ready||typeof HTMLCanvasElement==='undefined')return;this.ready=true;
    try{const s=JSON.parse(localStorage.getItem('riutex_presentation_v015')||'{}');this.reduced=!!s.reduced;this.volume=Number.isFinite(s.volume)?Math.min(1,Math.max(0,s.volume)):.65;}catch(e){}
    Sound.volume=this.volume;
    const menu=UI.$('menu'),canvas=document.createElement('canvas');canvas.id='menuBackdrop';canvas.className='menu-backdrop';canvas.setAttribute('aria-hidden','true');menu.prepend(canvas);this.canvas=canvas;this.ctx=canvas.getContext('2d');
    menu.querySelector('.menu-kicker').textContent='SAN GABRIEL · PROTOCOLO DE CONTENCIÓN';
    menu.querySelector('h1').innerHTML='<span>RIUTEX</span><em>2</em>';menu.querySelector('h1').setAttribute('aria-label','RIUTEX 2');
    menu.querySelector('h2').textContent='EL CUSTODIO';
    UI.$('bNew').querySelectorAll('span')[1].textContent='Nueva partida';
    menu.querySelector('.menu-footer').innerHTML='<span>HISTORIA COMPLETA / v0.24.0</span><span>EL SILENCIO NO TE SALVARÁ.</span><span>CUATRO FASES</span>';menu.appendChild(menu.querySelector('.menu-footer'));
    const opt=document.createElement('button');opt.id='bMenuOptions';opt.innerHTML='<span class="button-index">03</span><span>Opciones</span><span class="button-arrow">↗</span>';menu.querySelector('.menu-actions').appendChild(opt);
    const panel=document.createElement('section');panel.id='menuOptions';panel.className='screen hidden';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-labelledby','presentationOptionsTitle');
    panel.innerHTML='<div class="presentation-options"><span class="eyebrow">RIUTEX 2 / CONFIGURACIÓN</span><h2 id="presentationOptionsTitle">OPCIONES</h2><label for="menuVolume">Volumen <output id="menuVolumeValue"></output><input id="menuVolume" type="range" min="0" max="100" step="1"></label><label for="menuReduceMotion">Reducir movimiento y destellos<input id="menuReduceMotion" type="checkbox"></label><p>WASD · moverte &nbsp; / &nbsp; Ratón · apuntar y disparar<br>Shift · correr &nbsp; / &nbsp; E · interactuar &nbsp; / &nbsp; R · recargar<br>Tab · maletín &nbsp; / &nbsp; J · documentos &nbsp; / &nbsp; M · mapa<br>K · habilidades &nbsp; / &nbsp; Esc · pausa</p><button id="bMenuOptionsClose">Volver al menú</button></div>';
    document.body.appendChild(panel);
    opt.onclick=()=>{Game.state='menuOptions';UI.screen('menuOptions');UI.$('menuVolume').focus();};
    const back=()=>{Game.toMenu();UI.$('bMenuOptions').focus();};UI.$('bMenuOptionsClose').onclick=back;
    const volume=UI.$('menuVolume'),reduce=UI.$('menuReduceMotion');volume.value=Math.round(this.volume*100);reduce.checked=this.reduced;
    const setVolume=()=>{this.volume=Number(volume.value)/100;Sound.volume=this.volume;if(Sound.ambientGain)Sound.ambientGain.gain.value=.05*this.volume;UI.$('menuVolumeValue').textContent=volume.value+' %';const pause=UI.$('blueVolume');if(pause)pause.value=volume.value;this.save();};
    volume.oninput=setVolume;reduce.onchange=()=>{this.reduced=reduce.checked;this.save();};setVolume();
    window.addEventListener('keydown',e=>{if(Game.state!=='menuOptions')return;if(e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();back();}e.stopImmediatePropagation();if(e.code==='Tab'){const nodes=[volume,reduce,UI.$('bMenuOptionsClose')],i=nodes.indexOf(document.activeElement);if((e.shiftKey&&i===0)||(!e.shiftKey&&i===nodes.length-1)){e.preventDefault();nodes[e.shiftKey?nodes.length-1:0].focus();}}},true);
    window.addEventListener('resize',()=>this.resize());this.resize();
    const frame=t=>{requestAnimationFrame(frame);if(document.hidden||Game.state!=='menu'||t-this.last<33)return;this.last=t;this.draw(this.motionReduced()?0:t/1000);};requestAnimationFrame(frame);
  },
  save(){try{localStorage.setItem('riutex_presentation_v015',JSON.stringify({volume:this.volume,reduced:this.reduced}));}catch(e){}},
  // Todo el material está precalculado; el menú solo anima luz y reflejos.
  resize(){
    if(!this.canvas)return;
    const ratio=Math.min(devicePixelRatio||1,1.5);this.canvas.width=Math.round(innerWidth*ratio);this.canvas.height=Math.round(innerHeight*ratio);this.width=innerWidth;this.height=innerHeight;this.ratio=ratio;
    this.floor=document.createElement('canvas');this.floor.width=1440;this.floor.height=900;this.drawFloor(this.floor.getContext('2d'));
    this.blood=document.createElement('canvas');this.blood.width=920;this.blood.height=580;const c=this.blood.getContext('2d');c.translate(460,285);this.drawBlood(c);this.draw(this.motionReduced()?0:performance.now()/1000);
  },
  random(seed){let n=seed>>>0;return()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};},
  drawFloor(c){
    const rnd=this.random(2691),g=c.createRadialGradient(590,300,60,720,450,930);g.addColorStop(0,'#485051');g.addColorStop(.5,'#30383a');g.addColorStop(1,'#111c21');c.fillStyle=g;c.fillRect(0,0,1440,900);
    c.save();c.translate(720,350);c.rotate(-.43);c.scale(1,.79);
    for(let y=-1200;y<1600;y+=174)for(let x=-1600;x<1800;x+=232){
      const v=rnd();c.fillStyle=`rgba(${v>.5?'156,165,159':'8,16,19'},${.02+v*.075})`;c.fillRect(x+3,y+3,226,168);
      c.strokeStyle='#0a1317c0';c.lineWidth=3;c.strokeRect(x,y,232,174);c.strokeStyle='#b3b9a22a';c.lineWidth=1;c.strokeRect(x+3,y+3,226,168);
      for(let n=0;n<48;n++){const xx=x+rnd()*230,yy=y+rnd()*173;c.fillStyle=n%3?'#a4b0a00a':'#03090e20';c.fillRect(xx,yy,1+rnd()*4,1+rnd()*2);}
      for(let n=0;n<4;n++){const xx=x+rnd()*150,yy=y+20+rnd()*130;c.strokeStyle='#a9b1a314';c.beginPath();c.moveTo(xx,yy);c.lineTo(xx+14+rnd()*60,yy-1+rnd()*2);c.stroke();}
      if(v>.8){c.strokeStyle='#0b141851';c.beginPath();c.moveTo(x+19,y+4);c.lineTo(x+24,y+18);c.lineTo(x+17,y+26);c.lineTo(x+29,y+38);c.stroke();}
    }c.restore();
    // Suciedad y halos de agua: textura de material, no una capa de grano sobre la interfaz.
    for(let i=0;i<180;i++){const x=rnd()*1440,y=rnd()*900,r=10+rnd()*85;c.fillStyle='#09121507';c.beginPath();c.ellipse(x,y,r,r*.3,rnd()*6,0,Math.PI*2);c.fill();}
    c.save();c.translate(1295,19);c.rotate(.27);c.shadowColor='#000';c.shadowBlur=35;
    const mattress=c.createLinearGradient(-120,0,120,0);mattress.addColorStop(0,'#1d2a2c');mattress.addColorStop(.4,'#67756e');mattress.addColorStop(1,'#293c3e');c.fillStyle=mattress;c.fillRect(-92,-120,230,335);c.shadowBlur=0;
    c.strokeStyle='#101e24';c.lineWidth=14;c.strokeRect(-109,-140,260,390);
    const metal=c.createLinearGradient(-110,0,158,0);metal.addColorStop(0,'#182c35');metal.addColorStop(.14,'#a0b1a6');metal.addColorStop(.22,'#3b555b');metal.addColorStop(.9,'#4f686a');metal.addColorStop(1,'#b4beb1');c.strokeStyle=metal;c.lineWidth=6;c.strokeRect(-109,-140,260,390);
    c.fillStyle='#96a59819';c.beginPath();c.moveTo(-84,-80);c.lineTo(127,-110);c.lineTo(132,179);c.lineTo(30,198);c.lineTo(-70,155);c.closePath();c.fill();
    for(let i=0;i<7;i++){c.strokeStyle=i%2?'#111e254a':'#b2bba41e';c.lineWidth=2;c.beginPath();c.moveTo(-70+i*28,-85);c.bezierCurveTo(-35+i*22,0,-80+i*30,120,-51+i*25,186);c.stroke();}
    c.strokeStyle='#09151b';c.lineWidth=10;c.beginPath();c.moveTo(-70,245);c.lineTo(-76,335);c.moveTo(113,245);c.lineTo(119,335);c.stroke();
    for(const x of [-76,119]){c.fillStyle='#070f13';c.beginPath();c.ellipse(x,337,22,15,0,0,7);c.fill();c.strokeStyle='#6f85875a';c.lineWidth=2;c.stroke();}c.restore();
    // Historia ambiental alrededor de la sangre: expediente y un vial roto, sin personajes.
    c.save();c.translate(130,695);c.rotate(-.25);c.shadowBlur=15;c.shadowColor='#000';c.fillStyle='#1b272b';c.fillRect(-8,-8,95,139);c.shadowBlur=0;c.fillStyle='#b4b4a58a';c.fillRect(0,0,79,117);c.fillStyle='#405452';c.fillRect(26,-5,32,11);c.fillRect(12,15,37,4);c.fillStyle='#283d3e';c.font='7px Rajdhani';c.fillText('SAN GABRIEL',12,34);for(let i=0;i<7;i++)c.fillRect(11,45+i*6,49-(i%3)*9,1);c.strokeStyle='#752c2e';c.lineWidth=1.5;c.strokeRect(29,92,39,14);c.fillStyle='#53212c88';c.beginPath();c.ellipse(3,100,16,5,-.8,0,7);c.fill();c.restore();
    c.strokeStyle='#abb6a532';c.lineWidth=2;c.beginPath();c.moveTo(-20,74);c.bezierCurveTo(258,-2,-3,302,179,344);c.bezierCurveTo(267,363,238,270,319,305);c.stroke();
    c.save();c.translate(1208,728);c.rotate(.52);c.fillStyle='#627fa622';c.strokeStyle='#acc2bb55';c.lineWidth=1;c.fillRect(-22,-9,56,18);c.strokeRect(-22,-9,56,18);c.fillStyle='#1a2c30';c.fillRect(34,-11,11,22);c.fillStyle='#8b436744';c.fillRect(-18,1,48,6);for(const [x,y]of [[-39,-5],[-46,11],[-29,22]]){c.beginPath();c.moveTo(x,y);c.lineTo(x+8,y-5);c.lineTo(x+4,y+9);c.closePath();c.stroke();}c.restore();
    // Arrastre, gotas y entrada de sangre por las juntas del suelo.
    c.save();c.translate(720,350);c.rotate(-.43);c.scale(1,.79);c.strokeStyle='#480f1a70';c.lineWidth=10;c.lineCap='round';c.beginPath();c.moveTo(-221,252);c.lineTo(249,252);c.stroke();c.strokeStyle='#33101a80';c.lineWidth=4;c.beginPath();c.moveTo(249,252);c.lineTo(249,432);c.stroke();c.restore();
    for(let i=0;i<55;i++){const a=rnd()*Math.PI*2,d=260+rnd()*250;c.fillStyle=i%3?'#3a101b9a':'#60172677';c.beginPath();c.ellipse(720+Math.cos(a)*d*1.23,346+Math.sin(a)*d*.68,1+rnd()*5,1+rnd()*2,a,0,7);c.fill();}
  },
  pool(){
    const p=new Path2D();p.moveTo(-343,-133);p.bezierCurveTo(-298,-165,-252,-148,-216,-173);p.bezierCurveTo(-170,-210,-120,-169,-71,-190);p.bezierCurveTo(-21,-219,23,-190,66,-198);p.bezierCurveTo(103,-214,143,-186,184,-186);p.bezierCurveTo(228,-202,270,-166,299,-155);p.bezierCurveTo(317,-139,356,-134,345,-110);p.bezierCurveTo(328,-85,367,-69,351,-35);p.bezierCurveTo(331,-10,364,18,340,45);p.bezierCurveTo(326,62,343,78,311,88);p.bezierCurveTo(286,94,285,120,253,118);p.bezierCurveTo(217,111,208,140,168,132);p.bezierCurveTo(140,126,132,160,100,144);p.bezierCurveTo(61,125,40,161,4,143);p.bezierCurveTo(-21,132,-48,155,-75,139);p.bezierCurveTo(-109,118,-133,149,-162,124);p.bezierCurveTo(-190,101,-208,124,-230,101);p.bezierCurveTo(-260,79,-280,105,-298,74);p.bezierCurveTo(-311,51,-353,43,-339,14);p.bezierCurveTo(-330,-6,-366,-21,-349,-45);p.bezierCurveTo(-334,-65,-369,-104,-343,-133);p.closePath();return p;
  },
  drawBlood(c){
    const rnd=this.random(87133),p=this.pool();
    c.shadowColor='#000c';c.shadowBlur=19;c.fillStyle='#17050bbf';c.fill(p);c.shadowBlur=0;
    const g=c.createLinearGradient(-240,-230,220,190);g.addColorStop(0,'#3d0b18');g.addColorStop(.31,'#6d1426');g.addColorStop(.59,'#4c0c1d');g.addColorStop(1,'#240811');c.fillStyle=g;c.fill(p);
    c.save();c.clip(p);
    const depth=c.createRadialGradient(-90,-42,10,-40,-25,355);depth.addColorStop(0,'#26030a99');depth.addColorStop(.6,'#25050b26');depth.addColorStop(1,'#b03f353b');c.fillStyle=depth;c.fillRect(-420,-250,850,470);
    for(let i=0;i<620;i++){
      const x=rnd()*800-400,y=rnd()*430-220,r=2+rnd()*23;
      c.fillStyle=i%3?'#9c39470a':'#13010b10';c.beginPath();c.ellipse(x,y,r*1.8,r*.16,-.28,0,7);c.fill();
    }
    for(let i=0;i<1800;i++){c.fillStyle=i%2?'#dc8d6f09':'#1602091a';c.fillRect(rnd()*820-410,rnd()*450-230,rnd()*2+.5,.5+rnd());}
    // Refracción estática de un ventanal alto en el líquido oscuro.
    c.save();c.translate(-144,-88);c.rotate(-.27);c.transform(1,0,.65,.57,0,0);
    const glass=c.createLinearGradient(-50,-90,150,100);glass.addColorStop(0,'#bbcec51a');glass.addColorStop(.7,'#99aaa00c');glass.addColorStop(1,'#142a2600');c.fillStyle=glass;c.fillRect(-76,-94,238,174);
    c.strokeStyle='#02080c50';c.lineWidth=6;c.strokeRect(-76,-94,238,174);c.beginPath();c.moveTo(43,-94);c.lineTo(43,80);c.moveTo(-76,-7);c.lineTo(162,-7);c.stroke();c.restore();
    for(let i=0;i<16;i++){const y=-172+i*20;c.strokeStyle=i%4===0?'#c17a7135':'#bc716b12';c.lineWidth=i%4===0?1.5:.65;c.beginPath();c.moveTo(-375,y);c.bezierCurveTo(-235,y+7,-66,y-24,362,y-59);c.stroke();}
    c.restore();
    // Un labio irregular de líquido: oscuro en sombra y húmedo en el lado iluminado.
    c.strokeStyle='#12040bd9';c.lineWidth=3.5;c.stroke(p);c.strokeStyle='#bd64524d';c.lineWidth=.9;c.stroke(p);
    c.save();c.clip(p);c.translate(0,2);c.strokeStyle='#f5a58a1d';c.lineWidth=2;c.stroke(p);c.restore();
    for(let i=0;i<24;i++){const a=i*2.399,d=365+rnd()*34;c.fillStyle=i%3?'#3a0b18':'#671c2d';c.beginPath();c.ellipse(Math.cos(a)*d,Math.sin(a)*(170+rnd()*25),2+rnd()*5,1+rnd()*2,a,0,7);c.fill();}
  },
  // Ráfagas cortas separadas; el reflejo se ve sin dibujar ninguna figura ni arma.
  shotLight(t){
    if(t<=0)return 0;const cycle=t%8.4;let light=0;
    for(const at of [1.6,2.15,5.8]){const elapsed=cycle-at;if(elapsed>=0&&elapsed<.36)light=Math.max(light,Math.pow(1-elapsed/.36,1.6));}
    return light;
  },
  draw(t){
    const c=this.ctx,w=this.width,h=this.height;if(!c||!w)return;this.ticks++;
    const reduced=this.motionReduced();if(reduced)t=0;const shot=this.shotLight(t);
    c.setTransform(this.ratio,0,0,this.ratio,0,0);c.clearRect(0,0,w,h);c.drawImage(this.floor,0,0,w,h);
    if(shot>.005){const glow=c.createRadialGradient(w*.77,h*.20,5,w*.66,h*.33,w*.65);glow.addColorStop(0,`rgba(245,172,94,${shot*.26})`);glow.addColorStop(.5,`rgba(172,95,55,${shot*.07})`);glow.addColorStop(1,'#e4ae7100');c.fillStyle=glow;c.fillRect(0,0,w,h);}
    const scale=Math.min(w/1100,h/720)*1.12;
    c.save();c.translate(w*.5,h*.385);c.scale(scale,scale);c.drawImage(this.blood,-460,-285);
    const p=this.pool();c.save();c.clip(p);
    // Los fluorescentes se reflejan en bandas rotas por pequeñas ondas, con el fondo inmóvil.
    for(let i=0;i<28;i++){
      const y=-160+i*10,warp=t?Math.sin(t*.6+i*.45)*2:0;c.strokeStyle=`rgba(193,201,177,${.018+.012*(1+Math.sin(i*.65))})`;c.lineWidth=i%8===0?2:.65;c.beginPath();c.moveTo(-370,y+warp);c.bezierCurveTo(-140,y+14+warp,80,y-29,380,y-53);c.stroke();
    }
    if(shot>.005){
      const glow=c.createRadialGradient(220,-82,1,180,-48,370);glow.addColorStop(0,`rgba(255,222,161,${shot*.94})`);glow.addColorStop(.22,`rgba(244,158,81,${shot*.65})`);glow.addColorStop(.56,`rgba(191,62,36,${shot*.35})`);glow.addColorStop(1,'#d64c2200');c.fillStyle=glow;c.fillRect(-420,-250,850,480);
      c.save();c.globalCompositeOperation='screen';
      // Destello alargado y fragmentos de luz reflejada.
      c.translate(220,-82);c.rotate(-.24);c.scale(1,.37);
      const core=c.createRadialGradient(0,0,0,0,0,94);core.addColorStop(0,`rgba(255,248,214,${shot*.9})`);core.addColorStop(.21,`rgba(255,214,133,${shot*.8})`);core.addColorStop(1,'#ffbc6a00');c.fillStyle=core;c.fillRect(-100,-100,200,200);
      c.fillStyle=`rgba(255,240,198,${shot*.67})`;c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?13:40+(i%3)*9,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();c.fill();
      for(let i=0;i<13;i++){const yy=-90+i*15;c.strokeStyle=`rgba(255,230,172,${shot*(.12+.4*Math.max(0,1-Math.abs(yy)/100))})`;c.lineWidth=i%3===0?3.5:1;c.beginPath();c.moveTo(-95+Math.abs(yy)*.5,yy);c.quadraticCurveTo(12,yy+Math.sin(i+t*7)*10,95-Math.abs(yy)*.55,yy-6);c.stroke();}c.restore();
      c.strokeStyle=`rgba(255,173,113,${shot*.38})`;c.lineWidth=2;c.stroke(p);
    }
    if(t>0)for(let i=0;i<4;i++){
      const age=(t*.18+i*.25)%1,x=i%2?198:-208,y=i%2?-86:70;c.strokeStyle=`rgba(215,139,127,${(1-age)*.13})`;c.lineWidth=.7;c.beginPath();c.ellipse(x,y,12+age*142,3+age*28,-.18,0,7);c.stroke();
    }
    c.restore();c.restore();
    const vignette=c.createRadialGradient(w*.5,h*.38,Math.min(w,h)*.17,w*.5,h*.47,Math.max(w,h)*.69);vignette.addColorStop(0,'#02060805');vignette.addColorStop(.57,'#02060940');vignette.addColorStop(1,'#010408f2');c.fillStyle=vignette;c.fillRect(0,0,w,h);
    const shade=c.createLinearGradient(0,0,0,h);shade.addColorStop(0,'#04090f52');shade.addColorStop(.45,'#04080b00');shade.addColorStop(1,'#020609c7');c.fillStyle=shade;c.fillRect(0,0,w,h);
  }
};
(()=>{
  const init=Game.init;Game.init=function(){init.call(this);MenuScene.init();};
  const screen=UI.screen;UI.screen=function(name){screen.call(this,name);if(name==='menuOptions'&&MenuScene.ready){MenuScene.volume=Sound.volume;UI.$('menuVolume').value=Math.round(Sound.volume*100);UI.$('menuVolumeValue').textContent=Math.round(Sound.volume*100)+' %';MenuScene.save();}UI.$('menuOptions')?.classList.toggle('hidden',name!=='menuOptions');if(name==='menuOptions')UI.$('hud').classList.add('hidden');};
})();
