// Enemigos. ENEMY_TYPES define estadísticas; la IA es: reposo -> alerta/persecución -> ataque telegrafiado.
const ENEMY_TYPES = {
  vacio: { name: 'Vacío', hp: 80, speed: 58, dmg: 16, detect: 300, range: 26, cooldown: 1.2, xp: 25, small: true },
  trepador: { name: 'Trepador', hp: 45, speed: 135, dmg: 11, detect: 320, range: 22, cooldown: .8, xp: 20, small: true, r: 9, flank: true, color: '#8a9a7a' },
  latente: { name: 'Latente', hp: 100, speed: 66, dmg: 20, detect: 95, range: 26, cooldown: 1.2, xp: 30, small: true, latent: true, color: '#7a7a70' },
  bruto: { name: 'Bruto', hp: 220, speed: 44, dmg: 30, detect: 260, range: 36, cooldown: 1.8, xp: 60, small: false, r: 15, color: '#9a8f86' },
  aullador: { name: 'Aullador', hp: 50, speed: 72, dmg: 8, detect: 300, range: 24, cooldown: 1, xp: 35, small: true, howler: true, color: '#a8788a' },
  rata: { name: 'Rata mutante', hp: 22, speed: 150, dmg: 5, detect: 260, range: 18, cooldown: .6, xp: 10, small: true, r: 7, flank: true, poison: 2.5, color: '#6a5a50' },
  escupidor: { name: 'Sapo ácido', hp: 70, speed: 48, dmg: 10, detect: 340, range: 24, cooldown: 2.2, xp: 40, small: false, r: 12, spitter: true, color: '#7a9a50' },
  fundido: { name: 'Fundido', hp: 260, speed: 38, dmg: 26, detect: 230, range: 34, cooldown: 1.9, xp: 70, small: false, r: 16, poison: 4, cloud: 55, color: '#7a6a78' },
  soldado: { name: 'Soldado infectado', hp: 110, speed: 66, dmg: 9, detect: 380, range: 24, cooldown: 2.2, xp: 55, small: false, r: 12, color: '#6a7a5a', rng: { min: 150, max: 270, speed: 360, burst: 3, wind: .4, range: 340, bullet: true, spread: .12, gap: .13 } },
  cazador: { name: 'Cazador mutante', hp: 140, speed: 150, dmg: 22, detect: 360, range: 28, cooldown: 1.4, xp: 60, small: false, r: 12, flank: true, color: '#8a5a4a' },
  hoja: { name: 'Hoja', hp: 200, speed: 85, dmg: 28, detect: 320, range: 42, cooldown: 1.2, xp: 80, small: false, r: 14, color: '#8a6a70' },
  coloso: { name: 'Coloso blindado', hp: 380, speed: 46, dmg: 38, detect: 300, range: 40, cooldown: 1.9, xp: 120, small: false, r: 18, armor: .35, color: '#5a5a62' },
  torreta: { name: 'Torreta', hp: 90, speed: 0, dmg: 8, detect: 400, range: 0, cooldown: 1.3, xp: 30, small: false, r: 11, color: '#5a5a5e', turret: true, rng: { fixed: true, burst: 2, wind: .3, speed: 340, range: 400, bullet: true, spread: .06, gap: .15 } },
  prototipo: { name: 'Prototipo Delta', hp: 220, speed: 135, dmg: 26, detect: 380, range: 30, cooldown: 1.1, xp: 90, small: false, r: 13, flank: true, color: '#9a7ab0' },
  artillero: { name: 'Artillero mutante', hp: 150, speed: 70, dmg: 9, detect: 420, range: 24, cooldown: 2.6, xp: 80, small: false, r: 12, color: '#7a8aa0', rng: { min: 170, max: 300, speed: 380, burst: 5, wind: .35, range: 380, bullet: true, spread: .1, gap: .1 } },
  espectro: { name: 'Espectro', hp: 120, speed: 115, dmg: 24, detect: 420, range: 26, cooldown: 1.2, xp: 85, small: false, r: 11, flank: true, stealth: true, color: '#8a90c0' },
  regenerador: { name: 'Regenerador', hp: 320, speed: 62, dmg: 30, detect: 340, range: 36, cooldown: 1.5, xp: 110, small: false, r: 15, armor: .2, regen: 12, color: '#7aa090' },
  abominacion: { name: 'Abominación', hp: 480, speed: 74, dmg: 40, detect: 340, range: 46, cooldown: 1.6, xp: 160, small: false, r: 19, armor: .3, color: '#8a6a8a' }
};
class Enemy {
  constructor(type, x, y, id) {
    Object.assign(this, { type, def: ENEMY_TYPES[type], id, x, y, r: ENEMY_TYPES[type].r || 11, hp: ENEMY_TYPES[type].hp, mhp: ENEMY_TYPES[type].hp, lastHit: 9, alert: false, dead: false, stagger: 0, frozen: 0, cd: 0, windup: 0, shots: 0, shotT: 0, attackFace: 0, attackLocked: false, face: Math.random() * 6.28, t: Math.random() * 10, hitFlash: 0, grace: 0, path: null, pathClock: 0, heardId: 0, miState: 'idle', miMemory: 0, miVisible: false, miLastX: null, miLastY: null, miVx: 0, miVy: 0, miPlanT: 0, miHearT: 0, miGoalX: null, miGoalY: null, miSide: Number(id)%2 ? 1 : -1, miSearchStep: 0, miSearchWait: 0, miWasSearching: false, miSearchAngle: 0, miPathGoal: '' });
  }
  hurt(dmg, angle, g) {
    if (this.dead) return;
    this.hp -= dmg * (1 - (this.def.armor || 0)); this.stagger = .18; this.lastHit = 0; this.alert = true; this.windup = 0; this.hitFlash = .1;
    if (!(this.def.rng && this.def.rng.fixed)) Level.move(this, Math.cos(angle) * 9, Math.sin(angle) * 9); g.sparks(this.x, this.y, 7, '#7a0a14'); Sound.play('enemyhit');
    if (typeof MonsterIntelligence !== 'undefined' && MonsterIntelligence.enabled(this,g)) MonsterIntelligence.injured(this,angle,g);
    if (this.hp <= 0) this.die(g);
  }
  die(g) {
    if (this.dead) return;
    this.dead = true; g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.killed.add(this.id); if (!this.isBoss && g.dropCraftingMaterial) g.dropCraftingMaterial(this); Sound.play('enemydie');
    Level.decals.push({ x: this.x, y: this.y, r: 17, c: 'rgba(90,10,16,.6)' }); g.sparks(this.x, this.y, 18, '#6a0810'); g.bodies.push({ x: this.x, y: this.y, a: this.face }); if (this.def.cloud) g.pools.push({ x: this.x, y: this.y, r: this.def.cloud, life: 6 });
  }
  spitterAI(dt, g, d, dx, dy) { // ataque a distancia genérico: sapo ácido, soldados y torretas (def.rng ajusta distancia, ráfaga y proyectil)
    d = Math.max(1, d);
    const R = this.def.rng || { min: 130, max: 240, speed: 230, burst: 1, wind: .55, range: 280, poison: 3 };
    if (this.shots > 0) { if (this.attackLocked) this.face = this.attackFace; this.shotT -= dt; if (this.shotT <= 0) { const a = this.face + (Math.random() - .5) * (R.spread || 0); g.eproj.push({ x: this.x, y: this.y, vx: Math.cos(a) * R.speed, vy: Math.sin(a) * R.speed, life: 2.2, dmg: this.def.dmg, poison: R.poison || 0, bullet: !!R.bullet }); this.shots--; this.shotT = R.gap || .12; Sound.play('attack'); } return; }
    if (this.windup > 0) { if (this.attackLocked) this.face = this.attackFace; this.windup -= dt; if (this.windup <= 0) { this.shots = R.burst; this.shotT = 0; this.cd = this.def.cooldown; } return; }
    if (!R.fixed) { const sp = this.def.speed * dt; if (d < R.min) Level.move(this, -dx / d * sp, -dy / d * sp); else if (d > R.max) Level.move(this, dx / d * sp, dy / d * sp); }
    if (d < R.range && this.cd <= 0 && Level.los(this.x, this.y, g.player.x, g.player.y)) { this.windup = R.wind; this.attackFace = this.face; this.attackLocked = true; }
  }
  update(dt, g) {
    if (typeof MonsterIntelligence !== 'undefined' && MonsterIntelligence.enabled(this,g)) return MonsterIntelligence.generic(this,dt,g);
    if (this.dead) return; const p = g.player; this.t += dt; this.lastHit += dt; if (this.def.regen && this.lastHit > 2 && this.hp < this.mhp) this.hp = Math.min(this.mhp, this.hp + this.def.regen * dt); // el Regenerador se cura si no lo atacas
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    // Reanudar una sesión devuelve un aviso completo, no un golpe invisible ya terminado.
    if (this.grace > 0) { this.grace = Math.max(0, this.grace - dt); this.windup = 0; this.shots = 0; this.attackLocked = false; return; }
    const dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1;
    if (this.frozen > 0) { this.frozen -= dt; return; }
    if (this.stagger > 0) { this.stagger -= dt; return; }
    this.cd -= dt;
    const pov=typeof POVPerception!=='undefined'&&POVPerception.active(g),seen=pov?POVPerception.notice(this,g,dt):d<this.def.detect&&Level.los(this.x,this.y,p.x,p.y);
    if (this.def.latent && !this.alert && (pov?seen:d<this.def.detect)) { this.alert = true; this.stagger = .7; Sound.play('attack'); return; } // el Latente despierta
    if (seen) this.alert = true; else if (pov?!(this.povMemory>0):d>this.def.detect*2.2) this.alert = false;
    if (!this.alert) { this.windup = 0; this.shots = 0; this.attackLocked = false; return; }
    if (this.def.howler) { this.shriek = (this.shriek || 3) - dt; if (this.shriek <= 0) { this.shriek = 7; g.ring(this.x, this.y, 300, '#c04040'); Sound.play('attack'); for (const o of g.enemies) if (!o.dead && !o.isBoss && Math.hypot(o.x - this.x, o.y - this.y) < 420) o.alert = true; UI.msg('¡Un aullido atrae a los demás!', 2200); } } // el Aullador llama a los vecinos
    if (!this.attackLocked || (this.windup <= 0 && this.shots <= 0)) { this.face = Math.atan2(dy, dx); this.attackLocked = false; }
    if (this.def.spitter || this.def.rng) return this.spitterAI(dt, g, d, dx, dy);
    if (this.windup > 0) {
      this.windup -= dt;
      if (this.windup <= 0) {
        const a = Math.atan2(dy, dx), arc = Math.abs(Math.atan2(Math.sin(a-this.face), Math.cos(a-this.face)));
        if (d < this.def.range + 12 && arc < 1.25 && Level.los(this.x, this.y, p.x, p.y)) {
          const invuln = p.invuln; p.hurt(this.def.dmg, a, g);
          if (this.def.poison && p.invuln > invuln) p.addPoison(this.def.poison);
        }
        this.cd = this.def.cooldown; this.attackLocked = false;
      } return;
    }
    if (d < this.def.range && this.cd <= 0 && Level.los(this.x, this.y, p.x, p.y)) { this.windup = .38; this.attackFace = this.face; this.attackLocked = true; Sound.play('attack'); return; }
    if (d > this.def.range * .8) {
      const sp = this.def.speed * dt, ox = this.x, oy = this.y; const lat = this.def.flank ? Math.sin(this.t * 4 + this.id) * .9 : 0; Level.move(this, (dx / d - dy / d * lat) * sp, (dy / d + dx / d * lat) * sp);
      if (Math.hypot(this.x - ox, this.y - oy) < sp * .3) { const s = this.id % 2 ? 1 : -1; Level.move(this, -dy / d * sp * s, dx / d * sp * s); } // rodea obstáculos
    }
    for (const o of g.enemies) if (o !== this && !o.dead) { const ex = this.x - o.x, ey = this.y - o.y, ed = Math.hypot(ex, ey); if (ed > 0 && ed < this.r * 2) Level.move(this, ex / ed * 30 * dt, ey / ed * 30 * dt); }
  }
  draw(ctx) {
    ctx.save(); ctx.translate(this.x, this.y); if (this.def.stealth && this.windup <= 0 && Math.hypot(this.x - Game.player.x, this.y - Game.player.y) > 130) ctx.globalAlpha = .22; ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(2, 3, 13, 11, 0, 0, 6.283); ctx.fill();
    if (this.def.turret) { ctx.fillStyle = '#3a3a3e'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, 6.283); ctx.fill(); ctx.rotate(this.face); ctx.fillStyle = '#6a6a70'; ctx.fillRect(0, -3, 20, 6); ctx.fillStyle = this.alert ? '#ff3030' : '#503030'; ctx.fillRect(-4, -2, 4, 4); ctx.restore(); return; }
    if (this.def.latent && !this.alert) { ctx.fillStyle = '#4a4a44'; ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, this.face, 0, 6.283); ctx.fill(); ctx.fillStyle = '#5a1218'; ctx.fillRect(-3, -2, 7, 4); ctx.restore(); return; }
    const sc = Math.max(.8, this.r / 11); ctx.scale(sc, sc);
    ctx.rotate(this.face + (this.alert ? 0 : Math.sin(this.t * 1.5) * .15));
    const raise = this.windup > 0 ? 8 : 0, sw = Math.sin(this.t * 6) * 2;
    ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.frozen > 0 ? '#7a5aa0' : this.def.color || '#8b9086'; ctx.beginPath(); ctx.ellipse(0, 0, 8, 13, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#5a1a22'; ctx.beginPath(); ctx.ellipse(-2, 4, 4, 5, 0, 0, 6.283); ctx.fill();                       // heridas
    ctx.fillStyle = '#7c8176'; ctx.fillRect(3, -11, 12 + raise, 4); ctx.fillRect(3, 7, 12 + raise, 4);                      // brazos extendidos
    ctx.fillStyle = '#b8b0a0'; for (const yy of [-12, 10]) ctx.fillRect(15 + raise, yy, 4, 2);                               // garras
    ctx.fillStyle = '#9a9a8c'; ctx.beginPath(); ctx.arc(2 + sw * .3, 0, 6.5, 0, 6.283); ctx.fill();                          // cabeza
    ctx.fillStyle = this.alert ? '#ff2a2a' : '#4a2a2a'; ctx.fillRect(5, -3.5, 2, 2); ctx.fillRect(5, 1.5, 2, 2);             // ojos
    ctx.restore();
  }
}

