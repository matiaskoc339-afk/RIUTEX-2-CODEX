// El hundimiento y la última contención. Solo el final de la fase 1.
const FinalEncounter = {
  level: 'hospitalchem',
  phases: ['EL CARNICERO', 'LA CARNE REESCRITA', 'FURIA TERMINAL'],
  bounds: [3 * 32, 5 * 32, 35 * 32, 30 * 32],
  beginFall(g) {
    if (g.collapse || g.story.finalEncounter?.fallen || g.pz['h:boss']) return;
    // Punto anterior a la caída: permite volver a prepararse tras morir.
    g.keys = {}; g.mouse.down = g.mouse.clicked = g.mouse.rclick = false;
    Hospital.checkpoint(g);
    g.collapse = { t: 0, x: g.player.x, y: g.player.y };
    g.cam.shake = 12;
    UI.msg('El hormigón está cediendo…', 2000);
    Sound.noise(.8, .5, 70);
  },
  land(g) {
    g.collapse = null;
    g.story.finalEncounter = { fallen: true, won: false };
    g.projectiles = []; g.eproj = []; g.pools = []; g.tracers = [];
    g.player.knx = g.player.kny = 0;
    Hospital.goto(g, this.level, [9, 24]);
    g.player.invuln = 2;
    g.cam.shake = 16;
    Sound.play('hurt'); Sound.noise(.9, .3, 90);
    UI.msg('La rejilla aguanta. Los químicos, abajo. Él está aquí.', 5500);
  },
  ending(g) {
    if (g.state !== 'play' || !g.pz['h:boss']) return;
    g.story.finalEncounter = { fallen: true, won: true, escaped: true };
    g.save(3);
    g.state = 'end'; g.keys = {}; g.mouse.down = false;
    Sound.stopAmbient();
    UI.$('endH').textContent = 'FIN DE LA FASE 1';
    UI.$('endS').textContent = 'Al otro lado de la contención';
    UI.$('endB').textContent = 'El Carnicero ha caído. Axel cruza la puerta lateral y deja atrás la cuba química. Por primera vez, el metal ya no lo sigue.\n\nAquí termina esta fase.\n\nDocumentos recuperados: ' + g.inv.docs.length + ' · Adaptaciones: ' + Math.max(0, g.mut.owned.size - 1);
    UI.screen('end');
  },
  hud(g) {
    const b = g.boss, live = g.lvl === this.level && b && !b.dead;
    const el = UI.$('finalCue');
    el.classList.toggle('hidden', !live);
    if (!live) return;
    const labels = { cleave: b.combo ? 'DOBLE CORTE · DOS TIEMPOS' : 'CORTE · APÁRTATE DEL ARCO', charge: 'EMBESTIDA · SAL DE LA LÍNEA', hook: 'GANCHO · PASO LATERAL', leap: 'SALTO · ABANDONA LA MARCA', vents: 'PRESIÓN QUÍMICA · EVITA LAS MARCAS' };
    const recovering = b.mode === 'recover' && !b.vents.length && !b.hooks.length;
    el.dataset.mode = recovering ? 'recover' : b.vents.length || b.hooks.length ? 'wind' : b.mode;
    el.textContent = b.mode === 'mutate' ? 'MUTACIÓN ' + b.phase + ' / 3 · PREPÁRATE' : b.vents.length ? 'PRESIÓN QUÍMICA · EVITA LAS MARCAS' : b.hooks.length ? 'GANCHO · MANTÉN EL PASO LATERAL' : b.mode === 'wind' ? labels[b.attack] : b.mode === 'intro' ? 'EL CARNICERO · ÚLTIMA CONTENCIÓN' : recovering ? (b.wallStun ? 'IMPACTO · QUEDA EXPUESTO' : 'RECUPERA EL ALIENTO') : 'FASE ' + b.phase + ' / 3';
    UI.$('bossN').textContent = this.phases[b.phase - 1] + ' · ' + b.phase + ' / 3';
  },
  // Segmento continuo: los ganchos y las cargas no atraviesan al jugador entre frames.
  segmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, den = dx * dx + dy * dy;
    const t = den ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / den)) : 0;
    return Math.hypot(px - ax - dx * t, py - ay - dy * t);
  },
  clamp(x, y, r = 35) {
    const b = this.bounds;
    return [Math.max(b[0] + r, Math.min(b[2] - r, x)), Math.max(b[1] + r, Math.min(b[3] - r, y))];
  }
};

