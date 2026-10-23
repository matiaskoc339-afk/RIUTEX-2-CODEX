// RIUTEX 2 · v0.6 · Señalética, monitor vital y ramales de especialización.
const ClinicalHUD = {
  ratio(value, max) {
    return Math.max(0, Math.min(1, value / Math.max(1, max)));
  },
  values(p, mut) {
    const hp = this.ratio(p.hp, p.maxHp),
      stamina = this.ratio(p.stamina, p.maxStamina || 100),
      energy = mut.tutorial ? this.ratio(p.energy, p.maxEnergy) : 0;
    return {
      hp,
      stamina,
      energy,
      hue: Math.round(Math.max(0, (hp - 0.2) / 0.8) * 135),
      status:
        p.hp <= 0
          ? "SIN PULSO"
          : hp > 0.65
            ? "ESTABLE"
            : hp > 0.3
              ? "PRECAUCIÓN"
              : "CRÍTICO",
    };
  },
  update(p, mut) {
    const v = this.values(p, mut),
      panel = UI.$("vitalMonitor");
    panel.style.setProperty("--vital", "hsl(" + v.hue + " 74% 66%)");
    panel.style.setProperty(
      "--pulse-cycle",
      (v.hp > 0.65 ? 5.2 : v.hp > 0.3 ? 3.8 : 2.3) + "s",
    );
    panel.dataset.condition = v.status;
    UI.$("vitalStatus").textContent = v.status;
    UI.$("vitalNumber").textContent =
      Math.ceil(p.hp) + " / " + Math.ceil(p.maxHp);
    UI.$("hp").style.width = v.hp * 100 + "%";
    UI.$("st").style.width = "100%";
    UI.$("st").style.height = v.stamina * 100 + "%";
    UI.$("staminaNumber").textContent = Math.round(v.stamina * 100);
    UI.$("enb").style.display = "flex";
    UI.$("enb").classList.toggle("dormant", !mut.tutorial);
    UI.$("en").style.width = v.energy * 100 + "%";
    UI.$("riutexNumber").textContent = mut.tutorial
      ? Math.floor(p.energy) + " / " + Math.ceil(p.maxEnergy)
      : "INACTIVO";
    const active = [];
    if (Game.temporalField)
      active.push("SUSPENSIÓN " + Game.temporalField.life.toFixed(1) + " s");
    if (p.cloak > 0) active.push("CAMUFLAJE " + Math.ceil(p.cloak) + " s");
    if (p.predator > 0)
      active.push("ACECHADOR " + Math.ceil(p.predator) + " s");
    if (p.precisionWindow > 0)
      active.push("PRECISIÓN " + Math.ceil(p.precisionWindow) + " s");
    UI.$("effectReadout").textContent = active.join(" · ");
  },
};
const PresentationTree = {
  init() {
    const tip = document.createElement("div");
    tip.id = "skillTooltip";
    tip.className = "hidden";
    tip.setAttribute("role", "tooltip");
    document.body.appendChild(tip);
  },
  hideTip() {
    UI.$("skillTooltip")?.classList.add("hidden");
  },
  tip(button, id, g) {
    const tip = UI.$("skillTooltip"),
      s = SKILLS[id],
      rect = button.getBoundingClientRect();
    tip.className = "skill-tooltip " + s.br;
    tip.textContent =
      s.name +
      "\n" +
      (g.mut.has(id) ? "Adquirida" : s.cost + " EXP") +
      (s.gold ? " · Elección dorada" : "");
    tip.style.left =
      Math.max(
        12,
        Math.min(innerWidth - 260, rect.left + rect.width / 2 - 115),
      ) + "px";
    tip.style.top =
      Math.max(12, Math.min(innerHeight - 95, rect.bottom + 12)) + "px";
    button.setAttribute("aria-describedby", "skillTooltip");
  },
  choices(g, s) {
    const box = UI.$("goldChoice");
    box.innerHTML = "";
    box.classList.toggle("hidden", !s?.gold);
    if (!s?.gold) return;
    const title = document.createElement("p");
    title.textContent =
      "ELIGE UNA · " +
      (s.br === "hum" ? "DOCTRINA HUMANA" : "SIMBIOSIS MUTANTE");
    box.appendChild(title);
    for (const [id, n] of Object.entries(SKILLS).filter(
      ([, n]) => n.gold === s.gold,
    )) {
      const b = document.createElement("button");
      b.className =
        "doctrine-choice" +
        (UI.treeSel === id ? " selected" : "") +
        (g.mut.has(id) ? " owned" : "");
      b.dataset.choice = id;
      b.textContent = (g.mut.has(id) ? "✦ " : "") + n.name + "\n" + n.desc;
      b.onclick = () => {
        UI.treeSel = id;
        BlueSkills.render(g);
      };
      box.appendChild(b);
    }
  },
};
const ReadableDoors = {
  geometry(d) {
    const xs = d.tiles.map((t) => t[0]),
      ys = d.tiles.map((t) => t[1]),
      x = Math.min(...xs),
      y = Math.min(...ys),
      w = Math.max(...xs) - x + 1,
      h = Math.max(...ys) - y + 1;
    const wall = (a, b) => Level.grid[b]?.[a] === 1;
    const vertical =
      h > w ||
      (h === w &&
        Number(wall(x, y - 1)) + Number(wall(x, y + 1)) >
          Number(wall(x - 1, y)) + Number(wall(x + 1, y)));
    return {
      x: (x + w / 2) * 32,
      y: (y + h / 2) * 32,
      length: (vertical ? h : w) * 32,
      vertical,
    };
  },
  draw(c, d, alpha = 1) {
    const q = this.geometry(d),
      l = q.length,
      locked = !Game.doorOk(d);
    c.save();
    c.globalAlpha = alpha;
    c.translate(q.x, q.y);
    if (q.vertical) c.rotate(Math.PI / 2);
    c.fillStyle = "#10191d";
    c.fillRect(-l / 2 - 4, -16, l + 8, 32);
    c.fillStyle = "#b5c0b9";
    c.fillRect(-l / 2 - 3, -16, 4, 32);
    c.fillRect(l / 2 - 1, -16, 4, 32);
    c.fillStyle = "#778a8b";
    c.fillRect(-l / 2, -16, l, 3);
    c.fillRect(-l / 2, 13, l, 3);
    if (d.open) {
      c.fillStyle = "#536366";
      c.fillRect(-l / 2, -13, l, 26);
      c.strokeStyle = "#9baead";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(-l / 2, -11, l - 5, 0, Math.PI / 2);
      c.stroke();
      c.translate(-l / 2, -11);
      c.rotate(-1.35);
    } else {
      c.translate(-l / 2, -11);
    }
    const material = c.createLinearGradient(0, 0, 0, 23);
    material.addColorStop(0, Game.lvl === "mansion" ? "#93836b" : "#839a9b");
    material.addColorStop(1, Game.lvl === "mansion" ? "#4d4034" : "#384f58");
    c.fillStyle = material;
    c.fillRect(1, 0, l - 2, 23);
    c.strokeStyle = "#b6c4ba";
    c.lineWidth = 1;
    c.strokeRect(4, 3, l - 8, 17);
    // Ventanilla, bisagras y barra antipánico: se lee como una hoja, no como ladrillo.
    c.fillStyle = "#14282e";
    c.fillRect(l * 0.22, 4, Math.max(5, l * 0.24), 8);
    c.fillStyle = "#6b969d";
    c.fillRect(l * 0.22 + 1, 5, Math.max(3, l * 0.24 - 2), 2);
    c.fillStyle = "#d5d4b9";
    c.fillRect(l * 0.56, 13, Math.max(7, l * 0.28), 3);
    c.fillStyle = "#c1c9bd";
    c.fillRect(0, 3, 3, 4);
    c.fillRect(0, 17, 3, 4);
    c.fillStyle = locked ? "#e4ad73" : "#93ccba";
    c.fillRect(l - 7, 5, 3, 4);
    c.restore();
  },
  overlay(g) {
    const c = g.ctx,
      p = g.player;
    c.save();
    c.translate(-g.cam.x, -g.cam.y);
    for (const d of Level.doors) {
      if (
        d.open ||
        !d.tiles.some(([x, y]) => HorrorVision.visible.has(x + "," + y))
      )
        continue;
      const q = this.geometry(d),
        dist = Math.hypot(q.x - p.x, q.y - p.y);
      if (dist > 270) continue;
      this.draw(c, d, 0.85 - dist / 620);
      if (dist < 110) {
        c.font = "600 10px Rajdhani, sans-serif";
        c.textAlign = "center";
        c.fillStyle = "#e1d9bc";
        c.fillText(
          Game.doorOk(d) ? "E · PUERTA" : "PUERTA · CIERRE",
          q.x,
          q.y - 25,
        );
      }
    }
    c.restore();
  },
};
const Specializations = {
  inShadow(p) {
    return !Level.lamps.some(
      (l) => Math.hypot(p.x - l.x, p.y - l.y) < l.r * 0.42,
    );
  },
  concealed(p) {
    return p.cloak > 0 && !p.running && this.inShadow(p);
  },
  fieldFactor(e, g) {
    const q = g.temporalField;
    if (
      !q ||
      e.dead ||
      Math.hypot(e.x - q.x, e.y - q.y) > 280 ||
      !Level.los(q.x, q.y, e.x, e.y)
    )
      return 1;
    return e.isBoss || e.id === 900 ? SkillBalance.value(Game,'suspension',.25) : 0;
  },
  reset(g) {
    g.temporalField = null;
    if (g.player) {
      g.player.cloak = 0;
      g.player.predator = 0;
      g.player.precisionWindow = 0;
    }
  },
};
ACTIONS.camuflaje = (g, p) => {
  p.cloak = 8;
  UI.msg("Camuflaje en penumbra. Camina sin correr y evita las luces.", 3500);
};
ACTIONS.disparo_sereno = (g, p) => {
  p.precisionWindow = 6;
  p.focus = Math.max(p.focus, 6);
};
ACTIONS.suspension = (g, p) => {
  g.temporalField = { x: p.x, y: p.y, life: 3 };
  g.ring(p.x, p.y, 280, "#b391df");
  Sound.tone(180, 0.6, 0.08, "sine");
};
ACTIONS.forma_acechador = (g, p) => {
  p.predator = g.mut.has("gold_evolution") ? 9*SkillBalance.value(g,'gold_evolution',1.5) : 9;
  p.blade = Math.max(p.blade, p.predator);
  g.ring(p.x, p.y, 80, "#c299e0");
};
(() => {
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    PresentationTree.init();
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>RIUTEX 2</span><span>FASE 1 / v0.6.0</span><span>WASD + RATÓN</span>";
  };
  const hud = UI.hud;
  UI.hud = function (p, inv, mut) {
    hud.call(this, p, inv, mut);
    ClinicalHUD.update(p, mut);
  };
  const render = Game.render;
  Game.render = function () {
    render.call(this);
    if (!isR2()) return;
    ReadableDoors.overlay(this);
    if (this.temporalField) {
      const q = this.temporalField,
        c = this.ctx;
      c.save();
      if (HorrorVision.polygon.length) {
        c.beginPath();
        HorrorVision.polygon.forEach(([x, y], i) =>
          i
            ? c.lineTo(x - this.cam.x, y - this.cam.y)
            : c.moveTo(x - this.cam.x, y - this.cam.y),
        );
        c.closePath();
        c.clip();
      }
      c.strokeStyle = "rgba(187,142,231,.5)";
      c.lineWidth = 2;
      c.setLineDash([8, 10]);
      c.beginPath();
      c.arc(q.x - this.cam.x, q.y - this.cam.y, 280, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    PresentationTree.hideTip();
  };
  const floor = Level.draw;
  Level.draw = function (c, cam, w, h) {
    floor.call(this, c, cam, w, h);
    if (!isR2()) return;
    for (const d of this.doors) {
      const q = ReadableDoors.geometry(d);
      if (
        q.x < cam.x - 100 ||
        q.x > cam.x + w + 100 ||
        q.y < cam.y - 100 ||
        q.y > cam.y + h + 100
      )
        continue;
      ReadableDoors.draw(c, d);
    }
  };
  const cast = Game.castSkill;
  Game.castSkill = function (id) {
    id = id || this.mut.equipped;
    if (
      this.state === "play" &&
      id === "camuflaje" &&
      !Specializations.inShadow(this.player)
    )
      return UI.msg("Busca penumbra antes de camuflarte.");
    return cast.call(this, id);
  };
  const update = Game.update;
  Game.update = function (dt) {
    if (this.temporalField) {
      this.temporalField.life -= dt;
      if (this.temporalField.life <= 0) this.temporalField = null;
    }
    const p = this.player;
    for (const k of ["cloak", "predator", "precisionWindow"])
      p[k] = Math.max(0, (p[k] || 0) - dt);
    if (p.running || this.keys.ShiftLeft || this.keys.ShiftRight) {
      p.cloak = 0;
      p.precisionWindow = 0;
    }
    if (p.cloak > 0 && !Specializations.inShadow(p)) p.cloak = 0;
    update.call(this, dt);
  };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    tick.call(this, g, dt);
    if (g.noise && g.player.flash <= 0 && !g.player.running) {
      if (g.mut.has("shadow_step")) g.noise.r *= SkillBalance.value(g,'shadow_step',.75);
      if (Specializations.concealed(g.player)) g.noise = null;
    }
  };
  const enemy = Enemy.prototype.update;
  Enemy.prototype.update = function (dt, g) {
    const f = Specializations.fieldFactor(this, g);
    if (f === 0) return;
    if (
      !this.isBoss &&
      !this.dead &&
      !this.dormant &&
      Specializations.concealed(g.player) &&
      Math.hypot(this.x - g.player.x, this.y - g.player.y) > 90
    ) {
      this.alert = false;
      this.windup = 0;
      this.cd -= dt;
      return;
    }
    return enemy.call(this, dt * f, g);
  };
  const carn = Carnicero.prototype.update;
  Carnicero.prototype.update = function (dt, g) {
    const f = Specializations.fieldFactor(this, g),
      p = g.player,
      hidden = p.hidden;
    const masked =
      !hidden &&
      !this.scripted &&
      !this.active &&
      Specializations.concealed(p) &&
      Math.hypot(this.x - p.x, this.y - p.y) > 90;
    if (masked) p.hidden = true;
    try {
      return carn.call(this, dt * f, g);
    } finally {
      if (masked) p.hidden = hidden;
    }
  };
  const move = Level.move;
  Level.move = function (e, dx, dy) {
    const k = e === Game.player && e.predator > 0 ? SkillBalance.value(Game,'predator_speed',1.2) : 1;
    return move.call(this, e, dx * k, dy * k);
  };
  const fire = Weapons.fire;
  Weapons.fire = function (g, p) {
    if (p.predator > 0)
      return UI.msg("La forma del acechador combate con su cuchilla.", 1500);
    const mag = p.weapon?.mag;
    if (p.precisionWindow > 0) p.mods.pow += SkillBalance.value(g,'disparo_sereno',1);
    try {
      return fire.call(this, g, p);
    } finally {
      if (p.precisionWindow > 0) p.mods.pow -= SkillBalance.value(g,'disparo_sereno',1);
      if (p.weapon?.mag < mag) p.cloak = 0;
    }
  };
  const melee = Player.prototype.melee;
  Player.prototype.melee = function (g) {
    const t = this.slash;
    melee.call(this, g);
    if (this.slash > t) this.cloak = 0;
  };
  const hurt = Player.prototype.hurt;
  Player.prototype.hurt = function (d, a, g) {
    const hp = this.hp;
    hurt.call(this, d * (this.predator > 0 ? SkillBalance.value(g,'predator_armor',.75) : 1), a, g);
    if (this.hp < hp) this.cloak = 0;
  };
  const draw = Player.prototype.draw;
  Player.prototype.draw = function (c) {
    c.save();
    if (Specializations.concealed(this)) c.globalAlpha = 0.42;
    draw.call(this, c);
    if (this.predator > 0) {
      c.translate(this.x, this.y);
      c.rotate(this.angle);
      c.fillStyle = "#34283f";
      c.beginPath();
      c.ellipse(-2, 0, 12, 17, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#b7a7bc";
      c.beginPath();
      for (const sign of [-1, 1]) {
        c.moveTo(-7, sign * 12);
        c.lineTo(-4, sign * 25);
        c.lineTo(5, sign * 14);
      }
      c.fill();
      c.fillStyle = "#5b4866";
      c.beginPath();
      c.ellipse(4, 0, 9, 8, 0, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = "#e1b0ff";
      c.fillRect(9, -5, 4, 2);
      c.fillRect(9, 3, 4, 2);
      c.strokeStyle = "#dcc3de";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(10, 10);
      c.lineTo(40, 14);
      c.stroke();
      c.strokeStyle = "rgba(201,156,239,.45)";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(0, 0, 22, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  };
  const build = Hospital.buildLevel;
  Hospital.buildLevel = function (...args) {
    const result = build.apply(this, args);
    Specializations.reset(args[0]);
    return result;
  };
  const serialize = Mutation.prototype.serialize;
  Mutation.prototype.serialize = function () {
    return { ...serialize.call(this), treeVersion: 6, cd: { ...this.cd } };
  };
  const load = Mutation.prototype.load;
  Mutation.prototype.load = function (d) {
    load.call(this, d);
    this.cd = {};
    for (const [id, t] of Object.entries(d.cd || {}))
      if (this.has(id) && Number.isFinite(t))
        this.cd[id] = Math.max(0, Math.min(t, SKILLS[id].cd || 0));
    this.goldRefund = 0;
    if (d.treeVersion !== 6) {
      const seen = new Set();
      for (const id of this.owned) {
        const s = SKILLS[id];
        if (s?.gold) {
          if (seen.has(s.gold)) {
            this.owned.delete(id);
            this.goldRefund +=
              {
                gold_reload: 24,
                gold_triage: 34,
                gold_catalyst: 24,
                gold_leech: 34,
              }[id] || s.cost;
          } else seen.add(s.gold);
        }
      }
    }
  };
  const start = Game.start;
  Game.start = function (...args) {
    start.apply(this, args);
    Specializations.reset(this);
    if (this.mut.goldRefund) {
      this.player.xp += this.mut.goldRefund;
      this.mut.goldRefund = 0;
      UI.msg(
        "Tu doctrina se conserva. EXP devuelta por una elección dorada que ahora es alternativa.",
        5000,
      );
    }
  };
})();
