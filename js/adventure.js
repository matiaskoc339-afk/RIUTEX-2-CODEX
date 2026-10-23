// Fase 1 · v0.7: equipo del prólogo, botín ganado explorando y orientación aproximada.
Object.assign(WEAPONS, {
  ak: {
    name: "AK de asalto",
    mag: 30,
    dmg: 36,
    rate: 0.11,
    spread: 0.032,
    recoil: 2.6,
    reload: 2,
    range: 760,
    pellets: 1,
    auto: true,
    stam: 3,
    reserveMax: 120,
  },
});
Object.assign(ITEMS, {
  w_ak: {
    name: "AK de asalto",
    short: "AK",
    color: "#a9b5ac",
    w: 4,
    h: 1,
    use: false,
    desc: "Fusil automático del escuadrón. Tecla 1 durante la mansión.",
  },
  am_ak: {
    name: "Munición 7,62 mm",
    short: "7,62 mm",
    color: "#c6ab76",
    w: 1,
    h: 1,
    use: false,
    cap: 30,
    desc: "Munición del AK; equipo exclusivo de la operación Wren.",
  },
});
AMMO.ak = "am_ak";
WEAPONS.viper.name = "UZI";
Object.assign(ITEMS.w_viper, {
  name: "Subfusil UZI",
  short: "UZI",
  desc: "Arma compacta de alta cadencia. Tecla 3.",
});
Object.assign(ITEMS.am_smg, {
  name: "Munición de UZI",
  short: "UZI",
  desc: "Munición del subfusil; se apila hasta 40.",
});
Object.assign(KEYS, {
  rack_crank: "Manivela del soporte",
  optic_lens: "Prisma de diagnóstico",
  optic_cell: "Celda del fotómetro",
});
const Adventure = {
  rewards: {
    shotgun: {
      floor: "hospital",
      id: "q_shotgun",
      flag: "adv:shotgun",
      weapon: "shotgun",
      ammo: 8,
    },
    optics: {
      floor: "hospital1",
      id: "q_uzi",
      flag: "adv:optics",
      weapon: "viper",
      ammo: 30,
    },
  },
  sync(g) {
    for (const [id, q] of Object.entries(this.rewards)) {
      if (q.floor !== g.lvl) continue;
      if (!g.pz[q.flag]) g.items = g.items.filter((i) => i.id !== q.id);
      else if (!g.picked.has(q.id) && !g.items.some((i) => i.id === q.id)) {
        const data = R2_DATA(g.lvl).items.find((i) => i[0] === q.id);
        g.items.push(
          Object.assign(
            {
              id: data[0],
              type: data[1],
              x: (data[2] + 0.5) * 32,
              y: (data[3] + 0.5) * 32,
            },
            data[4],
          ),
        );
      }
    }
  },
  claim(g, it) {
    const q = Object.values(this.rewards).find((q) => q.id === it.id);
    if (!q || !g.pz[q.flag] || g.picked.has(it.id)) return false;
    const already =
      g.inv.items.some((i) => i.id === q.weapon) ||
      g.stash.some((i) => i.id === q.weapon);
    if (!already && !g.giveWeapon(q.weapon, 0, false)) return false;
    const got = g.inv.addAmmo(AMMO[q.weapon], q.ammo);
    if (got < q.ammo)
      g.stash.push({ type: AMMO[q.weapon], count: q.ammo - got });
    g.picked.add(it.id);
    g.items = g.items.filter((i) => i.id !== it.id);
    g.story.weaponFinds = { ...(g.story.weaponFinds || {}), [q.weapon]: true };
    Sound.play("pickup");
    UI.msg(
      WEAPONS[q.weapon].name +
        " recuperada. " +
        (q.weapon === "shotgun" ? "[2] Escopeta" : "[3] UZI") +
        (got < q.ammo ? " · La munición que no cabía está en el baúl." : ""),
      5000,
    );
    Hospital.checkpoint(g);
    return true;
  },
};
(() => {
  for (const i of MANSION.items)
    if (i[1] === "ammo") {
      i[1] = "am_ak";
      i[4] = { amount: 30 };
    }
  const h = FLOORS.hospital,
    up = FLOORS.hospital1;
  const pistol = h.items.find((i) => i[0] === "pp1");
  pistol[2] = 52;
  pistol[3] = 26;
  pistol[4] = { beacon: true };
  h.items.push(
    _D("w_exit_note", 53, 28),
    _D("w_shot_notice", 27, 47),
    _D("w_shot_manual", 9, 66),
    ["q_crank", "adv_part", 13, 68, { part: "rack_crank" }],
    _F("q_shot_rack", "h_adv_rack", 35, 45),
    [
      "q_shotgun",
      "adv_weapon",
      34,
      46,
      { rewardFor: "adv:shotgun", weapon: "shotgun" },
    ],
    _D("w_uzi_optics", 65, 62),
    ["q_prism", "adv_part", 76, 64, { part: "optic_lens" }],
  );
  up.items.push(
    _D("w_uzi_notice", 24, 47),
    _D("w_uzi_manual", 30, 15),
    ["q_cell", "adv_part", 31, 16, { part: "optic_cell" }],
    _F("q_optic_case", "h_adv_optics", 58, 15),
    [
      "q_uzi",
      "adv_weapon",
      59,
      15,
      { rewardFor: "adv:optics", weapon: "viper" },
    ],
  );
  Object.assign(DOCS, {
    w_exit_note: {
      title: "Evacuación del turno de noche",
      text: "Las puertas públicas se han soldado desde fuera. La última salida del personal era el muelle del garaje, por debajo de las plantas clínicas.\n\nNo confíes en las luces de emergencia. Las zonas críticas conservaron repuestos eléctricos, y Dirección retuvo el acceso de servicio.\n\nSi alguien encuentra esto: no sigas los gritos.",
    },
    w_shot_notice: {
      title: "Seguridad · material retirado",
      text: "La escopeta M12 quedó en el soporte de Seguridad. Después del incidente retiramos la manivela para que ningún paciente pudiera liberar las trabas.\n\nMantenimiento la guardó con las herramientas del corredor de rehabilitación. El técnico dejó allí las instrucciones del soporte.\n\nEl cierre de la farmacia es otro asunto. No confundan los registros médicos con el equipo confiscado.",
    },
    w_shot_manual: {
      title: "Mantenimiento · soporte de contrapesos",
      text: "La corredera roja solo puede salir por el lado derecho. Las piezas se deslizan a lo largo de sus guías; nunca deben levantarse ni atravesarse.\n\nSi las trabas no ceden, despeja la balda de arriba y desplaza el contrapeso de abajo. Hay espacio para todo: el problema es el orden.\n\nDejé la manivela en el estuche de herramientas, junto al fondo de Mantenimiento.",
    },
    w_uzi_notice: {
      title: "Requisa de armamento · unidad compacta",
      text: "El UZI del destacamento se trasladó a una caja de pruebas en Aislamiento. Sus cierres responden al banco óptico; la llave de la rampa nunca abrió esa caja.\n\nEl prisma de enfoque volvió a Diagnóstico, en la planta baja. La celda de alimentación quedó en Electroencefalografía, arriba. La hoja de servicio permanece junto al equipo.\n\nNecesitarán ambas piezas para hacer pasar la luz por los tres testigos.",
    },
    w_uzi_optics: {
      title: "Diagnóstico · préstamo de prisma",
      text: "El prisma fue devuelto al banco de imagen. Sin él, el haz del cierre de Aislamiento se dispersa antes de alcanzar los testigos.\n\nLa otra pieza es la celda del fotómetro de Electroencefalografía. No la conecten a los electrodos de los pacientes.",
    },
    w_uzi_manual: {
      title: "Banco óptico · alineación del cierre",
      text: "Los espejos giran un cuarto de vuelta y desvían el haz a noventa grados. Una luz que sale del tablero no ha llegado a su destino.\n\nLos testigos azul, ámbar y verde deben encenderse antes del receptor final. Sigue el haz: cada rebote correcto te permite revisar el siguiente.\n\nEl prisma está en Diagnóstico. La celda de este fotómetro puede retirarse sin herramientas.",
    },
  });
  DOCS.f1.text +=
    "\n\nEl armamento fue retirado por Seguridad. Este armario solo conserva material clínico.";
  DOCS.p6.text +=
    "\n\nEl subfusil requisado se trasladó al banco óptico de Aislamiento. La hoja de traslado está en el laboratorio de Wren.";
})();
for (const id of [
  "w_exit_note",
  "w_shot_notice",
  "w_shot_manual",
  "w_uzi_notice",
  "w_uzi_optics",
  "w_uzi_manual",
])
  CLUES.add(id);
