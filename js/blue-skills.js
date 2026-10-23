// Una sola red horizontal. Dos ramas; cada recorrido tiene un requisito anterior claro.
const BlueSkills = {
  view: null,
  names: false,
  lanes: [
    [
      "hum",
      "Armas",
      "punteria manos tirador concentracion certero elite",
      "aim",
      "recuperacion_tactica",
    ],
    [
      "hum",
      "Resistencia",
      "vigor veloz aguante adrenalina resistencia",
      "vital",
      "respiracion",
    ],
    ["hum", "Sigilo", "sigilo sombra", "ghost", "paso_ligero"],
    ["hum", "Técnica", "chaleco medico ultimo", "medic", "desarme"],
    [
      "mut",
      "Biomorfosis",
      "garras fuerza brazo sutura plena forma",
      "body",
      "injerto",
    ],
    [
      "mut",
      "Psicoquinesis",
      "foco proyeccion telequinesis",
      "neural",
      "trueque",
    ],
    [
      "mut",
      "Fuerza cinética",
      "impacto dash pulso dominio ruptura",
      "force",
      "ancla",
    ],
    [
      "mut",
      "Metabolismo",
      "piel regen sed metabolismo sangrefria reactiva sobrecarga",
      "flow",
      "coraza",
    ],
  ],
  init() {
    Object.assign(STAT, {
      capacity: ["Reserva", 8, (v) => "+" + v + " de estamina máxima"],
    });
    const values = {
      hp: 6,
      stam: 0.1,
      capacity: 8,
      reload: 0.045,
      gun: 0.04,
      speed: 0.025,
      xp: 0.06,
      en: 8,
      eregen: 0.08,
      melee: 0.08,
    };
    const human = [
        "hp",
        "capacity",
        "reload",
        "stam",
        "gun",
        "speed",
        "hp",
        "capacity",
      ],
      mutant = [
        "en",
        "capacity",
        "melee",
        "eregen",
        "hp",
        "stam",
        "en",
        "eregen",
      ];
    const names = {
      hum: {
        hp: "Acondicionamiento",
        capacity: "Fondo físico",
        reload: "Memoria muscular",
        stam: "Recuperar el aliento",
        gun: "Control del gatillo",
        speed: "Paso entrenado",
        xp: "Observación",
      },
      mut: {
        hp: "Tejido reforzado",
        capacity: "Pulmón adaptado",
        melee: "Fibra contráctil",
        eregen: "Flujo del compuesto",
        en: "Reserva Riutex",
        stam: "Oxigenación",
        speed: "Tendón elástico",
      },
    };
    const majors = {
      blue_vital_7: [
        "Segunda respiración",
        "Fuera de peligro recuperas salud lentamente hasta el 60 %.",
      ],
      blue_aim_7: [
        "Remate preciso",
        "+25 % de daño de bala a enemigos con menos del 30 % de salud.",
      ],
      blue_medic_7: [
        "Tratamiento integral",
        "Las inyecciones verdes restauran 15 de salud adicionales.",
      ],
      blue_ghost_7: [
        "Paso fantasma",
        "El alcance del ruido al moverte se reduce un 25 %.",
      ],
      blue_body_7: [
        "Ciclo depredador",
        "Cada baja devuelve 6 de energía Riutex adicional.",
      ],
      blue_force_7: [
        "Impulso perfecto",
        "Tus esquivas recorren un 20 % más de distancia.",
      ],
      blue_neural_7: [
        "Resonancia",
        "Los poderes mutantes se recargan un 15 % antes.",
      ],
      blue_flow_7: ["Homeostasis", "Recibes un 10 % menos de daño."],
    };
    this.lanes.forEach(([br, label, original, prefix], li) => {
      const minors = [];
      for (let i = 0; i < 8; i++) {
        let id = "blue_" + prefix + "_" + i;
        if (prefix === "vital" && i === 7) id = "blue_body_6";
        if (prefix === "body" && i === 6) id = "blue_vital_7";
        const stat = (br === "hum" ? human : mutant)[(i + li) % 8],
          value = values[stat],
          major = majors[id];
        T2[id] = {
          phase: 1,
          kind: major ? "major" : "minor",
          name: major
            ? major[0]
            : names[br][stat] + " " + (Math.floor(i / 3) + 1),
          cost: 3 + i * 2,
          type: "passive",
          desc: major ? major[1] : STAT[stat][2](value),
          mod: major ? {} : { [stat]: value },
          stat: major ? null : stat,
          br,
          links: [],
          lane: li,
        };
        minors.push(id);
      }
      const base = original.split(" "),
        order = [];
      for (let i = 0; i < Math.max(base.length, minors.length); i++) {
        if (base[i]) order.push(base[i]);
        if (minors[i]) order.push(minors[i]);
      }
      this.lanes[li].order = order;
    });
    const add = (id, br, lane, name, desc, energy, cd, extra = {}) => {
      T2[id] = {
        phase: 1,
        kind: "major",
        name,
        cost: 24,
        type: "active",
        desc,
        energy,
        cd,
        br,
        links: [],
        lane,
        ...extra,
      };
      this.lanes[lane].order.push(id);
    };
    add(
      "recuperacion_tactica",
      "hum",
      0,
      "Última bala",
      "El último cartucho del cargador causa un 35 % más de daño.",
      "",
      0,
      { type: "passive" },
    );
    add(
      "respiracion",
      "hum",
      1,
      "Respiración táctica",
      "Recupera 35 de estamina. Debes estar quieto. No consume Riutex.",
      0,
      22,
    );
    add(
      "paso_ligero",
      "hum",
      2,
      "Desplazamiento silencioso",
      "Durante 8 s, tus pasos se oyen un 65 % menos. Consume 18 de estamina.",
      18,
      20,
    );
    add(
      "desarme",
      "hum",
      3,
      "Golpe de separación",
      "Golpea y aparta al enemigo que tengas delante. Lo aturde 2 s. Consume 25 de estamina.",
      25,
      9,
    );
    add(
      "injerto",
      "mut",
      4,
      "Injerto vivo",
      "Regenera 24 de salud a lo largo de 6 s.",
      32,
      25,
    );
    add(
      "trueque",
      "mut",
      5,
      "Intercambio orgánico",
      "Convierte 12 de salud en 45 de energía Riutex. Nunca puede dejarte por debajo de 1 de salud.",
      0,
      16,
    );
    add(
      "ancla",
      "mut",
      6,
      "Ancla psíquica",
      "Crea durante 5 s un campo donde apuntas (hasta 240 px). Atrapa a los infectados; el Carnicero resiste.",
      28,
      16,
    );
    add(
      "coraza",
      "mut",
      7,
      "Coraza orgánica",
      "Durante 6 s recibes un 40 % menos de daño y te mueves un 15 % más lento.",
      30,
      24,
    );
    Object.assign(ACTIONS, {
      respiracion(g, p) {
        p.stamina = Math.min(p.maxStamina || 100, p.stamina + 35);
        UI.msg("Respiras hondo. Recuperas el control.", 1800);
      },
      paso_ligero(g, p) {
        p.quietSteps = 8;
        UI.msg("Pasos contenidos · 8 s", 1800);
      },
      desarme(g, p) {
        for (const e of g.enemies) {
          const d = Math.hypot(e.x - p.x, e.y - p.y),
            a = Math.atan2(e.y - p.y, e.x - p.x);
          if (
            !e.dead &&
            d < 70 &&
            Math.abs(Math.atan2(Math.sin(a - p.angle), Math.cos(a - p.angle))) <
              1.1 &&
            Level.los(p.x, p.y, e.x, e.y)
          ) {
            e.hurt(10, a, g);
            e.stagger = e.isBoss ? 0.4 : 2;
            Level.move(e, Math.cos(a) * 36, Math.sin(a) * 36);
          }
        }
        p.slash = 0.18;
        p.slashR = 58;
        Sound.play("enemyhit");
      },
      injerto(g, p) {
        p.graft = 6;
        g.ring(p.x, p.y, 60, "#8babb3");
      },
      trueque(g, p) {
        p.hp -= 12;
        p.energy = Math.min(p.maxEnergy, p.energy + 45);
      },
      ancla(g, p) {
        let x = g.mouse.x + g.cam.x,
          y = g.mouse.y + g.cam.y;
        const d = Math.hypot(x - p.x, y - p.y);
        if (d > 240) {
          x = p.x + ((x - p.x) * 240) / d;
          y = p.y + ((y - p.y) * 240) / d;
        }
        if (!Level.solid(x, y) && Level.los(p.x, p.y, x, y))
          g.psychicAnchor = { x, y, life: 5 };
        else {
          p.energy = Math.min(p.maxEnergy, p.energy + 28);
          g.mut.cd.ancla = 0;
          UI.msg("Apunta a un punto del suelo que puedas ver.");
        }
      },
      coraza(g, p) {
        p.shell = 6;
        g.ring(p.x, p.y, 45, "#9cb6ba");
      },
    });
    T2.core = {
      ...T2.core,
      name: "RIUTEX-X",
      br: "neu",
      links: ["reflejos", "instinto"],
      requires: [],
      px: 90,
      py: 650,
    };
    Object.assign(T2.reflejos, {
      br: "hum",
      resource: "stamina",
      energy: 20,
      desc: "Esquiva técnica con invulnerabilidad breve. Consume 20 de estamina; no consume Riutex.",
      links: ["core"],
      requires: ["core"],
      px: 290,
      py: 325,
    });
    Object.assign(T2.instinto, {
      br: "mut",
      links: ["core"],
      requires: ["core"],
      px: 290,
      py: 975,
    });
    this.lanes.forEach((lane, li) => {
      const br = lane[0],
        y = (br === "hum" ? 160 : 810) + (li % 4) * 110,
        hub = br === "hum" ? "reflejos" : "instinto";
      lane.order.forEach((id, i) => {
        const s = T2[id];
        Object.assign(s, {
          br,
          lane: li,
          resource: br === "hum" ? "stamina" : "energy",
          requires: [i ? lane.order[i - 1] : hub],
          links: [i ? lane.order[i - 1] : hub],
          px: 510 + i * 122,
          py: y + (s.kind === "major" ? (i % 2 ? 12 : -12) : 0),
        });
      });
    });
    // El médico humano emplea suministros; la regeneración espontánea pertenece a Mutante.
    Object.assign(T2.plena, {
      name: "Reconstrucción orgánica",
      desc: "Tu tejido se recompone sin suministros hasta el 70 % de salud.",
    });
    Object.assign(T2.ultimo, {
      name: "Voluntad de sobrevivir",
      desc: "Una vez cada 120 s, un golpe mortal te deja con 1 de salud.",
    });
    Object.assign(T2.certero, {
      energy: 22,
      desc: "Prepara un disparo de gran precisión y potencia. Consume 22 de estamina.",
    });
    Object.assign(T2.concentracion, {
      energy: 18,
      desc: "Controlas la respiración: mayor precisión durante 8 s. Consume 18 de estamina.",
    });
    Object.assign(T2.metabolismo, {
      desc: "Regeneración cura 6 de salud por baja y su reserva de curación aumenta a 40.",
    });
    Object.assign(T2.sombra, {
      desc: "Si rompes su línea de visión antes de esconderte, el Carnicero abandona la búsqueda un 40 % antes.",
    });
    for (const [id, s] of Object.entries(T2))
      for (const k of [...s.links])
        if (T2[k] && !T2[k].links.includes(id)) T2[k].links.push(id);
    Trees.lost = () => false;
    Trees.preview = () => [];
    const baseCan = Mutation.prototype.canBuy;
    Mutation.prototype.canBuy = function (id, xp) {
      if (Trees.cur !== "r2") return baseCan.call(this, id, xp);
      const s = SKILLS[id];
      if (!s) return "Nodo desconocido.";
      if (this.has(id)) return "Ya adquirida.";
      const missing = (s.requires || []).filter((k) => !this.has(k));
      if (missing.length)
        return "Antes: " + missing.map((k) => SKILLS[k].name).join(", ");
      return xp < s.cost ? "EXP insuficiente." : null;
    };
  },
  render(g) {
    const box = UI.$("treeBox");
    box.style.cssText = "";
    // El fluido permanece montado: seleccionar nodos no reinicia sus animaciones.
    for (const child of [...box.children])
      if (!child.classList.contains("riutex-reactor")) child.remove();
    if (!box.querySelector(".riutex-reactor")) RevisionTree.backdrop(box);
    if (typeof PresentationTree !== "undefined") PresentationTree.hideTip();
    const owned = Object.keys(SKILLS).filter((k) => g.mut.has(k)).length;
    const header = document.createElement("div");
    header.className = "network-header";
    header.innerHTML =
      '<div><span class="eyebrow">ADAPTACIÓN · FASE 1</span><h2>¿Qué queda de ti?</h2><p>' +
      owned +
      " / " +
      (Object.keys(SKILLS).length - RevisionTree.groups) +
      ' desarrollos · <span class="legend-human">Humano</span> / <span class="legend-mutant">Mutante</span> · <b>' +
      g.player.xp +
      " EXP</b></p></div>";
    const tools = document.createElement("div");
    tools.className = "network-tools";
    const add = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.onclick = fn;
      tools.appendChild(b);
      return b;
    };
    add("−", () => zoom(0.8));
    add("+", () => zoom(1.25));
    add("Encuadrar", () => fit());
    add(this.names ? "Ocultar nombres" : "Mostrar nombres", () => {
      this.names = !this.names;
      this.render(g);
    });
    header.appendChild(tools);
    box.appendChild(header);
    const area = document.createElement("div");
    area.className = "network-viewport";
    area.setAttribute("aria-label", "Red de habilidades Humano y Mutante");
    const graph = document.createElement("div");
    graph.className = "network-graph";
    const width =
        Math.max(...Object.values(SKILLS).map((s) => s.px || 0)) + 150,
      height = Math.max(1390, ...Object.values(SKILLS).map(s=>(s.py||0)+150));
    graph.style.width = width + "px";
    graph.style.height = height + "px";
    graph.innerHTML =
      '<svg width="' +
      width +
      '" height="' +
      height +
      '" aria-hidden="true">' +
      RevisionTree.edges(g) +
      "</svg>";
    for (const [title, sub, x, y] of [
      ["ADAPTACIÓN INICIAL", "Un mismo comienzo", 280, 510],
      ["CONTROL HUMANO", "Técnica · resistencia", 1920, 10],
      ["EXPRESIÓN MUTANTE", "Poder · Riutex", 1920, 1320],
    ]) {
      const d = document.createElement("div");
      d.className = "network-branch";
      d.style.left = x + "px";
      d.style.top = (y + (typeof SurvivalSkills!=="undefined"?SurvivalSkills.labelOffset(title):0)) + "px";
      d.innerHTML = "<strong>" + title + "</strong><span>" + sub + "</span>";
      graph.appendChild(d);
    }
    for (const [id, s] of Object.entries(SKILLS)) {
      const owned = g.mut.has(id),
        ready = !g.mut.canBuy(id, g.player.xp),
        b = document.createElement("button");
      b.className =
        "network-node " +
        s.br +
        (s.gold ? " gold" : "") +
        " " +
        (s.kind === "minor" ? "minor" : "major") +
        " " +
        (owned ? "owned" : ready ? "available" : "locked") +
        (UI.treeSel === id ? " selected" : "");
      b.dataset.skill = id;
      b.style.left = s.px + "px";
      b.style.top = s.py + "px";
      b.dataset.name = s.name;
      b.onpointerenter = () => PresentationTree.tip(b, id, g);
      b.onpointerleave = () => PresentationTree.hideTip();
      b.onfocus = () => PresentationTree.tip(b, id, g);
      b.onblur = () => PresentationTree.hideTip();
      b.setAttribute("aria-label", s.name);
      const icons = {
        hp: "✚",
        capacity: "≋",
        stam: "≋",
        en: "◈",
        eregen: "∿",
        gun: "⌖",
        reload: "↻",
        melee: "╱",
        speed: "»",
      };
      b.innerHTML =
        "<b>" +
        (s.gold
          ? "✦"
          : id === "core"
            ? "X"
            : s.type === "active"
              ? "◇"
              : icons[s.stat] || "◉") +
        "</b>" +
        (this.names ? "<small>" + s.name + "</small>" : "");
      b.onclick = () => {
        UI.treeSel = id;
        this.render(g);
      };
      graph.appendChild(b);
    }
    area.appendChild(graph);
    box.appendChild(area);
    const caption = document.createElement("p");
    caption.className = "network-caption";
    caption.textContent =
      "Arrastra para mover · Rueda o + / − para acercar · Sigue cada línea de izquierda a derecha · Los nodos claros están disponibles";
    box.appendChild(caption);
    const apply = () => {
      const v = this.view;
      if (v)
        graph.style.transform =
          "translate(" + v.x + "px," + v.y + "px) scale(" + v.z + ")";
    };
    const fit = () => {
      const w = area.clientWidth || 800,
        h = area.clientHeight || 580,
        z = Math.min(w / width, h / height) * 0.94;
      this.view = { z, x: (w - width * z) / 2, y: (h - height * z) / 2 };
      apply();
    };
    const zoom = (factor) => {
      if (!this.view) fit();
      const v = this.view,
        old = v.z,
        z = Math.max(0.25, Math.min(1.8, old * factor)),
        cx = area.clientWidth / 2,
        cy = area.clientHeight / 2;
      v.x = cx - ((cx - v.x) * z) / old;
      v.y = cy - ((cy - v.y) * z) / old;
      v.z = z;
      apply();
    };
    if (this.view) apply();
    else requestAnimationFrame(fit);
    area.onwheel = (e) => {
      e.preventDefault();
      zoom(e.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    let drag = null;
    area.onpointerdown = (e) => {
      if (e.target.closest("button")) return;
      drag = {
        x: e.clientX,
        y: e.clientY,
        vx: this.view?.x || 0,
        vy: this.view?.y || 0,
      };
      area.setPointerCapture(e.pointerId);
    };
    area.onpointermove = (e) => {
      if (!drag || !this.view) return;
      this.view.x = drag.vx + e.clientX - drag.x;
      this.view.y = drag.vy + e.clientY - drag.y;
      apply();
    };
    area.onpointerup = () => (drag = null);
    UI.$("treeHead").textContent =
      "Inicio común → adaptación gradual.\nAlgunos nodos necesitan dos conexiones.\nAzul: humano · Morado: mutante.\nDorado: una de cada pareja.";
    const id = UI.treeSel,
      s = SKILLS[id],
      b = UI.$("bBuy");
    UI.$("treeInfo").textContent = s
      ? s.name +
        "\n\n" +
        s.desc +
        "\n\n" +
        (s.type === "active"
          ? "ACTIVA · " +
            s.energy +
            " " +
            (s.resource === "stamina" ? "estamina" : "Riutex") +
            " · " +
            s.cd +
            " s\n"
          : "PASIVA\n") +
        (g.mut.has(id)
          ? "Adquirida" +
            (g.mut.bindings[id] ? " · " + g.keyName(g.mut.bindings[id]) : "")
          : g.mut.canBuy(id, g.player.xp) || "Disponible · " + s.cost + " EXP")
      : "Elige un nodo.\n\nCírculo pequeño: mejora de atributo.\nCírculo grande: técnica o poder.\nCada conexión indica el paso anterior.\n\nNo necesitas aprender toda la red de una vez.";
    if (s) UI.$("treeInfo").textContent += RevisionTree.notes(s, g.mut);
    if (s?.gold) {
      const other = Object.values(SKILLS).find(
        (n) => n.gold === s.gold && n !== s,
      );
      const chosen = Object.values(SKILLS).find(
        (n) =>
          n.gold === s.gold &&
          g.mut.has(Object.keys(SKILLS).find((k) => SKILLS[k] === n)),
      );
      UI.$("treeInfo").textContent =
        "Compara las dos opciones. Elige una de esta pareja; la otra quedará cerrada.\n\n" +
        (g.mut.has(id)
          ? "Adquirida"
          : g.mut.canBuy(id, g.player.xp) ||
            "Disponible · " + s.cost + " EXP") +
        (chosen
          ? "\n\nDoctrina conservada: " + chosen.name + "."
          : "\n\nAl elegirla se cierra " + other.name + ".");
    }
    b.disabled =
      !s ||
      id === "core" ||
      (g.mut.has(id) ? s.type !== "active" : !!g.mut.canBuy(id, g.player.xp));
    b.textContent = !s
      ? "Selecciona una habilidad"
      : g.mut.has(id)
        ? s.type === "active"
          ? "Equipar"
          : "Adquirida"
        : (s.gold ? "Elegir especialización · " : "Aprender · ") +
          s.cost +
          " EXP";
    PresentationTree.choices(g, s);
    const bind = UI.$("bBind");
    bind.style.display =
      s && g.mut.has(id) && s.type === "active" ? "block" : "none";
    bind.textContent =
      "Asignar tecla" +
      (g.mut.bindings[id] ? " · " + g.keyName(g.mut.bindings[id]) : "");
    UI.$("bSample").textContent =
      "Absorber muestra · +" + R2_XP.sample + " EXP (" + g.inv.samples + ")";
    UI.$("bSample").disabled = g.inv.samples <= 0;
  },
};
BlueSkills.init();
const legacyTreeRender = UI.renderTree;
UI.renderTree = (g) =>
  Trees.cur === "r2" ? BlueSkills.render(g) : legacyTreeRender.call(UI, g);
