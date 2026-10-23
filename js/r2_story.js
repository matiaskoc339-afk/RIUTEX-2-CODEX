// RIUTEX 2 · Fase 1 — LÓGICA. Carnicero (A* + suavizado + puertas), escuadrón, secuencia inicial jugable, plantas, puzzles y enganches al motor.
// Carga después de game.js. Solo actúa cuando el nivel es 'mansion' u 'hospital*'; RIUTEX 1 queda intacto.
const isR2lvl = l => l === 'mansion' || (l || '').startsWith('hospital');
const isR2 = () => isR2lvl(Game.lvl);
// Únicas fuentes no bélicas de XP: documentos nuevos y muestras consumidas.
const R2_XP = Object.freeze({ document: 2, sample: 15 });
const D4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

// ---------- Navegación (A* con penalización junto a paredes + comprobación de línea "gorda") ----------
const Nav = {
  safe(x, y) { return (Level.safeRects || []).some(r => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3]); },
  ok(x, y) { const g = Level.grid[y][x]; return (g === 0 && !this.safe(x, y)) || g === 2; }, // 2 = puerta libre cerrada: el Carnicero la abre; 3 = con llave: no
  tight(x, y) { for (const [dx, dy] of D4) { const v = Level.grid[y + dy] && Level.grid[y + dy][x + dx]; if (v === 1 || v === 4) return true; } return false; },
  path(fx, fy, tx, ty) {
    const W = Level.W, H = Level.H, sx = (fx / TILE) | 0, sy = (fy / TILE) | 0; tx = (tx / TILE) | 0; ty = (ty / TILE) | 0;
    if (sx < 0 || sy < 0 || sx >= W || sy >= H || tx < 0 || ty < 0 || tx >= W || ty >= H || !this.ok(tx, ty)) return null;
    const N = W * H, s = sy * W + sx, goal = ty * W + tx, g = new Float32Array(N).fill(1e9), prev = new Int32Array(N).fill(-1), closed = new Uint8Array(N); g[s] = 0; prev[s] = s;
    const h = i => Math.abs((i % W) - tx) + Math.abs(((i / W) | 0) - ty), heap = [[h(s), s]];
    const push = it => { heap.push(it); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (; ;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    while (heap.length) { const c = pop()[1]; if (closed[c]) continue; closed[c] = 1; if (c === goal) break; const x = c % W, y = (c / W) | 0;
      for (const [dx, dy] of D4) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H || !this.ok(nx, ny)) continue; const i = ny * W + nx, ng = g[c] + 1 + (this.tight(nx, ny) ? 1.4 : 0); if (ng < g[i]) { g[i] = ng; prev[i] = c; push([ng + h(i), i]); } } }
    if (prev[goal] < 0) return null; const out = []; let c = goal; while (c !== s) { out.push([(c % W) * TILE + 16, ((c / W) | 0) * TILE + 16]); c = prev[c]; } return out.reverse();
  },
  reachable(fx, fy, tx, ty) { return !!this.path(fx, fy, tx, ty); },
  fatLos(ax, ay, bx, by, r) { const d = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / d * r, ny = (bx - ax) / d * r; return Level.los(ax, ay, bx, by) && Level.los(ax + nx, ay + ny, bx + nx, by + ny) && Level.los(ax - nx, ay - ny, bx - nx, by - ny); }
};