// Separada de las tres plantas explorables: no se revela en el mapa hasta caer.
FLOORS.hospitalchem = {
  W: 44, H: 35, spawn: [9, 24], safe: [], patrol: [],
  rooms: [['Cuba de neutralización', 3, 5, 32, 25], ['Galería lateral', 36, 16, 6, 6]],
  cuts: [], furn: {}, decor: [],
  doors: [['containment_exit', 35, 18, 1, 2, 'h:boss']],
  items: [
    _D('final_maintenance', 6, 26),
    ['final_ammo', 'ammo', 5, 27], ['final_shells', 'shells', 7, 27],
    ['final_heal', 'inj_green', 5, 25], ['final_energy', 'inj_blue', 7, 25],
  ], enemies: [], barrels: [], bossZone: FinalEncounter.bounds,
};
// La calle deja de ser el final: es el lugar del hundimiento.
FLOORS.hospitalb.bossZone = null;
FLOORS.hospitalb.doors.find(d => d[0] === 'exit')[5] = 'h:power';
DOCS.final_maintenance = {
  title: 'Mantenimiento · Plataforma C-0',
  text: 'HOSPITAL SAN GABRIEL\nSERVICIO DE NEUTRALIZACIÓN / C-0\n\nEl vertido está BAJO la rejilla. No retirar los anclajes de la plataforma.\n\nLos conductos expulsan presión antes de descargar: el temblor y el vapor preceden siempre al chorro.\n\nLa compuerta lateral se libera al cesar la sobrecarga biológica.\n\nAnotación manuscrita: «Cuando se lance, haz que falle. El metal le pesa. Entre ataques también tiene que respirar.»',
};
CLUES.add('final_maintenance');