// Jefe 1: El Carcelero. Embiste en línea recta (si choca con una pared queda aturdido y vulnerable); en fase 2 añade un golpe de área.
class Carcelero extends Enemy {
  constructor(id, x, y) {
    super('vacio', x, y, id); this.def = { name: 'El Carcelero', hp: 1000, speed: 84, dmg: 30, detect: 9999, range: 46, cooldown: 1.5, xp: 200, small: false };
    Object.assign(this, { hp: 1000, maxHp: 1000, r: 26, active: false, mode: 'chase', mt: 0, chargeCd: 3, slamCd: 5, dir: 0, isBoss: true });
  }
  hurt(dmg, angle, g) { if (this.dead) return; if (this.mode === 'stun') dmg *= 1.5; this.hp -= dmg; this.hitFlash = .08; this.active = true; g.sparks(this.x, this.y, 6, '#7a0a14'); Sound.play('enemyhit'); if (this.hp <= 0) this.die(g); }
  die(g) { this.dead = true; g.killed.add(this.id); g.player.xp += mutationXPReward(this.def, !!this.isBoss, g.mut); g.player.onKill(g); g.bodies.push({ x: this.x, y: this.y, a: 0 }); g.ring(this.x, this.y, 200, '#c2eeff'); g.cam.shake = 16; g.pz.boss = true; g.bossDrops(); UI.msg('El Carcelero cae. Algo brilla entre sus cadenas…', 6000); Sound.play('enemydie'); }
  update(dt, g) {
    if (this.dead || !this.active) return; const p = g.player, dx = p.x - this.x, dy = p.y - this.y, d = Math.hypot(dx, dy) || 1, ph2 = this.hp < this.maxHp / 2;
    this.t += dt; this.hitFlash = Math.max(0, this.hitFlash - dt); this.mt -= dt; this.face = Math.atan2(dy, dx);
    if (this.mode === 'stun') { if (this.mt <= 0) this.mode = 'chase'; return; }
    if (this.mode === 'windC') { if (this.mt <= 0) { this.mode = 'charge'; this.mt = 1.3; } return; }
    if (this.mode === 'charge') {
      const sp = 440 * dt, ox = this.x, oy = this.y; Level.move(this, Math.cos(this.dir) * sp, Math.sin(this.dir) * sp);
      if (Math.hypot(this.x - ox, this.y - oy) < sp * .5) { this.mode = 'stun'; this.mt = 1.8; g.cam.shake = 16; g.ring(this.x, this.y, 120, '#aaaaaa'); g.sparks(this.x, this.y, 20, '#888'); Sound.play('enemydie'); UI.msg('¡Se estrelló contra la pared! Dispárale ahora.', 2200); return; }
      if (d < this.r + p.r + 4) { p.hurt(38, this.dir, g); this.mode = 'chase'; this.chargeCd = 3.6; return; }
      if (this.mt <= 0) { this.mode = 'chase'; this.chargeCd = 3.6; } return;
    }
    if (this.mode === 'windS') { if (this.mt <= 0) { g.ring(this.x, this.y, 175, '#ff6060'); g.cam.shake = 12; if (d < 175) p.hurt(26, this.face, g); this.mode = 'chase'; this.slamCd = 4.5; } return; }
    if (this.mode === 'windM') { if (this.mt <= 0) { if (d < this.def.range + 18) p.hurt(this.def.dmg, this.face, g); this.cd = this.def.cooldown; this.mode = 'chase'; } return; }
    this.chargeCd -= dt; this.slamCd -= dt; this.cd -= dt;
    if (this.chargeCd <= 0 && d > 110) { this.mode = 'windC'; this.mt = .6; this.dir = this.face; return; }
    if (ph2 && this.slamCd <= 0 && d < 170) { this.mode = 'windS'; this.mt = .6; return; }
    if (d < this.def.range && this.cd <= 0) { this.mode = 'windM'; this.mt = .4; return; }
    if (d > this.def.range * .8) { const sp = this.def.speed * (ph2 ? 1.35 : 1) * dt; Level.move(this, dx / d * sp, dy / d * sp); }
  }
  draw(ctx) {
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.ellipse(4, 6, 32, 26, 0, 0, 6.283); ctx.fill();
    if (this.mode === 'windC' || this.mode === 'charge') { ctx.strokeStyle = 'rgba(255,60,60,.5)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(this.dir) * 400, Math.sin(this.dir) * 400); ctx.stroke(); }
    if (this.mode === 'windS') { ctx.strokeStyle = 'rgba(255,60,60,.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 175, 0, 6.283); ctx.stroke(); }
    ctx.rotate(this.face); ctx.fillStyle = this.hitFlash > 0 ? '#fff' : this.mode === 'stun' ? '#8a7a9a' : '#6a6458'; ctx.beginPath(); ctx.ellipse(0, 0, 24, 32, 0, 0, 6.283); ctx.fill();
    ctx.strokeStyle = '#2a2a30'; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(-20, i * 9); ctx.lineTo(20, i * 9 + 6); ctx.stroke(); }
    ctx.fillStyle = '#7a746a'; ctx.fillRect(10, -36, 26, 10); ctx.fillRect(10, 26, 26, 10); ctx.fillStyle = '#8a8478'; ctx.beginPath(); ctx.arc(6, 0, 12, 0, 6.283); ctx.fill(); ctx.fillStyle = '#ff3030'; ctx.fillRect(14, -5, 3, 3); ctx.fillRect(14, 3, 3, 3);
    ctx.restore();
  }
}

for (const k in ENEMY_TYPES) { const t = ENEMY_TYPES[k]; t.hp = Math.round(t.hp * 1.25); if (t.speed) t.speed = Math.round(t.speed * 1.1); t.detect = Math.round(t.detect * 1.15); } // dificultad: enemigos más resistentes, rápidos y atentos