// ---------- El Carnicero ----------
class Carnicero extends Carcelero {
  constructor(id, x, y) {
    super(id, x, y); this.def = { name: 'El Carnicero', hp: 900, speed: 92, dmg: 34, detect: 9999, range: 52, cooldown: 1.3, xp: 200, small: false };
    Object.assign(this, { hp: 900, maxHp: 900, r: 14, state: 'patrol', mt: 0, dormant: true, path: null, pathT: 0, wp: 0, hookCd: 4, hooks: [], stuckT: 0, tgt: null, lostT: 0, searchT: 0, atkCd: 0, growlT: 3, hunt: false, openT: 0, opening: null, scripted: false });
  }
  get active() { return !!this._act; }
  set active(v) { if (v && !this._act) { this._act = true; this.onBoss(); } else if (!v) this._act = false; }
  onBoss() { const g = Game; this.hp = this.maxHp = 900; this.r = 20; this.mode = 'chase'; this.dormant = false; this.chargeCd = 3; this.hookCd = 3; this.slamCd = 5; this.stagger = 0; this.frozen = 0; this.windup = 0; this.hooks = []; this.openT = 0;
    if (Math.hypot(this.x - g.player.x, this.y - g.player.y) < 300 || Level.blocked(this.x, this.y, 20)) { this.x = 60 * TILE; this.y = 41 * TILE; } }
  hurt(dmg, angle, g) {
    if (this.dead) return; if (this.active) return super.hurt(dmg, angle, g);
    this.hitFlash = .08; this.stagger = Math.max(this.stagger, .25); g.sparks(this.x, this.y, 5, '#7a0a14'); Sound.play('enemyhit'); // en acecho es imparable: solo lo frenas
    if (!this.hunt && !this.dormant) { this.hunt = true; this.state = 'chase'; this.tgt = [g.player.x, g.player.y]; }
  }
  die(g) { this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, true, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: 0 }); g.ring(this.x, this.y, 220, '#c2eeff'); g.cam.shake = 18; Sound.play('enemydie');
    g.pz['h:boss'] = true; const d = Level.doors.find(d => d.id === 'exit'); if (d) Level.openDoor(d); Hospital.bossDrops(g); g.save(3); UI.msg('El Carnicero cae. La puerta este del garaje se abre.', 7000); }
  setPath(tx, ty) { this.path = Nav.path(this.x, this.y, tx, ty); this.pathT = .3; return !!this.path; }
  follow(dt, speed) { // sigue la ruta mirando hasta 5 nodos adelante (con holgura para su cuerpo) y abre las puertas libres que encuentra
    while (this.path && this.path.length && Math.hypot(this.path[0][0] - this.x, this.path[0][1] - this.y) < 10) this.path.shift(); if (!this.path || !this.path.length) return false;
    let k = 0; for (let i = Math.min(this.path.length - 1, 5); i > 0; i--) if (Nav.fatLos(this.x, this.y, this.path[i][0], this.path[i][1], this.r - 1)) { k = i; break; }
    const [wx, wy] = this.path[k], dx = wx - this.x, dy = wy - this.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    for (const m of [14, 30]) { const cx = ((this.x + ux * m) / TILE) | 0, cy = ((this.y + uy * m) / TILE) | 0; if (Level.grid[cy] && Level.grid[cy][cx] === 2) { const dr = Level.doors.find(o => !o.open && o.tiles.some(([i, j]) => i === cx && j === cy)); if (dr) { this.opening = dr; this.openT = .55; this.face = Math.atan2(uy, ux); return true; } } }
    const sp = speed * dt, ox = this.x, oy = this.y; Level.move(this, ux * sp, uy * sp); this.face = Math.atan2(uy, ux);
    if (Math.hypot(this.x - ox, this.y - oy) < sp * .3) { this.stuckT += dt; const cxm = (((this.x / TILE) | 0) + .5) * TILE, cym = (((this.y / TILE) | 0) + .5) * TILE, dc = Math.hypot(cxm - this.x, cym - this.y) || 1; Level.move(this, (cxm - this.x) / dc * sp, (cym - this.y) / dc * sp); if (this.stuckT > .35) { this.stuckT = 0; this.pathT = 0; } } else this.stuckT = 0;
    return true;
  }
  hitPlayer(g) { const p = g.player; if (!g.story.armCut) return Hospital.cutArm(g); p.hurt(this.def.dmg, this.face, g); }
  update(dt, g) {
    if (this.dead || this.dormant) return; this.hitFlash = Math.max(0, this.hitFlash - dt); const p = g.player;
    if (this.active) { this.frozen = 0; this.stagger = Math.min(this.stagger, .4); }
    if (this.frozen > 0) { this.frozen -= dt; return; } if (this.stagger > 0) { this.stagger -= dt; return; }
    if (this.openT > 0) { this.openT -= dt; if (this.openT <= 0 && this.opening) { Level.openDoor(this.opening); Sound.play('door'); this.opening = null; this.pathT = 0; } return; }
    for (const h of this.hooks) { h.x += h.vx * dt; h.y += h.vy * dt; h.life -= dt; if (Level.solid(h.x, h.y)) h.life = 0; else if (Math.hypot(h.x - p.x, h.y - p.y) < p.r + 8) { h.life = 0; p.hurt(18, Math.atan2(h.vy, h.vx), g); const a = Math.atan2(this.y - p.y, this.x - p.x); p.knx = Math.cos(a) * 760; p.kny = Math.sin(a) * 760; Sound.play('hurt'); } }
    this.hooks = this.hooks.filter(h => h.life > 0);
    if (this.active) { // ----- modo jefe (garaje)
      const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1; this.hookCd -= dt;
      if (this.mode === 'windH') { this.mt -= dt; this.face = Math.atan2(dy, dx); if (this.mt <= 0) { this.hooks.push({ x: this.x, y: this.y, vx: Math.cos(this.face) * 560, vy: Math.sin(this.face) * 560, life: .7 }); this.mode = 'chase'; this.hookCd = 5.5; Sound.play('attack'); } return; }
      if (this.mode === 'chase' && this.hookCd <= 0 && d > 170 && d < 440 && Level.los(this.x, this.y, p.x, p.y)) { this.mode = 'windH'; this.mt = .65; this.dir = this.face; return; }
      return super.update(dt, g);
    }
    // ----- modo acecho
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1, inSafe = Nav.safe((p.x / TILE) | 0, (p.y / TILE) | 0) && !this.scripted, hid = p.hidden; this.atkCd -= dt; this.pathT -= dt;
    if (this.state === 'windup') { this.mt -= dt; if (this.mt <= 0) { if (Math.hypot(p.x - this.x, p.y - this.y) < this.def.range + 26 && !inSafe && Level.los(this.x,this.y,p.x,p.y)) this.hitPlayer(g); this.atkCd = 1.2; this.state = 'recover'; this.mt = .55; } return; }
    if (this.state === 'recover') { this.mt -= dt; if (this.mt <= 0) this.state = this.hunt ? 'chase' : 'search'; return; }
    const sees = !hid && !inSafe && (this.scripted || (d < 360 && Level.los(this.x, this.y, p.x, p.y))), n = g.noise, spd = this.scripted ? .55 : 1; // en la persecución inicial va más lento que tú: fácil de superar
    if (sees) { this.hunt = true; this.state = 'chase'; this.tgt = [p.x, p.y]; this.lostT = 0; }
    else if (n && !inSafe && !hid && Math.hypot(n.x - this.x, n.y - this.y) < n.r && this.state !== 'chase') { this.state = 'investigate'; this.tgt = [n.x, n.y]; this.pathT = 0; if (!this.hunt) Sound.play('attack'); }
    if (this.state === 'chase') {
      if (!sees) { this.lostT += dt; if (this.lostT > 4 || hid) { this.hunt = false; this.state = 'search'; this.searchT = 6; this.path = null; this.checked = false; } }
      if (sees && Level.los(this.x,this.y,p.x,p.y) && d < this.def.range + 6 && this.atkCd <= 0) { this.state = 'windup'; this.mt = .5; this.face = Math.atan2(dy, dx); Sound.play('attack'); return; }
      if (this.pathT <= 0 && this.tgt) this.setPath(this.tgt[0], this.tgt[1]);
      if (sees && d < 130 && Nav.fatLos(this.x, this.y, p.x, p.y, this.r - 1)) { const sp = 175 * spd * dt; Level.move(this, dx / d * sp, dy / d * sp); this.face = Math.atan2(dy, dx); } else this.follow(dt, 150 * spd);
      return;
    }
    if (this.state === 'investigate') { if (this.pathT <= 0 && this.tgt) this.setPath(this.tgt[0], this.tgt[1]); if (!this.follow(dt, 95) || (this.tgt && Math.hypot(this.tgt[0] - this.x, this.tgt[1] - this.y) < 40)) { this.state = 'search'; this.searchT = 5; this.path = null; this.checked = false; } return; }
    if (this.state === 'search') { this.searchT -= dt; this.face += dt * 1.6;
      if (hid && Math.hypot(p.x - this.x, p.y - this.y) < 70 && this.searchT < 3.5 && !this.checked) { this.checked = true; if (!g.mut.has('sombra') && Math.random() < .5) { p.hidden = false; UI.msg('¡Te ha encontrado!', 1800); this.hunt = true; this.state = 'chase'; this.tgt = [p.x, p.y]; return; } }
      if (this.searchT <= 0) { this.state = 'patrol'; this.path = null; } return; }
    // patrulla
    if (!this.path || !this.path.length) { const P = (R2_DATA(g.lvl).patrol) || []; for (let k = 0; k < P.length; k++) { this.wp = (this.wp + 1) % P.length; if (this.setPath(P[this.wp][0] * TILE + 16, P[this.wp][1] * TILE + 16)) break; } if (!this.path) { this.searchT = 2; this.state = 'search'; return; } }
    this.follow(dt, 62); this.growlT -= dt; if (this.growlT <= 0) { this.growlT = 4 + Math.random() * 4; Sound.tone(70 + Math.random() * 20, .5, .12, 'sawtooth'); }
  }
  draw(ctx) {
    if (this.dormant) return;
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(4, 6, 28, 22, 0, 0, 6.283); ctx.fill();
    for (const h of this.hooks) { ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(h.x - this.x, h.y - this.y); ctx.stroke(); ctx.fillStyle = '#c8c8c8'; ctx.beginPath(); ctx.arc(h.x - this.x, h.y - this.y, 5, 0, 6.283); ctx.fill(); }
    if (this.active && (this.mode === 'windC' || this.mode === 'charge')) { ctx.strokeStyle = 'rgba(255,60,60,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(this.dir) * 400, Math.sin(this.dir) * 400); ctx.stroke(); }
    if (this.active && this.mode === 'windS') { ctx.strokeStyle = 'rgba(255,60,60,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 175, 0, 6.283); ctx.stroke(); }
    if (this.active && this.mode === 'windH') { ctx.strokeStyle = 'rgba(255,190,60,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(this.face) * 440, Math.sin(this.face) * 440); ctx.stroke(); }
    if (this.state === 'windup') { ctx.strokeStyle = 'rgba(255,60,60,.55)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, this.def.range + 26, this.face - .8, this.face + .8); ctx.stroke(); }
    ctx.rotate(this.face); const wu = this.state === 'windup' || this.mode === 'windM', lunge = wu ? 10 : 0, stun = this.mode === 'stun';
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : stun ? '#8a7a9a' : '#5b5048'; ctx.beginPath(); ctx.ellipse(0, 0, 21, 28, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#b7aea0'; ctx.beginPath(); ctx.ellipse(-1, 0, 15, 22, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = 'rgba(120,10,16,.75)'; ctx.fillRect(-10, -14, 20, 10); ctx.fillRect(-6, 4, 14, 9);
    ctx.fillStyle = '#6a5a50'; ctx.fillRect(8, -30, 24 + lunge, 9); ctx.fillRect(8, 21, 22, 9);
    ctx.fillStyle = '#9ea4a6'; ctx.fillRect(28 + lunge, -35, 5, 22); ctx.fillStyle = '#c8cdd0'; ctx.fillRect(30 + lunge, -35, 14, 17); ctx.fillStyle = '#7a1018'; ctx.fillRect(34 + lunge, -30, 8, 5);
    ctx.fillStyle = '#d0d0d0'; ctx.beginPath(); ctx.arc(30, 25, 3, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.arc(5, 0, 11, 0, 6.283); ctx.fill(); ctx.fillStyle = '#2a2420'; ctx.fillRect(-1, -11, 6, 22); ctx.fillStyle = '#e0d0b0'; ctx.fillRect(6, -6, 4, 12);
    ctx.fillStyle = this.hunt || this.active ? '#ff3030' : '#a08030'; ctx.fillRect(9, -5, 3, 3); ctx.fillRect(9, 3, 3, 3);
    ctx.restore();
  }
}

// ---------- Escuadrón (prólogo) y Custodio ----------
class Squadmate {
  constructor(name, x, y, col) { Object.assign(this, { name, x, y, r: 10, col, face: 0, cd: 0, dead: false, a: 0 }); }
  update(dt, g) {
    if (this.dead) return; const p = g.player, d = Math.hypot(p.x - this.x, p.y - this.y); this.cd -= dt; let tgt = null, bd = 300;
    for (const e of g.enemies) if (!e.dead && !e.isBoss && !e.dormant) { const de = Math.hypot(e.x - this.x, e.y - this.y); if (de < bd && Level.los(this.x, this.y, e.x, e.y)) { bd = de; tgt = e; } }
    if (tgt) { this.face = Math.atan2(tgt.y - this.y, tgt.x - this.x); if (this.cd <= 0) { this.cd = .9; tgt.hurt(11, this.face, g); g.tracers.push({ x1: this.x, y1: this.y, x2: tgt.x, y2: tgt.y, life: .07 }); Sound.play('shot'); tgt.alert = true; } }
    if (d > 70) { const a = Math.atan2(p.y - this.y, p.x - this.x), sp = Math.min(150, 60 + d) * dt; Level.move(this, Math.cos(a) * sp, Math.sin(a) * sp); if (!tgt) this.face = a; }
    for (const o of g.squad || []) if (o !== this && !o.dead) { const ex = this.x - o.x, ey = this.y - o.y, ed = Math.hypot(ex, ey); if (ed > 0 && ed < 22) Level.move(this, ex / ed * 40 * dt, ey / ed * 40 * dt); }
  }
  draw(ctx) { ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(2, 3, 12, 10, 0, 0, 6.283); ctx.fill(); ctx.rotate(this.dead ? this.a : this.face);
    if (this.dead) { ctx.fillStyle = '#4a4a44'; ctx.beginPath(); ctx.ellipse(0, 0, 10, 13, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#7a1018'; ctx.fillRect(-4, -4, 8, 8); ctx.restore(); return; }
    ctx.fillStyle = '#242a30'; ctx.fillRect(-4, -7, 9, 5); ctx.fillRect(-4, 3, 9, 5); ctx.fillStyle = this.col; ctx.beginPath(); ctx.ellipse(0, 0, 7, 12, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#c9a58a'; ctx.fillRect(4, -9, 9, 4); ctx.fillRect(4, 5, 11, 4); ctx.fillStyle = '#1c1c20'; ctx.fillRect(11, 3, 14, 4); ctx.fillStyle = '#c9a58a'; ctx.beginPath(); ctx.arc(1, 0, 6, 0, 6.283); ctx.fill(); ctx.fillStyle = '#26301f'; ctx.beginPath(); ctx.arc(0, 0, 6.2, 1.5, 4.8); ctx.fill(); ctx.restore(); }
}
function drawCustodio(ctx, c) { ctx.save(); ctx.translate(c.x, c.y); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(3, 6, 20, 16, 0, 0, 6.283); ctx.fill(); ctx.rotate(c.face); ctx.fillStyle = '#16141c'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 22, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = '#2c2838'; ctx.fillRect(-10, -20, 8, 40);
  ctx.fillStyle = '#d8d4cc'; ctx.beginPath(); ctx.arc(4, 0, 8, 0, 6.283); ctx.fill(); ctx.fillStyle = '#101010'; ctx.fillRect(7, -4, 3, 3); ctx.fillRect(7, 2, 3, 3); ctx.fillStyle = '#50baff'; ctx.fillRect(9, -4, 1.5, 3); ctx.fillRect(9, 2, 1.5, 3); ctx.restore(); }

// ---------- Historia ----------
const Hospital = {
  q: [], seen: new Set(), hb: 0, msgT: 0,
  say(g, list, gap = 5) { let t = 0; for (const s of list) { this.q.push([t, s]); t += gap; } }, // mensajes de radio/escuadrón sin cinemáticas
  roomAt(p) { const x = (p.x / TILE) | 0, y = (p.y / TILE) | 0; const r = Level.rooms.find(r => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h); return r ? r.n : null; },
  doorOpen(id) { const d = Level.doors.find(d => d.id === id); return !!(d && d.open); },
  nearOpenDoor(p) { let b = null, bd = 44; for (const d of Level.doors) if (d.open) for (const [i, j] of d.tiles) { const dd = Math.hypot(i * TILE + 16 - p.x, j * TILE + 16 - p.y); if (dd < bd) { bd = dd; b = d; } } return b; },
  checkpoint(g) { try { g.save(3); } catch (e) {} }, // autoguardado oculto (hueco 4): lo usa "Reintentar"

  // ----- Mansión
  introMansion(g) { this.q = []; this.seen = new Set(); g.giveWeapon('ak', 90, true); const p = g.player; p.weapon = p.weapons.ak || p.weapon; g.story.squadAlive = true;
    this.say(g, ['MANDO (radio): «Capitán, la casa de Wren está ante ustedes. Quiero respuestas. Vivo, si es posible.»', 'Rojas: «Puerta principal abierta, Capitán. Eso no me gusta.»', 'Axel: «Entramos juntos. Linternas. Disparen solo si es necesario.»'], 4.5); this.checkpoint(g); },
  mansionTick(g, dt) {
    const p = g.player, room = this.roomAt(p), once = (k, f) => { if (!this.seen.has(k)) { this.seen.add(k); f(); } };
    (g.squad || []).forEach(s => s.update(dt, g));
    if (room === 'Vestíbulo' && p.y < 37 * TILE && !this.seen.has('front')) { const d = Level.doors.find(d => d.id === 'front'); if (d) { const was = d.open; d.key = 'h:front'; if (!was || Level.closeDoor(d)) { if (!was) d.tiles.forEach(([i, j]) => Level.grid[j][i] = 3); this.seen.add('front'); Sound.play('door'); g.cam.shake = 8; this.say(g, ['La puerta principal se cierra de golpe a vuestras espaldas.', 'Ibarra: «¡Capitán, no cede!»'], 3); } } } // solo se cierra cuando ya estás dentro y nada la bloquea
    if (room === 'Salón') once('salon', () => { UI.flash('#000'); Sound.tone(55, 1, .3, 'sawtooth'); this.say(g, ['Se apagan las luces un segundo. Algo se arrastra entre los sofás.', 'Dunn: «Contacto. Dos a las doce.»'], 3.5); });
    if (room === 'Comedor') once('com', () => this.say(g, ['Dunn: «Platos servidos. Calientes. Nadie ha comido…»'], 3));
    if (room === 'Biblioteca') once('bib', () => this.say(g, ['Ibarra: «Estos libros… tienen marcas de uñas.»'], 3));
    if (room === 'Estudio') once('est', () => this.say(g, ['Axel: «Este es el lugar. Busquemos el reloj de Wren.»'], 3));
    if (g.inv.keys.includes('estudio')) once('keycom', () => { g.story.wakeT = 12; this.say(g, ['Los criados del comedor se ponen de pie. A la vez.', 'Rojas: «¡Cúbranse!»'], 2); });
    if (g.story.wakeT > 0) { g.story.wakeT -= dt; for (const e of g.enemies) if ([703, 704].includes(e.id) && !e.dead) e.alert = true; }
    if (g.story.finale) this.finaleTick(g, dt);
  },
  finale(g) { // se coge el frasco: apagón + Custodio. Se juega: huir en la oscuridad
    const p = g.player; g.story.finale = true; g.story.vial = true; this.ft = 0; Level.lamps = []; g.cam.shake = 12; UI.flash('#000'); Sound.tone(45, 2, .35, 'sawtooth'); this.q = [];
    g.custodio = { x: 32 * TILE + 16, y: 10 * TILE + 16, face: -1.57 }; const d = Level.doors.find(d => d.id === 'secreto'); if (d && !d.open) Level.openDoor(d);
    this.say(g, ['Guardas el frasco en la bota. Las luces mueren.', 'Disparos en la casa. Gritos de tu escuadrón. Luego, nada.', 'Una figura enmascarada entra por el estudio. No respira. No se detiene.'], 3.2); },
  finaleTick(g, dt) {
    this.ft += dt; const p = g.player, c = g.custodio; if (!c) return; if (this.ft > 3 && g.squad) g.squad.forEach((s, i) => { if (!s.dead && this.ft > 3 + i * 2) { s.dead = true; s.a = Math.random() * 6; Sound.play('shot'); g.cam.shake = 6; } });
    const a = Math.atan2(p.y - c.y, p.x - c.x), sp = (this.ft > 14 ? 120 : 55) * dt; c.face = a; const o = { x: c.x, y: c.y, r: 10 }; Level.move(o, Math.cos(a) * sp, Math.sin(a) * sp); c.x = o.x; c.y = o.y;
    if (Math.hypot(p.x - c.x, p.y - c.y) < 28 || this.ft > 24) { g.story.finale = false; g.custodio = null; this.toHospital(g); } },
  clockSolved(g) { g.pz['h:secret'] = true; const d = Level.doors.find(d => d.id === 'secreto'); if (d) Level.openDoor(d); g.cam.shake = 8; Sound.play('door'); UI.msg('El reloj marca las 3:40. Algo se abre tras la pared del estudio.', 6000); },

  // ----- Hospital: inicio jugable
  toHospital(g) {
    const docs = g.inv.docs.slice(); g.inv = new Inventory(); g.inv.docs = docs; const p = g.player; p.weapons = {}; p.weapon = null; p.reloading = 0; p.mods = { mag: 0, pow: 0, prec: 0, rate: 0, mask: 0 }; p.hp = p.maxHp; p.poison = 0; g.custodio = null; g.squad = null;
    g.picked = new Set(); g.killed = new Set(); g.bodies = []; g.stash = g.stash || []; g.pz = {}; Object.assign(g.story, { seq: 'wake', restrained: true, struggle: 0, armCut: false, armHealed: false, carnActive: false, doors: {}, vial: true, finale: false });
    g.arrive = null; this.q = []; this.seen = new Set(); this.buildLevel(g, 'hospital', null); g.cam.x = p.x - g.cv.width / 2; g.cam.y = p.y - g.cv.height / 2; this.checkpoint(g); UI.flash('#fff'); Level.lamps = Level.lamps.slice(); },
  struggle(g) { const s = g.story; s.struggle++; g.cam.shake = 5; Sound.tone(120 + s.struggle * 12, .08, .18, 'square'); if (s.struggle >= 12) { s.restrained = false; s.seq = 'room'; Sound.play('door'); UI.msg('Las correas ceden. En el pasillo, algo arrastra metal.', 6000); } },
  cutArm(g) { // el Carnicero te agarra y te corta el brazo: jugable, sin diálogo
    const p = g.player, c = g.carn; if (g.story.armCut) return; g.story.armCut = true; g.story.seq = 'cut'; p.hp = Math.min(p.hp, 12); p.hidden = false; g.cam.shake = 20; Sound.play('hurt'); UI.vignette(); UI.flash('#a00');
    if (c) { c.state = 'recover'; c.mt = 7; c.hunt = true; c.atkCd = 8; } this.msgT = 0; UI.msg('[F]  INYECTA EL FRASCO', 9000); },
  inject(g) { // F: el frasco de la mansión. Regenera el brazo y despierta los primeros poderes
    const p = g.player, m = g.mut, c = g.carn; const s = g.story; s.armHealed = true; s.seq = 'healed'; s.riutexUsed = (s.riutexUsed || 0) + 1; m.tutorial = true; m.phases = Math.max(1, m.phases);

    p.maxEnergy = 100 + m.phases * 20 + m.mod('en'); p.energy = p.maxEnergy; p.hp = Math.max(p.hp, Math.round(p.maxHp * .6)); g.fxInject('#38a9ff'); g.fxMutate(); g.cam.shake = 16; g.ring(p.x, p.y, 220, '#70d6ff');
    if (c && !c.dormant) { const a = Math.atan2(c.y - p.y, c.x - p.x); Level.move(c, Math.cos(a) * 70, Math.sin(a) * 70); c.state = 'recover'; c.mt = 4.2; c.stagger = 1.2; }
    g.pz['h:shutter'] = true; g.pz['h:forced'] = true; for (const id of ['forced']) { const d = Level.doors.find(d => d.id === id); if (d && !d.open) { Level.openDoor(d); Sound.play('door'); } }
    UI.msg('El Riutex reconstruye tu brazo. K: elige tus habilidades; ninguna técnica se aprende automáticamente.', 10000); },
  lobbyReached(g) { const d = Level.doors.find(d => d.id === 'shutter'), s = g.story, c = g.carn; s.seq = 'free'; g.pz['h:shutter'] = false; if (d) { d.key = 'h:shutter'; Level.closeDoor(d, true); } Sound.play('door'); g.cam.shake = 14; s.carnActive = false;
    if (c) { c.dormant = true; c.scripted = false; c.hunt = false; c.state = 'patrol'; c.x = 1.5 * TILE; c.y = 1.5 * TILE; } this.checkpoint(g);
    UI.msg('La persiana cae tras de ti. Estás en el vestíbulo. Busca un arma y explora: hay más de una salida… y una sola buena.', 10000); },

  // ----- Construcción de nivel y cambio de planta
  buildLevel(g, lvl, sv) {
    const p = g.player, D = R2_DATA(lvl); g.lvl = lvl; Level.build(lvl); g.eproj = []; g.pools = []; g.projectiles = g.projectiles || []; p.jacket = '#2f3a33'; p.hidden = false; this.q = this.q || [];
    const I = (id, type, tx, ty, x) => Object.assign({ id, type, x: tx * TILE + 16, y: ty * TILE + 16 }, x || {});
    g.items = D.items.map(a => I(a[0], a[1], a[2], a[3], a[4])); g.enemies = D.enemies.map(a => new Enemy(a[1], a[2] * TILE + 16, a[3] * TILE + 16, a[0])); g.boss = null; g.boss2 = null; g.curBoss = null; g.crystals = [];
    g.barrels = (D.barrels || []).map(([x, y]) => ({ x: x * TILE + 16, y: y * TILE + 16, dead: false, mine: false }));
    const sp = g.arrive || D.spawn; p.x = (sp[0] + .5) * TILE; p.y = (sp[1] + .5) * TILE; g.arrive = null; g.squad = null; g.custodio = null; g.carn = null; p.knx = p.kny = 0;
    const open = sv && sv.lvl === lvl ? sv.doors : (g.story.doors || {})[lvl]; (open || []).forEach(id => { const d = Level.doors.find(d => d.id === id); if (d) Level.openDoor(d); });
    if (sv && sv.lvl === lvl) (sv.drops || []).forEach(d => g.items.push(d));
    g.items = g.items.filter(i => !g.picked.has(i.id) || i.fixed); g.enemies.forEach(e => { if (g.killed.has(e.id)) { e.dead = true; g.bodies.push({ x: e.x, y: e.y, a: e.face }); } });
    if (lvl === 'mansion') g.squad = g.story.squadAlive === false ? null : [new Squadmate('Rojas', p.x - 24, p.y + 18, '#4a5a3a'), new Squadmate('Dunn', p.x + 24, p.y + 22, '#3a4a5a'), new Squadmate('Ibarra', p.x, p.y + 34, '#5a3a3a')];
    else {
      const c = g.carn = new Carnicero(900, 1.5 * TILE, 1.5 * TILE); /* dormido dentro del muro: las balas no lo alcanzan */ g.enemies.push(c);
      if (lvl === 'hospitalb') { g.boss = c; c.intro = ['El garaje huele a hierro y a sangre vieja.', 'El Carnicero no corre. Sabe que no hay otra salida.']; }
      if (g.killed.has(900)) { c.dead = true; g.pz['h:boss'] = true; const d = Level.doors.find(d => d.id === 'exit'); if (d) Level.openDoor(d); this.bossDrops(g); }
      else if (g.story.carnActive) g.carnT = sv ? 15 : 20;
      if (g.pz['h:power']) { const d = Level.doors.find(d => d.id === 'garage'); if (d) Level.openDoor(d); }
    }
  },
  goto(g, to, at) {
    const s = g.story; s.doors = s.doors || {}; s.doors[g.lvl] = Level.doors.filter(d => d.open).map(d => d.id); const c = g.carn, hunting = c && !c.dormant && c.hunt;
    g.arrive = at; this.buildLevel(g, to, null); const p = g.player; g.cam.x = p.x - g.cv.width / 2; g.cam.y = p.y - g.cv.height / 2; if (s.carnActive) g.carnT = hunting ? 6 : 22; Sound.play('door'); this.checkpoint(g);
  },
  wakeCarn(g, quiet) { // coloca al Carnicero en un punto de patrulla lejano y alcanzable de esta planta
    const c = g.carn, p = g.player; if (!c || c.dead || !c.dormant && !quiet) return; const P = R2_DATA(g.lvl).patrol || []; let best = null, bd = -1;
    for (const [x, y] of P) { const d = Math.hypot(x * TILE - p.x, y * TILE - p.y); if (d > 380 && d > bd && Nav.reachable(x * TILE + 16, y * TILE + 16, p.x, p.y)) { bd = d; best = [x, y]; } } if (!best && P.length) best = P[0]; if (!best) return;
    c.dormant = false; c.x = best[0] * TILE + 16; c.y = best[1] * TILE + 16; c.state = 'patrol'; c.path = null; c.hunt = false; c.r = 14; if (!quiet) { UI.msg('Metal arrastrándose en alguna parte… Escucha. Cierra puertas. No hagas ruido.', 6500); Sound.tone(60, 1.2, .3, 'sawtooth'); } },
  bossDrops(g) { if (!g.picked.has('hbs') && !g.items.some(i => i.id === 'hbs')) g.items.push({ id: 'hbs', type: 'sample', x: 60 * TILE, y: 41 * TILE }); },
  endPhase1(g) {
    if (g.state !== 'play') return; g.state = 'end'; Sound.stopAmbient(); const m = Math.max(0, g.mut.owned.size - 1), hum = Trees.count(g.mut, 'hum'), mut = Trees.count(g.mut, 'mut');
    UI.$('endH').textContent = 'FIN DE LA FASE 1'; UI.$('endS').textContent = 'Próximo destino: el Museo de Historia Natural';
    UI.$('endB').textContent = 'Axel V. sale del hospital de San Gabriel. El Carnicero ha caído. El Custodio observa desde algún sitio.\n\nLa nota apunta al Museo de Historia Natural, Sala 3. Ahí empieza la Fase 2.\n\nDocumentos: ' + g.inv.docs.length + ' · Mutaciones: ' + m + '\nCamino: Humanidad ' + hum + ' · Mutación ' + mut + '\n\nGracias por probar RIUTEX 2 (Fase 1).'; UI.screen('end'); },

  // ----- Objetos fijos
  label(it) { const t = it.type; if (t === 'h_hide') return Game.player.hidden ? 'Salir del escondite' : 'Esconderte'; if (t === 'h_cab') return 'Abrir armario de fármacos'; if (t === 'h_safe') return 'Abrir caja fuerte del director'; if (t === 'h_gen') return 'Generador del garaje'; if (t === 'h_clock') return 'Examinar el reloj'; if (t === 'h_vial') return 'Coger el frasco'; if (t === 'h_stairs') return it.to === 'hospital' ? 'Bajar' : it.to === 'hospital1' ? 'Subir' : 'Bajar al sótano'; return t; },
  use(g, it) {
    const p = g.player, s = g.story;
    if (it.type === 'h_hide') { if (p.hidden) { p.hidden = false; return UI.msg('Sales del escondite.', 1500); } p.hidden = true; p.x = it.x; p.y = it.y; p.knx = p.kny = 0; return UI.msg('Te escondes. Quieto: no te ve. E para salir.', 3500); }
    if (it.type === 'h_clock') return g.pz.h_clock ? UI.msg('El reloj marca las 3:40.') : Puzzles.pad(g, 'h_clock', 4, 'RELOJ · HORA (4 cifras, HHMM)');
    if (it.type === 'h_vial') return this.finale(g);
    if (it.type === 'h_cab') return g.pz.h_cab ? UI.msg('El armario está vacío.') : Puzzles.pad(g, 'h_cab', 4, 'ARMARIO DE FÁRMACOS · 4 cifras');
    if (it.type === 'h_safe') return g.pz.h_safe ? UI.msg('La caja fuerte está vacía.') : Puzzles.pad(g, 'h_safe', 4, 'CAJA DEL DIRECTOR · MES-DÍA');
    if (it.type === 'h_stairs') { if (it.need && !g.inv.keys.includes(it.need)) return UI.msg('La escalera está cerrada: necesitas '+KEYS[it.need]+'.', 4000); return this.goto(g, it.to, it.at); }
    if (it.type === 'h_gen') {
      if (g.pz['h:power']) return UI.msg('El generador ya funciona.'); const need = ['fusible_a', 'fusible_b'], have = need.filter(k => g.inv.keys.includes(k));
      if (have.length < 2) return UI.msg('Generador: llevas ' + have.length + '/2 fusibles. Fusible A: Morgue (planta baja). Fusible B: Quirófano (primer piso).', 6000);
      g.pz['h:power'] = true; g.inv.keys = g.inv.keys.filter(k => !need.includes(k)); const d = Level.doors.find(d => d.id === 'garage'); if (d) Level.openDoor(d); g.cam.shake = 10; g.ring(p.x, p.y, 240, '#6ab0ff'); Sound.play('door'); UI.msg('El generador ruge. La persiana del garaje se levanta al este. Prepárate.', 7000);
    }
  },
  solved(g, id) {
    if (id === 'h_cab') { g.inv.keys.push('morgue'); g.inv.add('inj_green'); UI.msg('ARMARIO: llave de la Morgue e inyección verde. Un informe menciona equipo confiscado por Seguridad.', 8000); }
    else if (id === 'h_safe') { g.inv.keys.push('garaje'); Workshop.rewardMaterials(g,'screw_large',2); UI.msg('CAJA DEL DIRECTOR: llave de la rampa del garaje y piezas para la mesa de mejoras. El subfusil fue trasladado a Aislamiento.', 8000); }
    else if (id === 'h_clock') this.clockSolved(g);
  },
  drawItem(ctx, i) {
    const G = Game;
    if (i.type === 'h_hide') { ctx.fillStyle = '#4a5258'; ctx.fillRect(-11, -14, 22, 28); ctx.fillStyle = '#2a3036'; ctx.fillRect(-1, -14, 2, 28); for (let k = 0; k < 4; k++) ctx.fillRect(-8, -9 + k * 3, 6, 1); ctx.fillStyle = G.player.hidden ? '#40e060' : '#8a8a90'; ctx.fillRect(4, 0, 3, 5); return true; }
    if (i.type === 'h_cab' || i.type === 'h_safe') { ctx.fillStyle = i.type === 'h_safe' ? '#4a4a50' : '#6a7a76'; ctx.fillRect(-12, -14, 24, 28); ctx.fillStyle = '#2a3a36'; ctx.fillRect(-9, -11, 18, 10); ctx.fillStyle = G.pz[i.type] ? '#40e060' : '#e04030'; ctx.fillRect(-6, 4, 12, 5); return true; }
    if (i.type === 'h_gen') { ctx.fillStyle = '#4b5148'; ctx.fillRect(-14, -12, 28, 24); ctx.fillStyle = '#c0a030'; ctx.fillRect(-14, -12, 28, 4); ctx.fillStyle = G.pz['h:power'] ? '#40e060' : '#e04030'; ctx.fillRect(-9, -3, 18, 6); return true; }
    if (i.type === 'h_clock') { ctx.fillStyle = '#4a3220'; ctx.fillRect(-9, -14, 18, 28); ctx.fillStyle = G.pz.h_clock ? '#40e060' : '#e0c080'; ctx.beginPath(); ctx.arc(0, -5, 6, 0, 6.283); ctx.fill(); return true; }
    if (i.type === 'h_vial') { ctx.fillStyle = '#7aa0c0'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#0a1a2a'; ctx.fillRect(-9, -9, 18, 18); ctx.shadowColor = '#50baff'; ctx.shadowBlur = 12; ctx.fillStyle = '#50baff'; ctx.fillRect(-3, -7, 6, 14); ctx.shadowBlur = 0; return true; }
    if (i.type === 'h_stairs') { ctx.fillStyle = '#3a3a3e'; ctx.fillRect(-14, -14, 28, 28); ctx.fillStyle = '#6a6a72'; for (let k = 0; k < 4; k++) ctx.fillRect(-12, -12 + k * 7, 24, 4); ctx.fillStyle = '#d0b050'; ctx.beginPath(); const up = i.to === 'hospital1'; ctx.moveTo(0, up ? -9 : 9); ctx.lineTo(-6, up ? 0 : 0); ctx.lineTo(6, 0); ctx.fill(); return true; }
    return false;
  },
  objective(g) {
    const k = g.inv.keys, s = g.story, pz = g.pz;
    if (g.lvl === 'mansion') { if (g.story.finale) return 'CORRE. No te dejes tocar.'; if (!pz.h_clock) return !k.includes('estudio') ? 'Registra la mansión con tu escuadrón. Hay una llave del estudio en el comedor.' : 'Entra al estudio (norte del salón): el reloj de Wren guarda algo. ¿A qué hora se paró?'; return 'El pasadizo se ha abierto tras el reloj. Entra.'; }
    switch (s.seq) { case 'wake': return 'Zafarte de las correas: pulsa E repetidamente.'; case 'room': return 'Sal de la habitación y sigue el pasillo.'; case 'run': return 'CORRE por el pasillo. (Shift) Fuerza la puerta si hace falta: mantén E.'; case 'cut': return 'INYECTA EL FRASCO: pulsa F.'; case 'healed': return 'Huye al vestíbulo. Usa Q para esquivar.'; }
    if (pz['h:boss']) return 'Sal del hospital por la puerta este del garaje.'; if (pz['h:power']) return 'Baja por la rampa al garaje. El Carnicero te espera.';
    const miss = []; if (!k.includes('sotano') && g.lvl !== 'hospitalb' && !g.story.sotanoOpen) miss.push('llave del sótano (cocina del hospital, ala este)'); if (!k.includes('fusible_a')) miss.push('fusible A (Morgue)'); if (!k.includes('fusible_b')) miss.push('fusible B (Quirófano, primer piso)'); if (!k.includes('garaje')) miss.push('llave de la rampa (caja del director)');
    if (!g.player.weapon) return 'Busca un arma en el vestíbulo.'; return 'Escapa por el garaje del sótano. Te falta: ' + (miss.join(', ') || 'colocar los fusibles en el generador del sótano') + '.';
  },
  tick(g, dt) {
    const p = g.player; if (g.state !== 'play') return; const s = g.story;
    if (this.q.length) { this.q[0][0] -= dt; if (this.q[0][0] <= 0) { UI.msg(this.q[0][1], 4500); this.q.shift(); } }
    if (g.lvl === 'mansion') return this.mansionTick(g, dt);
    const c = g.carn, room = this.roomAt(p), once = (k, f) => { if (!this.seen.has(k)) { this.seen.add(k); f(); } };
    // --- secuencia inicial (solo planta baja)
    if (g.lvl === 'hospital' && s.seq && s.seq !== 'free') {
      if (s.seq === 'wake') { if (Math.random() < dt * 1.5) Sound.noise(.15, .12, 300); }
      if (s.seq === 'room' && p.x > 22 * TILE && p.y < 10 * TILE && c) { s.seq = 'run'; c.dormant = false; c.scripted = true; c.hunt = true; c.state = 'chase'; c.x = 14.5 * TILE; c.y = 7.5 * TILE; c.r = 14; c.tgt = [p.x, p.y]; c.atkCd = 0; Sound.tone(50, 1.5, .35, 'sawtooth'); UI.msg('Algo viene por el pasillo. No te detengas.', 5000); }
      if (s.seq === 'healed') { const d = Level.doors.find(d => d.id === 'shutter'); if (d && !d.open && Math.hypot(52.5 * TILE - p.x, 20.5 * TILE - p.y) < 110) { Level.openDoor(d); Sound.play('door'); } if (p.y > 23 * TILE && p.x > 47 * TILE) this.lobbyReached(g); }
    }
    // --- ruido que oye el Carnicero
    const moving = g.keys.KeyW || g.keys.KeyA || g.keys.KeyS || g.keys.KeyD; let r = p.hidden || s.restrained ? 0 : p.running ? 230 : moving ? 95 : 0; if (p.flash > .03) r = Math.max(r, 420); if (p.slash > .1) r = Math.max(r, 220); if (g.mut.has('sigilo')) r *= SkillBalance.value(g,'sigilo',.65); g.noise = r > 0 ? { x: p.x, y: p.y, r } : null;
    // --- despertar y presencia del Carnicero
    if (g.lvl === 'hospital' && s.seq === 'free' && !s.carnActive && (this.doorOpen('lob_w') || this.doorOpen('lob_e'))) { s.carnActive = true; g.carnT = 14; }
    if (g.carnT > 0 && s.carnActive && c && c.dormant) { g.carnT -= dt; if (g.carnT <= 0) this.wakeCarn(g); }
    if (g.lvl === 'hospitalb' && g.pz['h:boss'] && p.x > 78 * TILE) return this.endPhase1(g);
    if (!c) return; if (c.dormant || c.dead || c.active) { const el = document.getElementById('tension'); if (el) el.style.opacity = 0; return; }
    const d = Math.hypot(c.x - p.x, c.y - p.y), el = document.getElementById('tension');
    if (d < 380) { this.hb -= dt; if (this.hb <= 0) { this.hb = .35 + d / 700; Sound.tone(52, .18, .3 * (1 - d / 380), 'sine'); } if (el) { el.style.opacity = Math.min(.95, 1 - d / 380); el.textContent = c.hunt ? 'TE ESTÁ CAZANDO' : 'CERCA'; } } else if (el) el.style.opacity = 0;
    if (room && !this.seen.has(room)) { const M = { 'Vestíbulo central': 'El vestíbulo. Dos alas, una escalera y unas puertas selladas desde fuera. No hay prisa… ya.', 'Capilla': 'La capilla. Aquí no entra.', 'Sala de descanso': 'Camillas limpias. Un lugar seguro para guardar.', 'Quirófano': 'Hay una bandeja de instrumental con un fusible.', 'Garaje': 'El garaje.' }; if (M[room]) { this.seen.add(room); UI.msg(M[room], 6000); } }
  }
};

// ---------- Enganches al motor ----------
(() => {
  const G = Game, W = Weapons, PP = Player.prototype;
  const _build = G.buildLevel; G.buildLevel = function (lvl, sv) { if (isR2lvl(lvl)) return Hospital.buildLevel(this, lvl, sv); return _build.call(this, lvl, sv); };
  const _start = G.start; G.start = function (load, sv) {
    let lvl; if (sv) lvl = sv.lvl; else if (load) { const sl = this.getSaveSlots().find(Boolean); lvl = sl ? sl.lvl : this.startLvl; } else lvl = this.startLvl; lvl = lvl || 'asylum'; Trees.use(isR2lvl(lvl) ? 'r2' : 'r1');
    if (!sv && !load) { try { const sl = this.getSaveSlots(); sl[3] = null; localStorage.setItem(SAVE_SLOTS_KEY, SaveCodec.encode(sl)); } catch (e) {} }
    this.carnT = 0; _start.call(this, load, sv); if (isR2()) { Hospital.q = []; if (this.lvl === 'mansion' && !this.story.intro) { this.story.intro = true; Hospital.introMansion(this); } } };
  const _upd = G.update; G.update = function (dt) { _upd.call(this, dt); if (isR2()) { Hospital.tick(this, dt); const p = this.player, m = Trees.count(this.mut, 'mut'); p.evo = Math.min(1, m / 10 + (this.story.armHealed ? .25 : 0)); } };
  const _obj = G.objective; G.objective = function () { return isR2() ? Hospital.objective(this) : _obj.call(this); };
  const _ok = G.doorOk; G.doorOk = function (d) { if (d.key && d.key.startsWith('h:')) return !!this.pz[d.key]; return _ok.call(this, d); };
  const _why = G.doorWhy; G.doorWhy = function (d) { const T = { 'h:power': 'Sin energía: el generador del sótano necesita 2 fusibles.', 'h:boss': 'La salida se abre cuando caiga el Carnicero.', 'h:shutter': 'Persiana cerrada.', 'h:forced': 'Atascada. Mantén E para forzarla.', 'h:sealed': 'Selladas desde fuera. No es por aquí.', 'h:front': 'No cede. Alguien la ha cerrado.', 'h:secret': 'No hay puerta aquí… todavía.' }; return T[d.key] || _why.call(this, d); };
  const _item = G.drawItem; G.drawItem = function (ctx, i) { ctx.save(); ctx.translate(i.x, i.y); const done = Hospital.drawItem(ctx, i); ctx.restore(); if (!done) _item.call(this, ctx, i); };
  const _lab = Puzzles.label; Puzzles.label = function (it) { return it.type.startsWith('h_') ? Hospital.label(it) : _lab.call(this, it); };
  const _use = Puzzles.use; Puzzles.use = function (g, it) { return it.type.startsWith('h_') ? Hospital.use(g, it) : _use.call(this, g, it); };
  const _sol = Puzzles.solve; Puzzles.solve = function (g, id) { if (id.startsWith('h_')) { g.pz[id] = true; Sound.play('door'); return Hospital.solved(g, id); } return _sol.call(this, g, id); };
  // E: zafarse de las correas / cerrar puertas abiertas
  const _int = G.interact; G.interact = function () { if (isR2()) { if (this.story.restrained) return Hospital.struggle(this); if (!this.nearItem() && !Level.nearDoor(this.player)) { const d = Hospital.nearOpenDoor(this.player); if (d) { if (Level.closeDoor(d)) { Sound.play('door'); return UI.msg('Puerta cerrada. Solo el Carnicero puede abrirla.', 1800); } return UI.msg('Algo bloquea la puerta.', 1500); } } } return _int.call(this); };
  const _prm = G.promptText; G.promptText = function () { if (isR2()) { const s = this.story; if (s.restrained) return '[E] Zafarte de las correas (' + s.struggle + '/12)'; if (!this.nearItem()) { const f = Level.doors.find(d => d.id === 'forced' && !d.open); if (f && Math.hypot(44.5 * TILE - this.player.x, 7.5 * TILE - this.player.y) < 64) return 'Mantén [E]: forzar la puerta (' + Math.round(Math.min(1, (s.force || 0) / 1.2) * 100) + '%)'; if (!Level.nearDoor(this.player)) { const d = Hospital.nearOpenDoor(this.player); if (d) return '[E] Cerrar puerta'; } } } return _prm.call(this); };
  const _inj = G.useInj; G.useInj = function () { if (isR2() && this.story.armCut && !this.story.armHealed && this.state === 'play') return Hospital.inject(this); return _inj.call(this); };
  // inyectar muestra en R2: la muestra da EXP directa (no hay fases)
  const _sam = G.injectSample; G.injectSample = function () { if (isR2()) { if (this.inv.samples <= 0) return UI.msg('No tienes muestras.'); this.inv.remove('sample'); this.player.xp += R2_XP.sample; this.story.riutexUsed++; this.fxInject('#38a9ff'); UI.msg('Muestra absorbida: +' + R2_XP.sample + ' EXP.', 3500); return UI.renderTree(this); } return _sam.call(this); };
  // tras morir, "Reintentar" carga el último punto de control (autoguardado)
  const _init = G.init; G.init = function () { _init.call(this); const $ = id => document.getElementById(id), g = this;
    if ($('bNew')) $('bNew').onclick = () => { Sound.unlock(); g.startLvl = 'mansion'; g.start(false); }; if ($('bLegacy')) $('bLegacy').onclick = () => { Sound.unlock(); g.startLvl = 'asylum'; g.start(false); };
    if ($('bRetry')) $('bRetry').onclick = () => { Sound.unlock(); const cp = g.getSaveSlots()[3]; if (isR2() && cp) g.start(false, cp); else g.start(g.hasSave()); }; };
  // brazo cortado: sin golpe, puntería floja y recarga lenta (solo hasta inyectarte)
  const cut = () => G.story && G.story.armCut && !G.story.armHealed;
  const _fire = W.fire; W.fire = function (g, p) { if (cut()) { p.spreadAdd = Math.max(p.spreadAdd, .1); p.stamina = Math.max(0, p.stamina - 5); } const sn = p.sniper > 0; if (sn) { p.mods.pow += 6; p.sniper = 0; } try { return _fire.call(this, g, p); } finally { if (sn) p.mods.pow -= 6; } };
  const _rel = W.reload; W.reload = function (p) { const was = p.reloading; _rel.call(this, p); if (cut() && p.reloading > 0 && was <= 0) p.reloading *= 1.8; };
  const _mel = PP.melee; PP.melee = function (g) { if (cut()) return UI.msg('Te falta un brazo.', 1500); return _mel.call(this, g); };
  const _pu = PP.update; PP.update = function (dt, g) { if (this.hidden || (g.story && g.story.restrained)) { this.hurtFlash = Math.max(0, this.hurtFlash - dt); this.fireCd = Math.max(0, this.fireCd - dt); g.mouse.clicked = false; g.mouse.rclick = false; this.stamina = Math.min(this.maxStamina||100, this.stamina + 6 * dt); if (!this.hidden) this.angle = Math.atan2(g.mouse.y + g.cam.y - this.y, g.mouse.x + g.cam.x - this.x); return; } _pu.call(this, dt, g); };
  const _pd = PP.draw; PP.draw = function (ctx) {
    if (G.squad) G.squad.forEach(s => s.draw(ctx)); if (G.custodio) drawCustodio(ctx, G.custodio); if (this.hidden) return;
    if (G.story && G.story.restrained) { ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = '#6a7478'; ctx.fillRect(-18, -12, 36, 24); ctx.fillStyle = '#8a9498'; ctx.fillRect(-18, -12, 36, 4); ctx.fillStyle = '#2a2420'; ctx.fillRect(-4, -14, 3, 28); ctx.fillRect(8, -14, 3, 28); ctx.restore(); }
    _pd.call(this, ctx); if (!G.story) return; ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);
    if (G.story.armCut && !G.story.armHealed) { ctx.fillStyle = '#a01010'; ctx.fillRect(3, 4, 7, 6); } else if (G.story.armHealed) { ctx.fillStyle = '#6a3fa0'; ctx.fillRect(4, 5, this.weapon ? 12 : 8, 4); ctx.fillStyle = '#c090ff'; ctx.fillRect(6, 6, 6, 1); }
    ctx.restore(); };
  const _hurt = PP.hurt; PP.hurt = function (dmg, a, g) { if (this.hidden) return; if (g.mut.has('chaleco')) dmg *= SkillBalance.value(g,'chaleco',.8); return _hurt.call(this, dmg, a, g); };
  // enemigos nuevos: accesorios reconocibles
  const _ed = Enemy.prototype.draw; Enemy.prototype.draw = function (ctx) {
    _ed.call(this, ctx); const t = this.type; if (!['enfermera', 'camillero', 'hinchado', 'cirujano', 'sonambulo', 'rastrero'].includes(t) || this.dead || (this.def.latent && !this.alert)) return;
    ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.face); if (t === 'enfermera') { ctx.fillStyle = '#f0f0f0'; ctx.fillRect(-1, -6, 6, 12); ctx.fillStyle = '#c02030'; ctx.fillRect(1, -1, 2, 2); } else if (t === 'camillero') { ctx.fillStyle = '#9aa4ac'; ctx.fillRect(10, -13, 18, 26); ctx.fillStyle = '#6a7078'; ctx.fillRect(12, -11, 14, 22); } else if (t === 'hinchado') { ctx.fillStyle = 'rgba(190,170,70,.75)'; ctx.beginPath(); ctx.arc(-2, 0, 15, 0, 6.283); ctx.fill(); ctx.fillStyle = '#6a5a20'; ctx.beginPath(); ctx.arc(-6, -5, 4, 0, 6.283); ctx.fill(); } else if (t === 'cirujano') { ctx.fillStyle = '#3a6a5a'; ctx.fillRect(2, -7, 8, 14); ctx.fillStyle = '#d0e0e0'; ctx.fillRect(10, -8, 10, 2); } else if (t === 'sonambulo') { ctx.fillStyle = '#dcd4c8'; ctx.fillRect(-6, -9, 8, 18); } ctx.restore(); };
  // Bajas pequeñas y progresivas; sin multiplicador ni premios aleatorios enormes.
  // def.xp también identifica élites para el botín: sus valores originales se conservan.
  const _xp = mutationXPReward; mutationXPReward = function (d, b, m) {
    if (!isR2()) return _xp(d, b, m);
    const weight = Math.max(1, Number(d?.xp) || 10), lvl = Game.lvl,
      stage = /^(hospitalumbra|hospitalorigin|hospitalstreet)$/.test(lvl) ? 3
        : /^(hospitalcells|hospitalcastle|hospitalcastle1|hospitalroyal)$/.test(lvl) ? 2
        : /^(hospitalworks|hospitalpit|hospitalnest)$/.test(lvl) ? 1 : 0;
    const reward = b ? Math.max(6, Math.round(weight * .045))
      : weight <= 12 ? 1 : Math.max(1, Math.round(weight / 45 + stage * .65));
    return Math.max(1, Math.round(reward * (1 + ((m && m.mod('xp')) || 0))));
  };
  // medicina de campaña (humanidad): las inyecciones verdes curan 50 % más
  const _iu = Inventory.prototype.use; Inventory.prototype.use = function (g) { let ix = this.sel; if (ix < 0) ix = this.items.findIndex(o => ITEMS[o.type].use); const it = this.items[ix], t = it && it.type, hp0 = g.player.hp; _iu.call(this, g); if (t === 'inj_green' && g.mut.has('medico') && g.player.hp > hp0) g.player.hp = Math.min(g.player.maxHp, g.player.hp + (g.player.hp - hp0) * SkillBalance.value(g,'medico',.5)); };
  window.addEventListener('load', () => { const h = document.getElementById('hud'); if (h && !document.getElementById('tension')) { const t = document.createElement('div'); t.id = 'tension'; h.appendChild(t); } });
})();
