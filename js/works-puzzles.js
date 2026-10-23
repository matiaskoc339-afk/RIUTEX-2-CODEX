// Cinco mecanismos distintos; todos conservan sus ajustes al cerrar o guardar.
const WorksPuzzles = {
 cur:null,
 titles:{pumps:'Trasvase del aliviadero',cages:'Cuarentena / nueve jaulas',gears:'Tren de presión',filter:'Filtro de vertidos',hoist:'Grúa del armero',main:'Compuerta del colector'},
 needs:{pumps:['wx_rotor'],cages:['wx_cell'],gears:['wx_coupling'],filter:['wx_charcoal','wx_membrane'],hoist:['wx_seal'],main:[]},
 doc:{pumps:'wx_water',cages:'wx_animal',gears:'wx_pressure',filter:'wx_filter_note',hoist:'wx_shipping',main:'wx_intro'},
 defaults(kind){return {pumps:{v:[8,0,0],selected:null},cages:{v:Array(9).fill(1)},gears:{v:[1,5,3,7]},filter:{order:[]},hoist:{posts:[[3,2,1],[],[]],selected:null},main:{}}[kind];},
 values(g,kind=this.cur){const q=Works.data(g);return q.mechanisms[kind]||(q.mechanisms[kind]=this.defaults(kind));},
 solved(g,kind=this.cur){const q=this.values(g,kind);return kind==='pumps'?q.v.join(',')==='4,4,0':kind==='cages'?q.v.every(v=>v===0):kind==='gears'?q.v.every(v=>v===0):kind==='filter'?q.order.join(',')==='mesh,carbon,membrane':kind==='hoist'?q.posts[2].join(',')==='3,2,1':kind==='main'?Works.data(g).installed.length===3:false;},
 init(g){
  const el=document.createElement('section');el.id='worksPuzzle';el.className='screen hidden';
  el.innerHTML='<div class="wx-panel"><header><div><span class="eyebrow">SAN GABRIEL / SERVICIOS INFERIORES</span><h2 id="wxTitle"></h2></div><button id="wxClose">Volver [ESC]</button></header><p id="wxInstructions"></p><div id="wxMechanism"></div><div class="wx-actions"><button id="wxReset">Restablecer mecanismo</button><button id="wxConfirm">Comprobar</button></div><p id="wxFeedback" role="status" aria-live="polite"></p><aside id="wxClue"></aside></div>';
  document.body.appendChild(el);UI.$('wxClose').onclick=()=>g.resume();UI.$('wxReset').onclick=()=>{if(this.cur==='main')return;Works.data(g).mechanisms[this.cur]=this.defaults(this.cur);this.render(g);};UI.$('wxConfirm').onclick=()=>this.complete(g);
 },
 open(g,kind){
  if(!this.titles[kind])return false;
  if(kind!=='main'&&Works.flag(g,kind))return UI.msg('El mecanismo ya está resuelto.');
  this.cur=kind;g.state='worksPuzzle';g.keys={};g.mouse.down=false;UI.screen('worksPuzzle');this.values(g);this.render(g);return true;
 },
 missing(g,kind=this.cur){return this.needs[kind].filter(k=>!g.inv.keys.includes(k));},
 feedback(t){UI.$('wxFeedback').textContent=t;},
 action(g,i){
  if(g.state!=='worksPuzzle'||!this.cur)return false;
  if(this.missing(g).length){this.feedback('Falta '+this.missing(g).map(k=>KEYS[k]).join(' y ')+'. Puedes consultar la pista y volver.');return false;}
  const kind=this.cur,q=this.values(g);
  if(kind==='pumps'){
   if(q.selected===null){if(q.v[i]>0)q.selected=i;}
   else {const from=q.selected;if(from!==i){const n=Math.min(q.v[from],[8,5,3][i]-q.v[i]);q.v[from]-=n;q.v[i]+=n;}q.selected=null;}
  }
  if(kind==='cages')for(const d of [0,-3,1,3,-1]){const k=i+d;if(k>=0&&k<9&&(d===0||Math.abs(k%3-i%3)+Math.abs(Math.floor(k/3)-Math.floor(i/3))===1))q.v[k]^=1;}
  if(kind==='gears'){q.v[i]=(q.v[i]+1)%8;q.v[(i+1)%4]=(q.v[(i+1)%4]+7)%8;}
  if(kind==='filter'){if(q.order.includes(i))q.order=q.order.filter(t=>t!==i);else if(q.order.length<3)q.order.push(i);}
  if(kind==='hoist'){
   if(q.selected===null){if(q.posts[i].length)q.selected=i;}
   else {const from=q.selected,disc=q.posts[from].at(-1),top=q.posts[i].at(-1);if(from!==i&&(top===undefined||disc<top))q.posts[i].push(q.posts[from].pop());q.selected=null;}
  }
  Sound.play('door');this.render(g);return true;
 },
 complete(g){
  if(g.state!=='worksPuzzle'||!this.cur)return false;
  const kind=this.cur;if(kind!=='main'&&Works.flag(g,kind))return false;
  if(this.missing(g,kind).length){this.feedback('Falta '+this.missing(g,kind).map(k=>KEYS[k]).join(' y ')+'. Los ajustes no se pierden al salir.');return false;}
  if(!this.solved(g,kind)){this.feedback({pumps:'Divide el depósito en dos mitades; el tanque pequeño debe quedar vacío.',cages:'Todavía hay señales de jaulas activas.',gears:'No todas las muescas miran al centro.',filter:'El residuo llega a la membrana demasiado pronto. Revisa el orden de capas.',hoist:'La pila completa debe quedar en el poste de descarga.',main:'Faltan volantes en las tomas del colector.'}[kind]);Sound.play('empty');return false;}
  if(kind!=='main'){
   g.pz['h:wx_'+kind]=true;
   g.inv.keys=g.inv.keys.filter(k=>!this.needs[kind].includes(k));
   if(kind==='filter'){Works.data(g).filter=true;if(!g.inv.keys.includes('wx_filter'))g.inv.keys.push('wx_filter');}
   if(kind==='hoist')Works.data(g).upgrades.push('shot_compensator');
   Works.openDoors(g);
  }
  g.resume();Hospital.checkpoint(g);Sound.play('pickup');
  UI.msg({pumps:'Trasvase estable. El aliviadero baja; el pozo y su atajo responden.',cages:'Las nueve jaulas están en silencio. Cede el cierre del quirófano animal.',gears:'La presión cae. La prensa queda liberada y las fugas se cortan.',filter:'Filtro de vertidos instalado: −45 % de acumulación de veneno.',hoist:'Compensador M12 recuperado: +12 % de daño y −10 % de esfuerzo, solo escopeta.',main:'La compuerta del colector ya está abierta.'}[kind],6500);return true;
 },
 render(g){
  const kind=this.cur,q=this.values(g),box=UI.$('wxMechanism'),missing=this.missing(g);
  UI.$('wxTitle').textContent=this.titles[kind];
  UI.$('wxInstructions').textContent={pumps:'Selecciona un depósito de origen y después uno de destino. Se transfiere hasta vaciar el origen o llenar el destino. Conserva el líquido y divídelo en dos mitades.',cages:'Cada mando cambia su jaula y las vecinas que comparten un lado. Apaga las nueve señales para liberar el cierre.',gears:'Girar una rueda arrastra a la siguiente en sentido opuesto. Haz que las cuatro muescas apunten al núcleo central.',filter:'Selecciona las tres capas en el orden que seguirá el vertido. Pulsa una capa colocada para retirarla.',hoist:'Selecciona un poste de origen y uno de destino. Solo se mueve la pieza superior. Nunca una pieza grande sobre una pequeña. Lleva la pila al poste de descarga.',main:'Instala los tres volantes recuperados en sus tomas. Puedes regresar con uno cada vez.'}[kind];
  UI.$('wxFeedback').textContent=missing.length?'CONEXIÓN INCOMPLETA · '+missing.map(k=>KEYS[k]).join(' + '):'';
  UI.$('wxReset').classList.toggle('hidden',kind==='main');UI.$('wxConfirm').textContent=kind==='main'?'Cerrar panel':'Comprobar mecanismo';
  const id=this.doc[kind],found=g.inv.docs.includes(id);UI.$('wxClue').innerHTML='<span>DOCUMENTO RELACIONADO</span><strong>'+DOCS[id].title+'</strong><p>'+FieldDesk.escape(found?DOCS[id].text:'Todavía no has recuperado esta hoja. Puedes cerrar el mecanismo y explorar; los ajustes se conservarán.').replace(/\n/g,'<br>')+'</p>';
  if(kind==='pumps'){
   box.innerHTML='<div class="wx-tanks">'+q.v.map((v,i)=>'<button data-wx="'+i+'" class="wx-tank '+(q.selected===i?'selected':'')+'" aria-label="Depósito '+String.fromCharCode(65+i)+'"><span>'+String.fromCharCode(65+i)+'</span><div class="wx-vessel"><i style="height:'+v/[8,5,3][i]*100+'%"></i><b>'+v+' / '+[8,5,3][i]+'</b></div><small>'+[8,5,3][i]+' L · '+(q.selected===i?'ORIGEN':'TRANSFERIR')+'</small></button>').join('')+'</div>';
  } else if(kind==='cages')box.innerHTML='<div class="wx-cages">'+q.v.map((v,i)=>'<button data-wx="'+i+'" class="'+(v?'lit':'')+'" aria-label="Cambiar jaula '+(i+1)+'"><i></i><span>RECINTO '+String.fromCharCode(65+i)+'</span></button>').join('')+'</div><p class="wx-readout">'+q.v.filter(Boolean).length+' / 9 SEÑALES ACTIVAS</p>';
  else if(kind==='gears'){
   const centers=[[95,85],[265,85],[265,255],[95,255]];
   box.innerHTML='<svg class="wx-gears" viewBox="0 0 360 340" aria-hidden="true"><path d="M95 85L265 85 265 255 95 255Z" fill="none" stroke="#6f6b58" stroke-width="8"/><circle cx="180" cy="170" r="25" fill="#314442" stroke="#9da78b"/>'+centers.map(([x,y],i)=>{const a=Math.atan2(170-y,180-x)*180/Math.PI;return '<g transform="translate('+x+' '+y+')"><circle r="48" fill="#3d4441" stroke="#93947d" stroke-width="12" stroke-dasharray="9 5"/><circle r="33" fill="#192929" stroke="#798d81"/><g transform="rotate('+(a+q.v[i]*45)+')"><path d="M-9 0H40m-7-8 9 8-9 8" fill="none" stroke="'+(q.v[i]===0?'#a3d39f':'#d9ad79')+'" stroke-width="5"/></g></g>';}).join('')+'</svg><div class="wx-gear-controls">'+q.v.map((v,i)=>'<button data-wx="'+i+'" aria-label="Girar rueda '+(i+1)+'">RUEDA '+(i+1)+' ↻</button>').join('')+'</div>';
  } else if(kind==='filter') {
   const labels={mesh:'MALLA',carbon:'CARBÓN',membrane:'MEMBRANA'};
   box.innerHTML='<div class="wx-layers"><span>ENTRADA ↓</span>'+[0,1,2].map(i=>'<div class="wx-layer '+(q.order[i]||'')+'">'+(labels[q.order[i]]||'CAPA VACÍA')+'</div>').join('')+'<span>RESPIRADOR ↓</span></div><div class="wx-layer-options">'+Object.entries(labels).map(([id,t])=>'<button data-wx="'+id+'" class="'+(q.order.includes(id)?'selected':'')+'">'+t+'</button>').join('')+'</div>';
  } else if(kind==='hoist')box.innerHTML='<div class="wx-posts">'+q.posts.map((post,i)=>'<button data-wx="'+i+'" class="wx-post '+(q.selected===i?'selected':'')+'" aria-label="Seleccionar poste '+(i+1)+'"><div class="wx-stack">'+post.slice().reverse().map(n=>'<i style="width:'+(30+n*19)+'%;--disc:'+n+'"></i>').join('')+'</div><span>'+['CARGA','APOYO','DESCARGA'][i]+'</span></button>').join('')+'</div>';
  else if(kind==='main')box.innerHTML='<div class="wx-sockets">'+['a','b','c'].map((id,i)=>{const installed=Works.data(g).installed.includes(id),has=g.inv.keys.includes('wx_valve_'+id);return '<button data-install="'+id+'" '+(!has||installed?'disabled':'')+' class="'+(installed?'installed':'')+'"><i class="wx-valve-icon valve-'+id+'">✣</i><strong>'+['FLUJO','CUARENTENA','PRESIÓN'][i]+'</strong><small>'+(installed?'INSTALADA':has?'INSTALAR VOLANTE':'TOMA VACÍA')+'</small></button>';}).join('')+'</div>';
  box.querySelectorAll('[data-wx]').forEach(b=>b.onclick=()=>this.action(g,['filter'].includes(kind)?b.dataset.wx:Number(b.dataset.wx)));
  box.querySelectorAll('[data-install]').forEach(b=>b.onclick=()=>{Works.install(g,b.dataset.install);this.render(g);});
 },
};
(() => {const screen=UI.screen;UI.screen=function(name){screen.call(this,name);this.$('worksPuzzle')?.classList.toggle('hidden',name!=='worksPuzzle');};})();
