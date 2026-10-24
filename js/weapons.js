// Definiciones de armas y disparo por hitscan. Añadir un arma = añadir una entrada a WEAPONS.
const WEAPONS = {
  pistol: { name: 'Pistola M9', mag: 12, dmg: 25, rate: 0.28, spread: 0.035, recoil: 2.2, reload: 1.3, range: 620, pellets: 1, auto: false, stam: 6, reserveMax: 60 },
  shotgun: { name: 'Escopeta M12', mag: 6, dmg: 12, rate: 0.85, spread: 0.13, recoil: 6, reload: 2.4, range: 340, pellets: 8, auto: false, stam: 18, reserveMax: 30 },
  viper: { name: 'Subfusil Viper', mag: 30, dmg: 9, rate: 0.08, spread: 0.07, recoil: 1.2, reload: 1.9, range: 480, pellets: 1, auto: true, stam: 3, reserveMax: 150 },
  rifle: { name: 'Rifle de precisión', mag: 5, dmg: 70, rate: 1.1, spread: 0.004, recoil: 8, reload: 2.6, range: 900, pellets: 1, auto: false, stam: 22, reserveMax: 30 },
  launcher: { name: 'Lanzagranadas', mag: 1, dmg: 0, rate: .9, spread: .02, recoil: 7, reload: 2.2, range: 600, pellets: 1, auto: false, stam: 28, grenade: true, reserveMax: 12 }
};
const Weapons = {
  effective(p, id) { return WEAPONS[id]; },
  staminaCost(g,p,w) { return (w.stam || 6) * .55 * Math.pow(.85,p.mods.steady||0) * (p.focus>0?.5:1); },
  magSize(p, w) { return w.grenade ? w.mag : w.mag + 4 * p.mods.mag; }, // mejora: cargador extendido
  fire(g, p) {
    const w = Weapons.effective(p,p.weapon.id);
    if (w.flame) return Flamethrower.fire(g,p,w);
    const effort = Weapons.staminaCost(g,p,w);
    if (isR2lvl(g.lvl) && p.stamina < effort) { p.fireCd=.2; if((p.exertionNotice||0)<=g.t){UI.msg('Sin aliento para disparar. Busca cobertura y recupera estamina.',1600);p.exertionNotice=g.t+2;} return false; }
    p.weapon.mag--; p.fireCd = w.rate * Math.pow(.85, p.mods.rate || 0);
    const wob = Math.max(0, 1 - p.stamina / 30) * (w.stam || 6) * .012; // sin aliento la puntería se descontrola (más con armas pesadas)
    p.stamina = Math.max(0, p.stamina - effort); if (p.stamina <= 0) p.tired = true; if(isR2lvl(g.lvl))p.exertion=1.1; p.spreadAdd = Math.min(0.12, p.spreadAdd + 0.025); // disparar cansa: Issac no está entrenado
    const sp = (w.spread + (p.spreadAdd + (p.running ? 0.04 : 0) + wob) * (w.bloomFactor == null ? 1 : w.bloomFactor)) * (p.focus > 0 ? 0.35 : 1) * Math.pow(.75, p.mods.prec);
    if (w.grenade) { const a = p.angle + (Math.random() - .5) * 2 * sp; g.projectiles.push({ x: p.x + Math.cos(a) * 18, y: p.y + Math.sin(a) * 18, vx: Math.cos(a) * 430, vy: Math.sin(a) * 430, dmg: 0, damage: w.dmg * (1 + .3 * p.mods.pow) * (1 + g.mut.mod('gun')), life: 1.0, grenade: true }); Level.move(p, -Math.cos(p.angle) * w.recoil, -Math.sin(p.angle) * w.recoil); g.cam.shake = Math.max(g.cam.shake, 5); Sound.play('shot'); return; }
    const ballistics = typeof POV3DBallistics !== 'undefined' && POV3DBallistics.active(g) ? POV3DBallistics : null;
    for (let k = 0; k < w.pellets; k++) {
      const a = p.angle + (Math.random() - .5) * 2 * sp, cx = Math.cos(a), cy = Math.sin(a);
      const ray = ballistics && ballistics.ray(g, p), horizontalScale = ray ? ray.horizontalScale : 1;
      let x = p.x + cx * 18 * horizontalScale, y = p.y + cy * 18 * horizontalScale, dist = 0, hit = null;
      while (dist < w.range && !hit) {
        x += cx * 5 * horizontalScale; y += cy * 5 * horizontalScale; dist += 5;
        const height = ray ? ballistics.height(ray, dist) : 0;
        if (ray ? ballistics.solid(x, y, height, g) : Level.solid(x, y)) { g.sparks(x, y, 5, '#ffd27a'); break; }
        const bb = (!ray || ballistics.hitsStatic('barrel', height)) && g.barrels.find(b => !b.dead && (b.x - x) ** 2 + (b.y - y) ** 2 < 140); if (bb) { g.explode(bb); break; } // barril explosivo
        const cr = (!ray || ballistics.hitsStatic('crystal', height)) && g.crystals.find(c => !c.dead && (c.x - x) ** 2 + (c.y - y) ** 2 < 220); if (cr) { cr.hp -= w.dmg || 20; g.sparks(cr.x, cr.y, 6, '#80e0ff'); if (cr.hp <= 0) g.breakCrystal(cr); break; } // cristal de suero (Lucía)
        for (const e of g.enemies) if (!e.dead && (!ray || ballistics.hitsEntity(e, height)) && (e.x - x) ** 2 + (e.y - y) ** 2 < e.r * e.r) { hit = e; break; }
      }
      g.tracers.push({ x1: p.x + cx * 18 * horizontalScale, y1: p.y + cy * 18 * horizontalScale, x2: x, y2: y, life: .07, ...(ray ? ballistics.trace(ray, dist) : {}) });
      if (hit) hit.hurt(w.dmg * (1 + .3 * p.mods.pow) * (1 + g.mut.mod('gun')), a, g);
    }
    Level.move(p, -Math.cos(p.angle) * w.recoil * (p.focus > 0 ? .4 : 1), -Math.sin(p.angle) * w.recoil * (p.focus > 0 ? .4 : 1));
    g.cam.shake = Math.max(g.cam.shake, 3); p.flash = .06;
    for (const e of g.enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 380 && !e.def.latent && !e.isBoss) e.alert = true; // el ruido atrae enemigos
    Sound.play('shot');
  },
  reload(p) {
    if (!p.weapon) return;
    const w = Weapons.effective(p,p.weapon.id);
    if (p.reloading > 0 || p.weapon.mag >= Weapons.magSize(p, w) || Game.inv.reserve(p.weapon.id) <= 0) return;
    p.reloading = w.reload * (p.focus > 0 ? .7 : 1) * (1 - Math.min(.5, Game.mut.mod('reload'))); Sound.play('reload');
  },
  finishReload(p) {
    if (!p.weapon) return; const w = Weapons.effective(p,p.weapon.id), n = Math.min(Weapons.magSize(p, w) - p.weapon.mag, Game.inv.reserve(p.weapon.id));
    Game.inv.takeAmmo(p.weapon.id, n); p.weapon.mag += n;
  }
};
