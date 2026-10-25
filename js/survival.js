// Fase 1 · v0.9: presión sonora, combate exigente y cuatro ramales opcionales.
const CombatPressure = {
  costs: { pistol: 12, shotgun: 28, viper: 5, rifle: 32, ak: 7, launcher: 36 },
  shotCost(g, p, w) {
    const base = w.stam || this.costs[p.weapon?.id] || 12;
    const skill = 1 / (1 + Math.max(0, g.mut.mod("effort"))),
      steady = Math.max(0.65, Math.pow(0.85, p.mods.steady || 0));
    return Math.max(
      base * 0.35,
      base *
        skill *
        steady *
        (p.focus > 0 ? 0.85 : 1) *
        (p.coverWindow > 0 ? SkillBalance.value(g,'cambio_guardia',.8) : 1),
    );
  },
  melee(g, p) {
    if (p.meleeCd > 0 || (g.story.armCut && !g.story.armHealed) || p.hidden)
      return false;
    const blade = p.blade > 0,
      infected = !!g.story.armHealed,
      field = infected ? "energy" : "stamina";
    const cost =
      (infected ? (blade ? 32 : 24) : 26) /
      (1 + Math.max(0, g.mut.mod("melee_effort")));
    if (p[field] < cost) {
      UI.msg(
        infected
          ? "Riutex insuficiente para golpear."
          : "Necesitas estamina para golpear.",
        1500,
      );
      return false;
    }
    p[field] -= cost;
    p.exertion = 1.1;
    p.meleeCd = blade ? 0.85 : 0.75;
    p.slash = 0.16;
    p.slashR = blade ? 54 : 40;
    p.cloak = 0;
    // La primera cuchilla ofrece alcance y un bono moderado; sus evoluciones llegan después.
    const mult = blade ? (g.mut.has("forma_acechador") ? 1.65 : SkillBalance.value(g,'brazo',1.25)) : 1;
    const dmg =
      16 *
      (g.mut.has("fuerza") ? SkillBalance.value(g,'fuerza',1.25) : 1) *
      mult *
      (1 + g.mut.mod("melee")) *
      (p.over > 0 ? 1.2 : 1);
    for (const e of g.enemies) {
      if (e.dead || e.dormant) continue;
      const a = Math.atan2(e.y - p.y, e.x - p.x),
        d = Math.hypot(e.x - p.x, e.y - p.y);
      if (
        d < p.slashR + e.r &&
        Level.los(p.x, p.y, e.x, e.y) &&
        Math.abs(Math.atan2(Math.sin(a - p.angle), Math.cos(a - p.angle))) <
          1.15
      )
        e.hurt(BossPressure.meleeDamage(e, dmg, blade), a, g);
    }
    Sound.play("enemyhit");
    return true;
  },
};
const AcousticPressure = {
  reset(g) {
    g.acoustic = { events: [], pending: null, cooldown: 0 };
  },
  emit(g, weight, x = g.player.x, y = g.player.y) {
    if (
      !g.lvl?.startsWith("hospital") ||
      g.story.seq !== "free" ||
      !g.story.armHealed ||
      g.carn?.active ||
      g.carn?.dead
    )
      return;
    const a = g.acoustic || (this.reset(g), g.acoustic);
    a.events = a.events.filter((n) => g.t - n.t <= 12);
    a.events.push({ t: g.t, w: weight });
    if (
      a.cooldown > 0 ||
      a.pending ||
      a.events.reduce((n, e) => n + e.w, 0) < 6
    )
      return;
    a.pending = { x, y, delay: 2.5, age: 0 };
    a.events = [];
    UI.msg("Demasiado ruido seguido. Algo responde desde otra ala…", 3400);
    Sound.tone(58, 0.7, 0.055, "triangle");
  },
  candidate(g, target) {
    const p = g.player,
      c = g.carn,
      limit = Math.max(640, Math.hypot(g.cv.width / 2, g.cv.height / 2) + 100),
      points = R2_DATA(g.lvl).patrol || [];
    const candidates = points
      .map(([x, y]) => [x * 32 + 16, y * 32 + 16])
      .filter(([x, y]) => {
        const tx = Math.floor(x / 32),
          ty = Math.floor(y / 32);
        return (
          Level.grid[ty]?.[tx] === 0 &&
          !Nav.safe(tx, ty) &&
          Math.hypot(x - p.x, y - p.y) >= limit &&
          !Level.los(x, y, p.x, p.y) &&
          !HorrorVision.visible.has(tx + "," + ty) &&
          (x < g.cam.x - 64 ||
            x > g.cam.x + g.cv.width + 64 ||
            y < g.cam.y - 64 ||
            y > g.cam.y + g.cv.height + 64)
        );
      })
      .sort(
        (a, b) =>
          Math.hypot(a[0] - target.x, a[1] - target.y) -
          Math.hypot(b[0] - target.x, b[1] - target.y),
      );
    for (const [x, y] of candidates) {
      const path = Nav.path(x, y, target.x, target.y);
      if (path && path.length >= 24) return { x, y, path };
    }
    return null; // Nunca se usa un punto cercano como alternativa.
  },
  investigate(g, target) {
    if (Nav.safe(Math.floor(target.x / 32), Math.floor(target.y / 32))) {
      const outside = (R2_DATA(g.lvl).patrol || [])
        .map(([x, y]) => ({ x: x * 32 + 16, y: y * 32 + 16 }))
        .filter(
          (q) =>
            !Nav.safe(Math.floor(q.x / 32), Math.floor(q.y / 32)) &&
            Level.grid[Math.floor(q.y / 32)]?.[Math.floor(q.x / 32)] === 0,
        )
        .sort(
          (a, b) =>
            Math.hypot(a.x - target.x, a.y - target.y) -
            Math.hypot(b.x - target.x, b.y - target.y),
        );
      if (!outside.length) return false;
      target = outside[0];
    }
    const c = g.carn;
    if (!c || c.dead || c.active || c.scripted) return false;
    if (c.state === "chase" && !c.dormant) return true; // Una persecución no teletransporta al perseguidor.
    if (c.dormant) {
      const q = this.candidate(g, target);
      if (!q) return false;
      c.x = q.x;
      c.y = q.y;
      c.dormant = false;
      c.r = 14;
      c.path = q.path;
      c.pathT = 1;
    }
    c.scripted = false;
    c.hunt = false;
    c.state = "investigate";
    c.lastSeen = null;
    c.lastHeard = [target.x, target.y];
    c.tgt = [target.x, target.y];
    c.searchT = 6;
    c.hideWitness = null;
    c.face = Math.atan2(target.y - c.y, target.x - c.x);
    c.setPath(target.x, target.y);
    return true;
  },
  tick(g, dt) {
    if (!g.lvl?.startsWith("hospital") || g.story.seq !== "free") return;
    const a = g.acoustic || (this.reset(g), g.acoustic);
    a.cooldown = Math.max(0, a.cooldown - dt);
    a.events = a.events.filter((e) => g.t - e.t <= 12);
    if (!a.pending) return;
    a.pending.delay -= dt;
    a.pending.age += dt;
    if (a.pending.delay <= 0) {
      if (this.investigate(g, a.pending)) {
        a.pending = null;
        a.cooldown = 35;
      } else if (a.pending.age > 22) {
        a.pending = null;
        a.cooldown = 6;
      } else a.pending.delay = 1;
    }
  },
};
const SurvivalSkills = {
  labelOffset(title) {
    return title === "EXPRESIÓN MUTANTE" ? 500 : 240;
  },
  configure() {
    for (const s of Object.values(T2)) s.py += 240;
    Object.assign(T2.reflejos, {
      cost: 10,
      br: "hum",
      desc: "Esquiva técnica opcional. Consume 20 de estamina; debes comprarla y asignarle una tecla.",
    });
    Object.assign(T2.instinto, {
      cost: 12,
      br: "mut",
      desc: "Poder opcional: detecta amenazas cercanas durante 6 s. Compra y asigna una tecla.",
    });
    Object.assign(T2.brazo, {
      energy: 34,
      cd: 24,
      desc: "Cuchilla incipiente durante 5 s: alcance 54 y +25 % de daño base. Cada golpe cuesta 32 de Riutex; evolucionar requiere más inversión.",
    });
    Object.assign(T2.fuerza, {
      desc: "+25 % de daño cuerpo a cuerpo. El aumento inicial no duplica el daño.",
    });
    const node = (id, name, br, px, py, parent, cost, extra = {}) => {
      T2[id] = {
        name,
        br,
        phase: 1,
        tier: 4,
        kind: "minor",
        type: "passive",
        cost,
        px,
        py,
        requires: [parent],
        links: [parent],
        resource: br === "hum" ? "stamina" : "energy",
        desc: "",
        ...extra,
      };
      T2[parent].links.push(id);
    };
    node(
      "runner_reserve",
      "Reserva de carrera",
      "hum",
      1260,
      85,
      "aguante",
      8,
      { desc: "+12 de estamina máxima.", mod: { capacity: 12 } },
    );
    node(
      "runner_stride",
      "Zancada eficiente",
      "hum",
      1430,
      85,
      "runner_reserve",
      14,
      { desc: "+8 % de velocidad al esprintar. No afecta al paso normal." },
    );
    node(
      "segundo_aliento",
      "Segundo aliento",
      "hum",
      1600,
      85,
      "runner_stride",
      28,
      {
        kind: "major",
        type: "active",
        energy: 24,
        cd: 28,
        desc: "Durante 5 s: sprint +24 % y desgaste al correr -25 %. Cuesta 24 de estamina. No regenera vida ni concede invulnerabilidad.",
      },
    );
    node("gun_support", "Correa de apoyo", "hum", 2500, 125, "manos", 10, {
      desc: "Disparar cuesta un 8 % menos de esfuerzo antes de otros ajustes.",
      mod: { effort: 0.08 },
    });
    node(
      "gun_transition",
      "Transición de hombro",
      "hum",
      2670,
      125,
      "gun_support",
      16,
      {
        desc: "+5 % de recarga y +8 de estamina máxima.",
        mod: { reload: 0.05, capacity: 8 },
      },
    );
    node(
      "cambio_guardia",
      "Cambio de guardia",
      "hum",
      2840,
      125,
      "gun_transition",
      30,
      {
        kind: "major",
        type: "active",
        energy: 25,
        cd: 27,
        desc: "6 s de apoyo táctico: disparo -20 % de estamina, -20 % de retroceso y recarga -20 %. Cuesta 25 de estamina.",
      },
    );
    node(
      "gravity_reserve",
      "Reserva de convergencia",
      "mut",
      1900,
      1640,
      "blue_neural_3",
      10,
      { desc: "+8 de reserva Riutex.", mod: { en: 8 } },
    );
    node(
      "gravity_tissue",
      "Matriz gravitacional",
      "mut",
      2070,
      1640,
      "gravity_reserve",
      18,
      { desc: "+8 % de recuperación Riutex.", mod: { eregen: 0.08 } },
    );
    node(
      "singularidad",
      "Singularidad",
      "mut",
      2240,
      1640,
      "gravity_tissue",
      38,
      {
        kind: "major",
        type: "active",
        energy: 50,
        cd: 30,
        desc: "Crea una anomalía a 150 px durante 3 s. Atrae infectados visibles sin atravesar paredes. No arrastra al Carnicero ni a jefes y no hace daño directo.",
      },
    );
    node(
      "echo_reserve",
      "Proliferación controlada",
      "mut",
      2850,
      1750,
      "blue_body_3",
      10,
      { desc: "+8 de reserva Riutex.", mod: { en: 8 } },
    );
    node(
      "echo_tissue",
      "Tejido espejo",
      "mut",
      3020,
      1750,
      "echo_reserve",
      18,
      {
        desc: "+6 de salud y -10 % de coste de los golpes Riutex.",
        mod: { hp: 6, melee_effort: 0.1 },
      },
    );
    node("eco_carnal", "Eco de carne", "mut", 3190, 1750, "echo_tissue", 36, {
      kind: "major",
      type: "active",
      energy: 42,
      cd: 30,
      desc: "Deja un señuelo orgánico con 60 de salud durante 7 s. Distrae infectados y produce ruido local. El Carnicero prioriza verte y los jefes lo ignoran.",
    });
    // Elecciones doradas avanzadas: una pareja adicional en cada rama.
    node(
      "gold_fire_discipline",
      "Disciplina de fuego",
      "hum",
      3600,
      550,
      "gold_control",
      48,
      {
        kind: "gold",
        tier: 9,
        gold: "doctrine_hum_advanced",
        desc: "+20 % de eficiencia de disparo y +8 % de daño con armas.",
        mod: { effort: 0.2, gun: 0.08 },
      },
    );
    node(
      "gold_veteran_reserve",
      "Reserva del veterano",
      "hum",
      3600,
      710,
      "gold_control",
      48,
      {
        kind: "gold",
        tier: 9,
        gold: "doctrine_hum_advanced",
        desc: "+28 de estamina máxima y +12 de salud máxima.",
        mod: { capacity: 28, hp: 12 },
      },
    );
    node(
      "gold_organic_reactor",
      "Reactor orgánico",
      "mut",
      3600,
      950,
      "gold_reservoir",
      48,
      {
        kind: "gold",
        tier: 9,
        gold: "doctrine_mut_advanced",
        desc: "+30 % de recuperación Riutex y +15 % de eficiencia de los golpes orgánicos.",
        mod: { eregen: 0.3, melee_effort: 0.15 },
      },
    );
    node(
      "gold_abyssal_heart",
      "Corazón abisal",
      "mut",
      3600,
      1110,
      "gold_reservoir",
      48,
      {
        kind: "gold",
        tier: 9,
        gold: "doctrine_mut_advanced",
        desc: "+40 de reserva Riutex y +12 de salud máxima.",
        mod: { en: 40, hp: 12 },
      },
    );
    RevisionTree.groups = 4;
    BlueSkills.view = null;
    ACTIONS.brazo = (g, p) => {
      p.blade = 5;
    };
    ACTIONS.segundo_aliento = (g, p) => {
      p.sprintBurst = 5;
    };
    ACTIONS.cambio_guardia = (g, p) => {
      p.coverWindow = 6;
    };
    ACTIONS.singularidad = (g, p) => {
      let x = p.x,
        y = p.y;
      for (let d = 15; d <= 150; d += 15) {
        const a = p.x + Math.cos(p.angle) * d,
          b = p.y + Math.sin(p.angle) * d;
        if (Level.blocked(a, b, 8) || !Level.los(p.x, p.y, a, b)) break;
        x = a;
        y = b;
      }
      g.gravityWell = { x, y, life: 3 };
      Sound.tone(115, 0.6, 0.08, "sine");
    };
    ACTIONS.eco_carnal = (g, p) => {
      g.fleshEcho = {
        x: p.x,
        y: p.y,
        hp: 60,
        maxHp: 60,
        life: 7,
        r: 10,
        hidden: false,
        hurt(d) {
          this.hp -= d;
        },
      };
    };
  },
  tick(g, dt) {
    for (const k of ["sprintBurst", "coverWindow"])
      g.player[k] = Math.max(0, (g.player[k] || 0) - dt);
    if (g.gravityWell) {
      const q = g.gravityWell;
      q.life -= dt;
      if (q.life <= 0) g.gravityWell = null;
      else
        for (const e of g.enemies) {
          if (e.dead || e.dormant || e.isBoss || e === g.carn) continue;
          const d = Math.hypot(q.x - e.x, q.y - e.y);
          if (d > 18 && d < 220 && Level.los(q.x, q.y, e.x, e.y))
            Level.move(
              e,
              ((q.x - e.x) / d) * 115 * dt,
              ((q.y - e.y) / d) * 115 * dt,
            );
        }
    }
    if (g.fleshEcho) {
      const q = g.fleshEcho;
      q.life -= dt;
      if (q.life <= 0 || q.hp <= 0) g.fleshEcho = null;
      else if (g.player.flash <= 0 && !g.player.running)
        g.noise = { x: q.x, y: q.y, r: 360 };
    }
  },
};
SurvivalSkills.configure();
const AbilityBinding = {
  init() {
    const e = document.createElement("section");
    e.id = "abilityBinding";
    e.className = "hidden";
    e.innerHTML =
      '<div class="binding-card"><span class="eyebrow">TÉCNICA ADQUIRIDA</span><h2 id="bindName"></h2><p>Pulsa la tecla que quieras usar.</p><p id="bindFeedback">Las teclas de movimiento, interacción, recarga, armas y ventanas están reservadas.</p><small>ESC cancela. Puedes asignarla después desde el panel de habilidades.</small><button id="bindCancel">Asignar más tarde</button></div>';
    document.body.appendChild(e);
    UI.$("bindCancel").onclick = () => {
      Game.mut.bindingTarget = null;
      UI.renderTree(Game);
    };
  },
  render(g) {
    UI.$("abilityBinding").classList.toggle(
      "hidden",
      !g.mut.bindingTarget || g.state !== "tree",
    );
    if (g.mut.bindingTarget)
      UI.$("bindName").textContent =
        SKILLS[g.mut.bindingTarget]?.name || "Asignar técnica";
  },
};
(() => {
  for (const [id, cost] of Object.entries(CombatPressure.costs))
    WEAPONS[id].stam = cost;
  const stamina = Weapons.staminaCost;
  Weapons.staminaCost = function (g, p, w) {
    return isR2lvl(g.lvl)
      ? CombatPressure.shotCost(g, p, w)
      : stamina.call(this, g, p, w);
  };
  const melee = Player.prototype.melee;
  Player.prototype.melee = function (g) {
    return isR2lvl(g.lvl) ? CombatPressure.melee(g, this) : melee.call(this, g);
  };
  const fire = Weapons.fire;
  Weapons.fire = function (g, p) {
    if (!p.weapon) return false;
    const cost = this.staminaCost(g, p, this.effective(p, p.weapon.id));
    if (isR2lvl(g.lvl) && p.stamina < cost) {
      p.fireCd = 0.2;
      UI.msg("Recupera estamina antes de disparar.", 1500);
      return false;
    }
    const n = p.weapon.mag;
    const result = fire.call(this, g, p);
    if (p.weapon.mag < n) {
      AcousticPressure.emit(
        g,
        {
          pistol: 1,
          shotgun: 2.2,
          viper: 0.55,
          rifle: 2.6,
          r98: 3,
          ak: 1.2,
          launcher: 4,
          flamethrower: .16,
        }[p.weapon.id] || 1,
      );
      p.exertion = 1.1;
    }
    return result;
  };
  const explode = Game.explode;
  Game.explode = function (...args) {
    const r = explode.apply(this, args);
    AcousticPressure.emit(this, 4, args[0]?.x, args[0]?.y);
    return r;
  };
  const search = StalkerMind.search;
  StalkerMind.search = function (c) {
    search.call(this, c);
    if (!c.lastSeen && c.lastHeard) c.tgt = c.lastHeard.slice();
  };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    if (g.story.seq === "free" && g.carn?.dormant) {
      g.carnT = 0;
      g.story.carnActive = true;
    }
    tick.call(this, g, dt);
    AcousticPressure.tick(g, dt);
    SurvivalSkills.tick(g, dt);
  };
  const update = Player.prototype.update;
  Player.prototype.update = function (dt, g) {
    const x = this.x,
      y = this.y,
      run = (g.keys.ShiftLeft || g.keys.ShiftRight) && !this.tired,
      old = this.stamina;
    update.call(this, dt, g);
    if (isR2lvl(g.lvl) && run && this.running) {
      const extra =
        (g.mut.has("runner_stride") ? .12 : 0) +
        (this.sprintBurst > 0 ? .30 : 0);
      if (extra) Level.move(this, (this.x - x) * extra, (this.y - y) * extra);
      if (this.sprintBurst > 0)
        this.stamina = Math.min(
          this.maxStamina,
          this.stamina + Math.max(0, old - this.stamina) * .32,
        );
    }
  };
  const enemy = Enemy.prototype.update;
  Enemy.prototype.update = function (dt, g) {
    const q = g.fleshEcho,
      p = g.player;
    if (
      !q ||
      this.isBoss ||
      this === g.carn ||
      Math.hypot(p.x - this.x, p.y - this.y) < 90 ||
      Math.hypot(q.x - this.x, q.y - this.y) > 260 ||
      !Level.los(this.x, this.y, q.x, q.y)
    )
      return enemy.call(this, dt, g);
    const proxy = Object.create(g);
    proxy.player = q;
    return enemy.call(this, dt, proxy);
  };
  const build = Hospital.buildLevel;
  Hospital.buildLevel = function (g, ...args) {
    const r = build.call(this, g, ...args);
    AcousticPressure.reset(g);
    g.gravityWell = null;
    g.fleshEcho = null;
    g.player.sprintBurst = 0;
    g.player.coverWindow = 0;
    g.player.exertion = 0;
    return r;
  };
  const buy = Game.buySkill;
  Game.buySkill = function (id) {
    const had = this.mut.has(id);
    buy.call(this, id);
    if (!had && this.mut.has(id) && SKILLS[id].type === "active") {
      delete this.mut.bindings[id];
      if (this.state === "tree") this.assignSkillKey(id);
    }
  };
  const assign = Game.assignSkillKey;
  Game.assignSkillKey = function (id) {
    assign.call(this, id);
    AbilityBinding.render(this);
  };
  const tree = UI.renderTree;
  UI.renderTree = function (g) {
    tree.call(this, g);
    AbilityBinding.render(g);
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    if (name !== "tree") UI.$("abilityBinding")?.classList.add("hidden");
  };
  const msg = UI.msg;
  UI.msg = function (t, ...args) {
    msg.call(this, t, ...args);
    if (Game.mut?.bindingTarget) UI.$("bindFeedback").textContent = t;
  };
  const load = Mutation.prototype.load;
  Mutation.prototype.load = function (d) {
    load.call(this, d);
    if (d.equipped && !d.bindings?.[d.equipped])
      delete this.bindings[d.equipped];
  };
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    AbilityBinding.init();
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>RIUTEX 2</span><span>FASE 1 / v0.10.0</span><span>WASD + RATÓN</span>";
  };
  const draw = Level.draw;
  Level.draw = function (c, ...args) {
    draw.call(this, c, ...args);
    if (!isR2()) return;
    const g = Game;
    for (const [q, col] of [
      [g.gravityWell, "#a68cbe"],
      [g.fleshEcho, "#84628d"],
    ]) {
      if (!q) continue;
      c.save();
      c.strokeStyle = col;
      c.fillStyle = col + "44";
      c.lineWidth = 1.5;
      c.beginPath();
      c.ellipse(
        q.x - args[0].x,
        q.y - args[0].y,
        q === g.fleshEcho ? 12 : 38,
        q === g.fleshEcho ? 18 : 12,
        g.t * 0.4,
        0,
        Math.PI * 2,
      );
      c.fill();
      c.stroke();
      c.restore();
    }
  };
  const upd = Game.update;
  Game.update = function (dt) {
    upd.call(this, dt);
    if (!isR2() || !this.story.armCut || this.story.armHealed) return;
    const p = this.player,
      last = this.story.bloodStep;
    if (!last || Math.hypot(p.x - last.x, p.y - last.y) > 13) {
      Level.decals.push({
        x: p.x + Math.sin(this.t * 15) * 3,
        y: p.y + 3,
        r: 3 + Math.random() * 2,
        c: "rgba(121,13,24,.75)",
      });
      this.story.bloodStep = { x: p.x, y: p.y };
    }
  };
})();