const WeaponGlyphs = {
  paths: {
    pistol:
      '<path fill="#273b45" d="M19 36h129v29H93l-18 49H43l11-49H19z"/><path fill="#abc0c4" d="M17 29h135v23H17z"/><path fill="#536c76" d="M28 33h111v8H28z"/><path fill="#152831" d="M63 68h17l-11 31H54z"/><path fill="none" d="M95 65v18H78"/><path d="M31 24h8v7h-8zM135 24h8v7h-8z"/>',
    ak: '<path fill="#567078" d="M12 48h160v17H61l-18 17H12z"/><path fill="#b28d60" d="M17 57h30v19H8zM115 48h42v18h-42z"/><path fill="#263c46" d="M69 65h20l15 32-12 11-17-17zM55 65h13l-7 28H49z"/><path fill="#263c46" d="M162 51h29v6h-29zM74 37h33v12H74z"/><path fill="none" d="M89 72l9 20M92 47h36M128 43h7v6"/>',
    shotgun:
      '<path fill="#81999c" d="M13 42h174v11H13z"/><path fill="#344b57" d="M47 53h130v10H47z"/><path fill="#ad865b" d="M7 55h41l10 12-26 22H4zM97 55h46v15H97z"/><path fill="none" d="M62 62v17h23l6-16M110 58v10M119 58v10M128 58v10"/>',
    viper:
      '<path fill="#3e5661" d="M39 34h97v37H39zM11 45h28v9H11zM136 43h34v10h-34z"/><path fill="#a1b8bc" d="M45 28h87v10H45z"/><path fill="#273842" d="M66 70h21v50H66zM104 70h13l-8 23H93z"/><path fill="none" d="M26 53v38h30V71M53 44h57M116 21h10v8"/>',
    rifle:
      '<path fill="#849b9e" d="M12 47h177v9H12z"/><path fill="#3b5361" d="M48 54h109v13H48z"/><path fill="#a78b67" d="M3 57h44l14 13-26 20H3zM120 60h31v12h-31z"/><path fill="#253c49" d="M76 67h19v22H76zM67 28h59v13H67z"/><path fill="none" d="M77 40v8M114 40v8M155 69l8 25"/>',
    launcher:
      '<path fill="#657a72" d="M15 35h156v43H15z"/><path fill="#a4b5a0" d="M163 32h19v49h-19z"/><path fill="#263c36" d="M55 77h21v29H55zM18 42h9v28h-9z"/><path fill="none" d="M82 43h65M45 35V21h38v14M95 79l15 22"/>',
    claw: '<path fill="#6e4d83" d="M65 102l-17-41 6-30 11 27 4-43 12 38 7-42 11 43 14-35 2 42-7 35-24 19z"/><path fill="#dbc4e1" d="M50 60L38 17l16 14 7 27M71 52l-5-41 13 14 3 28M90 52l3-45 9 18-3 29M109 58l17-34-3 29-8 11"/>',
    none: '<path fill="none" d="M63 100V50q0-12 9-12t9 12v17-40q0-12 9-12t9 12v37-29q0-12 9-12t9 12v37-16q0-12 9-12t9 12v39q0 25-22 30H82z"/>',
  },
  svg(id) {
    return (
      '<svg viewBox="0 0 200 140" aria-hidden="true" fill="#c3d0c9" stroke="#b7c8c7" stroke-width="1.5" stroke-linejoin="round">' +
      (this.paths[id] || this.paths.none) +
      "</svg>"
    );
  },
};
const WeaponMonitor = {
  active: null,
  snapshot(g) {
    const p = g.player,
      w = p.weapon,
      d = w && WEAPONS[w.id],
      claw = p.predator > 0;
    return {
      id: claw ? "claw" : w?.id || "none",
      name: claw ? "Forma del acechador" : d?.name || "Sin arma",
      loaded: !claw && w ? Math.max(0, w.mag) : 0,
      max: !claw && d ? Weapons.magSize(p, d) : 0,
      reserve: w ? g.inv.reserve(w.id) : 0,
      reloading: !claw && p.reloading > 0,
    };
  },
  init(g) {
    const box = document.createElement("section");
    box.id = "weaponHUD";
    box.setAttribute("aria-label", "Arma equipada y munición");
    box.innerHTML =
      '<div class="weapon-dial"><svg class="ammo-ring" viewBox="0 0 220 220" aria-hidden="true"><circle class="ammo-track" cx="110" cy="110" r="88"/><circle id="ammoArc" cx="110" cy="110" r="88"/></svg><div id="weaponIllustration"></div><div class="weapon-count"><b id="weaponLoaded">—</b><span>/</span><span id="weaponCapacity">—</span></div><span id="weaponReload"></span></div><div class="weapon-caption"><strong id="weaponName"></strong><span id="weaponReserve"></span></div><div id="equipmentHints"></div>';
    UI.$("hud").appendChild(box);
  },
  update(g) {
    const v = this.snapshot(g),
      box = UI.$("weaponHUD");
    if (this.active !== v.id) {
      UI.$("weaponIllustration").innerHTML = WeaponGlyphs.svg(v.id);
      this.active = v.id;
    }
    const maxArc = 2 * Math.PI * 88 * 0.82,
      fill = v.max ? maxArc * Math.min(1, v.loaded / v.max) : 0;
    UI.$("ammoArc").setAttribute(
      "stroke-dasharray",
      fill + " " + (2 * Math.PI * 88 - fill),
    );
    UI.$("ammoArc").dataset.fraction = v.max ? String(v.loaded / v.max) : "0";
    UI.$("weaponLoaded").textContent = v.max ? String(v.loaded) : "—";
    UI.$("weaponCapacity").textContent = v.max ? String(v.max) : "—";
    UI.$("weaponName").textContent = v.name;
    UI.$("weaponReserve").textContent = v.max
      ? v.reserve + " EN RESERVA"
      : v.id === "claw"
        ? "CUCHILLA ORGÁNICA"
        : "BUSCA CÓMO DEFENDERTE";
    UI.$("weaponReload").textContent = v.reloading
      ? "RECARGANDO"
      : v.max && v.loaded === 0
        ? "R · RECARGAR"
        : "";
    box.classList.toggle("reloading", v.reloading);
    box.classList.toggle("empty", !!v.max && !v.loaded);
    const inv = g.inv,
      selected = inv.items[inv.sel],
      inj =
        selected && ITEMS[selected.type].use
          ? ITEMS[selected.type].short
          : "inyección";
    const skills = Object.entries(g.mut.bindings || {})
      .filter(([id]) => g.mut.has(id) && SKILLS[id]?.type === "active")
      .map(([id, key]) => "[" + g.keyName(key) + "] " + SKILLS[id].name);
    UI.$("equipmentHints").textContent =
      "[F] " + inj + (skills.length ? "\n" + skills.join(" · ") : "");
  },
};
const HospitalCompass = {
  cache: null,
  goal(id, title, hint, floor, area, sector) {
    return { id, title, hint, floor, area, sector };
  },
  current(g) {
    if (!isR2lvl(g.lvl)) return null;
    const k = g.inv.keys,
      s = g.story,
      p = g.pz,
      doc = (id) => g.inv.docs.includes(id),
      has = (id) => k.includes(id),
      goal = this.goal;
    if (g.lvl === "mansion") {
      if (s.finale) return null;
      if (!p["h:briefing"])
        return goal(
          "wren_records",
          "Rastros de Wren",
          "Los recuerdos de esta casa pueden contar más que una puerta cerrada.",
          "mansion",
          [11, 24, 12, 10],
          "Sector oeste",
        );
      if (!has("estudio"))
        return goal(
          "wren_access",
          "La vida antes del silencio",
          "Busca entre los lugares donde Wren compartía su vida con otros.",
          "mansion",
          [53, 25, 11, 12],
          "Sector este",
        );
      if (!p.h_clock)
        return goal(
          "wren_clock",
          "Un recuerdo detenido",
          "La nota y los objetos del estudio parecen hablar del mismo momento.",
          "mansion",
          [32, 14, 14, 8],
          "Sector norte",
        );
      return goal(
        "wren_passage",
        "Detrás de la casa",
        "El mecanismo ha cambiado algo detrás del estudio.",
        "mansion",
        [32, 7, 10, 7],
        "Sector norte",
      );
    }
    if (s.seq !== "free") return null;
    if (p["h:boss"])
      return goal(
        "exit",
        "Aire de fuera",
        "Ya no oyes el machete. Busca el aire que entra desde la calle.",
        "hospitalb",
        [79, 42, 8, 7],
        "Extremo del garaje",
      );
    if (p["h:power"])
      return goal(
        "garage",
        "La última salida",
        "El motor se oye bajo las plantas clínicas. La ruta de servicio vuelve a tener luz.",
        "hospitalb",
        [50, 40, 29, 10],
        "Sector de vehículos",
      );
    if (!g.picked.has("pp1") && !g.player.weapon && !s.weaponFinds?.pistol)
      return goal(
        "defend",
        "Recuperar el control",
        "Antes de alejarte de la recepción, busca algo con lo que defenderte.",
        "hospital",
        [52, 27, 11, 6],
        "Vestíbulo",
      );
    if (!has("sotano") && !s.sotanoOpen) {
      if (!has("cocina"))
        return goal(
          "service_west",
          "Otra forma de salir",
          "Las puertas públicas están selladas. Quizá quede un rastro de las rutas del personal.",
          "hospital",
          [22, 24, 20, 18],
          "Sector oeste",
        );
      return goal(
        "service_east",
        "Por donde salía el personal",
        "La llave que encontraste pertenece a una zona de servicio al otro lado del hospital.",
        "hospital",
        [76, 31, 16, 16],
        "Sector este",
      );
    }
    if (!has("fusible_a")) {
      if (!has("urgencias"))
        return goal(
          "records",
          "La parte que siguió funcionando",
          "Los registros antiguos pueden explicar cómo mantuvieron encendidas las zonas críticas.",
          "hospital",
          [13, 18, 15, 12],
          "Sector de archivos",
        );
      if (!has("farmacia"))
        return goal(
          "clinical",
          "Material que sobrevivió al apagón",
          "El personal clínico tuvo que guardar repuestos y accesos cerca de las áreas de urgencia.",
          "hospital",
          [89, 19, 16, 13],
          "Sector clínico este",
        );
      if (!has("morgue"))
        return goal(
          "medical_lock",
          "Los dos extremos",
          "El protocolo del armario habla de pacientes. Revisa lo que has leído antes de forzarlo.",
          "hospital",
          doc("a1") ? [91, 26, 13, 10] : [13, 17, 15, 12],
          doc("a1") ? "Sector clínico este" : "Sector de archivos",
        );
      return goal(
        "cold",
        "Donde todavía había corriente",
        "Una zona fría conservó su alimentación cuando el resto del hospital se apagó.",
        "hospital",
        [91, 36, 13, 10],
        "Sector clínico este",
      );
    }
    if (!has("pase_sup"))
      return goal(
        "upper_access",
        "El turno de planta alta",
        "Los trabajadores de arriba también tenían que pasar por las zonas comunes.",
        "hospital",
        [74, 19, 16, 13],
        "Sector común este",
      );
    if (!has("fusible_b"))
      return goal(
        "upper_power",
        "Lo que quedó entre las camas",
        "Las salas donde no se podía perder corriente pueden conservar otra pieza útil.",
        "hospital1",
        [34, 29, 28, 12],
        "Sector clínico norte",
      );
    if (!has("garaje"))
      return goal(
        "authority",
        "Quien controlaba las salidas",
        "El responsable del hospital no habría dejado sus accesos en manos de cualquiera.",
        "hospital1",
        [76, 29, 22, 15],
        "Sector de administración",
      );
    return goal(
      "restore",
      "Volver a ponerlo en marcha",
      "Ya tienes material para revisar la alimentación de la ruta de servicio.",
      "hospitalb",
      [43, 18, 21, 11],
      "Sector de máquinas",
    );
  },
  hud(g) {
    const q = this.current(g),
      hint = q?.hint || g.objective(),
      title = q?.title || "Sobrevive",
      key = title + "|" + hint;
    if (this.cache === key) return;
    this.cache = key;
    const el = UI.$("obj");
    el.innerHTML =
      '<span class="objective-kicker">RUMBO PRINCIPAL</span><strong>' +
      title +
      "</strong><p>" +
      hint +
      '</p><button id="objectiveMap">[M] Consultar el plano</button>';
    UI.$("objectiveMap").onclick = () => {
      if (g.state === "play") g.toggleMap();
    };
  },
  markup(g, lvl) {
    const q = this.current(g);
    if (!q || q.floor !== lvl) return "";
    const [x, y, rx, ry] = q.area;
    return (
      '<g class="main-search-area" aria-label="Zona aproximada de la pista principal"><ellipse cx="' +
      x * 10 +
      '" cy="' +
      y * 10 +
      '" rx="' +
      rx * 10 +
      '" ry="' +
      ry * 10 +
      '" fill="#e2c48b" fill-opacity=".055" stroke="#d0b477" stroke-width="2" stroke-dasharray="9 7"/><text x="' +
      x * 10 +
      '" y="' +
      (y - ry) * 10 +
      '" text-anchor="middle" fill="#e7cea3" font-size="13">' +
      q.sector.toUpperCase() +
      " · ÁREA APROXIMADA</text></g>"
    );
  },
  map(g, lvl) {
    const q = this.current(g);
    UI.$("mapGuidance").textContent = q
      ? "PISTA PRINCIPAL · " +
        q.title +
        "\n" +
        q.hint +
        "\n" +
        (q.floor === lvl
          ? "El contorno ámbar es aproximado; las salas aún no exploradas permanecen ocultas."
          : "La pista continúa en " +
            {
              mansion: "la mansión",
              hospital: "la planta baja",
              hospital1: "la planta alta",
              hospitalb: "el sótano",
              hospitalchem: "la contención química",
              hospitalworks: "las cloacas y la fábrica",
              hospitalpit: "la cámara del almacén",
            }[q.floor] +
            ".")
      : "Explora y observa. El plano conserva únicamente los espacios que has descubierto.";
  },
};
(() => {
  const init = Game.init;
  Game.init = function () {
    init.call(this);
    WeaponMonitor.init(this);
    UI.$("menu").querySelector(".menu-footer").innerHTML =
      "<span>RIUTEX 2</span><span>FASE 1 / v0.8.0</span><span>WASD + RATÓN</span>";
  };
  const hud = UI.hud;
  UI.hud = function (...args) {
    hud.apply(this, args);
    WeaponMonitor.update(Game);
  };
  const build = Hospital.buildLevel;
  Hospital.buildLevel = function (...args) {
    build.apply(this, args);
    Adventure.sync(args[0]);
  };
  const start = Game.start;
  Game.start = function (...args) {
    HospitalCompass.cache = null;
    WeaponMonitor.active = null;
    start.apply(this, args);
    if (this.lvl === "mansion") {
      if (!this.player.weapons.ak) {
        this.inv.items = this.inv.items.filter(
          (i) => !["w_pistol", "am_pistol"].includes(i.type),
        );
        this.inv.syncWeapons(this.player);
        this.giveWeapon("ak", 90, true);
      }
      if (this.player.weapons.ak) this.player.weapon = this.player.weapons.ak;
    }
  };
  const wake = Hospital.toHospital;
  Hospital.toHospital = function (g) {
    g.stash = [];
    return wake.call(this, g);
  };
  const take = Game.take;
  Game.take = function (it) {
    if (!it) return;
    if (it.type === "adv_weapon") return Adventure.claim(this, it);
    if (it.type === "adv_part") {
      if (!this.inv.keys.includes(it.part)) this.inv.keys.push(it.part);
      this.picked.add(it.id);
      this.items = this.items.filter((i) => i.id !== it.id);
      Sound.play("pickup");
      UI.msg(
        KEYS[it.part] +
          " recuperada. Sus marcas coinciden con un mecanismo del hospital.",
        4500,
      );
      return;
    }
    if (it.type === "am_ak") {
      const got = this.inv.addAmmo("am_ak", it.amount || 30);
      if (!got) return UI.msg("Libera espacio en el maletín.");
      it.amount = (it.amount || 30) - got;
      if (it.amount <= 0) {
        this.picked.add(it.id);
        this.items = this.items.filter((i) => i.id !== it.id);
      }
      Sound.play("pickup");
      return UI.msg("+" + got + " · 7,62 mm");
    }
    const result = take.call(this, it);
    if (it.id === "pp1" && this.picked.has("pp1")) {
      this.story.weaponFinds = {
        ...(this.story.weaponFinds || {}),
        pistol: true,
      };
      UI.msg(
        "Pistola M9. [Ratón] apuntar · [Clic] disparar · [R] recargar.",
        5000,
      );
    }
    return result;
  };
  const use = Hospital.use;
  Hospital.use = function (g, it) {
    if (it.type === "h_adv_rack") return WeaponPuzzles.open(g, "shotgun");
    if (it.type === "h_adv_optics") return WeaponPuzzles.open(g, "optics");
    if (
      it.type === "h_gen" &&
      !g.pz["h:power"] &&
      !["fusible_a", "fusible_b"].every((k) => g.inv.keys.includes(k))
    )
      return UI.msg(
        "Dos alojamientos vacíos. Las zonas clínicas conservaron repuestos eléctricos.",
        5000,
      );
    return use.call(this, g, it);
  };
  const label = Hospital.label;
  Hospital.label = function (it) {
    return it.type === "h_adv_rack"
      ? "Examinar soporte de Seguridad"
      : it.type === "h_adv_optics"
        ? "Examinar caja óptica"
        : label.call(this, it);
  };
  const itemName = itemLabel;
  itemLabel = function (it) {
    if (it.type === "adv_part") return "Recoger: " + KEYS[it.part];
    if (it.type === "adv_weapon")
      return "Recuperar: " + WEAPONS[it.weapon].name;
    if (it.type === "am_ak") return "Recoger munición del AK";
    if (it.type === "smg") return "Recoger munición de UZI";
    return itemName(it);
  };
  const objective = Game.objective;
  Game.objective = function () {
    return HospitalCompass.current(this)?.hint || objective.call(this);
  };
  const map = Blue.renderMap;
  Blue.renderMap = function (g) {
    map.call(this, g);
    HospitalCompass.map(g, this.floor || g.lvl);
  };
  const frame = Game.render;
  Game.render = function () {
    frame.call(this);
    if (this.lvl !== "hospital") return;
    const it = this.items.find((i) => i.id === "pp1");
    if (
      !it ||
      Math.hypot(it.x - this.player.x, it.y - this.player.y) > 220 ||
      !HorrorVision.visible.has(
        Math.floor(it.x / 32) + "," + Math.floor(it.y / 32),
      )
    )
      return;
    const c = this.ctx,
      x = it.x - this.cam.x,
      y = it.y - this.cam.y;
    c.save();
    c.strokeStyle = "rgba(233,222,166,.75)";
    c.lineWidth = 1;
    c.beginPath();
    c.arc(x, y, 22 + Math.sin(this.t * 2) * 2, 0, Math.PI * 2);
    c.stroke();
    c.fillStyle = "#e1d9b5";
    c.font = "600 12px Rajdhani,sans-serif";
    c.textAlign = "center";
    c.fillText("M9 · [E]", x, y - 30);
    c.restore();
  };
  const draw = Game.drawItem;
  Game.drawItem = function (c, it) {
    if (it.id === "pp1" || it.type === "adv_weapon") {
      c.save();
      c.translate(it.x, it.y);
      const glow = 0.35 + Math.sin(this.t * 2) * 0.12;
      c.fillStyle = "rgba(211,224,186," + glow * 0.2 + ")";
      c.beginPath();
      c.ellipse(0, 3, 24, 17, 0, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = "#d2caa3";
      c.lineWidth = 1.2;
      if (it.id !== "pp1") c.strokeRect(-17, -13, 34, 26);
      c.fillStyle = "#b8c7c7";
      c.fillRect(-12, -4, 25, 7);
      c.fillStyle = "#33454a";
      c.fillRect(-2, 2, 7, 10);
      c.fillStyle = "#e4d5a6";
      c.fillRect(-11, -6, 21, 2);
      c.restore();
      if (
        it.id !== "pp1" &&
        HorrorVision.visible.has(
          Math.floor(it.x / 32) + "," + Math.floor(it.y / 32),
        ) &&
        Math.hypot(it.x - this.player.x, it.y - this.player.y) < 240
      ) {
        c.fillStyle = "#ede2bc";
        c.textAlign = "center";
        c.font = "600 12px Rajdhani,sans-serif";
        c.fillText(
          it.id === "pp1"
            ? "M9 · RECOGER [E]"
            : WEAPONS[it.weapon].name + " · [E]",
          it.x,
          it.y - 27,
        );
        c.textAlign = "start";
      }
      return;
    }
    if (it.type === "adv_part") {
      c.save();
      c.translate(it.x, it.y);
      c.fillStyle = "#51666b";
      c.fillRect(-11, -8, 22, 16);
      c.strokeStyle = "#c8bd8d";
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-7, 2);
      c.lineTo(2, -3);
      c.lineTo(7, 4);
      c.stroke();
      c.restore();
      return;
    }
    if (["h_adv_rack", "h_adv_optics"].includes(it.type)) {
      c.save();
      c.translate(it.x, it.y);
      c.fillStyle = "#2a3c43";
      c.fillRect(-16, -13, 32, 26);
      c.strokeStyle = "#b8ac7b";
      c.lineWidth = 1;
      c.strokeRect(-14, -11, 28, 22);
      c.fillStyle = gColor(
        this.pz[it.type === "h_adv_rack" ? "adv:shotgun" : "adv:optics"],
      );
      c.fillRect(-9, -5, 18, 4);
      c.fillStyle = "#9baaad";
      c.fillRect(-2, 3, 5, 6);
      c.restore();
      return;
    }
    draw.call(this, c, it);
  };
  function gColor(done) {
    return done ? "#89c8a8" : "#d4aa68";
  }
})();
