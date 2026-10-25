// Síntesis local: mezcla limitada, voces recicladas y ambiente sin archivos externos.
const Sound = {
  ctx:null, _volume:.65, files:{}, ambient:null, ambientGain:null,
  voices:new Set(), maxVoices:40, buffers:new Map(), stats:{started:0,released:0,dropped:0},
  get volume(){return this._volume;},
  set volume(value){
    const n=Number(value);if(!Number.isFinite(n))return;
    this._volume=Math.max(0,Math.min(1,n));
    this.param(this.master?.gain,this._volume,.025);
    // Compatibilidad con los dos controles de volumen existentes: este bus ya
    // incluye el volumen; nunca atraviesa también el master de efectos.
    this.param(this.ambientGain?.gain,.05*this._volume,.05);
    for(const f of Object.values(this.files))try{f.volume=this._volume;}catch(e){}
  },
  param(param,value,time=.04){
    if(!param)return;
    try{if(param.setTargetAtTime)param.setTargetAtTime(value,this.ctx.currentTime,time);else param.value=value;}catch(e){}
  },
  graph(){
    const c=this.ctx;if(!c||c.state==='closed'||typeof c.createGain!=='function')return false;
    if(this.graphContext===c)return true;
    try{
      this.voices.clear();this.buffers.clear();this.master=c.createGain();this.master.gain.value=this._volume;
      this.ambientGain=c.createGain();this.ambientGain.gain.value=.05*this._volume;
      this.limiter=c.createDynamicsCompressor();this.limiter.threshold.value=-10;this.limiter.knee.value=10;this.limiter.ratio.value=6;this.limiter.attack.value=.003;this.limiter.release.value=.16;
      this.master.connect(this.limiter);this.ambientGain.connect(this.limiter);this.limiter.connect(c.destination);this.graphContext=c;return true;
    }catch(e){return false;}
  },
  unlock(){
    try{
      if(this.ctx?.state==='closed'){this.stopTransient();this.stopAmbient();this.graphContext=null;}
      if(!this.ctx||this.ctx.state==='closed')this.ctx=new(window.AudioContext||window.webkitAudioContext)();
      this.graph();if(this.ctx.state==='suspended')this.ctx.resume()?.catch?.(()=>{});
    }catch(e){}
  },
  // Cada voz conserva sus nodos: la cola onended y los desalojos los desconectan.
  voice(source,nodes,options={}){
    const priority=options.priority||0;
    if(this.voices.size>=this.maxVoices){
      const victim=[...this.voices].find(v=>v.priority<=priority);
      if(!victim){for(const n of nodes)try{n.disconnect();}catch(e){}this.stats.dropped++;return null;}
      victim.release(true);this.stats.dropped++;
    }
    const v={source,nodes,priority,done:false,release:(stop=false)=>{
      if(v.done)return;v.done=true;if(stop)try{source.stop();}catch(e){}
      for(const n of nodes)try{n.disconnect();}catch(e){}
      this.voices.delete(v);this.stats.released++;
    }};
    source.onended=()=>v.release();this.voices.add(v);this.stats.started++;return v;
  },
  buffer(duration){
    const c=this.ctx,seconds=Math.max(.02,Math.min(4,Math.round(duration*100)/100)),key=Math.round(seconds*100);
    if(this.buffers.has(key))return this.buffers.get(key);
    const b=c.createBuffer(1,Math.ceil(c.sampleRate*seconds),c.sampleRate),d=b.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    if(this.buffers.size>=24)this.buffers.delete(this.buffers.keys().next().value);
    this.buffers.set(key,b);return b;
  },
  output(source,filter,duration,volume,options={}){
    const c=this.ctx,now=c.currentTime+(options.delay||0),gain=c.createGain(),nodes=[source];
    let tail=source;if(filter){source.connect(filter);nodes.push(filter);tail=filter;}
    tail.connect(gain);nodes.push(gain);tail=gain;
    if(options.pan&&c.createStereoPanner){const pan=c.createStereoPanner();pan.pan.value=Math.max(-.7,Math.min(.7,options.pan));tail.connect(pan);nodes.push(pan);tail=pan;}
    tail.connect(options.ambient?this.ambientGain:this.master);
    const level=Math.max(.00001,Math.min(.65,Number(volume)||0));
    gain.gain.setValueAtTime(.00001,now);gain.gain.linearRampToValueAtTime(level,now+Math.min(.004,duration/4));gain.gain.exponentialRampToValueAtTime(.00001,now+duration);
    const v=this.voice(source,nodes,options);if(!v)return null;
    source.start(now);source.stop(now+duration+.01);return v;
  },
  noise(duration,volume,frequency,type,options={}){
    try{
      if(!this.graph()||!(duration>0)||!(volume>0))return;
      const c=this.ctx,s=c.createBufferSource(),f=c.createBiquadFilter();s.buffer=this.buffer(duration);f.type=type||'lowpass';f.frequency.value=Math.max(25,Math.min(c.sampleRate*.46,frequency||1000));f.Q.value=options.q||.6;
      return this.output(s,f,Math.min(4,duration),volume,options);
    }catch(e){}
  },
  tone(frequency,duration,volume,wave,options={}){
    try{
      if(!this.graph()||!(duration>0)||!(volume>0))return;
      const c=this.ctx,o=c.createOscillator(),now=c.currentTime+(options.delay||0);o.type=wave||'sine';o.frequency.setValueAtTime(Math.max(20,frequency),now);
      if(options.endFreq)o.frequency.exponentialRampToValueAtTime(Math.max(20,options.endFreq),now+duration);
      return this.output(o,null,Math.min(4,duration),volume,options);
    }catch(e){}
  },
  weaponId(context={}){return context.weaponId||(typeof Game!=='undefined'?Game.player?.weapon?.id:null)||'pistol';},
  weaponShot(id){
    const p={pistol:[.14,.30,2400,135,52],ak:[.16,.32,1800,100,45],viper:[.095,.22,3100,190,72],shotgun:[.32,.48,1500,75,28],rifle:[.26,.40,1950,105,31],r98:[.26,.40,1950,105,31],gl6:[.23,.35,580,82,35],launcher:[.23,.35,580,82,35]}[id]||[.14,.30,2400,135,52];
    this.noise(p[0],p[1],p[2]*(.96+Math.random()*.08),'lowpass',{priority:2});
    this.tone(p[3],p[0]*.9,p[1]*.5,'triangle',{endFreq:p[4],priority:2});
    this.noise(.025,.09,4500,'highpass',{priority:2});
    if(id==='shotgun')this.noise(.08,.10,1200,'bandpass',{delay:.18,priority:1});
  },
  step(context={}){
    const surface=context.surface||'tile',run=!!context.running,pan=context.pan||0;
    const p={tile:[.065,.065,1150],wood:[.085,.075,650],metal:[.085,.065,1900],water:[.13,.085,850],stone:[.075,.065,1400]}[surface]||[.065,.065,1150];
    this.noise(p[0],p[1]*(run?1.35:1),p[2]*(.92+Math.random()*.16),'lowpass',{pan});
    this.tone(surface==='metal'?195:surface==='wood'?88:120,.045,.023*(run?1.3:1),'sine',{pan,endFreq:surface==='metal'?130:65});
    if(surface==='water')this.noise(.07,.036,2300,'bandpass',{delay:.035,pan});
  },
  play(name,context={}){
    try{const f=this.files[name];if(f){f.volume=this._volume;f.currentTime=0;f.play()?.catch?.(()=>{});return;}}catch(e){}
    switch(name){
      case'shot':this.weaponShot(this.weaponId(context));break;
      case'blast':this.noise(.58,.44,520,'lowpass',{priority:2});this.tone(64,.44,.22,'sine',{endFreq:25,priority:2});break;
      case'empty':this.noise(.025,.07,3500,'highpass');this.tone(740,.025,.035,'triangle');break;
      case'reload':this.noise(.075,.10,1600,'bandpass',{priority:1});this.tone(this.weaponId(context)==='flamethrower'?160:280,.06,.045,'triangle',{priority:1});break;
      case'reloadend':this.noise(.045,.13,2800,'highpass',{priority:1});this.tone(370,.055,.055,'triangle',{endFreq:230,priority:1});break;
      case'step':this.step(context);break;
      case'hurt':this.tone(95,.24,.20,'triangle',{endFreq:44,priority:2});this.noise(.12,.19,650,'lowpass',{priority:2});break;
      case'enemyhit':this.noise(.08,.15,720);break;
      case'enemydie':this.tone(83,.33,.13,'triangle',{endFreq:31});this.noise(.15,.08,420);break;
      case'attack':this.tone(150,.17,.08,'sawtooth',{endFreq:85});break;
      case'mutate':this.tone(150,.4,.14,'sawtooth',{endFreq:270,priority:2});this.tone(300,.5,.07,'sine',{endFreq:95,priority:2});break;
      case'door':this.noise(.24,.18,420);this.tone(84,.18,.085,'triangle',{endFreq:48});this.noise(.04,.09,1900,'bandpass',{delay:.14});break;
      case'inject':this.noise(.12,.07,2600,'bandpass',{priority:1});this.tone(510,.075,.08,'sine',{priority:1});this.tone(260,.24,.065,'triangle',{delay:.09,priority:1});break;
      case'pickup':this.tone(660,.10,.07,'sine',{priority:1});this.tone(880,.12,.06,'sine',{delay:.075,priority:1});break;
    }
  },
  startAmbient(){
    try{
      if(!this.graph()||this.ambient)return;
      const c=this.ctx,root=c.createGain(),hum=c.createOscillator(),harmonic=c.createOscillator(),air=c.createBufferSource(),filter=c.createBiquadFilter(),hg=c.createGain(),ag=c.createGain(),og=c.createGain();
      root.gain.value=0;root.connect(this.ambientGain);hum.type='sine';hum.frequency.value=48;hg.gain.value=.29;hum.connect(hg);hg.connect(root);
      harmonic.type='triangle';harmonic.frequency.value=96;og.gain.value=.035;harmonic.connect(og);og.connect(root);
      air.buffer=this.buffer(4);air.loop=true;filter.type='lowpass';filter.frequency.value=390;filter.Q.value=.5;ag.gain.value=.12;air.connect(filter);filter.connect(ag);ag.connect(root);
      const sources=[hum,harmonic,air],nodes=[root,hum,harmonic,air,filter,hg,ag,og];for(const s of sources)s.start();
      this.ambient={root,hum,harmonic,filter,airGain:ag,stop(){for(const s of sources)try{s.stop();}catch(e){}for(const n of nodes)try{n.disconnect();}catch(e){}}};
      this.ambientTarget=0;
    }catch(e){}
  },
  ambientProfile(profile,enabled=true){
    if(!this.ambient)return;const a=this.ambient,p=profile||{frequency:48,air:390,airGain:.12,level:.7};
    this.param(a.hum.frequency,p.frequency||48,.6);this.param(a.harmonic.frequency,(p.frequency||48)*2,.6);this.param(a.filter.frequency,p.air||390,.6);this.param(a.airGain.gain,p.airGain??.12,.6);
    this.ambientTarget=enabled?(p.level??.7):0;this.param(a.root.gain,this.ambientTarget,enabled?.45:.06);
  },
  stopAmbient(){try{this.ambient?.stop();}catch(e){}this.ambient=null;this.ambientTarget=0;},
  stopTransient(){for(const v of [...this.voices])v.release(true);}
};