class FinalCarnicero extends Carnicero {
  constructor(x, y, won = false) {
    super(900, x, y);
    this.def = { ...this.def, hp: 1500, xp: 240, name: 'El Carnicero · Última contención' };
    Object.assign(this, { hp: won ? 0 : 1500, maxHp: 1500, phase: 1, r: 23, _act: true, dormant: false, dead: won, mode: won ? 'dead' : 'intro', clock: 3.5, step: 0, hooks: [], vents: [], combo: 0, hitFlash: 0 });
  }
  onBoss() {} // Nunca ejecuta la antigua recolocación del garaje.
  hurt(dmg, angle, g) {
    if (this.dead || this.mode === 'mutate' || this.mode === 'intro' || !Number.isFinite(dmg) || dmg <= 0) return;
    const floor = (3 - this.phase) * 500;
    // Cada mutación debe completarse; un disparo fuerte no salta una fase.
    this.hp = Math.max(floor, this.hp - dmg * (this.mode === 'recover' ? 1.25 : 1));
    this.hitFlash = .12; g.sparks(this.x, this.y, 6, '#9e3844'); Sound.play('enemyhit');
    if (this.hp <= floor) {
      if (this.phase === 3) return this.die(g);
      this.phase++; this.r = this.phase === 2 ? 28 : 31;
      this.mode = 'mutate'; this.clock = 2.8; this.step = 0;
      this.hooks = []; this.vents = []; this.combo = 0;
      g.eproj = []; g.pools = []; g.cam.shake = 15;
      Sound.tone(43, 1.2, .3, 'sawtooth');
      UI.msg(this.phase === 2 ? 'El Riutex le rompe los huesos. Ya no es el mismo.' : 'Ha perdido el control. No el ritmo: observa.', 4200);
    }
  }
  die(g) {
    if (this.dead) return;
    this.dead = true; this.hp = 0; this.mode = 'dead'; this.hooks = []; this.vents = [];
    g.killed.add(900); g.pz['h:boss'] = true;
    g.story.finalEncounter = { fallen: true, won: true };
    g.player.xp += mutationXPReward(this.def, true, g.mut); g.player.onKill(g);
    g.bodies.push({ x: this.x, y: this.y, a: this.face });
    g.ring(this.x, this.y, 200, '#d6c590'); g.cam.shake = 18;
    Sound.play('enemydie');
    const door = Level.doors.find(d => d.id === 'containment_exit'); if (door) Level.openDoor(door);
    // Sin proyectiles ni descargas residuales sobre la ruta de salida.
    g.eproj = []; g.pools = []; g.curBoss = null;
    g.save(3);
    UI.msg('El Carnicero cae. Un cierre cede en la pared lateral.', 6500);
  }
  recover(seconds, wall = false) {
    this.mode = 'recover'; this.clock = seconds; this.wallStun = wall;
  }
  begin(attack, g) {
    const p = g.player;
    this.attack = attack; this.mode = 'wind'; this.wallStun = false;
    this.face = Math.atan2(p.y - this.y, p.x - this.x);
    this.dir = this.face; // Se compromete con esta dirección: no persigue durante el aviso.
    this.target = FinalEncounter.clamp(p.x, p.y);
    this.origin = [this.x, this.y];
    this.combo = attack === 'cleave' && this.phase === 3 ? 2 : 0;
    const winds = { cleave: [0, .9, .85, .75], charge: [0, 1.1, 1, .9], hook: [0, 1, .95, .85], leap: [0, 1.3, 1.25, 1.1], vents: [0, 1, 1, .9] };
    this.clock = this.windMax = winds[attack][this.phase];
    Sound.tone(attack === 'charge' ? 85 : 125, .18, .15, 'triangle');
  }
  choose(g) {
    const d = Math.hypot(g.player.x - this.x, g.player.y - this.y);
    const decks = { 1: ['charge', 'hook', 'cleave'], 2: ['leap', 'cleave', 'vents', 'charge'], 3: ['cleave', 'leap', 'vents', 'charge', 'hook'] };
    const deck = decks[this.phase];
    let attack = deck[this.step++ % deck.length];
    if (attack === 'cleave' && d > 165) attack = this.phase === 1 ? 'hook' : 'leap';
    this.begin(BossPressure.closeAttack(this, attack, g), g);
  }
  hitPlayer(g, dmg, angle = this.dir) {
    if (Level.los(this.x, this.y, g.player.x, g.player.y)) g.player.hurt(dmg, angle, g);
  }
  execute(g) {
    const p = g.player, d = Math.hypot(p.x - this.x, p.y - this.y);
    if (this.attack === 'cleave') {
      const a = Math.atan2(p.y - this.y, p.x - this.x), arc = Math.abs(Math.atan2(Math.sin(a - this.dir), Math.cos(a - this.dir)));
      if (d < 120 + p.r && arc < 1.12) this.hitPlayer(g, this.phase === 1 ? 30 : 35);
      g.ring(this.x, this.y, 125, '#cc865c'); Sound.play('attack');
      if (this.combo === 2) {
        this.combo = 1; this.dir = this.face = a; this.clock = this.windMax = .85; return;
      }
      this.combo = 0; this.recover(this.phase === 3 ? 1.3 : 1.65);
    } else if (this.attack === 'charge') {
      this.mode = 'charge'; this.clock = .95; this.chargeHit = false;
    } else if (this.attack === 'hook') {
      this.hooks.push({ x: this.x, y: this.y, vx: Math.cos(this.dir) * 540, vy: Math.sin(this.dir) * 540, life: .86 });
      this.recover(1.5);
    } else if (this.attack === 'leap') {
      this.mode = 'air'; this.clock = .35;
    } else if (this.attack === 'vents') {
      const [x, y] = this.target, offsets = this.phase === 3 ? [[0, 0], [155, 0], [-155, 0], [0, 155], [0, -155]] : [[0, 0], [170, 0], [-170, 0]];
      this.vents = offsets.map(([dx, dy]) => { const [a, b] = FinalEncounter.clamp(x + dx, y + dy, 70); return { x: a, y: b, warning: 1.35, life: 1.15, r: 64 }; });
      // No encadena ataques mientras quedan chorros: siempre hay una salida legible.
      this.recover(3.25);
    }
  }
  update(dt, g) {
    if (this.dead || g.state !== 'play') return;
    dt *= Specializations.fieldFactor(this, g); // Los poderes ralentizan; no congelan al jefe.
    this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt);
    this.frozen = this.stagger = 0;
    const p = g.player;
    for (const h of this.hooks) {
      const ox = h.x, oy = h.y; h.x += h.vx * dt; h.y += h.vy * dt; h.life -= dt;
      if (!Level.los(ox, oy, h.x, h.y)) h.life = 0;
      if (h.life > 0 && FinalEncounter.segmentDistance(p.x, p.y, ox, oy, h.x, h.y) < p.r + 7) {
        const vulnerable = p.invuln <= 0;
        this.hitPlayer(g, 23, Math.atan2(p.y - this.y, p.x - this.x));
        if (vulnerable) { const a = Math.atan2(this.y - p.y, this.x - p.x); p.knx = Math.cos(a) * 180; p.kny = Math.sin(a) * 180; }
        h.life = 0;
      }
    }
    this.hooks = this.hooks.filter(h => h.life > 0);
    for (const v of this.vents) {
      if (v.warning > 0) v.warning -= dt;
      else { v.life -= dt; if (Math.hypot(p.x - v.x, p.y - v.y) < v.r + p.r && Level.los(v.x, v.y, p.x, p.y)) p.hurt(18, Math.atan2(p.y - v.y, p.x - v.x), g); }
    }
    this.vents = this.vents.filter(v => v.life > 0);
    this.clock -= dt;
    if (this.mode === 'intro' || this.mode === 'mutate') {
      if (this.clock <= 0) this.recover(1.2);
      return;
    }
    if (this.mode === 'recover') { if (this.clock <= 0) { this.mode = 'stalk'; this.clock = this.phase === 3 ? .6 : 1; } return; }
    if (this.mode === 'wind') { if (this.clock <= 0) this.execute(g); return; }
    if (this.mode === 'charge') {
      const ox = this.x, oy = this.y, speed = this.phase === 3 ? 565 : 495;
      const sx = Math.cos(this.dir) * speed * dt, sy = Math.sin(this.dir) * speed * dt;
      Level.move(this, sx, sy);
      const [cx, cy] = FinalEncounter.clamp(this.x, this.y, this.r);
      const hitWall = Math.hypot(this.x - ox, this.y - oy) < speed * dt * .75 || cx !== this.x || cy !== this.y;
      this.x = cx; this.y = cy;
      if (!this.chargeHit && FinalEncounter.segmentDistance(p.x, p.y, ox, oy, this.x, this.y) < this.r + p.r) {
        this.hitPlayer(g, this.phase === 3 ? 41 : 36); this.chargeHit = true;
      }
      if (hitWall || this.clock <= 0) {
        this.recover(hitWall ? 2.5 : 1.75, hitWall);
        if (hitWall) { g.cam.shake = 12; Sound.noise(.3, .25, 75); }
      }
      return;
    }
    if (this.mode === 'air') {
      const k = Math.max(0, Math.min(1, 1 - this.clock / .35));
      this.x = this.origin[0] + (this.target[0] - this.origin[0]) * k;
      this.y = this.origin[1] + (this.target[1] - this.origin[1]) * k;
      if (this.clock <= 0) {
        [this.x, this.y] = this.target;
        if (Math.hypot(p.x - this.x, p.y - this.y) < 115 + p.r) this.hitPlayer(g, this.phase === 3 ? 41 : 36);
        g.ring(this.x, this.y, 125, '#db9571'); g.cam.shake = 10; Sound.play('attack');
        this.recover(1.8);
      }
      return;
    }
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1;
    this.face = Math.atan2(dy, dx);
    if (d > 95) Level.move(this, dx / d * (this.phase === 3 ? 144 : this.phase === 2 ? 122 : 108) * dt, dy / d * (this.phase === 3 ? 144 : this.phase === 2 ? 122 : 108) * dt);
    if (this.clock <= 0) this.choose(g);
  }
  drawTelegraphs(c) {
    const circle = (x, y, r, color, fill) => { c.strokeStyle = color; c.fillStyle = fill; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke(); };
    for (const v of this.vents) {
      circle(v.x, v.y, v.r, v.warning > 0 ? '#e8c985' : '#dafa89', v.warning > 0 ? 'rgba(222,168,76,.15)' : 'rgba(146,195,65,.4)');
      c.fillStyle = '#d4e6a3'; for (let j = 0; j < 6; j++) { const a = j * 1.047 + this.t; c.fillRect(v.x + Math.cos(a) * 28 - 2, v.y + Math.sin(a) * 28 - (v.warning > 0 ? 0 : (this.t * 40 % 35)), 4, 7); }
    }
    if (this.mode !== 'wind' && this.mode !== 'air') return;
    const color = '#f4ba80';
    if (this.attack === 'leap') { circle(...this.target, 115, color, 'rgba(236,135,75,.16)'); circle(...this.target, 115 * Math.max(.1, this.clock / this.windMax), '#f9d5a4', 'transparent'); }
    else if (this.attack === 'cleave') {
      c.beginPath(); c.moveTo(this.x, this.y); c.arc(this.x, this.y, 120, this.dir - 1.12, this.dir + 1.12); c.closePath();
      c.fillStyle = 'rgba(222,130,74,.24)'; c.fill(); c.strokeStyle = color; c.lineWidth = 3; c.stroke();
    } else if (this.attack === 'charge' || this.attack === 'hook') {
      c.save(); c.translate(this.x, this.y); c.rotate(this.dir);
      c.fillStyle = this.attack === 'charge' ? 'rgba(219,147,95,.18)' : 'rgba(225,208,147,.12)';
      const half = this.attack === 'charge' ? this.r + 9 : 10;
      c.fillRect(0, -half, 470, half * 2); c.strokeStyle = color; c.lineWidth = 2; c.strokeRect(0, -half, 470, half * 2);
      c.beginPath(); c.moveTo(440, -12); c.lineTo(458, 0); c.lineTo(440, 12); c.stroke(); c.restore();
    } else circle(...this.target, 64, color, 'rgba(221,174,74,.13)');
  }
  draw(c) {
    for (const h of this.hooks) { c.strokeStyle = '#beb5a1'; c.lineWidth = 3; c.beginPath(); c.moveTo(this.x, this.y); c.lineTo(h.x, h.y); c.stroke(); c.beginPath(); c.arc(h.x, h.y, 8, -.7, 3); c.stroke(); }
    c.save(); c.translate(this.x, this.y);
    const phase = this.phase, mutation = this.mode === 'mutate' ? 1 + Math.sin(this.t * 28) * .08 : 1;
    c.scale(mutation, mutation);
    c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(4, 8, this.r + 7, this.r, 0, 0, 6.283); c.fill();
    if (this.mode === 'air') c.scale(1.25, 1.25);
    c.rotate(this.mode === 'wind' ? this.dir : this.face);
    const sw = Math.sin(this.t * 5) * 3;
    c.fillStyle = '#202a2b'; c.fillRect(-18, -18 + sw, 18, 12); c.fillRect(-18, 7 - sw, 18, 12);
    c.fillStyle = this.hitFlash > 0 ? '#eee2cf' : phase === 1 ? '#646553' : phase === 2 ? '#755d79' : '#95515d';
    c.beginPath(); c.ellipse(-1, 0, 23, phase === 1 ? 21 : 28, 0, 0, 6.283); c.fill();
    c.fillStyle = '#766d59'; c.fillRect(-9, -17, 17, 34); c.fillStyle = '#722530'; c.fillRect(-8, -9, 13, 17);
    // Silueta del brazo mutado y placas óseas, crecientes entre las fases.
    c.fillStyle = phase === 1 ? '#9a8974' : '#8f6b82';
    c.fillRect(2, -25, phase === 1 ? 23 : 42, phase === 1 ? 9 : 17);
    c.fillRect(2, 16, 21, 10);
    c.fillStyle = '#c7beb1'; c.save(); c.translate(phase === 1 ? 29 : 45, -21); c.rotate(this.mode === 'wind' ? -.5 : .25); c.fillRect(-2, -5, phase === 1 ? 18 : 27, 13); c.fillStyle = '#722e33'; c.fillRect(9, 3, 7, 5); c.restore();
    c.fillStyle = '#b6a18f'; c.beginPath(); c.arc(9, 0, 12, 0, 6.283); c.fill(); c.fillStyle = '#332e30'; c.fillRect(10, -11, 7, 22);
    c.fillStyle = phase === 3 ? '#ff8465' : '#d4bb85'; c.fillRect(15, -6, 3, 3); c.fillRect(15, 3, 3, 3);
    if (phase > 1) { c.strokeStyle = phase === 3 ? '#df9e8d' : '#c3abc6'; c.lineWidth = 4; for (let j = 0; j < 5; j++) { c.beginPath(); c.moveTo(-17 + j * 7, -22); c.lineTo(-23 + j * 7, -36 - (phase === 3 ? 8 : 0)); c.stroke(); } c.strokeStyle = '#d1abc7'; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, 0); c.lineTo(-4, -12); c.lineTo(4, 10); c.stroke(); }
    c.restore();
  }
}

