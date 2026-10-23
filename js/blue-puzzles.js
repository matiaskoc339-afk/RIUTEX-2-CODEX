// Mecanismos pausables (las recompensas que no caben se envían al baúl), con reglas visibles, pistas descubiertas y reinicio sin penalización.
const BluePuzzles = {
  cur: null,
  circuitPorts: [10, 6, 12, 9, 3, 3, 10, 12, 9],
  rotate(mask) {
    return ((mask << 1) & 15) | (mask >> 3);
  },
  circuitReach(values) {
    const ports = values.map((v, i) => {
      let m = this.circuitPorts[i];
      for (let k = 0; k < v; k++) m = this.rotate(m);
      return m;
    });
    if (!(ports[0] & 8)) return new Set();
    const seen = new Set([0]),
      q = [0],
      dirs = [
        [-3, 1, 4],
        [1, 2, 8],
        [3, 4, 1],
        [-1, 8, 2],
      ];
    while (q.length) {
      const i = q.shift();
      for (const [d, out, inc] of dirs) {
        const j = i + d;
        if (j < 0 || j > 8 || Math.abs((i % 3) - (j % 3)) > 1) continue;
        if (ports[i] & out && ports[j] & inc && !seen.has(j)) {
          seen.add(j);
          q.push(j);
        }
      }
    }
    if (!seen.has(8) || !(ports[8] & 2)) seen.delete(9);
    else seen.add(9);
    return seen;
  },
  open(g, type) {
    const saved = g.story.mechanisms || (g.story.mechanisms = {});
    this.cur = {
      type,
      values: (
        saved[type] ||
        {
          clock: [12, 0],
          mix: [0, 0, 0],
          hydro: [0, 0, 0],
          eeg: [1, 1, 1],
          security: [0, 0, 0, 0, 0, 0, 0, 0, 0],
          generator: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        }[type]
      ).slice(),
    };
    g.state = "puzzle";
    UI.screen("puzzle");
    this.render(g);
  },
  solved() {
    const { type, values: v } = this.cur;
    if (type === "clock") return v[0] === 3 && v[1] === 40;
    if (type === "mix") return v.join(",") === "2,1,3";
    if (type === "hydro")
      return v.reduce((s, n, i) => s + n * (i + 1), 0) === 6;
    if (type === "eeg") return v.join(",") === "2,4,3";
    return this.circuitReach(v).has(9);
  },
  change(g, i, delta = 1) {
    const c = this.cur,
      mod =
        c.type === "clock"
          ? i === 0
            ? 12
            : 60
          : ["security", "generator"].includes(c.type)
            ? 4
            : c.type === "eeg"
              ? 6
              : 5;
    c.values[i] = (c.values[i] + delta + mod) % mod;
    if (c.type === "clock" && i === 0 && c.values[0] === 0) c.values[0] = 12;
    (g.story.mechanisms || (g.story.mechanisms = {}))[c.type] =
      c.values.slice();
    this.render(g);
  },
  complete(g) {
    if (g.state !== "puzzle" || g.pz["blue:" + this.cur.type]) return false;
    if (!this.solved()) {
      UI.$("puzzleFeedback").textContent =
        "La señal aún es inestable. Puedes ajustar las piezas o consultar la pista.";
      Sound.play("empty");
      return false;
    }
    const { type } = this.cur;
    g.resume();
    g.pz["blue:" + type] = true;
    if (type === "clock") {
      g.pz.h_clock = true;
      Hospital.clockSolved(g);
    }
    if (type === "generator") {
      g.pz["h:power"] = true;
      g.inv.keys = g.inv.keys.filter(
        (k) => !["fusible_a", "fusible_b"].includes(k),
      );
      const d = Level.doors.find((d) => d.id === "garage");
      if (d) Level.openDoor(d);
      UI.msg(
        "Corriente estable. La persiana del garaje se abre. El paso de bombas también tiene energía.",
        6500,
      );
    }
    if (type === "security") {
      g.pz["blue:archive"] = true;
      const d = Level.doors.find((d) => d.id === "arch");
      if (d) Level.openDoor(d);
      UI.msg(
        "Cierre remoto del Archivo liberado. Nuevo atajo disponible.",
        5000,
      );
    }
    if (type === "mix") {
      this.reward(g, "inj_green");
      this.reward(g, "inj_blue");
      UI.msg("Suero estabilizado: inyección verde y azul.", 5000);
    }
    if (type === "hydro") {
      this.reward(g, "inj_yellow");
      this.reward(g, "am_shells", 6);
      UI.msg(
        "El agua baja: recuperas una inyección amarilla y cartuchos.",
        5000,
      );
    }
    if (type === "eeg") {
      this.reward(g, "sample");
      UI.msg(
        "Sincronización estable. Muestra de Riutex recuperada; absórbela desde K.",
        5000,
      );
    }
    Sound.play("pickup");
    Hospital.checkpoint(g);
    return true;
  },
  reward(g, type, count) {
    const obj = { type, w: ITEMS[type].w, h: ITEMS[type].h };
    if (count) {
      const got = g.inv.addAmmo(type, count);
      if (got < count) {
        obj.count = count - got;
        g.stash.push(obj);
      }
    } else if (!g.inv.add(type)) g.stash.push(obj);
  },
  render(g) {
    const { type, values: v } = this.cur,
      box = UI.$("puzzleBody");
    box.innerHTML = "";
    const names = {
      clock: [
        "Reloj de Wren",
        "Ajusta las agujas. La biblioteca conserva la hora del recuerdo.",
      ],
      mix: [
        "Estabilizador de suero",
        "Ajusta la proporción de los tres reactivos. Cada unidad se puede corregir.",
      ],
      hydro: [
        "Circuito hidráulico",
        "Abre o cierra válvulas para alcanzar 6 bar sin sobrepresión.",
      ],
      eeg: [
        "Electroencefalógrafo",
        "Ajusta los canales y sincroniza la señal.",
      ],
      security: [
        "Cierre remoto del Archivo",
        "Gira las piezas para llevar corriente de ENTRADA (izquierda) a SALIDA (derecha).",
      ],
      generator: [
        "Generador principal",
        "Los fusibles están instalados. Reconecta la línea azul de entrada a salida.",
      ],
    };
    UI.$("puzzleTitle").textContent = names[type][0];
    UI.$("puzzleRule").textContent = names[type][1];
    UI.$("puzzleFeedback").textContent = "";
    const circuit = ["security", "generator"].includes(type);
    if (circuit) {
      const grid = document.createElement("div");
      grid.className = "circuit-grid";
      const on = this.circuitReach(v);
      v.forEach((n, i) => {
        const b = document.createElement("button");
        let mask = this.circuitPorts[i];
        for (let k = 0; k < n; k++) mask = this.rotate(mask);
        b.className = "circuit-piece" + (on.has(i) ? " live" : "");
        b.setAttribute("aria-label", "Girar pieza " + (i + 1));
        b.innerHTML =
          '<span class="wire-center"></span>' +
          [1, 2, 4, 8]
            .map((d, k) => (mask & d ? '<i class="wire w' + k + '"></i>' : ""))
            .join("") +
          "<small>" +
          (i === 0 ? "ENTRADA" : i === 8 ? "SALIDA" : i + 1) +
          "</small>";
        b.onclick = () => this.change(g, i);
        grid.appendChild(b);
      });
      box.appendChild(grid);
    } else {
      if (type === "clock") {
        const face = document.createElement("div");
        face.className = "clock-face";
        face.innerHTML =
          '<i class="clock-hand hour" style="transform:rotate(' +
          (v[0] * 30 + v[1] / 2) +
          'deg)"></i><i class="clock-hand minute" style="transform:rotate(' +
          v[1] * 6 +
          'deg)"></i><span>12</span><span>3</span><span>6</span><span>9</span>';
        box.appendChild(face);
      }
      const row = document.createElement("div");
      row.className = "puzzle-controls";
      v.forEach((n, i) => {
        const c = document.createElement("div"),
          label =
            type === "clock"
              ? ["HORA", "MINUTO"][i]
              : ["CANAL A", "CANAL B", "CANAL C"][i];
        c.innerHTML =
          "<small>" +
          label +
          "</small><strong>" +
          String(n).padStart(2, "0") +
          (type === "eeg" ? " Hz" : "") +
          "</strong>";
        const minus = document.createElement("button");
        minus.textContent = "−";
        minus.setAttribute("aria-label", "Reducir " + label);
        minus.onclick = () =>
          this.change(g, i, type === "clock" && i === 1 ? -5 : -1);
        const plus = document.createElement("button");
        plus.textContent = "+";
        plus.setAttribute("aria-label", "Aumentar " + label);
        plus.onclick = () =>
          this.change(g, i, type === "clock" && i === 1 ? 5 : 1);
        c.appendChild(minus);
        c.appendChild(plus);
        row.appendChild(c);
      });
      box.appendChild(row);
      if (type === "hydro") {
        const pressure = v.reduce((s, n, i) => s + n * (i + 1), 0),
          p = document.createElement("p");
        p.className = "pressure";
        p.textContent = pressure + " / 6 bar";
        box.appendChild(p);
      }
    }
    const clue = {
      clock: "m2",
      mix: "b_blood",
      hydro: "b_hydro",
      eeg: "b_eeg",
      security: "b_security",
      generator: "s2",
    }[type];
    UI.$("puzzleClue").textContent = g.inv.docs.includes(clue)
      ? DOCS[clue].text
      : "Pista pendiente: " +
        DOCS[clue].title +
        ". Puedes salir, buscarla y volver. Los ajustes se conservan.";
  },
};
(() => {
  const use = Hospital.use;
  Hospital.use = function (g, it) {
    const types = {
        h_clock: "clock",
        h_mix: "mix",
        h_hydro: "hydro",
        h_eeg: "eeg",
        h_security: "security",
        h_gen: "generator",
      },
      type = types[it.type];
    if (!type) return use.call(this, g, it);
    if (
      g.pz["blue:" + type] ||
      (type === "clock" && g.pz.h_clock) ||
      (type === "generator" && g.pz["h:power"])
    )
      return UI.msg("Mecanismo resuelto.");
    if (
      type === "generator" &&
      !["fusible_a", "fusible_b"].every((k) => g.inv.keys.includes(k))
    )
      return UI.msg(
        "Faltan fusibles: A en la Morgue y B en el Quirófano. Consulta [M] para orientarte.",
        5000,
      );
    return BluePuzzles.open(g, type);
  };
  const label = Hospital.label;
  Hospital.label = function (it) {
    return (
      {
        h_mix: "Preparar suero azul",
        h_hydro: "Regular presión",
        h_eeg: "Calibrar frecuencias",
        h_security: "Restablecer cierre remoto",
      }[it.type] || label.call(this, it)
    );
  };
})();
