// Visibilidad real, guía de huida e IA con memoria: ampliación de fase 1 v0.4.
const HorrorVision = {
  entered: null,
  polygon: [],
  visible: new Set(),
  roomAt(x, y) {
    return Level.rooms.find(
      (r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h,
    );
  },
  prepare(g) {
    const p = g.player,
      x = Math.floor(p.x / 32),
      y = Math.floor(p.y / 32),
      r = this.roomAt(x, y),
      visits = g.story.visited || (g.story.visited = {});
    if (r) visits[g.lvl + ":" + r.n] = true;
    this.entered = Level.rooms.filter((r) => visits[g.lvl + ":" + r.n]);
    this.visible = new Set();
    this.polygon = [];
    for (let i = 0; i < 192; i++) {
      const a = (i * Math.PI * 2) / 192,
        dx = Math.cos(a),
        dy = Math.sin(a);
      let cx = x,
        cy = y,
        dist = 0;
      const sx = dx < 0 ? -1 : 1,
        sy = dy < 0 ? -1 : 1,
        stepX = Math.abs(32 / dx),
        stepY = Math.abs(32 / dy);
      let tx = Math.abs(((dx < 0 ? cx * 32 : (cx + 1) * 32) - p.x) / dx),
        ty = Math.abs(((dy < 0 ? cy * 32 : (cy + 1) * 32) - p.y) / dy);
      while (dist < 390) {
        this.visible.add(cx + "," + cy);
        if (tx < ty) {
          dist = tx;
          tx += stepX;
          cx += sx;
        } else {
          dist = ty;
          ty += stepY;
          cy += sy;
        }
        if (dist > 390) {
          dist = 390;
          break;
        }
        const tile = Level.grid[cy]?.[cx];
        const allowed = this.allowed(cx, cy) || tile === 1;
        if (!allowed) break;
        this.visible.add(cx + "," + cy);
        if (tile !== 0 && tile !== 4) break;
      }
      this.polygon.push([
        p.x + dx * Math.min(390, dist + 3),
        p.y + dy * Math.min(390, dist + 3),
      ]);
    }
    const map = g.story.mapTiles || (g.story.mapTiles = {}),
      known = new Set(map[g.lvl] || []);
    for (const key of this.visible) {
      const [x, y] = key.split(",").map(Number);
      if (Level.grid[y]?.[x] === 0 && this.allowed(x, y)) known.add(key);
    }
    map[g.lvl] = [...known];
  },
  allowed(x, y) {
    return (
      this.entered?.some(
        (r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h,
      ) ||
      Level.doors.some((d) => d.tiles.some((t) => t[0] === x && t[1] === y)) ||
      R2_DATA(Game.lvl).cuts.some(
        ([a, b, w, h]) => x >= a && x < a + w && y >= b && y < b + h,
      )
    );
  },
  paint(g) {
    const c = g.ctx,
      W = g.cv.width,
      H = g.cv.height,
      cam = g.cam;
    c.save();
    c.fillStyle = "#030609";
    c.beginPath();
    c.rect(0, 0, W, H);
    if (this.polygon.length) {
      c.moveTo(this.polygon[0][0] - cam.x, this.polygon[0][1] - cam.y);
      for (const [x, y] of this.polygon) c.lineTo(x - cam.x, y - cam.y);
      c.closePath();
    }
    c.fill("evenodd");
    c.strokeStyle = "rgba(3,6,9,.45)";
    c.lineWidth = 3;
    c.lineJoin = "round";
    c.stroke();
    c.restore();
    // Instinto revela solamente una silueta, nunca la distribución de una sala desconocida.
    if (g.player.sense > 0)
      for (const e of g.enemies)
        if (
          !e.dead &&
          !e.dormant &&
          Math.hypot(e.x - g.player.x, e.y - g.player.y) < 280
        ) {
          c.strokeStyle = "rgba(149,171,179,.36)";
          c.lineWidth = 1;
          c.beginPath();
          c.arc(e.x - cam.x, e.y - cam.y, e.r + 4, 0, Math.PI * 2);
          c.stroke();
        }
  },
};
const EscapeGuide = {
  tick(g) {
    const s = g.story,
      el = UI.$("escapeGuide");
    let title = "",
      body = "",
      target = null;
    if (g.lvl === "hospital" && s.seq !== "free")
      switch (s.seq) {
        case "wake":
          title = "01 · SUELTA LAS CORREAS";
          body = "Pulsa [E] varias veces · " + s.struggle + " / 12";
          break;
        case "room":
          title = "02 · SAL AL PASILLO";
          body = "[E] abre la puerta. Avanza hacia la derecha.";
          target = [21.5 * 32, 7.5 * 32];
          break;
        case "run":
          if (Level.doors.find((d) => d.id === "forced")?.open) {
            title = "SIGUE HUYENDO";
            body =
              "Continúa a la derecha y baja por el pasillo. Mantén [Shift].";
            target = [52.5 * 32, 19.5 * 32];
            break;
          }
          title =
            g.player.x > 39 * 32
              ? "LA PUERTA ESTÁ ATASCADA"
              : "03 · CORRE HACIA EL FONDO";
          body =
            g.player.x > 39 * 32
              ? "Mantén [E] junto a la puerta. El machete está detrás de ti."
              : "[WASD] moverte · Mantén [Shift] para correr →";
          target = [43.5 * 32, 7.5 * 32];
          break;
        case "cut":
          title = "EL FRASCO SIGUE EN TU BOTA";
          body = "Pulsa [F] para inyectarlo. Es tu única oportunidad.";
          break;
        case "healed":
          title = "04 · LLEGA A LA PERSIANA";
          body =
            g.player.x < 50 * 32
              ? "Continúa a la derecha → · [Q] esquiva"
              : "Baja por el pasillo ↓ hacia el vestíbulo · [Q] esquiva";
          target =
            g.player.x < 50 * 32
              ? [52.5 * 32, 7.5 * 32]
              : [52.5 * 32, 23.5 * 32];
          break;
      }
    el.classList.toggle("hidden", !title);
    el.classList.toggle("urgent", s.seq === "cut");
    el.innerHTML = title
      ? "<strong>" + title + "</strong><span>" + body + "</span>"
      : "";
    this.target = target;
  },
  draw(g) {
    if (!this.target) return;
    const p = g.player,
      cam = g.cam,
      c = g.ctx,
      dx = this.target[0] - p.x,
      dy = this.target[1] - p.y,
      a = Math.atan2(dy, dx);
    c.save();
    c.translate(p.x - cam.x + Math.cos(a) * 60, p.y - cam.y + Math.sin(a) * 60);
    c.rotate(a);
    c.strokeStyle = "#c6b488";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-7, -6);
    c.lineTo(0, 0);
    c.lineTo(-7, 6);
    c.stroke();
    c.restore();
  },
};
const StalkerMind = {
  choose(c, g, away = false) {
    const points = R2_DATA(g.lvl).patrol || [],
      anchor = c.lastSeen || [c.x, c.y];
    const sorted = points
      .map(([x, y], i) => ({ x: x * 32 + 16, y: y * 32 + 16, i }))
      .filter((q) => Math.hypot(q.x - c.x, q.y - c.y) > 130)
      .sort((a, b) =>
        away
          ? Math.hypot(b.x - anchor[0], b.y - anchor[1]) -
            Math.hypot(a.x - anchor[0], a.y - anchor[1])
          : ((a.i - c.wp + points.length) % points.length) -
            ((b.i - c.wp + points.length) % points.length),
      );
    for (const q of sorted)
      if (c.setPath(q.x, q.y)) {
        c.wp = (q.i + 1) % points.length;
        c.patrolTarget = [q.x, q.y];
        c.state = "patrol";
        return true;
      }
    c.state = "routine";
    c.routineT = 3;
    return false;
  },
  search(c) {
    c.state = "search";
    c.hunt = false;
    c.searchT = 5.5;
    c.path = null;
    c.tgt = c.lastSeen ? c.lastSeen.slice() : [c.x, c.y];
  },
  update(c, dt, g) {
    if (c.dead || c.dormant) return;
    const p = g.player;
    c.hitFlash = Math.max(0, c.hitFlash - dt);
    c.atkCd -= dt;
    c.pathT -= dt;
    if (c.frozen > 0) {
      c.frozen -= dt;
      return;
    }
    if (c.stagger > 0) {
      c.stagger -= dt;
      return;
    }
    if (c.openT > 0) {
      c.openT -= dt;
      if (c.openT <= 0 && c.opening) {
        Level.openDoor(c.opening);
        c.opening = null;
        c.pathT = 0;
      }
      return;
    }
    const d = Math.hypot(p.x - c.x, p.y - c.y);
    c.metalT = (c.metalT || 0) - dt;
    if (
      c.metalT <= 0 &&
      ["patrol", "chase", "investigate", "routine"].includes(c.state)
    ) {
      c.metalT = c.state === "routine" ? 5 : 1.8;
      if (d < 600) {
        const vol = 0.045 * (1 - d / 600);
        Sound.noise(0.2, vol, 360);
        Sound.tone(74, 0.18, vol * 0.5, "triangle");
      }
    }
    const a = Math.atan2(p.y - c.y, p.x - c.x),
      safe = Nav.safe(Math.floor(p.x / 32), Math.floor(p.y / 32)),
      inView =
        c.state === "chase" ||
        Math.abs(Math.atan2(Math.sin(a - c.face), Math.cos(a - c.face))) < 1.35;
    const sees =
      !p.hidden && !safe && d < 340 && inView && (typeof POVPerception!=='undefined'&&POVPerception.active(g)?POVPerception.line(c,p):Level.los(c.x,c.y,p.x,p.y));
    if (sees) {
      c.lastSeen = [p.x, p.y];
      c.tgt = c.lastSeen.slice();
      c.lostT = 0;
      c.hunt = true;
      if (!["windup", "recover"].includes(c.state)) c.state = "chase";
    }
    if (c.state === "windup") {
      c.mt -= dt;
      if (c.mt <= 0) {
        if (sees && d < c.def.range + 20) c.hitPlayer(g);
        c.atkCd = 1.4;
        c.state = "recover";
        c.mt = 0.7;
      }
      return;
    }
    if (c.state === "recover") {
      c.mt -= dt;
      if (c.mt <= 0) c.state = c.hunt ? "chase" : "search";
      return;
    }
    const n = g.noise,
      heard =
        !p.hidden &&
        n &&
        Math.hypot(c.x - n.x, c.y - n.y) <
          n.r * (Level.los(c.x, c.y, n.x, n.y) ? 1 : 0.65);
    if (heard && !sees && c.state !== "chase") {
      c.tgt = [n.x, n.y];
      c.state = "investigate";
      c.searchT = 5;
      c.pathT = 0;
    }
    if (c.state === "chase") {
      if (!sees) {
        c.lostT = (c.lostT || 0) + dt;
        if (c.lostT > 2.2) {
          this.search(c);
          return;
        }
      }
      if (sees && d < c.def.range + 5 && c.atkCd <= 0) {
        c.state = "windup";
        c.mt = 0.6;
        c.face = a;
        Sound.play("attack");
        return;
      }
      if (c.pathT <= 0 && c.tgt) c.setPath(...c.tgt);
      if (sees && d < 125 && Nav.fatLos(c.x, c.y, p.x, p.y, c.r - 1)) {
        Level.move(c, Math.cos(a) * 150 * dt, Math.sin(a) * 150 * dt);
        c.face = a;
      } else c.follow(dt, 132);
      return;
    }
    if (c.hideWitness && p.hidden) {
      c.state = "investigate";
      c.tgt = c.hideWitness.slice();
      if (Math.hypot(c.x - c.tgt[0], c.y - c.tgt[1]) < 65) {
        c.inspectT = (c.inspectT || 0) + dt;
        if (c.inspectT > 1.8) {
          p.hidden = false;
          c.hideWitness = null;
          c.inspectT = 0;
          c.lastSeen = [p.x, p.y];
          c.state = "chase";
          c.hunt = true;
          UI.msg(
            "¡Te vio entrar! Sal de su alcance antes de esconderte.",
            4000,
          );
        }
        return;
      }
    } else if (!p.hidden) c.hideWitness = null;
    if (c.state === "investigate") {
      if (c.pathT <= 0 && c.tgt) c.setPath(...c.tgt);
      if (
        !c.follow(dt, 82) ||
        (c.tgt && Math.hypot(c.x - c.tgt[0], c.y - c.tgt[1]) < 36)
      )
        this.search(c);
      return;
    }
    if (c.state === "search") {
      c.searchT -=
        dt * (g.mut.has("sombra") && p.hidden && !c.hideWitness ? SkillBalance.value(g,'sombra',1.7) : 1);
      c.face += dt * 0.8;
      if (
        c.pathT <= 0 &&
        c.tgt &&
        Math.hypot(c.x - c.tgt[0], c.y - c.tgt[1]) > 50
      )
        c.setPath(...c.tgt);
      if (c.path?.length) c.follow(dt, 55);
      if (c.searchT <= 0) {
        c.hideWitness = null;
        this.choose(c, g, true);
      }
      return;
    }
    if (c.state === "routine") {
      c.routineT -= dt;
      c.face += Math.sin(g.t * 0.8) * dt * 0.22;
      if (c.routineT <= 0) this.choose(c, g);
      return;
    }
    if (!c.path?.length) {
      this.choose(c, g);
      return;
    }
    c.follow(dt, 54);
    if (
      !c.path?.length ||
      (c.patrolTarget &&
        Math.hypot(c.x - c.patrolTarget[0], c.y - c.patrolTarget[1]) < 25)
    ) {
      c.state = "routine";
      c.routineT = 4 + (c.wp % 4) * 1.5;
      c.path = null;
    }
  },
};
(() => {
  for(const id of ['b_security','b_hydro','b_blood','b_eeg'])CLUES.add(id);
  // El mapa solo recuerda suelo visto desde una zona en la que realmente entraste.
  Blue.discover = function (g) {
    const room = Hospital.roomAt(g.player),
      visits = g.story.visited || (g.story.visited = {}),
      key = g.lvl + ":" + room;
    if (room && !visits[key]) {
      visits[key] = true;
      UI.$("location").textContent = room;
      UI.$("location").classList.remove("show");
      void UI.$("location").offsetWidth;
      UI.$("location").classList.add("show");
    }
    UI.$("zoneName").textContent = room || "Zona de servicio";
    UI.$("phaseBadge").textContent =
      g.lvl === "mansion"
        ? "PRÓLOGO · OPERACIÓN WREN"
        : g.story.seq === "free"
          ? "FASE 1 · EXPLORACIÓN"
          : "FASE 1 · EL DESPERTAR";
  };
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    const guide = document.createElement("div");
    guide.id = "escapeGuide";
    guide.className = "hidden";
    UI.$("hud").appendChild(guide);
    UI.$("menu").querySelector("h2").textContent = "EL CUSTODIO · FASE 1";
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>RIUTEX 2</span><span>FASE 1 / v0.4.0</span><span>WASD + RATÓN</span>";
  };
  const update = Game.update;
  Game.update = function (dt) {
    const p = this.player;
    p.maxStamina = 100 + this.mut.mod("capacity");
    for (const k of ["quietSteps", "shell"])
      p[k] = Math.max(0, (p[k] || 0) - dt);
    if (p.graft > 0) {
      const time = Math.min(dt, p.graft);
      p.graft -= time;
      p.hp = Math.min(p.maxHp, p.hp + time * 4);
    }
    if (this.psychicAnchor) {
      const q = this.psychicAnchor;
      q.life -= dt;
      if (q.life <= 0) this.psychicAnchor = null;
      else
        for (const e of this.enemies)
          if (!e.dead && e.id !== 900 && Math.hypot(e.x - q.x, e.y - q.y) < 90)
            e.stagger = Math.max(e.stagger, 0.08);
    }
    update.call(this, dt);
    if (this.state === "play") EscapeGuide.tick(this);
  };
  const render = Game.render;
  Game.render = function () {
    if (!isR2()) return render.call(this);
    HorrorVision.prepare(this);
    render.call(this);
    HorrorVision.paint(this);
    EscapeGuide.draw(this);
    if (
      this.psychicAnchor &&
      HorrorVision.visible.has(
        Math.floor(this.psychicAnchor.x / 32) +
          "," +
          Math.floor(this.psychicAnchor.y / 32),
      )
    ) {
      const q = this.psychicAnchor;
      this.ctx.strokeStyle = "rgba(128,159,169,.5)";
      this.ctx.beginPath();
      this.ctx.arc(q.x - this.cam.x, q.y - this.cam.y, 80, 0, Math.PI * 2);
      this.ctx.stroke();
    }
  };
  const carn = Carnicero.prototype.update;
  Carnicero.prototype.update = function (dt, g) {
    if (this.scripted || this.active) return carn.call(this, dt, g);
    return StalkerMind.update(this, dt, g);
  };
  const hide = Hospital.use;
  Hospital.use = function (g, it) {
    if (it.type === "h_hide" && !g.player.hidden) {
      const c = g.carn;
      if (
        c &&
        !c.dormant &&
        !c.dead &&
        (c.state === "chase" ||
          Math.abs(
            Math.atan2(
              Math.sin(Math.atan2(g.player.y - c.y, g.player.x - c.x) - c.face),
              Math.cos(Math.atan2(g.player.y - c.y, g.player.x - c.x) - c.face),
            ),
          ) < 1.35) &&
        Math.hypot(c.x - g.player.x, c.y - g.player.y) < 340 &&
        Level.los(c.x, c.y, g.player.x, g.player.y)
      ) {
        c.hideWitness = [it.x, it.y];
        c.inspectT = 0;
        UI.msg(
          "Te ha visto acercarte al armario. Rompe su línea de visión.",
          3000,
        );
      }
    }
    return hide.call(this, g, it);
  };
  const cut = Hospital.cutArm;
  Hospital.cutArm = function (g) {
    cut.call(this, g);
    if (g.carn) {
      g.carn.mt = 15;
      g.carn.atkCd = 15;
    }
    EscapeGuide.tick(g);
  };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    tick.call(this, g, dt);
    if (g.player.quietSteps > 0 && g.noise && g.player.flash <= 0)
      g.noise.r *= SkillBalance.value(g,'paso_ligero',.35);
  };
  Game.castSkill = function (id) {
    if (this.state !== "play" || !this.mut.tutorial) return;
    if (this.player.hidden)
      return UI.msg("Sal del armario para utilizar una habilidad.");
    id = id || this.mut.equipped;
    const s = SKILLS[id],
      p = this.player,
      m = this.mut;
    if (!s || s.type !== "active" || !m.has(id) || (m.cd[id] || 0) > 0) return;
    if (
      id === "respiracion" &&
      (this.keys.KeyW || this.keys.KeyA || this.keys.KeyS || this.keys.KeyD)
    )
      return UI.msg("Detente un instante para recuperar el aliento.");
    if (id === "trueque" && p.hp <= 13)
      return UI.msg("No tienes salud suficiente para convertirla.");
    const human = s.resource === "stamina",
      cost = Number(s.energy) * (human ? 1 : p.over > 0 ? 0.5 : 1),
      field = human ? "stamina" : "energy";
    if (p[field] < cost)
      return UI.msg(
        human
          ? "Necesitas recuperar estamina."
          : "Energía Riutex insuficiente.",
      );
    p[field] -= cost;
    m.cd[id] = s.cd * (human ? 1 : m.has("blue_neural_7") ? SkillBalance.value(this,'blue_neural_7',.85) : 1);
    ACTIONS[id](this, p);
    if (!human) this.fxMutate();
  };
  const hurt = Player.prototype.hurt;
  Player.prototype.hurt = function (d, a, g) {
    return hurt.call(this, d * (this.shell > 0 ? SkillBalance.value(g,'coraza',.6) : 1), a, g);
  };
  const move = Level.move;
  Level.move = function (e, dx, dy) {
    const k = e === Game.player && e.shell > 0 ? 0.85 : 1;
    move.call(this, e, dx * k, dy * k);
  };
  const fire = Weapons.fire;
  Weapons.fire = function (g, p) {
    const bonus = g.mut.has("recuperacion_tactica") && p.weapon.mag === 1;
    if (bonus) p.mods.pow += SkillBalance.value(g,'recuperacion_tactica',1.1666666667);
    try {
      return fire.call(this, g, p);
    } finally {
      if (bonus) p.mods.pow -= SkillBalance.value(g,'recuperacion_tactica',1.1666666667);
    }
  };
  Game.nearItem = function () {
    let best = null,
      dist = 40;
    for (const it of this.items) {
      const d = Math.hypot(it.x - this.player.x, it.y - this.player.y);
      if (d < dist && Level.los(this.player.x, this.player.y, it.x, it.y)) {
        best = it;
        dist = d;
      }
    }
    // En el rellano del sótano, una escalera y una puerta comparten alcance.
    // La puerta más cercana debe poder abrirse sin volver de planta por accidente.
    if (best?.type === "h_stairs") {
      const door = Level.nearDoor(this.player);
      if (door && door.tiles.some(([x,y]) => Math.hypot(x*32+16-this.player.x,y*32+16-this.player.y) <= dist + .01)) return null;
    }
    return best;
  };
  const draw = Game.drawItem;
  Game.drawItem = function (c, it) {
    if (it.type !== "doc") return draw.call(this, c, it);
    c.save();
    c.translate(it.x, it.y);
    c.rotate(-0.12);
    c.fillStyle = "#252622";
    c.fillRect(-9, -10, 19, 24);
    c.fillStyle = "#d8d2bc";
    c.fillRect(-8, -12, 16, 22);
    c.fillStyle = "#5b6465";
    c.fillRect(-5, -8, 8, 2);
    for (let i = 0; i < 4; i++) c.fillRect(-5, -3 + i * 3, 10 - (i % 2) * 3, 1);
    c.fillStyle = "#9d6c55";
    c.fillRect(2, 3, 4, 4);
    c.restore();
    if (
      Math.hypot(it.x - this.player.x, it.y - this.player.y) < 130 &&
      Level.los(it.x, it.y, this.player.x, this.player.y)
    ) {
      c.strokeStyle = "rgba(211,204,171,.65)";
      c.lineWidth = 1;
      c.beginPath();
      c.arc(it.x, it.y, 16, 0, Math.PI * 2);
      c.stroke();
      c.fillStyle = "#ddd5bb";
      c.font = "9px Arial";
      c.textAlign = "center";
      c.fillText("E · LEER", it.x, it.y - 24);
      c.textAlign = "start";
    }
  };
  const journal = UI.renderJournal;
  UI.renderJournal = function (g, id) {
    journal.call(this, g, id);
    id = g.jSel || id;
    if (!DOCS[id]) return;
    const paper = this.$("jPaper"),
      body = this.$("docB");
    paper.className = "document-sheet";
    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    body.innerHTML = DOCS[id].text
      .split(/\n\s*\n/)
      .map(
        (text, i) =>
          '<p class="' +
          (i === 0 && text.length < 100 ? "document-lead" : "") +
          '">' +
          esc(text)
            .replace(/\n/g, "<br>")
            .replace(/\b\d{1,2}:\d{2}\b|\b\d{4}\b/g, "<mark>$&</mark>") +
          "</p>",
      )
      .join("");
    this.$("jStamp").textContent =
      "SAN GABRIEL / " +
      (id.startsWith("m")
        ? "ARCHIVO WREN"
        : id.startsWith("b_")
          ? "REGISTRO CLÍNICO"
          : "EVIDENCIA");
  };
  const hud = UI.hud;
  UI.hud = function (p, ...args) {
    hud.call(this, p, ...args);
    this.$("st").style.width = (p.stamina / (p.maxStamina || 100)) * 100 + "%";
  };
})();
