// Extensión de la base v0.2.2: geometría continua, recorridos y recompensas opcionales.
(() => {
  const h = FLOORS.hospital;
  h.W = 116;
  h.walls=[[100,40,1,15]];
  h.H = 74;
  h.rooms.push(
    ["Galería sur", 18, 50, 68, 4],
    ["Patio de invierno", 38, 38, 27, 11],
    ["Seguridad", 23, 43, 14, 6],
    ["Fisioterapia", 3, 51, 14, 10],
    ["Triaje", 66, 44, 14, 5],
    ["Rehabilitación", 23, 55, 20, 11],
    ["Hidroterapia", 44, 55, 16, 8],
    ["Diagnóstico", 61, 55, 20, 11],
    ["Banco de sangre", 86, 51, 12, 14],
    ["Invernadero", 101, 40, 12, 19],
    ["Mantenimiento", 3, 63, 14, 9],
    ["Galería de rehabilitación", 18, 67, 65, 3],
    ["Paso de servicio", 18, 54, 4, 16],
    ["Pasarela acristalada", 99, 35, 2, 20],
  );
  h.cuts.push(
    [18, 48, 4, 2],
    [81, 48, 4, 2],
    [62, 37, 2, 1],
    [8, 62, 3, 1],
    [50, 64, 3, 3],
    [8, 50, 3, 1],
  );
  h.doors.push(
    ["patio_n", 62, 36, 2, 1, null],
    ["patio_s", 49, 49, 3, 1, null],
    ["security", 22, 44, 1, 3, null],
    ["security_s", 28, 49, 3, 1, null],
    ["lav_physio", 8, 49, 3, 1, null],
    ["physio", 17, 52, 1, 3, null],
    ["triage", 80, 45, 1, 3, null],
    ["triage_s", 70, 49, 3, 1, null],
    ["rehab", 30, 54, 3, 1, null],
    ["rehab_s", 30, 66, 3, 1, null],
    ["hydro", 50, 54, 3, 1, null],
    ["hydro_s", 50, 63, 3, 1, null],
    ["diagnostic", 68, 54, 3, 1, null],
    ["diagnostic_s", 68, 66, 3, 1, null],
    ["blood", 85, 52, 1, 3, null],
    ["garden_link", 98, 36, 1, 3, "morgue"],
    ["greenhouse", 100, 46, 1, 3, null],
    ["maintenance", 8, 61, 3, 1, null],
    ["maintenance_e", 17, 67, 1, 3, null],
  );
  h.furn.bed.push(
    [5, 52],
    [10, 52],
    [25, 57],
    [25, 61],
    [36, 57],
    [64, 57],
    [75, 57],
  );
  h.furn.machine.push(
    [45, 56],
    [58, 56],
    [63, 64],
    [78, 64],
    [88, 52],
    [94, 52],
  );
  h.furn.desk.push([25, 44], [26, 44], [31, 44], [5, 65]);
  h.furn.plant = [
    [40, 25],
    [62, 25],
    [40, 32],
    [62, 32],
    [69, 12],
    [78, 20],
    [24, 33],
    [35, 39],
    [25, 46],
    [35, 47],
  ];
  h.furn.tree = [
    [40, 40],
    [61, 40],
    [40, 46],
    [61, 46],
    [103, 42],
    [110, 42],
    [103, 56],
    [110, 56],
  ];
  h.furn.bench.push([45, 41], [46, 41], [55, 46], [56, 46]);
  h.furn.locker.push([87, 62], [95, 62], [4, 70], [14, 70]);
  h.items.find((i) => i[0] === "stairs_dn_b")[4].need = "sotano";
  h.items.push(
    _D("b_security", 28, 46),
    _F("h_security", "h_security", 33, 46),
    _D("b_hydro", 46, 60),
    _F("h_hydro", "h_hydro", 57, 60),
    _D("b_blood", 89, 55),
    _F("h_mix", "h_mix", 95, 57),
    _D("b_garden", 105, 45),
    ["blue_sample_1", "sample", 109, 54],
    _F("savebed_patio", "savebed", 53, 40),
    _F("caja_patio", "caja", 55, 40),
    ["blue_am1", "ammo", 12, 58],
    ["blue_heal1", "inj_green", 39, 63],
    ["blue_am2", "ammo", 76, 63],
    ["blue_shell1", "shells", 66, 63],
    ["blue_powder", "powder_large", 6, 68],
    ["blue_screw", "screw_large", 13, 65],
    ["blue_case", "case", 11, 69],
    _D("b_rehab", 28, 64),
    _D("b_diag", 72, 58),
  );
  h.enemies.push(
    [1101, "sonambulo", 9, 56],
    [1102, "rastrero", 35, 60],
    [1103, "enfermera", 73, 60],
    [1104, "camillero", 90, 59],
    [1105, "hinchado", 106, 52],
    [1106, "sonambulo", 42, 52],
    [1107, "rastrero", 59, 68],
  );
  h.safe.push([38, 38, 65, 49]);
  h.patrol.push([29, 52], [70, 52], [31, 68], [70, 68]);
  const a = FLOORS.hospital1;
  a.rooms.push(
    ["Galería de aislamiento", 8, 19, 84, 4],
    ["Pediatría", 8, 5, 16, 13],
    ["Electroencefalografía", 25, 9, 17, 9],
    ["Aislamiento", 43, 3, 27, 15],
    ["Anfiteatro clínico", 71, 7, 21, 11],
  );
  a.doors.push(
    ["north_uci", 16, 23, 3, 1, null],
    ["north_qui", 38, 23, 3, 1, null],
    ["north_dir", 82, 23, 3, 1, "director"],
    ["pediatric", 16, 18, 3, 1, null],
    ["eeg", 32, 18, 3, 1, null],
    ["isolation", 55, 18, 3, 1, null],
    ["theatre", 82, 18, 3, 1, null],
    ["pedi_eeg", 24, 12, 1, 3, null],
    ["eeg_iso", 42, 12, 1, 3, null],
    ["iso_theatre", 70, 12, 1, 3, null],
  );
  a.furn.bed.push(
    [10, 6],
    [15, 6],
    [20, 6],
    [45, 5],
    [51, 5],
    [64, 5],
    [45, 13],
    [64, 13],
  );
  a.furn.machine.push([27, 10], [39, 10], [46, 10], [67, 10]);
  (a.furn.bench ||= []).push(
    [74, 9],
    [75, 9],
    [84, 9],
    [85, 9],
    [74, 14],
    [84, 14],
  );
  a.items.push(
    _D("b_ped", 12, 15),
    _D("b_eeg", 28, 16),
    _F("h_eeg", "h_eeg", 38, 15),
    _D("b_iso", 58, 7),
    ["blue_sample_2", "sample", 66, 15],
    ["blue_am3", "ammo", 22, 15],
    ["blue_yellow", "inj_yellow", 88, 15],
    ["blue_rifle", "rifleammo", 78, 15],
  );
  a.enemies.push(
    [1120, "enfermera", 18, 12],
    [1121, "sonambulo", 34, 14],
    [1122, "cirujano", 56, 12],
    [1123, "latente", 60, 7],
    [1124, "camillero", 79, 12],
    [1125, "rastrero", 35, 21],
  );
  a.patrol.push([17, 21], [56, 21], [82, 21]);
  const b = FLOORS.hospitalb;
  b.walls=[[72,12,1,23]];
  b.doors.push(['bulkhead_store',72,17,1,2,'garaje'],['bulkhead_cryo',72,28,1,2,'garaje']);
  b.rooms.push(
    ["Bombas de agua", 16, 24, 16, 10],
    ["Turbinas", 36, 24, 16, 10],
    ["Depósito criogénico", 56, 24, 16, 10],
  );
  b.cuts.push(
    [22, 23, 3, 1],
    [42, 23, 3, 1],
    [62, 23, 3, 1],
    [32, 27, 4, 3],
    [52, 27, 4, 3],
    [26, 35, 3, 1],
  );
  b.doors.push(
    ["pump", 22, 22, 3, 1, null],
    ["turbine", 42, 22, 3, 1, null],
    ["cryo", 62, 22, 3, 1, null],
    ["garage_shortcut", 26, 34, 3, 1, "h:power"],
  );
  b.furn.gen.push([18, 25], [28, 25], [38, 25], [48, 25], [58, 25], [68, 25]);
  b.items.push(
    _D("b_pump", 19, 31),
    _D("b_cryo", 58, 31),
    ["blue_sample_3", "sample", 69, 31],
    ["blue_shell2", "shells", 39, 31],
    ["blue_am4", "ammo", 47, 31],
    ["blue_heal2", "inj_green", 29, 31],
  );
  b.enemies.push(
    [1140, "camillero", 24, 29],
    [1141, "enfermera", 43, 29],
    [1142, "cirujano", 64, 29],
  );
  Object.assign(DOCS, {
    b_security: {
      title: "Seguridad · rutas de evacuación",
      text: "Las alas oeste y este conectan por la galería sur. El patio de invierno permanece protegido por luz ultravioleta.\n\nTerminal: conecta la batería con el cierre del Archivo. Cada pieza gira un cuarto de vuelta. Las líneas iluminadas conducen corriente.\n\nEs un atajo; las llaves siguen funcionando.",
    },
    b_hydro: {
      title: "Circuito hidráulico",
      text: "Presión objetivo: 6 bar. Válvulas A, B y C: cada apertura añade 1, 2 y 3 bar respectivamente. Evita superar el límite.\n\nEstabilizar el circuito revela un alijo del personal.",
    },
    b_blood: {
      title: "Preparación de suero azul",
      text: "Fórmula de estabilización: 2 partes de inhibidor (A), 1 de plasma (B), 3 de catalizador (C).\n\nEl orden no importa; la proporción sí. El material de prueba puede reiniciarse sin gasto.",
    },
    b_garden: {
      title: "El jardín que todavía respira",
      text: "La luz mantiene las esporas a raya. Bajo los cristales hay algo parecido a primavera.\n\nWren venía aquí después de cada ensayo. Decía que los cuerpos no podían ser solo números.",
    },
    b_rehab: {
      title: "Pasos en la galería",
      text: "Podemos llegar a Diagnóstico por la galería inferior sin pasar por el vestíbulo. Cierra las puertas a tu espalda. Si oyes el machete, cambia de ruta.",
    },
    b_diag: {
      title: "Registro de imagen · Axel V.",
      text: "Las imágenes muestran un brazo reconstruido sin tejido cicatricial. La actividad neural aumenta al descubrir espacios nuevos.\n\nLa adaptación también responde a la observación, no solo a la violencia.",
    },
    b_ped: {
      title: "Carta sin enviar",
      text: "Hoy hemos pintado un cielo azul en la pared. Los niños preguntan si las puertas volverán a abrirse. No he sabido responderles.",
    },
    b_eeg: {
      title: "Calibración del electroencefalógrafo",
      text: "Canal A: 2 Hz. Canal B: 4 Hz. Canal C: 3 Hz. Ajusta las tres frecuencias y sincroniza.\n\nUna señal estable abre el dispensador de muestras de la sala.",
    },
    b_iso: {
      title: "El coste del programa",
      text: "Wren solicitó cancelar los ensayos. Voss autorizó otro lote. Ninguno de los dos quiso firmar las notificaciones a las familias.\n\nEl silencio también tiene responsables.",
    },
    b_pump: {
      title: "Paso de mantenimiento",
      text: "El corredor de bombas desemboca al oeste del garaje. La compuerta depende del generador principal. Una segunda entrada permite preparar una ruta distinta.",
    },
    b_cryo: {
      title: "Lote criogénico X-02",
      text: "Tres muestras distribuidas fuera de las rutas clínicas. Recuperarlas permite desarrollar el compuesto sin someterse a nuevos ensayos.\n\nNo hay más instalaciones accesibles desde este hospital.",
    },
  });
  // El prólogo conduce a la misma escena por una secuencia clara de lugares jugables.
  MANSION.doors.find((d) => d[0] === "com")[5] = "h:briefing";
  MANSION.enemies = MANSION.enemies.filter((e) => ![701, 702].includes(e[0]));
})();
