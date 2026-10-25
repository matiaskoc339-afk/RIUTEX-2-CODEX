// Fase 1 · v0.5: escenas obligatorias, tutorial de llegada y red de adaptación conectada.
const Guidebook = {
  automatic: false,
  returnState: "play",
  icon(kind) {
    const shapes = {
      move: '<path d="M32 9v46M9 32h46m-23-23-7 7m7-7 7 7M9 32l7-7m-7 7 7 7m39-7-7-7m7 7-7 7M32 55l-7-7m7 7 7-7"/>',
      aim: '<circle cx="32" cy="32" r="17"/><path d="M32 5v13m0 28v13M5 32h13m28 0h13"/><circle cx="32" cy="32" r="3"/>',
      bag: '<rect x="10" y="20" width="44" height="33" rx="4"/><path d="M23 20v-9h18v9M10 34h44M24 29v10m16-10v10"/>',
      door: '<path d="M16 55V9h32v46M16 9l25 8v38H16m17-21h1M8 55h48"/>',
      vial: '<path d="M24 7h16m-13 0v18L15 47q-4 10 8 10h18q12 0 8-10L37 25V7M21 37h22"/><circle cx="29" cy="43" r="2"/><circle cx="37" cy="50" r="3"/>',
      notes:
        '<path d="M16 8h25l9 9v39H16zM40 8v11h10M23 28h20M23 35h20M23 42h14"/>',
    };
    return (
      '<svg viewBox="0 0 64 64" aria-hidden="true">' + shapes[kind] + "</svg>"
    );
  },
  init(g) {
    const el = document.createElement("section");
    el.id = "tutorial";
    el.className = "screen hidden";
    el.innerHTML =
      '<div class="survival-manual"><div class="manual-heading"><span class="eyebrow">HOSPITAL SAN GABRIEL · GUÍA DE SUPERVIVENCIA</span><h2>Primero, mantente vivo.</h2><p id="tutorialContext"></p></div><div class="manual-cards"></div><div class="manual-footer"><span>Siempre puedes volver a esta guía desde la pausa.</span><button id="tutorialClose">Entendido · volver al vestíbulo</button></div></div>';
    const data = [
      [
        "move",
        "Muévete con intención",
        "<kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> mover · <kbd>Shift</kbd> correr",
        "Correr y disparar consumen estamina. Mucho ruido seguido atrae al Carnicero.",
      ],
      [
        "aim",
        "Apunta y crea espacio",
        "Ratón apuntar · clic disparar · <kbd>R</kbd> recargar",
        "Clic derecho: golpe (consume Riutex al mutar). <kbd>1–5</kbd> cambia de arma.",
      ],
      [
        "door",
        "Las puertas te dan tiempo",
        "<kbd>E</kbd> abrir, cerrar o esconderte",
        "Rompe la línea de visión antes de entrar en una taquilla.",
      ],
      [
        "bag",
        "Lleva lo que necesitas",
        "<kbd>Tab</kbd> maletín · <kbd>R</kbd> girar un objeto",
        "<kbd>F</kbd> usa una inyección. Guarda en las camillas; usa los baúles.",
      ],
      [
        "notes",
        "Observa, lee y vuelve",
        "<kbd>J</kbd> diario · <kbd>M</kbd> plano",
        "Los documentos contienen pistas. Las salas se descubren al entrar.",
      ],
      [
        "vial",
        "El Riutex cambia tu cuerpo",
        "<kbd>K</kbd> adaptación · compra las técnicas que prefieras",
        "<kbd>K</kbd> adaptación: inicio común, conexiones y elecciones doradas.",
      ],
    ];
    document.body.appendChild(el);
    const cards = el.querySelector(".manual-cards");
    for (const [k, title, keys, text] of data) {
      const card = document.createElement("article");
      card.innerHTML =
        this.icon(k) +
        "<div><h3>" +
        title +
        '</h3><p class="manual-keys">' +
        keys +
        "</p><p>" +
        text +
        "</p></div>";
      cards.appendChild(card);
    }
    UI.$("tutorialClose").onclick = () => this.close(g);
    const replay = document.createElement("button");
    replay.textContent = "Guía de supervivencia";
    replay.id = "bTutorial";
    replay.onclick = () => this.open(g, false);
    UI.$("pause").appendChild(replay);
  },
  open(g, automatic = true) {
    this.automatic = automatic;
    this.returnState = g.state === "pause" ? "pause" : "play";
    g.keys = {};
    g.mouse.down = false;
    UI.$("tutorialContext").textContent =
      automatic && !g.story.armHealed
        ? "La persiana te protege por un momento. Cierra esta guía y pulsa F: el frasco sigue en tu bota."
        : "Aprende lo esencial; el resto lo descubrirás explorando.";
    g.state = "tutorial";
    UI.screen("tutorial");
  },
  close(g) {
    g.keys = {};
    g.mouse.down = false;
    if (this.automatic) g.story.tutorialSeen = true;
    if (this.returnState === "pause") {
      g.state = "pause";
      UI.screen("pause");
    } else {
      g.resume();
      EscapeGuide.tick(g);
      if (this.automatic) Hospital.checkpoint(g);
    }
  },
};
const RevisionScenes = {
  finale(g) {
    if (g.story.finale) return;
    g.story.finale = true;
    g.story.vial = true;
    g.story.captureHeavy = true;
    Hospital.ft = 0;
    Hospital.q = [];
    Level.lamps = [];
    const d = Level.doors.find((d) => d.id === "secreto");
    if (d) {
      Level.closeDoor(d, true);
      d.key = "h:capture";
      d.tiles.forEach(([x, y]) => (Level.grid[y][x] = 3));
    }
    g.custodio = {
      x: 32.5 * 32,
      y: 8.2 * 32,
      face: -Math.PI / 2,
      r: 13,
      path: [],
      pathT: 0,
    };
    g.cam.shake = 9;
    Sound.tone(45, 1.5, 0.2, "sawtooth");
    UI.msg(
      "La puerta se cierra. Las piernas te pesan. Algo entra contigo.",
      5000,
    );
  },
  captureTick(g, dt) {
    const c = g.custodio,
      p = g.player;
    if (!c) return;
    Hospital.ft += dt;
    if (Hospital.ft < 1.2) {
      c.face = Math.atan2(p.y - c.y, p.x - c.x);
      return;
    }
    c.pathT -= dt;
    if (c.pathT <= 0) {
      c.path = Nav.path(c.x, c.y, p.x, p.y) || [];
      c.pathT = 0.18;
    }
    while (
      c.path.length &&
      Math.hypot(c.path[0][0] - c.x, c.path[0][1] - c.y) < 8
    )
      c.path.shift();
    let target = c.path[0];
    if (Nav.fatLos(c.x, c.y, p.x, p.y, 12)) target = [p.x, p.y];
    if (target) {
      const a = Math.atan2(target[1] - c.y, target[0] - c.x);
      c.face = a;
      Level.move(c, Math.cos(a) * 142 * dt, Math.sin(a) * 142 * dt);
    }
    if (Math.hypot(c.x - p.x, c.y - p.y) < 30) {
      g.story.finale = false;
      g.story.captureHeavy = false;
      g.custodio = null;
      Hospital.toHospital(g);
    }
  },
  doorStrike(g) {
    const s = g.story,
      p = g.player,
      c = g.carn;
    if (s.armCut) return;
    s.armCut = true;
    s.armHealed = false;
    s.seq = "wounded_run";
    s.firstDoorHits = 1;
    p.hp = Math.min(p.hp, 25);
    p.hidden = false;
    p.knx = 160;
    p.kny = 0;
    g.pz["h:forced"] = true;
    const d = Level.doors.find((d) => d.id === "forced");
    if (d) Level.openDoor(d);
    g.pz["h:shutter"] = true;
    if (c) {
      c.stagger = 3.5;
      c.atkCd = 8;
      c.hunt = true;
    }
    g.cam.shake = 13;
    Sound.play("hurt");
    Sound.play("door");
    UI.vignette();
    UI.msg(
      "El golpe te arranca el brazo y revienta el cierre. ¡La puerta está abierta! Sigue hasta el vestíbulo.",
      6000,
    );
  },
  arrive(g) {
    const s = g.story,
      d = Level.doors.find((d) => d.id === "shutter");
    s.seq = s.armHealed ? "free" : "lobby_inject";
    g.pz["h:shutter"] = false;
    if (d) {
      Level.closeDoor(d, true);
      d.key = "h:shutter";
      d.tiles.forEach(([x, y]) => (Level.grid[y][x] = 3));
    }
    if (g.carn) {
      Object.assign(g.carn, {
        dormant: true,
        scripted: false,
        hunt: false,
        state: "patrol",
        x: 48,
        y: 48,
      });
    }
    s.carnActive = false;
    g.carnT = 0;
    g.keys = {};
    Sound.play("door");
    g.cam.shake = 7;
    Hospital.q = [];
    Hospital.checkpoint(g);
    if (!s.armHealed && !s.tutorialSeen) Guidebook.open(g, true);
    else
      UI.msg(
        s.armHealed
          ? "Estás en el vestíbulo. Explora con cuidado."
          : "La persiana lo ha dejado atrás. Pulsa F para inyectarte el frasco.",
        6000,
      );
  },
};
(() => {
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    Guidebook.init(this);
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>RIUTEX 2</span><span>FASE 1 / v0.5.0</span><span>WASD + RATÓN</span>";
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    document
      .getElementById("tutorial")
      ?.classList.toggle("hidden", name !== "tutorial");
  };
  addEventListener(
    "keydown",
    (e) => {
      if (Game.state === "tutorial" && ["Escape", "Enter"].includes(e.code)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!e.repeat) Guidebook.close(Game);
      }
    },
    true,
  );
  Hospital.finale = RevisionScenes.finale;
  Hospital.finaleTick = RevisionScenes.captureTick;
  Hospital.lobbyReached = RevisionScenes.arrive;
  const move = Level.move;
  Level.move = function (e, dx, dy) {
    const slow =
      e === Game.player && Game.lvl === "mansion" && Game.story.captureHeavy
        ? 0.38
        : 1;
    move.call(this, e, dx * slow, dy * slow);
  };
  const hit = Carnicero.prototype.hitPlayer;
  Carnicero.prototype.hitPlayer = function (g) {
    if (g.lvl === "hospital" && g.story.seq === "run") {
      if (g.player.x >= 43 * 32 && g.player.y < 9 * 32)
        return RevisionScenes.doorStrike(g);
      g.player.hp = Math.max(25, g.player.hp - 6);
      g.player.knx = 140;
      this.stagger = 1.8;
      UI.msg("¡Corre hasta la puerta del fondo!", 1800);
      return;
    }
    if (["wounded_run", "lobby_inject"].includes(g.story.seq)) {
      this.stagger = 2;
      g.player.knx = 140;
      return;
    }
    return hit.call(this, g);
  };
  const inject = Hospital.inject;
  Hospital.inject = function (g) {
    const atLobby = g.story.seq === "lobby_inject";
    inject.call(this, g);
    if (atLobby) {
      g.story.seq = "free";
      g.pz["h:shutter"] = false;
      const d = Level.doors.find((d) => d.id === "shutter");
      if (d) {
        Level.closeDoor(d, true);
        d.key = "h:shutter";
        d.tiles.forEach(([x, y]) => (Level.grid[y][x] = 3));
      }
      if (g.carn) g.carn.dormant = true;
      Hospital.checkpoint(g);
      UI.msg(
        "El brazo vuelve a crecer. K: elige tu adaptación. Reflejos e Instinto son opcionales.",
        7000,
      );
    }
  };
  const use = Game.useInj;
  Game.useInj = function () {
    if (
      this.story.armCut &&
      !this.story.armHealed &&
      this.story.seq !== "lobby_inject"
    )
      return UI.msg(
        "Llega al vestíbulo antes de usar el frasco. Sigue por el pasillo.",
        4000,
      );
    if (this.story.seq === "lobby_inject" && this.state === "play")
      return Hospital.inject(this);
    return use.call(this);
  };
  const tick = Hospital.tick;
  Hospital.tick = function (g, dt) {
    tick.call(this, g, dt);
    if (g.state !== "play" || g.lvl !== "hospital") return;
    const s = g.story,
      p = g.player;
    if (s.seq === "wounded_run") {
      const d = Level.doors.find((d) => d.id === "shutter");
      if (d && !d.open && Math.hypot(52.5 * 32 - p.x, 20.5 * 32 - p.y) < 110)
        Level.openDoor(d);
      if (p.y > 23 * 32 && p.x > 47 * 32) RevisionScenes.arrive(g);
    }
    if (s.seq === "lobby_inject" && g.carn) g.carn.dormant = true;
  };
  const guide = EscapeGuide.tick;
  EscapeGuide.tick = function (g) {
    if (g.lvl === "mansion" && g.story.finale) {
      UI.$("escapeGuide").classList.add("hidden");
      this.target = null;
      return;
    }
    if (
      g.lvl === "hospital" &&
      ["run", "wounded_run", "lobby_inject"].includes(g.story.seq)
    ) {
      const s = g.story,
        el = UI.$("escapeGuide");
      let title, body;
      if (s.seq === "run") {
        title =
          g.player.x > 40 * 32 ? "EL CIERRE NO CEDE" : "CORRE HASTA LA PUERTA";
        body =
          g.player.x > 40 * 32
            ? "Sigue empujando hacia la puerta. El golpe romperá el cierre."
            : "[WASD] muévete · Mantén [Shift] →";
        this.target = [43.5 * 32, 7.5 * 32];
      } else if (s.seq === "wounded_run") {
        title = "LA PUERTA YA ESTÁ ABIERTA";
        body =
          g.player.x < 50 * 32
            ? "Sigue a la derecha →. Todavía no uses el frasco."
            : "Baja por el pasillo ↓. La persiana lleva al vestíbulo.";
        this.target =
          g.player.x < 50 * 32 ? [52.5 * 32, 7.5 * 32] : [52.5 * 32, 23.5 * 32];
      } else {
        title = "AHORA · INYECTA EL RIUTEX";
        body = "La persiana te protege. Pulsa [F] para usar el frasco.";
        this.target = null;
      }
      el.classList.remove("hidden");
      el.classList.toggle("urgent", s.seq === "lobby_inject");
      el.innerHTML = "<strong>" + title + "</strong><span>" + body + "</span>";
      return;
    }
    guide.call(this, g);
  };
  const objective = Game.objective;
  Game.objective = function () {
    if (this.lvl === "mansion" && this.story.finale)
      return "La puerta está cerrada. El Custodio está contigo.";
    if (this.story.seq === "wounded_run")
      return "Atraviesa la puerta abierta y llega al vestíbulo. Después podrás inyectarte.";
    if (this.story.seq === "lobby_inject")
      return "Pulsa F para inyectarte el Riutex a salvo en el vestíbulo.";
    if (this.story.seq === "run")
      return "Corre hasta la puerta del fondo. Aguanta el primer golpe junto al cierre.";
    return objective.call(this);
  };
  const why = Game.doorWhy;
  Game.doorWhy = function (d) {
    if (d.key === "h:capture")
      return "El mecanismo ha quedado bloqueado desde dentro.";
    if (d.key === "h:forced")
      return "El cierre está atascado. Empuja hacia la puerta.";
    return why.call(this, d);
  };
  const prompt = Game.promptText;
  Game.promptText = function () {
    if (
      this.lvl === "hospital" &&
      this.story.seq === "run" &&
      this.player.x > 41 * 32
    )
      return "El cierre no cede · continúa hacia la puerta";
    return prompt.call(this);
  };
  const start = Game.start;
  Game.start = function (load, sv) {
    start.call(this, load, sv);
    if (this.story.seq === "cut" && !this.story.armHealed) {
      this.story.seq = "wounded_run";
      const d = Level.doors.find((d) => d.id === "forced");
      if (d) Level.openDoor(d);
    }
    if (this.story.seq === "lobby_inject" && !this.story.tutorialSeen)
      Guidebook.open(this, true);
  };
})();
const RevisionTree = {
  common: ["vigor", "aguante", "foco", "veloz", "blue_vital_0", "blue_ghost_0"],
  rows: [],
  groups: 2,
  configure() {
    const neutral = new Set(["core", "reflejos", "instinto", ...this.common]);
    const pools = { hum: [], mut: [] };
    for (const lane of BlueSkills.lanes)
      for (const id of lane.order)
        if (!neutral.has(id)) pools[T2[id].br].push(id);
    const node = (id, px, py, requires, extra = {}) =>
      Object.assign(T2[id], {
        px,
        py,
        requires,
        links: [...requires],
        ...extra,
      });
    node("core", 80, 650, [], { br: "neu", lane: -1 });
    node("reflejos", 210, 585, ["core"], {
      br: "neu",
      resource: "stamina",
      lane: -1,
    });
    node("instinto", 210, 715, ["core"], {
      br: "neu",
      resource: "energy",
      lane: -1,
    });
    this.common.forEach((id, i) =>
      node(id, 320 + i * 105, 650, [i ? this.common[i - 1] : "core"], {
        br: "neu",
        lane: -1,
      }),
    );
    for (const br of ["hum", "mut"]) {
      const rows = [[], [], []];
      pools[br].forEach((id, i) => rows[i % 3].push(id));
      this.rows.push(...rows);
    }
    const offsets = [-270, -160, -65, 65, 160, 270];
    this.rows.forEach((row, ri) =>
      row.forEach((id, col) => {
        const spread = Math.min(1, 0.72 + col * 0.08),
          y = 650 + offsets[ri] * spread + (col % 2 ? 12 : -12);
        const req = [col ? row[col - 1] : this.common[this.common.length - 1]];
        // Reencuentros cortos entre recorridos de la misma tendencia.
        if (col > 0 && [4, 9, 14].includes(col) && ri % 3 !== 0) {
          const other = this.rows[ri - 1]?.[col - 1];
          if (other) req.push(other);
        }
        node(id, 1070 + col * 120, y, req, { lane: ri });
      }),
    );
    for (const [col, id, name] of [
      [5, "bridge_balance", "Equilibrio orgánico"],
      [10, "bridge_control", "Control del compuesto"],
      [14, "bridge_converge", "Convergencia"],
    ]) {
      T2[id] = {
        phase: 1,
        kind: "major",
        type: "passive",
        name,
        cost: 16 + col,
        desc: "+8 de salud máxima y +8 de estamina máxima. Une preparación humana y adaptación mutante.",
        mod: { hp: 8, capacity: 8 },
        br: "neu",
        lane: 6,
        px: 1070 + col * 120,
        py: 650,
        requires: [this.rows[2][col - 1], this.rows[3][col - 1]],
        links: [],
      };
    }
    const specs = [
      [
        "gold_reload",
        "hum",
        "Táctica serena",
        "Cada recarga terminada devuelve 12 de estamina y concede 3 s de concentración.",
        {},
      ],
      [
        "gold_catalyst",
        "mut",
        "Catalizador",
        "Tus poderes consumen un 12 % menos de energía Riutex.",
        {},
      ],
      [
        "gold_triage",
        "hum",
        "Triaje de combate",
        "Las inyecciones verdes curan 20 de salud adicionales y recuperan 30 de estamina.",
        {},
      ],
      [
        "gold_leech",
        "mut",
        "Simbiosis",
        "Cada baja devuelve 3 de salud y 5 de energía Riutex adicionales.",
        {},
      ],
      [
        "gold_control",
        "hum",
        "Control total",
        "+15 % de daño con armas y +15 % de recuperación de estamina.",
        { gun: 0.15, stam: 0.15 },
      ],
      [
        "gold_reservoir",
        "mut",
        "Sobrecarga estable",
        "+30 de energía Riutex máxima y +30 % de regeneración de energía.",
        { en: 30, eregen: 0.3 },
      ],
      [
        "gold_veteran",
        "hum",
        "Veterano",
        "+20 de salud y +24 de estamina máxima.",
        { hp: 20, capacity: 24 },
      ],
      [
        "gold_evolution",
        "mut",
        "Evolución perfecta",
        "La transformación corporal dura un 50 % más. +12 de salud máxima.",
        { hp: 12 },
      ],
    ];
    specs.forEach(([id, br, name, desc, mod], i) => {
      const group = Math.floor(i / 2),
        col = [3, 7, 11, 16][group],
        row = br === "hum" ? 1 : 4,
        second = br === "hum" ? 2 : 3;
      const req = [
        this.rows[row][Math.min(col - 1, this.rows[row].length - 1)],
        this.rows[second][Math.min(col - 1, this.rows[second].length - 1)],
      ];
      T2[id] = {
        phase: 1,
        kind: "gold",
        type: "passive",
        name,
        cost: 24 + group * 10,
        desc,
        mod,
        br,
        gold: "special_" + group,
        lane: 7,
        px: 1070 + col * 120,
        py: br === "hum" ? 593 : 707,
        requires: req,
        links: [],
      };
    });
    // Bifurcaciones propias: cada pareja comparte requisito y queda fuera de las vías principales.
    const add = (id, br, name, desc, cost, px, py, requires, extra = {}) => {
      T2[id] = {
        phase: 1,
        kind: "major",
        type: "passive",
        name,
        desc,
        cost,
        br,
        px,
        py,
        requires,
        links: [],
        lane: 8,
        ...extra,
      };
    };
    add(
      "choice_human",
      "hum",
      "Criterio táctico",
      "+5 % de velocidad de recarga. Abre una elección entre dos doctrinas humanas.",
      12,
      1310,
      245,
      [this.rows[0][2]],
      { mod: { reload: 0.05 } },
    );
    add(
      "choice_mutant",
      "mut",
      "Afinidad orgánica",
      "+8 de reserva Riutex. Abre una elección entre dos simbiosis mutantes.",
      12,
      1310,
      1055,
      [this.rows[5][2]],
      { mod: { en: 8 } },
    );
    for (const [br, ids, y] of [
      ["hum", ["gold_reload", "gold_triage"], 105],
      ["mut", ["gold_catalyst", "gold_leech"], 1195],
    ]) {
      ids.forEach((id, i) =>
        Object.assign(T2[id], {
          gold: "doctrine_" + br,
          cost: 28,
          px: 1190 + i * 250,
          py: y,
          requires: [br === "hum" ? "choice_human" : "choice_mutant"],
        }),
      );
    }
    // Las otras maestrías se conservan al cargar partidas anteriores, sin exclusión dorada.
    [
      "gold_control",
      "gold_veteran",
      "gold_reservoir",
      "gold_evolution",
    ].forEach((id, i) => {
      const human = i < 2,
        row = human ? i : i + 1,
        end = this.rows[row];
      Object.assign(T2[id], {
        gold: null,
        kind: "major",
        px: 3400,
        py: [390, 510, 790, 910][i],
        requires: [end[end.length - 1]],
      });
    });
    add(
      "shadow_breath",
      "hum",
      "Respiración contenida",
      "+8 de estamina máxima. Un desvío hacia el sigilo en penumbra.",
      8,
      1710,
      265,
      [this.rows[0][4]],
      { mod: { capacity: 8 } },
    );
    add(
      "shadow_step",
      "hum",
      "Suela blanda",
      "Tus pasos al caminar hacen un 25 % menos de ruido.",
      12,
      1830,
      180,
      ["shadow_breath"],
    );
    add(
      "camuflaje",
      "hum",
      "Camuflaje en penumbra",
      "Durante 8 s, los infectados y el Carnicero pierden tu rastro en penumbra a más de 90 px. Correr, atacar, recibir daño o entrar en luz intensa lo cancela. No oculta ante el jefe.",
      24,
      1970,
      90,
      ["shadow_step"],
      { type: "active", resource: "stamina", energy: 26, cd: 28 },
    );
    add(
      "steady_hands",
      "hum",
      "Pulso medido",
      "+8 % de velocidad de recarga. Desvío de preparación de tiro.",
      10,
      2380,
      275,
      [this.rows[0][10]],
      { mod: { reload: 0.08 } },
    );
    add(
      "steady_lungs",
      "hum",
      "Control diafragmático",
      "+16 de estamina máxima.",
      14,
      2520,
      190,
      ["steady_hands"],
      { mod: { capacity: 16 } },
    );
    add(
      "disparo_sereno",
      "hum",
      "Ventana de precisión",
      "Durante 6 s: menos dispersión y +30 % de daño con armas mientras caminas o permaneces quieto. Correr cancela la técnica.",
      26,
      2670,
      100,
      ["steady_lungs"],
      { type: "active", resource: "stamina", energy: 30, cd: 24 },
    );
    add(
      "chrono_sense",
      "mut",
      "Percepción dilatada",
      "+8 de reserva Riutex. Abre una especialización temporal.",
      10,
      1720,
      1020,
      [this.rows[5][4]],
      { mod: { en: 8 } },
    );
    add(
      "chrono_reserve",
      "mut",
      "Nudo temporal",
      "+10 % de regeneración de Riutex.",
      15,
      1860,
      1110,
      ["chrono_sense"],
      { mod: { eregen: 0.1 } },
    );
    add(
      "suspension",
      "mut",
      "Suspensión temporal",
      "Detiene 3 s a los infectados y proyectiles hostiles a 280 px. El Carnicero y los jefes se ralentizan un 75 %. El campo queda donde lo activas.",
      32,
      2010,
      1200,
      ["chrono_reserve"],
      { type: "active", resource: "energy", energy: 48, cd: 32 },
    );
    add(
      "feral_tissue",
      "mut",
      "Tejido depredador",
      "+8 de salud máxima. Un desvío hacia una forma de ataque.",
      10,
      2380,
      1030,
      [this.rows[5][10]],
      { mod: { hp: 8 } },
    );
    add(
      "feral_fibre",
      "mut",
      "Fibras de acecho",
      "+10 % de daño cuerpo a cuerpo.",
      15,
      2520,
      1120,
      ["feral_tissue"],
      { mod: { melee: 0.1 } },
    );
    add(
      "forma_acechador",
      "mut",
      "Forma del acechador",
      "Transformación de 9 s: cuchilla orgánica, +20 % de velocidad y 25 % menos de daño recibido. Las armas de fuego quedan bloqueadas mientras dura.",
      32,
      2670,
      1210,
      ["feral_fibre"],
      { type: "active", resource: "energy", energy: 45, cd: 30 },
    );
    for (const [id, s] of Object.entries(T2)) {
      s.links = [...(s.requires || [])];
    }
    for (const [id, s] of Object.entries(T2))
      for (const p of s.requires || [])
        if (T2[p] && !T2[p].links.includes(id)) T2[p].links.push(id);
    const can = Mutation.prototype.canBuy;
    Mutation.prototype.canBuy = function (id, xp) {
      if (Trees.cur !== "r2") return can.call(this, id, xp);
      const s = SKILLS[id];
      if (!s) return "Nodo desconocido.";
      if (this.has(id)) return "Ya adquirida.";
      if (s.gold) {
        const chosen = [...this.owned].find((k) => SKILLS[k]?.gold === s.gold);
        if (chosen)
          return "Elección sellada: ya elegiste " + SKILLS[chosen].name + ".";
      }
      const missing = (s.requires || []).filter((k) => !this.has(k));
      if (missing.length)
        return (
          (missing.length > 1 ? "Necesitas ambas: " : "Antes: ") +
          missing.map((k) => SKILLS[k].name).join(" + ")
        );
      return xp < s.cost ? "EXP insuficiente." : null;
    };
    BlueSkills.view = null;
  },
  edges(g) {
    let svg = "";
    for (const [id, s] of Object.entries(SKILLS))
      for (const k of s.requires || []) {
        const p = SKILLS[k];
        if (!p) continue;
        const on = g.mut.has(k),
          color = s.gold
            ? "#c6a459"
            : s.br === "hum"
              ? on
                ? "#63b6ed"
                : "#376b94"
              : s.br === "mut"
                ? on
                  ? "#bf89ed"
                  : "#78519b"
                : on
                  ? "#a2bba0"
                  : "#536354",
          mid = (s.px + p.px) / 2;
        svg +=
          '<path d="M' +
          p.px +
          " " +
          p.py +
          "C" +
          mid +
          " " +
          p.py +
          " " +
          mid +
          " " +
          s.py +
          " " +
          s.px +
          " " +
          s.py +
          '" fill="none" stroke="' +
          color +
          '" stroke-width="' +
          (s.gold ? 2.8 : on ? 2.4 : 1.7) +
          '" opacity="' +
          (on ? ".85" : ".55") +
          '"/>';
      }
    return svg;
  },
  backdrop(box) {
    const fluid = document.createElement("div");
    fluid.className = "riutex-reactor";
    fluid.setAttribute("aria-hidden", "true");
    fluid.innerHTML =
      Array.from(
        { length: 9 },
        (_, i) =>
          '<i style="--n:' +
          i +
          ";--size:" +
          (110 + ((i * 43) % 160)) +
          "px;--left:" +
          (i * 13 - 4) +
          "%;--delay:" +
          -i * 3.7 +
          's"></i>',
      ).join("") + '<span class="reactor-scale"></span>';
    box.appendChild(fluid);
  },
  notes(s, m) {
    let text = "";
    if (s.requires?.length > 1)
      text +=
        "\nRequiere AMBOS: " +
        s.requires.map((k) => SKILLS[k].name).join(" + ");
    if (s.gold) {
      const other = Object.values(SKILLS).find(
        (k) => k.gold === s.gold && k !== s,
      );
      text +=
        "\n\nELECCIÓN DORADA · Elige una de esta pareja.\nAl elegirla se cierra " +
        other.name +
        ".";
    }
    return text;
  },
};
RevisionTree.configure();
(() => {
  const cast = Game.castSkill;
  Game.castSkill = function (id) {
    const s = SKILLS[id || this.mut.equipped];
    if (s?.resource === "energy" && this.mut.has("gold_catalyst")) {
      const cost = s.energy;
      s.energy = Number(cost) * SkillBalance.value(this,'gold_catalyst',.88);
      try {
        return cast.call(this, id);
      } finally {
        s.energy = cost;
      }
    }
    return cast.call(this, id);
  };
  const reload = Weapons.finishReload;
  Weapons.finishReload = function (p) {
    const mag = p.weapon?.mag, loaded = reload.call(this, p);
    if (Game.mut.has("gold_reload") && p.weapon?.mag > mag) {
      p.stamina = Math.min(p.maxStamina || 100, p.stamina + 12);
      p.focus = Math.max(p.focus, 3);
    }
    return loaded;
  };
  const use = Inventory.prototype.use;
  Inventory.prototype.use = function (g) {
    const selected =
        this.items[this.sel] || this.items.find((it) => ITEMS[it.type].use),
      green = selected?.type === "inj_green",
      count = this.items.length;
    use.call(this, g);
    if (green && this.items.length < count && g.mut.has("gold_triage")) {
      g.player.hp = Math.min(g.player.maxHp, g.player.hp + 20);
      g.player.stamina = Math.min(
        g.player.maxStamina || 100,
        g.player.stamina + 30,
      );
    }
  };
  const kill = Player.prototype.onKill;
  Player.prototype.onKill = function (g) {
    kill.call(this, g);
    if (g.mut.has("gold_leech")) {
      this.hp = Math.min(this.maxHp, this.hp + 3);
      this.energy = Math.min(this.maxEnergy, this.energy + 5);
    }
  };
  const form = ACTIONS.forma;
  ACTIONS.forma = function (g, p) {
    form.call(this, g, p);
    if (g.mut.has("gold_evolution")) {
      p.over *= SkillBalance.value(g,'gold_evolution',1.5);
      p.blade *= SkillBalance.value(g,'gold_evolution',1.5);
    }
  };
  // Sombras suaves y cortas para el mobiliario; una mesa no borra media habitación.
  const floor = Level.draw;
  Level.draw = function (c, cam, w, h) {
    floor.call(this, c, cam, w, h);
    if (!isR2()) return;
    c.save();
    const p = Game.player;
    for (const [key, type] of Object.entries(this.props)) {
      const [x, y] = key.split(",").map(Number),
        px = x * 32 + 16,
        py = y * 32 + 16;
      if (
        px < cam.x - 50 ||
        px > cam.x + w + 50 ||
        py < cam.y - 50 ||
        py > cam.y + h + 50
      )
        continue;
      const d = Math.hypot(px - p.x, py - p.y);
      if (d > 350) continue;
      const a = Math.atan2(py - p.y, px - p.x),
        tall = ["pillar", "shelf", "locker"].includes(type),
        length = tall ? Math.min(66, 20 + d * 0.12) : 22;
      // Degradado local: bordes suaves sin filtrar un lienzo completo por mueble.
      c.save();
      c.translate(
        px + Math.cos(a) * (12 + length * 0.35),
        py + Math.sin(a) * (12 + length * 0.35),
      );
      c.rotate(a);
      c.scale(length * 0.65 + 10, 18);
      const shadow = c.createRadialGradient(0, 0, 0, 0, 0, 1);
      shadow.addColorStop(0, "rgba(0,0,0,.23)");
      shadow.addColorStop(0.45, "rgba(0,0,0,.15)");
      shadow.addColorStop(1, "rgba(0,0,0,0)");
      c.fillStyle = shadow;
      c.fillRect(-1, -1, 2, 2);
      c.restore();
    }
    c.restore();
  };
})();
