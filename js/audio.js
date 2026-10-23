// Audio procedural (WebAudio). Si existe assets/<nombre>.ogg se usa; si no, se sintetiza. Nunca lanza errores.
const Sound = {
  ctx: null, volume:.65, files: {}, ambient: null,
  unlock() { try { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); if (this.ctx.state === 'suspended') this.ctx.resume(); } catch (e) {} },
  // Para agregar audio real: Sound.files.shot = new Audio('assets/shot.ogg');
  noise(dur, vol, freq, type) {
    try { const c = this.ctx; if (!c) return; const n = c.sampleRate * dur, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const s = c.createBufferSource(); s.buffer = b; const f = c.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq;
      const g = c.createGain(); g.gain.value = vol*this.volume; s.connect(f); f.connect(g); g.connect(c.destination); s.start(); } catch (e) {} },
  tone(freq, dur, vol, wave) {
    try { const c = this.ctx; if (!c) return; const o = c.createOscillator(), g = c.createGain(); o.type = wave || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(Math.max(.0001,vol*this.volume), c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + dur); } catch (e) {} },
  play(name) {
    try { const f = this.files[name]; if (f) { f.currentTime = 0; f.play().catch(() => {}); return; } } catch (e) {}
    switch (name) {
      case 'shot': this.noise(0.18, 0.5, 2200); this.tone(110, 0.12, 0.3, 'square'); break;
      case 'empty': this.tone(900, 0.04, 0.15, 'square'); break;
      case 'reload': this.tone(300, 0.05, 0.2, 'square'); setTimeout(() => this.tone(480, 0.06, 0.2, 'square'), 700); break;
      case 'step': this.noise(0.05, 0.08, 400); break;
      case 'hurt': this.tone(90, 0.3, 0.4, 'sawtooth'); this.noise(0.15, 0.3, 800); break;
      case 'enemyhit': this.noise(0.1, 0.25, 600); break;
      case 'enemydie': this.tone(70, 0.5, 0.35, 'sawtooth'); break;
      case 'attack': this.tone(160, 0.2, 0.15, 'sawtooth'); break;
      case 'mutate': this.tone(180, 0.4, 0.25, 'sawtooth'); this.tone(360, 0.5, 0.15, 'sine'); break;
      case 'door': this.noise(0.25, 0.3, 300); this.tone(80, 0.2, 0.2, 'square'); break;
      case 'inject': this.tone(500, 0.08, 0.2); setTimeout(() => this.tone(250, 0.3, 0.25, 'triangle'), 90); break;
      case 'pickup': this.tone(660, 0.1, 0.2); setTimeout(() => this.tone(880, 0.12, 0.2), 90); break;
    }
  },
  startAmbient() {
    try { if (!this.ctx || this.ambient) return; const o = this.ctx.createOscillator(), g = this.ctx.createGain(); o.type = 'sine'; o.frequency.value = 48; g.gain.value = 0.05*this.volume;this.ambientGain=g;
      o.connect(g); g.connect(this.ctx.destination); o.start(); this.ambient = o; } catch (e) {} },
  stopAmbient() { try { if (this.ambient) { this.ambient.stop(); this.ambient = null; } } catch (e) {} }
};
