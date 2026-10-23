// Fase 1 · v0.8: expediente de campo, cartografía y cambios físicos de adaptación.
const DeskIcons = {
  svg(type) {
    if (type.startsWith("w_")) return WeaponGlyphs.svg(type.slice(2));
    let shape;
    if (type.startsWith("am_")) {
      if (type === "am_grenade")
        shape =
          '<rect x="24" y="22" width="20" height="30" rx="7" fill="#627350"/><path d="M29 22v-9h14l6 12M24 33h20m-20 8h20"/>';
      else {
        const shell = type === "am_shells",
          long = type === "am_rifle" || type === "am_ak",
          box =
            {
              am_shells: "#603a35",
              am_smg: "#374d42",
              am_rifle: "#3b475c",
              am_ak: "#514438",
            }[type] || "#504b38";
        shape =
          '<path d="M9 30l7-7h33l7 7v26H9z" fill="' +
          box +
          '"/><path d="M9 32h47M16 23v9m33-9v9M15 50h34"/>';
        for (let i = 0; i < 3; i++) {
          const x = 18 + i * 11;
          shape += shell
            ? '<path d="M' +
              x +
              ' 45V29h6v16z" fill="#a75545"/><path d="M' +
              (x - 1) +
              ' 45h8v4h-8z" fill="#c2a67a"/>'
            : '<path d="M' +
              x +
              " 46V" +
              (long ? 26 : 32) +
              "l3-" +
              (long ? 8 : 5) +
              " 3 " +
              (long ? 8 : 5) +
              "v" +
              (long ? 20 : 14) +
              'z" fill="#c5aa75"/><path d="M' +
              x +
              " " +
              (long ? 31 : 36) +
              'h6"/>';
        }
      }
    } else if (type.startsWith("inj_")) {
      const color = ITEMS[type].color;
      shape =
        '<g transform="rotate(32 32 32)"><path d="M25 8h14m-10 0v10m7-10v10M22 18h20m-16 0v29l6 6 6-6V18"/><path d="M27 30h10v16l-5 5-5-5z" fill="' +
        color +
        '" stroke="none"/><path d="M32 53v8m-5-37h6m-6 5h4m-4 5h6"/></g>';
    } else if (type.startsWith("screw_")) {
      shape =
        '<g transform="rotate(35 32 32)"><path d="M23 9h18v10H23z" fill="#a6b0b4"/><path d="M28 19v31l4 6 4-6V19M27 25h10m-10 6h10m-10 6h10m-10 6h10"/></g>';
    } else if (type.startsWith("powder_")) {
      shape =
        '<path d="M25 8h16v9H25z" fill="#b3b9b0"/><path d="M22 17h22l5 8v30H17V25z" fill="#605444"/><path d="M17 27h32M20 34h26v14H20z"/><path d="M28 44l5-9 5 9z" fill="#d7b379"/>';
    } else if (type === "sample") {
      shape =
        '<path d="M23 7h20v8H23zM26 15v14l-8 14v12h30V43l-8-14V15"/><path d="M19 42q7-5 15 0t13 0v12H19z" fill="#8661b9"/><circle cx="29" cy="44" r="3"/><circle cx="38" cy="49" r="2"/>';
    } else if (type === "optic_lens") {
      shape =
        '<path d="M32 10L9 48h46z" fill="#637f95"/><path d="M32 10v26L9 48m23-12 23 12M5 29l20 6m17 1 17-10m-17 10 17 8"/>';
    } else if (type === "optic_cell") {
      shape =
        '<rect x="20" y="15" width="26" height="40" rx="3" fill="#3d4e5c"/><path d="M27 15V9h12v6m-7 8-6 13h9l-5 12M24 51h18"/>';
    } else if (type === "rack_crank") {
      shape =
        '<path d="M12 18h17v27h18" fill="none" stroke-width="7"/><rect x="8" y="12" width="10" height="15" rx="3" fill="#85715c"/><rect x="44" y="38" width="12" height="14" rx="3" fill="#85715c"/>';
    } else if (/tarjeta|pase|farmacia|seguridad|lab/.test(type)) {
      shape =
        '<rect x="9" y="16" width="48" height="33" rx="3" fill="#718793"/><path d="M9 24h48M32 31h18m-18 6h12"/><rect x="15" y="30" width="10" height="12" fill="#253743"/>';
    } else {
      shape =
        '<g transform="rotate(-30 32 32)"><circle cx="32" cy="20" r="11" fill="#8f9d9d"/><circle cx="32" cy="20" r="4"/><path d="M30 31v25h8v-7h6v-7H32" fill="#8f9d9d"/></g>';
    }
    return (
      '<svg class="item-glyph" viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="#d5dedb" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round">' +
      shape +
      "</g></svg>"
    );
  },
  tile(it) {
    const df = ITEMS[it.type],
      qty = it.count ?? it.mag;
    return (
      this.svg(it.type) +
      '<span class="item-short">' +
      FieldDesk.escape(df.short) +
      "</span>" +
      (qty != null ? '<strong class="item-quantity">' + qty + "</strong>" : "")
    );
  },
};
const DeskRecipes = {
  pistol: {
    cost: { screw_small: 2, powder_small: 2 },
    ammo: "am_pistol",
    count: 10,
    label: "10 balas de 9 mm",
    group: "munición",
  },
  shotgun: {
    cost: { screw_large: 1, powder_large: 2 },
    ammo: "am_shells",
    count: 4,
    label: "4 cartuchos de escopeta",
    group: "munición",
  },
  viper: {
    cost: { screw_small: 3, powder_small: 3 },
    ammo: "am_smg",
    count: 20,
    label: "20 balas de UZI",
    group: "munición",
  },
  rifle: {
    cost: { screw_large: 2, powder_large: 2 },
    ammo: "am_rifle",
    count: 5,
    label: "5 cartuchos de rifle",
    group: "munición",
  },
  launcher: {
    cost: { screw_large: 3, powder_large: 4 },
    ammo: "am_grenade",
    count: 2,
    label: "2 granadas",
    group: "munición",
    legacy: true,
  },
  powder_split: {
    cost: { powder_large: 1 },
    ammo: "powder_small",
    count: 3,
    label: "3 cargas pequeñas de pólvora",
    group: "preparación",
  },
  screw_split: {
    cost: { screw_large: 1 },
    ammo: "screw_small",
    count: 3,
    label: "3 tornillos pequeños",
    group: "preparación",
  },
  powder_pack: {
    cost: { powder_small: 4 },
    ammo: "powder_large",
    count: 1,
    label: "1 carga grande de pólvora",
    group: "preparación",
  },
  screw_pack: {
    cost: { screw_small: 4 },
    ammo: "screw_large",
    count: 1,
    label: "1 tornillo grande",
    group: "preparación",
  },
};
const FieldDesk = {
  tabs: [
    ["inv", "Inventario", "TAB"],
    ["craft", "Construcción", ""],
    ["artifacts", "Artefactos", ""],
    ["doc", "Documentos", "J"],
    ["map", "Mapa", "M"],
    ["tree", "Adaptación", "K"],
  ],
  escape(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  },
  isOpen(state) {
    return this.tabs.some((t) => t[0] === state);
  },
  count(inv, type) {
    return inv.items
      .filter((i) => i.type === type)
      .reduce((n, i) => n + (i.count ?? 1), 0);
  },
  consume(inv, cost) {
    for (const [type, need] of Object.entries(cost)) {
      let left = need;
      for (let i = inv.items.length - 1; i >= 0 && left > 0; i--) {
        const it = inv.items[i];
        if (it.type !== type) continue;
        const take = Math.min(left, it.count ?? 1);
        left -= take;
        if (it.count != null) it.count -= take;
        if (it.count == null || it.count === 0) inv.removeAt(i);
      }
    }
  },
  canCraft(inv, id) {
    const r = DeskRecipes[id];
    if (!r) return "Receta desconocida.";
    if (Object.entries(r.cost).some(([t, n]) => this.count(inv, t) < n))
      return "Faltan materiales.";
    const trial = new Inventory();
    trial.load(JSON.parse(JSON.stringify(inv.serialize())));
    this.consume(trial, r.cost);
    return trial.addAmmo(r.ammo, r.count) === r.count
      ? ""
      : "Falta espacio en el maletín.";
  },
  init(g) {
    const nav = document.createElement("header");
    nav.id = "fieldDesk";
    nav.className = "hidden";
    nav.innerHTML =
      '<div class="desk-brand"><b>R / II</b><span>EXPEDIENTE DE CAMPO<small>PAUSA TÁCTICA · FASE 1</small></span></div><nav aria-label="Secciones del expediente">' +
      this.tabs
        .map(
          ([id, n, k]) =>
            '<button data-desk="' +
            id +
            '">' +
            n +
            (k ? "<kbd>" + k + "</kbd>" : "") +
            "</button>",
        )
        .join("") +
      '</nav><button id="deskClose" aria-label="Cerrar expediente">× <small>ESC</small></button>';
    document.body.appendChild(nav);
    nav
      .querySelectorAll("[data-desk]")
      .forEach((b) => (b.onclick = () => this.open(g, b.dataset.desk)));
    UI.$("deskClose").onclick = () => g.resume();
    for (const [id, body] of [
      [
        "craft",
        '<div class="desk-page"><header><span class="eyebrow">BANCO DE FABRICACIÓN</span><h2>Un recurso. Otra oportunidad.</h2><p>Prepara munición o transforma materiales. Solo gastas lo que confirma la receta.</p></header><div id="craftStock"></div><div id="craftFilters"><button data-filter="all">Todo</button><button data-filter="munición">Munición</button><button data-filter="preparación">Preparación</button></div><div id="craftCards"></div><p id="craftFeedback" role="status" aria-live="polite"></p></div>',
      ],
      [
        "artifacts",
        '<div class="desk-page"><header><span class="eyebrow">OBJETOS DE INVESTIGACIÓN</span><h2>Todo deja una pista.</h2><p>Llaves y piezas de mecanismos. No ocupan espacio en tu maletín.</p></header><div class="artifact-layout"><div id="artifactList"></div><article id="artifactDetail"></article></div></div>',
      ],
    ]) {
      const e = document.createElement("section");
      e.id = id;
      e.className = "screen hidden";
      e.innerHTML = body;
      document.body.appendChild(e);
    }
    UI.$("craftFilters")
      .querySelectorAll("button")
      .forEach(
        (b) =>
          (b.onclick = () => {
            this.craftFilter = b.dataset.filter;
            this.renderCraft(g);
          }),
      );
    addEventListener(
      "keydown",
      (e) => {
        if (
          !isR2lvl(g.lvl) ||
          g.mut?.bindingTarget ||
          !["play", ...this.tabs.map((t) => t[0])].includes(g.state)
        )
          return;
        if (e.code === "KeyF" && g.state === "inv") {
          e.preventDefault();
          e.stopImmediatePropagation();
          if (!e.repeat) g.useInj();
          return;
        }
        const tab = { Tab: "inv", KeyJ: "doc", KeyK: "tree", KeyM: "map" }[
          e.code
        ];
        if (!tab && !(e.code === "Escape" && this.isOpen(g.state))) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        if (e.repeat) return;
        if (!tab || g.state === tab) g.resume();
        else this.open(g, tab);
      },
      true,
    );
  },
  open(g, tab, id) {
    if (!g.player || !["play", ...this.tabs.map((t) => t[0])].includes(g.state))
      return;
    if (tab === "tree" && !g.mut.tutorial)
      return UI.msg(
        "La adaptación se abrirá cuando el Riutex despierte.",
        2500,
      );
    if (tab !== "tree") g.mut.bindingTarget = null;
    g.keys = {};
    g.mouse.down = false;
    g.mouse.clicked = false;
    if (tab === "map") {
      g.state = "play";
      this.baseMap.call(g);
      return;
    }
    g.state = tab;
    if (tab === "inv") UI.renderInv(g);
    if (tab === "craft") this.renderCraft(g);
    if (tab === "artifacts") this.renderArtifacts(g);
    if (tab === "tree") {
      g.mut.seen = true;
      UI.renderTree(g);
    }
    if (tab === "doc") {
      id = id || g.jSel || g.inv.docs[g.inv.docs.length - 1];
      if (id && g.inv.docs.includes(id)) UI.renderJournal(g, id);
      else {
        UI.$("jHead").textContent = "Documentos · 0";
        UI.$("jItems").innerHTML =
          '<p class="desk-empty">Aún no has recuperado documentos. Examina notas, expedientes y cartas con E.</p>';
        UI.$("jTabs").innerHTML = "";
        UI.$("docT").textContent = "Un archivo por reconstruir";
        UI.$("docB").textContent =
          "Aquí podrás volver a leer las pistas y registros que encuentres.";
        UI.$("jStamp").textContent = "ARCHIVO VACÍO";
        UI.$("jPaper").className = "document-sheet";
      }
    }
    UI.screen(tab);
  },
  screen(name) {
    if (!UI.$("fieldDesk")) return;
    const open = this.isOpen(name);
    UI.$("fieldDesk").classList.toggle("hidden", !open);
    for (const id of ["craft", "artifacts"])
      UI.$(id).classList.toggle("hidden", name !== id);
    document.body.classList.toggle("desk-open", open);
    UI.$("fieldDesk")
      .querySelectorAll("[data-desk]")
      .forEach((b) => {
        const on = b.dataset.desk === name;
        b.classList.toggle("active", on);
        b.setAttribute("aria-current", on ? "page" : "false");
      });
  },
  renderInventory(g, stash = false) {
    const inv = g.inv,
      box = UI.$(stash ? "stGrid" : "invGrid"),
      C = 56;
    box.innerHTML = "";
    box.style.gridTemplateColumns = "repeat(" + inv.cols + ",56px)";
    const render = () => (stash ? UI.renderStash(g) : UI.renderInv(g));
    for (let y = 0; y < inv.rows; y++)
      for (let x = 0; x < inv.cols; x++) {
        const cell = document.createElement("button");
        cell.className = "cell";
        cell.setAttribute(
          "aria-label",
          "Mover a columna " + (x + 1) + ", fila " + (y + 1),
        );
        cell.onclick = () => {
          const it = inv.selItem();
          if (it && !inv.move(it, x, y)) UI.msg("No cabe ahí.", 1500);
          render();
        };
        box.appendChild(cell);
      }
    inv.items.forEach((it, i) => {
      const df = ITEMS[it.type],
        d = document.createElement("button");
      d.className =
        "it" +
        (i === inv.sel ? " sel" : "") +
        (g.player.weapon === it ? " equipped" : "") +
        (it.h > it.w && df.w > df.h ? " rotated" : "");
      d.style.cssText =
        "left:" +
        it.x * C +
        "px;top:" +
        it.y * C +
        "px;width:" +
        it.w * C +
        "px;height:" +
        it.h * C +
        "px;--item-color:" +
        df.color;
      d.dataset.itemType = it.type;
      d.setAttribute(
        "aria-label",
        df.name + (it.count != null ? " · " + it.count : ""),
      );
      d.setAttribute("aria-pressed", i === inv.sel ? "true" : "false");
      d.innerHTML = DeskIcons.tile(it);
      d.onclick = (e) => {
        e.stopPropagation();
        inv.sel = i;
        render();
      };
      box.appendChild(d);
    });
    if (stash) return;
    const used = inv.items.reduce((n, it) => n + it.w * it.h, 0),
      s = inv.selItem(),
      df = s && ITEMS[s.type];
    UI.$("invCap").textContent =
      inv.cols * inv.rows -
      used +
      " CASILLAS LIBRES / " +
      inv.cols * inv.rows +
      " · MALETÍN " +
      inv.cols +
      " × " +
      inv.rows;
    UI.$("invInfo").innerHTML =
      '<div class="inventory-preview">' +
      (s ? DeskIcons.svg(s.type) : Guidebook.icon("bag")) +
      '</div><span class="eyebrow">' +
      (s
        ? s.type.startsWith("w_")
          ? "ARMAMENTO"
          : df.use
            ? "SUMINISTRO MÉDICO"
            : "SUMINISTROS"
        : "EQUIPO PERSONAL") +
      "</span><h3>" +
      this.escape(df?.name || "Organiza para sobrevivir.") +
      "</h3><p>" +
      this.escape(
        df?.desc ||
          "Selecciona un objeto y una casilla para moverlo. R lo gira. Llaves y documentos tienen sus propias pestañas.",
      ) +
      '</p><div class="inventory-footnote">SALUD ' +
      Math.ceil(g.player.hp) +
      " / " +
      g.player.maxHp +
      "<br>" +
      (s
        ? s.w +
          " × " +
          s.h +
          " casillas" +
          (g.player.weapon === s ? " · EQUIPADA" : "")
        : "Escoge qué llevar y qué guardar en un baúl.") +
      "</div>";
    UI.$("invKeys").textContent = "";
    UI.$("invDocs").innerHTML = "";
    UI.$("bUse").disabled = !df?.use;
    UI.$("bRot").disabled = !s || s.w === s.h;
    UI.$("bDrop").disabled = !s;
  },
  renderCraft(g) {
    UI.$("craftStock").innerHTML = [
      "screw_small",
      "screw_large",
      "powder_small",
      "powder_large",
    ]
      .map(
        (t) =>
          "<span>" +
          DeskIcons.svg(t) +
          "<span>" +
          this.escape(ITEMS[t].name) +
          "<b>" +
          this.count(g.inv, t) +
          "</b></span></span>",
      )
      .join("");
    const box = UI.$("craftCards");
    box.innerHTML = "";
    for (const [id, r] of Object.entries(DeskRecipes)) {
      if (r.legacy && isR2lvl(g.lvl)) continue;
      if (
        this.craftFilter &&
        this.craftFilter !== "all" &&
        r.group !== this.craftFilter
      )
        continue;
      const err = this.canCraft(g.inv, id),
        el = document.createElement("article");
      el.className = "recipe-card" + (err ? " unavailable" : "");
      el.innerHTML =
        '<div class="recipe-preview">' +
        DeskIcons.svg(r.ammo) +
        "<b>×" +
        r.count +
        '</b></div><div><span class="eyebrow">' +
        r.group +
        "</span><h3>" +
        this.escape(ITEMS[r.ammo].name) +
        "</h3><ul>" +
        Object.entries(r.cost)
          .map(
            ([t, n]) =>
              '<li class="' +
              (this.count(g.inv, t) < n ? "missing" : "") +
              '">' +
              this.escape(ITEMS[t].name) +
              " <b>" +
              this.count(g.inv, t) +
              " / " +
              n +
              "</b></li>",
          )
          .join("") +
        '</ul><button data-recipe="' +
        id +
        '" ' +
        (err ? "disabled" : "") +
        ">" +
        (err || "Fabricar ×" + r.count) +
        "</button></div>";
      el.querySelector("button").onclick = () => g.craftAmmo(id);
      box.appendChild(el);
    }
    UI.$("craftFilters")
      .querySelectorAll("button")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          (this.craftFilter || "all") === b.dataset.filter,
        ),
      );
  },
  artifactNotes: {
    estudio: [
      "Una llave de latón con las iniciales de Wren.",
      "Encaja en el acceso al estudio de la mansión.",
    ],
    archivo: [
      "Etiqueta de archivo y dientes estrechos.",
      "Busca la misma placa en las puertas del archivo.",
    ],
    urgencias: [
      "Llave marcada con una cruz de atención inmediata.",
      "Los accesos de Urgencias llevan esta identificación.",
    ],
    farmacia: [
      "Tarjeta clínica con una banda magnética desgastada.",
      "El lector de Farmacia reconoce su banda; no abre cajas de medicamentos.",
    ],
    morgue: [
      "Metal frío, con una placa de anatomía.",
      "Revisa los cierres de Morgue y las conexiones de servicio asociadas.",
    ],
    cocina: [
      "Llave con restos de grasa bajo el aro.",
      "Pertenece a los accesos de la cocina del hospital.",
    ],
    sotano: [
      "Llave robusta, marcada «servicio».",
      "Los pasos al sótano están reservados al personal de mantenimiento.",
    ],
    pase_sup: [
      "Pase de personal autorizado para la planta alta.",
      "Revisa el acceso a las escaleras.",
    ],
    hab07: [
      "Un pequeño llavero con el número 07.",
      "Corresponde a una habitación del área de hospitalización.",
    ],
    director: [
      "Llave de despacho con una placa de Dirección.",
      "Da acceso al área de Dirección, pero su caja fuerte tiene otro cierre.",
    ],
    bib: [
      "Llave marcada con un libro y una cruz.",
      "La biblioteca médica conserva sus puertas cerradas.",
    ],
    garaje: [
      "Llave larga, con una etiqueta de rampa.",
      "Los cierres del garaje requieren además que funcione el suministro eléctrico.",
    ],
    rack_crank: [
      "Manivela mecánica con un acople cuadrado.",
      "Puede accionar un soporte de seguridad. Consulta las notas del personal de mantenimiento.",
    ],
    optic_lens: [
      "Prisma óptico con marcas de calibración.",
      "Desvía un haz de luz. Los registros de Diagnóstico hablan de un equipo retirado.",
    ],
    optic_cell: [
      "Celda de alimentación de un fotómetro.",
      "Sirve para un mecanismo óptico, no para el generador del hospital.",
    ],
    fusible_a: [
      "Fusible clínico A, aún utilizable.",
      "Forma parte de un conjunto eléctrico; revisa los registros del circuito.",
    ],
    fusible_b: [
      "Fusible clínico B, aún utilizable.",
      "Forma parte de un conjunto eléctrico; revisa los registros del circuito.",
    ],
    fusible_c: [
      "Fusible clínico C, aún utilizable.",
      "Forma parte de un conjunto eléctrico; revisa los registros del circuito.",
    ],
  },
  renderArtifacts(g, selected) {
    const keys = g.inv.keys;
    this.artifact = keys.includes(selected)
      ? selected
      : keys.includes(this.artifact)
        ? this.artifact
        : keys[0];
    const list = UI.$("artifactList");
    list.innerHTML = "";
    if (!keys.length)
      list.innerHTML =
        '<p class="desk-empty">Aún no llevas llaves ni piezas de investigación. Los objetos recogidos aparecerán aquí con una pista de uso.</p>';
    for (const k of keys) {
      const b = document.createElement("button");
      b.className = "artifact-entry" + (k === this.artifact ? " active" : "");
      b.innerHTML =
        DeskIcons.svg(k) +
        "<span>" +
        this.escape(KEYS[k] || k) +
        "<small>" +
        (["rack_crank", "optic_cell", "optic_lens"].includes(k)
          ? "PIEZA DE MECANISMO"
          : "ACCESO / INVESTIGACIÓN") +
        "</small></span>";
      b.onclick = () => this.renderArtifacts(g, k);
      list.appendChild(b);
    }
    const k = this.artifact,
      n = this.artifactNotes[k] || [
        "Objeto recuperado durante la exploración.",
        "Compara su identificación con las cerraduras y los documentos recogidos.",
      ];
    const docs = g.inv.docs.filter((id) =>
      ({
        rack_crank: ["w_shot_notice", "w_shot_manual"],
        optic_lens: ["w_uzi_notice", "w_uzi_manual", "w_uzi_optics"],
        optic_cell: ["w_uzi_notice", "w_uzi_manual", "w_uzi_optics"],
      })[k]?.includes(id),
    );
    UI.$("artifactDetail").innerHTML = k
      ? '<div class="artifact-object">' +
        DeskIcons.svg(k) +
        '</div><span class="eyebrow">EN TU PODER</span><h3>' +
        this.escape(KEYS[k] || k) +
        "</h3><p>" +
        n[0] +
        '</p><div class="artifact-hint"><span>OBSERVACIÓN</span><p>' +
        n[1] +
        "</p></div>" +
        docs
          .map(
            (id) =>
              '<button data-related="' +
              id +
              '">Leer: ' +
              this.escape(DOCS[id].title) +
              " ↗</button>",
          )
          .join("")
      : '<div class="artifact-object">' +
        Guidebook.icon("notes") +
        "</div><h3>Investiga a tu ritmo.</h3><p>Estas piezas se conservan fuera del maletín. No puedes perderlas al reorganizar el equipo.</p>";
    UI.$("artifactDetail")
      .querySelectorAll("[data-related]")
      .forEach(
        (b) => (b.onclick = () => this.open(g, "doc", b.dataset.related)),
      );
  },
};
(() => {
  FieldDesk.baseMap = Game.toggleMap;
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    FieldDesk.init(this);
  };
  const screen = UI.screen;
  UI.screen = function (name) {
    screen.call(this, name);
    FieldDesk.screen(name);
  };
  const inventory = UI.renderInv;
  UI.renderInv = function (g) {
    if (!isR2lvl(g.lvl)) return inventory.call(this, g);
    FieldDesk.renderInventory(g);
  };
  const stash = UI.renderStash;
  UI.renderStash = function (g) {
    stash.call(this, g);
    if (!isR2lvl(g.lvl)) return;
    FieldDesk.renderInventory(g, true);
    this.$("stList")
      .querySelectorAll(".jit")
      .forEach((e, i) => {
        const it = g.stash[i];
        if (it)
          e.innerHTML =
            DeskIcons.svg(it.type) +
            "<span>" +
            FieldDesk.escape(ITEMS[it.type].name) +
            (it.count != null ? " ×" + it.count : "") +
            "</span><i>RETIRAR ↗</i>";
      });
  };
  for (const [method, tab] of [
    ["toggleInv", "inv"],
    ["toggleTree", "tree"],
    ["toggleMap", "map"],
    ["openJournal", "doc"],
  ]) {
    const base = Game[method];
    Game[method] = function () {
      if (!isR2lvl(this.lvl)) return base.apply(this, arguments);
      if (this.state === tab && method !== "openJournal") return this.resume();
      FieldDesk.open(this, tab);
    };
  }
  const openDoc = Game.openDoc;
  Game.openDoc = function (id) {
    if (!isR2lvl(this.lvl)) return openDoc.call(this, id);
    openDoc.call(this, id);
    this.keys = {};
    this.mouse.down = false;
  };
  const closeDoc = Game.closeDoc;
  Game.closeDoc = function () {
    if (!isR2lvl(this.lvl)) return closeDoc.call(this);
    this.resume();
  };
  Game.craftAmmo = function (id) {
    const r = this.inv.craft(id);
    UI.msg(r.msg, 2800);
    if (this.state === "craft") {
      FieldDesk.renderCraft(this);
      UI.$("craftFeedback").textContent = r.msg;
    } else UI.renderInv(this);
    return r;
  };
  Inventory.prototype.craft = function (id) {
    const err = FieldDesk.canCraft(this, id);
    if (err) return { ok: false, msg: err };
    const r = DeskRecipes[id];
    FieldDesk.consume(this, r.cost);
    this.addAmmo(r.ammo, r.count);
    return { ok: true, msg: "Fabricaste " + r.label + "." };
  };
  const journal = UI.renderJournal;
  UI.renderJournal = function (g, id) {
    journal.call(this, g, id);
    if (!DOCS[g.jSel]) return;
    const paper = this.$("jPaper");
    paper.classList.add("worn-paper");
    paper.dataset.kind = g.jSel.startsWith("m")
      ? "wren"
      : /w_|security|hydro|pump/.test(g.jSel)
        ? "service"
        : "clinical";
    let head = paper.querySelector(".clinical-letterhead");
    if (!head) {
      head = document.createElement("div");
      head.className = "clinical-letterhead";
      paper.insertBefore(head, paper.firstChild);
    }
    head.innerHTML =
      "<b>✚</b><div>" +
      (paper.dataset.kind === "wren"
        ? "WREN / ARCHIVO PRIVADO"
        : "HOSPITAL SAN GABRIEL") +
      "<small>" +
      (paper.dataset.kind === "service"
        ? "MANTENIMIENTO · CIRCULACIÓN INTERNA"
        : paper.dataset.kind === "wren"
          ? "CORRESPONDENCIA RECUPERADA"
          : "REGISTRO CLÍNICO · COPIA DE ARCHIVO") +
      "</small></div><span>SG / " +
      FieldDesk.escape(g.jSel.toUpperCase().replace(/_/g, "–")) +
      "</span>";
  };
})();
const MapAtlas = {
  view: null,
  floor: null,
  pinning: false,
  layers: "all",
  tools() {
    if (UI.$("mapTools")) return;
    const el = document.createElement("div");
    el.id = "mapTools";
    el.innerHTML =
      '<div class="map-tool-group"><button id="mapZoomIn" aria-label="Acercar mapa">+</button><button id="mapZoomOut" aria-label="Alejar mapa">−</button><button id="mapFit">Vista general</button><button id="mapCenter">Mi posición</button></div><div class="map-tool-group"><button id="mapPin">Poner marca</button><button id="mapErase">Borrar marca</button><button id="mapLayer">Mostrar: todo</button></div>';
    UI.$("mapDrawing").before(el);
    const readout = document.createElement("div");
    readout.id = "mapReadout";
    readout.innerHTML =
      "<b>Tu memoria dibuja el camino.</b><span>Arrastra para explorar · rueda para acercar · selecciona una sala visitada.</span>";
    UI.$("mapDrawing").after(readout);
    const panel = UI.$("map").querySelector(".map-panel"),
      side = document.createElement("aside"),
      workspace = document.createElement("div");
    side.className = "atlas-sidebar";
    workspace.className = "atlas-workspace";
    const close = UI.$("mapClose");
    side.appendChild(panel.querySelector(".panel-title"));
    for (const id of ["mapFloors", "mapStatus", "mapGuidance"])
      side.appendChild(UI.$(id));
    side.appendChild(panel.querySelector(".map-legend"));
    side.appendChild(close);
    for (const id of ["mapTools", "mapDrawing", "mapReadout"])
      workspace.appendChild(UI.$(id));
    panel.appendChild(side);
    panel.appendChild(workspace);
    UI.$("mapZoomIn").onclick = () => this.zoom(0.75);
    UI.$("mapZoomOut").onclick = () => this.zoom(1.33);
    UI.$("mapFit").onclick = () => {
      this.view = [0, 0, this.W, this.H];
      this.apply();
    };
    UI.$("mapCenter").onclick = () => {
      if (this.floor !== Game.lvl) return;
      const w = this.W * 0.48,
        h = this.H * 0.48;
      this.view = [
        Game.player.x / 3.2 - w / 2,
        Game.player.y / 3.2 - h / 2,
        w,
        h,
      ];
      this.apply();
    };
    UI.$("mapPin").onclick = () => {
      this.pinning = !this.pinning;
      this.pinButton();
    };
    UI.$("mapErase").onclick = () => {
      delete Game.story.mapPin;
      this.render(Game);
    };
    UI.$("mapLayer").onclick = () => {
      this.layers =
        this.layers === "all"
          ? "services"
          : this.layers === "services"
            ? "none"
            : "all";
      this.render(Game);
    };
  },
  pinButton() {
    UI.$("mapPin").classList.toggle("active", this.pinning);
    UI.$("mapPin").textContent = this.pinning
      ? "Elige una zona visitada…"
      : "Poner marca";
  },
  apply() {
    this.view[2] = Math.max(
      this.W * 0.22,
      Math.min(this.W * 1.2, this.view[2]),
    );
    this.view[3] = (this.view[2] * this.H) / this.W;
    this.view[0] = Math.max(
      -this.W * 0.12,
      Math.min(this.W - this.view[2] + this.W * 0.12, this.view[0]),
    );
    this.view[1] = Math.max(
      -this.H * 0.12,
      Math.min(this.H - this.view[3] + this.H * 0.12, this.view[1]),
    );
    UI.$("mapDrawing")
      .querySelector("svg")
      .setAttribute("viewBox", this.view.join(" "));
  },
  zoom(f, x, y) {
    if (!this.view) return;
    const [vx, vy, w, h] = this.view,
      cx = x ?? vx + w / 2,
      cy = y ?? vy + h / 2;
    this.view = [cx - (cx - vx) * f, cy - (cy - vy) * f, w * f, h * f];
    this.apply();
  },
  render(g) {
    this.tools();
    const lvl = Blue.floor || g.lvl,
      D = R2_DATA(lvl),
      current = lvl === g.lvl,
      visits = g.story.visited || {},
      tiles = new Set(g.story.mapTiles?.[lvl] || []),
      esc = FieldDesk.escape;
    if (this.floor !== lvl || !this.view) {
      const found = D.rooms.filter((r) => visits[lvl + ":" + r[0]]);
      if (found.length) {
        const x0 = Math.min(...found.map((r) => r[1])) * 10 - 45,
          y0 = Math.min(...found.map((r) => r[2])) * 10 - 45,
          x1 = Math.max(...found.map((r) => r[1] + r[3])) * 10 + 45,
          y1 = Math.max(...found.map((r) => r[2] + r[4])) * 10 + 45,
          width = Math.min(
            D.W * 10,
            Math.max(D.W * 2.2, x1 - x0, ((y1 - y0) * D.W) / D.H),
          );
        this.view = [
          Math.max(0, (x0 + x1 - width) / 2),
          Math.max(0, (y0 + y1 - (width * D.H) / D.W) / 2),
          width,
          (width * D.H) / D.W,
        ];
      } else this.view = [0, 0, D.W * 10, D.H * 10];
      this.floor = lvl;
      this.pinning = false;
    }
    this.W = D.W * 10;
    this.H = D.H * 10;
    const roomAt = (x, y) =>
      D.rooms.find(
        (r) => x >= r[1] && x < r[1] + r[3] && y >= r[2] && y < r[2] + r[4],
      );
    const knownRoom = (r) => !!visits[lvl + ":" + r[0]];
    const known = (x, y) => {
      const r = roomAt(x, y);
      return tiles.has(x + "," + y) && (!r || knownRoom(r));
    };
    let s =
      '<svg viewBox="' +
      this.view.join(" ") +
      '" role="img" aria-label="Plano de exploración; solo lugares visitados"><defs><pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#90b4c2" stroke-opacity=".05" stroke-width=".8"/></pattern><pattern id="mapSafety" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 7L7 0" stroke="#79c3ad" stroke-opacity=".12"/></pattern></defs><rect width="' +
      this.W +
      '" height="' +
      this.H +
      '" fill="url(#mapGrid)"/>';
    for (const key of tiles) {
      const [x, y] = key.split(",").map(Number);
      if (known(x, y))
        s +=
          '<rect x="' +
          x * 10 +
          '" y="' +
          y * 10 +
          '" width="10" height="10" fill="#23343c"/>';
    }
    D.rooms.forEach((r, i) => {
      if (!knownRoom(r)) return;
      const [n, x, y, w, h] = r,
        safe = (D.safe || []).some(
          (a) =>
            x >= a[0] && y >= a[1] && x + w <= a[2] + 1 && y + h <= a[3] + 1,
        ),
        here = current && Hospital.roomAt(g.player) === n;
      s +=
        '<g class="atlas-room' +
        (here ? " current" : "") +
        '" data-room="' +
        i +
        '" tabindex="0" role="button" aria-label="' +
        esc(n) +
        '"><title>' +
        esc(n) +
        '</title><rect x="' +
        x * 10 +
        '" y="' +
        y * 10 +
        '" width="' +
        w * 10 +
        '" height="' +
        h * 10 +
        '" rx="2" fill="' +
        (safe ? "#183d35" : here ? "#2d4854" : "#1c2e37") +
        '" stroke="' +
        (here ? "#97c5d2" : safe ? "#638f7d" : "#56717e") +
        '" stroke-width="1.3"/>' +
        (safe
          ? '<rect x="' +
            x * 10 +
            '" y="' +
            y * 10 +
            '" width="' +
            w * 10 +
            '" height="' +
            h * 10 +
            '" fill="url(#mapSafety)"/>'
          : "") +
        '<text x="' +
        (x + w / 2) * 10 +
        '" y="' +
        (y + h / 2) * 10 +
        '" text-anchor="middle" dominant-baseline="middle" fill="#c1d0d3" font-size="' +
        Math.min(10, ((w * 10) / Math.max(n.length, 1)) * 1.6) +
        '">' +
        esc(n) +
        "</text></g>";
    });
    for (const [id, x, y, w, h, key] of D.doors) {
      let seen = false;
      for (let b = y - 2; b < y + h + 2; b++)
        for (let a = x - 2; a < x + w + 2; a++) if (known(a, b)) seen = true;
      if (!seen) continue;
      const d = current ? Level.doors.find((d) => d.id === id) : null,
        opened = d ? d.open : (g.story.doors?.[lvl] || []).includes(id),
        locked = d ? !!d.key : !!key;
      s +=
        '<rect class="atlas-door" x="' +
        x * 10 +
        '" y="' +
        y * 10 +
        '" width="' +
        w * 10 +
        '" height="' +
        h * 10 +
        '" rx="1" fill="' +
        (opened ? "#6eaaad" : locked ? "#bf8861" : "#adb4af") +
        '"><title>' +
        (opened
          ? "Paso abierto"
          : locked
            ? "Cierre con llave o mecanismo"
            : "Puerta cerrada") +
        "</title></rect>";
    }
    if (this.layers !== "none")
      for (const [id, type, x, y, extra] of D.items) {
        if (
          !known(x, y) ||
          g.picked.has(id) ||
          (extra?.rewardFor && !g.pz[extra.rewardFor])
        )
          continue;
        const service = ["savebed", "caja", "h_stairs", "h_hide"].includes(
          type,
        );
        if (this.layers === "services" && !service) continue;
        const symbol =
          {
            savebed: "✚",
            caja: "▣",
            h_stairs: "↕",
            h_hide: "▥",
            key: "◆",
            doc: "▤",
          }[type] || (type.startsWith("h_") ? "◇" : "•");
        s +=
          '<text class="atlas-object" x="' +
          (x + 0.5) * 10 +
          '" y="' +
          (y + 0.8) * 10 +
          '" text-anchor="middle" fill="' +
          (service ? "#a2c6b0" : "#c9bb8c") +
          '" font-size="13">' +
          symbol +
          "</text>";
      }
    s += HospitalCompass.markup(g, lvl);
    const pin = g.story.mapPin;
    if (pin?.floor === lvl && known(pin.x, pin.y))
      s +=
        '<g class="atlas-pin" transform="translate(' +
        (pin.x + 0.5) * 10 +
        "," +
        (pin.y + 0.5) * 10 +
        ')"><path d="M0 0v-24l16 4-16 8" fill="#c69a69" stroke="#efc89c" stroke-width="1.5"/><text x="5" y="11" fill="#dfbd99" font-size="8">TU MARCA</text></g>';
    if (current)
      s +=
        '<circle class="atlas-pulse" cx="' +
        g.player.x / 3.2 +
        '" cy="' +
        g.player.y / 3.2 +
        '" r="12" fill="none" stroke="#d3ecdc" stroke-width="1.3"/><circle cx="' +
        g.player.x / 3.2 +
        '" cy="' +
        g.player.y / 3.2 +
        '" r="4.5" fill="#f2f2d9" stroke="#538e9b" stroke-width="1.5"/><path d="M0-12L-3-6H3z" fill="#e0e9dd" transform="translate(' +
        g.player.x / 3.2 +
        "," +
        g.player.y / 3.2 +
        ") rotate(" +
        ((g.player.angle * 180) / Math.PI + 90) +
        ')"/>';
    UI.$("mapDrawing").innerHTML =
      s + '</svg><div class="atlas-north">N<span>↑</span></div>';
    const count = D.rooms.filter(knownRoom).length;
    UI.$("mapStatus").innerHTML =
      "<span>EXPLORACIÓN <b>" +
      count +
      " / " +
      D.rooms.length +
      '</b></span><span class="atlas-progress"><i style="width:' +
      (count / D.rooms.length) * 100 +
      '%"></i></span><span>' +
      (current
        ? esc(Hospital.roomAt(g.player) || "Zona de servicio")
        : "Otra planta visitada") +
      "</span>";
    UI.$("mapLayer").textContent =
      "Mostrar: " +
      { all: "todo", services: "servicios", none: "solo plano" }[this.layers];
    UI.$("mapCenter").disabled = !current;
    this.pinButton();
    UI.$("mapFloors")
      .querySelectorAll("button")
      .forEach((b) =>
        b.classList.toggle(
          "active",
          b.textContent ===
            {
              mansion: "Mansión",
              hospital: "Planta baja",
              hospital1: "Primer piso",
              hospitalb: "Sótano",
              hospitalchem: "Contención C-0",
              hospitalworks: "Cloacas / Fábrica",
              hospitalpit: "Almacén circular",
              hospitalnest: "Último colector",
              hospitalcells: "Calabozos de Valcárcel",
              hospitalcastle: "Castillo · planta baja",
              hospitalcastle1: "Castillo · planta alta",
              hospitalroyal: "Sala real",
              hospitalumbra: "Laboratorio UMBRAL",hospitalorigin:"Núcleo ORIGEN",hospitalstreet:"Calles de San Gabriel",
            }[lvl],
        ),
      );
    const svg = UI.$("mapDrawing").querySelector("svg");
    if (!svg.createSVGPoint) return; // El arnés de lógica no simula geometría DOM.
    const point = (e) => {
      const p = svg.createSVGPoint();
      p.x = e.clientX;
      p.y = e.clientY;
      return p.matrixTransform(svg.getScreenCTM().inverse());
    };
    const select = (i) => {
      const r = D.rooms[i];
      if (!r || !knownRoom(r)) return;
      const doors = D.doors.filter(
        (d) =>
          d[1] >= r[1] - 1 &&
          d[1] <= r[1] + r[3] &&
          d[2] >= r[2] - 1 &&
          d[2] <= r[2] + r[4],
      ).length;
      UI.$("mapReadout").innerHTML =
        "<b>" +
        esc(r[0]) +
        "</b><span>SALA VISITADA · " +
        doors +
        " conexiones en su perímetro. Las cerraduras y los documentos pueden ayudarte a volver.</span>";
      svg
        .querySelectorAll(".atlas-room")
        .forEach((el) =>
          el.classList.toggle("selected", Number(el.dataset.room) === i),
        );
    };
    svg.querySelectorAll("[data-room]").forEach(
      (el) =>
        (el.onkeydown = (e) => {
          if (e.code === "Enter" || e.code === "Space") {
            e.preventDefault();
            select(Number(el.dataset.room));
          }
        }),
    );
    let drag;
    svg.onpointerdown = (e) => {
      if (e.button !== 0) return;
      const p = point(e);
      drag = {
        x: e.clientX,
        y: e.clientY,
        p,
        view: [...this.view],
        moved: false,
      };
      svg.setPointerCapture(e.pointerId);
    };
    svg.onpointermove = (e) => {
      if (!drag) return;
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 4)
        drag.moved = true;
      if (!drag.moved) return;
      const p = point(e);
      this.view[0] += drag.p.x - p.x;
      this.view[1] += drag.p.y - p.y;
      this.apply();
    };
    svg.onpointerup = (e) => {
      if (!drag) return;
      const moved = drag.moved;
      drag = null;
      if (moved) return;
      const p = point(e),
        x = Math.floor(p.x / 10),
        y = Math.floor(p.y / 10);
      if (this.pinning) {
        if (!known(x, y)) {
          UI.$("mapReadout").innerHTML =
            "<b>Aún no conoces ese lugar.</b><span>Solo puedes marcar suelo que hayas visto.</span>";
          return;
        }
        g.story.mapPin = { floor: lvl, x, y };
        this.pinning = false;
        this.render(g);
        return;
      }
      const target = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest("[data-room]");
      if (target) select(Number(target.dataset.room));
    };
    svg.onpointercancel = () => (drag = null);
    svg.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const p = point(e);
        this.zoom(e.deltaY < 0 ? 0.85 : 1.18, p.x, p.y);
      },
      { passive: false },
    );
  },
};
const MutationBody = {
  intensity(g) {
    if (!isR2lvl(g.lvl) || !g.story.armHealed) return 0;
    let mass = 0;
    for (const id of g.mut.owned) {
      const s = SKILLS[id];
      if (s?.br === "mut")
        mass += s.kind === "minor" ? 0.22 : s.kind === "gold" ? 1.5 : 1;
    }
    return Math.min(1, mass / 22);
  },
  draw(c, p, g) {
    const n = this.intensity(g);
    if (n <= 0 || p.predator > 0) return;
    c.save();
    c.translate(p.x, p.y);
    c.rotate(p.angle ?? 0);
    c.fillStyle = "#4f536c";
    c.beginPath();
    c.ellipse(11, 9, 7 + n * 2, 2.5 + n * 1.6, 0.1, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = "rgba(156,119,188," + (0.2 + n * 0.55) + ")";
    c.lineWidth = 0.6 + n * 0.55;
    c.beginPath();
    c.moveTo(5, 9);
    c.lineTo(10, 8);
    c.lineTo(13, 10);
    c.lineTo(18 + n * 2, 9);
    c.moveTo(10, 8);
    c.lineTo(11, 12);
    c.stroke();
    if (n > 0.3) {
      c.fillStyle = "#555167";
      c.beginPath();
      c.moveTo(-7, 8);
      c.quadraticCurveTo(-12 - n * 3, 16 + n * 2, -6, 14);
      c.lineTo(-3, 10);
      c.fill();
      c.strokeStyle = "#81708d";
      c.lineWidth = 0.8;
      c.beginPath();
      c.moveTo(-8, 10);
      c.lineTo(-7, 13);
      c.stroke();
    }
    if (n > 0.65) {
      c.strokeStyle = "#8e7a9e";
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(2, 3);
      c.lineTo(4, 5);
      c.lineTo(4, 7);
      c.moveTo(8, -11);
      c.lineTo(12, -10);
      c.stroke();
    }
    c.restore();
  },
};
(() => {
  Blue.renderMap = function (g) {
    MapAtlas.render(g);
    HospitalCompass.map(g, Blue.floor || g.lvl);
  };
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    MapAtlas.tools();
  };
  const art = BlueArt.human;
  BlueArt.human = function (c, p, enemy = false) {
    art.call(this, c, p, enemy);
    if (!enemy) MutationBody.draw(c, p, Game);
  };
  // El reloj se apoya en el muro del estudio, junto al panel secreto. La marca de interacción coincide con el mueble.
  MANSION.furn.clock = [[28, 10]];
  const clock = MANSION.items.find((i) => i[0] === "h_clock");
  clock[2] = 28;
  clock[3] = 11;
  // La taquilla ocupa el hueco de un mueble, fuera de la franja central de circulación.
  const placements = {
    hospital: {
      hide_p1: [38, 22],
      hide_p2: [23, 39],
      hide_p3: [79, 22],
      hide_p4: [84, 20],
    },
    hospital1: { hide_u: [8, 25], hide_v: [8, 38] },
    hospitalb: { hide_b: [75, 31] },
  };
  for (const [floor, entries] of Object.entries(placements)) {
    const D = FLOORS[floor];
    for (const [id, [x, y]] of Object.entries(entries)) {
      const it = D.items.find((i) => i[0] === id);
      it[2] = x;
      it[3] = y;
    }
  }
  const draw = Hospital.drawItem;
  Hospital.drawItem = function (c, it) {
    if (it.type === "h_clock") return true;
    return draw.call(this, c, it);
  };
})();
