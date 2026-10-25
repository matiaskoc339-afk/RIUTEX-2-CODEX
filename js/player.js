// Issac Wilson: movimiento, apuntado, estamina, armas y daño.
class Player {
  constructor(x, y) {
    Object.assign(this, { x, y, r: 10, hp: 100, maxHp: 100, stamina: 100, maxStamina:100, tired: false, angle: 0, xp: 0, invuln: 0, hurtFlash: 0,
      weapon: null, fireCd: 0, reloading: 0, reloadDuration: 0, reloadWeaponId: '', spreadAdd: 0, flash: 0, running: false, stepT: 0, focus: 0, weapons: {}, mods: { mag: 0, pow: 0, prec: 0, rate: 0, mask: 0 }, poison: 0, resist: 0, energy: 100, maxEnergy: 100, blade: 0, sense: 0, over: 0, dashT: 0, dashVx: 0, dashVy: 0, meleeCd: 0, slash: 0, slashR: 42, lastCd: 0, regenPool: 24, evo: 0, knx: 0, kny: 0, walkT: 0 });
  }
  update(dt, g) {
    this.exertion=Math.max(0,(this.exertion||0)-dt);
    const k = g.keys;
    if (typeof FirstPerson !== 'undefined' && FirstPerson.active(g)) FirstPerson.sync(g);
    else this.angle = Math.atan2(g.mouse.y + g.cam.y - this.y, g.mouse.x + g.cam.x - this.x);
    let dx = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), dy = (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0);
    if (typeof FirstPerson !== 'undefined' && FirstPerson.active(g)) { const move = FirstPerson.vector(dx, dy, g); dx = move.x; dy = move.y; }
    const len = Math.hypot(dx, dy); if (len) { dx /= len; dy /= len; } // normalizado: no es más rápido en diagonal
    const wantRun = (k.ShiftLeft || k.ShiftRight) && len > 0 && !this.tired;
    this.running = wantRun && this.stamina > 0;
    if (this.running) { this.stamina -= 23 * (g.mut.has('adrenalina') ? SkillBalance.value(g,'adrenalina',.6) : 1) * dt; if (this.stamina <= 0) { this.stamina = 0; this.tired = true; } }
    else { this.stamina = Math.min(this.maxStamina||100, this.stamina + (this.exertion>0?0:19) * (1 + g.mut.mod('stam')) * dt); if (this.tired && this.stamina > 30) this.tired = false; }
    const fl = Level.fluidAt(this.x, this.y); if (fl === 2) this.addPoison(dt * 1.5); if (this.poison > 0) { this.poison -= dt; this.hp = Math.max(1, this.hp - (this.mods.mask ? 1.2 : 2.5) * dt * (typeof ProtectionSuit !== 'undefined' ? ProtectionSuit.poisonDamage(g) : 1)); } // el veneno no mata: te deja a 1
    const sp = (this.running ? 215 : 135) * dt * (1 + g.mut.mod('speed')) * (fl === 1 ? .65 : fl === 2 ? .7 : 1);
    if (this.dashT > 0) { this.dashT -= dt; Level.move(this, this.dashVx * dt, this.dashVy * dt); g.sparks(this.x, this.y, 2, '#38a9ff'); } else Level.move(this, dx * sp + this.knx * dt, dy * sp + this.kny * dt);
    this.knx *= Math.pow(0.002, dt); this.kny *= Math.pow(0.002, dt);
    if (len) { this.walkT += dt * (this.running ? 11 : 7); this.stepT -= dt; if (this.stepT <= 0) { Sound.play('step'); this.stepT = this.running ? .26 : .4; } }
    this.invuln = Math.max(0, this.invuln - dt); this.hurtFlash = Math.max(0, this.hurtFlash - dt); this.flash = Math.max(0, this.flash - dt);
    this.focus = Math.max(0, this.focus - dt); for (const k of ['blade', 'sense', 'over', 'meleeCd', 'slash', 'lastCd', 'resist']) this[k] = Math.max(0, this[k] - dt);
    // Regeneración de Riutex. Mantener cada instrucción fuera del comentario evita bloquear el ataque.
    this.energy = Math.min(this.maxEnergy, this.energy + (this.over > 0 ? 18 : 7.6) * (g.mut.has('sangrefria') ? SkillBalance.value(g,'sangrefria',1.6) : 1) * (1 + g.mut.mod('eregen')) * dt);
    this.regenPool = Math.min(g.mut.has('metabolismo') ? 40 : 24, this.regenPool + .4 * dt);
    if (g.mouse.rclick) { g.mouse.rclick = false; this.melee(g); }
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.spreadAdd = Math.max(0, this.spreadAdd - 0.12 * dt);
    if (this.reloading > 0) {
      if (this.reloadWeaponId && this.reloadWeaponId !== this.weapon?.id) { this.reloading = 0; this.reloadDuration = 0; this.reloadWeaponId = ''; }
      else { this.reloading = Math.max(0, this.reloading - dt); if (this.reloading <= 0) Weapons.finishReload(this); }
    }
    const wp = this.weapon;
    if (wp && this.reloading <= 0 && this.fireCd <= 0 && (g.mouse.clicked || (g.mouse.down && WEAPONS[wp.id].auto))) {
      if (wp.mag > 0) Weapons.fire(g, this); else { Sound.play('empty'); this.fireCd = .3; Weapons.reload(this); }
    }
    g.mouse.clicked = false;
  }
  addPoison(s) { if (this.resist > 0) return; this.poison = Math.min(12, this.poison + s * (this.mods.mask ? .5 : 1)); }
  melee(g) { // ataque cuerpo a cuerpo (clic derecho): consume bastante energía Riutex
    if (this.meleeCd > 0) return;
    const bl = this.blade > 0;
    const energyCost = bl ? 18 : 12; const resource = bl ? 'energy' : 'stamina'; // la cuchilla mutante cuesta aún más energía
    if (this[resource] < energyCost) { UI.msg(bl?'Energía Riutex insuficiente.':'Necesitas recuperar estamina para golpear.', 1800); return; }
    this[resource] = Math.max(0, this[resource] - energyCost);
    this.meleeCd = .5; this.slash = .15; this.slashR = bl ? 62 : 42;
    const dmg = 16 * (g.mut.has('fuerza') ? 2 : 1) * (bl ? 2 : 1) * (this.over > 0 ? 1.3 : 1) * (1 + g.mut.mod('melee'));
    for (const e of g.enemies) { if (e.dead) continue; const a = Math.atan2(e.y - this.y, e.x - this.x), d = Math.hypot(e.x - this.x, e.y - this.y);
      if (Level.los(this.x, this.y, e.x, e.y) && d < this.slashR + e.r && Math.abs(Math.atan2(Math.sin(a - this.angle), Math.cos(a - this.angle))) < 1.2) e.hurt(dmg, a, g); }
    Sound.play('enemyhit');
  }
  dodge(g, dist, dur) {
    const k = g.keys; let dx = (k.KeyD ? 1 : 0) - (k.KeyA ? 1 : 0), dy = (k.KeyS ? 1 : 0) - (k.KeyW ? 1 : 0);
    if (typeof FirstPerson !== 'undefined' && FirstPerson.active(g)) { const move = FirstPerson.vector(dx, dy, g); dx = move.x; dy = move.y; }
    if (!dx && !dy) { dx = Math.cos(this.angle); dy = Math.sin(this.angle); }
    const l = Math.hypot(dx, dy); this.dashVx = dx / l * dist / dur; this.dashVy = dy / l * dist / dur; this.dashT = dur; this.invuln = Math.max(this.invuln, dur + .15);
  }
  onKill(g) { // Regeneración de emergencia, con reserva limitada
    if (g.mut.has('sed')) this.energy = Math.min(this.maxEnergy, this.energy + 12);
    if (!g.mut.has('regen') || this.regenPool <= 0) return; const h = Math.min(g.mut.has('metabolismo') ? 6 : 4, this.regenPool, this.maxHp - this.hp); if (h <= 0) return; this.hp += h; this.regenPool -= h; g.sparks(this.x, this.y, 6, '#3fbf5a');
  }
  hurt(dmg, fromAngle, g) {
    if (this.invuln > 0 || this.hp <= 0) return; dmg *= 1.25; // dificultad: todo el daño recibido +25 %
    if (g.mut.has('piel')) dmg *= g.mut.has('blindada') ? 0.6 : SkillBalance.value(g,'piel',.75); if (typeof ProtectionSuit !== 'undefined') dmg = ProtectionSuit.absorb(g, dmg); this.hp -= dmg; if (g.mut.has('reactiva')) for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - this.x, e.y - this.y) < 75) e.hurt(20, Math.atan2(e.y - this.y, e.x - this.x), g); this.invuln = 0.65; this.hurtFlash = .3; this.knx = Math.cos(fromAngle) * 260; this.kny = Math.sin(fromAngle) * 260;
    g.cam.shake = 9; g.sparks(this.x, this.y, 8, '#a01010'); Sound.play('hurt'); UI.vignette();
    if (this.hp <= 0) {
      if (g.mut.has('ultimo') && this.lastCd <= 0) { this.hp = 1; this.invuln = 2.5; this.lastCd = 120; g.ring(this.x, this.y, 200, '#70d6ff'); g.cam.shake = 14; g.fxMutate(); UI.msg('ÚLTIMO RECURSO: el Riutex te mantiene con vida.', 4000); }
      else { this.hp = 0; g.die(); }
    }
  }
  draw(ctx) {
    if (this.invuln > 0 && Math.floor(this.invuln * 18) % 2) ctx.globalAlpha = .45;
    ctx.save(); ctx.translate(this.x, this.y); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(2, 3, 13, 11, 0, 0, 6.283); ctx.fill(); ctx.rotate(this.angle);
    const sw = Math.sin(this.walkT) * 3;
    ctx.fillStyle = '#2a2a3a'; ctx.fillRect(-4 + sw, -8, 9, 5); ctx.fillRect(-4 - sw, 3, 9, 5);          // piernas/pies
    ctx.fillStyle = this.hurtFlash > 0 ? '#d8d8d8' : (this.jacket || '#6b3b2a'); ctx.beginPath(); ctx.ellipse(0, 0, 7, 12, 0, 0, 6.283); ctx.fill(); // chaqueta
    ctx.fillStyle = '#c9a58a'; ctx.fillRect(4, -9, 10, 4); ctx.fillRect(4, 5, this.weapon ? 12 : 8, 4);   // brazos
    if (this.weapon) { const wid = this.weapon.id; ctx.fillStyle = wid === 'shotgun' ? '#6d5034' : wid === 'viper' ? '#3c5a42' : wid === 'rifle' ? '#596b7a' : wid === 'launcher' ? '#4a5941' : '#252a30'; ctx.fillRect(11, 2, wid === 'launcher' ? 22 : wid === 'rifle' ? 25 : wid === 'shotgun' ? 20 : 14, wid === 'launcher' ? 9 : 5); ctx.fillStyle = '#101216'; ctx.fillRect(17, 0, wid === 'shotgun' ? 14 : wid === 'rifle' ? 17 : wid === 'launcher' ? 10 : 8, 3); if (wid === 'viper') { ctx.fillStyle = '#171c20'; ctx.fillRect(13, 7, 5, 5); ctx.fillStyle = '#8da68b'; ctx.fillRect(20, 3, 5, 2); } else if (wid === 'shotgun') { ctx.fillStyle = '#b28b57'; ctx.fillRect(12, 6, 8, 3); } else if (wid === 'rifle') { ctx.fillStyle = '#9da9b0'; ctx.fillRect(19, -1, 8, 2); ctx.fillRect(24, 0, 5, 2); } else if (wid === 'launcher') { ctx.fillStyle = '#c0a76b'; ctx.fillRect(14, 7, 12, 3); } if (this.flash > 0) { ctx.fillStyle = '#ffe9a0'; ctx.beginPath(); ctx.arc(wid === 'launcher' ? 37 : 31, 5, 7, 0, 6.283); ctx.fill(); } }
    ctx.fillStyle = '#c9a58a'; ctx.beginPath(); ctx.arc(1, 0, 6, 0, 6.283); ctx.fill(); ctx.fillStyle = '#1c1410'; ctx.beginPath(); ctx.arc(-1, 0, 6, 1.6, 4.7); ctx.fill(); // cabeza y pelo
    const ev = this.evo || 0; // evolución visible: venas, hombreras, garras, aura, cuchilla
    if (this.blade > 0 || this.over > 0) { ctx.fillStyle = 'rgba(150,60,230,.2)'; ctx.beginPath(); ctx.arc(0, 0, 23, 0, 6.283); ctx.fill(); }
    if (ev > 0) { ctx.strokeStyle = 'rgba(170,90,255,' + (.35 + ev * .65) + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(4, -6); ctx.lineTo(12, -8); ctx.moveTo(-4, 9); ctx.lineTo(4, 6); ctx.lineTo(10, 8); ctx.moveTo(-3, -3); ctx.lineTo(0, 3); ctx.stroke(); }
    if (ev > .3) { ctx.fillStyle = '#4a2a6a'; ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(2, -18); ctx.lineTo(5, -11); ctx.moveTo(-3, 12); ctx.lineTo(2, 18); ctx.lineTo(5, 11); ctx.fill(); }
    if (ev > .6) { ctx.fillStyle = '#38a9ff'; ctx.fillRect(14, -9, 6, 2); ctx.fillRect(14, 7, 6, 2); }
    if (this.blade > 0) { ctx.fillStyle = '#70d6ff'; ctx.beginPath(); ctx.moveTo(12, -11); ctx.lineTo(48, -6); ctx.lineTo(12, -6); ctx.fill(); }
    if (this.slash > 0) { ctx.strokeStyle = 'rgba(220,180,255,' + this.slash * 6 + ')'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, this.slashR, -1.2, 1.2); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
}
