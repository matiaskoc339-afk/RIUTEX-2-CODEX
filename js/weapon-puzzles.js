// Dos mecanismos espaciales opcionales. Los ajustes se conservan al salir.
const WeaponPuzzles = {
  pieces: [
    {
      name: "Corredera roja",
      x: 0,
      y: 2,
      w: 2,
      h: 1,
      axis: "x",
      color: "#b66357",
    },
    { name: "Traba azul", x: 2, y: 2, w: 1, h: 2, axis: "y", color: "#527f99" },
    {
      name: "Balda superior",
      x: 2,
      y: 0,
      w: 2,
      h: 1,
      axis: "x",
      color: "#aa9660",
    },
    {
      name: "Traba verde",
      x: 4,
      y: 1,
      w: 1,
      h: 2,
      axis: "y",
      color: "#6c8e79",
    },
    {
      name: "Contrapeso inferior",
      x: 3,
      y: 4,
      w: 3,
      h: 1,
      axis: "x",
      color: "#8d8097",
    },
  ],
  mirrors: [
    [1, 2],
    [1, 0],
    [4, 0],
    [4, 4],
    [2, 4],
    [2, 5],
  ],
  gates: [
    [2, 0],
    [4, 2],
    [3, 4],
  ],
  need: { shotgun: ["rack_crank"], optics: ["optic_lens", "optic_cell"] },
  is(type) {
    return ["arm_shotgun", "arm_optics"].includes(type);
  },
  open(g, kind) {
    const q = Adventure.rewards[kind];
    if (g.pz[q.flag]) return UI.msg("El cierre ya está abierto.");
    const missing = this.need[kind].filter((k) => !g.inv.keys.includes(k));
    if (missing.length)
      return UI.msg(
        kind === "shotgun"
          ? "Falta la manivela. La hoja de Seguridad menciona a Mantenimiento."
          : "Falta " +
              missing.map((k) => KEYS[k].toLowerCase()).join(" y ") +
              ". Las hojas de traslado indican dónde buscar.",
        6000,
      );
    const type = "arm_" + kind,
      saved = (g.story.mechanisms || (g.story.mechanisms = {}))[type];
    BluePuzzles.cur = {
      type,
      kind,
      selected: 0,
      positions: (saved?.positions || this.pieces.map((p) => [p.x, p.y])).map(
        (p) => p.slice(),
      ),
      angles: (saved?.angles || [1, 1, 0, 1, 1, 0]).slice(),
    };
    g.state = "puzzle";
    UI.screen("puzzle");
    this.render(g);
  },
  remember(g) {
    const c = BluePuzzles.cur;
    (g.story.mechanisms || (g.story.mechanisms = {}))[c.type] = {
      positions: c.positions.map((p) => p.slice()),
      angles: c.angles.slice(),
    };
  },
  canMove(positions, id, delta) {
    const p = this.pieces[id],
      [x, y] = positions[id],
      nx = x + (p.axis === "x" ? delta : 0),
      ny = y + (p.axis === "y" ? delta : 0);
    if (nx < 0 || ny < 0 || nx + p.w > 6 || ny + p.h > 6) return false;
    return this.pieces.every((o, j) => {
      if (j === id) return true;
      const [a, b] = positions[j];
      return nx + p.w <= a || a + o.w <= nx || ny + p.h <= b || b + o.h <= ny;
    });
  },
  move(g, delta) {
    const c = BluePuzzles.cur;
    if (
      g.state !== "puzzle" ||
      c.type !== "arm_shotgun" ||
      !this.canMove(c.positions, c.selected, delta)
    )
      return false;
    const p = this.pieces[c.selected];
    c.positions[c.selected][p.axis === "x" ? 0 : 1] += delta;
    this.remember(g);
    Sound.play("door");
    this.render(g);
    return true;
  },
  turn(g, i) {
    if (g.state !== "puzzle" || BluePuzzles.cur.type !== "arm_optics") return;
    BluePuzzles.cur.angles[i] ^= 1;
    this.remember(g);
    Sound.play("pickup");
    this.render(g);
  },
  beam(angles) {
    let x = -1,
      y = 2,
      dx = 1,
      dy = 0;
    const points = [[-0.6, 2]],
      lit = new Set(),
      seen = new Set();
    for (let i = 0; i < 160; i++) {
      x += dx;
      y += dy;
      points.push([x, y]);
      if (x < 0 || x >= 6 || y < 0 || y >= 6)
        return { points, lit, ok: x === 6 && y === 5 && lit.size === 3 };
      const key = x + "," + y + "," + dx + "," + dy;
      if (seen.has(key)) break;
      seen.add(key);
      const gate = this.gates.findIndex((p) => p[0] === x && p[1] === y);
      if (gate >= 0) lit.add(gate);
      const m = this.mirrors.findIndex((p) => p[0] === x && p[1] === y);
      if (m >= 0) {
        const a = dx,
          b = dy;
        if (angles[m]) {
          dx = b;
          dy = a;
        } else {
          dx = -b;
          dy = -a;
        }
      }
    }
    return { points, lit, ok: false };
  },
  solved() {
    const c = BluePuzzles.cur;
    return c.kind === "shotgun"
      ? c.positions[0][0] === 4
      : this.beam(c.angles).ok;
  },
  complete(g) {
    const c = BluePuzzles.cur;
    if (g.state !== "puzzle" || !this.is(c?.type)) return false;
    const q = Adventure.rewards[c.kind];
    if (g.pz[q.flag]) return false;
    if (!this.solved()) {
      UI.$("puzzleFeedback").textContent =
        c.kind === "shotgun"
          ? "La corredera todavía no alcanza la salida derecha."
          : "El haz debe encender los tres testigos y llegar al receptor.";
      Sound.play("empty");
      return false;
    }
    if (!this.need[c.kind].every((k) => g.inv.keys.includes(k))) return false;
    this.remember(g);
    g.pz[q.flag] = true;
    g.pz["blue:" + c.type] = true;
    g.inv.keys = g.inv.keys.filter((k) => !this.need[c.kind].includes(k));
    Adventure.sync(g);
    g.resume();
    Sound.play("door");
    UI.msg(
      "El cierre se libera. El arma queda a tu alcance; recógela con [E].",
      5500,
    );
    Hospital.checkpoint(g);
    return true;
  },
  render(g) {
    const c = BluePuzzles.cur,
      box = UI.$("puzzleBody");
    box.innerHTML = "";
    UI.$("puzzleFeedback").textContent = "";
    UI.$("puzzleTitle").textContent =
      c.kind === "shotgun" ? "Soporte de Seguridad" : "Cierre de exposición";
    UI.$("puzzleRule").textContent =
      c.kind === "shotgun"
        ? "Selecciona una pieza y deslízala por su guía. Lleva la corredera roja a la salida derecha."
        : "Gira los espejos. El haz debe pasar por los tres testigos y alcanzar el receptor final.";
    const clue = c.kind === "shotgun" ? "w_shot_manual" : "w_uzi_manual";
    UI.$("puzzleClue").textContent = g.inv.docs.includes(clue)
      ? DOCS[clue].text
      : "La hoja de servicio del mecanismo puede ayudarte. Puedes salir y regresar sin perder tus ajustes.";
    if (c.kind === "shotgun") this.renderRack(g, box);
    else this.renderOptics(g, box);
  },
  renderRack(g, box) {
    const c = BluePuzzles.cur,
      grid = document.createElement("div");
    grid.className = "rack-board";
    grid.setAttribute("role", "group");
    grid.setAttribute("aria-label", "Guías del soporte");
    this.pieces.forEach((p, i) => {
      const b = document.createElement("button"),
        [x, y] = c.positions[i];
      b.className = "rack-piece" + (c.selected === i ? " selected" : "");
      b.style.cssText =
        "left:" +
        ((x + 0.08) / 6) * 100 +
        "%;top:" +
        ((y + 0.08) / 6) * 100 +
        "%;width:" +
        ((p.w - 0.16) / 6) * 100 +
        "%;height:" +
        ((p.h - 0.16) / 6) * 100 +
        "%;--piece:" +
        p.color;
      b.textContent = i === 0 ? "SALIDA →" : p.axis === "x" ? "↔" : "↕";
      b.setAttribute("aria-label", "Seleccionar " + p.name);
      b.setAttribute("aria-pressed", c.selected === i ? "true" : "false");
      b.onclick = () => {
        c.selected = i;
        this.render(g);
      };
      grid.appendChild(b);
    });
    const exit = document.createElement("span");
    exit.className = "rack-exit";
    exit.textContent = "→";
    grid.appendChild(exit);
    box.appendChild(grid);
    const tools = document.createElement("div");
    tools.className = "rack-tools";
    const p = this.pieces[c.selected],
      label = document.createElement("span");
    label.textContent = p.name;
    tools.appendChild(label);
    for (const d of [-1, 1]) {
      const b = document.createElement("button");
      b.textContent = p.axis === "x" ? (d < 0 ? "←" : "→") : d < 0 ? "↑" : "↓";
      b.setAttribute(
        "aria-label",
        "Deslizar " + (d < 0 ? "atrás" : "adelante"),
      );
      b.disabled = !this.canMove(c.positions, c.selected, d);
      b.onclick = () => this.move(g, d);
      tools.appendChild(b);
    }
    box.appendChild(tools);
  },
  renderOptics(g, box) {
    const c = BluePuzzles.cur,
      trace = this.beam(c.angles),
      board = document.createElement("div");
    board.className = "optics-board";
    let svg = '<svg viewBox="-.7 -.7 7.4 7.4" aria-hidden="true">';
    for (let i = 0; i <= 6; i++)
      svg +=
        '<path d="M' +
        (i - 0.5) +
        " -.5v6M-.5 " +
        (i - 0.5) +
        'h6" stroke="#6d858b" stroke-opacity=".22" stroke-width=".015"/>';
    svg +=
      '<polyline points="' +
      trace.points.map((p) => p.join(",")).join(" ") +
      '" fill="none" stroke="#b8d9d4" stroke-width=".055" stroke-linejoin="round"/>';
    this.gates.forEach(([x, y], i) => {
      svg +=
        '<circle cx="' +
        x +
        '" cy="' +
        y +
        '" r=".15" fill="' +
        (trace.lit.has(i) ? ["#8acbfb", "#e6bb72", "#91d7ac"][i] : "#384a50") +
        '"/>';
    });
    svg +=
      '<rect x="5.8" y="4.72" width=".35" height=".56" rx=".08" fill="' +
      (trace.ok ? "#a8e2bc" : "#89724f") +
      '"/><circle cx="-.45" cy="2" r=".13" fill="#cbe5d5"/></svg>';
    board.innerHTML = svg;
    this.mirrors.forEach(([x, y], i) => {
      const b = document.createElement("button");
      b.className = "optic-mirror";
      b.style.left = ((x + 0.7) / 7.4) * 100 + "%";
      b.style.top = ((y + 0.7) / 7.4) * 100 + "%";
      b.innerHTML =
        '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="' +
        (c.angles[i] ? "M9 9L31 31" : "M9 31L31 9") +
        '"/></svg>';
      b.setAttribute(
        "aria-label",
        "Girar espejo " + String.fromCharCode(65 + i),
      );
      b.onclick = () => this.turn(g, i);
      board.appendChild(b);
    });
    box.appendChild(board);
    const leds = document.createElement("p");
    leds.className = "optics-readout";
    leds.textContent =
      trace.lit.size +
      " / 3 TESTIGOS · " +
      (trace.ok ? "RECEPTOR ALINEADO" : "SIGUE EL HAZ");
    box.appendChild(leds);
  },
};
(() => {
  const open = BluePuzzles.open;
  BluePuzzles.open = function (g, type) {
    return WeaponPuzzles.is(type)
      ? WeaponPuzzles.open(g, type.slice(4))
      : open.call(this, g, type);
  };
  const render = BluePuzzles.render;
  BluePuzzles.render = function (g) {
    return WeaponPuzzles.is(this.cur?.type)
      ? WeaponPuzzles.render(g)
      : render.call(this, g);
  };
  const solved = BluePuzzles.solved;
  BluePuzzles.solved = function () {
    return WeaponPuzzles.is(this.cur?.type)
      ? WeaponPuzzles.solved()
      : solved.call(this);
  };
  const complete = BluePuzzles.complete;
  BluePuzzles.complete = function (g) {
    return WeaponPuzzles.is(this.cur?.type)
      ? WeaponPuzzles.complete(g)
      : complete.call(this, g);
  };
  addEventListener(
    "keydown",
    (e) => {
      if (
        Game.state !== "puzzle" ||
        BluePuzzles.cur?.type !== "arm_shotgun" ||
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)
      )
        return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const p = WeaponPuzzles.pieces[BluePuzzles.cur.selected];
      if ((p.axis === "x") === ["ArrowLeft", "ArrowRight"].includes(e.code))
        WeaponPuzzles.move(
          Game,
          ["ArrowLeft", "ArrowUp"].includes(e.code) ? -1 : 1,
        );
    },
    true,
  );
})();
