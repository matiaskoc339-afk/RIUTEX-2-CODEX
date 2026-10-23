const Blue = {
  floor: null,
  discover(g) {
    const visits = g.story.visited || (g.story.visited = {}),
      tiles = g.story.mapTiles || (g.story.mapTiles = {});
    const known = tiles[g.lvl] || (tiles[g.lvl] = []),
      set = new Set(known),
      x = Math.floor(g.player.x / 32),
      y = Math.floor(g.player.y / 32);
    for (let j = y - 5; j <= y + 5; j++)
      for (let i = x - 6; i <= x + 6; i++)
        if (Level.grid[j]?.[i] !== undefined && Level.grid[j][i] !== 1) {
          const k = i + "," + j;
          if (!set.has(k)) {
            known.push(k);
            set.add(k);
          }
        }
    const room = Hospital.roomAt(g.player),
      key = g.lvl + ":" + room;
    if (room && !visits[key]) {
      visits[key] = true;
      const label = UI.$("location");
      label.textContent = room;
      label.classList.remove("show");
      void label.offsetWidth;
      label.classList.add("show");
    }
    UI.$("zoneName").textContent = room || "Zona de servicio";
    UI.$("phaseBadge").textContent =
      g.lvl === "mansion"
        ? "PRÓLOGO · OPERACIÓN WREN"
        : g.story.seq === "free"
          ? "FASE 1 · EXPLORACIÓN"
          : "FASE 1 · EL DESPERTAR";
  },
  renderMap(g) {
    const lvl = this.floor || g.lvl,
      D = R2_DATA(lvl),
      current = lvl === g.lvl,
      visits = g.story.visited || {},
      tiles = g.story.mapTiles?.[lvl] || [];
    const roomKnown = (r) => visits[lvl + ":" + r[0]],
      W = D.W * 10,
      H = D.H * 10;
    let svg =
      '<svg viewBox="0 0 ' +
      W +
      " " +
      H +
      '" role="img" aria-label="Plano de exploración de ' +
      lvl +
      '">';
    for (const r of D.rooms) {
      if (!roomKnown(r)) continue;
      const [n, x, y, w, h] = r;
      const safe = (D.safe || []).some(
        (a) => x >= a[0] && y >= a[1] && x + w <= a[2] + 1 && y + h <= a[3] + 1,
      );
      svg +=
        '<rect x="' +
        x * 10 +
        '" y="' +
        y * 10 +
        '" width="' +
        w * 10 +
        '" height="' +
        h * 10 +
        '" rx="2" fill="' +
        (safe ? "#174d56" : "#1c3347") +
        '" stroke="#4b7892"/><text x="' +
        (x + w / 2) * 10 +
        '" y="' +
        (y + h / 2) * 10 +
        '" text-anchor="middle" fill="#a9cad9" font-size="9">' +
        n +
        "</text>";
    }
    for (const key of tiles) {
      const [x, y] = key.split(",").map(Number);
      svg +=
        '<rect x="' +
        x * 10 +
        '" y="' +
        y * 10 +
        '" width="10" height="10" fill="#67a5c7" opacity=".14"/>';
    }
    for (const [id, x, y, w, h, key] of D.doors) {
      if (
        !tiles.some((t) => {
          const [a, b] = t.split(",").map(Number);
          return Math.abs(a - x) + Math.abs(b - y) < 4;
        })
      )
        continue;
      const d = current ? Level.doors.find((d) => d.id === id) : null,
        opened = d ? d.open : (g.story.doors?.[lvl] || []).includes(id);
      svg +=
        '<rect x="' +
        x * 10 +
        '" y="' +
        y * 10 +
        '" width="' +
        w * 10 +
        '" height="' +
        h * 10 +
        '" fill="' +
        (opened ? "#78d2d9" : key ? "#df9a76" : "#a6b6bd") +
        '"/>';
    }
    for (const a of D.items) {
      const [id, type, x, y, extra] = a;
      if (extra?.rewardFor && !g.pz[extra.rewardFor]) continue;
      const nearby = tiles.some((t) => {
        const [b, c] = t.split(",").map(Number);
        return Math.abs(b - x) + Math.abs(c - y) < 3;
      });
      const rr = D.rooms.find(
        (r) => x >= r[1] && x < r[1] + r[3] && y >= r[2] && y < r[2] + r[4],
      );
      if (!nearby || g.picked.has(id) || (rr && !roomKnown(rr))) continue;
      let symbol =
        type === "savebed"
          ? "✚"
          : type === "h_stairs"
            ? "↕"
            : type === "caja"
              ? "▣"
              : type === "key"
                ? "◆"
                : type === "doc"
                  ? "·"
                  : type.startsWith("h_")
                    ? "◇"
                    : "•";
      svg +=
        '<text x="' +
        (x + 0.5) * 10 +
        '" y="' +
        (y + 0.9) * 10 +
        '" text-anchor="middle" fill="#d9e9c2" font-size="13">' +
        symbol +
        "</text>";
    }
    if (current)
      svg +=
        '<circle cx="' +
        g.player.x / 3.2 +
        '" cy="' +
        g.player.y / 3.2 +
        '" r="7" fill="#d9f7ff" stroke="#40bdff" stroke-width="3"/>';
    if (typeof HospitalCompass !== "undefined")
      svg += HospitalCompass.markup(g, lvl);
    UI.$("mapDrawing").innerHTML = svg + "</svg>";
    const count = D.rooms.filter(roomKnown).length;
    UI.$("mapStatus").textContent =
      count +
      " / " +
      D.rooms.length +
      " espacios descubiertos · " +
      (current ? "Tu posición se muestra en blanco." : "Otra planta.");
  },
  init(g) {
    g.startLvl = "mansion";
    const mount = (id, html) => {
      const el = document.createElement("section");
      el.id = id;
      el.className = "screen hidden";
      el.innerHTML = html;
      document.body.appendChild(el);
    };
    mount(
      "map",
      '<div class="map-panel"><div class="panel-title"><div><span class="eyebrow">HOSPITAL SAN GABRIEL</span><h2>Encuentra tu camino.</h2></div><button id="mapClose">Cerrar [M]</button></div><nav id="mapFloors"></nav><p id="mapStatus"></p><div id="mapGuidance"></div><div id="mapDrawing"></div><p class="map-legend">● Tú · ◆ Llave · ◇ Mecanismo · ✚ Guardado · ▣ Baúl · ↕ Escalera<br>Azul: abierto · Ámbar: cierre con llave · Verde: refugio</p></div>',
    );
    mount(
      "puzzle",
      '<div class="puzzle-panel"><span class="eyebrow">MECANISMO INTERACTIVO</span><h2 id="puzzleTitle"></h2><p id="puzzleRule"></p><div id="puzzleBody"></div><p id="puzzleFeedback" aria-live="polite"></p><details><summary>Consultar pista del diario</summary><p id="puzzleClue"></p></details><div class="puzzle-actions"><button id="puzzleReset">Reiniciar ajustes</button><button id="puzzleConfirm">Comprobar</button><button id="puzzleClose">Volver [Esc]</button></div></div>',
    );
    UI.$("mapClose").onclick = () => g.resume();
    UI.$("puzzleClose").onclick = () => g.resume();
    UI.$("puzzleConfirm").onclick = () => BluePuzzles.complete(g);
    UI.$("puzzleReset").onclick = () => {
      delete g.story.mechanisms[BluePuzzles.cur.type];
      BluePuzzles.open(g, BluePuzzles.cur.type);
    };
    const hud = UI.$("hud");
    for (const [id, cls] of [
      ["zoneName", ""],
      ["phaseBadge", ""],
      ["location", ""],
      ["controlsHint", ""],
    ]) {
      const e = document.createElement("div");
      e.id = id;
      e.className = cls;
      hud.appendChild(e);
    }
    UI.$("controlsHint").textContent =
      "[M] Plano   [TAB] Maletín   [J] Diario   [K] Adaptación";
    UI.$("treePanel").querySelector("h2").textContent = "Adaptación · Riutex-X";
    UI.$("menu").querySelector("h2").textContent = "EL HOSPITAL AZUL";
    UI.$("menu").querySelector(".menu-kicker").textContent =
      "ANTES DEL COLAPSO · DOS DÍAS ANTES";
    UI.$("bNew").querySelectorAll("span")[1].textContent =
      "Entrar en la historia";
    UI.$("bLegacy").classList.add("hidden");
    UI.$("menu").querySelector(".ctl").innerHTML =
      "Una operación. Un hospital. Algo dentro de ti.<br><span>Fase 1 · Prólogo jugable + exploración libre</span>";
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>BLUE PROTOCOL</span><span>FASE 1 / v0.4.0</span><span>WASD + RATÓN</span>";
    const clues = document.createElement("details");
    clues.id = "padClues";
    clues.innerHTML =
      '<summary>Pistas reunidas</summary><div id="padClueText"></div>';
    UI.$("pad").appendChild(clues);
    const help = document.createElement("p");
    help.className = "pause-help";
    help.textContent =
      "WASD · mover | Shift · correr | E · interactuar / cerrar puerta | Clic · disparar | Clic derecho · golpe | R · recargar | 1–5 · armas | F · inyección | Q / Z · poderes | M · mapa | TAB · inventario | J · diario | K · habilidades";
    UI.$("pause").appendChild(help);
    const settings = document.createElement("label");
    settings.className = "setting";
    settings.innerHTML =
      'Volumen <input id="blueVolume" type="range" min="0" max="100" value="65">';
    UI.$("pause").appendChild(settings);
    UI.$("blueVolume").oninput = (e) => {
      const value = Number(e.target.value) / 100;
      Sound.volume = value;
      if (Sound.ambientGain) Sound.ambientGain.gain.value = 0.05 * value;
    };
  },
};
(() => {
  const showPad = UI.showPad;
  UI.showPad = function (...args) {
    showPad.apply(this, args);
    const id = Puzzles.cur?.id,
      docs =
        id === "h_cab"
          ? ["a1", "h1", "f1"]
          : id === "h_safe"
            ? ["p4", "p9"]
            : [];
    this.$("padClueText").textContent =
      docs
        .filter((k) => Game.inv.docs.includes(k))
        .map((k) => DOCS[k].title + "\n" + DOCS[k].text)
        .join("\n\n") ||
      "Todavía no has recogido las notas relacionadas con esta cerradura. Puedes salir y buscar pistas.";
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    for (const id of ["map", "puzzle"])
      this.$(id).classList.toggle("hidden", name !== id);
  };
  Game.toggleMap = function () {
    if (this.state === "map") return this.resume();
    if (this.state !== "play") return;
    Blue.floor = this.lvl;
    const nav = UI.$("mapFloors");
    nav.innerHTML = "";
    for (const [id, title] of [
      ["mansion", "Mansión"],
      ["hospital", "Planta baja"],
      ["hospital1", "Primer piso"],
      ["hospitalb", "Sótano"],
      ["hospitalchem", "Contención C-0"],
      ["hospitalworks", "Cloacas / Fábrica"],
      ["hospitalpit", "Almacén circular"],
      ["hospitalnest", "Último colector"],
      ["hospitalcells", "Calabozos de Valcárcel"],
      ["hospitalcastle", "Castillo · planta baja"],
      ["hospitalcastle1", "Castillo · planta alta"],
      ["hospitalroyal", "Sala real"],
      ["hospitalumbra", "Laboratorio UMBRAL"],
      ["hospitalorigin", "Núcleo ORIGEN"],
      ["hospitalstreet", "Calles de San Gabriel"],
    ]) {
      if (
        id !== this.lvl &&
        !Object.keys(this.story.visited || {}).some((k) =>
          k.startsWith(id + ":"),
        )
      )
        continue;
      const b = document.createElement("button");
      b.textContent = title;
      b.onclick = () => {
        Blue.floor = id;
        Blue.renderMap(this);
      };
      nav.appendChild(b);
    }
    this.state = "map";
    UI.screen("map");
    Blue.renderMap(this);
  };
  const init = Game.init;
  Game.init = function () {
    Blue.init(this);
    init.call(this);
  };
  const start = Game.start;
  Game.start = function (load, sv) {
    start.call(this, load, sv);
    this.keys = {};
    this.mouse.down = false;
    this.cam.x = this.player.x - this.cv.width / 2;
    this.cam.y = this.player.y - this.cv.height / 2;
    this.mouse.x = this.cv.width / 2;
    this.mouse.y = this.cv.height / 2 - 100;
  };
  const update = Game.update;
  Game.update = function (dt) {
    update.call(this, dt);
    if (this.state !== "play") return;
    Blue.discover(this);
    const p = this.player;
    if (
      this.mut.has("blue_vital_7") &&
      p.hp < p.maxHp * SkillBalance.value(this,'blue_vital_7',.6) &&
      !this.enemies.some(
        (e) => !e.dead && !e.dormant && Math.hypot(e.x - p.x, e.y - p.y) < 270,
      )
    )
      p.hp = Math.min(p.maxHp * SkillBalance.value(this,'blue_vital_7',.6), p.hp + dt);
  };
  const take = Game.take;
  Game.take = function (it) {
    const doc = it?.type === "doc";
    if (doc && (this.picked.has(it.id) || !this.items.includes(it))) return;
    const fresh = doc && !this.inv.docs.includes(it.doc);
    take.call(this, it);
    if (fresh && this.inv.docs.includes(it.doc)) this.player.xp += R2_XP.document;
  };
  const openDoc = Game.openDoc;
  Game.openDoc = function (id) {
    if (this.lvl === "mansion" && id === "m2") {
      this.pz["h:briefing"] = true;
      Hospital.say(
        this,
        [
          "Axel: «03:40. El reloj del estudio es una cerradura. Ibarra, revisa el comedor.»",
        ],
        3,
      );
    }
    return openDoc.call(this, id);
  };
  const objective = Game.objective;
  Game.objective = function () {
    if (this.lvl === "mansion" && !this.pz["h:briefing"] && !this.story.finale)
      return "Sigue al escuadrón hasta la biblioteca, al oeste del salón. Lee la nota de Marta.";
    return objective.call(this);
  };
  const why = Game.doorWhy;
  Game.doorWhy = function (d) {
    if (d.key === "h:briefing")
      return "Ibarra cubre el comedor. Primero revisa la biblioteca, al oeste del salón.";
    return why.call(this, d);
  };
  const drawItem = Hospital.drawItem;
  Hospital.drawItem = function (c, it) {
    if (["h_mix", "h_hydro", "h_eeg", "h_security"].includes(it.type)) {
      c.fillStyle = "#274052";
      c.fillRect(-13, -15, 26, 30);
      c.fillStyle = "#86d6ed";
      c.fillRect(-9, -11, 18, 12);
      c.fillStyle = "#142d41";
      c.fillRect(-5, 5, 10, 3);
      return true;
    }
    return drawItem.call(this, c, it);
  };
  const hurt = Player.prototype.hurt;
  Player.prototype.hurt = function (d, a, g) {
    return hurt.call(this, d * (g.mut.has("blue_flow_7") ? SkillBalance.value(g,'blue_flow_7',.9) : 1), a, g);
  };
  const kill = Player.prototype.onKill;
  Player.prototype.onKill = function (g) {
    kill.call(this, g);
    if (g.mut.has("blue_body_7"))
      this.energy = Math.min(this.maxEnergy, this.energy + 6);
  };
  const dodge = Player.prototype.dodge;
  Player.prototype.dodge = function (g, d, t) {
    return dodge.call(this, g, d * (g.mut.has("blue_force_7") ? SkillBalance.value(g,'blue_force_7',1.2) : 1), t);
  };
  const cast = Game.castSkill;
  Game.castSkill = function (id) {
    const skill = id || this.mut.equipped,
      energy = this.player.energy;
    cast.call(this, id);
    if (this.mut.has("blue_neural_7") && this.player.energy < energy)
      this.mut.cd[skill] *= SkillBalance.value(this,'blue_neural_7',.85);
  };
  const use = Inventory.prototype.use;
  Inventory.prototype.use = function (g) {
    const hp = g.player.hp;
    const selected =
      this.items[this.sel] || this.items.find((i) => ITEMS[i.type].use);
    const green = selected?.type === "inj_green";
    use.call(this, g);
    if (green && g.mut.has("blue_medic_7") && g.player.hp > hp)
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + 15);
  };
  const fire = Weapons.fire;
  Weapons.fire = function (g, p) {
    g.blueShooting = true;
    try {
      return fire.call(this, g, p);
    } finally {
      g.blueShooting = false;
    }
  };
  const ehurt = Enemy.prototype.hurt;
  Enemy.prototype.hurt = function (d, a, g, ...args) {
    if (
      g.mut.has("blue_aim_7") &&
      this.hp < (this.maxHp || this.def.hp) * 0.3 &&
      g.blueShooting
    )
      d *= SkillBalance.value(g,'blue_aim_7',1.25);
    return ehurt.call(this, d, a, g, ...args);
  };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    tick.call(this, g, dt);
    if (g.mut.has("blue_ghost_7") && g.noise && g.player.flash <= 0)
      g.noise.r *= SkillBalance.value(g,'blue_ghost_7',.75);
  };
  const boss = Hospital.buildLevel;
  Hospital.buildLevel = function (g, lvl, sv) {
    boss.call(this, g, lvl, sv);
    if (g.carn && lvl === "hospitalb") g.carn.intro = null;
  };
})();