(() => {
  const start = Game.start;
  Game.start = function (...args) { this.collapse = null; return start.apply(this, args); };
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    const cue = document.createElement('div'); cue.id = 'finalCue'; cue.className = 'hidden'; UI.$('hud').appendChild(cue);
  };
  const build = Hospital.buildLevel;
  Hospital.buildLevel = function (g, lvl, sv) {
    g.collapse = null;
    build.call(this, g, lvl, sv);
    if (lvl === 'hospitalb') { g.boss = null; g.curBoss = null; }
    if (lvl !== FinalEncounter.level) return;
    // Sustituye la presencia de patrulla por el encuentro definitivo.
    g.enemies = g.enemies.filter(e => e !== g.carn);
    const won = !!g.pz['h:boss'] || g.killed.has(900);
    const c = g.carn = g.boss = new FinalCarnicero(26 * 32, 12 * 32, won);
    g.enemies.push(c); g.carnT = 0; g.curBoss = won ? null : c;
    g.temporalField = null; g.gravityWell = null; g.fleshEcho = null;
    if (won) { const d = Level.doors.find(d => d.id === 'containment_exit'); Level.openDoor(d); }
    // Un guardado durante el combate reinicia sus tres fases (nunca duplica suministros).
    if (sv && !won) { g.projectiles = []; g.eproj = []; g.pools = []; }
  };
  // El autoguardado de victoria usa las coordenadas reales de la nueva arena.
  const drops = Hospital.bossDrops;
  Hospital.bossDrops = function (g) { if (g.lvl !== FinalEncounter.level) return drops.call(this, g); };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    tick.call(this, g, dt);
    if (g.state !== 'play') return;
    if (g.lvl === 'hospitalb' && g.pz['h:power'] && !g.pz['h:boss'] && g.player.x > 78.1 * 32 && g.player.y > 40 * 32 && g.player.y < 45 * 32) FinalEncounter.beginFall(g);
    if (g.lvl === FinalEncounter.level && g.pz['h:boss'] && g.player.x > 37 * 32 && g.player.y > 16 * 32 && g.player.y < 22 * 32) FinalEncounter.ending(g);
  };
  // Conserva la salida de guardados anteriores que ya habían vencido al jefe del garaje.
  Hospital.endPhase1 = function (g) { FinalEncounter.ending(g); };
  const update = Game.update;
  Game.update = function (dt) {
    if (this.collapse && this.state === 'play') {
      const f = this.collapse; f.t += dt; this.t += dt; this.keys = {}; this.mouse.down = this.mouse.clicked = this.mouse.rclick = false;
      this.cam.shake = 8 + f.t * 10;
      if (f.t >= 1.85) FinalEncounter.land(this);
      return;
    }
    update.call(this, dt);
    FinalEncounter.hud(this);
  };
  const current = HospitalCompass.current;
  HospitalCompass.current = function (g) {
    if (g.lvl === FinalEncounter.level) return { id: g.pz['h:boss'] ? 'containment_exit' : 'last_containment', title: g.pz['h:boss'] ? 'El cierre ha cedido' : 'La última contención', hint: g.pz['h:boss'] ? 'El silencio deja oír aire detrás de la pared lateral.' : 'La rejilla resuena antes de cada golpe. Observa y conserva fuerzas.', floor: FinalEncounter.level, area: g.pz['h:boss'] ? [38, 19, 7, 6] : [19, 17, 30, 23], sector: 'Bajo el hospital' };
    return current.call(this, g);
  };
  const render = Game.render;
  Game.render = function () {
    render.call(this);
    // Avisos legibles incluso detrás de la linterna, limitados a la visión real.
    // Se pintan tras la iluminación, sin revelar la galería ni atravesar muros.
    if (this.lvl === FinalEncounter.level && this.boss && !this.boss.dead && HorrorVision.polygon.length) {
      const c = this.ctx; c.save(); c.beginPath();
      c.moveTo(HorrorVision.polygon[0][0] - this.cam.x, HorrorVision.polygon[0][1] - this.cam.y);
      for (const [x,y] of HorrorVision.polygon) c.lineTo(x-this.cam.x,y-this.cam.y);
      c.closePath(); c.clip(); c.translate(-this.cam.x,-this.cam.y);
      this.boss.drawTelegraphs(c); c.restore();
    }
    if (this.collapse) {
      const c = this.ctx, f = this.collapse, W = this.cv.width, H = this.cv.height;
      c.save();
      const px = f.x - this.cam.x, py = f.y - this.cam.y, drop = Math.max(0, f.t - .25);
      c.translate(px, py);
      // Hormigón que se abre en placas, seguido del vacío bajo los pies.
      c.fillStyle = '#080d0b'; c.beginPath(); c.ellipse(0, 18, Math.min(145, drop*170), Math.min(95, drop*110), 0, 0, 6.283); c.fill();
      for (let j = 0; j < 9; j++) {
        const a = j*Math.PI*2/9, spread = drop*45, fall = drop*drop*130;
        c.save(); c.translate(Math.cos(a)*spread,Math.sin(a)*spread+fall); c.rotate(a+drop*(j%2?.4:-.3));
        c.fillStyle = j%2 ? '#55544c' : '#3e423c'; c.strokeStyle = '#151b18'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(18,0); c.lineTo(72+j%3*14,-19); c.lineTo(92+j%2*16,24); c.lineTo(25,12); c.closePath(); c.fill(); c.stroke();
        c.restore();
      }
      c.restore();
      c.save(); c.fillStyle = 'rgba(5,7,8,' + Math.max(0, Math.min(1, (f.t - .8) / .65)) + ')'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#ded4be'; c.textAlign = 'center'; c.font = '600 18px Rajdhani, sans-serif'; c.fillText(f.t < .9 ? 'EL SUELO CEDE' : 'CONTENCIÓN C-0', W / 2, H * .65); c.restore();
    }
  };
  const floor = Level.draw;
  Level.draw = function (c, cam, w, h) {
    floor.call(this, c, cam, w, h);
    if (Game.lvl === 'hospitalb') {
      c.save(); c.strokeStyle = '#242322'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(77 * 32, 41 * 32); c.lineTo(79 * 32, 42 * 32); c.lineTo(78.5 * 32, 43 * 32); c.lineTo(81 * 32, 44.5 * 32); c.moveTo(79 * 32, 42 * 32); c.lineTo(81 * 32, 41 * 32); c.stroke(); c.restore();
      return;
    }
    if (Game.lvl !== FinalEncounter.level) return;
    c.save();
    const b = FinalEncounter.bounds, t = Game.t;
    c.fillStyle = '#111c1c'; c.fillRect(b[0], b[1], b[2] - b[0], b[3] - b[1]);
    // Profundidad: líquido, ondas y burbujas bajo los travesaños elevados.
    const glow = c.createRadialGradient(620, 570, 40, 620, 570, 600);
    glow.addColorStop(0, '#3e5140'); glow.addColorStop(1, '#172522'); c.fillStyle = glow; c.fillRect(...[b[0], b[1], b[2] - b[0], b[3] - b[1]]);
    c.strokeStyle = 'rgba(135,165,87,.26)'; c.lineWidth = 2;
    for (let j = 0; j < 24; j++) { const x = b[0] + 35 + (j * 137 % 940), y = b[1] + 35 + ((j * 193 - t * 13) % 710 + 710) % 710; c.beginPath(); c.ellipse(x, y, 5 + j % 8, 3 + j % 5, 0, 0, 6.283); c.stroke(); }
    // Cuadrícula fina, sombras desplazadas y barras principales de acero.
    const x0 = Math.max(b[0], Math.floor(cam.x / 12) * 12), y0 = Math.max(b[1], Math.floor(cam.y / 12) * 12);
    c.lineWidth = 2; c.strokeStyle = '#12191a'; c.beginPath();
    for (let x = x0; x < Math.min(b[2], cam.x + w + 12); x += 12) { c.moveTo(x + 4, b[1]); c.lineTo(x + 4, b[3]); }
    for (let y = y0; y < Math.min(b[3], cam.y + h + 12); y += 12) { c.moveTo(b[0], y + 4); c.lineTo(b[2], y + 4); } c.stroke();
    c.lineWidth = 1; c.strokeStyle = '#69706a'; c.beginPath();
    for (let x = x0; x < Math.min(b[2], cam.x + w + 12); x += 12) { c.moveTo(x, b[1]); c.lineTo(x, b[3]); }
    for (let y = y0; y < Math.min(b[3], cam.y + h + 12); y += 12) { c.moveTo(b[0], y); c.lineTo(b[2], y); } c.stroke();
    c.strokeStyle = '#303c3d'; c.lineWidth = 9;
    for (let x = b[0]; x <= b[2]; x += 128) { c.beginPath(); c.moveTo(x, b[1]); c.lineTo(x, b[3]); c.stroke(); }
    c.strokeStyle = '#92917a'; c.lineWidth = 4; c.strokeRect(b[0] + 4, b[1] + 4, b[2] - b[0] - 8, b[3] - b[1] - 8);
    c.fillStyle = '#b0aa8c'; c.font = '600 17px Rajdhani, sans-serif'; c.fillText('C-0 / NEUTRALIZACIÓN', 160, 194);
    c.fillStyle = 'rgba(183,175,133,.45)'; c.font = '600 12px Rajdhani, sans-serif'; c.fillText('PELIGRO · VERTIDO BAJO REJILLA', 160, 215);
    // Escombros de la caída: decoración sin colisión que pueda atrapar al jugador.
    for (let j = 0; j < 12; j++) { c.fillStyle = j % 2 ? '#625c50' : '#383e3a'; c.fillRect(230 + j * 13, 820 + (j * 23 % 59), 9 + j % 11, 7 + j % 9); }
    c.restore();
  };
})();
