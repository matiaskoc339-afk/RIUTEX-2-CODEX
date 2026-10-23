// Progresión de equipo de fase 1: generador auxiliar, banco y accesorios opcionales.
const Workshop = {
  weaponIds: ["pistol", "shotgun", "viper", "rifle"],
  attachments: {
    pistol: {
      id: "optic_pistol",
      name: "Mira de escolta M9",
      desc: "−20 % de dispersión de la M9.",
      stat: "precision",
    },
    shotgun: {
      id: "brace_shotgun",
      name: "Culata amortiguada M12",
      desc: "−15 % de esfuerzo al disparar la M12.",
      stat: "effort",
    },
    viper: {
      id: "mag_uzi",
      name: "Cargador de transporte UZI",
      desc: "+8 balas de capacidad en la UZI.",
      stat: "capacity",
    },
    rifle: {
      id: "scope_rifle",
      name: "Óptica de observación",
      desc: "−25 % de dispersión en el rifle.",
      stat: "precision",
    },
  },
  stats: {
    damage: ["Daño", "+10 % por nivel"],
    effort: ["Aguante", "−8 % de estamina por nivel"],
    precision: ["Precisión", "−10 % de dispersión por nivel"],
    capacity: ["Capacidad", "Amplía el cargador según el arma"],
  },
  ensure(g) {
    const q =
      g.story.workshop ||
      (g.story.workshop = { powered: false, levels: {}, attachments: [] });
    q.levels ||= {};
    q.attachments ||= [];
    return q;
  },
  powered(g) { return this.ensure(g).powered || g.lvl === "hospitalworks"; },
  rank(g, id, stat) {
    return Math.max(
      0,
      Math.min(3, Number(this.ensure(g).levels[id]?.[stat]) || 0),
    );
  },
  has(g, id) {
    return this.ensure(g).attachments.includes(this.attachments[id]?.id);
  },
  magBonus(g, id) {
    return (
      this.rank(g, id, "capacity") *
        ({ pistol: 2, shotgun: 1, viper: 4, rifle: 1 }[id] || 0) +
      (id === "viper" && this.has(g, id) ? 8 : 0)
    );
  },
  effective(g, p, id) {
    const w = WEAPONS[id];
    if (!this.weaponIds.includes(id) || !isR2lvl(g.lvl)) return w;
    const bloomFactor =
      Math.pow(0.9, this.rank(g, id, "precision")) *
      (this.has(g, id) && id === "pistol"
        ? 0.8
        : this.has(g, id) && id === "rifle"
          ? 0.75
          : 1);
    return {
      ...w,
      bloomFactor,
      _id: id,
      dmg: w.dmg * (1 + 0.1 * this.rank(g, id, "damage")),
      stam:
        w.stam *
        (1 - 0.08 * this.rank(g, id, "effort")) *
        (id === "shotgun" && this.has(g, id) ? 0.85 : 1),
      spread:
        w.spread *
        Math.pow(0.9, this.rank(g, id, "precision")) *
        (this.has(g, id) && id === "pistol"
          ? 0.8
          : this.has(g, id) && id === "rifle"
            ? 0.75
            : 1),
      recoil: w.recoil * (p.coverWindow > 0 ? SkillBalance.value(g,'cambio_guardia',.8) : 1),
      reload: w.reload * (p.coverWindow > 0 ? SkillBalance.value(g,'cambio_guardia',.8) : 1),
    };
  },
  cost(rank) {
    return rank < 2
      ? { screw_small: 3 + rank * 2, powder_small: 2 + rank }
      : { screw_large: 2, powder_large: 2 };
  },
  owned(g, id) {
    return (
      g.inv.items.some((i) => i.type === "w_" + id) ||
      g.stash.some((i) => i.type === "w_" + id)
    );
  },
  buy(g, id, stat) {
    if (g.state !== "workbench" || !this.powered(g))
      return { ok: false, msg: "La mesa necesita el generador auxiliar." };
    if (!this.weaponIds.includes(id) || !this.stats[stat] || !this.owned(g, id))
      return { ok: false, msg: "Recupera primero esta arma." };
    const rank = this.rank(g, id, stat);
    if (rank >= 3) return { ok: false, msg: "Mejora al máximo." };
    const cost = this.cost(rank);
    if (Object.entries(cost).some(([t, n]) => FieldDesk.count(g.inv, t) < n))
      return { ok: false, msg: "Faltan materiales en el maletín." };
    FieldDesk.consume(g.inv, cost);
    const q = this.ensure(g);
    q.levels[id] ||= {};
    q.levels[id][stat] = rank + 1;
    Sound.play("pickup");
    this.render(g, id);
    Hospital.checkpoint(g);
    return {
      ok: true,
      msg: "Instalada: " + this.stats[stat][0] + " · nivel " + (rank + 1) + ".",
    };
  },
  rewardMaterials(g, type, n) {
    const fit = g.inv.addAmmo(type, n);
    if (fit < n) g.stash.push({ type, count: n - fit });
  },
  claim(g, id) {
    const a = this.attachments[id];
    if (!a) return false;
    const q = this.ensure(g);
    if (q.attachments.includes(a.id)) return false;
    q.attachments.push(a.id);
    Sound.play("pickup");
    UI.msg(
      a.name +
        " recuperada. Se aplica solo a " +
        WEAPONS[id].name +
        ". Consulta el banco de mejoras.",
      4500,
    );
    Hospital.checkpoint(g);
    return true;
  },
  init(g) {
    const panel = document.createElement("section");
    panel.id = "workbench";
    panel.className = "screen hidden";
    panel.innerHTML =
      '<div class="workshop-panel"><header><div><span class="eyebrow">MANTENIMIENTO / BANCO DE ARMERO</span><h2>Haz que cada disparo cuente.</h2></div><button id="benchClose">Volver [ESC]</button></header><div id="benchPower"></div><div class="bench-layout"><nav id="benchWeapons"></nav><article id="benchDetail"></article></div><p id="benchFeedback" role="status" aria-live="polite"></p></div>';
    document.body.appendChild(panel);
    UI.$("benchClose").onclick = () => g.resume();
    const quest = document.createElement("section");
    quest.id = "servicePuzzle";
    quest.className = "screen hidden";
    quest.innerHTML =
      '<div class="service-panel"><span class="eyebrow">EXPEDIENTE DE SERVICIO / OPCIONAL</span><h2 id="serviceTitle"></h2><p id="serviceRule"></p><div id="serviceBody"></div><p id="serviceFeedback" role="status"></p><button id="serviceTest">Comprobar ajuste</button><button id="serviceBack">Volver [ESC]</button></div>';
    document.body.appendChild(quest);
    UI.$("serviceTest").onclick = () => ServiceQuests.complete(g);
    UI.$("serviceBack").onclick = () => g.resume();
    const mini = document.createElement("div");
    mini.id = "optionalBoss";
    mini.className = "hidden";
    UI.$("hud").appendChild(mini);
    addEventListener(
      "keydown",
      (e) => {
        if (["workbench", "servicePuzzle"].includes(g.state)) {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (e.code === "Escape") g.resume();
        }
      },
      true,
    );
  },
  open(g) {
    this.selected = this.weaponIds.includes(this.selected)
      ? this.selected
      : "pistol";
    g.state = "workbench";
    g.keys = {};
    g.mouse.down = false;
    this.render(g, this.selected);
    UI.screen("workbench");
  },
  render(g, id) {
    this.selected = id;
    const q = this.ensure(g),
      owned = this.owned(g, id),
      w = this.effective(g, g.player, id),
      base = WEAPONS[id],
      rank = (s) => this.rank(g, id, s);
    UI.$("benchPower").innerHTML = this.powered(g)
      ? '<span class="bench-powered">● GENERADOR AUXILIAR EN LÍNEA</span><p>Mejoras permanentes por arma. Usa materiales del maletín; las armas guardadas en el baúl también se pueden ajustar.</p>'
      : '<span class="bench-offline">○ SIN CORRIENTE</span><p>El generador auxiliar de Calderas puede alimentar esta mesa. Revisa la orden de Mantenimiento, busca su fusible y el cable de Lavandería. El generador de la salida es otro circuito.</p>';
    const nav = UI.$("benchWeapons");
    nav.innerHTML = "";
    for (const weapon of this.weaponIds) {
      const b = document.createElement("button");
      b.className = "bench-weapon" + (weapon === id ? " active" : "");
      b.dataset.benchWeapon = weapon;
      b.innerHTML =
        WeaponGlyphs.svg(weapon) +
        "<span>" +
        WEAPONS[weapon].name +
        "<small>" +
        (this.owned(g, weapon) ? "EN TU EQUIPO" : "POR RECUPERAR") +
        "</small></span>";
      b.onclick = () => this.render(g, weapon);
      nav.appendChild(b);
    }
    const attachment = this.attachments[id],
      detail = UI.$("benchDetail");
    detail.innerHTML =
      '<div class="bench-hero">' +
      WeaponGlyphs.svg(id) +
      '<div><span class="eyebrow">' +
      (owned ? "CONFIGURACIÓN INDIVIDUAL" : "ARMA AÚN NO RECUPERADA") +
      "</span><h3>" +
      WEAPONS[id].name +
      "</h3><p>Daño " +
      Math.round(w.dmg * base.pellets) +
      " · Disparo " +
      CombatPressure.shotCost(g, { ...g.player, weapon: { id } }, w).toFixed(
        1,
      ) +
      " EST · Cargador " +
      Weapons.magSize(g.player, base) +
      '</p></div></div><div class="bench-attachment ' +
      (this.has(g, id) ? "found" : "") +
      '"><span>ACCESORIO DE EXPLORACIÓN</span><b>' +
      (this.has(g, id) ? attachment.name : "Sin accesorio recuperado") +
      "</b><p>" +
      (this.has(g, id)
        ? attachment.desc
        : "Los registros del personal pueden llevarte a un accesorio exclusivo. No se compra en esta mesa.") +
      '</p></div><div class="bench-upgrades">' +
      Object.entries(this.stats)
        .map(([stat, [name, desc]]) => {
          const n = rank(stat),
            cost = this.cost(n),
            missing = Object.entries(cost).some(
              ([t, k]) => FieldDesk.count(g.inv, t) < k,
            ),
            err = !this.powered(g)
              ? "Sin corriente"
              : !owned
                ? "Arma no recuperada"
                : n >= 3
                  ? "Máximo alcanzado"
                  : missing
                    ? "Faltan materiales"
                    : "";
          return (
            '<div class="bench-upgrade"><div><h4>' +
            name +
            '</h4><span class="upgrade-pips">' +
            [0, 1, 2]
              .map((i) => '<i class="' + (i < n ? "on" : "") + '"></i>')
              .join("") +
            "</span></div><p>" +
            desc +
            "</p><ul>" +
            Object.entries(cost)
              .map(
                ([t, k]) =>
                  "<li>" +
                  ITEMS[t].name +
                  " <b>" +
                  FieldDesk.count(g.inv, t) +
                  " / " +
                  k +
                  "</b></li>",
              )
              .join("") +
            '</ul><button data-upgrade="' +
            stat +
            '" ' +
            (err ? "disabled" : "") +
            ">" +
            (err || "Instalar nivel " + (n + 1)) +
            "</button></div>"
          );
        })
        .join("") +
      "</div>";
    detail.querySelectorAll("[data-upgrade]").forEach(
      (b) =>
        (b.onclick = () => {
          const r = this.buy(g, id, b.dataset.upgrade);
          UI.$("benchFeedback").textContent = r.msg;
        }),
    );
  },
};
const ServiceQuests = {
  cur: null,
  docs: {
    w09_workshop: {
      title: "Mantenimiento · devolverle pulso al taller",
      text: "La mesa de ajuste dejó de recibir corriente. El generador auxiliar está en Calderas; es independiente de la persiana del garaje.\n\nFisioterapia recibió el fusible de repuesto durante la evacuación. Lavandería conserva el cable de conexión. Reúne ambas piezas y recompón el circuito en Calderas.\n\nCuando llegue corriente, vuelve a la mesa de Mantenimiento. Los tornillos y las cargas de pólvora permiten ajustar daño, aguante, precisión y cargadores. Cada modificación pertenece a una sola arma.",
    },
    w09_pistol: {
      title: "Escolta médica · una mira fuera de servicio",
      text: "El escolta dejó su mira de M9 en el estuche del Archivo. La herramienta del acople terminó en Rehabilitación. Nadie volvió a recogerla.\n\nEl cierre no tiene teclado: en su hoja de inspección, tres marcas se alinean desde el aro exterior al centro: cruz, rombo, círculo. Gira los discos hasta reconstruir ese sello.\n\nLa mira ayuda a colocar el primer disparo. No sirve para la escopeta ni para el subfusil.",
    },
    w09_shotgun: {
      title: "Hidroterapia · el hombro del vigilante",
      text: "El vigilante tenía la clavícula destrozada. Fabricamos una culata amortiguada para su M12 y la guardamos junto al banco hidráulico.\n\nEl soporte solo libera el acople cuando la presión de la sala se estabiliza. La pieza que falta es el resorte industrial que guardamos en Calderas.\n\nCon presión estable y el resorte correcto, el conjunto reduce el esfuerzo de cada disparo de escopeta. El dolor no lo volvió más valiente; solo lo hizo fallar más.",
    },
    w09_uzi: {
      title: "Banco de sangre · el que casi llegó afuera",
      text: "C-17 fue el último escolta en intentar salir. Cruzó Diagnóstico, oyó la evacuación tras el cristal y regresó al Banco de sangre. Su UZI se perdió, pero llevaba un cargador de transporte sujeto al arnés.\n\nEl tórax se le abrió en placas. Antes de embestir inclina el hombro y deja una marca recta en el suelo. Cuando inspira, aléjate: el grito revienta los oídos cerca de él.\n\nLo aislamos en una crisálida al fondo del banco. No rompas el precinto si no vienes preparado. La puerta permite retirarse; esto no forma parte de la evacuación.",
    },
    w09_rifle: {
      title: "Observación · el cristal que faltaba",
      text: "La óptica del rifle quedó en el estuche del Archivo clínico, en planta alta. El carrete de calibración fue enviado a Diagnóstico, en la planta baja.\n\nEl visor tiene tres ejes. Centra cada indicador sobre la franja de enfoque; el brillo del testigo confirma qué eje está alineado. No fuerces el cierre con números ni uses el prisma del fotómetro.\n\nAislar el arma del temblor ayuda a aprovechar su alcance. Ese vidrio costó más que todos los rifles del turno.",
    },
  },
  initData() {
    Object.assign(DOCS, this.docs);
    Object.keys(this.docs).forEach((id) => CLUES.add(id));
    Object.assign(KEYS, {
      aux_fuse: "Fusible del taller",
      aux_cable: "Cable del generador auxiliar",
      escort_tool: "Herramienta del acople M9",
      damper_spring: "Resorte de amortiguación",
      scope_film: "Carrete de calibración óptica",
    });
    Object.assign(FieldDesk.artifactNotes, {
      aux_fuse: [
        "Fusible recuperado del equipo de Fisioterapia.",
        "Pertenece al generador auxiliar de Calderas, que alimenta la mesa de Mantenimiento.",
      ],
      aux_cable: [
        "Cable aislado del equipo de Lavandería.",
        "Completa la conexión del generador auxiliar. Es independiente del circuito de la salida.",
      ],
      escort_tool: [
        "Herramienta con cabeza de tres caras.",
        "El estuche de la mira M9 está en el Archivo. Revisa la nota de escolta médica.",
      ],
      damper_spring: [
        "Resorte industrial de alta resistencia.",
        "El soporte de Hidroterapia necesita presión estable y este resorte.",
      ],
      scope_film: [
        "Carrete con bandas de enfoque.",
        "Permite alinear el estuche de óptica del Archivo clínico, en planta alta.",
      ],
    });
    const h = FLOORS.hospital,
      up = FLOORS.hospital1,
      b = FLOORS.hospitalb;
    h.items.push(
      _F("savebed_vestibule", "savebed", 39, 30),
      _D("w09_workshop", 6, 64),
      _D("w09_pistol", 12, 55),
      _D("w09_shotgun", 47, 61),
      _D("w09_uzi", 90, 56),
      ["aux_fuse_pick", "key", 14, 59, { key: "aux_fuse" }],
      ["aux_cable_pick", "key", 14, 46, { key: "aux_cable" }],
      ["escort_tool_pick", "key", 37, 64, { key: "escort_tool" }],
      _F("case_pistol", "h_service_pistol", 12, 15),
      _F("case_shotgun", "h_service_shotgun", 58, 61),
      _F("bench_maintenance", "h_workbench", 9, 65),
      _F("cocoon_c17", "h_service_boss", 94, 60),
      ["scope_film_pick", "key", 77, 61, { key: "scope_film" }],
      _FX("uzi_attachment_loot", "h_service_loot", 92, 60, {
        rewardFor: "w09:boss",
      }),
      ["w09_screws", "screw_small", 6, 66, { amount: 8 }],
      ["w09_powder", "powder_small", 7, 69, { amount: 6 }],
    );
    up.items.push(
      _D("w09_rifle", 88, 12),
      _F("case_rifle", "h_service_rifle", 89, 46),
      ["w09_big_screws", "screw_large", 83, 43, { amount: 4 }],
    );
    b.items.push(
      _F("aux_generator", "h_service_generator", 28, 18),
      ["damper_spring_pick", "key", 30, 19, { key: "damper_spring" }],
      ["w09_big_powder", "powder_large", 31, 20, { amount: 4 }],
    );
    // Los accesorios gratuitos antiguos pasan a materiales; los nuevos pertenecen a un arma concreta.
    for (const D of [h, up, b])
      for (const it of D.items)
        if (it[1].startsWith("mod_")) {
          it[1] = "screw_small";
          it[4] = { amount: 5 };
        }
  },
  open(g, kind) {
    this.cur = { kind };
    g.state = "servicePuzzle";
    g.keys = {};
    g.mouse.down = false;
    UI.$("serviceTitle").textContent = {
      generator: "Devuelve la corriente.",
      pistol: "Reconstruye el sello.",
      rifle: "Encuentra el punto de enfoque.",
      boss: "C-17 · El Escolta",
    }[kind];
    if (kind === "boss")
      UI.$("serviceRule").textContent =
        "Encuentro opcional. Tiene embestida y grito con aviso previo. Puedes retirarte por la puerta del Banco de sangre.";
    else
      UI.$("serviceRule").textContent = {
        generator:
          "Gira las conexiones hasta conducir corriente desde la entrada a la salida. Los materiales solo se consumen cuando funciona.",
        pistol:
          "Tres discos del sello: cruz, rombo y círculo, del aro exterior al centro. La hoja de escolta conserva el orden.",
        rifle:
          "Centra los tres ejes sobre sus bandas de enfoque. Cada eje alineado enciende su testigo.",
      }[kind];
    UI.$("serviceFeedback").textContent = "";
    UI.$("serviceTest").textContent =
      kind === "boss"
        ? "Romper precinto · iniciar encuentro"
        : "Comprobar ajuste";
    this.render(g);
    UI.screen("servicePuzzle");
  },
  values(g) {
    const m = g.story.serviceMechanisms || (g.story.serviceMechanisms = {});
    return (
      m[this.cur.kind] ||
      (m[this.cur.kind] =
        this.cur.kind === "generator"
          ? Array(9).fill(0)
          : this.cur.kind === "pistol"
            ? [0, 0, 0]
            : [1, 8, 2])
    );
  },
  render(g) {
    const kind = this.cur.kind,
      body = UI.$("serviceBody");
    if (kind === "boss") {
      body.innerHTML =
        '<div class="c17-warning"><span>⚠</span><h3>El precinto todavía aguanta.</h3><p>Escucha su respiración. Prepara munición y guarda antes de abrir.</p></div>';
      return;
    }
    const v = this.values(g);
    body.innerHTML = "";
    if (kind === "generator") {
      const reach = BluePuzzles.circuitReach(v),
        grid = document.createElement("div");
      grid.className = "service-circuit";
      v.forEach((turn, i) => {
        let ports = BluePuzzles.circuitPorts[i];
        for (let n = 0; n < turn; n++) ports = BluePuzzles.rotate(ports);
        const tile = document.createElement("button");
        tile.className = "service-wire" + (reach.has(i) ? " powered" : "");
        tile.setAttribute("aria-label", "Girar conexión " + (i + 1));
        tile.innerHTML =
          '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="4"/>' +
          [
            [1, 30, 0],
            [2, 60, 30],
            [4, 30, 60],
            [8, 0, 30],
          ]
            .filter(([bit]) => ports & bit)
            .map(([, x, y]) => '<path d="M30 30L' + x + " " + y + '"/>')
            .join("") +
          "</svg>";
        tile.onclick = () => {
          v[i] = (v[i] + 1) % 4;
          this.render(g);
        };
        grid.appendChild(tile);
      });
      body.appendChild(grid);
      const p = document.createElement("p");
      p.className = "service-readout";
      p.textContent = reach.has(9)
        ? "ENTRADA → SALIDA · CIRCUITO CONECTADO"
        : "ENTRADA ← esquina superior izquierda · SALIDA → esquina inferior derecha";
      body.appendChild(p);
    } else if (kind === "pistol") {
      const shapes = ["○", "✚", "◇", "△"];
      v.forEach((n, i) => {
        const b = document.createElement("button");
        b.className = "seal-disc";
        b.setAttribute("aria-label", "Girar disco " + (i + 1));
        b.innerHTML =
          "<small>" +
          ["EXTERIOR", "MEDIO", "CENTRO"][i] +
          "</small><strong>" +
          shapes[n] +
          "</strong>";
        b.onclick = () => {
          v[i] = (n + 1) % 4;
          this.render(g);
        };
        body.appendChild(b);
      });
    } else {
      v.forEach((n, i) => {
        const row = document.createElement("div");
        row.className = "scope-axis" + (n === 5 ? " aligned" : "");
        row.innerHTML =
          "<span>EJE " +
          ["HORIZONTAL", "VERTICAL", "PARALAJE"][i] +
          '</span><div class="scope-track"><i></i><b style="left:' +
          n * 10 +
          '%"></b></div><button data-d="-1" aria-label="Reducir eje ' +
          (i + 1) +
          '">−</button><button data-d="1" aria-label="Aumentar eje ' +
          (i + 1) +
          '">+</button>';
        row.querySelectorAll("button").forEach(
          (b) =>
            (b.onclick = () => {
              v[i] = Math.max(0, Math.min(10, n + Number(b.dataset.d)));
              this.render(g);
            }),
        );
        body.appendChild(row);
      });
    }
  },
  requirements(g, kind) {
    const req =
      {
        generator: ["aux_fuse", "aux_cable"],
        pistol: ["escort_tool"],
        rifle: ["scope_film"],
        shotgun: ["damper_spring"],
      }[kind] || [];
    if (kind === "generator" && !g.inv.docs.includes("w09_workshop"))
      return "La conexión está incompleta. La orden de Mantenimiento explica qué circuito alimenta.";
    if (kind === "boss" && !g.inv.docs.includes("w09_uzi"))
      return "El precinto tiene una advertencia. Examina el registro del Banco de sangre antes de romperlo.";
    if (kind === "shotgun" && !g.pz["blue:hydro"])
      return "El soporte hidráulico no tiene presión estable. Revisa el circuito de la sala.";
    if (req.some((k) => !g.inv.keys.includes(k)))
      return (
        "Falta: " +
        req
          .filter((k) => !g.inv.keys.includes(k))
          .map((k) => KEYS[k])
          .join(" y ") +
        ". Revisa los documentos recuperados."
      );
    return "";
  },
  complete(g) {
    const kind = this.cur?.kind;
    if (!kind) return false;
    const err = this.requirements(g, kind);
    if (err) {
      UI.$("serviceFeedback").textContent = err;
      return false;
    }
    if (kind === "boss") {
      g.story.c17 = { active: true, hp: 360 };
      this.sync(g);
      g.resume();
      Sound.play("attack");
      return true;
    }
    const v = this.values(g),
      solved =
        kind === "generator"
          ? BluePuzzles.circuitReach(v).has(9)
          : kind === "pistol"
            ? v.join(",") === "1,2,0"
            : v.every((n) => n === 5);
    if (!solved) {
      UI.$("serviceFeedback").textContent =
        "El mecanismo sigue resistiendo. Puedes salir y volver sin perder el ajuste.";
      return false;
    }
    const consumed = {
      generator: ["aux_fuse", "aux_cable"],
      pistol: ["escort_tool"],
      rifle: ["scope_film"],
    }[kind];
    g.inv.keys = g.inv.keys.filter((k) => !consumed.includes(k));
    if (kind === "generator") {
      Workshop.ensure(g).powered = true;
      UI.msg(
        "El generador auxiliar alimenta la mesa de Mantenimiento. El garaje sigue en su circuito independiente.",
        5000,
      );
      AcousticPressure.emit(g, 3);
    } else Workshop.claim(g, kind);
    g.resume();
    Hospital.checkpoint(g);
    return true;
  },
  use(g, it) {
    if (it.type === "h_workbench") {
      Workshop.open(g);
      return true;
    }
    const kind = it.type.slice("h_service_".length);
    if (kind === "loot") {
      if (!g.pz["w09:boss"]) return true;
      Workshop.claim(g, "viper");
      g.picked.add(it.id);
      g.items = g.items.filter((i) => i.id !== it.id);
      Hospital.checkpoint(g);
      return true;
    }
    if (kind === "generator" && Workshop.ensure(g).powered) {
      UI.msg("El generador auxiliar ya está funcionando.");
      return true;
    }
    if (
      ["pistol", "rifle", "shotgun"].includes(kind) &&
      Workshop.has(g, kind)
    ) {
      UI.msg("Ya recuperaste este accesorio.");
      return true;
    }
    if (kind === "boss" && (g.story.c17?.active || g.pz["w09:boss"])) {
      UI.msg(
        g.pz["w09:boss"]
          ? "El precinto está vacío."
          : "C-17 ya salió del precinto.",
      );
      return true;
    }
    const err = this.requirements(g, kind);
    if (err) {
      UI.msg(err, 4200);
      return true;
    }
    if (kind === "shotgun") {
      g.inv.keys = g.inv.keys.filter((k) => k !== "damper_spring");
      Workshop.claim(g, "shotgun");
      return true;
    }
    this.open(g, kind);
    return true;
  },
  sync(g) {
    if (g.lvl !== "hospital") return;
    g.items = g.items.filter(
      (i) =>
        i.id !== "uzi_attachment_loot" ||
        (g.pz["w09:boss"] && !g.picked.has(i.id)),
    );
    if (
      g.story.c17?.active &&
      !g.pz["w09:boss"] &&
      !g.enemies.some((e) => e.id === 1197 && !e.dead)
    )
      g.enemies.push(
        new EscoltaC17(1197, 92.5 * 32, 59.5 * 32, g.story.c17.hp),
      );
    if (
      g.pz["w09:boss"] &&
      !g.picked.has("uzi_attachment_loot") &&
      !g.items.some((i) => i.id === "uzi_attachment_loot")
    )
      g.items.push({
        id: "uzi_attachment_loot",
        type: "h_service_loot",
        x: 92.5 * 32,
        y: 60.5 * 32,
        fixed: true,
      });
  },
};
class EscoltaC17 extends Enemy {
  constructor(id, x, y, hp) {
    super("camillero", x, y, id);
    this.def = {
      ...this.def,
      name: "C-17 · El Escolta",
      hp: 360,
      dmg: 24,
      xp: 120,
      small: false,
    };
    this.hp = hp || 360;
    this.maxHp = 360;
    this.r = 18;
    this.isBoss = true;
    this.active = true;
    this.mode = "stalk";
    this.clock = 2;
    this.face = 0;
    this.frozen = 0;
  }
  hurt(d, a, g) {
    if (this.dead) return;
    this.hp -= d * (this.mode === "stun" ? 1.25 : 0.9);
    this.hitFlash = 0.15;
    g.sparks(this.x, this.y, 5, "#843b4c");
    g.story.c17.hp = Math.max(0, this.hp);
    if (this.hp <= 0) this.die(g);
  }
  die(g) {
    if (this.dead) return;
    super.die(g);
    g.pz["w09:boss"] = true;
    g.story.c17 = { active: false, hp: 0 };
    ServiceQuests.sync(g);
    UI.msg("C-17 cae. Algo sigue sujeto a su arnés.", 4500);
    Hospital.checkpoint(g);
  }
  update(dt, g) {
    if (this.dead) return;
    dt *= Specializations.fieldFactor(this, g);
    const p = g.player;
    this.hitFlash = Math.max(0, this.hitFlash - dt);
    if (this.frozen > 0) {
      this.frozen -= dt;
      return;
    }
    if (this.stagger > 0) {
      this.stagger -= dt;
      return;
    }
    if (Hospital.roomAt(p) !== "Banco de sangre") {
      this.mode = "stalk";
      this.clock = Math.max(this.clock, 1);
      return;
    }
    this.clock -= dt;
    const d = Math.hypot(p.x - this.x, p.y - this.y),
      a = Math.atan2(p.y - this.y, p.x - this.x);
    this.face = a;
    if (this.mode === "windup" && this.clock <= 0) {
      this.mode = "charge";
      this.clock = 0.75;
      return;
    }
    if (this.mode === "charge") {
      const x = this.x,
        y = this.y;
      Level.move(
        this,
        Math.cos(this.dir) * 330 * dt,
        Math.sin(this.dir) * 330 * dt,
      );
      if (d < this.r + p.r + 5 && Level.los(this.x, this.y, p.x, p.y)) {
        p.hurt(27, this.dir, g);
        this.clock = 0;
      }
      if (this.clock <= 0 || Math.hypot(this.x - x, this.y - y) < dt * 70) {
        this.mode = "stun";
        this.clock = 1.8;
      }
      this.clamp();
      return;
    }
    if (this.mode === "roar") {
      if (this.clock <= 0) {
        if (d < 140 && Level.los(this.x, this.y, p.x, p.y)) p.hurt(22, a, g);
        g.ring(this.x, this.y, 140, "#a77586");
        AcousticPressure.emit(g, 1.5, this.x, this.y);
        this.mode = "stun";
        this.clock = 1.4;
      }
      return;
    }
    if (this.mode === "stun") {
      if (this.clock <= 0) {
        this.mode = "stalk";
        this.clock = 2.4;
      }
      return;
    }
    if (this.clock <= 0) {
      this.mode = d < 140 ? "roar" : "windup";
      this.clock = 1.1;
      this.dir = a;
      Sound.play("attack");
      return;
    }
    if (d > 62 && Level.los(this.x, this.y, p.x, p.y))
      Level.move(this, Math.cos(a) * 60 * dt, Math.sin(a) * 60 * dt);
    this.clamp();
  }
  clamp() {
    this.x = Math.max(86 * 32 + this.r, Math.min(98 * 32 - this.r, this.x));
    this.y = Math.max(51 * 32 + this.r, Math.min(65 * 32 - this.r, this.y));
  }
  draw(c) {
    if (this.dead) return;
    BlueArt.human(c, { ...this, def: { color: "#705966" } }, true);
    c.save();
    c.translate(this.x, this.y);
    c.strokeStyle = this.hitFlash > 0 ? "#eee3d4" : "#b5949e";
    c.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.ellipse(-3 + i * 4, -7 + i * 7, 14, 7, 0.4, 0, Math.PI * 2);
      c.stroke();
    }
    if (this.mode === "windup") {
      c.strokeStyle = "#c49a7166";
      c.lineWidth = 16;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(Math.cos(this.dir) * 240, Math.sin(this.dir) * 240);
      c.stroke();
    }
    if (this.mode === "roar") {
      c.strokeStyle = "#ca94ac99";
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, 140, 0, Math.PI * 2);
      c.stroke();
    }
    c.restore();
  }
}
ServiceQuests.initData();
(() => {
  Weapons.effective = (p, id) => Workshop.effective(Game, p, id);
  const mag = Weapons.magSize;
  Weapons.magSize = function (p, w) {
    const id = w._id || Object.keys(WEAPONS).find((id) => WEAPONS[id] === w);
    return (
      mag.call(this, p, w) + (isR2() && id ? Workshop.magBonus(Game, id) : 0)
    );
  };
  const use = Puzzles.use;
  Puzzles.use = function (g, it) {
    if (it.type === "h_workbench" || it.type.startsWith("h_service_"))
      return ServiceQuests.use(g, it);
    return use.call(this, g, it);
  };
  const label = Puzzles.label;
  Puzzles.label = function (it) {
    return (
      {
        h_workbench: "Usar mesa de mejoras",
        h_service_generator: "Examinar generador auxiliar",
        h_service_pistol: "Examinar estuche de mira M9",
        h_service_shotgun: "Examinar soporte amortiguado",
        h_service_rifle: "Examinar estuche óptico",
        h_service_boss: "Examinar precinto de C-17",
        h_service_loot: "Recuperar cargador del arnés",
      }[it.type] || label.call(this, it)
    );
  };
  const build = Hospital.buildLevel;
  Hospital.buildLevel = function (g, ...args) {
    const r = build.call(this, g, ...args);
    ServiceQuests.sync(g);
    return r;
  };
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    Workshop.init(this);
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    for (const id of ["workbench", "servicePuzzle"])
      UI.$(id)?.classList.toggle("hidden", id !== name);
  };
  const draw = Hospital.drawItem;
  Hospital.drawItem = function (c, it) {
    if (it.type === "h_workbench") {
      c.fillStyle = "#34464a";
      c.fillRect(-15, -9, 30, 18);
      c.fillStyle = "#b0b5a3";
      c.fillRect(-13, -8, 26, 4);
      c.strokeStyle = Workshop.powered(Game) ? "#92bd9d" : "#9d784b";
      c.lineWidth = 2;
      c.strokeRect(-10, -1, 10, 5);
      c.fillStyle = "#92978d";
      c.fillRect(5, -2, 6, 8);
      return true;
    }
    if (it.type.startsWith("h_service_")) {
      c.fillStyle = it.type === "h_service_boss" ? "#49313e" : "#39474b";
      c.fillRect(-12, -10, 24, 20);
      c.strokeStyle = "#b4a57e";
      c.lineWidth = 1.5;
      c.strokeRect(-10, -8, 20, 16);
      c.fillStyle = "#b6b9a1";
      c.fillRect(-3, -3, 6, 6);
      return true;
    }
    return draw.call(this, c, it);
  };
  const update = Game.update;
  Game.update = function (dt) {
    update.call(this, dt);
    const boss = this.enemies.find((e) => e instanceof EscoltaC17 && !e.dead);
    const shown = boss && Hospital.roomAt(this.player) === "Banco de sangre";
    UI.$("optionalBoss").classList.toggle("hidden", !shown);
    if (shown)
      UI.$("optionalBoss").innerHTML =
        '<span>ENCUENTRO OPCIONAL / C-17 · EL ESCOLTA</span><div><i style="width:' +
        Math.max(0, (boss.hp / boss.maxHp) * 100) +
        '%"></i></div>';
  };
})();
